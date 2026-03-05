import { api } from '../api.js';
import { showToast } from '../app.js';

let matings = [];
let litters = [];

const statusStyle = {
  succes:     { cls: 'green', label: '✅ Success' },
  en_attente: { cls: 'gold',  label: '⏳ Pending' },
  planifie:   { cls: 'gray',  label: '📅 Planned' },
  echec:      { cls: 'red',   label: '❌ Failed'  },
};

function daysUntil(dateStr) {
  if (!dateStr) return '-';
  const diff = Math.round((new Date(dateStr) - new Date()) / 86400000);
  if (diff < 0)  return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return 'Today!';
  return `in ${diff}d`;
}

export function reproductionHTML() {
  return `
  <div class="page-header">
    <div>
      <h2 class="page-title">💞 Reproduction</h2>
      <p class="page-sub">Matings, pregnancies &amp; litters</p>
    </div>
    <button class="btn-primary" id="btn-add-mating">💞 New Mating</button>
  </div>

  <div id="repro-alert-banner"></div>

  <div class="stats-row" id="repro-stats">
    ${[1,2,3,4,5].map(() => `
    <div class="stat-card">
      <div class="stat-icon">·</div>
      <div class="stat-label">Loading</div>
      <div class="stat-value">-</div>
    </div>`).join('')}
  </div>

  <div class="bottom-row">
    <div class="bottom-row-header">
      <span class="card-head">All Matings</span>
      <div class="filter-pills">
        <button class="pill active" data-mfilter="all">All</button>
        <button class="pill" data-mfilter="en_attente">Pending</button>
        <button class="pill" data-mfilter="planifie">Planned</button>
        <button class="pill" data-mfilter="succes">Success</button>
        <button class="pill" data-mfilter="echec">Failed</button>
      </div>
    </div>
    <table class="livestock-table full" id="mating-table">
      <thead>
        <tr><th>ID</th><th>♂ MALE</th><th>♀ FEMALE</th><th>MATING DATE</th><th>EXPECTED BIRTH</th><th>COUNTDOWN</th><th>LITTER</th><th>STATUS</th><th></th></tr>
      </thead>
      <tbody id="mating-tbody">
        <tr><td colspan="9" style="text-align:center;color:#A0A8A5;padding:20px">Loading...</td></tr>
      </tbody>
    </table>
  </div>

  <div class="bottom-row">
    <div class="bottom-row-header"><span class="card-head">🐣 Litter Records</span></div>
    <table class="livestock-table full">
      <thead>
        <tr><th>LITTER ID</th><th>MOTHER</th><th>FATHER</th><th>BIRTH DATE</th><th>BORN</th><th>ALIVE</th><th>DEAD</th><th>WEANED</th><th>CAGE</th></tr>
      </thead>
      <tbody id="litter-tbody">
        <tr><td colspan="9" style="text-align:center;color:#A0A8A5;padding:20px">Loading...</td></tr>
      </tbody>
    </table>
  </div>

  <div class="modal-overlay" id="modal-mating">
    <div class="modal">
      <div class="modal-header">
        <div class="modal-title">New Mating<small>Plan or record a mating</small></div>
        <button class="modal-close" id="close-mating">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-section-label">Male</div>
        <div class="form-row">
          <div class="form-group">
            <label>Male Tag ID <span class="req">*</span></label>
            <input id="mf-male-id" type="text" placeholder="LP-XXXX-XXX">
          </div>
          <div class="form-group">
            <label>Male Name</label>
            <input id="mf-male-name" type="text" placeholder="Name">
          </div>
        </div>
        <div class="form-section-label">Female</div>
        <div class="form-row">
          <div class="form-group">
            <label>Female Tag ID <span class="req">*</span></label>
            <input id="mf-female-id" type="text" placeholder="LP-XXXX-XXX">
          </div>
          <div class="form-group">
            <label>Female Name</label>
            <input id="mf-female-name" type="text" placeholder="Name">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Mating Date <span class="req">*</span></label>
            <input id="mf-date" type="date">
          </div>
          <div class="form-group">
            <label>Expected Birth</label>
            <input id="mf-expected" type="date" readonly>
          </div>
        </div>
        <div class="form-group">
          <label>Status</label>
          <select id="mf-status">
            <option value="planifie">📅 Planned</option>
            <option value="en_attente">⏳ Pending (mated)</option>
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-ghost" id="cancel-mating">Cancel</button>
        <button class="btn-primary" id="save-mating">💾 Save</button>
      </div>
    </div>
  </div>

  <div class="modal-overlay" id="modal-birth">
    <div class="modal" style="max-width:420px">
      <div class="modal-header">
        <div class="modal-title">🐣 Record Birth<small id="birth-mating-ref"></small></div>
        <button class="modal-close" id="close-birth">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-row">
          <div class="form-group">
            <label>Birth Date</label>
            <input id="bf-date" type="date">
          </div>
          <div class="form-group">
            <label>Born Alive</label>
            <input id="bf-alive" type="number" min="0" placeholder="0">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Born Dead</label>
            <input id="bf-dead" type="number" min="0" placeholder="0">
          </div>
          <div class="form-group">
            <label>Cage</label>
            <input id="bf-cage" type="text" placeholder="C-01">
          </div>
        </div>
        <div class="form-group">
          <label>Notes</label>
          <textarea id="bf-notes" placeholder="Observations..."></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-ghost" id="cancel-birth">Cancel</button>
        <button class="btn-primary" id="save-birth">🐣 Record</button>
      </div>
    </div>
  </div>`;
}

export async function initReproduction() {
  try {
    [matings, litters] = await Promise.all([
      api.reproduction.getAll(),
      api.reproduction.portees(),
    ]);
  } catch (err) {
    showToast('Cannot load reproduction data from API', 'error');
  }

  renderStats();
  renderMatings();
  renderLitters();
  initFilters();
  initModals();
}

function renderStats() {
  const success = matings.filter(m => m.statut === 'succes').length;
  const pending = matings.filter(m => m.statut === 'en_attente').length;
  const planned = matings.filter(m => m.statut === 'planifie').length;
  const failed  = matings.filter(m => m.statut === 'echec').length;
  const totalBorn = litters.reduce((s, l) => s + (l.nb_nes || 0), 0);

  if (pending > 0) {
    document.getElementById('repro-alert-banner').innerHTML = `
      <div class="alert-banner">
        <span class="alert-banner-icon">🐣</span>
        <div class="alert-banner-text">
          <strong>${pending} birth${pending > 1 ? 's' : ''} expected soon</strong>
          <span>${matings.filter(m => m.statut === 'en_attente').map(m => `${m.nom_femelle} (${daysUntil(m.date_naissance_prevue)})`).join(' · ')}</span>
        </div>
        <span class="alert-banner-arrow">→</span>
      </div>`;
  }

  document.getElementById('repro-stats').innerHTML = `
    <div class="stat-card accent-green">
      <div class="stat-icon">✅</div>
      <div class="stat-label">Successful Matings</div>
      <div class="stat-value">${success}</div>
    </div>
    <div class="stat-card accent-gold">
      <div class="stat-icon">⏳</div>
      <div class="stat-label">Pregnant (Pending)</div>
      <div class="stat-value">${pending}</div>
    </div>
    <div class="stat-card" style="border-top-color:#4a8ab0">
      <div class="stat-icon">📅</div>
      <div class="stat-label">Planned</div>
      <div class="stat-value">${planned}</div>
    </div>
    <div class="stat-card accent-green">
      <div class="stat-icon">🐣</div>
      <div class="stat-label">Total Born (season)</div>
      <div class="stat-value">${totalBorn}</div>
    </div>
    <div class="stat-card accent-red">
      <div class="stat-icon">❌</div>
      <div class="stat-label">Failed</div>
      <div class="stat-value">${failed}</div>
    </div>`;
}

function renderMatings() {
  document.getElementById('mating-tbody').innerHTML = matings.map(m => {
    const s = statusStyle[m.statut] || statusStyle.planifie;
    return `<tr data-id="${m.id}" data-mstatus="${m.statut}">
      <td class="td-id">${m.code}</td>
      <td><span style="color:#4a8ab0;font-weight:600">${m.nom_male}</span><br>
          <span style="font-size:10px;color:#A0A8A5">${m.tag_male}</span></td>
      <td><span style="color:#e08aaa;font-weight:600">${m.nom_femelle}</span><br>
          <span style="font-size:10px;color:#A0A8A5">${m.tag_femelle}</span></td>
      <td style="font-size:12px">${m.date_accouplement || '-'}</td>
      <td style="font-size:12px">${m.date_naissance_prevue || '-'}</td>
      <td style="font-size:12px;font-weight:600;color:${m.statut === 'en_attente' ? '#D4B475' : '#A0A8A5'}">
        ${m.statut === 'en_attente' || m.statut === 'planifie' ? daysUntil(m.date_naissance_prevue) : '-'}
      </td>
      <td style="font-size:12px">${m.taille_portee !== null ? `<span style="color:#4ade80;font-weight:600">${m.taille_portee} kittens</span>` : '-'}</td>
      <td><span class="status ${s.cls}">${s.label}</span></td>
      <td class="action-cell">
        ${m.statut === 'en_attente' ? `<button class="action-btn record-birth" data-id="${m.id}" title="Record birth">🐣</button>` : ''}
        <button class="action-btn danger del-mating" data-id="${m.id}" title="Delete">🗑</button>
      </td>
    </tr>`;
  }).join('') || `<tr><td colspan="9" style="text-align:center;color:#A0A8A5;padding:20px">No matings recorded</td></tr>`;
}

function renderLitters() {
  document.getElementById('litter-tbody').innerHTML = litters.map(l => `
    <tr>
      <td class="td-id">${l.code}</td>
      <td style="color:#e08aaa;font-weight:600">${l.nom_mere}</td>
      <td style="color:#4a8ab0;font-weight:600">${l.nom_pere}</td>
      <td style="font-size:12px">${l.date_naissance?.slice(0,10) || '-'}</td>
      <td><span style="color:#4ade80;font-weight:700">${l.nb_nes}</span></td>
      <td><span style="color:#4ade80">${l.nb_vivants}</span></td>
      <td><span style="color:${l.nb_morts > 0 ? '#E74C3C' : '#A0A8A5'}">${l.nb_morts}</span></td>
      <td><span style="color:${l.nb_sevres === l.nb_vivants ? '#4ade80' : '#D4B475'}">${l.nb_sevres}</span></td>
      <td>${l.cage ? `<span class="cage-badge">${l.cage}</span>` : '-'}</td>
    </tr>`).join('') || `<tr><td colspan="9" style="text-align:center;color:#A0A8A5;padding:20px">No litters recorded</td></tr>`;
}

function initFilters() {
  document.querySelectorAll('[data-mfilter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-mfilter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.mfilter;
      document.querySelectorAll('#mating-tbody tr').forEach(tr => {
        tr.style.display = (f === 'all' || tr.dataset.mstatus === f) ? '' : 'none';
      });
    });
  });
}

function initModals() {
  let currentMatingId = null;

  document.getElementById('mf-date').addEventListener('change', e => {
    const d = new Date(e.target.value);
    d.setDate(d.getDate() + 31);
    document.getElementById('mf-expected').value = d.toISOString().split('T')[0];
  });

  document.getElementById('mating-table').addEventListener('click', e => {
    const birthBtn = e.target.closest('.record-birth');
    if (birthBtn) {
      currentMatingId = birthBtn.dataset.id;
      document.getElementById('birth-mating-ref').textContent = 'Mating #' + currentMatingId;
      document.getElementById('bf-date').value  = new Date().toISOString().split('T')[0];
      document.getElementById('bf-alive').value = '';
      document.getElementById('bf-dead').value  = '';
      document.getElementById('bf-cage').value  = '';
      document.getElementById('bf-notes').value = '';
      document.getElementById('modal-birth').classList.add('open');
    }

    const del = e.target.closest('.del-mating');
    if (del) {
      if (!confirm('Remove this mating record?')) return;
      api.reproduction.delete(del.dataset.id)
        .then(() => {
          matings = matings.filter(m => String(m.id) !== del.dataset.id);
          del.closest('tr').remove();
          renderStats();
          showToast('Mating removed');
        })
        .catch(err => showToast(err.message, 'error'));
    }
  });

  document.getElementById('btn-add-mating').addEventListener('click', () => {
    ['mf-male-id','mf-male-name','mf-female-id','mf-female-name','mf-date','mf-expected'].forEach(id => {
      document.getElementById(id).value = '';
    });
    document.getElementById('mf-status').value = 'planifie';
    document.getElementById('modal-mating').classList.add('open');
  });

  ['close-mating','cancel-mating'].forEach(id => {
    document.getElementById(id).addEventListener('click', () => {
      document.getElementById('modal-mating').classList.remove('open');
    });
  });

  ['close-birth','cancel-birth'].forEach(id => {
    document.getElementById(id).addEventListener('click', () => {
      document.getElementById('modal-birth').classList.remove('open');
    });
  });

  ['modal-mating','modal-birth'].forEach(id => {
    document.getElementById(id).addEventListener('click', e => {
      if (e.target.id === id) document.getElementById(id).classList.remove('open');
    });
  });

  document.getElementById('save-mating').addEventListener('click', async () => {
    const maleTag   = document.getElementById('mf-male-id').value.trim();
    const femaleTag = document.getElementById('mf-female-id').value.trim();
    const date      = document.getElementById('mf-date').value;
    if (!maleTag || !femaleTag || !date) {
      alert('Male ID, Female ID and Date are required');
      return;
    }

    try {
      const [males, females] = await Promise.all([
        api.lapins.getAll({ search: maleTag }),
        api.lapins.getAll({ search: femaleTag }),
      ]);
      const male   = males.find(l => l.tag === maleTag);
      const female = females.find(l => l.tag === femaleTag);
      if (!male)   { alert(`No rabbit found with tag: ${maleTag}`);   return; }
      if (!female) { alert(`No rabbit found with tag: ${femaleTag}`); return; }

      const saved = await api.reproduction.create({
        male_id:           male.id,
        femelle_id:        female.id,
        date_accouplement: date,
        statut:            document.getElementById('mf-status').value,
      });

      matings.unshift({
        ...saved,
        nom_male:    male.nom,    tag_male:    male.tag,
        nom_femelle: female.nom,  tag_femelle: female.tag,
      });
      renderMatings();
      renderStats();
      document.getElementById('modal-mating').classList.remove('open');
      showToast('Mating recorded 💞');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  document.getElementById('save-birth').addEventListener('click', async () => {
    const alive = parseInt(document.getElementById('bf-alive').value) || 0;
    const dead  = parseInt(document.getElementById('bf-dead').value)  || 0;

    try {
      const saved = await api.reproduction.naissance(currentMatingId, {
        date_naissance: document.getElementById('bf-date').value,
        nb_vivants:     alive,
        nb_morts:       dead,
        cage_id:        null,
        notes:          document.getElementById('bf-notes').value.trim() || null,
      });

      litters.unshift(saved);
      const m = matings.find(x => String(x.id) === currentMatingId);
      if (m) { m.statut = 'succes'; m.taille_portee = alive + dead; }

      renderMatings();
      renderLitters();
      renderStats();
      document.getElementById('modal-birth').classList.remove('open');
      showToast(`Birth recorded: ${alive + dead} kittens 🐣`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}
