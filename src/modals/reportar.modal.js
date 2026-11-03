import { openModal } from '@/ui/components/modal.js';
import { api } from '@/api/client.js';
import { ENDPOINTS } from '@/api/endpoints.js';
import { setState } from '@/state/store.js';
import { showToast } from '@/ui/components/toast.js';
import { showButtonLoading } from '@/ui/components/spinner.js';

export function openReportarModal(email) {
  const node = openModal(
    '<h2>Reportar vendedor</h2>' +
    '<form id="formRep" class="report-form" style="box-shadow:none;padding:0;">' +
      '<div class="form-group"><label>Motivo</label>' +
        '<select id="repMotivo" required><option value="">Selecciona</option>' +
          '<option>Material no entregado</option><option>Material no coincide</option>' +
          '<option>Estafa / fraude</option><option>Incumplimiento de garantia</option>' +
          '<option>Precio sospechoso</option><option>Otro</option>' +
        '</select>' +
      '</div>' +
      '<div class="form-group"><label>Descripcion</label><textarea id="repDesc" rows="3"></textarea></div>' +
      '<button type="submit" class="btn btn-primary btn-full">Enviar reporte</button>' +
    '</form>'
  );
  node.querySelector('#formRep').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const restore = showButtonLoading(btn, 'Enviando...');
    try {
      await api.post(ENDPOINTS.reportesVendedor, {
        reportedEmail: email,
        motivo: node.querySelector('#repMotivo').value,
        descripcion: node.querySelector('#repDesc').value,
      });
      const reportesVendedor = await api.get(ENDPOINTS.reportesVendedor);
      setState({ reportesVendedor });
      node.remove();
      showToast('Reporte enviado.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
      restore();
    }
  });
}
