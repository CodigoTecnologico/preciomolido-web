import { $ } from '@/utils/dom.js';

const root = () => $('#modalRoot');

export function openModal(html, { wide = false } = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'modal';
  wrap.innerHTML = `
    <div class="modal-content ${wide ? 'modal-wide' : ''}">
      <button class="modal-close" aria-label="Cerrar">×</button>
      ${html}
    </div>`;
  wrap.addEventListener('click', e => { if (e.target === wrap) closeModal(wrap); });
  wrap.querySelector('.modal-close').onclick = () => closeModal(wrap);
  root().appendChild(wrap);
  return wrap;
}

export function closeModal(node) {
  if (!node) return;
  node.remove();
}