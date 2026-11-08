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
    cartCount += 1;
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
    notify(`«${button.textContent}» — пример подборки. Сейчас показаны демонстрационные товары.`);
  });
});
document.querySelector('.search').addEventListener('submit', event => {
  event.preventDefault();
  notify('Поиск по ассортименту появится в полной версии магазина.');
});

const mobileLayout = window.matchMedia('(max-width: 767px)');
function updateFooter() {
  document.querySelectorAll('.footer-group').forEach(group => { group.open = !mobileLayout.matches; });
}
updateFooter();
mobileLayout.addEventListener('change', updateFooter);
