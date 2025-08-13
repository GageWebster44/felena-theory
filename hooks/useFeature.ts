// src/hooks/useFeature.ts
export default function useFeature(flag: string, fallback = false) {
  const v = process.env[`NEXT_PUBLIC_${flag}` as any];
  return (v ?? '').toString() === '1' ? true : fallback;
}