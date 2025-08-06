// legal/operating_agreement.ts
// Operating Agreement for Felena Holdings LLC
// Legal Owner & CEO: Gage Webster

export const OperatingAgreement = {
  companyName: 'Felena Holdings LLC',
  legalStructure: 'Single-Member Limited Liability Company (SMLLC)',
  jurisdiction: 'United States',
  effectiveDate: 'August 3, 2025',

  ownership: {
    primaryOwner: 'Gage Webster',
    ownershipPercent: 100,
    role: 'Chief Executive Officer (CEO)',
    authority: [
      'Retain full legal and creative control',
      'Authorize or dissolve DBAs under LLC',
      'Sign and execute all IP, licensing, and financial contracts',
    ]
  },

  companyPurpose: `
    Felena Holdings LLC exists to develop, deploy, and protect a modular technology ecosystem rooted in XP-based autonomy, behavioral finance, algorithmic trading, and educational gamification. It serves as the sole entity housing all brands, DBAs, intellectual property, and data systems across the Felena Theory platform.
  `,

  dbaControl: {
    legalStatus: 'All DBAs function as internal operational branches of the LLC',
    EIN: 'Single EIN used across all activities',
    taxationNote: 'All revenue and liabilities flow to Felena Holdings LLC tax return',
    IPStatement: 'All assets created under any DBA are the sole property of the LLC',
  },

  governance: {
    meetings: 'At CEO discretion',
    amendments: 'Must be approved by Gage Webster in writing',
    dissolution: 'Felena Holdings LLC may dissolve DBAs or the master entity upon written declaration',
  },

  legalClauses: [
    'This agreement supersedes all prior internal arrangements',
    'Any investor, partner, or entity must operate under explicit licensing or advisory agreement',
    'No DBA may function independently or issue equity without amendment',
    'All systems are bound to the IP master license agreement under this structure'
  ]
};