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
  root.innerHTML = `
    <div class="panel-header"><h2>👤 Mi Cuenta</h2></div>
    <div class="cuenta-container">
      <div class="cuenta-section">
        <h3>📋 Perfil</h3>
        <div class="cuenta-grid">
          <div class="cuenta-dato"><strong>Nombre:</strong> ${escapeHTML(currentUser.nombre)}</div>
          <div class="cuenta-dato"><strong>Email:</strong> ${escapeHTML(currentUser.email)}</div>
          <div class="cuenta-dato"><strong>Tipo:</strong> ${escapeHTML(currentUser.tipo || 'N/A')}</div>
          <div class="cuenta-dato"><strong>Estado:</strong> ${escapeHTML(currentUser.estado || 'N/A')}</div>
        </div>
        <p><span class="trust-score ${conf.nivel}">🛡️ ${conf.label}</span></p>
        ${avg > 0 ? '<p>⭐ ' + avg.toFixed(1) + ' (' + misCals.length + ')</p>' : '<p>Sin calificaciones.</p>'}
        ${nRep > 0 ? '<p class="report-warning">⚠️ ' + nRep + ' reporte(s).</p>' : ''}
      </div>
      <div class="cuenta-section">
        <h3>📊 Mis Reportes (${misReportes.length})</h3>
        <ul class="cuenta-reportes">
          ${misReportes.length === 0 ? '<li>Sin reportes.</li>' : misReportes.slice(-10).reverse().map(r => {
            const m = materiales.find(x => x.id === r.material_id);
            return '<li>📌 ' + (m ? m.material : 'Material') + ' - ' + r.tipo_operacion + ': ' + formatMoney(r.precio_kg) + ' (' + r.estado + ')</li>';
          }).join('')}
        </ul>
      </div>
      <div class="cuenta-section">
        <h3>🤝 Mis Publicaciones (${misPubs.length})</h3>
        <ul class="cuenta-publicaciones">
          ${misPubs.length === 0 ? '<li>Sin publicaciones.</li>' : misPubs.map(p => {
            const m = materiales.find(x => x.id === p.material_id);
            return '<li><span>📢 ' + p.tipo + ': ' + (m ? m.material : 'Material') + ' en ' + p.estado + '</span>' +
              '<div style="display:flex;gap:6px;">' +
              '<button class="btn-accion editar" data-edit="' + p.id + '">✏️</button>' +
              '<button class="btn-accion eliminar" data-del="' + p.id + '">🗑</button></div></li>';
          }).join('')}
        </ul>
      </div>
      <div class="cuenta-section">
        <h3>📥 Ofertas recibidas (${rec.length})</h3>
        ${rec.length === 0 ? '<p style="font-size:.85rem;">Sin ofertas.</p>' : rec.map(o => {
          const cls = o.estado === 'pendiente' ? 'estado-pendiente' : (o.estado === 'aceptada' ? 'estado-aceptada' : 'estado-rechazada');
          const acc = o.estado === 'pendiente' ? '<button class="btn-aceptar" data-acept="' + o.id + '">✅</button><button class="btn-rechazar" data-rech="' + o.id + '">❌</button>' : '';
          return '<div style="padding:10px;border:1px solid var(--gray-200);border-radius:8px;margin-bottom:8px;">' +
            '<strong>' + escapeHTML(o.vendedor_nombre || 'Alguien') + '</strong> ofrece ' + formatMoney(o.precio) + '/kg<br>' +
            '<span class="' + cls + '">' + o.estado + '</span> ' + acc + '</div>';
        }).join('')}
      </div>
      <div class="cuenta-section">
        <h3>📤 Ofertas enviadas (${env.length})</h3>
        ${env.length === 0 ? '<p style="font-size:.85rem;">Sin ofertas.</p>' : env.map(o => {
          const cls = o.estado === 'pendiente' ? 'estado-pendiente' : (o.estado === 'aceptada' ? 'estado-aceptada' : 'estado-rechazada');
          return '<div style="padding:10px;border:1px solid var(--gray-200);border-radius:8px;margin-bottom:8px;">' +
            'Ofreciste ' + formatMoney(o.precio) + '/kg<br><span class="' + cls + '">' + o.estado + '</span></div>';
        }).join('')}
      </div>
      <div class="cuenta-section">
        <h3>⭐ Calificaciones recibidas (${misCals.length})</h3>
        <ul class="cuenta-calificaciones">
          ${misCals.length === 0 ? '<li>Sin calificaciones.</li>' : misCals.slice(-5).reverse().map(c =>
            '<li>' + '★'.repeat(c.rating) + ' de ' + escapeHTML(c.from_name || 'Anónimo') + '</li>'
          ).join('')}
        </ul>
      </div>
      <div class="cuenta-section">
        <h3>🔔 Mis Alertas (${alertas.length})</h3>
        <ul class="cuenta-publicaciones">
          ${alertas.length === 0 ? '<li>Sin alertas.</li>' : alertas.map(a => {
            const m = materiales.find(x => x.id === a.material_id);
            return '<li>⏰ ' + (m ? m.material : 'Material') + ' en ' + a.estado + ' cuando ' + a.condicion + ' de ' + formatMoney(a.precio_objetivo) + '</li>';
          }).join('')}
        </ul>
      </div>
    </div>
  `;
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
