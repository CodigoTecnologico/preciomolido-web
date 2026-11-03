import { showToast } from './toast.js';

let banner = null;

export function initOfflineDetection() {
  const update = () => {
    if (navigator.onLine) {
      hideBanner();
    } else {
      showBanner();
    }
  };

  window.addEventListener('online', () => {
    hideBanner();
    showToast('✅ Conexión restaurada', 'success');
  });
  window.addEventListener('offline', () => {
    showBanner();
    showToast('⚠️ Sin conexión a internet', 'warning');
  });

  update();
}

function showBanner() {
  if (banner) return;
  banner = document.createElement('div');
  banner.className = 'offline-banner';
  banner.innerHTML =
    '<span class="offline-icon">⚠️</span>' +
    '<span>Sin conexión a internet. Algunos datos pueden no estar actualizados.</span>';
  document.body.appendChild(banner);
  document.body.classList.add('is-offline');
}

function hideBanner() {
  if (banner) {
    banner.remove();
    banner = null;
  }
  document.body.classList.remove('is-offline');
}
