// src/utils/playSound.ts
// Lightweight audio helper with WebAudio + HTMLAudio fallback.
// Works with public files (e.g. /public/sfx/boom.mp3)

export type PlayOptions = {
volume?: number; // 0..1
rate?: number; // playbackRate
detune?: number; // cents (WebAudio only)
offset?: number; // start offset in seconds
method?: "auto" | "webaudio" | "html";
oneAtATimeKey?: string;
maxConcurrent?: number;
};

type ActiveWebNode = { src: AudioBufferSourceNode; gain: GainNode; key?: string };
type ActiveHtmlNode = { el: HTMLAudioElement; key?: string };

const isBrowser = typeof window !== "undefined";

let masterVolume = 1.0;
let muted = false;

export function setMasterVolume(v: number) {
masterVolume = Math.min(1, Math.max(0, v));
applyVolume();
}
export function muteAll() { muted = true; applyVolume(); }
export function unmuteAll() { muted = false; applyVolume(); }
export function isMuted() { return muted; }
export function getMasterVolume() { return masterVolume; }

function effectiveVolume() { return muted ? 0 : masterVolume; }

function applyVolume() {
if (!isBrowser) return;
for (const arr of htmlActive.values()) {
for (const a of arr) {
a.el.volume = (a.el as any)._baseVol * effectiveVolume();
}
}
for (const arr of webActive.values()) {
for (const a of arr) {
a.gain.gain.value = (a.gain as any)._baseVol * effectiveVolume();
}
}
}

// WebAudio
let audioCtx: AudioContext | null = null;
const bufferCache = new Map<string, AudioBuffer>();
const webActive = new Map<string, ActiveWebNode[]>();
const htmlActive = new Map<string, ActiveHtmlNode[]>();

function getCtx(): AudioContext | null {
if (!isBrowser) return null;
if (audioCtx) return audioCtx;
try {
const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
if (!Ctx) return null;
audioCtx = new Ctx();
const tryResume = () => audioCtx && audioCtx.state !== "running" && audioCtx.resume().catch(() => {});
["touchend","mousedown","keydown"].forEach(evt =>
window.addEventListener(evt, tryResume, { once: true, passive: true })
);
return audioCtx;
} catch { return null; }
}

async function fetchBuffer(src: string): Promise<AudioBuffer> {
if (bufferCache.has(src)) return bufferCache.get(src)!;
const res = await fetch(src);
const arr = await res.arrayBuffer();
const ctx = getCtx();
if (!ctx) throw new Error("WebAudio unsupported");
const buf = await ctx.decodeAudioData(arr.slice(0));
bufferCache.set(src, buf);
return buf;
}

export async function preloadSounds(srcs: string | string[]) {
if (!isBrowser) return;
const list = Array.isArray(srcs) ? srcs : [srcs];
const ctx = getCtx();
if (!ctx) return;
await Promise.all(list.map((s) => fetchBuffer(s).catch(() => {})));
}

export function stopAll() {
if (!isBrowser) return;
for (const arr of webActive.values()) arr.forEach(({src}) => { try{src.stop();}catch{} });
webActive.clear();
for (const arr of htmlActive.values()) arr.forEach(({el}) => { try{el.pause();}catch{} });
htmlActive.clear();
}

export function stopByKey(key: string) {
for (const arr of webActive.values()) {
for (const n of [...arr]) if (n.key === key) { try{n.src.stop();}catch{}; arr.splice(arr.indexOf(n),1); }
}
for (const arr of htmlActive.values()) {
for (const n of [...arr]) if (n.key === key) { try{n.el.pause();}catch{}; arr.splice(arr.indexOf(n),1); }
}
}

export default function playSound(src: string, opts: PlayOptions = {}): () => void {
if (!isBrowser) return () => {};
const { volume=1, rate=1, detune=0, offset=0, method="auto", oneAtATimeKey, maxConcurrent=8 } = opts;
if (oneAtATimeKey) stopByKey(oneAtATimeKey);

const ctx = getCtx();
const tryWeb = (method==="auto"||method==="webaudio") && !!ctx;
if (tryWeb) {
const arr = webActive.get(src) ?? [];
if (arr.length >= maxConcurrent) { const v = arr.shift(); if (v) try{v.src.stop();}catch{} }
fetchBuffer(src).then(buffer => {
if (!ctx) return;
const source = ctx.createBufferSource();
source.buffer = buffer;
source.playbackRate.value = rate;
try { (source as any).detune?.setValueAtTime(detune, ctx.currentTime); } catch {}
const gain = ctx.createGain();
(gain as any)._baseVol = volume;
gain.gain.value = volume * effectiveVolume();
source.connect(gain).connect(ctx.destination);
const node: ActiveWebNode = { src: source, gain, key: oneAtATimeKey };
arr.push(node); webActive.set(src, arr);
const cleanup = () => { const a=webActive.get(src); if(!a)return; const i=a.indexOf(node); if(i>=0)a.splice(i,1); try{source.disconnect();gain.disconnect();}catch{} };
source.addEventListener("ended", cleanup);
try { source.start(0, offset); } catch { cleanup(); }
}).catch(()=>{ htmlPlay(src,{volume,rate,offset,oneAtATimeKey,maxConcurrent}); });
return ()=>stopByKey(oneAtATimeKey||"");
}
return htmlPlay(src,{volume,rate,offset,oneAtATimeKey,maxConcurrent});
}

function htmlPlay(src:string,opts:Omit<PlayOptions,"method"|"detune">):()=>void{
const {volume=1,rate=1,offset=0,oneAtATimeKey,maxConcurrent=8}=opts;
const list = htmlActive.get(src) ?? [];
if (list.length>=maxConcurrent){ const v=list.shift(); if(v) try{v.el.pause();}catch{} }
const el = new Audio(src);
(el as any)._baseVol = volume;
el.volume = volume*effectiveVolume();
try{el.playbackRate=rate;}catch{}
try{el.currentTime=offset;}catch{}
el.preload="auto";
const node:ActiveHtmlNode={el,key:oneAtATimeKey}; list.push(node); htmlActive.set(src,list);
const cleanup=()=>{ const arr=htmlActive.get(src); if(!arr)return; const i=arr.indexOf(node); if(i>=0)arr.splice(i,1); };
el.addEventListener("ended",cleanup);
el.addEventListener("error",cleanup);
el.play().catch(()=>{});
return ()=>{try{el.pause();el.currentTime=0;cleanup();}catch{}};
}
