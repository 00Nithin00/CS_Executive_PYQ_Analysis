# CLP Taxonomy Review — Paper 522 Company Law & Practice

| | |
|---|---|
| **Current taxonomy** | **v0.2, FROZEN_FOR_PAPER_ANALYSIS** (2026-10-07): `taxonomy/clp_taxonomy_v0.2.json` / `.csv` |
| Superseded | v0.1, kept unchanged as an immutable record: `taxonomy/clp_taxonomy_v0.1.json` / `.csv` |
| Generator | `scripts/build_clp_taxonomy_v0_2.py` (v0.1: `scripts/build_clp_taxonomy_v0_1.py`) |
| Validator and tests | `scripts/validate_clp_taxonomy.py` · `taxonomy/tests/clp_synthetic_tests_v0.2.json` · output `04_Verification/clp_taxonomy_v0.2_validation.{md,json}` |
| Methodology | v0.3 (independent of the taxonomy version, methodology §6.5) |
| **Status** | **`TAXONOMY_STATUS = READY_FOR_PAPER_ANALYSIS`** (§12) |

No question papers were downloaded, read or classified. All test questions in §11 are invented.

---

## 0. Sources used

| ID | Document | Local file (under `01_Source_Papers/official_reference/`) | Used for |
|---|---|---|---|
| S1 | ICSI Syllabus 2022, **modified** (PDF ModDate 2025-12-27), CLP on PDF pp.17–19 | `S1/icsi-new-syllabus-2022-9a82f048.pdf` | Current lessons, bullets and deletion footnotes |
| S1-ORIG | ICSI Syllabus 2022, **pre-modification** (PDF created 2025-04-16), CLP on PDF pp.17–19. ICSI's own file, from the Internet Archive (the original URL now returns 404) | `S1_original_wayback/icsi-new-syllabus-2022_wayback-20260327.pdf` | Topic text of deleted lessons L12 and L17 |
| S2 | Announcement: modifications effective Dec 2025 | `S2/announcement-01092025-9cbac745.pdf` | Confirms CLP is affected |
| M0 | Study material applicable for Dec 2026 (28.07.2026) | `M0/…188aa857.pdf` | M2 is current ("updated till 30 Nov 2025") |
| M2 | CLP study material, 880 pp. (created 2025-12-12; law up to Nov 2025) | `M2/company-law-practices-3e591a57.pdf` | Lesson list, headings, subtopic pages, decision evidence |
| SUPP | CLP supplement for Dec 2026 (1 Dec 2025 – 31 May 2026) | `SUPP_CLP_DEC2026/…e7da07f8.pdf` | Check for new concepts (none needing a node) |

SHA-256 hashes are in `01_Source_Papers/manifest.csv`. No new source was needed for the v0.2 decisions; all evidence comes from M2, S1 and S1-ORIG. `SOURCE_REGISTRY.md` was therefore not changed.

**Page convention:** S1 and S1-ORIG are cited by PDF page. M2 is cited by **printed** page (PDF page = printed + 36).

---

## 1. Current CLP structure

Group 1, Paper 2 (code 522). Part I Company Law – Principles & Concepts (60 marks): syllabus L1–L12. Part II Company Administration and Meetings (40 marks): L13–L19. From Dec 2025, **17 lessons are examinable** (L12 and L17 deleted; L10 partially deleted).

**v0.2 counts:** 292 nodes = 1 subject · 19 chapters + 1 control node · 153 topics · 118 subtopics.

| Breakdown | Counts |
|---|---|
| By status | CURRENT 266 · DELETED_FROM_DEC2025 24 · PARTIALLY_DELETED 1 · OUT_OF_TAXONOMY_REVIEW 1 |
| By classification use | CLASSIFIABLE 267 · STRUCTURAL 20 · ALIAS_ONLY 4 (3 old CSR locations + 1 deprecated node) · CONTROL 1 |

---

## 2. Verified lesson list (canonical = syllabus numbering)

| Canonical ID | Name (S1) | Status from Dec 2025 | M2 lesson | M2 start page |
|---|---|---|---|---|
| CLP.L01 | Introduction to Company Law | CURRENT | 1 | 1 |
| CLP.L02 | Legal Status and Types of Registered Companies | CURRENT | 2 | 39 |
| CLP.L03 | Memorandum and Articles of Association and its Alteration | CURRENT | 3 | 87 |
| CLP.L04 | Shares and Share Capital-Concepts | CURRENT | 4 | 139 |
| CLP.L05 | Members and Shareholders | CURRENT | 5 | 229 |
| CLP.L06 | Debt Instruments-Concepts | CURRENT | 6 | 271 |
| CLP.L07 | Charges | CURRENT | 7 | 315 |
| CLP.L08 | Distribution of Profits | CURRENT | 8 | 359 |
| CLP.L09 | Accounts and Auditors | CURRENT | 9 | 419 |
| CLP.L10 | Compromise, Arrangement and Amalgamations-Concepts | PARTIALLY_DELETED | 10 | 471 |
| CLP.L11 | Dormant Company | CURRENT | 11 | 507 |
| CLP.L12 | Inspection, Inquiry and Investigation | DELETED_FROM_DEC2025 | — | — |
| CLP.L13 | General Meetings | CURRENT | **12** | 519 |
| CLP.L14 | Directors | CURRENT | **13** | 593 |
| CLP.L15 | Board Composition and Powers of the Board | CURRENT | **14** | 641 |
| CLP.L16 | Meetings of Board and its Committees | CURRENT | **15** | 693 |
| CLP.L17 | Corporate Social Responsibility-Concepts | DELETED_FROM_DEC2025 | — | — |
| CLP.L18 | Annual Report-Concepts | CURRENT | **16** | 737 |
| CLP.L19 | Key Managerial Personnel (KMP's) and their Remuneration | CURRENT | **17** | 793 |

**Numbering:** M2 and the supplements renumber lessons 1–17 after the deletions. Canonical IDs keep the syllabus numbers 1–19, for four reasons:
- the syllabus is the structural authority;
- its numbering spans both syllabus versions;
- historical questions were set under 1–19;
- IDs must never change.

M2's numbers are stored in `study_material_lesson`. Validator checks V15 and V16 confirm all lesson and topic names are word-for-word S1 / S1-ORIG text, with complete bullet coverage (19/19 lessons).

---

## 3. Phase 1A close-out decisions (v0.2)

### 3.1 Special company forms (owner instruction §1)

**Premise check:** the brief said M2 contains Section 8, Statutory, Unlimited, Nidhi and Producer company material under the legal-status/types material. Searching the full text of M2 shows this is **true for Section 8, Statutory and Unlimited companies only** (L2 "Classification of Companies", pp.55–56). **Producer companies** appear only in L8 (dividend, p.363) and M2 L14 (= syllabus L15, minimum directors, p.643). **Nidhi companies** appear in the L1 definitions list (p.24) and scattered functional rules. Neither has any L2 material.

| ID | Concept | M2 evidence (printed page) | Existing official topic considered | Decision | Node | Confidence |
|---|---|---|---|---|---|---|
| CF-1 | **Section 8 Company** | L2 p.56: "(iii) Other Forms of Companies (a) Section 8 Company/Non Profit Oriented Company …" under "Classification of Companies" (p.55). Functional mentions: AGM p.523, proxy p.550, minutes p.571, dividend p.362 | L02 Private / Public Company (rejected: a s.8 company may be either, so neither bullet is the concept); L01.T07 Definitions (rejected: M2's definitions list mentions s.8 only inside the small-company exclusion, p.24) | **No valid topic → holding node** (concept-level questions). Entity-as-context questions go to the functional node (e.g. s.8 proxy restriction → `CLP.L13.T05.S05`) | `CLP.UNMAPPED` (OUT_OF_TAXONOMY_REVIEW) | HIGH (that no bullet fits) |
| CF-2 | **Statutory Company** | L2 p.55: "(b) Statutory Companies: These are constituted by a Special Act … The provisions of the Companies Act, 2013 do not apply to them." L1 p.21, heading "APPLICABILITY OF THE COMPANIES ACT, 2013 AND KEY CONCEPTS", s.1(4)(e) "any other company governed by any special Act" and (f) "body corporate, incorporated by any Act" | **L01.T06 "Applicability of the Companies Act"** (accepted: whether, and how far, the Act applies to special-Act bodies is exactly the applicability question) | **Maps to existing topic**, topic-level. No new node; decision recorded in the node notes | `CLP.L01.T06` | MEDIUM-HIGH |
| CF-3 | **Unlimited Company** | L2 p.51 (within "Exceptions to the principle of limited liability"): "When the company is incorporated as an Unlimited Company under Section 3(2)(c)". L2 p.56: "(c) Unlimited Companies … Section 2(92)" | **L02.T01 Corporate Personality → S01 Limited liability and its exceptions** (accepted: M2 itself lists unlimited incorporation as an exception to limited liability); L03.T03.S04 liability-clause alteration (only for alteration questions) | **Maps to existing subtopic** `CLP.L02.T01.S01`, renamed "… (incl. unlimited companies)". Alteration of the liability clause stays at `CLP.L03.T03.S04` | `CLP.L02.T01.S01` | MEDIUM (inherits JC-2; each question reviewed) |
| CF-4 | **Producer Company** | **No L1/L2 material.** Only p.363 (L8: dividend called "Limited Return") and p.643 (M2 L14: "Minimum number of Directors in case of Producer Companies", s.378(o)) | L02 Private Company (rejected: M2 provides no producer-company material in L2; mapping would be invented) | **No valid topic → holding node** for concept-level questions. Functional questions → functional node (dividend → `CLP.L08.T02`; directors → `CLP.L15.T01`) | `CLP.UNMAPPED` | HIGH (that no bullet fits) |
| CF-5 | **Nidhi Company** | L1 p.24, in the key-definitions list: "Nidhi company: means a company which has been incorporated as a Nidhi …". Functional mentions: p.171, 195, 295, 363, 391, 402, 431, 543, 559 | **L01.T07 "Definitions and Key Concepts"** (accepted: M2 lists it there; no L02 bullet exists, consistent with DD-13) | **Maps to existing topic**, topic-level. Functional Nidhi rules → that functional node | `CLP.L01.T07` | MEDIUM-HIGH |

No new Topic node was created. No concept was forced: Section 8 and Producer stay in the holding node. The holding node is now status `OUT_OF_TAXONOMY_REVIEW` and is **excluded from frequency, marks-weight, priority and ranking analytics** (validator checks V07, V08; negative control X-04).

### 3.2 Oppression and Mismanagement (owner instruction §2)

| Node | status | syllabus_version | historical_analytics_eligible | current_priority_eligible | classification_use |
|---|---|---|---|---|---|
| `CLP.L10.T02` Oppression and Mismanagement | DELETED_FROM_DEC2025 | ["2022-original"] | **true** | **false** | CLASSIFIABLE |
| `CLP.L10.T02.S01` Majority rule and minority rights | DELETED_FROM_DEC2025 | ["2022-original"] | true | false | CLASSIFIABLE |
| `CLP.L10.T03` Class Actions Suits | DELETED_FROM_DEC2025 | ["2022-original"] | true | false | CLASSIFIABLE |

The topics stay available for Dec 2023 – Jun 2025 questions, are excluded from current priority, and are not current examinable content. A Dec 2025+ question on them derives REVIEW (`SYLLABUS_TRANSITION`); see test N-09. The fact that M2 still contains pp.498–501 is recorded in the node note. Validator checks V09 and V10.

### 3.3 Judgement-call placements (owner instruction §3)

| # | Concept | Current taxonomy node | Exact syllabus wording | Study-material heading | Page | Reason for placement | Alternative considered | Why rejected | Confidence |
|---|---|---|---|---|---|---|---|---|---|
| JC-1 | **Alter ego** | `CLP.L01.T05.S02` (under "Concept of Corporate Veil") | L1: "Concept of Corporate Veil" | "DOCTRINE OF ALTER EGO" | 16 | M2: alter ego "provides for an exception to this presumption [separate legal entity]" and "is based on lifting of the corporate veil"; it sits directly before "Doctrine of Lifting of or Piercing the Corporate Veil" (p.17) | L01.T04 Constructive Notice (precedes it in M2); L02.T01 Corporate Personality | Constructive notice is a different doctrine that happens to precede it on the page. Alter ego is an exception to separate personality, applied through veil lifting, which is the L1 bullet | **HIGH: KEEP** |
| JC-2 | **Limited liability** | `CLP.L02.T01.S01` (under "Corporate Personality") | L2 "Legal Status of Registered Companies: Corporate Personality · Perpetual succession · Separate property · Transferability of shares · Capacity to sue or be sued" (limited liability is not named) | "LIMITED LIABILITY" / "Exceptions to the principle of limited liability" | 51 | M2 places it under "Legal Status of Registered Companies" and derives it from personality: "The company, being a separate person, is the owner of its assets and bound by its liabilities … This means that the liability of a member is limited" | L02.T03 Separate property; holding node | Separate property concerns ownership of assets, not members' liability. The holding node would wrongly exclude a core legal-status concept that M2 places in this group | **MEDIUM: KEEP.** Supported by M2's explicit reasoning, but the syllabus does not name it, so each question on it gets human review (methodology §10.4) |
| JC-3 | **Shares with differential voting rights** | `CLP.L04.T01.S01` (under "Meaning and Types of Capital") | L4: "Meaning and Types of Capital" | "Types of Share Capital" (s.43: equity share capital "(ii) with differential rights as to dividend, voting or otherwise"); detail at "II. EQUITY SHARES WITH DIFFERENTIAL VOTING RIGHTS" (p.163) | 142 (and 163) | s.43 makes DVR a statutory type of share capital, and M2's "Types of Share Capital" heading says so. v0.2 re-anchors the evidence to p.142 | L04.T02 Issue and Allotment (M2 puts the Rule 4 detail in Part C) | Splitting the definition (T01) from the issue conditions (T02) would scatter one concept across two topics. The syllabus bullet naming "Types of Capital" is the explicit home | **HIGH: KEEP** |
| JC-4 | **Meeting of independent directors** | **Moved:** `CLP.L16.T01.S01` (v0.1) → **`CLP.L14.T02.S04`** (v0.2). Old node DEPRECATED alias | L14: "Types of Directors" (IDs are a type of director). The L16 bullet "Frequency, Convening and Proceedings of Board and Committee meetings" was considered | "Separate Meeting of Independent Director" (in M2 Lesson 13 = syllabus L14, within the IDs material); also tested in L13 "Test Yourself" (p.639) | 610, 612 (L14); 719–720 (L16) | M2 p.720: "**A Meeting of Independent Directors is not a Meeting of the Board or of a Committee of the Board.** Therefore, provisions of SS-1 shall not be applicable". That directly contradicts the v0.1 placement. M2's Directors lesson treats it as part of the IDs' Schedule IV code | Keep under L16.T01; L16.T06 (CS duties: "CS shall facilitate convening") | L16.T01 is about Board/committee meetings, which M2 says this is not. CS facilitation is incidental | **HIGH: MOVED** |
| JC-5 | **Business responsibility reporting** | `CLP.L18.T03.S01` (under "Annual Report"), renamed "Business responsibility reporting (Reg. 34(2)(f) LODR)" | L18: "Annual Report" | "Business Responsibility Reports by Listed Companies" | 782 | M2: the top 1000 listed entities "are required to include Business Responsibility Report, **as part of their annual report**" (Reg. 34(2)(f)) | L18 CSR nodes (M2 places BRR after CSR activities) | BRR is an annual-report disclosure by statute and M2 says so. **Social Stock Exchange (p.783) was split out**: M2 presents it as a SEBI ICDR Chapter X-A segment, not an annual-report item, and no CLP bullet fits → holding node | **HIGH: KEEP (SSE removed)** |
| JC-6 | **ACTIVE company-status form** | **v0.1 provisional `CLP.L18.T02` withdrawn → `CLP.UNMAPPED`** | No bullet names it. Considered: L18 "Annual Return"; L11 "Procedure to obtain the status of an Active Company from Dormant Company"; L03 registered office; L01 "MCA 21" | "Active Company Tagging Identities and Verification (ACTIVE)" | 776 | e-Form ACTIVE (Rule 25A, Companies (Incorporation) Rules) is a one-time 2019 filing of company and registered-office particulars. It is not an annual return (M2 places it after annual return only as a neighbouring topic) | L18.T02 Annual Return; L11.T06 (active status); L01.T08 MCA 21 | Not an annual return. "Active" in L11 means the opposite of dormant, a different concept. MCA 21 covers the e-filing system generally, not this specific compliance. Forcing it into any of these would be silent forcing | **HIGH (that no bullet fits): ROUTED TO HOLDING NODE** |

Each reviewed node carries a `placement_review` attribute in the JSON. **No placement is left in REQUIRES_REVIEW status.** JC-2's MEDIUM confidence is a per-question review trigger under the methodology, not an open taxonomy decision.

### 3.4 CSR: canonical one-node rule (owner instruction §4)

Approved and formalised as the **moved-topic rule** in methodology §6.1 (v0.3).

| Concept | Canonical node (classify here, every attempt) | `syllabus_version` | `lesson_by_syllabus_version` | Historical location (2022-original) | Alias node (never classified to) |
|---|---|---|---|---|---|
| CSR Committee | `CLP.L18.T05` (+ `S01` functions and meetings) | original + mod | {original: CLP.L17, mod: CLP.L18} | `CLP.L17.T01` | `CLP.L17.T01` → classify_to L18.T05 |
| CSR Policy | `CLP.L18.T06` | original + mod | {original: CLP.L17, mod: CLP.L18} | `CLP.L17.T02` | `CLP.L17.T02` → classify_to L18.T06 |
| CSR Activities | `CLP.L18.T07` (+ `S01` implementation and eligible activities) | original + mod | {original: CLP.L17, mod: CLP.L18} | `CLP.L17.T04` | `CLP.L17.T04` → classify_to L18.T07 |
| CSR Expenditure / Ongoing Project / Impact Assessment | `CLP.L17.T03` / `T05` / `T06` (deleted, not moved) | original only | {original: CLP.L17} | — | — |

There are no duplicate CSR nodes: validator check V12 confirms exactly three classifiable CSR topic nodes, and negative control X-01 rejects classification to an alias.

### 3.5 Canonical vs historical location (owner instruction §5)

Implemented on **every** node and in the question-record schema (methodology §5.3):

- **A. `canonical_taxonomy_location`** (node attribute and record field): where the concept lives now. All analytics aggregate here.
- **B. `historical_lesson_at_exam_time`** (record field): derived from the node's `lesson_by_syllabus_version[attempt's syllabus version]`. It is set on every record and equals the canonical lesson unless the topic moved.
- **`historical_node_at_exam_time`** (record field): set from the node's `historical_locations` when the concept sat in a now-alias node.

The historical value is never overwritten. Worked examples from the tests:
- H-10 (Jun 2024, CSR committee): canonical `CLP.L18.T05`, historical lesson `CLP.L17`, historical node `CLP.L17.T01`.
- N-11 (Dec 2025, CSR policy): canonical and historical lesson both `CLP.L18`.
- For deleted content asked in a post-Dec 2025 attempt (N-09, N-12), no syllabus lesson existed at exam time. The record will carry `historical_lesson_at_exam_time = null` plus the `SYLLABUS_TRANSITION` flag.

### 3.6 Versioning (owner instruction §6)

- **Taxonomy v0.1 → v0.2**, because nodes and attributes changed. v0.1 files are untouched (SHA-256 of `clp_taxonomy_v0.1.json` = `d6ecc8ce…9581`).
- **Methodology 0.2 → 0.3** separately. The two version numbers are independent (methodology §6.5).

Exact v0.2 changes (also in the JSON `meta.changelog`):

| # | Change | Node(s) |
|---|---|---|
| 1 | Holding node status → `OUT_OF_TAXONOMY_REVIEW`; excluded from all analytics; routed concepts listed in its notes | `CLP.UNMAPPED` |
| 2 | **New** subtopic "Separate meeting of independent directors (Schedule IV, clause VII)", M2 p.610 | `CLP.L14.T02.S04` |
| 3 | Deprecated (alias → L14.T02.S04); ID retained, never reused | `CLP.L16.T01.S01` |
| 4 | Renamed "Business responsibility reporting (Reg. 34(2)(f) LODR)"; Social Stock Exchange removed (→ UNMAPPED) | `CLP.L18.T03.S01` |
| 5 | Note: ACTIVE no longer provisionally placed here (→ UNMAPPED) | `CLP.L18.T02` |
| 6 | Renamed "Limited liability and its exceptions (incl. unlimited companies)"; evidence notes | `CLP.L02.T01.S01` |
| 7 | Evidence re-anchored to M2 p.142 "Types of Share Capital" | `CLP.L04.T01.S01` |
| 8 | Notes recording topic-level decisions: statutory companies; Nidhi | `CLP.L01.T06`, `CLP.L01.T07` |
| 9 | Note recording the owner decision on oppression and mismanagement | `CLP.L10.T02.S01` |
| 10 | Relocated CSR nodes now carry both syllabus versions, `lesson_by_syllabus_version` and `historical_locations` | `CLP.L18.T05–T07` and subtopics |
| 11 | New attributes on all nodes: `node_lifecycle`, `classification_use`, `historical_analytics_eligible`, `current_priority_eligible`, `canonical_taxonomy_location`, `lesson_by_syllabus_version`; `placement_review` on the reviewed nodes | all |

**No v0.1 ID was removed** (validator check V18). One ID was added (`CLP.L14.T02.S04`).

---

## 4. Topic hierarchy (v0.2, generated from the JSON)

#### CLP.L01: Introduction to Company Law
Part I · M2 lesson: 1 (from p.1) · source S1 p.17

- `CLP.L01.T01` Jurisprudence of Company Law
- `CLP.L01.T02` Doctrine of Ultra-vires
  - `CLP.L01.T02.S01` Effects of and exceptions to the doctrine of ultra vires — M2 p.10
- `CLP.L01.T03` Doctrine of Indoor Management
  - `CLP.L01.T03.S01` Exceptions to the doctrine of indoor management — M2 p.13
- `CLP.L01.T04` Doctrine of Constructive Notice
- `CLP.L01.T05` Concept of Corporate Veil
  - `CLP.L01.T05.S01` Lifting / piercing of the corporate veil — M2 p.17
  - `CLP.L01.T05.S02` Doctrine of alter ego — M2 p.16
- `CLP.L01.T06` Applicability of the Companies Act
- `CLP.L01.T07` Definitions and Key Concepts
- `CLP.L01.T08` MCA 21
  - `CLP.L01.T08.S01` Agencies under MCA / ROC office organisation — M2 p.27
  - `CLP.L01.T08.S02` E-filing on MCA-21 (e-forms, pre-certification, payment) — M2 p.35

#### CLP.L02: Legal Status and Types of Registered Companies
Part I · M2 lesson: 2 (from p.39) · source S1 p.17

- `CLP.L02.T01` Corporate Personality
  - `CLP.L02.T01.S01` Limited liability and its exceptions (incl. unlimited companies) — M2 p.51
- `CLP.L02.T02` Perpetual succession
- `CLP.L02.T03` Separate property
- `CLP.L02.T04` Transferability of shares
- `CLP.L02.T05` Capacity to sue or be sued
- `CLP.L02.T06` Private Company
  - `CLP.L02.T06.S01` Privileges and exemptions of a private company — M2 p.60
  - `CLP.L02.T06.S02` One Person Company (OPC) — M2 p.54 (statutory basis)
- `CLP.L02.T07` Public Company
  - `CLP.L02.T07.S01` Distinction between private and public company — M2 p.64
- `CLP.L02.T08` Small Company
- `CLP.L02.T09` Holding Company
- `CLP.L02.T10` Subsidiary Company
- `CLP.L02.T11` Associate Company
- `CLP.L02.T12` Dormant Company
- `CLP.L02.T13` Government Company

#### CLP.L03: Memorandum and Articles of Association and its Alteration
Part I · M2 lesson: 3 (from p.87) · source S1 p.17

- `CLP.L03.T01` Memorandum of Association and Articles of Association
  - `CLP.L03.T01.S01` Contents of Memorandum — M2 p.90
  - `CLP.L03.T01.S02` Entrenchment provisions — M2 p.121
  - `CLP.L03.T01.S03` Distinction between MoA and AoA; legal effect — M2 p.123
- `CLP.L03.T02` Incorporation Contracts
  - `CLP.L03.T02.S01` Pre-incorporation contracts — M2 p.133
- `CLP.L03.T03` Alteration in MOA & AOA
  - `CLP.L03.T03.S01` Alteration of name clause — M2 p.98
  - `CLP.L03.T03.S02` Alteration of registered office clause / shifting of registered office — M2 p.103
  - `CLP.L03.T03.S03` Alteration of object clause — M2 p.110
  - `CLP.L03.T03.S04` Alteration of liability clause — M2 p.115
  - `CLP.L03.T03.S05` Alteration of capital clause (incl. s.61 alteration of share capital) — M2 p.115
  - `CLP.L03.T03.S06` Alteration of Articles of Association — M2 p.125

#### CLP.L04: Shares and Share Capital-Concepts
Part I · M2 lesson: 4 (from p.139) · source S1 p.17

- `CLP.L04.T01` Meaning and Types of Capital
  - `CLP.L04.T01.S01` Equity shares with differential voting rights — M2 p.142
- `CLP.L04.T02` Issue and Allotment
  - `CLP.L04.T02.S01` Prospectus (basic terms) — M2 p.146
  - `CLP.L04.T02.S02` Securities premium and its utilisation — M2 p.156
  - `CLP.L04.T02.S03` Allotment of securities — M2 p.157
- `CLP.L04.T03` Issue of Share Certificates
- `CLP.L04.T04` Further Issue of Share Capital
- `CLP.L04.T05` Issue of shares on Private and Preferential basis
  - `CLP.L04.T05.S01` Private placement — M2 p.160
  - `CLP.L04.T05.S02` Preferential allotment — M2 p.176
- `CLP.L04.T06` Rights issue and Bonus Shares
  - `CLP.L04.T06.S01` Rights issue — M2 p.171
  - `CLP.L04.T06.S02` Bonus shares — M2 p.181
- `CLP.L04.T07` Sweat Equity Shares and ESOPs
  - `CLP.L04.T07.S01` Employee stock option scheme — M2 p.173
  - `CLP.L04.T07.S02` Sweat equity shares — M2 p.182
- `CLP.L04.T08` Issue and Redemption of Preference Shares
- `CLP.L04.T09` Transfer and Transmission of Securities
  - `CLP.L04.T09.S01` Transfer of securities (procedure, lost/forged transfers, transfer to minor) — M2 p.202
  - `CLP.L04.T09.S02` Transmission of securities — M2 p.211
  - `CLP.L04.T09.S03` Depository system; dematerialisation and rematerialisation — M2 p.218
- `CLP.L04.T10` Buyback of Securities
- `CLP.L04.T11` Reduction of Share Capital
  - `CLP.L04.T11.S01` Reduction without sanction of the Tribunal — M2 p.200
- `CLP.L04.T12` Payment of Stamp Duty
- `CLP.L04.T13` Registers and Records

#### CLP.L05: Members and Shareholders
Part I · M2 lesson: 5 (from p.229) · source S1 p.17

- `CLP.L05.T01` How to become a Member
  - `CLP.L05.T01.S01` Cessation of membership — M2 p.236
- `CLP.L05.T02` Register of Members
  - `CLP.L05.T02.S01` Foreign register; closing of register — M2 p.242
- `CLP.L05.T03` Declaration of Beneficial Interest
- `CLP.L05.T04` Significant Beneficial Owner
- `CLP.L05.T05` Rectification of Register of Members
- `CLP.L05.T06` Rights of Members
  - `CLP.L05.T06.S01` Voting rights and rights of dissenting shareholders — M2 p.258
  - `CLP.L05.T06.S02` Shareholders' agreement and veto rights — M2 p.263
- `CLP.L05.T07` Variation of Shareholders' Rights

#### CLP.L06: Debt Instruments-Concepts
Part I · M2 lesson: 6 (from p.271) · source S1 p.17

- `CLP.L06.T01` Issue and Redemption of Debentures and Bonds
  - `CLP.L06.T01.S01` Kinds of debentures; bonds vs debentures — M2 p.280
- `CLP.L06.T02` Creation of Security
- `CLP.L06.T03` Debenture Redemption Reserve
- `CLP.L06.T04` Debenture Trust Deed
  - `CLP.L06.T04.S01` Debenture trustees — M2 p.288
- `CLP.L06.T05` Conversion of Debentures into Shares
- `CLP.L06.T06` Overview of Company Deposits
  - `CLP.L06.T06.S01` Acceptance of deposits from members (terms, limits, time period) — M2 p.296
  - `CLP.L06.T06.S02` Eligible company and deposits from the public — M2 p.295
  - `CLP.L06.T06.S03` Repayment of deposits; deposit repayment reserve; liquid assets — M2 p.301

#### CLP.L07: Charges
Part I · M2 lesson: 7 (from p.315) · source S1 p.18

- `CLP.L07.T01` Creation of Charges
  - `CLP.L07.T01.S01` Types of charges: fixed vs floating; crystallisation — M2 p.318
  - `CLP.L07.T01.S02` Charge vs mortgage vs pledge — M2 p.321
- `CLP.L07.T02` Registration, Modification and Satisfaction of Charges
  - `CLP.L07.T02.S01` Registrable charges and consequences of non-registration — M2 p.327
  - `CLP.L07.T02.S02` Satisfaction of charges — M2 p.339
  - `CLP.L07.T02.S03` Intimation of appointment of receiver or manager — M2 p.343
- `CLP.L07.T03` Register of Charges
- `CLP.L07.T04` Inspection of Charges
- `CLP.L07.T05` Punishment for Contravention
- `CLP.L07.T06` Rectification by Central Government in Register of Charges
- `CLP.L07.T07` Purpose, Objective, Drafting and Issuing of Search Report

#### CLP.L08: Distribution of Profits
Part I · M2 lesson: 8 (from p.359) · source S1 p.18

- `CLP.L08.T01` Profit and Ascertainment of Divisible Profits
- `CLP.L08.T02` Declaration and Payment of Dividend
  - `CLP.L08.T02.S01` Types of dividend; power to declare (interim/final) — M2 p.363
  - `CLP.L08.T02.S02` Source of dividend and transfer to reserves — M2 p.366
  - `CLP.L08.T02.S03` Payment of dividend and liability for non-payment — M2 p.380
- `CLP.L08.T03` Unpaid Dividend Account
- `CLP.L08.T04` Investor Education and Protection Fund
  - `CLP.L08.T04.S01` Refund to claimant from IEPF — M2 p.393
- `CLP.L08.T05` Right to Dividend
- `CLP.L08.T06` Rights Shares and Bonus shares to be held in abeyance
- `CLP.L08.T07` Secretarial Standards on Dividend
- `CLP.L08.T08` Dividend Distribution Policy

#### CLP.L09: Accounts and Auditors
Part I · M2 lesson: 9 (from p.419) · source S1 p.18

- `CLP.L09.T01` Books of Accounts
- `CLP.L09.T02` Financial Statements
  - `CLP.L09.T02.S01` Consolidated financial statements — M2 p.427
  - `CLP.L09.T02.S02` Re-opening and voluntary revision of financial statements — M2 p.429
  - `CLP.L09.T02.S03` Signing and filing of financial statements — M2 p.430
- `CLP.L09.T03` National Financial Reporting Authority
- `CLP.L09.T04` Auditors- Appointment, Resignation and Procedure relating to Removal, Qualification and Disqualification
  - `CLP.L09.T04.S01` Appointment and rotation of auditors — M2 p.440
  - `CLP.L09.T04.S02` Casual vacancy in the office of auditor — M2 p.443
  - `CLP.L09.T04.S03` Removal and resignation of auditor — M2 p.446
  - `CLP.L09.T04.S04` Eligibility, qualifications and disqualifications of auditor — M2 p.448
- `CLP.L09.T05` Rights, Duties and Liabilities
- `CLP.L09.T06` Audit and Auditor's Report
  - `CLP.L09.T06.S01` Companies (Auditor's Report) Order, 2020 — M2 p.454
- `CLP.L09.T07` Cost Audit
- `CLP.L09.T08` Secretarial Audit
- `CLP.L09.T09` Internal Audit

#### CLP.L10: Compromise, Arrangement and Amalgamations-Concepts **[PARTIALLY_DELETED]**
Part I · M2 lesson: 10 (from p.471) · source S1 p.18

- `CLP.L10.T01` Introduction of Compromises, Arrangement and Amalgamation
  - `CLP.L10.T01.S01` Compromise or arrangement with members/creditors (s.230) — M2 p.473
  - `CLP.L10.T01.S02` Merger and amalgamation through the Tribunal (s.232) — M2 p.481
  - `CLP.L10.T01.S03` Fast-track merger of small / holding-subsidiary companies (s.233) — M2 p.486
  - `CLP.L10.T01.S04` Cross-border merger with a foreign company (s.234) — M2 p.490
  - `CLP.L10.T01.S05` Acquisition of dissenting / minority shareholding (ss.235-236) — M2 p.492
  - `CLP.L10.T01.S06` Amalgamation by Central Government in public interest (s.237) — M2 p.496
- `CLP.L10.T02` Oppression and Mismanagement **[DELETED_FROM_DEC2025]**
  - `CLP.L10.T02.S01` Majority rule and minority rights (Foss v. Harbottle; Chapter XVI) — M2 p.498 **[DELETED_FROM_DEC2025]**
- `CLP.L10.T03` Class Actions Suits **[DELETED_FROM_DEC2025]**

#### CLP.L11: Dormant Company
Part I · M2 lesson: 11 (from p.507) · source S1 p.18

- `CLP.L11.T01` Legal framework for Dormant Companies
- `CLP.L11.T02` Procedure to obtain the status of a Dormant Company
- `CLP.L11.T03` Prerequisite for obtaining the status of Dormant Company
- `CLP.L11.T04` Benefits / exemptions provided to a Dormant Company
- `CLP.L11.T05` Compliance requirements by Dormant Company
- `CLP.L11.T06` Procedure to obtain the status of an Active Company from Dormant Company

#### CLP.L12: Inspection, Inquiry and Investigation **[DELETED_FROM_DEC2025]**
Part I · M2 lesson: — · source S1-ORIG p.18

- `CLP.L12.T01` Powers for inspection **[DELETED_FROM_DEC2025]**
- `CLP.L12.T02` Purpose of conducting Inspection **[DELETED_FROM_DEC2025]**
- `CLP.L12.T03` Kinds of Investigation **[DELETED_FROM_DEC2025]**
- `CLP.L12.T04` Power of Inspector to Conduct Investigation into Affairs of Related Companies **[DELETED_FROM_DEC2025]**
- `CLP.L12.T05` Protection of employees during Investigation **[DELETED_FROM_DEC2025]**
- `CLP.L12.T06` Seizure of Documents by Inspector **[DELETED_FROM_DEC2025]**
- `CLP.L12.T07` Freezing of Assets of Company on Inquiry And Investigation **[DELETED_FROM_DEC2025]**
- `CLP.L12.T08` Imposition of Restrictions upon Securities **[DELETED_FROM_DEC2025]**
- `CLP.L12.T09` Inspector's Report **[DELETED_FROM_DEC2025]**
- `CLP.L12.T10` Expenses of Investigation **[DELETED_FROM_DEC2025]**
- `CLP.L12.T11` Preparation by a Company Secretary to face Investigation **[DELETED_FROM_DEC2025]**
- `CLP.L12.T12` Establishment of Serious Fraud Investigation Office **[DELETED_FROM_DEC2025]**
- `CLP.L12.T13` Process of Investigation by Serious Fraud Investigation Office **[DELETED_FROM_DEC2025]**

#### CLP.L13: General Meetings
Part II · M2 lesson: 12 (from p.519) · source S1 p.18

- `CLP.L13.T01` Annual General Meeting
  - `CLP.L13.T01.S01` Extension of AGM; day, time and place — M2 p.523
  - `CLP.L13.T01.S02` Business to be transacted at AGM (ordinary vs special business) — M2 p.524
- `CLP.L13.T02` Extraordinary General Meetings
- `CLP.L13.T03` Other General Meetings
  - `CLP.L13.T03.S01` Class meetings; meetings of debenture holders/creditors — M2 p.529
  - `CLP.L13.T03.S02` Adjourned meetings — M2 p.529
- `CLP.L13.T04` Types of Resolutions
  - `CLP.L13.T04.S01` Ordinary and special resolutions — M2 p.531
  - `CLP.L13.T04.S02` Resolutions requiring special notice — M2 p.532
  - `CLP.L13.T04.S03` Resolutions and agreements to be filed with the Registrar — M2 p.535
- `CLP.L13.T05` Notice, Quorum, Poll, Chairman, Proxy
  - `CLP.L13.T05.S01` Notice of meeting: length, shorter notice, contents, persons entitled — M2 p.536
  - `CLP.L13.T05.S02` Explanatory statement (s.102) — M2 p.544
  - `CLP.L13.T05.S03` Quorum for general meetings — M2 p.546
  - `CLP.L13.T05.S04` Chairman of meetings — M2 p.548
  - `CLP.L13.T05.S05` Proxies — M2 p.549
- `CLP.L13.T06` Meeting and Agenda
- `CLP.L13.T07` Process of conducting meeting
- `CLP.L13.T08` Voting and its types-vote on show of hands, Poll, E-Voting, Postal ballot
  - `CLP.L13.T08.S01` E-voting — M2 p.560
  - `CLP.L13.T08.S02` Demand for poll — M2 p.564
  - `CLP.L13.T08.S03` Postal ballot — M2 p.565
- `CLP.L13.T09` Circulation of Members' Resolutions
- `CLP.L13.T10` Signing and Inspection of Minutes
- `CLP.L13.T11` Secretarial Standard – 2
- `CLP.L13.T12` Duties of Company Secretaries before, during and after General Meeting
- `CLP.L13.T13` Virtual Meetings : Technological Advancement in conduct of General Meetings
- `CLP.L13.T14` Drafting of Notice and Minutes of Annual General Meeting and Extra-Ordinary General Meeting

#### CLP.L14: Directors
Part II · M2 lesson: 13 (from p.593) · source S1 p.19

- `CLP.L14.T01` DIN requirement
  - `CLP.L14.T01.S01` DIR-3 KYC; cancellation / surrender / deactivation of DIN — M2 p.599
- `CLP.L14.T02` Types of Directors
  - `CLP.L14.T02.S01` Independent directors: criteria, term, remuneration — M2 p.605
  - `CLP.L14.T02.S02` Small shareholders' director — M2 p.604
  - `CLP.L14.T02.S03` Other types: resident, woman, additional, alternate, nominee directors (concept) — M2 p.603
  - `CLP.L14.T02.S04` Separate meeting of independent directors (Schedule IV, clause VII) — M2 p.610
- `CLP.L14.T03` Appointment / Reappointment, Disqualifications, Vacation of Office, Retirement, Resignation and Removal
  - `CLP.L14.T03.S01` Modes of appointment (first, by Board, by Tribunal, nominee, at general meeting) — M2 p.616
  - `CLP.L14.T03.S02` Retirement by rotation and re-appointment — M2 p.621
  - `CLP.L14.T03.S03` Appointment of independent directors — M2 p.624
  - `CLP.L14.T03.S04` Disqualifications for appointment of director (s.164) — M2 p.627
  - `CLP.L14.T03.S05` Vacation of office (s.167) — M2 p.628
  - `CLP.L14.T03.S06` Resignation of directors (s.168) — M2 p.630
  - `CLP.L14.T03.S07` Removal of directors (s.169 / Tribunal) — M2 p.631
- `CLP.L14.T04` Loans to Directors
- `CLP.L14.T05` Disclosure of Interest
- `CLP.L14.T06` Duties of Directors
- `CLP.L14.T07` Rights of Directors

#### CLP.L15: Board Composition and Powers of the Board
Part II · M2 lesson: 14 (from p.641) · source S1 p.19

- `CLP.L15.T01` Board composition
  - `CLP.L15.T01.S01` Board composition of listed entities — M2 p.644
  - `CLP.L15.T01.S02` Number of directorships — M2 p.646
- `CLP.L15.T02` Powers of Board
- `CLP.L15.T03` Restrictions on Powers of Board
  - `CLP.L15.T03.S01` Restrictions requiring members' approval (s.180) — M2 p.666
  - `CLP.L15.T03.S02` Political contributions (s.182) — M2 p.670
- `CLP.L15.T04` Board Committees
  - `CLP.L15.T04.S01` Audit committee and vigil mechanism — M2 p.650
  - `CLP.L15.T04.S02` Nomination and remuneration committee — M2 p.657
  - `CLP.L15.T04.S03` Stakeholders relationship committee — M2 p.660
  - `CLP.L15.T04.S04` Risk management committee — M2 p.662
- `CLP.L15.T05` Overview of Inter-Corporate Loans, Investments, Guarantees and Security
  - `CLP.L15.T05.S01` Limits and approvals for loans/investments/guarantees (s.186) — M2 p.673
- `CLP.L15.T06` Related Party Transactions

#### CLP.L16: Meetings of Board and its Committees
Part II · M2 lesson: 15 (from p.693) · source S1 p.19

- `CLP.L16.T01` Frequency, Convening and Proceedings of Board and Committee meetings
  - `CLP.L16.T01.S01` Meeting of independent directors — M2 p.719 **[DEPRECATED v0.2 → `CLP.L14.T02.S04`]**
- `CLP.L16.T02` Agenda Management
- `CLP.L16.T03` Meeting Management
  - `CLP.L16.T03.S01` Quorum for Board meetings — M2 p.707
  - `CLP.L16.T03.S02` Minutes of Board/committee meetings — M2 p.711
- `CLP.L16.T04` Resolution by Circulation
- `CLP.L16.T05` Types of Resolutions
- `CLP.L16.T06` Duties of Company Secretaries before, during and after Board/ Committee Meeting
- `CLP.L16.T07` Virtual Meetings :Technological Advancement in conduct of Board Committee
- `CLP.L16.T08` Need and Scope of Secretarial Standards
- `CLP.L16.T09` Secretarial Standard – 1
- `CLP.L16.T10` Drafting of Notice, Agenda and Minutes of Board and Committee Meetings

#### CLP.L17: Corporate Social Responsibility-Concepts **[DELETED_FROM_DEC2025]**
Part II · M2 lesson: — · source S1-ORIG p.19

- `CLP.L17.T01` CSR Committee **[DELETED_FROM_DEC2025]** → alias, classify to `CLP.L18.T05`
- `CLP.L17.T02` Policy **[DELETED_FROM_DEC2025]** → alias, classify to `CLP.L18.T06`
- `CLP.L17.T03` CSR Expenditure **[DELETED_FROM_DEC2025]**
- `CLP.L17.T04` Activities **[DELETED_FROM_DEC2025]** → alias, classify to `CLP.L18.T07`
- `CLP.L17.T05` Ongoing Project **[DELETED_FROM_DEC2025]**
- `CLP.L17.T06` Impact Assessment **[DELETED_FROM_DEC2025]**

#### CLP.L18: Annual Report-Concepts
Part II · M2 lesson: 16 (from p.737) · source S1 p.19

- `CLP.L18.T01` Board's Report
  - `CLP.L18.T01.S01` Disclosures in Board's report (s.134(3)) — M2 p.749
  - `CLP.L18.T01.S02` Abridged Board's report for OPC and small company — M2 p.757
  - `CLP.L18.T01.S03` Approval and signing of Board's report — M2 p.764
- `CLP.L18.T02` Annual Return
  - `CLP.L18.T02.S01` Signing and certification of annual return — M2 p.771
- `CLP.L18.T03` Annual Report
  - `CLP.L18.T03.S01` Business responsibility reporting (Reg. 34(2)(f) LODR) — M2 p.782
- `CLP.L18.T04` Secretarial Standard on Report of the Board of Directors
- `CLP.L18.T05` CSR Committee ← canonical; historical location `CLP.L17.T01` (2022-original)
  - `CLP.L18.T05.S01` Functions and meetings of CSR committee — M2 p.778
- `CLP.L18.T06` CSR Policy ← canonical; historical location `CLP.L17.T02` (2022-original)
- `CLP.L18.T07` CSR Activities ← canonical; historical location `CLP.L17.T04` (2022-original)
  - `CLP.L18.T07.S01` CSR implementation (Rule 4) and eligible activities — M2 p.780

#### CLP.L19: Key Managerial Personnel (KMP's) and their Remuneration
Part II · M2 lesson: 17 (from p.793) · source S1 p.19

- `CLP.L19.T01` Appointment of Key Managerial Personnel
- `CLP.L19.T02` Managing and Whole-Time Directors, Manager, Chief Executive Officer and Chief Financial Officer
  - `CLP.L19.T02.S01` Appointment, disqualification and approval of MD/WTD/Manager (s.196, Schedule V) — M2 p.800
  - `CLP.L19.T02.S02` CEO and CFO — M2 p.806
- `CLP.L19.T03` Company Secretary – Appointment, Role and Responsibilities
  - `CLP.L19.T03.S01` Removal / resignation of company secretary — M2 p.815
- `CLP.L19.T04` Company Secretary as a Key Managerial Personnel
- `CLP.L19.T05` Functions of Company Secretary
- `CLP.L19.T06` Officer who is in default
- `CLP.L19.T07` Remuneration of Managerial Personnel
  - `CLP.L19.T07.S01` Overall limits and computation of net profit (s.197/s.198) — M2 p.816
  - `CLP.L19.T07.S02` Remuneration in excess of limits; recovery and waiver — M2 p.823

Control node: `CLP.UNMAPPED` — status **OUT_OF_TAXONOMY_REVIEW**, excluded from all analytics.

---

## 5. Important subtopics

Subtopics separate concepts inside bundled bullets. The main examples:
- **Directors:** appointment, retirement, ID appointment, s.164, s.167, s.168, s.169; plus types including the separate ID meeting.
- **General meetings:** notice, explanatory statement, quorum, chairman, proxies; poll under voting.
- **Share capital:** placement vs preferential; rights vs bonus; ESOP vs sweat equity; transfer vs transmission vs demat; DVR.
- **MoA/AoA alteration:** one subtopic for each clause.
- **Auditors:** appointment and rotation, casual vacancy, removal, eligibility.
- **Schemes:** ss.230/232/233/234/235–236/237.
- **Board committees.**
- **Remuneration limits.**

Introductions, specimen resolutions, round-ups, glossaries and case-law lists are never subtopics. Statutory-basis subtopics: OPC (`CLP.L02.T06.S02`) and s.180 restrictions (`CLP.L15.T03.S01`).

---

## 6. December 2025 deletions and modifications

A text comparison of S1-ORIG and S1 shows only L12 and L17 lost text. L10's deletions come from its footnote alone.

| Node | Change | Status |
|---|---|---|
| CLP.L10 | "Oppression and Mismanagement; Class Actions Suits" deleted → Professional DPA | Chapter PARTIALLY_DELETED; T02, T03 DELETED |
| CLP.L12 (13 topics) | Whole lesson deleted → Professional CMADD | All DELETED (topic text from S1-ORIG p.18) |
| CLP.L17 (6 topics) | Lesson deleted. Committee / Policy / Activities moved to L18; Expenditure / Ongoing Project / Impact Assessment deleted | All DELETED; three are aliases of L18.T05–T07 |
| CLP.L18 | Gains CSR Committee / Policy / Activities | T05–T07 CURRENT, canonical for all attempts |

---

## 7. Discrepancies between the syllabus and the study material

| # | Discrepancy | Decision |
|---|---|---|
| D-1 | Lesson numbering: S1 1–19 vs M2/supplements 1–17 | Canonical = syllabus; M2 number stored (§2) |
| D-2 | Oppression and mismanagement still in M2 (pp.498–501) despite deletion | Owner decision: follow S1; historical-only (§3.2) |
| D-3 | CSR committee in M2 L14 (Board committees, p.663) **and** M2 L16 (pp.777–778) | Canonical `CLP.L18.T05` (DD-16) |
| D-4 | M2's printed syllabus splits or merges some bullets (L10, L15, L19) | Follow S1 bullets |
| D-5 | M2 contents-page errors: disqualification p.625 → actual p.627; "Lifting Off" vs body "Lifting of"; "Voting 658" (558); others | Page references checked against the body text (V17) |
| D-6 | "Rights of Directors" bullet has no M2 section (outline only, p.593) | Kept (official bullet); statutory evidence |
| D-7 | M2 concepts that are not bullets (alter ego, limited liability, DVR, BRR, SSE, ACTIVE, special company forms) | Decided individually (§3.1, §3.3) |
| D-8 (new) | M2 places the separate meeting of IDs in **both** the Directors lesson (pp.610–612) and the Board-meetings lesson (pp.719–720), and says it is not a Board meeting | Canonical `CLP.L14.T02.S04` (JC-4) |
| D-9 (new) | Producer and Nidhi companies have no L2 "types" material in M2 (contrary to the brief's premise) | §3.1 CF-4, CF-5 |

---

## 8. Taxonomy design decisions

DD-01 to DD-18 from v0.1 still apply, as amended below:

- **DD-05 (amended):** CSR moved-topic handling is the general moved-topic rule (methodology §6.1).
- **DD-15 (amended):** the control node is `OUT_OF_TAXONOMY_REVIEW` and excluded from analytics.

New decisions in v0.2:
- **DD-19 Entity-type context rule:** a special company form without a node, when it appears only as context for a rule with a functional node, is classified to the functional node (e.g. N-02, N-06).
- **DD-20 Deprecation rule:** misplaced nodes become DEPRECATED aliases; IDs are never reused (JC-4).
- **DD-21 Eligibility flags:** `historical_analytics_eligible` / `current_priority_eligible` on every node govern which nodes analytics and priority may use.

The v0.1 decision texts:
- DD-01 canonical numbering = syllabus
- DD-02 deleted content kept, with statuses and versions
- DD-03 S1-ORIG is the source for deleted topic text
- DD-04 topics are verbatim S1 bullets; bundles are split only by subtopics
- DD-06 subtopic restraint
- DD-07 alteration of share capital → L03.T03.S05
- DD-08 borrowing powers → L15
- DD-09 poll → L13.T08.S02
- DD-10 dormant: L02.T12 definition vs L11 procedure
- DD-11 rectification of register → L05.T05
- DD-12 minutes and drafting placement
- DD-13 definitions of specific company types → L02, other definitions → L01.T07
- DD-14 resolutions: members' vs Board vs circulation
- DD-16 CSR committee → L18.T05
- DD-17 L19 keeps the T03/T04 split
- DD-18 classify within the paper's own taxonomy

---

## 9. Unresolved issues

**Blocking issues: none.** All owner-required decisions (§3.1–§3.6) are resolved.

Non-blocking residual risks, recorded for transparency:

| ID | Item | Why non-blocking | Handling |
|---|---|---|---|
| R-1 (was U-01) | S1-ORIG is an April 2025 build. That its CLP text equals the version in force for Dec 2023 – Dec 2024 is unproven (the 2022 archive capture is corrupt) | Only affects the topic lists of deleted lessons L12 and L17. No other CLP modification notice exists besides S2 | If a Dec 2023 – Dec 2024 question fits no L12/L17 topic, it surfaces as OUT_OF_TAXONOMY_REVIEW and triggers a source check |
| R-2 (was U-03) | "Rights of Directors" has no M2 section | Official bullet; classification uses statutory provisions | Accepted |
| R-3 (was U-07) | Older M2 editions were not obtained; deleted lessons have no subtopics | Topic-level classification is enough for deleted content | Revisit only if pilot data needs finer granularity |
| R-4 | Producer, Section 8, SSE and ACTIVE concept-level questions will sit in the holding node | Correct by policy; reported separately as "unmapped" | If such questions recur, a future syllabus or taxonomy revision may justify a node, backed by evidence |

---

## 10. Validation

`python3 -I scripts/validate_clp_taxonomy.py 0.2` → **ALL_PASS = true**: 18/18 checks · 43/43 synthetic tests · 4/4 negative controls. Full output: `04_Verification/clp_taxonomy_v0.2_validation.md` / `.json`.

| Check | What it proves | Result |
|---|---|---|
| V01–V02 | Unique IDs; every parent exists at the correct level | PASS |
| V03–V05 | Valid statuses; deleted nodes only in 2022-original; children of deleted nodes are deleted | PASS |
| V06 | Alias / deprecated nodes point to an ACTIVE classifiable node | PASS |
| V07–V09 | Eligibility flags follow the rules; holding node excluded from all analytics; deleted nodes historical-only | PASS |
| V10 | Oppression and Mismanagement retained as DELETED, historical-only | PASS |
| V11 | Canonical / historical location fields consistent on every node | PASS |
| V12 | Moved CSR topics: exactly one canonical node each, aliases correct, historical L17 recorded | PASS |
| V13–V14 | Every node has a source reference; subtopic basis declared (statutory ones explicit) | PASS |
| V15–V16 | All names word-for-word in S1 / S1-ORIG (re-read from the PDFs); bullet coverage 19/19 lessons | PASS |
| V17 | Every M2-anchored subtopic heading found on its cited page (re-read from the PDF) | PASS |
| V18 | No v0.1 ID removed | PASS |

**Validator self-test (mutation testing):** I deliberately broke 9 things in a scratch copy, and the validator failed on **all 9**:
- a duplicate CSR node;
- the holding node counted in analytics;
- oppression made current-priority;
- a wrong page;
- edited topic wording;
- lost historical location;
- a wrong test expectation;
- an alias used as a target;
- a deleted node removed.

---

## 11. Synthetic classification tests (43, plus 4 negative controls)

**Outcome definitions:**
- **CLEAN:** one defensible primary node.
- **CLEAN_WITH_RULE:** one defensible primary node, relying on a documented rule.
- **REVIEW:** classifiable, but the methodology requires human review.

The validator **derives** each outcome from taxonomy attributes (control node; deleted content in a post-Dec 2025 attempt; MEDIUM placement confidence) and fails if the derived outcome differs from the expected one.

**Totals:** CLEAN 19 · CLEAN_WITH_RULE 15 · REVIEW 9 · all 43 match their expected outcome.

### Original 24 (re-run on v0.2)

| ID | Attempt | Primary | Outcome | Notes |
|---|---|---|---|---|
| H-01 | 2026-06 | `CLP.L14.T03.S04` | CLEAN | |
| H-02 | 2026-06 | `CLP.L14.T03.S01` | CLEAN | |
| H-03 | 2026-06 | `CLP.L15.T03.S01` | CLEAN_WITH_RULE | DD-08 |
| H-04 | 2026-06 | `CLP.L16.T03.S01` | CLEAN_WITH_RULE | multi-topic |
| H-05 | 2026-06 | `CLP.L13.T05.S01` | CLEAN | |
| H-06 | 2026-06 | `CLP.L13.T08.S02` | CLEAN_WITH_RULE | DD-09 |
| H-07 | 2026-06 | `CLP.L04.T10` | CLEAN | |
| H-08 | 2026-06 | `CLP.L07.T02.S01` | CLEAN | |
| H-09 | 2026-06 | `CLP.L09.T04.S01` | CLEAN | |
| H-10 | 2024-06 | `CLP.L18.T05` | CLEAN_WITH_RULE | moved-topic rule; historical lesson L17, node L17.T01 |
| H-11 | 2024-12 | `CLP.L17.T03` | CLEAN | deleted content, historical attempt |
| H-12 | 2026-06 | `CLP.L18.T01.S01` | CLEAN | |
| H-13 | 2026-06 | `CLP.L10.T01.S03` | CLEAN | |
| H-14 | 2024-06 | `CLP.L10.T02` | CLEAN | deleted content, historical attempt |
| H-15 | 2024-06 | `CLP.L12.T13` | CLEAN | deleted content, historical attempt |
| H-16 | 2026-06 | `CLP.L19.T07.S01` | CLEAN | |
| H-17 | 2026-06 | `CLP.L02.T08` | CLEAN_WITH_RULE | DD-13 |
| H-18 | 2026-06 | `CLP.L02.T06.S02` | CLEAN_WITH_RULE | statutory-basis subtopic |
| H-19 | 2026-06 | `CLP.UNMAPPED` | **REVIEW** | Section 8 concept, no valid topic (CF-1) |
| H-20 | 2026-06 | `CLP.L16.T10` | CLEAN_WITH_RULE | DD-12 |
| H-21 | 2026-06 | `CLP.L15.T06` | CLEAN_WITH_RULE | multi-topic |
| H-22 | 2026-06 | `CLP.L04.T09.S02` | CLEAN | |
| H-23 | 2026-06 | `CLP.L03.T03.S05` | CLEAN_WITH_RULE | DD-07 |
| H-24 | 2026-06 | `CLP.L08.T02.S01` | CLEAN | |

Changes from v0.1: H-11, H-14 and H-15 now carry explicit historical attempts. H-19's outcome is now formally REVIEW (holding node) instead of "not clean".

### New tests (19)

| ID | Covers | Attempt | Primary | Outcome | Why |
|---|---|---|---|---|---|
| N-01 | Section 8 (concept) | 2026-06 | `CLP.UNMAPPED` | **REVIEW** | No valid topic; holding node |
| N-02 | Section 8 (as context) | 2026-06 | `CLP.L13.T05.S05` | CLEAN_WITH_RULE | DD-19; proxy restriction M2 p.550 |
| N-03 | Statutory company | 2026-06 | `CLP.L01.T06` | CLEAN_WITH_RULE | CF-2 |
| N-04 | Unlimited company | 2026-06 | `CLP.L02.T01.S01` | **REVIEW** | CF-3; MEDIUM placement → per-question review |
| N-05 | Producer company (concept) | 2026-06 | `CLP.UNMAPPED` | **REVIEW** | No valid topic; holding node |
| N-06 | Producer company (as context) | 2026-06 | `CLP.L15.T01` | CLEAN_WITH_RULE | DD-19; M2 p.643 |
| N-07 | Nidhi company | 2026-06 | `CLP.L01.T07` | CLEAN_WITH_RULE | CF-5 |
| N-08 | Oppression and Mismanagement (historical) | 2024-12 | `CLP.L10.T02` | CLEAN | deleted, historical attempt |
| N-09 | Oppression and Mismanagement (current attempt) | 2026-06 | `CLP.L10.T02` | **REVIEW** | SYLLABUS_TRANSITION |
| N-10 | Moved CSR topic (before the move) | 2025-06 | `CLP.L18.T06` | CLEAN_WITH_RULE | historical lesson L17, node L17.T02 |
| N-11 | Moved CSR topic (after the move) | 2025-12 | `CLP.L18.T06` | CLEAN | historical lesson L18 |
| N-12 | Deleted CSR topic (current attempt) | 2025-12 | `CLP.L17.T05` | **REVIEW** | SYLLABUS_TRANSITION |
| N-13 | Separate meeting of IDs | 2026-06 | `CLP.L14.T02.S04` | CLEAN | JC-4 |
| N-14 | ACTIVE form | 2026-06 | `CLP.UNMAPPED` | **REVIEW** | JC-6 |
| N-15 | Social Stock Exchange | 2026-06 | `CLP.UNMAPPED` | **REVIEW** | JC-5 split |
| N-16 | BRR | 2026-06 | `CLP.L18.T03.S01` | CLEAN | JC-5 |
| N-17 | DVR issue conditions | 2026-06 | `CLP.L04.T01.S01` | CLEAN_WITH_RULE | JC-3 |
| N-18 | Alter ego | 2026-06 | `CLP.L01.T05.S02` | CLEAN | JC-1 |
| N-19 | Limited liability | 2026-06 | `CLP.L02.T01.S01` | **REVIEW** | JC-2 MEDIUM → per-question review |

**Why the 9 REVIEW outcomes are expected behaviour, not defects:**
- 5 are holding-node concepts with no valid topic: H-19, N-01, N-05, N-14, N-15.
- 2 are deleted content asked in a post-Dec 2025 attempt: N-09, N-12.
- 2 are the MEDIUM-confidence limited-liability placement: N-04, N-19.

Each is routed to human review exactly as the methodology requires.

**Negative controls (all rejected correctly):**
- X-01: alias `CLP.L17.T02`
- X-02: deprecated `CLP.L16.T01.S01`
- X-03: structural chapter `CLP.L14`
- X-04: `CLP.UNMAPPED` excluded from analytics

---

## 12. Final status

**`TAXONOMY_STATUS = READY_FOR_PAPER_ANALYSIS`**

Basis for this status:
- All six owner instructions (§3.1–§3.6) are resolved with evidence.
- Taxonomy v0.2 is frozen (`meta.status = FROZEN_FOR_PAPER_ANALYSIS`).
- Validation passes 18/18, with a mutation-tested validator.
- All 43 synthetic tests and all 4 negative controls behave as specified.
- The remaining items in §9 are non-blocking residual risks, each with a defined detection path.

Paper analysis has **not** started and will not start until the owner gives the next instruction.

---

## Appendix: files for Phase 1A close-out

| File | State |
|---|---|
| `taxonomy/clp_taxonomy_v0.2.json` / `.csv` | **New**, current, frozen |
| `taxonomy/clp_taxonomy_v0.1.json` / `.csv` | Unchanged, superseded |
| `taxonomy/tests/clp_synthetic_tests_v0.2.json` | **New** (43 tests, 4 negative controls) |
| `scripts/build_clp_taxonomy_v0_2.py` | **New** |
| `scripts/validate_clp_taxonomy.py` | **New** |
| `04_Verification/clp_taxonomy_v0.2_validation.md` / `.json` | **New** (generated) |
| `reports/CLP_TAXONOMY_REVIEW.md` | Updated (this file) |
| `PROJECT_METHODOLOGY.md` | Updated to 0.3 |
| `SOURCE_REGISTRY.md` | Unchanged (no new source needed) |
