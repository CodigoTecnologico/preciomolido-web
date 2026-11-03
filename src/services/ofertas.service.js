import { api } from '@/api/client.js';
import { ENDPOINTS } from '@/api/endpoints.js';
import { setState } from '@/state/store.js';

export async function fetchOfertas() {
  const [rec, env] = await Promise.all([
    api.get(ENDPOINTS.ofertasRecibidas).catch(() => []),
    api.get(ENDPOINTS.ofertasEnviadas).catch(() => []),
  ]);
  const ofertas = [...rec, ...env];
  setState({ ofertas });
  return ofertas;
}
export const crearOferta    = (o)  => api.post(ENDPOINTS.ofertas, o);
export const aceptarOferta  = (id) => api.put(ENDPOINTS.ofertaAceptar(id));
export const rechazarOferta = (id) => api.put(ENDPOINTS.ofertaRechazar(id));