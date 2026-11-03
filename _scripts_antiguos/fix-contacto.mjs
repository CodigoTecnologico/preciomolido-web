import fs from 'node:fs';
import path from 'node:path';
const BASE = process.cwd();
function write(rel, content) {
  const full = path.join(BASE, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.trimStart(), 'utf8');
  console.log('  ✓', rel);
}

console.log('\n🎨 Arreglando modal de contacto + otros modales...\n');

// ============================================================
// 1. contacto.modal.js — versión mejorada
// ============================================================
write('src/modals/contacto.modal.js', `
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
`);

// ============================================================
// 2. Nuevo CSS para contacto + WhatsApp inline
// ============================================================
write('src/styles/components/_contacto.scss', `
/* ==================== MODAL DE CONTACTO ==================== */

.contacto-modal {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.contacto-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--gray-100);
}
.contacto-icon {
  font-size: 1.8rem;
  line-height: 1;
}
.contacto-header h2 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--gray-900);
}

/* Bloque de la publicación */
.contacto-publicacion {
  background: linear-gradient(135deg, var(--primary-light), var(--gray-50));
  border-radius: var(--radius-lg);
  padding: 16px;
  text-align: center;
  border: 1px solid var(--primary-light);
}
.contacto-tipo {
  display: inline-block;
  font-size: .7rem;
  padding: 3px 10px;
  border-radius: 20px;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 8px;
}
.contacto-material {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 4px;
}
.contacto-precio {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--primary);
}

/* Tabla de info */
.contacto-info {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid var(--gray-100);
  border-radius: var(--radius);
  overflow: hidden;
}
.contacto-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  font-size: .85rem;
  border-bottom: 1px solid var(--gray-100);
  background: var(--white);
}
.contacto-row:last-child {
  border-bottom: none;
}
.contacto-label {
  color: var(--gray-500);
  font-weight: 500;
}
.contacto-value {
  color: var(--gray-800);
  font-weight: 600;
  text-align: right;
  max-width: 60%;
  word-break: break-word;
}

/* Descripción */
.contacto-descripcion {
  background: var(--gray-50);
  border-radius: var(--radius);
  padding: 12px 14px;
  font-size: .85rem;
  color: var(--gray-700);
  line-height: 1.5;
}

/* Botón WhatsApp INLINE (no flotante) */
.btn-whatsapp {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: #25d366;
  color: #fff !important;
  padding: 14px 20px;
  border-radius: var(--radius);
  font-weight: 700;
  font-size: 1rem;
  text-decoration: none;
  transition: all var(--transition);
  box-shadow: 0 2px 8px rgba(37, 211, 102, .3);
}
.btn-whatsapp:hover {
  background: #128c7e;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 211, 102, .4);
}
.btn-whatsapp:active {
  transform: translateY(0);
}
.btn-whatsapp-icon {
  font-size: 1.3rem;
  line-height: 1;
}

/* Acciones secundarias */
.contacto-acciones {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.contacto-acciones .btn {
  padding: 10px 12px;
  font-size: .85rem;
  border: 1px solid var(--gray-200);
}
.btn-danger-ghost {
  color: var(--danger);
}
.btn-danger-ghost:hover {
  background: var(--danger-light);
  border-color: var(--danger);
}

/* Responsive */
@media (max-width: 480px) {
  .contacto-acciones {
    grid-template-columns: 1fr;
  }
  .contacto-precio {
    font-size: 1.3rem;
  }
}
`);

// ============================================================
// 3. Actualizar main.scss
// ============================================================
const mainScssPath = path.join(BASE, 'src/styles/main.scss');
let mainScss = fs.readFileSync(mainScssPath, 'utf8');
if (!mainScss.includes("components/contacto")) {
  mainScss += "\n@use 'components/contacto';\n";
  fs.writeFileSync(mainScssPath, mainScss, 'utf8');
  console.log('  ✓ src/styles/main.scss actualizado');
} else {
  console.log('  • main.scss ya tenía el import');
}

console.log('\n✅ Modal de contacto pulido\n');
console.log('📋 Ejecuta: npm run dev\n');
console.log('Ahora el modal tendrá:');
console.log('   • Header con ícono 📬');
console.log('   • Bloque destacado de la publicación');
console.log('   • Tabla de información ordenada');
console.log('   • Botón WhatsApp verde INLINE (no flotante)');
console.log('   • Botones Calificar / Reportar side-by-side\n');