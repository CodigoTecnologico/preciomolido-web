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
    tr.innerHTML = `
      <td><strong>${escapeHTML(m.material)}</strong></td>
      <td>${escapeHTML(m.presentacion || '')}</td>
      <td>${escapeHTML(m.origen || '')}</td>
      <td>${escapeHTML(m.color || '')}</td>
      <td>${escapeHTML(e.estado)}</td>
      <td><span class="price-card-badge ${e.tipo_operacion === 'Compra' ? 'badge-compra' : 'badge-venta'}">${e.tipo_operacion}</span></td>
      <td><strong>${formatMoney(prom)}</strong></td>
      <td>${formatMoney(min)} - ${formatMoney(max)}</td>
      <td>${e.count}</td>
      <td>${e.todosVerificados ? '✅' : '⚠️'}</td>
      <td><button class="btn-ver" data-material="${escapeHTML(m.material)}" data-estado="${escapeHTML(e.estado)}">📈</button></td>
    `;
    frag.appendChild(tr);
  }
  tbody.appendChild(frag);
}
