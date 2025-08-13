const routes = [
  // 🌐 Core Entry Points
  { path: '/', label: 'Home' },
  { path: '/admin', label: 'Admin Ops', role: 'admin' },
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/game-room', label: 'Game Room' },

  // 🔧 Engine Modules (Internal Only)
  { path: '/internal/engines/engine-grid', label: 'Engine Grid', role: 'dev' },
  { path: '/internal/engines/loopEngineRunner', label: 'Loop Runner', role: 'dev' },
  { path: '/internal/engines/sandboxengine', label: 'Sandbox Engine', role: 'dev' },

  // 💸 XP & Referral System (Public)
  { path: '/invite', label: 'Referrals' },
  { path: '/xp-uplink-chain', label: 'XP Uplink Chain' },
  { path: '/lottery', label: 'XP Lottery' },
  { path: '/crate-reveal', label: 'Crate Reveal' },
  { path: '/missions', label: 'Missions' },
  { path: '/terms', label: 'Terms & XP Policy' },
  { path: '/xp-center', label: 'XP Center' },
  { path: '/xp-history', label: 'XP History' },
  { path: '/xp-shop', label: 'XP Shop' },
  { path: '/atm', label: 'ATM Payout Simulator' },

  // 🧒 Kids Mode (Age-gated with Guardian Logic)
  { path: '/xp-kids', label: 'XP for Kids 🧠', requiresGuardian: true },

  // 🍭 Unified Slot Games (VIP check internal)
  { path: '/games/sweet', label: 'Sweet XPBonanza', vipOnly: true },
  { path: '/games/buffalo', label: 'Buffalo Rush', vipOnly: true },
  { path: '/games/cantina', label: "Felena’s Cantina", vipOnly: true },
  { path: '/games/wheel', label: 'XP Wheel', vipOnly: true },

  // 🎲 Unified Table Games (VIP check internal)
  { path: '/games/dice', label: 'XP Dice', vipOnly: true },
  { path: '/games/cards', label: 'XP Cards', vipOnly: true },
  { path: '/games/crash', label: 'XP Crash', vipOnly: true },
  { path: '/games/heads-tails', label: 'Heads or Tails', vipOnly: true },
  { path: '/games/roulette', label: 'XP Roulette', vipOnly: true },

  // 🏈 Unified Sports Games (VIP check internal)
  { path: '/games/parlay', label: 'XP Parlay', vipOnly: true },
  { path: '/games/sports', label: 'XP Sportsbook', vipOnly: true },

  // 🧬 Internal Recruiting & Structure
  { path: '/recruiting', label: 'DEV Recruiting', role: 'admin' },
  { path: '/company', label: 'Company File', role: 'admin' },
  { path: '/team', label: 'Team Roles', role: 'admin' },
  { path: '/promotion-log', label: 'Promotion Log', role: 'admin' },

  // 🚨 Misc
  { path: '/404', label: 'Not Found' },
];

export default routes;