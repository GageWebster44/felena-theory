 // utils/dataFetchers.ts
// Generic fetchers for market/signal/game APIs

export async function fetchJSON(url: string) {
  try {
    const res = await fetch(url);
    return await res.json();
  } catch (err) {
    console.error('Fetch JSON failed:', err);
    return null;
  }
}