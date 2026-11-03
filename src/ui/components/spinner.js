export function createSpinner(size) {
  size = size || 'md';
  return '<span class="spinner spinner-' + size + '"></span>';
}

/** Pone un botón en estado "cargando" y devuelve función para restaurarlo */
export function showButtonLoading(btn, text) {
  if (!btn) return () => {};
  const original = btn.innerHTML;
  const wasDisabled = btn.disabled;
  btn.disabled = true;
  btn.classList.add('btn-loading');
  btn.innerHTML = createSpinner('sm') + ' ' + (text || 'Cargando...');
  return () => {
    btn.disabled = wasDisabled;
    btn.classList.remove('btn-loading');
    btn.innerHTML = original;
  };
}

/** Overlay con spinner para secciones completas */
export function showSectionLoading(container, text) {
  if (!container) return;
  container.dataset.originalContent = container.innerHTML;
  container.innerHTML =
    '<div class="section-loading">' +
      '<div class="spinner spinner-lg"></div>' +
      '<p>' + (text || 'Cargando...') + '</p>' +
    '</div>';
}

export function hideSectionLoading(container) {
  if (!container || !container.dataset.originalContent) return;
  container.innerHTML = container.dataset.originalContent;
  delete container.dataset.originalContent;
}
