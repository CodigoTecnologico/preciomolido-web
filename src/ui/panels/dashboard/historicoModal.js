import { Chart, registerables } from 'chart.js';
import { getState } from '@/state/store.js';
import { openModal } from '@/ui/components/modal.js';
import { formatMonth } from '@/utils/format.js';

Chart.register(...registerables);

export function abrirHistorico(materialNombre, estado) {
  const { reportes, materiales } = getState();
  const ids = materiales.filter(m => m.material === materialNombre).map(m => m.id);
  const hist = reportes.filter(r => ids.includes(r.material_id) && r.estado === estado);
  const node = openModal(`
    <h2>Histórico: ${materialNombre} en ${estado}</h2>
    <div class="chart-container"><canvas id="chartHistorico"></canvas></div>
    <p class="transparency-note">Datos reales basados en reportes históricos.</p>
  `, { wide: true });
  if (!hist.length) {
    node.querySelector('.chart-container').innerHTML =
      '<p style="text-align:center;padding:40px;color:var(--gray-400);">Sin datos históricos.</p>';
    return;
  }
  const g = {};
  hist.forEach(r => {
    const mes = r.fecha.substring(0, 7);
    g[mes] = g[mes] || { spv: 0, sv: 0 };
    const v = r.volumen_ton || 1;
    g[mes].spv += r.precio_kg * v;
    g[mes].sv  += v;
  });
  const meses = Object.keys(g).sort();
  const labels = meses.map(formatMonth);
  const data   = meses.map(m => g[m].spv / g[m].sv);
  new Chart(node.querySelector('#chartHistorico'), {
    type: 'line',
    data: { labels, datasets: [{
      data, borderColor: '#1a56db', backgroundColor: 'rgba(26,86,219,0.1)',
      fill: true, tension: 0.4, pointRadius: 5,
    }]},
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: false, title: { display: true, text: 'MXN/kg' } } },
    },
  });
}
