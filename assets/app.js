'use strict';
/* Diasporagy site script. It reads window.PROJECT and window.PARTICIPANT_LIST from data/project.js and data/p1.js to p5.js,
   and the editorial text from data/content.js, so the site opens by double-click. */
const TYPES = ['factual', 'emotional', 'relational', 'cultural'];
const DIRS = ['invented', 'omitted', 'altered'];
const LABEL = {factual:'Factual', emotional:'Emotional', relational:'Relational', cultural:'Cultural', match:'Match'};
const ORIGIN = {model:'Introduced by the AI', extraction:'Came from the extracted facts', both:'Set up by the facts, elaborated by the AI'};
const NAV = [['participants.html','The accounts','participants'],['findings.html','Findings','findings'],['method.html','Method','method'],['about.html','About','about'],['report.html','Report','report']];
const page = document.body.dataset.page;
const app = document.getElementById('app');
const qs = new URLSearchParams(location.search);

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = h => h.replace(/\n{2,}/g, '<br><br>').replace(/\[passage removed\]/g, '<span class="removed">[passage removed]</span>');
/* First names only, as every participant asked. */
const nameOf = p => p.identification === 'full' && p.full_name ? p.full_name.trim().split(/\s+/)[0] : `Participant ${p.number}`;
const findP = (P, id) => P.participants.find(p => p.id === id);
const findM = (P, a) => { const p = findP(P, a.participant); return p && p.moments.find(m => String(m.n) === String(a.moment)); };
const isVisible = (P, a) => a.public !== false && (findM(P, a) || {}).site_status === 'public';
const words = s => s ? s.trim().split(/\s+/).length : 0;
const pct = (a, b) => b ? Math.round(100 * a / b) : 0;
const arrow = '<span class="arr" aria-hidden="true">→</span>';
const C = () => window.CONTENT || {};
/* Section names in the data carry notes in brackets ("Getting Settled (fallback: …)"); the short form is for labels. */
const shortSection = s => String(s || '').replace(/\s*\(.*\)\s*$/, '');

function load() {
  const proj = window.PROJECT, list = window.PARTICIPANT_LIST;
  if (!proj || !list) throw new Error('A data file is missing or has a syntax error. Expected data/project.js and data/p1.js to p5.js');
  const participants = [...list].sort((a, b) => a.number - b.number);
  const annotations = participants.flatMap(p => (p.annotations || []).map(a => ({...a, participant: p.id})));
  return {P: {...proj, participants}, A: {disclosure: proj.disclosure, schemes: proj.schemes, annotations}};
}

/* ---------- theme ---------- */
const THEME_KEY = 'diasporagy-theme';
function applyStoredTheme() { try { const t = localStorage.getItem(THEME_KEY); if (t) document.documentElement.dataset.theme = t; } catch {} }
function isDark() { const t = document.documentElement.dataset.theme; return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; }
function toggleTheme() {
  const t = isDark() ? 'light' : 'dark'; document.documentElement.dataset.theme = t;
  try { localStorage.setItem(THEME_KEY, t); } catch {}
  if (typeof FIG !== 'undefined' && window.__A) FIG.drawConnectors(window.__A);
}
const ICON_SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
const ICON_MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/></svg>';

function chrome() {
  const here = page === 'participant' ? 'participants' : page;
  const nav = document.getElementById('nav');
  nav.innerHTML = `<a class="brand" href="index.html"><svg class="logo" viewBox="0 0 48 48" aria-hidden="true"><path d="M11 8h12a16 16 0 0 1 0 32H11z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M15 24c1.6-4.4 3.2-4.4 4.8 0s3.2 4.4 4.8 0" fill="none" stroke="#2b3f7a" stroke-width="2.2" stroke-linecap="round"/><path d="M28 20h5M28 24h6M28 28h5" stroke="#8a8f96" stroke-width="2.2" stroke-linecap="round"/></svg><b>Diasporagy</b><span>An oral history project</span></a>` +
    NAV.map(([h, l, k]) => k === 'participants'
      ? `<span class="nd"><a class="nl" href="${h}"${k === here ? ' aria-current="page"' : ''} aria-haspopup="true">${l} <span aria-hidden="true">▾</span></a><span class="nd-menu">${(window.PARTICIPANT_LIST || []).slice().sort((a, b) => a.number - b.number).map(p => `<a href="participant.html?id=${esc(p.id)}">${esc(nameOf(p))}</a>`).join('')}<a class="nd-all" href="participants.html">All five accounts</a></span></span>`
      : `<a class="nl${k === 'report' ? ' nl-report' : ''}" href="${h}"${k === here ? ' aria-current="page"' : ''}>${l}</a>`).join('') ;
  const foot = document.getElementById('foot');
  if (foot) foot.innerHTML = `<div class="wrap"><div class="foot">
    <div><b><svg class="logo logo-foot" viewBox="0 0 48 48" aria-hidden="true"><path d="M11 8h12a16 16 0 0 1 0 32H11z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M15 24c1.6-4.4 3.2-4.4 4.8 0s3.2 4.4 4.8 0" fill="none" stroke="#2b3f7a" stroke-width="2.2" stroke-linecap="round"/><path d="M28 20h5M28 24h6M28 28h5" stroke="#8a8f96" stroke-width="2.2" stroke-linecap="round"/></svg>Diasporagy</b>${esc(C().tagline || '')}${C().director ? `<p style="margin-top:14px">${esc(C().director)}, ${esc(C().director_role)}</p>` : ''}</div>
    <div><h4>Read</h4><ul><li><a href="index.html">Home</a></li><li><a href="participants.html">The five accounts</a></li><li><a href="findings.html">Findings</a></li><li><a href="report.html">The report</a></li></ul></div>
    <div><h4>Contact</h4><ul><li>${C().director ? esc(C().director) : ''}</li><li><a href="mailto:${esc(C().email || '')}">${esc(C().email || '')}</a></li></ul></div>
    <div><h4>How it was made</h4><ul><li><a href="method.html">Method</a></li><li><a href="method.html#prompt">The fixed prompt</a></li><li><a href="method.html#deviations">Recorded deviations</a></li><li><a href="about.html">About the project</a></li></ul></div>
    </div><div class="foot-base"><span>Participants are named only with their confirmed consent.</span><span>Every count on this site is computed from the annotation data as the page loads.</span></div></div>`;
}

/* Turns "(SUJ-1-09, SHR-2-05)" into links that name the participant by number and moment, and "(Figure 2)" into a link.
   The ids themselves are not shown: their prefixes come from participants' names. */
function withRefs(text, P, A) {
  const byId = Object.fromEntries(A.annotations.map(a => [a.id, a]));
  return esc(text)
    .replace(/\s*\(((?:[A-Z]{3}-\d-\d{2}(?:,\s*)?)+)\)/g, (_, ids) => ' ' + ids.split(/,\s*/).map(id => {
      const a = byId[id]; if (!a || !isVisible(P, a)) return '';
      const p = findP(P, a.participant);
      return `<a class="ref" href="participant.html?id=${esc(p.id)}#${esc(id)}" title="${esc(nameOf(p))}, Moment ${a.moment}">P${p.number} · ${a.moment}</a>`;
    }).join(' '))
    .replace(/\(Figure (\d)\)/g, (_, n) => `(<a href="findings.html#fig-${n}">Figure ${n}</a>)`);
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

/* The five fact lines, with each field name set apart like a filled-in form. */
const factsHTML = f => f.split('\n').map(l => { const m = l.match(/^-\s*([^:]+):\s*(.*)$/); return m ? `<p><span class="fk">${esc(m[1])}:</span> ${esc(m[2])}</p>` : `<p>${esc(l)}</p>`; }).join('');

function reveal(sel, after) {
  const els = app.querySelectorAll(sel);
  try {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); after && after(e.target); } }), {threshold: .12});
    els.forEach(s => io.observe(s));
  } catch { els.forEach(s => { s.classList.add('in'); after && after(s); }); }
}

/* Catalogue record for an interview, in the manner of an oral history accession sheet. */
function record(p) {
  const r = (C().interviews || {})[p.number]; if (!r) return '';
  const f = [['Accession', r.acc], ['Recorded', r.date], ['Language', r.lang], ['Format', r.format], ['Consent', 'Named, first name only']];
  return `<dl class="record">${f.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl>`;
}


/* The opening graphic: the real loudness envelope of Subramanya's recorded moment (the birth at Sidra),
   drawn as ink bars, above the AI version of the same moment drawn as flat, identical grey bars. */
const VOICE_ENV = [0.54, 0.55, 0.66, 0.68, 0.36, 0.59, 0.6, 0.56, 0.6, 0.4, 0.39, 0.55, 0.64, 0.63, 0.51, 0.39, 0.44, 0.45, 0.62, 0.84, 0.64, 0.56, 0.7, 0.49, 0.66, 0.63, 0.31, 0.49, 0.78, 0.72, 0.7, 0.67, 0.49, 0.7, 0.69, 0.43, 0.62, 0.5, 0.66, 0.41, 0.82, 0.71, 0.4, 0.58, 0.91, 0.53, 0.58, 0.44, 0.64, 0.58, 0.66, 0.32, 0.69, 0.52, 0.7, 0.44, 0.59, 0.49, 0.34, 0.45, 0.72, 0.18, 0.47, 0.61, 0.24, 1.0, 0.74, 0.62, 0.49, 0.59, 0.3, 0.6, 0.52, 0.57, 0.4, 0.35, 0.7, 0.49, 0.79, 0.67, 0.5, 0.55, 0.51, 0.49, 0.66, 0.72, 0.7, 0.44, 0.48, 0.85, 0.72, 0.47, 0.58, 0.68, 0.45, 0.36];
function voiceMark() {
  const n = VOICE_ENV.length, W = 600, gap = W / n, bw = gap * 0.42;
  const bars = (vals, y, h, cls) => vals.map((v, i) => { const bh = Math.max(2, v * h); return `<rect class="${cls}" x="${(i * gap).toFixed(1)}" y="${(y - bh / 2).toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="${(bw / 2).toFixed(1)}" style="--d:${i * 8}ms"/>`; }).join('');
  return `<figure class="vh"><svg viewBox="0 0 ${W} 300" role="img" aria-label="The shape of a recorded voice, and the flat shape of the same moment retold by a machine">
      <text class="vh-l" x="0" y="14">A VOICE</text>${bars(VOICE_ENV, 104, 150, 'vh-h')}
      <text class="vh-l" x="0" y="224">ITS RETELLING BY A MACHINE</text>${bars(VOICE_ENV.map(() => 0.16), 262, 150, 'vh-m')}</svg>
</figure>`;
}
function startVoiceMark() {}
/* ---------- pages ---------- */

/* The front page opens on one exchanged sentence, then walks a first-time visitor through that moment in four stages:
   the person, the summary, the machine, and the two joined. */
const STORY = {number: 1, moment: 1, personLine: 'SUB-1-12', aiLine: 'SUB-1-04', aiLines: ['SUB-1-02', 'SUB-1-04', 'SUB-1-11']};
function home({P, A}) {
  const pr = P.project, p = P.participants.find(x => x.number === STORY.number), m = p && p.moments.find(x => x.n === STORY.moment);
  const byId = Object.fromEntries(A.annotations.map(a => [a.id, a]));
  const hi = (text, spans) => { let h = esc(text); for (const s of spans) if (s && s !== 'none') h = h.replace(esc(s), `<mark class="story-hi">${esc(s)}</mark>`); return h.replace(/\n{2,}/g, '<br><br>'); };
  const pub = P.participants.flatMap(x => x.moments.filter(mm => mm.site_status === 'public' && mm.ai_output));
  const div = A.annotations.filter(a => a.type !== 'match');
  const inv = div.filter(a => a.direction === 'invented'), om = div.filter(a => a.direction === 'omitted');
  const K = (window.MEASURES || {}).content_kind || {};
  const kindPct = k => { const xs = A.annotations.filter(a => K[a.id] === k); return pct(xs.filter(a => a.type === 'match').length, xs.length); };
  const avg = f => Math.round(pub.reduce((s, x) => s + words(f(x)), 0) / Math.max(1, pub.length));
  const aT = avg(x => x.transcript_excerpt), aF = avg(x => x.facts), aA = avg(x => x.ai_output), aMax = Math.max(aT, aF, aA);

  /* The exhibit: his sentence, and the sentence the AI wrote where his would have been. */
  const human = byId[STORY.personLine], machine = byId[STORY.aiLine];
  let machineText = machine ? machine.ai_span : '';
  /* Start one sentence earlier than the annotated span, so the AI's "No family, no aunties, nobody." leads into it. */
  if (machine && m) {
    const i = m.ai_output.indexOf(machine.ai_span), end = (t, k) => Math.max(t.lastIndexOf('? ', k), t.lastIndexOf('. ', k));
    const j1 = end(m.ai_output, i - 2), j2 = j1 > 0 ? end(m.ai_output, j1 - 1) : -1;
    if (i > 0 && j2 > 0) machineText = m.ai_output.slice(j2 + 2, i + machine.ai_span.length).trim();
  }
  const exhibit = human && machine ? `<figure class="exhibit" aria-label="One sentence, exchanged">
      <div class="ex-card ex-human panel-human"><span class="panel-label">What he said</span><p>“${esc(human.transcript_span)}”</p></div>
      <div class="ex-bridge"><svg viewBox="0 0 16 46" aria-hidden="true"><path d="M8 0v40M2 34l6 7 6-7" fill="none" stroke="currentColor" stroke-width="1.4"/></svg><span>Reduced to five lines of facts.<br>Given to an AI with one fixed prompt.</span></div>
      <div class="ex-card ex-machine panel-machine"><span class="panel-label">What the AI wrote</span><p>${esc(machineText)}</p></div>
      <p class="ex-lacuna">His sentence was not among the five lines. The AI turned the absence of family into the source of fear.</p>
      <figcaption>${esc(nameOf(p))}, on the birth of his daughter in Doha. <a href="#story">Read the whole moment below</a>.</figcaption></figure>` : '';

  const story = m && m.ai_output && m.facts ? `
  <div class="story">
  <section class="step"><div class="step-side"><p class="step-n">01 · The person</p><h3>A father describes the birth of his daughter in Doha.</h3></div>
    <div class="step-main"><div class="story-card panel-human voice-human"><span class="panel-label">In his words</span>${hi(m.transcript_excerpt, [byId[STORY.personLine]?.transcript_span])}</div>
    <p class="step-note">The line that matters most to him: <b>with his parents far away in India, he never felt their absence.</b></p></div></section>
  <section class="step"><div class="step-side"><p class="step-n">02 · The summary</p><h3>The researcher reduced it to five lines of facts.</h3></div>
    <div class="step-main"><div class="story-card facts panel-facts"><span class="panel-label">The facts the AI was given</span>${factsHTML(m.facts)}<span class="lacuna-slot">Not here: “${esc(byId[STORY.personLine]?.transcript_span || '')}”</span></div>
    <p class="step-note">Every line is accurate. <b>His sentence about his parents is not among them.</b> Before the machine saw anything, the summary had already decided what it could not know.</p></div></section>
  <section class="step"><div class="step-side"><p class="step-n">03 · The machine</p><h3>From those five lines, it wrote this in his voice.</h3></div>
    <div class="step-main"><div class="story-card panel-machine voice-machine"><span class="panel-label">The AI version</span>${hi(m.ai_output, STORY.aiLines.map(id => byId[id]?.ai_span))}</div>
    <p class="step-note">It reads well. <b>The houseful of relatives and the speech to his daughter are invented, and his worry has become months of fear.</b></p></div></section>
  <section class="step wide"><div class="step-side"><p class="step-n">04 · Where they part</p><h3>Line by line, the two accounts joined.</h3>
    <p class="step-note">Hover or tap any highlight. A line joins it to its partner; a double underline means it has none.</p></div>
    <div class="step-main">${typeof FIG !== 'undefined' ? '<div class="v-conn">' + FIG.pairLegend() + FIG.pairBlock(p, m, A.annotations.filter(a => a.participant === p.id && a.moment === m.n && a.public !== false)) + '</div>' : ''}</div></section>
  </div>` : '';

  const people = P.participants.map(x => {
    const q = (x.portrait || [])[0] || '', short = q.length > 150 ? q.slice(0, q.lastIndexOf(' ', 146)) + '…' : q;
    const shown = x.moments.filter(mm => mm.site_status === 'public').length;
    return `<a class="person" href="participant.html?id=${esc(x.id)}"><span class="pn">${String(x.number).padStart(2, '0')} · ${shown} moment${shown === 1 ? '' : 's'}</span><span class="who">${esc(nameOf(x))}</span>${short ? `<q>${esc(short)}</q>` : '<span></span>'}<span class="go">Read the account ${arrow}</span></a>`;
  }).join('');
  const steps = [
    ['Interview', 'Five Indian migrants in Doha, in the language they chose.'],
    ['Select', 'Three moments each, fixed in advance by a rule.'],
    ['Reduce', 'Each moment stripped to five lines of checkable facts.', 'loss'],
    ['Generate', 'One fixed prompt, the same for every person.', 'm'],
    ['Compare', 'The two accounts set side by side, every divergence marked.'],
    ['Return', 'Each person reviews their own material before anything is public.']];

  app.innerHTML = `
  <header class="hero">
    <div><p class="eyebrow">An oral history project · Doha</p>
      <h1>What gets lost when a machine <em>tells your story</em></h1>
      <p class="lede">${esc(pr.summary)}</p>
      <div class="hero-meta"><span>${P.participants.length} people</span><span>${pub.length} moments</span><span>1 fixed prompt</span><span>${A.annotations.length} points compared</span></div></div>
    ${voiceMark(P)}
  </header>

  <section class="section question"><p class="num">The question</p>
    <div><blockquote>${esc(pr.core_question)}</blockquote>${(C().lineage || []).slice(0, 1).map(t => `<p class="q-body">${esc(t)}</p>`).join('')}</div></section>

  <section class="section"><div class="section-head"><p class="num">The process</p><div><h2>How each moment was made</h2>
    <p>The same steps for every person, fixed before the first interview.</p></div></div>
    <ol class="pipeline">${steps.map(([b, d, c], i) => `<li${c ? ` class="${c}"` : ''}><span class="pn">${String(i + 1).padStart(2, '0')}</span><b>${b}</b><span class="d">${d}</span></li>`).join('')}</ol>
    <div class="compress" role="img" aria-label="Average words per moment: ${aT} in the person's words, ${aF} in the facts, ${aA} in the AI version">
      ${[['Their words', aT, 'b-h'], ['The five lines of facts', aF, 'b-f'], ['The AI version', aA, 'b-a']].map(([l, v, c]) => `<div class="row"><span class="lab">${l}</span><span class="bar ${c}" style="width:${100 * v / aMax}%"></span><span class="n">${v}</span></div>`).join('')}</div>
    <p class="compress-note">Average words per moment. The AI wrote more than it was given.</p>
    <p class="cta"><a class="btn ghost" href="method.html">The full method ${arrow}</a></p></section>

  <section class="section"><div class="section-head"><p class="num">Across every moment</p><div><h2>The same patterns run through all five accounts</h2>
    <p>${div.length} places where the AI version departs from the person, each traced to where it began.</p></div></div>
    <div class="claims">
      <div class="claim"><div class="v">${inv.filter(a => a.origin === 'model').length}<small>of ${inv.length}</small></div><h3>inventions came from the AI</h3><p>Relatives, speeches, fears and endings that no one described.</p></div>
      <div class="claim"><div class="v">${om.filter(a => a.origin === 'extraction').length}<small>of ${om.length}</small></div><h3>omissions began in the summary</h3><p>What went missing was mostly gone before the AI ran.</p></div>
      <div class="claim"><div class="v">${kindPct('F')}<small>%</small></div><h3>of feelings came through intact</h3><p>Against ${kindPct('N')}% of numbers, dates and times.</p></div>
    </div>
    <p class="cta"><a class="btn" href="findings.html">See all seven figures ${arrow}</a></p></section>

  <section class="section"><div class="section-head"><p class="num">The accounts</p><div><h2>Five people, in their own words</h2></div></div>
    <div class="people">${people}</div></section>`;

  startVoiceMark(P);
  if (typeof FIG !== 'undefined') { window.__A = A; FIG.wireConnectors(A); }
  reveal('.step', s => { if (s.querySelector('.conn') && typeof FIG !== 'undefined') FIG.drawConnectors(A); });
}

function participants({P, A}) {
  app.innerHTML = `<header class="page-head"><p class="eyebrow">The accounts</p><h1>Five people, fifteen moments</h1>
    <p class="lede">Each moment appears twice: in the person's words, and as an AI retold it. First names are used with each person's consent.</p></header>
  <div class="roster">${P.participants.map(p => {
    const n = A.annotations.filter(a => a.participant === p.id).length;
    return `<a class="entry" href="participant.html?id=${esc(p.id)}"><span class="e-num">${String(p.number).padStart(2, '0')}</span>
      <div><p class="e-name">${esc(nameOf(p))}</p><p class="e-meta">${esc(p.card_line || '')}</p><p class="e-meta">${n} points compared</p></div>
      <p class="e-quote">“${esc((p.portrait || [])[0] || '')}”</p>
      <ul class="e-moments">${p.moments.map(m => `<li><span class="mn">${m.n}</span>${m.site_status === 'public' ? `<span>${esc(m.title)}</span>` : '<span class="held">Withheld while under review</span>'}</li>`).join('')}</ul></a>`;
  }).join('')}</div>`;
}

function participantPage({P, A}) {
  const p = findP(P, qs.get('id'));
  if (!p) { app.innerHTML = '<header class="page-head"><h1>Participant not found</h1><p><a href="participants.html">Back to the accounts</a></p></header>'; return; }
  document.title = `${nameOf(p)} · Diasporagy`;
  const active = new Set(qs.get('type') ? [qs.get('type')] : [...TYPES, 'match']);
  const byId = Object.fromEntries(A.annotations.map(a => [a.id, a]));
  const btn = (a, label) => `<button class="omit t-${a.type}" data-id="${esc(a.id)}">${label}</button>`;
  const i = P.participants.indexOf(p), prev = P.participants[i - 1], next = P.participants[i + 1];

  let h = `<header class="p-head"><div><p class="p-crumb"><a href="participants.html">The accounts</a> / ${String(p.number).padStart(2, '0')}</p><h1>${esc(nameOf(p))}</h1>
    ${p.card_line ? `<p class="e-meta" style="margin-top:14px">${esc(p.card_line)}</p>` : ''}${record(p)}</div>
    <div class="p-portrait">${(p.portrait || []).map(q => `<blockquote>${fmt(esc(q))}</blockquote>`).join('')}${p.portrait_source ? `<p class="source">${esc(p.portrait_source)}</p>` : ''}</div></header>
  <div class="p-guide" aria-label="How to read this page">
    <div><b>1</b> Listen to the recorded passage, or read it on the left.</div>
    <div><b>2</b> Compare it with the AI version on the right.</div>
    <div><b>3</b> Select any coloured highlight to see the note and the matching words.</div></div>
  <nav class="toc" aria-label="Moments">${p.moments.map(m => `<a href="#moment-${m.n}"${m.site_status !== 'public' ? ' class="held"' : ''}><div class="tn">Moment ${m.n}</div><div class="tt">${m.site_status === 'public' ? esc(m.title) : 'Withheld'}</div><div class="ts">${esc(shortSection(m.section))}</div></a>`).join('')}</nav>
  <div class="legend" role="group" aria-label="Jump to a moment, and choose which highlights to show">
    <span class="jump"><span class="lab">Moment</span>${p.moments.map(m => `<a href="#moment-${m.n}" title="${esc(m.title)}">${m.n}</a>`).join('')}</span>
    <span class="lab">Highlight</span>` +
    [...TYPES, 'match'].map(t => `<button class="chip" data-type="${t}" aria-pressed="${active.has(t)}"><span class="sw sw-${t}"></span>${LABEL[t]}</button>`).join('') +
    `<select class="who" aria-label="Go to another person">${P.participants.map(x => `<option value="${esc(x.id)}"${x === p ? ' selected' : ''}>${esc(nameOf(x))}</option>`).join('')}</select></div>`;

  for (const m of p.moments) {
    h += `<section class="moment" id="moment-${m.n}"><div class="m-head"><div><p class="m-tag"><b>Moment ${m.n}</b> · ${esc(shortSection(m.section))}</p><h2>${m.site_status === 'public' ? esc(m.title) : 'Withheld'}</h2>${/\(/.test(m.section) ? `<p class="m-dev">${esc(m.section.match(/\((.*)\)/)[1].replace(/^./, c => c.toUpperCase()))}. <a href="method.html#deviations">Recorded deviations</a></p>` : ''}</div>`;
    if (m.site_status === 'withheld') { h += '</div><p class="withheld">This moment is withheld from the public site while it is reviewed with the participant. It is not counted anywhere on this site.</p></section>'; continue; }
    if (!m.ai_output) { h += '</div><p class="withheld">This moment is not yet on the site.</p></section>'; continue; }
    const anns = A.annotations.filter(a => a.participant === p.id && String(a.moment) === String(m.n) && a.public !== false);
    const placed = markSpans(m.ai_output, anns);
    const omitted = anns.filter(a => a.ai_span === 'none');
    const hasConn = typeof FIG !== 'undefined';
    const counts = [...TYPES, 'match'].map(t => [t, anns.filter(a => a.type === t).length]).filter(x => x[1]);
    h += `<div class="m-count">${counts.map(([t, n]) => `<span><i class="sw sw-${t}"></i>${n} ${LABEL[t].toLowerCase()}</span>`).join('')}</div></div>
      ${(C().audio || []).includes(nameOf(p) + '_M' + m.n) ? `<div class="m-audio"><span class="kicker">Listen · the recorded passage</span><audio controls preload="none" src="assets/audio/${esc(nameOf(p))}_M${m.n}.mp3"></audio></div>` : ''}
      <div class="m-tools"><span class="lab-s">View</span><div class="views" role="group" aria-label="How to show this moment"><button class="view" data-v="pair" aria-pressed="true">Annotated</button>${hasConn ? '<button class="view" data-v="conn" aria-pressed="false">Joined line by line</button>' : ''}</div>
      ${m.facts ? `<details class="facts"><summary>The five lines the AI was given</summary><div class="story-card facts panel-facts">${factsHTML(m.facts)}</div></details>` : ''}</div>
      <div class="v-pair"><div class="pair">
      <div class="col"><div class="text transcript panel-human voice-human"><span class="panel-label">In their words · ${words(m.transcript_excerpt)} words</span>${transcriptHTML(m.transcript_excerpt)}</div>
        ${omitted.length ? `<div class="omissions"><p class="kicker">Not carried into the AI version</p>${omitted.map(a => btn(a, '“' + esc(a.transcript_span) + '”')).join('')}</div>` : ''}</div>
      <div class="col"><div class="text ai panel-machine"><span class="panel-label">The AI version · ${words(m.ai_output)} words</span>${placed.html}</div>
      ${placed.unplaced.length ? `<div class="omissions"><p class="kicker">Also noted in the AI version</p>${placed.unplaced.map(a => btn(a, 'AI: “' + esc(a.ai_span) + '”')).join('')}</div>` : ''}
      <div class="note" aria-live="polite"><p class="muted">Select a highlight to read the note and see the matching passage.</p></div></div></div></div>
      ${hasConn ? `<div class="v-conn" hidden>${FIG.pairLegend()}${FIG.pairBlock(p, m, anns)}</div>` : ''}</section>`;
  }
  h += `<nav class="p-next" aria-label="Other participants">${prev ? `<a href="participant.html?id=${esc(prev.id)}"><div class="tn">← Previous</div><div class="tt">${esc(nameOf(prev))}</div></a>` : '<span></span>'}
    ${next ? `<a href="participant.html?id=${esc(next.id)}"><div class="tn">Next →</div><div class="tt">${esc(nameOf(next))}</div></a>` : `<a href="findings.html"><div class="tn">Next →</div><div class="tt">Findings across all five</div></a>`}</nav>`;
  app.innerHTML = h;
  const sw = app.querySelector('select.who'); if (sw) sw.onchange = () => { location.href = 'participant.html?id=' + encodeURIComponent(sw.value); };
  if (typeof FIG !== 'undefined') { window.__A = A; FIG.wireConnectors(A); }
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
    const tr = sec.querySelector('.transcript');
    tr.innerHTML = tr.querySelector('.panel-label').outerHTML + transcriptHTML(m.transcript_excerpt, a.transcript_span);
    const src = tr.querySelector('.t-source'); if (src) src.scrollIntoView({block:'nearest', behavior:'smooth'});
    const where = a.transcript_span === 'none' ? '<p class="muted">Nothing in the transcript corresponds to this.</p>'
      : (src ? '<p class="muted">The matching words are highlighted in their account.</p>' : `<p class="muted">The matching words come from elsewhere in the interview: “${esc(a.transcript_span)}”</p>`);
    sec.querySelector('.note').innerHTML = `<p class="tag"><span><span class="sw sw-${a.type}"></span>${LABEL[a.type]}</span>${a.direction ? `<span>${esc(a.direction)}</span>` : ''}${a.origin ? `<span>${esc(ORIGIN[a.origin])}</span>` : ''}</p><p>${esc(a.note)}</p>${where}`;
  };
  app.addEventListener('click', e => { const el = e.target.closest('mark[data-id],button.omit'); if (el) show(el); });
  app.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('mark[data-id]')) { e.preventDefault(); show(e.target); } });
  applyFilter();
  if (location.hash) {
    const t = app.querySelector(`[data-id="${CSS.escape(location.hash.slice(1))}"]`) || app.querySelector(location.hash.replace(/[^#\w-]/g, ''));
    if (t) { t.scrollIntoView({block:'center'}); if (t.dataset.id) show(t); }
  }
}

function findings({P, A}) {
  const div = A.annotations.filter(a => a.type !== 'match');
  const rows = P.participants.map(p => {
    const mine = A.annotations.filter(a => a.participant === p.id);
    return {p, c:Object.fromEntries(TYPES.map(t => [t, mine.filter(a => a.type === t).length])),
      match:mine.filter(a => a.type === 'match').length,
      o:Object.fromEntries(['model','extraction','both'].map(o => [o, mine.filter(a => a.origin === o).length]))};
  });
  const dirTable = `<table><thead><tr><th>Type</th>${DIRS.map(d => `<th class="n">${d}</th>`).join('')}<th class="n">Total</th></tr></thead><tbody>${TYPES.map(t => `<tr><td><span class="sw sw-${t}"></span>${LABEL[t]}</td>${DIRS.map(d => `<td class="n">${div.filter(a => a.type === t && a.direction === d).length}</td>`).join('')}<td class="n">${div.filter(a => a.type === t).length}</td></tr>`).join('')}</tbody></table>`;
  const fromExt = div.filter(a => a.origin !== 'model').length, emo = div.filter(a => a.type === 'emotional').length;
  const stat = (v, l) => `<div class="stat"><div class="v">${v}</div><div class="l">${l}</div></div>`;
  const figs = typeof FIG !== 'undefined' ? FIG.render(P, A, nameOf) : '';
  const list = typeof FIG !== 'undefined' ? FIG.drawn() : [];
  app.innerHTML = `<header class="page-head"><p class="eyebrow">Findings</p><h1>The machine kept the facts and lost what they meant</h1>
    <p class="lede">Each moment was told once by the person and once by an AI working from a five-line summary. Every point where the two part was marked and coded. These are the patterns that hold across all five people.</p></header>
  <div class="stat-row">${stat(A.annotations.length, 'points compared, line by line')}${stat(div.length, 'divergences: places where the AI version departs from the person')}${stat(emo, 'of them about feeling, the largest single type')}${stat(fromExt, 'began in the researcher’s own summary, before the AI ran')}</div>
  <p class="muted f-note">${A.annotations.some(a => !isVisible(P, a)) ? 'Counts include material withheld from the public site.' : 'Counts cover all the material on this site.'} Every figure below is computed from the annotation data as the page loads.</p>
  <div class="f-layout"><aside class="f-toc" aria-label="Contents"><p>Contents</p><ol>${list.map(f => `<li><a href="#${f.id}">${esc(f.short)}</a></li>`).join('')}
    <li><a href="#patterns">Patterns</a></li><li><a href="#counts">Full counts</a></li><li><a href="#browse">Browse every note</a></li></ol></aside>
  <div>${figs}
  <section class="fig" id="patterns"><p class="fig-n">Patterns</p><h3>Five things the comparison shows</h3><ol class="patterns">${P.findings_draft.map(x => `<li><span>${withRefs(x, P, A)}</span></li>`).join('')}</ol></section>
  <section class="fig" id="counts"><p class="fig-n">Full counts</p><h3>Every annotation, by participant</h3>
  <div class="table-scroll"><table><thead><tr><th>Participant</th>${TYPES.map(t => `<th class="n">${LABEL[t]}</th>`).join('')}<th class="n">Matches</th><th class="n">From the AI</th><th class="n">From extraction</th><th class="n">Both</th></tr></thead><tbody>
  ${rows.map(r => `<tr><td><a href="participant.html?id=${esc(r.p.id)}">${esc(nameOf(r.p))}</a></td>${TYPES.map(t => `<td class="n">${r.c[t]}</td>`).join('')}<td class="n">${r.match}</td><td class="n">${r.o.model}</td><td class="n">${r.o.extraction}</td><td class="n">${r.o.both}</td></tr>`).join('')}
  </tbody></table></div>
  <h3 style="margin-top:40px">Direction of each divergence</h3><div class="table-scroll">${dirTable}</div></section>
  <section class="fig" id="browse"><p class="fig-n">Browse</p><h3>Every note of one type, across all five people</h3>
  <div class="browse-bar" role="group" aria-label="Choose a type">${[...TYPES, 'match'].map(t => `<button class="chip" data-type="${t}" aria-pressed="false"><span class="sw sw-${t}"></span>${LABEL[t]}</button>`).join('')}</div><ul class="browse" id="bl"></ul></section>
  </div></div>`;
  /* Switching the worked example redraws only that figure. */
  app.addEventListener('change', e => {
    const sel = e.target.closest('.fig-pick select'); if (!sel || typeof FIG === 'undefined') return;
    const [pn, mn] = sel.value.split('-').map(Number), old = document.getElementById('fig-pair');
    const tmp = document.createElement('div'); tmp.innerHTML = FIG.figPair(P, A, pn, mn);
    const fresh = tmp.firstElementChild; fresh.querySelector('.fig-n').textContent = old.querySelector('.fig-n').textContent;
    old.replaceWith(fresh); fresh.insertAdjacentHTML('afterbegin', '<span id="fig-1"></span>'); FIG.drawConnectors(A);
    fresh.querySelector('.fig-pick select').focus();
  });
  /* Figure numbers in the patterns text link to these anchors. */
  list.forEach((f, i) => { const el = document.getElementById(f.id); if (el) el.insertAdjacentHTML('afterbegin', `<span id="fig-${i + 1}"></span>`); });
  const chips = app.querySelectorAll('.browse-bar .chip'), bl = document.getElementById('bl');
  const draw = t => {
    chips.forEach(c => c.setAttribute('aria-pressed', c.dataset.type === t));
    const items = A.annotations.filter(a => a.type === t && isVisible(P, a));
    bl.innerHTML = items.length ? items.map(a => { const p = findP(P, a.participant), m = findM(P, a); return `<li class="t-${a.type}"><p class="kicker">${esc(nameOf(p))} · ${esc(m ? m.title : 'Moment ' + a.moment)}</p>
      ${a.ai_span !== 'none' ? `<p class="b-ai">AI: “${esc(a.ai_span)}”</p>` : ''}${a.transcript_span !== 'none' ? `<p class="b-tr">“${esc(a.transcript_span)}”</p>` : ''}
      <p class="b-note">${esc(a.note)} <a href="participant.html?id=${esc(p.id)}#${esc(a.id)}">See it in context</a></p></li>`; }).join('')
      : '<li class="muted">None of this type are on the public site yet.</li>';
  };
  chips.forEach(c => c.onclick = () => draw(c.dataset.type));
  draw(TYPES.includes(qs.get('type')) || qs.get('type') === 'match' ? qs.get('type') : 'emotional');
  if (typeof FIG !== 'undefined') { window.__A = A; FIG.wireConnectors(A); }
  try {
    const links = [...app.querySelectorAll('.f-toc a')], io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) links.forEach(l => l.classList.toggle('on', l.getAttribute('href') === '#' + e.target.id));
    }), {rootMargin: '-30% 0px -60% 0px'});
    app.querySelectorAll('.fig[id]').forEach(f => io.observe(f));
  } catch {}
  if (location.hash) { const t = document.getElementById(location.hash.slice(1)); if (t) setTimeout(() => t.scrollIntoView(), 50); }
}

function method({P, A}) {
  const s = A.schemes, c = C(), pr = P.project;
  const prompt = esc(pr.prompt).replace(/\[([^\]]+)\]/g, '<span class="slot">[$1]</span>');
  const usedP = new Set(P.participants.flatMap(p => p.moments.map(m => shortSection(m.section))));
  app.innerHTML = `<header class="page-head"><p class="eyebrow">Method</p><h1>How each moment was told twice</h1>
    <p class="lede">${esc(pr.method_summary)}</p><p class="muted">${esc(A.disclosure)}</p></header>

  <section class="section"><div class="section-head"><p class="num">The design</p><div><h2>Ten steps, fixed in advance</h2>
    <p>Where the work departed from the design, the step says so. The full list of deviations is <a href="#deviations">below</a>.</p></div></div>
    <ol class="steps">${(c.steps || []).map((st, i) => `<li><span class="sn">${String(i + 1).padStart(2, '0')}</span><h3>${esc(st.name)}</h3><div><p>${esc(st.text)}</p>${st.as_done ? `<p class="as-done"><b>As carried out</b>${esc(st.as_done)}</p>` : ''}</div></li>`).join('')}</ol></section>

  ${c.selection ? `<section class="section"><div class="section-head"><p class="num">Selecting the moments</p><div><h2>Which stories become moments</h2><p>${esc(c.selection.intro)}</p></div></div>
    <div class="rules">${c.selection.rules.map(r => `<div><b>${esc(r.n)}</b><p>${esc(r.text)}</p></div>`).join('')}</div>
    <p class="protect">${esc(c.selection.protected)}</p></section>` : ''}

  ${c.script ? `<section class="section"><div class="section-head"><p class="num">The interview</p><div><h2>One script for every person</h2><p>${esc(c.script.intro)}</p></div></div>
    ${c.audio_note ? `<p class="protect">${esc(c.audio_note)}</p>` : ''}
    <ul class="script">${c.script.sections.map(x => `<li${usedP.has(x) ? '' : ' class="x"'}>${esc(x)}</li>`).join('')}</ul>
    <p class="muted" style="margin-top:12px">Solid outlines mark the sections that moments on this site come from.</p>
    ${c.script.adapted ? `<p class="protect">${esc(c.script.adapted)}</p>` : ''}
    ${c.script.boundary ? `<div class="rules" style="margin-top:20px">${c.script.boundary.map(r => `<div><b>${esc(r.n)}</b><p>${esc(r.text)}</p></div>`).join('')}</div>` : ''}</section>
  ${c.spec ? `<section class="section" id="spec"><div class="section-head"><p class="num">Technical specification</p><div><h2>The pipeline as a data model</h2><p>${esc(c.spec.intro)}</p></div></div>
    <div class="table-scroll"><table><thead><tr><th>Stage</th><th>Input</th><th>Operation</th><th>Output, and what is logged</th></tr></thead><tbody>${c.spec.rows.map(r => `<tr>${r.map(x => `<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
    <h3 style="margin-top:36px">Annotation record</h3><div class="table-scroll"><table><thead><tr><th>Field</th><th>Values</th><th>Meaning</th></tr></thead><tbody>${c.spec.fields.map(r => `<tr><td><code>${esc(r[0])}</code></td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join('')}</tbody></table></div>
    <p class="muted" style="margin-top:14px">${esc(c.spec.validity)}</p></section>` : ''}
  ${c.consent ? `<section class="section"><div class="section-head"><p class="num">Consent</p><div><h2>What each participant agreed to</h2></div></div>
    <ol class="ledger consent">${c.consent.map(t => `<li><span>${esc(t)}</span></li>`).join('')}</ol></section>` : ''}` : ''}

  <section class="section" id="prompt"><div class="section-head"><p class="num">The fixed prompt</p><div><h2>The same words, every time</h2>
    <p>Only the five fact fields change between runs. Personal names are stripped from them; hospitals, organisations and places are kept where the person named them.</p></div></div>
    <pre class="prompt-doc panel-machine">${prompt}</pre></section>

  <section class="section"><div class="section-head"><p class="num">Coding</p><div><h2>${esc(s.v1.label)}</h2><p>Every point of comparison is coded by type and, for divergences, by direction.</p></div></div>
    <div class="types">${Object.entries(s.v1.types).map(([k, v]) => `<div class="t-${k}"><h4><span class="sw sw-${k}"></span>${esc(LABEL[k] || k)}</h4><p>${esc(v)}</p></div>`).join('')}</div>
    <div class="dirs">${Object.entries(s.v1.direction).map(([k, v]) => `<div><h4>${esc(k[0].toUpperCase() + k.slice(1))}</h4><p>${esc(v)}</p></div>`).join('')}</div></section>

  <section class="section"><div class="section-head"><p class="num">The amendment</p><div><h2>${esc(s.v2.label)}</h2><p>${esc(s.v2.summary)}</p></div></div>
    <div class="amend"><div><p class="kicker">Why the scheme changed</p><p>${esc(s.v2.rationale)}</p></div>
    <div class="after"><p class="kicker">Origin, the added field</p>${Object.entries(s.v2.origin).map(([k, v]) => `<p><b>${esc(ORIGIN[k] || k)}.</b> ${esc(v)}</p>`).join('')}</div></div>
    <div class="prose" style="margin-top:24px"><p class="small">${esc(s.applied)}</p><p class="muted">${esc(s.v2.not_adopted)}</p></div></section>

  ${(P.method_notes || []).length ? `<section class="section" id="deviations"><div class="section-head"><p class="num">Recorded deviations</p><div><h2>Where the work departed from the design</h2>
    <p>Kept as a record, so that every finding can be read against how it was actually produced.</p></div></div>
    <ol class="ledger">${P.method_notes.map(n => `<li><span>${esc(n)}</span></li>`).join('')}</ol></section>` : ''}

  <section class="section"><div class="section-head"><p class="num">Run log</p><div><h2>Every AI run</h2><p>One run per moment, the same prompt each time, with any note on how the moment was selected.</p></div></div>
  <div class="table-scroll"><table><thead><tr><th>Participant</th><th class="n">Moment</th><th>Note</th></tr></thead><tbody>
  ${P.run_log.map(r => { const rp = findP(P, r.participant); return `<tr><td>${esc(rp ? nameOf(rp) : r.participant)}</td><td class="n">${r.moment}</td><td>${esc(r.note || '')}</td></tr>`; }).join('')}
  </tbody></table></div></section>`;
  if (location.hash) { const t = document.getElementById(location.hash.slice(1)); if (t) setTimeout(() => t.scrollIntoView(), 50); }
}

function about({P}) {
  const c = C(), pr = P.project;
  app.innerHTML = `<header class="page-head"><p class="eyebrow">About</p><h1>${esc(pr.title)}</h1><p class="lede">${esc(pr.subtitle)}</p>
    ${c.director ? `<div class="byline"><span class="mono">${esc(c.director[0])}</span><span><b>${esc(c.director)}</b>${esc(c.director_role)}</span></div>` : ''}</header>
  <section class="section two-col"><div class="prose">${(c.overview || []).map(t => `<p class="lede" style="font-size:1.2rem">${esc(t)}</p>`).join('')}</div>
    <div class="prose">${(c.lineage || []).map(t => `<p>${esc(t)}</p>`).join('')}</div></section>
  <section class="section question"><p class="num">The question</p>
    <div><blockquote>${esc(pr.core_question)}</blockquote></div></section>
  ${(c.outputs || []).length ? `<section class="section"><div class="section-head"><p class="num">Outputs</p><div><h2>Outputs</h2></div></div>
    <div class="outputs">${c.outputs.map(o => `<div><h3>${esc(o.name)}</h3><p>${esc(o.text)}</p></div>`).join('')}</div></section>` : ''}
  <section class="section"><div class="section-head"><p class="num">Consent and review</p><div><h2>Reviewed by the people in it</h2></div></div>
    <div class="ethics">${(c.ethics || []).map((t, i) => `<div><span class="i">${String(i + 1).padStart(2, '0')}</span><p>${esc(t)}</p></div>`).join('')}</div>
    <p class="cta"><a class="btn" href="participants.html">Read the accounts ${arrow}</a><a class="btn ghost" href="method.html">Read the method</a></p></section>
  ${c.email ? `<section class="section" id="contact"><div class="section-head"><p class="num">Contact</p><div><h2>Get in touch</h2><p>For questions about the project or its method, or if you appear in it and want to discuss your material, write to ${esc(c.director)} at <a href="mailto:${esc(c.email)}">${esc(c.email)}</a>.</p></div></div></section>` : ''}`;
}

/* The report, typeset as a paper (assets/report.js). */
function report({P, A}) {
  document.body.classList.add('paper-page');
  app.innerHTML = `<article class="paper">${typeof renderReport === 'function' ? renderReport(P, A, esc, nameOf) : ''}</article>`;
}

/* Researcher-only. Do not publish review.html. */
function review({P, A}) {
  const KEY = 'diasporagy-grades', g = JSON.parse(localStorage.getItem(KEY) || '{}');
  const save = () => localStorage.setItem(KEY, JSON.stringify(g));
  app.innerHTML = `<h1 style="margin-top:48px">Review</h1><p class="placeholder">Researcher-only page. Never publish it. Grades are stored in this browser until exported.</p>
  <p><select id="fp"><option value="">All participants</option>${P.participants.map(p => `<option value="${p.id}">${esc(p.full_name)}</option>`).join('')}</select>
  <select id="ft"><option value="">All types</option>${[...TYPES, 'match'].map(t => `<option value="${t}">${LABEL[t]}</option>`).join('')}</select>
  <button class="plain" id="chk">Check spans</button> <button class="plain" id="csv">Export grades (CSV)</button> <button class="plain" id="json">Export all annotations (JSON)</button> <button class="plain" id="pub">Export public-safe data files</button></p>
  <pre id="chkout" hidden></pre>
  <div class="table-scroll"><table><thead><tr><th>ID</th><th>Verdict</th><th>AI span</th><th>Transcript span</th><th>Note</th><th>Grade</th></tr></thead><tbody id="rb"></tbody></table></div>`;
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

chrome();
try {
  const d = load();
  ({home, participants, participant:participantPage, findings, method, about, report, review})[page](d);
} catch (e) {
  app.innerHTML = `<p class="placeholder" style="margin-top:48px">Something went wrong: ${esc(e.message)}. Press F12 and open the Console tab for details.</p>`;
  console.error(e);
}
