import { $, $$ } from '@/utils/dom.js';
import { debounce } from '@/utils/debounce.js';
import { getState } from '@/state/store.js';
import { ESTADOS_MEXICO, ITEMS_POR_PAGINA_MK } from '@/utils/constants.js';
import { crearPublicacion, actualizarPublicacion, eliminarPublicacion, fetchMarketplace } from '@/services/marketplace.service.js';
import { crearOferta } from '@/services/ofertas.service.js';
import { openAuthModal } from '@/modals/auth.modal.js';
import { openContactoModal } from '@/modals/contacto.modal.js';
import { openCalificarModal } from '@/modals/calificar.modal.js';
import { openOfertaModal } from '@/modals/oferta.modal.js';
import { showToast } from '@/ui/components/toast.js';
import { showButtonLoading } from '@/ui/components/spinner.js';
import { generarCSV, descargarArchivo, nombreArchivoCSV } from '@/utils/csv.js';
import { confirmModal } from '@/ui/components/confirm.js';
import { createMkCard } from './mkCard.js';

let pagina = 1;
let tab = 'todas';

export function renderMarketplace() {
  const { currentUser, materiales } = getState();
  const root = $('#panel-marketplace');

  const accessHTML = currentUser
    ? ''
    : `<p>🔒 Inicia sesión para ver y publicar.</p><button class="btn btn-primary" id="mkLogin">Acceder</button>`;

  root.innerHTML = `
    <div class="panel-header">
      <h2>Marketplace de Plástico Molido</h2>
      <p class="subtitle">Publica ofertas de compra/venta o busca material disponible en tu zona.</p>
    </div>
    <div class="disclaimer-box">
      <p><strong>⚠️ Aviso:</strong> PrecioMolido.mx <strong>NO</strong> se hace responsable de las transacciones.</p>
      <ul>
        <li>✅ Verificar el material antes de pagar.</li>
        <li>✅ Usar métodos de pago seguros.</li>
        <li>🚩 Reporta intentos de estafa.</li>
      </ul>
    </div>
    <div class="access-message" id="mkAccess">${accessHTML}</div>
    ${currentUser ? `
      <div style="display:flex;gap:8px;margin-bottom:24px;flex-wrap:wrap;"><button class="btn btn-primary" id="btnPublicar">➕ Nueva publicación</button><button class="btn btn-ghost" id="btnExportMK">📥 Exportar CSV</button></div>
      <div class="marketplace-tabs">
        <button class="mk-tab active" data-tab="todas">📋 Todas</button>
        <button class="mk-tab" data-tab="ventas">💰 Ventas</button>
        <button class="mk-tab" data-tab="compras">🛒 Compras</button>
      </div>
      <div id="mkTabMsg" class="small" style="display:none;text-align:center;margin-bottom:16px;color:var(--success);font-weight:600;"></div>
      <form id="formMK" class="report-form" style="display:none;">
        <input type="hidden" id="mkEditId">
        <div class="form-group">
          <label>Tipo <span class="required">*</span></label>
          <select id="mkTipo" required>
            <option value="Compra">Busco comprar</option>
            <option value="Venta">Tengo para vender</option>
          </select>
        </div>
        <div class="form-group">
          <label>Material <span class="required">*</span></label>
          <select id="mkMaterial" required>
            <option value="">Selecciona</option>
            ${materiales.map(m => `<option value="${m.id}">${m.material} - ${m.color}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Presentación</label>
          <input type="text" id="mkPresentacion" placeholder="Ej: Molido, Hojuela">
        </div>
        <div class="form-group">
          <label>Origen</label>
          <select id="mkOrigen">
            <option value="">Selecciona</option>
            <option>Post-Industrial</option>
            <option>Post-Consumo</option>
            <option>Virgen Off-Spec</option>
          </select>
        </div>
        <div class="form-group">
          <label>Color</label>
          <input type="text" id="mkColor">
        </div>
        <div class="form-group">
          <label>Precio (MXN/kg)</label>
          <input type="number" id="mkPrecio" step="0.01" min="0">
          <div class="precio-warning" id="mkPrecioWarning" style="display:none;"></div>
        </div>
        <div class="form-group">
          <label>Volumen (Toneladas)</label>
          <input type="number" id="mkVolumen" step="0.1" min="0">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Estado <span class="required">*</span></label>
            <select id="mkEstado" required>
              <option value="">Selecciona</option>
              ${ESTADOS_MEXICO.map(e => `<option>${e}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Municipio</label>
            <input type="text" id="mkMunicipio">
          </div>
        </div>
        <div class="form-group">
          <label>¿Ofreces garantía?</label>
          <select id="mkGarantia"><option>No</option><option>Sí</option></select>
        </div>
        <div class="form-group">
          <label>Descripción</label>
          <textarea id="mkDescripcion" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label>Foto (opcional)</label>
          <input type="file" id="mkFoto" accept="image/*">
          <img id="mkFotoPreview" style="display:none;max-width:200px;margin-top:10px;border-radius:8px;">
        </div>
        <button type="submit" class="btn btn-primary btn-full" id="btnSubmitMK">📢 Publicar</button>
        <button type="button" class="btn btn-ghost btn-full" id="btnCancelMK">Cancelar</button>
      </form>
      <div class="filters-bar">
        <div class="filter-group">
          <label>Material</label>
          <select id="mkFilterMaterial">
            <option value="todos">Todos</option>
            ${materiales.map(m => `<option value="${m.id}">${m.material}</option>`).join('')}
          </select>
        </div>
        <div class="filter-group">
          <label>Estado</label>
          <select id="mkFilterEstado">
            <option value="todos">Todos</option>
            ${ESTADOS_MEXICO.map(e => `<option>${e}</option>`).join('')}
          </select>
        </div>
        <div class="filter-group">
          <label>🔍 Buscar</label>
          <input type="text" id="searchMK" placeholder="Buscar...">
        </div>
        <div class="filter-group">
          <label>📋 Ordenar</label>
          <select id="sortMK">
            <option value="fecha-desc">Más recientes</option>
            <option value="fecha-asc">Más antiguos</option>
            <option value="precio-asc">Precio: menor a mayor</option>
            <option value="precio-desc">Precio: mayor a menor</option>
          </select>
        </div>
      </div>
      <div id="marketplaceList" class="marketplace-grid"></div>
      <div class="pagination-container" id="mkPagination" style="display:none; align-items:center; justify-content:center; gap:15px; margin: 30px 0;">
      <button id="btnPrevMK" class="btn btn-ghost">← Anterior</button>
      <span id="pageInfoMK" style="font-size:0.9rem; font-weight:600; color:var(--gray-600);">Página 1</span>
      <button id="btnNextMK" class="btn btn-primary">Siguiente →</button>
   </div>
    ` : ''}
  `;

  if (!currentUser) {
    $('#mkLogin')?.addEventListener('click', openAuthModal);
    return;
  }

  // Tabs
  $$('.mk-tab').forEach(t => t.addEventListener('click', () => {
    $$('.mk-tab').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    tab = t.dataset.tab;
    pagina = 1;
    update();
  }));

  // Form
  $('#btnExportMK').addEventListener('click', exportarMarketplaceCSV);
  $('#btnPublicar').addEventListener('click', () => { $('#formMK').reset(); $('#mkEditId').value = ''; $('#formMK').style.display = 'flex'; $('#btnPublicar').style.display = 'none'; });
  $('#btnCancelMK').addEventListener('click', () => { $('#formMK').style.display = 'none'; $('#btnPublicar').style.display = 'inline-flex'; });
  $('#formMK').addEventListener('submit', onSubmit);
  $('#mkFoto').addEventListener('change', onFotoPreview);

  // Filtros
  ['mkFilterMaterial','mkFilterEstado','sortMK'].forEach(id =>
    $(`#${id}`).addEventListener('change', () => { pagina = 1; update(); }));
  $('#searchMK').addEventListener('input', debounce(() => { pagina = 1; update(); }, 300));
  $('#btnPrevMK').addEventListener('click', () => { if (pagina > 1) { pagina--; update(false); window.scrollTo({ top: 0, behavior: 'smooth' }); } });
  $('#btnNextMK').addEventListener('click', () => { pagina++; update(false); window.scrollTo({ top: 0, behavior: 'smooth' }); });

  update();
}

function onFotoPreview(e) {
  const f = e.target.files[0];
  const p = $('#mkFotoPreview');
  if (!f) { p.style.display = 'none'; return; }
  const r = new FileReader();
  r.onload = ev => { p.src = ev.target.result; p.style.display = 'block'; };
  r.readAsDataURL(f);
}

async function onSubmit(e) {
  e.preventDefault();
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const restore = showButtonLoading(submitBtn, 'Publicando...');
  const editId = $('#mkEditId').value;
  const payload = {
    tipo: $('#mkTipo').value,
    material_id: parseInt($('#mkMaterial').value, 10),
    presentacion: $('#mkPresentacion').value || 'No especificado',
    origen: $('#mkOrigen').value || 'No especificado',
    color: $('#mkColor').value || 'No especificado',
    precio_kg: parseFloat($('#mkPrecio').value) || 0,
    volumen_ton: parseFloat($('#mkVolumen').value) || 0,
    estado: $('#mkEstado').value,
    municipio: $('#mkMunicipio').value || 'No especificado',
    garantia: $('#mkGarantia').value,
    descripcion: $('#mkDescripcion').value || '',
    foto: null,
  };

  const file = $('#mkFoto').files[0];
  const proceed = async () => {
    try {
      if (editId) await actualizarPublicacion(editId, payload);
      else        await crearPublicacion(payload);
      await fetchMarketplace();
      showToast(editId ? 'Actualizado.' : 'Publicado.', 'success');
      $('#formMK').style.display = 'none';
      $('#btnPublicar').style.display = 'inline-flex';
      update();
    } catch (err) { showToast('Error: ' + err.message, 'error'); restore(); }
  };

  if (file) {
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const { api } = await import('@/api/client.js');
        const { ENDPOINTS } = await import('@/api/endpoints.js');
        const up = await api.post(ENDPOINTS.upload, { image: ev.target.result });
        payload.foto = up.url;
        await proceed();
      } catch { showToast('Error al subir imagen', 'error'); }
    };
    reader.readAsDataURL(file);
  } else await proceed();
}

function update(reset = true) {
  if (reset) pagina = 1;
  const { publicacionesMK, currentUser } = getState();
  const fm = $('#mkFilterMaterial').value;
  const fe = $('#mkFilterEstado').value;
  const q  = $('#searchMK').value.toLowerCase();
  const sort = $('#sortMK').value;

  let list = publicacionesMK.filter(p => p.activo !== false);
  if (tab === 'ventas')  list = list.filter(p => p.tipo === 'Venta');
  if (tab === 'compras') list = list.filter(p => p.tipo === 'Compra');
  if (fm !== 'todos') {
    list = list.filter(p => {
      const mat = materiales.find(x => x.id === p.material_id);
      return mat && mat.material === fm;
    });
  }
  if (fe !== 'todos') list = list.filter(p => p.estado === fe);
  if (q) list = list.filter(p => {
    const { materiales } = getState();
    const m = materiales.find(x => x.id === p.material_id);
    return (m && (m.material.toLowerCase().includes(q) || m.color.toLowerCase().includes(q))) ||
           (p.descripcion || '').toLowerCase().includes(q) ||
           (p.usuario_nombre || '').toLowerCase().includes(q);
  });

  if (sort === 'fecha-desc') list.sort((a,b) => new Date(b.fecha) - new Date(a.fecha));
  if (sort === 'fecha-asc')  list.sort((a,b) => new Date(a.fecha) - new Date(b.fecha));
  if (sort === 'precio-asc') list.sort((a,b) => (a.precio_kg || 0) - (b.precio_kg || 0));
  if (sort === 'precio-desc') list.sort((a,b) => (b.precio_kg || 0) - (a.precio_kg || 0));

  const inicio = (pagina - 1) * ITEMS_POR_PAGINA_MK;
  const paginaDatos = list.slice(inicio, inicio + ITEMS_POR_PAGINA_MK);

  const cont = $('#marketplaceList');
  cont.innerHTML = '';
  if (!paginaDatos.length) {
    cont.innerHTML = '<p class="empty" style="grid-column:1/-1;">No hay publicaciones.</p>';
  } else {
    const frag = document.createDocumentFragment();
    paginaDatos.forEach(p => frag.appendChild(createMkCard(p, {
      onContactar: openContactoModal,
      onCalificar: openCalificarModal,
      onOferta:    openOfertaModal,
    })));
    cont.appendChild(frag);
  }

  const total = Math.ceil(list.length / ITEMS_POR_PAGINA);
  $('#btnLoadMoreMK').style.display = pagina < total ? 'inline-block' : 'none';

  const msg = $('#mkTabMsg');
  if (tab === 'compras') {
    msg.style.display = 'block';
    msg.textContent = '🛒 Estas publicaciones son de compradores buscando material.';
  } else msg.style.display = 'none';
}

export async function editarPublicacion(id) {
  const { publicacionesMK } = getState();
  const p = publicacionesMK.find(x => x.id == id);
  if (!p) return;
  $('#mkEditId').value = p.id;
  $('#mkTipo').value = p.tipo;
  $('#mkMaterial').value = p.material_id;
  $('#mkPresentacion').value = p.presentacion || '';
  $('#mkOrigen').value = p.origen || '';
  $('#mkColor').value = p.color || '';
  $('#mkPrecio').value = p.precio_kg || '';
  $('#mkVolumen').value = p.volumen_ton || '';
  $('#mkEstado').value = p.estado;
  $('#mkMunicipio').value = p.municipio || '';
  $('#mkGarantia').value = p.garantia;
  $('#mkDescripcion').value = p.descripcion || '';
  $('#formMK').style.display = 'flex';
  $('#btnPublicar').style.display = 'none';
  $('#formMK').scrollIntoView({ behavior: 'smooth' });
}

export async function borrarPublicacion(id) {
  if (!(await confirmModal('¿Eliminar publicación?'))) return;
  try {
    await eliminarPublicacion(id);
    await fetchMarketplace();
    showToast('Eliminada.', 'info');
    update();
  } catch (e) { showToast('Error', 'error'); }
}

function exportarMarketplaceCSV() {
  const { publicacionesMK, materiales, currentUser } = getState();

  if (!currentUser) {
    showToast('Inicia sesion para exportar datos', 'warning');
    import('@/modals/auth.modal.js').then(m => m.openAuthModal());
    return;
  }

  const activas = publicacionesMK.filter(p => p.activo !== false);

  if (!activas.length) {
    showToast('No hay publicaciones para exportar', 'warning');
    return;
  }

  const filas = activas.map(p => {
    const m = materiales.find(x => x.id === p.material_id) || {};
    return {
      tipo: p.tipo,
      material: m.material || '',
      color: m.color || '',
      presentacion: p.presentacion || '',
      origen: p.origen || '',
      precio: p.precio_kg || 0,
      volumen: p.volumen_ton || 0,
      estado: p.estado,
      municipio: p.municipio || '',
      garantia: p.garantia || '',
      usuario: p.usuario_nombre || '',
      fecha: new Date(p.fecha).toLocaleDateString('es-MX'),
    };
  });

  const columnas = [
    { key: 'tipo', label: 'Tipo' },
    { key: 'material', label: 'Material' },
    { key: 'color', label: 'Color' },
    { key: 'presentacion', label: 'Presentacion' },
    { key: 'origen', label: 'Origen' },
    { key: 'precio', label: 'Precio (MXN/kg)' },
    { key: 'volumen', label: 'Volumen (ton)' },
    { key: 'estado', label: 'Estado' },
    { key: 'municipio', label: 'Municipio' },
    { key: 'garantia', label: 'Garantia' },
    { key: 'usuario', label: 'Publicado por' },
    { key: 'fecha', label: 'Fecha' },
  ];

  const csv = generarCSV(filas, columnas);
  descargarArchivo(csv, nombreArchivoCSV('preciomolido_marketplace'));
  showToast('CSV descargado', 'success');
}
