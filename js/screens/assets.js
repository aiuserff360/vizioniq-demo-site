/* =========================================================
   Screens · Assets & Maintenance (6 tabs).
   Funnel: whole estate (overview) -> where (map) -> what is wrong (alerts)
   -> who fixes it and when (maintenance) -> what to replace (lifecycle) -> reports.
   Shared totals come from VQ.data.assets; everything else is section data below.
   ========================================================= */
(() => {
  const { UI, C, data: D, I } = VQ;
  const A = D.assets;

  /* ---------- status vocabulary ---------- */
  const ST = { H: ['Healthy', 'good'], A: ['Attention', 'warn'], F: ['Fault / Offline', 'crit'], M: ['Under maintenance', 'info'] };
  const stColor = { H: 'var(--good)', A: 'var(--warn)', F: 'var(--crit)', M: 'var(--blue)' };
  const CLS = { cameras: ['Cameras', 'video'], vms: ['VMS Signs', 'sign'], power: ['Power &amp; IT', 'zap'], road: ['Road Assets', 'road'], sensors: ['Sensors', 'wifi'] };

  /* ---------- key assets shown on the maps (32 of 2,412). a = alert id, wo = open work order ---------- */
  const as = (id, cls, name, km, st, last, icon, x) => ({ id, cls, name, km, st, last, icon, ...(x || {}) });
  const assets = [
    as('CAM-0310', 'cameras', 'Fixed camera', 31, 'H', 'Now', 'video'), as('CAM-0960', 'cameras', 'PTZ camera', 96, 'H', 'Now', 'video', { below: 1 }),
    as('CAM-1010', 'cameras', 'Analytics camera', 101, 'F', '16 Sep, 08:31 AM', 'videooff', { wo: 'MT-5164', al: 1 }), as('CAM-1763', 'cameras', 'Analytics camera', 176.3, 'H', 'Now', 'video', { below: 1 }),
    as('CAM-2380', 'cameras', 'Fixed camera', 238, 'H', 'Now', 'video'), as('CAM-3600', 'cameras', 'Analytics camera', 360, 'A', '16 Sep, 06:09 AM', 'video', { wo: 'MT-5155', al: 1, below: 1 }),
    as('CAM-4180', 'cameras', 'Analytics camera', 418, 'H', 'Now', 'video'), as('CAM-5126', 'cameras', 'Analytics camera', 512.6, 'H', 'Now', 'video'),
    as('VMS-0070', 'vms', 'VMS gantry sign', 70, 'H', 'Now', 'sign'), as('VMS-0212', 'vms', 'VMS gantry sign', 212, 'H', 'Now', 'sign'), as('VMS-0316', 'vms', 'VMS gantry sign', 316, 'H', 'Now', 'sign', { below: 1 }),
    as('VMS-0390', 'vms', 'VMS gantry sign', 390, 'H', 'Now', 'sign'), as('VMS-0487', 'vms', 'VMS gantry sign', 487, 'A', '16 Sep, 07:25 AM', 'sign', { wo: 'MT-5160', al: 1 }),
    as('RDR-0583', 'power', 'FASTag reader, Lane 3', 58, 'A', '16 Sep, 07:49 AM', 'tag', { wo: 'MT-5161', al: 1, below: 1 }), as('PWR-0180', 'power', 'Power cabinet', 180, 'A', '16 Sep, 06:53 AM', 'zap', { wo: 'MT-5158', al: 1 }),
    as('NET-0262', 'power', 'Network switch node', 252, 'H', 'Now', 'net', { below: 1 }), as('PWR-0345', 'power', 'Power cabinet', 345, 'H', 'Now', 'zap'), as('PWR-0530', 'power', 'UPS battery bank', 530, 'M', '12 Sep, 10:20 AM', 'zap', { wo: 'MT-5136' }),
    as('LGT-0012', 'road', 'Lighting section', 12, 'H', 'Now', 'bulb', { below: 1 }), as('BAR-0142', 'road', 'Crash barrier', 142, 'H', '09 Sep (inspection)', 'barrier'), as('PAV-0268', 'road', 'Pavement section', 268, 'M', '15 Sep (planned work)', 'cone', { wo: 'MT-5120' }),
    as('FEN-0321', 'road', 'Median fence', 321.8, 'F', '10 Aug', 'barrier', { wo: 'MT-5093', al: 1 }), as('LGT-0429', 'road', 'Lighting pole', 429, 'F', '16 Sep, 05:11 AM', 'bulb', { wo: 'MT-5149', al: 1 }),
    as('DRN-0441', 'road', 'Side drain', 441, 'F', '19 Aug (inspection)', 'wrench', { wo: 'MT-5127', al: 1, below: 1 }), as('BAR-0455', 'road', 'Crash barrier', 455, 'M', '16 Sep, 04:30 AM', 'barrier', { wo: 'MT-5142', al: 1 }), as('SGN-0556', 'road', 'Overhead sign gantry', 556, 'H', '11 Sep (inspection)', 'sign', { below: 1 }),
    as('SNS-0085', 'sensors', 'Traffic counter', 85, 'H', 'Now', 'wifi', { below: 1 }), as('SNS-0200', 'sensors', 'Weigh-in-motion, Pullur', 200, 'H', 'Now', 'gauge', { below: 1 }), as('SNS-0296', 'sensors', 'Pavement temperature sensor', 296, 'A', '16 Sep, 03:39 AM', 'wifi', { wo: 'MT-5166', al: 1 }),
    as('SNS-0380', 'sensors', 'Traffic counter', 380, 'A', '16 Sep, 02:14 AM', 'wifi', { wo: 'MT-5167', al: 1, below: 1 }), as('SNS-0470', 'sensors', 'Rain gauge', 470, 'H', 'Now', 'cloud', { below: 1 }), as('SNS-0540', 'sensors', 'Visibility sensor', 540, 'H', 'Now', 'eye'),
  ];
  const asset = id => assets.find(a => a.id === id);
  const pin = (a, o) => ({ type: 'asset', km: a.km, icon: a.icon, tone: ST[a.st][1], below: a.below, go: a.al ? `assets/alerts/${a.id}` : null, callout: o && o.callout,
    tip: `<b>${a.id}</b> · ${a.name}<br>${D.kmLabel(a.km)} · ${D.nearest(a.km)}<br>${ST[a.st][0]}${a.wo ? ' · ' + a.wo : ''}` });

  /* ---------- today's open alerts: 5 high priority (2 new) + 6 lower ---------- */
  const alerts = [
    { id: 'CAM-1010', title: 'Camera offline', what: 'No video feed', at: '08:32 AM', sev: 'high', isNew: 1, kind: 'F', icon: 'videooff', thumb: 'cctv-camera.jpg', photo: 'cam-corridor-3.jpg', offline: 'No video feed since 08:32 AM',
      where: 'Km 101 · between Jadcherla and Kothakota, SB', expected: 'Live 1080p stream at 25 fps with analytics running', observed: 'No video since 08:32 AM. The camera does not answer ping; cabinet power is normal.', last: '16 Sep, 08:31 AM',
      affected: 'Incident, stalled-vehicle and wrong-way detection unavailable Km 96–106. CAM-1010 is the only analytics camera on this 10 km.', probable: 'Fibre or PoE switch port failure at the pole: the network link dropped while cabinet power stayed up.', conf: 78,
      risk: 'High. Morning peak, about 1,700 vehicles an hour pass unobserved. An incident here would be reported only by patrol or a 1033 call.', team: 'Crew C-2 Jadcherla · 16 km', eta: '25 mins', prio: 'P1 · restore within 4 hours', wo: 'MT-5164 (new)',
      backup: ['Point CAM-0960 PTZ (Km 96) south', 'Covers Km 96–99, 3 of the 10 km, until the camera is back'] },
    { id: 'DRN-0441', title: 'Side drain blocked · maintenance overdue', what: 'Causing live flooding', at: '08:21 AM', sev: 'high', isNew: 1, kind: 'F', icon: 'rain', thumb: 'flooding.jpg', photo: 'flooding.jpg',
      where: 'Km 441 · Penukonda underpass approach', expected: 'Drain carries run-off from the sag point to the outfall', observed: 'Outfall not flowing. Standing water 22 cm and rising on Lane 1 in both directions.', last: '19 Aug (monthly inspection)',
      affected: 'Root cause of live incident INC-2038: Lane 1 waterlogged both directions, queue 2.1 km, speed 28 km/h.', probable: 'Silt and plastic waste at the outfall. Desilting was ticketed on 02 Sep (MT-5127) and has not been done.', conf: 74,
      risk: 'High. At the current rain rate the depth passes 30 cm by 09:15 AM, unsafe for cars and two-wheelers.', team: 'Pump crew C-6 Penukonda · 9.2 km', eta: '12 mins', prio: 'P1 · overdue, open 14 days', wo: 'MT-5127 (overdue)',
      link: { go: 'incident/INC-2038/rootcause', title: 'Live now: Flooding / Waterlogging, INC-2038', text: 'Km 441 · detected 08:21 AM. The blocked drain is the root cause. Open the incident.' },
      backup: ['Deploy the mobile pump from Penukonda yard', 'Holds the water level while the drain is desilted'] },
    { id: 'RDR-0583', title: 'FASTag reader degraded', what: 'Read retries up 3x', at: '07:50 AM', sev: 'high', kind: 'A', icon: 'tag', thumb: 'toll-booth.jpg', photo: 'cam-toll-plaza.jpg',
      where: 'Km 58 · Raikal Toll Plaza, Lane 3', expected: 'First-attempt tag read of 98% or better', observed: 'First-attempt read 81%. Retries are up 3x since 07:50 AM.', last: '16 Sep, 07:49 AM',
      affected: 'Lane 3 processes 5.1 vehicles a minute against a normal 7.4. It adds to the plaza queue (INC-2037), longest wait 12 minutes.', probable: 'RF antenna module failing. The reader is under warranty until 30 Sep.', conf: 71,
      risk: 'Medium to high. Queue grows to 1.6 km by 09:10 AM; manual fallback raises the chance of missed toll.', team: 'Crew C-1 Shadnagar (toll systems) · 10 km', eta: '20 mins', prio: 'P1 · replace today', wo: 'MT-5161 (assigned)',
      link: { go: 'toll/queue', title: 'Live now: Raikal toll plaza queue, INC-2037', text: 'Lane 3 wait is above 10 minutes. Open the plaza queue view.' },
      backup: ['Switch Lane 3 to the handheld reader', 'And re-allocate Cash Lane 5 to FASTag until the reader is replaced'] },
    { id: 'PWR-0180', title: 'Power cabinet voltage fluctuation', what: 'Running on UPS', at: '06:54 AM', sev: 'high', kind: 'A', icon: 'zap', thumb: 'power-cabinet.jpg', photo: 'power-cabinet.jpg',
      where: 'Km 180 · between Pebbair and Kurnool', expected: 'Mains supply 230 V ± 5%', observed: 'Supply swinging 198–246 V. Cabinet switched to UPS at 06:54 AM; about 3 hours of battery left.', last: '16 Sep, 06:53 AM',
      affected: 'Feeds 6 cameras and 2 sensors on Km 176–184, including CAM-1763 which is watching the debris incident INC-2034. All go dark near 11:45 AM if the UPS drains.', probable: 'Utility feeder fault or a failing voltage stabiliser.', conf: 64,
      risk: 'High if not fixed before the battery runs out.', team: 'Crew C-3 Kurnool · 32 km', eta: '40 mins', prio: 'P1 · fix before 11:30 AM', wo: 'MT-5158 (in progress)',
      backup: ['Start the standby generator at Km 180', 'Keeps the 8 dependent devices up while the supply is repaired'] },
    { id: 'FEN-0321', title: 'Median fence broken · 340 m', what: 'Causing animal intrusion', at: '07:18 AM', sev: 'high', kind: 'F', icon: 'barrier', thumb: 'guardrail-damage.jpg', photo: 'guardrail-damage.jpg',
      where: 'Km 321.8 · Gooty grazing belt', expected: 'Continuous median fence, 1.8 m high', observed: '340 m gap. Cattle have crossed through it 8 times in 90 days; 4 animals are on Lane 1 now.', last: '10 Aug',
      affected: 'Root cause of live incident INC-2032: cattle on the carriageway, 6 hard-braking events since 07:18 AM.', probable: 'Fence posts removed to make a grazing path. Reported 11 Aug; repair MT-5093 has been open 36 days.', conf: 80,
      risk: 'High. The herd crosses every morning between 06:30 and 08:00 until the gap is closed.', team: 'Crew C-4 Gooty · 17 km', eta: 'Repair booked 19–20 Sep', prio: 'P1 · overdue, open 36 days', wo: 'MT-5093 (overdue)',
      link: { go: 'incident/INC-2032/rootcause', title: 'Live now: Animal on Highway, INC-2032', text: 'Km 322 · detected 07:18 AM. The fence gap is the root cause. Open the incident.' },
      backup: ['Place temporary barricades across the gap', 'Patrol P-11 is on site and can hold the herd back until then'] },
    { id: 'VMS-0487', title: 'VMS partial display', what: 'Right third of panel dark', at: '07:26 AM', sev: 'medium', kind: 'A', icon: 'sign', thumb: 'vms-sign.jpg', photo: 'vms-sign.jpg',
      where: 'Km 487 · between Bagepalli and Chikkaballapur, SB', expected: 'Full three-line message', observed: 'Right third of the panel is dark, so messages are cut short.', last: '16 Sep, 07:25 AM',
      affected: 'The “Fog – 60 km/h” advisory for Km 530–548 is unreadable on this sign. Three other signs still carry it.', probable: 'LED module or driver card failure in panel column 3.', conf: 69,
      risk: 'Medium. Warning coverage before the fog stretch is reduced, not lost.', team: 'Crew C-7 Chikkaballapur · 23 km', eta: '17 Sep, with the VMS inspection', prio: 'P2 · within 48 hours', wo: 'MT-5160 (scheduled)',
      backup: ['Repeat the message on VMS-0452 and VMS-0518', 'Both are healthy and cover the same approach'] },
    { id: 'CAM-3600', title: 'Camera image quality degraded', what: 'Sharpness score 52', at: '06:10 AM', sev: 'medium', kind: 'A', icon: 'video', thumb: 'cctv-camera.jpg', photo: 'cam-corridor-2.jpg',
      where: 'Km 360 · Anantapur, SB', expected: 'Image sharpness score of 80 or better', observed: 'Score 52, haze across the lower half of the frame.', last: '16 Sep, 06:09 AM',
      affected: 'Detection confidence on Km 355–365 is down from 96% to 81%. Number-plate reads are unreliable.', probable: 'Dirt film on the lens housing after overnight rain.', conf: 83,
      risk: 'Medium. Detection still works by day; night performance will be poor.', team: 'Crew C-5 Anantapur · 4 km', eta: 'Today 11:00 AM, camera cleaning round', prio: 'P2 · today', wo: 'MT-5155 (scheduled today)',
      backup: ['Raise analytics sensitivity on CAM-3550 and CAM-3650', 'Neighbouring cameras overlap about half of this view'] },
    { id: 'LGT-0429', title: 'Lighting pole not working', what: 'No illumination', at: '05:12 AM', sev: 'medium', kind: 'F', icon: 'bulb', thumb: 'street-light.jpg', photo: 'street-light.jpg',
      where: 'Km 429 · Penukonda', expected: 'Lamp on from dusk to dawn, 150 W draw', observed: 'No current draw since 05:12 AM.', last: '16 Sep, 05:11 AM',
      affected: 'A 60 m dark patch at Km 429. Night detection on the nearest camera is reduced.', probable: 'LED driver failure.', conf: 74,
      risk: 'Low by day, medium after 06:20 PM.', team: 'Crew C-6 Penukonda · 12 km', eta: '18 Sep, lighting and electrical check', prio: 'P3 · within 72 hours', wo: 'MT-5149 (scheduled)',
      backup: ['No redundant asset', 'Adjacent poles at 30 m spacing give partial light'] },
    { id: 'BAR-0455', title: 'Barrier damage · under repair', what: '24 m of beam deformed', at: '04:36 AM', sev: 'medium', kind: 'M', icon: 'barrier', thumb: 'guardrail-damage.jpg', photo: 'guardrail-damage.jpg',
      where: 'Km 455 · between Penukonda and Bagepalli, SB', expected: 'Continuous W-beam crash barrier', observed: '24 m of beam deformed after a truck strike at 04:31 AM. The truck drove on.', last: '16 Sep, 04:30 AM',
      affected: 'No containment on the left edge for 24 m. Cones and reflective tape are in place.', probable: 'Vehicle impact, seen on camera.', conf: 95,
      risk: 'Medium. A second strike here would not be contained.', team: 'Crew C-6 Penukonda · 14 km', eta: '19 Sep, with the barrier inspection', prio: 'P2 · this week', wo: 'MT-5142 (materials ordered)',
      backup: ['Add water-filled barriers', '12 units available at Penukonda yard'] },
    { id: 'SNS-0296', title: 'Pavement temperature sensor drifting', what: 'Reads 9°C above neighbours', at: '03:40 AM', sev: 'low', kind: 'A', icon: 'wifi', thumb: '', photo: '',
      where: 'Km 296 · Gooty ghat section', expected: 'Within 2°C of the sensors at Km 290 and Km 302', observed: 'Reading 9°C above both neighbours since 03:40 AM.', last: '16 Sep, 03:39 AM',
      affected: 'The heavy-vehicle overheating forecast for the Gooty gradient uses this sensor. It is switched to the Km 290 sensor for now.', probable: 'Calibration drift.', conf: 66,
      risk: 'Low.', team: 'Crew C-4 Gooty · 9 km', eta: '18 Sep', prio: 'P4 · this week', wo: 'MT-5166 (scheduled)', backup: ['Use the Km 290 sensor', 'Already switched automatically'] },
    { id: 'SNS-0380', title: 'Traffic counter battery low', what: 'Battery at 14%', at: '02:15 AM', sev: 'low', kind: 'A', icon: 'wifi', thumb: '', photo: '',
      where: 'Km 380 · between Anantapur and Marur toll plaza', expected: 'Battery above 30%, solar charging by day', observed: 'Battery 14% and not charging.', last: '16 Sep, 02:14 AM',
      affected: 'Vehicle counts for Km 370–390 stop in about 2 days if the battery is not changed.', probable: 'Solar panel fault or a dirty panel.', conf: 58,
      risk: 'Low.', team: 'Crew C-5 Anantapur · 20 km', eta: '18–19 Sep, sensor calibration round', prio: 'P4 · this week', wo: 'MT-5167 (scheduled)', backup: ['Estimate counts from the Marur plaza', 'Toll transactions give the same flow within 4%'] },
  ];
  const high = alerts.filter(a => a.sev === 'high'), lower = alerts.filter(a => a.sev !== 'high');
  const kTone = k => ST[k][1];

  /* thumbnail removes itself if the image file is missing; the icon tile beside it carries the meaning */
  const thumb = img => img ? `<img class="li-thumb" src="${UI.IMG(img)}" alt="" loading="lazy" onerror="this.remove()">` : '';
  const newTag = '<span class="pill solid-crit" style="font-size:10px;padding:1px 6px;margin-left:6px;vertical-align:1px">NEW</span>';
  const alertRow = (a, o) => { o = o || {}; const on = o.sel === a.id;
    return `<div class="li click" ${o.set ? `data-set="al=${a.id}"` : `data-go="assets/alerts/${a.id}"`} style="align-items:center;${on ? 'background:var(--blue-100);box-shadow:inset 3px 0 0 var(--blue)' : ''}">
      <div class="li-ic tone-${kTone(a.kind)}" style="width:28px;height:28px">${I(a.icon)}</div>${thumb(a.thumb)}
      <div class="li-body"><div class="li-title ${a.sev === 'high' ? 'crit' : a.sev === 'medium' ? 'warn' : ''}" style="line-height:1.25">${a.title}${a.isNew ? newTag : ''}</div><div class="li-sub">${a.id} · ${D.corridor}, ${a.where.split(' · ')[0]}</div><div class="li-sub">${a.what} | ${a.at}</div></div>
      <div class="li-meta">${UI.sev(a.sev)}</div><div class="li-chev">${I('chev')}</div></div>`; };

  /* ---------- work orders (12 of 64 open) ---------- */
  const crews = [['C-1', 'Shadnagar', 7], ['C-2', 'Jadcherla', 8], ['C-3', 'Kurnool', 9], ['C-4', 'Gooty', 11], ['C-5', 'Anantapur', 8], ['C-6', 'Penukonda', 14], ['C-7', 'Chikkaballapur', 7]]; /* sums to 64 */
  const WO = [
    { id: 'MT-5127', asset: 'DRN-0441', job: 'Desilt side drain', km: 441, type: 'Corrective', prio: 'P1', crew: 'C-6 Penukonda', raised: '02 Sep', due: '05 Sep', status: ['Overdue · open 14 days', 'crit'], go: 'incident/INC-2038/rootcause', note: 'Root cause of INC-2038' },
    { id: 'MT-5093', asset: 'FEN-0321', job: 'Repair 340 m of median fence', km: 321.8, type: 'Corrective', prio: 'P1', crew: 'C-4 Gooty', raised: '11 Aug', due: '25 Aug', status: ['Overdue · open 36 days', 'crit'], go: 'incident/INC-2032/rootcause', note: 'Root cause of INC-2032' },
    { id: 'MT-5164', asset: 'CAM-1010', job: 'Diagnose and restore offline camera', km: 101, type: 'Corrective', prio: 'P1', crew: 'C-2 Jadcherla', raised: '16 Sep', due: '16 Sep, 12:30 PM', status: ['New', 'violet'], go: 'assets/alerts/CAM-1010' },
    { id: 'MT-5161', asset: 'RDR-0583', job: 'Replace Lane 3 FASTag reader', km: 58, type: 'Corrective', prio: 'P1', crew: 'C-1 Shadnagar', raised: '16 Sep', due: '16 Sep, 02:00 PM', status: ['Assigned', 'info'], go: 'assets/alerts/RDR-0583' },
    { id: 'MT-5158', asset: 'PWR-0180', job: 'Repair supply and stabiliser', km: 180, type: 'Corrective', prio: 'P1', crew: 'C-3 Kurnool', raised: '16 Sep', due: '16 Sep, 11:30 AM', status: ['In progress', 'info'], go: 'assets/alerts/PWR-0180' },
    { id: 'MT-5155', asset: 'CAM-3600', job: 'Clean lens and refocus', km: 360, type: 'Preventive', prio: 'P2', crew: 'C-5 Anantapur', raised: '16 Sep', due: '16 Sep, 11:00 AM', status: ['Scheduled today', 'good'], go: 'assets/alerts/CAM-3600' },
    { id: 'MT-5160', asset: 'VMS-0487', job: 'Replace LED module, column 3', km: 487, type: 'Corrective', prio: 'P2', crew: 'C-7 Chikkaballapur', raised: '16 Sep', due: '17 Sep', status: ['Scheduled', 'good'], go: 'assets/alerts/VMS-0487' },
    { id: 'MT-5142', asset: 'BAR-0455', job: 'Replace 24 m of crash barrier', km: 455, type: 'Corrective', prio: 'P2', crew: 'C-6 Penukonda', raised: '16 Sep', due: '19 Sep', status: ['Materials ordered', 'warn'], go: 'assets/alerts/BAR-0455' },
    { id: 'MT-5149', asset: 'LGT-0429', job: 'Replace LED driver', km: 429, type: 'Corrective', prio: 'P3', crew: 'C-6 Penukonda', raised: '16 Sep', due: '18 Sep', status: ['Scheduled', 'good'], go: 'assets/alerts/LGT-0429' },
    { id: 'MT-5120', asset: 'PAV-0268', job: 'Resurface Lane 1, permit RW-0916', km: 268, type: 'Preventive', prio: 'P3', crew: 'C-4 Gooty', raised: '08 Sep', due: '18 Sep', status: ['In progress', 'info'], go: 'incident/INC-2035', note: 'Lane closure INC-2035' },
    { id: 'MT-5136', asset: 'PWR-0530', job: 'Replace UPS battery bank', km: 530, type: 'Preventive', prio: 'P3', crew: 'C-7 Chikkaballapur', raised: '10 Sep', due: '19 Sep', status: ['In progress', 'info'] },
    { id: 'MT-5166', asset: 'SNS-0296', job: 'Recalibrate temperature sensor', km: 296, type: 'Preventive', prio: 'P4', crew: 'C-4 Gooty', raised: '16 Sep', due: '18 Sep', status: ['Scheduled', 'good'], go: 'assets/alerts/SNS-0296' },
  ];

  /* overview: maintenance schedule (mockup) */
  const sched = [['16', 'Camera Cleaning', 'Km 352 – 372', 'Crew C-5 · includes CAM-3600'], ['17', 'VMS Inspection', 'Km 470 – 500', 'Crew C-7 · includes VMS-0487'], ['18', 'Lighting &amp; Electrical Check', 'Km 420 – 440', 'Crew C-6 · includes LGT-0429'], ['19', 'Roadside Barrier Inspection', 'Km 440 – 460', 'Crew C-6 · includes BAR-0455']];

  /* week plan 16–22 Sep. [crewIdx, startDay(0=Tue 16), span, label, kind p|c|o] */
  const days = [['Tue', 16], ['Wed', 17], ['Thu', 18], ['Fri', 19], ['Sat', 20], ['Sun', 21], ['Mon', 22]];
  const plan = [
    [0, 0, 1, 'Lane 3 reader · Raikal', 'c', 'Replace Lane 3 FASTag reader, Raikal (MT-5161)'], [0, 2, 1, 'UPS check · Km 58', 'p', 'Plaza UPS check, Km 58'], [0, 4, 1, 'Lighting · Km 0–30', 'p', 'Lighting check, Km 0–30'],
    [1, 0, 1, 'CAM-1010 restore', 'c', 'Restore offline camera CAM-1010, Km 101 (MT-5164)'], [1, 3, 2, 'Camera cleaning · Km 80–110', 'p', 'Camera cleaning, Km 80–110'],
    [2, 0, 2, 'PWR-0180 supply repair · Km 180', 'c', 'Repair supply and stabiliser, PWR-0180 (MT-5158)'], [2, 3, 1, 'Signs · Km 200–240', 'p', 'Sign cleaning, Km 200–240'], [2, 6, 1, 'Cabinets · Km 150–212', 'p', 'Power cabinet audit, Km 150–212'],
    [3, 0, 3, 'Resurfacing · Km 267–269 (RW-0916)', 'p', 'Resurface Lane 1, Km 267–269, permit RW-0916 (MT-5120)'], [3, 3, 2, 'Fence repair · Km 321.8 (overdue)', 'o', 'Repair 340 m of median fence, Km 321.8 (MT-5093, open 36 days)'],
    [4, 0, 1, 'Cameras · Km 352–372', 'p', 'Camera cleaning, Km 352–372, includes CAM-3600'], [4, 2, 2, 'Sensor calibration · Km 360–400', 'p', 'Sensor calibration, Km 360–400, includes SNS-0380'], [4, 6, 1, 'VMS · Km 340–400', 'p', 'VMS inspection, Km 340–400'],
    [5, 0, 2, 'Pump out, desilt drain · Km 441 (overdue)', 'o', 'Pump out and desilt side drain, Km 441 (MT-5127, open 14 days)'], [5, 2, 1, 'Lighting · Km 420–440', 'p', 'Lighting and electrical check, Km 420–440, includes LGT-0429'], [5, 3, 1, 'Barriers · Km 440–460', 'p', 'Roadside barrier inspection, Km 440–460, and BAR-0455 repair'], [5, 6, 1, 'Drains · Km 430–470', 'p', 'Drain survey, Km 430–470'],
    [6, 1, 1, 'VMS · Km 470–500', 'p', 'VMS inspection, Km 470–500, includes VMS-0487'], [6, 2, 2, 'UPS battery bank · Km 530', 'p', 'Replace UPS battery bank, PWR-0530 (MT-5136)'], [6, 6, 1, 'Cameras · Km 530–570', 'p', 'Camera cleaning, Km 530–570'],
  ];
  const kindCol = { p: 'var(--s1)', c: 'var(--s2)', o: 'var(--crit)' };
  const gantt = () => `<div class="legend" style="margin-bottom:8px"><span><i class="sq" style="background:var(--s1)"></i>Preventive</span><span><i class="sq" style="background:var(--s2)"></i>Corrective</span><span><i class="sq" style="background:var(--crit)"></i>Overdue work, now booked</span></div>
    <div style="display:grid;grid-template-columns:150px minmax(0,1fr);font-size:12px;border:1px solid var(--line-2);border-radius:8px;overflow:hidden">
      <div style="background:var(--blue-50);padding:7px 10px;font-weight:600;color:var(--ink)">Crew</div>
      <div style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));background:var(--blue-50)">${days.map(([d, n], i) => `<div style="padding:7px 8px;font-weight:600;color:var(--ink);border-left:1px solid var(--line-2)">${d} ${n}${i === 0 ? ' <span class="pill info" style="font-size:10px;padding:0 5px">Today</span>' : ''}</div>`).join('')}</div>
      ${crews.map((c, ci) => `<div style="padding:8px 10px;border-top:1px solid var(--line-2)"><b class="ink">${c[0]}</b> <span class="t2">${c[1]}</span></div>
      <div style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:0;border-top:1px solid var(--line-2);align-items:center;background:linear-gradient(90deg,var(--blue-50) 0,var(--blue-50) 14.2857%,transparent 14.2857%)">${plan.filter(p => p[0] === ci).map(p => `<div data-tip="<b>${p[5]}</b><br>${c[0]} ${c[1]} · ${days[p[1]][0]} ${days[p[1]][1]}${p[2] > 1 ? ' – ' + days[p[1] + p[2] - 1][0] + ' ' + days[p[1] + p[2] - 1][1] : ''} Sep" style="grid-row:1;grid-column:${p[1] + 1} / span ${p[2]};margin:5px 3px;padding:4px 8px;border-radius:5px;background:${kindCol[p[4]]};color:#fff;font-size:11.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p[3]}</div>`).join('')}</div>`).join('')}
    </div>`;

  /* ---------- lifecycle data ---------- */
  const ageBands = ['0–2 yrs', '3–5 yrs', '6–8 yrs', '9+ yrs'];
  const ageBy = { cameras: [412, 520, 248, 68], vms: [48, 96, 54, 18], power: [38, 58, 34, 12], road: [72, 148, 162, 104], sensors: [124, 118, 56, 22] }; /* each row sums to its class count */
  const life = [['cameras', 7, 96, 1.8], ['vms', 10, 12, 14], ['power', 8, 14, 3.5], ['road', 15, 58, 1.2], ['sensors', 8, 42, 0.9]]; /* class, design life, count at/past, unit cost lakh */
  const lifeRows = life.map(([k, yrs, n, unit]) => { const c = A.classes.find(x => x.key === k); return { cls: c.label, icon: c.icon, yrs, n, pct: n / c.count * 100, unit, cost: Math.round(n * unit * 10) / 10 }; });
  const lifeTotal = { n: lifeRows.reduce((a, r) => a + r.n, 0), cost: Math.round(lifeRows.reduce((a, r) => a + r.cost, 0) * 10) / 10 }; /* 222 assets, ₹497.2 lakh */
  const forecast = [138, 164, 112, 83.2], budget = [120, 120, 100, 100]; /* forecast sums to 497.2; budget 440 */
  const warranty = [['tag', '6 FASTag readers · Raikal Toll Plaza', 'Includes the degraded Lane 3 reader. Claim before expiry.', '30 Sep', 'crit', 'assets/alerts/RDR-0583'], ['video', '64 PTZ cameras · Km 0 – 85', '2023 batch. 3 have open image-quality tickets.', '14 Oct', 'warn'], ['sign', '12 VMS controllers · Km 200 – 320', 'Controller firmware update due before expiry.', '02 Nov', 'warn'], ['zap', '18 UPS units · Km 340 – 470', 'Battery health test recommended before the date.', '21 Nov', 'info'], ['wifi', '40 radar traffic counters · Km 85 – 265', 'No open faults.', '09 Dec', 'info']]; /* 140 assets */

  /* ---------- reports ---------- */
  const reports = [
    ['pulse', 'Asset health summary', 'Counts by status and class, open faults, and the assets that changed state.', 'Last 7 days', 'Today, 06:00 AM', ['PDF', 'XLSX']],
    ['shieldcheck', 'SLA and uptime by class', 'Availability against the contract target for cameras, VMS, power and IT, and sensors.', 'Last 30 days', '15 Sep, 06:00 AM', ['PDF', 'XLSX']],
    ['cal', 'Maintenance compliance', 'Preventive tasks done on time, overdue work orders and their age, by crew.', 'Month to date', '15 Sep, 07:30 AM', ['PDF', 'XLSX']],
    ['alert', 'Fault analysis', 'Faults by cause, repeat failures, mean time to repair, and incidents traced to asset faults.', 'Last 90 days', '01 Sep, 06:00 AM', ['PDF']],
    ['refresh', 'Lifecycle and replacement plan', 'Age profile, assets past design life, 12-month replacement forecast against budget.', 'FY 2026–27', '01 Sep, 06:00 AM', ['PDF', 'XLSX']],
    ['users', 'Contractor performance', 'Response and repair times against SLA, rework rate and penalties by maintenance contractor.', 'Last quarter', '01 Jul, 06:00 AM', ['PDF']],
  ];

  const donutItems = () => [['Healthy', A.healthy, 'var(--good)'], ['Attention', A.attention, 'var(--warn)'], ['Fault / Offline', A.fault, 'var(--crit)'], ['Under Maintenance', A.maintenance, 'var(--blue)']].map(([label, value, color]) => ({ label, value, color, text: VQ.fmt(value) }));
  const statusPill = a => UI.pill(ST[a.st][0], ST[a.st][1]);
  const assetCols = full => [{ k: 'id', label: 'Asset ID', fmt: (v, a) => `<span class="row" style="gap:8px;flex-wrap:nowrap;white-space:nowrap"><span style="color:${stColor[a.st]};display:inline-flex;width:16px;height:16px">${I(a.icon)}</span><b class="ink">${v}</b></span>` }, { k: 'name', label: full ? 'Asset · class' : 'Asset', fmt: (v, a) => `<span style="white-space:nowrap">${v}</span>` + (full ? `<div class="small t2">${CLS[a.cls][0]}</div>` : '') },
    { k: 'km', label: 'Km · nearest place', fmt: (v, a) => `<span style="white-space:nowrap"><b class="ink">${D.kmLabel(v)}</b> · ${D.nearest(a.km)}</span>` }, { k: 'st', label: 'Status', fmt: (_, a) => statusPill(a) }, { k: 'last', label: 'Last healthy' },
    ...(full ? [{ k: 'wo', label: 'Open ticket', fmt: (v, a) => v ? `<span class="row" style="gap:4px;flex-wrap:nowrap;white-space:nowrap"><b class="ink">${v}</b>${a.go ? `<span class="li-chev" style="display:inline-flex">${I('chev')}</span>` : ''}</span>` : '<span class="muted">None</span>' }] : [])];
  const withGo = a => ({ ...a, go: a.al ? `assets/alerts/${a.id}` : null });

  VQ.screen('assets', {
    title: 'Assets &amp; Maintenance', sub: 'Monitor. Detect. Maintain. Keep Highways Moving.',
    headRight: () => `<div class="grid kpis compact" style="grid-template-columns:repeat(5,auto);margin:0">${A.classes.map(c => UI.kpi({ icon: c.icon, bg: c.tone === 'good' ? 'bg-good' : 'bg-warn', value: VQ.fmt(c.count), label: c.label, delta: { dot: c.tone, value: c.pct + '%', text: c.word }, go: 'assets/map' })).join('')}</div>`,
    tabs: [['overview', 'Overview'], ['map', 'Asset Map'], ['alerts', 'Alerts'], ['maintenance', 'Maintenance'], ['lifecycle', 'Lifecycle'], ['reports', 'Reports']],
    filters: () => UI.sel('NH-44') + UI.sel('All Asset Types') + UI.sel('All Status') + UI.sel('Last 7 days'),
    values: ['Well-maintained assets prevent incidents.', 'Reliable infrastructure keeps traffic moving.', 'Less downtime. Higher productivity.', 'Efficient assets reduce emissions.'],
    views: {
      /* ---------- Overview (mockup 08) ---------- */
      overview: { render: () => {
        const mode = VQ.state.mode || 'map';
        const ids = ['CAM-0310', 'RDR-0583', 'CAM-1010', 'PWR-0180', 'VMS-0212', 'PAV-0268', 'FEN-0321', 'CAM-3600', 'VMS-0390', 'LGT-0429', 'DRN-0441', 'BAR-0455', 'VMS-0487', 'PWR-0530', 'SNS-0540'];
        const call = { 'CAM-1010': { title: 'Camera', lines: ['Km 101', 'Offline'], icon: 'alert', iconTone: 'crit', lastTone: 'crit', dx: 46 }, 'VMS-0212': { title: 'VMS Sign', lines: ['Km 212', 'Operational'], icon: 'sign', iconTone: 'good', lastTone: 'good', dx: 40 }, 'DRN-0441': { title: 'Side Drain', lines: ['Km 441', 'Maintenance overdue'], icon: 'wrench', iconTone: 'crit', lastTone: 'crit', gap: 46, dx: 10 } };
        const shown = ids.map(asset);
        const body = mode === 'map' ? VQ.Map.render({ h: 412, plainRoute: 1, legend: 'assets', pins: shown.map(a => pin(a, { callout: call[a.id] })) })
          : UI.table(assetCols(false), shown.map(withGo));
        return `<div class="grid g-2-1">
          ${UI.card('Asset Map', body, { right: `<span class="small">15 key assets of ${VQ.fmt(A.total)}</span>${UI.seg('mode', [['map', 'Map View'], ['list', 'List View']], mode)}<button class="btn ghost sm" style="min-width:0;padding:0 8px" aria-label="Open full asset map" data-tip="Open the full asset map" data-go="assets/map">${I('expand')}</button>` })}
          ${UI.card('Recent Asset Alerts', `<div class="list">${[...alerts].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 6).map(a => alertRow(a)).join('')}</div>`, { right: `<span>${UI.pill(`${D.home.assetAlerts} high priority · ${D.home.assetNew} new`, 'crit')}</span>${UI.viewAll('assets/alerts')}` })}
        </div>
        <div class="grid" style="grid-template-columns:minmax(0,5fr) minmax(0,5fr) minmax(0,4fr) minmax(0,3fr)">
          ${UI.card('Asset Health', C.donut({ size: 150, thick: 24, center: { v: VQ.fmt(A.total), l: 'Total Assets' }, items: donutItems() }) + `<div class="card-note mt">Lowest health by class: sensors ${A.classes[4].pct}%, road assets ${A.classes[3].pct}%. ${A.fault} assets are in fault, ${alerts.filter(x => x.kind === 'F').length} of them on today's alert list.</div>`)}
          ${UI.card('Alerts Trend', C.bars({ h: 190, yMax: 40, stacked: 1, unit: 'alerts', labels: ['10 Sep', '11 Sep', '12 Sep', '13 Sep', '14 Sep', '15 Sep', '16 Sep'], series: [{ name: 'Fault', color: 'var(--crit)', data: [5, 6, 7, 6, 8, 7, 4] }, { name: 'Attention', color: 'var(--warn)', data: [7, 8, 9, 8, 10, 9, 6] }, { name: 'Maintenance', color: 'var(--blue)', data: [3, 4, 5, 4, 6, 5, 1] }] }) + '<div class="card-note">New alerts raised per day. 16 Sep is the count up to 08:45 AM.</div>')}
          ${UI.card('Maintenance Schedule', `<div class="list">${sched.map(s => `<div class="li click" data-go="assets/maintenance" style="align-items:center"><div style="width:42px;flex:none;text-align:center;background:var(--blue-50);border-radius:7px;padding:4px 0;line-height:1.15"><b class="ink" style="font-size:16px">${s[0]}</b><div class="small t2">Sep</div></div><div class="li-body"><div class="li-title">${s[1]}</div><div class="li-sub">${D.corridor}, ${s[2]}</div><div class="li-sub">${s[3]}</div></div><div class="li-chev">${I('chev')}</div></div>`).join('')}</div>`, { right: UI.viewAll('assets/maintenance') })}
          ${UI.card('Quick Actions', `<div class="qa stack" style="grid-template-columns:repeat(2,minmax(0,1fr))">${[['wrench', 'Raise Maintenance Ticket', null, 'Maintenance ticket form opened (demo)'], ['crosshair', 'Locate Asset on Map', 'assets/map'], ['file', 'View Asset Details', 'assets/alerts'], ['cal', 'Schedule Maintenance', 'assets/maintenance']].map(q => `<button ${q[2] ? `data-go="${q[2]}"` : `data-act="${q[3]}"`} style="padding:14px 6px">${I(q[0])}<span>${q[1]}</span></button>`).join('')}</div>`)}
        </div>`;
      } },

      /* ---------- Asset map ---------- */
      map: { render: () => {
        const f = VQ.state.cls || 'all'; const vis = assets.filter(a => f === 'all' || a.cls === f);
        const cnt = k => vis.filter(a => a.st === k).length;
        const callouts = { 'CAM-1010': { title: 'CAM-1010 offline', lines: ['No camera cover Km 96–106'], tone: 'crit', icon: 'videooff', iconTone: 'crit', dx: 78 }, 'DRN-0441': { title: 'DRN-0441 blocked', lines: ['MT-5127 overdue · flooding now'], tone: 'dark', gap: 46, dx: 30 } };
        const risk = [
          { icon: 'videooff', tone: 'crit', title: 'Km 96 – 106 · no camera analytics', sub: 'CAM-1010 is down. Incident and wrong-way detection are lost on 10 km.', sub2: 'Redundancy: CAM-0960 PTZ can cover Km 96–99 if pointed south.', pill: UI.pill('10 km blind', 'crit'), go: 'assets/alerts/CAM-1010' },
          { icon: 'rain', tone: 'crit', title: 'Km 440.6 – 441.3 · drainage failed', sub: 'DRN-0441 is blocked and there is no water-level sensor here.', sub2: 'Flooding is seen only by camera. Live incident INC-2038.', pill: UI.pill('Live incident', 'crit'), go: 'incident/INC-2038/rootcause' },
          { icon: 'barrier', tone: 'crit', title: 'Km 321.6 – 322.0 · median open', sub: 'FEN-0321: 340 m of fence missing since 11 Aug.', sub2: 'Cattle on the carriageway now. Live incident INC-2032.', pill: UI.pill('Live incident', 'crit'), go: 'incident/INC-2032/rootcause' },
          { icon: 'video', tone: 'warn', title: 'Km 355 – 365 · detection weakened', sub: 'CAM-3600 image is hazy. Detection confidence is 81%, normally 96%.', sub2: 'Lens cleaning is booked for 11:00 AM today.', pill: UI.pill('Reduced', 'warn'), go: 'assets/alerts/CAM-3600' },
          { icon: 'zap', tone: 'warn', title: 'Km 176 – 184 · on battery', sub: 'PWR-0180 is on UPS. 6 cameras and 2 sensors depend on it.', sub2: 'All go dark near 11:45 AM unless the supply is repaired.', pill: UI.pill('About 3 h left', 'warn'), go: 'assets/alerts/PWR-0180' },
          { icon: 'tag', tone: 'warn', title: 'Raikal Toll Plaza · Lane 3', sub: 'RDR-0583 tag reader degraded, first-read rate 81%.', sub2: 'Adds to the plaza queue, INC-2037.', pill: UI.pill('Slow lane', 'warn'), go: 'toll/queue' },
        ];
        return `${UI.card('Assets on NH-44', VQ.Map.render({ h: 460, kmTicks: 50, plainRoute: 1, legend: 'assets', highlight: f === 'all' || f === 'cameras' ? [96, 106] : null, pins: vis.map(a => pin(a, { callout: callouts[a.id] })) }),
          { icon: 'map', right: `<span class="small">${vis.length} key assets shown of ${VQ.fmt(A.total)}</span>${UI.seg('cls', [['all', 'All'], ['cameras', 'Cameras'], ['vms', 'VMS'], ['power', 'Power &amp; IT'], ['road', 'Road'], ['sensors', 'Sensors']], f)}` })}
        <div class="grid g-2-1">
          ${UI.card(`Visible assets${f === 'all' ? '' : ' · ' + CLS[f][0]}`, UI.table(assetCols(true), [...vis].sort((a, b) => a.km - b.km).map(withGo)) + '<div class="card-note mt">Rows with an open alert open that alert.</div>', { right: `<span class="row wrap" style="gap:6px">${['H', 'A', 'F', 'M'].map(k => UI.pill(`${cnt(k)} ${ST[k][0]}`, ST[k][1])).join('')}</span>` })}
          <div class="col">
            ${UI.card('Coverage at risk', UI.statRow([['10 km', 'without camera analytics', 'crit'], ['6', 'stretches affected', 'warn'], ['3', 'live incidents linked', 'crit']]) + `<div class="mt"></div>` + UI.list(risk), { icon: 'shield', right: '<span>Asset failure impact</span>' })}
            ${UI.card('What to do first', UI.insight('sparkles', 'violet', 'Cover the Km 96–106 gap now', 'Point CAM-0960 south and ask patrol P-05 to pass Km 99–106 every 30 minutes until CAM-1010 is back.', 'assets/alerts/CAM-1010') + UI.insight('wrench', 'crit', 'Two failures are already incidents', 'The blocked drain and the broken fence are both overdue work orders. See the maintenance backlog.', 'assets/maintenance'))}
            ${UI.card('Health by class, whole corridor', A.classes.map(c => `<div class="hbar" style="grid-template-columns:minmax(118px,40%) 1fr 84px" data-tip="<b>${c.label}</b>: ${VQ.fmt(c.count)} assets, ${VQ.fmt(Math.round(c.count * (100 - c.pct) / 100))} not ${c.word}"><div class="lab">${I(c.icon)}<span>${c.label}</span></div>${C.meter(c.pct, c.tone)}<div class="val">${c.pct}% <span class="muted" style="font-weight:500">of ${VQ.fmt(c.count)}</span></div></div>`).join('') + '<div class="card-note mt">The map shows 32 key assets. These figures cover all 2,412.</div>')}
          </div>
        </div>`;
      } },

      /* ---------- Alerts ---------- */
      alerts: { render: () => {
        const fromHash = (location.hash.split('/')[2] || '').toUpperCase();
        const sel = alerts.find(a => a.id === VQ.state.al) || alerts.find(a => a.id === fromHash) || alerts[0]; const a = sel, tone = kTone(a.kind);
        const photo = a.id.startsWith('CAM') ? UI.cam({ img: a.photo, label: a.id, status: a.offline ? 'off' : 'ok', liveText: a.offline ? 'OFFLINE' : 'LIVE', offline: a.offline, time: D.nowSec, foot: a.where.split(' · ')[0] + ' · SB' })
          : `<div style="position:relative;aspect-ratio:16/9;border-radius:8px;overflow:hidden;display:grid;place-items:center;background:linear-gradient(160deg,#e8eef8,#cfd9e8);color:#5b6b85">${I(a.icon).replace('class="ic ', 'style="width:64px;height:64px;opacity:.7" class="ic ')}${a.photo ? `<img src="${UI.IMG(a.photo)}" alt="${VQ.esc(a.title)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" onerror="this.remove()">` : ''}<span class="cam-chip" style="position:absolute;left:8px;top:8px;background:rgba(11,22,44,.78);color:#fff;padding:2px 8px;border-radius:4px;font-size:11.5px;font-weight:600">${a.id}</span><span style="position:absolute;left:8px;bottom:8px;background:rgba(11,22,44,.78);color:#fff;padding:2px 8px;border-radius:4px;font-size:11px">${a.where.split(' · ')[0]} · ${a.at}</span></div>`;
        const acts = [
          { icon: 'file', tone: 'info', title: a.wo.includes('new') ? 'Create work order' : 'Update work order ' + a.wo.split(' ')[0], sub: a.wo.includes('new') ? `Pre-filled with the fault, location and photo. ${a.prio}.` : `Raise priority and attach today's evidence. ${a.prio}.`, btn: a.wo.includes('new') ? 'Create' : 'Update', primary: 1, toast: `Work order ${a.wo.split(' ')[0]} ${a.wo.includes('new') ? 'created' : 'updated'} (demo)`, done: 'Done' },
          { icon: 'users', tone: 'violet', title: 'Dispatch technician', sub: `${a.team}. ${/min/.test(a.eta) ? 'ETA ' + a.eta : a.eta}.`, btn: 'Dispatch', primary: a.sev === 'high', toast: `Dispatch sent to ${a.team.split(' · ')[0]} (demo)` },
          { icon: 'refresh', tone: 'good', title: `Switch to backup: ${a.backup[0]}`, sub: a.backup[1], btn: 'Switch', toast: 'Backup arrangement applied (demo)', done: 'Active' },
          { icon: 'clock', tone: 'gray', title: 'Snooze for 2 hours', sub: 'Hides the alert from the wall display. It stays open and keeps its priority.', btn: 'Snooze', toast: 'Alert snoozed for 2 hours (demo)', done: 'Snoozed' },
        ];
        return `<div class="grid g-1-2">
          <div class="col">
            ${UI.card('High priority · open today', `<div class="list">${high.map(x => alertRow(x, { set: 1, sel: a.id })).join('')}</div>`, { icon: 'alert', right: `${UI.pill(high.length + ' open', 'crit')}${UI.pill(high.filter(x => x.isNew).length + ' new', 'solid-crit')}` })}
            ${UI.card('Other open alerts', `<div class="list">${lower.map(x => alertRow(x, { set: 1, sel: a.id })).join('')}</div>`, { right: `<span>${lower.length} medium and low</span>` })}
          </div>
          <div class="col">
            <div class="card"><div class="card-h">${I(a.icon)}<h3>${a.title}</h3><div class="right">${a.isNew ? UI.pill('NEW', 'solid-crit') : ''}${UI.sev(a.sev)}${UI.pill(ST[a.kind][0], tone)}</div></div>
              <div class="grid" style="grid-template-columns:minmax(0,5fr) minmax(0,6fr);margin:0;gap:16px">
                <div>${photo}<div class="mt">${UI.facts([['tag', 'Asset ID', a.id], ['mappin', 'Location', a.where], ['clock', 'Alert raised', a.at + ' · ' + D.date], ['checkc', 'Last healthy', a.last]])}</div></div>
                <div>${UI.kv([['check', 'Expected state', a.expected], ['eye', 'Observed state', `<b style="color:var(--${tone === 'info' ? 'blue-600' : tone + '-ink'})">${a.observed}</b>`], ['layers', 'Affected coverage', a.affected], ['sparkles', 'Probable issue (AI)', `${a.probable} <span class="muted">Confidence ${a.conf}%</span>`], ['shield', 'Operational risk', a.risk]])}</div>
              </div>
              ${a.link ? `<div class="insight click mt" data-go="${a.link.go}" style="background:var(--crit-bg)"><span style="color:var(--crit)">${I('alert')}</span><div><b>${a.link.title}</b><p>${a.link.text}</p></div><span class="li-chev" style="margin-left:auto;align-self:center">${I('chev')}</span></div>` : ''}
            </div>
            <div class="grid g-1-2" style="margin:0">
              ${UI.card('Repair', UI.kv([['users', 'Nearest team', a.team], ['clock', 'ETA', a.eta], ['flag', 'Repair priority', a.prio], ['file', 'Work order', a.wo]]) + `<div class="mt">${UI.btn('Open maintenance', { ghost: 1, sm: 1, icon: 'wrench', go: 'assets/maintenance' })}</div>`, { icon: 'wrench' })}
              ${UI.card('Actions', UI.actions(acts), { icon: 'zap' })}
            </div>
          </div>
        </div>`;
      } },

      /* ---------- Maintenance ---------- */
      maintenance: { render: () => {
        const cols = [{ k: 'id', label: 'Work order', fmt: v => `<b class="ink">${v}</b>` }, { k: 'asset', label: 'Asset', fmt: (v, r) => `<b class="ink">${v}</b><div class="small t2">${r.job}</div>` }, { k: 'km', label: 'Km', fmt: v => `<span style="white-space:nowrap">${D.kmLabel(v)}</span>` }, { k: 'type', label: 'Type', fmt: v => `<span class="row" style="gap:6px"><i class="dot" style="border-radius:2px;background:${v === 'Preventive' ? 'var(--s1)' : 'var(--s2)'}"></i>${v}</span>` },
          { k: 'prio', label: 'Priority', fmt: v => UI.pill(v, v === 'P1' ? 'crit' : v === 'P2' ? 'warn' : 'gray') }, { k: 'crew', label: 'Crew' }, { k: 'raised', label: 'Raised', fmt: v => `<span style="white-space:nowrap">${v}</span>` }, { k: 'due', label: 'Due' }, { k: 'status', label: 'Status', fmt: (v, r) => UI.pill(v[0], v[1]) + (r.note ? `<div class="small" style="color:var(--crit-ink);margin-top:3px">${r.note}</div>` : '') }, { k: 'y', label: '', fmt: (_, r) => r.go ? `<span class="li-chev">${I('chev')}</span>` : '' }];
        return UI.kpis([
          { icon: 'file', bg: 'bg-info', value: 64, label: 'Open Work Orders', delta: { dir: 'up', value: '+6', text: 'vs. last week', good: false } },
          { icon: 'alert', bg: 'bg-crit', value: 9, label: 'Overdue', delta: { dir: 'up', value: '+2', text: 'oldest is 36 days', good: false } },
          { icon: 'cal', bg: 'bg-violet', value: 38, label: 'Scheduled This Week', delta: { dot: 'good', value: '16 – 22 Sep', text: '' } },
          { icon: 'clock', bg: 'bg-navy', value: 6.4, unit: 'hrs', label: 'Mean Time to Repair', delta: { dir: 'down', value: '−0.8 hrs', text: 'vs. last month', good: true } },
          { icon: 'shieldcheck', bg: 'bg-good', value: '62%', label: 'Preventive Share of Work', delta: { dot: 'warn', value: '38%', text: 'corrective · target 30%' }, tip: 'Of 212 work orders closed in the last 30 days, 131 were preventive and 81 corrective.' },
        ], 'g5') + `<div class="grid g-3-1">
          ${UI.card('Work orders', UI.table(cols, WO), { icon: 'wrench', right: `<span>12 of 64 open, highest priority first</span>${UI.btn('New work order', { sm: 1, primary: 1, icon: 'plus', toast: 'Work order form opened (demo)', done: 'Opened' })}` })}
          <div class="col">
            <div class="card" style="border-color:var(--crit);background:var(--crit-bg)"><div class="card-h"><span style="color:var(--crit);display:inline-flex">${I('alert')}</span><h3>Overdue work is causing incidents</h3></div>
              <div class="mb"><b class="ink">2 of today's ${D.home.activeIncidents} incidents trace back to overdue maintenance.</b> Both were reported by inspection and then waited in the backlog.</div>
              ${UI.list([{ icon: 'rain', tone: 'crit', title: 'MT-5127 · drain desilt, Km 441', sub: 'Open 14 days. Root cause of flooding INC-2038.', go: 'incident/INC-2038/rootcause' }, { icon: 'paw', tone: 'crit', title: 'MT-5093 · fence repair, Km 321.8', sub: 'Open 36 days. Root cause of animal incident INC-2032.', go: 'incident/INC-2032/rootcause' }])}
            </div>
            ${UI.card('Open work orders by crew', C.hbars({ unit: 'open work orders', items: crews.map(c => ({ label: `${c[0]} ${c[1]}`, value: c[2], note: c[0] === 'C-6' ? '5 overdue, including MT-5127' : c[0] === 'C-4' ? '2 overdue, including MT-5093' : '' })) }) + '<div class="card-note mt">C-6 Penukonda carries 14 of the 64 open orders and 5 of the 9 overdue. Move two C-7 technicians to Penukonda for this week.</div>')}
            ${UI.card('Work orders closed, last 4 weeks', C.bars({ h: 150, yMax: 60, stacked: 1, unit: 'work orders', labels: ['18–24 Aug', '25–31 Aug', '1–7 Sep', '8–14 Sep'], series: [{ name: 'Preventive', data: [31, 34, 32, 34] }, { name: 'Corrective', data: [22, 19, 21, 19] }] }) + '<div class="card-note">212 closed: 131 preventive (62%) and 81 corrective (38%). The target is 70% preventive.</div>')}
          </div>
        </div>
        ${UI.card('This week, 16 – 22 Sep', gantt() + '<div class="card-note mt">Main jobs only; 38 tasks are scheduled this week. Both overdue jobs now have dates: the drain today and tomorrow, the fence on 19–20 Sep.</div>', { icon: 'cal', right: UI.btn('Schedule maintenance', { sm: 1, ghost: 1, icon: 'plus', toast: 'Scheduling form opened (demo)', done: 'Opened' }) })}`;
      } },

      /* ---------- Lifecycle ---------- */
      lifecycle: { render: () => {
        const clsKeys = A.classes.map(c => c.key);
        return UI.kpis([
          { icon: 'clock', bg: 'bg-info', value: 4.6, unit: 'yrs', label: 'Average Asset Age', delta: { dot: 'good', value: 'Corridor commissioned', text: '2016 – 2025' } },
          { icon: 'alert', bg: 'bg-serious', value: lifeTotal.n, label: 'At or Past Design Life', delta: { dot: 'warn', value: (lifeTotal.n / A.total * 100).toFixed(1) + '%', text: `of ${VQ.fmt(A.total)} assets` } },
          { icon: 'rupee', bg: 'bg-navy', value: '₹ ' + (lifeTotal.cost / 100).toFixed(2), unit: 'Cr', label: 'Replacement Need, 12 Months', delta: { dir: 'up', value: '₹ 57.2 lakh', text: 'above approved budget', good: false } },
          { icon: 'shieldcheck', bg: 'bg-violet', value: 140, label: 'Warranties Ending in 90 Days', delta: { dot: 'crit', value: '6 readers', text: 'expire 30 Sep' } },
        ], 'g4') + `<div class="grid g2">
          ${UI.card('Age profile of each class (% of the class)', C.bars({ h: 220, yMax: 100, stacked: 1, unit: '% of class', labels: A.classes.map(c => `${c.label.replace('&amp;', '&').replace(' Assets', '')}|${VQ.fmt(c.count)} assets`), twoLine: 1, series: ageBands.map((b, i) => ({ name: b, data: clsKeys.map(k => Math.round(ageBy[k][i] / A.classes.find(c => c.key === k).count * 1000) / 10) })) }) + '<div class="card-note">Road assets are the oldest class: 104 of 486 are nine years or older. Cameras are the largest, and 316 of them are past six years.</div>')}
          ${UI.card('Failure rate against age', C.line({ h: 220, labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map(y => y + ' yr'), xTicks: 10, yTitle: 'Faults per 100 assets a year', unit: 'faults per 100', series: [{ name: 'Cameras', data: [3, 2.5, 2.6, 3, 3.8, 5.2, 7.5, 10.8, 14, 17] }, { name: 'Sensors', data: [4, 3.4, 3.6, 4.4, 5.6, 7.4, 9.8, 12.6, 15.5, 18.2] }, { name: 'VMS signs', data: [2, 1.8, 1.9, 2.1, 2.4, 3, 3.8, 4.9, 6.4, 8.2] }], mark: { i: 6, label: 'Camera design life' } }) + '<div class="card-note">Camera faults double between year 5 and year 7, then keep climbing. Replacing at design life costs less than repairing after it.</div>')}
        </div><div class="grid g2">
          ${UI.card('Assets at or past design life', UI.table([{ k: 'cls', label: 'Class', fmt: (v, r) => `<span class="row" style="gap:8px">${r.icon ? `<span style="display:inline-flex;width:16px;height:16px;color:var(--blue)">${I(r.icon)}</span>` : ''}<b class="ink">${v}</b></span>` }, { k: 'yrs', label: 'Design life', r: 1, fmt: v => v ? v + ' yrs' : '' }, { k: 'n', label: 'At or past', r: 1 }, { k: 'pct', label: '% of class', r: 1, fmt: v => v.toFixed(1) + '%' }, { k: 'unit', label: 'Unit cost (₹ lakh)', r: 1, fmt: v => v ? v.toFixed(1) : '' }, { k: 'cost', label: 'Replacement (₹ lakh)', r: 1, fmt: v => v.toFixed(1) }],
            [...lifeRows, { cls: 'All classes', n: lifeTotal.n, pct: lifeTotal.n / A.total * 100, cost: lifeTotal.cost, total: true }]) + '<div class="card-note mt">Road assets here are lighting poles, barriers and sign gantries. Pavement is planned separately under resurfacing.</div>')}
          ${UI.card('Replacement forecast and budget, next 12 months', C.bars({ h: 200, twoLine: 1, unit: '₹ lakh', labels: ['Oct – Dec|2026', 'Jan – Mar|2027', 'Apr – Jun|2027', 'Jul – Sep|2027'], series: [{ name: 'Forecast need (₹ lakh)', data: forecast }, { name: 'Approved budget (₹ lakh)', color: 'var(--axis)', data: budget }] }) + '<div class="card-note">Need is ₹ 497.2 lakh against ₹ 440 lakh approved. The gap of ₹ 57.2 lakh falls in the first two quarters, when the VMS signs come due.</div>')}
        </div><div class="grid g2">
          ${UI.card('Warranty ending in the next 90 days', UI.list(warranty.map(w => ({ icon: w[0], tone: w[4], title: w[1], sub: w[2], meta: 'Expires', pill: UI.pill(w[3] + ' 2026', w[4]), go: w[5] }))), { right: '<span>140 assets</span>' })}
          ${UI.card('Recommendations', UI.insight('video', 'crit', 'Replace 38 cameras older than 7 years on Km 280–330', 'Their fault rate is 3× the corridor average and this stretch holds the Gooty ghat and grazing-belt hotspots. Cost ₹ 68.4 lakh, in the Oct – Dec quarter.') + UI.insight('tag', 'warn', 'Claim the Raikal Lane 3 reader under warranty before 30 Sep', 'The reader is failing now and the warranty for all 6 Raikal readers ends in 14 days.', 'assets/alerts/RDR-0583') + UI.insight('rain', 'blue', 'Add a water-level sensor and pump sump at Km 441', 'Six waterlogging events in 90 days. ₹ 6.5 lakh, and it turns a camera-only detection into an early warning.', 'incident/INC-2038/rootcause') + UI.insight('zap', 'violet', 'Swap UPS batteries in the 14 oldest cabinets before summer', 'PWR-0180 shows the failure mode today: a supply fault with under 5 hours of battery behind it.', 'assets/alerts/PWR-0180'), { icon: 'sparkles' })}
        </div>`;
      } },

      /* ---------- Reports ---------- */
      reports: { render: () => `<div class="grid g3">${reports.map(r => `<div class="card"><div class="card-h">${I(r[0])}<h3>${r[1]}</h3><div class="right">${r[5].map(f => UI.pill(f, f === 'PDF' ? 'crit' : 'good')).join('')}</div></div>
          <div class="t2 mb" style="font-size:12.5px;min-height:38px">${r[2]}</div>${UI.kv([['cal', 'Period', r[3]], ['clock', 'Last generated', r[4]]])}
          <div class="row mt" style="gap:8px">${UI.btn('Generate', { sm: 1, primary: 1, icon: 'refresh', toast: `${r[1]} is being generated (demo)`, done: 'Queued' })}${UI.btn('Download', { sm: 1, ghost: 1, icon: 'download', toast: `${r[1]} · ${r[5][0]} downloaded (demo)`, done: 'Saved' })}</div></div>`).join('')}</div>
        <div class="grid g-1-2">
          ${UI.card('Uptime by class, last 30 days', C.hbars({ unit: '% uptime', max: 100, items: [['Power & IT', 99.1, 'zap'], ['Cameras', 98.4, 'video'], ['VMS signs', 95.8, 'sign'], ['Road lighting', 94.2, 'bulb'], ['Sensors', 93.6, 'wifi']].map(([label, value, icon]) => ({ label, value, icon, text: value + '%' })) }) + '<div class="card-note mt">Contract target is 98% for cameras and power, 95% for the rest. Road lighting and sensors are below target; both are in this week\'s maintenance plan.</div>' + `<div class="card-h" style="margin-top:16px"><h3>Recently generated</h3></div>` + UI.list([['Asset health summary · 16 Sep', 'PDF · 1.8 MB · generated 06:00 AM'], ['Open and overdue work orders · 16 Sep', 'XLSX · 240 KB · generated 07:30 AM'], ['SLA and uptime by class · week 37', 'PDF · 2.4 MB · generated 15 Sep'], ['Maintenance compliance · week 37', 'PDF · 1.1 MB · generated 15 Sep']].map(([title, sub]) => ({ icon: 'file', tone: 'info', title, sub, pill: `<button class="btn ghost sm" style="min-width:0" data-act="${title} downloaded (demo)" data-done="Saved">${I('download')}</button>` }))))}
          ${UI.card('Scheduled reports', UI.table([{ k: 'n', label: 'Report', fmt: v => `<b class="ink">${v}</b>` }, { k: 'f', label: 'Frequency', fmt: v => `<span style="white-space:nowrap">${v}</span>` }, { k: 'to', label: 'Recipients' }, { k: 'fmt', label: 'Format' }, { k: 'next', label: 'Next run', fmt: v => `<span style="white-space:nowrap">${v}</span>` }, { k: 's', label: '', fmt: () => UI.pill('Active', 'good') }], [
            { n: 'Asset health summary', f: 'Daily, 06:00 AM', to: 'Control Room Manager, Maintenance Head', fmt: 'PDF', next: '17 Sep, 06:00 AM' }, { n: 'Open and overdue work orders', f: 'Daily, 07:30 AM', to: 'Maintenance Head, Crew Supervisors', fmt: 'XLSX', next: '17 Sep, 07:30 AM' },
            { n: 'SLA and uptime by class', f: 'Weekly, Monday', to: 'Project Director, O&amp;M Contractor', fmt: 'PDF, XLSX', next: '22 Sep, 06:00 AM' }, { n: 'Maintenance compliance', f: 'Weekly, Monday', to: 'Project Director, Independent Engineer', fmt: 'PDF', next: '22 Sep, 06:00 AM' },
            { n: 'Fault analysis', f: 'Monthly, 1st', to: 'Project Director, NHAI Regional Officer', fmt: 'PDF', next: '01 Oct, 06:00 AM' }, { n: 'Lifecycle and replacement plan', f: 'Quarterly', to: 'Finance Head, Project Director', fmt: 'PDF, XLSX', next: '01 Oct, 06:00 AM' },
          ]), { icon: 'cal', right: UI.btn('Add schedule', { sm: 1, ghost: 1, icon: 'plus', toast: 'Schedule form opened (demo)', done: 'Opened' }) })}
        </div>` },
    },
  });
})();
