/* =========================================================
   VizionIQ demo · core: icons, helpers, router, shell, demo bar
   ========================================================= */
const VQ = { SCREENS: {}, STAGES: [], JOURNEY: [], J_INDEX: {}, state: {}, _mounts: [], current: '' };

/* ---------- icons (24px stroke set) ---------- */
VQ.ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  video: '<path d="m23 7-7 5 7 5z"/><rect x="1" y="5" width="15" height="14" rx="2"/>',
  videooff: '<path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10M1 1l22 22"/>',
  alert: '<path d="m10.3 3.9-8.4 14A2 2 0 0 0 3.6 21h16.8a2 2 0 0 0 1.7-3l-8.4-14a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  car: '<path d="M5 17H3v-5l2-5h14l2 5v5h-2M9 17h6"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M3.5 12h17"/>',
  truck: '<path d="M1 4h14v12H1zM15 8h4l4 4v4h-8z"/><circle cx="5.5" cy="18" r="2.2"/><circle cx="18.5" cy="18" r="2.2"/>',
  ambulance: '<path d="M1 5h14v11H1zM15 9h4l4 4v3h-8zM8 8v5M5.5 10.5h5"/><circle cx="5.5" cy="18" r="2.2"/><circle cx="18.5" cy="18" r="2.2"/>',
  rupee: '<path d="M6 3h12M6 8h12M6 13l8.5 8M6 13h3a5 5 0 0 0 0-10"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"/>',
  hex: '<path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7z"/><circle cx="12" cy="12" r="3"/>',
  bars: '<path d="M5 21v-7M12 21V4M19 21V10"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 2.9-1.2V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.1a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/>',
  chev: '<path d="m9 6 6 6-6 6"/>', chevl: '<path d="m15 6-6 6 6 6"/>', chevd: '<path d="m6 9 6 6 6-6"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', arrowl: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
  up: '<path d="M12 19V5M5 12l7-7 7 7"/>', down: '<path d="M12 5v14M19 12l-7 7-7-7"/>',
  map: '<path d="m1 6 7-3 8 3 7-3v15l-7 3-8-3-7 3z"/><path d="M8 3v15M16 6v15"/>',
  mappin: '<path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>', x: '<path d="M18 6 6 18M6 6l12 12"/>',
  layers: '<path d="m12 2 9 5-9 5-9-5z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/>',
  expand: '<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>',
  crosshair: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  shieldcheck: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
  check: '<path d="m5 12 5 5L20 7"/>', checkc: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  note: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  mega: '<path d="m3 11 18-5v12L3 14z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  route: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
  cone: '<path d="M10 3h4l5 17H5zM8 10h8M6.5 15h11M3 20h18"/>',
  ban: '<circle cx="12" cy="12" r="9"/><path d="M7.5 12h9"/>',
  rain: '<path d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.8A7 7 0 1 0 4 14.9M16 14v6M8 14v6M12 16v6"/>',
  cloud: '<path d="M18 10h-1.3A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>',
  fog: '<path d="M18 10h-1.3A7 7 0 1 0 5 15M3 19h18M6 22h12"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  paw: '<circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.8 1q-.7-2-2.7-2.7A3.5 3.5 0 0 1 5.5 10z"/>',
  walk: '<circle cx="13" cy="4" r="2"/><path d="m7 21 3-7 2.5 2V21M10 14l1-5 4 2 3 1M11 9l-3.5 1.5L7 14"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5s3 3.500 3 5.500a7 7 0 1 1-14 0c0-1.200.400-2.300 1-3a2.500 2.500 0 0 0 2.500 2.500z"/>',
  zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
  bulb: '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.700c.600.500 1 1.300 1 2.100V18h6v-1.200c0-.800.400-1.600 1-2.100A7 7 0 0 0 12 2z"/>',
  sign: '<rect x="3" y="4" width="18" height="10" rx="1.500"/><path d="M7 8h10M7 11h6M8 14v7M16 14v7"/>',
  wifi: '<path d="M5 12.500a11 11 0 0 1 14 0M1.400 9a16 16 0 0 1 21.200 0M8.500 16.100a6 6 0 0 1 7 0M12 20h.01"/>',
  barrier: '<path d="M3 9h18v5H3zM6 14v6M18 14v6M8 9l-3 5M13 9l-3 5M18 9l-3 5"/>',
  road: '<path d="M5 21 8 3M19 21 16 3M12 5v3M12 11v3M12 17v3"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.800 6.100C15.500 5 17 4.500 19 2c1 2 2 4.200 2 8 0 5.500-4.800 10-10 10z"/><path d="M2 21c0-3 1.900-5.400 5.100-6 2.400-.500 4.900-2 5.900-3"/>',
  sparkles: '<path d="m12 3 1.900 5.100L19 10l-5.100 1.900L12 17l-1.900-5.100L5 10l5.100-1.900z"/><path d="m19 16 .800 2.200L22 19l-2.200.800L19 22l-.800-2.200L16 19l2.200-.800z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
  phone: '<path d="M22 16.900v3a2 2 0 0 1-2.200 2 19.800 19.800 0 0 1-8.600-3.100 19.500 19.500 0 0 1-6-6A19.800 19.800 0 0 1 2.100 4.200 2 2 0 0 1 4.100 2h3a2 2 0 0 1 2 1.700c.100 1 .400 1.900.700 2.800a2 2 0 0 1-.500 2.100L8.100 9.900a16 16 0 0 0 6 6l1.300-1.300a2 2 0 0 1 2.100-.400c.900.300 1.800.600 2.800.700a2 2 0 0 1 1.700 2z"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  filter: '<path d="M22 3H2l8 9.500V19l4 2v-8.500z"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>',
  cpu: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/>',
  tag: '<path d="M20.600 13.400 13.400 20.600a2 2 0 0 1-2.800 0L2 12V2h10l8.600 8.600a2 2 0 0 1 0 2.800z"/><circle cx="7" cy="7" r="1.500"/>',
  trend: '<path d="m22 7-8.500 8.500-5-5L2 17"/><path d="M16 7h6v6"/>',
  gauge: '<path d="m12 14 4-4M3.300 19a10 10 0 1 1 17.400 0"/>',
  pulse: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  play: '<path d="m6 3 14 9-14 9z"/>',
  clip: '<rect x="2" y="6" width="14" height="12" rx="2"/><path d="m16 10 6-3v10l-6-3"/><circle cx="9" cy="12" r="2"/>',
  box: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
  db: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.700 4 3 9 3s9-1.300 9-3V5M3 12c0 1.700 4 3 9 3s9-1.300 9-3"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  refresh: '<path d="M21 3v6h-6M3 21v-6h6"/><path d="M3.500 9a9 9 0 0 1 14.800-3.400L21 9M3 15l2.700 3.400A9 9 0 0 0 20.500 15"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>',
  toll: '<path d="M3 21V8l9-5 9 5v13M3 12h18M8 21v-5M16 21v-5M12 21v-5"/>',
  octagon: '<path d="M7.900 2h8.200L22 7.900v8.200L16.100 22H7.900L2 16.100V7.900z"/><path d="M12 8v4M12 16h.01"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.500.500l3-3a5 5 0 0 0-7-7l-1.700 1.700"/><path d="M14 11a5 5 0 0 0-7.500-.500l-3 3a5 5 0 0 0 7 7l1.700-1.700"/>',
  net: '<circle cx="12" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><path d="M10.500 7.600 6.500 16.400M13.500 7.600l4 8.800M8 19h8"/>',
  ruler: '<path d="m16 2 6 6L8 22l-6-6z"/><path d="m7.500 10.500 2 2M10.500 7.500l2 2M13.500 4.500l2 2M4.500 13.500l2 2"/>',
};
VQ.I = (n, cls) => `<span class="ic ${cls || ''}"><svg viewBox="0 0 24 24" aria-hidden="true">${VQ.ICONS[n] || VQ.ICONS.info}</svg></span>`;
/* raw icon body for embedding inside another svg */
VQ.iconG = (n, x, y, size, color, sw) => `<g transform="translate(${x - size / 2},${y - size / 2}) scale(${size / 24})" fill="none" stroke="${color || '#fff'}" stroke-width="${sw || 2.2}" stroke-linecap="round" stroke-linejoin="round">${VQ.ICONS[n] || ''}</g>`;

/* ---------- helpers ---------- */
VQ.esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
VQ.fmt = n => Number(n).toLocaleString('en-IN');
VQ.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
VQ.store = { get(k, d) { try { const v = localStorage.getItem('vq.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem('vq.' + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } } };
/* seeded pseudo-random so every render shows the same numbers */
VQ.rng = seed => { let s = seed >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
VQ.series = (n, base, amp, seed, shape) => { const r = VQ.rng(seed || 7); return Array.from({ length: n }, (_, i) => Math.round((base + (shape ? shape(i, n) : 0) + (r() - .5) * amp) * 10) / 10); };

/* mount: components that need their rendered width register a draw function */
VQ.mount = fn => { VQ._mounts.push(fn); return VQ._mounts.length - 1; };
/* fit: the layout is designed for a content area of 1236px or more; narrower windows scale the content down instead of letting text spill */
VQ.fit = () => { const main = document.getElementById('main'); if (!main) return; const rail = innerWidth <= 820 ? 60 : 204; const z = VQ.clamp((innerWidth - rail) / 1236, .55, 1); main.style.zoom = z === 1 ? '' : z.toFixed(3); VQ.zoom = z; };
VQ.runMounts = () => document.querySelectorAll('[data-m]').forEach(el => { const fn = VQ._mounts[+el.dataset.m]; if (fn) fn(el); });

/* ---------- screens + router ---------- */
VQ.screen = (id, def) => { VQ.SCREENS[id] = def; };
VQ.parse = hash => {
  const p = (hash || '').replace(/^#/, '').split('/'); const S = VQ.SCREENS[p[0]]; if (!S) return null;
  const param = S.param ? p[1] : null; const vidRaw = S.param ? p[2] : p[1];
  const vid = S.views[vidRaw] ? vidRaw : Object.keys(S.views)[0];
  return { sid: p[0], S, param, vid, key: S.param ? `${p[0]}/${param}/${vid}` : `${p[0]}/${vid}` };
};
VQ.go = key => { if (!key) return; if (location.hash.slice(1) === key) VQ.render(); else location.hash = key; };
VQ.set = (k, v) => { VQ.state[k] = v; VQ.render(true); };
VQ.step = d => { const i = VQ.J_INDEX[VQ.current] ?? VQ.lastJ ?? 0; const n = VQ.clamp(i + d, 0, VQ.JOURNEY.length - 1); VQ.go(VQ.JOURNEY[n].key); };

VQ.RAIL = [['home', 'Home', 'home'], ['video', 'Live View', 'live'], ['alert', 'Incidents', 'incidents'], ['car', 'Traffic &amp; Travel Time', 'traffic'], ['rupee', 'Toll &amp; Revenue', 'toll'], ['wrench', 'Assets &amp; Maintenance', 'assets'], ['hex', 'Use Cases', 'usecases'], ['bars', 'Analytics &amp; Insights', 'analytics'], ['file', 'Reports', 'reports'], ['gear', 'Administration', 'admin']];
VQ.renderRail = active => { document.getElementById('rail').innerHTML = VQ.RAIL.map(r => `<button class="rail-item ${r[2] === active ? 'active' : ''}" data-go="${r[2]}">${VQ.I(r[0])}<span class="lbl">${r[1]}</span></button>`).join(''); };

VQ.crumbs = list => !list || !list.length ? '' : `<div class="crumbs">${list.map((c, i) => (i ? VQ.I('chev') : '') + (c[1] ? `<a data-go="${c[1]}">${c[0]}</a>` : `<b>${c[0]}</b>`)).join('')}</div>`;
VQ.values = v => { const t = v || ['Fewer incidents. More lives saved.', 'Less congestion. Higher productivity.', 'Fairer systems. Greater value.', 'Lower emissions. A cleaner tomorrow.'];
  return `<div class="values"><div class="vi">${VQ.I('shield')}<div><b>Safer People</b><span>${t[0]}</span></div></div><div class="vi">${VQ.I('road')}<div><b>Smoother Journeys</b><span>${t[1]}</span></div></div><div class="vi">${VQ.I('rupee')}<div><b>Stronger Economy</b><span>${t[2]}</span></div></div><div class="vi leaf">${VQ.I('leaf')}<div><b>Greener Highways</b><span>${t[3]}</span></div></div><div class="motto">INTELLIGENCE TODAY.<br>STRONGER TOMORROW.</div></div><div class="view-pad"></div>`; };

VQ.render = keepScroll => {
  const r = VQ.parse(location.hash) || VQ.parse('home'); const { S, sid, vid, param } = r; const V = S.views[vid];
  const item = S.param ? S.param(param) : null; if (S.param && !item) { VQ.go(S.fallback || 'home'); return; }
  const ctx = { sid, vid, param, item, key: r.key };
  if (VQ.current !== r.key && !keepScroll) VQ.state = {};
  VQ.current = r.key; if (VQ.J_INDEX[r.key] != null) VQ.lastJ = VQ.J_INDEX[r.key];
  VQ.visited.add(r.key); VQ.store.set('visited', [...VQ.visited]);
  VQ._mounts = []; VQ.renderRail(S.rail || sid);
  const val = f => typeof f === 'function' ? f(ctx) : f;
  const base = S.param ? `${sid}/${param}` : sid;
  let html = `<div class="view">${VQ.crumbs(val(V.crumbs || S.crumbs))}`;
  if (S.head) html += S.head(ctx);
  else html += `<div class="page-head"><div><h1>${val(V.title || S.title)}</h1>${(V.sub || S.sub) ? `<div class="sub">${val(V.sub || S.sub)}</div>` : ''}</div>${S.headRight ? `<div class="head-right">${S.headRight(ctx)}</div>` : ''}</div>`;
  if (S.tabs) html += `<div class="tabs-row"><div class="tabs">${S.tabs.map(([k, l]) => `<button class="tab ${k === vid ? 'active' : ''}" data-go="${base}/${k}">${l}</button>`).join('')}</div>${(V.filters || S.filters) ? `<div class="filters">${val(V.filters || S.filters)}</div>` : ''}</div>`;
  html += V.render(ctx) + VQ.values(val(S.values)) + '</div>';
  const main = document.getElementById('main'); const top = main.scrollTop;
  VQ.fit(); main.innerHTML = html; main.scrollTop = keepScroll ? top : 0;
  VQ.runMounts(); VQ.renderDemo(); VQ.tip.hide();
  document.title = `${String(val(V.title || S.title)).replace(/<[^>]+>/g, '')} · VizionIQ`;
};

/* ---------- guided demo bar ---------- */
VQ.journey = stages => { VQ.STAGES = stages; VQ.JOURNEY = []; stages.forEach(s => s.screens.forEach(([key, label]) => VQ.JOURNEY.push({ key, label, stage: s.id }))); VQ.J_INDEX = {}; VQ.JOURNEY.forEach((j, i) => { if (VQ.J_INDEX[j.key] == null) VQ.J_INDEX[j.key] = i; }); };
VQ.renderDemo = () => {
  const i = VQ.J_INDEX[VQ.current] ?? VQ.lastJ ?? 0; const j = VQ.JOURNEY[i]; if (!j) return;
  const seen = VQ.JOURNEY.filter(x => VQ.visited.has(x.key)).length; const pct = Math.round(seen / VQ.JOURNEY.length * 100);
  const stg = VQ.STAGES.map(s => { const keys = s.screens.map(x => x[0]); return `<span class="stg ${s.id === j.stage ? 'on' : ''} ${keys.every(k => VQ.visited.has(k)) ? 'done' : ''}" data-go="${keys[0]}"><i></i>${s.label}</span>`; }).join('');
  document.getElementById('demo').innerHTML = `<div class="stages">${stg}</div><span class="now">${j.label}</span>
    <div class="prog-wrap"><span class="cnt">${i + 1} / ${VQ.JOURNEY.length}</span><div class="prog" data-tip="${pct}% of screens viewed"><i style="width:${pct}%"></i></div></div>
    <div class="nav"><button class="ghost" onclick="VQ.step(-1)" ${i === 0 ? 'disabled' : ''}>${VQ.I('arrowl')} Prev</button><button onclick="VQ.step(1)" ${i === VQ.JOURNEY.length - 1 ? 'disabled' : ''}>Next ${VQ.I('arrow')}</button><button class="ghost" onclick="VQ.openDemoMap()">${VQ.I('map')} Map <kbd>M</kbd></button></div>`;
  const on = document.querySelector('.demo .stg.on'); if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest', inline: 'center' });
};

/* ---------- overlays: demo map, search ---------- */
VQ.closeOv = () => document.getElementById('ov').classList.remove('show');
VQ.openDemoMap = () => {
  document.getElementById('ov-box').innerHTML = `<h2>${VQ.I('map')}Demo map</h2><div class="t2">Every screen in the walkthrough. Green dots are screens already viewed. Use the arrow keys to step through.</div>
    <div class="dm-grid">${VQ.STAGES.map(s => `<div class="dm-stage"><h4>${s.label}</h4>${s.screens.map(([k, l]) => `<a data-go="${k}" class="${k === VQ.current ? 'on' : ''} ${VQ.visited.has(k) ? 'seen' : ''}"><i></i>${l}</a>`).join('')}</div>`).join('')}</div>
    <div class="row between mt"><a onclick="VQ.visited.clear();VQ.store.set('visited',[]);VQ.openDemoMap();VQ.renderDemo()">Reset progress</a><button class="btn ghost sm" onclick="VQ.closeOv()">Close</button></div>`;
  document.getElementById('ov').classList.add('show');
};
VQ.searchIndex = () => { const out = []; VQ.JOURNEY.forEach(j => out.push({ icon: 'file', label: j.label, kind: 'Screen', go: j.key })); (VQ.searchExtra || []).forEach(f => out.push(...f())); return out; };
VQ.openSearch = () => {
  const idx = VQ.searchIndex();
  document.getElementById('ov-box').innerHTML = `<input class="sr-input" id="sr" placeholder="Search location, camera, incident or asset…" autocomplete="off"><div class="sr-list" id="sr-list"></div>`;
  const draw = q => { const t = q.trim().toLowerCase(); const hits = idx.filter(x => !t || (x.label + ' ' + x.kind + ' ' + (x.more || '')).toLowerCase().includes(t)).slice(0, 40);
    document.getElementById('sr-list').innerHTML = hits.map((x, i) => `<a data-go="${x.go}" class="${i === 0 ? 'on' : ''}">${VQ.I(x.icon)}<span>${x.label}${x.more ? ` <span class="muted">· ${x.more}</span>` : ''}</span><em>${x.kind}</em></a>`).join('') || '<div class="t2" style="padding:12px">No matches.</div>'; };
  document.getElementById('ov').classList.add('show'); const inp = document.getElementById('sr'); draw(''); inp.focus();
  inp.addEventListener('input', () => draw(inp.value));
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') { const a = document.querySelector('#sr-list a'); if (a) { VQ.closeOv(); VQ.go(a.dataset.go); } } e.stopPropagation(); if (e.key === 'Escape') VQ.closeOv(); });
};

/* ---------- toast + tooltip ---------- */
VQ.toast = msg => { const t = document.getElementById('toast'); t.innerHTML = VQ.I('checkc') + `<span>${msg}</span>`; t.classList.add('show'); clearTimeout(VQ._tt); VQ._tt = setTimeout(() => t.classList.remove('show'), 2400); };
VQ.tip = {
  el: () => document.getElementById('tip'),
  show(html, x, y) { const el = this.el(); el.innerHTML = html; el.classList.add('show'); const w = el.offsetWidth, h = el.offsetHeight; let l = x + 14, t = y + 14; if (l + w > innerWidth - 8) l = x - w - 14; if (t + h > innerHeight - 8) t = y - h - 14; el.style.left = Math.max(8, l) + 'px'; el.style.top = Math.max(8, t) + 'px'; },
  hide() { this.el().classList.remove('show'); },
};

/* ---------- global events ---------- */
VQ.start = () => {
  VQ.visited = new Set(VQ.store.get('visited', []));
  document.getElementById('ic-search').innerHTML = VQ.I('search'); document.getElementById('ic-bell').innerHTML = VQ.I('bell');
  document.addEventListener('click', e => {
    const act = e.target.closest('[data-act]');
    if (act) { e.stopPropagation(); VQ.toast(act.dataset.act); if (act.classList.contains('btn')) { act.classList.add('done'); act.innerHTML = VQ.I('check') + (act.dataset.done || 'Done'); } return; }
    const set = e.target.closest('[data-set]'); if (set) { const [k, v] = set.dataset.set.split('='); VQ.set(k, v); return; }
    const go = e.target.closest('[data-go]'); if (go) { VQ.closeOv(); VQ.go(go.dataset.go); return; }
    if (e.target.id === 'ov') VQ.closeOv();
  });
  document.addEventListener('mousemove', e => { const t = e.target.closest && e.target.closest('[data-tip]'); if (t) VQ.tip.show(t.dataset.tip, e.clientX, e.clientY); else if (!e.target.closest || !e.target.closest('[data-hover]')) VQ.tip.hide(); });
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'ArrowRight') VQ.step(1); else if (e.key === 'ArrowLeft') VQ.step(-1);
    else if (e.key.toLowerCase() === 'm') { document.getElementById('ov').classList.contains('show') ? VQ.closeOv() : VQ.openDemoMap(); }
    else if (e.key === '/') { e.preventDefault(); VQ.openSearch(); } else if (e.key === 'Escape') VQ.closeOv();
  });
  window.addEventListener('hashchange', () => VQ.render());
  let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { VQ.fit(); VQ.runMounts(); }, 120); });
  VQ.render();
};
