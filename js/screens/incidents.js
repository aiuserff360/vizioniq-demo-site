/* =========================================================
   Screens · Incidents & Notifications (4 tabs). Every incident row opens the deep dive.
   ========================================================= */
(() => {
  const { UI, C, data: D, I } = VQ;
  const tIcon = i => D.types[i.type].icon, tTone = i => D.types[i.type].tone;
  const feedRow = (i, o) => ({ icon: tIcon(i), tone: i.sev === 'high' ? 'crit' : tTone(i), round: 0, thumb: o && o.thumb ? i.img : null, title: i.title, titleTone: i.sev === 'high' ? 'crit' : i.sev === 'medium' ? 'warn' : '', sub: `${D.corridor}, ${D.kmLabel(i.km)} &nbsp;|&nbsp; ${i.line1}`, sub2: i.line2, meta: i.at, pill: UI.sev(i.sev), go: `incident/${i.id}` });
  const sorted = () => [...D.incidents].sort((a, b) => a.mins - b.mins);

  const resolved = [
    { t: '07:32 AM', title: 'Stalled Vehicle', where: 'Km 44.8 · Shoulder', took: '31 mins', tone: 'good' }, { t: '07:05 AM', title: 'Debris on Road', where: 'Km 236.0 · Lane 1', took: '22 mins', tone: 'good' },
    { t: '06:40 AM', title: 'Minor Collision', where: 'Km 561.2 · Lane 2', took: '48 mins', tone: 'warn' }, { t: '05:55 AM', title: 'Animal on Highway', where: 'Km 319.5 · Lane 1', took: '26 mins', tone: 'good' },
    { t: '05:10 AM', title: 'Stalled Vehicle', where: 'Km 187.4 · Lane 1', took: '37 mins', tone: 'good' }, { t: '04:22 AM', title: 'Overspeeding Vehicle', where: 'Km 402 – 431', took: 'Alert closed', tone: 'gray' },
  ];

  VQ.screen('incidents', {
    title: 'Incidents &amp; Notifications', sub: 'Real-time alerts. Faster response. Safer highways.',
    headRight: () => `<div class="grid kpis compact" style="grid-template-columns:repeat(4,auto);margin:0">${[
      { icon: 'alert', bg: 'bg-crit', value: D.home.activeIncidents, label: 'Active Incidents', delta: { dir: 'up', value: '+3', text: 'vs. last hour', good: false }, go: 'incidents/feed' },
      { icon: 'clock', bg: 'bg-serious', value: D.response.underResponse, label: 'Under Response', delta: { dir: 'up', value: '+2', text: 'vs. last hour', good: false }, go: 'incidents/response' },
      { icon: 'checkc', bg: 'bg-good', value: D.response.resolvedToday, label: 'Resolved (Today)', delta: { dot: 'good', value: '+40%', text: 'vs. yesterday', good: true } },
      { icon: 'road', bg: 'bg-navy', value: D.response.avgResponseMin, unit: 'mins', label: 'Avg. Response Time', delta: { dir: 'down', value: '−35%', text: 'vs. last week', good: true }, go: 'incidents/response' },
    ].map(UI.kpi).join('')}</div>${UI.btn('Log Incident', { primary: 1, icon: 'plus', toast: 'New incident form opened (demo)' })}`,
    tabs: [['overview', 'Overview'], ['feed', 'Live Feed'], ['hotspots', 'Hotspots &amp; Patterns'], ['response', 'Response Performance']],
    filters: () => UI.sel('NH-44') + UI.sel('All Incident Types') + UI.sel('All Severity') + UI.sel('Last 3 Hours'),
    values: ['Fewer incidents. More lives saved.', 'Less congestion. Higher productivity.', 'Fairer systems. Greater value.', 'Lower emissions. A cleaner tomorrow.'],
    views: {
      /* ---------- Overview ---------- */
      overview: { render: () => {
        const hrs = ['03:00', '04:00', '05:00', '06:00', '07:00', '08:00'];
        const typeLegend = `<b>Incident Type</b>${['accident', 'stalled', 'roadworks', 'debris', 'flooding', 'animal', 'pedestrian'].map(k => `<span><span style="color:${VQ.Map.TONE[D.types[k].tone]};display:inline-flex">${I(D.types[k].icon)}</span>${D.types[k].label}</span>`).join('')}`;
        return `<div class="grid g-2-1">
          <div class="col">
            <div class="card flush">${VQ.Map.render({ h: 330, pins: D.incidents.map(i => D.incPin(i, { callout: 'INC-2040' })), legend: typeLegend })}</div>
            <div class="grid g-2-2-3" style="margin:0">
              ${UI.card('Incidents by Type (Last 24 Hours)', C.hbars({ items: D.last24h.byType.map(([k, v]) => ({ label: k === 'other' ? 'Others' : D.types[k].label, value: v, icon: k === 'other' ? 'info' : D.types[k].icon, go: 'incidents/feed' })) }))}
              ${UI.card('Incidents by Severity', C.donut({ size: 138, thick: 20, center: { v: D.last24h.total, l: 'Total Incidents' }, items: D.last24h.bySev.map(([l, v, t]) => ({ label: l, value: v, color: `var(--${t === 'gray' ? 'muted' : t})` })) }))}
              ${UI.card('Incident Trend', C.line({ h: 186, labels: hrs, xTicks: 6, endLabels: 1, yTitle: 'Number of Incidents', series: [{ name: 'Total', data: [5, 7, 9, 11, 14, 18] }, { name: 'High', color: 'var(--crit)', data: [2, 3, 4, 5, 6, 8] }, { name: 'Medium', color: 'var(--serious)', data: [2, 2, 3, 4, 5, 6] }, { name: 'Low', color: 'var(--warn)', data: [1, 2, 2, 2, 3, 4] }] }), { right: '<span class="small">Cumulative since 03:00</span>' })}
            </div>
          </div>
          ${UI.card('Live Incident Feed', UI.list(sorted().slice(0, 8).map(i => feedRow(i))), { right: `<span class="row" style="gap:6px"><i class="dot" style="background:var(--good)"></i>Auto-refresh (30s)</span>${UI.viewAll('incidents/feed')}` })}
        </div>
        ${UI.card('Quick Actions', UI.quick([{ icon: 'wrench', label: 'Dispatch Patrol' }, { icon: 'ambulance', label: 'Dispatch Ambulance' }, { icon: 'cone', label: 'Activate VMS' }, { icon: 'route', label: 'Suggest Diversion', go: 'traffic/forecast' }, { icon: 'clip', label: 'Share Snapshot' }, { icon: 'file', label: 'Create Incident Report', go: 'reports' }]), { cls: 'mb' })}`;
      } },

      /* ---------- Live feed ---------- */
      feed: { title: 'Live Incident Feed', sub: '12 active incidents on NH-44. Select one to open its deep dive.', render: () => {
        const f = VQ.state.sev || 'all'; const rows = sorted().filter(i => f === 'all' || i.sev === f);
        const cols = [{ k: 'x', label: '', fmt: (_, i) => `<img class="li-thumb" src="${UI.IMG(i.img)}" alt="" onerror="this.style.visibility='hidden'">` }, { k: 'id', label: 'ID', fmt: v => `<b class="ink">${v}</b>` }, { k: 'title', label: 'Incident', fmt: (v, i) => `<span class="row" style="gap:8px"><span style="color:${VQ.Map.TONE[tTone(i)]};display:inline-flex;width:18px;height:18px">${I(tIcon(i))}</span><b class="ink">${v}</b></span>` },
          { k: 'km', label: 'Location', fmt: (v, i) => `${D.kmLabel(v)} · ${i.near}` }, { k: 'lane', label: 'Lanes' }, { k: 'at', label: 'Detected', fmt: (v, i) => `${v} <span class="muted">(${i.mins} min)</span>` }, { k: 'sev', label: 'Severity', fmt: v => UI.sev(v) }, { k: 'status', label: 'Status' },
          { k: 'impact', label: 'Delay', fmt: v => v.delay }, { k: 'y', label: '', fmt: () => `<span class="li-chev">${I('chev')}</span>` }];
        return `<div class="grid g-3-1">
          ${UI.card('Active Incidents', UI.table(cols, rows.map(i => ({ ...i, go: `incident/${i.id}` }))), { right: UI.seg('sev', [['all', 'All 12'], ['high', 'High 4'], ['medium', 'Medium 6'], ['low', 'Low 2']], f) })}
          <div class="col">
            ${UI.card('Resolved Today', UI.list(resolved.map(r => ({ icon: 'checkc', tone: r.tone, title: r.title, sub: r.where, meta: r.t, pill: UI.pill(r.took, r.tone) }))), { right: '<span>6 incidents</span>' })}
            ${UI.card('How to read this', `<div class="card-note">Incidents are detected by the corridor cameras and sensors. Severity comes from lanes blocked, vehicles involved and the risk to following traffic. Open any row to see the evidence, the traffic impact, the likely root cause and the response.</div>`, { icon: 'info' })}
          </div></div>`;
      } },

      /* ---------- Hotspots & patterns ---------- */
      hotspots: { title: 'Hotspots &amp; Patterns', sub: 'Where incidents repeat, why, and what would stop them.', render: () => {
        const bins = Array.from({ length: 19 }, (_, i) => i * 30), r = VQ.rng(11);
        const counts = bins.map(b => { const h = D.hotspots.filter(x => x.from >= b && x.from < b + 30).reduce((a, x) => a + x.count90, 0); return h + Math.round(r() * 4 + 1); });
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], hours = Array.from({ length: 24 }, (_, h) => String(h).padStart(2, '0')), r2 = VQ.rng(5);
        const vals = days.map((_, d) => hours.map((_, h) => Math.round((h >= 7 && h <= 9 ? 5 : h >= 17 && h <= 20 ? 4 : h < 5 ? 1.5 : 2) * (d >= 5 ? .8 : 1) + r2() * 2)));
        const live = h => D.incidents.find(i => i.hotspot === h.id);
        return `<div class="grid g-5-3">
          <div class="card flush">${VQ.Map.render({ h: 300, plainRoute: 1, pins: D.hotspots.map((h, k) => ({ type: 'incident', km: (h.from + h.to) / 2, icon: 'crosshair', tone: k < 2 ? 'crit' : 'serious', count: h.count90, tip: `<b>${h.name}</b><br>Km ${h.from}–${h.to} · ${h.kind}<br>${h.count90} incidents in 90 days`, callout: k === 0 ? { title: h.name, lines: [`Km ${h.from}–${h.to} · ${h.count90} in 90 days`], tone: 'dark' } : null })), legend: '<b>Hotspots (last 90 days)</b><span>Number on a pin is the incident count</span>' })}</div>
          ${UI.card('Incidents along the corridor (90 days)', C.bars({ h: 236, labels: bins.map(b => String(b)), series: [{ name: 'Incidents', data: counts }], unit: 'incidents' }) + '<div class="card-note">Each bar is a 30 km stretch, labelled by its starting Km. The tall bars are the hotspots on the map.</div>')}
        </div>
        <div class="grid g3">${D.hotspots.map(h => { const li = live(h); return `<div class="card"><div class="card-h">${I('crosshair')}<h3>${h.name}</h3><div class="right">${UI.pill(h.count90 + ' in 90 days', h.count90 >= 9 ? 'crit' : 'warn')}</div></div>
            <div class="small t2 mb">${h.id} · Km ${h.from} – ${h.to} · ${h.kind}</div><div class="mb"><b class="ink">Pattern.</b> ${h.pattern}.</div><div class="mb"><b class="ink">Candidate fix.</b> ${h.fix}.</div>
            ${li ? `<div class="insight click" data-go="incident/${li.id}/rootcause" style="margin:0"><span style="color:var(--crit)">${I('alert')}</span><div><b>Live now: ${li.title}</b><p>${li.id} · ${D.kmLabel(li.km)} · detected ${li.at}. Open its root cause.</p></div></div>` : '<div class="small muted">No live incident at this hotspot right now.</div>'}</div>`; }).join('')}
          ${UI.card('When incidents happen (90 days)', C.heat({ rows: days, cols: hours, colEvery: 3, values: vals, unit: 'incidents', color: v => C.seqBlue(v / 9) }) + `<div class="row mt small t2"><span>Fewer</span>${[0.05, .3, .55, .8, .99].map(t => `<i style="width:22px;height:10px;border-radius:2px;background:${C.seqBlue(t)}"></i>`).join('')}<span>More incidents per hour</span></div>`)}
        </div>`;
      } },

      /* ---------- Response performance ---------- */
      response: { title: 'Response Performance', sub: 'From detection to clear road: how fast each step happens against target.', render: () => {
        const open = sorted().filter(i => !['Easing', 'Monitoring', 'Planned work active'].includes(i.status)).slice(0, 8);
        const sla = i => i.mins > 60 && i.sev !== 'low' ? ['Breached', 'crit'] : i.mins > 35 ? ['At risk', 'warn'] : ['On track', 'good'];
        return UI.kpis([
          { icon: 'eye', bg: 'bg-info', value: D.response.detectToAlertSec, unit: 'sec', label: 'Detection to Alert', delta: { dir: 'down', value: '−18 sec', text: 'vs. last month', good: true } },
          { icon: 'users', bg: 'bg-violet', value: D.response.avgResponseMin, unit: 'mins', label: 'Alert to On Site', delta: { dir: 'down', value: '−35%', text: 'vs. last week', good: true } },
          { icon: 'checkc', bg: 'bg-good', value: D.response.clearanceMin, unit: 'mins', label: 'Avg. Clearance Time', delta: { dir: 'up', value: '+4 mins', text: 'vs. last week', good: false } },
          { icon: 'shieldcheck', bg: 'bg-navy', value: '86%', label: 'Within Response Target', delta: { dir: 'up', value: '+5 pts', text: 'vs. last month', good: true } },
        ], 'g4') + `<div class="grid g2">
          ${UI.card('Time per response step, this week', C.bars({ h: 210, labels: ['Detect to|Alert', 'Alert to|Dispatch', 'Dispatch to|On Site', 'On Site to|Clear'], twoLine: 1, unit: 'mins', series: [{ name: 'Actual (avg. mins)', data: [0.7, 2.6, 8, 36] }, { name: 'Target (mins)', color: 'var(--axis)', data: [1, 3, 10, 30] }] }) + '<div class="card-note">Clearing the road is the slow step: 36 minutes against a 30-minute target, mostly waiting for the right recovery vehicle.</div>')}
          ${UI.card('Average time to on site, by incident type', C.hbars({ unit: 'mins', items: [['hgv', 19], ['flooding', 14], ['debris', 13], ['accident', 8], ['stalled', 8], ['animal', 11], ['wrongway', 7], ['pedestrian', 12]].sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ label: D.types[k].label, value: v, icon: D.types[k].icon, text: v + ' min' })) }))}
        </div><div class="grid g-2-1">
          ${UI.card('Open incidents against response target', UI.table([{ k: 'id', label: 'ID', fmt: v => `<b class="ink">${v}</b>` }, { k: 'title', label: 'Incident' }, { k: 'km', label: 'Km', fmt: v => D.kmLabel(v) }, { k: 'mins', label: 'Open for', fmt: v => v + ' mins' }, { k: 'status', label: 'Status' }, { k: 'x', label: 'Nearest unit', fmt: (_, i) => `${i.responders[0].name} · ${i.responders[0].eta ? i.responders[0].eta + ' mins' : 'on site'}` }, { k: 'y', label: 'Target', fmt: (_, i) => UI.pill(...sla(i)) }], open.map(i => ({ ...i, go: `incident/${i.id}/response` }))))}
          ${UI.card('Response units', UI.list([{ icon: 'car', tone: 'info', title: 'Highway Patrol', sub: '18 units · 7 deployed · 11 available', pill: UI.pill('61% free', 'good') }, { icon: 'truck', tone: 'serious', title: 'Tow and Recovery', sub: '9 units · 4 deployed · 1 heavy crane', pill: UI.pill('Crane short', 'warn') }, { icon: 'ambulance', tone: 'crit', title: 'Ambulance (108)', sub: '12 units · 2 deployed', pill: UI.pill('83% free', 'good') }, { icon: 'wrench', tone: 'info', title: 'Maintenance Crews', sub: '7 crews · 3 deployed', pill: UI.pill('57% free', 'good') }]))}
        </div>`;
      } },
    },
  });
})();
