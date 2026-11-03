import fs from 'node:fs';
import path from 'node:path';
const BASE = process.cwd();

const headerCode = `@use '../abstracts' as *;

.header {
  background: var(--white);
  border-bottom: 1px solid var(--gray-200);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: $shadow-sm;
  width: 100%;
}

.header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  gap: 12px;
  position: relative;
  width: 100%;
  max-width: 100%;
}

/* ==================== LOGO ==================== */
.logo {
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  z-index: 101;
}
.logo-icon { font-size: 1.6rem; }
.logo-text { display: flex; flex-direction: column; line-height: 1.1; }
.logo-text span:first-child { font-size: 1.1rem; font-weight: 600; color: var(--gray-900); }
.logo-bold { font-weight: 800; color: var(--primary); }
.logo-tld { font-weight: 400; color: var(--gray-400); font-size: .65rem; text-align: right; }

/* ==================== NAV ==================== */
.nav {
  display: flex;
  gap: 2px;
  align-items: center;
}
.nav-link {
  padding: 6px 10px;
  border-radius: var(--radius);
  font-weight: 500;
  font-size: .85rem;
  color: var(--gray-600);
  transition: all var(--transition);
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: none;
}
.nav-link:hover { background: var(--gray-100); color: var(--gray-900); }
.nav-link.active { background: var(--primary-light); color: var(--primary); font-weight: 600; }

/* ==================== HEADER RIGHT & USUARIO ==================== */
.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 101;
  flex-shrink: 0;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  transition: background var(--transition);
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-icon:hover { background: var(--gray-100); }

#userArea { position: relative; }

.user-dropdown-btn {
  display: flex !important;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid var(--gray-200);
  background: var(--white);
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--gray-700);
  transition: all var(--transition);
  box-shadow: 0 1px 2px rgba(0,0,0,.02);
}
.user-dropdown-btn:hover {
  border-color: var(--primary);
  background: var(--gray-50);
}
.user-avatar { font-size: 1rem; }
.user-name-display {
  font-size: 0.85rem;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dropdown-arrow { font-size: 0.6rem; color: var(--gray-400); }

.user-dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  box-shadow: $shadow-lg;
  min-width: 200px;
  z-index: 150;
  animation: slideDown 0.2s ease;
  overflow: hidden;
}
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  color: var(--gray-700);
  font-size: 0.85rem;
  font-weight: 500;
  text-decoration: none;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease;
}
.dropdown-item:hover { background: var(--gray-50); }
.logout-item { color: var(--danger) !important; }
.dropdown-divider { height: 1px; background: var(--gray-200); margin: 4px 0; }

/* ==================== HAMBURGUESA & OVERLAY ==================== */
.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  padding: 10px;
  z-index: 10000;
  cursor: pointer;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
}
.hamburger span {
  display: block;
  width: 22px;
  height: 2px;
  background: var(--gray-800);
  transition: all 0.3s ease;
  border-radius: 2px;
}
.hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(4px, 4px); }
.hamburger.open span:nth-child(2) { opacity: 0; }
.hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(4px, -4px); }

.nav-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.6);
  z-index: 9998;
}
.nav-overlay.open { display: block; animation: fadeIn 0.2s; }

.badge-notif {
  background: var(--danger);
  color: #fff;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: .65rem;
  font-weight: 700;
  margin-left: 4px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ==================== RESPONSIVE (MÓVIL) ==================== */
@media (max-width: 900px) {
  .nav {
    position: fixed;
    top: 0;
    right: -100%;
    width: 280px;
    height: 100vh;
    height: 100dvh;
    background-color: var(--white) !important; /* Fondo adaptativo */
    flex-direction: column;
    padding: 80px 20px 20px;
    gap: 8px;
    z-index: 9999;
    transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: -5px 0 25px rgba(0,0,0,.2);
    overflow-y: auto;
    border-left: 1px solid var(--gray-100);
  }
  
  .nav.open { right: 0; }
  
  .nav-link {
    width: 100%;
    padding: 14px 16px;
    font-size: 1rem;
    border-radius: var(--radius);
    justify-content: flex-start;
    color: var(--gray-700);
  }
  
  .nav-link:hover {
    background: var(--gray-100);
    color: var(--gray-900);
  }
  
  .nav-link.active {
    background: var(--primary);
    color: #ffffff !important;
  }
  
  .nav-link .nav-icon {
    font-size: 1.2rem;
    margin-right: 8px;
  }
  
  .hamburger { display: flex; }
}

@media (max-width: 768px) {
  .login-text { display: none; }
  #btnLogin { padding: 8px 12px; }
  .user-name-display { max-width: 70px; }
  .user-dropdown-btn { padding: 4px 10px; }
  .header-inner { padding: 8px 12px; gap: 8px; }
  .logo-text span:first-child { font-size: 1rem; }
  .logo-icon { font-size: 1.4rem; }
}
`;

fs.writeFileSync(path.join(BASE, 'src/styles/layouts/_header.scss'), headerCode, 'utf8');
console.log('  OK src/styles/layouts/_header.scss reescrito y balanceado');

console.log('\n✅ Error de sintaxis arreglado\n');
console.log('📋 Ejecuta: npm run dev\n');