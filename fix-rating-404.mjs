import fs from 'node:fs';
import path from 'node:path';
const BASE = process.cwd();

console.log('\n🛠️ Corrigiendo error 404 al calificar...\n');

// 1. Corregir el archivo de Endpoints
const endpointsPath = path.join(BASE, 'src/api/endpoints.js');
let endpoints = fs.readFileSync(endpointsPath, 'utf8');

// Reemplazamos la línea que tenía el error
endpoints = endpoints.replace(
  /calificaciones: B \+ '\/calificaciones\/todas',/,
  "calificaciones: B + '/calificaciones',\n  calificacionesTodas: B + '/calificaciones/todas',"
);

fs.writeFileSync(endpointsPath, endpoints, 'utf8');
console.log('  OK src/api/endpoints.js actualizado');

// 2. Corregir el servicio para que use la ruta correcta al leer y al escribir
const servicePath = path.join(BASE, 'src/services/calificaciones.service.js');
let service = fs.readFileSync(servicePath, 'utf8');

// Cambiamos la lectura para que use la ruta de "todas"
service = service.replace(
  /const calificaciones = await api\.get\(ENDPOINTS\.calificaciones\)\.catch\(\(\) => \[\]\);/,
  "const calificaciones = await api.get(ENDPOINTS.calificacionesTodas).catch(() => []);"
);

// El POST (crearCalificacion) ya usaba ENDPOINTS.calificaciones, así que ahora apuntará a la ruta correcta automáticamente.

fs.writeFileSync(servicePath, service, 'utf8');
console.log('  OK src/services/calificaciones.service.js actualizado');

console.log('\n✅ Error 404 solucionado\n');
console.log('📋 Para aplicar los cambios:');
console.log('   1. Recarga la página en tu navegador (Ctrl + Shift + R).');
console.log('   2. Vuelve a intentar calificar a un vendedor.\n');