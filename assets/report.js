'use strict';
/* The report, written as an academic oral history article. Every number and table is computed from the same
   annotation data as the rest of the site, so the paper cannot drift from the evidence it reports. */
function renderReport(P, A, esc, nameOf) {
  const TYPES = ['factual', 'emotional', 'relational', 'cultural'], DIRS = ['invented', 'omitted', 'altered'], ORIG = ['model', 'extraction', 'both'];
  const T = {factual:'Factual', emotional:'Emotional', relational:'Relational', cultural:'Cultural'};
  const ann = A.annotations, div = ann.filter(a => a.type !== 'match'), nM = ann.length - div.length;
  const n = f => ann.filter(f).length, pc = (a, b) => b ? Math.round(100 * a / b) : 0;
  const MS = window.MEASURES || {moments: [], names: [], content_kind: {}}, K = MS.content_kind || {};
  const kind = k => { const xs = ann.filter(a => K[a.id] === k); return {m: xs.filter(a => a.type === 'match').length, t: xs.length}; };
  const kN = kind('N'), kE = kind('E'), kC = kind('C'), kP = kind('P'), kF = kind('F');
  const inv = div.filter(a => a.direction === 'invented'), om = div.filter(a => a.direction === 'omitted'), alt = div.filter(a => a.direction === 'altered');
  const invM = inv.filter(a => a.origin === 'model').length, omX = om.filter(a => a.origin === 'extraction').length;
  const fromSummary = div.filter(a => a.origin !== 'model').length;
  const moments = P.participants.flatMap(p => p.moments.filter(m => m.ai_output).map(m => ({p, m})));
  const words = s => s ? s.trim().split(/\s+/).length : 0;
  const avg = f => Math.round(moments.reduce((s, x) => s + words(f(x.m)), 0) / moments.length);
  const tone = MS.moments.filter(r => moments.some(x => x.p.number === r.p && x.m.n === r.n));
  const toneDown = tone.filter(r => r.a_tone < r.t_tone).length;
  const hT = tone.reduce((s, r) => s + r.t_hedge, 0), hA = tone.reduce((s, r) => s + r.a_hedge, 0);
  const names = MS.names.filter(x => x.category !== 'Added by the AI'), lost = names.filter(x => !x.kept), lostEarly = lost.filter(x => !x.in_facts).length;
  const added = MS.names.filter(x => x.category === 'Added by the AI'), invented = [...new Set(added.filter(x => !x.in_facts).map(x => x.label))];
  const byId = Object.fromEntries(ann.map(a => [a.id, a]));
  const q = id => byId[id] || {ai_span: '', transcript_span: '', note: ''};
  const who = num => nameOf(P.participants.find(p => p.number === num));
  /* Shares of each tenth of every AI account covered by divergent spans. */
  const tenth = Array(10).fill(0), tot = Array(10).fill(0);
  for (const {p, m} of moments) {
    const t = m.ai_output, cls = Array(t.length).fill(0);
    for (const a of ann.filter(a => a.participant === p.id && a.moment === m.n && a.type !== 'match' && a.ai_span !== 'none')) { const i = t.indexOf(a.ai_span); if (i >= 0) for (let k = i; k < i + a.ai_span.length; k++) cls[k] = 1; }
    for (let k = 0; k < t.length; k++) if (!/\s/.test(t[k])) { const b = Math.min(9, Math.floor(10 * k / t.length)); tot[b]++; tenth[b] += cls[k]; }
  }
  const firstHalf = pc(tenth.slice(0, 5).reduce((s, x) => s + x, 0), tot.slice(0, 5).reduce((s, x) => s + x, 0)), last = pc(tenth[9], tot[9]);

  let tab = 0, sec = 0, sub = 0, fg = 0;
  const S = t => { sec++; sub = 0; return `<h2 id="s${sec}"><span>${sec}</span>${t}</h2>`; };
  const SS = t => { sub++; return `<h3><span>${sec}.${sub}</span>${t}</h3>`; };
  const table = (cap, head, rows, note) => { tab++; return `<figure class="tbl"><figcaption><b>Table ${tab}.</b> ${cap}</figcaption><div class="table-scroll"><table><thead><tr>${head.map((h, i) => `<th${i ? ' class="n"' : ''}>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((c, i) => `<td${i ? ' class="n"' : ''}>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${note ? `<p class="tnote">${note}</p>` : ''}</figure>`; };
  const fig = (num, cap) => `<p class="figref"><b>Figure ${++fg}.</b> ${cap} <a href="findings.html#fig-${num}">Interactive version</a>.</p>`;
  const block = (who_, text, src) => `<blockquote class="bq"><p>${esc(text)}</p><cite>${src}</cite></blockquote>`;
  const pair = (id, label) => { const a = q(id); return `<div class="exch"><div><span>${label}, in interview</span>“${esc(a.transcript_span)}”</div><div class="m"><span>AI reconstruction</span>${a.ai_span === 'none' ? '<i>No corresponding passage.</i>' : '“' + esc(a.ai_span) + '”'}</div></div>`; };

  const t1 = table('Participants, interviews and moments analysed.', ['Participant', 'Interview language', 'Recorded', 'Moments', 'Annotations'],
    P.participants.map(p => { const r = ((window.CONTENT || {}).interviews || {})[p.number] || {}; return [esc(nameOf(p)), esc(r.lang || ''), esc(r.date || ''), p.moments.filter(m => m.ai_output).length, n(a => a.participant === p.id)]; }),
    'All names are first names, used with each participant’s consent.');
  const t2 = table('Divergences by type and direction.', ['Type', 'Invented', 'Omitted', 'Altered', 'Total'],
    [...TYPES.map(t => [T[t], ...DIRS.map(d => n(a => a.type === t && a.direction === d)), n(a => a.type === t)]), ['<b>All</b>', inv.length, om.length, alt.length, `<b>${div.length}</b>`]],
    `In addition, ${nM} points were coded as matches.`);
  const t3 = table('Divergences by origin and direction.', ['Origin', 'Invented', 'Omitted', 'Altered', 'Total'],
    ORIG.map(o => [{model:'The model', extraction:'The extracted facts', both:'Facts, elaborated by the model'}[o], ...DIRS.map(d => n(a => a.origin === o && a.direction === d)), n(a => a.origin === o)]));
  const t4 = table('Agreement by kind of content: matches as a share of all coded points.', ['Kind of content', 'Matches', 'Points', 'Share matched'],
    [['Numbers, dates and times', kN], ['Events and actions', kE], ['Names, places and own words', kC], ['People and relationships', kP], ['Feelings and meaning', kF]].map(([l, k]) => [l, k.m, k.t, pc(k.m, k.t) + '%']),
    'Content kinds are a derived code: matches were classified by hand; divergences follow their type.');

  return `
  <header class="paper-head">
    <p class="paper-kicker">Research report · Oral history</p>
    <h1>What Gets Lost When a Machine Tells Your Story</h1>
    <p class="paper-sub">Testimony, summary and AI reconstruction in the accounts of five Indian migrants in Doha</p>
    <p class="paper-auth">${esc((window.CONTENT || {}).director || '')}<br><span>Diasporagy, Doha</span></p>
  </header>

  <section class="paper-abstract"><h2>Abstract</h2>
  <p>AI systems are increasingly used to summarise, retell and stand in for people’s accounts of their own lives. Their usual defence is that the facts come through and only the voice is altered. This study tests that claim with oral history methods. Five Indian migrants in Doha were interviewed about arrival, everyday life, community, language and distance from home. Fifteen moments, selected by a rule fixed before the interviews, were each reduced to five lines of checkable facts and passed to an AI system through one unvarying prompt. Each reconstruction was compared span by span with the person’s own words, and every divergence was coded by type, direction and origin. Of ${ann.length} points compared, ${div.length} diverged. Numbers, dates and times largely survived (${pc(kN.m, kN.t)}% matched); feelings and meaning rarely did (${pc(kF.m, kF.t)}%). Most inventions began with the model, but almost every omission (${omX} of ${om.length}) began in the researcher’s own summary, before the model ran. Across accounts the reconstructions replaced the narrator’s closing judgement with one of their own, recast comfort and trust as hardship, removed hedges, and stripped the names that placed people in Doha. The findings suggest that what reconstruction loses is not chiefly factual accuracy but interpretive authority: the narrator’s right to say what their story meant.</p>
  <p class="kw"><b>Keywords:</b> oral history; testimony; AI reconstruction; summarisation; epistemic injustice; Indian diaspora; Gulf migration; Qatar</p></section>

  ${S('Introduction')}
  <p>Oral history rests on a claim about authority. What a narrator says about their own life is evidence not only of what happened but of what it meant to the person who lived it, and the interpretive work of the telling belongs to them (Portelli, 1981; Frisch, 1990). A growing class of tools now offers to do that telling on a person’s behalf. Language models summarise interviews, draft biographies from notes, and generate first-person accounts from a handful of facts. The case made for them is modest and familiar: they may flatten the voice, but they keep the substance.</p>
  <p>This study asks what that case leaves out. Rather than testing a model on public text, it begins with people. Five Indian migrants living in Doha were interviewed at length. For each, two or three moments were reduced to the kind of compact factual record that such a tool would plausibly be given, and a model was asked to write each moment back in the person’s voice. The two versions of each moment, the told and the reconstructed, were then read against each other line by line.</p>
  <p>The question is therefore not what it is like to be a migrant in Doha. It is whose knowledge counts as valid, and what a system built to be neutral loses when it stands in for someone’s actual experience. The answer offered here is that reconstruction preserves the facts it is given and substitutes its own interpretation for the narrator’s, and that a significant part of the loss is produced before the model runs, by the act of summary itself.</p>

  ${S('Background')}
  ${SS('Testimony and interpretive authority')}
  <p>Portelli’s (1981) argument that oral sources are distinctive less for their factual content than for the meaning narrators give to events remains the starting point for treating an interview as more than a data source. Frisch’s (1990) notion of shared authority extends this into the relationship between interviewer and narrator: interpretation is negotiated, not extracted. Thomson (2007) traces how the field moved from treating memory as a problem of reliability to treating it as a resource. A reconstruction that keeps events and discards meaning reverses that history.</p>
  ${SS('Epistemic injustice and automated retelling')}
  <p>Fricker (2007) describes testimonial injustice as a speaker being given less credibility than they are due, and hermeneutical injustice as a gap in shared resources for making sense of experience. Automated retelling raises a related problem: the speaker is not disbelieved but replaced, and the replacement draws on general patterns of how such stories are usually told (Bender et al., 2021). Where a narrator’s experience departs from the expected pattern, the pattern can win.</p>
  ${SS('Indian migrants in the Gulf')}
  <p>The Indian community is the largest expatriate population in Qatar, and scholarship on Gulf migration has shown how belonging is built through associations, workplaces and religious and linguistic communities rather than through citizenship (Gardner, 2010; Vora, 2013). The narrators here speak from inside such networks: community welfare forums, Kannada and Tulu associations, churches, compounds and hospital wards. Public representations of Gulf migration are dominated by hardship and precarity. That makes this population a sharp test of whether a model reproduces the person or the stereotype.</p>

  ${S('Participants and setting')}
  <p>Five adults of Indian origin living in Doha took part, reached through independent community channels rather than one gatekeeper. They came from Karnataka, Kerala, Goa and Bombay; had arrived between 1997 and 2017; and worked in construction, nursing and hospital administration, education, airport services and banking, or at home. Interviews were conducted in English, with Kannada, Tulu, Malayalam, Konkani, Hindi, Marathi and Arabic passages that are kept, with translations, in the transcripts (Table 1).</p>
  ${t1}

  ${S('Method')}
  ${SS('Interviewing')}
  <p>Each person gave one audio-recorded, open-ended interview of roughly 60 to 90 minutes, following a common script: background, then Getting Settled, A Day You Won’t Forget, Daily Life, Community, Language and Distance and Home, closing with reflective questions about what a summary of their life would miss. The script offered several questions per section and was adapted to each narrator’s manner and to where their answers led. Standard probes (“Tell me more about that”) were used to turn general answers into specific, tellable moments, and candidate moments were flagged as they were told rather than chosen afterwards.</p>
  ${SS('Selecting the moments')}
  <p>Moments were fixed by rule, not by quality: the story from A Day You Won’t Forget (or, failing that, the object story from Getting Settled); the first fully formed story from Daily Life; and the first from Community, then Language, then Distance and Home. Material from the reflective closing section, and any inherited or untaught knowledge, was never passed to the model. Where the rule’s fallbacks were needed, or a moment came from a section the rule does not name, this is recorded as a deviation.</p>
  ${SS('Extraction and generation')}
  <p>Each moment was reduced by the researcher to five fields: who, the moment, where and when, what was said or thought, and what it meant, stated as fact rather than feeling. Personal names were stripped; places and institutions were kept where the narrator named them. The five lines were inserted into one fixed prompt asking for a 150 to 200 word first-person account “as if they were telling a friend”. Across the ${moments.length} moments the shown excerpts averaged ${avg(m => m.transcript_excerpt)} words, the fact records ${avg(m => m.facts)} and the reconstructions ${avg(m => m.ai_output)}: the model consistently wrote more than it was given.</p>
  ${SS('Annotation and coding')}
  <p>Each excerpt and reconstruction were aligned at the level of spans. Every annotation links a passage in one text to its counterpart, or to nothing, in the other, and is coded by type (factual, emotional, relational, cultural, or match) and direction (invented, omitted, altered). After the first pass, the scheme was amended once: because many divergences evidently began before the model saw anything, each was also coded by origin, whether introduced by the model, present in or absent from the extracted facts, or set up by the facts and elaborated by the model. Supplementary measures were computed for the share of divergent text by position in each account, sentence-level tone (VADER compound score), first-person plural and singular pronouns, hedging phrases, and named places, organisations and people.</p>
  ${SS('Ethics and review')}
  <p>All participants gave informed consent, including to publication of the transcript, the reconstruction and the annotations, and each chose to be named; at their request only first names are used. Each participant reviewed their material before publication and could withdraw any of it. One sentence concerning a cause of death is excluded from all published material.</p>

  ${S('Results')}
  ${SS('What diverged')}
  <p>Of ${ann.length} points compared, ${div.length} (${pc(div.length, ann.length)}%) were divergences and ${nM} matches. Emotional divergences were the largest group (${n(a => a.type === 'emotional')}), followed by factual (${n(a => a.type === 'factual')}), relational (${n(a => a.type === 'relational')}) and cultural (${n(a => a.type === 'cultural')}). Alteration was the most common direction: the reconstructions more often reshaped what was said than added or removed it (Table 2).</p>
  ${t2}
  ${SS('Where loss begins')}
  <p>Coding by origin separates two processes that the first scheme conflated (Table 3). Inventions came overwhelmingly from the model (${invM} of ${inv.length}). Omissions came almost entirely from the extracted facts (${omX} of ${om.length}): what the reconstructions failed to say had, in nearly every case, already been removed by the researcher’s summary. In all, ${fromSummary} of ${div.length} divergences (${pc(fromSummary, div.length)}%) originated wholly or partly in the summary.</p>
  ${t3}
  ${fig(2, 'Flow of every divergence from where it began to what it did.')}
  ${SS('What survives')}
  <p>Agreement depended sharply on the kind of content (Table 4). Numbers, dates and times were matched in ${pc(kN.m, kN.t)}% of coded points and events and actions in ${pc(kE.m, kE.t)}%. People and relationships fell to ${pc(kP.m, kP.t)}%, and feelings and meaning to ${pc(kF.m, kF.t)}%. The reconstructions kept a bag weighed at 33.7 kilos at exactly 33.7 kilos and a daughter’s birthday on the right day. They seldom kept what the narrator made of either.</p>
  ${t4}
  ${SS('Endings and verdicts')}
  <p>Divergence was not evenly distributed through the accounts. ${firstHalf}% of the text in the first half of the reconstructions fell within divergent spans; in the final tenth the figure was ${last}%. The model characteristically closed each moment on a line of its own: a speech, a resolution, a joke, a reflective aside. The effect is to replace the narrator’s own conclusion, which in the interviews was usually explicit.</p>
  ${pair('SHR-1-13', who(5))}
  <p>Shridevi’s account of being locked outside a shop in the April heat ends on trust in the strangers who drove her home. The reconstruction ends: “Nothing bad happened to me, but I’ll admit it left me a bit scared.” Her verdict was in the transcript; it was not in the facts, and the model supplied the conventional one.</p>
  ${fig(4, 'Share of each AI account that diverges, by position from start to end.')}
  ${SS('Register: from comfort to hardship')}
  <p>Average sentence tone fell from the narrator’s words to the reconstruction in ${toneDown} of ${tone.length} moments. The coded instances show a consistent direction: where people described comfort, trust or pride, the reconstructions wrote endurance. Vailancelee remembers her first company accommodation as “a very nice accommodation, and it was a lovely place when I first landed”; the model gives her “a bare room and a beginning”. Subramanya’s pact with a friend during the pandemic, “belief and trust … that relationship will never end, till life”, becomes “a practical arrangement between two men who might not both be there in a month”. Sujith, who tells of dancing on stage with a film star with evident command, is given stage fright.</p>
  ${fig(5, 'Average sentence tone in each person’s words and in the AI version.')}
  ${SS('Voice: hedges and the plural')}
  <p>Narrators qualified their accounts; the reconstructions did not. Of ${hT} hedging phrases in the excerpts (“I think”, “maybe”, “or something”), ${hT - hA} were absent from the reconstructions, so the model’s narrators speak with more certainty than the people did. The first-person plural behaved differently from expectation: overall the share of “we” barely moved. Its loss was concentrated where the plural carried meaning, most clearly in Subramanya’s account of repatriating a young worker’s remains, where the community’s accumulated knowledge (“Being in a community and doing all these activities, we know”) becomes one tired man’s experience at a check-in counter.</p>
  ${SS('Names and place')}
  <p>Of ${names.length} named places, organisations, people and own words in the excerpts, ${lost.length} were absent from the reconstructions, and ${lostEarly} of those had already been removed by the summary. Employers, ministries, schools, associations and festivals are what locate a life in Doha rather than in a generic Gulf; their removal is a loss of place before it is a loss of fact. The model also introduced names of its own, among them ${invented.map(esc).join(', ')}, including a name for a narrator’s child.</p>
  ${fig(7, 'Names kept and lost, and where each was lost.')}

  ${S('Discussion')}
  ${SS('The summary as the first reconstruction')}
  <p>The most consequential finding concerns the researcher rather than the model. The five-line summary was designed to be neutral, factual and fair, and every line in it was accurate. Yet it was the summary that removed the sentence Subramanya chose to centre his account of his daughter’s birth (“I never felt that my parents were not there for us”), Mini’s explanation that the businessman feared for his company rather than for his reputation, and most of the names that placed people in their city. The model then built confidently on the gaps. Any pipeline in which a person’s account is first condensed and then regenerated inherits both losses, and the first is invisible in the output.</p>
  ${pair('SUB-1-12', who(1))}
  ${SS('Fluency as substitution')}
  <p>The reconstructions are fluent, specific and plausible, and that is the problem. Where the facts left a gap, the model did not leave it open; it filled it with the most expected material for a story of its kind. For a migrant birth, that is a mother far away and months of fear. For a community pact made during a pandemic, it is grim pragmatism. For a woman alone in a Gulf city, it is fear. These substitutions are not random errors. They align with the dominant public register of Gulf migration, so they read as true to anyone who does not know the narrator.</p>
  ${SS('Relationships and plural voices')}
  <p>Relational divergences show the same pattern at the scale of people. A close friend became a crowd at breakfast; a friend whose presence was the help became a kitchen hand who “did everything I said without complaining”; a man who named three trusted colleagues acquired a single “first number I call”. Oral history has long attended to how narrators distribute credit and to whom. The reconstructions redistribute it along conventional lines, usually towards a lone narrator.</p>
  ${pair('VAL-3-09', who(4))}
  ${SS('Implications for practice')}
  <p>For oral historians, the study suggests that summaries, abstracts and catalogue descriptions are not neutral finding aids but interpretive acts with measurable effects, and that their losses should be documented alongside the source. For anyone using generative tools to retell testimony, it suggests that factual verification is the wrong test: the facts are the part most likely to survive. What needs checking is whether the narrator’s own judgement, relationships, qualifications and names have survived, and that can only be checked against the person, not against the facts.</p>
  ${SS('Limitations')}
  <p>The study is small and deliberately so: five narrators and ${moments.length} moments. Each moment was generated once, so the model’s habits cannot be separated from a single draw, and the model and run dates were not consistently logged. The first annotation pass was made by an AI system and reviewed by the researcher, so it is not an independent second coding. Tone scores are a blunt instrument and are read only as direction. The narrators were well networked and articulate in English; people less embedded in community institutions, or interviewed in another language, may be reconstructed differently.</p>

  ${S('Conclusion')}
  <p>Given the facts of five lives, a machine kept the facts. What it did not keep was what the people made of them: the conclusion they drew, the people they credited, the uncertainty they allowed, and the names that placed them in Doha. Much of that was lost before the machine ran, in a summary made in good faith. The standard defence of AI reconstruction therefore gets the risk the wrong way round. The danger is not that the machine gets the facts wrong, but that it gets them right and replaces everything else. A machine can be given the facts of a life. It cannot be given what the person made of them unless someone asks, and listens to the answer.</p>

  <section class="paper-back">
  <h2>Data availability</h2>
  <p>Every moment, its fact record, the reconstruction and all ${ann.length} annotations are published on this site (<a href="participants.html">the accounts</a>), with the fixed prompt, selection rule and recorded deviations on the <a href="method.html">Method</a> page and interactive figures on the <a href="findings.html">Findings</a> page. Audio for each moment is published with consent.</p>
  <h2>References</h2>
  <ol class="refs">
    <li>Bender, E. M., Gebru, T., McMillan-Major, A., &amp; Shmitchell, S. (2021). On the dangers of stochastic parrots: Can language models be too big? <i>Proceedings of the 2021 ACM Conference on Fairness, Accountability, and Transparency</i>, 610–623.</li>
    <li>Fricker, M. (2007). <i>Epistemic injustice: Power and the ethics of knowing</i>. Oxford University Press.</li>
    <li>Frisch, M. (1990). <i>A shared authority: Essays on the craft and meaning of oral and public history</i>. State University of New York Press.</li>
    <li>Gardner, A. (2010). <i>City of strangers: Gulf migration and the Indian community in Bahrain</i>. Cornell University Press.</li>
    <li>Portelli, A. (1981). The peculiarities of oral history. <i>History Workshop Journal</i>, 12, 96–107.</li>
    <li>Thomson, A. (2007). Four paradigm transformations in oral history. <i>Oral History Review</i>, 34(1), 49–70.</li>
    <li>Vora, N. (2013). <i>Impossible citizens: Dubai’s Indian diaspora</i>. Duke University Press.</li>
  </ol></section>`;
}
