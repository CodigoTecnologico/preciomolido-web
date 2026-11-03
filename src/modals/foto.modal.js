import { openModal } from '@/ui/components/modal.js';
import { showToast } from '@/ui/components/toast.js';

export function openFotoModal(src, alt) {
  alt = alt || 'Foto del material';
  const node = openModal(
    '<div class="foto-viewer">' +
      '<div class="foto-toolbar">' +
        '<button class="foto-btn" data-action="zoom-out" title="Reducir">−</button>' +
        '<span class="foto-zoom-label" id="fotoZoom">100%</span>' +
        '<button class="foto-btn" data-action="zoom-in" title="Aumentar">+</button>' +
        '<button class="foto-btn" data-action="reset" title="Reiniciar">⟲</button>' +
        '<a class="foto-btn" href="' + src + '" target="_blank" rel="noopener" title="Abrir en nueva pestana">↗</a>' +
        '<button class="foto-btn" data-action="copy" title="Copiar URL">📋</button>' +
      '</div>' +
      '<div class="foto-canvas" id="fotoCanvas">' +
        '<img src="' + src + '" alt="' + alt + '" id="fotoImg" draggable="false">' +
      '</div>' +
      '<p class="foto-hint">Usa los botones o la rueda del mouse para hacer zoom</p>' +
    '</div>',
    { wide: true }
  );

  const canvas = node.querySelector('#fotoCanvas');
  const img = node.querySelector('#fotoImg');
  const zoomLabel = node.querySelector('#fotoZoom');

  let zoom = 1;
  let posX = 0;
  let posY = 0;
  let dragging = false;
  let startX = 0, startY = 0;

  function aplicar() {
    img.style.transform = 'translate(' + posX + 'px,' + posY + 'px) scale(' + zoom + ')';
    zoomLabel.textContent = Math.round(zoom * 100) + '%';
  }

  function setZoom(nuevo) {
    zoom = Math.max(0.25, Math.min(5, nuevo));
    aplicar();
  }

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    setZoom(zoom + (e.deltaY < 0 ? 0.15 : -0.15));
  }, { passive: false });

  canvas.addEventListener('mousedown', (e) => {
    if (zoom <= 1) return;
    dragging = true;
    startX = e.clientX - posX;
    startY = e.clientY - posY;
    canvas.style.cursor = 'grabbing';
  });
  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    posX = e.clientX - startX;
    posY = e.clientY - startY;
    aplicar();
  });
  document.addEventListener('mouseup', () => {
    dragging = false;
    canvas.style.cursor = 'grab';
  });

  node.querySelector('[data-action="zoom-in"]').addEventListener('click', () => setZoom(zoom + 0.25));
  node.querySelector('[data-action="zoom-out"]').addEventListener('click', () => setZoom(zoom - 0.25));
  node.querySelector('[data-action="reset"]').addEventListener('click', () => {
    zoom = 1; posX = 0; posY = 0; aplicar();
  });
  node.querySelector('[data-action="copy"]').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(src);
      showToast('URL copiada al portapapeles', 'success');
    } catch { showToast('No se pudo copiar', 'error'); }
  });

  // Doble click = zoom toggle
  img.addEventListener('dblclick', () => {
    if (zoom === 1) setZoom(2);
    else { zoom = 1; posX = 0; posY = 0; aplicar(); }
  });

  // ESC para cerrar
  const onKey = (e) => {
    if (e.key === 'Escape') { node.remove(); document.removeEventListener('keydown', onKey); }
    if (e.key === '+' || e.key === '=') setZoom(zoom + 0.25);
    if (e.key === '-') setZoom(zoom - 0.25);
    if (e.key === '0') { zoom = 1; posX = 0; posY = 0; aplicar(); }
  };
  document.addEventListener('keydown', onKey);

  aplicar();
}
