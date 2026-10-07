#!/usr/bin/env python3
"""Validate a CLP taxonomy file and run the synthetic classification tests.

Checks:
  structural integrity, status/version/eligibility rules, canonical vs historical location,
  the one-node rule for moved CSR topics, source references, topic wording against the
  official syllabus PDFs (S1 / S1-ORIG), syllabus bullet coverage, M2 subtopic headings on
  the cited pages, and v0.1 -> v0.2 ID preservation.
Then it evaluates every synthetic test: the expected node must be a legal target, and the
outcome derived from taxonomy rules must equal the expected outcome.

Writes 04_Verification/clp_taxonomy_v<ver>_validation.{md,json}.
Exit code 0 only if every check and every test passes.

Usage: python3 -I scripts/validate_clp_taxonomy.py [version]   (default 0.2; run from project root)
"""
import json
import re
import subprocess
import sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VER = sys.argv[1] if len(sys.argv) > 1 else "0.2"
REF = ROOT / "01_Source_Papers" / "official_reference"
S1 = REF / "S1" / "icsi-new-syllabus-2022-9a82f048.pdf"
S1O = REF / "S1_original_wayback" / "icsi-new-syllabus-2022_wayback-20260327.pdf"
M2 = REF / "M2" / "company-law-practices-3e591a57.pdf"
ORIG, CUR = "2022-original", "2022-mod-dec2025"
C, D, P, OOT = "CURRENT", "DELETED_FROM_DEC2025", "PARTIALLY_DELETED", "OUT_OF_TAXONOMY_REVIEW"
LEVEL_PARENT = {"chapter": "subject", "topic": "chapter", "subtopic": "topic"}

results = []  # (check_id, passed, detail)


def check(cid, ok, detail=""):
    results.append((cid, bool(ok), detail))


def pdf_pages(path):
    return subprocess.run(["pdftotext", "-layout", str(path), "-"], capture_output=True, text=True, check=True).stdout.split("\f")


def norm(s):
    return re.sub(r"[^a-z0-9]+", " ", s.lower().replace("’", "'").replace("–", "-")).strip()


tax = json.loads((ROOT / "taxonomy" / f"clp_taxonomy_v{VER}.json").read_text())
nodes = tax["nodes"]
by = {n["taxonomy_id"]: n for n in nodes}
kids = defaultdict(list)
for n in nodes:
    kids[n["parent_id"]].append(n)

# ---- V01 unique ids
ids = [n["taxonomy_id"] for n in nodes]
dups = [k for k, v in Counter(ids).items() if v > 1]
check("V01 unique taxonomy_id", not dups, f"{len(ids)} nodes; duplicates: {dups}")

# ---- V02 parent exists and level hierarchy
bad = []
for n in nodes:
    if n["level"] == "subject":
        if n["parent_id"] is not None:
            bad.append(n["taxonomy_id"])
        continue
    par = by.get(n["parent_id"])
    if not par or par["level"] != LEVEL_PARENT[n["level"]]:
        bad.append(n["taxonomy_id"])
check("V02 parent exists with correct level", not bad, f"bad: {bad}")

# ---- V03 allowed statuses
allowed = {C, D, P, OOT}
bad = [n["taxonomy_id"] for n in nodes if n["status"] not in allowed]
bad += [n["taxonomy_id"] for n in nodes if n["status"] == OOT and n.get("classification_use") != "CONTROL"]
bad += [n["taxonomy_id"] for n in nodes if n["status"] == P and n["level"] != "chapter"]
check("V03 status values valid (OOT only on control; PARTIALLY_DELETED only on chapters)", not bad, f"bad: {bad}")

# ---- V04 syllabus_version consistent with status
bad = []
for n in nodes:
    sv = n["syllabus_version"]
    if n["status"] == D and sv != [ORIG]:
        bad.append((n["taxonomy_id"], sv))
    if n["status"] in (C, P) and CUR not in sv:
        bad.append((n["taxonomy_id"], sv))
check("V04 deleted nodes only in 2022-original; current nodes include 2022-mod-dec2025", not bad, f"bad: {bad}")

# ---- V05 children of deleted nodes are deleted
bad = [n["taxonomy_id"] for n in nodes if n["parent_id"] in by and by[n["parent_id"]]["status"] == D and n["status"] != D]
check("V05 children of a deleted node are deleted", not bad, f"bad: {bad}")

# ---- V06 alias / deprecated targets
bad = []
for n in nodes:
    if n.get("classify_to"):
        t = by.get(n["classify_to"])
        if not t or t.get("classification_use") != "CLASSIFIABLE" or t.get("node_lifecycle") != "ACTIVE":
            bad.append((n["taxonomy_id"], n["classify_to"]))
        if n.get("classification_use") != "ALIAS_ONLY":
            bad.append((n["taxonomy_id"], "has classify_to but is not ALIAS_ONLY"))
    if n.get("node_lifecycle") == "DEPRECATED" and not n.get("classify_to"):
        bad.append((n["taxonomy_id"], "deprecated without classify_to"))
check("V06 alias/deprecated nodes point to an ACTIVE classifiable node", not bad, f"bad: {bad}")

# ---- V07 eligibility rules
bad = []
for n in nodes:
    use, life = n.get("classification_use"), n.get("node_lifecycle")
    exp_hist = use in ("CLASSIFIABLE", "STRUCTURAL") and life == "ACTIVE"
    exp_cur = exp_hist and n["status"] in (C, P)
    if n.get("historical_analytics_eligible") != exp_hist or n.get("current_priority_eligible") != exp_cur:
        bad.append(n["taxonomy_id"])
ctrl = [n for n in nodes if n.get("classification_use") == "CONTROL"]
check("V07 eligibility flags follow the rules", not bad, f"bad: {bad}")
check("V08 holding node: exactly one, status OUT_OF_TAXONOMY_REVIEW, excluded from all analytics",
      len(ctrl) == 1 and ctrl[0]["status"] == OOT and not ctrl[0]["historical_analytics_eligible"] and not ctrl[0]["current_priority_eligible"],
      f"control nodes: {[c['taxonomy_id'] for c in ctrl]}")
dele = [n for n in nodes if n["status"] == D and n.get("classification_use") == "CLASSIFIABLE"]
check("V09 deleted classifiable nodes: historical yes, current priority no",
      all(n["historical_analytics_eligible"] and not n["current_priority_eligible"] for n in dele), f"{len(dele)} deleted classifiable nodes")
opp = by.get("CLP.L10.T02", {})
check("V10 Oppression and Mismanagement retained: DELETED_FROM_DEC2025, historical-only",
      opp.get("status") == D and opp.get("historical_analytics_eligible") and not opp.get("current_priority_eligible")
      and opp.get("classification_use") == "CLASSIFIABLE", json.dumps({k: opp.get(k) for k in ("status", "historical_analytics_eligible", "current_priority_eligible")}))

# ---- V11 canonical vs historical location
bad = []
for n in nodes:
    if n["level"] == "subject" or n.get("classification_use") == "CONTROL":
        continue
    lbv = n.get("lesson_by_syllabus_version", {})
    if set(lbv) != set(n["syllabus_version"]):
        bad.append((n["taxonomy_id"], "lesson_by_syllabus_version keys != syllabus_version"))
    if n.get("canonical_taxonomy_location") != (n.get("classify_to") or n["taxonomy_id"]):
        bad.append((n["taxonomy_id"], "canonical_taxonomy_location"))
    own = ".".join(n["taxonomy_id"].split(".")[:2])
    for v, les in lbv.items():
        if les != own and not n.get("historical_locations"):
            bad.append((n["taxonomy_id"], f"lesson {les} differs from own lesson without historical_locations"))
check("V11 canonical_taxonomy_location / lesson_by_syllabus_version consistent", not bad, f"bad: {bad[:10]}")

# ---- V12 one-node rule for moved CSR topics
csr = {"CSR Committee": "CLP.L18.T05", "CSR Policy": "CLP.L18.T06", "CSR Activities": "CLP.L18.T07"}
alias = {"CLP.L17.T01": "CLP.L18.T05", "CLP.L17.T02": "CLP.L18.T06", "CLP.L17.T04": "CLP.L18.T07"}
bad = []
for name, nid in csr.items():
    n = by.get(nid, {})
    if n.get("classification_use") != "CLASSIFIABLE" or n.get("status") != C:
        bad.append((nid, "canonical not CLASSIFIABLE/CURRENT"))
    if n.get("lesson_by_syllabus_version") != {ORIG: "CLP.L17", CUR: "CLP.L18"}:
        bad.append((nid, "lesson_by_syllabus_version"))
    hl = n.get("historical_locations") or [{}]
    if hl[0].get("historical_lesson_at_exam_time") != "CLP.L17":
        bad.append((nid, "historical_locations"))
for a, t in alias.items():
    if by.get(a, {}).get("classify_to") != t or by[a].get("classification_use") != "ALIAS_ONLY":
        bad.append((a, "alias wrong"))
csr_classifiable = [n["taxonomy_id"] for n in nodes if n["level"] == "topic" and n.get("classification_use") == "CLASSIFIABLE"
                    and norm(n["name"]).replace("csr ", "") in ("csr committee", "committee", "policy", "activities")]
check("V12 moved CSR topics: one canonical node each in L18, L17 aliases, historical L17 recorded", not bad and len(csr_classifiable) == 3,
      f"bad: {bad}; classifiable CSR topic nodes: {csr_classifiable}")

# ---- V13 source references
bad = [n["taxonomy_id"] for n in nodes if n.get("classification_use") != "CONTROL"
       and not (n.get("topic_source_reference", {}).get("document") and n["topic_source_reference"].get("page"))]
check("V13 every non-control node has topic_source_reference with document and page", not bad, f"missing: {bad}")
bad = [n["taxonomy_id"] for n in nodes if n["level"] == "subtopic" and n["basis"] not in ("study_material_heading", "statutory_provision")]
bad += [n["taxonomy_id"] for n in nodes if n["level"] == "subtopic" and n["basis"] == "statutory_provision" and "STATUTORY BASIS" not in n["notes"]]
check("V14 subtopic basis declared; statutory-basis subtopics say so explicitly", not bad, f"bad: {bad}")

# ---- V15/V16 topic wording and bullet coverage against official PDFs
s1p, s1op = pdf_pages(S1), pdf_pages(S1O)
S1T, S1OT = norm(" ".join(s1p[16:19])), norm(" ".join(s1op[16:19]))
bad = []
for n in nodes:
    if n["level"] == "chapter" and n.get("classification_use") != "CONTROL":
        hay = S1OT if n["source_document"] == "S1-ORIG" else S1T
        if norm(n["name"]) not in hay:
            bad.append(n["taxonomy_id"])
    if n["level"] == "topic":
        nm = n["name"].replace("CSR ", "") if n.get("relocated_from") else n["source_text"]
        hay = S1OT if n["source_document"] == "S1-ORIG" else S1T
        if norm(nm) not in hay:
            bad.append(n["taxonomy_id"])
check("V15 every chapter/topic name found verbatim in S1 or S1-ORIG", not bad, f"not found: {bad}")
body = "\n".join(s1op[16:19])
parts = re.split(r"\n\s*\*?(\d{1,2})\s{2,}(?=[A-Z])", body)
cnt = {int(parts[i]): len(re.findall(r"(?:^|\s)l\s+[A-Z]", parts[i + 1])) for i in range(1, len(parts) - 1, 2)}
tc = Counter(int(n["parent_id"].split(".L")[1]) for n in nodes if n["level"] == "topic" and not n.get("relocated_from"))
mism = {k: (cnt.get(k), tc.get(k)) for k in range(1, 20) if cnt.get(k) != tc.get(k)}
check("V16 S1-ORIG bullet count per lesson == taxonomy topics (19 lessons)", not mism and len(cnt) == 19, f"mismatches: {mism}")

# ---- V17 M2 subtopic headings on cited pages
m2p = pdf_pages(M2)
bad = []
for n in nodes:
    if n["level"] == "subtopic" and n["basis"] == "study_material_heading":
        words = [w for w in norm(n["source_text"]).split() if len(w) > 2][:6]
        pdf = n["topic_source_reference"]["pdf_page"]
        if not any(all(w in norm(m2p[p - 1]) for w in words) for p in (pdf, pdf + 1) if 1 <= p <= len(m2p)):
            bad.append(n["taxonomy_id"])
check("V17 every M2-anchored subtopic heading appears on its cited page (or the next)", not bad, f"bad: {bad}")

# ---- V18 v0.1 IDs preserved
prev = ROOT / "taxonomy" / "clp_taxonomy_v0.1.json"
if VER != "0.1" and prev.exists():
    old = json.loads(prev.read_text())["nodes"]
    missing = [o["taxonomy_id"] for o in old if o["taxonomy_id"] not in by]
    renamed = [(o["taxonomy_id"], o["name"], by[o["taxonomy_id"]]["name"]) for o in old
               if o["taxonomy_id"] in by and o["name"] != by[o["taxonomy_id"]]["name"]]
    added = [i for i in ids if i not in {o["taxonomy_id"] for o in old}]
    check("V18 no v0.1 taxonomy_id removed in this version", not missing, f"missing: {missing}; added: {added}; renamed: {renamed}")

# ---- synthetic tests
suite = json.loads((ROOT / "taxonomy" / "tests" / f"clp_synthetic_tests_v{VER}.json").read_text())
a2v = suite["meta"]["attempt_to_syllabus_version"]
test_rows = []
for t in suite["tests"]:
    n = by.get(t["expected_primary"])
    problems = []
    if not n:
        problems.append("primary node missing")
        derived, hist_lesson, hist_node, reasons = None, None, None, []
    else:
        use = n.get("classification_use")
        if use not in ("CLASSIFIABLE", "CONTROL") or n.get("node_lifecycle") != "ACTIVE":
            problems.append(f"illegal target ({use}, {n.get('node_lifecycle')})")
        for s in t.get("expected_secondary", []):
            if by.get(s, {}).get("classification_use") != "CLASSIFIABLE":
                problems.append(f"illegal secondary {s}")
        ver = a2v[t["attempt"]]
        reasons = []
        if use == "CONTROL":
            reasons.append("OUT_OF_TAXONOMY_REVIEW (holding node; excluded from analytics)")
        if n["status"] == D and ver == CUR:
            reasons.append("SYLLABUS_TRANSITION (deleted content asked in a post-Dec 2025 attempt)")
        if n["status"] == D and ver == ORIG:
            pass
        if n["status"] in (C,) and ver not in n["syllabus_version"]:
            reasons.append(f"node not in syllabus version {ver}")
        pr = n.get("placement_review") or (by.get(n["parent_id"], {}).get("placement_review") if n["level"] == "subtopic" else None)
        if pr and pr.get("confidence") == "MEDIUM" and use != "CONTROL":
            reasons.append("placement confidence MEDIUM -> mandatory human review (methodology 10.4)")
        derived = "REVIEW" if reasons else ("CLEAN_WITH_RULE" if t.get("rule") else "CLEAN")
        hist_lesson = (n.get("lesson_by_syllabus_version") or {}).get(ver) if use != "CONTROL" else None
        hist_node = None
        for h in n.get("historical_locations", []) or []:
            if h["syllabus_version"] == ver:
                hist_node = h["historical_node_at_exam_time"]
        if "expected_historical_lesson" in t and t["expected_historical_lesson"] != hist_lesson:
            problems.append(f"historical lesson {hist_lesson} != expected {t['expected_historical_lesson']}")
        if "expected_historical_node" in t and t["expected_historical_node"] != hist_node:
            problems.append(f"historical node {hist_node} != expected {t['expected_historical_node']}")
        if derived != t["expected_outcome"]:
            problems.append(f"derived outcome {derived} != expected {t['expected_outcome']}")
    test_rows.append({"id": t["id"], "attempt": t["attempt"], "primary": t["expected_primary"], "expected": t["expected_outcome"],
                      "derived": derived, "historical_lesson_at_exam_time": hist_lesson, "historical_node_at_exam_time": hist_node,
                      "rule": t.get("rule"), "review_reasons": reasons, "pass": not problems, "problems": problems, "prompt": t["prompt"]})

neg_rows = []
for x in suite["negative_controls"]:
    n = by.get(x["attempted_node"], {})
    why = {"ALIAS_ONLY": n.get("classification_use") == "ALIAS_ONLY",
           "DEPRECATED": n.get("node_lifecycle") == "DEPRECATED",
           "STRUCTURAL": n.get("classification_use") == "STRUCTURAL",
           "NOT_ANALYTICS_ELIGIBLE": not n.get("historical_analytics_eligible") and not n.get("current_priority_eligible")}[x["must_fail_because"]]
    neg_rows.append({"id": x["id"], "node": x["attempted_node"], "rejected_because": x["must_fail_because"], "pass": bool(why)})

all_checks = all(ok for _, ok, _ in results)
all_tests = all(r["pass"] for r in test_rows) and all(r["pass"] for r in neg_rows)
summary = {
    "taxonomy_version": VER, "checks_passed": sum(ok for _, ok, _ in results), "checks_total": len(results),
    "tests_passed": sum(r["pass"] for r in test_rows), "tests_total": len(test_rows),
    "negative_controls_passed": sum(r["pass"] for r in neg_rows), "negative_controls_total": len(neg_rows),
    "outcomes": dict(Counter(r["derived"] for r in test_rows)),
    "node_counts": dict(Counter(n["level"] for n in nodes)),
    "status_counts": dict(Counter(n["status"] for n in nodes)),
    "classification_use_counts": dict(Counter(n["classification_use"] for n in nodes)),
    "ALL_PASS": all_checks and all_tests,
}
out = ROOT / "04_Verification"
(out / f"clp_taxonomy_v{VER}_validation.json").write_text(json.dumps(
    {"summary": summary, "checks": [{"id": c, "pass": ok, "detail": d} for c, ok, d in results],
     "tests": test_rows, "negative_controls": neg_rows}, ensure_ascii=False, indent=2) + "\n")

L = [f"# CLP taxonomy v{VER} — validation output", "", "Generated by `scripts/validate_clp_taxonomy.py`. Do not edit by hand.", "",
     f"**ALL_PASS = {summary['ALL_PASS']}** · checks {summary['checks_passed']}/{summary['checks_total']} · "
     f"synthetic tests {summary['tests_passed']}/{summary['tests_total']} · negative controls {summary['negative_controls_passed']}/{summary['negative_controls_total']}", "",
     f"Node counts: {summary['node_counts']} · statuses: {summary['status_counts']} · classification_use: {summary['classification_use_counts']}", "",
     "## Checks", "", "| Check | Result | Detail |", "|---|---|---|"]
for c, ok, d in results:
    L.append(f"| {c} | {'PASS' if ok else '**FAIL**'} | {d.replace('|', '/')[:300]} |")
L += ["", "## Synthetic tests", "", f"Derived outcomes: {summary['outcomes']}", "",
      "| ID | Attempt | Primary | Expected | Derived | Historical lesson at exam time | Historical node | Review reasons / rule | Result |",
      "|---|---|---|---|---|---|---|---|---|"]
for r in test_rows:
    why = "; ".join(r["review_reasons"]) or (r["rule"] or "")
    L.append(f"| {r['id']} | {r['attempt']} | `{r['primary']}` | {r['expected']} | {r['derived']} | {r['historical_lesson_at_exam_time'] or '—'} | "
             f"{r['historical_node_at_exam_time'] or '—'} | {why} | {'PASS' if r['pass'] else '**FAIL**: ' + '; '.join(r['problems'])} |")
L += ["", "## Negative controls", "", "| ID | Node | Must be rejected because | Result |", "|---|---|---|---|"]
for r in neg_rows:
    L.append(f"| {r['id']} | `{r['node']}` | {r['rejected_because']} | {'PASS' if r['pass'] else '**FAIL**'} |")
(out / f"clp_taxonomy_v{VER}_validation.md").write_text("\n".join(L) + "\n")
print(json.dumps(summary, indent=1))
for c, ok, d in results:
    if not ok:
        print("FAIL", c, d[:400])
for r in test_rows + neg_rows:
    if not r["pass"]:
        print("TEST FAIL", r)
sys.exit(0 if summary["ALL_PASS"] else 1)
