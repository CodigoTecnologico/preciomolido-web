import fs from 'node:fs';
import path from 'node:path';
const BASE = process.cwd();

console.log('\n📱 Moviendo el botón de tema al menú móvil...\n');

// ============================================================
// 1. ACTUALIZAR HEADER.JS (Agregar botón en el menú y lógica)
// ============================================================
const headerJsPath = path.join(BASE, 'src/ui/layouts/header.js');
let headerJs = fs.readFileSync(headerJsPath, 'utf8');

// A) Agregar el botón de tema dentro de <nav id="mainNav">
headerJs = headerJs.replace(
  /<a class="nav-link" data-nav="ranking"><span>🏆<\/span> Top<\/a>/,
  '<a class="nav-link" data-nav="ranking"><span>🏆</span> Top</a>' +
  // Este es el botón exclusivo para móvil
  '<button class="nav-link theme-toggle-mobile" id="themeToggleMobile" style="display:none;">' +
    '<span class="nav-icon theme-icon-mobile">🌙</span> ' +
    '<span class="theme-text-mobile">Modo Oscuro</span>' +
  '</button>'
);

// B) Asignar el evento click al nuevo botón
headerJs = headerJs.replace(
  /\$\('#themeToggle'\)\.addEventListener\('click', toggleTheme\);/,
  "$('#themeToggle').addEventListener('click', toggleTheme);\n" +
  "  const mobileThemeBtn = $('#themeToggleMobile');\n" +
  "  if (mobileThemeBtn) mobileThemeBtn.addEventListener('click', toggleTheme);"
);

// C) Actualizar la función toggleTheme para que actualice AMBOS botones (escritorio y móvil)
const oldToggle = /export function toggleTheme\(\) \{[\s\S]*?\}/;
const newToggle = `export function toggleTheme() {
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
}`;

headerJs = headerJs.replace(oldToggle, newToggle);

// D) Inicializar el texto correcto del botón móvil al cargar la página
const initTheme = `
  // Inicializar iconos
  const t = document.documentElement.getAttribute('data-theme');
  document.querySelector('.theme-icon').textContent = t === 'dark' ? '☀️' : '🌙';
  const mIcon = document.querySelector('.theme-icon-mobile');
  const mText = document.querySelector('.theme-text-mobile');
  if (mIcon) mIcon.textContent = t === 'dark' ? '☀️' : '🌙';
  if (mText) mText.textContent = t === 'dark' ? 'Modo Claro' : 'Modo Oscuro';
`;
headerJs = headerJs.replace(/const t = document\.documentElement\.getAttribute\('data-theme'\);\s*\$\('\.theme-icon'\)\.textContent = t === 'dark' \? '☀️' : '🌙';/, initTheme);

fs.writeFileSync(headerJsPath, headerJs, 'utf8');
console.log('  OK src/ui/layouts/header.js actualizado');

// ============================================================
// 2. ACTUALIZAR _HEADER.SCSS (Ocultar en escritorio, mostrar en móvil)
// ============================================================
const headerScssPath = path.join(BASE, 'src/styles/layouts/_header.scss');
let headerScss = fs.readFileSync(headerScssPath, 'utf8');

// A) Ocultar el botón móvil por defecto en escritorio
if (!headerScss.includes('.theme-toggle-mobile {')) {
  headerScss = headerScss.replace(
    /\.badge-notif \{/,
    `.theme-toggle-mobile {
  display: none !important;
}

.badge-notif {`
  );
}

// B) En la Media Query móvil, ocultar el original y mostrar el nuevo
const mobileMedia = /\.hamburger \{ display: flex; \}\s*\}/;
const newMobileMedia = `.hamburger { display: flex; }
  
  /* Intercambiar botones de tema */
  #themeToggle { display: none !important; }
  .theme-toggle-mobile {
    display: flex !important;
    margin-top: 8px;
    border-top: 1px solid var(--gray-200);
    border-radius: 0;
    padding-top: 16px;
  }
}`;
headerScss = headerScss.replace(mobileMedia, newMobileMedia);

fs.writeFileSync(headerScssPath, headerScss, 'utf8');
console.log('  OK src/styles/layouts/_header.scss actualizado');

console.log('\n✅ Ajuste completado\n');
console.log('📋 Ejecuta: npm run dev\n');
console.log('En móvil ahora verás:');
console.log('   • El sol/luna desaparece de la barra superior.');
console.log('   • Al abrir el menú (☰), aparece la opción "Modo Oscuro" al final.');
console.log('   • El botón cambia de texto a "Modo Claro" cuando está activo.\n');