import { openModal } from '@/ui/components/modal.js';
import { ESTADOS_MEXICO } from '@/utils/constants.js';
import { showToast } from '@/ui/components/toast.js';

export function openNewsletterModal() {
  const node = openModal(`
    <h2>📧 Resumen Semanal</h2>
    <form id="formNL" class="admin-form">
      <div class="form-group"><label>Email</label><input type="email" id="nlEmail" required></div>
      <div class="form-group">
        <label>Estado de interés</label>
        <select id="nlEstado" required>
          <option value="">Selecciona</option>
          ${ESTADOS_MEXICO.map(e => `<option>${e}</option>`).join('')}
        </select>
      </div>
      <button type="submit" class="btn btn-primary btn-full">Suscribirme</button>
    </form>
  `);
  node.querySelector('#formNL').addEventListener('submit', (e) => {
    e.preventDefault();
    node.remove();
    showToast('✅ Suscripción exitosa.', 'success');
  });
}