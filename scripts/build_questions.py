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
DIAGRAM_OPEN_RE = re.compile(r"^```diagram\s*$")
EDGE_RE = re.compile(r"\s+(?:-(?:(x)?(?:\(([^()]*)\))?-)?>|(~)(?:\(([^()]*)\)~)?>)\s+")
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


def parse_node(text):
    """`*Label | sub-label`: a box; a leading * highlights the answer's key piece."""
    text = text.strip()
    node = {}
    if text.startswith("*"):
        node["h"] = 1
        text = text[1:].strip()
    label, _, sub = text.partition(" | ")
    if not label.strip() or any(c in text for c in ("[", "]", "\x00", "->", "~>")):
        raise ValueError(f"bad box {text!r}")
    node["n"] = label.strip()
    if sub.strip().startswith("*"):
        raise ValueError(f"put * before the box's label, not its sub-label: {text!r}")
    if sub.strip():
        node["s"] = sub.strip()
    return node


def parse_chain(text, groups, nested=False):
    """`A -> B -(label)-> C -x-> D ~> E`: boxes joined by arrows, left to right.

    `-x->` is a blocked or denied path, `~>` a dashed (asynchronous or optional) one.
    `A & B` stacks boxes side by side across the flow; `[Title: A -> B]` frames part
    of the chain (a VPC, an account, a Region).
    """
    parts = EDGE_RE.split(text)
    chain = []
    for i in range(0, len(parts), 5):
        piece = parts[i].strip()
        if i:
            x, label, dashed, dashed_label = parts[i - 4 : i]
            edge = {"e": (label or dashed_label or "").strip()}
            if edge["e"].startswith("*"):
                raise ValueError(f"arrow labels can't be highlighted: {edge['e']!r}")
            if x:
                edge["x"] = 1
            if dashed:
                edge["d"] = 1
            chain.append(edge)
        if m := re.fullmatch(r"\x00(\d+)\x00", piece):
            if nested:
                raise ValueError("frames can't be nested")
            title, sep, inner = groups[int(m[1])].partition(": ")
            if not sep or not title.strip() or title.strip().startswith("*"):
                raise ValueError(f"frame needs 'Title: ...' (no * highlight), got {groups[int(m[1])]!r}")
            chain.append({"g": title.strip(), "c": parse_chain(inner, groups, nested=True)})
        else:
            boxes = [parse_node(t) for t in piece.split(" & ")]
            chain.append(boxes[0] if len(boxes) == 1 else {"k": boxes})
    return chain


def parse_diagram(lines):
    rows = []
    for line in lines:
        groups = []

        def stash(m):
            groups.append(m[1])
            return f"\x00{len(groups) - 1}\x00"

        flat = re.sub(r"\[([^\[\]]+)\]", stash, line)
        if "[" in flat or "]" in flat:
            raise ValueError(f"unbalanced [ ] in {line!r}")
        rows.append(parse_chain(flat, groups))
    if not rows:
        raise ValueError("empty diagram")
    return rows


def parse_file(path):
    domains, questions = [], []
    domain = task = q = None
    in_answer = False
    diagram = None

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
        if q["diagram"] is None:
            del q["diagram"]
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
                "diagram": None,
            }
            in_answer = False
        elif q is None:
            continue
        elif diagram is not None:
            if line == "```":
                if q["diagram"] is not None:
                    sys.exit(f"{path.name} {q['id']}: more than one diagram")
                try:
                    q["diagram"] = parse_diagram(diagram)
                except ValueError as e:
                    sys.exit(f"{path.name} {q['id']}: diagram: {e}")
                diagram = None
            elif line.startswith("</details>"):
                sys.exit(f"{path.name} {q['id']}: diagram block not closed with ```")
            elif line:
                diagram.append(line)
        elif in_answer and DIAGRAM_OPEN_RE.match(line):
            diagram = []
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
