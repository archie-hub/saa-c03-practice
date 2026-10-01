# saa-c03-practice

A static SAA-C03 practice-exam site. The app is in `docs/` (plain HTML, CSS and JavaScript, served by
GitHub Pages from `main`); the question bank is Markdown in `saa-c03-questions/`.

## Editing questions

- After changing any `saa-c03-questions/domain*.md` file, run `python3 scripts/build_questions.py` and
  commit the regenerated `docs/questions.js` with it. Never edit `docs/questions.js` by hand.
- Never renumber existing questions. Options can be freely reordered (and the correct answer's letter
  changed) — `scripts/build_questions.py` gives each option a stable id (a hash of the question id and
  the option's own text), and saved exam history in users' browsers refers to answers by that id, not
  by letter. Editing an option's wording changes its id, which stops past exam reviews that included
  the old wording from being marked right/wrong (fine for occasional fixes, but avoid rewriting options
  wholesale).
- Keep options similar in length and plausible, so the correct answer can't be spotted by its length,
  and keep correct answers spread across letters rather than clustered on one.
- Check facts against current AWS documentation, and link a specific docs page in `Resource:`.
- Each question's answer block can end with a "Why not the others:" list: one `- **X.** reason` line per
  wrong option, just before `Resource:` (see domain 1, questions 1–5). If a question has the list, it
  must cover every wrong option and no correct one; the build script checks this. Keep each reason to
  one or two sentences that say what the named service or approach actually does and why that doesn't
  fit this scenario. When reordering options, move their notes' letters with them.
- Each answer block can also have one architecture diagram of the correct answer: a fenced
  ```` ```arch ```` block after the explanation, before "Why not the others:" (see any question). The
  first part nests boxes by indentation (two spaces per level); after a `---` line come the arrows:
  - A box is `<kind> Label | small sub-label`, with kind one of `cloud`, `onprem`, `account`, `region`,
    `vpc`, `az`, `public`, `private`, `asg`, `sg`, `group`. `row` and `col` are invisible boxes that only
    arrange what they hold. A box lays out its contents left to right (an `az` top to bottom); add
    ` [col]` or ` [row]` at the end of the line to change that.
  - A service icon is `id: icon Label | sub-label`. Icon keys are listed in `ARCH_ICONS` in
    `scripts/build_questions.py`, and their files are the official AWS Architecture Icons in `docs/icons/`.
  - A leading `*` on a label highlights the answer's key piece (not on sub-labels or arrow labels).
  - Arrows: `a -> b : label`, numbered steps `1. a -> b`, `a -x-> b` for a blocked or denied path,
    `a ~> b` dashed (asynchronous or optional), `a <-> b` both ways.
  Lay icons out in the order the request flows, put fan-in or fan-out targets in a `col`, and avoid two
  arrows between the same pair of icons. Check the result in a browser at desktop and phone width (it
  shrinks to fit on phones, and a tap opens it full size). The build script rejects malformed diagrams.
- `docs/legacy-answer-map.js` is a frozen, one-time snapshot used to migrate exam history saved before
  options got stable ids. Never regenerate or edit it.

## Editing the app

- Run `node --check docs/app.js` after changing it.
- Layouts must work at phone width (390px) without horizontal scrolling.

## Pull requests

- Keep each pull request to one issue, and write `Closes #<issue>` in its description.
