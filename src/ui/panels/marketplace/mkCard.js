import { escapeHTML } from '@/utils/dom.js';
import { formatMoney, formatDate } from '@/utils/format.js';
import { getState } from '@/state/store.js';
import { obtenerConfianzaVendedor } from '@/services/antiFraude.service.js';
import { promedioCalificacion } from '@/services/calificaciones.service.js';

export function createMkCard(pub, { onContactar, onCalificar, onOferta } = {}) {
  const { materiales, calificaciones, reportesVendedor, currentUser, ofertas } = getState();
  const mat = materiales.find(m => m.id === pub.material_id);
  const avg = promedioCalificacion(pub.usuario_email, calificaciones);
  const nReports = reportesVendedor.filter(r => r.reportedEmail === pub.usuario_email).length;
  const conf = obtenerConfianzaVendedor(pub.usuario_email);

  const card = document.createElement('div');
  card.className = `mk-card ${pub.tipo === 'Compra' ? 'compra' : ''} ${pub.es_atipico ? 'atipico' : ''}`;

  const fotoHTML = pub.foto ? `<img src="${pub.foto}" class="mk-foto" alt="Material" data-action="foto">` : '';
  const ratingHTML = avg > 0
    ? `<div class="rating-summary"><span class="stars">${'★'.repeat(Math.round(avg))}${'☆'.repeat(5-Math.round(avg))}</span><span class="small">${avg.toFixed(1)}</span></div>`
    : '';
  const reportWarn = nReports >= 2 ? '<span class="report-warning">⚠️ Usuario con reportes</span>' : '';
  const confianza = `<span class="trust-score ${conf.nivel}">🛡️ ${conf.label}</span>`;

  let precioHTML = '<div class="mk-card-precio">Precio no especificado</div>';
  if (pub.precio_kg > 0) {
    precioHTML = pub.tipo === 'Compra'
      ? `<div class="mk-card-precio pago"><div class="small" style="color:var(--success);font-weight:600;">💰 Precio que pago:</div>${formatMoney(pub.precio_kg)} MXN/kg</div>`
      : `<div class="mk-card-precio">${formatMoney(pub.precio_kg)} MXN/kg</div>`;
  }

  const isOwner = currentUser?.email === pub.usuario_email;
  const yaEnvio = ofertas.some(o => o.publicacion_id == pub.id && o.vendedor_email === currentUser?.email);
  const ofertaBtn = pub.tipo === 'Compra' && !isOwner
    ? (yaEnvio ? '<span class="small" style="color:var(--success);">✓ Oferta enviada</span>'
                : `<button class="btn-oferta" data-action="oferta">💡 Hacer oferta</button>`)
    : '';

  card.innerHTML = `
    ${fotoHTML}
    <div class="mk-card-header">
      <span class="mk-card-tipo ${pub.tipo === 'Compra' ? 'badge-compra' : 'badge-venta'}">${pub.tipo}</span>
      <span class="small">${formatDate(pub.fecha)}</span>
    </div>
    <div class="mk-card-material">${escapeHTML(mat?.material || 'Material')}</div>
    <div class="mk-card-detalle">
      ${escapeHTML(mat?.presentacion || '')} · ${escapeHTML(mat?.color || '')}<br>
      📍 ${escapeHTML(pub.estado)}, ${escapeHTML(pub.municipio || '')}<br>
      📦 ${pub.volumen_ton || 0} ton · 🔒 Garantía: ${pub.garantia}<br>
      ${pub.descripcion ? '📝 ' + escapeHTML(pub.descripcion) : ''}
    </div>
    ${precioHTML}
    ${ratingHTML}
    ${confianza}
    ${reportWarn}
    <div class="mk-card-footer">
      <span>${escapeHTML(pub.usuario_nombre)}</span>
      <div style="display:flex;gap:6px;flex-wrap:wrap;">
        <button class="btn-contactar" data-action="contactar">📩 Contactar</button>
        ${!isOwner ? `<button class="btn-contactar" data-action="calificar">⭐</button>` : ''}
        ${ofertaBtn}
      </div>
    </div>
  `;

  card.addEventListener('click', (e) => {
    const a = e.target.closest('[data-action]')?.dataset.action;
    if (a === 'contactar') onContactar?.(pub);
    if (a === 'calificar') onCalificar?.(pub.usuario_email);
    if (a === 'oferta')    onOferta?.(pub.id, pub.usuario_email);
    if (a === 'foto')      import('@/modals/foto.modal.js').then(m => m.openFotoModal(pub.foto, mat ? mat.material : 'Foto del material'));
  });
  return card;
}