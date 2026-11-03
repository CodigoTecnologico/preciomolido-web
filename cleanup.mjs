import fs from 'node:fs';
import path from 'node:path';
const BASE = process.cwd();

console.log('\n🧹 Limpiando la carpeta raíz del proyecto...\n');

const backupDir = path.join(BASE, '_scripts_antiguos');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

// Archivos que queremos mover a la carpeta de respaldo
const filesToMove = [
  'fix-contacto.mjs', 'fix-dark-nav.mjs', 'fix-dashboard-final.mjs', 
  'fix-disclaimer-dark.mjs', 'fix-export-auth.mjs', 'fix-header-syntax.mjs', 
  'fix-header.mjs', 'fix-mixins.mjs', 'fix-mk-filters.mjs', 'fix-mk-mobile.mjs', 
  'fix-mobile-theme.mjs', 'fix-mobile.mjs', 'fix-nav-mobile.mjs', 'fix-scss.mjs',
  'setup-a2-loading.mjs', 'setup-bonus1.mjs', 'setup-bonus4.mjs', 
  'setup-more-data.mjs', 'setup-polish.mjs', 'setup3.mjs', 'setup3.ps1',
  'setup-server.mjs', 'setup-polish.mjs'
];

let movidos = 0;
filesToMove.forEach(file => {
  const filePath = path.join(BASE, file);
  if (fs.existsSync(filePath)) {
    fs.renameSync(filePath, path.join(backupDir, file));
    console.log('  ➜ Movido:', file);
    movidos++;
  }
});

console.log(`\n✅ Limpieza completada. Se movieron ${movidos} scripts a la carpeta "_scripts_antiguos".`);
console.log('📁 Tu carpeta raíz ahora está limpia y solo contiene los archivos vitales:');
console.log('   - index.html');
console.log('   - package.json');
console.log('   - vite.config.js');
console.log('   - src/');
console.log('   - server/');
console.log('\nPuedes borrar este archivo "cleanup.mjs" y la carpeta "_scripts_antiguos" cuando estés seguro de que todo funciona.\n');