# Repository rules

## Never commit secrets

This repository is public. Nothing that should be kept private may be committed or pushed, ever:
API keys, access keys, tokens, passwords, private keys or certificates, `.env` files, cloud credentials,
connection strings with credentials, personal data, or exam-history exports (`saa-c03-history-*.json`).

- Before every commit, run `python3 scripts/check_secrets.py --staged` and do not commit if it fails.
  The `.githooks/pre-commit` hook runs this automatically once `git config core.hooksPath .githooks` is set;
  the SessionStart hook in `.claude/settings.json` sets it for Claude Code sessions.
- Never bypass the hook (`--no-verify`), weaken `scripts/check_secrets.py`, or delete `.gitignore` entries to get a
  commit through. If the scan flags a real secret, stop and tell the user; do not push.
- Only add `secret-scan: allow` to a line when the match is clearly not a real credential (for example
  documentation text), and say so in the commit message.
- If the web app ever needs a credential (for example a sync token), the user enters it at runtime in the browser;
  it must never appear in source, config, or build output.
- If a secret is ever pushed, removing it in a new commit is not enough: it must be revoked/rotated
  immediately, and the user told.

## Question bank

`docs/questions.js` is generated. After editing `saa-c03-questions/*.md`, run `python3 scripts/build_questions.py`
and commit both.
