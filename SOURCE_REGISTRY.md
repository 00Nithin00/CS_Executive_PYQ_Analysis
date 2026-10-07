# SOURCE_REGISTRY — CS Executive PYQ Intelligence Project

**Registry version:** 0.2
**All URLs verified:** 2026-10-07 (by fetching each page or file directly)
**Scope:** Official ICSI sources only. Third-party sites appear only in §7, where they are listed as **non-authoritative** and the claims they made were cross-checked.

---

## 0. Read this first: how the ICSI website is built (as of 2026-10-07)

1. **www.icsi.edu is a JavaScript single-page app.** If you fetch an HTML page directly, you get an empty shell. Page content comes from a JSON API on the same site:
   - `https://www.icsi.edu/api/resolve/?path=<page-path>` returns a page's content blocks, including document links.
   - `https://www.icsi.edu/api/question-papers/` lists the sessions in the question-paper archive.
   - `https://www.icsi.edu/api/question-papers/<slug>/` (e.g. `december-2025`) lists the papers for one session, with subject codes and PDF URLs.
   - `https://www.icsi.edu/api/home/latest-updates/` returns the "Latest Update" feed.
   These are **undocumented internal endpoints**. We use them to *find* documents. They are not citation targets. Always cite the human-facing page plus the PDF URL.
2. **Official PDFs are stored on ICSI's object store and CDN**, linked from icsi.edu pages:
   - `https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/...`
   - `https://icsi-static.b-cdn.net/icsi-prod/media/...`
   A PDF on these hosts counts as authoritative **only when an icsi.edu page links to it**. Every entry below records the page that links to it.
3. **Legacy URLs are broken.** Old links of the form `https://www.icsi.edu/media/webmodules/...` now return **HTTP 404**. Examples: `Announcement_01092025.pdf`, `ICSI_Syllabus_2022.pdf`, `DAR/Study_Material_applicable_for_June_2026_Examination.pdf`. Official documents still cite some of these URLs, and search engines still show them. Do not use them. Use the current links below.
4. **URLs can change without notice.** Keep a SHA-256 hash of every downloaded file (see methodology §10) so a document can still be identified if its URL moves.

---

## 1. Core navigation pages (www.icsi.edu)

| # | Source name | URL | Purpose | Information provided | Verified |
|---|---|---|---|---|---|
| N1 | ICSI home | https://www.icsi.edu/ | Root | Navigation; "Latest Update" feed | 2026-10-07 |
| N2 | Academic Portal | https://www.icsi.edu/academic-portal | Hub for academic resources | Links to New Syllabus 2022, study material, supplements, guideline answers, communications, monthly updates | 2026-10-07 |
| N3 | New Syllabus 2022 | https://www.icsi.edu/new-syllabus-2022 | Syllabus hub | Syllabus PDF, Dec 2025 modification announcement, Academic Committee report, new-elective notices | 2026-10-07 (page updated 2026-09-24) |
| N4 | Executive Programme study material | https://www.icsi.edu/executive-programme | Current study material | PDF for each of the 7 papers, including a separate Tax Laws book for June 2027 onwards | 2026-10-07 (page updated 2026-09-09) |
| N5 | Supplements | https://www.icsi.edu/supplements | Amendment supplements | Supplements for each paper and attempt (Dec 2026, June 2026, Dec 2025, …) | 2026-10-07 (page updated 2026-09-22) |
| N6 | Relevant Material for Dec 2026 Examination | https://www.icsi.edu/relevant-material | Which material applies to which attempt | Study-material applicability notice; Finance Act applicability | 2026-10-07 |
| N7 | Communication to Students | https://www.icsi.edu/communication-to-students | Academic notices | Law-applicability notices (Income-tax Act 2025, Finance Act, new criminal laws), corrigenda | 2026-10-07 |
| N8 | Guideline Answers | https://www.icsi.edu/guideline-answers | Official suggested answers (ICSI calls them "Guideline Answers") | Executive guideline answers by session, June 2015 to June 2026 (see §5) | 2026-10-07 (page updated 2026-09-11) |
| N9 | Previous Sessions QPs | https://www.icsi.edu/examination/previous-sessions-qps | Official question-paper archive | 34 sessions, June 2009 to June 2026. The page body has placeholders; the paper list is loaded from `/api/question-papers/` | 2026-10-07 |
| N10 | CS Executive & Professional (Examination) | https://www.icsi.edu/examination/cs-executive-professional | Exam notices | Timetables, results, exam-mode notices | 2026-10-07 (page updated 2026-09-16) |
| N11 | Subject-wise Monthly Updates | https://www.icsi.edu/subjectwise-monthly-updates | Monthly regulatory updates | Context for law changes (not yet reviewed in detail) | Link seen on N2, not opened |

---

## 2. Syllabus and structure documents

| # | Source name | URL | Linked from | Purpose | Information provided | Verified |
|---|---|---|---|---|---|---|
| S1 | ICSI New Syllabus 2022 (full, 69 pp.; file last modified 2025-12-27) | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/cms_uploads/icsi-new-syllabus-2022-9a82f048.pdf | N3 | **Main syllabus authority** | 7-paper Executive structure, Part-wise marks, detailed lesson contents including Dec 2025 deletions (footnotes), effective dates (§F), 2017→2022 paper-exemption mapping (§G), last attempts under 2017 (§H), cut-off dates for law changes (§D) | 2026-10-07 |
| S2 | Announcement: modifications to Executive Syllabus 2022, effective Dec 2025 | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/cms_uploads/announcement-01092025-9cbac745.pdf | N3 | Records a syllabus change inside Syllabus 2022 | Council approved changes to JIGL (P1), CLP (P2) and ECIPL (P6), effective from the **December 2025** exam. Points to a legacy URL that now returns 404; the modified syllabus is S1 | 2026-10-07 |
| S3 | Report of the Academic Committee on Syllabus 2022 | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/cms_uploads/report-of-the-academic-committee-on-syllabus-2022-cc85c376.pdf | N3 | Background reasoning for the syllabus | Not yet reviewed | Link seen, not opened |
| S4 | Attention to examinees: Executive Programme (Syllabus 2017) | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/cms_uploads/attention-examinees-appearing-execprogexam-newsyllabus-17.pdf | N10 | 2017 exam modes | 2017 paper list; **OMR (100 one-mark MCQs)** for Tax Laws, Corporate & Management Accounting, and Financial & Strategic Management; all other papers descriptive | 2026-10-07 |
| S1-ORIG | ICSI New Syllabus 2022, **pre-modification version** (67 pp.; PDF created 2025-04-16) | http://web.archive.org/web/20260327142614id_/https://www.icsi.edu/media/webmodules/ICSI%20New%20Syllabus%202022.pdf (original ICSI URL `https://www.icsi.edu/media/webmodules/ICSI%20New%20Syllabus%202022.pdf` now returns 404) | Formerly linked from the ICSI syllabus page | **Historical syllabus authority** for Dec 2023 – Jun 2025 | Full topic lists of lessons later deleted (e.g. CLP L12 Inspection, Inquiry & Investigation; L17 CSR). An ICSI-authored file retrieved from the Internet Archive; SHA-256 in `01_Source_Papers/manifest.csv`. Whether this April 2025 build matches the version in force for Dec 2023 is `REQUIRES_VERIFICATION` (no other modification notice found) | 2026-10-07 |
| S1-ORIG-2022 | Earlier Internet Archive capture (2022-09-28) of the same URL | http://web.archive.org/web/20220928034424id_/https://www.icsi.edu/media/webmodules/ICSI%20New%20Syllabus%202022.pdf | — | Would show the as-launched 2022 syllabus | **Capture is truncated or corrupt (1 MB, unreadable)**; not usable | 2026-10-07 |
| S5 | Introduction of new elective (IFSCA), Professional only | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/cms_uploads/introduction-of-new-elective-paper-announcement-a8b5f6c7.pdf | N3 | Context only (Professional Programme) | Not relevant to Executive analysis | 2026-10-07 |

---

## 3. Study material and supplements (current versions)

| # | Source name | URL | Linked from | Information provided | Verified |
|---|---|---|---|---|---|
| M0 | Study Material Applicable for December 2026 Examination (dated 28.07.2026) | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/cms_uploads/study-material-applicable-for-dec-2026-examination-188aa857.pdf | N1, N6 | **Version notice.** Executive P1–P6 study material is "updated till 30 Nov 2025"; P7 Tax Laws is "updated till 31 May 2025" | 2026-10-07 |
| M1 | P1 Jurisprudence, Interpretation & General Laws | https://icsi-static.b-cdn.net/icsi-prod/media/cms_uploads/jigl7454845410012025-a99d4cae.pdf | N4 | Study material | 2026-10-07 (link) |
| M2 | P2 Company Law & Practice | https://icsi-static.b-cdn.net/icsi-prod/media/cms_uploads/company-law-practices-3e591a57.pdf | N4 | Study material | 2026-10-07 (link) |
| M3 | P3 Setting Up of Business, Industrial & Labour Laws | https://icsi-static.b-cdn.net/icsi-prod/media/cms_uploads/sbill-10012025545454-13500dd6.pdf | N4 | Study material | 2026-10-07 (link) |
| M4 | P4 Corporate Accounting & Financial Management | https://icsi-static.b-cdn.net/icsi-prod/media/cms_uploads/cafm1001202455454-5e6f27c6.pdf | N4 | Study material | 2026-10-07 (link) |
| M5 | P5 Capital Market & Securities Laws | https://icsi-static.b-cdn.net/icsi-prod/media/cms_uploads/cmslbook100120254574154-e1147f86.pdf | N4 | Study material | 2026-10-07 (link) |
| M6 | P6 Economic, Commercial & Intellectual Property Laws | https://icsi-static.b-cdn.net/icsi-prod/media/cms_uploads/ecipl-study-material-5d2e05ce.pdf | N4 | Study material | 2026-10-07 (link) |
| M7 | P7 Tax Laws and Practice (current) | https://icsi-static.b-cdn.net/icsi-prod/media/cms_uploads/final-book-tax-laws-practice-249189b8.pdf | N4 | Study material, Income-tax Act 1961 regime | 2026-10-07 (link) |
| M7b | P7 Tax Laws and Practice, **for June 2027 exam onwards** | https://icsi-static.b-cdn.net/icsi-prod/media/cms_uploads/final-book-tax-law-practice-27-7-2026-131c7ff9.pdf | N4 | Study material, Income-tax Act 2025 regime | 2026-10-07 (link) |

The filenames suggest the edition dates of M1–M6 (e.g. "10012025"), but they are **not reliable**. M0 is the authority on which version applies to which attempt. The edition statement inside each book must be recorded when the book is downloaded (`REQUIRES_VERIFICATION`).

**Supplements for the Dec 2026 attempt** (all linked from N5, dated 10-09-2026):

| Paper | URL |
|---|---|
| P1 JIGL | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/cms_uploads/jigl-supplement-dec2026-3ae5462d.pdf |
| P2 CLP | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/cms_uploads/company-law-and-practice-01-dec-25-to-31-may-2026-dec-2026-attempt-e7da07f8.pdf |
| P3 SBILL | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/cms_uploads/sbill-01-dec-25-to-31-may-2026-dec-2026-attempt-701397df.pdf |
| P4 CAFM | *No Dec 2026 supplement listed* (June 2026 CAFM supplement: https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/cms_uploads/cafm-supplements-4-48ed3d0e.pdf) |
| P5 CMSL | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/cms_uploads/supplements-cmsl-december-2026-ddda10c6.pdf |
| P6 ECIPL | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/cms_uploads/ecipl-supplement-december-2026-e205b534.pdf |
| P7 TLP Part I (Direct Tax) | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/cms_uploads/supplement-tax-laws-practice-direct-tax-june-01-2025-to-may-31-2026-b09d4ac3.pdf |
| P7 TLP Part II (GST & Customs) | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/cms_uploads/tax-laws-and-practice-indirect-tax-part-ii-december-2026-7592555e.pdf |

**Local copies (Phase 1A).** S1, S1-ORIG, S2, M0, M2 and the Dec 2026 CLP supplement are stored under `01_Source_Papers/official_reference/`, with SHA-256 hashes in `01_Source_Papers/manifest.csv`. ICSI's uploaded filenames end in the first 8 hex characters of the file's SHA-256 (e.g. `…-9a82f048.pdf`, `…-3e591a57.pdf`), which gives a free integrity check.

**Numbering warning:** M2 (Dec 2025 edition) and the supplements number CLP lessons **1–17**, while the syllabus numbers them **1–19**. See `reports/CLP_TAXONOMY_REVIEW.md` §6.

N5 also lists supplements for the June 2026 and Dec 2025 attempts. They will be added to this registry when we download them in Phase 1. They matter because each past attempt was examined on the law as amended up to that attempt's cut-off date.

---

## 4. Law-applicability notices (affect how questions from different years compare)

| # | Source name | URL | Linked from | Information provided | Verified |
|---|---|---|---|---|---|
| L1 | Applicability of Income-tax Act 2025 and Income Tax Rules 2026 from **June 2027** (dated 5 Aug 2026) | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/cms_uploads/applicability-of-new-income-tax-act-2025-from-june-2027-exam-onwards-44890531.pdf | N7 | P7 Tax will be examined under the new Act from June 2027. Section numbers will change, so concept mapping is needed | 2026-10-07 |
| L2 | Applicability of Finance Act 2025 for Dec 2026 exam (dated 29 Jun 2026) | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/cms_uploads/applicability-of-finance-act-for-dec-2026-exam.pdf | N7 | Dec 2026: Finance Act 2025 (AY 2026-27); Income-tax Act 2025 is not applicable | 2026-10-07 |
| L3 | Applicability of new criminal laws (BNS, BNSS, BSA) | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/cms_uploads/new-criminal-laws-25112024.pdf | N7 | Apply from the **June 2025** session. Affects JIGL lessons on crime/procedure and evidence | 2026-10-07 |
| L4 | Applicability of Finance Act 2025 for June 2026 exam | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/cms_uploads/applicability-of-finance-act-for-june-2026-exam.pdf | N7 | Tax-year context for June 2026 | Link seen, not opened |
| L5 | Important Information for Students (2 Aug 2024) | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/cms_uploads/important-information-for-students-29072024.pdf | N7 | Lists the legacy portal URLs (now 404). Useful only as history | 2026-10-07 |

---

## 5. Guideline Answers: Executive Programme (linked from N8)

Base URL: `https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/cms_uploads/`

| Session | Syllabus label on ICSI page | Files |
|---|---|---|
| June 2026 | Syllabus 2022 | `ep-group-1-june-2026-b4d5f0f9.pdf`, `ep-group-2-june-2026-abc21731.pdf` |
| Dec 2025 | Syllabus 2022 | `ga-g2-dec2025-ep2022-g1.pdf`, `ga-g2-dec2025-ep2022-g2.pdf` |
| June 2025 | Syllabus 2022 | `ga-g2-jun2025-ep2022-g1.pdf`, `ga-g2-jun2025-ep2022-g2.pdf` |
| Dec 2024 | Syllabus 2022 | `ga-g2-dec2024-ep2022-g1.pdf`, `ga-g2-dec2024-ep2022-g2.pdf` |
| Dec 2024 | Syllabus 2017 | `ga-g2-dec2024-ep2017-m1.pdf`, `ga-g2-dec2024-ep2017-m2.pdf` |
| June 2024 | Syllabus 2022 | `ga-g2-jun2024-ep2022-g1.pdf`, `ga-g2-jun2024-ep2022-g2.pdf` |
| June 2024 | Syllabus 2017 | `ga-g2-jun2024-ep2017-m1.pdf`, `ga-g2-jun2024-ep2017-m2.pdf` |
| Dec 2023 | Syllabus 2022 | `ga-g2-dec2023-ep2022-g1.pdf`, `ga-g2-dec2023-ep2022-g2.pdf` |
| Dec 2023 | Syllabus 2017 | `ga-g2-dec2023-ep2017-m1.pdf`, `ga-g2-dec2023-ep2017-m2.pdf` |
| June 2023 | "Executive" (= Syllabus 2017, the only syllabus examined) | `ga-g2-jun2023-ep-m1.pdf`, `ga-g2-jun2023-ep-m2.pdf` |
| Dec 2022 | "Executive" (= 2017) | `ga-g2-dec2022-ep-m1.pdf`, `ga-g2-dec2022-ep-m2.pdf` |
| June 2022 | "Executive" (= 2017) | `ga-g2-jun2022-ep-m1.pdf`, `ga-g2-jun2022-ep-m2.pdf` |
| Dec 2021 | "Executive (New Syllabus)" = 2017 | `ga-g2-dec2021-epns-m1.pdf`, `ga-g2-dec2021-epns-m2.pdf` |
| June 2021 | "Executive (New Syllabus)" = 2017 | `ga-g2-jun2021-epns-m1.pdf`, `ga-g2-jun2021-epns-m2.pdf` |
| Dec 2020 | "Executive (New Syllabus)" = 2017 | `ga-g2-dec2020-epns-m1.pdf`, `ga-g2-dec2020-epns-m2.pdf` |
| Dec 2019 | "Executive (New Syllabus)" = 2017 | `ga-g2-dec2019-epns-m1.pdf`, `ga-g2-dec2019-epns-m2.pdf` |
| June 2019 | "Executive (New Syllabus)" = 2017 | `ga-g2-jun2019-epns-m1.pdf`, `ga-g2-jun2019-epns-m2.pdf` |
| Dec 2018 | "Executive (New Syllabus)" = 2017 | `ga-g2-dec2018-epns-m1.pdf`, `ga-g2-dec2018-epns-m2.pdf` |

**Naming trap:** for **Dec 2021 and earlier**, the plain "Executive" files (`ga-g2-<sess>-ep-m1/m2.pdf`) belong to the **pre-2017 ("Old", 2012) syllabus**, not Syllabus 2017. From June 2022, plain "Executive" files are Syllabus 2017. The page also lists older Executive guideline answers back to June 2015; they are out of scope.

---

## 6. Official question papers (Previous Sessions QPs, N9)

- Archive index: `https://www.icsi.edu/api/question-papers/` (34 sessions). **There is no June 2020 session in the archive.** `REQUIRES_VERIFICATION`: commonly attributed to COVID-19 postponement, but no ICSI notice has been located yet.
- **Subject-code families:** `3xx` = Old (2012) syllabus · `42x` = Syllabus 2017 · `52x` = Syllabus 2022 · `EH` suffix = bilingual (English/Hindi) version of the same paper · `-A` suffix on 424/425/428 = OMR question booklet code A.
- **Trap:** the header text "NEW SYLLABUS" is printed on **both** 2017 papers (codes 42x) and 2022 papers (codes 52x). Never infer the syllabus from the header. Always use the subject code together with the session.

The full list of Executive paper URLs in our analysis window follows. It was generated from the archive API on 2026-10-07.

#### Syllabus 2022 (codes 521–527)

| Session | Code | Paper | URL |
|---|---|---|---|
| June 2026 | 521 | Jurisprudence, Interpretation and General Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/521_GzM1GEY.pdf |
| June 2026 | 522 | Company Law and Practice | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/522-june-2026.pdf |
| June 2026 | 523 | Setting up of Business, Industrial and Labour Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/523-june-2026.pdf |
| June 2026 | 524 | Corporate Accounting and Financial Management | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/524-june-2026.pdf |
| June 2026 | 525 | Capital Markets and Securities Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/525-june-2026.pdf |
| June 2026 | 525EH | Capital Markets and Securities Laws (EH) | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/525eh-june-2026.pdf |
| June 2026 | 526 | Economic, Commercial and Intellectual Property Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/526-june-2026.pdf |
| June 2026 | 526EH | Economic, Commercial and Intellectual Property Laws (EH) | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/526eh-june-2026.pdf |
| June 2026 | 527 | Tax Laws and Practice | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/527-june-2026.pdf |
| December 2025 | 521 | Jurisprudence, Interpretation and General Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/521-december-2025.pdf |
| December 2025 | 522 | Company Law and Practice | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/522-december-2025.pdf |
| December 2025 | 523 | Setting up of Business, Industrial and Labour Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/523-december-2025.pdf |
| December 2025 | 524 | Corporate Accounting and Financial Management | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/524-december-2025.pdf |
| December 2025 | 525 | Capital Markets and Securities Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/525-december-2025.pdf |
| December 2025 | 525EH | Capital Markets and Securities Laws (EH) | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/525eh-december-2025.pdf |
| December 2025 | 526 | Economic, Commercial and Intellectual Property Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/526-december-2025.pdf |
| December 2025 | 526EH | Economic, Commercial and Intellectual Property Laws (EH) | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/526eh-december-2025.pdf |
| December 2025 | 527 | Tax Laws and Practice | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/527-december-2025.pdf |
| June 2025 | 521 | Jurisprudence, Interpretation and General Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/521-june-2025.pdf |
| June 2025 | 522 | Company Law and Practice | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/522-june-2025.pdf |
| June 2025 | 523 | Setting up of Business, Industrial and Labour Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/523-june-2025.pdf |
| June 2025 | 524 | Corporate Accounting and Financial Management | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/524-june-2025.pdf |
| June 2025 | 525 | Capital Markets and Securities Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/525-june-2025.pdf |
| June 2025 | 525EH | Capital Markets and Securities Laws (EH) | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/525eh-june-2025.pdf |
| June 2025 | 526 | Economic, Commercial and Intellectual Property Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/526-june-2025.pdf |
| June 2025 | 526EH | Economic, Commercial and Intellectual Property Laws (EH) | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/526eh-june-2025.pdf |
| June 2025 | 527 | Tax Laws and Practice | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/527-june-2025.pdf |
| December 2024 | 521 | Jurisprudence, Interpretation and General Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/521-december-2024.pdf |
| December 2024 | 522 | Company Law and Practice | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/522-december-2024.pdf |
| December 2024 | 523 | Setting up of Business, Industrial and Labour Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/523-december-2024.pdf |
| December 2024 | 524 | Corporate Accounting and Financial Management | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/524-december-2024.pdf |
| December 2024 | 525 | Capital Markets and Securities Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/525-december-2024.pdf |
| December 2024 | 526 | Economic, Commercial and Intellectual Property Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/526-december-2024.pdf |
| December 2024 | 527 | Tax Laws and Practice | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/527-december-2024.pdf |
| June 2024 | 521 | Jurisprudence, Interpretation and General Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/521-june-2024.pdf |
| June 2024 | 522 | Company Law and Practice | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/522-june-2024.pdf |
| June 2024 | 523 | Setting up of Business, Industrial and Labour Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/523-june-2024.pdf |
| June 2024 | 524 | Corporate Accounting and Financial Management | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/524-june-2024.pdf |
| June 2024 | 525 | Capital Markets and Securities Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/525-june-2024.pdf |
| June 2024 | 526 | Economic, Commercial and Intellectual Property Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/526-june-2024.pdf |
| June 2024 | 527 | Tax Laws and Practice | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/527-june-2024.pdf |
| December 2023 | 521 | Jurisprudence, Interpretation and General Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/521-december-2023.pdf |
| December 2023 | 522 | Company Law and Practice | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/522-december-2023.pdf |
| December 2023 | 523 | Setting up of Business, Industrial and Labour Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/523-december-2023.pdf |
| December 2023 | 524 | Corporate Accounting and Financial Management | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/524-december-2023.pdf |
| December 2023 | 525 | Capital Markets and Securities Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/525-december-2023.pdf |
| December 2023 | 526 | Economic, Commercial and Intellectual Property Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/526-december-2023.pdf |
| December 2023 | 527 | Tax Laws and Practice | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/527-december-2023.pdf |

#### Syllabus 2017 (codes 421–428; "-A" = OMR booklet code A)

| Session | Code | Paper | URL |
|---|---|---|---|
| December 2024 | 421 | Jurisprudence, Interpretation and General Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/421-december-2024.pdf |
| December 2024 | 422 | Company Law | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/422-december-2024.pdf |
| December 2024 | 423 | Setting up of Business Entities and Closure | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/423-december-2024.pdf |
| December 2024 | 424-A | Tax Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/424-a-december-2024.pdf |
| December 2024 | 425-A | Corporate and Management Accounting | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/425-a-december-2024.pdf |
| December 2024 | 426 | Securities Laws and Capital Markets | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/426-december-2024.pdf |
| December 2024 | 427 | Economic, Business and Commercial Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/427-december-2024.pdf |
| December 2024 | 428-A | Financial and Strategic Management | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/428-a-december-2024.pdf |
| June 2024 | 421 | Jurisprudence, Interpretation and General Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/421-june-2024.pdf |
| June 2024 | 422 | Company Law | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/422-june-2024.pdf |
| June 2024 | 423 | Setting up of Business Entities and Closure | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/423-june-2024.pdf |
| June 2024 | 424-A | Tax Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/424-a-june-2024.pdf |
| June 2024 | 425-A | Corporate and Management Accounting | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/425-a-june-2024.pdf |
| June 2024 | 426 | Securities Laws and Capital Markets | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/426-june-2024.pdf |
| June 2024 | 427 | Economic, Business and Commercial Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/427-june-2024.pdf |
| June 2024 | 428-A | Financial and Strategic Management | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/428-a-june-2024.pdf |
| December 2023 | 421 | Jurisprudence, Interpretation and General Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/421-december-2023.pdf |
| December 2023 | 422 | Company Law | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/422-december-2023.pdf |
| December 2023 | 423 | Setting up of Business Entities and Closure | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/423-december-2023.pdf |
| December 2023 | 424-A | Tax Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/424-a-december-2023.pdf |
| December 2023 | 425-A | Corporate and Management Accounting | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/425-a-december-2023.pdf |
| December 2023 | 426 | Securities Laws and Capital Markets | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/426-december-2023.pdf |
| December 2023 | 427 | Economic, Business and Commercial Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/427-december-2023.pdf |
| December 2023 | 428-A | Financial and Strategic Management | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/428-a-december-2023.pdf |
| June 2023 | 421 | Jurisprudence, Interpretation and General Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/421-june-2023.pdf |
| June 2023 | 422 | Company Law | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/422-june-2023.pdf |
| June 2023 | 423 | Setting up of Business Entities and Closure | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/423-june-2023.pdf |
| June 2023 | 424-A | Tax Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/424-a-june-2023.pdf |
| June 2023 | 425-A | Corporate and Management Accounting | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/425-a-june-2023.pdf |
| June 2023 | 426 | Securities Laws and Capital Markets | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/426-june-2023.pdf |
| June 2023 | 427 | Economic, Business and Commercial Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/427-june-2023.pdf |
| June 2023 | 428-A | Financial and Strategic Management | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/428-a-june-2023.pdf |
| December 2022 | 421 | Jurisprudence, Interpretation and General Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/421-december-2022-ee0c7168.pdf |
| December 2022 | 422 | Company Law | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/422-december-2022-dc3beaf8.pdf |
| December 2022 | 423 | Setting up of Business Entities and Closure | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/423-december-2022-2efaaa88.pdf |
| December 2022 | 424-A | Tax Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/424-a-december-2022-a20f2e5b.pdf |
| December 2022 | 425-A | Corporate and Management Accounting | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/425-a-december-2022-36f131cf.pdf |
| December 2022 | 426 | Securities Laws and Capital Markets | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/426-december-2022-5a00d93a.pdf |
| December 2022 | 427 | Economic, Business and Commercial Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/427-december-2022-68e063e1.pdf |
| December 2022 | 428-A | Financial and Strategic Management | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/428-a-december-2022-4237a851.pdf |
| June 2022 | 421 | Jurisprudence, Interpretation and General Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/421-june-2022.pdf |
| June 2022 | 422 | Company Law | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/422-june-2022.pdf |
| June 2022 | 423 | Setting up of Business Entities and Closure | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/423-june-2022.pdf |
| June 2022 | 424 | Tax Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/424-june-2022.pdf |
| June 2022 | 425 | Corporate and Management Accounting | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/425-june-2022.pdf |
| June 2022 | 426 | Securities Laws and Capital Markets | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/426-june-2022.pdf |
| June 2022 | 427 | Economic, Business and Commercial Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/427-june-2022.pdf |
| June 2022 | 428 | Financial and Strategic Management | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/428-june-2022.pdf |
| December 2021 | 421 | Jurisprudence, Interpretation and General Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/421-december-2021.pdf |
| December 2021 | 422 | Company Law | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/422-december-2021.pdf |
| December 2021 | 423 | Setting up of Business Entities and Closure | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/423-december-2021.pdf |
| December 2021 | 424-A | Tax Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/424-a-december-2021.pdf |
| December 2021 | 425-A | Corporate and Management Accounting | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/425-a-december-2021.pdf |
| December 2021 | 426 | Securities Laws and Capital Markets | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/426-december-2021.pdf |
| December 2021 | 427 | Economic, Business and Commercial Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/427-december-2021.pdf |
| December 2021 | 428-A | Financial and Strategic Management | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/428-a-december-2021.pdf |
| June 2021 | 421 | Jurisprudence, Interpretation and General Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/421-june-2021.pdf |
| June 2021 | 422 | Company Law | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/422-june-2021.pdf |
| June 2021 | 423 | Setting up of Business Entities and Closure | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/423-june-2021.pdf |
| June 2021 | 424 | Tax Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/424-june-2021.pdf |
| June 2021 | 425 | Corporate and Management Accounting | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/425-june-2021.pdf |
| June 2021 | 426 | Securities Laws and Capital Markets | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/426-june-2021.pdf |
| June 2021 | 427 | Economic, Business and Commercial Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/427-june-2021.pdf |
| June 2021 | 428 | Financial and Strategic Management | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/428-june-2021.pdf |
| December 2020 | 421 | Jurisprudence, Interpretation and General Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/421-december-2020.pdf |
| December 2020 | 422 | Company Law | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/422-december-2020.pdf |
| December 2020 | 423 | Setting up of Business Entities and Closure | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/423-december-2020.pdf |
| December 2020 | 424-A | Tax Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/424-a-december-2020.pdf |
| December 2020 | 425-A | Corporate and Management Accounting | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/425-a-december-2020.pdf |
| December 2020 | 426 | Securities Laws and Capital Markets | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/426-december-2020.pdf |
| December 2020 | 427 | Economic, Business and Commercial Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/427-december-2020.pdf |
| December 2020 | 428-A | Financial and Strategic Management | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/428-a-december-2020.pdf |
| December 2019 | 421 | Jurisprudence, Interpretation and General Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/421-december-2019.pdf |
| December 2019 | 422 | Company Law | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/422-december-2019.pdf |
| December 2019 | 423 | Setting up of Business Entities and Closure | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/423-december-2019.pdf |
| December 2019 | 424-A | Tax Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/424-a-december-2019.pdf |
| December 2019 | 425-A | Corporate and Management Accounting | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/425-a-december-2019.pdf |
| December 2019 | 426 | Securities Laws and Capital Markets | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/426-december-2019.pdf |
| December 2019 | 427 | Economic, Business and Commercial Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/427-december-2019.pdf |
| December 2019 | 428-A | Financial and Strategic Management | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/428-a-december-2019.pdf |
| June 2019 | 421 | Jurisprudence, Interpretation and General Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/421-june-2019.pdf |
| June 2019 | 422 | Company Law | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/422-june-2019.pdf |
| June 2019 | 423 | Setting up of Business Entities and Closure | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/423-june-2019.pdf |
| June 2019 | 424 | Tax Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/424-june-2019.pdf |
| June 2019 | 425 | Corporate and Management Accounting | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/425-june-2019.pdf |
| June 2019 | 426 | Securities Laws and Capital Markets | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/426-june-2019.pdf |
| June 2019 | 427 | Economic, Business and Commercial Laws | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/427-june-2019.pdf |
| June 2019 | 428 | Financial and Strategic Management | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/question_papers/428-june-2019.pdf |

All rows above were verified 2026-10-07 against the archive API. During research, only the first page or two of 9 papers were opened, to check format: 522, 524 and 527 (Dec 2025); 422 and 424-A (Dec 2024); 424 (June 2022); 428 (June 2021); 425-A (Dec 2019); 424 (June 2019). **No questions have been extracted or analysed yet.**

---

## 7. Exam notices used for dates

| # | Source name | URL | Linked from | Information provided | Verified |
|---|---|---|---|---|---|
| E1 | Time Table, Dec 2026 session | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/cms_uploads/cs-main-exam-time-table-dec-26.pdf | N10 | Executive (Syllabus 2022) papers on 21–28 Dec 2026, 2:00–5:15 PM (includes 15 min reading time) | 2026-10-07 |
| E2 | Result Announcement, June 2026 session | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/cms_uploads/result-announcement-1-9e657322.pdf | N10 | June 2026 results on 25 Aug 2026; only Syllabus 2022 examined | 2026-10-07 |
| E3 | FAQs on CS Exam Guidelines (Oct 2024) | https://icsis3-console.kreate-cloud.com:9002/icsi-prod/media/cms_uploads/faqexam.pdf | N10 | General exam rules; nothing about the 2022 exam mode | 2026-10-07 |

Past exam dates (for `examination_date`) will be taken from each session's timetable during Phase 1. They have **not been collected yet**.

---

## 8. Non-authoritative sources (seen during research; NOT to be relied on)

| Source | Claim | Status |
|---|---|---|
| pw.live, careers360, studycafe (search results) | "Last 2017 Executive exam was June 2024" | **Contradicted** by the official archive, which holds 2017 Executive papers **and** guideline answers for Dec 2024. S1 §H also says June 2024, so ICSI must have extended it later. The extension notice itself has not been found (`REQUIRES_VERIFICATION`) |
| arivupro, vedantu, csexams.in (search results) | Claims of 8 papers, "Module I/II", Tax Laws in Module I under the current syllabus | **Wrong** for Syllabus 2022 (7 papers in 2 Groups; Tax Laws is Group 2, Paper 7). Ignored |
| bccgurgaon.com | "Syllabus changes effective Dec 2025" | Matches S2, but S2 (official) is the source we cite |

---

## Change log

| Date | Change |
|---|---|
| 2026-10-07 | Registry created (v0.1) |
| 2026-10-07 | v0.2 (Phase 1A): added S1-ORIG (pre-modification syllabus via Internet Archive) and the unusable 2022 capture; noted local copies, manifest, filename-hash convention and the CLP numbering warning |
