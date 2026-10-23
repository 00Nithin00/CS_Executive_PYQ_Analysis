# CA (ICAI) Official Resource Catalogue - Source Report

Retrieved: 2026-10-23. Catalogue file: `ca_catalogue.json` (16 papers, 344 verified resources, 10 unverified items).

## Sources used (all official ICAI domains)
- **ICAI main site:** `www.icai.org`. This covers the New Scheme hub (`/post/new-scheme-of-education-and-training`), the syllabus pages (`/post/syllabus-nset*`), the study material pages (`/post/study-material-nset`, `/post/{foundation,intermediate,final}-nset`, `/post/sm-*`), the question paper pages (`/post/question-papers-*-course`), the suggested answer pages (`/post/suggested-answer-*`, `/post/sugg-ans-*`) and the RTP pages (`/post/rtp-*`).
- **BoS Knowledge Portal:** `boslive.icai.org`. It provides the home page, the BoS and Examination announcement lists, and `announcement_details.php?id=…`. Each announcement embeds its PDF from `resource.cdn.icai.org` in an iframe.
- **ICAI CDN:** `resource.cdn.icai.org`. This holds all the PDFs: the scheme FAQ (`82287bos66363.pdf`), the "Scheme at a glance" prospectus extract (`82379bos66434.pdf`), the syllabus, papers, answers, RTPs and notices.
- I used third-party sites only once, in a search to look for MTP hosting. None of them is used as a source.

## Key facts verified
- **Scheme:** the "New Scheme of Education and Training". The scheme FAQ (Q1.1) says it was "launched on CA Day, i.e. 1st July, 2023". Under it, the first attempts are May 2024 (Intermediate and Final) and June 2024 (Foundation), going by the attempt listings on the question paper pages.
- **Papers and marks:** taken from "Scheme at a glance" (`82379bos66434.pdf`). Every paper carries 100 marks. Intermediate Paper 3 is split 50/50 into Income-tax and GST, and Paper 6 is split 50/50 into 6A FM and 6B SM.
  - **Exact paper titles:** taken from the per-level syllabus pages. Note that the at-a-glance PDF writes Final P4 as "…Laws and International…", while the syllabus page uses "&".
  - **Format** comes from the FAQ:
    - Foundation P1 and P2 are subjective, and P3 and P4 are objective, with 0.25 negative marking.
    - Intermediate and Final papers are 30% case-based MCQs and 70% descriptive (no negative marking).
    - Final P6 (IBS) is open book.
- **Exam sessions:**
  - **Foundation and Intermediate:** January, May and September (FAQ Q2.11 and Q3.9). The Sep 2026 and Jan 2027 exam notices confirm this.
  - **Final:** May and November. ICAI notice of 06-04-2026 (`91666exam060d426a.pdf`): "CA Final Examinations shall be conducted twice a year in the months of May and November with effect from May 2026". The Sep/Nov 2026 notice lists Final for 2-13 Nov 2026.

## Coverage per level
- **Foundation:**
  - Syllabus PDFs for P1-P4, plus the section-wise weightages.
  - Study material index and edition pages for P1-P4: the "May 2026 onwards" and "May 2027 onwards" editions, plus the 2025 edition where it is still listed. There is also one Model Test Papers PDF.
  - Question papers for 6 attempts (Sep 2026, May 2026, Jan 2026, Sep 2025, May 2025, Jan 2025). The Sep 2026 Hindi-medium papers are included.
  - Suggested answers for 6 attempts (May 2026 back to Sep 2024).
  - RTPs for Jan 2027 and Sep 2026.
  - Notices: exam schedules, study material applicability, and the MTP announcement.
- **Intermediate:**
  - Syllabus PDFs for P1-P6, including the section PDFs for P3 and P6.
  - Study material for all sections, plus 3 Model Test Paper PDFs.
  - Question papers and suggested answers for 6 attempts each (Sep 2026 back to Jan 2025; all 6 papers each time).
  - RTPs for Sep 2026 and May 2026, per paper and group-wise.
  - Notices.
- **Final:**
  - Syllabus PDFs for P1-P6, including the split P5 PDFs.
  - Study material for P1-P5. P6 IBS has no module; its official page lists Case Study Digests, which are included.
  - Question papers and suggested answers for all 6 new-scheme attempts (May 2026, Jan 2026, Sep 2025, May 2025, Nov 2024, May 2024).
  - RTPs for Nov 2026 and May 2026.
  - Notices on the twice-a-year change and the Nov 2026 schedule.

## Missing, and why (details in `unverified`)
1. **Mock Test Paper series:** the actual papers need a login to the BoS Knowledge Portal, `bosmtp.icai.org` or the BoS app, according to ICAI's own MTP announcements of 14.10.2026 and 21.10.2026. I did not log in. Only the announcements (as NOTICE) and the public "Model Test Papers" PDFs from the study material pages are catalogued. The Model Test Papers are typed MTP, with a note that they are not the Mock Test series.
2. **Foundation objective papers (P3 and P4):** ICAI does not publish these question papers for attempts before Sep 2026. It also does not publish their suggested answers for Jan 2025 or Sep 2024.
3. **Not yet released:**
   - Foundation Sep 2026 suggested answers.
   - Intermediate Jan 2027 RTP.
   - Final Nov 2026 question papers and answers (the exam has not been held yet).
4. **Not catalogued in this pass:**
   - Hindi-medium suggested answers and RTPs.
   - Examiner's comments.
   - Chapter-level study material PDFs (the catalogue links the per-paper and per-edition pages instead).
   - The SPOM modules.

## Terms of use and copyright (relevant to linking)
- **Copyright Policy** (`https://www.icai.org/post/16585`): "Material displayed on this website may be reproduced only after taking prior written permission from ICAI … the source must be prominently acknowledged."
- **IPR Notice** on the study material, question paper and suggested answer pages: all IP is vested in ICAI, and "No part … may be reproduced or transmitted … or stored in any retrieval system … without the written permission of the ICAI."
- **Terms & Conditions** (`https://www.icai.org/post/16566`): content is "for reference purposes only" and subject to change without notice, and ICAI accepts no responsibility for accuracy.
- I found no clause that prohibits deep-linking. Linking without re-hosting fits these terms, but the source should be acknowledged as ICAI. Do not mirror, cache or re-host the PDFs.
- The BoS question paper and answer pages also carry a disclaimer: suggested answers are not updated for later amendments, so students must check them against the current syllabus. It is worth showing this disclaimer on the site.

## Surprises and caveats
- **Final went from three sittings a year back to two.** Final was held in January, May and September (attempts Sep 2025 and Jan 2026 exist) until ICAI announced on 06-04-2026 that it returns to May and November from May 2026. Foundation and Intermediate stay at three sittings a year (Jan, May, Sep).
- **HTTP status 206:** all 282 PDFs returned 206 Partial Content to the range request I was told to use (`-r 0-1023`). This means the file exists and was served. HTML pages returned 200. I recorded the real status, and every record with 206 carries a note saying so.
- **No blocking:** ICAI pages did not block automated access, and the content is plain server-rendered HTML with no JS needed. Announcement PDFs are embedded via iframes.
  - To read a few notices (the exam schedules, the Final frequency notice, the FAQ, at-a-glance and the MTP notices), I extracted their text in memory by piping them into `pdftotext`. That meant downloading those few PDFs in full, and nothing was saved. One WebFetch call cached 3 notice PDFs automatically; I deleted them right away.
- **Stale public MTP page:** the BoS home page still shows stale banners, for example "Mock Test Papers … June 2023" and a May 2024 schedule. The public page `education_content.php?p=Mock Test Papers` only lists announcements for Sep 2025.
- **Odd link label:** one Foundation Sep 2026 RTP link is labelled "Disclaimer" by ICAI, but its file name (`…grp-wise.pdf`) suggests a compiled RTP. I kept it, with a note.
- **Paper sourceUrl:** `papers[].sourceUrl` points to the per-level syllabus page, which is the source for the exact titles. Marks come from the at-a-glance PDF listed in `schemes[].sourceUrls`.
