export function confirmModal(mensaje) {
  return new Promise(resolve => {
    const bg = document.createElement('div');
    bg.className = 'confirm-modal-bg';
    bg.innerHTML = `
      <div class="confirm-modal">
        <p>${mensaje}</p>
        <div class="confirm-btns">
          <button class="btn btn-primary" data-act="si">Sí</button>
          <button class="btn btn-ghost"   data-act="no">No</button>
        </div>
      </div>`;
    document.body.appendChild(bg);
    const cerrar = v => { bg.remove(); resolve(v); };
    bg.querySelector('[data-act="si"]').onclick = () => cerrar(true);
    bg.querySelector('[data-act="no"]').onclick = () => cerrar(false);
    bg.addEventListener('click', e => { if (e.target === bg) cerrar(false); });
  });
}