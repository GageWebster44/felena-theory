import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import styles from "@/styles/index.module.css";

/**
* PHONE ROUTING
* 100 Deposit (USD -> XP)
* 101 Withdraw (XP -> USD)
* 110 Ledger
* 120 Redeem (Directory required)
* 200s Partners (rides/delivery): 200 Uber, 201 Lyft, 210 DoorDash, 211 UberEats
* 300s Retail: 300 Amazon, 301 Walmart, 302 Target, 303 BestBuy
* 400s Travel: 400 Delta, 401 United, 402 Southwest, 410 Marriott, 411 Airbnb
* 500s Food/Restaurants: 500 Starbucks, 501 Chipotle, 502 Domino's
* 600s Gaming/Entertainment: 600 PlayStation, 601 Xbox, 602 Steam
* 700-799 Send XP to Operator extension (e.g., 742 -> sends XP to OP-742)
* 900 Raffles Catalog (enter raffles for prizes; XP = $USD entry value)
*/

type DirectoryItem = {
code: string;
label: string;
desc: string;
};

const DIRECTORY: DirectoryItem[] = [
// Core flows
{ code: "100", label: "Deposit", desc: "USD → XP (1 USD = 1 XP)" },
{ code: "101", label: "Withdraw", desc: "XP → USD" },
{ code: "110", label: "Ledger", desc: "View transactions" },
{ code: "120", label: "Redeem", desc: "Choose a partner and amount" },
// Rides / Delivery
{ code: "200", label: "Uber", desc: "Ride codes" },
{ code: "201", label: "Lyft", desc: "Ride codes" },
{ code: "210", label: "DoorDash", desc: "Food delivery" },
{ code: "211", label: "UberEats", desc: "Food delivery" },
// Retail
{ code: "300", label: "Amazon", desc: "Retail credit" },
{ code: "301", label: "Walmart", desc: "Retail credit" },
{ code: "302", label: "Target", desc: "Retail credit" },
{ code: "303", label: "BestBuy", desc: "Electronics" },
// Travel / Stay
{ code: "400", label: "Delta", desc: "Airline eCredit" },
{ code: "401", label: "United", desc: "Airline eCredit" },
{ code: "402", label: "Southwest", desc: "Airline eCredit" },
{ code: "410", label: "Marriott", desc: "Hotel gift cards" },
{ code: "411", label: "Airbnb", desc: "Stay credits" },
// Restaurants
{ code: "500", label: "Starbucks", desc: "Coffee cards" },
{ code: "501", label: "Chipotle", desc: "Food cards" },
{ code: "502", label: "Domino's", desc: "Pizza cards" },
// Gaming / Entertainment
{ code: "600", label: "PlayStation", desc: "PSN cards" },
{ code: "601", label: "Xbox", desc: "Microsoft / Xbox" },
{ code: "602", label: "Steam", desc: "PC gaming" },
// Raffles / Prizes
{ code: "900", label: "Raffles", desc: "Enter raffles (Disney trip, Teslas, etc.)" },
];

const USD_PER_XP = 1; // hard parity

// —— helpers for fake codes/tickets ——
function randomGroups(groups: number[], alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789") {
return groups
.map((len) =>
Array.from({ length: len }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("")
)
.join("-");
}
function makeGiftCode(partner: string, amount: number) {
const prefix = partner.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4) || "GIFT";
return `${prefix}-${randomGroups([4, 4, 4])}-${String(amount).padStart(3, "0")}`;
}
function makeRaffleTicket(prizeKey: string) {
const key = prizeKey.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
return `${key}-${randomGroups([3, 3, 3])}`;
}

export default function PhoneBoothPage() {
// Animated reactor backdrop
const [streams, setStreams] = useState<string[]>([]);
useEffect(() => {
const ROWS = 22,
COLS = 64;
const makeLine = () => Array.from({ length: COLS }, () => (Math.random() < 0.5 ? "0" : "1")).join("");
setStreams(Array.from({ length: ROWS }, makeLine));
const id = setInterval(() => {
setStreams((prev) => {
const next = prev.slice();
for (let i = 0; i < 3; i++) next[Math.floor(Math.random() * ROWS)] = makeLine();
return next;
});
}, 320);
return () => clearInterval(id);
}, []);

// Dialer state
const [number, setNumber] = useState<string>("");
const [patching, setPatching] = useState<boolean>(false);
const [status, setStatus] = useState<string>("Press to Dial · Deposit · Withdraw · Redeem · Raffles");

// Demo account
const [xp, setXp] = useState<number>(2000);

// Trace (for quick feedback)
const [lastGift, setLastGift] = useState<{ partner: string; amount: number; code: string } | null>(null);
const [lastTicket, setLastTicket] = useState<{ prize: string; cost: number; ticket: string } | null>(null);

// Helpers
const pushDigit = (d: string) => setNumber((n) => (n + d).slice(0, 8));
const clearDigits = () => setNumber("");
const isExtension = (num: string) => /^7\d{2,}$/.test(num); // 700..799(+)

// Router
async function handleCall(num: string) {
if (!num) return;
setPatching(true);
setStatus("Patching you through…");
await new Promise((r) => setTimeout(r, 900));
try {
if (num === "100") return flowDeposit();
if (num === "101") return flowWithdraw();
if (num === "110") return flowLedger();
if (num === "120") return flowRedeemStart();

const direct = DIRECTORY.find((d) => d.code === num);
if (direct) {
if (direct.code === "900") return flowRaffles(); // prizes now raffles
return flowPartnerRedeem(direct);
}

if (isExtension(num)) return flowSendToOperator(num);

setStatus("Number not recognized. Try a directory button below.");
} finally {
setPatching(false);
}
}

// —— Flows (stubbed) ——
function flowDeposit() {
const value = prompt("Deposit amount (USD → XP):", "50");
if (!value) return setStatus("Deposit cancelled.");
const amt = Math.max(0, Math.floor(Number(value) || 0));
setXp((x) => x + amt);
alert(`Deposited $${amt} → +${amt} XP`);
setStatus(`Deposit complete. Balance: ${xp + amt} XP`);
}

function flowWithdraw() {
const value = prompt("Withdraw amount (XP → USD):", "50");
if (!value) return setStatus("Withdraw cancelled.");
const amt = Math.max(0, Math.floor(Number(value) || 0));
if (amt > xp) return setStatus("Insufficient XP.");
setXp((x) => x - amt);
alert(`Withdrew ${amt} XP → $${amt}`);
setStatus(`Withdraw complete. Balance: ${xp - amt} XP`);
}

function flowLedger() {
const gift = lastGift ? `Last gift: ${lastGift.partner} $${lastGift.amount} • ${lastGift.code}` : "No gifts yet.";
const r = lastTicket ? `Last raffle: ${lastTicket.prize} $${lastTicket.cost} • ${lastTicket.ticket}` : "No raffles yet.";
alert(`Ledger (demo)\n• Balance: ${xp} XP\n• ${gift}\n• ${r}`);
setStatus("Ledger opened.");
}

function flowRedeemStart() {
alert("Pick a partner in the directory or dial their code (e.g., 300 for Amazon).");
setStatus("Select a partner to redeem.");
}

// Gift card redemption: generates a real-looking code worth exactly the XP amount ($1 = 1 XP)
function flowPartnerRedeem(item: DirectoryItem) {
const value = prompt(`Redeem with ${item.label}\nEnter amount (XP = $USD):`, "25");
if (!value) return setStatus("Redemption cancelled.");
const amt = Math.max(1, Math.floor(Number(value) || 0));
if (amt > xp) return setStatus("Insufficient XP.");
const code = makeGiftCode(item.label, amt);
setXp((x) => x - amt);
setLastGift({ partner: item.label, amount: amt, code });
alert(
`${item.label} gift issued for $${amt} (=${amt} XP)\nCode: ${code}\n\nUse this like a normal gift card equal to the exact amount.`
);
setStatus(`${item.label} gift sent: $${amt}. Balance: ${xp - amt} XP`);
}

// Operator P2P
function flowSendToOperator(ext: string) {
const opId = `OP-${ext}`;
const value = prompt(`Send XP to ${opId}\nAmount:`, "10");
if (!value) return setStatus("Transfer cancelled.");
const amt = Math.max(1, Math.floor(Number(value) || 0));
if (amt > xp) return setStatus("Insufficient XP.");
setXp((x) => x - amt);
alert(`Sent ${amt} XP to ${opId}.`);
setStatus(`Sent ${amt} XP to ${opId}. Balance: ${xp - amt} XP`);
}

// RAFFLES: choose prize → cost in USD → XP deducted → ticket generated
function flowRaffles() {
const choice = prompt(
"Raffles (XP = $USD entry amount):\n" +
"1) 4x Disney World Park Hoppers + Airlines + Hotel (~$3,200)\n" +
"2) Tesla Model 3 RWD (~$38,000)\n" +
"3) Tesla Model Y Long Range (~$48,000)\n" +
"4) PS5 Bundle (~$650)\n" +
"5) Custom prize / custom entry amount\n\nPick 1-5:",
"1"
);
if (!choice) return setStatus("Raffles cancelled.");

type Prize = { name: string; cost: number };
let prize: Prize;

if (choice === "1") prize = { name: "Disney Trip Bundle", cost: 3200 };
else if (choice === "2") prize = { name: "Tesla Model 3 RWD", cost: 38000 };
else if (choice === "3") prize = { name: "Tesla Model Y Long Range", cost: 48000 };
else if (choice === "4") prize = { name: "PlayStation 5 Bundle", cost: 650 };
else {
const name = prompt("Custom prize name (e.g., 'MacBook Pro 14”'):", "Custom Prize");
if (!name) return setStatus("Raffles cancelled.");
const amtStr = prompt("Entry amount in XP (=$USD):", "500");
if (!amtStr) return setStatus("Raffles cancelled.");
const amt = Math.max(1, Math.floor(Number(amtStr) || 0));
prize = { name, cost: amt };
}

if (prize.cost > xp) return setStatus("Insufficient XP for this raffle entry.");
const ticket = makeRaffleTicket(prize.name);
setXp((x) => x - prize.cost);
setLastTicket({ prize: prize.name, cost: prize.cost, ticket });

alert(
`Raffle entry confirmed:\n• Prize: ${prize.name}\n• Entry: ${prize.cost} XP ($${prize.cost})\n• Ticket: ${ticket}\n\nWinners are drawn transparently; unused pools roll to the next draw.`
);
setStatus(`Entered ${prize.name} raffle. Ticket ${ticket}. Balance: ${xp - prize.cost} XP`);
}

// Directory groups
const groups = useMemo(() => {
const g: Record<string, DirectoryItem[]> = {
Core: [],
"Rides / Delivery": [],
Retail: [],
"Travel / Stay": [],
Food: [],
Gaming: [],
Raffles: [],
};
for (const d of DIRECTORY) {
if (["100", "101", "110", "120"].includes(d.code)) g["Core"].push(d);
else if (d.code.startsWith("2")) g["Rides / Delivery"].push(d);
else if (d.code.startsWith("3")) g["Retail"].push(d);
else if (d.code.startsWith("4")) g["Travel / Stay"].push(d);
else if (d.code.startsWith("5")) g["Food"].push(d);
else if (d.code.startsWith("6")) g["Gaming"].push(d);
else if (d.code === "900") g["Raffles"].push(d);
}
return g;
}, []);

return (
<div className={styles.page}>
<Head>
<title>PhoneBooth — Felena Theory</title>
<meta
name="description"
content="Dial to Deposit/Withdraw, redeem exact-amount gift cards (Amazon, DoorDash, Uber, airlines, hotels), send XP to Operator extensions, and enter raffles for real-world prizes."
/>
</Head>

<main className={styles.wrap}>
{/* matrix layer */}
<div className="reactorBackground" aria-hidden="true">
{streams.map((blob, i) => (
<pre key={i} className="reactorStream">
{blob}
</pre>
))}
</div>

<section className="booth" role="region" aria-label="PhoneBooth Dialer">
{patching && (
<div className="patchOverlay" aria-live="polite">
<div className="pulse" />
<div className="patchText">Patching you through…</div>
</div>
)}

<header className={styles.hero}>
<h1 className={styles.title}>PHONEBOOTH</h1>
<p className={styles.tag}>{status}</p>
<p className={styles.tag} style={{ marginTop: 6 }}>
Balance: <strong>{xp.toLocaleString()} XP</strong> (${(xp * USD_PER_XP).toLocaleString()})
</p>
{(lastGift || lastTicket) && (
<p className={styles.tag} style={{ marginTop: 6 }}>
{lastGift
? `Last gift → ${lastGift.partner} $${lastGift.amount} • ${lastGift.code}`
: `Last raffle → ${lastTicket!.prize} $${lastTicket!.cost} • ${lastTicket!.ticket}`}
</p>
)}
</header>

<div className="boothGrid">
{/* Dialer */}
<div className="panel dialer">
<div className="lcd" aria-live="polite">
{number || "— — —"}
</div>
<div className="pad">
{["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((d) => (
<button key={d} className="key" onClick={() => setNumber((n) => (n + d).slice(0, 8))}>
{d}
</button>
))}
</div>
<div className="actions">
<button className="call" onClick={() => handleCall(number)}>
Call
</button>
<button className="clear" onClick={() => setNumber("")}>
Clear
</button>
</div>
<p className={styles.tag} style={{ marginTop: 8 }}>
Tip: dial <strong>100</strong> for Deposit, <strong>101</strong> for Withdraw,{" "}
<strong>700–799</strong> to send XP to an Operator (e.g., 742).
</p>
</div>

{/* Directory */}
<div className="panel directory">
<h3 style={{ marginTop: 0 }}>Directory</h3>

{Object.entries(groups).map(([title, items]) => (
<div key={title} className="group">
<h4 className="groupLabel">{title}</h4>
<div className="groupGrid">
{items.map((it) => (
<button
key={it.code}
className="dirBtn"
onClick={() => handleCall(it.code)}
title={it.desc}
aria-label={`Call ${it.code} (${it.label})`}
>
<span className="dirCode">{it.code}</span>
<span className="dirLabel">{it.label}</span>
</button>
))}
</div>
</div>
))}

<div className={styles.ctaRow} style={{ marginTop: 12 }}>
<Link href="/terms" className={`${styles.btn} ${styles.btnGhost}`}>
Terms
</Link>
<Link href="/preorder" className={`${styles.btn} ${styles.btnGhost}`}>
Explore Ecosystem
</Link>
</div>
</div>
</div>
</section>
</main>

{/* Local styles (dialer visuals) */}
<style jsx>{`
.reactorBackground {
position: absolute;
inset: 0;
z-index: 0;
display: grid;
grid-template-rows: repeat(22, 1fr);
align-items: center;
justify-items: center;
pointer-events: none;
opacity: 0.14;
mix-blend-mode: screen;
}
.reactorStream {
margin: 0;
font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
"Courier New", monospace;
font-size: 12px;
letter-spacing: 0.5px;
color: rgba(0, 255, 136, 0.55);
text-shadow: 0 0 6px rgba(0, 255, 136, 0.35);
user-select: none;
white-space: pre;
}

.booth {
position: relative;
z-index: 1;
}
.boothGrid {
display: grid;
gap: 16px;
grid-template-columns: 320px 1fr;
}
@media (max-width: 860px) {
.boothGrid {
grid-template-columns: 1fr;
}
}

.panel {
border: 1px solid rgba(0, 255, 136, 0.28);
border-radius: 14px;
padding: 16px;
background: linear-gradient(180deg, rgba(0, 20, 8, 0.35), rgba(0, 0, 0, 0.55));
box-shadow: inset 0 0 20px rgba(0, 255, 136, 0.08), 0 0 20px rgba(0, 128, 64, 0.15);
}

.dialer .lcd {
height: 48px;
border-radius: 10px;
display: grid;
place-items: center;
border: 1px solid rgba(0, 255, 136, 0.35);
background: radial-gradient(circle at 30% 30%, rgba(0, 255, 136, 0.12), rgba(0, 0, 0, 0.65) 70%);
box-shadow: inset 0 0 16px rgba(0, 255, 136, 0.15);
font-weight: 900;
font-size: 22px;
color: #a9ffd1;
text-shadow: 0 0 10px rgba(0, 255, 136, 0.35);
margin-bottom: 12px;
}
.pad {
display: grid;
gap: 10px;
grid-template-columns: repeat(3, 1fr);
}
.key {
border: 1px solid rgba(0, 255, 136, 0.35);
border-radius: 12px;
padding: 14px 0;
background: linear-gradient(180deg, rgba(0, 255, 136, 0.1), rgba(0, 0, 0, 0.35));
box-shadow: inset 0 0 12px rgba(0, 255, 136, 0.12), 0 0 10px rgba(0, 255, 136, 0.18);
font-weight: 900;
font-size: 18px;
color: #d9ffe0;
transition: transform 0.08s ease, box-shadow 0.18s ease, background 0.18s ease;
}
.key:hover {
transform: translateY(-1px);
}
.key:active {
transform: translateY(0);
box-shadow: inset 0 0 18px rgba(0, 255, 136, 0.22);
}

.actions {
display: grid;
grid-template-columns: 1fr 1fr;
gap: 10px;
margin-top: 10px;
}
.call,
.clear {
border: 1px solid rgba(0, 255, 136, 0.45);
border-radius: 10px;
padding: 10px 0;
font-weight: 900;
background: linear-gradient(180deg, rgba(0, 255, 136, 0.16), rgba(0, 0, 0, 0.38));
color: #eaffe9;
box-shadow: inset 0 0 16px rgba(0, 255, 136, 0.1), 0 0 16px rgba(0, 255, 136, 0.18);
}
.clear {
background: linear-gradient(180deg, rgba(0, 255, 136, 0.08), rgba(0, 0, 0, 0.32));
}

.group {
margin-top: 8px;
}
.groupLabel {
margin: 0 0 6px 0;
font-size: 13px;
letter-spacing: 0.08em;
text-transform: uppercase;
color: #9be6bf;
opacity: 0.95;
}
.groupGrid {
display: grid;
gap: 10px;
grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}
.dirBtn {
display: grid;
grid-template-columns: 72px 1fr;
align-items: center;
gap: 10px;
padding: 10px 12px;
border-radius: 12px;
text-align: left;
border: 1px solid rgba(0, 255, 136, 0.28);
background: linear-gradient(180deg, rgba(0, 20, 8, 0.3), rgba(0, 0, 0, 0.5));
box-shadow: inset 0 0 14px rgba(0, 255, 136, 0.08), 0 0 14px rgba(0, 255, 136, 0.14);
font-weight: 800;
color: #d9ffe0;
}
.dirBtn:hover {
transform: translateY(-1px);
box-shadow: inset 0 0 18px rgba(0, 255, 136, 0.14), 0 0 18px rgba(0, 255, 136, 0.24);
}
.dirCode {
display: inline-block;
padding: 8px 10px;
border-radius: 10px;
text-align: center;
border: 1px solid rgba(0, 255, 136, 0.35);
background: linear-gradient(180deg, rgba(0, 255, 136, 0.1), rgba(0, 0, 0, 0.35));
box-shadow: inset 0 0 12px rgba(0, 255, 136, 0.12);
font-weight: 900;
color: #a9ffd1;
}
.dirLabel {
font-size: 14px;
}

.patchOverlay {
position: absolute;
inset: -10px;
border-radius: 16px;
display: grid;
place-items: center;
z-index: 5;
background: radial-gradient(400px 220px at 50% 40%, rgba(0, 255, 136, 0.12), rgba(0, 0, 0, 0.8) 70%);
border: 1px solid rgba(0, 255, 136, 0.28);
box-shadow: inset 0 0 22px rgba(0, 255, 136, 0.16), 0 0 24px rgba(0, 255, 136, 0.18);
animation: fadeIn 0.2s ease both;
}
.patchText {
font-weight: 900;
font-size: 18px;
color: #d9ffe0;
text-shadow: 0 0 10px rgba(0, 255, 136, 0.45);
}
.pulse {
position: absolute;
width: 160px;
height: 160px;
border-radius: 999px;
border: 2px solid rgba(0, 255, 136, 0.35);
animation: pulse 1.2s ease-out infinite;
}
@keyframes pulse {
0% {
transform: scale(0.6);
opacity: 0.8;
}
100% {
transform: scale(1.4);
opacity: 0;
}
}
@keyframes fadeIn {
from {
opacity: 0;
}
to {
opacity: 1;
}
}
`}</style>
</div>
);
}