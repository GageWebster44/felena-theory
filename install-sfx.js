// scripts/install-sfx.js
// Generates tiny WAV placeholders and writes them to /public/sfx
// plus root aliases using your current .mp3 names so nothing 404s.

const fs = require("fs");
const path = require("path");

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

function writeWav(p, freq=440, duration=0.3, vol=0.4, sr=44100) {
const n = Math.floor(sr*duration);
const data = Buffer.alloc(n*2);
for (let i=0;i<n;i++){
const t = i/sr;
const env = i < sr*0.01 ? (i/(sr*0.01)) : (i > n - sr*0.02 ? (n-i)/(sr*0.02) : 1);
const s = Math.sin(2*Math.PI*freq*t) * env * vol;
const v = Math.max(-1, Math.min(1, s));
data.writeInt16LE((v*32767)|0, i*2);
}
// Minimal PCM WAV header
const header = Buffer.alloc(44);
header.write("RIFF",0); header.writeUInt32LE(36+data.length,4);
header.write("WAVE",8); header.write("fmt ",12);
header.writeUInt32LE(16,16); header.writeUInt16LE(1,20); // PCM
header.writeUInt16LE(1,22); header.writeUInt32LE(sr,24);
header.writeUInt32LE(sr*2,28); header.writeUInt16LE(2,32); header.writeUInt16LE(16,34);
header.write("data",36); header.writeUInt32LE(data.length,40);
fs.writeFileSync(p, Buffer.concat([header,data]));
}

const root = path.join(process.cwd(), "public", "sfx");
const packs = {
"core": {
slot_spin: 220, slot_stop: 180, slot_win_small: 880, slot_win_big: 660,
slot_lose: 120, slot_button: 500
},
"cascade": {
cascade_tick: 1200, cascade_explode: 200, cascade_refill: 400,
multiplier_up: 1000, rune_booster: 700, lava_up: 90
},
"holdspin": {
lock_in: 300, respin_tick: 600, jackpot_reveal: 1000,
blast_column: 150, reel_extend: 500
},
"classic": { reel_spin: 250, reel_stop: 200, bell_ding: 1200, coin_drop: 800 },
};

// 1) Write packs to /public/sfx/<pack>/<name>.wav
for (const [folder, entries] of Object.entries(packs)) {
const dir = path.join(root, folder);
ensureDir(dir);
for (const [name, freq] of Object.entries(entries)) {
writeWav(path.join(dir, `${name}.wav`), freq);
}
}

// 2) Root aliases for your current code (mp3 names) → we write WAV data with .mp3 extension.
// Browsers will still play it in dev; change to .wav later for production polish.
const aliases = {
"slot_spin.mp3": ["core/slot_spin.wav"],
"explosion_short.mp3": ["cascade/cascade_explode.wav"],
"cascade_tick.mp3": ["cascade/cascade_tick.wav"],
"settle_glow.mp3": ["cascade/multiplier_up.wav"], // or core/slot_win_small.wav
"no_win_click.mp3": ["core/slot_lose.wav"],
"wild_lock.mp3": ["holdspin/lock_in.wav"],
"reactor_boost.mp3": ["holdspin/jackpot_reveal.wav"],
};
ensureDir(root);
for (const [alias, targets] of Object.entries(aliases)) {
// copy first target as alias
const src = path.join(root, targets[0]);
const dst = path.join(root, alias);
fs.copyFileSync(src, dst);
}

console.log("SFX installed to /public/sfx. Restart your dev server.");