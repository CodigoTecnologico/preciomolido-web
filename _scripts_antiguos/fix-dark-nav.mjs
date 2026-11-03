import fs from 'node:fs';
import path from 'node:path';
const BASE = process.cwd();

console.log('\n🌙 Corrigiendo colores del menú lateral...\n');

const headerPath = path.join(BASE, 'src/styles/layouts/_header.scss');
let header = fs.readFileSync(headerPath, 'utf8');

// Reemplazamos el bloque de la media query de 900px para usar las variables correctas
const oldMedia = /@media \(max-width: 900px\) \{[\s\S]*?\.hamburger \{ display: flex; z-index: 10000; \}/;

const newMedia = `@media (max-width: 900px) {
  .nav {
    position: fixed;
    top: 0;
    right: -100%;
    width: 280px;
    height: 100vh;
    height: 100dvh;
    background-color: var(--white) !important; /* Fondo adaptativo: claro en light, oscuro en dark */
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
    color: var(--gray-700); /* Texto oscuro en light, claro en dark */
  }
  
  .nav-link:hover {
    background: var(--gray-100);
    color: var(--gray-900);
  }
  
  .nav-link.active {
    background: var(--primary);
    color: #ffffff !important; /* Siempre blanco sobre azul */
  }
  
  .nav-link .nav-icon {
    font-size: 1.2rem;
    margin-right: 8px;
  }
  
  .hamburger { display: flex; z-index: 10000; }
  
  .nav-overlay {
    z-index: 9998;
    background: rgba(0,0,0,.6);
    backdrop-filter: none !important; 
  }
}`;

header = header.replace(oldMedia, newMedia);
fs.writeFileSync(headerPath, header, 'utf8');
console.log('  OK src/styles/layouts/_header.scss corregido');

console.log('\n✅ Menú arreglado\n');
console.log('📋 Ejecuta: npm run dev\n');
console.log('Ahora el menú heredará el color del tema:');
console.log('   • Modo Claro: Fondo blanco, texto oscuro');
console.log('   • Modo Oscuro: Fondo gris oscuro (como el header), texto claro\n');