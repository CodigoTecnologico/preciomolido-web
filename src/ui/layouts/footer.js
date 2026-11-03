import { $ } from '@/utils/dom.js';
import { openNewsletterModal } from '@/modals/newsletter.modal.js';
import { openAdmin } from '@/ui/panels/admin/panel.js';

export function initFooter() {
  $('#footer').innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div class="footer-col">
          <h4>PrecioMolido.mx</h4>
          <p>Referencia de precios de plástico molido en México.</p>
        </div>
        <div class="footer-col">
          <h4>Secciones</h4>
          <a href="#" data-nav="dashboard">Precios</a>
          <a href="#" data-nav="reportar">Reportar</a>
          <a href="#" data-nav="marketplace">Marketplace</a>
          <a href="#" data-nav="alertas">Alertas</a>
        </div>
        <div class="footer-col">
          <h4>Contacto</h4>
          <a href="mailto:ventas@preciomolido.mx">ventas@preciomolido.mx</a>
          <a href="#" id="footerNewsletter">Newsletter Semanal</a>
        </div>
      </div>
      <p class="footer-disclaimer">
        Los precios mostrados son reportes de usuarios y solo tienen fines informativos.
        No constituyen una cotización vinculante.
        <span style="cursor:pointer; color:var(--primary);" id="adminTrigger">© 2024 PrecioMolido.mx</span>
      </p>
    </div>
  `;
  $('#footerNewsletter').addEventListener('click', (e) => { e.preventDefault(); openNewsletterModal(); });
  $('#adminTrigger').addEventListener('click', openAdmin);
}