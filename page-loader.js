// Без JS страница сразу видна. Ожидание ресурсов ограничено 2,5 секунды.
(() => {
  const root = document.documentElement;
  let finished = false;
  let deadline;
  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(deadline);
    root.classList.remove('is-loading');
    const loader = document.querySelector('.page-loader');
    if (loader) setTimeout(() => loader.remove(), 220);
  }
  deadline = setTimeout(finish, 2500);
  root.classList.add('is-loading');
  window.addEventListener('load', finish, { once: true });
  window.addEventListener('pageshow', finish, { once: true });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' || event.key === 'Tab') finish(); });
})();
