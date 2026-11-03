import { openModal } from '@/ui/components/modal.js';
import { getState } from '@/state/store.js';
import { escapeHTML } from '@/utils/dom.js';
import { formatMoney, formatDate } from '@/utils/format.js';
import { obtenerConfianzaVendedor } from '@/services/antiFraude.service.js';
import { promedioCalificacion } from '@/services/calificaciones.service.js';
import { openCalificarModal } from './calificar.modal.js';
import { openReportarModal } from './reportar.modal.js';

export function openContactoModal(pub) {
  const { materiales, calificaciones, currentUser } = getState();
  const mat = materiales.find(m => m.id === pub.material_id);
  const avg = promedioCalificacion(pub.usuario_email, calificaciones);
  const conf = obtenerConfianzaVendedor(pub.usuario_email);
  const isOwner = currentUser && currentUser.email === pub.usuario_email;

  const materialNombre = mat ? mat.material + ' ' + (mat.color || '') : 'Material';
  const precio = pub.precio_kg > 0 ? formatMoney(pub.precio_kg) + '/kg' : 'No especificado';

  const whatsappTexto = encodeURIComponent(
    'Hola, vi tu publicación en PrecioMolido.mx sobre ' + materialNombre + ' en ' + pub.estado
  );
  const whatsappUrl = 'https://wa.me/5210000000000?text=' + whatsappTexto;

  const node = openModal(
    '<div class="contacto-modal">' +
      '<div class="contacto-header">' +
        '<div class="contacto-icon">📬</div>' +
        '<h2>Contactar al publicante</h2>' +
      '</div>' +

      '<div class="contacto-publicacion">' +
        '<div class="contacto-tipo ' + (pub.tipo === 'Compra' ? 'badge-compra' : 'badge-venta') + '">' + pub.tipo + '</div>' +
        '<div class="contacto-material">' + escapeHTML(materialNombre) + '</div>' +
        '<div class="contacto-precio">' + precio + '</div>' +
      '</div>' +

      '<div class="contacto-info">' +
        '<div class="contacto-row">' +
          '<span class="contacto-label">Publicado por</span>' +
          '<span class="contacto-value">' + escapeHTML(pub.usuario_nombre) + '</span>' +
        '</div>' +
        '<div class="contacto-row">' +
          '<span class="contacto-label">📍 Ubicación</span>' +
          '<span class="contacto-value">' + escapeHTML(pub.estado) + ', ' + escapeHTML(pub.municipio || 'N/E') + '</span>' +
        '</div>' +
        '<div class="contacto-row">' +
          '<span class="contacto-label">📅 Publicado</span>' +
          '<span class="contacto-value">' + formatDate(pub.fecha) + '</span>' +
        '</div>' +
        '<div class="contacto-row">' +
          '<span class="contacto-label">📦 Volumen</span>' +
          '<span class="contacto-value">' + (pub.volumen_ton || 0) + ' toneladas</span>' +
        '</div>' +
        '<div class="contacto-row">' +
          '<span class="contacto-label">🔒 Garantía</span>' +
          '<span class="contacto-value">' + escapeHTML(pub.garantia || 'No') + '</span>' +
        '</div>' +
        '<div class="contacto-row">' +
          '<span class="contacto-label">⭐ Reputación</span>' +
          '<span class="contacto-value">' +
            (avg > 0 ? '★'.repeat(Math.round(avg)) + ' ' + avg.toFixed(1) : 'Sin calificaciones') +
          '</span>' +
        '</div>' +
        '<div class="contacto-row">' +
          '<span class="contacto-label">🛡️ Confianza</span>' +
          '<span class="contacto-value"><span class="trust-score ' + conf.nivel + '">' + conf.label + '</span></span>' +
        '</div>' +
      '</div>' +

      (pub.descripcion
        ? '<div class="contacto-descripcion"><strong>Descripción:</strong><br>' + escapeHTML(pub.descripcion) + '</div>'
        : '') +

      '<a href="' + whatsappUrl + '" target="_blank" rel="noopener" class="btn-whatsapp">' +
        '<span class="btn-whatsapp-icon">💬</span>' +
        '<span>Contactar por WhatsApp</span>' +
      '</a>' +

      (isOwner ? '' :
        '<div class="contacto-acciones">' +
          '<button class="btn btn-ghost" id="btnCal">⭐ Calificar vendedor</button>' +
          '<button class="btn btn-ghost btn-danger-ghost" id="btnRep">🚩 Reportar</button>' +
        '</div>'
      ) +
    '</div>'
  );

  const bc = node.querySelector('#btnCal');
  const br = node.querySelector('#btnRep');
  if (bc) bc.addEventListener('click', () => openCalificarModal(pub.usuario_email));
  if (br) br.addEventListener('click', () => openReportarModal(pub.usuario_email));
}
