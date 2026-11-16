// Бренды поставщика; в минимальную подборку включены четыре средства Cantabria Labs.
const demoBrands = {
  "cantabria": {
    "name": "Cantabria Labs",
    "intro": "Испанский бренд, объединяющий линии ENDOCARE и HELIOCARE: от очищения и увлажнения до ежедневной защиты от солнца.",
    "note": "Коллекция ENDOCARE для ежедневного ухода и солнцезащита HELIOCARE."
  },
  "dermatime": {
    "name": "Dermatime",
    "intro": "Испания · профессиональный уход.",
    "note": "Ассортимент этого бренда добавим позже. Пока познакомьтесь с первой подборкой в каталоге."
  },
  "magiray": {
    "name": "Magiray",
    "intro": "Израиль · уход за кожей.",
    "note": "Ассортимент этого бренда добавим позже. Пока познакомьтесь с первой подборкой в каталоге."
  },
  "phyris": {
    "name": "Phyris",
    "intro": "Германия · уход за кожей.",
    "note": "Ассортимент этого бренда добавим позже. Пока познакомьтесь с первой подборкой в каталоге."
  },
  "eldermafill": {
    "name": "Eldermafill",
    "intro": "Южная Корея · профессиональная косметика.",
    "note": "Ассортимент этого бренда добавим позже. Пока познакомьтесь с первой подборкой в каталоге."
  }
};

const brandGrid = document.querySelector('.brand-product-grid');
if (brandGrid) {
  const brandParams = new URLSearchParams(location.search);
  const requested = brandParams.get('brand') || 'cantabria';
  const brandId = Object.hasOwn(demoBrands, requested) ? requested : 'cantabria';
  const brand = demoBrands[brandId];
  document.querySelectorAll('[data-brand-name]').forEach(node => { node.textContent = brand.name; });
  document.title = `${brand.name} — merimarket`;
  document.querySelector('[data-brand-intro]').textContent = brand.intro || 'Здесь появятся знакомство с брендом и его коллекция ухода.';
  document.querySelector('[data-brand-note]').textContent = brand.note || 'Сейчас мы уточняем ассортимент. А пока можно найти свой ежедневный ритуал в общем каталоге.';
  const cards = [...brandGrid.querySelectorAll('[data-product-card]')];
  const sorting = document.querySelector('#brand-sort');
  const categoryValues = ['', 'face', 'body', 'hair', 'sets'];
  let category = categoryValues.includes(brandParams.get('category')) ? brandParams.get('category') : '';
  if ([...sorting.options].some(option => option.value === brandParams.get('sort'))) sorting.value = brandParams.get('sort');
  function updateBrandProducts() {
    let count = 0;
    cards.forEach(card => {
      card.hidden = card.dataset.brand !== brandId || Boolean(category && card.dataset.category !== category);
      if (!card.hidden) count += 1;
    });
    const sorted = [...cards];
    if (sorting.value === 'price-asc') sorted.sort((a, b) => Number(a.dataset.price) - Number(b.dataset.price));
    if (sorting.value === 'price-desc') sorted.sort((a, b) => Number(b.dataset.price) - Number(a.dataset.price));
    if (sorting.value === 'title') sorted.sort((a, b) => a.querySelector('h3').textContent.localeCompare(b.querySelector('h3').textContent, 'ru'));
    sorted.forEach(card => brandGrid.append(card));
    document.querySelector('[data-brand-count]').textContent = `${count} ${count === 1 ? 'средство' : count > 1 && count < 5 ? 'средства' : 'средств'}`;
    document.querySelector('[data-brand-empty]').hidden = count !== 0;
    document.querySelectorAll('[data-brand-category]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.brandCategory === category));
    });
    const next = new URLSearchParams({ brand: brandId });
    if (category) next.set('category', category);
    if (sorting.value !== 'default') next.set('sort', sorting.value);
    try { history.replaceState(null, '', `${location.pathname}?${next}${location.hash}`); } catch {}
  }
  document.querySelectorAll('[data-brand-category]').forEach(button => {
    button.addEventListener('click', () => { category = button.dataset.brandCategory; updateBrandProducts(); });
  });
  sorting.addEventListener('change', updateBrandProducts);
  updateBrandProducts();
}
