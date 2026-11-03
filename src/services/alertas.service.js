import { api } from '@/api/client.js';
import { ENDPOINTS } from '@/api/endpoints.js';
import { setState } from '@/state/store.js';

export async function fetchAlertas() {
  const alertas = await api.get(ENDPOINTS.alertas);
  setState({ alertas });
  return alertas;
}
export const crearAlerta    = (a)  => api.post(ENDPOINTS.alertas, a);
export const eliminarAlerta = (id) => api.delete(ENDPOINTS.alerta(id));