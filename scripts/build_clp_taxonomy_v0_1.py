#!/usr/bin/env python3
"""Build taxonomy/clp_taxonomy_v0.1.{json,csv} for Executive Paper 2 (522) Company Law & Practice.

Every node below is transcribed from an official ICSI document:
  S1      = ICSI Syllabus 2022, modified version (file ModDate 2025-12-27)        [current]
  S1-ORIG = ICSI Syllabus 2022, pre-modification version (file created 2025-04-16),
            ICSI's own PDF retrieved from the Internet Archive because the legacy
            icsi.edu URL now returns 404                                           [historical]
  S2      = Announcement on modifications effective Dec 2025
  M2      = Study material, Company Law & Practice (file created 2025-12-12;
            "legislative changes made upto November, 2025")

Page conventions:
  S1 / S1-ORIG: page = PDF page index (1-based); printed_page = number printed in footer.
  M2: page = printed page number (as in M2's table of contents); pdf_page = page + 36.

The script also checks every M2 subtopic: the heading words must appear on the cited
PDF page or the page after it. Any mismatch is reported and the build fails.

Usage: python3 -I scripts/build_clp_taxonomy_v0_1.py   (run from the project root)
"""
import csv
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REF = ROOT / "01_Source_Papers" / "official_reference"
M2_PDF = REF / "M2" / "company-law-practices-3e591a57.pdf"
M2_OFFSET = 36
VERSION = "0.1"
CUR = "2022-mod-dec2025"
ORIG = "2022-original"

# S1 PDF pages for CLP lessons (modified version) and S1-ORIG pages (pre-modification version)
S1_PAGE = {**{n: 17 for n in range(1, 7)}, **{n: 18 for n in range(7, 14)}, **{n: 19 for n in range(14, 20)}}
S1O_PAGE = {**{n: 17 for n in range(1, 6)}, **{n: 18 for n in range(6, 13)}, **{n: 19 for n in range(13, 20)}}

# Study-material lesson number for each syllabus lesson (None = no lesson in current M2)
SM_LESSON = {**{n: n for n in range(1, 12)}, 12: None, 13: 12, 14: 13, 15: 14, 16: 15, 17: None, 18: 16, 19: 17}

# --------------------------------------------------------------------------------------
# Taxonomy data. Topic tuple: (name, status, subtopics, extra)
# Subtopic tuple: (name, m2_printed_page, m2_heading, basis, note)
#   basis: "study_material_heading" | "statutory_provision"
# --------------------------------------------------------------------------------------
C, D, P = "CURRENT", "DELETED_FROM_DEC2025", "PARTIALLY_DELETED"
H, SP = "study_material_heading", "statutory_provision"

LESSONS = [
 (1, "Introduction to Company Law", C, [
   ("Jurisprudence of Company Law", C, [], {}),
   ("Doctrine of Ultra-vires", C, [
     ("Effects of and exceptions to the doctrine of ultra vires", 10, "Effects of ultra vires Transactions", H, "Covers M2 pp.10-11 (effects; exceptions)."),
   ], {}),
   ("Doctrine of Indoor Management", C, [
     ("Exceptions to the doctrine of indoor management", 13, "Exceptions to the Doctrine of Indoor Management", H, ""),
   ], {}),
   ("Doctrine of Constructive Notice", C, [], {}),
   ("Concept of Corporate Veil", C, [
     ("Lifting / piercing of the corporate veil", 17, "Doctrine of Lifting of or Piercing the Corporate Veil", H, "Body heading on p.17 reads 'DOCTRINE OF LIFTING OF OR PIERCING THE CORPORATE VEIL'; the M2 contents page prints 'Lifting Off'."),
     ("Doctrine of alter ego", 16, "Doctrine of Alter Ego", H, "Not a syllabus bullet. Placed here because M2 discusses it next to lifting of the veil (pp.16-17). Placement to be confirmed in human review."),
   ], {}),
   ("Applicability of the Companies Act", C, [], {"note": "M2 p.21 heading 'Applicability of the Companies Act, 2013 and key concepts' covers both this topic and 'Definitions and Key Concepts'."}),
   ("Definitions and Key Concepts", C, [], {}),
   ("MCA 21", C, [
     ("Agencies under MCA / ROC office organisation", 27, "Agencies under MCA-21", H, "M2 lists agencies such as SFIO here (p.28). Questions on SFIO investigation powers belong to deleted lesson 12, not here."),
     ("E-filing on MCA-21 (e-forms, pre-certification, payment)", 35, "Prerequisites for E-Filing On MCA-21", H, ""),
   ], {}),
 ]),
 (2, "Legal Status and Types of Registered Companies", C, [
   ("Corporate Personality", C, [
     ("Limited liability and its exceptions", 51, "Exceptions to the principle of limited liability", H, "Not a separate syllabus bullet. M2 treats it under 'Legal Status of Registered Companies' (pp.41-52)."),
   ], {"group": "Legal Status of Registered Companies"}),
   ("Perpetual succession", C, [], {"group": "Legal Status of Registered Companies"}),
   ("Separate property", C, [], {"group": "Legal Status of Registered Companies"}),
   ("Transferability of shares", C, [], {"group": "Legal Status of Registered Companies", "note": "Legal-status attribute only (shares as movable property; private-company restrictions). Transfer and transmission procedure belongs to CLP.L04.T09."}),
   ("Capacity to sue or be sued", C, [], {"group": "Legal Status of Registered Companies"}),
   ("Private Company", C, [
     ("Privileges and exemptions of a private company", 60, "Privileges and Exemptions of Private Company", H, ""),
     ("One Person Company (OPC)", 54, "One Person Company", SP, "STATUTORY BASIS: Companies Act 2013 s.2(62), s.3(1)(c). M2 has no OPC heading in this lesson, only mentions; it cross-refers to SBILL Lesson 1 for classification. Placed under Private Company because an OPC is a private company by definition."),
   ], {"group": "Types of Registered Companies"}),
   ("Public Company", C, [
     ("Distinction between private and public company", 64, "Distinction between Private and Public Company", H, ""),
   ], {"group": "Types of Registered Companies"}),
   ("Small Company", C, [], {"group": "Types of Registered Companies"}),
   ("Holding Company", C, [], {"group": "Types of Registered Companies"}),
   ("Subsidiary Company", C, [], {"group": "Types of Registered Companies"}),
   ("Associate Company", C, [], {"group": "Types of Registered Companies"}),
   ("Dormant Company", C, [], {"group": "Types of Registered Companies", "note": "Definition and classification only. Procedure, benefits and compliance of dormant status belong to CLP.L11."}),
   ("Government Company", C, [], {"group": "Types of Registered Companies"}),
 ]),
 (3, "Memorandum and Articles of Association and its Alteration", C, [
   ("Memorandum of Association and Articles of Association", C, [
     ("Contents of Memorandum", 90, "Contents of Memorandum", H, ""),
     ("Entrenchment provisions", 121, "Entrenchment Provisions", H, ""),
     ("Distinction between MoA and AoA; legal effect", 123, "Distinction between Memorandum and Articles", H, "Covers M2 p.123 (distinction; legal effect)."),
   ], {}),
   ("Incorporation Contracts", C, [
     ("Pre-incorporation contracts", 133, "Pre-incorporation Contracts", H, ""),
   ], {}),
   ("Alteration in MOA & AOA", C, [
     ("Alteration of name clause", 98, "Alteration of MoA Due To Change In Name Clause", H, ""),
     ("Alteration of registered office clause / shifting of registered office", 103, "Alteration of Situation/Registered Office clause", H, ""),
     ("Alteration of object clause", 110, "Alteration of MoA due to change in Object Clause", H, ""),
     ("Alteration of liability clause", 115, "Alteration of Liability Clause", H, ""),
     ("Alteration of capital clause (incl. s.61 alteration of share capital)", 115, "Alteration of Capital Clause in MOA", H, "M2 also covers 'Alteration of Share Capital' in Lesson 4 (p.187). Canonical location is here: the syllabus has no L4 bullet for alteration. See design decision DD-07."),
     ("Alteration of Articles of Association", 125, "Alteration of Articles of Association of a Company", H, ""),
   ], {}),
 ]),
 (4, "Shares and Share Capital-Concepts", C, [
   ("Meaning and Types of Capital", C, [
     ("Equity shares with differential voting rights", 163, "Equity Shares with Differential Voting Rights", H, "M2 places DVR under 'Part C: Issue and Allotment'. Classified here because the concept tested is a type of share capital (s.43). Placement to be confirmed in human review."),
   ], {}),
   ("Issue and Allotment", C, [
     ("Prospectus (basic terms)", 146, "Prospectus", H, ""),
     ("Securities premium and its utilisation", 156, "Utilisation of Securities premium", H, ""),
     ("Allotment of securities", 157, "Concept of Allotment of Securities", H, ""),
   ], {}),
   ("Issue of Share Certificates", C, [], {}),
   ("Further Issue of Share Capital", C, [], {}),
   ("Issue of shares on Private and Preferential basis", C, [
     ("Private placement", 160, "Private Placement of Shares", H, ""),
     ("Preferential allotment", 176, "Issue of Shares on Preferential Basis", H, ""),
   ], {}),
   ("Rights issue and Bonus Shares", C, [
     ("Rights issue", 171, "Right Issue", H, ""),
     ("Bonus shares", 181, "Bonus Shares", H, ""),
   ], {}),
   ("Sweat Equity Shares and ESOPs", C, [
     ("Employee stock option scheme", 173, "Employee Stock Option Scheme", H, ""),
     ("Sweat equity shares", 182, "Sweat Equity Shares", H, ""),
   ], {}),
   ("Issue and Redemption of Preference Shares", C, [], {}),
   ("Transfer and Transmission of Securities", C, [
     ("Transfer of securities (procedure, lost/forged transfers, transfer to minor)", 202, "Transferability of securities", H, "Covers M2 pp.202-217 except the separately listed items."),
     ("Transmission of securities", 211, "Transmission of Securities", H, ""),
     ("Depository system; dematerialisation and rematerialisation", 218, "Legal Framework for Depository Systems", H, ""),
   ], {}),
   ("Buyback of Securities", C, [], {}),
   ("Reduction of Share Capital", C, [
     ("Reduction without sanction of the Tribunal", 200, "Reduction of Share Capital without sanction of the Tribunal", H, ""),
   ], {}),
   ("Payment of Stamp Duty", C, [], {}),
   ("Registers and Records", C, [], {}),
 ]),
 (5, "Members and Shareholders", C, [
   ("How to become a Member", C, [
     ("Cessation of membership", 236, "Cessation of Membership", H, ""),
   ], {}),
   ("Register of Members", C, [
     ("Foreign register; closing of register", 242, "Foreign Register", H, "Covers M2 pp.242-243."),
   ], {}),
   ("Declaration of Beneficial Interest", C, [], {}),
   ("Significant Beneficial Owner", C, [], {}),
   ("Rectification of Register of Members", C, [], {"note": "M2 also discusses rectification in Lesson 4 (p.208). Canonical location is here (explicit syllabus bullet)."}),
   ("Rights of Members", C, [
     ("Voting rights and rights of dissenting shareholders", 258, "Voting Rights of Members", H, "Covers M2 pp.258-259."),
     ("Shareholders' agreement and veto rights", 263, "Shareholders’ Agreement", H, ""),
   ], {}),
   ("Variation of Shareholders' Rights", C, [], {}),
 ]),
 (6, "Debt Instruments-Concepts", C, [
   ("Issue and Redemption of Debentures and Bonds", C, [
     ("Kinds of debentures; bonds vs debentures", 280, "Kinds of Debentures", H, ""),
   ], {"note": "Borrowing powers (s.179/s.180(1)(c)) are introduced in M2 p.272, but the canonical location is CLP.L15.T02/T03 (powers of / restrictions on the Board). See DD-08."}),
   ("Creation of Security", C, [], {}),
   ("Debenture Redemption Reserve", C, [], {}),
   ("Debenture Trust Deed", C, [
     ("Debenture trustees", 288, "Debenture Trustees & Debenture Trust Deed", H, ""),
   ], {}),
   ("Conversion of Debentures into Shares", C, [], {}),
   ("Overview of Company Deposits", C, [
     ("Acceptance of deposits from members (terms, limits, time period)", 296, "Terms and Conditions for Acceptance of Deposits from its Members", H, ""),
     ("Eligible company and deposits from the public", 295, "Meaning of Eligible Company", H, ""),
     ("Repayment of deposits; deposit repayment reserve; liquid assets", 301, "Repayment of Deposits", H, "Covers M2 pp.301-307."),
   ], {}),
 ]),
 (7, "Charges", C, [
   ("Creation of Charges", C, [
     ("Types of charges: fixed vs floating; crystallisation", 318, "Types of Charges", H, ""),
     ("Charge vs mortgage vs pledge", 321, "Difference between Mortgage and Charge", H, ""),
   ], {}),
   ("Registration, Modification and Satisfaction of Charges", C, [
     ("Registrable charges and consequences of non-registration", 327, "Consequences of Non-Registration of Charges", H, ""),
     ("Satisfaction of charges", 339, "Satisfaction of Charges", H, ""),
     ("Intimation of appointment of receiver or manager", 343, "Intimation of appointment of receiver or manager", H, ""),
   ], {}),
   ("Register of Charges", C, [], {}),
   ("Inspection of Charges", C, [], {}),
   ("Punishment for Contravention", C, [], {}),
   ("Rectification by Central Government in Register of Charges", C, [], {}),
   ("Purpose, Objective, Drafting and Issuing of Search Report", C, [], {}),
 ]),
 (8, "Distribution of Profits", C, [
   ("Profit and Ascertainment of Divisible Profits", C, [], {}),
   ("Declaration and Payment of Dividend", C, [
     ("Types of dividend; power to declare (interim/final)", 363, "Types of Dividend", H, ""),
     ("Source of dividend and transfer to reserves", 366, "Source of payment of Dividend", H, ""),
     ("Payment of dividend and liability for non-payment", 380, "Liability to pay Final Dividend", H, ""),
   ], {}),
   ("Unpaid Dividend Account", C, [], {}),
   ("Investor Education and Protection Fund", C, [
     ("Refund to claimant from IEPF", 393, "Refund to Claimant from Investor Education and Protection Fund", H, ""),
   ], {}),
   ("Right to Dividend", C, [], {}),
   ("Rights Shares and Bonus shares to be held in abeyance", C, [], {}),
   ("Secretarial Standards on Dividend", C, [], {}),
   ("Dividend Distribution Policy", C, [], {}),
 ]),
 (9, "Accounts and Auditors", C, [
   ("Books of Accounts", C, [], {}),
   ("Financial Statements", C, [
     ("Consolidated financial statements", 427, "Consolidated Financial Statements", H, ""),
     ("Re-opening and voluntary revision of financial statements", 429, "Re-Opening of accounts on Court’s or Tribunal’s orders", H, "Covers M2 pp.429-430."),
     ("Signing and filing of financial statements", 430, "Signing of Financial Statement", H, "Covers M2 pp.430-433."),
   ], {}),
   ("National Financial Reporting Authority", C, [], {}),
   ("Auditors- Appointment, Resignation and Procedure relating to Removal, Qualification and Disqualification", C, [
     ("Appointment and rotation of auditors", 440, "Appointment of Auditors", H, "Covers M2 pp.440-443."),
     ("Casual vacancy in the office of auditor", 443, "Casual vacancy in the office of auditor", H, ""),
     ("Removal and resignation of auditor", 446, "Removal of Auditor", H, ""),
     ("Eligibility, qualifications and disqualifications of auditor", 448, "Eligibility & Qualifications of Auditor", H, "Covers M2 pp.448-449."),
   ], {}),
   ("Rights, Duties and Liabilities", C, [], {}),
   ("Audit and Auditor's Report", C, [
     ("Companies (Auditor's Report) Order, 2020", 454, "Companies (Auditor’s Report) Order, 2020", H, ""),
   ], {}),
   ("Cost Audit", C, [], {}),
   ("Secretarial Audit", C, [], {}),
   ("Internal Audit", C, [], {}),
 ]),
 (10, "Compromise, Arrangement and Amalgamations-Concepts", P, [
   ("Introduction of Compromises, Arrangement and Amalgamation", C, [
     ("Compromise or arrangement with members/creditors (s.230)", 473, "Power to Compromise or make Arrangements with Members or Creditors", H, ""),
     ("Merger and amalgamation through the Tribunal (s.232)", 481, "Merger and Amalgamation of Companies", H, ""),
     ("Fast-track merger of small / holding-subsidiary companies (s.233)", 486, "Merger and Amalgamation of Certain Companies", H, ""),
     ("Cross-border merger with a foreign company (s.234)", 490, "Merger or Amalgamation of a company with a foreign company", H, ""),
     ("Acquisition of dissenting / minority shareholding (ss.235-236)", 492, "Power to acquire shares of shareholders dissenting", H, "Covers M2 pp.492-493."),
     ("Amalgamation by Central Government in public interest (s.237)", 496, "Power of Central Government to provide for Amalgamation", H, ""),
   ], {"note": "S1 lists this as one bullet. M2's printed syllabus (p.vi) splits it into 'Introduction of Compromises' and 'Arrangement and Amalgamation'. Kept as one topic (S1 is the authority)."}),
   ("Oppression and Mismanagement", D, [
     ("Majority rule and minority rights (Foss v. Harbottle; Chapter XVI)", 498, "MAJORITY RULE AND MINORITY RIGHTS", H, "DISCREPANCY: S1 deleted this topic from Dec 2025, but the current M2 (Dec 2025 edition) still contains this section (pp.498-501). Status follows S1 (the syllabus authority). REQUIRES_VERIFICATION: whether ICSI still examines it from Dec 2025."),
   ], {"sources": ["S1-ORIG", "S1-footnote"]}),
   ("Class Actions Suits", D, [], {"sources": ["S1-ORIG", "S1-footnote"]}),
 ]),
 (11, "Dormant Company", C, [
   ("Legal framework for Dormant Companies", C, [], {}),
   ("Procedure to obtain the status of a Dormant Company", C, [], {}),
   ("Prerequisite for obtaining the status of Dormant Company", C, [], {}),
   ("Benefits / exemptions provided to a Dormant Company", C, [], {}),
   ("Compliance requirements by Dormant Company", C, [], {}),
   ("Procedure to obtain the status of an Active Company from Dormant Company", C, [], {}),
 ]),
 (12, "Inspection, Inquiry and Investigation", D, [
   (t, D, [], {"sources": ["S1-ORIG"]}) for t in [
     "Powers for inspection", "Purpose of conducting Inspection", "Kinds of Investigation",
     "Power of Inspector to Conduct Investigation into Affairs of Related Companies",
     "Protection of employees during Investigation", "Seizure of Documents by Inspector",
     "Freezing of Assets of Company on Inquiry And Investigation", "Imposition of Restrictions upon Securities",
     "Inspector's Report", "Expenses of Investigation", "Preparation by a Company Secretary to face Investigation",
     "Establishment of Serious Fraud Investigation Office", "Process of Investigation by Serious Fraud Investigation Office"]
 ]),
 (13, "General Meetings", C, [
   ("Annual General Meeting", C, [
     ("Extension of AGM; day, time and place", 523, "Extension of validity period of AGM", H, "Covers M2 p.523."),
     ("Business to be transacted at AGM (ordinary vs special business)", 524, "Business to be transacted at Annual General Meeting", H, ""),
   ], {}),
   ("Extraordinary General Meetings", C, [], {"note": "Includes requisitioned EGM (s.100)."}),
   ("Other General Meetings", C, [
     ("Class meetings; meetings of debenture holders/creditors", 529, "Class Meetings", H, ""),
     ("Adjourned meetings", 529, "Adjourned Meeting", H, ""),
   ], {}),
   ("Types of Resolutions", C, [
     ("Ordinary and special resolutions", 531, "Ordinary and Special Resolutions", H, ""),
     ("Resolutions requiring special notice", 532, "Resolutions Requiring Special Notice", H, ""),
     ("Resolutions and agreements to be filed with the Registrar", 535, "Resolutions and agreements to be filed with the registrar", H, ""),
   ], {}),
   ("Notice, Quorum, Poll, Chairman, Proxy", C, [
     ("Notice of meeting: length, shorter notice, contents, persons entitled", 536, "Notice of meeting", H, "Covers M2 pp.536-542."),
     ("Explanatory statement (s.102)", 544, "Statement to be Annexed to Notice", H, ""),
     ("Quorum for general meetings", 546, "Quorum for Meetings", H, ""),
     ("Chairman of meetings", 548, "Chairman of Meetings", H, ""),
     ("Proxies", 549, "Proxies", H, ""),
   ], {"note": "The word 'Poll' appears in this bullet and in the voting bullet. Questions on poll go to CLP.L13.T08 (see DD-09)."}),
   ("Meeting and Agenda", C, [], {}),
   ("Process of conducting meeting", C, [], {}),
   ("Voting and its types-vote on show of hands, Poll, E-Voting, Postal ballot", C, [
     ("E-voting", 560, "Procedure of E-Voting", H, ""),
     ("Demand for poll", 564, "Demand for Poll", H, ""),
     ("Postal ballot", 565, "Postal Ballot", H, ""),
   ], {}),
   ("Circulation of Members' Resolutions", C, [], {}),
   ("Signing and Inspection of Minutes", C, [], {"note": "General-meeting minutes only. Board/committee minutes belong to CLP.L16.T03."}),
   ("Secretarial Standard – 2", C, [], {}),
   ("Duties of Company Secretaries before, during and after General Meeting", C, [], {}),
   ("Virtual Meetings : Technological Advancement in conduct of General Meetings", C, [], {}),
   ("Drafting of Notice and Minutes of Annual General Meeting and Extra-Ordinary General Meeting", C, [], {}),
 ]),
 (14, "Directors", C, [
   ("DIN requirement", C, [
     ("DIR-3 KYC; cancellation / surrender / deactivation of DIN", 599, "Cancellation/Surrender/Deactivation of DIN", H, "Covers M2 pp.599-600."),
   ], {}),
   ("Types of Directors", C, [
     ("Independent directors: criteria, term, remuneration", 605, "Independent Directors", H, "Covers M2 pp.605-611. Appointment procedure for IDs goes to CLP.L14.T03.S03."),
     ("Small shareholders' director", 604, "Terms & Conditions for Small Shareholders’ Director", H, ""),
     ("Other types: resident, woman, additional, alternate, nominee directors (concept)", 603, "Resident Director", H, "Definition/requirement level. Appointment mechanics go to CLP.L14.T03.S01."),
   ], {}),
   ("Appointment / Reappointment, Disqualifications, Vacation of Office, Retirement, Resignation and Removal", C, [
     ("Modes of appointment (first, by Board, by Tribunal, nominee, at general meeting)", 616, "Appointment of First Director", H, "Covers M2 pp.616-620."),
     ("Retirement by rotation and re-appointment", 621, "Procedure for re-appointment of the retiring director", H, ""),
     ("Appointment of independent directors", 624, "Appointment of Independent directors", H, "Covers M2 pp.624-625."),
     ("Disqualifications for appointment of director (s.164)", 627, "Disqualifications for Appointment of Director", H, "M2 contents page says p.625; the heading is actually at the foot of p.627 (verified in body text)."),
     ("Vacation of office (s.167)", 628, "Vacation of Office", H, ""),
     ("Resignation of directors (s.168)", 630, "Resignation of Directors", H, ""),
     ("Removal of directors (s.169 / Tribunal)", 631, "Removal of Directors", H, ""),
   ], {}),
   ("Loans to Directors", C, [], {}),
   ("Disclosure of Interest", C, [], {}),
   ("Duties of Directors", C, [], {}),
   ("Rights of Directors", C, [], {"note": "Syllabus bullet with no study-material section: M2 mentions 'Duties and Rights of Directors' only in the Lesson 13 outline (p.593); the body has no 'Rights of Directors' heading (searched pp.593-640). Kept because it is an official bullet; classification evidence will rely on the statutory provision (e.g. s.128(3)/s.171 inspection rights). See U-03."}),
 ]),
 (15, "Board Composition and Powers of the Board", C, [
   ("Board composition", C, [
     ("Board composition of listed entities", 644, "Board Composition in Listed Entities", H, ""),
     ("Number of directorships", 646, "Number of Directorships", H, ""),
   ], {}),
   ("Powers of Board", C, [], {}),
   ("Restrictions on Powers of Board", C, [
     ("Restrictions requiring members' approval (s.180)", 666, "Powers of Board", H, "STATUTORY BASIS: s.180. M2 covers it inside 'Powers of Board' (pp.666-669)."),
     ("Political contributions (s.182)", 670, "Prohibitions and Restrictions Regarding Political Contribution", H, ""),
   ], {}),
   ("Board Committees", C, [
     ("Audit committee and vigil mechanism", 650, "Audit Committee", H, "Covers M2 pp.650-656."),
     ("Nomination and remuneration committee", 657, "Nomination and Remuneration Committee", H, ""),
     ("Stakeholders relationship committee", 660, "Stakeholders Relationship Committee", H, ""),
     ("Risk management committee", 662, "Risk Management Committee", H, ""),
   ], {"note": "CSR Committee is also described in M2 Lesson 14 (p.663), but by syllabus relocation its canonical location is CLP.L18.T05 (DD-05)."}),
   ("Overview of Inter-Corporate Loans, Investments, Guarantees and Security", C, [
     ("Limits and approvals for loans/investments/guarantees (s.186)", 673, "Loan and Investment by Companies", H, "Covers M2 pp.673-678."),
   ], {}),
   ("Related Party Transactions", C, [], {}),
 ]),
 (16, "Meetings of Board and its Committees", C, [
   ("Frequency, Convening and Proceedings of Board and Committee meetings", C, [
     ("Meeting of independent directors", 719, "Meeting of Independent Directors", H, "Placement to be confirmed in human review (M2 places it after resolution by circulation)."),
   ], {}),
   ("Agenda Management", C, [], {}),
   ("Meeting Management", C, [
     ("Quorum for Board meetings", 707, "Quorum for Board Meetings", H, ""),
     ("Minutes of Board/committee meetings", 711, "Minutes", H, ""),
   ], {}),
   ("Resolution by Circulation", C, [], {}),
   ("Types of Resolutions", C, [], {"note": "Board resolutions. Members' resolutions belong to CLP.L13.T04."}),
   ("Duties of Company Secretaries before, during and after Board/ Committee Meeting", C, [], {}),
   ("Virtual Meetings :Technological Advancement in conduct of Board Committee", C, [], {"note": "Includes Board meetings through video conferencing (M2 p.697)."}),
   ("Need and Scope of Secretarial Standards", C, [], {}),
   ("Secretarial Standard – 1", C, [], {}),
   ("Drafting of Notice, Agenda and Minutes of Board and Committee Meetings", C, [], {}),
 ]),
 (17, "Corporate Social Responsibility-Concepts", D, [
   ("CSR Committee", D, [], {"sources": ["S1-ORIG"], "relocated_to": "CLP.L18.T05"}),
   ("Policy", D, [], {"sources": ["S1-ORIG"], "relocated_to": "CLP.L18.T06"}),
   ("CSR Expenditure", D, [], {"sources": ["S1-ORIG"]}),
   ("Activities", D, [], {"sources": ["S1-ORIG"], "relocated_to": "CLP.L18.T07"}),
   ("Ongoing Project", D, [], {"sources": ["S1-ORIG"]}),
   ("Impact Assessment", D, [], {"sources": ["S1-ORIG"]}),
 ]),
 (18, "Annual Report-Concepts", C, [
   ("Board's Report", C, [
     ("Disclosures in Board's report (s.134(3))", 749, "Disclosures under Section 134(3)", H, ""),
     ("Abridged Board's report for OPC and small company", 757, "Abridged Board Report for OPC and Small Company", H, ""),
     ("Approval and signing of Board's report", 764, "Approval of the Board’s Report", H, ""),
   ], {}),
   ("Annual Return", C, [
     ("Signing and certification of annual return", 771, "Certification of Annual Return", H, ""),
   ], {"note": "Provisional home for ACTIVE (Active Company Tagging Identities and Verification), which M2 places after annual return (p.776). See unresolved issue U-06."}),
   ("Annual Report", C, [
     ("Business responsibility reporting; social stock exchange", 782, "Business Responsibility Reports by Listed Companies", H, "Not a syllabus bullet. M2 places it at the end of Lesson 16 (pp.782-783)."),
   ], {}),
   ("Secretarial Standard on Report of the Board of Directors", C, [], {}),
   ("CSR Committee", C, [
     ("Functions and meetings of CSR committee", 778, "The functions of CSR Committee", H, ""),
   ], {"sources": ["S1-footnote", "M2-syllabus"], "relocated_from": "CLP.L17.T01"}),
   ("Policy", C, [], {"sources": ["S1-footnote", "M2-syllabus"], "relocated_from": "CLP.L17.T02", "display_name": "CSR Policy"}),
   ("Activities", C, [
     ("CSR implementation (Rule 4) and eligible activities", 780, "CSR Activities", H, ""),
   ], {"sources": ["S1-footnote", "M2-syllabus"], "relocated_from": "CLP.L17.T04", "display_name": "CSR Activities"}),
 ]),
 (19, "Key Managerial Personnel (KMP's) and their Remuneration", C, [
   ("Appointment of Key Managerial Personnel", C, [], {}),
   ("Managing and Whole-Time Directors, Manager, Chief Executive Officer and Chief Financial Officer", C, [
     ("Appointment, disqualification and approval of MD/WTD/Manager (s.196, Schedule V)", 800, "Appointment of Managing Director, Whole-Time Director or Manager", H, "Covers M2 pp.800-805."),
     ("CEO and CFO", 806, "Chief Executive Officer and Chief Financial Officer", H, ""),
   ], {}),
   ("Company Secretary – Appointment, Role and Responsibilities", C, [
     ("Removal / resignation of company secretary", 815, "Removal of Company Secretary", H, ""),
   ], {}),
   ("Company Secretary as a Key Managerial Personnel", C, [], {"note": "S1 lists this as a separate bullet. M2's printed syllabus merges it with the previous bullet. Kept separate (S1 is the authority)."}),
   ("Functions of Company Secretary", C, [], {}),
   ("Officer who is in default", C, [], {}),
   ("Remuneration of Managerial Personnel", C, [
     ("Overall limits and computation of net profit (s.197/s.198)", 816, "Remuneration of Managerial Personnel", H, "Covers M2 pp.816-823."),
     ("Remuneration in excess of limits; recovery and waiver", 823, "Consequence of Remuneration in Excess of Prescribed Limit", H, ""),
   ], {}),
 ]),
]

PART_I = set(range(1, 13))
S1_FOOTNOTE = {
    10: "*Only following topics, “Oppression and Mismanagement; Class Actions Suits” are deleted from the Executive Programme. The concepts of this lesson are being covered mutatis mutandis in the Paper: Drafting, Pleadings & Appearances of Professional Programme.",
    12: "# This lesson is deleted from the Executive Programme. The concepts are being covered in professional programme Paper: Compliance Management, Audit and Due Diligence.",
    17: "*This Lesson is deleted and the topics, “Policy; Activities and CSR Committee” are relocated in the same paper. The concepts are reallocated in Lesson 18: Annual Report-Concepts ... The topics, “CSR Expenditure; Ongoing Project; Impact Assessment” are deleted from the Executive Programme.",
}


def m2_pages_text():
    out = subprocess.run(["pdftotext", "-layout", str(M2_PDF), "-"], capture_output=True, text=True, check=True).stdout
    return out.split("\f")


def norm(s):
    return re.sub(r"[^a-z0-9]+", " ", s.lower().replace("’", "'")).strip()


def find_lesson_starts(pages):
    """Printed page where each M2 lesson begins (the page containing 'LESSON n' and 'Learning Objectives')."""
    # Lesson opening pages carry both 'KEY CONCEPTS' and 'Learning Objectives'; the lesson number
    # is not always extractable as text, so number them in order of appearance.
    opening = [i + 1 - M2_OFFSET for i, p in enumerate(pages) if "KEY CONCEPTS" in p and "Learning Objectives" in p]
    if len(opening) != 17:
        raise SystemExit(f"expected 17 lesson opening pages in M2, found {len(opening)}: {opening}")
    return {n: pg for n, pg in enumerate(opening, 1)}


def heading_found(pages, printed, heading):
    words = [w for w in norm(heading).split() if len(w) > 2][:6]
    for pdf in (printed + M2_OFFSET, printed + M2_OFFSET + 1):
        if 1 <= pdf <= len(pages):
            txt = norm(pages[pdf - 1])
            if all(w in txt for w in words):
                return pdf
    return None


def main():
    pages = m2_pages_text()
    starts = find_lesson_starts(pages)
    nodes, problems = [], []

    nodes.append({
        "taxonomy_id": "CLP", "level": "subject", "name": "Company Law & Practice", "parent_id": None,
        "syllabus_version": [ORIG, CUR], "status": C, "paper_code": "522", "paper_part": None,
        "source_document": "S1", "source_page": 17, "source_printed_page": 16,
        "source_text": "GROUP 1 COMPANY LAW & PRACTICE Paper-2 ... Part I : Company Law–Principles & Concepts (60 Marks) ... Part II : Company Administration and Meetings (40 Marks)",
        "topic_source_reference": {"document": "S1", "page": 17, "printed_page": 16, "section": "Group 1, Paper 2"},
        "study_material_lesson": None, "basis": "syllabus", "notes": "Executive Programme, Syllabus 2022, Group 1 Paper 2.",
    })

    for (ln, lname, lstatus, topics) in LESSONS:
        lid = f"CLP.L{ln:02d}"
        sm = SM_LESSON[ln]
        versions = [ORIG] if lstatus == D else [ORIG, CUR]
        if lstatus == D:
            src_doc, src_page, src_pp = "S1-ORIG", S1O_PAGE[ln], S1O_PAGE[ln] - 1
        else:
            src_doc, src_page, src_pp = "S1", S1_PAGE[ln], S1_PAGE[ln] - 1
        lnote = []
        if sm is None:
            lnote.append("No lesson in current study material M2 (lesson removed after the Dec 2025 modification).")
        elif sm != ln:
            lnote.append(f"Study material M2 numbers this lesson as Lesson {sm} (renumbered after deletions). The canonical ID keeps the syllabus number {ln}.")
        if ln in S1_FOOTNOTE:
            lnote.append("S1 footnote: " + S1_FOOTNOTE[ln])
        nodes.append({
            "taxonomy_id": lid, "level": "chapter", "name": lname, "parent_id": "CLP",
            "syllabus_version": versions, "status": lstatus, "paper_code": "522",
            "paper_part": "I" if ln in PART_I else "II",
            "syllabus_lesson_number": ln, "study_material_lesson": sm,
            "source_document": src_doc, "source_page": src_page, "source_printed_page": src_pp,
            "source_text": f"{ln} {lname}",
            "topic_source_reference": {"document": src_doc, "page": src_page, "printed_page": src_pp, "section": f"Lesson {ln}: {lname}"},
            "study_material_reference": ({"document": "M2", "page": starts.get(sm), "pdf_page": (starts.get(sm) or 0) + M2_OFFSET, "section": f"Lesson {sm}"} if sm else None),
            "basis": "syllabus_lesson", "notes": " ".join(lnote),
        })
        for ti, (tname, tstatus, subs, extra) in enumerate(topics, 1):
            tid = f"{lid}.T{ti:02d}"
            srcs = extra.get("sources", ["S1"])
            if "S1-ORIG" in srcs and tstatus == D:
                tdoc, tpage = "S1-ORIG", S1O_PAGE[ln]
                ttext = tname
            elif "S1-footnote" in srcs and tstatus == C:
                tdoc, tpage = "S1", S1_PAGE[17]
                ttext = f"Relocated topic '{tname}' (S1 footnote to Lesson 17); also printed under Lesson 16 in M2 syllabus p.(vi)"
            else:
                tdoc, tpage = "S1", S1_PAGE[ln]
                ttext = tname
            tv = [ORIG] if tstatus == D else ([CUR] if extra.get("relocated_from") else [ORIG, CUR])
            tnotes = [extra.get("note", "")]
            if extra.get("relocated_to"):
                tnotes.append(f"ALIAS NODE: relocated from Dec 2025 to {extra['relocated_to']}. Classify questions on this concept (any attempt) to {extra['relocated_to']} and record syllabus_location_at_exam = {tid} for attempts before Dec 2025 (DD-05).")
            if extra.get("relocated_from"):
                tnotes.append(f"Relocated here from {extra['relocated_from']} effective Dec 2025 (S1 footnote). This node is canonical for this concept in all attempts.")
            if tdoc == "S1-ORIG":
                tnotes.append("Topic text exists only in the pre-modification syllabus (S1-ORIG); the current S1 shows the lesson/topic as deleted.")
            ref = {"document": tdoc, "page": tpage, "printed_page": tpage - 1, "section": f"Lesson {ln}: {lname}"}
            if extra.get("group"):
                ref["subsection"] = extra["group"]
            node = {
                "taxonomy_id": tid, "level": "topic", "name": extra.get("display_name", tname), "parent_id": lid,
                "syllabus_version": tv, "status": tstatus, "paper_code": "522",
                "paper_part": "I" if ln in PART_I else "II",
                "source_document": tdoc, "source_page": tpage, "source_printed_page": tpage - 1,
                "source_text": ttext, "topic_source_reference": ref,
                "basis": "syllabus_bullet", "notes": " ".join(n for n in tnotes if n),
            }
            if extra.get("relocated_to"):
                node["classify_to"] = extra["relocated_to"]
                node["classification_use"] = "ALIAS_ONLY"
            if extra.get("relocated_from"):
                node["relocated_from"] = extra["relocated_from"]
            if extra.get("group"):
                node["topic_group"] = extra["group"]
            nodes.append(node)
            for si, (sname, spage, shead, basis, snote) in enumerate(subs, 1):
                sid = f"{tid}.S{si:02d}"
                found = heading_found(pages, spage, shead) if basis == H else None
                if basis == H and not found:
                    problems.append(f"{sid}: heading '{shead}' not found on M2 printed p.{spage} (pdf {spage + M2_OFFSET}) or the next page")
                nodes.append({
                    "taxonomy_id": sid, "level": "subtopic", "name": sname, "parent_id": tid,
                    "syllabus_version": [ORIG] if tstatus == D else ([CUR] if extra.get("relocated_from") else [ORIG, CUR]),
                    "status": tstatus, "paper_code": "522", "paper_part": "I" if ln in PART_I else "II",
                    "source_document": "M2", "source_page": spage, "source_printed_page": spage,
                    "source_text": shead,
                    "topic_source_reference": {"document": "M2", "page": spage, "pdf_page": (found or spage + M2_OFFSET), "section": shead,
                                               "study_material_lesson": sm, "basis": basis},
                    "basis": basis,
                    "notes": snote,
                })

    # Control node for out-of-taxonomy content (methodology §6.2 rule 7)
    nodes.append({
        "taxonomy_id": "CLP.UNMAPPED", "level": "chapter", "name": "Unmapped / out-of-taxonomy (control node)", "parent_id": "CLP",
        "syllabus_version": [ORIG, CUR], "status": C, "paper_code": "522", "paper_part": None,
        "source_document": "PROJECT_METHODOLOGY", "source_page": None, "source_printed_page": None,
        "source_text": "Methodology §6.2 rule 7",
        "topic_source_reference": {"document": "PROJECT_METHODOLOGY.md", "page": None, "section": "§6.2 rule 7"},
        "basis": "control", "node_type": "control",
        "notes": "Not a syllabus node. Questions that fit no node go here with flag OUT_OF_TAXONOMY and are reviewed. Never used in analytics as a topic.",
    })

    # integrity checks
    ids = [n["taxonomy_id"] for n in nodes]
    assert len(ids) == len(set(ids)), "duplicate ids"
    idset = set(ids)
    for n in nodes:
        if n["parent_id"] and n["parent_id"] not in idset:
            problems.append(f"{n['taxonomy_id']}: parent {n['parent_id']} missing")
        if n.get("classify_to") and n["classify_to"] not in idset:
            problems.append(f"{n['taxonomy_id']}: classify_to {n['classify_to']} missing")
        if n.get("relocated_from") and n["relocated_from"] not in idset:
            problems.append(f"{n['taxonomy_id']}: relocated_from {n['relocated_from']} missing")

    if problems:
        print("PROBLEMS:\n  " + "\n  ".join(problems))
        sys.exit(1)

    meta = {
        "taxonomy": "CLP", "taxonomy_version": VERSION, "status": "DRAFT_FOR_HUMAN_REVIEW",
        "paper": "Executive Programme, Syllabus 2022, Group 1, Paper 2 — Company Law & Practice (522)",
        "built_on": "2026-10-07", "generator": "scripts/build_clp_taxonomy_v0_1.py",
        "canonical_numbering": "ICSI Syllabus 2022 lesson numbers (1-19). Study-material numbers recorded in study_material_lesson.",
        "status_values": {C: "In the current syllabus (Dec 2025 onwards) and earlier",
                          D: "Removed from the Executive syllabus effective Dec 2025; kept for Dec 2023 – Jun 2025 questions",
                          P: "Chapter kept, but some of its topics deleted effective Dec 2025"},
        "syllabus_version_values": {ORIG: "Syllabus 2022 as examined Dec 2023 – Jun 2025",
                                    CUR: "Syllabus 2022 as modified, effective Dec 2025"},
        "sources": {
            "S1": {"desc": "ICSI New Syllabus 2022 (modified; ModDate 2025-12-27)", "file": "01_Source_Papers/official_reference/S1/icsi-new-syllabus-2022-9a82f048.pdf"},
            "S1-ORIG": {"desc": "ICSI New Syllabus 2022, pre-modification (created 2025-04-16); Internet Archive capture 2026-03-27 of https://www.icsi.edu/media/webmodules/ICSI%20New%20Syllabus%202022.pdf",
                        "file": "01_Source_Papers/official_reference/S1_original_wayback/icsi-new-syllabus-2022_wayback-20260327.pdf"},
            "S2": {"desc": "Announcement: modifications effective Dec 2025", "file": "01_Source_Papers/official_reference/S2/announcement-01092025-9cbac745.pdf"},
            "M0": {"desc": "Study Material applicable for Dec 2026 exam (28.07.2026)", "file": "01_Source_Papers/official_reference/M0/study-material-applicable-for-dec-2026-examination-188aa857.pdf"},
            "M2": {"desc": "Study material, Company Law & Practice (created 2025-12-12; law up to Nov 2025); 880 pp.", "file": "01_Source_Papers/official_reference/M2/company-law-practices-3e591a57.pdf",
                   "page_convention": "page = printed page; pdf_page = printed + 36"},
        },
        "counts": {lvl: sum(1 for n in nodes if n["level"] == lvl) for lvl in ("subject", "chapter", "topic", "subtopic")},
    }
    out = {"meta": meta, "nodes": nodes}
    (ROOT / "taxonomy" / f"clp_taxonomy_v{VERSION}.json").write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n")

    cols = ["taxonomy_id", "level", "name", "parent_id", "syllabus_version", "status", "paper_part",
            "syllabus_lesson_number", "study_material_lesson", "basis", "source_document", "source_page",
            "source_printed_page", "source_text", "topic_source_reference", "classify_to", "relocated_from",
            "topic_group", "notes"]
    with open(ROOT / "taxonomy" / f"clp_taxonomy_v{VERSION}.csv", "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore")
        w.writeheader()
        for n in nodes:
            row = dict(n)
            row["syllabus_version"] = "|".join(n["syllabus_version"])
            row["topic_source_reference"] = json.dumps(n["topic_source_reference"], ensure_ascii=False)
            w.writerow(row)
    print("OK", meta["counts"], "lesson starts (M2 printed):", starts)


if __name__ == "__main__":
    main()
