/* Editorial text for the site: the project description, the ten-step method and the selection rule.
   Kept apart from project.js because the review page's "Export public-safe data files" button rewrites project.js and p1.js to p5.js, never this file. */
window.CONTENT = {
 "interviews": {
  "1": {"acc": "DSP-OH-2026-01", "date": "25 July 2026", "lang": "English, with Kannada and Arabic", "format": "Audio, transcribed"},
  "2": {"acc": "DSP-OH-2026-02", "date": "2026", "lang": "English, with Malayalam and Hindi", "format": "Audio, transcript only"},
  "3": {"acc": "DSP-OH-2026-03", "date": "29 August 2026", "lang": "English, with Kannada and Tulu", "format": "Audio, three parts, about 80 minutes"},
  "4": {"acc": "DSP-OH-2026-04", "date": "2026", "lang": "English, with Konkani", "format": "Audio, transcribed"},
  "5": {"acc": "DSP-OH-2026-05", "date": "20 October 2026", "lang": "English, with Hindi, Malayalam and Marathi", "format": "Audio, transcribed"}
 },
 "consent": [
  "One audio-recorded conversation of about 60 to 90 minutes, in the language the participant is most comfortable in.",
  "Facts extracted from the account are entered into an AI system through one fixed, unedited prompt; the model and date are to be logged for each case.",
  "Each participant chose whether to be named or anonymous, and could change that choice at any time before publication. All five chose to be named; the site uses first names only.",
  "Nothing is sold, used for advertising, used to train an AI model beyond generating the one narrative, or shared outside the project without separate permission.",
  "Participation is voluntary; any question can be skipped and the interview stopped at any time, without explanation.",
  "Material can be withdrawn at any time before publication, and removal will be attempted on request after it. Each participant may review the AI version and the annotations first."
 ],
 "spec": {
  "intro": "Each moment passes through the same five stages. Every stage has a fixed input and output, so any divergence can be traced to the stage where it was introduced.",
  "rows": [
   ["1 · Elicitation", "Semi-structured interview, fixed section order", "Open questions, then standard probes (“Tell me more about that”) until an answer becomes a specific, tellable moment", "Audio and verbatim transcript; candidate moments flagged “MOMENT” in real time, not chosen afterwards"],
   ["2 · Selection", "Transcript, section headings", "Deterministic rule: one moment per slot, with ordered fallbacks", "Transcript excerpt; any fallback or deviation recorded"],
   ["3 · Extraction", "Excerpt", "Reduction to five fields (Who, The moment, Where and when, What was said or thought, What it meant); personal names stripped, places and institutions kept", "Five-line fact record, the only input the model sees"],
   ["4 · Generation", "Fact record", "One fixed prompt, 150 to 200 words, first person, fresh context per run", "AI account; model and date logged per run"],
   ["5 · Comparison", "Excerpt and AI account", "Span-level alignment: each annotation links a span in one text to a span, or to nothing, in the other", "Typed annotation record (below)"]
  ],
  "fields": [
   ["ai_span", "verbatim substring, or none", "Where in the AI account the point sits; none marks an omission"],
   ["transcript_span", "verbatim substring, or none", "The person's corresponding words; none marks an invention"],
   ["type", "factual · emotional · relational · cultural · match", "What kind of thing diverged, or that it matched"],
   ["direction", "invented · omitted · altered", "What the divergence did"],
   ["origin", "model · extraction · both", "Where it began: in the AI, in the five-line summary, or set up by one and elaborated by the other (added in the amended scheme)"],
   ["note", "free text", "The researcher's reading of the point"]
  ],
  "validity": "Spans are checked automatically against both texts on every build. All figures are computed in the browser from these records, so no published number can drift from the annotations. Limits: one run per moment, so run-to-run variance is not measured; the first annotation pass was made by an AI and reviewed by the researcher, so it is not an independent second coder."
 },
 "director": "Dharaa Suresha",
 "director_role": "Founder and Director",
 "tagline": "An independent oral history project testing where AI reconstruction departs from lived experience.",
 "overview": [
  "Diasporagy is an oral history project. It tests whether an AI system can accurately reconstruct a real person's lived experience, and where it falls short. It interviews five Indian migrants in Doha about daily life, language, memory and belonging.",
  "Each account is reduced to its checkable facts and run through one fixed AI prompt. The resulting narrative is then compared line by line against what the person actually said."
 ],
 "lineage": [
  "Oral historians have long asked of the archive whose knowledge counts as valid. This project asks it of a machine.",
  "My earlier published research on the digital determinants of health asked this at the level of policy and infrastructure. This project asks it about one person at a time. The domain was deliberately chosen to have nothing to do with health, so the same mechanism can be tested on its own terms."
 ],
 "outputs": [
  {"name": "Report", "text": "Annotated moments across five participants, coded findings, and a conclusion linking back to the digital determinants of health framework."},
  {"name": "Field notebook", "text": "The handwritten, session-by-session record kept alongside each interview. Not published in full, but quoted in the report where it shapes a finding."},
  {"name": "This site", "text": "The transcript, the AI version and the annotations for each participant, released after private delivery."}
 ],
 "steps": [
  {"name": "Recruit", "text": "Five Indian migrant adults in Doha, reached through three or four independent community channels rather than a single point of contact, with informed consent."},
  {"name": "Interview", "text": "Open-ended and audio recorded, in the participant's preferred language, following the fixed interview script. When something inherited or handed down comes up, it is followed with the script's standard prompts, such as “Tell me more about that.” This knowledge exists only where the participant carries it, which is exactly what a system trained on published material cannot reconstruct."},
  {"name": "Keep a field notebook", "text": "One handwritten page per interview: what the recording won't hold, what was not said, where the person stopped, what the room was like, and what I misread in the moment. It is kept separate from the transcript and never summarised into it."},
  {"name": "Extract moments", "text": "Two to three moments per participant, chosen by the fixed selection rule, each then stripped to its checkable facts.", "as_done": "The rule's fallbacks were needed for Participants 4 and 5, and two moments come from sections the rule does not name. Each case is listed under recorded deviations."},
  {"name": "Generate the AI version", "text": "The facts go into one fixed prompt, applied identically to all five participants.", "as_done": "One run was made per moment rather than two to three, and the model name was not recorded."},
  {"name": "Annotate", "text": "Each transcript excerpt is set beside its AI version and every point of divergence is marked.", "as_done": "The design called for marking on paper first. In practice an AI system made the first pass and the researcher reviewed and corrected it."},
  {"name": "Code", "text": "Every divergence is sorted as factual, emotional, relational or cultural, and as invented, omitted or altered."},
  {"name": "Document one amendment", "text": "After the first pass of coding, a note on what the scheme failed to capture and the one change made, with reasons. The amendment added where each divergence began."},
  {"name": "Write", "text": "Before drafting, one sentence is committed to: what the standard defence of AI reconstruction gets wrong, and what the process destroys when it substitutes for a person's own account."},
  {"name": "Publish in two stages", "text": "First, private delivery to the five participants and a small number of researchers working on the same question. Each participant can flag or withdraw anything from their own material. Second, this public site, once that review period closes."}
 ],
 "selection": {
  "intro": "Each pair must be the same moment told twice, so which stories become moments is fixed in advance, not chosen afterwards for how well they turned out.",
  "rules": [
   {"n": "Moment one", "text": "The story from A Day You Won't Forget. If no full story comes out of it, the object story from Getting Settled."},
   {"n": "Moment two", "text": "The first fully formed story from Daily Life."},
   {"n": "Moment three", "text": "The first fully formed story from Community. If none, from Language. If none, from Distance and Home."}
  ],
  "protected": "Only material from Getting Settled, A Day You Won't Forget, Daily Life, Community, Language and Distance and Home is ever extracted. Inherited, untaught knowledge may shape which moments are chosen and is drawn on in the report, but it is never fed through the AI prompt. It is exactly the material the comparison exists to protect."
 },
 "script": {
  "intro": "Every interview follows the same script: a short background section, then six sections, closing with reflective questions on what a summary might miss. Each section offers a few question options rather than a fixed sequence. Inherited knowledge has no section of its own; it is drawn out wherever it surfaces.",
  "adapted": "The script was a guide, not a questionnaire. Each section offers several questions, and in each interview the order, wording and follow-ups were adapted to the person: their personality, how much they wanted to say, and where their answers led. The selection rule for moments stayed fixed throughout.",
  "boundary": [{"n": "Story sections", "text": "Getting Settled to Distance and Home ask for specific, tellable moments. Only these are ever extracted for the AI."}, {"n": "What gets left out", "text": "The closing questions stay reflective on purpose: they ask the person to think about the project's own question, and go to the report, never into the pipeline."}, {"n": "Moment flags", "text": "A story was marked as a candidate moment while it was being told, so the choice could not be made later by listening back for the best one."}],
  "sections": ["Background", "Getting Settled", "A Day You Won't Forget", "Daily Life", "Community", "Language", "Distance and Home", "What a summary would miss"]
 },
 "ethics": [
  "All five participants consented to be named. At their request, only first names are used.",
  "Each participant sees both versions of their own material, and everything written about them, before anything is public. Any of it can be flagged or withdrawn, for any reason.",
  "Moments under review are withheld from this site, and are left out of every count shown here."
 ]
};
