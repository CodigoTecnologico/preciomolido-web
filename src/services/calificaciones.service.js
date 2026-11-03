import { api } from '@/api/client.js';
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
}