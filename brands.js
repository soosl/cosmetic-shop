// Названия из текущего макета; только FORME имеет демонстрационное наполнение.
const demoBrands = {
  forme: { name: 'FORME', intro: 'Понятные средства, приятные текстуры и немного времени для себя. Соберите ежедневный уход в удобном для вас ритме.', note: 'От первого шага очищения до завершающего крема — найдите то, что хочется сделать своей привычкой.' },
  biretix: { name: 'BIRETIX' },
  cosmedix: { name: 'COSMEDIX' },
  genosys: { name: 'GENOSYS' },
  'jw-pro': { name: 'JW PRO' }
};

const brandSearch = document.querySelector('#brand-search');
if (brandSearch) {
  const input = document.querySelector('#brand-query');
  const brandCards = [...document.querySelectorAll('[data-brand-card]')];
  let letter = '';
  function updateBrands() {
    const query = input.value.trim().toLocaleLowerCase('ru');
    let count = 0;
    brandCards.forEach(card => {
      card.hidden = !card.dataset.name.toLocaleLowerCase('ru').includes(query)
        || Boolean(letter && card.dataset.letter !== letter);
      if (!card.hidden) count += 1;
    });
    document.querySelector('[data-brands-count]').textContent = `Найдено брендов: ${count}`;
    document.querySelector('[data-brands-empty]').hidden = count !== 0;
    document.querySelectorAll('[data-letter-filter]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.letterFilter === letter));
    });
  }
  brandSearch.addEventListener('submit', event => { event.preventDefault(); updateBrands(); });
  input.addEventListener('input', updateBrands);
  document.querySelectorAll('[data-letter-filter]').forEach(button => {
    button.addEventListener('click', () => { letter = button.dataset.letterFilter; updateBrands(); });
  });
  document.querySelector('[data-reset-brands]').addEventListener('click', () => {
    letter = ''; input.value = ''; updateBrands(); input.focus();
  });
}

const brandGrid = document.querySelector('.brand-product-grid');
if (brandGrid) {
  const brandParams = new URLSearchParams(location.search);
  const requested = brandParams.get('brand') || 'forme';
  const brandId = Object.hasOwn(demoBrands, requested) ? requested : 'forme';
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
      card.hidden = brandId !== 'forme' || Boolean(category && card.dataset.category !== category);
      if (!card.hidden) count += 1;
    });
    const sorted = [...cards];
    if (sorting.value === 'price-asc') sorted.sort((a, b) => Number(a.dataset.price) - Number(b.dataset.price));
    if (sorting.value === 'price-desc') sorted.sort((a, b) => Number(b.dataset.price) - Number(a.dataset.price));
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
