import fs from 'node:fs';
import path from 'node:path';
const BASE = process.cwd();
function write(rel, content) {
  const full = path.join(BASE, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.trimStart(), 'utf8');
  console.log('  OK', rel);
}

console.log('\n📥 Bonus 1: Exportar CSV + Modal de foto\n');

// ============================================================
// 1. Utilidad CSV
// ============================================================
write('src/utils/csv.js', `
/** Escapa un valor para CSV (RFC 4180) */
function escaparCSV(valor) {
  if (valor == null) return '';
  const s = String(valor);
  if (s.includes(',') || s.includes('"') || s.includes('\\n') || s.includes(';')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

/**
 * Convierte un array de objetos a CSV.
 * @param {Array<Object>} filas
 * @param {Array<{key:string, label:string}>} columnas
 * @param {string} separador
 */
export function generarCSV(filas, columnas, separador = ',') {
  const headers = columnas.map(c => escaparCSV(c.label)).join(separador);
  const rows = filas.map(fila =>
    columnas.map(c => {
      let v = fila[c.key];
      if (typeof v === 'number' && c.formato) v = c.formato(v);
      return escaparCSV(v);
    }).join(separador)
  );
  return [headers, ...rows].join('\\n');
}

/** Descarga un string como archivo */
export function descargarArchivo(contenido, nombre) {
  // BOM para que Excel respete UTF-8
  const blob = new Blob(['\\uFEFF' + contenido], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Genera el nombre del archivo con fecha */
export function nombreArchivoCSV(prefijo) {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  const fecha = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  return prefijo + '_' + fecha + '.csv';
}
`);

// ============================================================
// 2. Modal de foto mejorado (con zoom + ESC + click fuera)
// ============================================================
write('src/modals/foto.modal.js', `
import { openModal } from '@/ui/components/modal.js';
import { showToast } from '@/ui/components/toast.js';

export function openFotoModal(src, alt) {
  alt = alt || 'Foto del material';
  const node = openModal(
    '<div class="foto-viewer">' +
      '<div class="foto-toolbar">' +
        '<button class="foto-btn" data-action="zoom-out" title="Reducir">−</button>' +
        '<span class="foto-zoom-label" id="fotoZoom">100%</span>' +
        '<button class="foto-btn" data-action="zoom-in" title="Aumentar">+</button>' +
        '<button class="foto-btn" data-action="reset" title="Reiniciar">⟲</button>' +
        '<a class="foto-btn" href="' + src + '" target="_blank" rel="noopener" title="Abrir en nueva pestana">↗</a>' +
        '<button class="foto-btn" data-action="copy" title="Copiar URL">📋</button>' +
      '</div>' +
      '<div class="foto-canvas" id="fotoCanvas">' +
        '<img src="' + src + '" alt="' + alt + '" id="fotoImg" draggable="false">' +
      '</div>' +
      '<p class="foto-hint">Usa los botones o la rueda del mouse para hacer zoom</p>' +
    '</div>',
    { wide: true }
  );

  const canvas = node.querySelector('#fotoCanvas');
  const img = node.querySelector('#fotoImg');
  const zoomLabel = node.querySelector('#fotoZoom');

  let zoom = 1;
  let posX = 0;
  let posY = 0;
  let dragging = false;
  let startX = 0, startY = 0;

  function aplicar() {
    img.style.transform = 'translate(' + posX + 'px,' + posY + 'px) scale(' + zoom + ')';
    zoomLabel.textContent = Math.round(zoom * 100) + '%';
  }

  function setZoom(nuevo) {
    zoom = Math.max(0.25, Math.min(5, nuevo));
    aplicar();
  }

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    setZoom(zoom + (e.deltaY < 0 ? 0.15 : -0.15));
  }, { passive: false });

  canvas.addEventListener('mousedown', (e) => {
    if (zoom <= 1) return;
    dragging = true;
    startX = e.clientX - posX;
    startY = e.clientY - posY;
    canvas.style.cursor = 'grabbing';
  });
  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    posX = e.clientX - startX;
    posY = e.clientY - startY;
    aplicar();
  });
  document.addEventListener('mouseup', () => {
    dragging = false;
    canvas.style.cursor = 'grab';
  });

  node.querySelector('[data-action="zoom-in"]').addEventListener('click', () => setZoom(zoom + 0.25));
  node.querySelector('[data-action="zoom-out"]').addEventListener('click', () => setZoom(zoom - 0.25));
  node.querySelector('[data-action="reset"]').addEventListener('click', () => {
    zoom = 1; posX = 0; posY = 0; aplicar();
  });
  node.querySelector('[data-action="copy"]').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(src);
      showToast('URL copiada al portapapeles', 'success');
    } catch { showToast('No se pudo copiar', 'error'); }
  });

  // Doble click = zoom toggle
  img.addEventListener('dblclick', () => {
    if (zoom === 1) setZoom(2);
    else { zoom = 1; posX = 0; posY = 0; aplicar(); }
  });

  // ESC para cerrar
  const onKey = (e) => {
    if (e.key === 'Escape') { node.remove(); document.removeEventListener('keydown', onKey); }
    if (e.key === '+' || e.key === '=') setZoom(zoom + 0.25);
    if (e.key === '-') setZoom(zoom - 0.25);
    if (e.key === '0') { zoom = 1; posX = 0; posY = 0; aplicar(); }
  };
  document.addEventListener('keydown', onKey);

  aplicar();
}
`);

// ============================================================
// 3. CSS del modal de foto
// ============================================================
write('src/styles/components/_foto.scss', `
.foto-viewer {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.foto-toolbar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px;
  background: var(--gray-50);
  border-radius: var(--radius);
}

.foto-btn {
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius);
  width: 36px;
  height: 36px;
  font-size: 1rem;
  font-weight: 700;
  color: var(--gray-700);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition);
  text-decoration: none;
}
.foto-btn:hover {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
  transform: translateY(-1px);
}
.foto-btn:active { transform: translateY(0); }

.foto-zoom-label {
  min-width: 48px;
  text-align: center;
  font-size: .85rem;
  font-weight: 600;
  color: var(--gray-600);
}

.foto-canvas {
  background: var(--gray-900);
  border-radius: var(--radius);
  overflow: hidden;
  height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  position: relative;
  user-select: none;
}
.foto-canvas:active { cursor: grabbing; }

.foto-canvas img {
  max-width: 100%;
  max-height: 100%;
  transition: transform 0.15s ease-out;
  transform-origin: center center;
  will-change: transform;
  pointer-events: none;
}

.foto-hint {
  text-align: center;
  font-size: .75rem;
  color: var(--gray-400);
  margin: 0;
}
`);

// ============================================================
// 4. Aplicar en main.scss
// ============================================================
const mainScssPath = path.join(BASE, 'src/styles/main.scss');
let main = fs.readFileSync(mainScssPath, 'utf8');
if (!main.includes("components/foto")) {
  main += "\n@use 'components/foto';\n";
  fs.writeFileSync(mainScssPath, main, 'utf8');
  console.log('  OK src/styles/main.scss');
}

// ============================================================
// 5. Actualizar Dashboard: agregar botón Exportar
// ============================================================
console.log('  • Actualizando dashboard panel.js...');
const dashPath = path.join(BASE, 'src/ui/panels/dashboard/panel.js');
let dash = fs.readFileSync(dashPath, 'utf8');

// Agregar import de CSV si no está
if (!dash.includes('generarCSV')) {
  dash = dash.replace(
    /import \{ calcularConfianzaMercado \} from '@\/services\/antiFraude\.service\.js';/,
    "import { calcularConfianzaMercado } from '@/services/antiFraude.service.js';\nimport { generarCSV, descargarArchivo, nombreArchivoCSV } from '@/utils/csv.js';"
  );
}

// Agregar botón Exportar en el view-toggle
dash = dash.replace(
  /<button class="btn btn-sm btn-ghost" id="viewTable">📋 Tabla<\/button>\s*<\/div>/,
  '<button class="btn btn-sm btn-ghost" id="viewTable">📋 Tabla</button>' +
  '<button class="btn btn-sm btn-ghost" id="btnExportCSV" title="Descargar CSV">📥 Exportar</button>' +
  '</div>'
);

// Agregar listener del botón exportar justo después del listener de viewTable
dash = dash.replace(
  /\$\('#viewTable'\)\.addEventListener\('click', \(\) => switchView\('table'\)\);/,
  "$('#viewTable').addEventListener('click', () => switchView('table'));\n" +
  "  $('#btnExportCSV').addEventListener('click', exportarDashboardCSV);"
);

// Agregar la función exportarDashboardCSV al final
if (!dash.includes('function exportarDashboardCSV')) {
  dash += `

function exportarDashboardCSV() {
  const { materiales } = getState();
  const filtrados = filtrar();
  const promedios = agrupar(filtrados);

  if (!promedios.length) {
    import('@/ui/components/toast.js').then(m => m.showToast('No hay datos para exportar', 'warning'));
    return;
  }

  const filas = promedios.map(e => {
    const m = materiales.find(x => x.id === e.material_id) || {};
    return {
      material: m.material || '',
      presentacion: m.presentacion || '',
      origen: m.origen || '',
      color: m.color || '',
      estado: e.estado,
      operacion: e.tipo_operacion,
      precio_promedio: +(e.sumaPV / e.sumaV).toFixed(2),
      precio_min: +Math.min(...e.precios).toFixed(2),
      precio_max: +Math.max(...e.precios).toFixed(2),
      reportes: e.count,
      verificados: e.todosVerificados ? 'Si' : 'No',
    };
  });

  const columnas = [
    { key: 'material', label: 'Material' },
    { key: 'presentacion', label: 'Presentacion' },
    { key: 'origen', label: 'Origen' },
    { key: 'color', label: 'Color' },
    { key: 'estado', label: 'Estado' },
    { key: 'operacion', label: 'Operacion' },
    { key: 'precio_promedio', label: 'Precio Promedio (MXN/kg)' },
    { key: 'precio_min', label: 'Precio Min (MXN/kg)' },
    { key: 'precio_max', label: 'Precio Max (MXN/kg)' },
    { key: 'reportes', label: 'Reportes' },
    { key: 'verificados', label: 'Todos Verificados' },
  ];

  const csv = generarCSV(filas, columnas);
  descargarArchivo(csv, nombreArchivoCSV('preciomolido_dashboard'));
  import('@/ui/components/toast.js').then(m => m.showToast('CSV descargado', 'success'));
}
`;
}

fs.writeFileSync(dashPath, dash, 'utf8');
console.log('  OK src/ui/panels/dashboard/panel.js');

// ============================================================
// 6. Actualizar Marketplace: agregar botón Exportar
// ============================================================
console.log('  • Actualizando marketplace panel.js...');
const mkPath = path.join(BASE, 'src/ui/panels/marketplace/panel.js');
let mk = fs.readFileSync(mkPath, 'utf8');

if (!mk.includes('generarCSV')) {
  mk = mk.replace(
    /import \{ showButtonLoading \} from '@\/ui\/components\/spinner\.js';/,
    "import { showButtonLoading } from '@/ui/components/spinner.js';\nimport { generarCSV, descargarArchivo, nombreArchivoCSV } from '@/utils/csv.js';"
  );
}

// Botón Exportar al lado de "Nueva publicación"
mk = mk.replace(
  /<button class="btn btn-primary" id="btnPublicar" style="margin-bottom:24px;">➕ Nueva publicación<\/button>/,
  '<div style="display:flex;gap:8px;margin-bottom:24px;flex-wrap:wrap;">' +
  '<button class="btn btn-primary" id="btnPublicar">➕ Nueva publicación</button>' +
  '<button class="btn btn-ghost" id="btnExportMK">📥 Exportar CSV</button>' +
  '</div>'
);

// Listener
mk = mk.replace(
  /\$\('#btnPublicar'\)\.addEventListener\('click', \(\) => \{/,
  "$('#btnExportMK').addEventListener('click', exportarMarketplaceCSV);\n" +
  "  $('#btnPublicar').addEventListener('click', () => {"
);

// Función exportar
if (!mk.includes('function exportarMarketplaceCSV')) {
  mk += `

function exportarMarketplaceCSV() {
  const { publicacionesMK, materiales } = getState();
  const activas = publicacionesMK.filter(p => p.activo !== false);

  if (!activas.length) {
    showToast('No hay publicaciones para exportar', 'warning');
    return;
  }

  const filas = activas.map(p => {
    const m = materiales.find(x => x.id === p.material_id) || {};
    return {
      tipo: p.tipo,
      material: m.material || '',
      color: m.color || '',
      presentacion: p.presentacion || '',
      origen: p.origen || '',
      precio: p.precio_kg || 0,
      volumen: p.volumen_ton || 0,
      estado: p.estado,
      municipio: p.municipio || '',
      garantia: p.garantia || '',
      usuario: p.usuario_nombre || '',
      fecha: new Date(p.fecha).toLocaleDateString('es-MX'),
    };
  });

  const columnas = [
    { key: 'tipo', label: 'Tipo' },
    { key: 'material', label: 'Material' },
    { key: 'color', label: 'Color' },
    { key: 'presentacion', label: 'Presentacion' },
    { key: 'origen', label: 'Origen' },
    { key: 'precio', label: 'Precio (MXN/kg)' },
    { key: 'volumen', label: 'Volumen (ton)' },
    { key: 'estado', label: 'Estado' },
    { key: 'municipio', label: 'Municipio' },
    { key: 'garantia', label: 'Garantia' },
    { key: 'usuario', label: 'Publicado por' },
    { key: 'fecha', label: 'Fecha' },
  ];

  const csv = generarCSV(filas, columnas);
  descargarArchivo(csv, nombreArchivoCSV('preciomolido_marketplace'));
  showToast('CSV descargado', 'success');
}
`;
}

fs.writeFileSync(mkPath, mk, 'utf8');
console.log('  OK src/ui/panels/marketplace/panel.js');

// ============================================================
// 7. Actualizar mkCard.js para usar el nuevo modal de foto
// ============================================================
console.log('  • Actualizando mkCard.js...');
const mkCardPath = path.join(BASE, 'src/ui/panels/marketplace/mkCard.js');
let mkCard = fs.readFileSync(mkCardPath, 'utf8');

mkCard = mkCard.replace(
  /import\('@\/modals\/foto\.modal\.js'\)\.then\(m => m\.openFotoModal\(pub\.foto\)\);/,
  "import('@/modals/foto.modal.js').then(m => m.openFotoModal(pub.foto, mat ? mat.material : 'Foto del material'));"
);

fs.writeFileSync(mkCardPath, mkCard, 'utf8');
console.log('  OK src/ui/panels/marketplace/mkCard.js');

console.log('\n✅ Bonus 1 aplicado\n');
console.log('📋 Ejecuta: npm run dev\n');
console.log('Tendras:');
console.log('   • Boton "Exportar" en Dashboard (CSV de precios)');
console.log('   • Boton "Exportar CSV" en Marketplace');
console.log('   • Modal de foto con zoom, arrastre, copiar URL y ESC\n');