// Панель сравнения цветов для демонстрационной вёрстки, без сервера и зависимостей.
(() => {
  const storageKey = 'merimarket.preview.palette';
  const palettes = [
    { id: 'olive-rose', name: 'Olive & Rose', note: 'Текущий вариант', colors: ['#62613f', '#e9d7df', '#f4f3ee'] },
    { id: 'olive-sand', name: 'Олива и роза', note: 'По первому референсу', colors: ['#64642d', '#d3a6a3', '#c7beb3'] },
    { id: 'forest-peach', name: 'Лес и персик', note: 'По второму референсу', colors: ['#3d5b3b', '#e3a0a6', '#ffe3c8'] }
  ];
  const defaultId = palettes[0].id;
  let selected = defaultId;
  let panel;

  function applyPalette(id, persist = false) {
    selected = palettes.some(palette => palette.id === id) ? id : defaultId;
    document.documentElement.dataset.palette = selected;
    if (persist) {
      try { localStorage.setItem(storageKey, selected); } catch { /* Выбор работает и без сохранения. */ }
    }
    if (panel) {
      panel.querySelectorAll('[data-palette-option]').forEach(button => {
        button.setAttribute('aria-pressed', String(button.dataset.paletteOption === selected));
      });
      panel.querySelector('[data-palette-status]').textContent = `Сейчас: ${palettes.find(palette => palette.id === selected).name}`;
    }
    const paper = getComputedStyle(document.documentElement).getPropertyValue('--paper').trim();
    if (paper) document.querySelector('meta[name="theme-color"]')?.setAttribute('content', paper);
  }

  // Выполняется в head, чтобы сохранённая палитра применялась до показа страницы.
  try { selected = localStorage.getItem(storageKey) || defaultId; } catch {}
  applyPalette(selected);

  function mountPanel() {
    panel = document.createElement('details');
    panel.className = 'palette-tools';
    panel.innerHTML = `
      <summary class="palette-toggle"><span class="palette-toggle-colors" aria-hidden="true"><i></i><i></i><i></i></span><span>Палитра</span></summary>
      <div class="palette-panel">
        <div class="palette-panel-heading"><h2>Цвета макета</h2><button type="button" class="icon-button" data-close-palette aria-label="Закрыть выбор палитры">×</button></div>
        <p class="palette-panel-intro">Сравните три гаммы на этой странице.</p>
        <div class="palette-options" role="group" aria-label="Цветовые гаммы">
          ${palettes.map(palette => `
            <button class="palette-option" type="button" data-palette-option="${palette.id}" aria-pressed="false">
              <span class="palette-option-copy"><strong>${palette.name}</strong><span>${palette.note}</span></span>
              <span class="palette-swatches" aria-hidden="true">${palette.colors.map(color => `<i style="background-color:${color}"></i>`).join('')}</span>
            </button>`).join('')}
        </div>
        <p class="palette-status" data-palette-status role="status" aria-live="polite"></p>
        <p class="palette-panel-note">Выбор сохранится в этом браузере и на других страницах.</p>
        <button class="palette-reset text-link" type="button" data-reset-palette>Вернуть исходные цвета</button>
      </div>`;
    document.body.append(panel);
    const toggle = panel.querySelector('summary');
    function closePanel() { panel.open = false; toggle.focus(); }
    panel.querySelector('[data-close-palette]').addEventListener('click', closePanel);
    panel.querySelector('[data-reset-palette]').addEventListener('click', () => applyPalette(defaultId, true));
    panel.querySelectorAll('[data-palette-option]').forEach(button => {
      button.addEventListener('click', () => applyPalette(button.dataset.paletteOption, true));
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && panel.open) { event.preventDefault(); closePanel(); }
    });
    document.addEventListener('pointerdown', event => {
      if (panel.open && !panel.contains(event.target)) panel.open = false;
    });
    applyPalette(selected);
  }

  window.addEventListener('storage', event => {
    if (event.key === storageKey) applyPalette(event.newValue || defaultId);
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountPanel, { once: true });
  else mountPanel();
})();
