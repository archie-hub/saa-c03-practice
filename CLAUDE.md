# saa-c03-practice

A static SAA-C03 practice-exam site. The app is in `docs/` (plain HTML, CSS and JavaScript, served by
GitHub Pages from `main`); the question bank is Markdown in `saa-c03-questions/`.

## Editing questions

- After changing any `saa-c03-questions/domain*.md` file, run `python3 scripts/build_questions.py` and
  commit the regenerated `docs/questions.js` with it. Never edit `docs/questions.js` by hand.
- Never renumber existing questions, and keep each correct answer on its current letter. Saved exam
  history in users' browsers refers to questions by `<domain>-<number>` and to answers by letter.
- Keep options similar in length and plausible, so the correct answer can't be spotted by its length.
- Check facts against current AWS documentation, and link a specific docs page in `Resource:`.

## Editing the app

- Run `node --check docs/app.js` after changing it.
- Layouts must work at phone width (390px) without horizontal scrolling.

## Pull requests

- Keep each pull request to one issue, and write `Closes #<issue>` in its description.
