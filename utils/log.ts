// src/utils/log.ts
export function warn(...a: any[]) { if (process.env.NODE_ENV !== 'production') console.warn(...a); }
export function info(...a: any[]) { if (process.env.NODE_ENV !== 'production') console.log(...a); }
export function error(...a: any[]) { console.error(...a); }