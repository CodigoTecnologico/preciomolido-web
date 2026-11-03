import fs from 'node:fs';
import path from 'node:path';
const BASE = process.cwd();

console.log('\n🌙 Ajustando contraste del Disclaimer en Modo Oscuro...\n');

const mkCssPath = path.join(BASE, 'src/styles/pages/_marketplace.scss');
let mkCss = fs.readFileSync(mkCssPath, 'utf8');

// Verificamos si ya lo agregamos para no duplicar
if (!mkCss.includes('/* Dark mode disclaimer fix */')) {
  mkCss += `

/* Dark mode disclaimer fix */
[data-theme="dark"] .disclaimer-box {
  background-color: rgba(180, 83, 9, 0.15) !important;
  border: 1px solid rgba(180, 83, 9, 0.4) !important;
  color: #fcd34d !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
[data-theme="dark"] .disclaimer-box strong {
  color: #fbbf24 !important;
  font-weight: 800;
}
[data-theme="dark"] .disclaimer-box li {
  color: #fde68a !important;
}
[data-theme="dark"] .disclaimer-box ul {
  margin-top: 8px;
}
`;
  fs.writeFileSync(mkCssPath, mkCss, 'utf8');
  console.log('  OK src/styles/pages/_marketplace.scss actualizado');
} else {
  console.log('  • El fix ya estaba aplicado');
}

console.log('\n✅ Ajuste de contraste aplicado\n');
console.log('📋 Ejecuta: npm run dev\n');
console.log('En modo oscuro, el recuadro naranja ahora será:');
console.log('   • Fondo semi-transparente oscuro (glassmorphism)');
console.log('   • Borde ámbar sutil');
console.log('   • Texto y viñetas de color amarillo brillante para excelente lectura\n');