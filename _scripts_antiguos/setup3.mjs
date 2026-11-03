import fs from 'node:fs';
import path from 'node:path';

const BASE = process.cwd();

function write(rel, content) {
  const full = path.join(BASE, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.trimStart(), 'utf8');
  console.log('  ✓', rel);
}

console.log('\n📝 Creando paneles...\n');

// ==================== DASHBOARD ====================
write('src/ui/panels/dashboard/priceCard.js', `
import { escapeHTML } from '@/utils/dom.js';
import { formatMoney } from '@/utils/format.js';
import { calcularTendencia } from '@/services/antiFraude.service.js';

const LABEL = {
  up:     ['📈 Al alza',  'tendencia-up'],
  down:   ['📉 A la baja','tendencia-down'],
  stable: ['➡ Estable',   'tendencia-stable'],
};

export function createPriceCard(entry, material) {
  const prom = entry.sumaPV / entry.sumaV;
  const min  = Math.min(...entry.precios);
  const max  = Math.max(...entry.precios);
  const t    = calcularTendencia(entry.material_id, entry.estado, entry.tipo_operacion);
  const [tTxt, tCls] = LABEL[t] || LABEL.stable;
  const card = document.createElement('div');
  card.className = 'price-card ' + (entry.todosVerificados ? '' : 'atipico');
  card.dataset.material = material.material;
  card.dataset.estado   = entry.estado;
  card.innerHTML = \`
    <div class="price-card-header">
      <div>
        <div class="price-card-material">\${escapeHTML(material.material)}</div>
        <div class="meta">\${escapeHTML(material.presentacion || '')} · \${escapeHTML(material.color || '')} · \${escapeHTML(material.origen || '')}</div>
      </div>
      <span class="price-card-badge \${entry.tipo_operacion === 'Compra' ? 'badge-compra' : 'badge-venta'}">\${entry.tipo_operacion}</span>
    </div>
    <div>
      <div class="price-card-precio">\${formatMoney(prom)} <span class="price-card-unidad">MXN/kg</span></div>
      <div class="price-card-rango">Rango: \${formatMoney(min)} - \${formatMoney(max)}</div>
      <span class="price-card-tendencia \${tCls}">\${tTxt}</span>
    </div>
    <div class="price-card-footer">
      <span>📍 \${escapeHTML(entry.estado)}</span>
      <span>📊 \${entry.count} reportes</span>
    </div>
    <div class="price-card-calidad \${entry.todosVerificados ? 'calidad-verificada' : 'calidad-atipica'}">
      \${entry.todosVerificados ? '✅ Datos verificados' : '⚠️ Contiene datos atípicos'}
    </div>
    <button class="price-card-historial" data-action="historico">📈 Ver histórico →</button>
  \`;
  return card;
}
`);

write('src/ui/panels/dashboard/priceTable.js', `
import { $, escapeHTML } from '@/utils/dom.js';
import { formatMoney } from '@/utils/format.js';

export function renderPriceTable(paginaDatos, materiales) {
  const tbody = $('#priceTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  const frag = document.createDocumentFragment();
  for (const e of paginaDatos) {
    const m = materiales.find(x => x.id === e.material_id);
    if (!m) continue;
    const prom = e.sumaPV / e.sumaV;
    const min  = Math.min(...e.precios);
    const max  = Math.max(...e.precios);
    const tr = document.createElement('tr');
    tr.innerHTML = \`
      <td><strong>\${escapeHTML(m.material)}</strong></td>
      <td>\${escapeHTML(m.presentacion || '')}</td>
      <td>\${escapeHTML(m.origen || '')}</td>
      <td>\${escapeHTML(m.color || '')}</td>
      <td>\${escapeHTML(e.estado)}</td>
      <td><span class="price-card-badge \${e.tipo_operacion === 'Compra' ? 'badge-compra' : 'badge-venta'}">\${e.tipo_operacion}</span></td>
      <td><strong>\${formatMoney(prom)}</strong></td>
      <td>\${formatMoney(min)} - \${formatMoney(max)}</td>
      <td>\${e.count}</td>
      <td>\${e.todosVerificados ? '✅' : '⚠️'}</td>
      <td><button class="btn-ver" data-material="\${escapeHTML(m.material)}" data-estado="\${escapeHTML(e.estado)}">📈</button></td>
    \`;
    frag.appendChild(tr);
  }
  tbody.appendChild(frag);
}
`);

write('src/ui/panels/dashboard/historicoModal.js', `
import { Chart, registerables } from 'chart.js';
import { getState } from '@/state/store.js';
import { openModal } from '@/ui/components/modal.js';
import { formatMonth } from '@/utils/format.js';

Chart.register(...registerables);

export function abrirHistorico(materialNombre, estado) {
  const { reportes, materiales } = getState();
  const ids = materiales.filter(m => m.material === materialNombre).map(m => m.id);
  const hist = reportes.filter(r => ids.includes(r.material_id) && r.estado === estado);
  const node = openModal(\`
    <h2>Histórico: \${materialNombre} en \${estado}</h2>
    <div class="chart-container"><canvas id="chartHistorico"></canvas></div>
    <p class="transparency-note">Datos reales basados en reportes históricos.</p>
  \`, { wide: true });
  if (!hist.length) {
    node.querySelector('.chart-container').innerHTML =
      '<p style="text-align:center;padding:40px;color:var(--gray-400);">Sin datos históricos.</p>';
    return;
  }
  const g = {};
  hist.forEach(r => {
    const mes = r.fecha.substring(0, 7);
    g[mes] = g[mes] || { spv: 0, sv: 0 };
    const v = r.volumen_ton || 1;
    g[mes].spv += r.precio_kg * v;
    g[mes].sv  += v;
  });
  const meses = Object.keys(g).sort();
  const labels = meses.map(formatMonth);
  const data   = meses.map(m => g[m].spv / g[m].sv);
  new Chart(node.querySelector('#chartHistorico'), {
    type: 'line',
    data: { labels, datasets: [{
      data, borderColor: '#1a56db', backgroundColor: 'rgba(26,86,219,0.1)',
      fill: true, tension: 0.4, pointRadius: 5,
    }]},
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: false, title: { display: true, text: 'MXN/kg' } } },
    },
  });
}
`);

write('src/ui/panels/dashboard/panel.js', `
import { $, $$ } from '@/utils/dom.js';
import { debounce } from '@/utils/debounce.js';
import { getState, setState } from '@/state/store.js';
import { ITEMS_POR_PAGINA, ESTADOS_MEXICO } from '@/utils/constants.js';
import { createPriceCard } from './priceCard.js';
import { renderPriceTable } from './priceTable.js';
import { calcularConfianzaMercado } from '@/services/antiFraude.service.js';

let pagina = 1;

export function renderDashboard() {
  const { materiales } = getState();
  const root = $('#panel-dashboard');
  const materialesUnicos = [...new Set(materiales.map(m => m.material))];
  root.innerHTML = \`
    <div class="panel-header">
      <h1>Precio del Plástico Molido en México</h1>
      <p class="subtitle">Promedio ponderado de los últimos 30 días, basado en reportes de acopiadores verificados.</p>
    </div>
    <div class="market-trust-banner" id="trustBanner">
      <div class="trust-content">
        <span class="trust-icon">🛡️</span>
        <div>
          <strong>Confianza del Mercado:</strong> <span id="trustLevel">—</span>
          <p style="font-size:.8rem;margin-top:4px;">Basado en la calidad de reportes.</p>
        </div>
      </div>
    </div>
    <div class="view-toggle">
      <button class="btn btn-sm btn-primary" id="viewCards">🗂 Tarjetas</button>
      <button class="btn btn-sm btn-ghost" id="viewTable">📋 Tabla</button>
    </div>
    <div class="filters-bar">
      <div class="filter-group"><label>Material</label>
        <select id="filterMaterial"><option value="todos">Todos</option>
          \${materialesUnicos.map(m => '<option value="' + m + '">' + m + '</option>').join('')}
        </select>
      </div>
      <div class="filter-group"><label>Estado</label>
        <select id="filterEstado"><option value="todos">Todos</option>
          \${ESTADOS_MEXICO.map(e => '<option>' + e + '</option>').join('')}
        </select>
      </div>
      <div class="filter-group"><label>Operación</label>
        <select id="filterOperacion">
          <option value="todos">Compra y Venta</option>
          <option value="Compra">Solo Compra</option>
          <option value="Venta">Solo Venta</option>
        </select>
      </div>
      <div class="filter-group"><label>Calidad</label>
        <select id="filterCalidad">
          <option value="todos">Todos</option>
          <option value="verificados">Solo verificados</option>
        </select>
      </div>
    </div>
    <div class="filters-bar" style="margin-top:0;border-top:none;">
      <div class="filter-group"><label>🔍 Buscar</label>
        <input type="text" id="searchDashboard" placeholder="Buscar...">
      </div>
      <div class="filter-group"><label>📋 Ordenar</label>
        <select id="sortDashboard">
          <option value="">Por defecto</option>
          <option value="precio-asc">Menor a mayor</option>
          <option value="precio-desc">Mayor a menor</option>
        </select>
      </div>
    </div>
    <div id="priceCards" class="price-cards-grid"></div>
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
      <button id="btnLoadMoreDashboard" class="btn btn-primary" style="display:none;">Cargar más</button>
    </div>
    <p class="transparency-note" id="transparencyNote"></p>
  \`;
  $('#searchDashboard').addEventListener('input', debounce(() => { pagina = 1; update(); }, 300));
  $('#sortDashboard').addEventListener('change', () => { pagina = 1; update(); });
  ['filterMaterial','filterEstado','filterOperacion','filterCalidad'].forEach(id =>
    $('#' + id).addEventListener('change', () => { pagina = 1; update(); }));
  $('#viewCards').addEventListener('click', () => switchView('cards'));
  $('#viewTable').addEventListener('click', () => switchView('table'));
  $('#btnLoadMoreDashboard').addEventListener('click', () => { pagina++; update(false); });
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
  const { reportes, materiales } = getState();
  const fm = $('#filterMaterial').value;
  const fe = $('#filterEstado').value;
  const fo = $('#filterOperacion').value;
  const fc = $('#filterCalidad').value;
  const q  = $('#searchDashboard').value.toLowerCase();
  const lim = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
  let out = reportes.filter(r => r.fecha >= lim);
  if (fm !== 'todos') {
    const ids = materiales.filter(m => m.material === fm).map(m => m.id);
    out = out.filter(r => ids.includes(r.material_id));
  }
  if (fe !== 'todos') out = out.filter(r => r.estado === fe);
  if (fo !== 'todos') out = out.filter(r => r.tipo_operacion === fo);
  if (fc === 'verificados') out = out.filter(r => r.verificado === true);
  if (q) out = out.filter(r => {
    const m = materiales.find(x => x.id === r.material_id);
    return m && (m.material.toLowerCase().includes(q) || (m.color||'').toLowerCase().includes(q) || r.estado.toLowerCase().includes(q));
  });
  return out;
}

function agrupar(lista) {
  const g = {};
  for (const r of lista) {
    const k = r.material_id + '|' + r.estado + '|' + r.tipo_operacion;
    if (!g[k]) g[k] = { material_id: r.material_id, estado: r.estado, tipo_operacion: r.tipo_operacion,
      sumaPV: 0, sumaV: 0, precios: [], count: 0, todosVerificados: true };
    const v = r.volumen_ton || 1;
    g[k].sumaPV += r.precio_kg * v;
    g[k].sumaV  += v;
    g[k].precios.push(r.precio_kg);
    g[k].count++;
    if (!r.verificado) g[k].todosVerificados = false;
  }
  return Object.values(g);
}

function update(reset) {
  if (reset === undefined) reset = true;
  if (reset) pagina = 1;
  const { materiales } = getState();
  const f = filtrar();
  let promedios = agrupar(f);
  const sort = $('#sortDashboard').value;
  if (sort === 'precio-asc')  promedios.sort((a,b) => a.sumaPV/a.sumaV - b.sumaPV/b.sumaV);
  if (sort === 'precio-desc') promedios.sort((a,b) => b.sumaPV/b.sumaV - a.sumaPV/a.sumaV);
  const inicio = (pagina - 1) * ITEMS_POR_PAGINA;
  const paginaDatos = promedios.slice(inicio, inicio + ITEMS_POR_PAGINA);
  const cont = $('#priceCards');
  cont.innerHTML = '';
  if (!paginaDatos.length) {
    cont.innerHTML = '<p style="text-align:center;color:var(--gray-400);padding:40px;">No hay datos.</p>';
  } else {
    const frag = document.createDocumentFragment();
    for (const e of paginaDatos) {
      const m = materiales.find(x => x.id === e.material_id);
      if (m) frag.appendChild(createPriceCard(e, m));
    }
    cont.appendChild(frag);
  }
  renderPriceTable(paginaDatos, materiales);
  $('#transparencyNote').textContent =
    'Mostrando ' + paginaDatos.length + ' de ' + promedios.length + ' promedios. Basado en ' + f.length + ' reportes.';
  const total = Math.ceil(promedios.length / ITEMS_POR_PAGINA);
  $('#btnLoadMoreDashboard').style.display = pagina < total ? 'inline-block' : 'none';
}

function updateTrustBanner() {
  const c = calcularConfianzaMercado();
  const t = $('#trustLevel');
  if (!t) return;
  t.textContent = c.label;
  t.className = c.nivel;
}
`);

// ==================== REPORTAR ====================
write('src/ui/panels/reportar/panel.js', `
import { $ } from '@/utils/dom.js';
import { getState } from '@/state/store.js';
import { ESTADOS_MEXICO, PRESENTACIONES, ORIGENES } from '@/utils/constants.js';
import { crearReporte, fetchReportes } from '@/services/reportes.service.js';
import { analizarPrecio } from '@/services/antiFraude.service.js';
import { showToast } from '@/ui/components/toast.js';
import { confirmModal } from '@/ui/components/confirm.js';
import { openAuthModal } from '@/modals/auth.modal.js';
import { openSugerirMaterialModal } from '@/modals/sugerirMaterial.modal.js';

export function renderReportar() {
  const { currentUser, materiales } = getState();
  const root = $('#panel-reportar');
  const accessHTML = currentUser
    ? '<p style="color:var(--success);padding:8px;">✅ Accedido como <strong>' + currentUser.nombre + '</strong></p>'
    : '<p>🔒 Para reportar precios necesitas acceder.</p><button class="btn btn-primary" id="reportLogin" style="margin-top:16px;">Acceder</button>';
  root.innerHTML = \`
    <div class="panel-header">
      <h2>Reportar Precio</h2>
      <p class="subtitle">Comparte tu dato y desbloquea el promedio de tu zona.</p>
    </div>
    <div class="access-message">\${accessHTML}</div>
    <form id="formReporte" class="report-form" style="display:\${currentUser ? 'flex' : 'none'};">
      <div class="form-group">
        <label>Material <span class="required">*</span></label>
        <select id="material" required><option value="">Selecciona</option>
          \${materiales.map(m => '<option value="' + m.id + '">' + m.material + ' - ' + m.color + ' (' + m.presentacion + ')</option>').join('')}
        </select>
        <button type="button" class="btn btn-xs btn-ghost" id="btnSugerirMaterial" style="margin-top:4px;">+ Sugerir nuevo material</button>
      </div>
      <div class="form-group"><label>Presentación *</label>
        <select id="presentacion" required><option value="">Selecciona</option>
          \${PRESENTACIONES.map(p => '<option>' + p + '</option>').join('')}
        </select>
      </div>
      <div class="form-group"><label>Origen *</label>
        <select id="origen" required><option value="">Selecciona</option>
          \${ORIGENES.map(o => '<option>' + o + '</option>').join('')}
        </select>
      </div>
      <div class="form-group"><label>Color</label><input type="text" id="color" placeholder="Ej: Blanco Natural"></div>
      <div class="form-group">
        <label>Precio por Kilo (MXN) *</label>
        <input type="number" id="precioKg" step="0.01" min="0" required>
        <div class="precio-warning" id="precioWarning" style="display:none;"></div>
      </div>
      <div class="form-group"><label>Tipo *</label>
        <select id="tipoOperacion" required><option value="">Selecciona</option>
          <option value="Compra">Precio al que COMPRO</option>
          <option value="Venta">Precio al que VENDO</option>
        </select>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Estado *</label>
          <select id="estado" required><option value="">Selecciona</option>
            \${ESTADOS_MEXICO.map(e => '<option>' + e + '</option>').join('')}
          </select>
        </div>
        <div class="form-group"><label>Municipio</label><input type="text" id="municipio"></div>
      </div>
      <div class="form-group"><label>Volumen (Toneladas)</label><input type="number" id="volumenTon" step="0.1" min="0"></div>
      <div class="form-group"><label>Contaminación</label>
        <select id="contaminacion"><option value="">Selecciona</option>
          <option value="0%">0%</option><option value="<1%">&lt;1%</option>
          <option value="1-3%">1-3%</option><option value=">3%">&gt;3%</option>
        </select>
      </div>
      <button type="submit" class="btn btn-primary btn-full">📊 Reportar Precio</button>
    </form>
    <div id="reportResult" style="display:none;"></div>
  \`;
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
  if (!currentUser) return showToast('Debes iniciar sesión.', 'error');
  const materialId = parseInt($('#material').value, 10);
  const precio = parseFloat($('#precioKg').value);
  const estado = $('#estado').value;
  const analisis = analizarPrecio(precio, materialId, estado);
  let verificado = !analisis.esAtipico;
  if (analisis.nivel === 'critico') {
    const ok = await confirmModal(analisis.mensaje + '\\n\\n¿Reportar de todos modos?');
    if (!ok) return;
    verificado = false;
  }
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
    showToast('✅ Reporte registrado!', 'success');
    const mat = materiales.find(m => m.id === materialId);
    $('#formReporte').style.display = 'none';
    const res = $('#reportResult');
    res.style.display = 'block';
    res.style.cssText = 'max-width:560px;margin:0 auto;background:var(--success-light);border:1px solid var(--success);padding:20px;border-radius:12px;text-align:center;';
    res.innerHTML = '<h3 style="color:var(--success);">✅ Reporte Registrado</h3>' +
      '<p>' + payload.tipo_operacion + ' de <strong>' + (mat ? mat.material : '') + '</strong> en ' + estado + ': <strong>$' + precio.toFixed(2) + '/kg</strong>.</p>' +
      (!verificado ? '<p style="color:var(--danger);">⚠️ Marcado como atípico.</p>' : '') +
      '<button class="btn btn-primary" style="margin-top:16px;" onclick="location.reload()">Reportar otro</button>';
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  }
}
`);

// ==================== RANKING ====================
write('src/ui/panels/ranking/panel.js', `
import { getState } from '@/state/store.js';
import { $ } from '@/utils/dom.js';

export function renderRanking() {
  const { reportes } = getState();
  const lim = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
  const c = {};
  reportes.filter(r => r.fecha >= lim && r.verificado === true)
    .forEach(r => { const a = (r.usuario || 'A')[0].toUpperCase() + '****'; c[a] = (c[a] || 0) + 1; });
  const top = Object.entries(c).sort((a,b) => b[1]-a[1]).slice(0,5);
  const insig = ['🥇','🥈','🥉','⭐','⭐'];
  const cls = ['gold','silver','bronze','',''];
  $('#panel-ranking').innerHTML = \`
    <div class="panel-header">
      <h2>🏆 Top Acopiadores</h2>
      <p class="subtitle">Usuarios que más contribuyen con reportes verificados.</p>
    </div>
    <div class="ranking-list">
      \${top.length === 0
        ? '<p style="text-align:center;color:var(--gray-400);padding:40px;">Sin reportes verificados este mes.</p>'
        : top.map(([n, cnt], i) => \`
          <div class="ranking-item">
            <div class="ranking-pos \${cls[i]}">\${insig[i]}</div>
            <div class="ranking-info">
              <div class="ranking-nombre">\${n}</div>
              <div class="ranking-estado">Acopiador verificado</div>
            </div>
            <div class="ranking-reportes">\${cnt} reportes</div>
          </div>\`).join('')}
    </div>
    <p class="transparency-note">Basado en reportes de los últimos 30 días.</p>
  \`;
}
`);

// ==================== ALERTAS ====================
write('src/ui/panels/alertas/panel.js', `
import { $, $$ } from '@/utils/dom.js';
import { getState } from '@/state/store.js';
import { ESTADOS_MEXICO } from '@/utils/constants.js';
import { crearAlerta, eliminarAlerta, fetchAlertas } from '@/services/alertas.service.js';
import { openAuthModal } from '@/modals/auth.modal.js';
import { showToast } from '@/ui/components/toast.js';
import { confirmModal } from '@/ui/components/confirm.js';

export function renderAlertas() {
  const { currentUser, materiales } = getState();
  const root = $('#panel-alertas');
  if (!currentUser) {
    root.innerHTML = \`
      <div class="panel-header"><h2>🔔 Alertas de Precio</h2></div>
      <div class="access-message">
        <p>🔒 Inicia sesión para crear alertas.</p>
        <button class="btn btn-primary" id="alertLogin" style="margin-top:16px;">Acceder</button>
      </div>\`;
    $('#alertLogin').addEventListener('click', openAuthModal);
    return;
  }
  root.innerHTML = \`
    <div class="panel-header">
      <h2>🔔 Alertas de Precio</h2>
      <p class="subtitle">Notificaciones cuando un material suba o baje.</p>
    </div>
    <form id="formAlerta" class="report-form">
      <div class="form-group"><label>Material</label>
        <select id="alertaMaterial" required><option value="">Selecciona</option>
          \${materiales.map(m => '<option value="' + m.id + '">' + m.material + ' - ' + m.color + '</option>').join('')}
        </select>
      </div>
      <div class="form-group"><label>Estado</label>
        <select id="alertaEstado" required><option value="">Selecciona</option>
          \${ESTADOS_MEXICO.map(e => '<option>' + e + '</option>').join('')}
        </select>
      </div>
      <div class="form-group"><label>Precio objetivo (MXN/kg)</label>
        <input type="number" id="alertaPrecio" step="0.01" min="0" required></div>
      <div class="form-group"><label>Condición</label>
        <select id="alertaCondicion" required>
          <option value="debajo">Cuando baje de este precio</option>
          <option value="arriba">Cuando suba de este precio</option>
        </select>
      </div>
      <button type="submit" class="btn btn-primary btn-full">🔔 Crear Alerta</button>
    </form>
    <div class="alertas-list" id="alertasList"></div>
  \`;
  $('#formAlerta').addEventListener('submit', async (e) => {
    e.preventDefault();
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
    } catch (err) { showToast('Error: ' + err.message, 'error'); }
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
      '<button class="alerta-delete" data-id="' + a.id + '">🗑</button>' +
    '</div>';
  }).join('');
  $$('.alerta-delete').forEach(b => b.addEventListener('click', async () => {
    if (!(await confirmModal('¿Eliminar alerta?'))) return;
    await eliminarAlerta(b.dataset.id);
    await fetchAlertas();
    renderList();
  }));
}
`);

// ==================== MI CUENTA ====================
write('src/ui/panels/micuenta/panel.js', `
import { getState } from '@/state/store.js';
import { $ } from '@/utils/dom.js';
import { escapeHTML } from '@/utils/dom.js';
import { formatMoney } from '@/utils/format.js';
import { obtenerConfianzaVendedor } from '@/services/antiFraude.service.js';
import { promedioCalificacion } from '@/services/calificaciones.service.js';
import { editarPublicacion, borrarPublicacion } from '@/ui/panels/marketplace/panel.js';
import { aceptarOferta, rechazarOferta, fetchOfertas } from '@/services/ofertas.service.js';
import { showToast } from '@/ui/components/toast.js';

export function renderCuenta() {
  const { currentUser, reportes, publicacionesMK, alertas, calificaciones, reportesVendedor, ofertas, materiales } = getState();
  const root = $('#panel-micuenta');
  if (!currentUser) {
    root.innerHTML = '<p style="text-align:center;color:var(--gray-400);padding:40px;">Inicia sesión.</p>';
    return;
  }
  const misReportes = reportes.filter(r => r.usuario === currentUser.email || r.usuario === currentUser.nombre);
  const misPubs = publicacionesMK.filter(p => p.usuario_email === currentUser.email);
  const misCals = calificaciones.filter(c => c.to_email === currentUser.email);
  const avg = promedioCalificacion(currentUser.email, calificaciones);
  const conf = obtenerConfianzaVendedor(currentUser.email);
  const nRep = reportesVendedor.filter(r => r.reportedEmail === currentUser.email).length;
  const rec = ofertas.filter(o => o.comprador_email === currentUser.email);
  const env = ofertas.filter(o => o.vendedor_email === currentUser.email);
  root.innerHTML = \`
    <div class="panel-header"><h2>👤 Mi Cuenta</h2></div>
    <div class="cuenta-container">
      <div class="cuenta-section">
        <h3>📋 Perfil</h3>
        <div class="cuenta-grid">
          <div class="cuenta-dato"><strong>Nombre:</strong> \${escapeHTML(currentUser.nombre)}</div>
          <div class="cuenta-dato"><strong>Email:</strong> \${escapeHTML(currentUser.email)}</div>
          <div class="cuenta-dato"><strong>Tipo:</strong> \${escapeHTML(currentUser.tipo || 'N/A')}</div>
          <div class="cuenta-dato"><strong>Estado:</strong> \${escapeHTML(currentUser.estado || 'N/A')}</div>
        </div>
        <p><span class="trust-score \${conf.nivel}">🛡️ \${conf.label}</span></p>
        \${avg > 0 ? '<p>⭐ ' + avg.toFixed(1) + ' (' + misCals.length + ')</p>' : '<p>Sin calificaciones.</p>'}
        \${nRep > 0 ? '<p class="report-warning">⚠️ ' + nRep + ' reporte(s).</p>' : ''}
      </div>
      <div class="cuenta-section">
        <h3>📊 Mis Reportes (\${misReportes.length})</h3>
        <ul class="cuenta-reportes">
          \${misReportes.length === 0 ? '<li>Sin reportes.</li>' : misReportes.slice(-10).reverse().map(r => {
            const m = materiales.find(x => x.id === r.material_id);
            return '<li>📌 ' + (m ? m.material : 'Material') + ' - ' + r.tipo_operacion + ': ' + formatMoney(r.precio_kg) + ' (' + r.estado + ')</li>';
          }).join('')}
        </ul>
      </div>
      <div class="cuenta-section">
        <h3>🤝 Mis Publicaciones (\${misPubs.length})</h3>
        <ul class="cuenta-publicaciones">
          \${misPubs.length === 0 ? '<li>Sin publicaciones.</li>' : misPubs.map(p => {
            const m = materiales.find(x => x.id === p.material_id);
            return '<li><span>📢 ' + p.tipo + ': ' + (m ? m.material : 'Material') + ' en ' + p.estado + '</span>' +
              '<div style="display:flex;gap:6px;">' +
              '<button class="btn-accion editar" data-edit="' + p.id + '">✏️</button>' +
              '<button class="btn-accion eliminar" data-del="' + p.id + '">🗑</button></div></li>';
          }).join('')}
        </ul>
      </div>
      <div class="cuenta-section">
        <h3>📥 Ofertas recibidas (\${rec.length})</h3>
        \${rec.length === 0 ? '<p style="font-size:.85rem;">Sin ofertas.</p>' : rec.map(o => {
          const cls = o.estado === 'pendiente' ? 'estado-pendiente' : (o.estado === 'aceptada' ? 'estado-aceptada' : 'estado-rechazada');
          const acc = o.estado === 'pendiente' ? '<button class="btn-aceptar" data-acept="' + o.id + '">✅</button><button class="btn-rechazar" data-rech="' + o.id + '">❌</button>' : '';
          return '<div style="padding:10px;border:1px solid var(--gray-200);border-radius:8px;margin-bottom:8px;">' +
            '<strong>' + escapeHTML(o.vendedor_nombre || 'Alguien') + '</strong> ofrece ' + formatMoney(o.precio) + '/kg<br>' +
            '<span class="' + cls + '">' + o.estado + '</span> ' + acc + '</div>';
        }).join('')}
      </div>
      <div class="cuenta-section">
        <h3>📤 Ofertas enviadas (\${env.length})</h3>
        \${env.length === 0 ? '<p style="font-size:.85rem;">Sin ofertas.</p>' : env.map(o => {
          const cls = o.estado === 'pendiente' ? 'estado-pendiente' : (o.estado === 'aceptada' ? 'estado-aceptada' : 'estado-rechazada');
          return '<div style="padding:10px;border:1px solid var(--gray-200);border-radius:8px;margin-bottom:8px;">' +
            'Ofreciste ' + formatMoney(o.precio) + '/kg<br><span class="' + cls + '">' + o.estado + '</span></div>';
        }).join('')}
      </div>
      <div class="cuenta-section">
        <h3>⭐ Calificaciones recibidas (\${misCals.length})</h3>
        <ul class="cuenta-calificaciones">
          \${misCals.length === 0 ? '<li>Sin calificaciones.</li>' : misCals.slice(-5).reverse().map(c =>
            '<li>' + '★'.repeat(c.rating) + ' de ' + escapeHTML(c.from_name || 'Anónimo') + '</li>'
          ).join('')}
        </ul>
      </div>
      <div class="cuenta-section">
        <h3>🔔 Mis Alertas (\${alertas.length})</h3>
        <ul class="cuenta-publicaciones">
          \${alertas.length === 0 ? '<li>Sin alertas.</li>' : alertas.map(a => {
            const m = materiales.find(x => x.id === a.material_id);
            return '<li>⏰ ' + (m ? m.material : 'Material') + ' en ' + a.estado + ' cuando ' + a.condicion + ' de ' + formatMoney(a.precio_objetivo) + '</li>';
          }).join('')}
        </ul>
      </div>
    </div>
  \`;
  root.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => {
    import('@/ui/layouts/nav.js').then(({ goToPanel }) => {
      goToPanel('marketplace');
      setTimeout(() => editarPublicacion(b.dataset.edit), 100);
    });
  }));
  root.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => borrarPublicacion(b.dataset.del)));
  root.querySelectorAll('[data-acept]').forEach(b => b.addEventListener('click', async () => {
    await aceptarOferta(b.dataset.acept); await fetchOfertas(); renderCuenta(); showToast('Oferta aceptada.', 'success');
  }));
  root.querySelectorAll('[data-rech]').forEach(b => b.addEventListener('click', async () => {
    await rechazarOferta(b.dataset.rech); await fetchOfertas(); renderCuenta(); showToast('Oferta rechazada.', 'info');
  }));
}
`);

console.log('\n✅ Listo. Ahora ejecuta: npm run dev\n');