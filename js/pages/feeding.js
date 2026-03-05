import { api } from '../api.js';
import { showToast } from '../app.js';

let feeds         = [];
let distributions = [];

const statusStyle = {
  critique: { cls: 'red',   label: '🚨 Critical' },
  bas:      { cls: 'gold',  label: '⚠ Low' },
  ok:       { cls: 'green', label: '✅ OK' },
};

export function feedingHTML() {
  return `
  <div class="page-header">
    <div>
      <h2 class="page-title">🌾 Feeding</h2>
      <p class="page-sub">Feed stocks, rations &amp; distribution records</p>
    </div>
    <button class="btn-primary" id="btn-add-dist">➕ Record Distribution</button>
  </div>

  <div id="feeding-alert-banner"></div>

  <div class="stats-row" id="feeding-stats">
    ${[1,2,3,4].map(() => `
    <div class="stat-card">
      <div class="stat-icon">·</div>
      <div class="stat-label">Loading</div>
      <div class="stat-value">-</div>
    </div>`).join('')}
  </div>

  <div class="middle-row" style="grid-template-columns:1fr 1fr">
    <div class="card" style="padding:0;overflow:hidden">
      <div class="card-header" style="padding:14px 16px;border-radius:0">
        <span>📦 Feed Stocks</span>
        <button class="btn-ghost" style="padding:5px 12px;font-size:11px" id="btn-restock">+ Restock</button>
      </div>
      <div id="stock-list" style="padding:12px">
        <p style="color:#A0A8A5;font-size:12px">Loading...</p>
      </div>
    </div>

    <div class="card" style="padding:0;overflow:hidden">
      <div class="card-header" style="padding:14px 16px;border-radius:0">
        <span>📋 Ration Guidelines</span>
      </div>
      <div style="padding:12px">
        ${[
          { type: 'Adult',       hay: 150, pellets: 50,  greens: 200, notes: 'Standard adult ration' },
          { type: 'Pregnant',    hay: 200, pellets: 80,  greens: 150, notes: '+30% pellets from day 25' },
          { type: 'Nursing',     hay: 250, pellets: 100, greens: 200, notes: 'Unlimited hay, extra pellets' },
          { type: 'Junior <3m',  hay: 100, pellets: 30,  greens: 50,  notes: 'Limited greens until 3 months' },
        ].map(r => `
        <div class="event-item" style="flex-direction:column;gap:4px;padding:8px 0">
          <div style="font-weight:600;color:#E0E6E4;font-size:13px">${r.type}</div>
          <div style="font-size:11px;color:#A0A8A5">
            Hay: ${r.hay}g · Pellets: ${r.pellets}g · Greens: ${r.greens}g
          </div>
          <div style="font-size:11px;color:#D4B475">${r.notes}</div>
        </div>`).join('')}
      </div>
    </div>
  </div>

  <div class="bottom-row">
    <div class="bottom-row-header">
      <span class="card-head">Distribution Records</span>
    </div>
    <table class="livestock-table full" id="dist-table">
      <thead>
        <tr><th>ID</th><th>DATE</th><th>FEED</th><th>RABBIT / GROUP</th><th>CAGE</th><th>QTY</th><th>NOTES</th><th></th></tr>
      </thead>
      <tbody id="dist-tbody">
        <tr><td colspan="8" style="text-align:center;color:#A0A8A5;padding:20px">Loading...</td></tr>
      </tbody>
    </table>
  </div>

  <div class="modal-overlay" id="modal-dist">
    <div class="modal" style="max-width:480px">
      <div class="modal-header">
        <div class="modal-title">Record Distribution<small>Log a feed distribution</small></div>
        <button class="modal-close" id="close-dist">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-row">
          <div class="form-group">
            <label>Feed <span class="req">*</span></label>
            <select id="df-feed" id="df-feed"></select>
          </div>
          <div class="form-group">
            <label>Quantity <span class="req">*</span></label>
            <input id="df-qty" type="number" step="0.01" min="0" placeholder="0.00">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Date</label>
            <input id="df-date" type="date">
          </div>
          <div class="form-group">
            <label>Rabbit Tag (optional)</label>
            <input id="df-rabbit" type="text" placeholder="LP-XXXX-XXX or leave empty for all">
          </div>
        </div>
        <div class="form-group">
          <label>Notes</label>
          <input id="df-notes" type="text" placeholder="Morning feed, special diet...">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-ghost" id="cancel-dist">Cancel</button>
        <button class="btn-primary" id="save-dist">💾 Save</button>
      </div>
    </div>
  </div>

  <div class="modal-overlay" id="modal-restock">
    <div class="modal" style="max-width:400px">
      <div class="modal-header">
        <div class="modal-title">Restock Feed<small>Add to existing stock</small></div>
        <button class="modal-close" id="close-restock">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Feed <span class="req">*</span></label>
          <select id="rf-feed"></select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Quantity to Add <span class="req">*</span></label>
            <input id="rf-qty" type="number" step="0.01" min="0" placeholder="0.00">
          </div>
          <div class="form-group">
            <label>New Expiry Date</label>
            <input id="rf-expiry" type="date">
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-ghost" id="cancel-restock">Cancel</button>
        <button class="btn-primary" id="save-restock">💾 Save</button>
      </div>
    </div>
  </div>`;
}

export async function initFeeding() {
  try {
    [feeds, distributions] = await Promise.all([
      api.alimentation.stocks(),
      api.alimentation.distributions(),
    ]);
  } catch (err) {
    showToast('Cannot load feeding data from API', 'error');
  }

  populateFeedSelects();
  renderStats();
  renderStocks();
  renderDistributions();
  initModals();
}

function populateFeedSelects() {
  const options = feeds.map((f, i) => `<option value="${i}">${f.nom} (${f.unite})</option>`).join('');
  ['df-feed','rf-feed'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = options;
  });
  document.getElementById('df-date').value = new Date().toISOString().split('T')[0];
}

function renderStats() {
  const criticals = feeds.filter(f => f.statut_stock === 'critique').length;
  const lows      = feeds.filter(f => f.statut_stock === 'bas').length;
  const today     = new Date().toISOString().split('T')[0];
  const todayDist = distributions.filter(d => d.date_dist?.slice(0,10) === today).length;

  if (criticals + lows > 0) {
    document.getElementById('feeding-alert-banner').innerHTML = `
      <div class="alert-banner">
        <span class="alert-banner-icon">🌾</span>
        <div class="alert-banner-text">
          <strong>${criticals} critical + ${lows} low stock alert${lows > 1 ? 's' : ''}</strong>
          <span>${feeds.filter(f => f.statut_stock !== 'ok').map(f => `${f.nom}: ${f.quantite}${f.unite}`).join(' · ')}</span>
        </div>
        <span class="alert-banner-arrow">→</span>
      </div>`;
  }

  document.getElementById('feeding-stats').innerHTML = `
    <div class="stat-card accent-red">
      <div class="stat-icon">🚨</div>
      <div class="stat-label">Critical Stocks</div>
      <div class="stat-value">${criticals}</div>
    </div>
    <div class="stat-card accent-gold">
      <div class="stat-icon">⚠️</div>
      <div class="stat-label">Low Stocks</div>
      <div class="stat-value">${lows}</div>
    </div>
    <div class="stat-card accent-green">
      <div class="stat-icon">📦</div>
      <div class="stat-label">Total Feed Types</div>
      <div class="stat-value">${feeds.length}</div>
    </div>
    <div class="stat-card accent-gold">
      <div class="stat-icon">🌿</div>
      <div class="stat-label">Distributions Today</div>
      <div class="stat-value">${todayDist}</div>
    </div>`;
}

function renderStocks() {
  document.getElementById('stock-list').innerHTML = feeds.map(f => {
    const s   = statusStyle[f.statut_stock] || statusStyle.ok;
    const pct = Math.min(100, Math.round((f.quantite / Math.max(f.seuil_alerte, 1)) * 50));
    return `
    <div class="stock-item">
      <div class="stock-top">
        <span class="stock-name">${f.nom}</span>
        <span class="stock-qty ${s.cls === 'red' ? 'red-text' : s.cls === 'gold' ? 'gold-text' : 'green-text'}">${f.quantite} ${f.unite}</span>
      </div>
      <div class="kstat-bar"><div class="kstat-fill ${s.cls}" style="width:${pct}%"></div></div>
      <div class="stock-meta">${s.label} · Threshold: ${f.seuil_alerte} ${f.unite}${f.date_expiration ? ' · Exp: ' + f.date_expiration.slice(0,10) : ''}</div>
    </div>`;
  }).join('');
}

function renderDistributions() {
  document.getElementById('dist-tbody').innerHTML = distributions.map(d => `
    <tr data-id="${d.id}">
      <td class="td-id">${d.code}</td>
      <td style="font-size:12px">${d.date_dist?.slice(0,10) || '-'}</td>
      <td><span class="cage-badge">${d.nom_aliment}</span></td>
      <td style="font-size:12px">${d.nom_lapin || 'All herd'}</td>
      <td style="font-size:12px">${d.cage || 'All'}</td>
      <td style="font-size:12px;font-weight:600">${d.quantite} ${d.unite}</td>
      <td style="font-size:11px;color:#A0A8A5">${d.notes || '-'}</td>
      <td class="action-cell">
        <button class="action-btn danger del-dist" data-id="${d.id}" title="Delete">🗑</button>
      </td>
    </tr>`).join('') || `<tr><td colspan="8" style="text-align:center;color:#A0A8A5;padding:20px">No distributions recorded</td></tr>`;
}

function initModals() {
  document.getElementById('btn-add-dist').addEventListener('click', () => {
    document.getElementById('modal-dist').classList.add('open');
  });

  document.getElementById('btn-restock').addEventListener('click', () => {
    document.getElementById('modal-restock').classList.add('open');
  });

  ['close-dist','cancel-dist'].forEach(id => {
    document.getElementById(id).addEventListener('click', () => {
      document.getElementById('modal-dist').classList.remove('open');
    });
  });

  ['close-restock','cancel-restock'].forEach(id => {
    document.getElementById(id).addEventListener('click', () => {
      document.getElementById('modal-restock').classList.remove('open');
    });
  });

  ['modal-dist','modal-restock'].forEach(id => {
    document.getElementById(id).addEventListener('click', e => {
      if (e.target.id === id) document.getElementById(id).classList.remove('open');
    });
  });

  document.getElementById('dist-table').addEventListener('click', async e => {
    const del = e.target.closest('.del-dist');
    if (!del) return;
    if (!confirm('Remove this distribution record?')) return;
    try {
      await api.alimentation.deleteDist(del.dataset.id);
      del.closest('tr').remove();
      showToast('Distribution removed');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  document.getElementById('save-dist').addEventListener('click', async () => {
    const feedIdx = parseInt(document.getElementById('df-feed').value);
    const qty     = parseFloat(document.getElementById('df-qty').value);
    if (isNaN(feedIdx) || !qty) { alert('Feed and quantity are required'); return; }

    const feed      = feeds[feedIdx];
    const rabbitTag = document.getElementById('df-rabbit').value.trim();
    let   lapin_id  = null;

    try {
      if (rabbitTag) {
        const lapins = await api.lapins.getAll({ search: rabbitTag });
        const found  = lapins.find(l => l.tag === rabbitTag);
        if (!found) { alert(`No rabbit found with tag: ${rabbitTag}`); return; }
        lapin_id = found.id;
      }

      const saved = await api.alimentation.addDist({
        aliment_id: feed.aliment_id || feedIdx + 1,
        quantite:   qty,
        date_dist:  document.getElementById('df-date').value,
        lapin_id,
        notes:      document.getElementById('df-notes').value.trim() || null,
      });

      distributions.unshift({ ...saved, nom_aliment: feed.nom, unite: feed.unite });
      feeds[feedIdx].quantite = parseFloat(feed.quantite) - qty;
      renderStocks();
      renderDistributions();
      renderStats();
      document.getElementById('modal-dist').classList.remove('open');
      showToast('Distribution recorded ✅');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  document.getElementById('save-restock').addEventListener('click', async () => {
    const feedIdx = parseInt(document.getElementById('rf-feed').value);
    const qty     = parseFloat(document.getElementById('rf-qty').value);
    if (isNaN(feedIdx) || !qty) { alert('Feed and quantity are required'); return; }

    const feed = feeds[feedIdx];
    try {
      await api.alimentation.restock({
        aliment_id:      feed.aliment_id || feedIdx + 1,
        quantite:        qty,
        date_expiration: document.getElementById('rf-expiry').value || null,
      });
      feeds[feedIdx].quantite = parseFloat(feed.quantite) + qty;
      renderStocks();
      renderStats();
      document.getElementById('modal-restock').classList.remove('open');
      showToast(`${feed.nom} restocked: +${qty} ${feed.unite}`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}
