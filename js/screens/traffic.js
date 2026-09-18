/* =========================================================
   Screens · Traffic & Travel Time (5 tabs). Live tab follows mockup 06.
   Shared facts come from VQ.data; section data is at the top of this file.
   ========================================================= */
(() => {
  const { UI, C, data: D, I } = VQ;
  const inc = id => D.incident(id), impactGo = id => `incident/${id}/impact`;
  const tIcon = i => D.types[i.type].icon, tTone = i => D.types[i.type].tone;
  const hm = D.hm, sum = a => a.reduce((x, y) => x + y, 0);
  const NORMAL = sum(D.sections.map(s => s.normal)), CURRENT = sum(D.sections.map(s => s.current)), EXTRA = CURRENT - NORMAL; /* 430, 502, +72 */
  const clock = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  const times = (from, to, step) => { const a = []; for (let m = from; m <= to; m += step) a.push(clock(m)); return a; };
  const toMin = at => { const [h, m] = at.split(/[: ]/).map(Number); return (h % 12 + (/PM/.test(at) ? 12 : 0)) * 60 + m; };
  /* piecewise-linear curve through [minute, value] key points, sampled every `step` minutes */
  const curve = (keys, n, step) => Array.from({ length: n }, (_, i) => { const t = i * step; if (t >= keys[keys.length - 1][0]) return keys[keys.length - 1][1]; let k = 0; while (keys[k + 1][0] < t) k++; const [a, b] = [keys[k], keys[k + 1]]; return Math.round((a[1] + (b[1] - a[1]) * (t - a[0]) / (b[0] - a[0])) * 10) / 10; });
  const up = txt => `<span class="row" style="gap:5px;color:var(--crit-ink,var(--crit));font-weight:600"><span style="display:inline-flex;width:12px;height:12px">${I('up')}</span>${txt}</span>`;
  const delayTxt = m => m >= 60 ? `+${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')} m` : `+${m} m`;
  const speedLegend = `<div class="row wrap small t2" style="gap:6px 16px">${[[85, '&gt; 80 · Free flow'], [70, '60 – 80 · Moderate'], [50, '40 – 60 · Slow'], [20, '&lt; 40 · Congested']].map(([v, l]) => `<span class="row" style="gap:6px"><i style="width:22px;height:10px;border-radius:2px;background:${C.speedColor(v)}"></i>${l}</span>`).join('')}<span class="muted">km/h</span></div>`;
  const SHORT = { 'INC-2040': 'Accident', 'INC-2038': 'Waterlogging', 'INC-2036': 'Stranded Heavy Vehicle', 'INC-2039': 'Stalled Vehicle', 'INC-2037': 'Toll Plaza Queue', 'INC-2035': 'Roadworks' };
  /* thumbnails that exist on disk for every incident shown in lists */
  const THUMB = { 'INC-2040': 'cam-accident.jpg', 'INC-2039': 'cam-stalled-truck.jpg', 'INC-2037': 'cam-toll-plaza.jpg', 'INC-2038': 'cam-corridor-3.jpg', 'INC-2036': 'cam-corridor-1.jpg', 'INC-2035': 'cam-corridor-4.jpg' };

  /* ---------- what is adding the +72 minutes (through trip, Hyderabad to Bengaluru) ---------- */
  const CAUSES = [
    { id: 'INC-2040', label: 'Accident, Km 84.5', min: 22 }, { id: 'INC-2038', label: 'Waterlogging, Km 441', min: 14 }, { id: 'INC-2037', label: 'Raikal toll queue, Km 58', min: 9 },
    { id: 'INC-2036', label: 'Stranded HGV, Km 296', min: 8 }, { id: 'INC-2035', label: 'Roadworks, Km 268', min: 8 }, { id: 'INC-2039', label: 'Stalled truck, Km 131', min: 5 },
    { id: null, label: 'Rain, fog and other', min: EXTRA - 66, icon: 'rain', go: 'incident/INC-2030/impact', note: 'Heavy rain Km 425–470, fog Km 530–548, cattle at Km 322' },
  ];
  const upperDelay = i => { const m = String(i.impact.delay).match(/(\d+)\D*$/); return m ? +m[1] : 0; };
  const impacting = () => [...D.incidents].filter(i => i.impact.queue > 0 && i.impact.trend !== 'Cleared').sort((a, b) => upperDelay(b) - upperDelay(a) || (a.sev === 'high' ? -1 : 1));

  /* ---------- forecast queue curves, minutes after 08:45, 5-minute steps to 11:45 ---------- */
  const F_N = 37, F_LABELS = times(525, 705, 5);
  const acc = inc('INC-2040').impact; /* queue 4.8 km now, peak 7.5 km at 09:20 AM, normal flow by 10:00 AM */
  const QUEUES = {
    'INC-2040': curve([[0, acc.queue], [15, 6.4], [35, acc.peakQueue], [45, 7], [60, 4.2], [75, .3], [80, 0]], F_N, 5),
    'INC-2038': curve([[0, inc('INC-2038').impact.queue], [25, 4.4], [45, inc('INC-2038').impact.peakQueue], [75, 4.6], [105, 2], [135, .2], [140, 0]], F_N, 5),
    'INC-2039': curve([[0, inc('INC-2039').impact.queue], [25, inc('INC-2039').impact.peakQueue], [32, 2.5], [40, .2], [45, 0]], F_N, 5),
    'INC-2036': curve([[0, inc('INC-2036').impact.queue], [45, inc('INC-2036').impact.peakQueue], [65, 2.8], [80, 1], [90, 0]], F_N, 5),
  };
  const PEAK_I = F_LABELS.indexOf('09:20');

  /* ---------- time–space speed grid: 19 stretches of 30 km × 06:00–08:45 in 15-minute bins ---------- */
  const H_COLS = times(360, 525, 15), H_LAST = H_COLS.length - 1;
  const CUSTOM_START = { 0: 435, 562: 450, 425: 465, 442: 465 }; /* city edge from 07:15, Bengaluru entry from 07:30, rain band from 07:45 */
  const FOG = [88, 86, 70, 56, 55, 57, 58, 59, 60, 61, 62, 62]; /* Km 530–548: fog from 06:30, thickest 06:45, easing */
  const segSpeedAt = (sg, c, r) => {
    if (sg.state === 'free') return Math.max(81, sg.speed + Math.round((r() - .5) * 6) + (c < 4 ? 2 : 0));
    if (sg.from === 530) return FOG[c];
    const i = D.incidents.find(x => x.km >= sg.from - .5 && x.km <= sg.to + .5 && x.impact.trend !== 'Cleared');
    const start = Math.floor(((CUSTOM_START[sg.from] ?? (i ? toMin(i.at) : 480)) - 360) / 15), pre = 88 + Math.round((r() - .5) * 4);
    if (c < start) return pre; const n = Math.min(3, H_LAST - start + 1), k = Math.min(n, c - start + 1);
    return Math.round(pre + (sg.speed - pre) * Math.pow(k / n, .4));
  };
  const heatGrid = () => { const r = VQ.rng(44);
    const rows = Array.from({ length: 19 }, (_, k) => { const a = k * 30, b = a + 30; const town = D.places.filter(p => p.km >= a && (p.km < b || b === D.km)).sort((x, y) => (y.major || 0) - (x.major || 0))[0]; return { a, b, label: `Km ${a} – ${b}${town ? ' · ' + town.name : ''}` }; });
    const values = rows.map(row => H_COLS.map((_, c) => Math.min(...D.speedSegments.filter(s => s.from < row.b && s.to > row.a).map(s => segSpeedAt(s, c, r)))));
    return { rows, values }; };

  VQ.screen('traffic', {
    title: 'Traffic &amp; Travel Time', sub: 'Real-time traffic conditions. Predictive insights. Smoother journeys.',
    headRight: () => `<div class="grid kpis compact" style="grid-template-columns:repeat(5,auto);margin:0">${[
      { icon: 'car', bg: 'bg-info', value: D.home.avgSpeed, unit: 'km/h', label: 'Average Speed', delta: { dir: 'down', value: `−${Math.abs(D.home.avgSpeedDelta)}%`, text: 'vs. normal', good: false }, go: 'traffic/heatmap' },
      { icon: 'clock', bg: 'bg-crit', value: hm(D.home.travelNow), label: 'Travel Time', delta: { dir: 'up', value: delayTxt(D.home.travelNow - D.home.travelNormal), text: 'vs. normal', good: false }, go: 'traffic/travel', tip: `${D.from} to ${D.to}, ${D.km} km. Normal is ${hm(D.home.travelNormal)}.` },
      { icon: 'road', bg: 'bg-warn', value: 'Fair', label: 'Traffic Flow', delta: { dot: 'warn', value: 'Moderate', text: '' } },
      { icon: 'alert', bg: 'bg-serious', value: D.home.activeIncidents, label: 'Active Incidents', delta: { dot: 'crit', value: D.incidents.filter(i => i.sev === 'high').length, text: 'major' }, go: 'incidents/feed' },
      { icon: 'route', bg: 'bg-good', value: D.home.diversions, label: 'Active Diversions', delta: { dot: 'good', value: 'Operational', text: '' }, go: 'traffic/forecast' },
    ].map(UI.kpi).join('')}</div>`,
    tabs: [['live', 'Live Traffic'], ['travel', 'Travel Time'], ['heatmap', 'Speed Heatmap'], ['forecast', 'Congestion Forecast'], ['performance', 'Corridor Performance']],
    filters: () => UI.sel('NH-44') + UI.sel('Entire Corridor') + UI.sel('Last 1 hour'),
    values: ['Fewer incidents. More lives saved.', 'Less congestion. Higher productivity.', 'Faster movement. Greater value.', 'Lower emissions. A cleaner tomorrow.'],
    views: {
      /* ---------- Live traffic (mockup 06) ---------- */
      live: { render: () => {
        const list = impacting().slice(0, 5), raikal = D.plazas.find(p => p.id === 'raikal'), flood = inc('INC-2038'), acc0 = inc('INC-2040');
        const pins = [
          ...D.incidents.filter(i => i.impact.queue > 0 && i.impact.trend !== 'Cleared' && i.id !== 'INC-2037').map(i => ({ ...D.incPin(i), go: impactGo(i.id) })),
          { ...D.plazaPin(raikal), callout: { title: 'Toll Plaza', lines: [`Raikal · Km ${raikal.km}`, 'High queue'], below: 1, dx: -40, gap: 46, lastTone: 'crit' } },
        ];
        pins.find(p => p.km === acc0.km).callout = { title: 'Accident', lines: [`${D.kmLabel(acc0.km)} (${acc0.dir})`, acc0.line1], tone: 'crit', icon: 'alert', iconTone: 'crit', dx: 78 };
        const fp = pins.find(p => p.km === flood.km); fp.callout = { title: 'Slow Traffic', lines: [`${D.kmLabel(flood.km)} · Waterlogging`, `Avg. speed ${flood.impact.now} km/h`], tone: 'crit', icon: 'alert', iconTone: 'crit' };
        const secRows = D.sections.map(s => ({ ...s, dist: s.to - s.from })); secRows.push({ name: 'Entire Corridor', dist: D.km, current: CURRENT, normal: NORMAL, total: true });
        const tLabels = times(450, 525, 5);
        const trend = { all: [79, 78, 79, 78, 77, 78, 77, 76, 76, 75, 74, 74, 73, 71, 69, D.home.avgSpeed], hk: [81, 80, 82, 81, 80, 81, 80, 79, 80, 78, 77, 77, 76, 70, 65, 62], kb: [80, 79, 80, 79, 78, 79, 78, 77, 77, 76, 74, 73, 72, 71, 71, 70] };
        const acts = [
          { icon: 'mega', tone: 'info', title: 'Activate VMS', sub: '“Accident ahead” and travel time at Km 70 and Km 78', act: 'VMS messages sent to Km 70 and Km 78' },
          { icon: 'route', tone: 'crit', title: 'Divert traffic', sub: 'via Shadnagar – Mahbubnagar road', go: 'traffic/forecast' },
          { icon: 'car', tone: 'navy', title: 'Deploy patrol', sub: 'at congestion zones, Km 79.7 and Km 439', act: 'Patrol units assigned to Km 79.7 and Km 439' },
          { icon: 'rain', tone: 'violet', title: 'Monitor weather impact', sub: 'Rain and waterlogging, Km 425 – 470', go: impactGo('INC-2038') },
        ];
        return `<div class="grid" style="grid-template-columns:minmax(0,2.15fr) minmax(0,1fr)">
          <div class="card flush" style="position:relative">${VQ.Map.render({ h: 350, pins, legend: 'speed' })}
            <div class="seg" style="position:absolute;right:54px;top:10px;z-index:2;box-shadow:var(--shadow)"><button class="on">Map View</button><button data-act="Satellite imagery is not part of this demo">Satellite View</button></div></div>
          ${UI.card(`Active Incidents Impacting Traffic (${list.length})`, UI.list(list.map(i => ({ icon: tIcon(i), tone: i.sev === 'high' ? 'crit' : tTone(i), thumb: THUMB[i.id] || i.img, title: SHORT[i.id] || D.types[i.type].label, titleTone: i.sev === 'high' ? 'crit' : 'warn', sub: `${D.kmLabel(i.km)} &nbsp;|&nbsp; ${i.line1}`, sub2: `${i.sev === 'high' ? 'Severe' : 'Moderate'} delay (~${i.impact.delay})`, meta: i.at, go: impactGo(i.id) }))), { right: UI.viewAll('incidents/feed') })}
        </div>
        <div class="grid g-3-2-2">
          ${UI.card('Travel Time by Section', UI.table([{ k: 'name', label: 'Section', fmt: (v, r) => r.total ? v : `<span class="ink">${v}</span>` }, { k: 'dist', label: 'Distance', fmt: v => v + ' km' }, { k: 'current', label: 'Current', fmt: (v, r) => `<b style="color:${r.current > r.normal ? 'var(--crit-ink,var(--crit))' : 'inherit'}">${hm(v)}</b>` }, { k: 'normal', label: 'Normal', fmt: v => hm(v) }, { k: 'x', label: 'Change', fmt: (_, r) => up(delayTxt(r.current - r.normal)) }], secRows), { right: UI.viewAll('traffic/travel') })}
          ${UI.card('Traffic Speed Trend', C.line({ h: 196, labels: tLabels, xTicks: 5, yMin: 40, yMax: 100, yTicks: 3, yTitle: 'Speed (km/h)', unit: 'km/h', series: [{ name: 'NH-44 (overall)', data: trend.all }, { name: 'Hyderabad – Kurnool', data: trend.hk }, { name: 'Kurnool – Bengaluru', data: trend.kb }] }) + `<div class="card-note">Hyderabad – Kurnool fell from 76 to 62 km/h after the 08:32 accident at Km 84.5.</div>`)}
          ${UI.card('Congestion Forecast (Next 3 Hours)', C.line({ h: 196, labels: F_LABELS, xTicks: 6, yMin: 0, yMax: 10, yTitle: 'Queue length (km)', unit: 'km', series: [{ name: 'Queue at Km 84.5', data: QUEUES['INC-2040'], color: 'var(--crit)', area: 1 }], mark: { i: PEAK_I, label: `Peak ~${acc.peakQueue} km at ${acc.peakAt}` } }) + `<div class="card-note">Queue behind the Km 84.5 accident: ${acc.queue} km now, normal flow by ${acc.flowBack}.</div>`, { right: `<a data-go="traffic/forecast">Details</a>` })}
        </div>
        <div class="grid g-3-2" style="grid-template-columns:minmax(0,3fr) minmax(0,2fr)">
          ${UI.card('Recommended Actions', `<div class="grid g4" style="margin:0;gap:10px">${acts.map(a => `<div class="click" ${a.go ? `data-go="${a.go}"` : `data-act="${a.act}"`} style="display:flex;gap:10px;align-items:flex-start;padding:11px 12px;border:1px solid var(--line);border-radius:8px;cursor:pointer;background:var(--card)"><span style="flex:none;font-size:26px;line-height:1;color:${VQ.Map.TONE[a.tone]};display:inline-flex">${I(a.icon)}</span><div style="min-width:0"><div class="b ink" style="font-size:13px">${a.title}</div><div class="small t2" style="margin-top:2px">${a.sub}</div></div></div>`).join('')}</div><div class="card-note mt">Ranked by minutes of delay avoided. Select an action to send it or to open the detail behind it.</div>`)}
          ${UI.card('Key Insights', `<div style="display:flex;gap:12px;align-items:flex-start"><span style="flex:none;font-size:28px;line-height:1;color:var(--warn);display:inline-flex">${I('bulb')}</span><ul style="margin:0;padding-left:18px;font-size:12.5px;line-height:1.65;color:var(--text)">
            <li>Travel time is ${Math.round(EXTRA / NORMAL * 100)}% above normal (${hm(CURRENT)} against ${hm(NORMAL)}), mainly the <a data-go="${impactGo('INC-2040')}">Km 84.5 accident</a> and the <a data-go="toll/queue">Raikal toll queue</a>.</li>
            <li>The accident queue is expected to peak at ${acc.peakAt} at ${acc.peakQueue} km, then clear by ${acc.flowBack}.</li>
            <li>Keep the Shadnagar – Mahbubnagar diversion ready; send a second patrol to the queue tail at Km 79.7.</li>
            <li>Rain may slow traffic further on Km 425 – 470; water at <a data-go="${impactGo('INC-2038')}">Km 441</a> is 22 cm and rising.</li></ul></div>`)}
        </div>`;
      } },

      /* ---------- Travel time ---------- */
      travel: { title: 'Travel Time', sub: `${D.from} to ${D.to} now takes ${hm(CURRENT)}, ${EXTRA} minutes more than normal. Where the time goes and why.`, render: () => {
        const labels = times(300, 720, 15), nowI = labels.indexOf('08:45');
        const actual = [431, 430, 432, 431, 433, 434, 438, 442, 443, 445, 449, 454, 461, 470, 484, CURRENT];
        const fc = [CURRENT, 510, 515, 516, 511, 500, 488, 478, 470, 463, 457, 453, 450, 448];
        const sec = (a, b) => D.sections.filter(s => s.from >= a && s.to <= b);
        const od = [['Hyderabad', 'Jadcherla', 0, 85, 'INC-2040'], ['Hyderabad', 'Kurnool', 0, 212, 'INC-2040'], ['Hyderabad', 'Anantapur', 0, 360, 'INC-2040'], ['Kurnool', 'Anantapur', 212, 360, 'INC-2036'], ['Kurnool', 'Bengaluru', 212, 570, 'INC-2038'], ['Anantapur', 'Bengaluru', 360, 570, 'INC-2038'], ['Hyderabad', 'Bengaluru', 0, 570, 'INC-2040']]
          .map(([a, b, f, t, id]) => { const ss = sec(f, t), cur = sum(ss.map(s => s.current)), nor = sum(ss.map(s => s.normal)); return { pair: `${a} – ${b}`, dist: t - f, cur, nor, id, total: t - f === D.km }; });
        return `<div class="grid g-1-2">
          ${UI.card('Travel time by section, now and normal', C.bars({ h: 224, twoLine: 1, unit: 'min', yMax: 200, labels: D.sections.map(s => s.name.replace(' – ', ' –|')), series: [{ name: 'Now (minutes)', data: D.sections.map(s => s.current) }, { name: 'Normal (minutes)', color: 'var(--axis)', data: D.sections.map(s => s.normal) }] }) + `<div class="card-note">Hyderabad – Jadcherla is ${Math.round((D.sections[0].current / D.sections[0].normal - 1) * 100)}% slower than normal, the worst of the four sections.</div>`)}
          ${UI.card('Whole-corridor travel time this morning', C.line({ h: 224, labels, xTicks: 8, yMin: 400, yMax: 540, yTicks: 4, unit: 'min', yTitle: 'Minutes, Hyderabad to Bengaluru', series: [{ name: 'Measured', data: [...actual, ...Array(labels.length - actual.length).fill(null)] }, { name: 'Forecast', dash: 1, data: [...Array(nowI).fill(null), ...fc] }], mark: { i: nowI, label: `Now ${hm(CURRENT)}`, color: 'var(--s1)' }, limit: { v: NORMAL, label: `Normal ${hm(NORMAL)} (${NORMAL} min)` } }) + `<div class="card-note">Forecast peaks near 8 h 36 m at 09:30 as the accident and waterlogging queues top out, then falls to about ${hm(448)} by noon. Roadworks at Km 268 keep it above normal until 04:00 PM.</div>`)}
        </div>
        <div class="grid g-5-3">
          ${UI.card('Travel time between main towns', UI.table([{ k: 'pair', label: 'From – to', fmt: (v, r) => r.total ? v : `<b class="ink">${v}</b>` }, { k: 'dist', label: 'Distance', fmt: v => v + ' km' }, { k: 'cur', label: 'Current', fmt: v => `<b class="ink">${hm(v)}</b>` }, { k: 'nor', label: 'Normal', fmt: v => hm(v) }, { k: 'x', label: 'Delay', fmt: (_, r) => up(`${delayTxt(r.cur - r.nor)} (${Math.round((r.cur / r.nor - 1) * 100)}%)`) },
            { k: 'id', label: 'Main cause', fmt: v => { const i = inc(v); return `<a data-go="${impactGo(v)}" class="row" style="gap:6px;cursor:pointer"><span style="color:${VQ.Map.TONE[i.sev === 'high' ? 'crit' : tTone(i)]};display:inline-flex;width:16px;height:16px">${I(tIcon(i))}</span>${i.title.split(' · ')[0]}, ${D.kmLabel(i.km)}</a>`; } }], od) + `<div class="card-note mt">Times are measured between cameras from vehicles matched at both ends over the last 15 minutes, southbound.</div>`)}
          ${UI.card(`What is adding the ${EXTRA} minutes`, C.hbars({ unit: 'min', items: CAUSES.map(c => { const i = c.id && inc(c.id); return { label: c.label, value: c.min, text: c.min + ' m', icon: i ? tIcon(i) : c.icon, go: c.go || impactGo(c.id), note: c.note || `${i.status}. Back to normal: ${i.impact.flowBack}` }; }) }) + `<div class="card-note mt">Minutes added to a through trip from Hyderabad to Bengaluru, by cause. Select a bar to open the incident. Clearing the Km 84.5 accident alone returns ${CAUSES[0].min} of the ${EXTRA} minutes.</div>`)}
        </div>`;
      } },

      /* ---------- Speed heatmap ---------- */
      heatmap: { title: 'Speed Heatmap', sub: 'Speed along the corridor over time. Find where a slowdown began and how far it has spread.', render: () => {
        const { rows, values } = heatGrid();
        const slow = [...D.speedSegments].filter(s => s.state !== 'free').sort((a, b) => a.speed - b.speed).slice(0, 7).map(s => { const i = D.incidents.find(x => x.km >= s.from - .5 && x.km <= s.to + .5 && x.impact.trend !== 'Cleared'); const cls = s.speed >= 60 ? ['Moderate', 'warn'] : s.speed >= 40 ? ['Slow', 'serious'] : ['Congested', 'crit'];
          return { icon: i ? tIcon(i) : s.note === 'Heavy rain' ? 'rain' : 'car', tone: cls[1], title: `Km ${s.from} – ${s.to}`, sub: s.note, sub2: i ? `${i.id} · ${i.at}` : `Near ${D.nearest((s.from + s.to) / 2)} · no incident`, meta: `<b class="ink">${s.speed} km/h</b>`, pill: UI.pill(cls[0], cls[1]), go: i ? impactGo(i.id) : s.note === 'Heavy rain' ? impactGo('INC-2038') : null }; });
        return `<style>.tq-heat .heat .hc{height:25px}.tq-ins .insight{margin:0}</style><div class="grid g-3-1">
          <div class="col">${UI.card('Speed by stretch and time, southbound (06:00 – 08:45 AM)', `<div class="tq-heat">${C.heat({ rows: rows.map(r => r.label), cols: H_COLS, values, unit: 'km/h', color: v => C.speedColor(v) })}</div>` + `<div class="row between wrap mt" style="gap:8px">${speedLegend}<span class="small muted">Hyderabad at the top, Bengaluru at the bottom</span></div>
            <div class="card-note mt">How to read it: each row is a 30 km stretch, each column a 15-minute period, and the colour is the slowest speed measured inside that stretch. A colour change that starts in one column and stays marks when an incident began; the same colour spreading to the row above means the queue is growing back towards Hyderabad.</div>`)}
            ${UI.card('What the grid shows today', `<div class="grid g3 tq-ins" style="margin:0;gap:10px;align-items:stretch">` + UI.insight('alert', 'crit', 'Km 60 – 90 turned red at 08:30', 'The Km 84.5 accident. The stretch was in free flow until then.', impactGo('INC-2040')) + UI.insight('rain', 'violet', 'Km 420 – 450 slowed from 08:15', 'Rain from 07:45, then waterlogging at Km 441.', impactGo('INC-2038')) + UI.insight('fog', 'good', 'Km 510 – 570 is easing', 'Fog was thickest at 06:45 and clears by 09:15 AM.', impactGo('INC-2030')) + '</div>')}
          </div>
          ${UI.card('Slowest stretches now', UI.list(slow) + `<div class="card-note mt">Speeds are 5-minute averages from the corridor cameras, southbound. Free flow on this corridor is 85 to 95 km/h.</div>`, { right: `<span class="small">${D.now}</span>` })}
          </div>`;
      } },

      /* ---------- Congestion forecast ---------- */
      forecast: { title: 'Congestion Forecast', sub: 'Next 3 hours: where queues will grow, when they peak and what to do before they do.', render: () => {
        const ids = ['INC-2040', 'INC-2038', 'INC-2039', 'INC-2036', 'INC-2037', 'INC-2035'];
        const rows = ids.map(id => { const i = inc(id); return { i, id, loc: `${D.kmLabel(i.km)} · ${i.near.replace(/^Near /, '')}`, go: impactGo(id) }; });
        const name = i => `${SHORT[i.id]}, ${D.kmLabel(i.km)}`;
        const opt = (title, pill, facts, tone) => `<div style="border:1px solid var(--line);border-radius:8px;padding:11px 12px;${tone ? 'background:var(--blue-50)' : ''}"><div class="row between mb"><b class="ink">${title}</b>${pill}</div>${UI.kv(facts)}</div>`;
        return `<div class="grid g2">
          ${UI.card('Forecast queue length at the four largest bottlenecks', C.line({ h: 250, labels: F_LABELS, xTicks: 7, yMin: 0, yMax: 8, unit: 'km', yTitle: 'Queue length (km)', series: ids.slice(0, 4).map(id => ({ name: name(inc(id)), data: QUEUES[id] })), mark: { i: PEAK_I, label: `Accident queue peaks ${acc.peakQueue} km at ${acc.peakAt}` } }) + `<div class="card-note">Three of the four queues peak between 09:10 and 09:30 AM. The waterlogging queue lasts longest because it depends on the rain, not on a recovery vehicle.</div>`)}
          <div class="card flush">${VQ.Map.render({ h: 330, range: [36, 104], focus: 84.5, kmTicks: 20, highlight: [79.7, 84.5], legend: `<div style="display:flex;gap:6px 14px;flex-wrap:wrap;align-items:center"><b style="margin:0">Speed (km/h)</b>${[['free', '&gt; 80'], ['moderate', '60 – 80'], ['slow', '40 – 60'], ['congested', '&lt; 40']].map(([k, l]) => `<span><i style="background:${VQ.Map.SPEED[k]}"></i>${l}</span>`).join('')}</div>`, pins: [
            { ...D.incPin(inc('INC-2040')), go: impactGo('INC-2040'), callout: { title: `Queue ${acc.queue} km, Km 79.7 – 84.5`, lines: [`Forecast ${acc.peakQueue} km at ${acc.peakAt}`], tone: 'crit', dx: 30 } },
            { type: 'asset', km: 48, icon: 'route', tone: 'good', tip: '<b>Diversion start</b><br>Shadnagar exit, Km 48', callout: { title: 'Diversion leaves NH-44', lines: ['Shadnagar, Km 48 · rejoins at Km 92'], dx: -30 } },
            { type: 'asset', km: 92, icon: 'route', tone: 'good', below: 1, tip: '<b>Diversion rejoins NH-44</b><br>Km 92, after Jadcherla' }] })}</div>
        </div>
        ${UI.card('Predicted bottlenecks, 08:45 to 11:45 AM', UI.table([{ k: 'loc', label: 'Location', fmt: v => `<b class="ink">${v}</b>` }, { k: 'i', label: 'Cause', fmt: i => `<span class="row" style="gap:6px"><span style="color:${VQ.Map.TONE[i.sev === 'high' ? 'crit' : tTone(i)]};display:inline-flex;width:16px;height:16px">${I(tIcon(i))}</span>${SHORT[i.id]}</span>` }, { k: 'q', label: 'Queue now', fmt: (_, r) => r.i.impact.queue + ' km' }, { k: 'p', label: 'Predicted peak', fmt: (_, r) => `<b class="ink">${r.i.impact.peakQueue.toFixed(1)} km</b>` }, { k: 't', label: 'Peak time', fmt: (_, r) => `<span style="white-space:nowrap">${r.i.impact.peakAt}</span>` }, { k: 'f', label: 'Normal flow by', fmt: (_, r) => r.i.impact.flowBack }, { k: 'c', label: 'Confidence', fmt: (_, r) => `${r.i.ai.confidence}%` }, { k: 'a', label: 'Recommended action', fmt: (_, r) => { const a = r.i.actions.find(x => !/^Open/.test(x.title)) || r.i.actions[0]; return `${a.title} <span class="muted">· ${a.sub}</span>`; } }, { k: 'y', label: '', fmt: () => `<span class="li-chev">${I('chev')}</span>` }], rows), { cls: 'mb' })}
        <div class="grid g-5-3">
          ${UI.card('Diversion options for the Km 84.5 accident', `<div class="small t2 mb">Shadnagar (Km 48) to the rejoin point at Km 92, southbound.</div><div class="grid g2" style="margin:0 0 12px;gap:12px">
            ${opt('Stay on NH-44', UI.pill('Recommended now', 'good'), [['ruler', 'Distance', '44 km'], ['clock', 'Time now', '58 min (normal 30)'], ['trend', `Time at ${acc.peakAt} peak`, '72 min'], ['alert', 'Risk', 'Secondary collision at the queue tail']], 1)}
            ${opt('Divert via Shadnagar – Mahbubnagar road', UI.pill('Plan armed', 'info'), [['ruler', 'Distance', '58 km (+14 km)'], ['clock', 'Time now', '62 min'], ['trend', `Time at ${acc.peakAt} peak`, '64 min (saves 8 min)'], ['truck', 'Limits', 'Two-lane road, Mahbubnagar town; light vehicles only']])}</div>
            ${UI.insight('sparkles', 'violet', 'Recommendation', `The diversion is 4 minutes slower now and only pays off near the peak. Keep traffic on NH-44, keep the plan armed, and activate it for light vehicles if the queue passes 10 km or the heavy tow is not on site by 09:05 AM. Forecast peak is ${acc.peakQueue} km, so activation is unlikely to be needed.`)}
            <div class="row mt" style="gap:10px">${UI.btn('Activate Diversion Plan', { primary: 1, icon: 'route', toast: 'Diversion via Shadnagar – Mahbubnagar road activated. VMS at Km 40 and Km 46 updated (demo)', done: 'Activated' })}${UI.btn('Open incident impact', { icon: 'trend', go: impactGo('INC-2040') })}</div>`, { icon: 'route' })}
          ${UI.card('Diversions and traffic management in place', UI.list([
            { icon: 'cone', tone: 'serious', title: 'Contraflow at Km 268 roadworks', sub: 'Km 267.4 – 268.6 · one lane each way on the NB carriageway', sub2: 'Until 04:00 PM · adds 8 to 10 min', pill: UI.pill('Active', 'good'), go: impactGo('INC-2035') },
            { icon: 'route', tone: 'violet', title: 'Light-vehicle diversion at Km 441', sub: 'Via Penukonda town road, +9 min · trucks stay on NH-44', sub2: 'Triggers if water depth passes 30 cm (forecast 09:15 AM)', pill: UI.pill('Proposed', 'warn'), go: impactGo('INC-2038') },
            { icon: 'route', tone: 'crit', title: 'Shadnagar – Mahbubnagar diversion', sub: 'Km 48 to Km 92, +14 km · for the Km 84.5 accident', sub2: 'Signed route checked 08:41 AM', pill: UI.pill('Armed', 'info'), go: impactGo('INC-2040') },
            { icon: 'toll', tone: 'info', title: 'Raikal plaza lane re-allocation', sub: 'Switch Cash Lane 5 to FASTag · cuts wait by ~4 min', sub2: 'Awaiting plaza supervisor', pill: UI.pill('Proposed', 'warn'), go: 'toll/queue' },
          ]) + `<div class="mt" style="border-top:1px solid var(--line);padding-top:12px">${UI.statRow([['1', 'Active', 'good'], ['1', 'Armed, ready to activate', 'blue'], ['2', 'Proposed, awaiting approval', 'warn']])}</div>`)}
        </div>`;
      } },

      /* ---------- Corridor performance (30 days) ---------- */
      performance: { title: 'Corridor Performance', sub: 'Last 30 days, 18 Aug to 16 Sep 2026. How fast, how reliable and what caused the delay.', filters: () => UI.sel('NH-44') + UI.sel('Entire Corridor') + UI.sel('Last 30 days'), render: () => {
        const day0 = Date.UTC(2026, 7, 18), days = Array.from({ length: 30 }, (_, k) => { const d = new Date(day0 + k * 864e5); return { lab: `${d.getUTCDate()} ${['Aug', 'Sep'][d.getUTCMonth() - 7]}`, dow: d.getUTCDay() }; });
        const r = VQ.rng(23), spikes = { 5: 22, 13: 34, 14: 18, 21: 27, 29: 24 }; /* rain days and today */
        const daily = days.map((d, k) => Math.round(440 + (d.dow === 0 ? -6 : d.dow === 6 ? 4 : d.dow === 5 ? 9 : d.dow === 1 ? 7 : 2) + (r() - .5) * 8 + (spikes[k] || 0))).map((v, k) => k >= 25 ? Math.max(v, 443) : v);
        const sp = s => Math.round((s.to - s.from) / s.current * 60);
        const causes = [['Accidents and collisions', 12800], ['Toll plaza queues', 8200], ['Roadworks', 6900], ['Breakdowns and stranded HGVs', 5600], ['Weather (rain, fog, flooding)', 4900], ['Other', 2800]];
        return UI.kpis([
          { icon: 'gauge', bg: 'bg-info', value: 76, unit: 'km/h', label: 'Average Speed (30 days)', delta: { dir: 'up', value: '+2%', text: 'vs. previous 30 days', good: true } },
          { icon: 'clock', bg: 'bg-serious', value: hm(488), label: '95th Percentile Travel Time', delta: { dir: 'down', value: '−9 m', text: 'vs. previous 30 days', good: true }, tip: 'On 19 trips out of 20 the corridor took less than this. Buffer over the normal 7 h 10 m: 13%.' },
          { icon: 'users', bg: 'bg-crit', value: '41,200', unit: 'veh-h', label: 'Vehicle-Hours of Delay', delta: { dir: 'down', value: '−6%', text: 'vs. previous 30 days', good: true } },
          { icon: 'checkc', bg: 'bg-good', value: '71%', label: 'Time in Free Flow (&gt; 80 km/h)', delta: { dir: 'up', value: '+3 pts', text: 'vs. previous 30 days', good: true } },
        ], 'g4') + `<div class="grid g-2-1">
          ${UI.card('Daily average travel time, Hyderabad to Bengaluru', C.line({ h: 230, labels: days.map(d => d.lab), xTicks: 8, yMin: 400, yMax: 500, unit: 'min', yTitle: 'Minutes', series: [{ name: 'Daily average', data: daily }], limit: { v: NORMAL, label: `Normal ${NORMAL} min` }, mark: { i: 29, label: 'Today, so far', color: 'var(--s1)' } }) + `<div class="card-note">A typical day runs 10 to 15 minutes over normal. The four spikes are heavy-rain days (23 and 31 Aug, 1 and 8 Sep); 31 Aug also had a full closure at Gooty ghat for 50 minutes.</div>`)}
          ${UI.card('Delay by cause (vehicle-hours, 30 days)', C.donut({ size: 150, thick: 22, unit: 'veh-h', center: { v: '41.2k', l: 'vehicle-hours' }, items: causes.map(([label, value]) => ({ label, value, text: VQ.fmt(value) })) }) + `<div class="card-note mt">Accidents are 31% of all delay. Two hotspots, Jadcherla merge and Gooty ghat, produce over a third of it.</div>`, { right: `<a data-go="incidents/hotspots">Hotspots</a>` })}
        </div>
        <div class="grid g2">
          ${UI.card('Average speed by section', C.bars({ h: 214, twoLine: 1, unit: 'km/h', yMax: 100, labels: D.sections.map(s => s.name.replace(' – ', ' –|')), series: [{ name: '30-day average (km/h)', data: [74, 78, 77, 75] }, { name: `Today at ${D.now} (km/h)`, color: 'var(--s2)', data: D.sections.map(sp) }] }) + `<div class="card-note">Hyderabad – Jadcherla is the slowest section on a normal day and the hardest hit today: ${sp(D.sections[0])} km/h against a 74 km/h average.</div>`)}
          ${UI.card('What changed in the last 30 days', UI.insight('trend', 'good', 'Reliability improved', `95th percentile travel time fell 9 minutes to ${hm(488)} after the Pullur plaza added a fifth FASTag lane on 28 Aug.`) + UI.insight('alert', 'crit', 'Jadcherla merge is still the top delay source', '9 incidents in 90 days at Km 82 – 86, 7 of them in the morning peak. Today’s accident is the latest.', 'incidents/hotspots') + UI.insight('truck', 'warn', 'Gooty ghat breakdowns cost 3,100 vehicle-hours', '11 stranded heavy vehicles on the 4.2% climb; recovery averages 78 minutes because the crane comes from Gooty yard.', impactGo('INC-2036')) + UI.insight('rain', 'violet', 'Rain days add 25 minutes on average', 'Most of it between Km 425 and 470. The Km 441 side drain is still blocked (ticket MT-5127).', impactGo('INC-2038')), { icon: 'sparkles' })}
        </div>`;
      } },
    },
  });
})();
