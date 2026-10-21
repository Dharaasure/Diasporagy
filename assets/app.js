'use strict';
/* Diasporagy site script. It reads window.PROJECT and window.PARTICIPANT_LIST from data/project.js and data/p1.js to p5.js, so the site opens by double-click. */
const TYPES = ['factual', 'emotional', 'relational', 'cultural'];
const DIRS = ['invented', 'omitted', 'altered'];
const LABEL = {factual:'Factual', emotional:'Emotional', relational:'Relational', cultural:'Cultural', match:'Match'};
const ORIGIN = {model:'Introduced by the AI', extraction:'Came from the extracted facts', both:'Set up by the facts, elaborated by the AI'};
const NAV = [['index.html','Home','home'],['participants.html','Participants','participants'],['findings.html','Findings','findings'],['method.html','Method','method']];
const page = document.body.dataset.page;
const app = document.getElementById('app');
const qs = new URLSearchParams(location.search);

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = h => h.replace(/\n{2,}/g, '<br><br>').replace(/\[passage removed\]/g, '<span class="removed">[passage removed]</span>');
const nameOf = p => p.identification === 'full' ? p.full_name : `Participant ${p.number}`;
const findP = (P, id) => P.participants.find(p => p.id === id);
const findM = (P, a) => { const p = findP(P, a.participant); return p && p.moments.find(m => String(m.n) === String(a.moment)); };
const isVisible = (P, a) => a.public !== false && (findM(P, a) || {}).site_status === 'public';

function load() {
  const proj = window.PROJECT, list = window.PARTICIPANT_LIST;
  if (!proj || !list) throw new Error('A data file is missing or has a syntax error. Expected data/project.js and data/p1.js to p5.js');
  const participants = [...list].sort((a, b) => a.number - b.number);
  const annotations = participants.flatMap(p => (p.annotations || []).map(a => ({...a, participant: p.id})));
  return {P: {...proj, participants}, A: {disclosure: proj.disclosure, schemes: proj.schemes, annotations}};
}

function nav() {
  document.getElementById('nav').innerHTML = '<a class="brand" href="index.html">Diasporagy</a>' +
    NAV.map(([h, l, k]) => `<a href="${h}"${(k === page || (page === 'participant' && k === 'participants')) ? ' aria-current="page"' : ''}>${l}</a>`).join('');
}

/* Wraps non-overlapping ai_spans in <mark>. Spans that are not found, or that overlap an earlier one, come back in `unplaced`. */
function markSpans(text, anns) {
  const items = [], unplaced = [];
  for (const a of anns) {
    if (!a.ai_span || a.ai_span === 'none') continue;
    const i = text.indexOf(a.ai_span);
    i < 0 ? unplaced.push(a) : items.push({a, s:i, e:i + a.ai_span.length});
  }
  items.sort((x, y) => x.s - y.s || y.e - x.e);
  let out = '', pos = 0;
  for (const it of items) {
    if (it.s < pos) { unplaced.push(it.a); continue; }
    const t = it.a.type, sup = t === 'match' ? '' : `<sup aria-hidden="true">${LABEL[t][0]}</sup>`;
    out += fmt(esc(text.slice(pos, it.s))) +
      `<mark class="t-${t}" data-id="${esc(it.a.id)}" tabindex="0" role="button" aria-label="${LABEL[t]} annotation">${fmt(esc(text.slice(it.s, it.e)))}${sup}</mark>`;
    pos = it.e;
  }
  return {html: out + fmt(esc(text.slice(pos))), unplaced};
}

function transcriptHTML(text, span) {
  if (span && span !== 'none') {
    const i = text.indexOf(span);
    if (i >= 0) return fmt(esc(text.slice(0, i))) + `<mark class="t-source">${fmt(esc(span))}</mark>` + fmt(esc(text.slice(i + span.length)));
  }
  return fmt(esc(text));
}

/* ---------- pages ---------- */

/* The front page walks a first-time visitor through one moment in three stages: the person, the summary, the machine. */
const STORY = {number: 1, moment: 1, personLine: 'SUB-1-12', aiLines: ['SUB-1-02', 'SUB-1-04', 'SUB-1-11']};
function home({P, A}) {
  const pr = P.project, p = P.participants.find(x => x.number === STORY.number), m = p && p.moments.find(x => x.n === STORY.moment);
  const byId = Object.fromEntries(A.annotations.map(a => [a.id, a]));
  const hi = (text, spans) => { let h = esc(text); for (const s of spans) if (s && s !== 'none') h = h.replace(esc(s), `<mark class="story-hi">${esc(s)}</mark>`); return h.replace(/\n{2,}/g, '<br><br>'); };
  const div = A.annotations.filter(a => a.type !== 'match'), emo = div.filter(a => a.type === 'emotional').length, ext = div.filter(a => a.origin !== 'model').length;
  const story = m && m.ai_output && m.facts ? `
  <section class="step"><p class="step-n">1 · What he said</p><h2>A father describes the birth of his daughter in Doha.</h2>
    <div class="story-card transcript">${hi(m.transcript_excerpt, [byId[STORY.personLine]?.transcript_span])}</div>
    <p class="step-note">The line that matters most to him: with his parents far away in India, he never felt their absence.</p></section>
  <section class="step"><p class="step-n">2 · What the AI was given</p><h2>The researcher reduced it to five lines of facts.</h2>
    <div class="story-card facts"><p class="kicker">Facts</p>${m.facts.split('\n').map(l => `<p>${esc(l)}</p>`).join('')}</div>
    <p class="step-note">Every line is accurate. His sentence about his parents is not among them.</p></section>
  <section class="step"><p class="step-n">3 · What the AI wrote</p><h2>From those five lines, it wrote this in his voice.</h2>
    <div class="story-card ai">${hi(m.ai_output, STORY.aiLines.map(id => byId[id]?.ai_span))}</div>
    <p class="step-note">It reads well. The houseful of relatives and the speech to his daughter are invented, and his worry has become months of fear.</p></section>
  <section class="step wide"><p class="step-n">4 · Where they part</p><h2>Line by line, the two accounts joined.</h2>
    ${typeof FIG !== 'undefined' ? FIG.pairLegend() + FIG.pairBlock(p, m, A.annotations.filter(a => a.participant === p.id && a.moment === m.n && a.public !== false)) : ''}</section>` : '';
  app.innerHTML = `<header class="hero"><p class="kicker">An oral history project</p><h1>${esc(pr.subtitle)}</h1>
  <p class="lede">${esc(pr.core_question)}</p>${pr.anchoring_sentence ? `<p class="lede"><em>${esc(pr.anchoring_sentence)}</em></p>` : ''}
  <p class="prose">${esc(pr.summary)}</p><p class="scroll-cue">One moment, told twice ↓</p></header>
  ${story}
  <section class="step wide"><p class="step-n">5 · Across all fifteen moments</p><h2>The same patterns run through all five accounts.</h2>
    <div class="stat-row"><div class="stat"><div class="v">${div.length}</div><div class="l">places where the AI version departs from the person</div></div>
    <div class="stat"><div class="v">${emo}</div><div class="l">of them about feeling, the largest kind</div></div>
    <div class="stat"><div class="v">${ext}</div><div class="l">began in the summary, before the AI ran</div></div></div>
    <p class="cta"><a class="btn" href="findings.html">See the findings</a> <a class="btn ghost" href="participants.html">Read the five accounts</a> <a class="btn ghost" href="method.html">How it was done</a></p></section>`;
  if (typeof FIG !== 'undefined') FIG.wireConnectors(A);
  try {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); if (e.target.querySelector('.conn')) FIG.drawConnectors(A); } }), {threshold: .15});
    app.querySelectorAll('.step').forEach(s => io.observe(s));
  } catch { app.querySelectorAll('.step').forEach(s => s.classList.add('in')); }
}

function participants({P}) {
  app.innerHTML = `<h1>Participants</h1><p class="prose">${esc(P.project.participants_intro)}</p><div class="cards">` +
    P.participants.map(p => `<a class="card" href="participant.html?id=${esc(p.id)}"><p class="kicker">Participant ${p.number}</p>
      <div class="name">${esc(nameOf(p))}</div><div class="meta">${esc(p.identification === 'full' ? p.card_line : 'Name withheld until consent is confirmed')}</div></a>`).join('') + '</div>';
}

function participantPage({P, A}) {
  const p = findP(P, qs.get('id'));
  if (!p) { app.innerHTML = '<p>Participant not found. <a href="participants.html">Back to participants</a></p>'; return; }
  document.title = `${nameOf(p)} · Diasporagy`;
  const active = new Set(qs.get('type') ? [qs.get('type')] : [...TYPES, 'match']);
  const byId = Object.fromEntries(A.annotations.map(a => [a.id, a]));
  const btn = (a, label) => `<button class="omit t-${a.type}" data-id="${esc(a.id)}"><span class="sw sw-${a.type}"></span>${label}</button>`;
  let h = `<p class="kicker">Participant ${p.number}</p><h1>${esc(nameOf(p))}</h1>`;
  h += (p.portrait || []).map(q => `<blockquote class="portrait">${fmt(esc(q))}</blockquote>`).join('');
  if (p.portrait_source) h += `<p class="source">${esc(p.portrait_source)}</p>`;
  h += `<div class="legend" role="group" aria-label="Show or hide annotation types"><span class="lab">Show</span>` +
    [...TYPES, 'match'].map(t => `<button class="chip" data-type="${t}" aria-pressed="${active.has(t)}"><span class="sw sw-${t}"></span>${LABEL[t]}</button>`).join('') + '</div>';
  for (const m of p.moments) {
    h += `<section class="moment" id="moment-${m.n}"><p class="kicker">Moment ${m.n} · ${esc(m.section)}</p><h2>${esc(m.title)}</h2>`;
    if (m.site_status === 'withheld') { h += '<p class="withheld">This moment is withheld from the public site while it is reviewed with the participant.</p></section>'; continue; }
    if (!m.ai_output) { h += '<p class="withheld">This moment is not yet on the site.</p></section>'; continue; }
    const anns = A.annotations.filter(a => a.participant === p.id && String(a.moment) === String(m.n) && a.public !== false);
    const placed = markSpans(m.ai_output, anns);
    const omitted = anns.filter(a => a.ai_span === 'none');
    const hasConn = typeof FIG !== 'undefined';
    h += `<div class="views" role="group" aria-label="How to show this moment"><button class="view" data-v="pair" aria-pressed="true">Annotated</button>${hasConn ? '<button class="view" data-v="conn" aria-pressed="false">Joined line by line</button>' : ''}</div>
      ${m.facts ? `<details class="facts"><summary>The five lines the AI was given</summary><div class="story-card facts">${m.facts.split('\n').map(l => `<p>${esc(l)}</p>`).join('')}</div></details>` : ''}
      <div class="v-pair"><div class="pair">
      <div class="col"><h3>In their words</h3><div class="text transcript">${transcriptHTML(m.transcript_excerpt)}</div></div>
      <div class="col"><h3>The AI version</h3><div class="text ai">${placed.html}</div>
      ${omitted.length ? `<div class="omissions"><p class="kicker">Not carried into the AI version</p>${omitted.map(a => btn(a, esc(a.transcript_span))).join('')}</div>` : ''}
      ${placed.unplaced.length ? `<div class="omissions"><p class="kicker">Also noted in the AI version</p>${placed.unplaced.map(a => btn(a, 'AI: “' + esc(a.ai_span) + '”')).join('')}</div>` : ''}
      <div class="note" aria-live="polite"><p class="muted">Select a highlight to read the note and see the matching passage.</p></div></div></div></div>
      ${hasConn ? `<div class="v-conn" hidden>${FIG.pairLegend()}${FIG.pairBlock(p, m, anns)}</div>` : ''}</section>`;
  }
  app.innerHTML = h;
  if (typeof FIG !== 'undefined') FIG.wireConnectors(A);
  app.querySelectorAll('.views').forEach(g => g.addEventListener('click', e => {
    const b = e.target.closest('button.view'); if (!b) return; const sec = g.closest('.moment');
    g.querySelectorAll('button.view').forEach(x => x.setAttribute('aria-pressed', x === b));
    sec.querySelector('.v-pair').hidden = b.dataset.v !== 'pair';
    const vc = sec.querySelector('.v-conn'); if (vc) { vc.hidden = b.dataset.v !== 'conn'; if (!vc.hidden) FIG.drawConnectors(A); }
  }));

  const applyFilter = () => app.querySelectorAll('mark[data-id],button.omit').forEach(el => el.classList.toggle('dim', !active.has(byId[el.dataset.id].type)));
  app.querySelectorAll('.chip').forEach(c => c.onclick = () => {
    const t = c.dataset.type; active.has(t) ? active.delete(t) : active.add(t);
    c.setAttribute('aria-pressed', active.has(t)); applyFilter();
  });
  const show = el => {
    const a = byId[el.dataset.id], sec = el.closest('.moment'), m = p.moments.find(x => `moment-${x.n}` === sec.id);
    sec.querySelectorAll('.active').forEach(x => x.classList.remove('active')); el.classList.add('active');
    const tr = sec.querySelector('.transcript'); tr.innerHTML = transcriptHTML(m.transcript_excerpt, a.transcript_span);
    const src = tr.querySelector('.t-source'); if (src) src.scrollIntoView({block:'nearest', behavior:'smooth'});
    const where = a.transcript_span === 'none' ? '<p class="muted">Nothing in the transcript corresponds to this.</p>'
      : (src ? '' : `<p class="muted">The matching words come from elsewhere in the interview: “${esc(a.transcript_span)}”</p>`);
    sec.querySelector('.note').innerHTML = `<p class="tag"><span class="sw sw-${a.type}"></span>${LABEL[a.type]}${a.direction ? ' · ' + esc(a.direction) : ''}${a.origin ? ' · ' + esc(ORIGIN[a.origin]) : ''}</p><p>${esc(a.note)}</p>${where}`;
  };
  app.addEventListener('click', e => { const el = e.target.closest('mark[data-id],button.omit'); if (el) show(el); });
  app.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('mark[data-id]')) { e.preventDefault(); show(e.target); } });
  applyFilter();
  if (location.hash) { const t = app.querySelector(`[data-id="${CSS.escape(location.hash.slice(1))}"]`); if (t) { t.scrollIntoView({block:'center'}); show(t); } }
}

function findings({P, A}) {
  const div = A.annotations.filter(a => a.type !== 'match');
  const rows = P.participants.map(p => {
    const mine = A.annotations.filter(a => a.participant === p.id);
    return {p, c:Object.fromEntries(TYPES.map(t => [t, mine.filter(a => a.type === t).length])),
      match:mine.filter(a => a.type === 'match').length,
      o:Object.fromEntries(['model','extraction','both'].map(o => [o, mine.filter(a => a.origin === o).length]))};
  });
  const max = Math.max(1, ...rows.flatMap(r => TYPES.map(t => r.c[t])));
  const W = 760, H = 320, L = 30, gw = (W - L * 2) / rows.length, bw = (gw - 28) / 4;
  let bars = '';
  rows.forEach((r, i) => {
    TYPES.forEach((t, j) => {
      const bh = (H - 90) * r.c[t] / max, x = L + i * gw + 14 + j * bw, y = H - 46 - bh;
      bars += `<rect class="b-${t}" x="${x}" y="${y}" width="${bw - 4}" height="${bh}"><title>${esc(nameOf(r.p))}: ${r.c[t]} ${t}</title></rect><text class="v" x="${x + (bw - 4) / 2}" y="${y - 5}">${r.c[t]}</text>`;
    });
    bars += `<text class="lbl" x="${L + i * gw + gw / 2}" y="${H - 24}">${esc(nameOf(r.p))}</text>`;
  });
  const legend = TYPES.map((t, i) => `<rect class="b-${t}" x="${L + i * 120}" y="6" width="10" height="10"/><text x="${L + i * 120 + 16}" y="15" font-size="12">${LABEL[t]}</text>`).join('');
  const dirTable = `<table><thead><tr><th>Type</th>${DIRS.map(d => `<th>${d}</th>`).join('')}</tr></thead><tbody>${TYPES.map(t => `<tr><td>${LABEL[t]}</td>${DIRS.map(d => `<td>${div.filter(a => a.type === t && a.direction === d).length}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  const fromExt = div.filter(a => a.origin !== 'model').length, emo = div.filter(a => a.type === 'emotional').length;
  const stat = (v, l) => `<div class="stat"><div class="v">${v}</div><div class="l">${l}</div></div>`;
  app.innerHTML = `<p class="kicker">Findings</p><h1>The machine kept the facts and lost what they meant</h1>
  <div class="prose"><p class="lede">Fifteen moments, each told once by the person and once by an AI working from a five-line summary. Every point where the two part was marked and coded. These are the patterns that hold across all five people.</p></div>
  <div class="stat-row">${stat(A.annotations.length, 'points compared, line by line')}${stat(div.length, 'divergences: places where the AI version departs from the person')}${stat(emo, 'of them about feeling: the largest single type')}${stat(fromExt, 'began in the researcher’s own summary, before the AI ran')}</div>
  <p class="muted">${A.annotations.some(a => !isVisible(P, a)) ? 'Counts include material withheld from the public site.' : 'Counts cover only the material shown on this site; the report gives the full totals.'} Every figure below is computed from the annotation data as the page loads.</p>
  ${typeof FIG !== 'undefined' ? FIG.render(P, A, nameOf) : ''}
  <h2 style="margin-top:80px">Full counts</h2>
  <table><thead><tr><th>Participant</th>${TYPES.map(t => `<th>${LABEL[t]}</th>`).join('')}<th>Matches</th><th>From the AI</th><th>From extraction</th><th>Both</th></tr></thead><tbody>
  ${rows.map(r => `<tr><td>${esc(nameOf(r.p))}</td>${TYPES.map(t => `<td>${r.c[t]}</td>`).join('')}<td>${r.match}</td><td>${r.o.model}</td><td>${r.o.extraction}</td><td>${r.o.both}</td></tr>`).join('')}
  </tbody></table>
  <h2 style="margin-top:40px">Direction of each divergence</h2>${dirTable}
  <h2 style="margin-top:48px">Patterns</h2><div class="prose">${P.findings_draft.map(x => `<p>${esc(x)}</p>`).join('')}</div>
  <h2 style="margin-top:48px">Browse one type across all participants</h2>
  <p><select id="bt">${[...TYPES, 'match'].map(t => `<option value="${t}">${LABEL[t]}</option>`).join('')}</select></p><div class="browse"><ul id="bl"></ul></div>`;
  const sel = document.getElementById('bt'), list = document.getElementById('bl');
  const draw = () => {
    const items = A.annotations.filter(a => a.type === sel.value && isVisible(P, a));
    list.innerHTML = items.length ? items.map(a => { const p = findP(P, a.participant); return `<li><p class="kicker">${esc(nameOf(p))} · Moment ${a.moment}</p>
      ${a.ai_span !== 'none' ? `<p>AI: “${esc(a.ai_span)}”</p>` : ''}${a.transcript_span !== 'none' ? `<p class="muted">Transcript: “${esc(a.transcript_span)}”</p>` : ''}
      <p>${esc(a.note)} <a href="participant.html?id=${esc(p.id)}#${esc(a.id)}">See it in context</a></p></li>`; }).join('')
      : '<li class="muted">None of this type are on the public site yet.</li>';
  };
  if (qs.get('type')) sel.value = qs.get('type');
  sel.onchange = draw; draw();
  if (typeof FIG !== 'undefined') FIG.wireConnectors(A);
}

function method({P, A}) {
  const s = A.schemes;
  const dl = obj => `<dl>${Object.entries(obj).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>`;
  app.innerHTML = `<h1>Method</h1><div class="prose">
  <p>${esc(A.disclosure)}</p><p>${esc(P.project.method_summary)}</p>
  ${(P.method_notes || []).length ? `<h2 style="margin-top:40px">Recorded deviations</h2><ul>${P.method_notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}
  <h2 style="margin-top:40px">The fixed prompt</h2><pre>${esc(P.project.prompt)}</pre>
  <h2 style="margin-top:40px">Run log</h2></div>
  <table><thead><tr><th>Participant</th><th>Moment</th><th>Model</th><th>Date</th><th>Note</th></tr></thead><tbody>
  ${P.run_log.map(r => `<tr><td>${esc(nameOf(findP(P, r.participant)))}</td><td>${r.moment}</td><td>${esc(r.model)}</td><td>${esc(r.date)}</td><td>${esc(r.note || '')}</td></tr>`).join('')}
  </tbody></table><div class="prose">
  <h2 style="margin-top:40px">Coding scheme</h2>
  <h3>${esc(s.v1.label)}</h3>${dl(s.v1.types)}${dl(s.v1.direction)}
  <h3>${esc(s.v2.label)}</h3><p>${esc(s.v2.summary)}</p>${dl(s.v2.origin)}
  <h3>Why the scheme changed</h3><p>${esc(s.v2.rationale)}</p><p>${esc(s.applied)}</p><p class="muted">${esc(s.v2.not_adopted)}</p></div>`;
}

/* Researcher-only. Do not publish review.html. */
function review({P, A}) {
  const KEY = 'diasporagy-grades', g = JSON.parse(localStorage.getItem(KEY) || '{}');
  const save = () => localStorage.setItem(KEY, JSON.stringify(g));
  app.innerHTML = `<h1>Review</h1><p class="placeholder">Researcher-only page. Never publish it. Grades are stored in this browser until exported.</p>
  <p><select id="fp"><option value="">All participants</option>${P.participants.map(p => `<option value="${p.id}">${esc(p.full_name)}</option>`).join('')}</select>
  <select id="ft"><option value="">All types</option>${[...TYPES, 'match'].map(t => `<option value="${t}">${LABEL[t]}</option>`).join('')}</select>
  <button class="plain" id="chk">Check spans</button> <button class="plain" id="csv">Export grades (CSV)</button> <button class="plain" id="json">Export all annotations (JSON)</button> <button class="plain" id="pub">Export public-safe data files</button></p>
  <pre id="chkout" hidden></pre>
  <table><thead><tr><th>ID</th><th>Verdict</th><th>AI span</th><th>Transcript span</th><th>Note</th><th>Grade</th></tr></thead><tbody id="rb"></tbody></table>`;
  const fp = document.getElementById('fp'), ft = document.getElementById('ft'), rb = document.getElementById('rb');
  const draw = () => {
    rb.innerHTML = A.annotations.filter(a => (!fp.value || a.participant === fp.value) && (!ft.value || a.type === ft.value)).map(a => {
      const x = g[a.id] || {};
      return `<tr><td>${esc(a.id)}${a.public === false ? '<br><span class="muted">not public</span>' : ''}</td>
      <td><span class="sw sw-${a.type}"></span>${LABEL[a.type]}${a.direction ? '<br>' + esc(a.direction) : ''}${a.origin ? '<br>' + esc(a.origin) : ''}</td>
      <td>${esc(a.ai_span)}</td><td>${esc(a.transcript_span)}</td><td>${esc(a.note)}</td>
      <td><select data-id="${esc(a.id)}" data-k="grade">${['', 'accept', 'amend', 'reject'].map(v => `<option${x.grade === v ? ' selected' : ''}>${v}</option>`).join('')}</select>
      <input data-id="${esc(a.id)}" data-k="comment" value="${esc(x.comment || '')}" placeholder="comment"></td></tr>`;
    }).join('');
  };
  rb.addEventListener('change', e => { const el = e.target; if (!el.dataset.id) return; (g[el.dataset.id] ||= {})[el.dataset.k] = el.value; save(); });
  fp.onchange = ft.onchange = draw; draw();
  const dl = (name, text, type) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], {type})); a.download = name; a.click(); };
  document.getElementById('chk').onclick = () => {
    const bad = [], elsewhere = [], skipped = [];
    for (const a of A.annotations) {
      const m = findM(P, a);
      if (!m) { bad.push(`${a.id}: no such participant or moment`); continue; }
      if (!m.ai_output) { skipped.push(a.id); continue; }
      if (a.ai_span !== 'none' && !m.ai_output.includes(a.ai_span)) bad.push(`${a.id}: ai_span not found in the AI output`);
      if (a.transcript_span !== 'none' && !m.transcript_excerpt.includes(a.transcript_span)) elsewhere.push(a.id);
    }
    const out = document.getElementById('chkout'); out.hidden = false;
    out.textContent = `Errors (ai_span not found): ${bad.length}\n${bad.join('\n') || 'none'}\n\nTranscript spans not in the shown excerpt (fine if they come from elsewhere in the interview): ${elsewhere.length}\n${elsewhere.join(', ') || 'none'}\n\nNot checked (moment withheld, so its text is not in the data file): ${skipped.length}`;
  };
  document.getElementById('csv').onclick = () => dl('grades.csv', 'id,grade,comment\n' +
    Object.entries(g).map(([id, x]) => [id, x.grade || '', x.comment || ''].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n'), 'text/csv');
  document.getElementById('json').onclick = () => dl('annotations.json', JSON.stringify(A.annotations, null, 1), 'application/json');
  document.getElementById('pub').onclick = () => {
    const {participants: list, ...proj} = P;
    /* Participants not yet named by consent lose their name, card line and name-based id (which shows in page URLs). */
    const anon = p => p.identification !== 'full';
    const pubId = Object.fromEntries(list.map(p => [p.id, anon(p) ? `p${p.number}` : p.id]));
    const projOut = {...proj, run_log: (proj.run_log || []).map(r => ({...r, participant: pubId[r.participant] || r.participant})),
      method_notes: (proj.method_notes || []).map(n => n.replace('Their annotations are counted in the Findings totals.', 'Their annotations are not counted on this site; the report gives the full totals.'))};
    const files = [['project.js', 'window.PROJECT = ' + JSON.stringify(projOut, null, 1) + ';']];
    list.forEach(p => files.push([`p${p.number}.js`, '(window.PARTICIPANT_LIST ||= []).push(' + JSON.stringify({...p, id: pubId[p.id], full_name: anon(p) ? '' : p.full_name, card_line: anon(p) ? '' : p.card_line, annotations:(p.annotations || []).filter(a => isVisible(P, {...a, participant:p.id}))}, null, 1) + ');']));
    files.forEach(([n, t], i) => setTimeout(() => dl(n, t, 'text/javascript'), i * 400));
  };
}

nav();
try {
  const d = load();
  ({home, participants, participant:participantPage, findings, method, review})[page](d);
} catch (e) {
  app.innerHTML = `<p class="placeholder">Something went wrong: ${esc(e.message)}. Press F12 and open the Console tab for details.</p>`;
  console.error(e);
}
