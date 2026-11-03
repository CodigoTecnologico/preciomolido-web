import fs from 'node:fs';
import path from 'node:path';
const BASE = process.cwd();
function write(rel, content) {
  const full = path.join(BASE, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.trimStart(), 'utf8');
  console.log('  ✓', rel);
}

console.log('\n🎨 Fase A1: Loading states + Animaciones + Offline\n');

// ============================================================
// 1. SPINNER COMPONENT
// ============================================================
write('src/ui/components/spinner.js', `
export function createSpinner(size) {
  size = size || 'md';
  return '<span class="spinner spinner-' + size + '"></span>';
}

/** Pone un botón en estado "cargando" y devuelve función para restaurarlo */
export function showButtonLoading(btn, text) {
  if (!btn) return () => {};
  const original = btn.innerHTML;
  const wasDisabled = btn.disabled;
  btn.disabled = true;
  btn.classList.add('btn-loading');
  btn.innerHTML = createSpinner('sm') + ' ' + (text || 'Cargando...');
  return () => {
    btn.disabled = wasDisabled;
    btn.classList.remove('btn-loading');
    btn.innerHTML = original;
  };
}

/** Overlay con spinner para secciones completas */
export function showSectionLoading(container, text) {
  if (!container) return;
  container.dataset.originalContent = container.innerHTML;
  container.innerHTML =
    '<div class="section-loading">' +
      '<div class="spinner spinner-lg"></div>' +
      '<p>' + (text || 'Cargando...') + '</p>' +
    '</div>';
}

export function hideSectionLoading(container) {
  if (!container || !container.dataset.originalContent) return;
  container.innerHTML = container.dataset.originalContent;
  delete container.dataset.originalContent;
}
`);

// ============================================================
// 2. SKELETON COMPONENT
// ============================================================
write('src/ui/components/skeleton.js', `
/** Skeleton para una tarjeta de precio */
export function createSkeletonCard() {
  return '<div class="skeleton-card">' +
    '<div class="skeleton skeleton-title"></div>' +
    '<div class="skeleton skeleton-line"></div>' +
    '<div class="skeleton skeleton-line short"></div>' +
    '<div class="skeleton skeleton-price"></div>' +
    '<div class="skeleton skeleton-line"></div>' +
    '<div class="skeleton skeleton-line short"></div>' +
  '</div>';
}

/** Skeleton para una fila de tabla */
export function createSkeletonRow(cols) {
  cols = cols || 11;
  let cells = '';
  for (let i = 0; i < cols; i++) {
    cells += '<td><div class="skeleton skeleton-line"></div></td>';
  }
  return '<tr>' + cells + '</tr>';
}

/** Muestra N skeletons en un contenedor grid */
export function showSkeletons(container, count) {
  if (!container) return;
  count = count || 6;
  let html = '';
  for (let i = 0; i < count; i++) html += createSkeletonCard();
  container.innerHTML = html;
}

/** Muestra N filas de skeleton en un tbody */
export function showTableSkeletons(tbody, rows, cols) {
  if (!tbody) return;
  rows = rows || 5;
  let html = '';
  for (let i = 0; i < rows; i++) html += createSkeletonRow(cols);
  tbody.innerHTML = html;
}

/** Skeleton para publicaciones de marketplace */
export function createMkSkeleton() {
  return '<div class="skeleton-card">' +
    '<div class="skeleton skeleton-img"></div>' +
    '<div class="skeleton skeleton-title"></div>' +
    '<div class="skeleton skeleton-line"></div>' +
    '<div class="skeleton skeleton-line short"></div>' +
    '<div class="skeleton skeleton-price"></div>' +
  '</div>';
}

export function showMkSkeletons(container, count) {
  if (!container) return;
  count = count || 6;
  let html = '';
  for (let i = 0; i < count; i++) html += createMkSkeleton();
  container.innerHTML = html;
}
`);

// ============================================================
// 3. OFFLINE DETECTION
// ============================================================
write('src/ui/components/offline.js', `
import { showToast } from './toast.js';

let banner = null;

export function initOfflineDetection() {
  const update = () => {
    if (navigator.onLine) {
      hideBanner();
    } else {
      showBanner();
    }
  };

  window.addEventListener('online', () => {
    hideBanner();
    showToast('✅ Conexión restaurada', 'success');
  });
  window.addEventListener('offline', () => {
    showBanner();
    showToast('⚠️ Sin conexión a internet', 'warning');
  });

  update();
}

function showBanner() {
  if (banner) return;
  banner = document.createElement('div');
  banner.className = 'offline-banner';
  banner.innerHTML =
    '<span class="offline-icon">⚠️</span>' +
    '<span>Sin conexión a internet. Algunos datos pueden no estar actualizados.</span>';
  document.body.appendChild(banner);
  document.body.classList.add('is-offline');
}

function hideBanner() {
  if (banner) {
    banner.remove();
    banner = null;
  }
  document.body.classList.remove('is-offline');
}
`);

// ============================================================
// 4. CSS: SPINNER
// ============================================================
write('src/styles/components/_spinner.scss', `
.spinner {
  display: inline-block;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  vertical-align: middle;
}
.spinner-sm { width: 14px; height: 14px; border-width: 2px; }
.spinner-md { width: 22px; height: 22px; border-width: 2.5px; }
.spinner-lg { width: 40px; height: 40px; border-width: 3px; color: var(--primary); }

.btn-primary .spinner,
.btn-danger .spinner {
  border-color: rgba(255,255,255,.35);
  border-top-color: #fff;
}
.btn-ghost .spinner {
  border-color: rgba(0,0,0,.15);
  border-top-color: currentColor;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-loading {
  cursor: wait !important;
  opacity: .85;
}

.section-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 20px;
  color: var(--gray-500);
}
.section-loading p { margin: 0; font-size: .9rem; }
`);

// ============================================================
// 5. CSS: SKELETON
// ============================================================
write('src/styles/components/_skeleton.scss', `
.skeleton {
  background: linear-gradient(90deg, var(--gray-100) 25%, var(--gray-200) 50%, var(--gray-100) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.4s ease-in-out infinite;
  border-radius: 4px;
}

@keyframes skeleton-loading {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-card {
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: 0 1px 2px rgba(0,0,0,.05);
  border: 1px solid var(--gray-100);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.skeleton-title { height: 18px; width: 65%; }
.skeleton-line  { height: 12px; width: 100%; }
.skeleton-line.short { width: 40%; }
.skeleton-price { height: 32px; width: 55%; margin: 6px 0; }
.skeleton-img   { height: 140px; width: 100%; border-radius: var(--radius); }

.skeleton-row td { padding: 12px; }
.skeleton-row .skeleton-line { height: 12px; }
`);

// ============================================================
// 6. CSS: OFFLINE
// ============================================================
write('src/styles/components/_offline.scss', `
.offline-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: var(--warning);
  color: #fff;
  padding: 10px 16px;
  text-align: center;
  font-size: .85rem;
  font-weight: 500;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,.15);
  animation: slideDown 0.3s ease;
}
.offline-icon { font-size: 1rem; }

body.is-offline .header {
  top: 40px;
}
body.is-offline .ad-sidebar {
  top: 130px;
}

@keyframes slideDown {
  from { transform: translateY(-100%); opacity: 0; }
  to   { transform: translateY(0);     opacity: 1; }
}
`);

// ============================================================
// 7. CSS: ANIMACIONES Y TRANSICIONES
// ============================================================
write('src/styles/components/_animations.scss', `
/* ==================== TRANSICIONES SUAVES ==================== */

/* Paneles */
.panel.active {
  animation: fadeInUp 0.35s cubic-bezier(.4, 0, .2, 1);
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Tarjetas con hover elevado */
.price-card,
.mk-card {
  will-change: transform, box-shadow;
}

/* Aparición en cascada de tarjetas */
.price-cards-grid > *,
.marketplace-grid > * {
  animation: cardAppear 0.4s cubic-bezier(.4, 0, .2, 1) backwards;
}
.price-cards-grid > *:nth-child(1)  { animation-delay: 0ms; }
.price-cards-grid > *:nth-child(2)  { animation-delay: 40ms; }
.price-cards-grid > *:nth-child(3)  { animation-delay: 80ms; }
.price-cards-grid > *:nth-child(4)  { animation-delay: 120ms; }
.price-cards-grid > *:nth-child(5)  { animation-delay: 160ms; }
.price-cards-grid > *:nth-child(6)  { animation-delay: 200ms; }
.price-cards-grid > *:nth-child(7)  { animation-delay: 240ms; }
.price-cards-grid > *:nth-child(8)  { animation-delay: 280ms; }
.price-cards-grid > *:nth-child(9)  { animation-delay: 320ms; }
.price-cards-grid > *:nth-child(10) { animation-delay: 360ms; }
.price-cards-grid > *:nth-child(11) { animation-delay: 400ms; }
.price-cards-grid > *:nth-child(12) { animation-delay: 440ms; }

@keyframes cardAppear {
  from { opacity: 0; transform: translateY(8px) scale(.98); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
}

/* Modales */
.modal {
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.modal-content {
  animation: modalPop 0.25s cubic-bezier(.34, 1.56, .64, 1);
}
@keyframes modalPop {
  from { opacity: 0; transform: scale(.92) translateY(10px); }
  to   { opacity: 1; transform: scale(1)   translateY(0); }
}

/* Toasts */
.toast {
  animation: toastSlide 0.3s cubic-bezier(.4, 0, .2, 1), fadeOut 0.3s 3.7s ease forwards;
}
@keyframes toastSlide {
  from { transform: translateX(110%); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}

/* Dropdown menú */
.user-dropdown-menu {
  animation: dropdownFade 0.2s ease;
}
@keyframes dropdownFade {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Botones con hover */
.btn {
  transition: all var(--transition);
}
.btn:active {
  transform: scale(.97);
}

/* Filtros activos */
.filter-group select:focus,
.filter-group input:focus {
  transition: border-color var(--transition), box-shadow var(--transition);
}

/* Link activo en nav con underline animado */
.nav-link {
  position: relative;
}
.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 50%;
  width: 20px;
  height: 2px;
  background: var(--primary);
  border-radius: 2px;
  transform: translateX(-50%);
  animation: navUnderline 0.3s ease;
}
@keyframes navUnderline {
  from { width: 0; }
  to   { width: 20px; }
}

/* Reducir movimiento si el usuario lo pide */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`);

// ============================================================
// 8. Actualizar main.scss (agregar imports)
// ============================================================
const mainScssPath = path.join(BASE, 'src/styles/main.scss');
let mainScss = fs.readFileSync(mainScssPath, 'utf8');

// Solo agregar si no están
const nuevosImports = [
  "@use 'components/spinner';",
  "@use 'components/skeleton';",
  "@use 'components/offline';",
  "@use 'components/animations';",
];

let agregado = false;
for (const imp of nuevosImports) {
  if (!mainScss.includes(imp)) {
    mainScss += '\n' + imp;
    agregado = true;
  }
}
if (agregado) {
  fs.writeFileSync(mainScssPath, mainScss, 'utf8');
  console.log('  ✓ src/styles/main.scss actualizado');
} else {
  console.log('  • src/styles/main.scss ya tenía los imports');
}

// ============================================================
// 9. Actualizar main.js (init offline detection)
// ============================================================
const mainJsPath = path.join(BASE, 'src/main.js');
let mainJs = fs.readFileSync(mainJsPath, 'utf8');

if (!mainJs.includes('initOfflineDetection')) {
  // Agregar import después del último import
  mainJs = mainJs.replace(
    /(import \{ showToast \} from '@\/ui\/components\/toast\.js';)/,
    "$1\nimport { initOfflineDetection } from '@/ui/components/offline.js';"
  );

  // Llamar initOfflineDetection al inicio del bootstrap
  mainJs = mainJs.replace(
    /async function bootstrap\(\) \{/,
    "async function bootstrap() {\n  initOfflineDetection();"
  );

  fs.writeFileSync(mainJsPath, mainJs, 'utf8');
  console.log('  ✓ src/main.js actualizado');
} else {
  console.log('  • src/main.js ya tenía initOfflineDetection');
}

console.log('\n✅ Fase A1 aplicada\n');
console.log('📋 Ahora ejecuta:');
console.log('   npm run dev\n');
console.log('Deberías ver:');
console.log('   • Banner naranja si desconectas internet');
console.log('   • Animaciones suaves al cambiar de panel');
console.log('   • Tarjetas apareciendo en cascada');
console.log('   • Modales con efecto pop\n');