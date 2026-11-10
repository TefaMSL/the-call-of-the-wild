/* ============================================================
   app.js — The Call of the Wild · Interactive Quiz
   Main application logic: render, interactions, worlds, boot
   ============================================================ */
(function () {
'use strict';

/* ---- helpers ---- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));
const LAT = /[A-Za-zÀ-ÿ][A-Za-z0-9À-ÿ''\&\-,.?! ]*[A-Za-z0-9À-ÿ]|[A-Za-z]/g;

function fmt(s) {
  s = String(s == null ? '' : s);
  let out = '', last = 0;
  s.replace(LAT, (m, i) => {
    out += esc(s.slice(last, i)) + '<bdi class="en" dir="ltr">' + esc(m) + '</bdi>';
    last = i + m.length; return m;
  });
  out += esc(s.slice(last));
  return out.replace(/\n/g, '<br>');
}

const AR  = ['أ', 'ب', 'ج', 'د', 'هـ'];
const PAL = ['#ffa34d', '#7fd1ff', '#c3a6ff', '#7ff0c0', '#ffd86b'];
const PCOL = ['#ffa34d', '#7fd1ff'];
const SCORED = new Set(['forged', 'who', 'sort', 'board', 'meter']);
const QBY = {}; QUESTIONS.forEach(q => { QBY[q.id] = q; });
const MAX = QUESTIONS.filter(q => SCORED.has(q.type)).length;
const LOCAL_KEY = 'cotw-call-v3';

const TYPELBL_AR = { forged:'مزوّر', who:'مين قال؟', sort:'صنّف', board:'لوحة', meter:'مقياس', debate:'نقاش', open:'مفتوح' };
const TYPELBL_EN = { forged:'Forgery', who:'Who Said?', sort:'Sort', board:'Board', meter:'Meter', debate:'Debate', open:'Open' };
function typelbl(type) { return LANG === 'en' ? TYPELBL_EN[type] : TYPELBL_AR[type]; }

const PART_WORLD = { sum: 0, key: 1, thm: 2, core: 3 };
const WORLD_OF_CH = { I:0, II:1, III:2, IV:2, V:1, VI:3, VII:3 };

const S = { name:'', answers:{}, mode:'local', why:'nodb', uid:null, owner:false, tab:'quest', players:[], sel:[], delId:null, startedAt:Date.now() };
const D = {}; const EDIT = {}; const HINT = {};

/* ---- local storage ---- */
function loadLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return;
    const o = JSON.parse(raw);
    S.name = o.name || ''; S.answers = o.answers || {}; S.startedAt = o.startedAt || S.startedAt;
  } catch(e) {}
}
function saveLocal() {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify({ name:S.name, answers:S.answers, startedAt:S.startedAt })); } catch(e) {}
}

/* ---- scoring ---- */
function score(answers) {
  let pts = 0, done = 0;
  QUESTIONS.forEach(q => { const r = answers[q.id]; if (!r) return; done++; if (SCORED.has(q.type) && typeof r.pts === 'number') pts += r.pts; });
  return { pts: Math.round(pts * 100) / 100, done };
}
function scoredDone(answers) { return QUESTIONS.filter(q => SCORED.has(q.type) && answers[q.id]).length; }
function rankOf(pct) {
  if (pct >= .85) return t('rankGhost');
  if (pct >= .6)  return t('rankLeader');
  if (pct >= .35) return t('rankSled');
  return t('rankHouse');
}

/* ---- cloud ---- */
let DB = null, USER = null, ref = null, unsub = null;
let chain = Promise.resolve(), pend = {}, tmr = null;

async function initCaps() {
  if (typeof claude === 'undefined' || !claude || !claude.use) return;
  try { DB = await claude.use('db'); } catch(e) { DB = null; }
  try { USER = await claude.use('user'); S.uid = USER ? (await USER.me().catch(()=>null))?.id : null; } catch(e) {}
}

function fullDoc() {
  const sc = score(S.answers);
  return { name: S.name, answers: S.answers, score: sc.pts, done: sc.done, total: QUESTIONS.length, max: MAX, uid: S.uid, updatedAt: Date.now() };
}
async function ensureDoc() {
  if (!DB || !S.uid) return;
  ref = DB.doc('players/' + S.uid);
  try { await ref.set(fullDoc()); S.mode = 'cloud'; S.why = ''; } catch(e) { failCloud(e); }
  setSync();
}
function failCloud(e) { S.mode = 'local'; S.why = String(e); setSync(); }
function setSync() {
  const el = $('#sync'); if (!el) return;
  if (S.mode === 'cloud') { el.textContent = '☁ synced'; el.className = 'chip ok'; el.hidden = false; }
  else if (DB && S.uid)   { el.textContent = '⚠ offline'; el.className = 'chip warn'; el.hidden = false; }
  else                    { el.hidden = true; }
}
function persist(id) {
  saveLocal();
  if (!ref || S.mode !== 'cloud') return;
  pend[id] = true; clearTimeout(tmr);
  tmr = setTimeout(async () => {
    try { await ref.set(fullDoc()); } catch(e) { failCloud(e); }
    pend = {};
  }, 1200);
}
function subscribePlayers() {
  if (!DB) return;
  if (unsub) unsub();
  unsub = DB.collection('players').onSnapshot(snap => {
    S.players = snap.docs.map(d => ({ id:d.id, ...d.data() }));
    if (S.tab === 'room') renderRoom();
  });
}
function ago(ts) {
  if (!ts) return '';
  const d = Date.now() - ts, m = Math.floor(d/60000), h = Math.floor(m/60);
  if (m < 1)  return LANG === 'en' ? 'just now' : 'الآن';
  if (m < 60) return LANG === 'en' ? `${m}m ago` : `منذ ${m} دقيقة`;
  if (h < 24) return LANG === 'en' ? `${h}h ago` : `منذ ${h} ساعة`;
  return LANG === 'en' ? `${Math.floor(h/24)}d ago` : `منذ ${Math.floor(h/24)} يوم`;
}

/* ============================================================
   CARD BUILDERS & MULTI-LANGUAGE ACCESSORS
   ============================================================ */
const qSents   = q => (LANG === 'en' && q.sentsEn)   ? q.sentsEn   : q.sents;
const qTruth   = q => (LANG === 'en' && q.truthEn)   ? q.truthEn   : q.truth;
const qWhy     = q => (LANG === 'en' && q.whyEn)     ? q.whyEn     : q.why;
const qOpts    = q => (LANG === 'en' && q.optsEn)    ? q.optsEn    : q.opts;
const qItems   = q => (LANG === 'en' && q.itemsEn)   ? q.itemsEn   : q.items;
const qLabels  = q => (LANG === 'en' && q.labelsEn)  ? q.labelsEn  : q.labels;
const qPairs   = q => (LANG === 'en' && q.pairsEn)   ? q.pairsEn   : q.pairs;
const qEnds    = q => (LANG === 'en' && q.endsEn)    ? q.endsEn    : q.ends;
const qMoments = q => (LANG === 'en' && q.momentsEn) ? q.momentsEn : q.moments;
const qPro     = q => (LANG === 'en' && q.proEn)     ? q.proEn     : q.pro;
const qCon     = q => (LANG === 'en' && q.conEn)     ? q.conEn     : q.con;
const qModel   = q => (LANG === 'en' && q.modelEn)   ? q.modelEn   : q.model;
const qTitle   = q => {
  if (q.type === 'forged') return t('forgedTag');
  if (q.type === 'who') return t('whoTag');
  if (q.type === 'debate') return '';
  return (LANG === 'en' && q.qEn) ? q.qEn : q.q;
};

function fb(ok, label, body, why) {
  const cls = ok ? 'good' : 'bad';
  const ico = ok ? (LANG==='en'?'Correct ✓':'صح ✓') : (LANG==='en'?'Wrong ✗':'غلط ✗');
  return `<div class="fb ${cls}"><b class="v">${ico} — ${esc(label)}</b>${fmt(body)}</div>` +
    (why ? `<div class="fb" style="margin-top:8px"><b>${LANG==='en'?'Why?':'ليه؟'}</b> ${fmt(why)}</div>` : '');
}
function hintHtml(q) {
  const why = qWhy(q);
  if (!why) return '';
  if (HINT[q.id]) return `<div class="hinttxt">${fmt(why)}</div>`;
  return `<button class="hintbtn" data-act="hint">${t('hintBtn')} 💡</button>`;
}

function bForged(q, r) {
  const locked = !!r;
  const sents = qSents(q);
  return '<div class="doc">' + (locked ? '<div class="stamp' + (r.ok?'.ok':'')+'">' + (r.ok ? t('real') : t('forged')) + '</div>' : '') +
    sents.map((s, i) => {
      let cls = 'sent';
      if (locked) { if (i === q.fake) cls += ' fake'; else if (!r.ok && i === r.i) cls += ' wrongpick'; }
      return `<button class="${cls}" data-act="forge" data-i="${i}" ${locked?'disabled':''}>${fmt(s)}</button>`;
    }).join('') + '</div>' +
    (locked ? fb(r.ok, r.ok ? (LANG==='en'?'You spotted it!':'اكتشفتها!') : (LANG==='en'?'That one is real':'الجملة دي حقيقية'), (LANG==='en'?'Truth: ':'الصح: ') + qTruth(q), qWhy(q)) : hintHtml(q));
}

function bWho(q, r) {
  const locked = !!r;
  const opts = qOpts(q);
  const bubble = `<div class="bubble" dir="ltr">${esc(q.quote)}</div>`;
  const optsH = `<div class="opts">${opts.map((op, i) => {
    let cls = 'opt';
    if (locked) { if (i === q.correct) cls += ' right'; else if (i === r.a) cls += ' wrong'; }
    return `<button class="${cls}" data-act="who" data-i="${i}" ${locked?'disabled':''}><span class="k">${AR[i]}</span><span>${fmt(op)}</span></button>`;
  }).join('')}</div>`;
  return bubble + optsH + (locked ? fb(r.ok, r.ok ? (LANG==='en'?'Correct!':'صح!') : (LANG==='en'?'Wrong':'غلط'), opts[q.correct], qWhy(q)) : hintHtml(q));
}

function bSort(q, r) {
  const locked = !!r;
  const items = qItems(q);
  const labels = qLabels(q);
  const d = D[q.id] = D[q.id] || { c: r ? r.c.slice() : items.map(()=>-1) };
  let h = `<div class="srt">` + items.map((it, i) => {
    const v = locked ? r.c[i] : (d.c[i] >= 0 ? d.c[i] : -1);
    const ok = locked && v === it.a;
    return `<div class="srt-r ${locked?(ok?'right':'wrong'):''}">
      <span>${fmt(it.t)}</span>
      <div class="seg">${labels.map((lb,li)=>`<button class="${(!locked&&v===li)||'on'===String(v===li&&locked)||v===li?'on':''}" data-act="srt" data-i="${i}" data-v="${li}" ${locked?'disabled':''}>${esc(lb)}</button>`).join('')}</div>
      ${locked && !ok ? `<div class="res">← ${esc(labels[it.a])}</div>` : ''}
    </div>`;
  }).join('') + '</div>';
  if (!locked) h += `<div class="row"><button class="btn" data-act="srtgo" ${d.c.every(v=>v>=0)?'':'disabled'}>${t('lockBtn')}</button></div>` + hintHtml(q);
  else h += fb(true, `${t('score_of')} ${Math.round(r.pts*items.length)} ${t('out_of')} ${items.length}`, '', qWhy(q));
  return h;
}

function bBoard(q, r) {
  const locked = !!r;
  const pairs = qPairs(q);
  const d = D[q.id] = D[q.id] || { sel:null, m: r ? Object.assign({}, r.m) : {} };
  const m = locked ? r.m : d.m;
  const left  = pairs.map((p,i) => {
    const linked = m[i] !== undefined, sel = !locked && d.sel === i;
    let cls = 'node' + (sel?' pick':'') + (linked?' linked':'') + (locked&&+m[i]!==i?' bad':'');
    return `<button class="${cls}" data-act="bl" data-i="${i}" ${locked?'disabled':''} style="${linked?'--pc:'+PAL[i%PAL.length]:''}">${fmt(p.l)}</button>`;
  });
  const right = pairs.map((p,i) => {
    const owner = Object.keys(m).find(l=>+m[l]===i);
    const linked = owner !== undefined, sel = !locked && d.sel !== null && !linked;
    let cls = 'node' + (linked?' linked':'') + (locked&&owner!==undefined&&+owner!==i?' bad':'');
    return `<button class="${cls}" data-act="br" data-r="${i}" ${locked?'disabled':''} style="${linked?'--pc:'+PAL[+owner%PAL.length]:''}">${fmt(p.r)}</button>`;
  });
  let h = `<div class="board">
    <div class="col">${left.join('')}</div>
    <svg class="strings" aria-hidden="true"></svg>
    <div class="col">${right.join('')}</div>
  </div>`;
  if (!locked) h += `<div class="row"><button class="btn" data-act="brgo" ${Object.keys(d.m).length===pairs.length?'':'disabled'}>${t('lockBtn')}</button></div>` + hintHtml(q);
  else {
    const n = pairs.filter((p,i)=>+m[i]===i).length;
    h += fb(true, `${t('score_of')} ${n} ${t('out_of')} ${pairs.length}`, '', qWhy(q));
  }
  return h;
}

function bMeter(q, r) {
  const locked = !!r;
  const moments = qMoments(q);
  const ends = qEnds(q);
  const d = D[q.id] = D[q.id] || { v: r ? r.v.slice() : moments.map(()=>50), t: r ? moments.map(()=>true) : moments.map(()=>false) };
  const items = moments.map((m, i) => {
    const inRange = locked ? (r.v[i] >= m.lo && r.v[i] <= m.hi) : null;
    const bw = ((m.hi - m.lo) / 100 * 100);
    const bLeft = (100 - m.hi) + '%'; const bRight = m.lo + '%';
    return `<div class="mt-i">
      <div class="lbl">${fmt(m.t)}</div>
      <div class="track">
        <div class="band" style="inset-inline-end:${bLeft};inset-inline-start:${bRight};width:${bw}%"></div>
        <input class="rng ${locked||d.t[i]?'':'untouched'}" type="range" min="0" max="100" value="${locked?r.v[i]:d.v[i]}" data-act="mt" data-i="${i}" ${locked?'disabled':''} aria-label="${esc(m.t)}">
      </div>
      <div class="ends">
        <span>${esc(ends[0])}</span>
        <span class="val" id="mv-${q.id}-${i}">${locked?r.v[i]:(d.t[i]?d.v[i]:'—')}</span>
        <span>${esc(ends[1])}</span>
      </div>
      ${locked ? `<div class="muted" style="font-size:.82rem">${inRange?'✓ '+t('range_ok'):'✗ '+m.lo+' – '+m.hi}</div>` : ''}
    </div>`;
  }).join('');
  let go = '';
  if (!locked) go = `<div class="row"><button class="btn" data-act="mtgo" ${d.t.every(Boolean)?'':'disabled'}>${t('lockBtn')}</button></div>` + hintHtml(q);
  else go = fb(true, `${t('score_of')} ${Math.round(r.pts * moments.length)} ${t('out_of')} ${moments.length} (${t('range_ok')})`, '', qWhy(q));
  return '<div class="mt">' + items + '</div>' + go;
}

function bDebate(q, r) {
  const editing = !r || EDIT[q.id];
  const ends = qEnds(q);
  const d = D[q.id] = D[q.id] || { v: r ? r.v : 50, t: !!r, why: r ? (r.why || '') : '' };
  const head = '<p class="debq">' + fmt(qTitle(q) || (LANG==='en'&&q.qEn?q.qEn:q.q)) + '</p>';
  if (editing) {
    return head +
      `<div class="track"><input class="rng deb${d.t?'':' untouched'}" type="range" min="0" max="100" value="${d.v}" data-act="dv" aria-label="${t('confirmBtn')}"></div>` +
      `<div class="ends"><span>${esc(ends[0])}</span><span class="val" id="dv-${q.id}">${d.t?d.v:'—'}</span><span>${esc(ends[1])}</span></div>` +
      `<div style="margin-top:14px"><textarea id="why-${q.id}" data-act="txt" dir="auto" placeholder="${t('debatePlaceholder')}">${esc(d.why)}</textarea></div>` +
      `<div class="row"><button class="btn" data-act="dvgo" ${d.t?'':'disabled'}>${t('confirmBtn')}</button></div>`;
  }
  return head +
    `<div class="track"><input class="rng deb" type="range" min="0" max="100" value="${r.v}" disabled aria-label="${t('confirmBtn')}"></div>` +
    `<div class="ends"><span>${esc(ends[0])}</span><span class="val">${r.v}</span><span>${esc(ends[1])}</span></div>` +
    (r.why ? `<div class="fb"><b>${t('yourReason')}</b> ${esc(r.why)}</div>` : '') +
    `<div class="sides"><div class="side"><h4>${t('proLabel')}</h4>${fmt(qPro(q))}</div><div class="side"><h4>${t('conLabel')}</h4>${fmt(qCon(q))}</div></div>` +
    `<div class="row"><button class="btn ghost" data-act="edit">${t('editBtn')}</button></div>`;
}

function bOpen(q, r) {
  const editing = !r || EDIT[q.id];
  const d = D[q.id] = D[q.id] || { text: r ? r.text : '' };
  if (editing) {
    return `<textarea id="txt-${q.id}" data-act="txt" dir="auto" style="min-height:120px" placeholder="${t('writePlaceholder')}">${esc(d.text)}</textarea>` +
      `<div class="row"><button class="btn" data-act="txtgo" ${d.text.trim()?'':'disabled'}>${t('saveBtn')}</button></div>` + hintHtml(q);
  }
  return `<div class="fb"><b>${t('yourAnswer')}</b><div style="margin-top:6px" dir="auto">${esc(r.text).replace(/\n/g,'<br>')}</div></div>` +
    `<div class="fb good"><b class="v">${t('modelAnswer')}</b><div class="model">${fmt(qModel(q))}</div></div>` +
    `<div class="row"><button class="btn ghost" data-act="edit">${t('editBtn')}</button></div>`;
}

const BODY = { forged:bForged, who:bWho, sort:bSort, board:bBoard, meter:bMeter, debate:bDebate, open:bOpen };

/* ============================================================
   BUILD QUEST
   ============================================================ */
function paintCard(id) {
  const q = QBY[id], el = $('#q-' + id); if (!el) return;
  const part = QUESTIONS.filter(x => x.part === q.part);
  const n = part.indexOf(q) + 1;
  const r = S.answers[id];
  const title = qTitle(q);
  const chTitle = LANG === 'ar' ? (CHAPTERS_AR[q.ch] || CHAPTERS[q.ch]) : CHAPTERS[q.ch];
  el.className = 'q' + (r ? ' done' : '');
  el.innerHTML = `<div class="q-h"><span class="q-n">${LANG==='en'?'Q':'س'}${n}</span>` +
    (q.ch ? `<span class="q-ch"><b>${q.ch}</b>${fmt(chTitle)}</span>` : '') +
    `<span>${typelbl(q.type)}</span></div>` +
    (title ? `<h3 class="q-t">${fmt(title)}</h3>` : '') +
    BODY[q.type](q, r);
  if (q.type === 'board') drawStrings(el);
}

function buildQuest() {
  const host = $('#parts');
  host.innerHTML = PARTS.map(p => {
    const qs = QUESTIONS.filter(q => q.part === p.id);
    const game  = LANG === 'en' ? (p.gameEn  || p.game)  : p.game;
    const title = LANG === 'en' ? (p.titleEn || p.title) : p.title;
    const sub   = LANG === 'en' ? (p.subEn   || p.sub)   : p.sub;
    return `<section class="part" id="p-${p.id}"><div class="part-h"><span class="game">${esc(game)}</span><h2>${esc(title)}</h2><p>${fmt(sub)}</p></div><div class="rail">` +
      qs.map(q => {
        let w = PART_WORLD[p.id]; if (w === null) w = WORLD_OF_CH[q.ch] || 0;
        return `<article class="q" id="q-${q.id}" data-q="${q.id}" data-world="${w}"></article>`;
      }).join('') + '</div></section>';
  }).join('');
  QUESTIONS.forEach(q => paintCard(q.id));
}

function drawStrings(card) {
  const b = $('.board', card); if (!b) return;
  const svg = $('.strings', b), q = QBY[card.dataset.q], rec = S.answers[q.id];
  const m = rec ? rec.m : ((D[q.id] && D[q.id].m) || {});
  const br = b.getBoundingClientRect();
  svg.setAttribute('viewBox', '0 0 ' + br.width + ' ' + br.height);
  let h = '';
  Object.keys(m).forEach(li => {
    const L = $('[data-act=bl][data-i="' + li + '"]', b), R = $('[data-act=br][data-r="' + m[li] + '"]', b);
    if (!L || !R) return;
    const a = L.getBoundingClientRect(), c = R.getBoundingClientRect();
    const flip = a.left > c.left;
    const x1 = (flip ? a.left : a.right) - br.left, y1 = a.top + a.height / 2 - br.top;
    const x2 = (flip ? c.right : c.left) - br.left, y2 = c.top + c.height / 2 - br.top;
    const mx = (x1 + x2) / 2;
    const wrong = rec && +m[li] !== +li;
    const col = rec ? (wrong ? '#ff7070' : '#6fe0a5') : PAL[li % PAL.length];
    h += `<path d="M${x1} ${y1} C ${mx} ${y1+18}, ${mx} ${y2+18}, ${x2} ${y2}" fill="none" stroke="${col}" stroke-width="2.8" stroke-linecap="round"${wrong?' stroke-dasharray="6 5"':''} filter="drop-shadow(0 0 3px ${col}88)"/>` +
         `<circle cx="${x1}" cy="${y1}" r="5" fill="${col}"/><circle cx="${x2}" cy="${y2}" r="5" fill="${col}"/>`;
  });
  svg.innerHTML = h;
}

/* ============================================================
   INTERACTIONS
   ============================================================ */
function commit(q) { persist(q.id); paintCard(q.id); updateChrome(); }

function onAct(q, b) {
  const a = b.dataset.act, id = q.id, i = +b.dataset.i;
  switch(a) {
    case 'hint': HINT[id] = true; paintCard(id); return;
    case 'forge': { const ok = i === q.fake; S.answers[id] = {i, ok, pts:ok?1:0, t:Date.now()}; commit(q); return; }
    case 'who':   { const ok = i === q.correct; S.answers[id] = {a:i, ok, pts:ok?1:0, t:Date.now()}; commit(q); return; }
    case 'srt':   { const d = D[id] = D[id]||{c:[]}; d.c[i] = +b.dataset.v; paintCard(id); return; }
    case 'srtgo': {
      const d = D[id]; let n=0; q.items.forEach((it,k)=>{ if(d.c[k]===it.a) n++; });
      S.answers[id] = {c:d.c.slice(), pts:n/q.items.length, t:Date.now()}; commit(q); return;
    }
    case 'bl': {
      const d = D[id] = D[id]||{sel:null, m:{}};
      if (d.m[i] !== undefined) { delete d.m[i]; d.sel = i; }
      else d.sel = d.sel === i ? null : i;
      paintCard(id); return;
    }
    case 'br': {
      const d = D[id] = D[id]||{sel:null, m:{}}; const r = +b.dataset.r;
      const owner = Object.keys(d.m).find(l=>+d.m[l]===r);
      if (d.sel !== null) { if(owner!==undefined) delete d.m[owner]; d.m[d.sel]=r; d.sel=null; }
      else if (owner !== undefined) { delete d.m[owner]; d.sel = +owner; }
      paintCard(id); return;
    }
    case 'brgo': {
      const d = D[id]; let n=0; q.pairs.forEach((p,k)=>{ if(+d.m[k]===k) n++; });
      S.answers[id] = {m:Object.assign({},d.m), pts:n/q.pairs.length, t:Date.now()}; commit(q); return;
    }
    case 'mtgo': {
      const d = D[id]; let n=0; q.moments.forEach((m,k)=>{ if(d.v[k]>=m.lo&&d.v[k]<=m.hi) n++; });
      S.answers[id] = {v:d.v.slice(), pts:n/q.moments.length, t:Date.now()}; commit(q); return;
    }
    case 'dvgo': { const d=D[id]; S.answers[id]={v:d.v, why:(d.why||'').trim(), t:Date.now()}; delete EDIT[id]; commit(q); return; }
    case 'txtgo': { const d=D[id]; S.answers[id]={text:d.text.trim(), t:Date.now()}; delete EDIT[id]; commit(q); return; }
    case 'edit': {
      const r=S.answers[id]; EDIT[id]=true;
      D[id] = q.type==='debate' ? {v:r.v, t:true, why:r.why||''} : {text:r.text};
      paintCard(id); return;
    }
  }
}

function onInput(q, inp) {
  const id = q.id, a = inp.dataset.act, card = $('#q-' + id);
  if (a === 'mt') {
    const i = +inp.dataset.i, d = D[id];
    d.v[i] = +inp.value; d.t[i] = true; inp.classList.remove('untouched');
    const span = $(`#mv-${id}-${i}`); if(span) span.textContent = inp.value;
    const go = $('[data-act=mtgo]', card); if(go) go.disabled = !d.t.every(Boolean);
  } else if (a === 'dv') {
    const d = D[id]; d.v = +inp.value; d.t = true; inp.classList.remove('untouched');
    const span = $(`#dv-${id}`); if(span) span.textContent = inp.value;
    const go = $('[data-act=dvgo]', card); if(go) go.disabled = false;
  } else if (a === 'txt') {
    const d = D[id];
    if (q.type === 'debate') d.why = inp.value;
    else { d.text = inp.value; const go = $('[data-act=txtgo]', card); if(go) go.disabled = !inp.value.trim(); }
  }
}

/* ============================================================
   CHROME (header, progress, final)
   ============================================================ */
function updateChrome() {
  const sc = score(S.answers);
  $('#pb').style.width = Math.round(sc.done / QUESTIONS.length * 100) + '%';
  const f = $('#final');
  const sd = scoredDone(S.answers);
  if (sc.done >= QUESTIONS.length) {
    const pct = sc.pts / MAX;
    f.innerHTML = `<h3>${t('finalDone')}</h3><div class="score">${Math.round(sc.pts*10)/10} / ${MAX}</div><div class="rank">${LANG==='en'?'Rank:':'رتبتك:'} ${fmt(rankOf(pct))}</div>` +
      `<button class="btn" data-go="room" style="margin-top:16px">${t('finalGo')}</button>`;
  } else {
    f.innerHTML = `<h3>${t('finalRemain')}</h3><p class="muted" style="margin:6px 0 0">${t('finalLeft')} ${QUESTIONS.length - sc.done} ${t('finalOf')} ${QUESTIONS.length}. (${sd} ${t('finalOf')} ${MAX} ${t('finalAnswered')})</p>`;
  }
  const showKey = S.owner || location.hash === '#key';
  $('#tab-key').hidden = !showKey;
  // update i18n labels
  applyI18n();
}

function applyI18n() {
  const el = id => document.getElementById(id);
  const setTxt = (id, key) => { const e = el(id); if(e) e.textContent = t(key); };
  setTxt('tab-quest', 'tabQuest');
  setTxt('tab-room',  'tabRoom');
  setTxt('tab-key',   'tabKey');
  setTxt('meter-civ', 'meterCiv');
  setTxt('meter-wild','meterWild');
  setTxt('startbtn',  'startBtn');
  setTxt('resetbtn',  'resetBtn');
  setTxt('lang-btn',  'langToggle');
  setTxt('theme-btn', document.documentElement.dataset.theme==='light' ? 'themeDark' : 'themeLight');
  const brand = el('brand-el'); if(brand) brand.textContent = t('brand');
  const kicker = el('kicker-el'); if(kicker) kicker.textContent = t('kicker');
  const lead = el('lead-el'); if(lead) lead.textContent = t('heroPara');
  const heroH1 = el('hero-h1'); if(heroH1) heroH1.textContent = t('heroTitle');
  const heroSub = el('hero-sub'); if(heroSub) heroSub.textContent = t('heroSub');
  const gateTitle = el('gate-h'); if(gateTitle) gateTitle.textContent = t('gateTitle');
  const gateSub = el('gate-sub'); if(gateSub) gateSub.textContent = t('gateSub');
  const gateInp = el('nameinp'); if(gateInp) gateInp.placeholder = t('gatePlaceholder');
  const gatebtn = el('gatebtn'); if(gatebtn) gatebtn.textContent = t('gateSubmit');
  const dlPdf = el('dl-pdf'); if(dlPdf) dlPdf.textContent = t('downloadPDF');
  const watchVid = el('watch-vid'); if(watchVid) watchVid.textContent = t('watchTrailer');
  const wmCiv = el('wm-civ'); if(wmCiv) wmCiv.textContent = t('meterCiv');
  const wmWild = el('wm-wild'); if(wmWild) wmWild.textContent = t('meterWild');
  const roomSub = el('room-sub'); if(roomSub) roomSub.textContent = t('roomSub');
  const keySub = el('key-sub'); if(keySub) keySub.textContent = t('keySub');
}

function setTab(tab) {
  S.tab = tab;
  ['quest','room','key'].forEach(k => {
    $('#' + k).hidden = k !== tab;
    $('#tab-' + k).setAttribute('aria-selected', k === tab ? 'true' : 'false');
  });
  window.scrollTo(0,0);
  if (tab==='room') renderRoom();
  if (tab==='key')  renderKey();
  if (tab==='quest') { setTimeout(()=>$$('.q').forEach(c=>{ if(c.dataset.q&&QBY[c.dataset.q].type==='board') drawStrings(c); }), 50); }
}

/* ============================================================
   DISCUSSION ROOM
   ============================================================ */
function canSee(qid) { return S.owner || !!S.answers[qid]; }
function pName(p)    { return esc(p.name || (LANG==='en'?'Anonymous':'بدون اسم')) + (S.uid && p.id===S.uid ? ' '+t('you') : ''); }
function qLabel(q) {
  if (q.type==='forged') return (LANG==='en'?'Summary Ch. ':'ملخص فصل ') + q.ch;
  if (q.type==='who')    return (LANG==='en'?'Who said: ':'مين قال: ') + q.quote.slice(0,38) + '…';
  return q.q.length > 60 ? q.q.slice(0,58)+'…' : q.q;
}
function ansHtml(q, r) {
  if (!r) return `<span class="muted">${t('notAnswered')}</span>`;
  switch(q.type) {
    case 'forged': return fmt(q.sents[r.i]);
    case 'who':    return fmt(q.opts[r.a]);
    case 'sort':   return q.items.map((it,i)=>`<div>${fmt(it.t)} ← <b>${esc(q.labels[r.c[i]]||'—')}</b> ${r.c[i]===it.a?'<span class="mk g">✓</span>':'<span class="mk b">✗</span>'}</div>`).join('');
    case 'board':  return q.pairs.map((p,i)=>`<div>${fmt(p.l)} ← ${r.m[i]!==undefined?fmt(q.pairs[r.m[i]].r):'—'} ${+r.m[i]===i?'<span class="mk g">✓</span>':'<span class="mk b">✗</span>'}</div>`).join('');
    case 'meter':  return q.moments.map((m,i)=>`<div>${fmt(m.t)}: <b>${r.v[i]}</b> ${r.v[i]>=m.lo&&r.v[i]<=m.hi?'<span class="mk g">✓</span>':'<span class="mk b">✗</span>'}</div>`).join('');
    case 'debate': return `<b>${r.v}</b> / 100${r.why?`<div dir="auto">${esc(r.why)}</div>`:''}`;
    case 'open':   return `<div dir="auto">${esc(r.text).replace(/\n/g,'<br>')}</div>`;
  }
  return '';
}
function markOf(q, r) {
  if (!r) return '<span class="mk n">—</span>';
  if (!SCORED.has(q.type)) return `<span class="mk n">${t('answered')}</span>`;
  const full = r.pts===1;
  return `<span class="mk ${full?'g':'b'}">${full?'✓':(r.pts>0?Math.round(r.pts*100)+'%':'✗')}</span>`;
}

function renderRoom() {
  const list = $('#plist'), cmp = $('#cmp');
  const ps = S.players.slice().sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
  S.sel = S.sel.filter(id => ps.some(p=>p.id===id));
  if (!DB) {
    list.innerHTML = `<div class="empty">${t('noDb')}</div>`; cmp.innerHTML=''; return;
  }
  if (!ps.length) {
    list.innerHTML = `<div class="empty">${t('noPlayers')}</div>`; cmp.innerHTML=''; return;
  }
  list.innerHTML = ps.map(p => {
    const si = S.sel.indexOf(p.id), col = si>=0 ? PCOL[si] : '';
    const done = p.done||0, tot = p.total||QUESTIONS.length;
    return `<div class="pl${si>=0?' sel':''}" style="${col?'--c:'+col:''}"><button class="plbtn" data-pick="${esc(p.id)}"><span class="nm"><span>${pName(p)}</span><i></i></span>` +
      `<span class="mini"><b style="width:${Math.round(done/tot*100)}%"></b></span>` +
      `<span class="st"><span>${done} / ${tot} ${t('answered')}</span><span>${t('score')}: ${Math.round((p.score||0)*10)/10} / ${p.max||MAX}</span><span>${ago(p.updatedAt)}</span></span></button>` +
      (S.owner ? `<button class="delbtn" data-del="${esc(p.id)}">${S.delId===p.id?t('deleteConfirm'):t('deletePlayer')}</button>` : '') + '</div>';
  }).join('');
  if (S.mode !== 'cloud') list.insertAdjacentHTML('afterbegin', `<div class="empty" style="padding:10px;font-size:.85rem">${t('notSaved')}</div>`);

  const sel = S.sel.map(id => ps.find(p=>p.id===id));
  if (!sel.length) { cmp.innerHTML=`<div class="empty">${t('pickTwo')}</div>`; return; }
  const names = sel.map((p,i)=>`<b style="color:${PCOL[i]}">${pName(p)}</b>`).join(' & ');
  let html = '';

  const debs = QUESTIONS.filter(q=>q.type==='debate').map(q=>{
    const recs = sel.map(p=>p.answers&&p.answers[q.id]);
    return { q, recs, gap: recs.filter(Boolean).length===2 ? Math.abs(recs[0].v-recs[1].v) : -1 };
  }).sort((a,b)=>b.gap-a.gap);

  html += `<div class="panel"><h3>${t('debatePanel')}</h3>` +
    (sel.length===2?`<p class="muted" style="margin:-6px 0 10px">${t('debateSorted')}</p>`:'') +
    debs.map(o => {
      const q=o.q;
      if (!canSee(q.id)) return `<div class="spec"><div class="stmt">${fmt(q.q)}</div><div class="muted">${t('answerFirst')}</div></div>`;
      const dots = o.recs.map((r,i)=>r?`<div class="dot" style="--c:${PCOL[i]};inset-inline-start:${r.v}%"><span>${r.v}</span></div>`:'').join('');
      const rs = o.recs.map((r,i)=>r?`<div class="reason" style="--c:${PCOL[i]}"><b>${pName(sel[i])}:</b> <span dir="auto">${r.why?esc(r.why):`<span class="muted">${t('withoutReason')}</span>`}</span></div>`:`<div class="reason" style="--c:${PCOL[i]}"><b>${pName(sel[i])}:</b> <span class="muted">${t('notAnswered')}</span></div>`).join('');
      return `<div class="spec"><div class="stmt">${fmt(q.q)}${o.gap>=0?` <span class="gap">${t('gap')} ${o.gap}</span>`:''}</div><div class="ends"><span>${esc(q.ends[0])}</span><span>${esc(q.ends[1])}</span></div><div class="tr">${dots}</div><div class="reasons">${rs}</div></div>`;
    }).join('') + '</div>';

  html += `<div class="panel"><h3>${t('scoredPanel')}</h3><div class="cmp">` +
    QUESTIONS.filter(q=>SCORED.has(q.type)).map(q=>{
      const recs = sel.map(p=>p.answers&&p.answers[q.id]);
      if (!canSee(q.id)) return `<details class="cr"><summary><span>${fmt(qLabel(q))}</span><span class="muted">${t('answerFirst')}</span></summary></details>`;
      return `<details class="cr"><summary><span>${fmt(qLabel(q))}</span><span>${recs.map((r,i)=>`<span style="color:${PCOL[i]}">${markOf(q,r)}</span>`).join(' ')}</span></summary><div class="cells">${recs.map((r,i)=>`<div class="cell" style="--c:${PCOL[i]}"><b>${pName(sel[i])}</b><div style="margin-top:6px">${ansHtml(q,r)}</div></div>`).join('')}</div></details>`;
    }).join('') + '</div></div>';

  html += `<div class="panel"><h3>${t('openPanel')}</h3><div class="cmp">` +
    QUESTIONS.filter(q=>q.type==='open').map(q=>{
      if (!canSee(q.id)) return `<details class="cr"><summary><span>${fmt(qLabel(q))}</span><span class="muted">${t('answerFirst')}</span></summary></details>`;
      return `<details class="cr" open><summary><span>${fmt(qLabel(q))}</span></summary><div class="cells">${sel.map((p,i)=>`<div class="cell" style="--c:${PCOL[i]}"><b>${pName(p)}</b><div style="margin-top:6px">${ansHtml(q,p.answers&&p.answers[q.id])}</div></div>`).join('')}</div></details>`;
    }).join('') + '</div></div>';

  cmp.innerHTML = `<p style="margin:0 0 14px">${t('comparing')} ${names}</p>` + html;
}

/* ============================================================
   ANSWER KEY
   ============================================================ */
function keyAnswer(q) {
  switch(q.type) {
    case 'forged': return (LANG==='en'?'Forged sentence: «':'الجملة المزوّرة: «') + qSents(q)[q.fake] + '»\n' + (LANG==='en'?'Truth: ':'الصح: ') + qTruth(q);
    case 'who':    return (LANG==='en'?'Speaker: ':'القائل: ') + qOpts(q)[q.correct];
    case 'sort':   return qItems(q).map(it=>'• '+it.t+' ← '+qLabels(q)[it.a]).join('\n');
    case 'board':  return qPairs(q).map(p=>'• '+p.l+' ← '+p.r).join('\n');
    case 'meter':  return qMoments(q).map(m=>'• '+m.t+': '+m.lo+' – '+m.hi).join('\n');
    case 'debate': return (LANG==='en'?'If agree: ':'لو موافق: ')+qPro(q)+'\n'+(LANG==='en'?'If disagree: ':'لو معارض: ')+qCon(q);
    case 'open':   return qModel(q);
  }
  return '';
}
function renderKey() {
  const chKey = (LANG === 'en' && typeof CHAPTER_KEY_EN !== 'undefined') ? CHAPTER_KEY_EN : CHAPTER_KEY;
  let h = `<div class="panel"><h3>${t('keyChapters')}</h3>` +
    Object.keys(chKey).map(k=>{
      const ct = LANG === 'ar' ? (CHAPTERS_AR[k] || CHAPTERS[k]) : CHAPTERS[k];
      return `<div class="kq"><div class="t"><b style="font-family:var(--f-en);color:var(--ember)">${k}</b> ${fmt(ct)}</div><div class="w">${fmt(chKey[k])}</div></div>`;
    }).join('') + '</div>';
  PARTS.forEach(p => {
    const ptitle = LANG==='en'?(p.titleEn||p.title):p.title;
    h += `<div class="panel"><h3>${esc(ptitle)}</h3>` + QUESTIONS.filter(q=>q.part===p.id).map(q=>{
      const tt = q.type==='debate' ? (LANG==='en'&&q.qEn?q.qEn:q.q) : (q.type==='who' ? '«'+q.quote+'»' : (q.type==='forged' ? qSents(q).join(' ') : (LANG==='en'&&q.qEn?q.qEn:q.q)));
      return `<div class="kq"><div class="t" ${q.type==='who'?'dir="auto"':''}>${q.type==='who'?esc(tt):fmt(tt)}</div><div class="a">${fmt(keyAnswer(q))}</div>${qWhy(q)?`<div class="w">${fmt(qWhy(q))}</div>`:''}</div>`;
    }).join('') + '</div>';
  });
  $('#keybody').innerHTML = h;
}

/* ============================================================
   GATE
   ============================================================ */
async function showGate() {
  const g = $('#gate'), inp = $('#nameinp');
  let pre = S.name;
  if (!pre && USER) { try { const me = await USER.me(); pre = me.name||''; } catch(e) {} }
  inp.value = pre || '';
  $('#gatenote').textContent = DB && S.uid ? t('gateNoteCloud') : t('gateNoteLocal');
  g.hidden = false; setTimeout(()=>inp.focus(), 50);
}
$('#gateform').addEventListener('submit', async e => {
  e.preventDefault();
  const v = $('#nameinp').value.trim(); if(!v) return;
  S.name = v; saveLocal(); $('#gate').hidden = true;
  if (ref) await ensureDoc(); else setSync();
  updateChrome();
});

/* ============================================================
   RESET
   ============================================================ */
let resetArmed = false;
$('#resetbtn').addEventListener('click', async e => {
  const b = e.currentTarget;
  if (!resetArmed) { resetArmed=true; b.textContent=t('resetConfirm'); setTimeout(()=>{ resetArmed=false; b.textContent=t('resetBtn'); },4000); return; }
  resetArmed=false; b.textContent=t('resetBtn');
  S.answers={}; Object.keys(D).forEach(k=>delete D[k]); Object.keys(EDIT).forEach(k=>delete EDIT[k]); Object.keys(HINT).forEach(k=>delete HINT[k]);
  saveLocal();
  if (ref && S.mode==='cloud') { try { await ref.set(fullDoc()); } catch(er) { failCloud(er); } }
  QUESTIONS.forEach(q=>paintCard(q.id)); updateChrome(); window.scrollTo(0,0);
});

/* ============================================================
   LANGUAGE & THEME TOGGLES
   ============================================================ */
document.getElementById('lang-btn').addEventListener('click', () => {
  setLang(LANG === 'ar' ? 'en' : 'ar');
  document.documentElement.dataset.lang = LANG;
  document.documentElement.dir = I18N[LANG].dir;
  // Rebuild the entire quest content (direction/text changes)
  buildQuest(); initTrail();
  renderRoom(); renderKey();
  updateChrome();
});

document.getElementById('theme-btn').addEventListener('click', () => {
  const isLight = document.documentElement.dataset.theme === 'light';
  document.documentElement.dataset.theme = isLight ? 'dark' : 'light';
  localStorage.setItem('cotw-theme', document.documentElement.dataset.theme);
  updateChrome();
});

/* ============================================================
   EVENTS
   ============================================================ */
$('#parts').addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if(!b) return;
  const card = b.closest('.q'); if(!card) return;
  onAct(QBY[card.dataset.q], b);
});
$('#parts').addEventListener('input', e => {
  const card = e.target.closest('.q'); if(!card||!e.target.dataset.act) return;
  onInput(QBY[card.dataset.q], e.target);
});
$$('.tab').forEach(t => t.addEventListener('click', () => setTab(t.dataset.tab)));
document.addEventListener('click', e => {
  const go = e.target.closest('[data-go]'); if(go) { setTab(go.dataset.go); return; }
  const pk = e.target.closest('[data-pick]');
  if (pk) {
    const id=pk.dataset.pick, i=S.sel.indexOf(id);
    if(i>=0) S.sel.splice(i,1); else { S.sel.push(id); if(S.sel.length>2) S.sel.shift(); }
    renderRoom(); return;
  }
  const dl = e.target.closest('[data-del]');
  if (dl) {
    const id=dl.dataset.del;
    if(S.delId!==id) { S.delId=id; renderRoom(); return; }
    S.delId=null;
    if(DB) DB.doc('players/'+id).delete().catch(()=>{});
    return;
  }
});
$('#startbtn').addEventListener('click', e => { e.preventDefault(); $('#p-sum').scrollIntoView({behavior:'smooth'}); });
window.addEventListener('hashchange', updateChrome);
let rz; window.addEventListener('resize', () => {
  clearTimeout(rz); rz = setTimeout(()=>$$('.q').forEach(c=>{if(c.dataset.q&&QBY[c.dataset.q].type==='board') drawStrings(c);}), 120);
});
if (document.fonts?.ready) document.fonts.ready.then(()=>$$('.q').forEach(c=>{if(c.dataset.q&&QBY[c.dataset.q].type==='board') drawStrings(c);}));

/* ============================================================
   WORLDS
   ============================================================ */
const WM = [4, 34, 64, 94];
function setWorld(w) { $('#worlds').dataset.w = w; $('#wm').style.insetInlineStart = WM[w]+'%'; window.__w = w; }
function initWorlds() {
  const io = new IntersectionObserver(es => {
    es.forEach(en => { if(en.isIntersecting) setWorld(en.target.classList.contains('hero') ? 0 : +en.target.dataset.world); });
  }, { rootMargin:'-45% 0px -50% 0px' });
  io.observe($('.hero'));
  $$('.q[data-world]').forEach(q => io.observe(q));
  setWorld(0);
}

/* ============================================================
   DECOR — trail chips + pine SVG + wolf eyes
   ============================================================ */
function initTrail() {
  $('#trail').innerHTML = Object.keys(CHAPTERS).map(k=>{
    const title = LANG === 'ar' ? (CHAPTERS_AR[k] || CHAPTERS[k]) : CHAPTERS[k];
    return `<span><b>${k}</b>${fmt(title)}</span>`;
  }).join('');
}

function initPines() {
  const forest = document.getElementById('forest');
  const wolf = document.getElementById('wolf-lurker');
  const eyes = $$('.eye');

  // Living interactive wind simulation
  let lastX = 0, lastTime = performance.now();
  let currentLean = 0, targetLean = 0;

  const move = e => {
    const p = e.touches ? e.touches[0] : e;
    const now = performance.now();
    const dt = Math.max(16, now - lastTime);
    const vx = (p.clientX - lastX) / (dt / 16);
    lastX = p.clientX;
    lastTime = now;

    // Gust response: trees lean in direction of cursor movement
    if (Math.abs(vx) > 0.5) {
      targetLean = Math.max(-2.4, Math.min(2.4, targetLean + vx * 0.05));
    }

    // Wolf eyes track pointer / cursor
    eyes.forEach(el => {
      const r = el.getBoundingClientRect();
      const dx = p.clientX - (r.left + r.width / 2);
      const dy = p.clientY - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / 220);
      el.style.setProperty('--ex', (dx / d * 2.8 * k).toFixed(1) + 'px');
      el.style.setProperty('--ey', (dy / d * 1.8 * k).toFixed(1) + 'px');
    });
  };

  // Continuous spring physics loop for living trees
  function windTick() {
    currentLean += (targetLean - currentLean) * 0.075;
    targetLean *= 0.95; // gentle damping back to zero
    if (forest && Math.abs(currentLean) > 0.01) {
      forest.style.setProperty('--tree-lean', currentLean.toFixed(3) + 'deg');
    }
    requestAnimationFrame(windTick);
  }
  requestAnimationFrame(windTick);

  // Wolf click reaction
  if (wolf) {
    wolf.addEventListener('click', () => {
      wolf.classList.add('wolf-alert');
      targetLean = (Math.random() > 0.5 ? 1 : -1) * 2.2; // gust ripple
      setTimeout(() => wolf.classList.remove('wolf-alert'), 1200);
    });
  }

  window.addEventListener('pointermove', move, { passive: true });
}

/* ============================================================
   STAR FIELD CANVAS
   ============================================================ */
function initStars() {
  const cv = document.getElementById('stars');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  let W=0, H=0;
  const stars = Array.from({length:200}, () => ({
    x: Math.random(), y: Math.random(),
    r: Math.random() * 1.5 + .3,
    a: Math.random(), sp: .003 + Math.random()*.004
  }));
  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W; cv.height = H;
  }
  resize();
  window.addEventListener('resize', resize);
  let t = 0;
  (function tick() {
    const w = window.__w || 0;
    ctx.clearRect(0,0,W,H);
    if (w >= 2) {
      stars.forEach(s => {
        s.a += s.sp;
        const alpha = (.4 + Math.sin(s.a) * .3) * (w === 3 ? .9 : .7);
        ctx.beginPath();
        ctx.arc(s.x*W, s.y*H*.85, s.r, 0, 6.283);
        ctx.fillStyle = `rgba(240,245,255,${alpha.toFixed(2)})`;
        ctx.fill();
      });
    }
    requestAnimationFrame(tick);
  })();
}

/* ============================================================
   SNOW / PARTICLE CANVAS
   ============================================================ */
function initSnow() {
  const cv = $('#snow'), cx = cv.getContext('2d'); if(!cx) return;
  let W=0, H=0; const P=[];
  const dpr = Math.min(window.devicePixelRatio||1, 2);
  function rs() { W=window.innerWidth; H=window.innerHeight; cv.width=W*dpr; cv.height=H*dpr; cv.style.width=W+'px'; cv.style.height=H+'px'; cx.setTransform(dpr,0,0,dpr,0,0); }
  rs(); window.addEventListener('resize', rs);
  for (let i=0; i<120; i++) P.push({ x:Math.random()*1000, y:Math.random(), r:.6+Math.random()*2, v:.2+Math.random()*.8, s:Math.random()*6.28 });
  if (window.matchMedia?.('(prefers-reduced-motion:reduce)').matches) return;
  (function tick() {
    cx.clearRect(0,0,W,H);
    const w = window.__w||0;
    const isDark = document.documentElement.dataset.theme !== 'light';
    cx.fillStyle = w===0 ? (isDark?'rgba(255,214,150,.55)':'rgba(200,140,40,.35)') : (isDark?'rgba(235,245,255,.8)':'rgba(180,210,240,.5)');
    const sp = w===0 ? .3 : 1+w*.22;
    P.forEach(p => {
      p.y += p.v*sp/H*1.6; p.s += .01;
      if (p.y>1) { p.y=-.02; p.x=Math.random()*W; }
      const x = (p.x%W) + Math.sin(p.s)*14;
      cx.beginPath(); cx.arc(x, p.y*H, p.r*(w===0?.65:1), 0, 6.283); cx.fill();
    });
    requestAnimationFrame(tick);
  })(0);
}

/* ============================================================
   BOOT
   ============================================================ */
async function boot() {
  // Apply saved theme
  const savedTheme = localStorage.getItem('cotw-theme') || 'dark';
  document.documentElement.dataset.theme = savedTheme;

  // Apply saved language
  setLang(LANG);
  document.documentElement.dataset.lang = LANG;
  document.documentElement.dir = I18N[LANG].dir;

  loadLocal();
  initTrail(); initPines(); buildQuest(); initWorlds(); initSnow(); initStars(); initCursor(); updateChrome();

  if (!S.name) $('#gate').hidden = true;
  await initCaps();
  if (DB && S.uid) {
    ref = DB.doc('players/' + S.uid);
    try {
      const snap = await ref.get();
      if (snap.exists) {
        const d = snap.data()||{};
        if (d.name) S.name = d.name;
        S.answers = Object.assign({}, S.answers, d.answers||{});
        S.mode='cloud'; S.why='';
        saveLocal();
        QUESTIONS.forEach(q=>paintCard(q.id));
      }
    } catch(e) {}
    subscribePlayers();
    if (S.name && S.mode!=='cloud') await ensureDoc();
  } else if (DB) { S.why='nodb'; subscribePlayers(); }
  else S.why='nodb';
  setSync(); updateChrome();
  if (!S.name) showGate();
}
boot();
})();

/* ============================================================
   DYNAMIC EVOLVING WOLF BEAST CURSOR
   From civilized dog paw to ferocious wolf predator
   ============================================================ */
const CURSOR_SVGS = [
  // Stage 0: Gentle, civilized dog paw (Judge Miller's house pet in California)
  `<path fill="#ffb84d" d="M22,23 C17,23 14,27 15,32 C16,36 19,38 22,38 C25,38 28,36 29,32 C30,27 27,23 22,23 Z"/>
   <circle fill="#ffaa33" cx="13" cy="20" r="4.2"/>
   <circle fill="#ffaa33" cx="18" cy="14" r="4.2"/>
   <circle fill="#ffaa33" cx="26" cy="14" r="4.2"/>
   <circle fill="#ffaa33" cx="31" cy="20" r="4.2"/>`,

  // Stage 1: Sled dog paw with emerging claws and frosty aura (The Trail)
  `<path fill="#e2f2ff" stroke="#7ec4f8" stroke-width="0.8" d="M22,22 C17,22 13.5,26.5 14.5,32 C15.5,36.5 18.5,38.5 22,38.5 C25.5,38.5 28.5,36.5 29.5,32 C30.5,26.5 27,22 22,22 Z"/>
   <path fill="#7ec4f8" d="M11,13 Q12,18 13.5,20 Q10.5,20 11,13 Z"/>
   <path fill="#7ec4f8" d="M17,6 Q17.5,12 18,14 Q15.5,14 17,6 Z"/>
   <path fill="#7ec4f8" d="M27,6 Q26.5,12 26,14 Q28.5,14 27,6 Z"/>
   <path fill="#7ec4f8" d="M33,13 Q32,18 30.5,20 Q33.5,20 33,13 Z"/>
   <circle fill="#cce8ff" cx="13" cy="20" r="4"/>
   <circle fill="#cce8ff" cx="18" cy="14" r="4"/>
   <circle fill="#cce8ff" cx="26" cy="14" r="4"/>
   <circle fill="#cce8ff" cx="31" cy="20" r="4"/>`,

  // Stage 2: Beast claw with curved razor talons & aurora energy (The Primordial Beast)
  `<path fill="#1a3d35" stroke="#3be3c0" stroke-width="1.2" d="M22,21 C16,21 12,26 13.5,32.5 C15,37.5 18,39.5 22,39.5 C26,39.5 29,37.5 30.5,32.5 C32,26 28,21 22,21 Z"/>
   <path fill="#3be3c0" d="M8,10 Q10,18 12.5,20.5 Q9,19 8,10 Z"/>
   <path fill="#3be3c0" d="M15,3 Q16.5,11 17.5,14.5 Q14,13 15,3 Z"/>
   <path fill="#3be3c0" d="M29,3 Q27.5,11 26.5,14.5 Q30,13 29,3 Z"/>
   <path fill="#3be3c0" d="M36,10 Q34,18 31.5,20.5 Q35,19 36,10 Z"/>
   <ellipse fill="#3be3c0" cx="12.5" cy="20.5" rx="3.8" ry="4.5" transform="rotate(-15 12.5 20.5)"/>
   <ellipse fill="#3be3c0" cx="17.5" cy="14.5" rx="3.8" ry="4.5" transform="rotate(-5 17.5 14.5)"/>
   <ellipse fill="#3be3c0" cx="26.5" cy="14.5" rx="3.8" ry="4.5" transform="rotate(5 26.5 14.5)"/>
   <ellipse fill="#3be3c0" cx="31.5" cy="20.5" rx="3.8" ry="4.5" transform="rotate(15 31.5 20.5)"/>`,

  // Stage 3: Apex Wolf Claw — Ghost Dog (Pack Leader)
  `<path fill="#160804" stroke="#ff5500" stroke-width="1.5" d="M22,20 C15,20 11,25.5 12.5,33 C14,38.5 17.5,41 22,41 C26.5,41 30,38.5 31.5,33 C33,25.5 29,20 22,20 Z"/>
   <path fill="#ff5500" stroke="#ffe066" stroke-width="0.6" d="M6,7 Q9,17 12,20 Q7.5,18 6,7 Z"/>
   <path fill="#ff5500" stroke="#ffe066" stroke-width="0.6" d="M14,0.5 Q16,10 17,14 Q13,12 14,0.5 Z"/>
   <path fill="#ff5500" stroke="#ffe066" stroke-width="0.6" d="M30,0.5 Q28,10 27,14 Q31,12 30,0.5 Z"/>
   <path fill="#ff5500" stroke="#ffe066" stroke-width="0.6" d="M38,7 Q35,17 32,20 Q36.5,18 38,7 Z"/>
   <ellipse fill="#ff8c1a" cx="12" cy="20" rx="4" ry="4.8" transform="rotate(-18 12 20)"/>
   <ellipse fill="#ff8c1a" cx="17" cy="14" rx="4" ry="4.8" transform="rotate(-6 17 14)"/>
   <ellipse fill="#ff8c1a" cx="27" cy="14" rx="4" ry="4.8" transform="rotate(6 27 14)"/>
   <ellipse fill="#ff8c1a" cx="32" cy="20" rx="4" ry="4.8" transform="rotate(18 32 20)"/>
   <circle fill="#ffe066" cx="22" cy="29" r="3.2"/>`
];

const CURSOR_GLOWS = [
  'rgba(255, 170, 68, 0.45)', // Stage 0: warm golden amber
  'rgba(140, 210, 255, 0.55)', // Stage 1: cold ice blue
  'rgba(59, 227, 192, 0.65)',  // Stage 2: aurora emerald
  'rgba(255, 85, 0, 0.75)'     // Stage 3: ferocious beast ember
];

function initCursor() {
  if (window.matchMedia('(hover: none) or (pointer: coarse)').matches) return;
  
  let tracker = document.getElementById('cursor-tracker');
  if (!tracker) {
    tracker = document.createElement('div');
    tracker.id = 'cursor-tracker';
    tracker.setAttribute('aria-hidden', 'true');
    tracker.innerHTML = '<div class="cursor-glow"></div><svg class="cursor-svg" viewBox="0 0 44 44"></svg>';
    document.body.appendChild(tracker);
  }

  const svgEl = tracker.querySelector('.cursor-svg');
  const glowEl = tracker.querySelector('.cursor-glow');
  let currentStage = -1;

  function getFerocityStage() {
    const w = window.__w || 0;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPct = docH > 0 ? (window.scrollY / docH) : 0;
    
    if (w === 3 || scrollPct > 0.72) return 3;
    if (w === 2 || scrollPct > 0.42) return 2;
    if (w === 1 || scrollPct > 0.16) return 1;
    return 0;
  }

  function setStage(stage) {
    if (stage === currentStage) return;
    currentStage = stage;
    svgEl.innerHTML = CURSOR_SVGS[stage];
    glowEl.style.setProperty('--cursor-glow', CURSOR_GLOWS[stage]);
    tracker.className = `stage-${stage}`;
  }

  let isCursorVisible = false;

  function onPointerMove(e) {
    if (!isCursorVisible) {
      isCursorVisible = true;
      document.documentElement.classList.add('custom-cursor-active');
      tracker.style.opacity = '1';
    }
    // Direct 1:1 hardware tracking with zero lag/delay
    tracker.style.transform = `translate3d(${e.clientX - 22}px, ${e.clientY - 22}px, 0)`;
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true });

  window.addEventListener('pointerenter', e => {
    isCursorVisible = true;
    document.documentElement.classList.add('custom-cursor-active');
    tracker.style.transform = `translate3d(${e.clientX - 22}px, ${e.clientY - 22}px, 0)`;
    tracker.style.opacity = '1';
  });

  window.addEventListener('pointerleave', () => {
    tracker.style.opacity = '0';
  });

  // Calculate ferocity stage on scroll, throttled
  let scrollThrottle = null;
  window.addEventListener('scroll', () => {
    if (!scrollThrottle) {
      scrollThrottle = setTimeout(() => {
        setStage(getFerocityStage());
        scrollThrottle = null;
      }, 60);
    }
  }, { passive: true });

  const interactiveSelector = 'button, a, input, textarea, summary, label, .opt, .sent, .node, .rng, .tab, .delbtn, .plbtn, .chip, .wolf-lurker, [role="button"], .trail span, .action-btn, .btn';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(interactiveSelector)) tracker.classList.add('hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(interactiveSelector)) tracker.classList.remove('hover');
  });

  // Block native text selection & drag-ghosts across the site (keep inputs functional)
  document.addEventListener('selectstart', e => {
    if (!e.target.closest('input, textarea')) {
      e.preventDefault();
    }
  });
  document.addEventListener('dragstart', e => {
    if (e.target.tagName === 'IMG' || !e.target.closest('input, textarea')) {
      e.preventDefault();
    }
  });

  document.addEventListener('mousedown', e => {
    tracker.classList.add('active');
    createClawSlash(e.clientX, e.clientY, currentStage);
  });
  document.addEventListener('mouseup', () => {
    tracker.classList.remove('active');
  });

  function createClawSlash(x, y, stage) {
    const slash = document.createElement('div');
    slash.className = 'cursor-slash-mark';
    slash.style.left = x + 'px';
    slash.style.top = y + 'px';
    const rot = -35 + Math.random() * 20;
    slash.style.setProperty('--rot', rot + 'deg');
    
    const color = stage === 3 ? '#ff4400' : (stage === 2 ? '#3be3c0' : (stage === 1 ? '#9fdcff' : '#ffaa33'));
    slash.innerHTML = `<svg viewBox="0 0 40 40" width="40" height="40" fill="none" stroke="${color}" stroke-linecap="round">
      <path d="M8,4 Q14,20 18,36" stroke-width="${1.5 + stage * 0.5}" opacity="0.9"/>
      <path d="M16,2 Q22,18 26,38" stroke-width="${2 + stage * 0.5}"/>
      <path d="M24,5 Q30,21 34,35" stroke-width="${1.5 + stage * 0.5}" opacity="0.9"/>
    </svg>`;
    document.body.appendChild(slash);
    setTimeout(() => slash.remove(), 450);
  }

  setStage(0);
}

// Initialize cursor immediately without waiting for async boot
initCursor();
