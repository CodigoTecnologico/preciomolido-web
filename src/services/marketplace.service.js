import { api } from '@/api/client.js';
import { ENDPOINTS } from '@/api/endpoints.js';
import { setState } from '@/state/store.js';

export async function fetchMarketplace() {
  const publicacionesMK = await api.get(ENDPOINTS.marketplace);
  setState({ publicacionesMK });
  return publicacionesMK;
}
export const crearPublicacion  = (p) => api.post(ENDPOINTS.marketplace, p);
export const actualizarPublicacion = (id, p) => api.put(ENDPOINTS.publicacion(id), p);
export const eliminarPublicacion  = (id)    => api.delete(ENDPOINTS.publicacion(id));