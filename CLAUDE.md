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
- `docs/legacy-answer-map.js` is a frozen, one-time snapshot used to migrate exam history saved before
  options got stable ids. Never regenerate or edit it.

## Editing the app

- Run `node --check docs/app.js` after changing it.
- Layouts must work at phone width (390px) without horizontal scrolling.

## Pull requests

- Keep each pull request to one issue, and write `Closes #<issue>` in its description.
