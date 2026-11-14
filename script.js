// Небольшие отклики для показа макета. Данные магазина и оформление заказа не подключены.
const toast = document.querySelector('.toast');
let toastTimer;
let cartCount = 0;
function notify(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = setTimeout(() => { toast.hidden = true; }, 3500);
}

document.querySelectorAll('[data-demo]').forEach(button => {
  button.addEventListener('click', () => notify(`${button.dataset.demo} — раздел будет доступен в полной версии.`));
});
document.querySelectorAll('.add-to-cart').forEach(button => {
  button.addEventListener('click', () => {
    const quantity = button.closest('.detail-buy')?.querySelector('input');
    if (quantity && !quantity.reportValidity()) return;
    cartCount += quantity ? Number(quantity.value) : 1;
    document.querySelectorAll('[data-cart-count]').forEach(counter => { counter.textContent = cartCount; });
    notify('Товар добавлен в демонстрационную корзину');
  });
});
document.querySelectorAll('.favorite').forEach(button => {
  button.addEventListener('click', () => {
    const selected = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(selected));
    notify(selected ? 'Добавлено в избранное' : 'Удалено из избранного');
  });
});
document.querySelectorAll('.chip').forEach(button => {
  button.addEventListener('click', () => {
    const needs = { 'Увлажнение': 'hydration', 'Защита SPF': 'spf' };
    const need = needs[button.textContent.trim()];
    if (button.textContent.trim() === 'Чувствительная кожа') {
      notify('Эта подборка появится после наполнения каталога.');
      return;
    }
    window.location.href = need ? `catalog.html?need=${need}` : 'catalog.html';
  });
});
document.querySelector('.search').addEventListener('submit', event => {
  event.preventDefault();
  const query = new FormData(event.currentTarget).get('q').trim();
  window.location.href = query ? `catalog.html?q=${encodeURIComponent(query)}` : 'catalog.html';
});

const mobileLayout = window.matchMedia('(max-width: 767px)');
function updateFooter() {
  document.querySelectorAll('.footer-group, .catalog-filters').forEach(group => { group.open = !mobileLayout.matches; });
}
updateFooter();
mobileLayout.addEventListener('change', updateFooter);

const params = new URLSearchParams(window.location.search);
const categoryNames = { face: 'Уход для лица', body: 'Уход для тела', hair: 'Уход для волос', sets: 'Наборы ухода' };
const needNames = { cleansing: 'Очищение', hydration: 'Увлажнение', spf: 'Защита SPF' };
const normalize = value => value.toLocaleLowerCase('ru').replaceAll('ё', 'е');
const filterForm = document.querySelector('#catalog-filters');
if (filterForm) {
  const grid = document.querySelector('#catalog-grid');
  const cards = [...grid.querySelectorAll('[data-product-card]')];
  const sort = document.querySelector('#catalog-sort');
  let query = params.get('q') || '';
  document.querySelector('#search').value = query;
  ['category', 'need', 'price'].forEach(name => {
    const select = filterForm.elements.namedItem(name);
    if ([...select.options].some(option => option.value === params.get(name))) select.value = params.get(name);
  });
  if ([...sort.options].some(option => option.value === params.get('sort'))) sort.value = params.get('sort');

  function applyFilters() {
    const category = filterForm.elements.namedItem('category').value;
    const need = filterForm.elements.namedItem('need').value;
    const price = filterForm.elements.namedItem('price').value;
    let count = 0;
    cards.forEach(card => {
      const matches = (!category || card.dataset.category === category)
        && (!need || card.dataset.need === need)
        && (!price || Number(card.dataset.price) <= Number(price))
        && (!query || normalize(card.textContent).includes(normalize(query)));
      card.hidden = !matches;
      if (matches) count += 1;
    });
    const ordered = [...cards];
    if (sort.value === 'price-asc') ordered.sort((a, b) => Number(a.dataset.price) - Number(b.dataset.price));
    if (sort.value === 'price-desc') ordered.sort((a, b) => Number(b.dataset.price) - Number(a.dataset.price));
    if (sort.value === 'title') ordered.sort((a, b) => a.querySelector('h3').textContent.localeCompare(b.querySelector('h3').textContent, 'ru'));
    ordered.forEach(card => grid.append(card));
    document.querySelector('[data-result-count]').textContent = count;
    document.querySelector('[data-result-label]').textContent = count === 1 ? 'средство' : count >= 2 && count <= 4 ? 'средства' : 'средств';
    document.querySelector('[data-empty-results]').hidden = count !== 0;
    document.querySelector('.catalog-note').hidden = count === 0;
    document.querySelector('[data-catalog-title]').textContent = categoryNames[category] || 'Найдите свой уход';
    document.querySelectorAll('.category-shortcuts a').forEach(link => {
      const value = new URL(link.href).searchParams.get('category') || '';
      if (value === category) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    const summary = document.querySelector('[data-search-summary]');
    summary.hidden = !query;
    summary.textContent = `По запросу «${query}»`;
    const next = new URLSearchParams();
    if (category) next.set('category', category);
    if (need) next.set('need', need);
    if (price) next.set('price', price);
    if (query) next.set('q', query);
    if (sort.value !== 'default') next.set('sort', sort.value);
    // Открытие через file:// тоже поддерживается, без обязательной History API.
    try { history.replaceState(null, '', `${location.pathname}${next.size ? `?${next}` : ''}`); } catch {}
  }
  filterForm.addEventListener('submit', event => { event.preventDefault(); applyFilters(); });
  filterForm.addEventListener('reset', event => {
    event.preventDefault();
    ['category', 'need', 'price'].forEach(name => { filterForm.elements.namedItem(name).value = ''; });
    sort.value = 'default';
    query = '';
    document.querySelector('#search').value = '';
    applyFilters();
  });
  sort.addEventListener('change', applyFilters);
  applyFilters();
}

if (document.querySelector('[data-product-title]')) {
  const product = window.demoProducts.find(item => item.id === params.get('item')) || window.demoProducts[0];
  const textFields = { title: product.title, breadcrumb: product.title, note: product.note, description: product.description, usage: product.usage, volume: product.volume, price: `${product.price},00`, need: needNames[product.need] };
  Object.entries(textFields).forEach(([field, value]) => {
    document.querySelectorAll(`[data-product-${field}]`).forEach(node => { node.textContent = value; });
  });
  document.title = `${product.title} — merimarket`;
  const stage = document.querySelector('[data-product-stage]');
  stage.classList.remove('blue', 'butter', 'stone');
  stage.classList.add(product.color);
  document.querySelector('.related-products')?.querySelectorAll('[data-product-card]').forEach(card => { card.hidden = card.dataset.id === product.id; });
}

// Сохраняем нативные details/summary; без JS они раскрываются обычным способом.
const accordionReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('.product-accordions details').forEach(details => {
  const summary = details.querySelector('summary');
  let animation = null;
  let targetOpen = details.open;

  summary.addEventListener('click', event => {
    event.preventDefault();
    targetOpen = animation ? !targetOpen : !details.open;
    const startHeight = details.getBoundingClientRect().height;
    animation?.cancel();
    animation = null;

    if (accordionReducedMotion.matches || !details.animate) {
      details.open = targetOpen;
      details.style.overflow = '';
      return;
    }

    // При закрытии контент остаётся доступен для анимации до её завершения.
    details.open = true;
    const style = getComputedStyle(details);
    const collapsedHeight = summary.getBoundingClientRect().height
      + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)
      + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    const endHeight = targetOpen ? details.getBoundingClientRect().height : collapsedHeight;
    const duration = parseFloat(style.getPropertyValue('--motion-normal')) || 220;
    details.style.overflow = 'hidden';
    const current = details.animate(
      [{ height: `${startHeight}px` }, { height: `${endHeight}px` }],
      { duration, easing: style.getPropertyValue('--motion-ease').trim() || 'ease-out' }
    );
    animation = current;
    current.onfinish = () => {
      if (animation !== current) return;
      details.open = targetOpen;
      details.style.overflow = '';
      animation = null;
    };
  });

  accordionReducedMotion.addEventListener('change', () => {
    if (accordionReducedMotion.matches) animation?.finish();
  });
});
