import { $ } from '@/utils/dom.js';
import { getState } from '@/state/store.js';
import { ESTADOS_MEXICO, PRESENTACIONES, ORIGENES } from '@/utils/constants.js';
import { crearReporte, fetchReportes } from '@/services/reportes.service.js';
import { analizarPrecio } from '@/services/antiFraude.service.js';
import { showToast } from '@/ui/components/toast.js';
import { showButtonLoading } from '@/ui/components/spinner.js';
import { confirmModal } from '@/ui/components/confirm.js';
import { openAuthModal } from '@/modals/auth.modal.js';
import { openSugerirMaterialModal } from '@/modals/sugerirMaterial.modal.js';

export function renderReportar() {
  const { currentUser, materiales } = getState();
  const root = $('#panel-reportar');
  const accessHTML = currentUser
    ? '<p style="color:var(--success);padding:8px;">Accedido como <strong>' + currentUser.nombre + '</strong></p>'
    : '<p>Para reportar precios necesitas acceder.</p><button class="btn btn-primary" id="reportLogin" style="margin-top:16px;">Acceder</button>';

  root.innerHTML =
    '<div class="panel-header">' +
      '<h2>Reportar Precio</h2>' +
      '<p class="subtitle">Comparte tu dato y desbloquea el promedio de tu zona.</p>' +
    '</div>' +
    '<div class="access-message">' + accessHTML + '</div>' +
    '<form id="formReporte" class="report-form" style="display:' + (currentUser ? 'flex' : 'none') + ';">' +
      '<div class="form-group">' +
        '<label>Material <span class="required">*</span></label>' +
        '<select id="material" required><option value="">Selecciona</option>' +
          materiales.map(m => '<option value="' + m.id + '">' + m.material + ' - ' + m.color + ' (' + m.presentacion + ')</option>').join('') +
        '</select>' +
        '<button type="button" class="btn btn-xs btn-ghost" id="btnSugerirMaterial" style="margin-top:4px;">+ Sugerir nuevo material</button>' +
      '</div>' +
      '<div class="form-group"><label>Presentacion *</label>' +
        '<select id="presentacion" required><option value="">Selecciona</option>' +
          PRESENTACIONES.map(p => '<option>' + p + '</option>').join('') +
        '</select>' +
      '</div>' +
      '<div class="form-group"><label>Origen *</label>' +
        '<select id="origen" required><option value="">Selecciona</option>' +
          ORIGENES.map(o => '<option>' + o + '</option>').join('') +
        '</select>' +
      '</div>' +
      '<div class="form-group"><label>Color</label><input type="text" id="color" placeholder="Ej: Blanco Natural"></div>' +
      '<div class="form-group">' +
        '<label>Precio por Kilo (MXN) *</label>' +
        '<input type="number" id="precioKg" step="0.01" min="0" required>' +
        '<div class="precio-warning" id="precioWarning" style="display:none;"></div>' +
      '</div>' +
      '<div class="form-group"><label>Tipo *</label>' +
        '<select id="tipoOperacion" required><option value="">Selecciona</option>' +
          '<option value="Compra">Precio al que COMPRO</option>' +
          '<option value="Venta">Precio al que VENDO</option>' +
        '</select>' +
      '</div>' +
      '<div class="form-row">' +
        '<div class="form-group"><label>Estado *</label>' +
          '<select id="estado" required><option value="">Selecciona</option>' +
            ESTADOS_MEXICO.map(e => '<option>' + e + '</option>').join('') +
          '</select>' +
        '</div>' +
        '<div class="form-group"><label>Municipio</label><input type="text" id="municipio"></div>' +
      '</div>' +
      '<div class="form-group"><label>Volumen (Toneladas)</label><input type="number" id="volumenTon" step="0.1" min="0"></div>' +
      '<div class="form-group"><label>Contaminacion</label>' +
        '<select id="contaminacion"><option value="">Selecciona</option>' +
          '<option value="0%">0%</option><option value="<1%">&lt;1%</option>' +
          '<option value="1-3%">1-3%</option><option value=">3%">&gt;3%</option>' +
        '</select>' +
      '</div>' +
      '<button type="submit" class="btn btn-primary btn-full">Reportar Precio</button>' +
    '</form>' +
    '<div id="reportResult" style="display:none;"></div>';

  if (!currentUser) { $('#reportLogin').addEventListener('click', openAuthModal); return; }
  $('#btnSugerirMaterial').addEventListener('click', openSugerirMaterialModal);
  $('#formReporte').addEventListener('submit', onSubmit);
  ['precioKg','material','estado'].forEach(id => {
    $('#' + id).addEventListener('input', checkPrecio);
    $('#' + id).addEventListener('change', checkPrecio);
  });
}

function checkPrecio() {
  const p = parseFloat($('#precioKg').value);
  const m = parseInt($('#material').value, 10);
  const e = $('#estado').value;
  const w = $('#precioWarning');
  if (!p || !m || !e) { w.style.display = 'none'; return; }
  const r = analizarPrecio(p, m, e);
  if (r.nivel !== 'normal') {
    w.style.display = 'block';
    w.textContent = r.mensaje;
    w.className = 'precio-warning ' + (r.nivel === 'critico' ? 'danger' : 'suspicious');
  } else w.style.display = 'none';
}

async function onSubmit(e) {
  e.preventDefault();
  const { currentUser, materiales } = getState();
  if (!currentUser) return showToast('Debes iniciar sesion.', 'error');

  const materialId = parseInt($('#material').value, 10);
  const precio = parseFloat($('#precioKg').value);
  const estado = $('#estado').value;
  const analisis = analizarPrecio(precio, materialId, estado);
  let verificado = !analisis.esAtipico;

  if (analisis.nivel === 'critico') {
    const ok = await confirmModal(analisis.mensaje + '\n\nReportar de todos modos?');
    if (!ok) return;
    verificado = false;
  }

  const btn = e.target.querySelector('button[type="submit"]');
  const restore = showButtonLoading(btn, 'Reportando...');

  const payload = {
    material_id: materialId, precio_kg: precio, estado,
    municipio: $('#municipio').value || 'No especificado',
    volumen_ton: parseFloat($('#volumenTon').value) || 1,
    tipo_operacion: $('#tipoOperacion').value,
    contaminacion: $('#contaminacion').value || 'No especificado',
    fecha: new Date().toISOString().split('T')[0],
    verificado,
  };

  try {
    await crearReporte(payload);
    await fetchReportes();
    showToast('Reporte registrado!', 'success');
    const mat = materiales.find(m => m.id === materialId);
    $('#formReporte').style.display = 'none';
    const res = $('#reportResult');
    res.style.display = 'block';
    res.className = 'report-result';
    res.innerHTML =
      '<h3>Reporte Registrado</h3>' +
      '<p>' + payload.tipo_operacion + ' de <strong>' + (mat ? mat.material : '') + '</strong> en ' + estado + ': <strong>$' + precio.toFixed(2) + '/kg</strong>.</p>' +
      (!verificado ? '<p style="color:var(--danger);">Marcado como atipico.</p>' : '') +
      '<button class="btn btn-primary" style="margin-top:16px;" onclick="location.reload()">Reportar otro</button>';
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
    restore();
  }
}
