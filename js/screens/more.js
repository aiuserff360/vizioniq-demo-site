/* =========================================================
   Screens · Use Cases, Analytics & Insights, Reports, Administration
   ========================================================= */
(() => {
  const { UI, C, data: D, I } = VQ;
  const secH = (icon, title, right) => `<div class="row between" style="margin:18px 0 10px"><div class="row" style="gap:9px"><span style="color:var(--blue);display:inline-flex;width:19px;height:19px">${I(icon)}</span><h3 style="font-size:16px">${title}</h3></div>${right ? `<span class="small t2">${right}</span>` : ''}</div>`;
  const chips = list => `<span class="row wrap" style="gap:4px">${list.map(c => UI.pill(c, 'gray')).join('')}</span>`;
  const toggle = on => `<span data-act="Rule ${on ? 'disabled' : 'enabled'} (demo only, not saved)" style="display:inline-block;width:34px;height:19px;border-radius:10px;background:var(--${on ? 'good' : 'muted'});position:relative;cursor:pointer;vertical-align:middle" title="${on ? 'Enabled' : 'Disabled'}"><i style="position:absolute;top:2px;left:${on ? 17 : 2}px;width:15px;height:15px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25)"></i></span> <span class="small t2">${on ? 'On' : 'Off'}</span>`;

  /* =======================================================
     1. USE CASES
     ======================================================= */
  const GROUPS = [['safety', 'Real-time safety events', 'alert', 'crit'], ['traffic', 'Traffic and prediction', 'trend', 'info'], ['toll', 'Toll and revenue', 'rupee', 'violet'], ['response', 'Response and coordination', 'users', 'serious'], ['assets', 'Assets and weather', 'wrench', 'warn'], ['pattern', 'Pattern intelligence', 'crosshair', 'good']];
  const U = (n, name, icon, group, desc, go) => ({ n, name, icon, group, desc, go });
  const USECASES = [
    U(1, 'Wrong-Way Vehicle', 'ban', 'safety', 'Shows where a wrong-way vehicle is, how fast it is moving, which oncoming vehicles are at risk and where to intercept it.', 'incident/INC-2033'),
    U(2, 'Accident / Collision', 'alert', 'safety', 'Shows the vehicles involved, lanes blocked, how the queue is spreading and which responders are closest.', 'incident/INC-2040'),
    U(3, 'Queue Prediction', 'trend', 'traffic', 'Predicts how long a queue will get, when it will form, the travel-time cost and the diversion options.', 'traffic/forecast'),
    U(4, 'Toll Leakage', 'rupee', 'toll', 'Compares the vehicle class the camera saw with the class that was charged and estimates the revenue lost.', 'toll/leakage'),
    U(5, 'Flooding / Waterlogging', 'rain', 'safety', 'Shows where water is standing, how deep and how fast it is rising, and when to close a lane or divert.', 'incident/INC-2038'),
    U(6, 'Stalled / Broken-Down Vehicle', 'car', 'safety', 'Shows the stalled vehicle, its exact lane position, how long it has been stationary and the nearest tow.', 'incident/INC-2039'),
    U(7, 'Debris / Obstruction on Road', 'octagon', 'safety', 'Identifies the object, its size and lane, how fast traffic is approaching it and which crew can clear it.', 'incident/INC-2034'),
    U(8, 'Pedestrian on Highway', 'walk', 'safety', 'Tracks a person on the carriageway, the vehicles approaching and the likely conflict zone for a patrol to cover.', 'incident/INC-2031'),
    U(9, 'Animal Intrusion', 'paw', 'safety', 'Classifies animals on the road, their movement and the collision risk, and recommends a warning or patrol.', 'incident/INC-2032'),
    U(10, 'Overspeeding Vehicle', 'gauge', 'safety', 'Flags a single vehicle far above the posted limit, the junction or curve it is heading for and the enforcement alert.'),
    U(11, 'Unsafe Lane Weaving', 'route', 'safety', 'Follows a vehicle changing lanes repeatedly, the vehicles it cuts across and whether the behaviour persists.'),
    U(12, 'Sudden Braking / Near Miss', 'zap', 'safety', 'Captures a near miss with the trajectories, speed drop and minimum gap, and saves the evidence clip.'),
    U(13, 'High-Risk Stopped Vehicle', 'eye', 'safety', 'Flags a vehicle stopped on a curve, bridge or merge where sight distance is short, and recommends an upstream warning.'),
    U(14, 'Lane Blockage', 'barrier', 'safety', 'Shows which lane is blocked and why, the capacity left, the predicted queue and the expected clearance time.'),
    U(15, 'Lane Closure Impact', 'cone', 'traffic', 'Tests a closure against demand: predicted queue, extra journey time and alternative traffic-management plans.', 'incident/INC-2035'),
    U(16, 'Toll Plaza Queue', 'toll', 'toll', 'Shows queues and processing rate lane by lane, the predicted wait and the lane allocation that would cut it.', 'toll/queue'),
    U(17, 'Abnormal Toll Transaction', 'tag', 'toll', 'Puts the vehicle image beside the transaction so an auditor can confirm a class mismatch and see if it recurs.', 'toll/review'),
    U(18, 'Repeated Toll Leakage Pattern', 'search', 'toll', 'Groups discrepancies by lane, shift and vehicle class to show where leakage concentrates and what to investigate first.', 'toll/patterns'),
    U(19, 'Emergency Vehicle Delay', 'ambulance', 'response', 'Tracks an ambulance or patrol against the congestion ahead of it, the ETA and a possible priority route.', 'incident/INC-2040/response'),
    U(20, 'Responder ETA Risk', 'clock', 'response', 'Compares each assigned responder\'s expected arrival with the target and offers escalation options when one will be late.', 'incidents/response'),
    U(21, 'Incident Clearance Delay', 'flag', 'response', 'Breaks clearance into detect, dispatch, arrive and recover, and shows which step is running behind.', 'incidents/response'),
    U(22, 'Roadworks / Work-Zone Risk', 'cone', 'safety', 'Watches a work zone for fast entries, workers outside the cone line and queue build-up.', 'incident/INC-2035'),
    U(23, 'Barrier / Guardrail Damage', 'barrier', 'assets', 'Shows the damaged barrier, its severity and traffic exposure, and recommends a work order priority.', 'assets/alerts'),
    U(24, 'Signage / VMS Failure', 'sign', 'assets', 'Compares what a sign should show with what it is showing, and says which live situation that affects.', 'assets/alerts'),
    U(25, 'Road Surface / Pothole Alert', 'road', 'assets', 'Locates a surface defect, its extent and lane, how many vehicles hit it and whether it keeps coming back.'),
    U(26, 'Low Visibility Event', 'fog', 'assets', 'Shows the stretch affected by fog, estimated visibility, the spread of vehicle speeds and the VMS speed advice.', 'incident/INC-2030'),
    U(27, 'Heavy Rain / Weather Impact', 'cloud', 'assets', 'Links rainfall to falling speeds and waterlogging signs, and predicts the disruption over the next hours.', 'incident/INC-2038/impact'),
    U(28, 'Stranded Heavy Vehicle', 'truck', 'safety', 'Shows the heavy vehicle, its load and gradient, how hard recovery will be and the right crane to send first.', 'incident/INC-2036'),
    U(29, 'Over-Dimensional Vehicle', 'ruler', 'safety', 'Flags an oversize load, the structures ahead it may not clear and who needs to be told.'),
    U(30, 'Hazardous / Fallen Load', 'box', 'safety', 'Maps a spilled load, the lanes covered and the possible hazard class, and recommends containment.'),
    U(31, 'Vehicle Fire / Smoke Detection', 'flame', 'safety', 'Spots smoke or flame on a vehicle, tracks how fast it is growing and recommends the isolation zone.', 'incident/INC-2041'),
    U(32, 'Traffic Flow Breakdown', 'pulse', 'traffic', 'Finds the point where flow breaks down, the conditions up and downstream, and how far congestion will spread.', 'traffic/travel'),
    U(33, 'Unusual Traffic Surge', 'up', 'traffic', 'Compares current volume with the normal baseline, finds the source and predicts how long the surge lasts.'),
    U(34, 'Holiday / Event Traffic Prediction', 'cal', 'traffic', 'Forecasts festival and event demand, likely bottlenecks and peak hours, with a resource plan.'),
    U(35, 'Travel-Time Anomaly', 'clock', 'traffic', 'Shows corridor travel time against normal, which segment is causing the gap and what to tell travellers.', 'traffic/travel'),
    U(36, 'Recurring Accident Hotspot', 'crosshair', 'pattern', 'Ranks locations where accidents repeat, with the time pattern, common factors and candidate fixes.', 'incidents/hotspots'),
    U(37, 'Near-Miss Hotspot', 'zap', 'pattern', 'Finds places with repeated hard braking before a collision happens, and what is causing it.', 'analytics/safety'),
    U(38, 'Overspeeding Hotspot', 'gauge', 'pattern', 'Shows the speed distribution on a stretch, the share above the limit, when it happens and how to curb it.', 'analytics/safety'),
    U(39, 'Corridor Bottleneck Intelligence', 'filter', 'pattern', 'Ranks recurring congestion points by demand against capacity and journey time lost, with interventions.', 'analytics/bottlenecks'),
    U(40, 'Asset Failure Impact', 'videooff', 'assets', 'Shows what coverage and which use cases are lost when a camera, sign or sensor fails, and the repair priority.', 'assets/alerts'),
    U(41, 'Camera / Sensor Health Alert', 'video', 'assets', 'Reports feed status and image quality per device, the analytics that depend on it and the probable fault.', 'assets/alerts'),
    U(42, 'Recurring Incident Pattern', 'layers', 'pattern', 'Groups similar incidents by place, time, vehicle type and weather to reveal an emerging pattern.', 'incidents/hotspots'),
    U(43, 'Freight / Heavy-Vehicle Congestion', 'truck', 'pattern', 'Shows where heavy vehicles concentrate, the car-to-truck speed gap and the travel-time cost.', 'analytics/bottlenecks'),
    U(44, 'Abnormal Vehicle Stop Pattern', 'mappin', 'pattern', 'Finds places where vehicles keep stopping, for how long and when, and suggests what to investigate.'),
    U(45, 'Diversion Effectiveness', 'route', 'traffic', 'Measures how many vehicles took a diversion, the time they saved and whether to continue, change or end it.', 'traffic/forecast'),
    U(46, 'Secondary Incident Risk', 'shield', 'traffic', 'Shows the risk of a second collision at the back of an incident queue and where to warn drivers.', 'incident/INC-2040/impact'),
    U(47, 'Queue-Tail Risk', 'arrow', 'traffic', 'Tracks the moving end of a queue, approach speeds and sight distance, and times the VMS or patrol warning.', 'incident/INC-2040/impact'),
    U(48, 'Incident Severity Escalation', 'flame', 'response', 'Re-grades an incident as the scene changes and recommends the extra response it now needs.', 'incident/INC-2041'),
    U(49, 'Multi-Incident Corridor Situation', 'net', 'response', 'Puts simultaneous incidents together: combined capacity loss, interacting queues and responder availability.', 'analytics/health'),
    U(50, 'Corridor Health / Command View', 'pulse', 'response', 'One score for the corridor from safety, congestion, toll, assets and response, with the top interventions.', 'analytics/health'),
  ];
  const ucCard = (u, g) => `<div class="card uc ${u.go ? 'click' : ''}" ${u.go ? `data-go="${u.go}"` : ''}>
      <div class="top"><div class="li-ic tone-${u.go ? g[3] : 'gray'}">${I(u.icon)}</div><div style="min-width:0"><div class="n">USE CASE ${String(u.n).padStart(2, '0')}</div><h4>${u.name}</h4></div></div>
      <p>${u.desc}</p>
      <div class="foot">${UI.pill(g[1], u.go ? g[3] : 'gray')}${u.go ? `<a data-go="${u.go}" class="b row" style="gap:3px;white-space:nowrap">Live example<span style="display:inline-flex;width:13px;height:13px">${I('chev')}</span></a>` : '<span class="muted" style="white-space:nowrap">Planned</span>'}</div></div>`;

  VQ.screen('usecases', {
    title: 'Use Cases', sub: 'Fifty ways VizionIQ turns camera feeds into decisions.',
    views: { main: { render: () => {
      const f = VQ.state.ucf || 'all', live = USECASES.filter(u => u.go).length;
      const show = u => f === 'all' || (f === 'live') === !!u.go;
      const groups = GROUPS.map(g => { const all = USECASES.filter(u => u.group === g[0]), vis = all.filter(show); if (!vis.length) return '';
        return secH(g[2], g[1], `${vis.length} of ${all.length} shown · ${all.filter(u => u.go).length} live in this demo`) + `<div class="uc-grid">${vis.map(u => ucCard(u, g)).join('')}</div>`; }).join('');
      return `<div class="grid g-2-1" style="align-items:stretch">
          ${UI.card('', UI.statRow([[USECASES.length, 'Use cases in the catalogue'], [live, 'Live in this demo', 'good-ink'], [USECASES.length - live, 'Planned', 'text-2'], [GROUPS.length, 'Groups']]))}
          ${UI.card('', `<div class="row between wrap" style="gap:10px;height:100%"><div class="card-note" style="flex:1;min-width:180px">Every use case has its own intelligence story, not just a camera alert. Open a live example to see it on today's corridor.</div>${UI.seg('ucf', [['all', 'All ' + USECASES.length], ['live', 'Live in this demo'], ['planned', 'Planned']], f)}</div>`)}
        </div>${groups}<div class="mb"></div>`;
    } } },
  });

  /* =======================================================
     2. ANALYTICS & INSIGHTS
     ======================================================= */
  const HS_X = { 'HS-01': { when: '07:30 – 09:30 AM', mix: [3, 5, 1] }, 'HS-02': { when: '08:00 AM – 12:00 PM, hot days', mix: [1, 7, 3] }, 'HS-03': { when: 'Within 30 min of heavy rain', mix: [2, 3, 1] }, 'HS-04': { when: '06:30 – 08:30 AM', mix: [4, 1, 0] }, 'HS-05': { when: '06:30 – 08:00 AM', mix: [0, 6, 2] } };
  const mixBar = m => { const t = m[0] + m[1] + m[2], col = ['crit', 'warn', 'good']; return `<span class="row" style="gap:8px;white-space:nowrap" data-tip="<b>${m[0]}</b> high · <b>${m[1]}</b> medium · <b>${m[2]}</b> low"><span style="display:inline-flex;width:72px;height:8px;border-radius:4px;overflow:hidden;gap:1px">${m.map((v, k) => v ? `<i style="width:${v / t * 100}%;background:var(--${col[k]})"></i>` : '').join('')}</span><span class="small t2">${m[0]} high · ${m[1]} med · ${m[2]} low</span></span>`; };
  const NEAR_MISS = [['Jadcherla merge (Km 82–86)', 41, 'incident/INC-2040/rootcause'], ['Devanahalli (Km 530–548)', 19, 'incident/INC-2030'], ['Dhone works (Km 262–270)', 16, 'incident/INC-2035'], ['Gooty belt (Km 318–324)', 12, 'incident/INC-2032'], ['Raikal plaza (Km 52–58)', 11, 'toll/queue'], ['Chikkaballapur (Km 510–514)', 9, 'incident/INC-2031']];
  const SPEED_BINS = ['50', '60', '70', '80', '90', '100', '110', '120', '130+'], SPEED_SHARE = [3, 8, 17, 25, 24, 13, 6, 3, 1]; /* above 100 km/h: 13 + 6 + 3 + 1 = 23% */
  const OVER_PCT = SPEED_SHARE.slice(5).reduce((a, b) => a + b, 0);

  const gauss = (h, c, w) => Math.exp(-(((h - c) / w) ** 2));
  const prof = (base, am, amH, amW, pm, pmH, pmW) => Array.from({ length: 24 }, (_, h) => Math.round((base + am * gauss(h, amH, amW) + pm * gauss(h, pmH, pmW)) / 10) * 10);
  const BN = [
    { id: 'raikal', short: 'Raikal', name: 'Raikal toll plaza', km: 'Km 58', kind: 'Toll plaza', periods: '07:30 – 10:00 AM, 05:30 – 07:30 PM', days: '6 of 7', queue: '1.6 km', loss: 1240, go: 'toll/queue', demand: prof(700, 2250, 8.5, 2.2, 2100, 18.5, 2.4), cap: Array(24).fill(2660), capNote: 'Six SB lanes at 7.4 vehicles a minute each handle about 2,660 vehicles an hour. Demand passes that in both peaks, so the queue is a lane-allocation problem, not a road problem.',
      why: [['toll', 'Lane allocation does not follow demand', '78% of vehicles use FASTag but only 4 of 6 lanes accept it'], ['truck', 'Freight released together', 'Trucks held overnight at the Shadnagar lay-by arrive in one wave at 08:00'], ['wrench', 'Lane 3 tag reader degraded', 'Read retries up 3× since 07:50 AM']],
      fix: [['refresh', 'Make Lane 5 a dynamic FASTag lane', 'Cuts Lane 3 and 4 wait by about 4 minutes', 'toll/queue'], ['clock', 'Stagger freight release from the Shadnagar lay-by', 'Flattens the 08:00 truck wave'], ['wrench', 'Replace the Lane 3 tag reader', 'Restores 7.4 vehicles a minute in that lane', 'assets/alerts']] },
    { id: 'devanahalli', short: 'Devanahalli', name: 'Devanahalli airport junction', km: 'Km 535 – 548', kind: 'Junction weaving', periods: '05:00 – 08:00 PM', days: '5 of 7', queue: '2.2 km', loss: 980, go: 'traffic/travel', demand: prof(900, 1400, 7, 2.5, 1850, 18.5, 2.3), cap: Array(24).fill(2500), capNote: 'Weaving between airport and city traffic holds the junction to about 2,500 vehicles an hour. The evening peak passes that for roughly three hours.',
      why: [['route', 'Airport and city traffic cross within 600 m', 'Exit and entry ramps are too close together'], ['car', 'Evening flight bank', 'Taxi and cab share rises to 38% after 05:00 PM'], ['fog', 'Seasonal morning fog', 'Speeds fall to 62 km/h on foggy mornings']],
      fix: [['sign', 'Lane-use VMS ahead of the junction', 'Sort airport and city traffic 2 km earlier'], ['gauge', 'Variable speed limit on Km 530 – 548', 'Smooths flow in peaks and in fog', 'incident/INC-2030'], ['road', 'Study an auxiliary lane between the ramps', 'Removes the weave; capital works']] },
    { id: 'jadcherla', short: 'Jadcherla', name: 'Jadcherla junction merge', km: 'Km 82 – 86', kind: 'Merge', periods: '07:30 – 09:30 AM', days: '5 of 7', queue: '1.9 km', loss: 860, go: 'incident/INC-2040/rootcause', demand: prof(600, 1760, 8.5, 2, 1450, 18, 2.3), cap: Array(24).fill(2200), capNote: 'Mainline plus Mahbubnagar link traffic reaches about 2,360 vehicles an hour at 08:00. The 90 m merge taper holds the merge to about 2,200, so flow breaks down most weekday mornings.',
      why: [['road', 'Short merge taper at Km 84.3', '90 m against a 210 m standard for this speed'], ['gauge', 'Speed difference at the merge', 'Joining vehicles at 34 km/h meet an 86 km/h stream'], ['alert', 'Frequent incidents', '9 collisions in 90 days, 7 in the morning peak']],
      fix: [['ruler', 'Extend the merge taper to 210 m', 'Raises merge capacity and removes the main collision cause', 'incident/INC-2040/rootcause'], ['mega', 'Peak-hour VMS “Merging traffic – keep distance”', 'Active 07:30 – 09:30 AM'], ['shield', 'Following-distance enforcement on Km 78 – 86', 'Targets gaps under 1 second']] },
    { id: 'gooty', short: 'Gooty ghat', name: 'Gooty ghat gradient', km: 'Km 294 – 298', kind: 'Gradient, freight', periods: '09:00 AM – 01:00 PM', days: '4 of 7', queue: '3.0 km', loss: 720, go: 'incident/INC-2036', demand: prof(500, 1250, 11, 3.5, 450, 19, 2), cap: Array(24).fill(1650), capNote: 'Two lanes would carry 2,400 vehicles an hour on the level. With 41% trucks crawling up a 4.2% climb the section carries about 1,650, and late-morning freight passes that.',
      why: [['truck', 'Trucks are 41% of traffic', 'Loaded multi-axle vehicles climb at 25 – 35 km/h'], ['barrier', 'No crawler lane or lay-by', 'A slow or stalled truck takes a full lane'], ['wrench', 'Breakdowns on the climb', '11 in 90 days, mostly on days above 34°C']],
      fix: [['road', 'Build a crawler lane lay-by at Km 295', 'Keeps slow trucks out of Lane 2', 'incident/INC-2036'], ['truck', 'Station a 50-tonne crane at Gooty, 07:00 – 11:00 AM', 'Cuts heavy recovery time by about 25 minutes'], ['mega', 'VMS “Heavy vehicles keep left” from Km 290', 'Holds cars and trucks in separate lanes']] },
    { id: 'dhone', short: 'Dhone works', name: 'Dhone roadworks (temporary)', km: 'Km 262 – 270', kind: 'Work zone', periods: '09:00 AM – 01:00 PM', days: 'Until 30 Sep', queue: '1.5 km', loss: 540, go: 'incident/INC-2035', demand: prof(550, 680, 10, 3, 700, 17.5, 2.5), cap: Array.from({ length: 24 }, (_, h) => h >= 8 && h <= 15 ? 1100 : 2900), capNote: 'The lane closure under permit RW-0916 runs 07:30 AM to 04:00 PM and cuts capacity to about 1,100 vehicles an hour. Demand passes it late in the morning; the bottleneck goes when the works end.',
      why: [['cone', 'Lane 1 closed for 1.2 km', 'Planned resurfacing, permit RW-0916'], ['sign', 'Advance warning too short', 'First sign is 300 m before the taper'], ['truck', 'Truck share rises after 10:00 AM', 'Slow merging at the taper']],
      fix: [['sign', 'Move the first warning sign to 1 km', 'Earlier merging, smoother taper', 'incident/INC-2035'], ['clock', 'Shift the closure to 10:00 PM – 06:00 AM', 'Demand then is under 700 vehicles an hour'], ['gauge', 'Portable speed display at Km 266', '14 vehicles entered above 70 km/h in the last hour']] },
  ];
  const HOURS = Array.from({ length: 24 }, (_, h) => String(h).padStart(2, '0') + ':00');

  const SCORE = 72, SCORE_WORD = 'Fair';
  const COMPONENTS = [
    ['shield', 'Safety', 66, '25%', '4 high-severity incidents active; 5 recurring hotspots open', 'analytics/safety'],
    ['car', 'Congestion', 68, '20%', `Average speed ${D.home.avgSpeed} km/h, ${Math.abs(D.home.avgSpeedDelta)}% below normal`, 'analytics/bottlenecks'],
    ['clock', 'Travel time', 71, '15%', `${D.hm(D.home.travelNow)} end to end, +${D.home.travelNow - D.home.travelNormal} min on normal`, 'traffic/travel'],
    ['rupee', 'Toll integrity', 74, '15%', `Estimated leakage ${D.toll.leakPct}% of collections in 24 h`, 'toll/leakage'],
    ['wrench', 'Asset health', 82, '10%', `${VQ.fmt(D.assets.healthy)} of ${VQ.fmt(D.assets.total)} assets healthy; ${D.home.assetAlerts} open alerts`, 'assets/alerts'],
    ['users', 'Response performance', 78, '15%', `86% within target; clearance ${D.response.clearanceMin} min against 30`, 'incidents/response'],
  ];
  const scoreTone = s => s < 60 ? 'crit' : s < 75 ? 'warn' : 'good', scoreWord = s => s < 60 ? 'Poor' : s < 75 ? 'Fair' : 'Good';

  VQ.screen('analytics', {
    title: 'Analytics &amp; Insights', sub: 'Patterns across 90 days that point to what to fix.',
    tabs: [['safety', 'Safety Hotspots'], ['bottlenecks', 'Bottlenecks'], ['health', 'Corridor Health']],
    filters: () => UI.sel('NH-44') + UI.sel('Last 90 days'),
    values: ['Fix the cause, not just the incident.', 'Remove the bottlenecks that repeat.', 'Evidence for every rupee spent.', 'Less idling. Lower emissions.'],
    views: {
      /* ---------- Safety hotspots ---------- */
      safety: { render: () => {
        const total = D.hotspots.reduce((a, h) => a + h.count90, 0);
        const rows = [...D.hotspots].sort((a, b) => b.count90 - a.count90).map((h, k) => ({ ...h, rank: k + 1, go: 'incidents/hotspots' }));
        return UI.kpis([
          { icon: 'crosshair', bg: 'bg-crit', value: D.hotspots.length, label: 'Recurring Hotspots', delta: { value: total, text: 'incidents in 90 days' }, go: 'incidents/hotspots' },
          { icon: 'zap', bg: 'bg-serious', value: 41, unit: '/ week', label: 'Near Misses, Km 82 – 86', delta: { dir: 'up', value: '5×', text: 'corridor average', good: false } },
          { icon: 'gauge', bg: 'bg-warn', value: OVER_PCT + '%', label: 'Above Limit, Km 402 – 431', delta: { dir: 'up', value: '+4 pts', text: 'vs. previous 90 days', good: false } },
          { icon: 'bulb', bg: 'bg-good', value: 6, label: 'Candidate Interventions', delta: { dot: 'good', value: '2', text: 'already ticketed' } },
        ], 'g4') + `<div class="grid g-5-3">
          <div class="card flush">${VQ.Map.render({ h: 310, plainRoute: 1, pins: [...D.hotspots.map((h, k) => ({ type: 'incident', km: (h.from + h.to) / 2, icon: 'crosshair', tone: h.count90 >= 9 ? 'crit' : 'serious', count: h.count90, go: 'incidents/hotspots', tip: `<b>${h.name}</b><br>Km ${h.from}–${h.to} · ${h.kind}<br>${h.count90} incidents in 90 days`, callout: h.id === 'HS-02' ? { title: h.name, lines: [`Km ${h.from}–${h.to} · ${h.count90} breakdowns in 90 days`], tone: 'dark' } : null })),
            { type: 'asset', km: 416, icon: 'gauge', tone: 'warn', below: 1, tip: `<b>Overspeeding stretch</b><br>Km 402 – 431 · ${OVER_PCT}% of vehicles above 100 km/h` }], highlight: [402, 431], legend: '<b>Safety hotspots (last 90 days)</b><span>Number on a pin is the incident count</span><span>Gauge pin: overspeeding stretch, Km 402 – 431</span>' })}</div>
          ${UI.card('Near misses: hard-braking events per week', C.hbars({ unit: 'events / week', items: NEAR_MISS.map(([l, v, go]) => ({ label: l, value: v, go })) }) + `<div class="card-note mt">Km 82 – 86 has 41 near misses a week, 5× the corridor average of 8 for a stretch this long. Most involve cars braking behind trucks at the Mahbubnagar link merge between 07:30 and 09:30 AM.</div>`, { icon: 'zap' })}
        </div>
        ${UI.card('Recurring hotspots, ranked', UI.table([{ k: 'rank', label: '#', fmt: v => `<b class="ink">${v}</b>` }, { k: 'name', label: 'Location', fmt: (v, h) => `<b class="ink">${v}</b><div class="small t2">${h.id} · Km ${h.from} – ${h.to}</div>` }, { k: 'kind', label: 'Kind', fmt: v => `<span style="white-space:nowrap">${v.replace(' hotspot', '')}</span>` }, { k: 'count90', label: 'Incidents (90 days)', r: 1, fmt: v => `<b class="ink num">${v}</b>` }, { k: 'x', label: 'Mostly happens', fmt: (_, h) => HS_X[h.id].when }, { k: 'y', label: 'Severity mix', fmt: (_, h) => mixBar(HS_X[h.id].mix) }, { k: 'fix', label: 'Candidate intervention' }, { k: 'z', label: '', fmt: () => `<span class="li-chev">${I('chev')}</span>` }], rows), { icon: 'crosshair', cls: 'mb', right: '<span>Select a row for the pattern and live incidents</span>' })}
        ${secH('gauge', 'Overspeeding hotspot · Km 402 – 431, Anantapur to Penukonda', 'Speed limit 100 km/h (cars), 80 km/h (trucks)')}
        <div class="grid g3">
          ${UI.card('Speed distribution (share of vehicles, %)', C.bars({ h: 200, labels: SPEED_BINS, unit: '% of vehicles', yMax: 30, series: [{ name: 'Share of vehicles', data: SPEED_SHARE }], colorOf: i => i >= 5 ? 'var(--crit)' : null, legendItems: [{ name: 'Within the limit', color: 'var(--s1)', bar: 1 }, { name: 'Above the 100 km/h limit', color: 'var(--crit)', bar: 1 }] }) + `<div class="card-note">Each bar is a 10 km/h bin, labelled by its lower speed. ${OVER_PCT}% of vehicles are above the 100 km/h limit and 4% are above 120 km/h.</div>`)}
          ${UI.card('Share above the limit, by time of day (%)', C.bars({ h: 200, labels: ['00–03', '03–06', '06–09', '09–12', '12–15', '15–18', '18–21', '21–24'], unit: '% above limit', yMax: 60, series: [{ name: 'Above limit', data: [44, 47, 21, 17, 18, 19, 24, 36] }] }) + '<div class="card-note">Overspeeding doubles at night: 36 – 47% of vehicles between 09:00 PM and 06:00 AM, when the road is empty and there is no enforcement.</div>')}
          ${UI.card('Who is speeding (share of vehicles above the limit)', C.hbars({ unit: '%', max: 100, items: [['Cars and SUVs', 61, 'car'], ['Inter-city buses', 17, 'users'], ['Light goods vehicles', 12, 'box'], ['Two-wheelers', 6, 'zap'], ['Trucks (above 80 km/h)', 4, 'truck']].map(([label, value, icon]) => ({ label, value, icon, text: value + '%' })) }) + `<div class="insight mt" style="margin-bottom:0"><span style="color:var(--crit)">${I('alert')}</span><div><b>Link to incidents</b><p>7 of the 9 run-off and rear-end incidents here in 90 days happened between 09:00 PM and 06:00 AM, the same hours overspeeding peaks.</p></div></div>`)}
        </div>
        <div class="grid g-1-2">
          ${UI.card('Road context', UI.kv([['road', 'Geometry', '29 km straight, gentle downgrade SB'], ['video', 'Enforcement', 'No speed camera between Marur plaza (Km 388) and Penukonda'], ['bulb', 'Lighting', 'Unlit except at 2 junctions'], ['barrier', 'Median', 'Continuous, 3 authorised openings'], ['clock', 'Last alert', 'Overspeeding alert closed 04:22 AM today']]), { icon: 'info' })}
          ${UI.card('Candidate interventions and expected effect', UI.table([{ k: 'a', label: 'Intervention', fmt: v => `<b class="ink">${v}</b>` }, { k: 'w', label: 'Where' }, { k: 't', label: 'Type', fmt: v => UI.pill(v, v === 'Engineering' ? 'info' : v === 'Enforcement' ? 'violet' : 'gray') }, { k: 'e', label: 'Expected effect' }, { k: 's', label: 'Status', fmt: v => UI.pill(v, v === 'Ticketed' ? 'good' : 'gray') }], [
            { a: 'Average-speed enforcement', w: 'Km 402 – 431', t: 'Enforcement', e: 'Share above limit from 23% to about 9%', s: 'Proposed' },
            { a: 'Speed display signs and rumble strips', w: 'Km 408 and Km 422', t: 'Engineering', e: 'Mean night speed down 8 – 10 km/h', s: 'Proposed' },
            { a: 'Extend merge taper to 210 m', w: 'Km 84.3, Jadcherla', t: 'Engineering', e: 'Near misses down about 60%; 5 – 6 fewer collisions a quarter', s: 'Proposed', go: 'incident/INC-2040/rootcause' },
            { a: 'Tyre-killer strip and wrong-way signs', w: 'Km 10.9 exit ramp', t: 'Engineering', e: 'Stops wrong-way entries from this ramp (5 in 90 days)', s: 'Ticketed', go: 'incident/INC-2033' },
            { a: 'Repair 340 m of median fence', w: 'Km 321.8, Gooty', t: 'Maintenance', e: 'Animal intrusions from 8 to 1 – 2 a quarter', s: 'Ticketed', go: 'incident/INC-2032' },
            { a: 'Night patrol presence, 09:00 PM – 06:00 AM', w: 'Km 402 – 431', t: 'Enforcement', e: 'Interim measure until cameras are installed', s: 'Proposed' },
          ]), { icon: 'bulb' })}
        </div>`;
      } },

      /* ---------- Bottlenecks ---------- */
      bottlenecks: { render: () => {
        const b = BN.find(x => x.id === VQ.state.bn) || BN[0], totalLoss = BN.reduce((a, x) => a + x.loss, 0);
        return UI.kpis([
          { icon: 'filter', bg: 'bg-serious', value: BN.length, label: 'Recurring Bottlenecks', delta: { value: '1', text: 'temporary (roadworks)' } },
          { icon: 'clock', bg: 'bg-crit', value: VQ.fmt(totalLoss), unit: 'veh-hours', label: 'Journey Time Lost per Day', delta: { dir: 'up', value: '+6%', text: 'vs. previous 90 days', good: false } },
          { icon: 'toll', bg: 'bg-warn', value: '29%', label: 'Of the Loss is at Raikal Plaza', delta: { value: 'Km 58', text: 'both peaks' }, go: 'toll/queue' },
          { icon: 'truck', bg: 'bg-navy', value: '41%', label: 'Truck Share on Gooty Ghat', delta: { value: '47 km/h', text: 'car to truck speed gap' }, go: 'incident/INC-2036' },
        ], 'g4') + `<div class="grid g-5-3">
          ${UI.card('Recurring bottlenecks, ranked by journey time lost', UI.table([{ k: 'rank', label: '#', fmt: v => `<b class="ink">${v}</b>` }, { k: 'name', label: 'Location', fmt: (v, r) => `<b class="ink" style="white-space:nowrap">${v}</b><div class="small t2">${r.km}</div>` }, { k: 'kind', label: 'Type', fmt: (v, r) => UI.pill(v, r.id === 'dhone' ? 'warn' : 'info') }, { k: 'periods', label: 'Affected periods' }, { k: 'days', label: 'Days a week', fmt: v => `<span style="white-space:nowrap">${v}</span>` }, { k: 'queue', label: 'Max queue', r: 1 }, { k: 'z', label: '', fmt: () => `<span class="li-chev">${I('chev')}</span>` }], BN.map((x, k) => ({ ...x, rank: k + 1 }))), { icon: 'filter' })}
          ${UI.card('Journey time lost per day (vehicle-hours)', C.hbars({ unit: 'vehicle-hours / day', items: BN.map(x => ({ label: `${x.name.replace(' (temporary)', '')}`, value: x.loss, text: VQ.fmt(x.loss), go: x.go })) }) + `<div class="card-note mt">Together the five cost ${VQ.fmt(totalLoss)} vehicle-hours a day. The top three are fixed by operations or minor works, not new road.</div>`, { icon: 'clock' })}
        </div>
        <div class="grid g-2-1">
          ${UI.card('Demand against capacity by hour', `<div class="small t2 mb"><b class="ink">${b.name}</b> · ${b.km} · vehicles an hour, SB carriageway</div>` + C.line({ h: 270, yMax: Math.max(...b.demand, ...b.cap) > 2000 ? 4000 : 2000, labels: HOURS, xTicks: 8, unit: 'veh/hour', yMin: 0, mark: { i: 8, label: 'Now' }, series: [{ name: 'Demand (typical weekday)', data: b.demand, area: 1 }, { name: 'Capacity', data: b.cap, color: 'var(--s2)', dash: 1 }] }) + `<div class="card-note">${b.capNote}</div>`, { right: UI.seg('bn', BN.map(x => [x.id, x.short]), b.id) })}
          <div class="col">
            ${UI.card('Probable contributors', UI.list(b.why.map(([icon, title, sub]) => ({ icon, tone: 'serious', title, sub }))), { icon: 'search', right: `<span>${b.short}</span>` })}
            ${UI.card('Potential interventions', UI.list(b.fix.map(([icon, title, sub, go]) => ({ icon, tone: 'good', title, sub, go }))) + `<div class="mt">${UI.btn('Open the evidence', { sm: 1, go: b.go, icon: 'arrow' })}</div>`, { icon: 'bulb', right: `<span>${b.short}</span>` })}
          </div>
        </div>
        <div class="grid">
          ${UI.card('Freight and heavy-vehicle congestion', `<div class="grid g-2-1" style="margin:0;gap:18px;align-items:start"><div><div class="small b ink mb">Heavy-vehicle share of traffic, by section (%)</div>${C.bars({ h: 190, twoLine: 1, unit: '% heavy vehicles', labels: ['Hyderabad –|Jadcherla', 'Jadcherla –|Kurnool', 'Kurnool –|Dhone', 'Gooty ghat|Km 294 – 298', 'Anantapur –|Penukonda', 'Bagepalli –|Bengaluru'], series: [{ name: 'Heavy-vehicle share', data: [22, 29, 34, 41, 31, 18] }], valueLabels: 1 })}</div>
            <div>${UI.kv([['car', 'Cars on the ghat', '78 km/h'], ['truck', 'Trucks on the ghat', '31 km/h'], ['gauge', 'Speed gap', '<b style="color:var(--crit-ink)">47 km/h</b>'], ['road', 'Trucks in Lane 2', '28% of trucks'], ['clock', 'Freight peak', '09:00 AM – 01:00 PM']])}</div></div>
            <div class="card-note mt">Freight share peaks at 41% on the Gooty ghat, where trucks climb at 31 km/h and more than a quarter of them overtake in Lane 2. That is what turns one slow truck into a 3 km queue, as with ${`<a data-go="incident/INC-2036" class="b">INC-2036</a>`} this morning.</div>`, { icon: 'truck' })}
        </div>`;
      } },

      /* ---------- Corridor health ---------- */
      health: { title: 'Corridor Health', sub: 'One command view of NH-44: what is happening, how well we are coping and what to fix first.', render: () => {
        const sevN = s => D.incidents.filter(i => i.sev === s).length, queueKm = Math.round(D.incidents.reduce((a, i) => a + (i.impact.queue || 0), 0) * 10) / 10;
        const r = VQ.rng(21), trend = Array.from({ length: 30 }, (_, i) => Math.round(77 + Math.sin(i / 3) * 1.5 + (r() - .5) * 3 - (i > 23 ? (i - 23) * .8 : 0))); trend[29] = SCORE;
        const days = Array.from({ length: 30 }, (_, i) => { const d = 18 + i; return d <= 31 ? `${d} Aug` : `${d - 31} Sep`; });
        return `<div class="grid g-1-2">
          ${UI.card('Corridor health score', `<div class="row" style="gap:20px;align-items:center">${C.donut({ size: 164, thick: 18, legend: false, center: { v: SCORE, l: 'out of 100', size: 34 }, items: [{ label: 'Score', value: SCORE, color: `var(--${scoreTone(SCORE)})` }, { label: 'Gap to 100', value: 100 - SCORE, color: 'var(--line-2)' }] })}
              <div style="min-width:0">${UI.pill(SCORE_WORD, scoreTone(SCORE))}<div class="kpi-delta bad mt">${I('down')}<span><b>−5 pts</b> vs. last Tuesday</span></div><div class="card-note mt">Pulled down this morning by the Jadcherla accident, the Penukonda waterlogging and the Raikal plaza queue.</div></div></div>
              <hr class="sep"><div class="card-note">Weighted score of six components. 75 and above is Good, 60 – 74 Fair, below 60 Poor.</div>`, { icon: 'pulse', right: `<span>${D.day} · ${D.now}</span>` })}
          ${UI.card('Component scores', `<div class="grid g2" style="margin:0;gap:4px 28px">${COMPONENTS.map(([icon, label, s, w, note, go]) => `<div class="click" data-go="${go}" style="cursor:pointer;padding:8px 0;border-bottom:1px solid var(--line-2)"><div class="row between" style="margin-bottom:5px"><span class="row" style="gap:7px"><span style="display:inline-flex;width:16px;height:16px;color:var(--blue)">${I(icon)}</span><b class="ink">${label}</b><span class="small muted">weight ${w}</span></span><span class="row" style="gap:6px"><b class="ink num">${s}</b>${UI.pill(scoreWord(s), scoreTone(s))}<span class="li-chev">${I('chev')}</span></span></div>${C.meter(s, scoreTone(s))}<div class="small t2" style="margin-top:5px">${note}</div></div>`).join('')}</div>`, { icon: 'gauge', right: '<span>Select a component to open its section</span>' })}
        </div>
        ${secH('net', 'Multi-incident situation', `${D.home.activeIncidents} active incidents at ${D.now}`)}
        <div class="grid g-2-1">
          <div class="col">
            <div class="card flush">${VQ.Map.render({ h: 280, pins: D.incidents.map(i => D.incPin(i)), legend: 'speed' })}</div>
            ${UI.card('', UI.statRow([[D.home.activeIncidents, `Active: ${sevN('high')} high · ${sevN('medium')} medium · ${sevN('low')} low`, 'crit-ink'], ['9 lanes', 'Blocked or restricted at 7 locations'], [queueKm + ' km', 'Combined queue length'], ['+' + (D.home.travelNow - D.home.travelNormal) + ' min', `End-to-end delay (${D.hm(D.home.travelNow)})`]]))}
            ${UI.card('Coordinated response plan', UI.list([
              { icon: 'alert', tone: 'crit', title: 'First: clear the Jadcherla accident and protect its queue tail', sub: 'INC-2040 causes 4.8 km of the queue. Patrol to Km 79.7, VMS at Km 70 and Km 78.', go: 'incident/INC-2040/response' },
              { icon: 'flame', tone: 'crit', title: 'In parallel: fire tender to the smoking truck at Km 398', sub: 'INC-2041 can escalate within 10 minutes. It uses Anantapur units, so it does not compete with Jadcherla.', go: 'incident/INC-2041' },
              { icon: 'truck', tone: 'warn', title: 'Keep the only 50 t crane on the Gooty ghat', sub: 'INC-2036 needs it for 70 – 90 minutes. The Jadcherla truck can be moved by the heavy tow already en route.', go: 'incident/INC-2036' },
            ]), { icon: 'route' })}
          </div>
          <div class="col">
            ${UI.card('Interacting queues', UI.insight('checkc', 'good', 'Raikal tailback and accident queue will not merge', 'The toll tailback (Km 52 – 58) and the accident queue (Km 79.7 – 84.5) are 21 km apart. Even at its 7.5 km peak the accident queue stays 19 km short of the plaza, so they do not merge before 10:00 AM.', 'incident/INC-2040/impact') + UI.insight('alert', 'warn', 'Rain band sits over two incidents', 'Waterlogging at Km 441 and heavy rain on Km 425 – 470 slow the same 45 km. Treat as one weather event.', 'incident/INC-2038/impact'), { icon: 'link' })}
            ${UI.card('Responder availability', UI.list([{ icon: 'car', tone: 'info', title: 'Highway Patrol', sub: '18 units · 7 deployed', pill: UI.pill('11 free', 'good') }, { icon: 'truck', tone: 'serious', title: 'Tow and Recovery', sub: '9 units · 4 deployed · the one 50 t crane is committed to INC-2036', pill: UI.pill('Crane short', 'warn'), go: 'incidents/response' }, { icon: 'ambulance', tone: 'crit', title: 'Ambulance (108)', sub: '12 units · 2 deployed', pill: UI.pill('10 free', 'good') }, { icon: 'wrench', tone: 'info', title: 'Maintenance Crews', sub: '7 crews · 3 deployed', pill: UI.pill('4 free', 'good') }]), { icon: 'users', right: UI.viewAll('incidents/response') })}
          </div>
        </div>
        <div class="grid g-1-2">
          ${UI.card('Health score, last 30 days', C.line({ h: 220, labels: days, xTicks: 6, yMin: 50, yMax: 100, yTicks: 5, unit: 'points', series: [{ name: 'Corridor health score', data: trend, area: 1 }], mark: { i: 29, label: 'Today ' + SCORE, color: 'var(--warn)' } }) + '<div class="card-note">The score held around 77 until the rain band arrived on 11 Sep. Waterlogging and wet-road incidents account for most of the fall since.</div>', { icon: 'trend' })}
          ${UI.card('Highest-priority interventions', UI.actions([
            { icon: 'rain', tone: 'violet', title: '1. Desilt the side drain at Km 441 (ticket MT-5127)', sub: 'Open since 02 Sep. Cause of 6 waterlogging events in 90 days, including today\'s INC-2038.', btn: 'Maintenance', go: 'assets/maintenance', primary: 1 },
            { icon: 'rupee', tone: 'crit', title: '2. Audit Pullur plaza Lane 4', sub: `Pullur lost an estimated ₹ ${D.plazas.find(p => p.id === 'pullur').leak24} lakh in 24 h, 40% of corridor leakage, concentrated in one lane and shift.`, btn: 'Leakage pattern', go: 'toll/patterns', primary: 1 },
            { icon: 'ruler', tone: 'serious', title: '3. Extend the merge taper at Km 84.3 to 210 m', sub: '9 collisions in 90 days and 41 near misses a week at the Jadcherla merge; today\'s INC-2040 is the ninth.', btn: 'Root cause', go: 'incident/INC-2040/rootcause' },
            { icon: 'truck', tone: 'warn', title: '4. Station a 50-tonne crane at Gooty, 07:00 – 11:00 AM', sub: '11 breakdowns on the ghat in 90 days; 27 minutes lost today sending a tow that was too light.', btn: 'Root cause', go: 'incident/INC-2036/rootcause' },
            { icon: 'toll', tone: 'info', title: '5. Make Raikal Lane 5 a dynamic FASTag lane', sub: 'Largest recurring bottleneck: 1,240 vehicle-hours a day lost to a lane-allocation mismatch.', btn: 'Plaza queue', go: 'toll/queue' },
          ]), { icon: 'flag', right: '<span>Ranked by risk removed per rupee</span>' })}
        </div>`;
      } },
    },
  });

  /* =======================================================
     3. REPORTS
     ======================================================= */
  const REPORT_TYPES = [
    ['file', 'info', 'Operations daily summary', 'Incidents, traffic, toll and asset status for the last 24 hours in two pages.', 'Daily · 06:00 AM', 'Shift supervisors, Project Director'],
    ['alert', 'crit', 'Incident report', 'One incident end to end: evidence, timeline, response times and root cause.', 'On demand · on closure', 'Traffic Police, insurers, NHAI'],
    ['car', 'serious', 'Traffic &amp; travel time', 'Section speeds, travel-time reliability, bottlenecks and diversion results.', 'Weekly · Monday', 'Operations, planning'],
    ['rupee', 'violet', 'Toll revenue &amp; leakage', 'Collections by plaza, class-mismatch cases, confirmed leakage and recoveries.', 'Daily and monthly', 'Toll auditors, finance'],
    ['wrench', 'warn', 'Asset health', 'Uptime by asset class, open faults, maintenance backlog and contractor performance.', 'Weekly · Friday', 'Maintenance planners'],
    ['shield', 'good', 'Safety audit pack', 'Hotspots, near-miss trends and the evidence for each proposed intervention.', 'Quarterly', 'Road safety auditors, NHAI'],
  ];
  const RECENT = [
    ['Operations daily summary', 'Mon, 15 Sep 2026', '16 Sep · 06:00 AM', 'Scheduled', 'PDF', '1.8 MB'], ['Toll revenue &amp; leakage, daily', 'Mon, 15 Sep 2026', '16 Sep · 06:05 AM', 'Scheduled', 'XLSX', '640 KB'],
    ['Incident report · INC-2033 Wrong-Way Vehicle', '16 Sep · 07:40 – 08:10 AM', '16 Sep · 08:12 AM', 'Shift supervisor', 'PDF', '4.2 MB'], ['Traffic &amp; travel time, weekly', '08 – 14 Sep 2026', '15 Sep · 07:00 AM', 'Scheduled', 'PDF', '2.6 MB'],
    ['Asset health, weekly', '06 – 12 Sep 2026', '12 Sep · 05:30 PM', 'Maintenance planner', 'PDF', '2.1 MB'], ['Toll leakage pattern · Pullur Lane 4', '01 – 14 Sep 2026', '15 Sep · 11:20 AM', 'Toll auditor', 'XLSX', '910 KB'],
    ['Safety audit pack, Q2 FY 2026-27', 'Jul – Sep 2026 (draft)', '10 Sep · 04:45 PM', 'Administrator', 'PDF', '11.4 MB'],
  ].map(([name, period, at, by, format, size]) => ({ name, period, at, by, format, size }));

  VQ.screen('reports', {
    title: 'Reports', sub: 'Scheduled and on-demand reports for operations, revenue and safety.',
    headRight: () => UI.btn('Schedule', { icon: 'cal', toast: 'Report schedule opened (demo)' }) + UI.btn('Generate Report', { primary: 1, icon: 'plus', toast: 'Report builder opened (demo)' }),
    values: ['Evidence for every incident.', 'Travel-time trends on record.', 'Every rupee accounted for.', 'Paperless, scheduled reporting.'],
    views: { main: { render: () => {
      const high = D.incidents.filter(i => i.sev === 'high').length, worst = [...D.plazas].sort((a, b) => b.leak24 - a.leak24)[0];
      const bullets = [
        ['alert', 'crit', `<b>${D.home.activeIncidents} active incidents</b>, ${high} high severity. Most urgent: <a data-go="incident/INC-2040" class="b">INC-2040</a> accident at Km 84.5 and <a data-go="incident/INC-2041" class="b">INC-2041</a> vehicle smoke at Km 398.`],
        ['checkc', 'good', `<b>${D.response.resolvedToday} incidents resolved</b> since midnight. Average time to on site ${D.response.avgResponseMin} minutes; average clearance ${D.response.clearanceMin} minutes against a 30-minute target.`],
        ['clock', 'serious', `<b>Corridor travel time ${D.hm(D.home.travelNow)}</b>, ${D.home.travelNow - D.home.travelNormal} minutes (${Math.round((D.home.travelNow / D.home.travelNormal - 1) * 100)}%) above normal. Average speed ${D.home.avgSpeed} km/h.`],
        ['car', 'info', `<b>${VQ.fmt(D.home.vehiclesHour)} vehicles</b> on the corridor in the last hour, ${D.home.vehiclesDelta}% above a normal Tuesday. ${D.home.diversions} diversions active.`],
        ['rupee', 'violet', `<b>₹ ${D.toll.revToday} Cr toll collected</b> today so far across ${D.plazas.length} plazas, ${D.home.tollDelta}% above last Tuesday.`],
        ['search', 'crit', `<b>₹ ${D.toll.leak24} lakh estimated leakage</b> in 24 hours (${D.toll.leakPct}% of collections); ${D.toll.flagged24} transactions flagged. ${worst.name} plaza accounts for ₹ ${worst.leak24} lakh.`],
        ['wrench', 'warn', `<b>${D.home.assetAlerts} asset alerts</b>, ${D.home.assetNew} new since 06:00 AM. ${VQ.fmt(D.assets.fault)} of ${VQ.fmt(D.assets.total)} assets in fault; cameras ${D.assets.classes[0].pct}% operational.`],
        ['rain', 'violet', '<b>Weather:</b> heavy rain on Km 425 – 470 with waterlogging at the Penukonda underpass; fog on Km 530 – 548 clearing by 09:15 AM.'],
      ];
      return `<div class="grid g3">${REPORT_TYPES.map(([icon, tone, name, desc, freq, who]) => `<div class="card" style="display:flex;flex-direction:column;gap:8px"><div class="row" style="gap:11px;align-items:flex-start"><div class="li-ic tone-${tone}">${I(icon)}</div><div style="min-width:0"><h3 style="font-size:14.5px">${name}</h3><div class="small t2" style="margin-top:2px">${desc}</div></div></div>
          <div class="row wrap small t2" style="gap:6px 14px;flex:1;align-items:flex-start"><span class="row" style="gap:5px"><span style="display:inline-flex;width:13px;height:13px">${I('cal')}</span>${freq}</span><span class="row" style="gap:5px"><span style="display:inline-flex;width:13px;height:13px">${I('users')}</span>${who}</span></div>
          <div class="row" style="gap:8px">${UI.btn('Generate', { sm: 1, primary: 1, icon: 'play', toast: `${name.replace(/&amp;/g, '&')} · generating (demo)`, done: 'Queued' })}${UI.btn('Schedule', { sm: 1, icon: 'cal', toast: `${name.replace(/&amp;/g, '&')} · schedule opened (demo)`, done: 'Scheduled' })}</div></div>`).join('')}</div>
        <div class="grid g-3-2" style="grid-template-columns:minmax(0,3fr) minmax(0,2fr)">
          ${UI.card('Recent reports', UI.table([{ k: 'name', label: 'Report', fmt: v => `<span class="row" style="gap:8px"><span style="display:inline-flex;width:16px;height:16px;color:var(--blue);flex:none">${I('file')}</span><b class="ink">${v}</b></span>` }, { k: 'period', label: 'Period' }, { k: 'at', label: 'Generated', fmt: v => `<span style="white-space:nowrap">${v}</span>` }, { k: 'by', label: 'By' }, { k: 'format', label: 'Format', fmt: (v, r) => `${UI.pill(v, v === 'PDF' ? 'crit' : 'good')} <span class="small muted" style="white-space:nowrap">${r.size}</span>` }, { k: 'x', label: '', r: 1, fmt: (_, r) => `<button class="btn sm ghost" data-act="Downloading ${VQ.esc(r.name.replace(/&amp;/g, '&'))} (demo)" data-done="Saved">${I('download')}Download</button>` }], RECENT) + '<div class="card-note mt">Reports are kept for 7 years. Incident reports include the evidence clip hash so they can be verified later.</div>', { icon: 'file', right: UI.sel('Last 7 days') })}
          ${UI.card("Today's daily summary (draft)", `<div class="small t2 mb">${D.corridor} ${D.from} – ${D.to} · ${D.day} · as of ${D.now}. The final version is issued at 06:00 AM tomorrow.</div>${bullets.map(([icon, tone, text]) => `<div class="row" style="gap:10px;align-items:flex-start;padding:7px 0;border-bottom:1px solid var(--line-2)"><div class="li-ic tone-${tone}" style="width:26px;height:26px;border-radius:7px">${I(icon)}</div><div style="font-size:12.5px;min-width:0">${text}</div></div>`).join('')}
            <div class="row mt" style="gap:8px">${UI.btn('Generate now', { primary: 1, icon: 'play', toast: 'Daily summary generated as of 08:45 AM (demo)', done: 'Generated' })}${UI.btn('Schedule', { icon: 'cal', toast: 'Daily summary is scheduled for 06:00 AM every day' })}${UI.btn('Share', { ghost: 1, icon: 'share', toast: 'Draft shared with shift supervisors (demo)', done: 'Shared' })}</div>`, { icon: 'note', right: UI.pill('Draft', 'warn') })}
        </div>`;
    } } },
  });

  /* =======================================================
     4. ADMINISTRATION
     ======================================================= */
  const ROLES = [
    ['eye', 'Control room operator', 24, ['View all feeds', 'Acknowledge alerts', 'Send VMS messages', 'Dispatch responders'], 'Hyderabad and Anantapur control rooms'],
    ['shieldcheck', 'Shift supervisor', 6, ['All operator rights', 'Approve lane closures', 'Approve diversions', 'Close incidents', 'Generate reports'], 'One per shift per control room'],
    ['rupee', 'Toll auditor', 8, ['Toll transactions', 'Review flagged cases', 'Confirm or reject leakage', 'Revenue reports'], 'No access to live incident controls'],
    ['wrench', 'Maintenance planner', 5, ['Asset register', 'Raise and assign tickets', 'Schedule maintenance', 'Contractor SLAs'], 'Read-only on incidents'],
    ['car', 'Patrol unit (mobile)', 18, ['Assigned incidents', 'Update status on site', 'Upload photos', 'Navigation to site'], 'Mobile app, one login per vehicle'],
    ['gear', 'Administrator', 3, ['Users and roles', 'Alert rules', 'Integrations', 'Audit log'], 'Two-factor sign-in required'],
  ];
  const USERS = [
    ['K. Kumar (KK)', 'Shift supervisor', 'Hyderabad control room · Morning', 'Signed in · 06:00 AM', 'Active', 1], ['A. R. (AR)', 'Control room operator', 'Hyderabad control room · Morning', 'Signed in · 05:58 AM', 'Active', 0],
    ['S. N. (SN)', 'Control room operator', 'Anantapur control room · Morning', 'Signed in · 06:02 AM', 'Active', 0], ['M. V. (MV)', 'Toll auditor', 'Toll audit cell · Kurnool', 'Signed in · 08:15 AM', 'Active', 0],
    ['P. D. (PD)', 'Maintenance planner', 'Maintenance cell · Anantapur', 'Signed in · 07:40 AM', 'Active', 0], ['Patrol P-02', 'Patrol unit (mobile)', 'Shamshabad beat · Km 0 – 30', 'On site update · 07:49 AM', 'Active', 0],
    ['Patrol P-11', 'Patrol unit (mobile)', 'Gooty beat · Km 300 – 340', 'On site update · 07:41 AM', 'Active', 0], ['R. J. (RJ)', 'Administrator', 'Project office · Hyderabad', 'Yesterday · 06:20 PM', 'Offline', 0],
    ['T. B. (TB)', 'Shift supervisor', 'Anantapur control room · Night', 'Signed out · 06:05 AM', 'Off shift', 0],
  ].map(([name, role, where, last, status, me]) => ({ name, role, where, last, status, me }));
  const RULES = [
    ['car', 'Stalled vehicle in a live lane', 'Stationary for more than 3 minutes', 'medium', 'Operator, nearest patrol', 'Suggest VMS “Stalled vehicle ahead”', 1, 'incident/INC-2039'],
    ['ban', 'Wrong-way vehicle', 'Any detection, confidence above 85%', 'high', 'Operator, supervisor, patrol, Traffic Police', 'VMS “Wrong-way vehicle ahead” sent automatically', 1, 'incident/INC-2033'],
    ['alert', 'Accident / collision', 'Sudden stop of 2 or more vehicles, no movement for 60 sec', 'high', 'Operator, supervisor, 108 ambulance', 'Pre-fill ambulance and tow dispatch', 1, 'incident/INC-2040'],
    ['toll', 'Toll lane wait time', 'Any lane above 10 minutes', 'medium', 'Plaza supervisor, operator', 'Recommend lane re-allocation', 1, 'toll/queue'],
    ['rain', 'Water on carriageway', 'Estimated depth above 20 cm', 'high', 'Operator, maintenance planner', 'Recommend lane closure; pump crew ticket', 1, 'incident/INC-2038'],
    ['videooff', 'Camera offline', 'No feed for more than 5 minutes', 'low', 'Maintenance planner', 'Auto-create maintenance ticket', 1, 'assets/alerts'],
    ['tag', 'Toll class mismatch', 'Vision class differs from charged class, confidence above 90%', 'medium', 'Toll auditor', 'Add to the review queue with image', 1, 'toll/review'],
    ['flame', 'Vehicle smoke or fire', 'Smoke plume for more than 20 seconds', 'high', 'Operator, supervisor, fire station', 'Pre-fill fire tender request', 1, 'incident/INC-2041'],
    ['paw', 'Animal on carriageway', 'Large animal in a live lane for more than 30 seconds', 'medium', 'Operator, nearest patrol', 'VMS “Animals on road” sent automatically', 1, 'incident/INC-2032'],
    ['gauge', 'Overspeeding vehicle', 'More than 30 km/h above the posted limit', 'low', 'Traffic Police e-challan queue', 'Evidence pack to e-challan', 0, 'analytics/safety'],
  ].map(([icon, rule, trig, sev, notify, auto, on]) => ({ icon, rule, trig, sev, notify, auto, on }));
  const camOnline = Math.round(D.assets.classes[0].count * D.assets.classes[0].pct / 100);
  const INTEGRATIONS = [
    ['tag', 'FASTag / NETC transactions feed', 'Toll transactions from all 8 plazas, matched to camera class reads.', 'Connected', 'good', '08:44:51 AM', '2.1 lakh transactions / day'],
    ['sign', 'VMS controller', `${D.assets.classes[1].count} signs. Messages sent from incident actions and alert rules.`, 'Degraded', 'warn', '08:44:30 AM', '13 signs not responding (94% operational)'],
    ['ambulance', '108 ambulance dispatch', 'Two-way: request, acknowledgement and live vehicle position.', 'Connected', 'good', '08:44:58 AM', '2 units deployed now'],
    ['shield', 'Traffic police e-challan', 'Evidence packs for wrong-way, overspeeding and work-zone offences.', 'Connected', 'good', '08:40:12 AM', '37 packs sent this week'],
    ['cloud', 'Weather feed (IMD)', 'Rainfall, visibility and district warnings every 15 minutes.', 'Connected', 'good', '08:30:00 AM', 'Heavy rain warning: Sri Sathya Sai district'],
    ['video', 'ATMS camera network', `${VQ.fmt(D.assets.classes[0].count)} cameras over the corridor fibre ring.`, 'Connected', 'good', '08:45:10 AM', `${VQ.fmt(camOnline)} online · ${D.assets.classes[0].count - camOnline} offline`],
  ];
  const MODELS = [
    ['car', 'Vehicle detection and tracking', 'v4.2.1', '98.1%', 'Precision', 'Detects and tracks 9 vehicle classes, day, night and rain.', '02 Sep 2026'],
    ['alert', 'Incident classification', 'v3.7.0', '94.6%', 'Precision', '12 incident types from stopped vehicles to smoke and wrong-way.', '26 Aug 2026'],
    ['tag', 'AVC class verification', 'v2.9.3', '97.8%', 'Class accuracy', 'Axle and body class at the toll lane, compared with the charged class.', '09 Sep 2026'],
    ['trend', 'Queue prediction', 'v1.8.0', '±1.1 km', '30-min queue error', 'Queue length and travel time 15 to 60 minutes ahead.', '12 Sep 2026'],
  ];

  VQ.screen('admin', {
    title: 'Administration', sub: 'Users, roles, corridors, alert rules and integrations.',
    tabs: [['users', 'Users &amp; Roles'], ['rules', 'Alert Rules'], ['system', 'System &amp; Integrations']],
    filters: () => UI.sel('NH-44 Hyderabad – Bengaluru'),
    views: {
      users: { render: () => {
        const total = ROLES.reduce((a, r) => a + r[2], 0);
        return UI.kpis([
          { icon: 'users', bg: 'bg-info', value: total, label: 'User Accounts', delta: { value: ROLES.length, text: 'roles' } },
          { icon: 'checkc', bg: 'bg-good', value: 31, label: 'Signed In Now', delta: { dot: 'good', value: '18', text: 'patrol units on the mobile app' } },
          { icon: 'route', bg: 'bg-navy', value: 1, label: 'Corridor Configured', delta: { value: `${D.km} km`, text: `${D.corridor}, 2 control rooms` } },
          { icon: 'lock', bg: 'bg-violet', value: '100%', label: 'Admins on Two-Factor Sign-In', delta: { value: '0', text: 'failed sign-ins today' } },
        ], 'g4') + UI.card('Roles and permissions', UI.table([{ k: 'role', label: 'Role', fmt: (v, r) => `<span class="row" style="gap:9px"><span class="li-ic tone-info" style="width:28px;height:28px">${I(r.icon)}</span><b class="ink" style="white-space:nowrap">${v}</b></span>` }, { k: 'n', label: 'Users', r: 1, fmt: v => `<b class="ink num">${v}</b>` }, { k: 'perms', label: 'Permissions', fmt: v => chips(v) }, { k: 'note', label: 'Notes', fmt: v => `<span class="t2">${v}</span>` }, { k: 'x', label: '', r: 1, fmt: () => `<button class="btn sm ghost" data-act="Role editor opened (demo)">Edit</button>` }], ROLES.map(([icon, role, n, perms, note]) => ({ icon, role, n, perms, note }))), { icon: 'shieldcheck', cls: 'mb', right: UI.btn('Add Role', { sm: 1, icon: 'plus', toast: 'New role form opened (demo)' }) })
        + UI.card('Users', UI.table([{ k: 'name', label: 'User', fmt: (v, u) => `<span class="row" style="gap:9px"><span class="li-ic round bg-${u.me ? 'info' : 'gray'}" style="width:28px;height:28px;font-size:10.5px;font-weight:700">${(v.match(/\((\w+)\)/) || [0, v.replace('Patrol ', '')])[1]}</span><b class="ink">${v.replace(/ \(\w+\)/, '')}</b>${u.me ? UI.pill('You', 'info') : ''}</span>` }, { k: 'role', label: 'Role' }, { k: 'where', label: 'Location · shift' }, { k: 'last', label: 'Last activity' }, { k: 'status', label: 'Status', fmt: v => UI.pill(v, v === 'Active' ? 'good' : 'gray') }, { k: 'x', label: '', r: 1, fmt: () => `<button class="btn sm ghost" data-act="User details opened (demo)">Manage</button>` }], USERS) + `<div class="card-note mt">Showing 9 of ${total} accounts. Names are shown as initials in this demo.</div>`, { icon: 'users', cls: 'mb', right: UI.btn('Add User', { sm: 1, primary: 1, toast: 'New user form opened (demo)' }) });
      } },

      rules: { render: () => {
        const on = RULES.filter(r => r.on).length;
        return `<div class="grid g-3-1">
          ${UI.card('Alert rules', UI.table([{ k: 'rule', label: 'Rule', fmt: (v, r) => `<span class="row" style="gap:9px"><span class="li-ic tone-${D.sevTone[r.sev] === 'good' ? 'info' : D.sevTone[r.sev]}" style="width:28px;height:28px">${I(r.icon)}</span><b class="ink">${v}</b></span>` }, { k: 'trig', label: 'Trigger threshold' }, { k: 'sev', label: 'Severity', fmt: v => UI.sev(v) }, { k: 'notify', label: 'Notify' }, { k: 'auto', label: 'Automatic action' }, { k: 'on', label: 'Enabled', fmt: v => `<span style="white-space:nowrap">${toggle(v)}</span>` }], RULES), { icon: 'bell', right: `<span>${on} of ${RULES.length} enabled</span>${UI.btn('Add Rule', { sm: 1, primary: 1, toast: 'New rule form opened (demo)' })}` })}
          <div class="col">
            ${UI.card('Control-room alerts, last 24 hours', C.hbars({ unit: 'alerts', items: [['Accident', 14, 'alert'], ['Stalled vehicle', 10, 'car'], ['Camera offline', 9, 'videooff'], ['Toll lane wait', 6, 'toll'], ['Water on road', 4, 'rain'], ['Animal on road', 3, 'paw'], ['Wrong-way', 1, 'ban']].map(([label, value, icon]) => ({ label, value, icon })) }) + `<div class="card-note mt">The ${D.toll.flagged24} toll class-mismatch flags in the same period go to the toll audit queue, not the control room, so operators see about 50 alerts a day.</div>`, { icon: 'bars' })}
            ${UI.card('How rules work', `<div class="card-note">A rule turns a detection into an alert once its threshold is met. Severity sets the sound and position in the feed. Automatic actions that reach the public, such as VMS messages, can be set to need a supervisor's approval.</div><div class="mt">${UI.kv([['clock', 'Median detection to alert', D.response.detectToAlertSec + ' sec'], ['check', 'False alert rate, 30 days', '3.8%'], ['note', 'Last rule change', '12 Sep · depth 25 → 20 cm']])}</div>`, { icon: 'info' })}
          </div></div>`;
      } },

      system: { render: () => UI.kpis([
          { icon: 'pulse', bg: 'bg-good', value: '99.94%', label: 'Platform Uptime (30 days)', delta: { dot: 'good', value: '26 min', text: 'planned downtime' } },
          { icon: 'video', bg: 'bg-info', value: VQ.fmt(camOnline), unit: `/ ${VQ.fmt(D.assets.classes[0].count)}`, label: 'Camera Streams Processed', delta: { value: D.assets.classes[0].pct + '%', text: 'operational' }, go: 'assets/alerts' },
          { icon: 'cpu', bg: 'bg-navy', value: '86', unit: '/ 88', label: 'Edge AI Nodes Online', delta: { value: '2', text: 'in maintenance' } },
          { icon: 'clock', bg: 'bg-violet', value: D.response.detectToAlertSec, unit: 'sec', label: 'Detection to Alert', delta: { dir: 'down', value: '−18 sec', text: 'vs. last month', good: true } },
          { icon: 'db', bg: 'bg-gray', value: '61%', label: 'Video Storage Used', delta: { value: '30 days', text: 'retention' } },
        ], 'g5 compact') + secH('link', 'Integrations', '5 of 6 healthy · 1 degraded') + `<div class="grid g3">${INTEGRATIONS.map(([icon, name, desc, status, tone, sync, note]) => `<div class="card"><div class="row" style="gap:11px;align-items:flex-start"><div class="li-ic tone-${tone === 'good' ? 'info' : tone}">${I(icon)}</div><div class="grow" style="min-width:0"><div class="row between" style="gap:8px;align-items:flex-start"><h3 style="font-size:14px">${name}</h3>${UI.pill(status, tone)}</div><div class="small t2" style="margin-top:3px">${desc}</div></div></div>
            <hr class="sep"><div class="row between small" style="gap:10px"><span class="t2">Last sync <b class="ink num">${sync}</b></span><span class="t2" style="text-align:right">${note}</span></div></div>`).join('')}</div>`
        + secH('cpu', 'AI models', 'Precision measured on the monthly audited sample from this corridor') + `<div class="grid g4">${MODELS.map(([icon, name, ver, val, metric, desc, updated]) => `<div class="card"><div class="row between" style="align-items:flex-start;gap:8px"><div class="li-ic tone-violet">${I(icon)}</div>${UI.pill(ver, 'gray')}</div><h3 style="font-size:14px;margin-top:9px">${name}</h3><div class="small t2" style="margin:3px 0 10px;min-height:34px">${desc}</div>
            <div class="row between" style="align-items:flex-end"><div><div class="kpi-val">${val}</div><div class="kpi-lbl">${metric}</div></div><div class="small t2" style="text-align:right">Updated<br><b class="ink">${updated}</b></div></div></div>`).join('')}</div>`
        + `<div class="grid g-2-1 mt">
          ${UI.card('Platform services', UI.table([{ k: 's', label: 'Service' }, { k: 'st', label: 'Status', fmt: v => UI.pill(v, v === 'Healthy' ? 'good' : 'warn') }, { k: 'load', label: 'Load', fmt: v => `<div class="row" style="gap:8px"><div style="width:90px">${C.meter(v, v >= 80 ? 'warn' : '')}</div><span class="num small">${v}%</span></div>` }, { k: 'n', label: 'Note' }], [
            { s: '<b class="ink">Video ingest</b>', st: 'Healthy', load: 64, n: `${VQ.fmt(camOnline)} streams, 25 frames a second` }, { s: '<b class="ink">AI inference (edge and central)</b>', st: 'Healthy', load: 71, n: '18.4 lakh detections in 24 hours' },
            { s: '<b class="ink">Event and alert engine</b>', st: 'Healthy', load: 38, n: `${D.last24h.total} incidents and ${D.toll.flagged24} toll flags in 24 hours` }, { s: '<b class="ink">Evidence storage</b>', st: 'Healthy', load: 61, n: '412 TB of 675 TB used' },
            { s: '<b class="ink">Corridor fibre ring</b>', st: 'Degraded', load: 82, n: 'Running on the backup path between Km 96 and Km 104' },
          ]), { icon: 'net' })}
          ${UI.card('Security and audit', UI.kv([['lock', 'Data residency', 'MeitY-empanelled cloud, Hyderabad region'], ['shieldcheck', 'Last security audit', 'CERT-In empanelled auditor, Aug 2026'], ['eye', 'Number plates', 'Masked for all roles except auditor and police export'], ['note', 'Audit log', '1,284 user actions logged today'], ['refresh', 'Last backup', '16 Sep · 02:00 AM, verified']]), { icon: 'shield' })}
        </div>`,
      },
    },
  });
})();
