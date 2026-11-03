import { $, $$, on } from '@/utils/dom.js';
import { getState } from '@/state/store.js';
import { logout } from '@/services/auth.service.js';
import { openAuthModal } from '@/modals/auth.modal.js';
import { renderDashboard } from '@/ui/panels/dashboard/panel.js';

export function initHeader() {
  const header = $('#header');
  header.innerHTML = `
    <div class="container header-inner">
      <a href="#dashboard" class="logo" data-nav="dashboard">
        <span class="logo-icon">♻️</span>
        <div class="logo-text">
          <span>Precio<span class="logo-bold">Molido</span></span>
          <span class="logo-tld">.mx</span>
        </div>
      </a>

      <nav class="nav" id="mainNav">
        <a class="nav-link active" data-nav="dashboard"><span>📊</span> Precios</a>
        <a class="nav-link" data-nav="reportar"><span>📝</span> Reportar</a>
        <a class="nav-link" data-nav="marketplace"><span>🤝</span> Market</a>
        <a class="nav-link" data-nav="alertas"><span>🔔</span> Alertas <span id="alertasBadge" class="badge-notif" style="display:none;">0</span></a>
        <a class="nav-link" data-nav="ranking"><span>🏆</span> Top</a><button class="nav-link theme-toggle-mobile" id="themeToggleMobile" style="display:none;"><span class="nav-icon theme-icon-mobile">🌙</span> <span class="theme-text-mobile">Modo Oscuro</span></button>
      </nav>

      <div class="header-right">
        <button id="themeToggle" class="btn-icon" title="Cambiar tema">
          <span class="theme-icon">🌙</span>
        </button>

        <div id="userArea">
          <button id="btnLogin" class="btn btn-sm btn-primary">
            <span>👤</span> <span class="login-text">Ingresar</span>
          </button>
          <div id="userMenu" style="display:none; position:relative;">
            <button id="userDropdown" class="user-dropdown-btn">
              <span class="user-avatar">👤</span>
              <span id="userNameDisplay" class="user-name-display"></span>
              <span class="dropdown-arrow">▾</span>
            </button>
            <div id="userDropdownMenu" class="user-dropdown-menu" style="display:none;">
              <button class="dropdown-item" data-action="cuenta">📋 Mi Cuenta</button>
              <button class="dropdown-item" data-action="marketplace">📦 Mis Publicaciones</button>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item logout-item" data-action="logout">🚪 Cerrar Sesión</button>
            </div>
          </div>
        </div>

        <button class="hamburger" id="hamburgerBtn" aria-label="Menú">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
    <div class="nav-overlay" id="navOverlay"></div>
  `;

  $('#btnLogin').addEventListener('click', openAuthModal);
  $('#themeToggle').addEventListener('click', toggleTheme);
  const mobileThemeBtn = $('#themeToggleMobile');
  if (mobileThemeBtn) mobileThemeBtn.addEventListener('click', toggleTheme);
  $('#userDropdown').addEventListener('click', (e) => {
    e.stopPropagation();
    const m = $('#userDropdownMenu');
    m.style.display = m.style.display === 'none' ? 'block' : 'none';
  });
  document.addEventListener('click', (e) => {
    const menu = $('#userDropdownMenu');
    if (menu && !e.target.closest('#userMenu')) menu.style.display = 'none';
  });
  $$('#userDropdownMenu .dropdown-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const a = btn.dataset.action;
      $('#userDropdownMenu').style.display = 'none';
      if (a === 'logout') { logout(); updateUserUI(); document.dispatchEvent(new CustomEvent('nav', { detail: 'dashboard' })); }
      else if (a === 'cuenta') document.dispatchEvent(new CustomEvent('nav', { detail: 'micuenta' }));
      else if (a === 'marketplace') document.dispatchEvent(new CustomEvent('nav', { detail: 'marketplace' }));
    });
  });

  // Init theme icon
  
  // Inicializar iconos
  const t = document.documentElement.getAttribute('data-theme');
  document.querySelector('.theme-icon').textContent = t === 'dark' ? '☀️' : '🌙';
  const mIcon = document.querySelector('.theme-icon-mobile');
  const mText = document.querySelector('.theme-text-mobile');
  if (mIcon) mIcon.textContent = t === 'dark' ? '☀️' : '🌙';
  if (mText) mText.textContent = t === 'dark' ? 'Modo Claro' : 'Modo Oscuro';


  updateUserUI();
}

export function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('precioMolido_theme', next);
  
  // Actualizar icono en escritorio
  const icon = document.querySelector('.theme-icon');
  if (icon) icon.textContent = next === 'dark' ? '☀️' : '🌙';
  
  // Actualizar icono y texto en móvil
  const mobileIcon = document.querySelector('.theme-icon-mobile');
  const mobileText = document.querySelector('.theme-text-mobile');
  if (mobileIcon) mobileIcon.textContent = next === 'dark' ? '☀️' : '🌙';
  if (mobileText) mobileText.textContent = next === 'dark' ? 'Modo Claro' : 'Modo Oscuro';
}

export function updateUserUI() {
  const { currentUser } = getState();
  const btn = $('#btnLogin');
  const menu = $('#userMenu');
  const name = $('#userNameDisplay');
  if (!btn || !menu) return;
  if (currentUser) {
    btn.style.display = 'none';
    menu.style.display = 'block';
    name.textContent = currentUser.nombre;
  } else {
    btn.style.display = 'inline-flex';
    menu.style.display = 'none';
  }
}