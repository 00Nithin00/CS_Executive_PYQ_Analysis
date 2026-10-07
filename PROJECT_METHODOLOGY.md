# PROJECT_METHODOLOGY — CS Executive PYQ Intelligence Project

**Methodology version:** 0.3 (Phase 1A close-out: CLP taxonomy policy decisions). Changelog at the end of this file. Methodology and taxonomy versions are independent (§6.5)
**Prepared:** 2026-10-07
**Status:** Draft for owner review. No question papers have been extracted or classified.
**Companion file:** `SOURCE_REGISTRY.md`. Source IDs in square brackets (e.g. [S1]) refer to entries in that file.

---

## 1. Project objective

Build a **traceable, verifiable dataset of ICSI CS Executive past examination questions**, together with analytics on topic history, for a future preparation website. The website will offer:

- links to official study material, papers, guideline answers, syllabus and supplements;
- topic-wise question history and frequency/marks analysis;
- **explainable study-priority labels** based on historical evidence.

**Non-goals:**
- predicting what the next exam will ask;
- reproducing or replacing ICSI material (we link to it and quote only minimal question text, with citations);
- treating any third-party source as authoritative.

**Guiding principle:** every number on the website must trace back to specific questions, and every question must trace back to an official PDF, page and question number. If something is uncertain, we label it as uncertain instead of hiding it.

---

## 2. Official sources

All sources, with URLs and verification dates, are in `SOURCE_REGISTRY.md`. Order of authority:

1. **ICSI Syllabus 2022 document** (modified version, file dated 2025-12-27) [S1]. Authority for structure, lessons and marks split. For content in force **before** Dec 2025 (deleted lessons and topics), the authority is the **pre-modification ICSI syllabus file [S1-ORIG]**. The original icsi.edu URL now returns 404, so it was retrieved from the Internet Archive (registry §2). An ICSI-authored file retrieved this way is admissible when its SHA-256 is recorded and the archive URL is cited. It is never a substitute for a document still available on icsi.edu.
2. **ICSI announcements and notices** [S2, S4, L1–L3, M0, E1–E2]. Authority for changes, applicability and exam mode.
3. **Official question papers** from the Previous Sessions QPs archive [§6 of the registry]. The only source of question text and marks.
4. **Official Guideline Answers** [§5 of the registry]. Evidence for classification (they cite the governing provisions). They are not a source of question text.
5. **Official study material and supplements** [M1–M7b, N5]. Used to define topic and subtopic headings.

Third-party sites are never cited. Their claims are recorded only to flag contradictions (registry §8).

**Practical notes:**
- www.icsi.edu is now a JavaScript app, and its legacy `/media/webmodules/` URLs return 404 (registry §0).
- ICSI calls its suggested answers **"Guideline Answers"**. We use that term.

---

## 3. Current syllabus structure (verified 2026-10-07)

**Current syllabus:** ICSI Syllabus 2022 [S1], **as modified effective December 2025** [S2]. Only Syllabus 2022 is examined now. The June 2026 results and Dec 2026 timetable cover Syllabus 2022 only [E1, E2].

**Exam format (2022 papers seen):** 3 hours, 100 marks, 6 questions, "Answer ALL questions". Each paper has Part I / Part II matching the syllabus marks split. Question 1 is often a case study or long practical problem. This was seen on the first pages of 522, 524 and 527 (Dec 2025). It still has to be confirmed for every paper and attempt before we rely on it (`REQUIRES_VERIFICATION`). No OMR paper has been seen under Syllabus 2022.

| Group | Paper | Code | Subject | Parts (marks) |
|---|---|---|---|---|
| 1 | 1 | 521 | Jurisprudence, Interpretation & General Laws (JIGL) | Single part (100) |
| 1 | 2 | 522 | Company Law & Practice (CLP) | I Company Law – Principles & Concepts (60) · II Company Administration & Meetings (40) |
| 1 | 3 | 523 | Setting Up of Business, Industrial & Labour Laws (SBILL) | I Setting Up of Business (60) · II Industrial & Labour Laws (40) |
| 1 | 4 | 524 | Corporate Accounting & Financial Management (CAFM) | I Corporate Accounting (60) · II Financial Management (40) |
| 2 | 5 | 525 | Capital Market & Securities Laws (CMSL) | I Capital Market (40) · II Securities Laws (60) |
| 2 | 6 | 526 | Economic, Commercial & Intellectual Property Laws (ECIPL) | I Economic & Commercial Laws (60) · II Intellectual Property Laws (40) |
| 2 | 7 | 527 | Tax Laws & Practice (TLP) | I Direct Tax (60) · II Indirect Tax – GST & Customs (40) |

Subject codes come from the official question-paper archive. Codes 525 and 526 also have bilingual "EH" versions.

**Lesson lists** (from S1; lessons marked † were deleted or partly deleted effective Dec 2025):

- **P1 JIGL (18 lessons):** 1 Sources of Law · 2 Constitution of India† (topics deleted: "Finance Bill and Other Bills; Parliamentary Standing Committees and their Role") · 3 Interpretation of Statutes · 4 Administrative Laws · 5 Law of Torts · 6 Civil Procedure · 7 Crime and its Procedure · 8 Evidence · 9 Specific Relief† (deleted; moved to Professional "Drafting, Pleadings & Appearances", DPA) · 10 Limitation · 11 Arbitration, Mediation & Conciliation† (topics deleted: "Power of High Court to make rules; Mediation rules made by Higher Courts") · 12 Indian Stamp Law† (deleted; moved to DPA) · 13 Registration of Documents† (deleted; moved to DPA) · 14 Right to Information · 15 Information Technology · 16 Contract Law · 17 Sale of Goods† (deleted; moved to CSEET) · 18 Negotiable Instruments.
- **P2 CLP (19 lessons):** 1 Introduction to Company Law · 2 Legal Status & Types of Registered Companies · 3 MoA & AoA and Alteration · 4 Shares & Share Capital · 5 Members & Shareholders · 6 Debt Instruments · 7 Charges · 8 Distribution of Profits · 9 Accounts & Auditors · 10 Compromise, Arrangement & Amalgamations† (topics deleted: "Oppression and Mismanagement; Class Action Suits") · 11 Dormant Company · 12 Inspection, Inquiry & Investigation† (deleted; moved to Professional CMADD) · 13 General Meetings · 14 Directors · 15 Board Composition & Powers · 16 Meetings of Board & Committees · 17 CSR – Concepts† (lesson deleted; "Policy, Activities, CSR Committee" moved into Lesson 18; "CSR Expenditure, Ongoing Project, Impact Assessment" deleted) · 18 Annual Report · 19 KMP & Remuneration.
- **P3 SBILL (20 lessons):** 1 Selection of Business Organisation · 2 Corporate Entities – Companies · 3 LLP · 4 Startups · 5 MSME · 6 Conversion of Business Entities · 7 Non-Corporate Entities · 8 Financial Services Organisations · 9 Business Collaborations · 10 Branch/Liaison Office/WOS by Foreign Company · 11 Setting up Business outside India · 12 Industry-specific Laws & Initial Compliances · 13 Initial Registrations & Licences · 14 Constitution & Labour Laws · 15 Evaluation of Labour Legislation & need of Labour Code · 16 Welfare & Working Conditions · 17 Industrial Relations · 18 Wages · 19 Social Security · 20 POSH Act, 2013.
- **P4 CAFM (19 lessons):** 1 Introduction to Accounting · 2 Introduction to Corporate Accounting · 3 Accounting Standards · 4 Share Capital · 5 Debentures · 6 Related Aspects of Company Accounts · 7 Consolidation · 8 Financial Statement Analysis · 9 Cash Flows · 10 Forecasting Financial Statements · 11 FM Introduction · 12 Time Value of Money · 13 Capital Budgeting · 14 Cost of Capital · 15 Capital Structure · 16 Dividend Decisions · 17 Working Capital · 18 Security Analysis · 19 Operational Approach to Financial Decisions (costing).
- **P5 CMSL (16 lessons):** 1 Basics of Capital Market · 2 Secondary Market · 3 SCRA 1956 · 4 SEBI · 5 Depositories & DPs · 6 Intermediaries · 7 IFSCA · 8 Issue of Securities · 9 Non-Convertible Securities · 10 LODR · 11 Takeovers · 12 Insider Trading · 13 PFUTP · 14 Delisting & Buyback · 15 Mutual Funds · 16 Collective Investment Schemes.
- **P6 ECIPL (19 lessons):** 1 FEMA · 2 FDI · 3 ODI · 4 ECB† (deleted; moved to Professional SMCF) · 5 Foreign Trade Policy · 6 SEZ · 7 FCRA · 8 PMLA (now includes a brief on Fugitive Economic Offenders and Benami law) · 9 Fugitive Economic Offenders† (deleted) · 10 Benami Transactions† (deleted) · 11 Competition Law · 12 Consumer Protection · 13 Legal Metrology · 14 RERA · 15 Patents · 16 Trade Marks · 17 Copyright · 18 Geographical Indications · 19 Industrial Designs.
- **P7 TLP (20 lessons):** 1–13 Direct Tax (at a glance; basic concepts; exempt incomes; five heads of income; clubbing & set-off; deductions; computation for various entities; company taxation; procedural compliance) · 14–19 GST (concepts; basics; levy; time/value/place of supply; ITC & liability; procedural compliance) · 20 Customs.

**Caveat on lesson numbering** (resolved for P2 in Phase 1A; still open for P1, P3–P7): the syllabus keeps its original lesson numbers and marks deleted lessons with footnotes. The **study material and supplements renumber lessons after removing deleted ones.** For P2: syllabus Lessons 1–19, M2 Lessons 1–17 (syllabus 13–16 = M2 12–15; syllabus 18–19 = M2 16–17; syllabus 12 and 17 have no M2 lesson). **Canonical taxonomy IDs use syllabus numbering.** Study-material numbers are stored as a separate attribute. Each paper must be checked the same way before its taxonomy is built (see `reports/CLP_TAXONOMY_REVIEW.md` §6).

**Current study-material versions** [M0]: P1–P6 updated till 30 Nov 2025; P7 updated till 31 May 2025. A separate P7 book applies from June 2027 [M7b].

**Law cut-off rule** [S1 §D]: for a December session, law as amended up to **31 May** of that year; for a June session, up to **30 November** of the previous year.

---

## 4. Historical syllabus considerations

### 4.1 Timeline (Executive Programme)

Sources: official QP archive (subject codes listed per session), official Guideline Answers page, S1 §F/§H, S4. "OMR" means a 100-question, 1-mark MCQ paper.

| Exam attempt | Syllabus | Module/Group | Papers (codes) | Comparable with current syllabus? | Notes |
|---|---|---|---|---|---|
| Dec 2026 (upcoming) | 2022 | G1, G2 | 521–527 | — | 21–28 Dec 2026 [E1]. Finance Act 2025 applies [L2] |
| **June 2026** | 2022 (modified) | G1, G2 | 521–527 (+525EH, 526EH) | **Yes (baseline)** | Guideline answers available |
| **Dec 2025** | 2022 (modified) | G1, G2 | 521–527 (+EH) | **Yes (baseline)** | **First attempt under the Dec 2025 modifications** [S2] |
| **June 2025** | 2022 (original) | G1, G2 | 521–527 (+EH) | **Yes**, but questions from lessons later deleted (†) must be flagged | First session with 2022 papers only. New criminal laws apply from this session [L3] |
| **Dec 2024** | 2022 (original) **and** 2017 | G1/G2 and M-I/M-II | 521–527 and 421–428 (424-A, 425-A, 428-A OMR) | 2022 papers: **Yes** (flag †). 2017 papers: **Partly**, see 4.3 | **Last 2017 Executive attempt.** Evidence: archive papers and ep2017 guideline answers. S1 §H says June 2024, so there was a later extension. Extension notice not found: `REQUIRES_VERIFICATION` |
| **June 2024** | 2022 and 2017 | both | 521–527; 421–428 (OMR as above) | 2022: Yes (flag †). 2017: Partly | |
| **Dec 2023** | 2022 and 2017 | both | 521–527; 421–428 (OMR as above) | 2022: Yes (flag †). 2017: Partly | **First Syllabus 2022 Executive exam** [S1 §F] |
| June 2023 | 2017 only | M-I, M-II | 421–428 (OMR: 424-A, 425-A, 428-A) | Partly | |
| Dec 2022 | 2017 only | M-I, M-II | 421–428 (OMR as above) | Partly | |
| June 2022 | 2017 only | M-I, M-II | 421–428 (424, 425, 428 OMR, no "-A" suffix) | Partly | 424 June 2022 confirmed OMR |
| Dec 2021 | 2017 and Old (2012) | M-I, M-II | 421–428; 321–327 | 2017: Partly. Old: **No** | |
| June 2021 | 2017 and Old | M-I, M-II | 421–428 (428 confirmed OMR); 321–327 | 2017: Partly. Old: No | |
| Dec 2020 | 2017 and Old | M-I, M-II | 421–428; 321–327 | 2017: Partly. Old: No | |
| June 2020 | — | — | **No session in the official archive** | — | `REQUIRES_VERIFICATION` (likely COVID-19; no ICSI notice located) |
| Dec 2019 | 2017 and Old | M-I, M-II | 421–428 (425-A confirmed OMR); 321–327 | 2017: Partly. Old: No | **Earliest attempt with OMR papers seen.** Whether 424-A and 428-A were also OMR in Dec 2019: `REQUIRES_VERIFICATION` |
| June 2019 | 2017 and Old | M-I, M-II | 421–428; 321–327 | 2017: Partly. Old: No | 424 Tax Laws was **descriptive** (6 questions) in June 2019 |
| Dec 2018 | 2017 and Old | M-I, M-II | 421–428; 321–327 | Partly | First 2017 Executive attempt in the guideline-answer list ("Executive (New Syllabus)"). The exact first-exam date of Syllabus 2017 is `REQUIRES_VERIFICATION` |

### 4.2 Implications for the "last 5–7 years" goal

Syllabus 2022 has **6 completed attempts** (Dec 2023 to June 2026). Even counting Dec 2026 later, that is only about 3.5 years. Reaching 5–7 years means using Syllabus 2017 papers, which are **not** the same syllabus. We therefore use **analysis tiers**:

| Tier | Data | How it is used |
|---|---|---|
| **A: Primary** | Syllabus 2022 papers, Dec 2023 → latest | Main basis for all analytics and priority labels |
| **B: Crosswalked history** | Syllabus 2017 **descriptive** papers (421, 422, 423, 426, 427; also 424, 425, 428 in sessions where they were descriptive) | Mapped onto the 2022 taxonomy through an explicit crosswalk (see 4.3). Shown as **separate "extended history"** on the site. Mixed into Tier-A priority only under the rule in §9.5 |
| **C: OMR history** | 2017 OMR papers (424/425/428, from Dec 2019 at least) | Analysed **separately** as MCQ concept-coverage. **Never** added to marks-weight metrics, because 1-mark MCQs and descriptive marks are not comparable |
| **D: Excluded** | Old (2012) syllabus papers (3xx); anything before June 2019 | Out of scope. They may be stored in the archive but are not analysed |

### 4.3 Paper crosswalk 2017 → 2022 (from S1 §G exemption table; topic-level mapping is still to be done)

| 2017 paper (code) | 2022 paper | Comparability notes |
|---|---|---|
| JIGL (421) | P1 JIGL (521) | High overall. Criminal law and evidence changed to BNS/BNSS/BSA from June 2025 [L3]. Lessons later deleted in 2022 (Specific Relief, Stamp, Registration, Sale of Goods) must not count toward current priority |
| Company Law (422) | P2 CLP (522) | High. Same Companies Act 2013, but scope differs (e.g. Inspection/Investigation, Oppression and Mismanagement, CSR detail removed from Dec 2025) |
| Setting up of Business Entities & Closure (423) | P3 SBILL (523) Part I | **Partial.** The 2022 paper adds Part II Industrial & Labour Laws (40 marks), which 423 did not cover. Closure-related topics need checking |
| Tax Laws (424, OMR from at least June 2022) | P7 TLP (527) | **Low for marks.** OMR versus descriptive format, and figures depend on the year's Finance Act. Concepts (provisions) can be compared; numbers cannot. From June 2027 the Income-tax Act 2025 replaces the 1961 Act [L1] |
| Corporate & Management Accounting (425, OMR from Dec 2019) | P4 CAFM (524) Part I and parts of Part II | Low (OMR) |
| Financial & Strategic Management (428, OMR) | P4 CAFM (524) Part II | Low (OMR). Strategic Management is not part of CAFM |
| Securities Laws & Capital Markets (426) | P5 CMSL (525) | High. SEBI regulations are amended often, so check the version for each attempt |
| Economic, Business & Commercial Laws (427) | P6 ECIPL (526) | Partial. The 2022 paper adds Part II IP Laws (40 marks). ECB, FEO and Benami removed from Dec 2025 |

### 4.4 Changes **within** Syllabus 2022 that affect comparison

1. **Dec 2025 content modifications** [S2, S1 footnotes]: affect JIGL, CLP and ECIPL (lessons marked † in §3). Questions on deleted content from Dec 2023 to June 2025 stay in the dataset. They are tagged `syllabus_status = DELETED_FROM_DEC2025` and **excluded** from current priority calculations.
2. **New criminal laws from June 2025** [L3]: JIGL questions on IPC/CrPC/Evidence Act (to Dec 2024) and on BNS/BNSS/BSA (from June 2025) are linked through concept mapping. They are not automatically treated as the same thing.
3. **Tax year changes every attempt** (Finance Act applicability notices) and the **Income-tax Act 2025 from June 2027** [L1]: Tax concepts are tracked by *concept*, never by section number alone.
4. **Labour Codes:** SBILL Part II lists pre-Code Acts plus "need of Labour Code". Whether and from when the four Labour Codes replace these Acts for exam purposes is `REQUIRES_VERIFICATION` (we have no ICSI notice yet).
5. **Ongoing amendments** (Companies Act, SEBI regulations, FEMA, GST): handled through the supplements for each attempt (registry §3). Each question records the attempt's law cut-off date.

---

## 5. Data schema (one record per atomic question unit)

**Atomic unit** = the smallest part of a question that carries its own marks. For example, Q2(b)(ii) is one record if marks are stated for (ii); otherwise Q2(b) is the record. Parent records hold shared context, such as case-study facts.

Records are stored as JSON Lines (one JSON object per line), with a CSV export. IDs are deterministic:
`EP-{syllabus}-{code}-{YYYY}{J|D}-Q{n}[-{sub}][-{subsub}]`, e.g. `EP-2022-522-2025D-Q1-a-ii`.

### 5.1 Identification and provenance

| Field | Type | Why it exists |
|---|---|---|
| `question_id` | string (deterministic) | Stable key for linking, deduplicating and citing |
| `parent_question_id` | string/null | Links a sub-question to its parent (case context, shared facts) |
| `examination_attempt` | enum, e.g. `2025-12` | The attempt; all time-based analytics key on this |
| `examination_session_label` | string, e.g. "December 2025" | The ICSI wording, for display |
| `examination_date` | date/null | Date the paper was sat, from the official timetable. Null until verified |
| `programme` | const "Executive" | Lets Professional be added later without changing the schema |
| `syllabus` | enum `2017` / `2022` | **Which syllabus the paper was set under**, derived from the subject code. Never from the header text |
| `syllabus_variant` | enum `2022-original` / `2022-mod-dec2025` / `2017` | Captures changes within a syllabus |
| `module_group` | enum `G1`, `G2`, `M1`, `M2` | Exam grouping |
| `subject` | string (controlled list) | Official paper name |
| `paper_code` | string, e.g. `522`, `424-A`, `525EH` | Exact official code; identifies syllabus, OMR booklet and language version |
| `paper_part` | enum `I` / `II` / `NA` | Matches the syllabus marks split (e.g. CLP Part I = 60) |
| `language_version` | enum `EN` / `EH` | EN is canonical; EH used only for cross-checking |
| `question_number` | int | As printed |
| `sub_question_number` | string, e.g. `a`, `a.ii` | As printed, kept verbatim |
| `choice_group_id` | string/null | Groups internal alternatives ("OR" / "Attempt any N") so marks are not counted twice |
| `is_alternative` | bool | True for each option inside a choice group |
| `source_url` | URL | Official PDF from the registry |
| `source_file_sha256` | string | Identifies the exact file even if its URL changes |
| `source_page` | int (PDF page index) + `printed_page` | Traceability to the page |
| `guideline_answer_url` / `guideline_answer_page` | URL / int / null | Evidence used for classification; lets reviewers check |

### 5.2 Content

| Field | Type | Why it exists |
|---|---|---|
| `question_text` | string (verbatim) | Exactly as printed; no paraphrasing |
| `case_context_id` | string/null | Points to the shared case-study facts, stored once |
| `marks_raw` | string, e.g. "(2+2+1=5 marks)" | Marks exactly as printed |
| `marks` | number/null | Numeric marks for this unit. **Null if not printed or unclear; never estimated** |
| `marks_breakdown` | array/null | e.g. [2,2,1] when printed |
| `question_type` | enum (see §6.4) | Format distribution and study advice |
| `task_verb` | enum: explain / distinguish / comment / compute / advise / draft / list / state_validity / mcq | Separates "the same concept asked a different way" |
| `law_references` | array of {act, provision} | Statutory hooks quoted in the question or guideline answer; the basis for concept matching |
| `law_regime_context` | string, e.g. "IT Act 1961, AY 2025-26" | The law version the question was set under (from paper notes or ICSI applicability notices) |
| `extraction_method` | enum `pdf_text` / `ocr` / `manual` | Data-quality signal |
| `text_quality` | enum `CLEAN` / `MINOR_ISSUES` / `CORRUPTED` | Corrupted text forces human verification |

### 5.3 Classification

| Field | Type | Why it exists |
|---|---|---|
| `chapter` | taxonomy ID, e.g. `CLP.L14` | Official lesson (§6.1); syllabus numbering |
| `topic` | taxonomy ID, e.g. `CLP.L14.T03` | Syllabus bullet item |
| `subtopic` | taxonomy ID/null, e.g. `CLP.L14.T03.S04` | Study-material sub-heading or specific provision |
| `canonical_taxonomy_location` | taxonomy ID | **A.** Where the concept lives in the current canonical taxonomy. Always a `CLASSIFIABLE` node (or the control node). All analytics aggregate on this |
| `historical_lesson_at_exam_time` | lesson ID | **B.** The syllabus lesson the concept belonged to **when the question was examined**, taken from the node's `lesson_by_syllabus_version` for the attempt's syllabus version. Set on **every** record, so it equals the canonical lesson unless the topic moved. Example: June 2024 CSR-policy question → canonical `CLP.L18.T06`, historical lesson `CLP.L17` |
| `historical_node_at_exam_time` | taxonomy ID/null | Set when the concept sat in a different (now alias) node at exam time. Example above: `CLP.L17.T02`. Never overwritten by the canonical value |
| `methodology_version` | string | Methodology version in force when the record was classified (independent of `taxonomy_version`) |
| `secondary_classifications` | array of {chapter, topic, subtopic, role} | For multi-topic questions (§6.2) |
| `concept_key` | string, e.g. `CA2013:s149(6)|independent-director-criteria` | Normalised "what is being tested"; the basis for repeat detection |
| `applicable_syllabus` | array, e.g. ["2022-mod-dec2025"] | Which syllabus versions **this topic** belongs to (it may differ from the paper's syllabus) |
| `syllabus_status` | enum `CURRENT` / `DELETED_FROM_DEC2025` / `PARTIALLY_DELETED` / `NOT_IN_2022` / `CROSSWALKED` | Decides whether the question counts toward current priority |
| `taxonomy_version` | string | Classifications are tied to a taxonomy version |
| `classification_confidence` | enum `HIGH` / `MEDIUM` / `LOW` | §10.3 |
| `classification_reason` | string | Evidence: matched syllabus wording, provision, guideline-answer citation |
| `classified_by` | string (`human:<id>` / `model:<id>`) | Accountability |

### 5.4 Repeats and verification

| Field | Type | Why it exists |
|---|---|---|
| `repeat_status` | enum `FIRST_SEEN` / `EXACT_REPEAT` / `CONCEPTUAL_REPEAT` / `TOPIC_REPEAT` / `CHAPTER_REPEAT` / `UNRESOLVED` | §7. The strongest relation to any **earlier** question |
| `related_question_ids` | array of {question_id, relation} | The evidence behind `repeat_status` |
| `repeat_confidence` | enum HIGH/MEDIUM/LOW | Repeat claims are often uncertain |
| `verification_status` | enum (§10.1) | Workflow state |
| `uncertainty_flags` | array of codes (§11) | Machine-readable reasons for review |
| `reviewed_by`, `reviewed_at` | string, datetime | Audit trail |
| `notes` | string | Free text, including `REQUIRES_VERIFICATION: …` explanations |

**Paper-level record** (`papers.jsonl`): `paper_code`, attempt, syllabus, URL, sha256, page count, `total_questions_printed`, `max_marks_printed`, `exam_date`, `guideline_answer_url`, extraction status. This is what lets us run the completeness checks in §10.2.

---

## 6. Topic classification hierarchy

`Subject → Chapter → Topic → Subtopic` is a **controlled taxonomy** stored in `taxonomy/` with versions (e.g. `taxonomy_v0.1`). Classifiers may only choose existing IDs. Adding a node requires a logged taxonomy change.

### 6.1 Level definitions

- **Subject** = one official paper (P1–P7).
- **Chapter** = **one official lesson** as numbered in the ICSI Syllabus 2022 detailed contents [S1], checked against the current study-material table of contents. Deleted lessons stay in the taxonomy with a status, so older questions can still be classified. Chapters are never invented.
- **Topic** = **one item in the official syllabus bullet list for that lesson** (the "l"-separated items in S1; for deleted lessons, S1-ORIG). Example: CLP.L14 Directors has its listed items as topics. If one syllabus bullet covers clearly separate study-material sections, it is split only with a logged taxonomy change that cites the study-material headings.
- **IDs:** `<SUBJ>.L<nn>.T<nn>.S<nn>`, with `nn` = syllabus lesson number and the order of the bullet / subtopic. IDs never change. Deleted nodes keep their IDs. New nodes take the next free number.
- **Moved-topic rule (canonical; approved by the owner 2026-10-07):** when a syllabus modification moves a topic between lessons (e.g. CLP CSR Committee / Policy / Activities, L17 → L18, effective Dec 2025):
  1. Exactly **one canonical node** exists, at the **current** location, and it is used for **all** attempts. Its `syllabus_version` lists every version in which the concept was examinable. Its `lesson_by_syllabus_version` maps each version to the lesson it sat in (e.g. `{"2022-original": "CLP.L17", "2022-mod-dec2025": "CLP.L18"}`), and `historical_locations` names the old node.
  2. The old node is kept as an **alias**: `classification_use = ALIAS_ONLY`, `classify_to = <canonical>`, status `DELETED_FROM_DEC2025`. Records are never classified to an alias.
  3. Each question record keeps **both** `canonical_taxonomy_location` and `historical_lesson_at_exam_time` (plus `historical_node_at_exam_time` where applicable, §5.3). The historical value is never rewritten into the current one.
  4. Duplicate nodes are never created just because a lesson number changed.
- **Taxonomy corrections:** a node found to be misplaced is not deleted. It is marked `node_lifecycle = DEPRECATED`, made an alias (`classify_to` the corrected node), and its ID is never reused.
- **Analytics eligibility (on every node):** `historical_analytics_eligible` is true for ACTIVE, non-alias, non-control nodes, **including deleted content**. `current_priority_eligible` additionally requires status `CURRENT` (or a `PARTIALLY_DELETED` chapter). Deleted topics (e.g. CLP Oppression and Mismanagement) therefore stay available for historical analysis but are excluded from current priority.
- **Entity-type context rule:** when a special company form without its own node (e.g. Section 8, producer company) appears only as context for a rule that has a functional node (e.g. proxy restriction, minimum number of directors), classify to the functional node. Only concept-level questions about the entity itself go to the control node.
- **Subtopics** must record `basis` = `study_material_heading` (with M2 page) or `statutory_provision` (with section and Act). Subtopics exist only where they separate concepts that examiners actually test differently; explanatory headings, specimen resolutions, round-ups, glossaries and case-law lists never become subtopics.
- **Control node** `<SUBJ>.UNMAPPED`, status **`OUT_OF_TAXONOMY_REVIEW`**, holds out-of-taxonomy questions (rule 7). Every record placed there needs human review, and the node is **excluded from frequency, marks-weight, priority and ranking analytics**. Concepts are never forced into a nearby topic just to empty it. Placed records are reported separately as an "unmapped" count.
- **Page convention:** syllabus pages are cited by PDF page index (printed page also recorded). Study-material pages are cited by **printed** page, because the contents pages and students use those. The PDF page is also recorded.
- **Subtopic** = a **study-material sub-heading** under that topic, or, in legal papers, a **specific provision or rule** (e.g. "s.164 disqualifications"). Subtopics are added *as questions need them*, each with a citation (study-material page or section). We do not pre-build an exhaustive subtopic tree.

The illustrative example in the brief (CLP → Directors → Appointment → Eligibility) **will be checked** against S1 and M2 before it is adopted.

### 6.2 Multi-topic, integrated and case-study questions

1. **Classify the atomic unit, not the whole question.** Most multi-topic content splits naturally into sub-parts.
2. When one atomic unit still covers several topics:
   - **Primary** = the topic whose provisions or skills are needed for most of the marks (use the guideline-answer structure as evidence).
   - **Secondary** = any other topic the answer materially relies on. Record each with a role: `co-tested`, `context-only` or `cross-chapter`.
   - Default metrics credit marks **only to the primary** classification (no double counting). A separate "touch count" metric counts appearances of secondaries without marks.
   - If no topic clearly dominates (roughly 50/50), set the primary to the topic first addressed in the guideline answer, set confidence to **MEDIUM or lower**, and add flag `MULTI_TOPIC`. This always requires human review.
3. **Case studies:** the shared facts are stored once (`case_context_id`). Each sub-question is classified on its own. The case itself is never given a topic. `question_type = case_based` for each sub-question.
4. **Numerical questions** (CAFM, TLP): classify by the **computation or skill tested** (e.g. "Capital Gains – computation of LTCG"), not by the story in the question. Every required working step that carries separate marks gets its own sub-record if marks are printed. If marks are not printed, list the step concepts as secondaries.
5. **Answers spanning several chapters:** apply rule 2. Use the `cross-chapter` role. A question is never labelled "chapter repeat" for a chapter that appears only as a secondary.
6. **Ambiguous mapping:** choose the best primary, set confidence LOW, write the competing candidates in `classification_reason`, add flag `AMBIGUOUS_TOPIC`, and send it to mandatory review. Never pick silently.
7. **Questions on deleted or out-of-syllabus content:** classify them into the deleted node (status `DELETED_FROM_DEC2025`) or into `P?.UNMAPPED` with flag `OUT_OF_TAXONOMY`. Do not force them into a current node.

### 6.3 Classification evidence order

1. The provision named in the question.
2. The provisions cited in the official guideline answer.
3. A wording match to the syllabus bullet.
4. A match to a study-material heading.

The reason field must state which of these was used.

### 6.4 `question_type` vocabulary

`mcq` (OMR) · `descriptive_theory` (explain/discuss/distinguish) · `short_note` · `comment_true_false` (comment on a statement with reasons) · `practical_application` (facts plus "advise / is it valid") · `case_based` (sub-question within a case study) · `numerical` (computation) · `drafting` (draft a resolution, notice or report). A question has one type, and the case context does not determine it: a case-study sub-question asking for a computation is `case_based` with `task_verb = compute`.

---

### 6.5 Versioning

- `methodology_version` and `taxonomy_version` are **independent**. A methodology change does not create a taxonomy version, and vice versa.
- A taxonomy version changes only when nodes or node attributes change. Each version is an immutable file (`taxonomy/<subj>_taxonomy_vX.Y.json/.csv`) with a changelog in its `meta`. Earlier versions are kept unchanged.
- Each classification record stores both versions. Re-classification under a new taxonomy version produces new records; it never edits old ones.

---

## 7. Repeat definitions

Every repeat judgement compares a question with **earlier** questions in the **same subject**, using `concept_key` and the taxonomy. We assign the **strongest** relation that applies.

| Level | Rule (all conditions must hold) | Example pattern |
|---|---|---|
| **Exact repeat** | (a) same `concept_key`; (b) same `task_verb`; (c) substantially the same statement or facts: the same proposition to comment on, or the same fact pattern with only names or figures changed; (d) the governing law has **not** changed substantively in between | "Comment: a private company may accept deposits from members without limit" asked again in the same form |
| **Conceptual repeat** | (a) same `concept_key` (same provision **and** same legal rule or computation being tested); (b) different wording, facts, format or task verb | Same s.149(6) independence criteria, once as theory and once as a case application |
| **Topic repeat** | Same `topic` ID, **different** `concept_key` | Directors → Appointment: one question on eligibility, another on retirement by rotation |
| **Chapter repeat** | Same `chapter`, **different** topic | Directors lesson: one question on appointment, another on removal |

**Hard rules:**
1. **Text similarity alone never makes a repeat.** Similarity scores (e.g. embeddings) only *suggest* candidate pairs. A human or a documented rule confirms that the concept keys match.
2. **Same chapter alone is never called a "repeated question".** On the website, only Exact and Conceptual repeats may be called "repeated questions". Topic and Chapter repeats are shown as "topic recurrence" and "chapter recurrence".
3. **Law change:** if the provision changed substantively between the two questions (e.g. IPC→BNS, IT Act 1961→2025, a SEBI regulation replaced), the relation is downgraded to *conceptual* at most and flagged `LAW_CHANGED`. The link is created through a `concept_crosswalk` table, never by matching section numbers.
4. **Cross-syllabus repeats** (2017 to 2022) are recorded but marked `cross_syllabus = true`. They are kept out of Tier-A repeat counts unless §9.5 applies.
5. Exact and Conceptual repeat claims with confidence below HIGH require human verification before they are published.

---

## 8. Analytics methodology

Definitions apply **per subject**, inside a declared **analysis window W** (default: all Tier-A attempts in which that paper was examined; currently 6). Every metric is shown with its window and its raw counts.

| Metric | Definition | Notes |
|---|---|---|
| **Frequency (questions)** | Number of atomic records whose primary topic is X | Also reported as distinct parent questions, so long split questions are not inflated |
| **Attempt coverage** | k / N = attempts in W with ≥1 primary record on X, out of attempts in W | Main headline figure ("5 of 6 attempts") |
| **Marks weight** | Sum of `marks` on primary records for X, **compulsory units only** | Alternatives in a choice group are reported separately as "optional exposure". Records with null marks are excluded **and the count of excluded records is shown** |
| **Marks share** | Marks weight ÷ (100 × N) | Percentage of the paper's total marks over W, rounded to whole numbers |
| **Average marks** | Marks weight ÷ number of attempts in which X appeared | Also show the min–max range |
| **Recency** | Most recent attempt containing X; attempts since last seen (0 = latest attempt) | |
| **Consecutive appearance** | Longest run of consecutive attempts containing X, and whether it is currently on a run | Consecutive is counted in the paper's own attempt sequence (June 2020 did not exist and does not break a run) |
| **Question-type distribution** | Count and marks per `question_type` for X | |
| **Repeat frequency** | Number of concept clusters under X that appear in ≥2 attempts (Exact or Conceptual), and the largest cluster size | Concept-level evidence, separate from topic recurrence |
| **Touch count** | Attempts in which X appears as a secondary | Shown separately, never added to marks |
| **Data completeness** | Share of W's papers fully VERIFIED | Every analytics view displays this |

**Honesty rules:**
- With N = 6, fractions are coarse. Show "4 of 6", not "66.67%".
- No probabilities, confidence intervals or "chance of appearing" are shown.
- Tier B and Tier C metrics are computed and displayed **separately**, with labels saying so.
- Only nodes with `historical_analytics_eligible = true` enter metrics, aggregated on `canonical_taxonomy_location`. Priority labels (§9) use only `current_priority_eligible` nodes. Records on the control node are counted only in the "unmapped" figure.

---

## 9. Study-priority methodology

### 9.1 Principle

The priority label summarises **historical evidence only**, using a small set of **published thresholds** (rules), not a weighted decimal score. Any student must be able to reproduce the label from the numbers shown.

### 9.2 Evidence points (computed per topic, within the subject, over the Tier-A window)

| Signal | 0 pts | 1 pt | 2 pts |
|---|---|---|---|
| **Coverage** (k/N) | appeared in < ⅓ of attempts | ⅓ to < ⅔ | ≥ ⅔ |
| **Marks weight** (rank within subject) | bottom half of topics | top half | top quartile |
| **Recency** | not seen in the last 3 attempts | seen in the last 3 attempts but not in the latest attempt | seen in the latest attempt |
| **Concept repetition** | none | ≥1 concept cluster repeated across ≥2 attempts | — |

Maximum = 7 points.

### 9.3 Labels

- **HIGH:** ≥ 5 points **and** coverage ≥ ⅔.
- **MEDIUM:** 3–4 points, or ≥ 5 points with coverage < ⅔.
- **LOW:** ≤ 2 points.
- **INSUFFICIENT HISTORY:** the topic is new or substantially changed (e.g. modified in Dec 2025, new law regime) and has fewer than 3 eligible attempts. **Never labelled LOW just for lacking data.**
- **NOT EXAMINABLE:** deleted from the current syllabus. Shown greyed out, with history only.

Thresholds are **v0.1 and provisional**. They will be tuned once on the pilot data (Phase 1), then frozen and versioned. They must not be re-tuned to make particular topics come out HIGH.

### 9.4 Required explanation (generated from the data, shown on click)

> **HIGH PRIORITY.** Appeared in **5 of the last 6 attempts** (Dec 2023 – Jun 2026), carrying **31 marks** in total (avg 6, range 4–10). Last asked **Jun 2026**. The same concept (*s.149(6) independence criteria*) was asked in **3** attempts. *Based on 6 attempts of Syllabus 2022; 100% of papers verified. Historical pattern only; not a prediction.*

### 9.5 Use of Tier B history

Tier B (2017 crosswalked) can **only raise a MEDIUM to HIGH**, and only when the topic has crosswalk confidence HIGH **and** Tier-B coverage ≥ ⅔. When this happens, the explanation must say so ("also appeared in 6 of 8 attempts under Syllabus 2017"). Tier B can never lower a label. Tier C (OMR) never affects labels.

### 9.6 What we do not show

No decimal scores, no percentages beyond whole numbers, no "probability", and no "expected in next exam". Every label displays the window size and the data completeness.

---

## 10. Quality-control methodology

### 10.1 Workflow states (`verification_status`)

`EXTRACTED` → `AUTO_CHECKED` → `CLASSIFIED` → `NEEDS_REVIEW` / `REVIEWED` → `VERIFIED` → `APPROVED` (included in a release). Side states: `REJECTED` (with a reason; **never deleted**) and `ON_HOLD` (waiting on an external fact).

### 10.2 Automatic checks (paper level, before classification)

- The number of top-level questions extracted equals the printed "Total number of questions".
- Compulsory marks add up to the printed "Maximum marks" (100). Each choice group counts once.
- Part I and Part II marks match the syllabus split. Any mismatch is flagged, not fixed.
- Every record has `source_url`, `source_file_sha256` and `source_page`, and its `question_number` exists in the paper.
- No two records share an ID. The EN and EH versions are not both counted.
- Text-quality heuristics (garbled characters, broken tables, missing ₹ symbols) set `text_quality`.

### 10.3 Confidence levels

- **HIGH:** the question names the provision or topic, and/or the guideline answer cites it, and it maps to exactly one taxonomy node.
- **MEDIUM:** the mapping is inferred from the subject matter, with one plausible alternative, or the unit covers several topics with a clear primary.
- **LOW:** several plausible nodes, the unit covers several topics without a clear primary, the text is degraded, or the taxonomy fit is poor.

### 10.4 Mandatory human verification

Human review is required when **any** of these apply:
- confidence LOW or MEDIUM;
- flag `MULTI_TOPIC`, `AMBIGUOUS_TOPIC`, `OUT_OF_TAXONOMY`;
- the question falls in a syllabus-transition window (Dec 2023 – Dec 2024 dual syllabus, or the Dec 2025 modification) or is classified into a † node;
- marks are missing, unclear or inconsistent (`MARKS_UNCLEAR`);
- `text_quality` ≠ CLEAN, or the text came from OCR;
- sub-question structure is ambiguous (`STRUCTURE_UNCLEAR`), e.g. a case study spanning several pages;
- the question has an Exact or Conceptual repeat claim, or any repeat claim with confidence below HIGH;
- `LAW_CHANGED` or any cross-syllabus link.

Beyond these, a **random 15% sample of HIGH-confidence records** in each paper is reviewed. If that sample's error rate exceeds 5%, the whole paper is re-reviewed.

### 10.5 Integrity

- Raw PDFs are **immutable**: stored once, with SHA-256 recorded and never edited.
- Each stage writes a new file version; it never overwrites the previous stage.
- Releases (`approved/`) are versioned snapshots with a changelog. The website reads only approved releases.
- Ambiguous or rejected records are **kept** with their flags. A dataset is never "cleaned" by deleting difficult records.

---

## 11. Uncertainty rules and prohibitions

### 11.1 Claude must NOT

- invent questions, marks, dates, syllabus content or URLs;
- assume a classification without evidence, or omit the reason;
- treat a third-party site as authoritative when ICSI publishes the information;
- mix syllabi without the tier and crosswalk rules above;
- claim or imply that a topic is likely to appear in the next exam;
- treat similar wording as proof of the same concept;
- delete or hide ambiguous data to make the dataset look cleaner;
- resolve uncertainty quietly, including by "fixing" totals that do not add up;
- paraphrase question text in the `question_text` field.

### 11.2 Uncertainty protocol

When a fact cannot be confirmed from an official source:
1. Write `REQUIRES_VERIFICATION` in the relevant field or notes, with **why** and **what source would settle it**.
2. Add the matching `uncertainty_flags` code: `MARKS_UNCLEAR`, `STRUCTURE_UNCLEAR`, `TEXT_CORRUPTED`, `AMBIGUOUS_TOPIC`, `MULTI_TOPIC`, `OUT_OF_TAXONOMY`, `SYLLABUS_TRANSITION`, `LAW_CHANGED`, `REPEAT_UNCERTAIN`, `SOURCE_UNVERIFIED`.
3. Leave the value null instead of guessing.
4. The record cannot reach `VERIFIED` until a reviewer clears the flag and records how it was resolved.

### 11.3 Open `REQUIRES_VERIFICATION` items from Phase 0

1. The ICSI notice that extended the last Syllabus 2017 Executive attempt from June 2024 to Dec 2024. The fact itself is supported by archive papers and guideline answers.
2. Why there was no June 2020 session (presumably COVID-19); no ICSI notice located.
3. The exact first attempt of Syllabus 2017 at the Executive level (archive evidence points to Dec 2018).
4. Exactly when each of 424, 425 and 428 switched to OMR. Confirmed so far: 425-A Dec 2019; 428 June 2021; 424 June 2022. 424 was descriptive in June 2019.
5. Syllabus 2022 lesson numbering versus the current study-material numbering (§3 caveat). **Resolved for P2 (Phase 1A).** Still open for P1, P3–P7.
6. Whether the four Labour Codes are examinable in SBILL Part II, and from which attempt.
7. Exam format of every 2022 paper (only 522, 524 and 527 from Dec 2025 were checked).
8. Meaning of the paper footer code (e.g. "2/2025/CLP"). It looks like session/year/paper, but this is unconfirmed and must not be used as a data source.

---

## 12. Folder structure (adopted in Phase 1A, 2026-10-07)

```
CS_Executive_PYQ_Analysis/
├── PROJECT_METHODOLOGY.md
├── SOURCE_REGISTRY.md
├── 00_Instructions/           # phase briefs, reviewer guide
├── 01_Source_Papers/          # IMMUTABLE downloads + manifest.csv (url, sha256, date)
│   ├── official_reference/    # syllabus, notices, study material, supplements (Phase 1A)
│   └── (question_papers/, guideline_answers/ — Phase 1B onwards)
├── 02_Raw_Extraction/         # page-wise text/OCR and EXTRACTED records (jsonl)
├── 03_Classified_Questions/   # CLASSIFIED records, per taxonomy version
├── 04_Verification/           # review queues, reviewer decisions, QC reports
├── 05_Approved_Dataset/       # versioned releases: release_YYYYMMDD/
├── 06_Analytics/              # computed metrics per release (never hand-edited)
├── 07_Website/                # website-ready JSON/CSV
├── taxonomy/                  # <subj>_taxonomy_vX.Y.{json,csv}, crosswalks
├── reports/                   # human-readable reviews and analyses
└── scripts/                   # builders, downloaders, extractors, checkers
```

This replaces the v0.1 proposal, mapping each old folder to its new one: `sources/` → `01_Source_Papers/`, `extracted_text/` + `data/raw_questions/` → `02_Raw_Extraction/`, `data/classified/` → `03_…`, `data/verification/` → `04_…`, `data/approved/` → `05_…`, `analytics/` → `06_…`, `web_export/` → `07_Website/`, `docs/` → `00_Instructions/`.

**Housekeeping:** this folder sits inside a git repository whose root is the user's home directory (`/Users/darkangel`). Before Phase 1, I recommend a separate `git init` in this project folder (the owner's decision; nothing has been committed). Large PDFs should probably stay out of git, with `01_Source_Papers/manifest.csv` plus hashes kept under version control instead.

---

## 13. Proposed Phase 1 workflow

**Goal:** build a verified pilot on Tier A for one subject, and prove the method works before scaling.

1. **Set up:** create the folder structure. Write `sources/manifest.csv`. Write a downloader that saves each file into its own directory, records SHA-256, and handles the API-based archive.
2. **Taxonomy for each paper:** chapters and topics from S1 (and S1-ORIG for deleted content), checked against that paper's study-material contents, with a limited set of evidence-based subtopics. **P2 done as v0.1 in Phase 1A** (`taxonomy/clp_taxonomy_v0.1.*`, `reports/CLP_TAXONOMY_REVIEW.md`), awaiting human review. Other papers follow the same procedure before their papers are analysed.
3. **Acquire Tier-A sources:** download all 2022 papers for Dec 2023 → June 2026 (6 attempts × 7 papers, plus EH versions for cross-checking), the matching guideline answers, the Dec 2025 / June 2026 supplements, and the timetables (for `examination_date`).
4. **Pilot:** extract one subject across all 6 attempts. **Recommended: P2 Company Law & Practice (522).** It is legal and descriptive, has case studies, sub-parts and marks breakdowns, and the Dec 2025 modifications affect it, so it exercises most of the rules. Run the automatic checks in §10.2.
5. **Pilot classification and review:** classify with evidence, have a human review 100% of the pilot, and measure disagreement. Revise the classification rules, repeat rules and thresholds **once**, then freeze them as methodology v1.0.
6. **Pilot analytics:** compute the §8 metrics and the §9 labels for P2, and generate the explanation text. The owner reviews whether the labels and explanations are fair and understandable.
7. **Scale** to the other six papers with the frozen rules. CAFM and TLP (numerical) get an extra mini-pilot first.
8. **Later (Phase 2):** Tier B crosswalk (2017 descriptive papers, June 2019 → Dec 2024) and Tier C OMR analysis. Prepare the concept crosswalk for the Income-tax Act 2025 before the June 2027 papers arrive.

**Exit criteria for Phase 1:** the P2 pilot is 100% VERIFIED; all automatic checks pass or every exception is explained; taxonomy v1.0 and methodology v1.0 are frozen; and the open items in §11.3 are resolved or explicitly deferred.

---

## Changelog

| Version | Date | Changes |
|---|---|---|
| 0.1 | 2026-10-07 | Phase 0: initial methodology |
| 0.2 | 2026-10-07 | Phase 1A (CLP taxonomy): §2 S1-ORIG (archived ICSI file) admitted as the historical syllabus authority; §3 lesson-numbering caveat resolved for P2 (syllabus vs study-material renumbering; canonical = syllabus); §5.3 taxonomy ID format `CLP.Lnn…` and new field `syllabus_location_at_exam`; §6.1 rules for IDs, relocated topics (canonical + alias), subtopic basis, control node, page convention; §11.3 item 5 marked resolved for P2; §12 folder structure updated to the adopted layout; §13 step 2 updated. No other sections changed |
| 0.3 | 2026-10-07 | Phase 1A close-out. §5.3: replaced `syllabus_location_at_exam` with `canonical_taxonomy_location`, `historical_lesson_at_exam_time` and `historical_node_at_exam_time`; added `methodology_version`. §6.1: formal moved-topic rule (owner-approved), taxonomy-correction (deprecation) rule, analytics-eligibility flags, entity-type context rule; control node status `OUT_OF_TAXONOMY_REVIEW`, excluded from all analytics. New §6.5 versioning (methodology and taxonomy versions independent). §8 honesty rules: eligibility-based aggregation. No other sections changed. Taxonomy for CLP moved to v0.2 separately |
