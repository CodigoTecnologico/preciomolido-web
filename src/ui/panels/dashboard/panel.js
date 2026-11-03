import { $, $$ } from '@/utils/dom.js';
import { debounce } from '@/utils/debounce.js';
import { getState, setState } from '@/state/store.js';
import { ITEMS_POR_PAGINA, ESTADOS_MEXICO } from '@/utils/constants.js';
import { createPriceCard } from './priceCard.js';
import { renderPriceTable } from './priceTable.js';
import { calcularConfianzaMercado } from '@/services/antiFraude.service.js';
import { generarCSV, descargarArchivo, nombreArchivoCSV } from '@/utils/csv.js';

let pagina = 1;

export function renderDashboard() {
  const state = getState();
  const materiales = Array.isArray(state.materiales) ? state.materiales : [];
  const currentUser = state.currentUser;
  const root = $('#panel-dashboard');
  
  if (!root) return;
  const materialesUnicos = [...new Set(materiales.map(m => m.material))];

  root.innerHTML = `
    <div class="panel-header">
      <h1>Precio del Plástico Molido en México</h1>
      <p class="subtitle">Promedio ponderado de los últimos 30 días, basado en reportes de acopiadores verificados.</p>
    </div>

    <div class="market-trust-banner" id="trustBanner">
      <div class="trust-content">
        <span class="trust-icon">🛡️</span>
        <div>
          <strong>Confianza del Mercado:</strong> <span id="trustLevel">Calculando...</span>
          <p style="font-size:.8rem;margin-top:4px;">Basado en la calidad de reportes.</p>
        </div>
      </div>
    </div>

    <div class="view-toggle">
      <button class="btn btn-sm btn-primary" id="viewCards">🗂 Tarjetas</button>
      <button class="btn btn-sm btn-ghost" id="viewTable">📋 Tabla</button>
      ${currentUser ? '<button class="btn btn-sm btn-ghost" id="btnExportCSV" title="Descargar CSV">📥 Exportar</button>' : ''}
    </div>

    <div class="filters-bar">
      <div class="filter-group">
        <label>Material</label>
        <select id="filterMaterial"><option value="todos">Todos los materiales</option>
          ${materialesUnicos.map(m => `<option value="${m}">${m}</option>`).join('')}
        </select>
      </div>
      <div class="filter-group">
        <label>Estado</label>
        <select id="filterEstado"><option value="todos">Todos los estados</option>
          ${ESTADOS_MEXICO.map(e => `<option>${e}</option>`).join('')}
        </select>
      </div>
      <div class="filter-group">
        <label>Operación</label>
        <select id="filterOperacion">
          <option value="todos">Compra y Venta</option>
          <option value="Compra">Solo Compra</option>
          <option value="Venta">Solo Venta</option>
        </select>
      </div>
      <div class="filter-group">
        <label>📅 Período</label>
        <select id="filterFecha">
          <option value="7">Últimos 7 días</option>
          <option value="30" selected>Últimos 30 días</option>
          <option value="90">Últimos 90 días</option>
          <option value="365">Último año</option>
          <option value="0">Todo el historial</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Calidad de datos</label>
        <select id="filterCalidad">
          <option value="todos">Todos los reportes</option>
          <option value="verificados">Solo verificados</option>
        </select>
      </div>
    </div>

    <div class="filters-bar" style="margin-top:0;border-top:none;">
      <div class="filter-group"><label>🔍 Buscar</label>
        <input type="text" id="searchDashboard" placeholder="Buscar material, color, estado...">
      </div>
      <div class="filter-group"><label>📋 Ordenar</label>
        <select id="sortDashboard">
          <option value="">Por defecto</option>
          <option value="precio-asc">Precio: menor a mayor</option>
          <option value="precio-desc">Precio: mayor a menor</option>
        </select>
      </div>
    </div>

    <div id="activeFilters" class="active-filters" style="display:none;"></div>

    <div id="priceCards" class="price-cards-grid">
      <div class="section-loading">
        <div class="spinner spinner-lg"></div>
        <p>Cargando precios...</p>
      </div>
    </div>
    
    <div id="priceTable" class="price-table-container" style="display:none;">
      <table class="price-table">
        <thead><tr>
          <th>Material</th><th>Pres.</th><th>Origen</th><th>Color</th>
          <th>Estado</th><th>Op.</th><th>Precio</th>
          <th>Rango</th><th>Rep.</th><th>Cal.</th><th>Acc.</th>
        </tr></thead>
        <tbody id="priceTableBody"></tbody>
      </table>
    </div>
    
    <div class="pagination-container">
      <button id="btnLoadMoreDashboard" class="btn btn-primary" style="display:none;">Cargar más precios</button>
    </div>
    <p class="transparency-note" id="transparencyNote"></p>
  `;

  // Event Listeners
  const searchEl = $('#searchDashboard');
  if (searchEl) searchEl.addEventListener('input', debounce(() => { pagina = 1; update(); }, 300));
  
  const sortEl = $('#sortDashboard');
  if (sortEl) sortEl.addEventListener('change', () => { pagina = 1; update(); });
  
  ['filterMaterial','filterEstado','filterOperacion','filterCalidad','filterFecha'].forEach(id => {
    const el = $('#' + id);
    if (el) el.addEventListener('change', () => { pagina = 1; update(); });
  });
  
  $('#viewCards').addEventListener('click', () => switchView('cards'));
  $('#viewTable').addEventListener('click', () => switchView('table'));
  
  const btnLoad = $('#btnLoadMoreDashboard');
  if (btnLoad) btnLoad.addEventListener('click', () => { pagina++; update(false); });
  
  const btnExp = $('#btnExportCSV');
  if (btnExp) btnExp.addEventListener('click', exportarDashboardCSV);

  $('#priceCards').addEventListener('click', async (e) => {
    const b = e.target.closest('[data-action="historico"]');
    if (!b) return;
    const card = b.closest('.price-card');
    const { abrirHistorico } = await import('./historicoModal.js');
    abrirHistorico(card.dataset.material, card.dataset.estado);
  });
  $('#priceTable').addEventListener('click', async (e) => {
    const b = e.target.closest('.btn-ver');
    if (!b) return;
    const { abrirHistorico } = await import('./historicoModal.js');
    abrirHistorico(b.dataset.material, b.dataset.estado);
  });

  update();
  updateTrustBanner();
}

function switchView(v) {
  setState({ viewMode: v });
  const cards = $('#priceCards'), table = $('#priceTable');
  const vc = $('#viewCards'), vt = $('#viewTable');
  if (v === 'cards') {
    cards.style.display = 'grid'; table.style.display = 'none';
    vc.className = 'btn btn-sm btn-primary'; vt.className = 'btn btn-sm btn-ghost';
  } else {
    cards.style.display = 'none'; table.style.display = 'block';
    vc.className = 'btn btn-sm btn-ghost'; vt.className = 'btn btn-sm btn-primary';
  }
}

function filtrar() {
  const state = getState();
  const reportes = Array.isArray(state.reportes) ? state.reportes : [];
  const materiales = Array.isArray(state.materiales) ? state.materiales : [];
  
  const fm = $('#filterMaterial').value;
  const fe = $('#filterEstado').value;
  const fo = $('#filterOperacion').value;
  const fc = $('#filterCalidad').value;
  const ff = $('#filterFecha') ? $('#filterFecha').value : '30';
  const q  = $('#searchDashboard').value.toLowerCase();

  let out = [...reportes];

  if (ff !== '0') {
    const dias = parseInt(ff, 10);
    const lim = new Date(Date.now() - dias * 86400000).toISOString().split('T')[0];
    out = out.filter(r => r.fecha >= lim);
  }

  if (fm !== 'todos') {
    const ids = materiales.filter(m => m.material === fm).map(m => m.id);
    out = out.filter(r => ids.includes(r.material_id));
  }
  if (fe !== 'todos') out = out.filter(r => r.estado === fe);
  if (fo !== 'todos') out = out.filter(r => r.tipo_operacion === fo);
  if (fc === 'verificados') out = out.filter(r => r.verificado === true);

  if (q) {
    out = out.filter(r => {
      const m = materiales.find(x => x.id === r.material_id);
      return m && (m.material.toLowerCase().includes(q) || (m.color || '').toLowerCase().includes(q) || r.estado.toLowerCase().includes(q));
    });
  }
  return out;
}

function agrupar(lista) {
  const g = {};
  for (const r of lista) {
    const k = `${r.material_id}|${r.estado}|${r.tipo_operacion}`;
    g[k] ??= { material_id: r.material_id, estado: r.estado, tipo_operacion: r.tipo_operacion,
      sumaPV: 0, sumaV: 0, precios: [], count: 0, todosVerificados: true };
    const v = r.volumen_ton || 1;
    g[k].sumaPV += r.precio_kg * v;
    g[k].sumaV += v;
    g[k].precios.push(r.precio_kg);
    g[k].count++;
    if (!r.verificado) g[k].todosVerificados = false;
  }
  return Object.values(g);
}

function renderActiveFilters(totalResultados) {
  const container = $('#activeFilters');
  if (!container) return;

  const filters = [
    { id: 'filterMaterial', label: 'Material', value: $('#filterMaterial').value, default: 'todos' },
    { id: 'filterEstado', label: 'Estado', value: $('#filterEstado').value, default: 'todos' },
    { id: 'filterOperacion', label: 'Operación', value: $('#filterOperacion').value, default: 'todos' },
    { id: 'filterCalidad', label: 'Calidad', value: $('#filterCalidad').value, default: 'todos' },
    { id: 'filterFecha', label: 'Período', value: $('#filterFecha') ? $('#filterFecha').value : '30', default: '30' },
    { id: 'searchDashboard', label: 'Búsqueda', value: $('#searchDashboard').value, default: '' },
  ];

  const activos = filters.filter(f => f.value !== f.default && f.value !== '');

  if (activos.length === 0) {
    container.style.display = 'none';
    container.innerHTML = '';
    return;
  }

  container.style.display = 'flex';
  const chipsHTML = activos.map(f => {
    let displayValue = f.value;
    if (f.id === 'filterFecha') {
      const map = { '7': '7 días', '30': '30 días', '90': '90 días', '365': '1 año', '0': 'Todo' };
      displayValue = map[f.value] || f.value;
    }
    return `<div class="filter-chip">
      <span>${f.label}: ${displayValue}</span>
      <button class="filter-chip-remove" data-id="${f.id}" data-default="${f.default}">×</button>
    </div>`;
  }).join('');

  container.innerHTML = `
    <span class="active-filters-label">Filtros activos:</span>
    ${chipsHTML}
    <span class="results-counter"><strong>${totalResultados}</strong> resultados</span>
  `;

  container.querySelectorAll('.filter-chip-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const def = btn.dataset.default;
      const el = document.getElementById(id);
      if (el) {
        el.value = def;
        pagina = 1;
        update();
      }
    });
  });
}

function update(reset = true) {
  if (reset) pagina = 1;
  const state = getState();
  const materiales = Array.isArray(state.materiales) ? state.materiales : [];
  
  const f = filtrar();
  let promedios = agrupar(f);
  
  const sortEl = $('#sortDashboard');
  const sort = sortEl ? sortEl.value : '';
  if (sort === 'precio-asc') promedios.sort((a,b) => a.sumaPV/a.sumaV - b.sumaPV/b.sumaV);
  if (sort === 'precio-desc') promedios.sort((a,b) => b.sumaPV/b.sumaV - a.sumaPV/a.sumaV);
  
  const inicio = (pagina - 1) * ITEMS_POR_PAGINA;
  const paginaDatos = promedios.slice(inicio, inicio + ITEMS_POR_PAGINA);
  
  const cont = $('#priceCards');
  if (cont) {
    cont.innerHTML = '';
    if (paginaDatos.length === 0) {
      cont.innerHTML = '<p style="text-align:center;color:var(--gray-400);padding:40px;grid-column:1/-1;">No hay datos para los filtros seleccionados.</p>';
    } else {
      const frag = document.createDocumentFragment();
      for (const e of paginaDatos) {
        const m = materiales.find(x => x.id === e.material_id);
        if (m) frag.appendChild(createPriceCard(e, m));
      }
      cont.appendChild(frag);
    }
  }
  
  renderPriceTable(paginaDatos, materiales);
  renderActiveFilters(f.length);
  
  const note = $('#transparencyNote');
  if (note) {
    note.textContent = `Mostrando ${paginaDatos.length} de ${promedios.length} promedios. Datos basados en ${f.length} reportes.`;
  }
  
  const btnLoad = $('#btnLoadMoreDashboard');
  if (btnLoad) {
    const total = Math.ceil(promedios.length / ITEMS_POR_PAGINA);
    btnLoad.style.display = pagina < total ? 'inline-block' : 'none';
  }
}

function updateTrustBanner() {
  const c = calcularConfianzaMercado();
  const t = $('#trustLevel');
  if (!t) return;
  t.textContent = c.label;
  t.className = c.nivel;
}

function exportarDashboardCSV() {
  const state = getState();
  const materiales = Array.isArray(state.materiales) ? state.materiales : [];
  const currentUser = state.currentUser;

  if (!currentUser) {
    import('@/ui/components/toast.js').then(m => m.showToast('Inicia sesión para exportar datos', 'warning'));
    import('@/modals/auth.modal.js').then(m => m.openAuthModal());
    return;
  }

  const filtrados = filtrar();
  const promedios = agrupar(filtrados);

  if (!promedios.length) {
    import('@/ui/components/toast.js').then(m => m.showToast('No hay datos para exportar', 'warning'));
    return;
  }

  const filas = promedios.map(e => {
    const m = materiales.find(x => x.id === e.material_id) || {};
    return {
      material: m.material || '',
      presentacion: m.presentacion || '',
      origen: m.origen || '',
      color: m.color || '',
      estado: e.estado,
      operacion: e.tipo_operacion,
      precio_promedio: +(e.sumaPV / e.sumaV).toFixed(2),
      precio_min: +Math.min(...e.precios).toFixed(2),
      precio_max: +Math.max(...e.precios).toFixed(2),
      reportes: e.count,
      verificados: e.todosVerificados ? 'Si' : 'No',
    };
  });

  const columnas = [
    { key: 'material', label: 'Material' },
    { key: 'presentacion', label: 'Presentación' },
    { key: 'origen', label: 'Origen' },
    { key: 'color', label: 'Color' },
    { key: 'estado', label: 'Estado' },
    { key: 'operacion', label: 'Operación' },
    { key: 'precio_promedio', label: 'Precio Promedio (MXN/kg)' },
    { key: 'precio_min', label: 'Precio Min (MXN/kg)' },
    { key: 'precio_max', label: 'Precio Max (MXN/kg)' },
    { key: 'reportes', label: 'Reportes' },
    { key: 'verificados', label: 'Todos Verificados' },
  ];

  const csv = generarCSV(filas, columnas);
  descargarArchivo(csv, nombreArchivoCSV('preciomolido_dashboard'));
  import('@/ui/components/toast.js').then(m => m.showToast('CSV descargado', 'success'));
}
