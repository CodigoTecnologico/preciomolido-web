import fs from 'node:fs';
import path from 'node:path';
const BASE = process.cwd();

console.log('\n🎨 Ajustando pestañas y filtros del Marketplace...\n');

// ============================================================
// 1. CSS: Ajustar Pestañas para que quepan en 1 línea
// ============================================================
const mkCssPath = path.join(BASE, 'src/styles/pages/_marketplace.scss');
let mkCss = fs.readFileSync(mkCssPath, 'utf8');

// Reemplazar la sección de media query que agregamos antes
const oldMedia = /@media \(max-width: 768px\) \{[\s\S]*?\}\s*$/;

const newMedia = `@media (max-width: 768px) {
  /* Pestañas en 1 sola línea */
  .marketplace-tabs {
    display: flex;
    flex-wrap: nowrap;
    gap: 4px;
    width: 100%;
    margin-bottom: 16px;
  }
  .mk-tab {
    flex: 1;
    padding: 10px 4px;
    font-size: 0.75rem;
    text-align: center;
    white-space: nowrap;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Filtros: Ajustes visuales */
  .filters-bar {
    flex-direction: column;
    padding: 12px;
    gap: 12px;
    margin-bottom: 16px;
  }
  .filter-group {
    min-width: 100%;
  }
  
  /* Select más limpio en móvil */
  .filter-group select {
    appearance: none;
    background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
    background-repeat: no-repeat;
    background-position: right 12px top 50%;
    background-size: 10px auto;
    padding-right: 30px;
    font-weight: 500;
  }

  /* Tarjetas en 2 columnas (mantenemos esto del paso anterior) */
  .marketplace-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  
  .mk-card {
    padding: 12px;
    display: flex;
    flex-direction: column;
  }
  .mk-foto { height: 90px; margin-bottom: 8px; }
  .mk-card-header { margin-bottom: 6px; }
  .mk-card-tipo { font-size: 0.55rem; padding: 2px 6px; }
  .mk-card-header span:last-child { font-size: 0.65rem !important; }
  .mk-card-material {
    font-size: 0.9rem; margin-bottom: 4px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .mk-card-detalle {
    font-size: 0.7rem; line-height: 1.3; margin-bottom: 8px;
    display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
  }
  .mk-card-precio { font-size: 1.1rem; margin-bottom: 4px; }
  .mk-card-precio.pago div { font-size: 0.6rem !important; }
  .trust-score { font-size: 0.55rem; padding: 2px 4px; margin-bottom: 4px; }
  .rating-summary .stars { font-size: 0.7rem; }
  .rating-summary span { font-size: 0.7rem !important; }
  
  .mk-card-footer {
    margin-top: auto; padding-top: 8px;
    flex-direction: column; align-items: stretch; gap: 6px;
  }
  .mk-card-footer > span {
    font-size: 0.65rem; text-align: center;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .mk-card-footer > div { display: flex; flex-wrap: wrap; gap: 4px; justify-content: center; }
  .btn-contactar { padding: 6px 8px; font-size: 0.7rem; flex: 1; text-align: center; }
  .btn-oferta { padding: 6px 8px; font-size: 0.65rem; flex: 1; text-align: center; }
}
`;

mkCss = mkCss.replace(oldMedia, newMedia);
fs.writeFileSync(mkCssPath, mkCss, 'utf8');
console.log('  OK src/styles/pages/_marketplace.scss');

// ============================================================
// 2. JS: Arreglar el dropdown de materiales (quitar duplicados)
// ============================================================
const panelPath = path.join(BASE, 'src/ui/panels/marketplace/panel.js');
let panel = fs.readFileSync(panelPath, 'utf8');

// A) Cambiar la generación del dropdown para que use nombres únicos
panel = panel.replace(
  /<div class="filter-group"><label>Material<\/label>\s*<select id="mkFilterMaterial">\s*<option value="todos">Todos<\/option>\s*\$\{materiales\.map\(m => `<option value="\$\{m\.id\}">\$\{m\.material\}<\/option>`\)\.join\(''\)\}\s*<\/select>\s*<\/div>/,
  `<div class="filter-group">
        <label>Material</label>
        <select id="mkFilterMaterial">
          <option value="todos">Todos</option>
          \${[...new Set(materiales.map(m => m.material))].map(m => \`<option value="\${m}">\${m}</option>\`).join('')}
        </select>
      </div>`
);

// B) Cambiar la lógica del filtro para que compare nombres en vez de IDs
panel = panel.replace(
  /if \(fm !== 'todos'\) list = list\.filter\(p => p\.material_id == fm\);/,
  `if (fm !== 'todos') {
    list = list.filter(p => {
      const mat = materiales.find(x => x.id === p.material_id);
      return mat && mat.material === fm;
    });
  }`
);

fs.writeFileSync(panelPath, panel, 'utf8');
console.log('  OK src/ui/panels/marketplace/panel.js');

console.log('\n✅ Ajustes aplicados correctamente\n');
console.log('📋 Ejecuta: npm run dev\n');
console.log('En móvil ahora verás:');
console.log('   • Las 3 pestañas en 1 sola fila, ocupando el 100% del ancho.');
console.log('   • El dropdown de Material ya no tiene "PET, PET, PET".');
console.log('   • El dropdown tiene una flecha elegante y padding correcto.\n');