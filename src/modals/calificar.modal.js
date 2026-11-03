import { openModal } from '@/ui/components/modal.js';
import { crearCalificacion, fetchCalificaciones } from '@/services/calificaciones.service.js';
import { showToast } from '@/ui/components/toast.js';
import { showButtonLoading } from '@/ui/components/spinner.js';
let selected = 0;
export function openCalificarModal(email) {
  selected = 0;
  const node = openModal(
    '<h2>Calificar vendedor</h2>' +
    '<form id="formCal" class="report-form" style="box-shadow:none;padding:0;">' +
      '<div class="form-group"><label>Calificacion</label>' +
        '<div class="star-rating" id="stars">' +
          [1,2,3,4,5].map(n => '<span class="star" data-v="' + n + '">☆</span>').join('') +
        '</div>' +
      '</div>' +
      '<div class="form-group"><label>Comentario</label><textarea id="calComment" rows="3"></textarea></div>' +
      '<button type="submit" class="btn btn-primary btn-full">Enviar</button>' +
    '</form>'
  );
  const stars = node.querySelectorAll('.star');
  stars.forEach(s => s.addEventListener('click', () => {
    selected = parseInt(s.dataset.v, 10);
    stars.forEach(x => x.textContent = '☆');
    for (let i = 0; i < selected; i++) stars[i].textContent = '★';
  }));
  node.querySelector('#formCal').addEventListener('submit', async e => {
    e.preventDefault();
    if (!selected) return showToast('Selecciona puntuacion.', 'warning');
    const btn = e.target.querySelector('button[type="submit"]');
    const restore = showButtonLoading(btn, 'Enviando...');
    try {
      await crearCalificacion({ toEmail: email, rating: selected, comment: node.querySelector('#calComment').value });
      await fetchCalificaciones();
      node.remove();
      showToast('Calificacion enviada.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
      restore();
    }
  });
}
