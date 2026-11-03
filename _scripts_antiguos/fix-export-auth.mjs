import fs from 'node:fs';
import path from 'node:path';
const BASE = process.cwd();

console.log('\n🔒 Restringiendo exportacion a usuarios autenticados...\n');

// ============================================================
// 1. DASHBOARD — Exportar solo si hay sesion
// ============================================================
const dashPath = path.join(BASE, 'src/ui/panels/dashboard/panel.js');
let dash = fs.readFileSync(dashPath, 'utf8');

// a) Ocultar boton por defecto y mostrar condicionalmente
// Cambiar la generacion del boton para que solo aparezca con sesion
dash = dash.replace(
  /'<button class="btn btn-sm btn-ghost" id="btnExportCSV" title="Descargar CSV">📥 Exportar<\/button>' \+/,
  "(currentUser ? '<button class=\"btn btn-sm btn-ghost\" id=\"btnExportCSV\" title=\"Descargar CSV\">📥 Exportar</button>' : '') +"
);

// b) Asegurar que currentUser este disponible al inicio de renderDashboard
dash = dash.replace(
  /export function renderDashboard\(\) \{\s*const \{ materiales \} = getState\(\);/,
  "export function renderDashboard() {\n  const { materiales, currentUser } = getState();"
);

// c) Guardar el listener con verificacion de seguridad
dash = dash.replace(
  /\$\('#btnExportCSV'\)\.addEventListener\('click', exportarDashboardCSV\);/,
  "const btnExp = $('#btnExportCSV');\n  if (btnExp) btnExp.addEventListener('click', exportarDashboardCSV);"
);

// d) En la funcion exportar, doble verificacion
dash = dash.replace(
  /function exportarDashboardCSV\(\) \{\s*const \{ materiales \} = getState\(\);/,
  `function exportarDashboardCSV() {
  const { materiales, currentUser } = getState();

  if (!currentUser) {
    import('@/ui/components/toast.js').then(m =>
      m.showToast('Inicia sesion para exportar datos', 'warning')
    );
    import('@/modals/auth.modal.js').then(m => m.openAuthModal());
    return;
  }
`
);

fs.writeFileSync(dashPath, dash, 'utf8');
console.log('  OK src/ui/panels/dashboard/panel.js');

// ============================================================
// 2. MARKETPLACE — Exportar solo si hay sesion
// ============================================================
const mkPath = path.join(BASE, 'src/ui/panels/marketplace/panel.js');
let mk = fs.readFileSync(mkPath, 'utf8');

// El panel de marketplace ya devuelve antes si no hay currentUser.
// Verificar que la funcion exportar tambien tenga la verificacion.
mk = mk.replace(
  /function exportarMarketplaceCSV\(\) \{\s*const \{ publicacionesMK, materiales \} = getState\(\);/,
  `function exportarMarketplaceCSV() {
  const { publicacionesMK, materiales, currentUser } = getState();

  if (!currentUser) {
    showToast('Inicia sesion para exportar datos', 'warning');
    import('@/modals/auth.modal.js').then(m => m.openAuthModal());
    return;
  }
`
);

fs.writeFileSync(mkPath, mk, 'utf8');
console.log('  OK src/ui/panels/marketplace/panel.js');

// ============================================================
// 3. Verificar que el estado del usuario se re-evalua al cambiar de panel
// ============================================================
// Los paneles se re-renderizan en cada goToPanel(), asi que ya funciona.
// Solo confirmar que auth.service.js tiene logout que actualiza el estado.

console.log('\n✅ Restriccion aplicada\n');
console.log('📋 Comportamiento nuevo:\n');
console.log('   SIN sesion:');
console.log('   - Dashboard: NO aparece boton Exportar');
console.log('   - Marketplace: NO aparece boton Exportar CSV');
console.log('   - Si por alguna razon llaman la funcion,');
console.log('     se muestra toast + modal de login\n');
console.log('   CON sesion:');
console.log('   - Aparecen los botones Exportar normalmente\n');
console.log('📋 Ejecuta: npm run dev\n');