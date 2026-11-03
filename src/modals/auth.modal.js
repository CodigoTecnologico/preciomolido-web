import { openModal } from '@/ui/components/modal.js';
import { $ } from '@/utils/dom.js';
import { login, registro } from '@/services/auth.service.js';
import { ESTADOS_MEXICO } from '@/utils/constants.js';
import { updateUserUI } from '@/ui/layouts/header.js';
import { showToast } from '@/ui/components/toast.js';
import { showButtonLoading } from '@/ui/components/spinner.js';
import { fetchAlertas } from '@/services/alertas.service.js';
import { fetchOfertas } from '@/services/ofertas.service.js';

export function openAuthModal() {
  const node = openModal(
    '<div style="display:flex;margin-bottom:20px;border-bottom:2px solid var(--gray-200);">' +
      '<button class="auth-tab active" data-tab="login" style="flex:1;padding:10px;background:none;border:none;font-weight:600;cursor:pointer;border-bottom:2px solid var(--primary);">Iniciar Sesion</button>' +
      '<button class="auth-tab" data-tab="registro" style="flex:1;padding:10px;background:none;border:none;font-weight:600;cursor:pointer;color:var(--gray-500);">Registrarse</button>' +
    '</div>' +
    '<form id="formLogin" class="report-form" style="box-shadow:none;padding:0;">' +
      '<div class="form-group"><label>Email</label><input type="email" id="loginEmail" required></div>' +
      '<div class="form-group"><label>Contrasena</label><input type="password" id="loginPassword" required></div>' +
      '<button type="submit" class="btn btn-primary btn-full" data-loading-text="Entrando...">Entrar</button>' +
    '</form>' +
    '<form id="formRegistro" class="report-form" style="display:none;box-shadow:none;padding:0;">' +
      '<div class="form-group"><label>Nombre</label><input type="text" id="regNombre" required></div>' +
      '<div class="form-group"><label>Email</label><input type="email" id="regEmail" required></div>' +
      '<div class="form-group"><label>Contrasena</label><input type="password" id="regPassword" minlength="6" required></div>' +
      '<div class="form-group"><label>Tipo</label><select id="regTipo" required><option value="">Selecciona</option><option>Acopiador</option><option>Transformador / Reciclador</option><option>Distribuidor de Virgen Off-Spec</option></select></div>' +
      '<div class="form-group"><label>Estado</label><select id="regEstado" required><option value="">Selecciona</option>' +
        ESTADOS_MEXICO.map(e => '<option>' + e + '</option>').join('') +
      '</select></div>' +
      '<button type="submit" class="btn btn-primary btn-full" data-loading-text="Creando cuenta...">Crear cuenta</button>' +
    '</form>'
  );

  const tabs = node.querySelectorAll('.auth-tab');
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => { x.classList.remove('active'); x.style.borderBottom='none'; x.style.color='var(--gray-500)'; });
    t.classList.add('active'); t.style.borderBottom='2px solid var(--primary)'; t.style.color='';
    node.querySelector('#formLogin').style.display    = t.dataset.tab === 'login'    ? 'flex' : 'none';
    node.querySelector('#formRegistro').style.display = t.dataset.tab === 'registro' ? 'flex' : 'none';
  }));

  node.querySelector('#formLogin').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const restore = showButtonLoading(btn, 'Entrando...');
    try {
      await login($('#loginEmail').value, $('#loginPassword').value);
      node.remove(); updateUserUI();
      await fetchAlertas().catch(()=>{}); await fetchOfertas().catch(()=>{});
      showToast('Bienvenido.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
      restore();
    }
  });

  node.querySelector('#formRegistro').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const restore = showButtonLoading(btn, 'Creando cuenta...');
    try {
      await registro($('#regNombre').value, $('#regEmail').value, $('#regPassword').value, $('#regTipo').value, $('#regEstado').value);
      node.remove(); updateUserUI();
      await fetchAlertas().catch(()=>{}); await fetchOfertas().catch(()=>{});
      showToast('Cuenta creada.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
      restore();
    }
  });
}
