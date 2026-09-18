/* =========================================================
   Screen · Incident deep dive (6 tabs), route: incident/<id>/<tab>
   Funnel: what happened -> evidence -> what it caused -> why -> response -> what it relates to
   ========================================================= */
(() => {
  const { UI, C, data: D, I } = VQ;
  const toMin = t => { const m = /(\d+):(\d+)\s*(AM|PM)/.exec(t); if (!m) return null; let h = +m[1] % 12; if (m[3] === 'PM') h += 12; return h * 60 + +m[2]; };
  const toT = m => { const h = Math.floor(m / 60) % 24, mm = String(Math.round(m % 60)).padStart(2, '0'); return `${String(h % 12 || 12).padStart(2, '0')}:${mm} ${h < 12 ? 'AM' : 'PM'}`; };
  const NOW = toMin(D.now);
  const order = () => [...D.incidents].sort((a, b) => a.mins - b.mins);
  const seed = i => +i.id.replace(/\D/g, '');
  const more = (i, tab, label) => `<a data-go="incident/${i.id}/${tab}">${label || 'Open'} ${I('chev')}</a>`;
  const upstreamOf = i => i.dir === 'NB' ? 1 : -1; /* queue builds against the direction of travel */

  /* speed and queue series for the impact charts */
  function model(i) {
    const at = toMin(i.at), span = NOW - at, step = span > 150 ? 15 : span > 70 ? 10 : 5;
    const start = Math.floor((at - 30) / step) * step, end = NOW + 60, n = Math.round((end - start) / step) + 1, r = VQ.rng(seed(i));
    const peak = toMin(i.impact.peakAt) ?? NOW + 30, back = toMin(i.impact.flowBack) ?? end + 60;
    const labels = [], cur = [], pred = [], q = [], qp = []; let nowI = 0, atI = 0;
    for (let k = 0; k < n; k++) { const t = start + k * step; labels.push(toT(t).replace(/ (AM|PM)/, '')); if (t <= NOW) nowI = k; if (t <= at) atI = k;
      const noise = (r() - .5) * 5; let v;
      if (t < at) v = i.impact.normal + noise; else { const tau = i.impact.series === 'crash' ? 4 : 9; v = i.impact.now + (i.impact.normal - i.impact.now) * Math.exp(-(t - at) / tau) + noise * .5; }
      const rec = t > peak ? Math.min(1, (t - peak) / Math.max(20, back - peak)) : 0; const pv = i.impact.now + (i.impact.normal - i.impact.now) * rec * rec;
      cur.push(t <= NOW ? Math.max(0, Math.round(v)) : null); pred.push(t >= NOW ? Math.round(t === NOW ? cur[k] : pv) : null);
      const grow = t < at ? 0 : Math.min(1, (t - at) / Math.max(1, NOW - at)); const qv = i.impact.queue * Math.pow(grow, .8);
      const qf = t <= peak ? i.impact.queue + (i.impact.peakQueue - i.impact.queue) * ((t - NOW) / Math.max(1, peak - NOW)) : i.impact.peakQueue * Math.max(0, 1 - (t - peak) / Math.max(20, back - peak));
      q.push(t <= NOW ? Math.round(qv * 10) / 10 : null); qp.push(t >= NOW ? Math.round((t === NOW ? i.impact.queue : qf) * 10) / 10 : null); }
    return { labels, cur, pred, q, qp, nowI, atI };
  }

  const frames = (i, n) => { const at = toMin(i.at), end = i.closedAt ? toMin(i.closedAt) : NOW, gap = Math.max(1, Math.floor((end - at) / (n - 1))); return Array.from({ length: n }, (_, k) => ({ t: toT(k === n - 1 ? end : at + k * gap) + (k === n - 1 ? (i.closedAt ? ' · last frame' : ' · latest') : k === 0 ? ' · first detection' : ''), k })); };
  const vis = i => i.baked ? [] : i.boxes; /* baked: the photo already carries its detection boxes */
  const mainCam = (i, o) => UI.cam({ img: i.img, cls: o && o.cls, boxes: vis(i), path: i.path, label: `Camera ${i.camId}`, liveText: i.closedAt ? 'RECORDED' : 'LIVE', status: i.closedAt ? 'off' : '', foot: `${D.corridor} &nbsp;|&nbsp; ${D.kmLabel(i.km)} &nbsp;|&nbsp; ${i.dir}`, time: i.closedAt ? i.at : D.nowSec, topRight: i.weather.split('·')[0].trim() });
  const locMap = (i, h, pins) => VQ.Map.render({ h: h || 250, range: [Math.max(0, i.km - 16), Math.min(D.km, i.km + 16)], focus: i.km, kmTicks: 5, legend: 'speed', pins: [...(pins || []), D.incPin(i, { sel: i.id, callout: i.id })] });

  const similar = i => { const r = VQ.rng(seed(i) * 3), t = D.types[i.type], hs = D.hotspots.find(h => h.id === i.hotspot); const causes = i.root.factors.map(f => f[0]);
    return Array.from({ length: 6 }, (_, k) => { const day = 12 - k * 2 - Math.floor(r() * 2), mon = day > 0 ? 'Sep' : 'Aug', d = day > 0 ? day : 31 + day; const km = hs && k < 4 ? hs.from + r() * (hs.to - hs.from) : i.km + (r() - .5) * 180;
      return { date: `${String(d).padStart(2, '0')} ${mon} 2026`, time: toT(toMin(i.at) + Math.round((r() - .5) * 120)), km: D.kmLabel(Math.round(VQ.clamp(km, 2, 568) * 10) / 10), kind: t.label, cause: causes[k % causes.length], clear: Math.round(18 + r() * 60) + ' mins', same: hs && k < 4 }; }); };

  VQ.screen('incident', {
    rail: 'incidents', fallback: 'incidents/feed', param: id => D.incident(id),
    title: ctx => `${ctx.item.id} · ${ctx.item.title}`,
    crumbs: ctx => [['Home', 'home'], ['Incidents', 'incidents/overview'], ['Live Feed', 'incidents/feed'], [`${ctx.item.id} · ${ctx.item.title}`]],
    tabs: [['overview', 'Overview'], ['evidence', 'Evidence &amp; Timeline'], ['impact', 'Traffic Impact'], ['rootcause', 'Root Cause'], ['response', 'Response'], ['related', 'Related Incidents']],
    head: ({ item: i, vid }) => { const list = order(), k = list.findIndex(x => x.id === i.id), prev = list[k - 1], next = list[k + 1]; const closed = /Intercepted|Easing/.test(i.status);
      return `<div class="row between wrap mb"><a data-go="incidents/feed" class="row ink b" style="gap:4px">${I('chevl')}Back to Incidents</a>
        <div class="row t2" style="gap:14px">${prev ? `<a data-go="incident/${prev.id}/${vid}" class="row" style="gap:2px">${I('chevl')}Previous Incident</a>` : '<span class="muted">Previous Incident</span>'}<span>|</span><b class="ink">${k + 1} of ${list.length}</b><span>|</span>${next ? `<a data-go="incident/${next.id}/${vid}" class="row" style="gap:2px">Next Incident${I('chev')}</a>` : '<span class="muted">Next Incident</span>'}</div>
        <div class="row">${UI.btn('Share', { ghost: 1, icon: 'share', toast: 'Incident link copied' })}${UI.btn('Add Note', { ghost: 1, icon: 'note', toast: 'Note added to the incident log' })}${UI.btn('Mark as Resolved', { primary: 1, icon: 'checkc', toast: `${i.id} marked as resolved`, done: 'Resolved' })}</div></div>
      <div class="inc-head"><span class="big-ic ${i.sev}">${I(D.types[i.type].icon)}</span>
        <div><h1>${i.title} ${UI.pill(closed ? 'MONITORING' : 'ACTIVE', closed ? 'solid-gray' : 'solid-crit')}</h1><div class="meta"><span>${D.corridor}</span><i></i><span>${D.kmLabel(i.km)}</span><i></i><span>${i.lane}</span><i></i><span>${i.near}</span><i></i><span>Detected at ${i.at} (${i.mins} minutes ago)</span></div></div>
        <div class="banner ${i.sev}" style="margin-left:auto">${I('alert')}<div><div class="k">Severity</div><div class="v">${i.sev[0].toUpperCase() + i.sev.slice(1)}</div></div><div class="d">${i.banner[0]}<br>${i.banner[1]}</div></div></div>`; },
    values: ['Fewer incidents. More lives saved.', 'Less congestion. Higher productivity.', 'Fairer systems. Greater value.', 'Lower emissions. A cleaner tomorrow.'],
    views: {
      /* ---------- 1. Overview ---------- */
      overview: { render: ({ item: i }) => { const fr = frames(i, 3), hs = D.hotspots.find(h => h.id === i.hotspot);
        return `<div class="grid g-3-2-2">
          <div class="col">${mainCam(i)}<div class="frames" style="grid-template-columns:repeat(3,minmax(0,1fr))">${fr.map((f, k) => UI.cam({ img: i.img, live: false, boxes: vis(i).map(b => ({ ...b, label: '' })), time: f.t.split(' ·')[0], go: `incident/${i.id}/evidence`, on: k === 0 })).join('')}</div></div>
          <div class="card flush">${locMap(i, 300)}</div>
          ${UI.card('Incident Details', UI.kv([['alert', 'Incident Type', i.title], ['mappin', 'Location', `${D.corridor}, ${D.kmLabel(i.km)} (${i.dir})<br>${i.near}`], ['clock', 'Detected At', `${i.at}, ${D.date}<br>(${i.mins} minutes ago)`], ['road', 'Lanes Affected', i.lane], ['pulse', 'Current Status', i.status], ['sun', 'Weather', i.weather], ['video', 'Camera', i.camId]]))}
        </div>
        <div class="grid g3">
          ${UI.card(i.intelTitle, UI.facts(i.intel), { icon: 'sparkles', right: more(i, 'evidence', 'Evidence') })}
          ${UI.card('AI Analysis', UI.kv([['eye', 'Detection', i.ai.detection], ['truck', 'Classification', i.ai.classification], ['road', 'Lane Impact', i.ai.laneImpact], ['bars', 'Traffic Impact', i.ai.trafficImpact], ['clock', 'Predictive Insight', i.ai.predictive], ['shieldcheck', 'Confidence', `<b class="ink">${i.ai.confidence}%</b>`]]), { right: more(i, 'rootcause', 'Root cause') })}
          ${UI.card('Recommended Actions', UI.actions(i.actions.map(a => a.btn === 'Open' ? { ...a, go: i.go } : a)))}
        </div>
        <div class="grid ${i.vehicles ? 'g3' : 'g2'}">
          ${i.vehicles ? UI.card('Vehicles Involved', UI.list(i.vehicles.map((v, k) => ({ thumb: i.img, title: v.name, sub: v.kind, sub2: v.lane, pill: UI.pill(v.damage, v.tone) }))), { right: `<b style="color:var(--blue)">${i.vehicles.length}</b> Vehicles` }) : ''}
          ${UI.card('Traffic Impact', `${UI.statRow([[`${i.impact.now} km/h`, `Current speed (${Math.round((i.impact.now / i.impact.normal - 1) * 100)}% vs normal)`, i.impact.now < 40 ? 'crit' : ''], [i.impact.queue ? `${i.impact.queue} km` : 'None', `Queue length (${i.impact.trend})`, i.impact.queue > 2 ? 'crit' : ''], [i.impact.delay, 'Estimated delay']])}<hr class="sep"><div class="b ink small">Congestion Propagation (Predicted)</div>${UI.propagation([{ at: 6, label: D.kmLabel(Math.round((i.km + upstreamOf(i) * Math.max(5, i.impact.peakQueue)) * 10) / 10).replace('Km ', ''), sub: `${UI.pill('Slow', 'serious')}` }, { at: 50, main: 1, label: String(i.km), sub: D.types[i.type].label }, { at: 94, label: D.kmLabel(Math.round((i.km - upstreamOf(i) * 5) * 10) / 10).replace('Km ', ''), sub: UI.pill(i.impact.now < 40 ? 'Heavy' : 'Moderate', i.impact.now < 40 ? 'crit' : 'warn') }])}`, { right: more(i, 'impact', 'Full impact') })}
          ${UI.card('Nearest Responders', UI.list(i.responders.map(r => ({ icon: r.icon, tone: 'info', title: r.name, sub: r.state, meta: r.eta ? `<b class="ink">${r.eta} mins</b>` : '<b class="ink">On site</b>', pill: r.dist ? `<span class="small muted">(${r.dist} km)</span>` : '' }))) + `<div class="row mt">${UI.btn('View on Map', { sm: 1, icon: 'mappin', go: `incident/${i.id}/response` })}${UI.btn('Contact All', { sm: 1, icon: 'phone', toast: 'Conference call started with all responders' })}</div>`, { right: `<span class="b ink">ETA</span>` })}
        </div>
        ${hs ? UI.insight('crosshair', 'crit', `This location is a known hotspot: ${hs.name} (${hs.count90} incidents in 90 days)`, `${hs.pattern}. Open the root cause to see what would stop it.`, `incident/${i.id}/rootcause`) : ''}
        ${UI.card('Incident Timeline', UI.timeline(i.timeline.map(t => ({ t: t[0], label: t[1], state: t[2] }))), { cls: 'mt mb', right: more(i, 'evidence', 'Full log') })}`; } },

      /* ---------- 2. Evidence & timeline ---------- */
      evidence: { render: ({ item: i }) => { const fr = frames(i, 6), sel = +(VQ.state.frame ?? 5), r = VQ.rng(seed(i));
        const jit = b => ({ ...b, x: b.x + (sel - 5) * .6, y: b.y + (sel - 5) * .3 });
        const near = D.cameras.filter(c => Math.abs(c.km - i.km) < 60 && Math.abs(c.km - i.km) > .5).sort((a, b) => Math.abs(a.km - i.km) - Math.abs(b.km - i.km)).slice(0, 3);
        const log = [{ t: i.timeline[0][0], text: `<b>${i.ai.detection}</b>`, who: `VizionIQ vision model · ${i.camId} · confidence ${i.ai.confidence}%`, tone: 'ai' }, { t: toT(toMin(i.at) + 1), text: `Classified as: ${i.ai.classification}`, who: 'Incident classification model', tone: 'ai' },
          ...i.timeline.slice(1).filter(t => t[2] !== 'todo').map(t => ({ t: t[0], text: t[1], who: /Alert|VMS/.test(t[1]) ? 'Automatic' : /Dispatch|Request|Assign/.test(t[1]) ? 'Control room · Operator KK' : 'Field update', tone: t[2] === 'now' ? 'good' : '' })),
          { t: D.now, text: `Latest assessment: ${i.ai.trafficImpact}`, who: 'Traffic impact model', tone: 'ai' }].sort((a, b) => (toMin(a.t) ?? 0) - (toMin(b.t) ?? 0));
        return `<div class="grid g-5-3"><div class="col">
            ${UI.card(`Frame ${sel + 1} of 6 · ${fr[sel].t}`, UI.cam({ img: i.img, boxes: vis(i).map(jit), path: i.path, live: sel === 5 && !i.closedAt, label: `Camera ${i.camId}`, foot: `${D.corridor} | ${D.kmLabel(i.km)} | ${i.dir}`, time: fr[sel].t.split(' ·')[0] }) + `<div class="frames mt" style="grid-template-columns:repeat(6,minmax(0,1fr))">${fr.map((f, k) => UI.cam({ img: i.img, live: false, time: f.t.split(' ·')[0], set: `frame=${k}`, on: k === sel })).join('')}</div>`, { right: `${UI.btn('Save Clip', { sm: 1, icon: 'clip', toast: 'Clip saved to the incident record' })}${UI.btn('Export Evidence Pack', { sm: 1, icon: 'download', toast: 'Evidence pack exported (frames, detections, log)' })}` })}
            ${UI.card('What the model saw', UI.table([{ k: 'o', label: 'Detection' }, { k: 'c', label: 'Class' }, { k: 'p', label: 'Confidence', r: 1 }, { k: 'f', label: 'First seen' }, { k: 'n', label: 'Note' }], [...i.boxes.map((b, k) => ({ o: `Object ${k + 1}`, c: b.label.split('·')[0].trim() || D.types[i.type].label, p: `${Math.round(i.ai.confidence - k * 2 - r() * 2)}%`, f: toT(toMin(i.at) + k), n: b.tone === 'crit' ? 'Primary subject of the incident' : b.tone === 'warn' ? 'Flagged for attention' : 'Context vehicle' })), { o: 'Scene', c: i.ai.classification, p: `${i.ai.confidence}%`, f: i.at, n: i.ai.laneImpact }]))}
          </div><div class="col">
            ${UI.card('Detection and action log', UI.vtimeline(log), { icon: 'clock' })}
            ${UI.card('Nearby cameras', UI.list(near.map(c => ({ thumb: c.img, title: `${c.id} · ${D.kmLabel(c.km)}`, sub: `${Math.abs(c.km - i.km).toFixed(1)} km ${(c.km < i.km) === (upstreamOf(i) < 0) ? 'upstream' : 'downstream'} · ${c.label || D.nearest(c.km)}`, pill: UI.pill(c.status === 'off' ? 'Offline' : c.status === 'warn' ? 'Degraded' : 'Live', c.status === 'off' ? 'crit' : c.status === 'warn' ? 'warn' : 'good'), go: c.inc && c.inc !== i.id ? `incident/${c.inc}` : 'live/grid' }))), { right: UI.viewAll('live/map') })}
          </div></div>
          ${UI.card('Incident Timeline', UI.timeline(i.timeline.map(t => ({ t: t[0], label: t[1], state: t[2] }))), { cls: 'mb' })}`; } },

      /* ---------- 3. Traffic impact ---------- */
      impact: { render: ({ item: i }) => { const m = model(i), up = upstreamOf(i), tail = Math.round((i.km + up * i.impact.queue) * 10) / 10; const hasQ = i.impact.peakQueue > 0; const veh = Math.round(i.impact.queue * 1000 / 7.5 * (i.impact.now < 40 ? 2.2 : 1.2) / 10) * 10;
        const sec = D.sections.find(s => i.km >= s.from && i.km <= s.to) || D.sections[0];
        return UI.kpis([{ icon: 'gauge', bg: i.impact.now < 40 ? 'bg-crit' : 'bg-warn', value: i.impact.now, unit: 'km/h', label: 'Current Speed', delta: { dir: 'down', value: `${Math.round((i.impact.now / i.impact.normal - 1) * 100)}%`, text: `vs. normal (${i.impact.normal})`, good: false } },
          { icon: 'cone', bg: 'bg-serious', value: i.impact.queue || '0', unit: 'km', label: 'Queue Length', delta: { text: i.impact.trend } }, { icon: 'clock', bg: 'bg-info', value: i.impact.delay, label: 'Estimated Delay', delta: { text: `Clearance: ${i.impact.clear}` } },
          { icon: 'car', bg: 'bg-navy', value: hasQ && veh ? '~' + VQ.fmt(veh) : '—', label: 'Vehicles in Queue', delta: { text: `Normal flow by ${i.impact.flowBack}` } }], 'g4')
        + `<div class="grid g2">
          ${UI.card('Traffic Impact (Current &amp; Predicted)', C.line({ h: 220, labels: m.labels, unit: 'km/h', yTitle: 'Speed (km/h)', yMax: 120, mark: { i: m.atI, label: `Incident ${i.at}` }, band: { from: m.nowI, label: hasQ ? `Predicted from ${D.now}` : '' }, series: [{ name: 'Current Speed', data: m.cur, color: 'var(--s1)' }, { name: 'Predicted Speed', data: m.pred, color: 'var(--crit)', dash: 1 }] }) + `<div class="card-note">${i.ai.predictive}</div>`)}
          ${hasQ ? UI.card('Queue Length (Current &amp; Predicted)', C.line({ h: 220, labels: m.labels, unit: 'km', yTitle: 'Queue length (km)', mark: { i: m.nowI, label: `Now ${D.now}`, color: 'var(--s1)' }, series: [{ name: 'Measured queue', data: m.q, color: 'var(--s1)', area: 1 }, { name: 'Predicted queue', data: m.qp, color: 'var(--crit)', dash: 1, area: 1 }] }) + `<div class="card-note">Predicted peak: <b class="ink">~${i.impact.peakQueue} km at ${i.impact.peakAt}</b>. Queue tail is now at ${D.kmLabel(tail)}.</div>`)
            : UI.card('Queue', `<div class="insight">${`<span style="color:var(--good)">${I('checkc')}</span>`}<div><b>No queue has formed</b><p>Traffic is passing the location. The risk here is to safety, not journey time.</p></div></div>`)}
        </div>
        <div class="grid g-2-1">
          <div class="card flush">${VQ.Map.render({ h: 290, range: [Math.max(0, i.km - 22), Math.min(D.km, i.km + 22)], focus: i.km, kmTicks: 5, legend: 'speed', highlight: hasQ ? [Math.min(i.km, tail), Math.max(i.km, tail)] : null, pins: [D.incPin(i, { sel: i.id }), ...(hasQ && i.impact.queue >= .5 ? [{ type: 'asset', km: tail, icon: 'alert', tone: 'serious', tip: `<b>Queue tail</b> · ${D.kmLabel(tail)}<br>Approach speed ${i.impact.normal} km/h`, callout: { title: 'Queue tail', lines: [D.kmLabel(tail), 'Secondary collision risk'], tone: 'warn', below: 1 }, below: 1 }] : []), ...D.cameras.filter(c => Math.abs(c.km - i.km) < 22 && !c.inc).map(D.camPin)] })}</div>
          <div class="col">
            ${UI.card('Queue-tail and secondary risk', UI.kv([['mappin', 'Queue tail now', hasQ && i.impact.queue ? `${D.kmLabel(tail)}, moving ${up < 0 ? 'back towards Hyderabad' : 'back towards Bengaluru'}` : 'No queue'], ['gauge', 'Approach speed', `${i.impact.normal} km/h`], ['eye', 'Sight distance', /fog|rain/i.test(i.weather) ? 'Reduced' : 'Good'], ['alert', 'Secondary collision risk', i.impact.queue > 2 ? UI.pill('High', 'crit') : i.impact.queue > .5 ? UI.pill('Medium', 'warn') : UI.pill('Low', 'good')], ['mega', 'Upstream warning', hasQ ? `VMS at ${D.kmLabel(Math.max(0, Math.round(tail + up * 6)))}` : 'Not needed']]), { icon: 'shield' })}
            ${UI.card('Effect on journey time', UI.kv([['road', 'Section', sec.name], ['clock', 'Now', `${D.hm(sec.current)} <span class="up-bad">(+${sec.current - sec.normal} m)</span>`], ['checkc', 'Normal', D.hm(sec.normal)], ['route', 'Whole corridor', `${D.hm(D.home.travelNow)} <span class="up-bad">(+${D.home.travelNow - D.home.travelNormal} m)</span>`]]), { right: `<a data-go="traffic/travel">Travel time ${I('chev')}</a>` })}
          </div></div>`; } },

      /* ---------- 4. Root cause ---------- */
      rootcause: { render: ({ item: i }) => { const hs = D.hotspots.find(h => h.id === i.hotspot), r = VQ.rng(seed(i) * 7); const total = hs ? hs.count90 : 2 + Math.floor(r() * 2);
        const weeks = Array.from({ length: 13 }, (_, k) => `W${k + 1}`); const hist = weeks.map(() => 0); for (let k = 0; k < total; k++) hist[Math.min(12, Math.floor(r() * r() * 13 + (k % 3 === 0 ? 9 : 3)))]++;
        return `${UI.insight('sparkles', 'violet', 'What most likely happened', i.root.summary)}
        ${UI.card('Causal chain', UI.chain(i.root.chain.map(c => ({ k: c[0], title: c[1], text: c[2], cls: c[3] }))) + '<div class="card-note mt">Built from the frames before the incident, vehicle tracks from upstream cameras, and the record of this location.</div>', { icon: 'net', cls: 'mt mb' })}
        <div class="grid g2">
          ${UI.card('Contributing factors', UI.factors(i.root.factors.map(f => ({ title: f[0], text: f[1], pct: f[2] }))) + '<div class="card-note mt">Percentages are the model’s estimate of how much each factor contributed. They overlap, so they do not add to 100.</div>', { right: `<span>Model confidence <b class="ink">${i.ai.confidence}%</b></span>` })}
          ${UI.card('Conditions at the time', UI.facts(i.root.conditions))}
        </div>
        <div class="grid g2">
          ${UI.card(`Incidents within 2 km of ${D.kmLabel(i.km)}, last 13 weeks`, C.bars({ h: 170, labels: weeks, series: [{ name: 'Incidents', data: hist }], unit: 'incidents', yMax: Math.max(4, Math.max(...hist) + 1) }) + `<div class="card-note">${hs ? `<b class="ink">${hs.count90} incidents in 90 days.</b> This is hotspot ${hs.id}, ${hs.name}. ${hs.pattern}.` : `<b class="ink">${total} incidents in 90 days.</b> This location is not a hotspot; the cause is specific to this event.`}</div>`, { right: hs ? `<a data-go="incidents/hotspots">All hotspots ${I('chev')}</a>` : '' })}
          ${UI.card('What would stop it happening again', UI.steps(i.root.prevent) + `<div class="row mt">${UI.btn('Raise Improvement Ticket', { primary: 1, sm: 1, icon: 'wrench', toast: 'Improvement ticket raised and linked to ' + i.id, done: 'Raised' })}${UI.btn('Add to Safety Audit', { sm: 1, icon: 'file', toast: 'Added to the next safety audit pack' })}</div>`, { icon: 'shieldcheck' })}
        </div>`; } },

      /* ---------- 5. Response ---------- */
      response: { render: ({ item: i }) => { const at = toMin(i.at); const tl = i.timeline.map(t => ({ t: toMin(t[0]), label: t[1], state: t[2] }));
        const alertT = (tl.find(t => /Alert/.test(t.label)) || tl[1] || {}).t, dispT = (tl.find(t => /Dispatch|Request|Assign|Deployed/.test(t.label)) || {}).t, onT = (tl.find(t => /On Site|Intercept|Patrol Pass/.test(t.label) && t.t) || {}).t;
        const etaMin = Math.min(...i.responders.map(r => r.eta)); const rows = [['Detection to alert', alertT != null ? alertT - at : null, 1, 'min'], ['Alert to dispatch', dispT != null && alertT != null ? dispT - alertT : null, 3, 'mins'], ['Dispatch to on site', onT != null && dispT != null && onT >= dispT ? onT - dispT : dispT != null ? (NOW - dispT) + etaMin : null, 10, 'mins', onT == null || onT < dispT]];
        const up = upstreamOf(i), span = Math.max(8, Math.max(...i.responders.map(r => r.dist)) * 1.9);
        return `<div class="grid g-2-1"><div class="col">
          <div class="card flush">${VQ.Map.render({ h: 300, range: [Math.max(0, i.km - span), Math.min(D.km, i.km + span)], focus: i.km, kmTicks: span > 14 ? 5 : 2, pins: [D.incPin(i, { sel: i.id }), ...i.responders.filter(r => r.dist).map((r, k) => ({ type: 'asset', km: VQ.clamp(i.km + (k % 2 ? -up : up) * r.dist, 0, D.km), icon: r.icon, tone: 'info', below: k % 2, tip: `<b>${r.name}</b><br>${r.state} · ${r.eta} mins (${r.dist} km)`, callout: k < 2 ? { title: r.name, lines: [`ETA ${r.eta} mins · ${r.dist} km`], below: k % 2 } : null }))], legend: `<b>Responders</b><span><i class="rd" style="background:${VQ.Map.TONE.info}"></i>Unit position</span><span><i class="rd" style="background:${VQ.Map.TONE.crit}"></i>Incident</span>` })}</div>
          ${UI.card('Response against target', UI.table([{ k: 's', label: 'Step' }, { k: 'a', label: 'This incident' }, { k: 't', label: 'Target' }, { k: 'm', label: '', fmt: (_, r) => r.v == null ? '' : `<div style="min-width:120px">${C.meter(Math.min(100, r.v / r.tv * 60), r.v > r.tv ? 'crit' : 'good')}</div>` }, { k: 'p', label: 'Result' }], rows.map(r => ({ s: r[0], v: r[1], tv: r[2], a: r[1] == null ? '—' : `${r[1]} ${r[1] === 1 ? 'min' : 'mins'}${r[4] ? ' (expected)' : ''}`, t: `${r[2]} ${r[3]}`, p: r[1] == null ? UI.pill('Pending', 'gray') : r[1] > r[2] ? UI.pill('Over target', 'crit') : UI.pill('Within target', 'good') })).concat([{ s: 'Time to clear', a: i.impact.clear, t: '30 mins', p: /^\d/.test(i.impact.clear) && parseInt(i.impact.clear) > 30 ? UI.pill('Over target', 'warn') : UI.pill('In progress', 'info') }])) + `<div class="card-note mt">Corridor average this week: ${D.response.avgResponseMin} minutes to on site, ${D.response.clearanceMin} minutes to clear. <a data-go="incidents/response">Response performance ${I('chev')}</a></div>`)}
        </div><div class="col">
          ${UI.card('Assigned responders', UI.list(i.responders.map(r => ({ icon: r.icon, tone: 'info', title: r.name, sub: r.state, meta: r.eta ? `<b class="ink">${r.eta} mins</b>` : '<b class="ink">On site</b>', pill: r.dist ? `<span class="small muted">${r.dist} km</span>` : '' }))) + `<div class="row mt">${UI.btn('Contact All', { sm: 1, icon: 'phone', primary: 1, toast: 'Conference call started with all responders' })}${UI.btn('Share Live Location', { sm: 1, icon: 'share', toast: 'Live location and snapshot shared with responders' })}</div>`)}
          ${UI.card('Escalation options', UI.actions([{ icon: 'users', tone: 'violet', title: 'Escalate to shift supervisor', sub: 'If not on site within target', btn: 'Escalate' }, { icon: 'shield', tone: 'info', title: 'Request Traffic Police support', sub: 'Lane control and enforcement', btn: 'Request' }, { icon: 'route', tone: 'good', title: 'Open the diversion plan', sub: 'See options and effect on journey time', btn: 'Open', go: 'traffic/forecast' }]))}
        </div></div>
        ${UI.card('Action log', UI.vtimeline(i.timeline.filter(t => t[2] !== 'todo').map(t => ({ t: t[0], text: `<b>${t[1]}</b>`, who: /Alert|VMS|Detect|Confirm|Classif|Threshold|Stopped/.test(t[1]) ? 'VizionIQ · automatic' : 'Control room · Operator KK', tone: t[2] === 'now' ? 'good' : '' }))), { cls: 'mb' })}`; } },

      /* ---------- 6. Related ---------- */
      related: { render: ({ item: i }) => { const hs = D.hotspots.find(h => h.id === i.hotspot), sim = similar(i), nearby = D.incidents.filter(x => x.id !== i.id).sort((a, b) => Math.abs(a.km - i.km) - Math.abs(b.km - i.km)).slice(0, 4); const sameN = sim.filter(s => s.same).length;
        return `<div class="grid g-2-1"><div class="col">
          ${UI.card(`Similar incidents, last 30 days (${D.types[i.type].label})`, UI.table([{ k: 'date', label: 'Date' }, { k: 'time', label: 'Time' }, { k: 'km', label: 'Location' }, { k: 'cause', label: 'Main factor' }, { k: 'clear', label: 'Cleared in', r: 1 }, { k: 'same', label: '', fmt: v => v ? UI.pill('Same location', 'crit') : '' }], sim) + `<div class="card-note mt">${sameN ? `<b class="ink">${sameN} of 6 were at this same location</b>, with the same main factor. That makes this a location problem, not a one-off.` : 'These are spread along the corridor with different causes. No repeating pattern at this location.'}</div>`)}
          ${UI.card('Other active incidents nearby', UI.list(nearby.map(x => ({ icon: D.types[x.type].icon, tone: x.sev === 'high' ? 'crit' : D.types[x.type].tone, title: x.title, titleTone: x.sev === 'high' ? 'crit' : '', sub: `${D.kmLabel(x.km)} · ${x.near} · ${Math.abs(x.km - i.km).toFixed(0)} km away`, sub2: x.line1, meta: x.at, pill: UI.sev(x.sev), go: `incident/${x.id}` }))))}
        </div><div class="col">
          ${hs ? UI.card('Part of a hotspot', `<div class="row between mb"><b class="ink">${hs.name}</b>${UI.pill(hs.count90 + ' in 90 days', 'crit')}</div><div class="small t2 mb">${hs.id} · Km ${hs.from} – ${hs.to} · ${hs.kind}</div><div class="mb"><b class="ink">Pattern.</b> ${hs.pattern}.</div><div class="mb"><b class="ink">Candidate fix.</b> ${hs.fix}.</div>${UI.btn('Open Hotspots &amp; Patterns', { sm: 1, go: 'incidents/hotspots', icon: 'crosshair' })}`, { icon: 'crosshair' }) : UI.card('Hotspot check', `<div class="insight" style="margin:0"><span style="color:var(--good)">${I('checkc')}</span><div><b>Not part of a hotspot</b><p>Fewer than 4 incidents within 2 km in the last 90 days.</p></div></div>`)}
          ${UI.card('Where this shows up elsewhere', UI.list([{ icon: 'car', tone: 'info', title: 'Traffic &amp; Travel Time', sub: `Adds to the ${D.hm(D.home.travelNow)} corridor travel time`, go: 'traffic/live' }, { icon: 'video', tone: 'info', title: 'Live View', sub: `Camera ${i.camId}`, go: 'live/grid' }, { icon: 'bars', tone: 'info', title: 'Analytics &amp; Insights', sub: 'Safety hotspots and bottlenecks', go: 'analytics/safety' }, { icon: 'hex', tone: 'info', title: 'Use Cases', sub: `See all 50, including ${D.types[i.type].label}`, go: 'usecases' }]))}
        </div></div>`; } },
    },
  });
})();
