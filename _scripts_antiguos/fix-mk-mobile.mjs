import fs from 'node:fs';
import path from 'node:path';
const BASE = process.cwd();
function write(rel, content) {
  const full = path.join(BASE, rel);
  fs.writeFileSync(full, content.trimStart(), 'utf8');
  console.log('  OK', rel);
}

console.log('\n📱 Ajustando Marketplace móvil (2 columnas + Paginación)...\n');

// ============================================================
// 1. CONSTANTES: 20 items por página para Marketplace
// ============================================================
const constPath = path.join(BASE, 'src/utils/constants.js');
let constContent = fs.readFileSync(constPath, 'utf8');
if (!constContent.includes('ITEMS_POR_PAGINA_MK')) {
  constContent += "\nexport const ITEMS_POR_PAGINA_MK = 20;\n";
  fs.writeFileSync(constPath, constContent, 'utf8');
  console.log('  OK src/utils/constants.js');
}

// ============================================================
// 2. CSS: Ajustar Grid y Tarjetas para 2 columnas en móvil
// ============================================================
const mkCssPath = path.join(BASE, 'src/styles/pages/_marketplace.scss');
let mkCss = fs.readFileSync(mkCssPath, 'utf8');

// Reemplazar la media query vieja
const oldMedia = /@media \(max-width: 768px\) \{[\s\S]*?\}\s*$/;
const newMedia = `@media (max-width: 768px) {
  .marketplace-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  
  .mk-card {
    padding: 12px;
    display: flex;
    flex-direction: column;
  }
  
  .mk-foto {
    height: 90px;
    margin-bottom: 8px;
  }

  .mk-card-header {
    margin-bottom: 6px;
  }
  .mk-card-tipo {
    font-size: 0.55rem;
    padding: 2px 6px;
  }
  .mk-card-header span:last-child {
    font-size: 0.65rem !important;
  }

  .mk-card-material {
    font-size: 0.9rem;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .mk-card-detalle {
    font-size: 0.7rem;
    line-height: 1.3;
    margin-bottom: 8px;
    display: -webkit-box;
    -webkit-line-clamp: 3; /* Trunca el texto a 3 líneas */
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .mk-card-precio {
    font-size: 1.1rem;
    margin-bottom: 4px;
  }
  .mk-card-precio.pago div {
    font-size: 0.6rem !important; /* Precio que pago */
  }

  .trust-score {
    font-size: 0.55rem;
    padding: 2px 4px;
    margin-bottom: 4px;
  }

  .rating-summary .stars {
    font-size: 0.7rem;
  }
  .rating-summary span {
    font-size: 0.7rem !important;
  }

  .mk-card-footer {
    margin-top: auto; /* Empuja los botones al fondo */
    padding-top: 8px;
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
  }
  
  .mk-card-footer > span {
    font-size: 0.65rem;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .mk-card-footer > div {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    justify-content: center;
  }

  .btn-contactar {
    padding: 6px 8px;
    font-size: 0.7rem;
    flex: 1; /* Ocupa el espacio disponible */
    text-align: center;
  }
  
  .btn-oferta {
    padding: 6px 8px;
    font-size: 0.65rem;
    flex: 1;
    text-align: center;
  }
}
`;
mkCss = mkCss.replace(oldMedia, newMedia);
fs.writeFileSync(mkCssPath, mkCss, 'utf8');
console.log('  OK src/styles/pages/_marketplace.scss');

// ============================================================
// 3. JS: Cambiar paginación de Marketplace
// ============================================================
const panelPath = path.join(BASE, 'src/ui/panels/marketplace/panel.js');
let panel = fs.readFileSync(panelPath, 'utf8');

// A) Importar la nueva constante
panel = panel.replace(
  /import \{ ESTADOS_MEXICO, ITEMS_POR_PAGINA \} from '@\/utils\/constants\.js';/,
  "import { ESTADOS_MEXICO, ITEMS_POR_PAGINA_MK } from '@/utils/constants.js';"
);

// B) Reemplazar el HTML de los botones de paginación
panel = panel.replace(
  /<div class="pagination-container">\s*<button id="btnLoadMoreMK" class="btn btn-primary" style="display:none;">Cargar más<\/button>\s*<\/div>/,
  `<div class="pagination-container" id="mkPagination" style="display:none; align-items:center; justify-content:center; gap:15px; margin: 30px 0;">
      <button id="btnPrevMK" class="btn btn-ghost">← Anterior</button>
      <span id="pageInfoMK" style="font-size:0.9rem; font-weight:600; color:var(--gray-600);">Página 1</span>
      <button id="btnNextMK" class="btn btn-primary">Siguiente →</button>
   </div>`
);

// C) Reemplazar los event listeners viejos
panel = panel.replace(
  /\$\('#btnLoadMoreMK'\)\.addEventListener\('click', \(\) => \{ pagina\+\+; update\(false\); \}\);/,
  `$('#btnPrevMK').addEventListener('click', () => { if (pagina > 1) { pagina--; update(false); window.scrollTo({ top: 0, behavior: 'smooth' }); } });
  $('#btnNextMK').addEventListener('click', () => { pagina++; update(false); window.scrollTo({ top: 0, behavior: 'smooth' }); });`
);

// D) Reemplazar el uso de ITEMS_POR_PAGINA por ITEMS_POR_PAGINA_MK en la función update
panel = panel.replace(
  /const inicio = \(pagina - 1\) \* ITEMS_POR_PAGINA;/,
  "const inicio = (pagina - 1) * ITEMS_POR_PAGINA_MK;"
);
panel = panel.replace(
  /const paginaDatos = list\.slice\(inicio, inicio \+ ITEMS_POR_PAGINA\);/,
  "const paginaDatos = list.slice(inicio, inicio + ITEMS_POR_PAGINA_MK);"
);

// E) Reemplazar la lógica de mostrar/ocultar el botón de "Cargar más" por la nueva paginación
const oldPaginationLogic = `const total = Math.ceil(list.length / ITEMS_POR_PAGINA);
  $('#btnLoadMoreMK').style.display = pagina < total ? 'inline-block' : 'none';`;
const newPaginationLogic = `const total = Math.ceil(list.length / ITEMS_POR_PAGINA_MK);
  const pagContainer = $('#mkPagination');
  const btnPrev = $('#btnPrevMK');
  const btnNext = $('#btnNextMK');
  const pageInfo = $('#pageInfoMK');

  if (total > 1) {
    pagContainer.style.display = 'flex';
    btnPrev.style.display = pagina > 1 ? 'inline-block' : 'none';
    btnNext.style.display = pagina < total ? 'inline-block' : 'none';
    pageInfo.textContent = 'Página ' + pagina + ' de ' + total;
  } else {
    pagContainer.style.display = 'none';
  }`;
panel = panel.replace(oldPaginationLogic, newPaginationLogic);

fs.writeFileSync(panelPath, panel, 'utf8');
console.log('  OK src/ui/panels/marketplace/panel.js');

console.log('\n✅ Marketplace ajustado\n');
console.log('📋 Ejecuta: npm run dev\n');
console.log('Resultado en móvil:');
console.log('   • 2 columnas exactas, sin desbordes');
console.log('   • Fotos más pequeñas y texto truncado a 3 líneas');
console.log('   • Botones compactos pero tocables');
console.log('   • Paginación de 20 en 20 con botones Anterior/Siguiente\n');