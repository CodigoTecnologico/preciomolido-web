import { getState } from '@/state/store.js';
import { $ } from '@/utils/dom.js';

export function renderRanking() {
  const { reportes } = getState();
  const lim = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
  const c = {};
  reportes.filter(r => r.fecha >= lim && r.verificado === true)
    .forEach(r => { const a = (r.usuario || 'A')[0].toUpperCase() + '****'; c[a] = (c[a] || 0) + 1; });
  const top = Object.entries(c).sort((a,b) => b[1]-a[1]).slice(0,5);
  const insig = ['🥇','🥈','🥉','⭐','⭐'];
  const cls = ['gold','silver','bronze','',''];
  $('#panel-ranking').innerHTML = `
    <div class="panel-header">
      <h2>🏆 Top Acopiadores</h2>
      <p class="subtitle">Usuarios que más contribuyen con reportes verificados.</p>
    </div>
    <div class="ranking-list">
      ${top.length === 0
        ? '<p style="text-align:center;color:var(--gray-400);padding:40px;">Sin reportes verificados este mes.</p>'
        : top.map(([n, cnt], i) => `
          <div class="ranking-item">
            <div class="ranking-pos ${cls[i]}">${insig[i]}</div>
            <div class="ranking-info">
              <div class="ranking-nombre">${n}</div>
              <div class="ranking-estado">Acopiador verificado</div>
            </div>
            <div class="ranking-reportes">${cnt} reportes</div>
          </div>`).join('')}
    </div>
    <p class="transparency-note">Basado en reportes de los últimos 30 días.</p>
  `;
}
