import { api } from '@/api/client.js';
import { ENDPOINTS } from '@/api/endpoints.js';
import { setState } from '@/state/store.js';

export async function fetchSugerencias() {
  const sugerenciasMateriales = await api.get(ENDPOINTS.sugerenciasMateriales).catch(() => []);
  setState({ sugerenciasMateriales });
  return sugerenciasMateriales;
}
export const crearSugerencia = (s) => api.post(ENDPOINTS.sugerenciasMateriales, s);
export const aprobarSugerencia  = (id) => api.put(ENDPOINTS.sugerenciaAprobar(id));
export const rechazarSugerencia = (id) => api.put(ENDPOINTS.sugerenciaRechazar(id));