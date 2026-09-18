/* =========================================================
   Screens · Toll & Revenue (5 tabs). The thread through the section is lost toll revenue:
   corridor -> plaza -> lane / shift -> single transaction -> repeat pattern.
   Shared figures come from D.toll and D.plazas; everything else is defined here and sums to them.
   ========================================================= */
(() => {
  const { UI, C, data: D, I } = VQ;
  const T = D.toll, fmt = VQ.fmt, rs = n => '₹ ' + fmt(n), lakh = v => `₹ ${v} lakh`;
  const raikal = D.plazas.find(p => p.id === 'raikal'), pullur = D.plazas.find(p => p.id === 'pullur');

  /* ---------- section data ---------- */
  /* vehicles tolled since midnight, per plaza (D.plazas.veh is the last-30-minute count) */
  const vehToday = { raikal: 9160, shakapur: 4580, pullur: 5420, amakathadu: 3740, kasepalli: 3520, marur: 4100, bagepalli: 4350, devanahalli: 6420 };
  const vehTotal = Object.values(vehToday).reduce((a, b) => a + b, 0); /* 41,290 */
  const wAvg = k => D.plazas.reduce((a, p) => a + p[k] * vehToday[p.id], 0) / vehTotal;
  const rev24 = p => p.rev * (T.rev24 * 100) / (T.revToday * 100); /* ₹ lakh, scaled from today's share */
  const leakPct = p => p.leak24 / rev24(p) * 100;

  /* last 24 h, all 8 plazas. seen - recorded = 1,250 vehicles with no transaction (tag not read 940 + tailgating 310).
     discrepancies 3,840 = 1,250 + 2,590 recorded but wrong. matched = recorded - 2,590. */
  const F = { seen: 114200, recorded: 112950, matched: 110360, disc: 3840, flagged: T.flagged24, confirmed: Math.round(T.flagged24 * T.confirmedPct / 100) + 0 };
  F.confirmed = 222; /* 71% of 312 */
  const review = { New: 14, 'Under review': 24, Confirmed: 222, Cleared: 52 }; /* = 312 */
  const leakTypes = [ /* ₹ lakh sums to 14.6, n sums to 3,840, flagged sums to 312 */
    { key: 'class', label: 'Class mismatch', short: 'Class mismatch', icon: 'truck', v: 6.4, n: 1620, fl: 148, note: 'Camera saw a larger class than the tag was charged for' },
    { key: 'notag', label: 'Tag not read, passed free', short: 'Tag not read', icon: 'wifi', v: 2.9, n: 940, fl: 52, note: 'Vehicle seen in lane, no transaction recorded' },
    { key: 'exempt', label: 'Exempt-category misuse', short: 'Exempt misuse', icon: 'shield', v: 1.8, n: 380, fl: 41, note: 'Exempt pass used by a vehicle that does not match the category' },
    { key: 'cash', label: 'Cash lane short collection', short: 'Cash short', icon: 'rupee', v: 1.5, n: 300, fl: 24, note: 'Receipt issued for a lower class than the vehicle seen' },
    { key: 'black', label: 'Blacklisted tag passed', short: 'Blacklisted tag', icon: 'ban', v: 1.2, n: 290, fl: 29, note: 'Barrier opened for a blacklisted or low-balance tag' },
    { key: 'tail', label: 'Convoy tailgating', short: 'Tailgating', icon: 'barrier', v: 0.8, n: 310, fl: 18, note: 'Second vehicle followed before the barrier closed' },
  ];
  const typeOf = k => leakTypes.find(t => t.key === k);

  /* 14 days to today, ₹ lakh per day. Sat/Sun dips are lower freight traffic. Today: 5.8 + 8.8 = 14.6 */
  const days14 = ['03 Sep', '04 Sep', '05 Sep', '06 Sep', '07 Sep', '08 Sep', '09 Sep', '10 Sep', '11 Sep', '12 Sep', '13 Sep', '14 Sep', '15 Sep', '16 Sep'];
  const pullur14 = [1.6, 1.7, 1.6, 1.3, 1.2, 1.6, 2.2, 2.9, 3.5, 4.1, 3.9, 4.3, 5.4, 5.8];
  const others14 = [8.9, 8.7, 9.0, 7.0, 6.8, 8.8, 8.9, 8.7, 8.8, 8.9, 6.9, 6.8, 8.7, 8.8];

  /* Pullur, last 24 h: both splits sum to 5.80 */
  const pLanes = [['Lane 1 · FASTag', 0.42], ['Lane 2 · FASTag', 0.51], ['Lane 3 · FASTag', 0.58], ['Lane 4 · FASTag', 3.60], ['Lane 5 · Cash', 0.41], ['Lane 6 · Cash', 0.28]];
  const pShifts = [['Morning · 06:00–14:00', 1.10], ['Evening · 14:00–22:00', 1.34], ['Night · 22:00–06:00', 3.36]];
  const pct = (v, of) => Math.round(v / of * 100);

  /* Raikal lanes right now */
  const lanes = [
    { n: 1, kind: 'FASTag', wait: 2, veh: 3, x: 7.8 }, { n: 2, kind: 'FASTag', wait: 6, veh: 9, x: 24.1 }, { n: 3, kind: 'FASTag', wait: 12, veh: 18, x: 41.1 },
    { n: 4, kind: 'FASTag', wait: 10, veh: 15, x: 58.2 }, { n: 5, kind: 'Cash', wait: 3, veh: 4, x: 75.1 }, { n: 6, kind: 'Cash', wait: 7, veh: 11, x: 93 },
  ];
  /* wait classes are a status: < 5 min good, 5–10 warn, >= 10 crit */
  const wTone = w => w < 5 ? 'good' : w < 10 ? 'warn' : 'crit';
  const waitLegend = [{ name: '< 5 min', color: 'var(--good)', bar: 1 }, { name: '5–10 min', color: 'var(--warn)', bar: 1 }, { name: '10 min or more', color: 'var(--crit)', bar: 1 }];
  const tLabels = ['07:30', '07:35', '07:40', '07:45', '07:50', '07:55', '08:00', '08:05', '08:10', '08:15', '08:20', '08:25', '08:30', '08:35', '08:40', '08:45'];
  const waitSeries = {
    1: [1.8, 1.9, 1.8, 2, 2.1, 2, 2.2, 2.1, 2, 2.2, 2.1, 2, 2.1, 2, 2.1, 2], 2: [3.2, 3.3, 3.5, 3.6, 3.8, 4, 4.3, 4.5, 4.8, 5, 5.2, 5.5, 5.7, 5.8, 5.9, 6],
    3: [5, 5.2, 5.6, 6, 6.4, 6.8, 7.2, 7.7, 8.2, 8.6, 9, 9.4, 9.8, 10.3, 11.1, 12], 4: [4, 4.2, 4.5, 5, 5.5, 6, 6.2, 6.8, 7.2, 7.8, 8.2, 8.6, 9, 9.4, 9.7, 10],
    5: [3.4, 3.3, 3.5, 3.2, 3.4, 3.1, 3.3, 3.2, 3, 3.1, 3.2, 3, 3.1, 2.9, 3, 3], 6: [5.2, 5.4, 5.3, 5.6, 5.8, 6, 6.1, 6.3, 6.4, 6.6, 6.7, 6.8, 6.9, 7, 6.9, 7],
    avg: [3.6, 3.7, 3.9, 4, 4.2, 4.4, 4.5, 4.7, 5, 5.2, 5.5, 5.8, 6, 6.2, 6.4, 6.5],
  };
  const mix = [['Cars / SUVs', 1253], ['Trucks / HGVs', 405], ['Buses', 74], ['LCVs', 92], ['Two-wheelers', 18]]; /* = 1,842 */

  /* toll rates used in the review (single journey, ₹) */
  const RATE = { 'Car / Jeep': 160, LCV: 260, '2-axle truck': 545, Bus: 545, '3-axle truck': 595, 'MAV (5-axle)': 855 };
  const txns = [
    { id: 'TXN-8841907', at: '01:42 AM', plaza: 'Pullur', lane: 'Lane 4', obs: '3-axle truck', chg: 'LCV', paid: 260, type: 'class', conf: 96, status: 'New', reg: 'AP 21 •• 4417', tag: '34161F ••••• 7C2A', night: 1,
      why: 'Camera counted 3 axles and a 9.4 m body. The tag is registered as LCV, and the lane AVC also reported LCV.', rec: '7th time in 30 days, always Lane 4 at Pullur, 22:00–02:00', recTone: 'crit' },
    { id: 'TXN-8841652', at: '01:17 AM', plaza: 'Pullur', lane: 'Lane 4', obs: 'MAV (5-axle)', chg: 'LCV', paid: 260, type: 'class', conf: 94, status: 'New', reg: 'KA 01 •• 8830', tag: '34161F ••••• 19D4', night: 1,
      why: 'Camera counted 5 axles on a tractor-trailer. Operator OP-117 overrode the AVC class to LCV 4 seconds before the barrier opened.', rec: '12th time in 30 days, all at Pullur Lane 4 on the night shift', recTone: 'crit' },
    { id: 'TXN-8843377', at: '04:06 AM', plaza: 'Pullur', lane: 'Lane 4', obs: 'MAV (5-axle)', chg: 'LCV', paid: 260, type: 'class', conf: 95, status: 'Confirmed', reg: 'TS 08 •• 2264', tag: '34161F ••••• A03B', night: 1,
      why: 'Camera counted 5 axles. Charged as LCV after a manual class override by OP-117.', rec: '9th time in 30 days, Pullur Lane 4 only', recTone: 'crit' },
    { id: 'TXN-8840311', at: '11:48 PM', plaza: 'Pullur', lane: 'Lane 4', obs: '3-axle truck', chg: 'LCV', paid: 260, type: 'class', conf: 97, status: 'Under review', reg: 'AP 39 •• 0716', tag: '34161F ••••• 55E1', night: 1, day: '15 Sep',
      why: 'Camera counted 3 axles. The lane AVC reported LCV; no operator override on this one, which points to the sensor.', rec: '11th time in 30 days, Pullur Lane 4, 22:00–02:00', recTone: 'crit' },
    { id: 'TXN-8839120', at: '10:26 PM', plaza: 'Pullur', lane: 'Lane 4', obs: '3-axle truck', chg: 'Car / Jeep', paid: 160, type: 'class', conf: 93, status: 'Confirmed', reg: 'AP 21 •• 9052', tag: '34161F ••••• 6F70', night: 1, day: '15 Sep',
      why: 'Camera counted 3 axles. The tag is a car-class tag moved to a truck.', rec: '8th time in 30 days; tag also seen on a car at Marur on 02 Sep', recTone: 'crit' },
    { id: 'TXN-8846603', at: '07:52 AM', plaza: 'Raikal', lane: 'Lane 3', obs: 'Car / Jeep', chg: 'No transaction', paid: 0, type: 'notag', conf: 91, status: 'New', reg: 'TS 09 •• 3318', tag: 'Tag present, not read',
      why: 'Tag visible on the windscreen but the reader logged 3 failed reads. The marshal raised the barrier to keep the queue moving.', rec: '64 free passes in Lane 3 since the reader degraded at 07:50 AM', recTone: 'warn' },
    { id: 'TXN-8845987', at: '06:58 AM', plaza: 'Devanahalli', lane: 'Lane 2', obs: 'LCV', chg: 'Exempt (ambulance)', paid: 0, type: 'exempt', conf: 89, status: 'Under review', reg: 'KA 50 •• 6127', tag: 'No tag · exempt pass keyed in',
      why: 'Goods LCV with no ambulance markings or beacon. The operator keyed the ambulance exemption.', rec: '3rd exempt pass for this vehicle in 30 days, same operator each time', recTone: 'warn' },
    { id: 'TXN-8844120', at: '05:31 AM', plaza: 'Marur', lane: 'Lane 5 (cash)', obs: '2-axle truck', chg: 'LCV', paid: 260, type: 'cash', conf: 84, status: 'Confirmed', reg: 'AP 02 •• 7745', tag: 'Cash receipt R-551902',
      why: 'Camera saw a 2-axle truck with dual rear wheels. The cash receipt was issued for LCV.', rec: 'First time for this vehicle; 6th short receipt in this booth this week', recTone: 'warn' },
    { id: 'TXN-8842790', at: '03:12 AM', plaza: 'Bagepalli', lane: 'Lane 1', obs: '3-axle truck', chg: 'Blacklisted tag', paid: 0, type: 'black', conf: 99, status: 'Confirmed', reg: 'KA 40 •• 1093', tag: '34161F ••••• E8B2', night: 1,
      why: 'Tag blacklisted for low balance since 11 Sep. The barrier was raised manually and no cash was taken.', rec: '4th pass on a blacklisted tag in 30 days, 3 different plazas', recTone: 'crit' },
    { id: 'TXN-8842101', at: '02:20 AM', plaza: 'Shakapur', lane: 'Lane 2', obs: 'LCV', chg: 'No transaction', paid: 0, type: 'tail', conf: 90, status: 'Under review', reg: 'TS 12 •• 5580', tag: 'No tag seen', night: 1,
      why: 'The LCV followed a truck 1.8 m behind and cleared the barrier before it closed. One transaction, two vehicles.', rec: 'First time for this vehicle', recTone: 'good' },
    { id: 'TXN-8846870', at: '08:03 AM', plaza: 'Kasepalli', lane: 'Lane 3', obs: '3-axle truck', chg: '2-axle truck', paid: 545, type: 'class', conf: 72, status: 'Cleared', reg: 'AP 27 •• 3906', tag: '34161F ••••• 2C9A',
      why: 'Camera counted 3 axles, but the side view shows the lift axle raised. Tolling counts axles on the ground, so the 2-axle charge is correct.', rec: 'No history for this tag', recTone: 'good' },
  ].map(t => { const due = RATE[t.obs]; return { ...t, due, short: t.status === 'Cleared' ? 0 : due - t.paid, gap: due - t.paid }; });
  const stTone = { New: 'info', 'Under review': 'warn', Confirmed: 'crit', Cleared: 'good' };

  /* repeat tags at Pullur Lane 4 (30 days): 8 of 14 listed. All 14: 104 flagged passes, ₹ 43,420 shortfall */
  const offenders = [
    { reg: 'KA 01 •• 8830', tag: '••••• 19D4', op: 'Sri Lakshmi Roadlines, Kurnool', n: 12, each: 595, where: 'Pullur', last: '16 Sep, 01:17 AM', txn: 'TXN-8841652' },
    { reg: 'AP 39 •• 0716', tag: '••••• 55E1', op: 'Operator not registered', n: 11, each: 335, where: 'Pullur', last: '15 Sep, 11:48 PM', txn: 'TXN-8840311' },
    { reg: 'TS 08 •• 2264', tag: '••••• A03B', op: 'Sri Lakshmi Roadlines, Kurnool', n: 9, each: 595, where: 'Pullur', last: '16 Sep, 04:06 AM', txn: 'TXN-8843377' },
    { reg: 'AP 21 •• 3371', tag: '••••• 40AC', op: 'Operator not registered', n: 9, each: 335, where: 'Pullur', last: '15 Sep, 10:52 PM' },
    { reg: 'AP 21 •• 9052', tag: '••••• 6F70', op: 'Operator not registered', n: 8, each: 435, where: 'Pullur, Marur', last: '15 Sep, 10:26 PM', txn: 'TXN-8839120' },
    { reg: 'AP 21 •• 4417', tag: '••••• 7C2A', op: 'Deccan Bulk Carriers, Dhone', n: 7, each: 335, where: 'Pullur', last: '16 Sep, 01:42 AM', txn: 'TXN-8841907' },
    { reg: 'KA 34 •• 6608', tag: '••••• B771', op: 'Deccan Bulk Carriers, Dhone', n: 7, each: 595, where: 'Pullur', last: '16 Sep, 12:31 AM' },
    { reg: 'TS 07 •• 1945', tag: '••••• 0D3E', op: 'Operator not registered', n: 6, each: 335, where: 'Pullur', last: '14 Sep, 11:09 PM' },
  ];

  /* ---------- small local components ---------- */
  const CSS = `<style>
    .tq-cam .cam.wide { aspect-ratio: 1280 / 430; }
    .tq-lh { position: absolute; top: 14%; transform: translateX(-50%); z-index: 2; width: 9.6%; min-width: 62px; text-align: center; font-size: 11.5px; font-weight: 600; line-height: 1.2; padding: 4px 2px; border-radius: 5px; background: rgba(16,52,110,.9); border: 1.5px solid #7db8ff; color: #fff; }
    .tq-lh.cash { background: rgba(140,92,18,.92); border-color: #ffc766; }
    .tq-lt { position: absolute; top: 53.5%; height: 24%; width: 11.8%; transform: translateX(-50%); z-index: 2; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 7px; border: 2px solid; color: #fff; line-height: 1.15; box-shadow: 0 2px 8px rgba(0,0,0,.35); }
    .tq-lt b { font-size: 16px; font-weight: 700; } .tq-lt span { font-size: 11.5px; }
    .tq-lt.good { background: #12753a; border-color: #3fe083; } .tq-lt.warn { background: #96600a; border-color: #ffc04d; } .tq-lt.crit { background: #8a1d22; border-color: #ff5a52; }
    .tq-ov { display: grid; grid-template-columns: 1fr 1fr; } .tq-ov > div { display: flex; gap: 10px; align-items: flex-start; padding: 12px 6px; min-width: 0; } .tq-ov > div > div { min-width: 0; }
    .tq-ov > div:nth-child(odd) { border-right: 1px solid var(--line-2); padding-right: 12px; } .tq-ov > div:nth-child(even) { padding-left: 16px; } .tq-ov > div:nth-child(n+3) { border-top: 1px solid var(--line-2); }
    .tq-ov .ic { width: 30px; height: 30px; flex: none; margin-top: 4px; } .tq-ov .k { font-size: 12px; color: var(--text-2); } .tq-ov .v { font-size: 19px; font-weight: 800; color: var(--ink); line-height: 1.2; }
    .tq-ov .d { font-size: 11.5px; color: var(--text-2); } .tq-ov .d b.g { color: var(--good-ink); } .tq-ov .d b.r { color: var(--crit-ink); }
    .tq-fun { display: flex; align-items: stretch; } .tq-fn { flex: 1 1 0; min-width: 0; border: 1px solid var(--line); border-radius: 9px; padding: 10px 12px; background: var(--card); }
    .tq-fn .k { font-size: 10.5px; text-transform: uppercase; letter-spacing: .4px; color: var(--text-2); font-weight: 700; min-height: 26px; } .tq-fn b { display: block; font-size: 21px; font-weight: 800; color: var(--ink); line-height: 1.15; white-space: nowrap; font-variant-numeric: tabular-nums; }
    .tq-fn span { display: block; font-size: 11.5px; color: var(--text-2); margin-top: 2px; } .tq-fn.warn { background: var(--warn-bg); border-color: #f4d48d; } .tq-fn.crit { background: var(--crit-bg); border-color: var(--crit); } .tq-fn.crit b { color: var(--crit-ink); }
    .tq-fn.click { cursor: pointer; } .tq-fa { flex: none; width: 22px; display: grid; place-items: center; color: var(--axis); } .tq-fa .ic { width: 16px; height: 16px; }
    .tq-vs { display: grid; grid-template-columns: 1fr auto 1fr; gap: 8px; align-items: stretch; } .tq-vs > div { border: 1px solid var(--line); border-radius: 8px; padding: 8px 10px; } .tq-vs .k { font-size: 11px; color: var(--text-2); } .tq-vs b { font-size: 14px; color: var(--ink); display: block; } .tq-vs .s { font-size: 11.5px; color: var(--text-2); }
    .tq-vs > i { display: grid; place-items: center; font-style: normal; font-weight: 800; color: var(--crit); } .tq-vs .obs { background: var(--good-bg); border-color: #b5e2b5; } .tq-vs .chg { background: var(--crit-bg); border-color: #f3b9b6; } .tq-vs .chg.ok { background: var(--good-bg); border-color: #b5e2b5; }
    .tq-wv .hbar { grid-template-columns: minmax(110px, 38%) 1fr 84px; }
    .tq-sel td { background: var(--blue-50); } .tq-sel td:first-child { box-shadow: inset 3px 0 0 var(--blue); }
    .tq-tbl td { padding: 7px 6px; } .tq-tbl td:first-child, .tq-tbl td.r { white-space: nowrap; } .tq-tbl th { padding: 8px 6px; } .tq-tbl { font-size: 12px; } .tq-2l { line-height: 1.3; } .tq-2l small { display: block; font-size: 11px; color: var(--text-2); }
    .tq-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; } .tq-btns .btn { justify-content: center; }
    .tq-heat .heat .hc { height: 34px; } .tq-pr .btn { justify-content: center; }
    .tq-pr { display: grid; grid-template-columns: 26px minmax(0, 1fr) 150px 128px; gap: 12px; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--line-2); } .tq-pr:last-child { border-bottom: 0; padding-bottom: 0; }
    .tq-pr .rk { width: 24px; height: 24px; border-radius: 50%; background: var(--blue-50); color: var(--ink); font-weight: 800; font-size: 12px; display: grid; place-items: center; } .tq-pr .ex { text-align: right; white-space: nowrap; } .tq-pr .ex b { display: block; font-size: 15px; color: var(--ink); } .tq-pr .ex span { font-size: 11px; color: var(--text-2); }
  </style>`;
  const seqLegend = (lo, hi) => `<div class="row mt small t2"><span>${lo}</span>${[0.05, .3, .55, .8, .99].map(t => `<i style="width:22px;height:10px;border-radius:2px;background:${C.seqBlue(t)}"></i>`).join('')}<span>${hi}</span></div>`;
  const ovStat = (icon, tone, k, v, dir, dv, dt, good) => `<div><span style="color:var(--${tone});display:inline-flex">${I(icon)}</span><div><div class="k">${k}</div><div class="v">${v}</div><div class="d"><b class="${good ? 'g' : 'r'}">${dir === 'up' ? '▲' : '▼'} ${dv}</b> ${dt}</div></div></div>`;
  const fnode = (k, v, s, o) => { o = o || {}; return `<div class="tq-fn ${o.tone || ''} ${o.go ? 'click' : ''}" ${o.go ? `data-go="${o.go}"` : ''} ${o.tip ? `data-tip="${o.tip}"` : ''}><div class="k">${k}</div><b>${v}</b><span>${s}</span></div>`; };
  const funnel = nodes => `<div class="tq-fun">${nodes.map((n, i) => (i ? `<div class="tq-fa">${I('arrow')}</div>` : '') + n).join('')}</div>`;
  const monthNote = `22 weekdays at ${lakh(T.leak24)} and 8 weekend days at ₹ 11.2 lakh (lighter freight traffic).`;

  VQ.screen('toll', {
    title: 'Toll &amp; Revenue', sub: 'Every vehicle seen. Every rupee accounted for.',
    tabs: [['overview', 'Overview'], ['queue', 'Plaza Queue'], ['leakage', 'Revenue Leakage'], ['review', 'Transaction Review'], ['patterns', 'Leakage Patterns']],
    filters: () => UI.sel('NH-44') + UI.sel('All Plazas') + UI.sel('Last 24 hours'),
    views: {
      /* ---------- Overview ---------- */
      overview: { render: () => {
        const pins = D.plazas.map(p => { const pin = D.plazaPin(p);
          if (p.id === 'raikal') pin.callout = { title: 'Raikal · queue building', lines: ['Lane 3 wait 12 minutes'], tone: 'warn', below: 1, gap: 62, dx: 92 };
          if (p.id === 'pullur') pin.callout = { title: 'Pullur · leakage anomaly', lines: [`${lakh(p.leak24)} lost in 24 h`], tone: 'crit' };
          return pin; });
        const hrs = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00'];
        const stPill = s => UI.pill(s, s === 'Normal' ? 'good' : s === 'Queue building' ? 'warn' : 'violet');
        const rows = D.plazas.map(p => ({ ...p, vt: vehToday[p.id], lp: leakPct(p), go: p.id === 'raikal' ? 'toll/queue' : p.id === 'pullur' ? 'toll/leakage' : null }));
        rows.push({ total: true, name: 'All 8 plazas', km: '', rev: T.revToday * 100, vt: vehTotal, fastag: Math.round(wAvg('fastag')), wait: Math.round(wAvg('wait') * 10) / 10, leak24: T.leak24, lp: T.leakPct, status: '' });
        const cols = [{ k: 'name', label: 'Plaza', fmt: (v, r) => r.total ? v : `<span class="row" style="gap:8px"><span style="color:var(--blue);display:inline-flex;width:16px;height:16px">${I('toll')}</span><b class="ink">${v}</b></span>` }, { k: 'km', label: 'Km', r: 1 },
          { k: 'rev', label: 'Revenue today', r: 1, fmt: v => lakh(v.toFixed(1)) }, { k: 'vt', label: 'Vehicles today', r: 1, fmt: v => fmt(v) }, { k: 'fastag', label: 'FASTag', r: 1, fmt: v => v + '%' }, { k: 'wait', label: 'Avg. wait', r: 1, fmt: v => `<span class="${v >= 5 ? 'up-bad' : ''}">${v} min</span>` },
          { k: 'leak24', label: 'Leakage (24 h)', r: 1, fmt: (v, r) => `<span class="${r.lp > 8 ? 'up-bad' : ''}">${lakh(v.toFixed(1))}</span>` }, { k: 'lp', label: '% of rev.', r: 1, fmt: v => `<span class="${v > 8 ? 'up-bad' : ''}">${v.toFixed(1)}%</span>` },
          { k: 'status', label: 'Status', fmt: (v, r) => v ? stPill(v) : '' }];
        return UI.kpis([
          { icon: 'rupee', bg: 'bg-good', value: `₹ ${T.revToday} Cr`, label: 'Toll revenue today', delta: { dir: 'up', value: `+${D.home.tollDelta}%`, text: 'vs. last Tuesday', good: true } },
          { icon: 'car', bg: 'bg-info', value: fmt(vehTotal), label: 'Vehicles tolled today', delta: { dir: 'up', value: '+3%', text: 'vs. last Tuesday', good: true } },
          { icon: 'tag', bg: 'bg-navy', value: Math.round(wAvg('fastag')) + '%', label: 'FASTag share', delta: { dir: 'up', value: '+2 pts', text: 'vs. last month', good: true } },
          { icon: 'clock', bg: 'bg-warn', value: (Math.round(wAvg('wait') * 10) / 10), unit: 'mins', label: 'Avg. wait at plazas', delta: { dir: 'up', value: '+0.6', text: 'vs. last hour', good: false }, go: 'toll/queue' },
          { icon: 'trend', bg: 'bg-crit', value: lakh(T.leak24), label: 'Est. leakage, last 24&nbsp;h', delta: { dir: 'up', value: `${T.leakPct}%`, text: 'of toll revenue', good: false }, go: 'toll/leakage', tip: `${T.leakPct}% of the ₹ ${T.rev24} Cr collected in the last 24 hours` },
          { icon: 'flag', bg: 'bg-violet', value: T.flagged24, label: 'Flagged transactions', delta: { dot: 'crit', value: `${T.confirmedPct}%`, text: 'confirmed' }, go: 'toll/review' },
        ], 'g6 compact') + `<div class="grid g-2-1">
          <div class="card flush">${VQ.Map.render({ h: 310, plainRoute: 1, pins, legend: `<b>Toll plazas</b><span><i class="dot" style="background:${VQ.Map.TONE.info}"></i>Normal</span><span><i class="dot" style="background:${VQ.Map.TONE.warn}"></i>Queue building</span><span><i class="dot" style="background:${VQ.Map.TONE.violet}"></i>Leakage anomaly</span>` })}</div>
          ${UI.card('Alerts', UI.list([
            { icon: 'alert', tone: 'crit', title: 'Raikal: Lane 3 queue above 10 minutes', titleTone: 'crit', sub: '18 vehicles waiting, Lane 4 close behind at 10 minutes', meta: '08:40 AM', go: 'toll/queue' },
            { icon: 'rupee', tone: 'violet', title: 'Pullur: class-mismatch anomaly', sub: `${lakh(pullur.leak24)} leakage in 24 h, 3.6 times its usual level. Lane 4, night shift`, meta: '06:10 AM', go: 'toll/leakage' },
            { icon: 'wifi', tone: 'warn', title: 'Raikal: Lane 3 tag reader degraded', titleTone: 'warn', sub: 'Read retries up 3x since 07:50 AM; 64 vehicles passed free', meta: '07:50 AM', go: 'assets/alerts' },
            { icon: 'cone', tone: 'warn', title: 'INC-2037 · Toll plaza queue at Raikal', sub: 'Tailback 0.9 km, reaches 1.6 km by 09:10 AM if no lane is switched', meta: '08:20 AM', go: 'incident/INC-2037' },
            { icon: 'shield', tone: 'info', title: 'Devanahalli: exempt passes above normal', sub: '38 exempt passes keyed in since midnight (normal 15)', meta: '07:15 AM', go: 'toll/patterns' },
          ]), { right: '<span>5 open</span>' })}
        </div><div class="grid g-2-1">
          ${UI.card('Plazas on NH-44', UI.table(cols, rows) + `<div class="card-note mt">Leakage is the toll the cameras say was due, less the toll collected. Pullur loses ${leakPct(pullur).toFixed(1)}% of its revenue; the other seven plazas average ${((T.leak24 - pullur.leak24) / (T.rev24 * 100 - rev24(pullur)) * 100).toFixed(1)}%.</div>`, { right: '<span>Today, 00:00 to 08:45 AM</span>' })}
          ${UI.card('Hourly toll revenue, all plazas (₹ lakh)', C.line({ h: 300, yMax: 40, labels: hrs, xTicks: 9, unit: 'lakh', series: [{ name: 'Today', data: [9.8, 8.1, 7.2, 7.6, 9.9, 13.4, 18.2, 24.6, 29.2], area: 1 }, { name: 'Last Tuesday', data: [9.6, 8.0, 7.3, 7.4, 9.5, 12.8, 17.3, 23.5, 27.7], color: 'var(--axis)', dash: 1 }] }) + `<div class="card-note">Each point is one hour of collection; the 08:00 point runs to 08:45 AM. Today totals ${lakh('128.0')} against ₹ 123.1 lakh last Tuesday (+${D.home.tollDelta}%).</div>`)}
        </div>`;
      } },

      /* ---------- Plaza queue (mockup 07) ---------- */
      queue: { title: `Toll Plaza Queue <span class="pill solid-good" style="font-size:13px;padding:3px 12px;vertical-align:middle;margin-left:8px">LIVE</span>`,
        sub: `Raikal Toll Plaza &nbsp;|&nbsp; Shadnagar &nbsp;|&nbsp; ${D.corridor} &nbsp;|&nbsp; ${D.date} &nbsp;|&nbsp; ${D.now}`,
        crumbs: [['Back to Toll &amp; Revenue', 'toll/overview'], ['Plaza Queue']],
        filters: () => UI.sel('Raikal Toll Plaza (Km 58)') + UI.sel('Last 30 minutes'),
        render: () => {
          const wl = VQ.state.wl || 'all';
          const overlay = lanes.map(l => `<div class="tq-lh ${l.kind === 'Cash' ? 'cash' : ''}" style="left:${l.x}%">${l.kind}<br>Lane ${l.n}</div><div class="tq-lt ${wTone(l.wait)}" style="left:${l.x}%" data-tip="<b>${l.kind} Lane ${l.n}</b><br>${l.wait} min wait · ${l.veh} vehicles"><b>${l.wait} min</b><span>${l.veh} vehicles</span></div>`).join('');
          const ws = wl === 'fastag' ? [1, 2, 3, 4].map(n => ({ name: 'Lane ' + n, data: waitSeries[n] })) : wl === 'cash' ? [5, 6].map(n => ({ name: 'Lane ' + n, data: waitSeries[n] })) : [{ name: 'Lane 3', data: waitSeries[3] }, { name: 'Lane 4', data: waitSeries[4] }, { name: 'All lanes (avg.)', data: waitSeries.avg }];
          return `<div class="grid g-2-1">
            <div class="col">
              <div class="card tq-cam" style="padding:8px">${UI.cam({ img: 'cam-toll-plaza.jpg', cls: 'wide', alt: 'Raikal toll plaza, six lanes, southbound', label: 'CAM-0580 · Raikal Toll Plaza · SB', topRight: `<span class="row" style="gap:6px"><span style="display:inline-flex;width:14px;height:14px;color:#ffd24a">${I('sun')}</span>28°C &nbsp;|&nbsp; Clear</span>`, extra: overlay })}
                <div class="row wrap small t2" style="gap:14px;padding:8px 6px 2px"><b class="ink">Wait per lane</b>${waitLegend.map(w => `<span class="row" style="gap:6px"><i class="dot" style="background:${w.color}"></i>${w.name}</span>`).join('')}<span class="grow"></span><span>6 of 6 lanes open · 4 FASTag, 2 cash</span></div></div>
              ${UI.card('Recommended action', UI.actions([
                { icon: 'refresh', tone: 'good', title: 'Switch Cash Lane 5 to FASTag', sub: 'Lane 5 has 4 vehicles and a 3-minute wait. Switching it cuts the Lane 3 and 4 wait by about 4 minutes.', btn: 'Switch Lane 5', primary: 1, toast: 'Lane 5 switch request sent to the Raikal plaza supervisor', done: 'Requested' },
                { icon: 'mega', tone: 'warn', title: 'Show “Use Lanes 1, 2 and 5” on the Km 56 VMS', sub: 'Spreads arriving FASTag traffic away from Lanes 3 and 4.', btn: 'Send to VMS', toast: 'Message sent to VMS at Km 56' },
                { icon: 'cone', tone: 'info', title: 'INC-2037 · Slow traffic at Raikal toll plaza', sub: 'Tailback 0.9 km. Open the incident for impact, root cause and response.', btn: 'Open incident', go: 'incident/INC-2037' },
              ]), { icon: 'sparkles' })}
            </div>
            <div class="col">
              ${UI.card('Toll Plaza Overview', `<div class="tq-ov">
                ${ovStat('car', 'good', 'Total vehicles (30 min)', fmt(raikal.veh), 'up', '12%', 'vs. previous hour', true)}
                ${ovStat('clock', 'good', 'Avg. wait time', raikal.wait + ' mins', 'up', '2.1 mins', 'vs. 07:45 AM', false)}
                ${ovStat('rupee', 'good', 'Toll revenue (today)', lakh(raikal.rev), 'up', '5%', 'vs. yesterday', true)}
                ${ovStat('tag', 'crit', 'FASTag usage', raikal.fastag + '%', 'up', '3%', 'vs. yesterday', true)}</div>`, { right: '<span class="pill gray" style="font-weight:500">Updated 1 min ago</span>' })}
              ${UI.card('Alerts &amp; Notifications', UI.list([
                { icon: 'alert', tone: 'crit', title: 'Lane 3 queue above 10 minutes', sub: '18 vehicles waiting', meta: '08:40 AM', go: 'incident/INC-2037' },
                { icon: 'alert', tone: 'warn', title: 'Lane 4 queue building up', sub: '15 vehicles, increasing', meta: '08:38 AM' },
                { icon: 'info', tone: 'info', title: 'High truck volume', sub: 'Trucks are 32% of Lane 3 and 4 traffic (normal 20%)', meta: '08:32 AM' },
                { icon: 'info', tone: 'info', title: 'Consider opening additional FASTag lane', sub: 'Based on current demand', meta: '08:28 AM' },
              ]), { right: UI.viewAll('incidents/feed') })}
            </div>
          </div>
          <div class="grid g3">
            ${UI.card('Queue Length by Lane', C.bars({ h: 200, labels: lanes.map(l => `Lane ${l.n}|${l.kind}`), twoLine: 1, valueLabels: 1, unit: 'vehicles', series: [{ name: 'Vehicles waiting', data: lanes.map(l => l.veh) }], colorOf: i => `var(--${wTone(lanes[i].wait)})`, legendItems: waitLegend }) + '<div class="card-note">Bar height is vehicles waiting; colour is the wait class. Lanes 3 and 4 hold 33 of the 60 queued vehicles.</div>')}
            ${UI.card('Average Wait Time Trend', C.line({ h: 200, labels: tLabels, xTicks: 6, yTitle: 'Wait time (mins)', unit: 'min', yMax: 16, limit: { v: 10, label: '' }, series: ws }) + `<div class="card-note">${wl === 'cash' ? 'Cash lanes are steady; Lane 5 has spare capacity.' : 'Lane 3 crossed 10 minutes at 08:35 AM and is still climbing.'} Red line: 10-minute alert threshold.</div>`, { right: UI.seg('wl', [['all', 'All'], ['fastag', 'FASTag'], ['cash', 'Cash']], wl) })}
            ${UI.card('Vehicle Mix (Last 30 Minutes)', C.donut({ size: 150, thick: 24, center: { v: fmt(raikal.veh), l: 'Vehicles' }, items: mix.map(([l, v]) => ({ label: l, value: v, text: fmt(v) })) }))}
          </div>`;
        } },

      /* ---------- Revenue leakage: the funnel ---------- */
      leakage: { title: 'Revenue Leakage', sub: 'Toll that was due but not collected, from the corridor down to one lane and one shift.', render: () => {
        const byPlaza = [...D.plazas].sort((a, b) => b.leak24 - a.leak24);
        const mark = 6;
        return UI.card('From vehicles seen to rupees lost, last 24 hours', funnel([
          fnode('Vehicles seen by cameras', fmt(F.seen), 'All 8 plazas, both directions'),
          fnode('Transactions recorded', fmt(F.recorded), `${fmt(F.seen - F.recorded)} vehicles passed with no transaction`),
          fnode('Matched and correct', fmt(F.matched), `${(F.matched / F.seen * 100).toFixed(1)}% of vehicles seen`),
          fnode('Discrepancies found by AI', fmt(F.disc), `${(F.disc / F.seen * 100).toFixed(1)}% of vehicles; average shortfall ₹ 380`, { tone: 'warn' }),
          fnode('Flagged for review', fmt(F.flagged), 'Largest shortfalls and repeat tags', { go: 'toll/review', tone: 'warn' }),
          fnode('Confirmed leakage', `${fmt(F.confirmed)} <small style="font-size:12px;font-weight:600">(${T.confirmedPct}%)</small>`, `${review.Cleared} cleared, ${review['Under review'] + review.New} still open`, { go: 'toll/review', tone: 'warn' }),
          fnode('Estimated value lost', lakh(T.leak24), `${T.leakPct}% of the ₹ ${T.rev24} Cr collected`, { tone: 'crit' }),
        ]) + `<div class="card-note mt">Every vehicle is classified by camera and compared with what the lane charged. The value is the toll due on all ${fmt(F.disc)} discrepancies; reviewers check the ${F.flagged} that matter most, and ${T.confirmedPct}% of those are confirmed.</div>`, { icon: 'filter', cls: 'mb', right: `<span>At this rate: <b class="ink">≈ ₹ ${T.leakMonth} Cr a month</b></span>` })
        + `<div class="grid g3">
          ${UI.card('Leakage by plaza (₹ lakh, 24 h)', C.hbars({ unit: 'lakh', items: byPlaza.map(p => ({ label: `${p.name} · Km ${p.km}`, value: p.leak24, icon: 'toll', text: p.leak24.toFixed(1), go: p.id === 'pullur' ? 'toll/patterns' : p.id === 'raikal' ? 'toll/queue' : 'toll/review', note: `${leakPct(p).toFixed(1)}% of this plaza's revenue${p.id === 'pullur' ? ' · outlier' : ''}` })) }) + `<div class="card-note mt">Pullur is ${pct(pullur.leak24, T.leak24)}% of corridor leakage on 13% of corridor revenue. Total ${lakh(T.leak24)}.</div>`, { right: UI.pill('Pullur is the outlier', 'crit', 'alert') })}
          ${UI.card('Leakage by type (₹ lakh, 24 h)', C.hbars({ unit: 'lakh', items: leakTypes.map(t => ({ label: t.label, value: t.v, icon: t.icon, text: t.v.toFixed(1), note: `${fmt(t.n)} vehicles. ${t.note}`, go: 'toll/review' })) }) + `<div class="card-note mt">Class mismatch is ${pct(leakTypes[0].v, T.leak24)}% of the loss: a truck seen by the camera, a car or LCV charged by the lane. Total ${lakh(T.leak24)}.</div>`)}
          ${UI.card('Leakage per day, last 14 days (₹ lakh)', C.line({ h: 200, labels: days14, xTicks: 5, unit: 'lakh', endLabels: 1, mark: { i: mark, label: '09 Sep: Pullur starts rising', color: 'var(--s1)' }, series: [{ name: 'Pullur', data: pullur14 }, { name: 'Other 7 plazas', data: others14, color: 'var(--axis)' }] }) + '<div class="card-note">The other seven plazas are flat, with weekend dips. Pullur has risen every weekday since 09 Sep, from ₹ 1.6 lakh to ₹ 5.8 lakh a day.</div>')}
        </div>
        <div class="grid g-2-1">
          ${UI.card(`Pullur Toll Plaza (Km ${pullur.km}): where the ${lakh(pullur.leak24)} goes`, `<div class="grid g2 tq-wv" style="margin-bottom:10px;gap:24px">
              <div><div class="small b ink mb">By lane (₹ lakh)</div>${C.hbars({ unit: 'lakh', items: pLanes.map(([l, v]) => ({ label: l, value: v, text: `${v.toFixed(2)} · ${pct(v, pullur.leak24)}%` })) })}</div>
              <div><div class="small b ink mb">By shift (₹ lakh)</div>${C.hbars({ unit: 'lakh', items: pShifts.map(([l, v]) => ({ label: l, value: v, text: `${v.toFixed(2)} · ${pct(v, pullur.leak24)}%` })) })}
                <div class="card-note mt">By type at Pullur: class mismatch ₹ 4.1 lakh, all other types ₹ 1.7 lakh.</div></div>
            </div>
            ${UI.insight('sparkles', 'crit', 'Lane 4, night shift: 3-axle trucks charged as LCV; same 14 tags repeat', 'Lane 4 carries 62% of Pullur\'s leakage and the night shift 58%. The lane sensor reports LCV for trucks the camera counts at 3 to 5 axles, and operator OP-117 overrode the class on 41 passes this week.')}
            <div class="row wrap" style="gap:8px">${UI.btn('Review Pullur transactions', { primary: 1, icon: 'eye', go: 'toll/review' })}${UI.btn('See the repeat pattern', { icon: 'trend', go: 'toll/patterns' })}${UI.btn('Send audit request to concessionaire', { ghost: 1, icon: 'file', toast: 'Audit request for Pullur Lane 4 sent to the concessionaire', done: 'Sent' })}</div>`, { icon: 'toll', right: UI.pill(`${leakPct(pullur).toFixed(1)}% of plaza revenue`, 'crit') })}
          ${UI.card('Monthly exposure', UI.statRow([[lakh(T.leak24), 'Lost per day, corridor', 'crit-ink'], [`≈ ₹ ${T.leakMonth} Cr`, 'Per month at this rate', 'crit-ink']]) + `<div class="card-note mt mb">${monthNote}</div>
            ${UI.kv([['toll', 'Pullur above its usual level', '≈ ₹ 1.2 Cr a month'], ['truck', 'Class mismatch, all plazas', '≈ ₹ 1.8 Cr a month'], ['wifi', 'Tags not read, passed free', '≈ ₹ 0.8 Cr a month'], ['checkc', 'Recoverable by notice (tag known)', '64% of value']])}
            <div class="card-note mt">Pullur ran at ₹ 1.6 lakh a day until 08 Sep. Bringing it back there recovers ₹ 4.2 lakh a day.</div>`, { icon: 'rupee' })}
        </div>`;
      } },

      /* ---------- Transaction review ---------- */
      review: { title: 'Transaction Review', sub: 'What the camera saw against what the lane charged. Confirm, clear or recover each one.', render: () => {
        const cur = txns.find(t => t.id === VQ.state.txn) || txns[0], ty = typeOf(cur.type), truck = /truck|MAV/.test(cur.obs), ok = cur.status === 'Cleared';
        const head = ['Transaction', 'Plaza · lane', 'Observed / charged', 'Paid / due', 'Shortfall', 'Discrepancy', 'Status'];
        const body = txns.map(t => `<tr class="click ${t.id === cur.id ? 'tq-sel' : ''}" data-set="txn=${t.id}"><td class="tq-2l"><b class="ink">${t.id}</b><small>${t.day || '16 Sep'}, ${t.at}</small></td><td class="tq-2l">${t.plaza}<small>${t.lane}</small></td><td class="tq-2l"><b class="ink">${t.obs}</b><small>charged: ${t.chg}</small></td><td class="r">${rs(t.paid)} / ${rs(t.due)}</td><td class="r"><b class="${t.short ? 'up-bad' : 'up-good'}">${rs(t.short)}</b></td><td class="tq-2l">${typeOf(t.type).short}<small>AI confidence ${t.conf}%</small></td><td>${UI.pill(t.status, stTone[t.status])}</td></tr>`).join('');
        const hDays = ['14 Sep', '12 Sep', '11 Sep', '10 Sep'], hTimes = ['11:36 PM', '01:08 AM', '10:54 PM', '12:47 AM'], k = +cur.id.slice(-2) % 4;
        const hist = cur.plaza === 'Pullur' ? UI.table([{ k: 'd', label: 'Earlier pass' }, { k: 'l', label: 'Lane' }, { k: 'c', label: 'Charged as' }, { k: 's', label: 'Shortfall', r: 1, fmt: v => `<b class="up-bad">${rs(v)}</b>` }, { k: 'st', label: 'Status', fmt: v => UI.pill(v, stTone[v]) }],
          hDays.map((d, i) => ({ d: `${d}, ${hTimes[(i + k) % 4]}`, l: 'Pullur · Lane 4', c: cur.chg, s: cur.gap, st: 'Confirmed' }))) + '<div class="card-note mt">Latest 4 earlier passes. Same lane, same shift, same class charged.</div>'
          : `<div class="card-note">${cur.rec}. No earlier class mismatch is on record for this vehicle at other plazas, so it is handled as a single case. If it is confirmed twice more in 30 days it joins the repeat list.</div>`;
        const cam = truck ? { img: 'cam-stalled-truck.jpg', box: { x: 39.5, y: 32, w: 21, h: 45 } } : { img: 'cam-toll-plaza.jpg', box: { x: 29.5, y: 40, w: 12.5, h: 17 } };
        return `<div class="grid" style="grid-template-columns:minmax(0,1.62fr) minmax(0,1fr)">
          <div class="col">
            ${UI.card('Review queue, last 24 hours', UI.statRow([[T.flagged24, 'Flagged by AI'], [review.New, 'New', 'blue'], [review['Under review'], 'Under review', 'warn-ink'], [review.Confirmed, `Confirmed (${T.confirmedPct}%)`, 'crit-ink'], [review.Cleared, 'Cleared as correct', 'good-ink']]))}
            ${UI.card('Flagged transactions', `<div class="tbl-wrap"><table class="tbl tq-tbl"><thead><tr>${head.map((h, i) => `<th class="${i === 3 || i === 4 ? 'r' : ''}">${h}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table></div>
              <div class="card-note mt">Showing the 11 highest-priority of ${T.flagged24}. Priority is shortfall times repeat count. Select a row to see its evidence.</div>`, { right: `${UI.btn('Export list', { sm: 1, ghost: 1, icon: 'download', toast: 'Flagged transactions exported (demo)', done: 'Exported' })}` })}
            ${UI.card(`History for ${cur.reg} (30 days)`, hist, { icon: 'refresh', right: cur.plaza === 'Pullur' ? UI.btn('See the repeat pattern', { sm: 1, icon: 'trend', go: 'toll/patterns' }) : '' })}
          </div>
          <div class="col">
            ${UI.card(`${cur.id} · evidence`, `${UI.cam({ img: cam.img, cls: cur.night ? 'night' : '', live: false, label: `${cur.plaza} · ${cur.lane} · classification camera`, time: `${cur.day || '16 Sep'} 2026, ${cur.at}`, foot: 'Recorded frame', boxes: [{ ...cam.box, label: `Observed: ${cur.obs} · ${cur.conf}%`, tone: ok ? '' : 'crit' }] })}
              <div class="mt mb">${UI.kv([['car', 'Registration', `<b class="ink num">${cur.reg}</b> <span class="muted small">shown where lawfully available</span>`], ['tag', 'Tag / receipt', `<span class="num">${cur.tag}</span>`], ['flag', 'Discrepancy type', ty.label]])}</div>
              <div class="tq-vs mb"><div class="obs"><div class="k">Observed by camera</div><b>${cur.obs}</b><div class="s">Toll due ${rs(cur.due)}</div></div><i>${ok ? '=' : '≠'}</i><div class="chg ${ok ? 'ok' : ''}"><div class="k">Charged by lane</div><b>${cur.chg}</b><div class="s">Toll paid ${rs(cur.paid)}</div></div></div>
              ${UI.statRow([[rs(cur.paid), 'Toll paid'], [rs(cur.due), 'Toll due'], [rs(cur.short), ok ? 'Shortfall after review' : 'Shortfall', ok ? 'good-ink' : 'crit-ink']])}
              <div class="mt">${UI.insight('eye', ok ? 'good' : 'blue', ok ? 'Reviewer finding' : 'Why the AI flagged it', cur.why)}${UI.insight('refresh', cur.recTone, 'Recurrence', cur.rec, cur.recTone === 'crit' ? 'toll/patterns' : null)}</div>
              <div class="small b ink" style="margin:10px 0 6px">Verification</div>
              <div class="tq-btns">${UI.btn('Confirm leakage', { primary: 1, icon: 'check', toast: `${cur.id} confirmed as leakage, ${rs(cur.gap)} added to recovery`, done: 'Confirmed' })}${UI.btn('Clear as correct', { icon: 'checkc', toast: `${cur.id} cleared as correctly charged`, done: 'Cleared' })}${UI.btn('Raise recovery notice', { icon: 'file', toast: `Recovery notice for ${rs(cur.gap)} raised against the tag holder`, done: 'Notice raised' })}${UI.btn('Flag tag for enforcement', { icon: 'flag', toast: 'Tag added to the enforcement watch list at all 8 plazas', done: 'Flagged' })}</div>`, { icon: 'eye', right: UI.pill(cur.status, stTone[cur.status]) })}
          </div></div>`;
      } },

      /* ---------- Leakage patterns ---------- */
      patterns: { title: 'Leakage Patterns', sub: 'The same lanes, hours and tags keep coming back. Fix the pattern and the single cases stop.', render: () => {
        const hours = Array.from({ length: 24 }, (_, h) => String(h).padStart(2, '0')), r = VQ.rng(21), base = [1.2, 1.6, 2, 0, 1.4, 1];
        const vals = base.map((b, li) => hours.map((_, h) => { const night = h >= 22 || h < 6;
          if (li === 3) return [22, 23, 0, 1].includes(h) ? Math.round(46 + r() * 12) : h === 21 || h === 2 ? Math.round(22 + r() * 6) : night ? Math.round(12 + r() * 4) : Math.round(4 + r() * 4);
          return Math.round(b * (night ? 1.5 : 1) + r() * 2.2); }));
        const tot = vals.flat().reduce((a, b) => a + b, 0), l4 = vals[3].reduce((a, b) => a + b, 0), hot = [22, 23, 0, 1].reduce((a, h) => a + vals[3][h], 0);
        const shown = offenders.reduce((a, o) => a + o.n, 0);
        const pr = [
          { title: 'Audit the Lane 4 AVC sensor calibration at Pullur', ev: 'The sensor reports LCV for trucks the camera counts at 3 to 5 axles. About 550 passes a day, with no operator action.', day: 2.2, month: '≈ ₹ 62 lakh', btn: 'Raise audit', toast: 'AVC calibration audit raised for Pullur Lane 4' },
          { title: 'Review night-shift class overrides by operator OP-117', ev: '41 manual overrides to LCV this week, all on Lane 4 between 22:00 and 02:00. Other night operators average 3.', day: 0.9, month: '≈ ₹ 25 lakh', btn: 'Open review', toast: 'Override review for OP-117 sent to the plaza manager' },
          { title: 'Replace the Lane 3 tag reader at Raikal', ev: 'Read retries up 3x since 07:50 AM. Marshals raise the barrier to keep the queue moving, so vehicles pass free.', day: 0.7, month: '≈ ₹ 20 lakh', btn: 'Open asset alert', go: 'assets/alerts' },
          { title: 'Require an ID capture for exempt passes at Devanahalli', ev: '38 exempt passes keyed in since midnight against a normal 15; 3 of 4 checked had no exempt markings.', day: 0.6, month: '≈ ₹ 17 lakh', btn: 'Notify plaza', toast: 'Exempt-pass instruction sent to Devanahalli plaza' },
          { title: 'Send enforcement notices to the 14 repeat tags', ev: '104 flagged passes in 30 days at Pullur Lane 4. Shortfall to recover ₹ 43,420; blacklist on the next mismatch.', day: null, month: '₹ 43,420', monthLbl: 'to recover', btn: 'Send notices', toast: 'Enforcement notices queued for 14 tags' },
        ];
        return UI.card('', UI.statRow([[lakh(T.leak24), 'Estimated exposure per day', 'crit-ink'], [`≈ ₹ ${T.leakMonth} Cr`, 'Estimated exposure per month', 'crit-ink'], ['₹ 3.1 lakh', 'Per day from one pattern: Pullur Lane 4, class mismatch'], ['14', 'Repeat tags at Pullur Lane 4 (30 days)'], ['OP-117', 'Operator with 41 class overrides this week']]) + `<div class="card-note mt">Monthly figure: ${monthNote}</div>`, { cls: 'mb' })
        + `<div class="grid g-5-3">
          <div class="col">
            ${UI.card('Discrepancies at Pullur by lane and hour of day (last 30 days)', `<div class="tq-heat">${C.heat({ rows: ['Lane 1 · FASTag', 'Lane 2 · FASTag', 'Lane 3 · FASTag', 'Lane 4 · FASTag', 'Lane 5 · Cash', 'Lane 6 · Cash'], cols: hours, colEvery: 2, values: vals, unit: 'discrepancies', color: v => C.seqBlue(v / 60) })}</div>` + seqLegend('Fewer', 'More discrepancies per lane-hour')
              + `<div class="card-note mt">Lane 4 holds ${pct(l4, tot)}% of Pullur's discrepancies, and the four hours from 22:00 to 02:00 alone hold ${pct(hot, tot)}%, in 4 of 144 lane-hours. No other lane shows a night peak, so this is the lane, not the traffic.</div>`, { icon: 'grid' })}
            ${UI.card('How the Pullur pattern works', UI.chain([{ k: 'Where', title: 'Pullur, Lane 4', text: '62% of the plaza\'s leakage in one of six lanes' }, { k: 'When', title: 'Night shift, 22:00–02:00', text: '58% of the loss falls in the night shift' }, { k: 'How', title: 'Trucks charged as LCV', text: 'Lane sensor misreads axles; OP-117 overrides the rest', cls: 'root' }, { k: 'Who', title: '14 repeat tags', text: '104 flagged passes in 30 days; two fleets own half of the top 8', cls: 'out' }]), { icon: 'link', right: UI.btn('Review these transactions', { sm: 1, go: 'toll/review' }) })}
            ${UI.card('Investigation priorities, ranked by monthly exposure', pr.map((p, i) => `<div class="tq-pr"><div class="rk">${i + 1}</div><div><b class="ink">${p.title}</b><div class="small t2">${p.ev}</div></div><div class="ex"><b>${p.month}</b><span>${p.monthLbl || `a month · ${lakh(p.day)} a day`}</span></div>${UI.btn(p.btn, p.go ? { sm: 1, go: p.go } : { sm: 1, primary: i < 2, toast: p.toast, done: 'Sent' })}</div>`).join(''), { icon: 'flag' })}
          </div>
          <div class="col">
            ${UI.card('Repeat tags, Pullur Lane 4 (last 30 days)', UI.table([{ k: 'reg', label: 'Registration / tag', fmt: (v, o) => `<div class="tq-2l" style="white-space:nowrap"><b class="ink num">${v}</b><small class="num">Tag ${o.tag}</small></div>` }, { k: 'op', label: 'Fleet / operator', fmt: v => { const [a, b] = v.split(', '); return `<div class="tq-2l ${b ? '' : 'muted'}">${a}${b ? `<small>${b}</small>` : ''}</div>`; } }, { k: 'n', label: 'Flagged', r: 1, fmt: v => v + '×' }, { k: 'each', label: 'Shortfall', r: 1, fmt: (v, o) => `<b class="up-bad">${rs(v * o.n)}</b>` }, { k: 'last', label: 'Last seen', fmt: (v, o) => { const [a, b] = v.split(', '); return `<div class="tq-2l" style="white-space:nowrap">${a}<small>${b}</small><small>${o.where}</small></div>`; } }],
              offenders.map(o => ({ ...o, go: 'toll/review' }))) + `<div class="card-note mt">Top 8 of 14 tags (${shown} of 104 flagged passes). Registrations are masked and shown where lawfully available. Two fleets own 4 of the 8; four tags have no registered operator.</div>`, { icon: 'tag' })}
            ${UI.card('Discrepancies by vehicle class seen (24 h)', C.hbars({ unit: 'vehicles', items: [['3-axle truck', 1240], ['MAV (4 to 6 axle)', 820], ['2-axle truck / bus', 610], ['LCV', 540], ['Car / Jeep', 470], ['Oversized vehicle', 160]].map(([l, v]) => ({ label: l, value: v, text: fmt(v) })) }))}
            ${UI.card('Discrepancies by transaction type (24 h)', C.hbars({ unit: 'vehicles', items: [['FASTag, automatic read', 1480], ['No transaction recorded', 1250], ['FASTag, manual class override', 430], ['Exempt pass', 380], ['Cash receipt', 300]].map(([l, v]) => ({ label: l, value: v, text: fmt(v) })) }) + `<div class="card-note mt">Both charts total ${fmt(F.disc)} discrepancies across the 8 plazas.</div>`)}
          </div>
        </div>`;
      } },
    },
  });
  /* scoped styles travel with every view of this section */
  Object.values(VQ.SCREENS.toll.views).forEach(v => { const r = v.render; v.render = ctx => CSS + r(ctx); });
})();
