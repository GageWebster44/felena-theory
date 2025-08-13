// playCrateSound.ts – Play sound effect on crate unlock

export function playCrateSound(tier: string) {
  try {
    const audio = new Audio(`/sounds/crates/${tier.toLowerCase()}.mp3`);
    audio.volume = 0.9;
    audio.play();
  } catch (err) {
    console.error('[SOUND ERROR]', err);
  }
}
