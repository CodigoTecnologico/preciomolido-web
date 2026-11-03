import { $ } from '@/utils/dom.js';

const ICONS = { info:'ℹ️', success:'✅', error:'❌', warning:'⚠️' };

export function showToast(mensaje, tipo = 'info') {
  const c = $('#toastContainer');
  if (!c) return;
  const t = document.createElement('div');
  t.className = `toast ${tipo}`;
  t.innerHTML = `<span class="toast-icon">${ICONS[tipo] ?? ICONS.info}</span>
    <span>${mensaje}</span><button class="toast-close">×</button>`;
  c.appendChild(t);
  t.querySelector('.toast-close').addEventListener('click', () => t.remove());
  setTimeout(() => t.remove(), 4000);
}