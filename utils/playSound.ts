export default function playSound(sound: string) {
  const audio = new Audio(`/sounds/${sound}.mp3`);
  audio.volume = 0.4;
  audio.play().catch(() => {});
}
