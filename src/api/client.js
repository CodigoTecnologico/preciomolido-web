function headers() {
  const h = { 'Content-Type': 'application/json' };
  const t = localStorage.getItem('token');
  const a = localStorage.getItem('adminKey');
  if (t) h['Authorization'] = `Bearer ${t}`;
  if (a) h['x-admin-key']   = a;
  return h;
}

export async function apiFetch(url, opts = {}) {
  const res = await fetch(url, { headers: headers(), ...opts });
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

export const api = {
  get:    (u)       => apiFetch(u),
  post:   (u, b)    => apiFetch(u, { method: 'POST',   body: JSON.stringify(b) }),
  put:    (u, b)    => apiFetch(u, { method: 'PUT',    body: JSON.stringify(b) }),
  delete: (u)       => apiFetch(u, { method: 'DELETE' }),
};