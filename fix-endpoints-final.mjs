import fs from 'node:fs';
import path from 'node:path';
const BASE = process.cwd();

console.log('\n🛠️ Reparando Endpoints y Calificaciones...\n');

// 1. Reescribir endpoints.js completo (usando template literals correctos)
const endpointsCode = `const B = \`\${window.location.origin}/api\`;
export const ENDPOINTS = {
  login: \`\${B}/login\`, registro: \`\${B}/registro\`,
  reportes: \`\${B}/reportes\`, materiales: \`\${B}/materiales\`,
  marketplace: \`\${B}/marketplace\`, alertas: \`\${B}/alertas\`,
  calificaciones: \`\${B}/calificaciones\`,
  calificacionesTodas: \`\${B}/calificaciones/todas\`,
  reportesVendedor: \`\${B}/reportes-vendedor\`,
  sugerenciasMateriales: \`\${B}/sugerencias-materiales\`,
  ofertas: \`\${B}/ofertas\`,
  ofertasRecibidas: \`\${B}/ofertas/recibidas\`,
  ofertasEnviadas: \`\${B}/ofertas/enviadas\`,
  ofertaAceptar:  (id) => \`\${B}/ofertas/\${id}/aceptar\`,
  ofertaRechazar: (id) => \`\${B}/ofertas/\${id}/rechazar\`,
  alerta:      (id) => \`\${B}/alertas/\${id}\`,
  publicacion: (id) => \`\${B}/marketplace/\${id}\`,
  upload: \`\${B}/upload\`,
  adminUsuarios:    \`\${B}/admin/usuarios\`,
  adminReportes:    \`\${B}/admin/reportes\`,
  adminReporte:     (id) => \`\${B}/admin/reportes/\${id}\`,
  adminMarketplace: \`\${B}/admin/marketplace\`,
  adminPublicacion: (id) => \`\${B}/admin/marketplace/\${id}\`,
  sugerenciaAprobar:  (id) => \`\${B}/sugerencias-materiales/\${id}/aprobar\`,
  sugerenciaRechazar: (id) => \`\${B}/sugerencias-materiales/\${id}/rechazar\`,
};`;

fs.writeFileSync(path.join(BASE, 'src/api/endpoints.js'), endpointsCode, 'utf8');
console.log('  OK src/api/endpoints.js');

// 2. Reescribir calificaciones.service.js
const calificacionesServiceCode = `import { api } from '@/api/client.js';
import { ENDPOINTS } from '@/api/endpoints.js';
import { setState } from '@/state/store.js';

export async function fetchCalificaciones() {
  const calificaciones = await api.get(ENDPOINTS.calificacionesTodas).catch(() => []);
  setState({ calificaciones });
  return calificaciones;
}

export const crearCalificacion = (c) => api.post(ENDPOINTS.calificaciones, c);

export function promedioCalificacion(email, calificaciones) {
  const c = calificaciones.filter(x => x.to_email === email);
  return c.length ? c.reduce((s, x) => s + x.rating, 0) / c.length : 0;
}`;

fs.writeFileSync(path.join(BASE, 'src/services/calificaciones.service.js'), calificacionesServiceCode, 'utf8');
console.log('  OK src/services/calificaciones.service.js');

console.log('\n✅ Archivos reparados correctamente\n');