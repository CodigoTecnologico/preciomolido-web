/** Skeleton para una tarjeta de precio */
export function createSkeletonCard() {
  return '<div class="skeleton-card">' +
    '<div class="skeleton skeleton-title"></div>' +
    '<div class="skeleton skeleton-line"></div>' +
    '<div class="skeleton skeleton-line short"></div>' +
    '<div class="skeleton skeleton-price"></div>' +
    '<div class="skeleton skeleton-line"></div>' +
    '<div class="skeleton skeleton-line short"></div>' +
  '</div>';
}

/** Skeleton para una fila de tabla */
export function createSkeletonRow(cols) {
  cols = cols || 11;
  let cells = '';
  for (let i = 0; i < cols; i++) {
    cells += '<td><div class="skeleton skeleton-line"></div></td>';
  }
  return '<tr>' + cells + '</tr>';
}

/** Muestra N skeletons en un contenedor grid */
export function showSkeletons(container, count) {
  if (!container) return;
  count = count || 6;
  let html = '';
  for (let i = 0; i < count; i++) html += createSkeletonCard();
  container.innerHTML = html;
}

/** Muestra N filas de skeleton en un tbody */
export function showTableSkeletons(tbody, rows, cols) {
  if (!tbody) return;
  rows = rows || 5;
  let html = '';
  for (let i = 0; i < rows; i++) html += createSkeletonRow(cols);
  tbody.innerHTML = html;
}

/** Skeleton para publicaciones de marketplace */
export function createMkSkeleton() {
  return '<div class="skeleton-card">' +
    '<div class="skeleton skeleton-img"></div>' +
    '<div class="skeleton skeleton-title"></div>' +
    '<div class="skeleton skeleton-line"></div>' +
    '<div class="skeleton skeleton-line short"></div>' +
    '<div class="skeleton skeleton-price"></div>' +
  '</div>';
}

export function showMkSkeletons(container, count) {
  if (!container) return;
  count = count || 6;
  let html = '';
  for (let i = 0; i < count; i++) html += createMkSkeleton();
  container.innerHTML = html;
}
