/* Editorial text for the site: the project description, the ten-step method and the selection rule.
   Kept apart from project.js because the review page's "Export public-safe data files" button rewrites project.js and p1.js to p5.js, never this file. */
window.CONTENT = {
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
  "sections": ["Background", "Getting Settled", "A Day You Won't Forget", "Daily Life", "Community", "Language", "Distance and Home", "What a summary would miss"]
 },
 "ethics": [
  "A participant is named only where they have confirmed that they want to be. Everyone else appears by number.",
  "Each participant sees both versions of their own material, and everything written about them, before anything is public. Any of it can be flagged or withdrawn, for any reason.",
  "Moments under review are withheld from this site, and are left out of every count shown here."
 ]
};
