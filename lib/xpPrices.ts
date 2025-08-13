// src/lib/xpPrices.ts
export type XpSku = { xp: number; priceId: string; label: string };

export const XP_PRICE_LIST: XpSku[] = [
  { xp: 5, priceId: 'price_1RspcxB2N1r8kXW1KuNcNNje', label: '5 XP — $5.00' },
  { xp: 10, priceId: 'price_1RspjgB2N1rBkXW1viC46Z6Q', label: '10 XP — $10.00' },
  { xp: 20, priceId: 'price_1RspI1B2N1rBkXW1bb1hdhOj', label: '20 XP — $20.00' },
  { xp: 50, priceId: 'price_1RspmWB2N1rBkXW1uw1ILk07', label: '50 XP — $50.00' },
  { xp: 100, priceId: 'price_1RspoKB2N1r8kXW1vpI5a6Uf', label: '100 XP — $100.00' },
  { xp: 250, priceId: 'price_1RsppXB2N1r8kXW1wqWZe4wH', label: '250 XP — $250.00' },
  { xp: 500, priceId: 'price_1RspqYB2N1r8kXW1013ZuP17', label: '500 XP — $500.00' },
  { xp: 1000, priceId: 'price_1RsprbB2N1r8kXW1J4MDd1uq', label: '1,000 XP — $1,000.00' },
  { xp: 2500, priceId: 'price_1RspskB2N1r8kXW1dkLVn341', label: '2,500 XP — $2,500.00' },
  { xp: 5000, priceId: 'price_1RsptlB2N1rBkXW14iktOLVo', label: '5,000 XP — $5,000.00' },
  { xp: 10000, priceId: 'price_1RspvNB2N1r8kXW13PBHnZBz', label: '10,000 XP — $10,000.00' },
  { xp: 15000, priceId: 'price_1RspwsB2N1r8kXW1iWW5sJlc', label: '15,000 XP — $15,000.00' },
  { xp: 20000, priceId: 'price_1RspyAB2N1r8kXW17IZhuOho', label: '20,000 XP — $20,000.00' },
  { xp: 25000, priceId: 'price_1RspzuB2N1r8kXW1rHPz6cjf', label: '25,000 XP — $25,000.00' },
  { xp: 50000, priceId: 'price_1Rsq1LB2N1r8kXW1ukjYiEY9', label: '50,000 XP — $50,000.00' },
  { xp: 75000, priceId: 'price_1Rsq2dB2N1rBkXW1jx8ry1YK', label: '75,000 XP — $75,000.00' },
  { xp: 100000, priceId: 'price_1Rsq4SB2N1r8kXW14kB5GxHS', label: '100,000 XP — $100,000.00' },
];

// quick lookup by priceId
export const XP_BY_PRICE_ID = new Map(XP_PRICE_LIST.map((i) => [i.priceId, i]));
