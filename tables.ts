// src/lib/casino/tables.ts

export type TableConfig = {
slug: string; // URL slug used by /casino/tables/[slug].tsx
title: string; // Display title
blurb: string; // One-line description for the hub tile
spec?: string; // Quick rules/payout note (optional)
};

export const TABLES: TableConfig[] = [
{
slug: "american-roulette",
title: "American Roulette",
blurb: "Double-zero wheel with 38 slots. Classic U.S. layout.",
spec: "35:1 straight; 2 green zeros.",
},
{
slug: "european-roulette",
title: "European Roulette",
blurb: "Single-zero wheel. Optional La Partage / En Prison.",
spec: "Lower edge vs. American; 35:1 straight.",
},
{
slug: "blackjack",
title: "Blackjack",
blurb: "Core 21 with standard house rules.",
spec: "3:2 BJ; dealer stands soft 17 (configurable).",
},
{
slug: "free-bet-blackjack",
title: "Free Bet Blackjack",
blurb: "Free doubles & splits with dealer push on 22.",
spec: "Common side rules supported.",
},
{
slug: "spanish-21",
title: "Spanish 21",
blurb: "No tens in deck and rich bonus pays.",
spec: "Multiple bonus combinations.",
},
{
slug: "baccarat",
title: "Baccarat",
blurb: "Punto Banco with Banker/Player/Tie and sides.",
spec: "5% commission (or no-commission variants).",
},
{
slug: "craps",
title: "Craps",
blurb: "Pass/Don’t, odds, place, and prop action.",
spec: "Full odds configurable.",
},
{
slug: "sic-bo",
title: "Sic Bo",
blurb: "Fast dice totals, triples, and small/big bets.",
},
{
slug: "pai-gow-poker",
title: "Pai Gow Poker",
blurb: "Set high/low hands; optional Dragon bonus.",
spec: "Commission or commission-free variants.",
},
{
slug: "three-card-poker",
title: "Three Card Poker",
blurb: "Ante/Play with Pair Plus side bet.",
},
{
slug: "ultimate-texas-holdem",
title: "Ultimate Texas Hold’em",
blurb: "Raise windows across streets; Blind/Trips pays.",
},
{
slug: "caribbean-stud",
title: "Caribbean Stud",
blurb: "Classic 5-card vs dealer; progressive-ready.",
},
{
slug: "let-it-ride",
title: "Let It Ride",
blurb: "Pull back or let it ride across three stages.",
},
{
slug: "mississippi-stud",
title: "Mississippi Stud",
blurb: "Raise 3rd/4th/5th street — high volatility.",
},
{
slug: "casino-war",
title: "Casino War",
blurb: "Simple high-card showdown with tie option.",
},
{
slug: "big-six-wheel",
title: "Big Six Wheel",
blurb: "Spin the money wheel and pick your slice.",
},
{
slug: "teen-patti",
title: "Teen Patti",
blurb: "Popular three-card showdown from India.",
},
{
slug: "dragon-tiger",
title: "Dragon Tiger",
blurb: "One-card duel — lightning fast hands.",
},
{
slug: "video-poker-jacks",
title: "Video Poker — Jacks or Better",
blurb: "Classic paytable with skillful holds.",
spec: "9/6 option supported.",
},
{
slug: "video-poker-deuces",
title: "Video Poker — Deuces Wild",
blurb: "Wild 2s and big quad bonuses.",
},
];

// Helpers
export const TABLE_LIST = TABLES; // convenience alias used by the hub
export const getTableBySlug = (slug: string) =>
TABLES.find((t) => t.slug === slug);