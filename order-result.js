// Только статический просмотр результата. Реальную доставку заявки проверит сервер WordPress.
(() => {
  const failed = new URLSearchParams(location.search).get('status') === 'error';
  document.querySelector('[data-result-success]').hidden = failed;
  document.querySelector('[data-result-error]').hidden = !failed;
  document.title = `${failed ? 'Не удалось передать заявку' : 'Результат оформления'} — merimarket`;
})();
