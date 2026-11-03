import { $, $$ } from '@/utils/dom.js';
import { api } from '@/api/client.js';
import { ENDPOINTS } from '@/api/endpoints.js';
import { getAdsConfig, setAdConfig } from '@/services/ads.service.js';
import { fetchSugerencias, aprobarSugerencia, rechazarSugerencia } from '@/services/sugerencias.service.js';
import { fetchMateriales } from '@/services/reportes.service.js';
import { showToast } from '@/ui/components/toast.js';
import { confirmModal } from '@/ui/components/confirm.js';

export function openAdmin() {
  const root = $('#modalRoot');
  const wrap = document.createElement('div');
  wrap.className = 'modal';
  wrap.id = 'adminModal';
  wrap.innerHTML = `
    <div class="modal-content modal-wide">
      <button class="modal-close">×</button>
      <h2>🔧 Administración</h2>
      <div id="adminLogin">
        <p class="modal-subtitle">Contraseña de administración</p>
        <form id="formAdminLogin" class="admin-form">
          <div class="form-group">
            <label>Contraseña</label>
            <input type="password" id="adminPassword" required>
          </div>
          <button type="submit" class="btn btn-primary btn-full">Acceder</button>
        </form>
      </div>
      <div id="adminPanel" style="display:none;">
        <div class="admin-tabs">
          <button class="admin-tab active" data-tab="hero">Hero</button>
          <button class="admin-tab" data-tab="inline">Inline</button>
          <button class="admin-tab" data-tab="report">Report</button>
          <button class="admin-tab" data-tab="sidebar">Sidebar</button>
          <button class="admin-tab" data-tab="footer">Footer</button>
          <button class="admin-tab" data-tab="materiales">🧪 Materiales</button>
          <button class="admin-tab" data-tab="reportes">📊 Reportes</button>
          <button class="admin-tab" data-tab="marketplace">🛒 Market</button>
          <button class="admin-tab" data-tab="usuarios">👥 Usuarios</button>
        </div>
        <form id="formAdminAds" class="admin-form">
          <input type="hidden" id="adminCurrentTab" value="hero">
          <div class="form-group">
            <label>Secciones (separadas por coma)</label>
            <input type="text" id="adminSecciones">
          </div>
          <div class="form-group">
            <label>URL de la imagen</label>
            <input type="text" id="adminImg">
          </div>
          <div class="form-group">
            <label>Enlace</label>
            <input type="text" id="adminLink">
          </div>
          <div class="form-group">
            <label>Texto alternativo</label>
            <input type="text" id="adminAlt">
          </div>
          <button type="submit" class="btn btn-primary btn-full">💾 Guardar</button>
        </form>
        <div id="adminMateriales" style="display:none;"></div>
        <div id="adminReportes"    style="display:none;"></div>
        <div id="adminMarketplace" style="display:none;"></div>
        <div id="adminUsuarios"    style="display:none;"></div>
      </div>
    </div>
  `;
  root.appendChild(wrap);
  wrap.addEventListener('click', e => { if (e.target === wrap) wrap.remove(); });
  wrap.querySelector('.modal-close').onclick = () => wrap.remove();
  $('#formAdminLogin').addEventListener('submit', onLogin);
  $('#formAdminAds').addEventListener('submit', onSaveAd);
  $$('.admin-tab').forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab)));
}

function switchTab(tipo) {
  $$('.admin-tab').forEach(x => x.classList.toggle('active', x.dataset.tab === tipo));
  ['adminMateriales','adminReportes','adminMarketplace','adminUsuarios','formAdminAds']
    .forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });

  if (tipo === 'materiales') { $('#adminMateriales').style.display = 'block'; renderMateriales(); }
  else if (tipo === 'reportes') { $('#adminReportes').style.display = 'block'; cargarAdminReportes(); }
  else if (tipo === 'marketplace') { $('#adminMarketplace').style.display = 'block'; cargarAdminMarketplace(); }
  else if (tipo === 'usuarios') { $('#adminUsuarios').style.display = 'block'; cargarAdminUsuarios(); }
  else {
    $('#formAdminAds').style.display = 'flex';
    const c = getAdsConfig()[tipo] || {};
    $('#adminCurrentTab').value = tipo;
    $('#adminSecciones').value = (c.secciones || []).join(', ');
    $('#adminImg').value  = c.img  || '';
    $('#adminLink').value = c.link || '';
    $('#adminAlt').value  = c.alt  || '';
  }
}

async function onLogin(e) {
  e.preventDefault();
  const pw = $('#adminPassword').value;
  localStorage.setItem('adminKey', pw);
  try {
    await api.get(ENDPOINTS.adminUsuarios);
    $('#adminLogin').style.display = 'none';
    $('#adminPanel').style.display = 'block';
    switchTab('hero');
  } catch {
    showToast('Contraseña incorrecta', 'error');
    localStorage.removeItem('adminKey');
  }
}

function onSaveAd(e) {
  e.preventDefault();
  const tipo = $('#adminCurrentTab').value;
  setAdConfig(tipo, {
    secciones: $('#adminSecciones').value.split(',').map(s => s.trim()).filter(Boolean),
    img: $('#adminImg').value.trim(),
    link: $('#adminLink').value.trim(),
    alt: $('#adminAlt').value.trim(),
  });
  showToast('Anuncio guardado.', 'success');
}

async function renderMateriales() {
  await fetchSugerencias();
  const { sugerenciasMateriales } = (await import('@/state/store.js')).getState();
  const pendientes = sugerenciasMateriales.filter(s => s.estado === 'pendiente');
  $('#adminMateriales').innerHTML = `<h3 style="margin-bottom:12px;">Sugerencias pendientes</h3>` +
    (pendientes.length ? pendientes.map(s => `
      <div class="admin-sugerencia-item">
        <div class="admin-sugerencia-info">
          <strong>${s.material}</strong> - ${s.presentacion || 'N/E'} - ${s.origen || 'N/E'} - ${s.color}<br>
          <small>Por ${s.usuario}</small>
        </div>
        <div class="admin-sugerencia-acciones">
          <button class="btn btn-sm btn-primary" data-aprobar="${s.id}">✅</button>
          <button class="btn btn-sm btn-ghost" data-rechazar="${s.id}">❌</button>
        </div>
      </div>`).join('') : '<p>Sin pendientes.</p>');

  $$('[data-aprobar]').forEach(b => b.addEventListener('click', async () => {
    await aprobarSugerencia(b.dataset.aprobar);
    await fetchMateriales();
    renderMateriales();
    showToast('Aprobado.', 'success');
  }));
  $$('[data-rechazar]').forEach(b => b.addEventListener('click', async () => {
    await rechazarSugerencia(b.dataset.rechazar);
    renderMateriales();
  }));
}

async function cargarAdminReportes() {
  const data = await api.get(ENDPOINTS.adminReportes);
  $('#adminReportes').innerHTML = data.map(r => `
    <div class="admin-sugerencia-item">
      <div>${r.material || 'N/A'} - $${r.precio_kg} (${r.fecha})</div>
      <button class="btn btn-sm btn-ghost" data-del-rep="${r.id}">🗑</button>
    </div>`).join('') || '<p>Sin reportes.</p>';
  $$('[data-del-rep]').forEach(b => b.addEventListener('click', async () => {
    if (await confirmModal('¿Eliminar?')) {
      await api.delete(ENDPOINTS.adminReporte(b.dataset.delRep));
      cargarAdminReportes();
    }
  }));
}

async function cargarAdminMarketplace() {
  const data = await api.get(ENDPOINTS.adminMarketplace);
  $('#adminMarketplace').innerHTML = data.map(p => `
    <div class="admin-sugerencia-item">
      <div>${p.material || 'N/A'} - ${p.tipo} (${p.usuario_nombre})</div>
      <button class="btn btn-sm btn-ghost" data-del-mk="${p.id}">🗑</button>
    </div>`).join('') || '<p>Sin publicaciones.</p>';
  $$('[data-del-mk]').forEach(b => b.addEventListener('click', async () => {
    if (await confirmModal('¿Eliminar?')) {
      await api.delete(ENDPOINTS.adminPublicacion(b.dataset.delMk));
      cargarAdminMarketplace();
    }
  }));
}

async function cargarAdminUsuarios() {
  const data = await api.get(ENDPOINTS.adminUsuarios);
  $('#adminUsuarios').innerHTML = data.map(u =>
    `<div class="admin-sugerencia-item"><div>${u.nombre} (${u.email}) - ${u.tipo || 'N/A'}</div></div>`
  ).join('') || '<p>Sin usuarios.</p>';
}