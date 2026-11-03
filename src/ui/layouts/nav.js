import { $$, $ } from '@/utils/dom.js';
import { renderAds } from '@/services/ads.service.js';
import { renderDashboard }   from '@/ui/panels/dashboard/panel.js';
import { renderReportar }    from '@/ui/panels/reportar/panel.js';
import { renderMarketplace } from '@/ui/panels/marketplace/panel.js';
import { renderRanking }     from '@/ui/panels/ranking/panel.js';
import { renderAlertas }     from '@/ui/panels/alertas/panel.js';
import { renderCuenta }      from '@/ui/panels/micuenta/panel.js';

const RENDERERS = {
  dashboard:   renderDashboard,
  reportar:    renderReportar,
  marketplace: renderMarketplace,
  ranking:     renderRanking,
  alertas:     renderAlertas,
  micuenta:    renderCuenta,
};

export function initNav() {
  // Delegated nav desde el header
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-nav]');
    if (!link) return;
    e.preventDefault();
    const panel = link.dataset.nav;
    goToPanel(panel);
    closeMobileMenu();
  });

  // Custom event
  document.addEventListener('nav', (e) => goToPanel(e.detail));

  // Hamburger
  const btn = $('#hamburgerBtn');
  const nav = $('#mainNav');
  const overlay = $('#navOverlay');
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = nav.classList.toggle('open');
    btn.classList.toggle('open', open);
    overlay.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  overlay.addEventListener('click', closeMobileMenu);
}

export function closeMobileMenu() {
  $('#mainNav').classList.remove('open');
  $('#hamburgerBtn').classList.remove('open');
  $('#navOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

export function goToPanel(panel) {
  $$('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.nav === panel));
  $$('.panel').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(`panel-${panel}`);
  if (target) target.classList.add('active');
  RENDERERS[panel]?.();
  renderAds(panel);
}