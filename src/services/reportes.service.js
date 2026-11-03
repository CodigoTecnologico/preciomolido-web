import { api } from '@/api/client.js';
import { ENDPOINTS } from '@/api/endpoints.js';
import { setState } from '@/state/store.js';

export async function fetchMateriales() {
  const materiales = await api.get(ENDPOINTS.materiales);
  setState({ materiales });
  return materiales;
}
export async function fetchReportes() {
  const reportes = await api.get(ENDPOINTS.reportes);
  setState({ reportes });
  return reportes;
}
export async function crearReporte(p) {
  const r = await api.post(ENDPOINTS.reportes, p);
  await fetchReportes();
  return r;
}