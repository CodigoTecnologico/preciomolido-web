import fs from 'node:fs';
import path from 'node:path';
const BASE = process.cwd();

console.log('\n🛠️ Forzando fondo sólido en el menú móvil...\n');

const headerPath = path.join(BASE, 'src/styles/layouts/_header.scss');
let header = fs.readFileSync(headerPath, 'utf8');

// Reemplazamos el bloque de la media query de 900px
const oldMedia = /@media \(max-width: 900px\) \{[\s\S]*?\.hamburger \{ display: flex; \}\s*\}/;

const newMedia = `@media (max-width: 900px) {
  .nav {
    position: fixed;
    top: 0;
    right: -100%;
    width: 280px;
    height: 100vh;
    height: 100dvh;
    background-color: var(--gray-900) !important; /* Fondo 100% sólido */
    flex-direction: column;
    padding: 80px 20px 20px;
    gap: 8px;
    z-index: 9999; /* Por encima de todo */
    transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: -5px 0 25px rgba(0,0,0,.4);
    overflow-y: auto;
  }
  
  /* En modo claro usamos el fondo blanco */
  [data-theme="light"] .nav {
    background-color: #ffffff !important;
  }
  
  .nav.open { right: 0; }
  
  .nav-link {
    width: 100%;
    padding: 14px 16px;
    font-size: 1rem;
    border-radius: var(--radius);
    justify-content: flex-start;
    color: var(--gray-300); /* Texto claro en fondo oscuro */
  }
  
  .nav-link:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--white);
  }
  
  .nav-link.active {
    background: var(--primary);
    color: #ffffff;
  }
  
  .nav-link .nav-icon {
    font-size: 1.2rem;
    margin-right: 8px;
  }
  
  .hamburger { display: flex; z-index: 10000; }
  
  /* Overlay oscuro pero sin blur para evitar problemas de renderizado */
  .nav-overlay {
    z-index: 9998;
    background: rgba(0,0,0,.6);
    backdrop-filter: none !important; 
  }
}`;

header = header.replace(oldMedia, newMedia);
fs.writeFileSync(headerPath, header, 'utf8');
console.log('  OK src/styles/layouts/_header.scss actualizado');

console.log('\n✅ Menú móvil corregido\n');
console.log('📋 Ejecuta: npm run dev\n');
console.log('El menú ahora tendrá un fondo sólido oscuro y los textos serán blancos/grises legibles.\n');