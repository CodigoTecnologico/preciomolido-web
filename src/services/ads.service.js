const KEY = 'precioMolido_anuncios';

const DEFAULT_CONFIG = {
  hero:    { secciones:['dashboard'], img:'', link:'', alt:'Anuncio hero' },
  inline:  { secciones:['dashboard'], img:'', link:'', alt:'Anuncio inline' },
  report:  { secciones:['reportar'],  img:'', link:'', alt:'Anuncio report' },
  sidebar: { secciones:['dashboard','ranking','alertas'], img:'', link:'', alt:'Anuncio sidebar' },
  footer:  { secciones:['dashboard','reportar','marketplace','ranking','alertas','micuenta'], img:'', link:'', alt:'Anuncio footer' },
};

let CONFIG = JSON.parse(localStorage.getItem(KEY) || 'null') || DEFAULT_CONFIG;

export function getAdsConfig() { return CONFIG; }

export function setAdConfig(tipo, patch) {
  CONFIG[tipo] = { ...CONFIG[tipo], ...patch };
  localStorage.setItem(KEY, JSON.stringify(CONFIG));
  renderAds(tipo);
}

export function renderAds(panel) {
  ['hero','inline','report','sidebar','footer'].forEach(prefix => {
    const img   = document.getElementById(`ad-${prefix}-img`);
    const link  = document.getElementById(`ad-${prefix}-link`);
    const ph    = document.getElementById(`ad-${prefix}-placeholder`);
    if (!img || !link || !ph) return;
    const c = CONFIG[prefix] || {};
    const activo = c.secciones?.includes(panel) && c.img;
    img.src = activo ? c.img : '';
    img.alt = c.alt || 'Anuncio';
    img.classList.toggle('visible', !!activo);
    link.href = activo ? (c.link || '#') : '#';
    ph.style.display = activo ? 'none' : 'block';
  });
}

export function renderAllAds(panel = 'dashboard') { renderAds(panel); }