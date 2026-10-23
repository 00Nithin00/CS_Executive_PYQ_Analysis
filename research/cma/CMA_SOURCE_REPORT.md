# CMA (ICMAI) Official Source Report

Retrieved: 2026-10-23. The data is in `cma_catalogue.json`, in the same folder as this report.

## Sources used (all official)
- **icmai.in** is the new ASP.NET site, at `/ClntStudents/...`. Every page we used is static HTML, readable without JavaScript, and nothing blocked automated fetches. `robots.txt` is `Allow: /`.
  - Syllabus pages: `CMASyllabus`, `CMACurriculum`, `CourseCurriculum/{1,2,3}`
  - Study material pages: `StudyMaterials/{1,2,3}`, `Supplementary_currentterm`
  - Question paper pages: `ClntQuestionPaperList?menuId=1..6`
  - Other exam pages: `Suggested_Answers`, `Practice_TestPaper/{1,2,3}`, `ClntMQPList`, `ExaminerComments`, `Overview`, `UpdateandAnnouncements`, `Student_Circulars`, `Student_News_Update_inner`
- **dwpivt501gtb6.cloudfront.net** is ICMAI's own CDN. All icmai.in documents, and the site favicon and logo, are served from it. Every PDF in `resources` is on this host.
- **eicmai.in** and **examicmai.in** are ICMAI's portals. We only looked at the suggested-answers login page and the exam-application page. We did not log in or submit anything.
- Third-party sites came up in searches only as hints and are not cited anywhere.

**How URLs were checked:** each URL got a range GET (`-r 0-1023`) and a HEAD request. No PDF was downloaded in full or saved.
- Every PDF returned **206 Partial Content** on the range GET, which is the normal reply to a range request, and **200 application/pdf** on HEAD.
- `http.status` records the HEAD 200, and each resource's notes say the range GET returned 206.

## Scheme
- **Name:** "CMA Syllabus 2022".
- **Effective from:** the official notice title says: "Admission/ Registration/Enrollment in Foundation/ Intermediate/ Final Course under CMA Syllabus 2022 to be commenced from 1st August, 2022 and onwards (June 2023 term of Examinations and onwards)". This is the `Notification_ARE_0707_22.pdf` link on `Student_News_Update_inner`.
- **Older syllabus:** question papers under Syllabus 2016 are listed up to the December 2023 term.
- **Exam terms:** June and December. The question-paper pages are organised by "June YYYY" / "December YYYY" Term. The December 2026 timetables for Foundation and for Inter/Final are published, and there are supplementary pages for June 2026 and December 2026.

## Coverage per level
| Level | Papers | Syllabus (per paper + full) | Study material | Question papers | Practice Test Papers / MQP | Notices |
|---|---|---|---|---|---|---|
| Foundation | 4 (P1–P4) | 4 + 1 | 4 | 4 (June 2026 only) | 8 PTP (Q+A) + 1 MQP (Dec 2026, P3) | 2 |
| Intermediate | 8 (P5–P12) | 8 + 1 | 9 (P7 is in two sections) + 4 supplementary for Dec 2026 | 48 (6 terms: Jun 2026 back to Dec 2023) | 16 PTP (Q+A) | 4 |
| Final | 10 (P13–P19, plus electives P20A/B/C) | 10 + 1 | 4 + 5 supplementary for Dec 2026 | 60 (6 terms) | 20 PTP (Q+A) | 2 |

Totals:
- **22 papers.**
- **216 resources:** 112 question papers, 45 MTP/PTP/MQP, 26 study material, 25 syllabus, 8 notices, and 0 suggested answers.
- **16 unverified items.**

## Missing, and why
1. **Suggested answers.** ICMAI offers them only through `eicmai.in/Suggested_Answers/registration.aspx` ("Suggested Answers (Except Foundation Student)"). That page needs a student Registration No. and a CAPTCHA, and there are no public direct links. We did not log in.
2. **Marks, group composition and paper format.** No HTML page states them. They appear only in the syllabus and curriculum PDFs, which we did not download under the brief. As a result:
   - `marks` is `null` and `format` is `"unknown"` for every paper.
   - `groups` is empty and every `groupId` is `null`.
   - The exam-application page confirms that Intermediate and Final are taken group-wise.
   - Someone needs to read `Curriculum_2022.pdf` to fill these in.
3. **Foundation question papers before June 2026.** The official pages for Dec 2025 back to Dec 2023 list only Intermediate and Final papers.
4. **Final study material for P14, P15, P16, P18, P19 and P20A.** The official page links these to Google Drive files. They are publicly viewable and the file names match, but Drive is not an ICMAI domain, so they are listed under `unverified`.
5. **MQPs other than the default view.** Choosing a term or level on the MQP page is done through POST form buttons, so we did not use them. We also did not catalogue the Work Book, MCQ Bank or Postal Test Paper pages, which are linked from `CMASyllabus`.

## Terms of use / copyright
- We found no terms-of-use, copyright or hyperlinking policy page. The sitemap has none, and common paths such as `/Home/Disclaimer` and `/Home/TermsAndConditions` return 404.
- The site footer says only "©2026 icmai.in … All Rights Reserved."
- The suggested-answers login page carries a disclaimer that suggested answers "are indicative only and not exhaustive".
- Linking to the documents, rather than re-hosting them, is the right approach. Treat the content as ICMAI copyright.

## Surprises
- **The site was rebuilt.** The old `icmai.in/studentswebsite/*.php` pages (for example `exam_qp_D25_2022.php`) and `icmai.in/upload/Students/...` paths now return 404, although search engines still list them. Documents have moved to the CloudFront CDN, often with UUID or timestamp file names that may change on re-upload, so the links need re-checking from time to time.
- **June 2026 question papers have quirks.**
  - Paper-20A is listed twice under Final; the extra link appears first, before P13. That duplicate is in `unverified`.
  - Several files have spaces in their names. They are stored with `%20`.
  - Some files sit in a different folder (`QuestionPaper/syllabus2022/`).
- **ICMAI's own names for practice material:** "Practice Test Paper" (PTP) and "Model Question Paper" (MQP), not "MTP". These are stored as `MTP`, with notes.
- **Paper titles vary in case and wording across pages.** For example "Entrepreneurship and Startup" vs "Start Up", and "Indirect Tax Laws & Practice" vs "and Practice". `papers[].name` uses the wording from the Course Curriculum pages.
- **Stray sitemap entry.** `robots.txt` points to a sitemap on `icmai7.demoapplication.in`, which looks like a leftover from the developer.
