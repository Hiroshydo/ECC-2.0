const toast = document.querySelector('.toast');
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

document.querySelector('#export-button').addEventListener('click', () => {
  showToast('Relatório de agosto/2026 preparado para exportação.');
});

document.querySelector('#new-entry').addEventListener('click', () => {
  showToast('Formulário de novo lançamento em breve.');
});

document.querySelectorAll('.filter').forEach((filter) => {
  filter.addEventListener('click', () => showToast('Filtro selecionado: ' + filter.querySelector('strong').textContent));
});

document.querySelectorAll('.attention-item').forEach((item) => {
  item.addEventListener('click', () => showToast(item.querySelector('strong').textContent));
});

document.querySelectorAll('.nav-item').forEach((item) => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach((nav) => nav.classList.remove('active'));
    item.classList.add('active');
  });
});
