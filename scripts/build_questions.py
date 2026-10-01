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
ARCH_OPEN_RE = re.compile(r"^```arch\s*$")
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


# Architecture diagrams (```arch blocks). Box kinds, outermost first in a typical nesting;
# `row` and `col` are invisible boxes that only arrange what they hold.
ARCH_BOXES = {"cloud", "onprem", "account", "region", "vpc", "az", "public", "private", "asg", "sg", "group", "row", "col"}
# Service icons: key -> (category, short label shown on the placeholder icon).
ARCH_ICONS = {
    # people and places
    "users": ("general", "Users"), "user": ("general", "User"), "internet": ("general", "Web"),
    "client": ("general", "PC"), "mobile": ("general", "Phone"), "server": ("general", "Srv"),
    "datacenter": ("general", "DC"), "firewall": ("general", "FW"),
    # compute
    "ec2": ("compute", "EC2"), "asg": ("compute", "ASG"), "lambda": ("compute", "λ"),
    "ecs": ("container", "ECS"), "eks": ("container", "EKS"), "fargate": ("container", "Fgt"),
    "ecr": ("container", "ECR"), "batch": ("compute", "Bat"), "beanstalk": ("compute", "EB"),
    "outposts": ("compute", "Out"), "localzone": ("compute", "LZ"), "wavelength": ("compute", "WL"),
    # networking
    "alb": ("network", "ALB"), "nlb": ("network", "NLB"), "gwlb": ("network", "GWLB"), "elb": ("network", "ELB"),
    "igw": ("network", "IGW"), "eigw": ("network", "EIGW"), "nat": ("network", "NAT"), "tgw": ("network", "TGW"),
    "vgw": ("network", "VGW"), "cgw": ("network", "CGW"), "vpn": ("network", "VPN"), "clientvpn": ("network", "CVPN"),
    "dx": ("network", "DX"), "dxgw": ("network", "DXGW"), "peering": ("network", "PCX"),
    "endpoint": ("network", "VPCE"), "gwendpoint": ("network", "GWE"), "privatelink": ("network", "PL"),
    "route53": ("network", "R53"), "resolver": ("network", "Rslv"), "cloudfront": ("network", "CF"),
    "accelerator": ("network", "GA"), "apigw": ("network", "API"), "lattice": ("network", "Lat"),
    "cloudwan": ("network", "WAN"), "eni": ("network", "ENI"), "nacl": ("network", "NACL"),
    "flowlogs": ("network", "Flow"), "rtb": ("network", "RT"), "networkfirewall": ("security", "NFW"),
    "verifiedaccess": ("security", "VA"),
    # storage
    "s3": ("storage", "S3"), "ebs": ("storage", "EBS"), "efs": ("storage", "EFS"), "fsx": ("storage", "FSx"),
    "glacier": ("storage", "Glac"), "storagegateway": ("storage", "SGW"), "backup": ("storage", "Bkp"),
    "snowball": ("storage", "Snow"), "instancestore": ("storage", "NVMe"), "drs": ("storage", "DRS"),
    # database
    "rds": ("database", "RDS"), "aurora": ("database", "Aur"), "dynamodb": ("database", "DDB"),
    "elasticache": ("database", "EC"), "dax": ("database", "DAX"), "memorydb": ("database", "MDB"),
    "redshift": ("analytics", "RS"), "neptune": ("database", "Nep"), "documentdb": ("database", "Doc"),
    "keyspaces": ("database", "Ksp"), "timestream": ("database", "TS"), "rdsproxy": ("database", "Prx"),
    # integration
    "sqs": ("integration", "SQS"), "sns": ("integration", "SNS"), "eventbridge": ("integration", "EvB"),
    "stepfunctions": ("integration", "SFN"), "mq": ("integration", "MQ"), "appsync": ("integration", "AS"),
    "scheduler": ("integration", "Sch"),
    # analytics
    "kinesis": ("analytics", "KDS"), "firehose": ("analytics", "Fire"), "msk": ("analytics", "MSK"),
    "athena": ("analytics", "Ath"), "glue": ("analytics", "Glue"), "emr": ("analytics", "EMR"),
    "opensearch": ("analytics", "OS"), "quicksight": ("analytics", "QS"), "lakeformation": ("analytics", "LF"),
    "datasync": ("migration", "DS"), "dms": ("migration", "DMS"), "transfer": ("migration", "SFTP"),
    # security and identity
    "iam": ("security", "IAM"), "role": ("security", "Role"), "policy": ("security", "Pol"), "sts": ("security", "STS"),
    "identitycenter": ("security", "SSO"), "cognito": ("security", "Cog"), "directory": ("security", "AD"),
    "kms": ("security", "KMS"), "cloudhsm": ("security", "HSM"), "secrets": ("security", "SM"),
    "acm": ("security", "ACM"), "privateca": ("security", "PCA"), "waf": ("security", "WAF"),
    "shield": ("security", "Shld"), "guardduty": ("security", "GD"), "inspector": ("security", "Insp"),
    "macie": ("security", "Mac"), "securityhub": ("security", "SH"), "detective": ("security", "Det"),
    "accessanalyzer": ("security", "AA"), "firewallmanager": ("security", "FM"), "ram": ("security", "RAM"),
    "artifact": ("security", "Art"), "auditmanager": ("security", "Aud"), "dnsfirewall": ("security", "DNSF"),
    # management and cost
    "organizations": ("management", "Org"), "scp": ("management", "SCP"), "controltower": ("management", "CT"),
    "cloudtrail": ("management", "Trail"), "cloudwatch": ("management", "CW"), "config": ("management", "Cfg"),
    "ssm": ("management", "SSM"), "servicecatalog": ("management", "SC"), "trustedadvisor": ("management", "TA"),
    "computeoptimizer": ("management", "CO"), "xray": ("management", "XRay"), "fis": ("management", "FIS"),
    "resiliencehub": ("management", "RH"), "arc": ("management", "ARC"), "budgets": ("cost", "Bdgt"),
    "costexplorer": ("cost", "CE"), "savingsplans": ("cost", "SP"), "billing": ("cost", "Bill"),
}
ARCH_NODE_RE = re.compile(r"^([a-z][\w-]*):\s+([a-z0-9]+)\s+(.+)$")
ARCH_FLOW_RE = re.compile(r"^(?:(\d+)\.\s+)?([a-z][\w-]*)\s+(->|-x->|~>|<->)\s+([a-z][\w-]*)(?:\s*:\s*(.+))?$")


def parse_arch(lines):
    """Nested boxes by indentation (`vpc Label | sub`), service icons (`id: icon Label | sub`),
    then a `---` line and arrows between ids (`1. a -> b : label`; `-x->` blocked, `~>` dashed,
    `<->` both ways). A leading `*` on a label highlights the answer's key piece.
    """
    if "---" not in [l.strip() for l in lines]:
        raise ValueError("needs a --- line before the arrows")
    cut = [l.strip() for l in lines].index("---")
    root = {"c": []}
    stack = [(-1, root)]
    ids = set()
    for raw in lines[:cut]:
        indent = len(raw) - len(raw.lstrip(" "))
        text = raw.strip()
        while stack[-1][0] >= indent:
            stack.pop()
        parent = stack[-1][1]
        if "c" not in parent:
            raise ValueError(f"only boxes can contain things: {text!r}")
        if m := ARCH_NODE_RE.match(text):
            nid, icon, rest = m[1], m[2], m[3]
            if icon not in ARCH_ICONS:
                raise ValueError(f"unknown icon {icon!r}")
            if nid in ids:
                raise ValueError(f"duplicate id {nid!r}")
            ids.add(nid)
            node = {"id": nid, "i": icon}
            stack.append((indent, node))
        else:
            kind, _, rest = text.partition(" ")
            if kind not in ARCH_BOXES:
                raise ValueError(f"unknown box kind {kind!r} (or a node missing 'id: icon')")
            node = {"k": kind, "c": []}
            if m := re.search(r"\s*\[(row|col)\]$", rest):
                node["d"] = m[1]
                rest = rest[: m.start()]
            stack.append((indent, node))
        rest = rest.strip()
        if rest.startswith("*"):
            node["h"] = 1
            rest = rest[1:].strip()
        label, _, sub = rest.partition(" | ")
        if sub.strip().startswith("*"):
            raise ValueError(f"put * before the label, not the sub-label: {text!r}")
        if label.strip():
            node["n"] = label.strip()
        if sub.strip():
            node["s"] = sub.strip()
        if "k" not in node and "n" not in node:
            raise ValueError(f"icon {nid!r} needs a label")
        parent["c"].append(node)
    flows = []
    for raw in lines[cut + 1 :]:
        text = raw.strip()
        if not text:
            continue
        m = ARCH_FLOW_RE.match(text)
        if not m:
            raise ValueError(f"bad arrow {text!r}")
        for nid in (m[2], m[4]):
            if nid not in ids:
                raise ValueError(f"arrow names unknown id {nid!r}")
        flow = {"a": m[2], "b": m[4]}
        if m[1]:
            flow["no"] = int(m[1])
        if m[5]:
            if m[5].strip().startswith("*"):
                raise ValueError(f"arrow labels can't be highlighted: {text!r}")
            flow["e"] = m[5].strip()
        if m[3] != "->":
            flow["t"] = {"-x->": "x", "~>": "d", "<->": "both"}[m[3]]
        flows.append(flow)
    if not root["c"]:
        raise ValueError("empty diagram")
    return {"c": root["c"], "f": flows}


def parse_file(path):
    domains, questions = [], []
    domain = task = q = None
    in_answer = False
    arch = None

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
        if q["arch"] is None:
            del q["arch"]
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
                "arch": None,
            }
            in_answer = False
        elif q is None:
            continue
        elif arch is not None:
            if line == "```":
                if q["arch"] is not None:
                    sys.exit(f"{path.name} {q['id']}: more than one arch block")
                try:
                    q["arch"] = parse_arch(arch)
                except ValueError as e:
                    sys.exit(f"{path.name} {q['id']}: arch: {e}")
                arch = None
            elif line.startswith("</details>"):
                sys.exit(f"{path.name} {q['id']}: arch block not closed with ```")
            elif line:
                arch.append(raw.rstrip())
        elif in_answer and ARCH_OPEN_RE.match(line):
            arch = []
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


def arch_nodes(items):
    for it in items:
        if "i" in it:
            yield it
        yield from arch_nodes(it.get("c", []))


def main():
    domains, questions = [], []
    for path in sorted(SRC.glob("domain*.md")):
        d, q = parse_file(path)
        domains += d
        questions += q
    used = {n["i"] for q in questions if "arch" in q for n in arch_nodes(q["arch"]["c"])}
    icons = {}
    for k in sorted(used):
        if not (ROOT / "docs" / "icons" / f"{k}.svg").exists():
            sys.exit(f"missing docs/icons/{k}.svg")
        icons[k] = {"c": ARCH_ICONS[k][0], "a": ARCH_ICONS[k][1]}
        if (ROOT / "docs" / "icons" / f"{k}-dark.svg").exists():
            icons[k]["dark"] = 1
    bank = {"exam": "SAA-C03", "domains": domains, "icons": icons, "questions": questions}
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
