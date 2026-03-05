import { api } from '../api.js';
import { showToast } from '../app.js';

let rabbits = [];

const statusMap = {
  actif:      { label: 'Active',    cls: 'green' },
  gestante:   { label: 'Pregnant',  cls: 'gold'  },
  allaitante: { label: 'Nursing',   cls: 'blue'  },
  malade:     { label: 'Sick',      cls: 'red'   },
  vendu:      { label: 'Sold',      cls: 'gray'  },
  mort:       { label: 'Dead',      cls: 'gray'  },
};

function age(dob) {
  if (!dob) return '-';
  const d = new Date(dob);
  const m = (new Date() - d) / (1000 * 60 * 60 * 24 * 30.44);
  if (m < 1) return `${Math.round(m * 30)}d`;
  if (m < 24) return `${Math.floor(m)}m`;
  return `${Math.floor(m / 12)}y ${Math.floor(m % 12)}m`;
}

function rowHTML(r) {
  const s      = statusMap[r.statut] || statusMap.actif;
  const sexBadge = r.sexe === 'M'
    ? `<span class="sex-badge male">♂ M</span>`
    : `<span class="sex-badge female">♀ F</span>`;
  const cage = r.cage ? `<span class="cage-badge">${r.cage}</span>` : '-';
  return `
    <tr data-id="${r.id}" data-sex="${r.sexe}" data-status="${r.statut}" data-breed="${(r.race || '').toLowerCase()}">
      <td class="td-id">${r.tag}</td>
      <td>${r.nom}</td>
      <td>${sexBadge}</td>
      <td>${r.race || '-'}</td>
      <td>${age(r.date_naissance)}</td>
      <td>${cage}</td>
      <td>${r.poids_actuel ? r.poids_actuel + ' kg' : '-'}</td>
      <td><span class="status ${s.cls}">${s.label}</span></td>
      <td class="action-cell">
        <button class="action-btn view-rabbit" data-id="${r.id}" title="View">👁</button>
        <button class="action-btn edit-rabbit" data-id="${r.id}" title="Edit">✏️</button>
        <button class="action-btn danger del-rabbit" data-id="${r.id}" title="Delete">🗑</button>
      </td>
    </tr>`;
}

export function livestockHTML() {
  return `
  <div class="page-header">
    <div>
      <h2 class="page-title">🐇 Livestock</h2>
      <p class="page-sub" id="livestock-sub">Loading...</p>
    </div>
    <button class="btn-primary" id="btn-add-rabbit">➕ Add Rabbit</button>
  </div>

  <div class="stats-row" id="livestock-stats">
    ${[1,2,3,4,5].map(() => `
    <div class="stat-card">
      <div class="stat-icon">·</div>
      <div class="stat-label">Loading</div>
      <div class="stat-value">-</div>
    </div>`).join('')}
  </div>

  <div class="card" style="padding:14px">
    <div class="filter-bar">
      <div class="filter-pills">
        <button class="pill active" data-filter="all">All</button>
        <button class="pill" data-filter="M">♂ Males</button>
        <button class="pill" data-filter="F">♀ Females</button>
        <button class="pill" data-filter="gestante">Pregnant</button>
        <button class="pill" data-filter="malade">Sick</button>
        <button class="pill" data-filter="vendu">Sold</button>
      </div>
      <div style="margin-left:auto;display:flex;gap:8px;align-items:center">
        <select id="breed-filter" style="width:160px;height:36px;font-size:12px">
          <option value="">All breeds</option>
          <option>Flemish Giant</option>
          <option>Rex</option>
          <option>Californian</option>
          <option>Dutch</option>
          <option>New Zealand</option>
        </select>
        <input id="search-rabbit" type="text" placeholder="Search..." style="width:180px;height:36px;font-size:12px">
      </div>
    </div>
  </div>

  <div class="bottom-row">
    <div class="bottom-row-header">
      <span class="card-head">All Rabbits</span>
      <span id="result-count" style="font-size:12px;color:#A0A8A5"></span>
    </div>
    <table class="livestock-table full" id="rabbit-table">
      <thead>
        <tr>
          <th>TAG / ID</th><th>NAME</th><th>SEX</th><th>BREED</th>
          <th>AGE</th><th>CAGE</th><th>WEIGHT</th><th>STATUS</th><th>ACTIONS</th>
        </tr>
      </thead>
      <tbody id="rabbit-tbody">
        <tr><td colspan="9" style="text-align:center;color:#A0A8A5;padding:20px">Loading...</td></tr>
      </tbody>
    </table>
  </div>

  <div class="modal-overlay" id="modal-view">
    <div class="modal" style="max-width:480px">
      <div class="modal-header">
        <div class="modal-title" id="mv-title">Rabbit Details<small id="mv-sub"></small></div>
        <button class="modal-close" id="close-mv">✕</button>
      </div>
      <div class="modal-body" id="mv-body"></div>
    </div>
  </div>

  <div class="modal-overlay" id="modal-rabbit">
    <div class="modal">
      <div class="modal-header">
        <div class="modal-title" id="modal-rabbit-title">Add Rabbit<small>Fill in rabbit details</small></div>
        <button class="modal-close" id="close-modal-rabbit">✕</button>
      </div>
      <div class="modal-body">
        <input type="hidden" id="f-db-id">
        <div class="form-row">
          <div class="form-group">
            <label>Tag ID <span class="req">*</span></label>
            <input id="f-id" type="text" placeholder="LP-2025-XXX">
          </div>
          <div class="form-group">
            <label>Name</label>
            <input id="f-name" type="text" placeholder="Name">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Sex <span class="req">*</span></label>
            <select id="f-sex"><option value="M">♂ Male</option><option value="F">♀ Female</option></select>
          </div>
          <div class="form-group">
            <label>Breed</label>
            <select id="f-breed">
              <option>Flemish Giant</option><option>Rex</option>
              <option>Californian</option><option>Dutch</option><option>New Zealand</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Date of Birth</label>
            <input id="f-dob" type="date">
          </div>
          <div class="form-group">
            <label>Weight (kg)</label>
            <input id="f-weight" type="number" step="0.01" placeholder="0.00">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Cage</label>
            <input id="f-cage" type="text" placeholder="A-01">
          </div>
          <div class="form-group">
            <label>Status</label>
            <select id="f-status">
              <option value="actif">Active</option>
              <option value="gestante">Pregnant</option>
              <option value="allaitante">Nursing</option>
              <option value="malade">Sick</option>
              <option value="vendu">Sold</option>
            </select>
          </div>
        </div>
        <div class="form-section-label">Lineage (optional)</div>
        <div class="form-row">
          <div class="form-group">
            <label>Mother Tag</label>
            <input id="f-mere" type="text" placeholder="LP-XXXX-XXX">
          </div>
          <div class="form-group">
            <label>Father Tag</label>
            <input id="f-pere" type="text" placeholder="LP-XXXX-XXX">
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-ghost" id="cancel-rabbit">Cancel</button>
        <button class="btn-primary" id="save-rabbit">💾 Save</button>
      </div>
    </div>
  </div>`;
}

export async function initLivestock() {
  try {
    rabbits = await api.lapins.getAll();
  } catch (err) {
    showToast('Cannot load rabbits from API', 'error');
    rabbits = [];
  }

  renderTable();
  renderStats();
  initFilters();
  initModals();
}

function renderStats() {
  const active  = rabbits.filter(r => !['vendu','mort'].includes(r.statut));
  const males   = rabbits.filter(r => r.sexe === 'M' && !['vendu','mort'].includes(r.statut));
  const females = rabbits.filter(r => r.sexe === 'F' && !['vendu','mort'].includes(r.statut));
  const preg    = rabbits.filter(r => r.statut === 'gestante');
  const sick    = rabbits.filter(r => r.statut === 'malade');

  document.getElementById('livestock-sub').textContent =
    `Manage your rabbit herd · ${active.length} active animals`;

  document.getElementById('livestock-stats').innerHTML = `
    <div class="stat-card accent-green">
      <div class="stat-icon">🐇</div>
      <div class="stat-label">Total Active</div>
      <div class="stat-value">${active.length}</div>
    </div>
    <div class="stat-card" style="border-top-color:#4a8ab0">
      <div class="stat-icon">♂</div>
      <div class="stat-label">Males</div>
      <div class="stat-value">${males.length}</div>
    </div>
    <div class="stat-card" style="border-top-color:#e08aaa">
      <div class="stat-icon">♀</div>
      <div class="stat-label">Females</div>
      <div class="stat-value">${females.length}</div>
    </div>
    <div class="stat-card accent-gold">
      <div class="stat-icon">🤰</div>
      <div class="stat-label">Pregnant</div>
      <div class="stat-value">${preg.length}</div>
    </div>
    <div class="stat-card accent-red">
      <div class="stat-icon">🏥</div>
      <div class="stat-label">Sick</div>
      <div class="stat-value">${sick.length}</div>
    </div>`;
}

function renderTable() {
  const tbody = document.getElementById('rabbit-tbody');
  tbody.innerHTML = rabbits.map(rowHTML).join('');
  updateCount();
}

function updateCount() {
  const tbody   = document.getElementById('rabbit-tbody');
  const visible = tbody.querySelectorAll('tr:not([style*="display: none"])').length;
  document.getElementById('result-count').textContent =
    `${visible} rabbit${visible !== 1 ? 's' : ''}`;
}

function initFilters() {
  let activeFilter = 'all';
  let breedFilter  = '';
  let searchQ      = '';

  function applyFilters() {
    document.getElementById('rabbit-tbody').querySelectorAll('tr').forEach(tr => {
      const sex    = tr.dataset.sex;
      const status = tr.dataset.status;
      const breed  = tr.dataset.breed || '';
      const text   = tr.textContent.toLowerCase();

      const matchFilter =
        activeFilter === 'all'      ? true :
        activeFilter === 'M'        ? sex === 'M' :
        activeFilter === 'F'        ? sex === 'F' :
        status === activeFilter;

      const matchBreed  = !breedFilter || breed.includes(breedFilter.toLowerCase());
      const matchSearch = !searchQ     || text.includes(searchQ.toLowerCase());

      tr.style.display = (matchFilter && matchBreed && matchSearch) ? '' : 'none';
    });
    updateCount();
  }

  document.querySelectorAll('.pill[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pill[data-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      applyFilters();
    });
  });

  document.getElementById('breed-filter').addEventListener('change', e => {
    breedFilter = e.target.value;
    applyFilters();
  });

  document.getElementById('search-rabbit').addEventListener('input', e => {
    searchQ = e.target.value;
    applyFilters();
  });
}

function initModals() {
  document.getElementById('rabbit-table').addEventListener('click', async e => {
    const viewBtn = e.target.closest('.view-rabbit');
    const editBtn = e.target.closest('.edit-rabbit');
    const delBtn  = e.target.closest('.del-rabbit');

    if (viewBtn) {
      const r = rabbits.find(x => String(x.id) === viewBtn.dataset.id);
      if (!r) return;
      const s = statusMap[r.statut] || statusMap.actif;
      document.getElementById('mv-title').childNodes[0].textContent = r.nom + ' ';
      document.getElementById('mv-sub').textContent = r.tag;
      document.getElementById('mv-body').innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div><label>Sex</label><p style="color:#E0E6E4;margin-top:4px">${r.sexe === 'M' ? '♂ Male' : '♀ Female'}</p></div>
          <div><label>Breed</label><p style="color:#E0E6E4;margin-top:4px">${r.race || '-'}</p></div>
          <div><label>Date of Birth</label><p style="color:#E0E6E4;margin-top:4px">${r.date_naissance || '-'}</p></div>
          <div><label>Age</label><p style="color:#E0E6E4;margin-top:4px">${age(r.date_naissance)}</p></div>
          <div><label>Cage</label><p style="color:#E0E6E4;margin-top:4px">${r.cage || '-'}</p></div>
          <div><label>Weight</label><p style="color:#E0E6E4;margin-top:4px">${r.poids_actuel ? r.poids_actuel + ' kg' : '-'}</p></div>
          <div><label>Status</label><p style="margin-top:4px"><span class="status ${s.cls}">${s.label}</span></p></div>
          <div><label>Mother</label><p style="color:#D4B475;margin-top:4px;font-family:monospace">${r.tag_mere || '-'}</p></div>
          <div><label>Father</label><p style="color:#D4B475;margin-top:4px;font-family:monospace">${r.tag_pere || '-'}</p></div>
        </div>`;
      document.getElementById('modal-view').classList.add('open');
    }

    if (editBtn) {
      const r = rabbits.find(x => String(x.id) === editBtn.dataset.id);
      if (!r) return;
      document.getElementById('modal-rabbit-title').innerHTML = 'Edit Rabbit<small>' + r.tag + '</small>';
      document.getElementById('f-db-id').value  = r.id;
      document.getElementById('f-id').value     = r.tag;
      document.getElementById('f-name').value   = r.nom;
      document.getElementById('f-sex').value    = r.sexe;
      document.getElementById('f-breed').value  = r.race || 'Flemish Giant';
      document.getElementById('f-dob').value    = r.date_naissance || '';
      document.getElementById('f-weight').value = r.poids_actuel || '';
      document.getElementById('f-cage').value   = r.cage || '';
      document.getElementById('f-status').value = r.statut;
      document.getElementById('f-mere').value   = r.tag_mere || '';
      document.getElementById('f-pere').value   = r.tag_pere || '';
      document.getElementById('modal-rabbit').classList.add('open');
    }

    if (delBtn) {
      if (!confirm('Remove this rabbit from records?')) return;
      try {
        await api.lapins.delete(delBtn.dataset.id);
        rabbits = rabbits.filter(x => String(x.id) !== delBtn.dataset.id);
        delBtn.closest('tr').remove();
        updateCount();
        renderStats();
        showToast('Rabbit removed');
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  });

  document.getElementById('close-mv').addEventListener('click', () => {
    document.getElementById('modal-view').classList.remove('open');
  });

  ['close-modal-rabbit', 'cancel-rabbit'].forEach(id => {
    document.getElementById(id).addEventListener('click', () => {
      document.getElementById('modal-rabbit').classList.remove('open');
    });
  });

  document.getElementById('btn-add-rabbit').addEventListener('click', () => {
    document.getElementById('modal-rabbit-title').innerHTML = 'Add Rabbit<small>Fill in rabbit details</small>';
    ['f-db-id','f-id','f-name','f-weight','f-cage','f-mere','f-pere'].forEach(id => {
      document.getElementById(id).value = '';
    });
    document.getElementById('f-sex').value    = 'M';
    document.getElementById('f-breed').value  = 'Flemish Giant';
    document.getElementById('f-status').value = 'actif';
    document.getElementById('f-dob').value    = '';
    document.getElementById('modal-rabbit').classList.add('open');
  });

  document.getElementById('save-rabbit').addEventListener('click', async () => {
    const tag = document.getElementById('f-id').value.trim();
    if (!tag) { alert('Tag ID is required'); return; }

    const dbId = document.getElementById('f-db-id').value;
    const data = {
      tag,
      nom:          document.getElementById('f-name').value.trim() || tag,
      sexe:         document.getElementById('f-sex').value,
      date_naissance: document.getElementById('f-dob').value || null,
      poids_actuel: parseFloat(document.getElementById('f-weight').value) || null,
      statut:       document.getElementById('f-status').value,
    };

    try {
      let saved;
      if (dbId) {
        saved = await api.lapins.update(dbId, data);
        const idx = rabbits.findIndex(x => String(x.id) === dbId);
        if (idx > -1) rabbits[idx] = { ...rabbits[idx], ...saved };
        showToast('Rabbit updated');
      } else {
        saved = await api.lapins.create(data);
        rabbits.push(saved);
        showToast('Rabbit added ✨');
      }
      document.getElementById('modal-rabbit').classList.remove('open');
      renderTable();
      renderStats();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  ['modal-view','modal-rabbit'].forEach(id => {
    document.getElementById(id).addEventListener('click', e => {
      if (e.target.id === id) document.getElementById(id).classList.remove('open');
    });
  });
}
