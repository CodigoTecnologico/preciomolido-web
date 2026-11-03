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
  card.innerHTML = `
    <div class="price-card-header">
      <div>
        <div class="price-card-material">${escapeHTML(material.material)}</div>
        <div class="meta">${escapeHTML(material.presentacion || '')} · ${escapeHTML(material.color || '')} · ${escapeHTML(material.origen || '')}</div>
      </div>
      <span class="price-card-badge ${entry.tipo_operacion === 'Compra' ? 'badge-compra' : 'badge-venta'}">${entry.tipo_operacion}</span>
    </div>
    <div>
      <div class="price-card-precio">${formatMoney(prom)} <span class="price-card-unidad">MXN/kg</span></div>
      <div class="price-card-rango">Rango: ${formatMoney(min)} - ${formatMoney(max)}</div>
      <span class="price-card-tendencia ${tCls}">${tTxt}</span>
    </div>
    <div class="price-card-footer">
      <span>📍 ${escapeHTML(entry.estado)}</span>
      <span>📊 ${entry.count} reportes</span>
    </div>
    <div class="price-card-calidad ${entry.todosVerificados ? 'calidad-verificada' : 'calidad-atipica'}">
      ${entry.todosVerificados ? '✅ Datos verificados' : '⚠️ Contiene datos atípicos'}
    </div>
    <button class="price-card-historial" data-action="historico">📈 Ver histórico →</button>
  `;
  return card;
}
