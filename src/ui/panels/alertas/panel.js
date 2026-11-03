import { $, $$ } from '@/utils/dom.js';
import { getState } from '@/state/store.js';
import { ESTADOS_MEXICO } from '@/utils/constants.js';
import { crearAlerta, eliminarAlerta, fetchAlertas } from '@/services/alertas.service.js';
import { openAuthModal } from '@/modals/auth.modal.js';
import { showToast } from '@/ui/components/toast.js';
import { showButtonLoading } from '@/ui/components/spinner.js';
import { confirmModal } from '@/ui/components/confirm.js';

export function renderAlertas() {
  const { currentUser, materiales } = getState();
  const root = $('#panel-alertas');

  if (!currentUser) {
    root.innerHTML =
      '<div class="panel-header"><h2>Alertas de Precio</h2></div>' +
      '<div class="access-message">' +
        '<p>Inicia sesion para crear alertas.</p>' +
        '<button class="btn btn-primary" id="alertLogin" style="margin-top:16px;">Acceder</button>' +
      '</div>';
    $('#alertLogin').addEventListener('click', openAuthModal);
    return;
  }

  root.innerHTML =
    '<div class="panel-header">' +
      '<h2>Alertas de Precio</h2>' +
      '<p class="subtitle">Notificaciones cuando un material suba o baje.</p>' +
    '</div>' +
    '<form id="formAlerta" class="report-form">' +
      '<div class="form-group"><label>Material</label>' +
        '<select id="alertaMaterial" required><option value="">Selecciona</option>' +
          materiales.map(m => '<option value="' + m.id + '">' + m.material + ' - ' + m.color + '</option>').join('') +
        '</select>' +
      '</div>' +
      '<div class="form-group"><label>Estado</label>' +
        '<select id="alertaEstado" required><option value="">Selecciona</option>' +
          ESTADOS_MEXICO.map(e => '<option>' + e + '</option>').join('') +
        '</select>' +
      '</div>' +
      '<div class="form-group"><label>Precio objetivo (MXN/kg)</label>' +
        '<input type="number" id="alertaPrecio" step="0.01" min="0" required></div>' +
      '<div class="form-group"><label>Condicion</label>' +
        '<select id="alertaCondicion" required>' +
          '<option value="debajo">Cuando baje de este precio</option>' +
          '<option value="arriba">Cuando suba de este precio</option>' +
        '</select>' +
      '</div>' +
      '<button type="submit" class="btn btn-primary btn-full">Crear Alerta</button>' +
    '</form>' +
    '<div class="alertas-list" id="alertasList"></div>';

  $('#formAlerta').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const restore = showButtonLoading(btn, 'Creando...');
    try {
      await crearAlerta({
        material_id: parseInt($('#alertaMaterial').value, 10),
        estado: $('#alertaEstado').value,
        precio_objetivo: parseFloat($('#alertaPrecio').value),
        condicion: $('#alertaCondicion').value,
      });
      await fetchAlertas();
      showToast('Alerta creada.', 'success');
      renderAlertas();
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
      restore();
    }
  });

  renderList();
}

function renderList() {
  const { alertas, materiales } = getState();
  const list = $('#alertasList');
  if (!list) return;
  if (!alertas.length) {
    list.innerHTML = '<p style="text-align:center;color:var(--gray-400);">No tienes alertas.</p>';
    return;
  }
  list.innerHTML = alertas.map(a => {
    const m = materiales.find(x => x.id === a.material_id);
    return '<div class="alerta-item">' +
      '<div class="alerta-info">' +
        '<div class="alerta-material">' + (m ? m.material : 'Material') + ' en ' + a.estado + '</div>' +
        '<div class="alerta-detalle">Cuando ' + (a.condicion === 'debajo' ? 'baje' : 'suba') + ' de $' + a.precio_objetivo.toFixed(2) + '/kg</div>' +
      '</div>' +
      '<button class="alerta-delete" data-id="' + a.id + '">X</button>' +
    '</div>';
  }).join('');

  $$('.alerta-delete').forEach(b => b.addEventListener('click', async () => {
    if (!(await confirmModal('Eliminar alerta?'))) return;
    await eliminarAlerta(b.dataset.id);
    await fetchAlertas();
    renderList();
  }));
}
