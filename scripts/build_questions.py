#!/usr/bin/env python3
"""Parse saa-c03-questions/domain*.md into docs/questions.js for the web quiz.

Run from the repository root after editing any question file:

    python3 scripts/build_questions.py
"""
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "saa-c03-questions"
OUT = ROOT / "docs" / "questions.js"

DOMAIN_RE = re.compile(r"^# Domain (\d): (.+?) \((\d+)%\)")
TASK_RE = re.compile(r"^## Task (\d\.\d): (.+)")
QUESTION_RE = re.compile(r"^\*\*(\d+)\.(?:\s*\(Select (\w+)\.\))?\*\*\s*(.*)")
OPTION_RE = re.compile(r"^- ([A-F])\. (.+)")
ANSWER_RE = re.compile(r"^\*\*([A-F](?:,\s*[A-F])*)\.\*\*\s*(.*)")
RESOURCE_RE = re.compile(r"^Resource:\s*<([^>]+)>")
WHY_HEADER_RE = re.compile(r"^Why not the others:\s*$")
WHY_RE = re.compile(r"^- \*\*([A-F])\.\*\*\s+(.+)")
SELECT_IN_STEM_RE = re.compile(r"\s*\(Select (\w+)\.\)\s*$")
WORDS = {"TWO": 2, "THREE": 3}


def option_id(question_id, text):
    """Stable option identifier, independent of the option's letter/position.

    Exam history in users' browsers refers to answers by this id, so it must
    stay the same across Markdown edits that only reorder options. It changes
    only if the option's own text changes.
    """
    digest = hashlib.sha1(f"{question_id}:{text}".encode("utf-8")).hexdigest()
    return digest[:10]


def parse_file(path):
    domains, questions = [], []
    domain = task = q = None
    in_answer = False

    def finish():
        if q is None:
            return
        problems = []
        if len(q["options"]) < 4:
            problems.append("fewer than 4 options")
        if not q["answer"]:
            problems.append("no answer")
        letters = [o["key"] for o in q["options"]]
        if any(a not in letters for a in q["answer"]):
            problems.append("answer letter not among options")
        wrong = [k for k in letters if k not in q["answer"]]
        if any(k not in wrong for k in q["why"]):
            problems.append("'why not' note for a correct or missing option")
        if q["why"] and sorted(q["why"]) != sorted(wrong):
            problems.append("'why not' notes must cover every wrong option")
        if problems:
            sys.exit(f"{path.name} {q['id']}: " + ", ".join(problems))
        id_by_letter = {o["key"]: option_id(q["id"], o["text"]) for o in q["options"]}
        q["answer"] = [id_by_letter[a] for a in q["answer"]]
        q["options"] = [
            {"id": id_by_letter[o["key"]], "text": o["text"], **({"why": q["why"][o["key"]]} if o["key"] in q["why"] else {})}
            for o in q["options"]
        ]
        del q["why"]
        q["explanation"] = " ".join(q["explanation"]).strip()
        questions.append(q)

    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if m := DOMAIN_RE.match(line):
            domain = {"id": int(m[1]), "name": m[2], "weight": int(m[3]), "tasks": []}
            domains.append(domain)
        elif m := TASK_RE.match(line):
            task = {"id": m[1], "name": m[2]}
            domain["tasks"].append(task)
        elif m := QUESTION_RE.match(line):
            finish()
            stem = m[3]
            select = m[2]
            if not select and (s := SELECT_IN_STEM_RE.search(stem)):
                select = s[1]
                stem = stem[: s.start()]
            q = {
                "id": f"{domain['id']}-{int(m[1]):02d}",
                "domain": domain["id"],
                "task": task["id"],
                "stem": stem.strip(),
                "select": WORDS.get(select.upper(), 1) if select else 1,
                "options": [],
                "answer": [],
                "explanation": [],
                "resource": None,
                "why": {},
            }
            in_answer = False
        elif q is None:
            continue
        elif line.startswith("<details>"):
            in_answer = True
        elif line.startswith("</details>"):
            in_answer = False
        elif not in_answer and (m := OPTION_RE.match(line)):
            q["options"].append({"key": m[1], "text": m[2]})
        elif in_answer and (m := ANSWER_RE.match(line)):
            q["answer"] = [a.strip() for a in m[1].split(",")]
            if m[2]:
                q["explanation"].append(m[2])
        elif in_answer and (m := RESOURCE_RE.match(line)):
            q["resource"] = m[1]
        elif in_answer and WHY_HEADER_RE.match(line):
            continue
        elif in_answer and (m := WHY_RE.match(line)):
            if m[1] in q["why"]:
                sys.exit(f"{path.name} {q['id']}: two 'why not' notes for {m[1]}")
            q["why"][m[1]] = m[2].strip()
        elif in_answer and line:
            q["explanation"].append(line)
    finish()

    for q in questions:
        if q["select"] != len(q["answer"]):
            sys.exit(f"{path.name} {q['id']}: select {q['select']} but {len(q['answer'])} answers")
    return domains, questions


def main():
    domains, questions = [], []
    for path in sorted(SRC.glob("domain*.md")):
        d, q = parse_file(path)
        domains += d
        questions += q
    bank = {"exam": "SAA-C03", "domains": domains, "questions": questions}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        "// Generated by scripts/build_questions.py from saa-c03-questions/*.md. Do not edit by hand.\n"
        "window.QUESTION_BANK = " + json.dumps(bank, indent=1, ensure_ascii=False) + ";\n",
        encoding="utf-8",
    )
    per_domain = {d["id"]: sum(q["domain"] == d["id"] for q in questions) for d in domains}
    print(f"Wrote {len(questions)} questions to {OUT.relative_to(ROOT)}: {per_domain}")


if __name__ == "__main__":
    main()
