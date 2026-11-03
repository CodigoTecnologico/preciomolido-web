import { api } from '@/api/client.js';
import { ENDPOINTS } from '@/api/endpoints.js';
import { setState } from '@/state/store.js';

export async function login(email, password) {
  const d = await api.post(ENDPOINTS.login, { email, password });
  localStorage.setItem('token', d.token);
  setState({ currentUser: d.user });
  return d.user;
}

export async function registro(nombre, email, password, tipo, estado) {
  const d = await api.post(ENDPOINTS.registro, { nombre, email, password, tipo, estado });
  localStorage.setItem('token', d.token);
  setState({ currentUser: d.user });
  return d.user;
}

export function logout() {
  localStorage.removeItem('token');
  setState({ currentUser: null, alertas: [], ofertas: [] });
}

export async function restoreSession() {
  const t = localStorage.getItem('token');
  if (!t) return null;
  try {
    const p = JSON.parse(atob(t.split('.')[1]));
    const user = { nombre: p.nombre, email: p.email, tipo: p.tipo || '', estado: p.estado || '' };
    setState({ currentUser: user });
    return user;
  } catch { localStorage.removeItem('token'); return null; }
}