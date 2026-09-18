/* =========================================================
   VizionIQ demo · charts (SVG, drawn at mount so they fit their card)
   Rules: one y-axis, 2px lines, bars <= 24px with rounded data-end,
   hairline solid grid, legend for 2+ series, hover readout on everything.
   ========================================================= */
VQ.C = (() => {
  const S = ['var(--s1)', 'var(--s2)', 'var(--s3)', 'var(--s4)', 'var(--s5)', 'var(--s6)', 'var(--s7)', 'var(--s8)'];
  const esc = VQ.esc;
  const nice = max => { if (max <= 0) return 1; const p = Math.pow(10, Math.floor(Math.log10(max))); const f = max / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p; };
  const ticks = (min, max, n) => Array.from({ length: n + 1 }, (_, i) => min + (max - min) * i / n);
  const tf = v => Math.abs(v) >= 1000 ? VQ.fmt(Math.round(v)) : (Math.round(v * 10) / 10).toString();
  const legend = series => series.length < 2 ? '' : `<div class="legend">${series.map(s => `<span><i class="${s.bar ? 'sq' : ''} ${s.dash ? 'dash' : ''}" style="background:${s.color};color:${s.color}"></i>${esc(s.name)}</span>`).join('')}</div>`;
  const topRound = (x, y, w, h, r) => { r = Math.min(r, h, w / 2); return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`; };

  /* ---- line / area ---- */
  function line(o) {
    const series = o.series.map((s, i) => ({ color: S[i], ...s }));
    const id = VQ.mount(el => {
      const all = series.flatMap(s => s.data.filter(v => v != null));
      const yMin = o.yMin ?? 0, yMax = o.yMax ?? nice(Math.max(...all) * 1.08), n = o.labels.length;
      const W = Math.max(240, el.clientWidth), H = o.h || 190, pl = (o.yTitle ? 24 : 12) + Math.max(22, tf(yMax).length * 6.2), pr = o.endLabels ? 46 : 12, pt = 12, pb = 24;
      const x = i => pl + (W - pl - pr) * (n === 1 ? .5 : i / (n - 1)), y = v => pt + (H - pt - pb) * (1 - (v - yMin) / (yMax - yMin));
      let g = '';
      ticks(yMin, yMax, o.yTicks || 4).forEach(t => { g += `<line x1="${pl}" x2="${W - pr}" y1="${y(t)}" y2="${y(t)}" stroke="var(--grid)"/><text x="${pl - 7}" y="${y(t) + 3.5}" text-anchor="end">${tf(t)}</text>`; });
      const every = Math.ceil(n / (o.xTicks || Math.floor((W - pl - pr) / 62)));
      o.labels.forEach((l, i) => { if (i % every === 0 || i === n - 1 && (n - 1) % every > every / 2) g += `<text x="${x(i)}" y="${H - 6}" text-anchor="middle">${esc(l)}</text>`; });
      if (o.yTitle) g += `<text class="ttl" transform="translate(11,${(H - pb + pt) / 2}) rotate(-90)" text-anchor="middle">${esc(o.yTitle)}</text>`;
      if (o.band) { const x0 = x(o.band.from), x1 = x(o.band.to ?? n - 1); g += `<rect x="${x0}" y="${pt}" width="${x1 - x0}" height="${H - pt - pb}" fill="var(--crit)" opacity=".07"/>`; if (o.band.label) g += `<text x="${(x0 + x1) / 2}" y="${pt + 14}" text-anchor="middle" style="fill:var(--crit-ink);font-weight:600">${esc(o.band.label)}</text>`; }
      if (o.limit != null) g += `<line x1="${pl}" x2="${W - pr}" y1="${y(o.limit.v)}" y2="${y(o.limit.v)}" stroke="var(--crit)" stroke-width="1.2"/><text x="${W - pr}" y="${y(o.limit.v) - 5}" text-anchor="end" style="fill:var(--crit-ink)">${esc(o.limit.label)}</text>`;
      series.forEach(s => {
        const pts = s.data.map((v, i) => v == null ? null : [x(i), y(v)]).filter(Boolean); if (!pts.length) return;
        const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('');
        if (s.area) g += `<path d="${d}L${pts[pts.length - 1][0]},${y(yMin)}L${pts[0][0]},${y(yMin)}Z" fill="${s.color}" opacity=".1"/>`;
        g += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" ${s.dash ? 'stroke-dasharray="5 4"' : ''}/>`;
        if (o.endLabels) { const p = pts[pts.length - 1]; g += `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="${s.color}" stroke="#fff" stroke-width="2"/><text class="dl" x="${p[0] + 8}" y="${p[1] + 4}">${tf(s.data.filter(v => v != null).pop())}</text>`; }
      });
      if (o.mark) { const mx = x(o.mark.i); g += `<line x1="${mx}" x2="${mx}" y1="${pt}" y2="${H - pb}" stroke="var(--ink)" stroke-width="1.2" opacity=".55"/><text class="dl" x="${mx + (o.mark.i > n * .7 ? -6 : 6)}" y="${pt + 10}" text-anchor="${o.mark.i > n * .7 ? 'end' : 'start'}">${esc(o.mark.label)}</text>`;
        const s0 = series[0]; if (s0.data[o.mark.i] != null) g += `<circle cx="${mx}" cy="${y(s0.data[o.mark.i])}" r="4.5" fill="#fff" stroke="${o.mark.color || 'var(--crit)'}" stroke-width="2.5"/>`; }
      g += `<g class="xh" style="display:none"><line y1="${pt}" y2="${H - pb}" stroke="var(--axis)"/>${series.map(s => `<circle r="4" fill="${s.color}" stroke="#fff" stroke-width="2"/>`).join('')}</g>`;
      el.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" data-hover="1">${g}<rect x="${pl}" y="${pt}" width="${W - pl - pr}" height="${H - pt - pb}" fill="transparent" data-hover="1"/></svg>`;
      const svg = el.firstChild, xh = svg.querySelector('.xh'), dots = xh.querySelectorAll('circle'), ln = xh.querySelector('line');
      svg.onmousemove = e => { const r = svg.getBoundingClientRect(), k = r.width / W || 1; const i = VQ.clamp(Math.round(((e.clientX - r.left) / k - pl) / ((W - pl - pr) / Math.max(1, n - 1))), 0, n - 1);
        xh.style.display = ''; ln.setAttribute('x1', x(i)); ln.setAttribute('x2', x(i));
        series.forEach((s, k) => { const v = s.data[i]; dots[k].style.display = v == null ? 'none' : ''; if (v != null) { dots[k].setAttribute('cx', x(i)); dots[k].setAttribute('cy', y(v)); } });
        VQ.tip.show(`<div class="th">${esc(o.labels[i])}</div>` + series.filter(s => s.data[i] != null).map(s => `<div class="tr"><i style="background:${s.color}"></i><b>${tf(s.data[i])}${o.unit ? ' ' + esc(o.unit) : ''}</b><span>${esc(s.name)}</span></div>`).join(''), e.clientX, e.clientY); };
      svg.onmouseleave = () => { xh.style.display = 'none'; VQ.tip.hide(); };
    });
    return `${o.legend === false ? '' : legend(series)}<div class="chart" data-m="${id}" style="min-height:${o.h || 190}px"></div>`;
  }

  /* ---- vertical bars (grouped or stacked) ---- */
  function bars(o) {
    const series = o.series.map((s, i) => ({ color: S[i], bar: true, ...s }));
    const id = VQ.mount(el => {
      const W = Math.max(220, el.clientWidth), H = o.h || 190, pr = 8, pt = o.valueLabels ? 20 : 10, pb = o.twoLine ? 36 : 24, n = o.labels.length;
      const tot = o.labels.map((_, i) => o.stacked ? series.reduce((a, s) => a + (s.data[i] || 0), 0) : Math.max(...series.map(s => s.data[i] || 0)));
      const yMax = o.yMax ?? nice(Math.max(...tot) * 1.1), pl = 12 + Math.max(22, tf(yMax).length * 6.2), y = v => pt + (H - pt - pb) * (1 - v / yMax), band = (W - pl - pr) / n;
      const per = o.stacked ? 1 : series.length, bw = Math.min(24, (band * .68 - (per - 1) * 2) / per);
      let g = '';
      ticks(0, yMax, 4).forEach(t => { g += `<line x1="${pl}" x2="${W - pr}" y1="${y(t)}" y2="${y(t)}" stroke="var(--grid)"/><text x="${pl - 7}" y="${y(t) + 3.5}" text-anchor="end">${tf(t)}</text>`; });
      o.labels.forEach((l, i) => {
        const cx = pl + band * (i + .5); const parts = String(l).split('|');
        const skip = Math.ceil(34 / band); if (i % skip === 0) parts.forEach((p, k) => { g += `<text x="${cx}" y="${H - pb + 14 + k * 12}" text-anchor="middle">${esc(p)}</text>`; });
        let tipRows = ''; let acc = 0;
        series.forEach((s, k) => {
          const v = s.data[i] || 0; const c = (o.colorOf && o.colorOf(i, k)) || s.color; tipRows += `<div class='tr'><i style='background:${c}'></i><b>${tf(v)}${o.unit ? ' ' + esc(o.unit) : ''}</b><span>${esc(s.name)}</span></div>`;
          if (!v) return;
          if (o.stacked) { const y1 = y(acc + v), hgt = y(acc) - y1 - (acc ? 2 : 0); const top = k === series.length - 1 || series.slice(k + 1).every(z => !(z.data[i])); g += top ? `<path d="${topRound(cx - bw / 2, y1, bw, Math.max(1, hgt), 4)}" fill="${c}"/>` : `<rect x="${cx - bw / 2}" y="${y1}" width="${bw}" height="${Math.max(1, hgt)}" fill="${c}"/>`; acc += v; }
          else { const x0 = cx - (per * bw + (per - 1) * 2) / 2 + k * (bw + 2); g += `<path d="${topRound(x0, y(v), bw, y(0) - y(v), 4)}" fill="${c}"/>`; if (o.valueLabels && per === 1) g += `<text class="dl" x="${cx}" y="${y(v) - 5}" text-anchor="middle">${tf(v)}</text>`; }
        });
        g += `<rect x="${pl + band * i}" y="${pt}" width="${band}" height="${H - pt - pb}" fill="transparent" data-tip="<div class='th'>${esc(parts.join(' '))}</div>${tipRows}"/>`;
      });
      g += `<line x1="${pl}" x2="${W - pr}" y1="${y(0)}" y2="${y(0)}" stroke="var(--axis)"/>`;
      el.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${g}</svg>`;
    });
    return `${o.legend === false ? '' : legend(o.legendItems || series)}<div class="chart" data-m="${id}" style="min-height:${o.h || 190}px"></div>`;
  }

  /* ---- horizontal bars (HTML) ---- */
  function hbars(o) {
    const max = o.max || Math.max(...o.items.map(i => i.value));
    return `<div>${o.items.map(i => `<div class="hbar ${i.go ? 'click' : ''}" ${i.go ? `data-go="${i.go}"` : ''} data-tip="<b>${esc(i.label)}</b>: ${tf(i.value)}${o.unit ? ' ' + esc(o.unit) : ''}${i.note ? '<br>' + esc(i.note) : ''}"><div class="lab">${i.icon ? VQ.I(i.icon) : ''}<span>${esc(i.label)}</span></div><div class="track"><div class="fill" style="width:${Math.max(2, i.value / max * 100)}%;background:${i.color || 'var(--s1)'}"></div></div><div class="val">${i.text || tf(i.value)}</div></div>`).join('')}</div>`;
  }

  /* ---- donut + legend table ---- */
  function donut(o) {
    const size = o.size || 150, th = o.thick || 22, r = (size - th) / 2, c = 2 * Math.PI * r, total = o.items.reduce((a, i) => a + i.value, 0);
    let off = 0, seg = '';
    o.items.forEach((it, k) => { const len = it.value / total * c, gap = 2; const col = it.color || S[k];
      seg += `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${col}" stroke-width="${th}" stroke-dasharray="${Math.max(.5, len - gap)} ${c - Math.max(.5, len - gap)}" stroke-dashoffset="${-off}" transform="rotate(-90 ${size / 2} ${size / 2})" data-tip="<b>${esc(it.label)}</b>: ${tf(it.value)}${o.unit ? ' ' + esc(o.unit) : ''} (${Math.round(it.value / total * 100)}%)"/>`; off += len; });
    const ctr = o.center ? `<text x="${size / 2}" y="${size / 2 + 2}" text-anchor="middle" style="font-size:${o.center.size || 22}px;font-weight:800;fill:var(--ink)">${esc(o.center.v)}</text><text x="${size / 2}" y="${size / 2 + 18}" text-anchor="middle" style="font-size:10.5px;fill:var(--text-2)">${esc(o.center.l)}</text>` : '';
    const leg = `<div class="donut-leg">${o.items.map((it, k) => `<div class="r"><i class="dot" style="background:${it.color || S[k]}"></i><span>${it.icon ? '' : ''}${esc(it.label)}</span><b>${it.text || tf(it.value)}</b><em>${Math.round(it.value / total * 100)}%</em></div>`).join('')}</div>`;
    return `<div class="donut-wrap"><div class="chart"><svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${seg}${ctr}</svg></div>${o.legend === false ? '' : leg}</div>`;
  }

  /* ---- heat grid (HTML). color(v) returns a fill; always ship a legend beside it ---- */
  function heat(o) {
    const cols = o.cols.length;
    let h = `<div class="heat" style="grid-template-columns:auto repeat(${cols}, minmax(0,1fr))"><div></div>${o.cols.map((c, i) => `<div class="ht">${i % (o.colEvery || 1) === 0 ? esc(c) : ''}</div>`).join('')}`;
    o.rows.forEach((r, ri) => { h += `<div class="hl">${esc(r)}</div>` + o.values[ri].map((v, ci) => `<div class="hc" style="background:${o.color(v)}" data-tip="<b>${esc(r)}</b> · ${esc(o.cols[ci])}<br>${tf(v)}${o.unit ? ' ' + esc(o.unit) : ''}"></div>`).join(''); });
    return h + '</div>';
  }

  const spark = (data, color, w, h) => { w = w || 84; h = h || 26; const mx = Math.max(...data), mn = Math.min(...data), pts = data.map((v, i) => [2 + (w - 4) * i / (data.length - 1), 3 + (h - 6) * (1 - (v - mn) / (mx - mn || 1))]); const p = pts[pts.length - 1];
    return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:inline-block;vertical-align:middle"><path d="${pts.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ',' + q[1].toFixed(1)).join('')}" fill="none" stroke="var(--axis)" stroke-width="1.6"/><circle cx="${p[0]}" cy="${p[1]}" r="2.8" fill="${color || 'var(--s1)'}"/></svg>`; };
  const meter = (pct, tone) => `<div class="meter ${tone || ''}"><i style="width:${VQ.clamp(pct, 0, 100)}%"></i></div>`;
  /* traffic speed classes: status colours, always shown with the speed legend */
  const speedColor = v => v >= 80 ? '#1fa64a' : v >= 60 ? '#f2c230' : v >= 40 ? '#f08a24' : '#d8342f';
  const seqBlue = t => ['#e8f1fd', '#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5', '#256abf', '#184f95', '#0d366b'][VQ.clamp(Math.floor(t * 8), 0, 7)];
  return { S, line, bars, hbars, donut, heat, spark, meter, legend, speedColor, seqBlue };
})();
