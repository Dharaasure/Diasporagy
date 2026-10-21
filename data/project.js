window.PROJECT = {
 "project": {
  "title": "Diasporagy",
  "subtitle": "What Gets Lost When a Machine Tells Your Story",
  "core_question": "The question is not “what is it like to be a migrant in Doha.” It is whose knowledge counts as valid, and what a system built to be neutral loses when it stands in for someone's actual experience.",
  "anchoring_sentence": null,
  "summary": "Five Indian migrants in Doha were interviewed about daily life, language, memory and belonging. For each, two or three moments were reduced to their checkable facts and given to an AI system with one fixed prompt. Each moment is shown here twice: once in the person's words, once as the machine reconstructed it.",
  "participants_intro": "Five Indian migrants in Doha. All five have consented to be named. At their request, the site uses first names only.",
  "method_summary": "Each moment was chosen by a fixed selection rule, reduced to five lines of facts and run once through the same prompt. I then coded every difference between the transcript and the AI version by type and direction and, after the amendment, by where it began.",
  "prompt": "You are writing a first-person account of a specific moment or\nmemory in a real person's life. Based only on the facts below,\nwrite a 150 to 200 word first-person account of this moment, in\ntheir voice, as if they were telling a friend what happened.\n\nFacts:\n- Who: [role or relationship, no name]\n- The moment: [the specific event, routine, or memory being\n  reconstructed]\n- Where and when: [setting, rough timeframe]\n- What was said or thought: [key detail, stated plainly]\n- What it meant: [significance, stated as fact, not feeling]\n\nWrite only the first-person account. No title, commentary, or disclaimer."
 },
 "disclosure": "First-pass annotation by an AI system, reviewed and corrected by the researcher.",
 "schemes": {
  "v1": {
   "label": "Original scheme (four types)",
   "types": {
    "factual": "A fact is wrong or invented.",
    "emotional": "Feelings were imposed that the person didn't express, or their actual feelings were flattened.",
    "relational": "Who matters to them, and how, was changed.",
    "cultural": "Something specific to their place, language or community was lost or generalised.",
    "match": "The AI got something genuinely right."
   },
   "direction": {
    "invented": "Present in the AI version, absent from the transcript.",
    "omitted": "Present in the transcript, absent from the AI version.",
    "altered": "Present in both, but changed."
   }
  },
  "v2": {
   "label": "Amended scheme (four types plus origin)",
   "summary": "Types and directions are unchanged. Every divergence also records where it began.",
   "origin": {
    "model": "Introduced by the AI, beyond the facts it was given.",
    "extraction": "Present as an error in the extracted facts, or absent from them, so the AI could not have known.",
    "both": "Set up by the extracted facts and elaborated by the AI."
   },
   "rationale": "The four types record what kind of thing went wrong but not where. In the first two participants, many divergences began before the model saw anything: in errors written into the facts, or in material never extracted. Under the original scheme these counted as the machine's failures, which overstated its losses and hid the losses of the researcher's own summary, the same kind of substitution the project examines. Adding origin is the only single change that alters what the counts mean while keeping the four types comparable across both passes.",
   "not_adopted": "Noted but not adopted: narrative shaping (tidy endings and aphorisms, currently coded emotional) and voice pastiche (invented Indian-English idioms, coded cultural/invented although the cultural type was defined as loss)."
  },
  "applied": "Participants 1 and 2 were coded under the original scheme, then given a second pass under the amended scheme that added origin; no type or direction labels changed in that pass. The second pass was carried out by the same AI in the same session as the first, so it is not an independent check. Sujith and Participants 4 and 5 were coded under the amended scheme directly."
 },
 "findings_draft": [
  "The machine adds and the summary removes. Most inventions began with the AI, and almost every omission began in the five-line summary it was given (Figure 2).",
  "Feeling is supplied, and the person's own conclusion is replaced. The AI adds feelings no one voiced (SUJ-1-09, SHR-2-05, MIN-2-11), drops the ones they did (SUB-1-12, SHR-1-13), and closes on a line of its own (MIN-3-12, SUJ-2-13).",
  "Where people described comfort, trust or pride, the AI often wrote hardship (VAL-1-09, SUB-3-06, SUJ-2-01). I propose this as the next amendment to the coding scheme.",
  "People merge, split and shrink. A close friend becomes a crowd (MIN-2-06), and a friend whose presence was the help becomes a kitchen hand (VAL-3-09).",
  "Names are lost, mostly before the AI runs. Most of the missing names were never in the summary (Figure 7)."
 ],
 "method_notes": [
  "One AI run was made per moment. The method document asked for two to three runs; I reduced that to one.",
  "Annotation was done as a first pass by an AI system and is reviewed and corrected by the researcher. There was no hand annotation.",
  "There was no return session with participants. Each participant reviews their own material privately, and can flag or withdraw any of it, before anything goes public.",
  "Two moments are withheld from this site while they are reviewed with the participants concerned. Their annotations are not counted on this site; the report gives the full totals.",
  "Participant 5, Moment 1: the interview has neither an A Day You Won't Forget section nor an object story, so the Getting Settled question about first noticing something was used. The selection rule has no second fallback, so this is a deviation.",
  "Participant 4, Moment 1: the interview has no A Day You Won't Forget section, so the object-story fallback was used, as the rule allows.",
  "Sujith, Moment 2 comes from a section headed “Work”, which is not one of the permitted sections. Sujith, Moment 1: the full story was told in the Background section, which is never extracted; the A Day You Won't Forget answer gives it a single line.",
  "Participant 1, Moment 3 is a shared belief rather than a scene, and Participant 2, Moment 3 is a routine rather than a single story. Whether either is a “fully formed story” is open.",
  "Several facts in the prompts were the interviewer's own summaries or words rather than the participant's (for example “grandchildren” and a single “first call”). Each such case is flagged in the annotations as coming from extraction.",
  "The model name is not recorded for any run, and run dates are recorded for only three of fifteen."
 ],
 "run_log": [
  {
   "participant": "p1",
   "moment": 1,
   "model": "not recorded",
   "date": "not recorded"
  },
  {
   "participant": "p1",
   "moment": 2,
   "model": "not recorded",
   "date": "not recorded"
  },
  {
   "participant": "p1",
   "moment": 3,
   "model": "not recorded",
   "date": "not recorded"
  },
  {
   "participant": "p2",
   "moment": 1,
   "model": "not recorded",
   "date": "not recorded"
  },
  {
   "participant": "p2",
   "moment": 2,
   "model": "not recorded",
   "date": "not recorded"
  },
  {
   "participant": "p2",
   "moment": 3,
   "model": "not recorded",
   "date": "not recorded"
  },
  {
   "participant": "sujith",
   "moment": 1,
   "model": "not recorded",
   "date": "not recorded"
  },
  {
   "participant": "sujith",
   "moment": 2,
   "model": "not recorded",
   "date": "not recorded",
   "note": "Source section headed Work"
  },
  {
   "participant": "sujith",
   "moment": 3,
   "model": "not recorded",
   "date": "not recorded"
  },
  {
   "participant": "p4",
   "moment": 1,
   "model": "not recorded",
   "date": "19 Oct 2026",
   "note": "Fallback applied: no A Day You Won't Forget section"
  },
  {
   "participant": "p4",
   "moment": 2,
   "model": "not recorded",
   "date": "19 Oct 2026"
  },
  {
   "participant": "p4",
   "moment": 3,
   "model": "not recorded",
   "date": "19 Oct 2026"
  },
  {
   "participant": "p5",
   "moment": 1,
   "model": "not recorded",
   "date": "not recorded",
   "note": "Deviation: no A Day You Won't Forget section and no object story"
  },
  {
   "participant": "p5",
   "moment": 2,
   "model": "not recorded",
   "date": "not recorded"
  },
  {
   "participant": "p5",
   "moment": 3,
   "model": "not recorded",
   "date": "not recorded"
  }
 ]
};