# saa-c03-practice

## SAA-C03 practice exams

A static web app for practicing the AWS Certified Solutions Architect – Associate (SAA-C03) exam.
It lives in [`docs/`](docs/) and runs on GitHub Pages with no server.

- **65-question exams** weighted by domain like the real exam (D1 30%, D2 26%, D3 24%, D4 20%), with a
  130-minute timer (optional). You can also choose a single domain, a different length, or study mode (check
  each answer as you go).
- **A different exam each time.** *Balanced* mode draws the questions you've seen least, so successive exams
  rotate through the whole bank. *Weak spots* puts your recently missed questions first. *Random* is a plain
  shuffle. Answer options are shuffled on every run.
- **Run tracking.** Every finished exam is saved with your answers, time taken, and per-domain and per-task scores.
  You can review any past exam question by question, or retake just the ones you missed.
- **Progress dashboard.** A score trend across exams, accuracy by domain and task against a 72% target,
  and coverage of the question bank.

Progress is stored in your browser's `localStorage`, so it's per browser and per device. Use
**History → Export / Import** to back it up or move it to another device.

### Publish on GitHub Pages

1. Merge this branch into `main`.
2. In the repository, go to **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**,
   select `main` and the `/docs` folder, and save.
3. The site appears at `https://archie-hub.github.io/saa-c03-practice/` within a minute or two.

Note: GitHub Pages on a free plan requires the repository to be public.

### Run locally

```sh
cd docs && python3 -m http.server 8000
# open http://localhost:8000
```

Opening `docs/index.html` directly from disk also works.

### Adding or editing questions

The question bank is written in Markdown in [`saa-c03-questions/`](saa-c03-questions/). After changing it,
regenerate the data file the site loads and commit both:

```sh
python3 scripts/build_questions.py   # writes docs/questions.js
```

The script checks that every question has at least 4 options, a valid answer, and the right number of answers
for "Select TWO/THREE" questions. Keep the existing format: a `**N.**` stem, `- A.` options, and a `<details>`
block with the `**X.**` answer and a `Resource:` link. Question IDs are `<domain>-<number>`, so avoid renumbering
existing questions or past exam history will point at the wrong questions.
