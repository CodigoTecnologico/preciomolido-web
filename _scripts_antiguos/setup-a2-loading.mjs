import fs from 'node:fs';
import path from 'node:path';
const BASE = process.cwd();
function write(rel, content) {
  const full = path.join(BASE, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.trimStart(), 'utf8');
  console.log('  OK', rel);
}

console.log('\n🚀 Fase A2.1: Botones con spinner\n');

// ============================================================
// 1. AUTH MODAL — Login y Registro con spinner
// ============================================================
write('src/modals/auth.modal.js', `
import { openModal } from '@/ui/components/modal.js';
import { $ } from '@/utils/dom.js';
import { login, registro } from '@/services/auth.service.js';
import { ESTADOS_MEXICO } from '@/utils/constants.js';
import { updateUserUI } from '@/ui/layouts/header.js';
import { showToast } from '@/ui/components/toast.js';
import { showButtonLoading } from '@/ui/components/spinner.js';
import { fetchAlertas } from '@/services/alertas.service.js';
import { fetchOfertas } from '@/services/ofertas.service.js';

export function openAuthModal() {
  const node = openModal(
    '<div style="display:flex;margin-bottom:20px;border-bottom:2px solid var(--gray-200);">' +
      '<button class="auth-tab active" data-tab="login" style="flex:1;padding:10px;background:none;border:none;font-weight:600;cursor:pointer;border-bottom:2px solid var(--primary);">Iniciar Sesion</button>' +
      '<button class="auth-tab" data-tab="registro" style="flex:1;padding:10px;background:none;border:none;font-weight:600;cursor:pointer;color:var(--gray-500);">Registrarse</button>' +
    '</div>' +
    '<form id="formLogin" class="report-form" style="box-shadow:none;padding:0;">' +
      '<div class="form-group"><label>Email</label><input type="email" id="loginEmail" required></div>' +
      '<div class="form-group"><label>Contrasena</label><input type="password" id="loginPassword" required></div>' +
      '<button type="submit" class="btn btn-primary btn-full" data-loading-text="Entrando...">Entrar</button>' +
    '</form>' +
    '<form id="formRegistro" class="report-form" style="display:none;box-shadow:none;padding:0;">' +
      '<div class="form-group"><label>Nombre</label><input type="text" id="regNombre" required></div>' +
      '<div class="form-group"><label>Email</label><input type="email" id="regEmail" required></div>' +
      '<div class="form-group"><label>Contrasena</label><input type="password" id="regPassword" minlength="6" required></div>' +
      '<div class="form-group"><label>Tipo</label><select id="regTipo" required><option value="">Selecciona</option><option>Acopiador</option><option>Transformador / Reciclador</option><option>Distribuidor de Virgen Off-Spec</option></select></div>' +
      '<div class="form-group"><label>Estado</label><select id="regEstado" required><option value="">Selecciona</option>' +
        ESTADOS_MEXICO.map(e => '<option>' + e + '</option>').join('') +
      '</select></div>' +
      '<button type="submit" class="btn btn-primary btn-full" data-loading-text="Creando cuenta...">Crear cuenta</button>' +
    '</form>'
  );

  const tabs = node.querySelectorAll('.auth-tab');
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => { x.classList.remove('active'); x.style.borderBottom='none'; x.style.color='var(--gray-500)'; });
    t.classList.add('active'); t.style.borderBottom='2px solid var(--primary)'; t.style.color='';
    node.querySelector('#formLogin').style.display    = t.dataset.tab === 'login'    ? 'flex' : 'none';
    node.querySelector('#formRegistro').style.display = t.dataset.tab === 'registro' ? 'flex' : 'none';
  }));

  node.querySelector('#formLogin').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const restore = showButtonLoading(btn, 'Entrando...');
    try {
      await login($('#loginEmail').value, $('#loginPassword').value);
      node.remove(); updateUserUI();
      await fetchAlertas().catch(()=>{}); await fetchOfertas().catch(()=>{});
      showToast('Bienvenido.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
      restore();
    }
  });

  node.querySelector('#formRegistro').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const restore = showButtonLoading(btn, 'Creando cuenta...');
    try {
      await registro($('#regNombre').value, $('#regEmail').value, $('#regPassword').value, $('#regTipo').value, $('#regEstado').value);
      node.remove(); updateUserUI();
      await fetchAlertas().catch(()=>{}); await fetchOfertas().catch(()=>{});
      showToast('Cuenta creada.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
      restore();
    }
  });
}
`);

// ============================================================
// 2. REPORTAR PANEL — Boton con spinner
// ============================================================
write('src/ui/panels/reportar/panel.js', `
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
    const ok = await confirmModal(analisis.mensaje + '\\n\\nReportar de todos modos?');
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
`);

// ============================================================
// 3. ALERTAS PANEL — Boton con spinner
// ============================================================
write('src/ui/panels/alertas/panel.js', `
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
`);

// ============================================================
// 4. OFERTA MODAL — Boton con spinner
// ============================================================
write('src/modals/oferta.modal.js', `
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
`);

// ============================================================
// 5. CALIFICAR MODAL — Boton con spinner
// ============================================================
write('src/modals/calificar.modal.js', `
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
`);

// ============================================================
// 6. REPORTAR VENDEDOR MODAL — Boton con spinner
// ============================================================
write('src/modals/reportar.modal.js', `
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
`);

// ============================================================
// 7. SUGERIR MATERIAL MODAL — Boton con spinner
// ============================================================
write('src/modals/sugerirMaterial.modal.js', `
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
`);

// ============================================================
// 8. MARKETPLACE PANEL — Boton submit con spinner
// ============================================================
console.log('  • Verificando marketplace/panel.js...');
const mkPath = path.join(BASE, 'src/ui/panels/marketplace/panel.js');
let mkContent = fs.readFileSync(mkPath, 'utf8');

// Agregar import
if (!mkContent.includes('showButtonLoading')) {
  mkContent = mkContent.replace(
    /import \{ showToast \} from '@\/ui\/components\/toast\.js';/,
    "import { showToast } from '@/ui/components/toast.js';\nimport { showButtonLoading } from '@/ui/components/spinner.js';"
  );
  console.log('    - Import agregado');
}

// Reemplazar el inicio de onSubmit
mkContent = mkContent.replace(
  /async function onSubmit\(e\) \{\s*e\.preventDefault\(\);\s*const editId/,
  "async function onSubmit(e) {\n  e.preventDefault();\n  const submitBtn = e.target.querySelector('button[type=\"submit\"]');\n  const restore = showButtonLoading(submitBtn, 'Publicando...');\n  const editId"
);

// Agregar restore en catch
mkContent = mkContent.replace(
  /(catch \(err\) \{ showToast\('Error: ' \+ err\.message, 'error'\); \})/,
  "catch (err) { showToast('Error: ' + err.message, 'error'); restore(); }"
);

fs.writeFileSync(mkPath, mkContent, 'utf8');
console.log('  OK src/ui/panels/marketplace/panel.js');

console.log('\n✅ Fase A2.1 aplicada\n');
console.log('📋 Ahora ejecuta:');
console.log('   npm run dev\n');
console.log('Veras spinner en:');
console.log('   • Boton "Entrar" / "Crear cuenta"');
console.log('   • Boton "Reportar Precio"');
console.log('   • Boton "Crear Alerta"');
console.log('   • Boton "Enviar oferta"');
console.log('   • Boton "Enviar" (calificar/reportar)');
console.log('   • Boton "Publicar" del marketplace\n');