/* =========================================================
   Screens · Home (Corridor Command View). One view, no tabs.
   Also defines VQ.camKit, the small camera helper shared with live.js.
   ========================================================= */
(() => {
  const { UI, C, data: D, I } = VQ;

  /* ---------- camera helper (used by home.js and live.js) ---------- */
  /* If a camera image file is missing, swap in a corridor frame instead of a grey plate.
     Only acts on images inside a [data-fb] wrapper rendered by these two screens. */
  if (!VQ._camFb) { VQ._camFb = 1; document.addEventListener('error', e => { const t = e.target; if (!t || t.tagName !== 'IMG' || t.dataset.fbd) return; const w = t.closest('[data-fb]'); if (!w) return; t.dataset.fbd = 1; e.stopPropagation(); t.src = UI.IMG(w.dataset.fb); }, true); }

  /* vehicle boxes for the plain corridor frames, in % of the IMAGE: [x, y, w, h, label]; ar = image width / height */
  const PLAIN = {
    'cam-corridor-1.jpg': { ar: 1.92, b: [[12.6, 63.5, 12.6, 19, 'Car · 84 km/h'], [44.6, 64.5, 11.2, 20.5, 'Car · 91 km/h'], [26, 56, 7.6, 12.5, 'SUV · 88 km/h']] },
    'cam-corridor-2.jpg': { ar: 2.35, b: [[53.6, 81.5, 7.4, 18, 'Truck · 72 km/h'], [45, 68.5, 5, 19.5, 'Truck · 68 km/h'], [41.6, 85.5, 4.4, 10, 'Car · 83 km/h'], [36, 85, 3.6, 8, 'Car · 80 km/h']] },
    'cam-corridor-3.jpg': { ar: 1.42, b: [[13, 45.5, 9.4, 13, 'Truck · 74 km/h'], [82.4, 55.5, 9.6, 11.5, 'Car · 92 km/h'], [42.4, 43.5, 5, 8.5, 'Car · 88 km/h']] },
    'cam-corridor-4.jpg': { ar: 1.42, b: [[25, 57.5, 10, 14, 'Truck · 76 km/h'], [63, 78, 12, 16.5, 'Car · 89 km/h'], [63, 53.5, 7, 11, 'SUV · 85 km/h'], [84, 47.5, 7.6, 11, 'Car · 93 km/h']] },
  };
  const BAKED = ['cam-accident.jpg', 'cam-toll-plaza.jpg']; /* these frames already carry drawn detections */
  const FB = ['cam-corridor-1.jpg', 'cam-corridor-4.jpg', 'cam-corridor-2.jpg', 'cam-corridor-3.jpg'];
  const FRAME_AR = { '': 16 / 9, wide: 2.1, tall: 4 / 3 };
  /* image % -> frame % under object-fit: cover */
  const fit = (b, ia, fa) => { let [x, y, w, h, label] = b; if (ia > fa) { const f = fa / ia; x = (x - (1 - f) * 50) / f; w = w / f; } else { const f = ia / fa; y = (y - (1 - f) * 50) / f; h = h / f; } return { x, y, w, h, label }; };
  const incOf = c => D.incident(c.inc) || D.incidents.find(i => i.km === c.km) || null;
  const kit = VQ.camKit = {
    incOf,
    fb: c => FB[D.cameras.indexOf(c) % FB.length],
    place: c => c.label || 'Near ' + D.nearest(c.km),
    sees: c => { const i = incOf(c); return c.status === 'off' ? 'No video' : i ? i.title : c.status === 'warn' ? 'Normal flow · image degraded' : 'Normal flow'; },
    boxes: (c, cls, max) => { if (c.status === 'off') return []; const i = incOf(c); if (BAKED.includes(c.img)) return []; if (i) return i.boxes || []; const p = PLAIN[c.img]; if (!p) return [];
      return p.b.map(b => fit(b, p.ar, FRAME_AR[cls || ''])).filter(b => b.x >= 1 && b.y >= 12 && b.x + b.w <= 99 && b.y + b.h <= 99).slice(0, max || 9); },
    path: c => { const i = incOf(c); return c.status !== 'off' && i && i.path ? i.path : null; },
    wrap: (c, html, style) => `<div data-fb="${kit.fb(c)}" ${style ? `style="${style}"` : ''}>${html}</div>`,
  };

  /* ---------- traffic overview series: 06:00 to 08:45 in 5-minute steps ---------- */
  const N = 34, labels = Array.from({ length: N }, (_, i) => { const m = 360 + i * 5; return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; });
  const tail = (arr, end) => { end.forEach((v, k) => { arr[N - end.length + k] = v; }); return arr; };
  const speed = tail(VQ.series(N, 87, 2.4, 21, i => -i * .09).map(v => Math.round(v)), [84, 83, 66, 54, 48]);             /* accident 08:32 */
  const volume = tail(VQ.series(N, 0, 900, 22, (i, n) => 31000 + 41500 * Math.pow(i / (n - 1), .8)).map(v => Math.round(v / 10) * 10), [D.home.vehiclesHour]);
  const travel = tail(VQ.series(N, 0, 3, 23, i => D.home.travelNormal + (i < 10 ? i * .4 : 4 + (i - 10) * 1.9)).map(v => Math.round(v)), [474, 476, 485, 494, D.home.travelNow]);
  const chartOf = mode => {
    const base = { h: 236, labels, xTicks: 3, mark: { i: N - 1, label: `Now ${D.now}` }, legend: false };
    if (mode === 'volume') return C.line({ ...base, unit: 'thousand vehicles/hour', yTitle: 'Vehicles per hour (thousands)', yMin: 20, yMax: 80, yTicks: 3, series: [{ name: 'Vehicles in the last hour', data: volume.map(v => v / 1000), area: 1 }] })
      + `<div class="card-note">Morning peak still building: <b>${VQ.fmt(D.home.vehiclesHour)}</b> vehicles in the last hour, ${D.home.vehiclesDelta}% above yesterday at this time.</div>`;
    if (mode === 'travel') return C.line({ ...base, unit: 'min', yTitle: 'Hyderabad to Bengaluru (min)', yMin: 400, yMax: 520, yTicks: 3, series: [{ name: 'End-to-end travel time', data: travel }, { name: `Normal (${D.home.travelNormal} min)`, data: labels.map(() => D.home.travelNormal), color: 'var(--axis)', dash: 1 }] })
      + `<div class="card-note">Now <b>${D.hm(D.home.travelNow)}</b> against a normal ${D.hm(D.home.travelNormal)}. The Hyderabad – Jadcherla section adds ${D.sections[0].current - D.sections[0].normal} of the ${D.home.travelNow - D.home.travelNormal} extra minutes.</div>`;
    return C.line({ ...base, unit: 'km/h', yTitle: 'Speed (km/h)', yMin: 0, yMax: 120, yTicks: 3, series: [{ name: 'Average speed, Km 58 – 90 towards Bengaluru', data: speed }] })
      + `<div class="card-note">Average speed on Km 58 – 90 fell from ${speed[N - 5]} to <b>${speed[N - 1]} km/h</b> after the 08:32 AM accident at Km 84.5. Inside the queue it is ${D.incident('INC-2040').impact.now} km/h.</div>`;
  };

  const homeCams = ['CAM-1520', 'CAM-0845', 'CAM-1312', 'CAM-2120'].map(id => D.cameras.find(c => c.id === id));
  const navBtn = (side, n, icon) => `<button data-set="hcam=${n}" aria-label="${side === 'left' ? 'Previous' : 'Next'} camera" style="position:absolute;${side}:8px;top:50%;transform:translateY(-50%);z-index:3;width:30px;height:30px;border-radius:50%;background:rgba(8,18,40,.78);color:#fff;display:grid;place-items:center"><span style="display:inline-flex;width:16px;height:16px;${side === 'left' ? 'transform:rotate(180deg)' : ''}">${I(icon)}</span></button>`;

  VQ.screen('home', {
    title: 'Corridor Command View', sub: `${D.corridor} · ${D.from} to ${D.to} · ${D.km} km`,
    headRight: () => `<span class="row small t2" style="gap:6px"><i class="dot" style="background:var(--good)"></i>Live · updated ${D.nowSec}</span>${UI.btn('Open Live View', { icon: 'video', go: 'live/grid' })}`,
    views: { main: { render: () => {
      const H = D.home, recent = [...D.incidents].sort((a, b) => a.mins - b.mins).slice(0, 5);
      const tiles = [
        { icon: 'alert', bg: 'bg-crit', value: H.activeIncidents, label: 'Active Incidents', delta: { dir: 'up', value: '+' + H.incidentsDelta, text: 'vs. yesterday', good: false }, go: 'incidents/overview' },
        { icon: 'car', bg: 'bg-info', value: VQ.fmt(H.vehiclesHour), label: 'Vehicles (last 1 hour)', delta: { dir: 'up', value: `+${H.vehiclesDelta}%`, text: 'vs. yesterday' }, go: 'traffic/live' },
        { icon: 'clock', bg: 'bg-serious', value: D.hm(H.travelNow), label: 'Corridor Travel Time', delta: { dir: 'up', value: '+1 h 12 m', text: 'vs normal', good: false }, go: 'traffic/travel', tip: `Hyderabad to Bengaluru now ${D.hm(H.travelNow)}; normal ${D.hm(H.travelNormal)}` },
        { icon: 'rupee', bg: 'bg-violet', value: `₹ ${H.tollToday} Cr`, label: 'Toll Revenue (today)', delta: { dir: 'up', value: `+${H.tollDelta}%`, text: 'vs. yesterday', good: true }, go: 'toll/overview' },
        { icon: 'wrench', bg: 'bg-warn', value: H.assetAlerts, label: 'Asset Alerts', delta: { dir: 'up', value: H.assetNew + ' new', text: 'today', good: false }, go: 'assets/alerts' },
      ].map(UI.kpi).join('');
      const cond = `<div class="card kpi click" data-go="incident/INC-2038" data-tip="Heavy rain Km 425 – 470 with waterlogging at Km 441. Fog on Km 530 – 548 near Devanahalli is lifting."><div class="kpi-ic bg-good">${I('leaf')}</div><div style="min-width:0"><div class="kpi-val" style="color:var(--warn-ink)">Fair</div><div class="kpi-lbl">Corridor Conditions</div><div class="kpi-delta" style="white-space:normal;line-height:1.3">Rain Km 425–470 · fog near Devanahalli</div></div></div>`;

      const pins = [...D.incidents.map(i => { const p = D.incPin(i, { callout: 'INC-2040' }); if (p.callout) { p.callout.dx = 78; p.callout.gap = 34; } return p; }), ...D.cameras.filter(c => !kit.incOf(c)).map(D.camPin), ...D.plazas.map(D.plazaPin)];
      const mapCard = `<div class="card flush"><div class="card-h" style="padding:12px 14px 0;margin-bottom:10px;flex-wrap:wrap"><h3>Live Highway View</h3><div class="right">${UI.sel('NH-44')}${UI.sel('Last 2 Hours')}${UI.sel('All Incident Types')}</div></div>${VQ.Map.render({ h: 372, pins, legend: 'speed' })}</div>`;

      const recentCard = UI.card('Recent Incidents', UI.list(recent.map(i => ({ icon: D.types[i.type].icon, tone: i.sev === 'high' ? 'crit' : D.types[i.type].tone, title: i.title, titleTone: i.sev === 'high' ? 'crit' : '', sub: `${D.corridor}, ${D.kmLabel(i.km)} · ${i.near}`, sub2: `${i.line1} · ${i.status}`, meta: i.at, pill: UI.sev(i.sev), go: `incident/${i.id}` })))
        + `<div class="card-note">${H.activeIncidents} active on the corridor, ${D.incidents.filter(i => i.sev === 'high').length} high severity. ${D.response.underResponse} have a response unit moving.</div>`, { right: UI.viewAll('incidents/feed') });

      const k = VQ.clamp(+VQ.state.hcam || 0, 0, homeCams.length - 1), cam = homeCams[k], inc = kit.incOf(cam), nC = homeCams.length;
      const camCard = UI.card('Live Camera Feed', kit.wrap(cam, UI.cam({ img: cam.img, alt: `${cam.id} live frame`, label: `${D.corridor} | ${D.kmLabel(cam.km)} | ${D.from} → ${D.to}`, status: inc ? '' : 'ok', boxes: kit.boxes(cam, '', 2), path: kit.path(cam), foot: `${cam.id} · ${kit.place(cam)}`, time: D.nowSec, go: 'live/grid', tip: 'Open Live View',
        extra: navBtn('left', (k + nC - 1) % nC, 'chev') + navBtn('right', (k + 1) % nC, 'chev') }))
        + `<div class="cam-strip">${homeCams.map((c, n) => kit.wrap(c, UI.cam({ img: c.img, alt: c.id, live: false, chip: false, label: `<span class="cam-chip">${D.kmLabel(c.km)}</span>`, set: `hcam=${n}`, on: n === k, tip: `<b>${c.id}</b><br>${kit.place(c)} · ${kit.sees(c)}` }), 'min-width:0')).join('')}</div>`
        + `<div class="row between mt" style="gap:10px"><div class="small" style="min-width:0">${inc ? `<b style="color:var(--crit-ink)">${inc.title}</b> <span class="t2">· ${inc.line1} · detected ${inc.at}</span>` : `<b class="ink">Normal flow</b> <span class="t2">· ${kit.boxes(cam, '', 2).length} vehicles in view · no alerts</span>`}</div>${inc ? UI.btn('Open Incident', { sm: 1, primary: 1, go: `incident/${inc.id}` }) : UI.btn('All Cameras', { sm: 1, go: 'live/grid' })}</div>`,
        { right: `<span>Camera ${k + 1} of ${nC}</span>${UI.viewAll('live/grid')}` });

      const mode = VQ.state.tmode || 'speed';
      const trafficCard = UI.card('Traffic Overview', `<div class="mb">${UI.seg('tmode', [['speed', 'Speed'], ['volume', 'Volume'], ['travel', 'Travel Time']], mode)}</div>${chartOf(mode)}`, { right: `<span>06:00 AM to now</span>${UI.viewAll('traffic/live')}` });

      const a = D.incident('INC-2040'), w = D.incident('INC-2038'), p = D.plazas.find(x => x.id === 'pullur'), hs = D.hotspots[0];
      const insights = UI.card('AI Insights',
        UI.insight('alert', 'crit', `Queue behind the ${D.kmLabel(a.km)} accident likely to extend`, `Now ${a.impact.queue} km, forecast ${a.impact.peakQueue} km by ${a.impact.peakAt}. Activate VMS at Km 70 and Km 78.`, 'incident/INC-2040/impact')
        + UI.insight('rupee', 'violet', `Toll revenue anomaly at ${p.name} plaza, Km ${p.km}`, `Repeated classification mismatch. Estimated leakage ₹&nbsp;${p.leak24}&nbsp;lakh in 24 hours.`, 'toll/leakage')
        + UI.insight('bulb', 'warn', 'High-risk location identified', `${hs.count90} incidents in 90 days at Km ${hs.from}–${hs.to}, ${hs.name}. Safety audit advised.`, 'incidents/hotspots')
        + UI.insight('rain', 'blue', `${D.kmLabel(w.km)} waterlogging to pass 30 cm by 09:15 AM`, `Now about 22 cm and rising. Close Lane 1; prepare the light-vehicle diversion.`, 'incident/INC-2038'),
        { icon: 'sparkles', right: UI.viewAll('analytics') });

      return `<div class="grid kpis g6">${tiles}${cond}</div>
        <div class="grid g-2-1">${mapCard}${recentCard}</div>
        <div class="grid g3">${camCard}${trafficCard}${insights}</div>`;
    } } },
  });
})();
