import '@/styles/main.scss';

import { io } from 'socket.io-client';
import { api } from '@/api/client.js';
import { ENDPOINTS } from '@/api/endpoints.js';
import { setState, getState } from '@/state/store.js';

import { restoreSession } from '@/services/auth.service.js';
import { fetchMateriales, fetchReportes } from '@/services/reportes.service.js';
import { fetchMarketplace } from '@/services/marketplace.service.js';
import { fetchAlertas } from '@/services/alertas.service.js';
import { fetchOfertas } from '@/services/ofertas.service.js';
import { fetchCalificaciones } from '@/services/calificaciones.service.js';
import { fetchSugerencias } from '@/services/sugerencias.service.js';
import { renderAllAds } from '@/services/ads.service.js';

import { initHeader, updateUserUI } from '@/ui/layouts/header.js';
import { initNav } from '@/ui/layouts/nav.js';
import { initFooter } from '@/ui/layouts/footer.js';
import { showToast } from '@/ui/components/toast.js';
import { initOfflineDetection } from '@/ui/components/offline.js';

async function bootstrap() {
  initOfflineDetection();
  // Tema
  document.documentElement.setAttribute('data-theme', getState().theme);

  // Sesión
  await restoreSession();

  // Datos base en paralelo
  try {
    await Promise.all([
      fetchMateriales(),
      fetchReportes(),
      fetchMarketplace(),
      fetchCalificaciones(),
      fetchSugerencias(),
    ]);
    if (getState().currentUser) {
      await Promise.all([fetchAlertas(), fetchOfertas()]);
    }
  } catch (err) {
    showToast('Error al cargar datos del servidor', 'error');
    console.error(err);
  }

  // UI
  initHeader();
  initNav();
  initFooter();
  updateUserUI();
  renderAllAds('dashboard');

  // Socket.io
  try {
    const socket = io();
    socket.on('nuevo_reporte', async () => {
      await fetchReportes();
      if (getState().activePanel === 'dashboard') {
        const { renderDashboard } = await import('@/ui/panels/dashboard/panel.js');
        renderDashboard();
      }
    });
    socket.on('nueva_publicacion', async () => {
      await fetchMarketplace();
      if (getState().activePanel === 'marketplace') {
        const { renderMarketplace } = await import('@/ui/panels/marketplace/panel.js');
        renderMarketplace();
      }
    });
  } catch (e) { console.warn('Socket no disponible'); }
}

document.addEventListener('DOMContentLoaded', bootstrap);