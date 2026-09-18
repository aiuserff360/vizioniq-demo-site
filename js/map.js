/* =========================================================
   VizionIQ demo · schematic corridor map (NH-44 Hyderabad -> Bengaluru)
   A drawn map, not a tile map. Positions come from the distance marker (km).
   ========================================================= */
VQ.Map = (() => {
  const KM = 570, WW = 1000, WH = 400;
  const CP = [[38, 96], [120, 128], [205, 118], [292, 160], [378, 172], [462, 214], [548, 204], [640, 246], [730, 236], [822, 278], [900, 306], [964, 296]];
  /* Catmull-Rom sample of the route, with cumulative length for km lookup */
  const PTS = []; (() => { const p = [CP[0], ...CP, CP[CP.length - 1]];
    for (let i = 1; i < p.length - 2; i++) for (let t = 0; t < 1; t += .04) { const [a, b, c, d] = [p[i - 1], p[i], p[i + 1], p[i + 2]], t2 = t * t, t3 = t2 * t;
      PTS.push([0, 1].map(k => .5 * ((2 * b[k]) + (-a[k] + c[k]) * t + (2 * a[k] - 5 * b[k] + 4 * c[k] - d[k]) * t2 + (-a[k] + 3 * b[k] - 3 * c[k] + d[k]) * t3))); }
    PTS.push(CP[CP.length - 1]); })();
  const CUM = [0]; for (let i = 1; i < PTS.length; i++) CUM.push(CUM[i - 1] + Math.hypot(PTS[i][0] - PTS[i - 1][0], PTS[i][1] - PTS[i - 1][1]));
  const LEN = CUM[CUM.length - 1];
  const idxAt = km => { const d = VQ.clamp(km, 0, KM) / KM * LEN; let i = 1; while (i < CUM.length - 1 && CUM[i] < d) i++; return [i, (d - CUM[i - 1]) / (CUM[i] - CUM[i - 1] || 1)]; };
  const pos = km => { const [i, f] = idxAt(km); return [PTS[i - 1][0] + (PTS[i][0] - PTS[i - 1][0]) * f, PTS[i - 1][1] + (PTS[i][1] - PTS[i - 1][1]) * f]; };
  const normal = km => { const [i] = idxAt(km); const dx = PTS[i][0] - PTS[i - 1][0], dy = PTS[i][1] - PTS[i - 1][1], l = Math.hypot(dx, dy) || 1; return [dy / l, -dx / l]; };
  const pathBetween = (a, b) => { const [ia] = idxAt(a), [ib] = idxAt(b); const pts = [pos(a), ...PTS.slice(ia, ib), pos(b)]; return pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(''); };

  const TONE = { crit: '#d8342f', warn: '#f5a300', serious: '#ec6a2c', good: '#12a150', info: '#1565d8', violet: '#6a4fd0', navy: '#0d3170', gray: '#7d8aa0' };
  const SPEED = { free: '#1fa64a', moderate: '#f2c230', slow: '#f08a24', congested: '#d8342f' };
  const LEGENDS = {
    speed: `<b>Traffic speed (km/h)</b><span><i style="background:${SPEED.free}"></i>&gt; 80 · Free flow</span><span><i style="background:${SPEED.moderate}"></i>60 – 80 · Moderate</span><span><i style="background:${SPEED.slow}"></i>40 – 60 · Slow</span><span><i style="background:${SPEED.congested}"></i>&lt; 40 · Congested</span>`,
    assets: `<span><i class="rd" style="background:${TONE.good}"></i>Healthy</span><span><i class="rd" style="background:${TONE.warn}"></i>Attention</span><span><i class="rd" style="background:${TONE.crit}"></i>Fault / Offline</span><span><i class="rd" style="background:${TONE.info}"></i>Under maintenance</span>`,
  };

  function backdrop(s) {
    const f = n => (n * s).toFixed(2);
    let g = `<rect x="-400" y="-300" width="1800" height="1000" fill="#e9f0e4"/>`;
    [[150, 300, 170, 70, '#dfead8'], [520, 70, 210, 80, '#dfead8'], [820, 120, 160, 70, '#e3edd9'], [330, 330, 200, 60, '#f0f1e2'], [700, 360, 220, 60, '#dce8d4'], [60, 30, 120, 50, '#f0f1e2'], [930, 380, 120, 50, '#dfead8']].forEach(e => { g += `<ellipse cx="${e[0]}" cy="${e[1]}" rx="${e[2]}" ry="${e[3]}" fill="${e[4]}"/>`; });
    /* rivers: Krishna, Tungabhadra, Penna */
    [['M210,-20C232,60 236,110 262,142S300,250 282,420', 5], ['M318,420C330,300 352,220 372,172S420,60 470,-20', 4], ['M560,-20C590,90 600,170 612,232S640,340 690,420', 3]].forEach(r => { g += `<path d="${r[0]}" fill="none" stroke="#b9d6ee" stroke-width="${f(r[1])}" stroke-linecap="round"/>`; });
    /* other roads */
    ['M-20,60 120,128 60,260 -20,330', 'M205,118 250,20', 'M120,128 170,230 140,420', 'M378,172 300,260 250,420', 'M378,172 470,110 600,80 760,-20', 'M548,204 520,330 560,420', 'M640,246 760,170 900,150 1020,90', 'M822,278 760,350 770,420', 'M964,296 1020,250', 'M964,296 930,420', 'M900,306 1020,350', 'M462,214 430,300 440,420'].forEach(d => { g += `<path d="M${d.replace(/ /g, 'L')}" fill="none" stroke="#fff" stroke-width="${f(2.2)}" opacity=".85"/>`; });
    /* state borders */
    ['M330,-20C350,80 360,150 352,200S330,330 350,420', 'M760,-20C800,120 815,210 806,290S800,380 820,420'].forEach(d => { g += `<path d="${d}" fill="none" stroke="#9aa79c" stroke-width="${f(1.4)}" stroke-dasharray="${f(7)} ${f(5)}"/>`; });
    [['TELANGANA', 170, 50], ['ANDHRA PRADESH', 600, 120], ['KARNATAKA', 905, 215]].forEach(t => { g += `<text x="${t[1]}" y="${t[2]}" text-anchor="middle" style="font-size:${f(12)}px;letter-spacing:${f(3)}px;fill:#93a294;font-weight:600">${t[0]}</text>`; });
    [['Mahbubnagar', 232, 212], ['Nandyal', 470, 104], ['Ballari', 430, 306], ['Kadapa', 770, 162], ['Tumakuru', 772, 356], ['Raichur', 168, 236], ['Hindupur', 760, 300]].forEach(t => { g += `<circle cx="${t[1]}" cy="${t[2]}" r="${f(2.2)}" fill="#8a978c"/><text x="${t[1] + 5 * s}" y="${t[2] + 3.5 * s}" style="font-size:${f(10.5)}px;fill:#6f7d72">${t[0]}</text>`; });
    return g;
  }

  function render(o) {
    o = o || {}; const H0 = o.h || 320;
    const id = VQ.mount(el => {
      const W = Math.max(260, el.clientWidth), H = Math.max(o.h || 320, el.clientHeight); const D = VQ.data || {};
      if (!el._z) el._z = { range: o.range || [0, KM] };
      const [ka, kb] = el._z.range; const full = ka <= 0 && kb >= KM;
      /* viewBox: bounding box of the visible route, padded, fitted to the card aspect */
      let x0, x1, y0, y1; if (full) { x0 = -34; x1 = WW + 10; y0 = 24; y1 = WH - 14; } else { const ps = []; for (let k = ka; k <= kb; k += (kb - ka) / 24) ps.push(pos(k)); x0 = Math.min(...ps.map(p => p[0])); x1 = Math.max(...ps.map(p => p[0])); y0 = Math.min(...ps.map(p => p[1])); y1 = Math.max(...ps.map(p => p[1])); const pad = Math.max(16, (x1 - x0) * .16); x0 -= pad; x1 += pad; y0 -= pad; y1 += pad; }
      let vw = x1 - x0, vh = y1 - y0; const ar = W / H; if (vw / vh < ar) { const n = vh * ar; x0 -= (n - vw) / 2; vw = n; } else { const n = vw / ar; y0 -= (n - vh) / 2; vh = n; }
      const s = vw / W; const f = n => (n * s).toFixed(2);
      let g = backdrop(s);
      /* route: casing, then speed-coloured segments */
      const rw = o.routeWidth || 5.5; g += `<path d="${pathBetween(0, KM)}" fill="none" stroke="#fff" stroke-width="${f(rw + 4)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${pathBetween(0, KM)}" fill="none" stroke="#8fa0b6" stroke-width="${f(rw + 4.8)}" stroke-linecap="round" opacity=".35"/><path d="${pathBetween(0, KM)}" fill="none" stroke="#fff" stroke-width="${f(rw + 3.4)}" stroke-linecap="round"/>`;
      (o.segments || D.speedSegments || [{ from: 0, to: KM, state: 'free' }]).forEach(sg => { g += `<path d="${pathBetween(sg.from, sg.to)}" fill="none" stroke="${o.plainRoute ? '#1fa64a' : SPEED[sg.state]}" stroke-width="${f(rw)}" stroke-linecap="butt" data-tip="<b>Km ${sg.from} – ${sg.to}</b><br>${sg.note || ({ free: 'Free flow', moderate: 'Moderate', slow: 'Slow', congested: 'Congested' })[sg.state]}${sg.speed ? ' · avg ' + sg.speed + ' km/h' : ''}"/>`; });
      if (o.highlight) g += `<path d="${pathBetween(o.highlight[0], o.highlight[1])}" fill="none" stroke="${TONE.crit}" stroke-width="${f(rw + 9)}" stroke-linecap="round" opacity=".22"/>`;
      /* towns: dots now, labels after the pins so a pin never hides a name */
      let labels = '';
      if (o.towns !== false) (D.places || []).forEach(t => { if (t.km < ka - 30 || t.km > kb + 30) return; if (full && t.minor && W < 900) return; const p = pos(t.km), big = t.major; const below = t.below ? 1 : -1; const edge = !full && (p[0] < x0 + 44 * s || p[0] > x0 + vw - 44 * s);
        g += `<circle cx="${p[0]}" cy="${p[1]}" r="${f(big ? 5 : 3)}" fill="#fff" stroke="#34445f" stroke-width="${f(big ? 2.2 : 1.5)}"/>`;
        if (big && o.ends !== false && (t.km === 0 || t.km === KM)) { if (full || (p[0] > x0 + 130 * s && p[0] < x0 + vw - 130 * s)) labels += `<text x="${p[0] + (t.km === 0 ? -6 : 8) * s}" y="${p[1] + (t.km === 0 ? -22 : 36) * s}" text-anchor="${t.km === 0 ? 'start' : 'end'}" style="font-size:${f(15)}px;font-weight:800;fill:#0b2559;paint-order:stroke;stroke:#fff;stroke-width:${f(4)}px">${t.km === 0 ? '← ' + t.name : t.name + ' →'}</text>`; }
        else if (!edge) labels += `<text x="${p[0]}" y="${p[1] + (below > 0 ? 28 : -19) * s}" text-anchor="middle" style="font-size:${f(big ? 12.5 : 11)}px;font-weight:${big ? 700 : 500};fill:#2b3a55;paint-order:stroke;stroke:#fff;stroke-width:${f(3.2)}px">${t.name}</text>`; });
      if (o.kmTicks) for (let k = Math.ceil(ka / o.kmTicks) * o.kmTicks; k <= kb; k += o.kmTicks) { const p = pos(k), n = normal(k); g += `<line x1="${p[0]}" y1="${p[1]}" x2="${p[0] - n[0] * 9 * s}" y2="${p[1] - n[1] * 9 * s}" stroke="#52607a" stroke-width="${f(1.2)}"/><text x="${p[0] - n[0] * 19 * s}" y="${p[1] - n[1] * 19 * s + 3 * s}" text-anchor="middle" style="font-size:${f(9.5)}px;fill:#52607a;paint-order:stroke;stroke:#fff;stroke-width:${f(2.5)}px">Km ${k}</text>`; }
      /* pins */
      const pins = (o.pins || []).filter(p => p.km >= ka - 1 && p.km <= kb + 1).sort((a, b) => (a.sel ? 1 : 0) - (b.sel ? 1 : 0)); let calls = '';
      pins.forEach(p => { const c = pos(p.km), col = TONE[p.tone] || TONE.navy; const attrs = `class="pin ${p.sel ? 'sel' : ''}" ${p.go ? `data-go="${p.go}"` : ''} ${p.tip ? `data-tip="${p.tip}"` : ''}`;
        let tipY;
        if (p.type === 'incident') { const r = (p.sel ? 14 : 11.5) * s; tipY = c[1] - r; g += `<g ${attrs}><circle cx="${c[0]}" cy="${c[1]}" r="${r + 2.2 * s}" fill="#fff"/><circle cx="${c[0]}" cy="${c[1]}" r="${r}" fill="${col}"/>${VQ.iconG(p.icon || 'alert', c[0], c[1], r * 1.25, '#fff', 2.3)}${p.count ? `<circle cx="${c[0] + r}" cy="${c[1] - r}" r="${f(7)}" fill="#1b2433" stroke="#fff" stroke-width="${f(1.5)}"/><text x="${c[0] + r}" y="${c[1] - r + 3.2 * s}" text-anchor="middle" style="font-size:${f(9)}px;font-weight:700;fill:#fff">${p.count}</text>` : ''}</g>`; }
        else { const up = p.below ? -1 : 1, hh = 30 * s, r = 10.5 * s, cy = c[1] - up * (hh - r); tipY = p.below ? c[1] : c[1] - hh;
          g += `<g ${attrs}><path d="M${c[0]},${c[1] - up * 3 * s}L${c[0] - r * .62},${cy + up * r * .75}A${r},${r} 0 1 ${p.below ? 0 : 1} ${c[0] + r * .62},${cy + up * r * .75}Z" fill="${col}" stroke="#fff" stroke-width="${f(1.8)}"/>${VQ.iconG(p.icon || 'video', c[0], cy, r * 1.15, '#fff', 2.3)}</g>`; }
        if (p.callout) { const co = p.callout, lines = [co.title, ...(co.lines || [])], w = (Math.max(...lines.map(l => l.length)) * 6.4 + (co.icon ? 40 : 20)) * s, h = (lines.length * 14.5 + 12) * s, up = co.below ? -1 : 1;
          let bx = c[0] - w / 2 + (co.dx || 0) * s; bx = VQ.clamp(bx, x0 + 6 * s, x0 + vw - w - 6 * s); const by = up > 0 ? (tipY ?? c[1]) - h - (co.gap || 14) * s : c[1] + (co.gap || 20) * s; const dark = co.tone === 'dark', fill = dark ? '#16233f' : co.tone === 'crit' ? '#b5211c' : '#fff', ink = dark || co.tone === 'crit' ? '#fff' : '#0b2559';
          calls += `<g ${p.go ? `data-go="${p.go}" style="cursor:pointer"` : ''}><line x1="${c[0]}" y1="${up > 0 ? (tipY ?? c[1]) : c[1] + 12 * s}" x2="${VQ.clamp(c[0], bx + 8 * s, bx + w - 8 * s)}" y2="${up > 0 ? by + h : by}" stroke="${co.tone === 'warn' ? TONE.warn : fill === '#fff' ? '#7d8aa0' : fill}" stroke-width="${f(1.6)}"/><rect x="${bx}" y="${by}" width="${w}" height="${h}" rx="${f(6)}" fill="${fill}" stroke="${co.tone === 'warn' ? TONE.warn : fill === '#fff' ? '#d5dde9' : fill}" stroke-width="${f(1.4)}" style="filter:drop-shadow(0 ${f(1.5)}px ${f(3)}px rgba(11,37,89,.18))"/>${co.icon ? `<rect x="${bx + 7 * s}" y="${by + 8 * s}" width="${f(22)}" height="${f(22)}" rx="${f(5)}" fill="${TONE[co.iconTone || p.tone] || col}"/>${VQ.iconG(co.icon, bx + 18 * s, by + 19 * s, 14 * s, '#fff', 2.3)}` : ''}${lines.map((l, i) => `<text x="${bx + (co.icon ? 36 : 10) * s}" y="${by + (17 + i * 14.5) * s}" style="font-size:${f(i ? 10.8 : 11.5)}px;font-weight:${i ? 500 : 700};fill:${i === lines.length - 1 && co.lastTone ? TONE[co.lastTone] : ink}">${VQ.esc(l)}</text>`).join('')}</g>`; } });
      g += labels + calls;
      el.innerHTML = `<svg viewBox="${x0} ${y0} ${vw} ${vh}" preserveAspectRatio="xMidYMid meet" style="height:100%">${g}</svg>`
        + (o.ctl === false ? '' : `<div class="map-ctl"><button data-z="in" aria-label="Zoom in">${VQ.I('plus')}</button><button data-z="out" aria-label="Zoom out">${VQ.I('minus')}</button><button data-z="reset" aria-label="Whole corridor">${VQ.I('layers')}</button></div>`)
        + (o.legend ? `<div class="map-legend ${o.legendTop ? 'top' : ''}">${LEGENDS[o.legend] || o.legend}</div>` : '') + (o.note === false ? '' : `<div class="map-note">Schematic · not to scale</div>`);
      el.querySelectorAll('[data-z]').forEach(b => b.onclick = ev => { ev.stopPropagation(); const [a, c] = el._z.range, mid = o.focus ?? (a + c) / 2, span = c - a; const z = b.dataset.z;
        if (z === 'reset') el._z.range = [0, KM]; else { const ns = VQ.clamp(z === 'in' ? span * .55 : span / .55, 12, KM); let na = mid - ns / 2, nb = mid + ns / 2; if (na < 0) { nb -= na; na = 0; } if (nb > KM) { na -= nb - KM; nb = KM; } el._z.range = [Math.max(0, na), Math.min(KM, nb)]; }
        VQ._mounts[+el.dataset.m](el); });
    });
    return `<div class="map" data-m="${id}" style="min-height:${H0}px"></div>`;
  }
  return { render, pos, KM, TONE, SPEED };
})();
