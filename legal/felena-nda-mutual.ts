// /legal/felena-nda-mutual.ts
//
// PRIVATE MUTUAL NDA (Fort Knox Edition)
// - Not a page. Do NOT put this under /pages.
// - Serve only via a secure, authenticated API for candidates you’re actively hiring.
// - Governing law: Iowa. Venue: Iowa courts. Injunctive relief without bond.
// - Primary notice via email; physical address = “as provided at execution.”
// - Extreme survivals; no “residuals” loophole; comprehensive IP assignment.
// - Covers AI/ML models, datasets, prompts, XP systems, algorithms, infra, roadmaps, legal strategies, etc.

export type NDAParams = {
  // Felena side (pre-filled)
  felenaEntity?: string; // default: "Felena Holdings LLC"
  felenaSignatoryName?: string; // default: "Gage Webster"
  felenaSignatoryTitle?: string; // default: "CEO"
  felenaNoticeEmail?: string; // default: "FelenaTheory@gmail.com"

  // Counterparty side (fill per hire)
  counterpartyName: string;           // e.g., "Jane Doe"
  counterpartyEntity?: string;        // e.g., "Jane Doe LLC" (optional)
  counterpartyEmail: string;          // email used for notices
  counterpartyRole?: string;          // e.g., "Employee", "Contractor", "Advisor"
  effectiveDate?: string;             // e.g., "2025-08-09" (if omitted, uses today's date)
};

export function renderNDA(p: NDAParams): string {
  const today = new Date().toISOString().slice(0, 10);
  const _p = {
    felenaEntity: "Felena Holdings LLC",
    felenaSignatoryName: "Gage Webster",
    felenaSignatoryTitle: "CEO",
    felenaNoticeEmail: "FelenaTheory@gmail.com",
    counterpartyEntity: p.counterpartyEntity || p.counterpartyName,
    counterpartyRole: p.counterpartyRole || "Employee",
    effectiveDate: p.effectiveDate || today,
    ...p,
  };

  return NDA_TEMPLATE
    .replaceAll("[[EFFECTIVE_DATE]]", _p.effectiveDate)
    .replaceAll("[[FELENA_ENTITY]]", _p.felenaEntity)
    .replaceAll("[[FELENA_SIGNATORY_NAME]]", _p.felenaSignatoryName)
    .replaceAll("[[FELENA_SIGNATORY_TITLE]]", _p.felenaSignatoryTitle)
    .replaceAll("[[FELENA_NOTICE_EMAIL]]", _p.felenaNoticeEmail)
    .replaceAll("[[COUNTERPARTY_NAME]]", _p.counterpartyName)
    .replaceAll("[[COUNTERPARTY_ENTITY]]", _p.counterpartyEntity!)
    .replaceAll("[[COUNTERPARTY_ROLE]]", _p.counterpartyRole!)
    .replaceAll("[[COUNTERPARTY_NOTICE_EMAIL]]", _p.counterpartyEmail);
}

export const NDA_TEMPLATE = `

MUTUAL NON‑DISCLOSURE, NON‑USE, NON‑CIRCUMVENTION, AND IP ASSIGNMENT AGREEMENT
(“Agreement”)

Effective Date: [[EFFECTIVE_DATE]]

PARTIES:
(1) [[FELENA_ENTITY]] (“Felena”), by and through its authorized signatory; and
(2) [[COUNTERPARTY_ENTITY]] (“Counterparty”).

RECITALS (WHY THIS IS MORE AGGRESSIVE THAN NORMAL):
A. Felena is building a pioneering, legally compliant but strategically novel system spanning AI/ML models, algorithmic signals, XP rewards and conversion logic, financial/broker integrations (including but not limited to Alpaca connectivity), real‑time engines, mission and crate mechanics, lottery-style engagement flows, guardian/child-safety gating, and proprietary operational, legal, and compliance structures (collectively, the “Felena System”).
B. Felena operates in complex, evolving regulatory landscapes and strategic legal grey zones while remaining compliant; disclosure or misuse of methods, algorithms, or business/legal structures could irreparably damage Felena’s advantage, regulatory posture, and ability to operate.
C. Therefore, the Parties agree to unusually strict confidentiality, non‑use, non‑circumvention, IP ownership, and enforcement provisions to protect Felena’s unique and non‑replaceable competitive position and Counterparty’s legitimate proprietary interests.

1. DEFINITIONS.
1.1 “Confidential Information” means any non‑public information disclosed by either Party, whether oral, visual, written, electronic, machine‑generated, demonstrative, or otherwise, including: source code, repositories, scripts, prompts, datasets, features, labels, embeddings, weights, RL/reward schemes, evaluation frameworks, dashboards; XP systems, crates, missions, lotteries, progression logic; financial/broker connectivity, keys, secrets, flows; legal strategies, compliance interpretations, tax positions; product roadmaps; pricing; analytics; investor, vendor, and partner info; user or operator data; system topologies; runbooks; monitoring; operational metrics; SRE/security practices; and any derivative, improvement, or feedback thereon. Confidential Information includes that disclosed prior to this Agreement, and anything derived from Felena’s materials, whether or not marked confidential. Trade secrets are included and protected as such.
1.2 “Purpose” means evaluation of, employment with, or services for Felena, and performing duties as [[COUNTERPARTY_ROLE]].
1.3 “Trade Secret” retains the broadest meaning under applicable law (including the Iowa Uniform Trade Secrets Act and the U.S. Defend Trade Secrets Act).

2. NON‑DISCLOSURE; NON‑USE.
2.1 Non‑Disclosure. Each Party will keep the other’s Confidential Information strictly confidential, using at least the degree of care used to protect its own information of similar sensitivity, and no less than a commercially reasonable standard.
2.2 Non‑Use. Counterparty will use Felena’s Confidential Information solely for the Purpose and not for any competitive, personal, or third‑party purpose, and will not reverse engineer, decompile, derive, or attempt to reconstruct ideas, algorithms, models, or systems from such information.
2.3 Need‑to‑Know Access. Disclosures are limited to personnel/contractors bound by written obligations at least as strict as this Agreement. Counterparty is fully responsible for their compliance.

3. NON‑CIRCUMVENTION; NON‑SOLICIT; NON‑COMPETE (MAXIMUM EXTENT ALLOWABLE).
3.1 Non‑Circumvention. Counterparty will not bypass Felena to deal directly with Felena’s vendors, investors, partners, or customers/prospects introduced or identified by Felena to obtain similar or competitive advantages, for the longer of (a) twenty‑five (25) years or (b) the maximum period permissible by law.
3.2 Non‑Solicitation. Counterparty will not solicit for employment/engagement or hire any Felena employee, contractor, or advisor they interacted with through Felena for twenty‑five (25) years, except with Felena’s written consent. General ads not targeted at Felena personnel are permitted.
3.3 Non‑Compete. To the fullest extent permitted, Counterparty agrees not to engage in any business substantially similar to, or that competes with, the Felena System (including XP grids, AI signal engines, algorithmic cashout pathways, guardian/child XP frameworks, and lottery/mission mechanics) for twenty‑five (25) years worldwide. If a court limits this, it shall enforce the maximum permissible scope (time/geo/scope blue‑penciling acknowledged).

4. IP OWNERSHIP; ASSIGNMENT; FEEDBACK.
4.1 Felena IP. All rights, title, and interest in and to the Felena System and all derivatives, updates, or improvements, whether created before, during, or after engagement and whether created solely or jointly by Counterparty using Felena’s Confidential Information, are and remain exclusively Felena’s.
4.2 Assignment. Counterparty hereby irrevocably assigns to Felena all IP (in any form) conceived, developed, reduced to practice, improved, or authored (alone or with others) during engagement **that relates to or is derived from** Felena’s Confidential Information or the Felena System. Counterparty will execute all papers and do all acts (even after engagement) to perfect Felena’s rights. If Counterparty fails to do so, Counterparty appoints Felena as attorney‑in‑fact solely to perfect/record assignment.
4.3 Moral Rights Waiver. To the extent allowed by law, Counterparty waives any moral rights in assigned IP.
4.4 Feedback. Any feedback is non‑confidential as to Counterparty and becomes Felena’s property; Felena may use it without restriction or attribution.

5. SECURITY; HANDLING; RETURN/DESTRUCTION.
5.1 Safeguards. Counterparty will implement reasonable and appropriate administrative, technical, and physical safeguards (MFA, least privilege, encrypted storage in transit/at rest, access logging, no credential sharing).
5.2 No Third‑Party AI Disclosure. Counterparty may not input or upload Felena’s Confidential Information into any external LLM/AI service or dataset without Felena’s written consent.
5.3 Return/Destruction. Upon Felena’s request or termination, Counterparty will promptly cease use and return or securely destroy all Confidential Information (including derivatives and notes) and certify destruction in writing within 5 business days, except for minimal archival copies required by law, which remain confidential indefinitely.

6. EXCEPTIONS; LEGAL PROCESS.
6.1 Exceptions. Confidentiality obligations do not apply to information that: (a) was public without breach; (b) was known by the recipient without duty of confidentiality before disclosure (with contemporaneous evidence); (c) is independently developed without use of the other’s Confidential Information; or (d) is rightfully received from a third party without duty of confidentiality.
6.2 Legal Process. If compelled by law to disclose, recipient will disclose only the minimum required and, where lawful, give prompt written notice to allow the discloser to seek protective orders.

7. NO RESIDUALS; NO LICENSE.
7.1 No Residuals. The “residuals” concept is expressly disclaimed; memory or unaided recollection does not grant any license or right to use Confidential Information post‑termination.
7.2 No License. No rights are granted by implication, estoppel, or otherwise; all rights are reserved.

8. DATA; PRIVACY; EXPORT.
8.1 Data. Any personal data processed must be minimal, necessary, and subject to applicable privacy laws. Counterparty will not re‑identify, sell, or misuse any data.
8.2 Export. Counterparty will comply with export controls and sanctions laws for all tech and data.

9. TERM; SURVIVAL.
9.1 Term. This Agreement commences on the Effective Date and continues for ninety‑nine (99) years unless terminated earlier by written notice. Termination does not affect any accrued obligations.
9.2 Survival. Sections 1–11 survive expiration/termination for ninety‑nine (99) years; Trade Secret protections survive indefinitely.

10. REMEDIES; ENFORCEMENT; FEES.
10.1 Irreparable Harm. Any breach (or threatened breach) may cause irreparable harm; the non‑breaching Party may seek injunctive relief without bond, in addition to damages and any other remedies.
10.2 Fee‑Shifting. The prevailing Party in any action will recover reasonable attorneys’ fees and costs.
10.3 Audit/Forensics. Felena may require reasonable forensic review by an independent third party (under NDA) where a credible breach is suspected; Counterparty will cooperate.

11. GOVERNING LAW; VENUE; JURY TRIAL WAIVER.
11.1 Governing Law. Iowa law governs, without regard to conflict‑of‑law rules.
11.2 Venue. The state and federal courts located in Iowa have exclusive jurisdiction. The Parties consent to personal jurisdiction and venue there and waive any objections.
11.3 Jury Trial Waiver. Each Party waives the right to a jury trial to the fullest extent permitted.

12. NOTICES.
12.1 Email is a valid notice method. Notices to Felena: [[FELENA_NOTICE_EMAIL]]. Notices to Counterparty: [[COUNTERPARTY_NOTICE_EMAIL]].
12.2 Physical addresses for notice are “as provided by each Party at the time of execution” and may be updated by written notice. Email notices are effective on transmission (with standard delivery proof).

13. MISCELLANEOUS.
13.1 Entire Agreement; Order of Precedence. This is the entire agreement on these subjects and supersedes prior discussions. If a separate employment/contractor agreement exists, the stricter term(s) govern.
13.2 Amendments; Waivers. Must be in a signed writing. No waiver is implied by delay or course of dealing.
13.3 Assignment. Felena may assign to affiliates, successors, or in connection with financing/M&A. Counterparty may not assign without Felena’s written consent.
13.4 Severability; Blue‑Penciling. If any provision is unenforceable, a court shall modify it to the maximum enforceable scope, and the remainder remains in force.
13.5 Counterparts; E‑Sign. This Agreement may be executed electronically and in counterparts.

SIGNATURES:

FELENA:
Name: [[FELENA_SIGNATORY_NAME]]
Title: [[FELENA_SIGNATORY_TITLE]]
For: [[FELENA_ENTITY]]
Email (Notices): [[FELENA_NOTICE_EMAIL]]
Signature: ________________________  Date: ____________

COUNTERPARTY:
Name: [[COUNTERPARTY_NAME]]
For/Entity: [[COUNTERPARTY_ENTITY]]
Role: [[COUNTERPARTY_ROLE]]
Email (Notices): [[COUNTERPARTY_NOTICE_EMAIL]]
Signature: ________________________  Date: ____________

`;

