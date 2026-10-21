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
  const pair = (id, label) => { const a = q(id); return `<blockquote class="exch"><p>${esc(label)}: "${esc(a.transcript_span)}"</p><p>AI version: ${a.ai_span === 'none' ? '<i>(nothing corresponds to this)</i>' : '"' + esc(a.ai_span) + '"'}</p></blockquote>`; };

  const t1 = table('Participants, interviews and moments analysed.', ['Participant', 'Interview language', 'Recorded', 'Moments', 'Annotations'],
    P.participants.map(p => { const r = ((window.CONTENT || {}).interviews || {})[p.number] || {}; return [esc(nameOf(p)), esc(r.lang || ''), esc(r.date || ''), p.moments.filter(m => m.ai_output).length, n(a => a.participant === p.id)]; }),
    'First names are used with each participant\'s consent.');
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
    <h1>What Gets Lost When a Machine Tells Your Story</h1>
    <p class="paper-sub">Testimony, summary and AI reconstruction in the accounts of five Indian migrants in Doha</p>
    <p class="paper-auth">${esc((window.CONTENT || {}).director || '')}<br><span>Diasporagy, Doha</span></p>
  </header>

  <section class="paper-abstract"><h2>Abstract</h2>
  <p>AI systems are now used to summarise and retell people's accounts of their own lives, and the usual defence is that the facts survive even if the voice does not. I tested that defence with five Indian migrants in Doha. Each gave a long oral history interview about arriving, everyday life, community, language and home. I chose fifteen moments by a rule fixed before the interviews, reduced each to five lines of facts, and gave those lines to an AI system with one unchanging prompt. I then read every reconstruction against the person's own words and coded each difference by type, direction and origin. Of ${ann.length} points compared, ${div.length} diverged. Numbers, dates and times mostly came through (${pc(kN.m, kN.t)}% matched); feelings and meaning mostly did not (${pc(kF.m, kF.t)}%). The model added most of the inventions, but ${omX} of the ${om.length} omissions were already in my own summary before the model ran. The reconstructions also ended the narrators' stories for them, turned comfort into hardship, dropped their hedges, and removed the names that placed them in Doha. What these narrators lost was mainly the right to say what their own stories meant.</p>
  <p class="kw"><i>Keywords:</i> oral history; testimony; AI reconstruction; summary; epistemic injustice; Indian diaspora; Gulf migration; Qatar</p></section>

  ${S('Introduction')}
  <p>Oral historians have long argued that what a narrator says about their own life is evidence of what it meant to them, and that this meaning belongs to the narrator as much as the events do (Portelli, 1981; Frisch, 1990). Language models are now used to do some of that telling on people's behalf. They summarise interviews, draft life stories from notes, and write first-person accounts from a few facts. The case made for these tools is a modest one: the voice may come out flatter, but the substance stays.</p>
  <p>I wanted to see what that case misses, and to start from people rather than from published text. I interviewed five Indian migrants living in Doha. For each, I took two or three moments, reduced them to the kind of short factual record a tool like this would be given, and asked a model to write each moment back in the person's voice. I then read the two versions side by side, line by line.</p>
  <p>My question was never what it is like to be a migrant in Doha. It was whose knowledge counts, and what a system designed to be neutral loses when it speaks for someone. My answer is that the model kept the facts it was given and replaced the narrator's interpretation with its own, and that much of the loss happened earlier, when I wrote the summary.</p>

  ${S('Background')}
  ${SS('Testimony and the narrator\'s authority')}
  <p>Portelli (1981) argued that oral sources matter less for their facts than for the meanings narrators give to events. Frisch (1990) described the interview as an exchange in which interviewer and narrator share authority over interpretation. Thomson (2007) traces how the field came to treat memory as a resource rather than a problem of reliability. A retelling that keeps events and discards meaning runs against all three.</p>
  ${SS('Epistemic injustice and retelling by machine')}
  <p>Fricker (2007) describes testimonial injustice, where a speaker is given less credibility than they deserve, and hermeneutical injustice, where shared resources for making sense of an experience are missing. Automated retelling raises a related problem. The speaker is not disbelieved; they are replaced, by a system that draws on how such stories are usually told (Bender et al., 2021). When a person's experience differs from the usual pattern, the pattern tends to win.</p>
  ${SS('Indian migrants in the Gulf')}
  <p>Indians, numbering about 830,000 (Ministry of External Affairs, 2026), are among the largest expatriate populations in Qatar. Studies of Gulf migration show belonging built through associations, workplaces, churches and language groups rather than through citizenship (Gardner, 2010; Vora, 2013). The people I interviewed speak from inside these networks: welfare forums, Kannada and Tulu associations, parishes, residential compounds and hospital wards. Public writing about Gulf migration leans heavily on hardship. That makes these accounts a useful test of whether a model reproduces the person or the stereotype.</p>

  ${S('Participants and setting')}
  <p>Five adults of Indian origin living in Doha took part. I reached them through separate community channels rather than through one contact. They came from Karnataka, Kerala, Goa and Bombay, arrived between 1997 and 2017, and worked in construction, nursing and hospital management, schools, airport ground staff and banking, or at home. We spoke mostly in English, with passages in Kannada, Tulu, Malayalam, Konkani, Hindi, Marathi and Arabic, which the transcripts keep with translations (Table 1). I grew up in this community, and several participants know my family. That made the interviews easier to open and shaped what people chose to tell me; I return to this in the limitations.</p>
  ${t1}

  ${S('Method')}
  ${SS('Interviewing')}
  <p>Each person gave one audio-recorded interview of about 60 to 90 minutes. I followed a common script (background, Getting Settled, A Day You Won't Forget, Daily Life, Community, Language, Distance and Home) and closed with questions about what a summary of their life would miss. The script offered several questions in each section, and I adapted the order and wording to each person and to where their answers went. When an answer stayed general I used the standard probes, such as "Tell me more about that", until it became a particular story, and I marked candidate moments while they were being told rather than choosing them afterwards.</p>
  ${SS('Choosing the moments')}
  <p>A rule fixed in advance chose the moments: the story from A Day You Won't Forget (or, if there was none, the object story from Getting Settled), the first full story from Daily Life, and the first from Community, then Language, then Distance and Home. Nothing from the closing questions, and no inherited or untaught knowledge, went to the model. Where I had to use a fallback, or a story came from a section the rule does not name, I recorded it as a deviation.</p>
  ${SS('Summary and generation')}
  <p>I reduced each moment to five fields: who, the moment, where and when, what was said or thought, and what it meant, written as fact rather than feeling. I removed personal names and kept the places and institutions people named. The five lines went into one fixed prompt asking for a 150 to 200 word first-person account "as if they were telling a friend". The excerpts I worked from averaged ${avg(m => m.transcript_excerpt)} words, my summaries ${avg(m => m.facts)} and the model's accounts ${avg(m => m.ai_output)}. Every account was longer than what the model had been given.</p>
  ${SS('Annotation and coding')}
  <p>I aligned each excerpt and its reconstruction passage by passage. Each annotation links a span in one text to its counterpart in the other, or to nothing, and records its type (factual, emotional, relational, cultural, or a match) and direction (invented, omitted or altered). After the first round I changed the scheme once. Many differences had clearly started before the model saw anything, so I added a third code for origin: the model, my summary, or my summary with the model building on it. I also measured where in each account the differences fell, sentence tone (VADER), the use of "we" and "I", hedging phrases, and named places, organisations and people.</p>
  ${SS('Consent and review')}
  <p>Everyone gave informed consent, including to publishing the transcript, the reconstruction, the annotations and the audio. All five chose to be named, and asked that only first names be used. Each person reviewed their material before publication and could withdraw any of it. One sentence about a cause of death is left out of everything published.</p>

  ${S('Findings')}
  ${SS('How much changed')}
  <p>Of ${ann.length} points compared, ${div.length} (${pc(div.length, ann.length)}%) were differences and ${nM} were matches. Emotional differences were the largest group (${n(a => a.type === 'emotional')}), then factual (${n(a => a.type === 'factual')}), relational (${n(a => a.type === 'relational')}) and cultural (${n(a => a.type === 'cultural')}). Alteration was more common than addition or removal (Table 2). The model mostly reshaped what people said.</p>
  ${t2}
  ${SS('Where the losses began')}
  <p>Coding by origin separated two processes (Table 3). The model produced most of the inventions (${invM} of ${inv.length}). My summaries produced almost all of the omissions (${omX} of ${om.length}): when the reconstruction left something out, I had usually removed it first. Altogether ${fromSummary} of the ${div.length} differences (${pc(fromSummary, div.length)}%) began wholly or partly in my summary.</p>
  ${t3}
  ${fig(2, 'Every difference, traced from where it began to what it did.')}
  ${SS('What survived')}
  <p>How well the model did depended on what was being said (Table 4). It matched ${pc(kN.m, kN.t)}% of the points about numbers, dates and times, and ${pc(kE.m, kE.t)}% about events. It matched ${pc(kP.m, kP.t)}% about people and relationships and ${pc(kF.m, kF.t)}% about feelings and meaning. It kept a suitcase weighed at 33.7 kilos at 33.7 kilos, and a daughter's birthday on the right day. It rarely kept what the narrator made of either.</p>
  ${t4}
  ${SS('Endings')}
  <p>The differences were not spread evenly. ${firstHalf}% of the text in the first half of the reconstructions fell inside a difference; in the last tenth it was ${last}%. The model tended to finish each moment with something of its own, such as a speech, a resolution or a joke. In the interviews people usually said plainly what the moment meant, and the model's ending took the place of theirs.</p>
  ${pair('SHR-1-13', who(5))}
  <p>Shridevi told me about being stuck outside a shop in the April heat in 1997, with no taxis until the afternoon break ended. Her story ends with the shop staff driving her home and her trust in the people she met. The model ends it with "Nothing bad happened to me, but I'll admit it left me a bit scared." Her conclusion was in the transcript but not in my five lines, and the model supplied the expected one.</p>
  ${fig(4, 'The share of each AI account that differs from the person, from start to end.')}
  ${SS('From comfort to hardship')}
  <p>Average sentence tone dropped from the person's words to the reconstruction in ${toneDown} of ${tone.length} moments. The annotations show the direction of that drop. Where people talked about comfort, trust or pride, the model wrote about endurance. Vailancelee remembers her first company flat as "a very nice accommodation, and it was a lovely place when I first landed"; the model gives her "a bare room and a beginning". Subramanya describes a pact with a friend during the pandemic as "belief and trust ... that relationship will never end, till life"; the model calls it "a practical arrangement between two men who might not both be there in a month". Sujith tells the story of dancing on stage with a film star with obvious confidence, and the model gives him stage fright.</p>
  ${fig(5, 'Average sentence tone in each person\'s words and in the AI version.')}
  ${SS('Hedges and "we"')}
  <p>The narrators qualified what they said, and the model did not. Of ${hT} hedges in the excerpts ("I think", "maybe", "or something"), ${hT - hA} were gone from the reconstructions, so the model's narrators sound more certain than the people did. I expected the model to turn "we" into "I" across the board, and it did not; overall the share of "we" barely moved. The loss was concentrated where "we" carried the meaning. In Subramanya's account of sending home a young worker's body, the knowledge of a whole community ("Being in a community and doing all these activities, we know") becomes one tired man's experience at a check-in counter.</p>
  ${SS('Names and place')}
  <p>The excerpts named ${names.length} places, organisations, people and phrases of their own. ${lost.length} were missing from the reconstructions, and ${lostEarly} of those were already missing from my summaries. Employers, ministries, schools, associations and festivals are what place a life in Doha rather than in some general Gulf city, so losing them loses the place before it loses any fact. The model also added names of its own: ${invented.map(esc).join(', ')}, including a name for one narrator's son.</p>
  ${fig(7, 'Names kept and lost, and where each was lost.')}

  ${S('Discussion')}
  ${SS('My summary was the first reconstruction')}
  <p>The finding that troubles me most is about my own work. I wrote the five-line summaries to be neutral and accurate, and every line in them was accurate. Yet my summary is what removed the sentence Subramanya put at the centre of his daughter's birth ("I never felt that my parents were not there for us"). It also removed Mini's explanation that the businessman she drove to hospital was worried about his company rather than his reputation, and most of the names that placed people in their city. The model then built confidently on those gaps. Any process that first condenses a person's account and then writes it back out carries both losses, and the first one never shows in the result.</p>
  ${pair('SUB-1-12', who(1))}
  ${SS('Plausible detail fills the gaps')}
  <p>The reconstructions read well. They are specific and believable, and that is what makes them hard to catch. Where my summary left a gap, the model filled it with whatever usually appears in a story of that kind. For a migrant's child born abroad, that was family far away and months of fear. For a pact made during the pandemic, it was grim practicality. For a woman alone in a Gulf city, it was fear again. These are not random errors. They match the common public picture of Gulf migration, which is why they sound true to anyone who does not know the person.</p>
  ${SS('Who gets the credit')}
  <p>The same thing happened with people. A close friend at breakfast became "the whole lot of us". A friend whose company was the help at Vailancelee's Christmas party became someone who "did everything I said without complaining". A man who named three trusted colleagues was given a single "first number I call". Oral historians pay close attention to how narrators share out credit and with whom. The model shared it out in the usual way, mostly towards a single narrator.</p>
  ${pair('VAL-3-09', who(4))}
  ${SS('What this means for practice')}
  <p>For oral historians, these results suggest that summaries, abstracts and catalogue entries are interpretive acts with measurable effects, and that what they leave out should be recorded alongside the source. For anyone retelling testimony with generative tools, checking the facts is the wrong test, because the facts are what survive best. The useful test is whether the narrator's own judgement, relationships, doubts and names survived, and that can only be checked against the person.</p>
  ${SS('Limitations')}
  <p>This is a small study of five people and ${moments.length} moments. I ran each moment once, so I cannot separate the model's habits from the luck of a single draw. I did all the annotation and coding myself, so there is no independent second coder. The tone scores are crude, and I read them only for direction. The five narrators are well connected, confident in English and, in several cases, known to my family. People with fewer ties, or interviewed in another language or by a stranger, might be reconstructed differently.</p>

  ${S('Conclusion')}
  <p>When I gave a machine the facts of five lives, it kept the facts. It lost what the people made of them: the conclusions they drew, the people they credited, the doubts they allowed, and the names that placed them in Doha. Some of that was gone before the machine ran, in a summary I wrote in good faith. The common defence of AI reconstruction treats factual error as the main risk. In these fifteen moments the facts were mostly right, and what was replaced was everything the person had added to them. A machine can be given the facts of a life, but it cannot be given what the person made of them unless someone asks, and then listens.</p>

  <section class="paper-back">
  <h2>Data availability</h2>
  <p>Every moment, its five-line summary, the reconstruction, the audio and all ${ann.length} annotations are published on this site (<a href="participants.html">the accounts</a>). The prompt, selection rule and recorded deviations are on the <a href="method.html">Method</a> page, and interactive versions of the figures are on the <a href="findings.html">Findings</a> page.</p>
  <h2>References</h2>
  <ol class="refs">
    <li>Bender, E. M., Gebru, T., McMillan-Major, A., &amp; Shmitchell, S. (2021). On the dangers of stochastic parrots: Can language models be too big? <i>Proceedings of the 2021 ACM Conference on Fairness, Accountability, and Transparency</i>, 610-623. https://doi.org/10.1145/3442188.3445922</li>
    <li>Fricker, M. (2007). <i>Epistemic injustice: Power and the ethics of knowing</i>. Oxford: Oxford University Press.</li>
    <li>Frisch, M. (1990). <i>A shared authority: Essays on the craft and meaning of oral and public history</i>. Albany: State University of New York Press.</li>
    <li>Gardner, A. (2010). <i>City of strangers: Gulf migration and the Indian community in Bahrain</i>. Ithaca: ILR Press/Cornell University Press.</li>
    <li>Ministry of External Affairs, Government of India. (2026). <i>Population of overseas Indians</i> (data as of January 2026). https://www.mea.gov.in/population-of-overseas-indians</li>
    <li>Portelli, A. (1981). The peculiarities of oral history. <i>History Workshop Journal</i>, 12, 96-107.</li>
    <li>Thomson, A. (2007). Four paradigm transformations in oral history. <i>Oral History Review</i>, 34(1), 49-70. https://doi.org/10.1525/ohr.2007.34.1.49</li>
    <li>Vora, N. (2013). <i>Impossible citizens: Dubai's Indian diaspora</i>. Durham: Duke University Press.</li>
  </ol></section>`;
}
