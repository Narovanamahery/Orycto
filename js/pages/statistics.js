import { api } from '../api.js';

export function statisticsHTML() {
  return `
  <div class="page-header">
    <div>
      <h2 class="page-title">📊 Statistics</h2>
      <p class="page-sub">Farm performance &amp; analytics</p>
    </div>
  </div>

  <div class="stats-row" id="stat-kpis">
    ${[1,2,3,4].map(() => `
    <div class="stat-card">
      <div class="stat-icon">·</div>
      <div class="stat-label">Loading</div>
      <div class="stat-value">-</div>
    </div>`).join('')}
  </div>

  <div class="middle-row">
    <div class="card">
      <div class="card-header"><span>📈 Monthly Production (6 months)</span></div>
      <div id="stat-monthly" style="padding:8px 0">
        <p style="color:#A0A8A5;font-size:12px">Loading...</p>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><span>🐇 Population by Breed</span></div>
      <div id="stat-breeds" style="padding:8px 0">
        <p style="color:#A0A8A5;font-size:12px">Loading...</p>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><span>💰 Feed Costs by Category</span></div>
      <div id="stat-costs" style="padding:8px 0">
        <p style="color:#A0A8A5;font-size:12px">Loading...</p>
      </div>
    </div>
  </div>`;
}

export async function initStatistics() {
  let kpis, stats;

  try {
    [kpis, stats] = await Promise.all([
      api.dashboard.get(),
      api.dashboard.statistiques(),
    ]);
  } catch (err) {
    document.getElementById('stat-kpis').innerHTML = `
      <div style="grid-column:1/-1;padding:16px;background:rgba(231,76,60,.1);
        border:1px solid rgba(231,76,60,.3);border-radius:10px;color:#f08080;font-size:13px">
        Cannot reach API. Make sure the server is running.
      </div>`;
    return;
  }

  renderKpis(kpis.kpis);
  renderMonthly(stats.mensuel);
  renderBreeds(stats.races);
  renderCosts(stats.couts);
}

function renderKpis(k) {
  if (!k) return;
  const survivalRate = k.total_actifs > 0
    ? Math.round(((k.total_actifs - k.nb_malades) / k.total_actifs) * 100)
    : 0;

  document.getElementById('stat-kpis').innerHTML = `
    <div class="stat-card accent-green">
      <div class="stat-icon">📈</div>
      <div class="stat-label">Birth Rate</div>
      <div class="stat-value">85<span style="font-size:16px">%</span></div>
    </div>
    <div class="stat-card accent-green">
      <div class="stat-icon">💪</div>
      <div class="stat-label">Survival Rate</div>
      <div class="stat-value">${survivalRate}<span style="font-size:16px">%</span></div>
    </div>
    <div class="stat-card accent-gold">
      <div class="stat-icon">⚖️</div>
      <div class="stat-label">Avg. Litter Size</div>
      <div class="stat-value">${parseFloat(k.taille_portee_moy || 0).toFixed(1)}</div>
    </div>
    <div class="stat-card accent-green">
      <div class="stat-icon">🐇</div>
      <div class="stat-label">Active Rabbits</div>
      <div class="stat-value">${k.total_actifs}</div>
    </div>`;
}

function renderMonthly(rows = []) {
  if (!rows.length) {
    document.getElementById('stat-monthly').innerHTML =
      `<p style="color:#A0A8A5;font-size:12px">No data for the last 6 months</p>`;
    return;
  }
  const maxVal = Math.max(...rows.map(r => Math.max(r.naissances, r.deces, r.ventes, 1)));
  document.getElementById('stat-monthly').innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(${rows.length},1fr);gap:8px;align-items:end;height:120px">
      ${rows.map(r => `
      <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
        <div style="width:100%;display:flex;gap:2px;align-items:flex-end;height:80px">
          <div style="flex:1;background:#4ade80;border-radius:3px 3px 0 0;height:${Math.round((r.naissances/maxVal)*80)}px" title="Births: ${r.naissances}"></div>
          <div style="flex:1;background:#E74C3C;border-radius:3px 3px 0 0;height:${Math.round((r.deces/maxVal)*80)}px" title="Deaths: ${r.deces}"></div>
          <div style="flex:1;background:#D4B475;border-radius:3px 3px 0 0;height:${Math.round((r.ventes/maxVal)*80)}px" title="Sales: ${r.ventes}"></div>
        </div>
        <span style="font-size:10px;color:#A0A8A5">${r.mois}</span>
      </div>`).join('')}
    </div>
    <div style="display:flex;gap:16px;margin-top:10px;font-size:11px;color:#A0A8A5">
      <span><span style="display:inline-block;width:10px;height:10px;background:#4ade80;border-radius:2px;margin-right:4px"></span>Births</span>
      <span><span style="display:inline-block;width:10px;height:10px;background:#E74C3C;border-radius:2px;margin-right:4px"></span>Deaths</span>
      <span><span style="display:inline-block;width:10px;height:10px;background:#D4B475;border-radius:2px;margin-right:4px"></span>Sales</span>
    </div>`;
}

function renderBreeds(rows = []) {
  if (!rows.length) {
    document.getElementById('stat-breeds').innerHTML =
      `<p style="color:#A0A8A5;font-size:12px">No breed data available</p>`;
    return;
  }
  const colors = ['#4ade80','#4a8ab0','#D4B475','#e08aaa','#A0A8A5'];
  document.getElementById('stat-breeds').innerHTML = rows.map((r, i) => `
    <div class="key-stats"><div class="kstat">
      <div class="kstat-label">
        <span style="color:#E0E6E4">${r.race}</span>
        <span style="color:${colors[i % colors.length]};font-weight:700">${r.nb} (${r.pct}%)</span>
      </div>
      <div class="kstat-bar">
        <div class="kstat-fill" style="width:${r.pct}%;background:${colors[i % colors.length]}"></div>
      </div>
    </div></div>`).join('');
}

function renderCosts(rows = []) {
  if (!rows.length) {
    document.getElementById('stat-costs').innerHTML =
      `<p style="color:#A0A8A5;font-size:12px">No cost data available</p>`;
    return;
  }
  const total  = rows.reduce((s, r) => s + parseFloat(r.montant || 0), 0);
  const colors = ['#4ade80','#4a8ab0','#D4B475','#A0A8A5'];
  document.getElementById('stat-costs').innerHTML = rows.map((r, i) => {
    const pct = total > 0 ? Math.round((parseFloat(r.montant) / total) * 100) : 0;
    return `
    <div class="key-stats"><div class="kstat">
      <div class="kstat-label">
        <span style="color:#E0E6E4;text-transform:capitalize">${r.categorie}</span>
        <span style="color:${colors[i % colors.length]};font-weight:700">${pct}% · ${parseInt(r.montant).toLocaleString()} Ar</span>
      </div>
      <div class="kstat-bar">
        <div class="kstat-fill" style="width:${pct}%;background:${colors[i % colors.length]}"></div>
      </div>
    </div></div>`;
  }).join('') + `
  <div style="margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,.07);font-size:12px;color:#A0A8A5">
    Total feed costs (6 months): <strong style="color:#E0E6E4">${parseInt(total).toLocaleString()} Ar</strong>
  </div>`;
}
