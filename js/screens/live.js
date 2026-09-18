/* =========================================================
   Screens · Live View (Grid View, Map View). Uses VQ.camKit from home.js.
   ========================================================= */
(() => {
  const { UI, C, data: D, I } = VQ;
  const kit = VQ.camKit, PER = 6;
  const camById = id => D.cameras.find(c => c.id === id) || D.cameras.find(c => c.id === 'CAM-0845');
  const sorted = () => [...D.incidents].sort((a, b) => a.mins - b.mins);
  const camOfInc = i => D.cameras.find(c => kit.incOf(c) === i);
  const statusPill = c => c.status === 'off' ? UI.pill('Offline', 'crit', 'videooff') : c.status === 'warn' ? UI.pill('Degraded', 'warn') : UI.pill('Live', 'good');
  const weatherIcon = w => /rain/i.test(w) ? 'rain' : /fog/i.test(w) ? 'fog' : 'sun';
  const weatherOf = c => { const i = kit.incOf(c); if (i && i.weather) return i.weather.split(' · ').slice(0, 2).join(' · '); return c.km > 425 && c.km < 470 ? 'Heavy rain · 24°C' : c.km >= 530 && c.km <= 548 ? 'Fog lifting · 21°C' : `Clear · ${c.km > 250 ? 29 : 28}°C`; };

  const plate = (html, size) => `<div class="cam-offline" style="z-index:1"><div><span style="display:block;width:${size}px;height:${size}px;margin:0 auto 6px;position:relative"><svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${VQ.ICONS.videooff}</svg></span>${html}</div></div>`;
  const ovBtn = (pos, icon, act) => `<button data-act="${act}" aria-label="${act}" style="width:32px;height:32px;border-radius:7px;background:rgba(8,18,40,.78);color:#fff;display:grid;place-items:center"><span style="display:inline-flex;width:16px;height:16px">${I(icon)}</span></button>`;

  /* PTZ pad: four arrows round a home button */
  const ptz = cam => { const off = cam.status === 'off', arrow = (deg, x, y, name) => `<button data-act="${off ? cam.id + ' is offline · PTZ unavailable' : `${cam.id} · pan ${name}`}" aria-label="Pan ${name}" style="position:absolute;left:${x}%;top:${y}%;transform:translate(-50%,-50%);width:30px;height:30px;display:grid;place-items:center;color:var(--ink)"><svg width="14" height="14" viewBox="0 0 14 14" style="transform:rotate(${deg}deg)"><path d="M7 2.5 12 10.5H2z" fill="currentColor"/></svg></button>`;
    const pad = `<div style="position:relative;width:132px;height:132px;border-radius:50%;flex:none;background:radial-gradient(circle at 50% 40%,#fff,var(--blue-50) 70%);border:1px solid var(--line);box-shadow:inset 0 0 0 9px var(--blue-50),inset 0 0 0 10px var(--line)">${arrow(0, 50, 17, 'up')}${arrow(90, 83, 50, 'right')}${arrow(180, 50, 83, 'down')}${arrow(270, 17, 50, 'left')}<button data-act="${cam.id} · returned to home position" aria-label="Home position" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:40px;height:40px;border-radius:50%;background:var(--card);border:1px solid var(--line);box-shadow:var(--shadow);display:grid;place-items:center"><i style="width:14px;height:14px;border-radius:50%;border:3px solid var(--ink);display:block"></i></button></div>`;
    const b = (icon, label, msg) => `<button data-act="${off ? cam.id + ' is offline · PTZ unavailable' : `${cam.id} · ${msg}`}" style="display:flex;align-items:center;gap:9px;padding:6px 10px;border-radius:6px;background:var(--blue-50);font-size:12.5px;font-weight:500;color:var(--ink);text-align:left"><span style="display:inline-flex;width:14px;height:14px;color:var(--navy-600)">${I(icon)}</span>${label}</button>`;
    return `<div class="small t2 mb">Camera: ${D.corridor} ${D.kmLabel(cam.km)} · ${cam.id}${off ? ' · <b style="color:var(--crit-ink)">offline</b>' : ''}</div><div class="row" style="gap:16px;align-items:center">${pad}<div class="grow" style="display:flex;flex-direction:column;gap:5px;min-width:0">${b('plus', 'Zoom +', 'zoom in')}${b('minus', 'Zoom −', 'zoom out')}${b('plus', 'Focus +', 'focus far')}${b('minus', 'Focus −', 'focus near')}${b('crosshair', 'Auto Track', 'auto track on')}</div></div>`; };

  const thumb = (c, sel) => { const i = kit.incOf(c), dot = c.status === 'off' ? '#ff3b30' : c.status === 'warn' ? '#ffb020' : '#25d366';
    return kit.wrap(c, UI.cam({ img: c.img, alt: `${c.id} thumbnail`, live: false, chip: false, label: `<span class="cam-chip">${D.kmLabel(c.km)}</span>`, set: `cam=${c.id}`, on: c.id === sel.id,
      tip: `<b>${c.id}</b> · ${D.kmLabel(c.km)}<br>${kit.place(c)}<br>${kit.sees(c)}`,
      extra: `${c.status === 'off' ? plate('<span style="font-size:10.5px">Offline</span>', 18) : ''}<span style="position:absolute;right:7px;top:8px;z-index:4;width:9px;height:9px;border-radius:50%;background:${dot};box-shadow:0 0 0 2px rgba(8,18,40,.6)"></span>${i && c.status !== 'off' ? `<span style="position:absolute;left:6px;bottom:6px;z-index:4;display:inline-flex;align-items:center;gap:4px;max-width:calc(100% - 12px);background:${i.sev === 'high' ? '#c8201b' : 'rgba(8,18,40,.82)'};border-radius:4px;padding:2px 6px;font-size:10px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"><span style="display:inline-flex;width:11px;height:11px;flex:none">${I(D.types[i.type].icon)}</span>${D.types[i.type].label}</span>` : ''}` }), 'min-width:0'); };

  const detRow = i => { const c = camOfInc(i), t = D.types[i.type];
    return `<div class="li click" data-go="incident/${i.id}"><div class="li-ic tone-${i.sev === 'high' ? 'crit' : t.tone}">${I(t.icon)}</div><span data-fb="${c ? kit.fb(c) : 'cam-corridor-1.jpg'}" style="display:contents"><img class="li-thumb" src="${UI.IMG(i.img)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'"></span><div class="li-body"><div class="li-title ${i.sev === 'high' ? 'crit' : ''}">${i.title}</div><div class="li-sub">${D.corridor}, ${D.kmLabel(i.km)} · ${i.near}</div><div class="li-sub">${i.line1}</div></div><div class="li-meta"><span>${i.at}</span>${UI.sev(i.sev)}</div></div>`; };

  VQ.screen('live', {
    title: 'Live View', sub: 'Real-time visibility across the corridor',
    tabs: [['grid', 'Grid View'], ['map', 'Map View']],
    filters: () => UI.sel('NH-44') + UI.sel(`Km 0 – ${D.km}`) + UI.sel('All Lanes'),
    views: {
      /* ---------- Grid view ---------- */
      grid: { render: () => {
        const cam = camById(VQ.state.cam || 'CAM-0845'), inc = kit.incOf(cam), off = cam.status === 'off', idx = D.cameras.indexOf(cam);
        const pages = Math.ceil(D.cameras.length / PER), pg = VQ.clamp(VQ.state.pg != null ? +VQ.state.pg : Math.floor(idx / PER), 0, pages - 1), shown = D.cameras.slice(pg * PER, pg * PER + PER);
        const w = weatherOf(cam), chips = `<span class="cam-chip">${D.corridor} &nbsp;|&nbsp; ${D.kmLabel(cam.km)} &nbsp;|&nbsp; ${D.from} → ${D.to}</span><span class="cam-chip" style="display:inline-flex;align-items:center;gap:5px"><span style="display:inline-flex;width:13px;height:13px;color:#ffd24a">${I(weatherIcon(w))}</span>${w}</span>`;
        const action = off ? `<button class="btn primary" data-go="assets/alerts">${I('wrench')}Open Asset Alert</button>` : inc ? `<button class="btn primary" data-go="incident/${inc.id}">Open Incident ${inc.id}${I('arrow')}</button>` : `<button class="btn primary" data-act="Incident draft created from ${cam.id}, ${D.kmLabel(cam.km)} (demo)" data-done="Draft created">Create Incident${I('arrow')}</button>`;
        const banner = inc && !off ? `<div style="position:absolute;left:50%;top:44px;transform:translateX(-50%);z-index:3;display:flex;align-items:center;gap:8px;background:${inc.sev === 'high' ? '#c8201b' : inc.sev === 'medium' ? '#a86a00' : 'rgba(8,18,40,.85)'};border-radius:6px;padding:5px 12px;font-size:12.5px;font-weight:600;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.3)"><span style="display:inline-flex;width:15px;height:15px">${I(D.types[inc.type].icon)}</span>${inc.title} · ${inc.banner.join(' · ')}</div>` : '';
        const main = kit.wrap(cam, UI.cam({ img: cam.img, alt: `${cam.id} live frame`, cls: 'wide', chip: false, label: chips, status: off ? 'off' : 'ok', liveText: off ? 'OFFLINE' : 'LIVE', topRight: `${D.date} &nbsp;|&nbsp; ${D.nowSec}`,
          boxes: kit.boxes(cam, 'wide'), path: kit.path(cam),
          foot: `${cam.id} · ${kit.place(cam)}${cam.status === 'warn' ? ' · image quality degraded, lens cleaning due' : ''}`,
          extra: `${off ? plate('Camera offline since 08:32 AM<br><span style="font-weight:400">Last frame 08:31:48 AM · network link down at the Km 101 cabinet</span>', 34) : ''}${banner}<div style="position:absolute;left:10px;top:50%;transform:translateY(-50%);z-index:4;display:flex;flex-direction:column;gap:6px">${ovBtn('', 'expand', 'Full screen (demo)')}${ovBtn('', 'crosshair', cam.id + ' · centred on detection')}${ovBtn('', 'plus', cam.id + ' · zoom in')}${ovBtn('', 'minus', cam.id + ' · zoom out')}</div><div style="position:absolute;right:10px;bottom:10px;z-index:4">${action}</div>` }));
        const pager = (n, icon, flip) => `<button ${n < 0 || n >= pages ? 'disabled style="opacity:.35;' : `data-set="pg=${n}" style="`}width:26px;height:26px;border-radius:6px;border:1px solid var(--line);display:grid;place-items:center;color:var(--ink);background:var(--card)"><span style="display:inline-flex;width:14px;height:14px;${flip ? 'transform:rotate(180deg)' : ''}">${I(icon)}</span></button>`;
        const strip = `<div class="row between" style="margin-top:12px"><div class="small"><b class="ink">Key cameras</b> <span class="t2">· ${pg * PER + 1}–${pg * PER + shown.length} of ${D.cameras.length} · select a frame to view it</span></div><div class="row" style="gap:6px">${pager(pg - 1, 'chev', 1)}${pager(pg + 1, 'chev')}</div></div><div class="cam-strip">${shown.map(c => thumb(c, cam)).join('')}</div>`;
        const resp = inc && inc.responders[0];
        const facts = UI.facts([['video', 'Camera', `${cam.id} · PTZ dome`], ['mappin', 'Location', `${D.kmLabel(cam.km)} · ${kit.place(cam)}`], ['pulse', 'Status', off ? 'Offline since 08:32 AM' : cam.status === 'warn' ? 'Live · image degraded' : 'Live · 25 fps · 1080p'],
          ['eye', 'AI sees', off ? 'No video. Neighbouring cameras at Km 84.5 and Km 131.2 cover the gap.' : inc ? `${inc.ai.classification} (${inc.ai.confidence}% confidence)` : 'Normal flow, no alerts in the last hour'],
          ['road', 'Lanes', off ? 'Not available' : inc ? inc.ai.laneImpact : 'All lanes open'], ['users', 'Response', off ? 'Maintenance ticket open, crew assigned' : inc ? `${resp.name} · ${resp.eta ? resp.eta + ' mins away' : resp.state}` : 'None needed']]).replace('class="facts"', 'class="facts" style="grid-template-columns:repeat(3,minmax(0,1fr))"')
          + `<div class="card-note" style="margin-top:12px;padding-top:10px;border-top:1px solid var(--line-2)"><b class="ink">AI reading.</b> ${off ? 'Video lost at 08:31:48 AM. The cabinet at Km 101 stopped answering at the same moment, so this is a network or power fault, not the camera itself. Open the asset alert for the fault history.' : inc ? `${inc.ai.detection} ${inc.ai.predictive}` : cam.status === 'warn' ? 'Traffic is flowing normally. Image contrast is down 35% since 06:10 AM, most likely a dirty dome; detection confidence is reduced until it is cleaned.' : 'No stopped vehicles, debris, animals or pedestrians in view. Traffic is moving at normal speed in all lanes.'}</div>
          <div class="row wrap mt" style="gap:8px">${off ? UI.btn('Open Asset Alert', { sm: 1, primary: 1, icon: 'wrench', go: 'assets/alerts' }) : inc ? UI.btn('Open Incident', { sm: 1, primary: 1, icon: 'alert', go: `incident/${inc.id}` }) + UI.btn('Traffic Impact', { sm: 1, icon: 'trend', go: `incident/${inc.id}/impact` }) : UI.btn('Create Incident', { sm: 1, primary: 1, icon: 'plus', toast: `Incident draft created from ${cam.id} (demo)`, done: 'Draft created' })}${UI.btn('Show on Map', { sm: 1, icon: 'mappin', go: 'live/map' })}${off ? '' : UI.btn('Save Snapshot', { sm: 1, ghost: 1, icon: 'clip', toast: `Snapshot saved from ${cam.id} at ${D.nowSec}`, done: 'Saved' })}</div>`;
        const det = sorted();
        return `<div class="grid g-2-1">
          <div class="col">
            <div class="card" style="padding:10px 12px 12px">${main}${strip}</div>
            ${UI.card('Selected Camera', facts, { icon: 'video', style: 'flex:1', right: inc && !off ? `<a data-go="incident/${inc.id}">Open ${inc.id}</a>` : statusPill(cam) })}
          </div>
          <div class="col">
            ${UI.card(`Active Detections (${D.home.activeIncidents})`, `<div class="list">${det.slice(0, 4).map(detRow).join('')}</div>`, { right: UI.viewAll('incidents/feed') })}
            ${UI.card('Camera PTZ Control', ptz(cam), { right: UI.sel('Preset Views') })}
            ${UI.card('Quick Actions', UI.quick([{ icon: 'alert', label: 'Raise Alert', toast: `Alert raised for ${cam.id}, ${D.kmLabel(cam.km)}` }, { icon: 'mega', label: 'Message Sign', toast: 'VMS message composer opened (demo)' }, { icon: 'car', label: 'Dispatch Patrol', toast: `Nearest patrol dispatched to ${D.kmLabel(cam.km)}` }, { icon: 'clip', label: 'Record Clip', toast: `Recording 60 s clip from ${cam.id}` }], true).replace('class="qa stack"', 'class="qa stack" style="grid-template-columns:repeat(4,minmax(0,1fr));gap:8px"'))}
          </div></div>`;
      } },

      /* ---------- Map view ---------- */
      map: { sub: 'Every key camera on the corridor, and what it sees right now.', render: () => {
        const cams = D.assets.classes.find(c => c.key === 'cameras'), off = D.cameras.filter(c => c.status === 'off').length, warn = D.cameras.filter(c => c.status === 'warn').length, seeing = D.cameras.filter(c => c.status !== 'off' && kit.incOf(c)).length;
        const T = VQ.Map.TONE, lg = (col, icon, text) => `<span><i class="rd" style="background:${col}"></i>${text}</span>`;
        const legend = `<b>Cameras</b>${lg(T.navy, 'video', 'Live')}${lg(T.warn, 'video', 'Degraded image')}${lg(T.crit, 'videooff', 'Offline')}<b style="margin-top:4px">On the road</b>${lg(T.crit, '', 'High severity incident')}${lg(T.serious, '', 'Medium')}${lg(T.warn, '', 'Low')}`;
        const cols = [{ k: 'id', label: 'Camera', fmt: v => `<b class="ink">${v}</b>` }, { k: 'km', label: 'Km', fmt: v => D.kmLabel(v).replace('Km ', '') }, { k: 'x', label: 'Nearest place', fmt: (_, c) => c.label || D.nearest(c.km) }, { k: 'status', label: 'Status', fmt: (_, c) => statusPill(c) },
          { k: 'y', label: 'Currently sees', fmt: (_, c) => { const i = kit.incOf(c); return c.status === 'off' ? '<span class="muted">No video since 08:32 AM</span>' : i ? `<span class="row" style="gap:7px"><span style="color:${T[i.sev === 'high' ? 'crit' : D.types[i.type].tone]};display:inline-flex;width:16px;height:16px;flex:none">${I(D.types[i.type].icon)}</span><b class="ink">${i.title}</b></span>` : `<span class="t2">${kit.sees(c)}</span>`; } },
          { k: 'z', label: 'Detected', fmt: (_, c) => { const i = kit.incOf(c); return i && c.status !== 'off' ? i.at : '<span class="muted">—</span>'; } }, { k: 'c', label: '', fmt: () => `<span class="li-chev">${I('chev')}</span>` }];
        const rows = D.cameras.map(c => { const i = kit.incOf(c); return { ...c, go: c.status === 'off' ? 'assets/alerts' : i ? `incident/${i.id}` : 'live/grid' }; });
        return UI.kpis([
          { icon: 'video', bg: 'bg-navy', value: VQ.fmt(cams.count), label: 'Cameras on the corridor', delta: { text: `About one every ${(D.km * 2 / cams.count).toFixed(1)} km each way` }, go: 'assets' },
          { icon: 'checkc', bg: 'bg-good', value: cams.pct + '%', label: 'Operational now', delta: { dot: 'good', text: `${VQ.fmt(Math.round(cams.count * cams.pct / 100))} streaming` }, go: 'assets' },
          { icon: 'eye', bg: 'bg-info', value: D.cameras.length, label: 'Key cameras shown here', delta: { text: `${off} offline · ${warn} degraded` } },
          { icon: 'alert', bg: 'bg-crit', value: seeing, label: 'Key cameras on an incident', delta: { text: `${D.home.activeIncidents} active incidents` }, go: 'incidents/feed' },
        ], 'g4') + `<div class="card flush mb" style="margin-bottom:12px">${VQ.Map.render({ h: 440, kmTicks: 50, legend, pins: [...D.incidents.map(i => D.incPin(i)), ...D.cameras.map(D.camPin)] })}</div>
        ${UI.card('Key Cameras', UI.table(cols, rows) + '<div class="card-note">Select a row to open what the camera is watching. CAM-1010 at Km 101 is offline; the asset alert has the fault details.</div>', { icon: 'video', right: `<span>${D.cameras.length} of ${VQ.fmt(cams.count)} cameras</span>${UI.btn('Grid View', { sm: 1, icon: 'grid', go: 'live/grid' })}` })}`;
      } },
    },
  });
})();
