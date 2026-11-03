import fs from 'node:fs';
import path from 'node:path';
const BASE = process.cwd();
function write(rel, content) {
  const full = path.join(BASE, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.trimStart(), 'utf8');
  console.log('  OK', rel);
}

console.log('\n📱 Aplicando mejoras para móvil...\n');

// ============================================================
// 1. CSS GLOBAL MÓVIL (Prevención de desbordes)
// ============================================================
write('src/styles/base/_mobile-fixes.scss', `
/* ==================== FIXES GLOBALES MÓVILES ==================== */

/* Evitar scroll horizontal accidental */
html, body {
  overflow-x: hidden;
  max-width: 100vw;
  width: 100%;
}

/* Mejorar áreas táctiles en móvil */
@media (max-width: 768px) {
  /* Botones más grandes para dedos */
  .btn {
    min-height: 44px;
    padding: 10px 16px;
  }
  
  /* Inputs más grandes (evita zoom automático en iOS al hacer focus) */
  input[type="text"],
  input[type="number"],
  input[type="email"],
  input[type="password"],
  select,
  textarea {
    font-size: 16px !important;
    min-height: 44px;
  }
  
  /* Paneles: padding uniforme */
  .panel {
    padding: 0;
  }
  .main-content {
    padding: 16px 12px;
    gap: 12px;
  }
  
  /* Headers más compactos */
  .panel-header h1, 
  .panel-header h2 {
    font-size: 1.3rem;
    line-height: 1.3;
  }
  .panel-header .subtitle {
    font-size: 0.85rem;
  }
  
  /* Ad containers se ajustan */
  .ad-container {
    margin-left: 0;
    margin-right: 0;
    border-radius: 0;
  }
  .ad-hero, .ad-footer {
    max-width: 100%;
  }
}
`);

// ============================================================
// 2. HEADER Y NAVEGACIÓN MÓVIL
// ============================================================
write('src/styles/layouts/_header.scss', `
.header {
  background: var(--white);
  border-bottom: 1px solid var(--gray-200);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 2px rgba(0,0,0,.05);
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

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 101;
  flex-shrink: 0;
}

/* ... (mantener dropdown, theme toggle, etc) ... */

.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  padding: 10px;
  z-index: 101;
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
  background: rgba(0,0,0,.5);
  z-index: 98;
  backdrop-filter: blur(2px);
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

@media (max-width: 900px) {
  .nav {
    position: fixed;
    top: 0;
    right: -100%;
    width: 280px;
    height: 100vh;
    height: 100dvh;
    background: var(--white);
    flex-direction: column;
    padding: 80px 20px 20px;
    gap: 8px;
    z-index: 99;
    transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: -5px 0 25px rgba(0,0,0,.1);
    overflow-y: auto;
  }
  .nav.open { right: 0; }
  
  .nav-link {
    width: 100%;
    padding: 14px 16px;
    font-size: 1rem;
    border-radius: var(--radius);
    justify-content: flex-start;
  }
  .nav-link .nav-icon {
    font-size: 1.2rem;
    margin-right: 8px;
  }
  
  .hamburger { display: flex; }
  .login-text { display: none; }
  #btnLogin { padding: 8px 12px; }
  
  .user-name-display { max-width: 60px; }
  
  /* Ajuste del header en móvil */
  .header-inner {
    padding: 8px 12px;
    gap: 8px;
  }
  .logo-text span:first-child { font-size: 1rem; }
  .logo-icon { font-size: 1.4rem; }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
`);

// ============================================================
// 3. FILTROS Y PANELES
// ============================================================
write('src/styles/layouts/_panels.scss', `
.main-content {
  padding: 24px 16px;
  flex: 1;
  display: flex;
  gap: 20px;
  width: 100%;
  max-width: 100%;
}
.main-content > section {
  flex: 1;
  min-width: 0;
  width: 100%;
}

.panel {
  display: none;
  width: 100%;
}
.panel.active {
  display: block;
  animation: fadeInUp 0.35s cubic-bezier(.4, 0, .2, 1);
  width: 100%;
}

.panel-header { margin-bottom: 20px; text-align: center; }
.access-message { text-align: center; padding: 30px; color: var(--gray-500); }
.transparency-note {
  text-align: center;
  color: var(--gray-400);
  font-size: .8rem;
  font-style: italic;
  margin: 12px 0;
  padding: 0 12px;
}

/* Filters Bar */
.filters-bar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: flex-end;
  background: var(--white);
  padding: 16px;
  border-radius: var(--radius-lg);
  box-shadow: 0 1px 2px rgba(0,0,0,.05);
  margin-bottom: 20px;
  width: 100%;
  box-sizing: border-box;
}
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 120px;
}
.filter-group label {
  font-size: .7rem;
  font-weight: 600;
  color: var(--gray-500);
  text-transform: uppercase;
  letter-spacing: .5px;
}
.filter-group select,
.filter-group input {
  padding: 10px;
  border: 1px solid var(--gray-300);
  border-radius: var(--radius);
  font-size: .9rem;
  background: var(--white);
  color: var(--gray-800);
  width: 100%;
  box-sizing: border-box;
}

.view-toggle {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.pagination-container {
  margin: 24px 0;
  display: flex;
  justify-content: center;
  gap: 10px;
}

/* Chips de filtros */
.active-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  padding: 0 4px;
}

@media (max-width: 900px) {
  .main-content { flex-direction: column; }
}

@media (max-width: 768px) {
  /* Filtros apilados en móvil */
  .filters-bar {
    flex-direction: column;
    padding: 12px;
    gap: 10px;
    margin-bottom: 12px;
  }
  .filter-group {
    min-width: 100%;
  }
  .filter-group select,
  .filter-group input {
    padding: 12px;
    font-size: 16px;
  }
  
  /* Ajuste de los chips */
  .active-filters {
    justify-content: flex-start;
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 8px;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .active-filters::-webkit-scrollbar { display: none; }
  .results-counter {
    margin-left: 0;
    width: 100%;
    margin-top: 4px;
  }
}
`);

// ============================================================
// 4. TARJETAS (Dashboard & Marketplace)
// ============================================================
write('src/styles/components/_card.scss', `
.price-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
  width: 100%;
}

.price-card {
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: 0 1px 2px rgba(0,0,0,.05);
  border: 1px solid var(--gray-100);
  transition: transform var(--transition), box-shadow var(--transition);
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;
  word-wrap: break-word;
  overflow-wrap: break-word;
}
.price-card:hover { transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(0,0,0,.1); }
.price-card.atipico { border-left: 4px solid var(--danger); }
.price-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; gap: 8px; }
.price-card-material { font-weight: 700; font-size: 1rem; color: var(--gray-900); }
.meta { font-size: .85rem; color: var(--gray-500); }
.price-card-precio { font-size: 1.8rem; font-weight: 800; color: var(--primary); line-height: 1; word-break: break-word; }
.price-card-unidad { font-size: .8rem; color: var(--gray-400); font-weight: 400; }
.price-card-rango { font-size: .8rem; color: var(--gray-500); margin-top: 4px; }
.price-card-footer {
  display: flex;
  justify-content: space-between;
  font-size: .75rem;
  color: var(--gray-400);
  border-top: 1px solid var(--gray-100);
  padding-top: 10px;
  margin-top: 10px;
  flex-wrap: wrap;
  gap: 4px;
}
.price-card-historial {
  font-size: .75rem;
  color: var(--primary);
  font-weight: 600;
  text-decoration: underline;
  background: none;
  border: none;
  padding: 8px 0;
  margin-top: 6px;
  cursor: pointer;
  width: 100%;
  text-align: left;
}
.price-card-calidad { display: flex; align-items: center; gap: 4px; font-size: .7rem; margin-top: 6px; }
.calidad-verificada { color: var(--success); }
.calidad-atipica { color: var(--danger); }

.price-card-badge {
  font-size: .65rem;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
}
.badge-compra { background: var(--success-light); color: var(--success); }
.badge-venta { background: var(--warning-light); color: var(--warning); }

.price-card-tendencia {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  font-size: .8rem;
  padding: 3px 6px;
  border-radius: 4px;
  margin-top: 6px;
}
.tendencia-up { color: var(--success); background: var(--success-light); }
.tendencia-down { color: var(--danger); background: var(--danger-light); }
.tendencia-stable { color: var(--gray-500); background: var(--gray-100); }

/* ==================== MÓVIL ==================== */
@media (max-width: 768px) {
  .price-cards-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .price-card {
    padding: 16px;
  }
  .price-card-precio {
    font-size: 1.6rem;
  }
  .price-card-material {
    font-size: .95rem;
  }
  .meta {
    font-size: .8rem;
  }
}
`);

// ============================================================
// 5. TABLA RESPONSIVE (Scroll interno, no de página)
// ============================================================
write('src/styles/components/_table.scss', `
.price-table-container {
  overflow-x: auto;
  margin-bottom: 20px;
  -webkit-overflow-scrolling: touch;
  width: 100%;
  max-width: 100vw;
  border-radius: var(--radius-lg);
  /* Scrollbar estilizada */
  scrollbar-width: thin;
}
.price-table-container::-webkit-scrollbar {
  height: 8px;
}
.price-table-container::-webkit-scrollbar-thumb {
  background: var(--gray-300);
  border-radius: 4px;
}
.price-table-container::-webkit-scrollbar-track {
  background: var(--gray-100);
}

.price-table {
  width: 100%;
  min-width: 700px; /* Fuerza el scroll interno */
  border-collapse: collapse;
  background: var(--white);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0,0,0,.05);
}
.price-table th {
  background: var(--gray-100);
  padding: 12px;
  text-align: left;
  font-weight: 600;
  font-size: .7rem;
  color: var(--gray-500);
  text-transform: uppercase;
  white-space: nowrap;
}
.price-table td {
  padding: 12px;
  border-bottom: 1px solid var(--gray-100);
  font-size: .85rem;
  color: var(--gray-700);
  white-space: nowrap;
}
.price-table tr:hover td { background: var(--gray-50); }
.price-table .btn-ver {
  color: var(--primary);
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 600;
  padding: 4px;
  font-size: 1.1rem;
}

/* Indicador visual de que se puede hacer scroll */
@media (max-width: 768px) {
  .price-table-container {
    position: relative;
  }
  .price-table-container::after {
    content: '→ Desliza para ver más';
    display: block;
    text-align: center;
    font-size: .7rem;
    color: var(--gray-400);
    padding: 8px;
    background: linear-gradient(to right, transparent, var(--gray-50) 50%, transparent);
  }
}
`);

// ============================================================
// 6. MARKETPLACE MÓVIL
// ============================================================
write('src/styles/pages/_marketplace.scss', `
.disclaimer-box {
  background: var(--warning-light);
  border: 1px solid var(--warning);
  border-radius: var(--radius);
  padding: 14px;
  margin-bottom: 20px;
  font-size: .85rem;
  color: var(--warning);
  word-wrap: break-word;
}
.disclaimer-box ul {
  margin-top: 6px;
  padding-left: 18px;
}

.marketplace-tabs {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.mk-tab {
  padding: 8px 18px;
  background: var(--gray-100);
  border: 2px solid transparent;
  border-radius: var(--radius);
  font-weight: 600;
  font-size: .9rem;
  color: var(--gray-600);
  cursor: pointer;
}
.mk-tab.active {
  background: var(--primary-light);
  color: var(--primary);
  border-color: var(--primary);
}

.marketplace-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 16px;
  width: 100%;
}
.mk-card {
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: 0 1px 2px rgba(0,0,0,.05);
  border: 1px solid var(--gray-100);
  transition: transform var(--transition);
  word-wrap: break-word;
  overflow-wrap: break-word;
  box-sizing: border-box;
  width: 100%;
}
.mk-card:hover { transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(0,0,0,.1); }
.mk-card.compra { border-left: 4px solid var(--success); }
.mk-card.atipico { border: 2px solid var(--danger); }

.mk-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 8px;
}
.mk-card-tipo {
  font-size: .65rem;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
}
.mk-card-material { font-weight: 700; font-size: 1rem; margin-bottom: 6px; color: var(--gray-900); }
.mk-card-detalle { font-size: .8rem; color: var(--gray-500); margin-bottom: 10px; line-height: 1.5; }
.mk-card-precio { font-size: 1.4rem; font-weight: 800; color: var(--primary); word-break: break-word; }
.mk-card-precio.pago { color: var(--success); }

.mk-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: .75rem;
  color: var(--gray-400);
  border-top: 1px solid var(--gray-100);
  padding-top: 10px;
  margin-top: 10px;
  flex-wrap: wrap;
  gap: 8px;
}

.mk-foto {
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: var(--radius);
  margin-bottom: 10px;
  cursor: pointer;
  border: 1px solid var(--gray-200);
}

/* Botones dentro de tarjeta */
.btn-contactar {
  background: var(--primary-light);
  color: var(--primary);
  border: none;
  padding: 8px 12px;
  border-radius: var(--radius);
  font-weight: 600;
  font-size: .8rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.btn-oferta {
  background: var(--success-light);
  color: var(--success);
  border: 1px solid var(--success);
  padding: 6px 10px;
  border-radius: var(--radius);
  font-weight: 600;
  font-size: .75rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .marketplace-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .mk-card {
    padding: 16px;
  }
  .mk-card-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .mk-card-footer > div {
    width: 100%;
  }
  .mk-card-footer button {
    flex: 1;
    justify-content: center;
  }
}
`);

// ============================================================
// 7. MODALES EN MÓVIL
// ============================================================
write('src/styles/components/_modal.scss', `
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 16px;
  animation: fadeIn 0.2s ease;
}
.modal-content {
  background: var(--white);
  padding: 28px;
  border-radius: var(--radius-lg);
  max-width: 460px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,.1);
  animation: modalPop 0.25s cubic-bezier(.34, 1.56, .64, 1);
  box-sizing: border-box;
}
.modal-content.modal-wide { max-width: 650px; }
.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 1.3rem;
  cursor: pointer;
  color: var(--gray-400);
  background: none;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition);
}
.modal-close:hover { background: var(--gray-100); color: var(--gray-900); }
.modal-content h2 { margin-bottom: 6px; font-size: 1.2rem; }
.modal-subtitle { color: var(--gray-500); margin-bottom: 20px; font-size: .85rem; }

@media (max-width: 768px) {
  .modal {
    padding: 0;
    align-items: flex-end; /* Aparece desde abajo como bottom sheet */
  }
  .modal-content {
    border-radius: 20px 20px 0 0;
    max-height: 90vh;
    padding: 24px 20px;
    animation: slideUp 0.3s cubic-bezier(.4, 0, .2, 1);
    width: 100%;
    max-width: 100%;
  }
  .modal-content.modal-wide {
    max-width: 100%;
  }
  .contacto-acciones {
    grid-template-columns: 1fr;
  }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
`);

// ============================================================
// 8. REGISTRAR EN MAIN.SCSS
// ============================================================
const mainScssPath = path.join(BASE, 'src/styles/main.scss');
let main = fs.readFileSync(mainScssPath, 'utf8');
if (!main.includes("base/mobile-fixes")) {
  main += "\n@use 'base/mobile-fixes';\n";
  fs.writeFileSync(mainScssPath, main, 'utf8');
  console.log('  OK src/styles/main.scss');
}

console.log('\n✅ Optimización móvil aplicada\n');
console.log('📋 Ejecuta: npm run dev\n');
console.log('Abre DevTools (F12) y prueba en modo responsive (Ctrl+Shift+M)\n');
console.log('Mejoras aplicadas:');
console.log('   • No hay scroll horizontal (se desborda hacia los lados)');
console.log('   • Header con menú hamburguesa animado (sidebar)');
console.log('   • Filtros 100% ancho, apilados y fáciles de tocar');
console.log('   • Tarjetas de 1 columna (no apretadas)');
console.log('   • Tabla con scroll interno (desliza la tabla)');
console.log('   • Modales aparecen desde abajo (bottom sheet)');
console.log('   • Inputs de 16px (evita zoom en iPhone)\n');