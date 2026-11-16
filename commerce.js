// Только локальная демонстрация. Контакты из формы не сохраняются и не отправляются.
(() => {
  const products = window.demoProducts || [];
  const byId = new Map(products.map(product => [product.id, product]));
  const key = 'merimarket.demo.shopping.v1';
  const clean = value => ({
    favorites: [...new Set((Array.isArray(value?.favorites) ? value.favorites : []).filter(id => byId.has(id)))],
    cart: Object.fromEntries(Object.entries(value?.cart && typeof value.cart === 'object' ? value.cart : {})
      .filter(([id, quantity]) => byId.has(id) && Number.isInteger(quantity) && quantity > 0)
      .map(([id, quantity]) => [id, Math.min(quantity, 10)]))
  });
  let state;
  let persistent = true;
  try { state = clean(JSON.parse(localStorage.getItem(key))); }
  catch { state = clean(null); persistent = false; }
  const message = text => { if (typeof notify === 'function') notify(text); };
  const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const count = () => Object.values(state.cart).reduce((sum, quantity) => sum + quantity, 0);
  const quantityLabel = number => `${number} ${number % 10 === 1 && number % 100 !== 11 ? 'товар' : number % 10 >= 2 && number % 10 <= 4 && (number % 100 < 12 || number % 100 > 14) ? 'товара' : 'товаров'}`;
  function save() {
    try { localStorage.setItem(key, JSON.stringify(state)); persistent = true; }
    catch { persistent = false; }
    render();
    if (!persistent) message('Браузер не разрешает сохранение: подборка доступна только до перехода или перезагрузки.');
  }
  function add(id) {
    if (!byId.has(id)) return;
    if ((state.cart[id] || 0) >= 10) { message('В демонстрационной корзине доступно до 10 единиц одного средства.'); return; }
    state.cart[id] = (state.cart[id] || 0) + 1;
    message('Добавлено в корзину. Цену и наличие уточним перед покупкой.');
    save();
  }
  function productCard(product) {
    const id = product.id;
    return `<article class="product" data-product-card data-id="${id}">
      <div class="product-image placeholder ${product.color}"><a class="product-photo-link" href="product.html?item=${id}" aria-label="Открыть товар: ${escape(product.title)}"><img class="product-photo" src="${product.image}" alt="${escape(product.title)}" width="700" height="700" loading="lazy"></a><button class="favorite icon-button" type="button" data-favorite-id="${id}" aria-pressed="true" aria-label="Убрать из избранного: ${escape(product.title)}"><svg class="icon"><use href="#i-heart"/></svg></button></div>
      <div class="product-info"><p class="product-brand"><a href="brand.html?brand=cantabria">Cantabria Labs</a></p><h3><a href="product.html?item=${id}">${escape(product.title)}</a></h3><p class="product-description">${escape(product.note)} · ${product.volume}</p><div class="product-buy"><p class="price price-pending">Цена уточняется</p><button class="button" type="button" data-add-id="${id}">В корзину</button></div></div></article>`;
  }
  function cartRow([id, quantity]) {
    const product = byId.get(id);
    return `<article class="shopping-row"><a class="shopping-photo" href="product.html?item=${id}"><img src="${product.image}" alt="${escape(product.title)}" width="180" height="180"></a>
      <div class="shopping-info"><p class="eyebrow">Cantabria Labs</p><h2><a href="product.html?item=${id}">${escape(product.title)}</a></h2><p>${escape(product.note)} · ${product.volume}</p><button class="shopping-text-action" type="button" data-favorite-id="${id}" aria-pressed="${state.favorites.includes(id)}">${state.favorites.includes(id) ? 'В избранном' : 'В избранное'}</button></div>
      <div class="shopping-quantity" role="group" aria-label="Количество: ${escape(product.title)}"><button type="button" data-quantity-id="${id}" data-delta="-1" ${quantity === 1 ? 'disabled' : ''} aria-label="Уменьшить количество: ${escape(product.title)}">−</button><input type="number" inputmode="numeric" min="1" max="10" step="1" value="${quantity}" data-quantity-input="${id}" aria-label="Количество: ${escape(product.title)}"><button type="button" data-quantity-id="${id}" data-delta="1" ${quantity === 10 ? 'disabled' : ''} aria-label="Увеличить количество: ${escape(product.title)}">+</button></div>
      <div class="shopping-row-end"><p>Цена уточняется</p><button class="shopping-text-action" type="button" data-remove-id="${id}" aria-label="Удалить из корзины: ${escape(product.title)}">Удалить</button></div></article>`;
  }
  function render() {
    const total = count();
    document.querySelectorAll('[data-cart-count]').forEach(node => { node.textContent = total; });
    document.querySelectorAll('[data-favorites-count]').forEach(node => { node.textContent = state.favorites.length; });
    document.querySelectorAll('.favorite').forEach(button => {
      const id = button.dataset.favoriteId || button.closest('[data-product-card]')?.dataset.id;
      if (!id) return;
      const selected = state.favorites.includes(id);
      button.setAttribute('aria-pressed', String(selected));
      button.setAttribute('aria-label', `${selected ? 'Убрать из избранного' : 'В избранное'}: ${byId.get(id)?.title || ''}`);
    });
    const favorites = document.querySelector('[data-favorites-grid]');
    if (favorites) {
      favorites.innerHTML = state.favorites.map(id => productCard(byId.get(id))).join('');
      document.querySelector('[data-favorites-empty]').hidden = state.favorites.length > 0;
      document.querySelector('[data-clear-favorites]').hidden = !state.favorites.length;
      document.querySelector('[data-favorites-label]').textContent = quantityLabel(state.favorites.length);
    }
    const cart = document.querySelector('[data-cart-items]');
    if (cart) {
      cart.innerHTML = Object.entries(state.cart).map(cartRow).join('');
      document.querySelector('[data-cart-empty]').hidden = total > 0;
      document.querySelector('[data-cart-content]').hidden = total === 0;
      document.querySelector('[data-clear-cart]').hidden = total === 0;
    }
    document.querySelectorAll('[data-order-count]').forEach(node => { node.textContent = quantityLabel(total); });
    const checkout = document.querySelector('[data-checkout-content]');
    if (checkout) {
      checkout.hidden = !total;
      document.querySelector('[data-checkout-empty]').hidden = !!total;
      document.querySelector('[data-order-items]').innerHTML = Object.entries(state.cart).map(([id, quantity]) => {
        const product = byId.get(id);
        return `<li><img src="${product.image}" alt="" width="56" height="64"><div><a href="product.html?item=${id}">${escape(product.title)}</a><span>${product.volume} · ${quantity} шт.</span></div></li>`;
      }).join('');
      const submit = document.querySelector('[data-checkout-submit]');
      submit.disabled = total === 0;
    }
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    const favoriteId = button.dataset.favoriteId || (button.matches('.favorite') ? button.closest('[data-product-card]')?.dataset.id : null);
    if (favoriteId && byId.has(favoriteId)) {
      const selected = state.favorites.includes(favoriteId);
      state.favorites = selected ? state.favorites.filter(id => id !== favoriteId) : [...state.favorites, favoriteId];
      message(selected ? 'Убрано из избранного' : 'Сохранено в избранном');
      save();
      if (document.querySelector('[data-favorites-grid]')) {
        (document.querySelector('[data-favorites-grid] .favorite') || document.querySelector('h1')).focus();
      }
    }
    if (button.dataset.addId) add(button.dataset.addId);
    if (button.dataset.removeId) { delete state.cart[button.dataset.removeId]; save(); message('Товар убран из корзины'); }
    if (button.dataset.quantityId) {
      const id = button.dataset.quantityId;
      state.cart[id] = Math.max(1, Math.min(10, state.cart[id] + Number(button.dataset.delta)));
      save();
      document.querySelector(`[data-quantity-input="${id}"]`)?.focus();
    }
    if (button.hasAttribute('data-clear-favorites')) { state.favorites = []; save(); }
    if (button.hasAttribute('data-clear-cart')) { state.cart = {}; save(); }
    if (button.hasAttribute('data-preview-favorites')) { state.favorites = ['serum', 'cream']; save(); }
    if (button.hasAttribute('data-preview-cart')) { state.cart = { gel: 1, cream: 1 }; save(); }

  });
  document.addEventListener('change', event => {
    const id = event.target.dataset.quantityInput;
    if (!id) return;
    if (!event.target.checkValidity()) {
      event.target.value = state.cart[id];
      message('Укажите целое количество от 1 до 10.');
      return;
    }
    state.cart[id] = Number(event.target.value);
    save();
    document.querySelector(`[data-quantity-input="${id}"]`)?.focus();
  });
  const form = document.querySelector('#checkout-form');
  if (form) {
    function delivery() {
      const courier = form.elements.delivery.value === 'courier';
      document.querySelector('[data-delivery-address]').hidden = !courier;
      document.querySelector('[data-delivery-pickup]').hidden = courier;
      form.querySelectorAll('[data-address-field]').forEach(input => { input.disabled = !courier; input.required = courier; });
    }
    form.addEventListener('change', delivery);
    delivery();
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!count()) { render(); return; }
      if (!form.reportValidity()) return;
      // Статика: не отправляем данные, не имитируем принятие реального заказа.
      form.reset();
      window.location.href = 'order-result.html';
    });
  }
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    try { state = clean(JSON.parse(event.newValue)); render(); } catch {}
  });
  // Возврат кнопкой «Назад» тоже обновляет счётчики и состояние сердец.
  window.addEventListener('pageshow', event => {
    if (!event.persisted) return;
    try { state = clean(JSON.parse(localStorage.getItem(key))); render(); } catch {}
  });
  render();
})();
