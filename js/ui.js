/* =========================================================
   VizionIQ demo · UI components (all return HTML strings)
   ========================================================= */
VQ.UI = (() => {
  const I = VQ.I, esc = VQ.esc;
  const IMG = f => `assets/img/${f}`;

  const card = (title, body, o) => { o = o || {}; return `<div class="card ${o.cls || ''}" ${o.go ? `data-go="${o.go}"` : ''} ${o.style ? `style="${o.style}"` : ''}>${title ? `<div class="card-h">${o.icon ? I(o.icon) : ''}<h3>${title}</h3>${o.right ? `<div class="right">${o.right}</div>` : ''}</div>` : ''}${body}</div>`; };
  const viewAll = go => `<a data-go="${go}">View All</a>`;

  /* KPI tile. delta: {dir:'up'|'down', text:'3 vs. yesterday', good:bool} */
  const kpi = k => `<div class="card kpi ${k.go ? 'click' : ''}" ${k.go ? `data-go="${k.go}"` : ''} ${k.tip ? `data-tip="${k.tip}"` : ''}><div class="kpi-ic ${k.bg || 'bg-info'}">${I(k.icon)}</div><div><div class="kpi-val">${k.value}${k.unit ? ` <small>${k.unit}</small>` : ''}</div><div class="kpi-lbl">${k.label}</div>${k.delta ? `<div class="kpi-delta ${k.delta.good ? 'good' : k.delta.good === false ? 'bad' : ''}">${k.delta.dir ? I(k.delta.dir === 'up' ? 'up' : 'down') : k.delta.dot ? `<i class="dot" style="background:var(--${k.delta.dot})"></i>` : ''}<span><b>${k.delta.value || ''}</b> ${k.delta.text || ''}</span></div>` : ''}</div></div>`;
  const kpis = (list, cls) => `<div class="grid kpis ${cls || 'g' + Math.min(6, list.length)}">${list.map(kpi).join('')}</div>`;

  const pill = (text, tone, icon) => `<span class="pill ${tone || 'gray'}">${icon ? I(icon) : ''}${text}</span>`;
  const sev = s => pill(s[0].toUpperCase() + s.slice(1), s);
  const sel = label => `<button class="sel" data-act="Filter: ${esc(label)} (fixed in this demo)">${label}${I('chevd')}</button>`;
  const seg = (key, opts, cur) => `<div class="seg">${opts.map(([v, l]) => `<button class="${v === cur ? 'on' : ''}" data-set="${key}=${v}">${l}</button>`).join('')}</div>`;
  const btn = (label, o) => { o = o || {}; return `<button class="btn ${o.primary ? 'primary' : ''} ${o.ghost ? 'ghost' : ''} ${o.sm ? 'sm' : ''}" ${o.go ? `data-go="${o.go}"` : `data-act="${esc(o.toast || label + ' · done')}" data-done="${esc(o.done || 'Done')}"`}>${o.icon ? I(o.icon) : ''}${label}</button>`; };

  /* list row: {icon,tone,round,thumb,title,titleTone,sub,sub2,meta,pill,go} */
  const li = r => `<div class="li ${r.go ? 'click' : ''}" ${r.go ? `data-go="${r.go}"` : ''}>${r.icon ? `<div class="li-ic ${r.round ? 'round bg-' + (r.tone || 'info') : 'tone-' + (r.tone || 'info')}">${I(r.icon)}</div>` : ''}${r.thumb ? `<img class="li-thumb" src="${IMG(r.thumb)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">` : ''}<div class="li-body"><div class="li-title ${r.titleTone || ''}">${r.title}</div>${r.sub ? `<div class="li-sub">${r.sub}</div>` : ''}${r.sub2 ? `<div class="li-sub">${r.sub2}</div>` : ''}</div>${r.meta || r.pill ? `<div class="li-meta">${r.meta ? `<span>${r.meta}</span>` : ''}${r.pill || ''}</div>` : ''}${r.go ? `<div class="li-chev">${I('chev')}</div>` : ''}</div>`;
  const list = rows => `<div class="list">${rows.map(li).join('')}</div>`;

  const facts = rows => `<div class="facts">${rows.map(r => `<div class="fact">${I(r[0])}<div><div class="k">${r[1]}</div><div class="v">${r[2]}</div></div></div>`).join('')}</div>`;
  const kv = rows => `<div class="kv">${rows.map(r => `<div class="k">${r[0] ? I(r[0]) : ''}${r[1]}</div><div class="v">${r[2]}</div>`).join('')}</div>`;

  /* table: cols [{k,label,r:bool,fmt}] rows [{...,go}] */
  const table = (cols, rows, o) => `<div class="tbl-wrap"><table class="tbl"><thead><tr>${cols.map(c => `<th class="${c.r ? 'r' : ''}">${c.label}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr class="${r.go ? 'click' : ''} ${r.total ? 'total' : ''}" ${r.go ? `data-go="${r.go}"` : ''}>${cols.map(c => `<td class="${c.r ? 'r' : ''}">${c.fmt ? c.fmt(r[c.k], r) : r[c.k] ?? ''}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;

  /* camera frame. boxes in % of the frame: {x,y,w,h,label,tone:'crit'|'warn'|'info'|''}
     path: [[x,y],...] in % draws a trajectory arrow */
  const cam = c => { const boxes = (c.boxes || []).map(b => `<div class="cam-box ${b.tone || ''}" style="left:${b.x}%;top:${b.y}%;width:${b.w}%;height:${b.h}%">${b.label ? `<span>${b.label}</span>` : ''}</div>`).join('');
    const path = c.path ? `<svg class="cam-path" viewBox="0 0 100 100" preserveAspectRatio="none"><defs><marker id="ah${c.path.length}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0L10,5L0,10z" fill="${c.pathColor || '#ff3b30'}"/></marker></defs><polyline points="${c.path.map(p => p.join(',')).join(' ')}" fill="none" stroke="${c.pathColor || '#ff3b30'}" stroke-width="1.1" stroke-dasharray="2.4 1.6" vector-effect="non-scaling-stroke" style="stroke-width:3px" marker-end="url(#ah${c.path.length})"/></svg>` : '';
    return `<div class="cam ${c.cls || ''} ${c.on ? 'on' : ''}" ${c.go ? `data-go="${c.go}"` : ''} ${c.set ? `data-set="${c.set}"` : ''} ${c.tip ? `data-tip="${c.tip}"` : ''} ${c.go || c.set ? 'style="cursor:pointer"' : ''}>${c.img ? `<img src="${IMG(c.img)}" alt="${esc(c.alt || c.label || 'Camera frame')}" loading="lazy" onerror="this.remove()">` : ''}${c.offline ? `<div class="cam-offline"><div>${I('videooff')}<br>${c.offline}</div></div>` : boxes + path}
      <div class="cam-top">${c.live === false ? '' : `<span class="cam-live ${c.status === 'ok' ? 'ok' : c.status === 'off' ? 'off' : ''}"><i></i>${c.liveText || 'LIVE'}</span>`}${c.label ? `<span class="${c.chip === false ? '' : 'cam-chip'}">${c.label}</span>` : ''}<span class="grow"></span>${c.topRight ? `<span class="cam-chip">${c.topRight}</span>` : ''}</div>
      ${c.foot || c.time ? `<div class="cam-bot"><span>${c.foot || ''}</span><span class="grow"></span><span class="num">${c.time || ''}</span></div>` : ''}${c.extra || ''}</div>`; };

  const timeline = steps => `<div class="tl">${steps.map(s => `<div class="st ${s.state || 'todo'}"><i></i><b>${s.t}</b><span>${s.label}</span></div>`).join('')}</div>`;
  const vtimeline = evs => `<div class="vtl">${evs.map(e => `<div class="ev ${e.tone || ''}"><i></i><time>${e.t}</time>${e.text}${e.who ? `<div class="who">${e.who}</div>` : ''}</div>`).join('')}</div>`;

  /* recommended actions: [{icon,title,sub,btn,primary,toast}] */
  const actions = rows => `<div class="list">${rows.map(a => `<div class="li" style="align-items:center"><div class="li-ic tone-${a.tone || 'info'}">${I(a.icon)}</div><div class="li-body"><div class="li-title">${a.title}</div><div class="li-sub">${a.sub || ''}</div></div>${a.go ? btn(a.btn, { sm: 1, go: a.go, primary: a.primary }) : btn(a.btn, { sm: 1, primary: a.primary, toast: a.toast || a.title + ' · sent', done: a.done || 'Sent' })}</div>`).join('')}</div>`;
  const quick = (rows, stack) => `<div class="qa ${stack ? 'stack' : ''}">${rows.map(q => `<button ${q.go ? `data-go="${q.go}"` : `data-act="${esc(q.toast || q.label + ' · done')}"`}>${I(q.icon)}<span>${q.label}</span></button>`).join('')}</div>`;
  const insight = (icon, tone, title, text, go) => `<div class="insight ${go ? 'click' : ''}" ${go ? `data-go="${go}"` : ''}><span style="color:var(--${tone || 'blue'})">${I(icon)}</span><div><b>${title}</b><p>${text}</p></div></div>`;
  const chain = nodes => `<div class="chain">${nodes.map((n, i) => (i ? `<div class="arr">${I('arrow')}</div>` : '') + `<div class="node ${n.cls || ''}"><div class="k">${n.k}</div><b>${n.title}</b><span>${n.text}</span></div>`).join('')}</div>`;
  const factors = rows => rows.map(f => `<div class="factor"><div><b>${f.title}</b><span>${f.text}</span></div>${VQ.C.meter(f.pct, f.pct >= 60 ? 'crit' : f.pct >= 35 ? 'warn' : '')}<div class="pct">${f.pct}%</div></div>`).join('');
  /* congestion propagation strip: pts [{at:0..100,label,sub,main,pill,tone}] */
  const propagation = pts => `<div class="prop"><div class="bar" style="background:linear-gradient(90deg,#f2c230,#f08a24 30%,#d8342f 50%,#d8342f 72%,#f08a24 90%,#f2c230)"></div>${pts.map(p => `<div class="pt ${p.main ? 'main' : ''}" style="left:${p.at}%"><i>${p.main ? I('alert') : ''}</i><b>${p.label}</b>${p.sub}</div>`).join('')}</div>`;
  const steps = rows => `<div class="steps">${rows.map(r => `<div><span>${r}</span></div>`).join('')}</div>`;
  const stat = (v, l, tone) => `<div><div class="kpi-val" ${tone ? `style="color:var(--${tone})"` : ''}>${v}</div><div class="kpi-lbl">${l}</div></div>`;
  const statRow = rows => `<div class="grid g${rows.length}" style="margin:0;gap:14px">${rows.map(r => stat(r[0], r[1], r[2])).join('')}</div>`;

  return { IMG, card, viewAll, kpi, kpis, pill, sev, sel, seg, btn, li, list, facts, kv, table, cam, timeline, vtimeline, actions, quick, insight, chain, factors, propagation, steps, stat, statRow };
})();
