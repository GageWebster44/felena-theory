export function triggerSparkFlash() {
  const el = document.getElementById('crateFlash');
  if (el) {
    el.classList.remove('flash');
    void el.offsetWidth;
    el.classList.add('flash');
  }
}
