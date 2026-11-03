import { openModal } from '@/ui/components/modal.js';
import { PRESENTACIONES, ORIGENES } from '@/utils/constants.js';
import { crearSugerencia } from '@/services/sugerencias.service.js';
import { showToast } from '@/ui/components/toast.js';
import { showButtonLoading } from '@/ui/components/spinner.js';

export function openSugerirMaterialModal() {
  const node = openModal(
    '<h2>Sugerir material</h2>' +
    '<p class="modal-subtitle">Sera revisado antes de aparecer.</p>' +
    '<form id="formSug" class="report-form" style="box-shadow:none;padding:0;">' +
      '<div class="form-group"><label>Material <span class="required">*</span></label><input type="text" id="sugMat" required></div>' +
      '<div class="form-group"><label>Presentacion</label><select id="sugPres"><option value="">Selecciona</option>' +
        PRESENTACIONES.map(p => '<option>' + p + '</option>').join('') +
      '</select></div>' +
      '<div class="form-group"><label>Origen</label><select id="sugOrig"><option value="">Selecciona</option>' +
        ORIGENES.map(o => '<option>' + o + '</option>').join('') +
      '</select></div>' +
      '<div class="form-group"><label>Color</label><input type="text" id="sugColor"></div>' +
      '<button type="submit" class="btn btn-primary btn-full">Enviar sugerencia</button>' +
    '</form>'
  );
  node.querySelector('#formSug').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const restore = showButtonLoading(btn, 'Enviando...');
    try {
      await crearSugerencia({
        material: node.querySelector('#sugMat').value,
        presentacion: node.querySelector('#sugPres').value,
        origen: node.querySelector('#sugOrig').value,
        color: node.querySelector('#sugColor').value || 'No especificado',
      });
      node.remove();
      showToast('Sugerencia enviada.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
      restore();
    }
  });
}
