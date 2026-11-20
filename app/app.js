// Leonida Trophy Guide — offline tracker. Progress + notes live in localStorage only.
// URL helpers for screenshots: ?view=cards|table|roadmap &seed=13 &spoiler=off &detail=<id> &sort=rarity
const EARN_KEY = 'gta6-trophy-guide-earned-v2';
const NOTE_KEY = 'gta6-trophy-guide-notes-v2';
const PREF_KEY = 'gta6-trophy-guide-prefs-v2';
const params = new URLSearchParams(location.search);
const SEED_IDS = [2, 3, 8, 20, 21, 44, 45, 46, 51, 55, 16, 35, 42];

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const byId = new Map(trophies.map(t => [t.id, t]));

let earned = new Set(JSON.parse(localStorage.getItem(EARN_KEY) ?? '[]'));
let notes = JSON.parse(localStorage.getItem(NOTE_KEY) ?? '{}');
let prefs = { spoiler: true, ...(JSON.parse(localStorage.getItem(PREF_KEY) ?? '{}')) };
if (params.get('spoiler') === 'off') prefs.spoiler = false;
if (params.get('spoiler') === 'on') prefs.spoiler = true;
if (params.get('seed')) earned = new Set(SEED_IDS.map(id => byId.get(id).name));

const $ = s => document.querySelector(s);
const gradeOrder = ['platinum', 'gold', 'silver', 'bronze'];
const gradeLabel = g => g[0].toUpperCase() + g.slice(1);
const kindLabel = k => ({ story: 'Story', side: 'Side', collectible: 'Collectible', activity: 'Activity', combat: 'Combat', misc: 'Misc' }[k] ?? k);
const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n);
const hiddenName = t => t.hidden && prefs.spoiler && !earned.has(t.name);
const shownName = t => hiddenName(t) ? `Hidden ${kindLabel(t.kind).toLowerCase()} trophy` : t.name;
const shownDesc = t => hiddenName(t) ? 'Hidden — earn it to reveal its description.' : t.description;
const shownGuide = t => hiddenName(t) ? 'Hidden — earn it (or switch spoilers off) to reveal the guide.' : t.guide;

function timeMin(t) {
  if (t.time === '?') return Infinity;
  const m = t.time.match(/([\d.]+)\s*h/); const s = t.time.match(/([\d.]+)\s*min/);
  if (m) return parseFloat(m[1]) * 60;
  if (s) return parseFloat(s[1]);
  const r = t.time.match(/([\d.]+)–([\d.]+)\s*h/);
  return r ? (parseFloat(r[1]) + parseFloat(r[2])) / 2 * 60 : 60;
}

function save() {
  localStorage.setItem(EARN_KEY, JSON.stringify([...earned]));
  localStorage.setItem(NOTE_KEY, JSON.stringify(notes));
  localStorage.setItem(PREF_KEY, JSON.stringify({ spoiler: prefs.spoiler }));
}
function toggleEarned(t) {
  earned.has(t.name) ? earned.delete(t.name) : earned.add(t.name);
  save(); renderAll();
}
function isEarned(t) { return earned.has(t.name); }

function renderProgress() {
  const pct = Math.round(earned.size / trophies.length * 100);
  $('#ringNum').textContent = pct + '%';
  const C = 2 * Math.PI * 52;
  const fg = $('#ringFg');
  fg.style.strokeDasharray = C;
  fg.style.strokeDashoffset = C * (1 - earned.size / trophies.length);
  $('#platCount').textContent = `${earned.size} / ${trophies.length} earned`;
  $('#gradeBars').innerHTML = gradeOrder.map(g => {
    const all = trophies.filter(t => t.grade === g);
    const got = all.filter(isEarned).length;
    return `<div class="grade-bar gb-${g}"><div class="gb-top"><b>${gradeLabel(g)} · ${got}/${all.length}</b><span>${all.length ? Math.round(got / all.length * 100) : 0}%</span></div><div class="gb-track"><div class="gb-fill" style="width:${all.length ? got / all.length * 100 : 0}%"></div></div></div>`;
  }).join('');
}

function renderPlanner() {
  const missable = trophies.find(t => t.missable);
  const rest = trophies.filter(t => !isEarned(t) && !t.missable)
    .sort((a, b) => a.difficulty - b.difficulty || b.rarity - a.rarity || timeMin(a) - timeMin(b));
  const picks = [];
  if (missable && !isEarned(missable)) picks.push({ t: missable, why: 'Do this FIRST — the only missable trophy. Chapter 1 balcony, right after “Down to Earth”.' });
  for (const t of rest) { if (picks.length >= 3) break; picks.push({ t, why: `Easiest unearned · ${stars(t.difficulty)} · ${t.time} · ${t.rarity}% earned it` }); }
  $('#nextUp').innerHTML = picks.map(({ t, why }, i) => `<li class="${t.missable ? 'missable' : ''}">
    <div class="nu-rank">#${i + 1} ${t.missable ? '· Missable' : '· ' + kindLabel(t.kind)}</div>
    <button type="button" class="nu-name" data-open="${t.id}">${shownName(t)}</button>
    <div class="nu-why">${why}</div>
    <div class="nu-meta">${gradeLabel(t.grade)} · ${t.rarity}% on Exophase</div></li>`).join('');
}

function badges(t) {
  const b = [`<span class="badge ${t.grade}">${t.grade}</span>`];
  if (t.hidden) b.push('<span class="badge hidden">Hidden</span>');
  if (t.missable) b.push('<span class="badge missable">Missable</span>');
  if (t.unconfirmed) b.push('<span class="badge unconfirmed">Unconfirmed</span>');
  if (t.singleSource) b.push('<span class="badge single">Single source</span>');
  return b.join('');
}

function filtered() {
  const q = ($('#search').value || '').toLowerCase();
  const kind = $('#kind').value, grade = $('#grade').value, eo = $('#earnedOnly').checked;
  return trophies.filter(t => {
    if (kind !== 'all' && t.kind !== kind) return false;
    if (grade !== 'all' && t.grade !== grade) return false;
    if (eo && !isEarned(t)) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.guide.toLowerCase().includes(q))) return false;
    return true;
  });
}

function renderCards() {
  const list = filtered();
  $('#cardsCount').textContent = `Showing ${list.length} of ${trophies.length} trophies · ${earned.size} earned · rarity = Exophase %, 20 Nov 2026`;
  $('#cardGrid').innerHTML = list.map(t => `<article class="card ${isEarned(t) ? 'earned' : ''} ${t.missable ? 'missable' : ''} ${hiddenName(t) ? 'spoiled' : ''}">
    <div class="card-head">
      <button type="button" class="tick ${isEarned(t) ? 'on' : ''}" data-tick="${t.id}" aria-label="Toggle earned: ${t.name}">✓</button>
      <h3>${shownName(t)}</h3>
    </div>
    <div class="desc">${shownDesc(t)}</div>
    <div class="badges">${badges(t)}</div>
    <div class="meta"><span class="stars" title="Difficulty ${t.difficulty}/5">${stars(t.difficulty)}</span><span>⏱ <b>${t.time}</b></span><span>👥 <b>${t.rarity}%</b> earned</span><span>${kindLabel(t.kind)}</span></div>
    <p class="guide"><b>How:</b> ${shownGuide(t)} <span class="src">(${t.sources.join(' · ')})</span></p>
    <button type="button" class="more" data-open="${t.id}">Details &amp; notes →</button>
  </article>`).join('');
}

let sortKey = params.get('sort') || 'rarity', sortDir = 1;
function renderTable() {
  const list = filtered().slice().sort((a, b) => {
    const v = sortKey === 'rarity' ? a.rarity - b.rarity : sortKey === 'difficulty' ? a.difficulty - b.difficulty : timeMin(a) - timeMin(b);
    return v * sortDir;
  });
  $('#tableCount').textContent = `Showing ${list.length} of ${trophies.length} trophies — click a column header to sort`;
  $('#tableBody').innerHTML = list.map(t => `<tr class="${isEarned(t) ? 'earned' : ''}">
    <td><input type="checkbox" data-tick="${t.id}" ${isEarned(t) ? 'checked' : ''} aria-label="Earned: ${t.name}"></td>
    <td><span class="t-name">${shownName(t)}</span><br><span class="t-guide">${shownDesc(t)}</span>${t.missable ? ' <span class="badge missable">Missable</span>' : ''}${t.unconfirmed ? ' <span class="badge unconfirmed">Unconfirmed</span>' : ''}</td>
    <td>${gradeLabel(t.grade)}</td><td>${kindLabel(t.kind)}</td>
    <td>${t.rarity}%</td><td>${stars(t.difficulty)}</td><td>${t.time}</td>
    <td class="t-guide"><b>How:</b> ${shownGuide(t)} <span style="color:var(--dim)">(${t.sources.join(' · ')})</span></td>
  </tr>`).join('');
}

const PHASES = [
  { name: 'Phase 1 — Story first', time: '60–80 h', blurb: 'Play the story. The 12 story trophies pop as you go, and the missable lives here — do it in Chapter 1.', ids: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 28] },
  { name: 'Phase 2 — The 100% grind', time: '≈ 100 h', blurb: 'Free roam after the story. Grind trophies that feed the 100% checklist — vehicles, animals, challenges, cards, WAiNK spots.', ids: [14, 15, 16, 17, 18, 19, 32, 35, 42, 52, 53, 54, 55, 30, 31] },
  { name: 'Phase 3 — Strangers & clean-up', time: '10–20 h', blurb: 'Stranger strands, heists, combat feats and the two honestly-unconfirmed trophies. Check back when the community pins them.', ids: [22, 23, 24, 25, 26, 27, 29, 33, 34, 36, 37, 38, 39, 40, 41, 43, 44, 45, 46, 47, 48, 49, 50, 51, 20, 21] },
];
function renderRoadmap() {
  $('#phases').innerHTML = PHASES.map(p => {
    const ts = p.ids.map(id => byId.get(id));
    const got = ts.filter(isEarned).length;
    const pct = Math.round(got / ts.length * 100);
    return `<div class="phase"><h3>${p.name} <span class="ph-time">· ${p.time}</span></h3>
      <p>${p.blurb}</p>
      <div class="ph-bar"><div class="ph-fill" style="width:${pct}%"></div></div>
      <p>${got}/${ts.length} done · ${pct}%</p>
      <ul>${ts.map(t => `<li class="${isEarned(t) ? 'done' : ''}"><span class="gdot" style="background:${{ platinum: '#b9f2ff', gold: '#ffd166', silver: '#c9d4e8', bronze: '#e0915a' }[t.grade]}"></span><button type="button" data-open="${t.id}">${isEarned(t) ? '✓ ' : ''}${shownName(t)}</button>${t.missable ? ' ⚠' : ''}</li>`).join('')}</ul></div>`;
  }).join('');
}

function renderAll() { renderProgress(); renderPlanner(); renderCards(); renderTable(); renderRoadmap(); }

function openDetail(id) {
  const t = byId.get(+id); if (!t) return;
  const pane = $('#detailPane');
  pane.innerHTML = `<button type="button" class="close-x" id="detailClose" aria-label="Close">✕</button>
    <h2 id="detailName">${shownName(t)}</h2>
    <p class="desc">${shownDesc(t)}</p>
    <div class="badges">${badges(t)}</div>
    <div class="meta" style="margin-top:10px"><span class="stars">${stars(t.difficulty)}</span><span>⏱ <b>${t.time}</b></span><span>👥 <b>${t.rarity}%</b> earned on Exophase</span><span>${kindLabel(t.kind)}</span></div>
    <p class="guide"><b>How:</b> ${shownGuide(t)}</p>
    <p class="sources">Sources: ${t.sources.join(' · ')} · Rarity: Exophase, 20 Nov 2026${t.unconfirmed ? ' · <b style="color:var(--amber)">Method unconfirmed — no guide has pinned the trigger yet.</b>' : ''}${t.singleSource ? ' · <b style="color:var(--amber)">Single source — only one guide has pinned this so far.</b>' : ''}</p>
    <label class="notes" for="noteBox">Your notes <span style="font-weight:400">(saved in this browser)</span></label>
    <textarea id="noteBox" placeholder="e.g. meditation spot 7 of 18 done…">${(notes[t.name] ?? '').replace(/</g, '&lt;')}</textarea>
    <div class="actions">
      <button type="button" class="primary" id="detailTick">${isEarned(t) ? '✓ Earned — untick' : 'Mark earned'}</button>
      <button type="button" id="detailClose2">Close</button>
    </div>`;
  $('#detailBackdrop').hidden = false;
  $('#noteBox').addEventListener('input', e => { notes[t.name] = e.target.value; save(); });
  $('#detailTick').addEventListener('click', () => { toggleEarned(t); openDetail(t.id); });
  $('#detailClose').addEventListener('click', closeDetail);
  $('#detailClose2').addEventListener('click', closeDetail);
}
function closeDetail() { $('#detailBackdrop').hidden = true; }
$('#detailBackdrop').addEventListener('click', e => { if (e.target.id === 'detailBackdrop') closeDetail(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDetail(); });

document.addEventListener('click', e => {
  const open = e.target.closest('[data-open]');
  if (open) { openDetail(open.dataset.open); return; }
  const tick = e.target.closest('[data-tick]');
  if (tick) { toggleEarned(byId.get(+tick.dataset.tick)); }
});
document.addEventListener('change', e => {
  if (e.target.matches('[data-tick]')) toggleEarned(byId.get(+e.target.dataset.tick));
});

function setView(v) {
  document.querySelectorAll('.view-btn').forEach(b => b.classList.toggle('active', b.dataset.view === v));
  document.querySelectorAll('.view').forEach(s => s.classList.toggle('active', s.id === 'view-' + v));
}
document.querySelectorAll('.view-btn').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
document.querySelectorAll('.sort').forEach(b => b.addEventListener('click', () => {
  if (sortKey === b.dataset.sort) sortDir *= -1; else { sortKey = b.dataset.sort; sortDir = 1; }
  renderTable();
}));
['search', 'kind', 'grade', 'earnedOnly'].forEach(id => document.getElementById(id).addEventListener('input', () => { renderCards(); renderTable(); }));
$('#spoiler').checked = prefs.spoiler;
$('#spoiler').addEventListener('change', e => { prefs.spoiler = e.target.checked; save(); renderAll(); });
$('#bannerGo').addEventListener('click', () => { prefs.spoiler = false; $('#spoiler').checked = false; save(); renderAll(); openDetail(28); });
$('#exportBtn').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify({ earned: [...earned], notes }, null, 2)], { type: 'application/json' }));
  a.download = 'leonida-trophy-progress.json'; a.click();
});
$('#importFile').addEventListener('change', async e => {
  const f = e.target.files[0]; if (!f) return;
  try {
    const data = JSON.parse(await f.text());
    if (Array.isArray(data.earned)) earned = new Set(data.earned.filter(n => trophies.some(t => t.name === n)));
    if (data.notes && typeof data.notes === 'object') notes = data.notes;
    save(); renderAll();
  } catch { alert('That file is not a valid progress export.'); }
});
$('#resetBtn').addEventListener('click', () => {
  if (!confirm('Clear all ticks and notes?')) return;
  earned = new Set(); notes = {}; save(); renderAll();
});

setView(params.get('view') || 'cards');
renderAll();
if (params.get('scroll')) {
  // Defer: scrollTo before first layout clamps to ~0 in headless runs.
  const y = +params.get('scroll');
  requestAnimationFrame(() => setTimeout(() => window.scrollTo(0, y), 120));
}
if (params.get('detail')) openDetail(params.get('detail'));
