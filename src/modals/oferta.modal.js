import { openModal } from '@/ui/components/modal.js';
import { crearOferta, fetchOfertas } from '@/services/ofertas.service.js';
import { showToast } from '@/ui/components/toast.js';
import { showButtonLoading } from '@/ui/components/spinner.js';

export function openOfertaModal(publicacionId, compradorEmail) {
  const node = openModal(
    '<h2>Hacer una oferta</h2>' +
    '<form id="formOf" class="report-form" style="box-shadow:none;padding:0;">' +
      '<div class="form-group"><label>Precio (MXN/kg) <span class="required">*</span></label>' +
        '<input type="number" id="ofPrecio" step="0.01" min="0" required></div>' +
      '<div class="form-group"><label>Volumen (Toneladas)</label>' +
        '<input type="number" id="ofVol" step="0.1" min="0"></div>' +
      '<div class="form-group"><label>Mensaje</label><textarea id="ofMsg" rows="3"></textarea></div>' +
      '<button type="submit" class="btn btn-primary btn-full">Enviar oferta</button>' +
    '</form>'
  );

  node.querySelector('#formOf').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const restore = showButtonLoading(btn, 'Enviando...');
    try {
      await crearOferta({
        publicacionId, compradorEmail,
        precio: parseFloat(node.querySelector('#ofPrecio').value),
        volumen: parseFloat(node.querySelector('#ofVol').value) || 0,
        mensaje: node.querySelector('#ofMsg').value,
      });
      await fetchOfertas();
      node.remove();
      showToast('Oferta enviada.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
      restore();
    }
  });
}
