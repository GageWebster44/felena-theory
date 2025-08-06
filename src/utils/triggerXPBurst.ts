 export function triggerXPBurst() {
  const el = document.getElementById('xpBurst');
  if (el) {
    el.classList.remove('animate');
    void el.offsetWidth; // reset
    el.classList.add('animate');
  }
}
