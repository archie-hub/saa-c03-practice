#!/usr/bin/env python3
"""Block credentials and other sensitive files from being committed.

Usage:
    python3 scripts/check_secrets.py            # scan all tracked files
    python3 scripts/check_secrets.py --staged   # scan staged changes (used by the pre-commit hook)
    python3 scripts/check_secrets.py --history  # scan every line ever added in git history (used by CI)

A false positive can be allowed by putting `secret-scan: allow` on the same line.
Exits 1 if anything is found. Matched values are never printed in full.
"""
import re
import subprocess
import sys
from fnmatch import fnmatch

ALLOW_MARKER = "secret-scan: allow"

PATTERNS = [
    ("AWS access key ID", r"\b(?:A3T[A-Z0-9]|AKIA|ASIA|ABIA|ACCA)[A-Z0-9]{16}\b"),
    ("AWS secret access key", r"(?i)aws.{0,20}(?:secret|private).{0,20}['\"=:\s][A-Za-z0-9/+]{40}\b"),
    ("Private key", r"-----BEGIN (?:[A-Z]+ )?PRIVATE KEY(?: BLOCK)?-----"),
    ("GitHub token", r"\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{50,})\b"),
    ("Slack token", r"\bxox[baprs]-[A-Za-z0-9-]{10,}"),
    ("Slack webhook", r"https://hooks\.slack\.com/services/[A-Za-z0-9/]+"),
    ("Anthropic API key", r"\bsk-ant-[A-Za-z0-9_-]{20,}"),
    ("OpenAI API key", r"\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}"),
    ("Google API key", r"\bAIza[0-9A-Za-z_-]{35}\b"),
    ("Stripe live key", r"\b[rs]k_live_[0-9A-Za-z]{20,}"),
    ("JSON Web Token", r"\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}"),
    ("Credentials in URL", r"\b[a-z][a-z0-9+.-]*://[^\s/:@'\"]+:[^\s/:@'\"]{3,}@[^\s/]+"),
    (
        "Hard-coded secret",
        r"(?i)\b(?:password|passwd|pwd|secret|client_secret|api[_-]?key|access[_-]?token|auth[_-]?token|private[_-]?key)\b"
        r"\s*[:=]\s*['\"][^'\"\s]{8,}['\"]",
    ),
]
COMPILED = [(name, re.compile(rx)) for name, rx in PATTERNS]

# Files that should never be committed, whatever they contain.
BLOCKED_FILES = [
    ".env", ".env.*", "*.pem", "*.key", "*.p12", "*.pfx", "*.jks", "*.keystore",
    "id_rsa*", "id_dsa*", "id_ecdsa*", "id_ed25519*", "*.ppk",
    "credentials", "credentials.*", ".netrc", ".npmrc", ".pypirc",
    "*.tfstate", "*.tfstate.*", "*.tfvars",
    "saa-c03-history-*.json",  # personal exam-history exports from the web app
]
BLOCKED_OK = [".env.example", ".env.sample", ".env.template"]


def git(*args):
    return subprocess.run(["git", *args], capture_output=True, text=True, check=True).stdout


def blocked(path):
    name = path.rsplit("/", 1)[-1]
    if name in BLOCKED_OK:
        return False
    return any(fnmatch(name, pat) for pat in BLOCKED_FILES)


def redact(text):
    return text[:4] + "…" if len(text) > 8 else "…"


def scan_line(line):
    if ALLOW_MARKER in line:
        return []
    return [(name, m.group(0)) for name, rx in COMPILED for m in rx.finditer(line)]


def scan_diff(diff, where):
    """Scan added lines of a unified diff. `where` labels the source (e.g. a commit)."""
    findings, path, lineno = [], None, 0
    for line in diff.splitlines():
        if line.startswith("commit "):
            where = line.split()[1][:10]
        elif line.startswith("+++ "):
            path = line[6:] if line.startswith("+++ b/") else None
            if path and blocked(path):
                findings.append((where, path, 0, "Sensitive file type", path))
        elif line.startswith("@@"):
            m = re.search(r"\+(\d+)", line)
            lineno = int(m.group(1)) if m else 0
        elif path and line.startswith("+") and not line.startswith("+++"):
            for name, match in scan_line(line[1:]):
                findings.append((where, path, lineno, name, match))
            lineno += 1
        elif path and not line.startswith("-"):
            lineno += 1
    return findings


def scan_tracked():
    findings = []
    for path in git("ls-files", "-z").split("\0"):
        if not path:
            continue
        if blocked(path):
            findings.append(("tracked", path, 0, "Sensitive file type", path))
            continue
        try:
            with open(path, encoding="utf-8") as f:
                for i, line in enumerate(f, 1):
                    for name, match in scan_line(line):
                        findings.append(("tracked", path, i, name, match))
        except (UnicodeDecodeError, FileNotFoundError, IsADirectoryError):
            continue
    return findings


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "--all"
    if mode == "--staged":
        findings = scan_diff(git("diff", "--cached", "-U0", "--no-color"), "staged")
    elif mode == "--history":
        findings = scan_diff(git("log", "--all", "-p", "-U0", "--no-color", "--format=commit %H"), "history")
    elif mode == "--all":
        findings = scan_tracked()
    else:
        sys.exit(__doc__)

    if not findings:
        print(f"check_secrets ({mode.lstrip('-')}): no secrets found.")
        return
    print(f"check_secrets ({mode.lstrip('-')}): {len(findings)} possible secret(s) found:\n", file=sys.stderr)
    for where, path, lineno, name, match in findings:
        loc = f"{path}:{lineno}" if lineno else path
        print(f"  [{where}] {loc}  {name}  ({redact(match)})", file=sys.stderr)
    print(
        "\nRemove the secret (and rotate it if it was real), or add the file to .gitignore.\n"
        f"If this is a false positive, add `{ALLOW_MARKER}` to the line.",
        file=sys.stderr,
    )
    sys.exit(1)


if __name__ == "__main__":
    main()
