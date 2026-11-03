import fs from 'node:fs';
import path from 'node:path';
const BASE = process.cwd();
function write(rel, content) {
  const full = path.join(BASE, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.trimStart(), 'utf8');
  console.log('  OK', rel);
}

console.log('\n🎛️ Bonus 4: Filtros avanzados + Fechas\n');

// ============================================================
// 1. CSS para Chips de Filtros Activos
// ============================================================
write('src/styles/components/_chips.scss', `
.active-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  padding: 0 4px;
}
.active-filters-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--gray-500);
  margin-right: 4px;
}
.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--primary-light);
  color: var(--primary);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  animation: popIn 0.2s ease;
}
.filter-chip-remove {
  background: none;
  border: none;
  color: var(--primary);
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  transition: background var(--transition);
}
.filter-chip-remove:hover {
  background: rgba(26, 86, 219, 0.15);
}
.results-counter {
  margin-left: auto;
  font-size: 0.8rem;
  color: var(--gray-500);
  font-weight: 500;
}
.results-counter strong {
  color: var(--primary);
}
@keyframes popIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
`);

const mainScssPath = path.join(BASE, 'src/styles/main.scss');
let main = fs.readFileSync(mainScssPath, 'utf8');
if (!main.includes("components/chips")) {
  main += "\n@use 'components/chips';\n";
  fs.writeFileSync(mainScssPath, main, 'utf8');
  console.log('  OK src/styles/main.scss');
}

// ============================================================
// 2. Actualizar Dashboard (Filtros + Fechas)
// ============================================================
console.log('  • Actualizando dashboard panel.js...');
const dashPath = path.join(BASE, 'src/ui/panels/dashboard/panel.js');
let dash = fs.readFileSync(dashPath, 'utf8');

// A) Agregar el select de fecha en el HTML (antes del botón de calidad)
dash = dash.replace(
  /<div class="filter-group">\s*<label>Calidad de datos<\/label>/,
  '<div class="filter-group">' +
  '<label>📅 Período</label>' +
  '<select id="filterFecha">' +
  '<option value="7">Últimos 7 días</option>' +
  '<option value="30" selected>Últimos 30 días</option>' +
  '<option value="90">Últimos 90 días</option>' +
  '<option value="365">Último año</option>' +
  '<option value="0">Todo el historial</option>' +
  '</select>' +
  '</div>' +
  '<div class="filter-group">' +
  '<label>Calidad de datos</label>'
);

// B) Agregar el contenedor de chips debajo de la barra de filtros
// Buscamos el cierre del segundo filters-bar y agregamos el div
dash = dash.replace(
  /<\/select>\s*<\/div>\s*<\/div>\s*<div id="priceCards" class="price-cards-grid"><\/div>/,
  '</select>\n' +
  '    </div>\n' +
  '  </div>\n' +
  '  <div id="activeFilters" class="active-filters" style="display:none;"></div>\n' +
  '  <div id="priceCards" class="price-cards-grid"></div>'
);

// C) Modificar la función filtrar() para usar la fecha dinámica
const oldFiltrar = `function filtrar() {
  const { reportes, materiales } = getState();
  const fm = $('#filterMaterial').value;
  const fe = $('#filterEstado').value;
  const fo = $('#filterOperacion').value;
  const fc = $('#filterCalidad').value;
  const q  = $('#searchDashboard').value.toLowerCase();
  const lim = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
  let out = reportes.filter(r => r.fecha >= lim);`;

const newFiltrar = `function filtrar() {
  const { reportes, materiales } = getState();
  const fm = $('#filterMaterial').value;
  const fe = $('#filterEstado').value;
  const fo = $('#filterOperacion').value;
  const fc = $('#filterCalidad').value;
  const ff = $('#filterFecha').value;
  const q  = $('#searchDashboard').value.toLowerCase();

  let out = [...reportes];

  // Filtro de fecha
  if (ff !== '0') {
    const dias = parseInt(ff, 10);
    const lim = new Date(Date.now() - dias * 86400000).toISOString().split('T')[0];
    out = out.filter(r => r.fecha >= lim);
  }`;

dash = dash.replace(oldFiltrar, newFiltrar);

// D) Agregar listener al nuevo select de fecha
dash = dash.replace(
  /\[\'filterMaterial\',\'filterEstado\',\'filterOperacion\',\'filterCalidad\'\]\.forEach/,
  "['filterMaterial','filterEstado','filterOperacion','filterCalidad','filterFecha'].forEach"
);

// E) Agregar la lógica para renderizar los chips y el contador
// Insertar antes de la función update()
const chipsLogic = `
function renderActiveFilters(totalResultados) {
  const container = $('#activeFilters');
  if (!container) return;

  const filters = [
    { id: 'filterMaterial', label: 'Material', value: $('#filterMaterial').value, default: 'todos' },
    { id: 'filterEstado', label: 'Estado', value: $('#filterEstado').value, default: 'todos' },
    { id: 'filterOperacion', label: 'Operación', value: $('#filterOperacion').value, default: 'todos' },
    { id: 'filterCalidad', label: 'Calidad', value: $('#filterCalidad').value, default: 'todos' },
    { id: 'filterFecha', label: 'Período', value: $('#filterFecha').value, default: '30' },
    { id: 'searchDashboard', label: 'Búsqueda', value: $('#searchDashboard').value, default: '' },
  ];

  const activos = filters.filter(f => f.value !== f.default && f.value !== '');
  
  if (activos.length === 0) {
    container.style.display = 'none';
    container.innerHTML = '';
    return;
  }

  container.style.display = 'flex';
  
  const chipsHTML = activos.map(f => {
    let displayValue = f.value;
    if (f.id === 'filterFecha') {
      const map = { '7': '7 días', '30': '30 días', '90': '90 días', '365': '1 año', '0': 'Todo' };
      displayValue = map[f.value] || f.value;
    }
    return '<div class="filter-chip">' +
      '<span>' + f.label + ': ' + displayValue + '</span>' +
      '<button class="filter-chip-remove" data-id="' + f.id + '" data-default="' + f.default + '">×</button>' +
    '</div>';
  }).join('');

  container.innerHTML = 
    '<span class="active-filters-label">Filtros activos:</span>' +
    chipsHTML +
    '<span class="results-counter"><strong>' + totalResultados + '</strong> resultados</span>';

  // Listeners para quitar filtros
  container.querySelectorAll('.filter-chip-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const def = btn.dataset.default;
      const el = document.getElementById(id);
      if (el) {
        el.value = def;
        pagina = 1;
        update();
      }
    });
  });
}

`;

// Insertar antes de "function update(reset)"
dash = dash.replace(
  /function update\(reset\) \{/,
  chipsLogic + 'function update(reset) {'
);

// F) Llamar a renderActiveFilters dentro de update()
dash = dash.replace(
  /\$\('#transparencyNote'\)\.textContent =/,
  "renderActiveFilters(f.length);\n  $('#transparencyNote').textContent ="
);

fs.writeFileSync(dashPath, dash, 'utf8');
console.log('  OK src/ui/panels/dashboard/panel.js');

console.log('\n✅ Bonus 4 aplicado\n');
console.log('📋 Ejecuta: npm run dev\n');
console.log('Nuevas caracteristicas en el Dashboard:');
console.log('   • Selector de Período (7d, 30d, 90d, 1 año, Todo)');
console.log('   • Chips de filtros activos con boton "x" para quitarlos');
console.log('   • Contador de resultados en vivo al lado de los chips\n');