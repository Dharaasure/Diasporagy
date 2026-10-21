'use strict';
/* Diasporagy figures. Every number is computed in the browser from data/p1.js to p5.js and data/measures.js,
   so a figure can never disagree with the annotations it summarises. Used by the Findings page. */
const FIG = (() => {
  const TYPES = ['factual', 'emotional', 'relational', 'cultural'];
  const TLAB = {factual:'Factual', emotional:'Emotional', relational:'Relational', cultural:'Cultural', match:'Match'};
  const OLAB = {model:'Introduced by the AI', both:'Set up by the facts, elaborated by the AI', extraction:'Came from the extracted facts'};
  const DLAB = {invented:'Invented', altered:'Altered', omitted:'Omitted'};
  const KLAB = {N:'Numbers, dates and times', E:'Events and actions', C:'Names, places and own words', P:'People and relationships', F:'Feelings and meaning'};
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pct = (a, b) => b ? Math.round(100 * a / b) : 0;
  const sum = xs => xs.reduce((s, x) => s + x, 0);
  const T = (x, y, s, o = {}) => `<text x="${x}" y="${y}"${o.anchor ? ` text-anchor="${o.anchor}"` : ''} class="${o.cls || 't2'}"${o.w ? ` font-weight="${o.w}"` : ''}>${esc(s)}</text>`;
  const short = (s, n) => s.length > n ? s.slice(0, n - 1) + '…' : s;

  function ctx(P, A) {
    const M = window.MEASURES || {moments: [], names: [], content_kind: {}};
    const pById = Object.fromEntries(P.participants.map(p => [p.id, p]));
    const label = (num, n) => { const p = P.participants.find(x => x.number === num); const m = p && p.moments.find(x => x.n === n); return {p, m, tag: `P${num} · ${n}`, title: m ? m.title : ''}; };
    return {M, pById, label, div: A.annotations.filter(a => a.type !== 'match')};
  }

  /* Figures are numbered in the order render() draws them; `drawn` feeds the Findings page's contents column. */
  const SHORT = {'fig-pair':'One moment, told twice', 'fig-flow':'Where divergences begin', 'fig-kinds':'What the AI gets right', 'fig-strips':'Where in the account', 'fig-tone':'Tone', 'fig-voice':'Voice: “we” and hedges', 'fig-names':'Names'};
  let drawn = [];
  function frame(id, title, sub, svg, table, source) {
    drawn.push({id, short: SHORT[id] || title});
    return `<figure class="fig" id="${id}"><p class="fig-n">Figure ${drawn.length}</p><h3>${esc(title)}</h3>${sub ? `<p class="fig-sub">${sub}</p>` : ''}<div class="fig-body">${svg}</div>
      <details class="fig-data"><summary>Show the data</summary><div class="table-scroll">${table}</div></details>
      <figcaption>${esc(source)}</figcaption></figure>`;
  }
  const table = (head, rows) => `<table><thead><tr>${head.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;

  /* 1. Where divergences begin, and what they do: origin -> direction flow */
  function fig1(P, A, C) {
    const O = ['model', 'both', 'extraction'], D = ['invented', 'altered', 'omitted'];
    const f = (o, d) => C.div.filter(a => a.origin === o && a.direction === d).length;
    const tot = C.div.length; if (!tot) return '';
    const W = 760, H = 380, y0 = 40, gap = 14, nodeW = 14, xL = 230, xR = 516, avail = H - y0 - 20 - gap * 2, k = avail / tot;
    const place = (keys, cnt) => { let y = y0; return Object.fromEntries(keys.map(key => { const h = cnt(key) * k, r = {y, h}; y += h + gap; return [key, r]; })); };
    const L = place(O, o => sum(D.map(d => f(o, d)))), R = place(D, d => sum(O.map(o => f(o, d))));
    const offL = Object.fromEntries(O.map(o => [o, L[o].y])), offR = Object.fromEntries(D.map(d => [d, R[d].y]));
    let links = '';
    for (const o of O) for (const d of D) {
      const n = f(o, d); if (!n) continue; const h = n * k, ya = offL[o], yb = offR[d]; offL[o] += h; offR[d] += h;
      const xa = xL + nodeW, xb = xR, mx = (xa + xb) / 2;
      links += `<path class="flow o-${o}" d="M${xa},${ya} C${mx},${ya} ${mx},${yb} ${xb},${yb} L${xb},${yb + h} C${mx},${yb + h} ${mx},${ya + h} ${xa},${ya + h} Z"><title>${esc(OLAB[o])} → ${DLAB[d].toLowerCase()}: ${n}</title></path>`;
    }
    const nodes = O.map(o => `<rect class="node o-${o}" x="${xL}" y="${L[o].y}" width="${nodeW}" height="${L[o].h}" rx="2"><title>${esc(OLAB[o])}: ${sum(D.map(d => f(o, d)))}</title></rect>
        ${T(xL - 10, L[o].y + L[o].h / 2 - 4, OLAB[o].replace('Set up by the facts, elaborated by the AI', 'Facts, then the AI'), {anchor:'end', cls:'t1'})}${T(xL - 10, L[o].y + L[o].h / 2 + 13, sum(D.map(d => f(o, d))) + ' divergences', {anchor:'end'})}`).join('')
      + D.map(d => `<rect class="node ink" x="${xR}" y="${R[d].y}" width="${nodeW}" height="${R[d].h}" rx="2"/>
        ${T(xR + nodeW + 10, R[d].y + R[d].h / 2 - 4, DLAB[d], {cls:'t1'})}${T(xR + nodeW + 10, R[d].y + R[d].h / 2 + 13, sum(O.map(o => f(o, d))) + ' · ' + {invented:'added', altered:'changed', omitted:'left out'}[d])}`).join('');
    const svg = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Flow from where each divergence began to what it did">
      ${T(xL + nodeW / 2, 22, 'Where it began', {anchor:'middle', cls:'t2 cap'})}${T(xR + nodeW / 2, 22, 'What it did', {anchor:'middle', cls:'t2 cap'})}${links}${nodes}</svg>`;
    const inv = sum(O.map(o => f(o, 'invented'))), om = sum(O.map(o => f(o, 'omitted')));
    const title = `The AI adds; the summary removes: ${f('model', 'invented')} of ${inv} inventions came from the AI, ${f('extraction', 'omitted')} of ${om} omissions from the extracted facts`;
    const sub = `Every divergence, traced from where it began to what it did. Before the AI saw anything, the researcher's five-line summary had already decided what it could not know.`;
    return frame('fig-flow', title, sub, svg, table(['Began in', ...D.map(d => DLAB[d]), 'Total'], O.map(o => [OLAB[o], ...D.map(d => f(o, d)), sum(D.map(d => f(o, d)))])), `${tot} divergences across all moments loaded on this page.`);
  }

  /* 2. One moment, the two accounts joined line by line (interactive; drawn after layout) */
  function placeSpans(text, items) {
    const found = items.map(it => ({...it, i: text.indexOf(it.span)})).filter(x => x.span && x.span !== 'none' && x.i >= 0).sort((a, b) => a.i - b.i || b.span.length - a.span.length);
    const marks = []; let pos = -1;
    for (const x of found) { if (x.i >= pos) { marks.push({s: x.i, e: x.i + x.span.length, ids: [x.id], type: x.type}); pos = x.i + x.span.length; } else { const host = marks.find(m => x.i >= m.s && x.i < m.e); if (host) host.ids.push(x.id); } }
    let out = '', at = 0;
    for (const m of marks) { out += esc(text.slice(at, m.s)) + `<mark class="cn t-${m.type}" data-ids="${m.ids.join(' ')}">${esc(text.slice(m.s, m.e))}</mark>`; at = m.e; }
    return (out + esc(text.slice(at))).replace(/\n{2,}/g, '<br><br>');
  }
  function pairBlock(p, m, anns) {
    const tr = placeSpans(m.transcript_excerpt, anns.map(a => ({id: a.id, span: a.transcript_span, type: a.type})));
    const ai = placeSpans(m.ai_output, anns.map(a => ({id: a.id, span: a.ai_span, type: a.type})));
    return `<div class="conn" data-p="${p.id}" data-n="${m.n}"><div class="conn-col"><p class="kicker">In their words</p><div class="conn-text">${tr}</div></div>
      <div class="conn-gutter"></div><div class="conn-col"><p class="kicker">The AI version</p><div class="conn-text">${ai}</div></div><svg class="conn-lines" aria-hidden="true"></svg></div>
      <div class="conn-note muted">Hover or tap a highlight to see its partner and the note.</div>`;
  }
  const pairLegend = () => `<p class="fig-legend">${[...TYPES, 'match'].map(t => `<span><i class="sw sw-${t}"></i>${TLAB[t]}</span>`).join('')}<span>Double underline: no partner on the other side</span></p>`;
  function fig2(P, A, C, num = 1, n = 1) {
    const {p, m} = C.label(num, n); if (!p || !m || !m.ai_output) return '';
    const anns = A.annotations.filter(a => a.participant === p.id && a.moment === n && a.public !== false);
    const counts = TYPES.map(t => `${anns.filter(a => a.type === t).length} ${t}`).join(', ');
    const nm = anns.filter(a => a.type === 'match').length, nd = anns.length - nm;
    const title = `One moment, told twice: ${nd} divergences and ${nm} matches in “${m.title}”`;
    return frame('fig-pair', title, `Each line joins a passage in the AI version to the words it came from. Highlights with no line were invented by the AI (right) or left out of it (left). ${pairLegend()}`, pairBlock(p, m, anns),
      table(['Type', 'AI', 'Transcript'], anns.map(a => [TLAB[a.type], a.ai_span, a.transcript_span])), `${nameOf(p)}, Moment ${n}. ${counts}.`);
  }
  function drawConnectors(A) {
    for (const box of document.querySelectorAll('.conn')) {
      const svg = box.querySelector('.conn-lines'), cols = box.querySelectorAll('.conn-text'), b = box.getBoundingClientRect();
      if (!box.offsetParent || getComputedStyle(box.querySelector('.conn-gutter')).display === 'none') { svg.innerHTML = ''; continue; }
      const byId = Object.fromEntries(A.annotations.map(a => [a.id, a]));
      const where = (col, id) => [...col.querySelectorAll('mark.cn')].find(m => m.dataset.ids.split(' ').includes(id));
      const xL = cols[0].getBoundingClientRect().right - b.left + 4, xR = cols[1].getBoundingClientRect().left - b.left - 4, mx = (xL + xR) / 2;
      svg.setAttribute('viewBox', `0 0 ${b.width} ${b.height}`); svg.setAttribute('width', b.width); svg.setAttribute('height', b.height);
      let s = '';
      const ids = new Set([...box.querySelectorAll('mark.cn')].flatMap(m => m.dataset.ids.split(' ')));
      for (const id of ids) {
        const a = byId[id], l = where(cols[0], id), r = where(cols[1], id);
        l && l.classList.toggle('solo', !r); r && r.classList.toggle('solo', !l);
        if (!l || !r) continue;
        const rl = l.getClientRects()[0], rr = r.getClientRects()[0], ya = rl.top + rl.height / 2 - b.top, yb = rr.top + rr.height / 2 - b.top;
        s += `<path class="cl t-${a.type}" data-id="${id}" d="M${xL},${ya} C${mx},${ya} ${mx},${yb} ${xR},${yb}"/><circle class="cl-dot t-${a.type}" cx="${xL}" cy="${ya}" r="3"/><circle class="cl-dot t-${a.type}" cx="${xR}" cy="${yb}" r="3"/>`;
      }
      svg.innerHTML = s;
    }
  }
  function wireConnectors(A) {
    const byId = Object.fromEntries(A.annotations.map(a => [a.id, a]));
    const on = (e) => {
      const mk = e.target.closest('mark.cn'); const box = e.target.closest('.conn'); if (!box) return;
      box.querySelectorAll('.hot').forEach(x => x.classList.remove('hot')); box.classList.toggle('focus', !!mk);
      if (!mk) return; const ids = mk.dataset.ids.split(' ');
      box.querySelectorAll('mark.cn').forEach(m => { if (m.dataset.ids.split(' ').some(i => ids.includes(i))) m.classList.add('hot'); });
      box.querySelectorAll('path.cl').forEach(pth => { if (ids.includes(pth.dataset.id)) pth.classList.add('hot'); });
      const a = byId[ids[0]]; box.nextElementSibling.innerHTML = `<b>${TLAB[a.type]}${a.direction ? ' · ' + esc(a.direction) : ''}${a.origin ? ' · ' + esc(OLAB[a.origin]) : ''}</b><br>${esc(a.note)}`;
    };
    if (!wireConnectors.done) { document.addEventListener('mouseover', on); document.addEventListener('click', on); wireConnectors.done = true; }
    let t; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => drawConnectors(A), 120); });
    drawConnectors(A); if (document.fonts) document.fonts.ready.then(() => drawConnectors(A));
  }
  let nameOf = p => p.full_name;

  /* 3. Where in each AI account the divergences fall */
  function fig3(P, A, C) {
    const rows = [], dec = Array(10).fill(0), tot = Array(10).fill(0);
    for (const p of P.participants) for (const m of p.moments) {
      if (!m.ai_output || m.site_status !== 'public' && !m.ai_output) continue;
      const t = m.ai_output, cls = Array(t.length).fill(null);
      const anns = A.annotations.filter(a => a.participant === p.id && a.moment === m.n && a.ai_span !== 'none' && a.public !== false);
      for (const a of anns.filter(a => a.type === 'match')) { const i = t.indexOf(a.ai_span); if (i >= 0) for (let q = i; q < i + a.ai_span.length; q++) cls[q] = 'match'; }
      for (const a of anns.filter(a => a.type !== 'match')) { const i = t.indexOf(a.ai_span); if (i >= 0) for (let q = i; q < i + a.ai_span.length; q++) cls[q] = a.type; }
      const segs = []; for (let q = 0; q < t.length; q++) { const c = cls[q] || 'none'; if (segs.length && segs.at(-1).c === c) segs.at(-1).e = q + 1; else segs.push({c, s: q, e: q + 1}); }
      for (let q = 0; q < t.length; q++) { if (/\s/.test(t[q])) continue; const bkt = Math.min(9, Math.floor(10 * q / t.length)); tot[bkt]++; if (cls[q] && cls[q] !== 'match') dec[bkt]++; }
      rows.push({tag: `P${p.number} · ${m.n}`, title: m.title, L: t.length, segs, text: t});
    }
    if (!rows.length) return '';
    const share = dec.map((x, i) => pct(x, tot[i])), W = 760, x0 = 210, bw = W - x0 - 20, rh = 22, top = 200;
    const H = top + rows.length * rh + 30, colW = bw / 10, maxS = 100, ch = 110, cy = 40;
    let svg = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Where divergences fall along each AI account">`;
    svg += T(x0 - 12, cy + 4, 'Share of text', {anchor:'end'}) + T(x0 - 12, cy + 20, 'that diverges', {anchor:'end'});
    svg += `<line class="grid" x1="${x0}" x2="${x0 + bw}" y1="${cy + ch}" y2="${cy + ch}"/>`;
    share.forEach((v, i) => { const h = ch * v / maxS, x = x0 + i * colW + 6, w = colW - 12;
      svg += `<path class="${i === 9 ? 'acc' : 'grey'}" d="M${x},${cy + ch} V${cy + ch - h + 4} q0,-4 4,-4 h${w - 8} q4,0 4,4 V${cy + ch} Z"><title>${i * 10} to ${i * 10 + 10}% of the way through: ${v}% diverges</title></path>${T(x + w / 2, cy + ch - h - 6, v + '%', {anchor:'middle', cls: i === 9 ? 't1' : 't2'})}`; });
    svg += T(x0, cy + ch + 18, 'Start of account', {}) + T(x0 + bw, cy + ch + 18, 'End', {anchor:'end'});
    rows.forEach((r, j) => { const y = top + j * rh;
      svg += T(x0 - 12, y + 13, `${r.tag}  ${short(r.title, 22)}`, {anchor:'end'});
      for (const s of r.segs) { const x = x0 + bw * s.s / r.L, w = Math.max(0.5, bw * (s.e - s.s) / r.L - 1);
        svg += `<rect class="seg s-${s.c}" x="${x}" y="${y}" width="${w}" height="14"><title>${s.c === 'none' ? 'Not annotated' : TLAB[s.c]}: “${esc(short(r.text.slice(s.s, s.e).replace(/\s+/g, ' '), 140))}”</title></rect>`; } });
    svg += T(x0, H - 6, 'Each row is one AI account, start to end. Colour shows the type of divergence; grey marks a match.', {}) + '</svg>';
    const first = pct(sum(dec.slice(0, 5)), sum(tot.slice(0, 5)));
    const legend = `<p class="fig-legend">${[...TYPES, 'match'].map(t => `<span><i class="sw sw-${t}"></i>${TLAB[t]}</span>`).join('')}<span><i class="sw sw-none"></i>Not annotated</span></p>`;
    return frame('fig-strips', `The endings diverge most: ${share[9]}% of the final tenth of each AI account, against ${first}% of the first half`,
      `The AI tends to close on a line of its own, such as a speech to a daughter or a joke. ${legend}`, svg,
      table(['Position in account', 'Share diverging'], share.map((v, i) => [`${i * 10} to ${i * 10 + 10}%`, v + '%'])), `${rows.length} AI accounts on this page. Characters inside divergence spans, as a share of all non-space characters in each tenth.`);
  }

  /* 4. "We" and hedges, before and after */
  function fig4(P, A, C) {
    const ms = C.M.moments.filter(r => C.label(r.p, r.n).m && C.label(r.p, r.n).m.ai_output); if (!ms.length) return '';
    const W = 760, H = 330, pw = 300, gapX = 120, x0 = 60, y0 = 56, ph = 220;
    const we = r => [pct(r.t_we, r.t_we + r.t_i), pct(r.a_we, r.a_we + r.a_i)], hd = r => [100 * r.t_hedge / r.t_words, 100 * r.a_hedge / r.a_words];
    const drop = ms.map(r => ({r, d: we(r)[0] - we(r)[1]})).sort((a, b) => b.d - a.d)[0].r;
    const panel = (px, title, fn, max, unit, fmt, hiFn) => {
      let s = T(px, y0 - 30, title, {cls:'t1', w:600}); const yv = v => y0 + ph - ph * v / max;
      (max === 100 ? [0, 50, 100] : Array.from({length: Math.floor(max) + 1}, (_, i) => i)).forEach(v => { s += `<line class="grid" x1="${px}" x2="${px + pw}" y1="${yv(v)}" y2="${yv(v)}"/>` + T(px - 8, yv(v) + 4, fmt(v) + unit, {anchor:'end'}); });
      s += T(px, y0 + ph + 20, 'Their words', {}) + T(px + pw, y0 + ph + 20, 'AI version', {anchor:'end'});
      const order = [...ms].sort((a, b) => (hiFn(a) ? 1 : 0) - (hiFn(b) ? 1 : 0));
      for (const r of order) { const [a, b] = fn(r), hi = hiFn(r), lab = C.label(r.p, r.n);
        s += `<g class="${hi ? 'acc-line' : 'grey-line'}"><line x1="${px}" x2="${px + pw}" y1="${yv(a)}" y2="${yv(b)}"/><circle cx="${px}" cy="${yv(a)}" r="4"/><circle cx="${px + pw}" cy="${yv(b)}" r="4"/><title>${lab.tag} ${esc(lab.title)}: ${fmt(a)}${unit} → ${fmt(b)}${unit}</title></g>`;
        if (hi) s += T(px + 10, yv(a) - 10, `${lab.tag} ${lab.title}`, {cls:'t1'}); }
      return s;
    };
    const tw = sum(ms.map(r => r.t_we)), ti = sum(ms.map(r => r.t_i)), aw = sum(ms.map(r => r.a_we)), ai = sum(ms.map(r => r.a_i));
    const th = sum(ms.map(r => r.t_hedge)), ah = sum(ms.map(r => r.a_hedge));
    const maxH = Math.max(1.5, ...ms.flatMap(hd));
    const svg = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Share of we, and hedges per 100 words, in each person's words and the AI version">
      ${panel(x0, '“We” as a share of first-person words', we, 100, '%', v => Math.round(v), r => r === drop)}
      ${panel(x0 + pw + gapX, 'Hedges per 100 words', hd, Math.ceil(maxH), '', v => v.toFixed(1).replace('.0', ''), r => false)}</svg>`;
    const [d0, d1] = we(drop);
    return frame('fig-voice', `The AI dropped ${th - ah} of ${th} hedges and kept “we” overall (${pct(tw, tw + ti)}% to ${pct(aw, aw + ai)}%), except where “we” carried the story: ${d0}% to ${d1}%`,
      `Hedges are words like “I think”, “maybe” and “or something”. Without them the AI's narrators sound surer than the people were. “We” barely moves on average, but in Participant ${drop.p}'s airport story the community's “we” became one man's “I”.`, svg,
      table(['Moment', '“We” share: their words', '“We” share: AI', 'Hedges: their words', 'Hedges: AI', 'Words: their words', 'Words: AI'], ms.map(r => [C.label(r.p, r.n).tag, we(r)[0] + '%', we(r)[1] + '%', r.t_hedge, r.a_hedge, r.t_words, r.a_words])),
      'Counts of we/us/our and I/me/my, and of thirteen hedge phrases, in the participant speech of each shown excerpt and in the AI version.');
  }

  /* 5. Tone, before and after */
  function fig5(P, A, C) {
    const ms = C.M.moments.filter(r => C.label(r.p, r.n).m && C.label(r.p, r.n).m.ai_output); if (!ms.length) return '';
    const sorted = [...ms].sort((a, b) => (b.t_tone - b.a_tone) - (a.t_tone - a.a_tone));
    const W = 760, x0 = 230, xw = 480, rh = 26, y0 = 40, H = y0 + sorted.length * rh + 40;
    const lo = Math.min(-0.1, ...ms.flatMap(r => [r.t_tone, r.a_tone])), hi = Math.max(0.3, ...ms.flatMap(r => [r.t_tone, r.a_tone]));
    const x = v => x0 + xw * (v - lo) / (hi - lo);
    let s = `<line class="axis0" x1="${x(0)}" x2="${x(0)}" y1="${y0 - 14}" y2="${H - 34}"/>` + T(x(0), y0 - 20, 'neutral', {anchor:'middle'});
    [lo, 0.1, 0.2, hi].forEach(v => { s += T(x(v), H - 16, (v > 0 ? '+' : '') + v.toFixed(1), {anchor:'middle'}); });
    s += T(x(lo), H - 2, '← more negative', {}) + T(x(hi), H - 2, 'more positive →', {anchor:'end'});
    sorted.forEach((r, j) => { const y = y0 + j * rh + 8, lab = C.label(r.p, r.n), down = r.a_tone < r.t_tone;
      s += T(x0 - 14, y + 4, `${lab.tag}  ${short(lab.title, 24)}`, {anchor:'end'});
      s += `<g><line class="${down ? 'acc-stem' : 'grey-stem'}" x1="${x(r.t_tone)}" x2="${x(r.a_tone)}" y1="${y}" y2="${y}"/><circle class="dot-them" cx="${x(r.t_tone)}" cy="${y}" r="5"/><circle class="${down ? 'dot-ai' : 'dot-ai-up'}" cx="${x(r.a_tone)}" cy="${y}" r="5"/><title>${lab.tag} ${esc(lab.title)}: their words ${r.t_tone.toFixed(2)}, AI ${r.a_tone.toFixed(2)}</title></g>`; });
    const svg = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Average emotional tone of each account, the person's words against the AI version">${s}</svg>`;
    const k = ms.filter(r => r.a_tone < r.t_tone).length;
    return frame('fig-tone', `The tone fell in ${k} of ${ms.length} accounts, most sharply where people spoke of care, pride and friendship`,
      `<span class="key"><i class="dot-key them"></i>Their words</span> <span class="key"><i class="dot-key ai"></i>AI version</span> Average sentence tone, from a standard word-list scorer. It is a blunt tool, so I read it as a direction only.`, svg,
      table(['Moment', 'Tone: their words', 'Tone: AI', 'Change'], sorted.map(r => [C.label(r.p, r.n).tag, r.t_tone.toFixed(3), r.a_tone.toFixed(3), (r.a_tone - r.t_tone).toFixed(3)])),
      'VADER compound score (−1 to +1), averaged over sentences of three words or more, in the participant speech of each excerpt and in the AI version.');
  }

  /* 6. Names kept and lost, and where each was lost */
  function fig6(P, A, C) {
    const ok = x => { const l = C.label(x.p, x.n); return l.m && l.m.ai_output; };
    const N = C.M.names.filter(ok), cats = ['Places', 'Organisations', 'People and communities', 'Events and own words'];
    const src = N.filter(x => x.category !== 'Added by the AI'), added = N.filter(x => x.category === 'Added by the AI'); if (!src.length) return '';
    const W = 760, x0 = 220, xw = 440, rh = 40, y0 = 30, max = Math.max(...cats.map(c => src.filter(x => x.category === c).length), added.length), H = y0 + (cats.length + 1) * rh + 74;
    const sx = v => xw * v / max; let s = '';
    const stack = (y, parts, label, note) => { let out = T(x0 - 14, y + 15, label, {anchor:'end', cls:'t1'}), x = x0;
      for (const [cls, xs, what] of parts) { if (!xs.length) continue; const w = sx(xs.length);
        out += `<rect class="${cls}" x="${x}" y="${y}" width="${Math.max(0, w - 2)}" height="22" rx="2"><title>${what} (${xs.length}): ${esc(xs.map(x => x.label).join(', '))}</title></rect>`; x += w; }
      return out + T(x + 6, y + 15, note, {}); };
    cats.forEach((c, j) => { const xs = src.filter(x => x.category === c);
      s += stack(y0 + j * rh, [['keep', xs.filter(x => x.kept), 'Kept'], ['o-model', xs.filter(x => !x.kept && x.in_facts), 'Dropped by the AI'], ['acc', xs.filter(x => !x.kept && !x.in_facts), 'Not in the summary']], c, `${xs.filter(x => !x.kept).length} lost of ${xs.length}`); });
    const ya = y0 + cats.length * rh + 14, fromF = added.filter(x => x.in_facts), inv = added.filter(x => !x.in_facts);
    s += `<line class="grid" x1="20" x2="${W - 20}" y1="${ya - 8}" y2="${ya - 8}"/>` + stack(ya + 8, [['o-both', fromF, 'From the summary'], ['inv', inv, 'Invented by the AI']], 'Not in their words', `${added.length}`);
    s += T(x0, ya + 52, `Invented by the AI: ${inv.map(x => x.label).filter((v, i, a) => a.indexOf(v) === i).join(' · ')}`, {cls:'t1'}) + T(x0, ya + 70, `From the summary: ${fromF.map(x => x.label).filter((v, i, a) => a.indexOf(v) === i).join(' · ')}`, {});
    const svg = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Named places, organisations, people and own words kept or lost, and where each was lost">${s}</svg>`;
    const lost = src.filter(x => !x.kept), lostSum = lost.filter(x => !x.in_facts).length;
    return frame('fig-names', `${lost.length} of ${src.length} names were lost, and ${lostSum} of those never reached the AI: the summary had already removed them`,
      `<span class="key"><i class="sq keep"></i>Kept</span> <span class="key"><i class="sq acc"></i>Not in the summary</span> <span class="key"><i class="sq grey"></i>In the summary, dropped by the AI</span> <span class="key"><i class="sq both"></i>Added from the summary</span> <span class="key"><i class="sq inv"></i>Invented by the AI</span> Named employers, schools, ministries and festivals are what place a person in Doha. The researcher's five-line summary removed most of them; the AI removed a few more and invented a few of its own, including a name for a child.`, svg,
      table(['Moment', 'Name', 'Kind', 'In the summary', 'In the AI version'], N.map(x => [C.label(x.p, x.n).tag, x.label, x.category, x.in_facts ? 'yes' : 'no', x.kept === null ? 'added' : x.kept ? 'kept' : 'lost'])),
      'Named items hand-listed from each shown excerpt, matched as whole words in the five-line summary given to the AI and in the AI version.');
  }

  /* 7. What the AI gets right, by kind of content */
  function fig7(P, A, C) {
    const K = C.M.content_kind || {}, anns = A.annotations.filter(a => K[a.id]);
    if (!anns.length) return '';
    const rows = Object.keys(KLAB).map(k => { const xs = anns.filter(a => K[a.id] === k); return {k, m: xs.filter(a => a.type === 'match').length, d: xs.filter(a => a.type !== 'match').length}; })
      .filter(r => r.m + r.d).sort((a, b) => pct(b.m, b.m + b.d) - pct(a.m, a.m + a.d));
    const W = 760, x0 = 230, xw = 430, rh = 42, y0 = 30, H = y0 + rows.length * rh + 30; let s = '';
    rows.forEach((r, j) => { const y = y0 + j * rh, n = r.m + r.d, wm = xw * r.m / n;
      s += T(x0 - 14, y + 15, KLAB[r.k], {anchor:'end', cls:'t1'}) +
        `<rect class="grey" x="${x0}" y="${y}" width="${Math.max(0, wm - 2)}" height="22" rx="2"><title>${KLAB[r.k]}: ${r.m} matches</title></rect><rect class="acc" x="${x0 + wm}" y="${y}" width="${xw - wm}" height="22" rx="2"><title>${KLAB[r.k]}: ${r.d} divergences</title></rect>` +
        T(x0 + xw + 10, y + 15, `${pct(r.m, n)}% matched · ${n}`, {}); });
    s += T(x0, H - 6, '0%', {}) + T(x0 + xw, H - 6, '100%', {anchor:'end'});
    const svg = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Share of annotations that were matches, by kind of content">${s}</svg>`;
    const by = Object.fromEntries(rows.map(r => [r.k, pct(r.m, r.m + r.d)]));
    return frame('fig-kinds', `The AI got ${by.N}% of numbers and times and ${by.E}% of events right, but only ${by.F}% of feelings`,
      `<span class="key"><i class="sq grey"></i>Matched</span> <span class="key"><i class="sq acc"></i>Diverged</span> Every annotation, sorted by what it is about. The facts the AI was given largely survive; what the person made of them does not.`, svg,
      table(['Kind of content', 'Matches', 'Divergences', 'Share matched'], rows.map(r => [KLAB[r.k], r.m, r.d, pct(r.m, r.m + r.d) + '%'])),
      'Matches coded by hand; divergences from their type (feelings = emotional, people = relational, names = cultural; factual split by hand). Content kinds are a derived code for the researcher to review.');
  }

  function render(P, A, nameFn) {
    nameOf = nameFn; drawn = []; const C = ctx(P, A);
    return [fig2(P, A, C, 1, 1), fig1(P, A, C), fig7(P, A, C), fig3(P, A, C), fig5(P, A, C), fig4(P, A, C), fig6(P, A, C)].join('');
  }
  return {render, drawn: () => drawn, wireConnectors, drawConnectors, pairBlock, pairLegend, figPair: (P, A, num, n) => fig2(P, A, ctx(P, A), num, n), setNameOf: fn => { nameOf = fn; }};
})();
