import { api } from '../api.js';
import { showToast } from '../app.js';

let treatments  = [];
let pathologies = [];

const statusStyle = {
  termine:   { cls: 'green', label: 'Done' },
  en_cours:  { cls: 'gold',  label: 'Ongoing' },
  en_retard: { cls: 'red',   label: 'Overdue' },
  planifie:  { cls: 'gray',  label: 'Planned' },
};

const pathStyle = {
  en_cours: { cls: 'red',   label: 'Ongoing' },
  stable:   { cls: 'gold',  label: 'Managed' },
  gueri:    { cls: 'green', label: 'Cured' },
};

const sevStyle = {
  leger:   { cls: 'green', label: 'Mild' },
  modere:  { cls: 'gold',  label: 'Moderate' },
  severe:  { cls: 'red',   label: 'Severe' },
};

export function healthHTML() {
  return `
  <div class="page-header">
    <div>
      <h2 class="page-title">🏥 Health</h2>
      <p class="page-sub">Treatments, vaccines &amp; pathologies</p>
    </div>
    <button class="btn-primary" id="btn-add-treatment">➕ Add Treatment</button>
  </div>

  <div id="health-alert-banner"></div>

  <div class="stats-row" id="health-stats">
    ${[1,2,3,4].map(() => `
    <div class="stat-card">
      <div class="stat-icon">·</div>
      <div class="stat-label">Loading</div>
      <div class="stat-value">-</div>
    </div>`).join('')}
  </div>

  <div class="middle-row" style="grid-template-columns:3fr 2fr">
    <div class="card" style="padding:0;overflow:hidden">
      <div class="card-header" style="padding:14px 16px;border-radius:0">
        <span>💊 Treatments &amp; Vaccines</span>
        <div class="filter-pills" id="trt-pills">
          <button class="pill active" data-tfilter="all">All</button>
          <button class="pill" data-tfilter="en_retard">Overdue</button>
          <button class="pill" data-tfilter="en_cours">Ongoing</button>
          <button class="pill" data-tfilter="termine">Done</button>
        </div>
      </div>
      <table class="livestock-table" id="trt-table">
        <thead>
          <tr><th>ID</th><th>RABBIT</th><th>TYPE</th><th>TREATMENT</th><th>START</th><th>END</th><th>STATUS</th><th></th></tr>
        </thead>
        <tbody id="trt-tbody">
          <tr><td colspan="8" style="text-align:center;color:#A0A8A5;padding:20px">Loading...</td></tr>
        </tbody>
      </table>
    </div>

    <div class="card" style="padding:0;overflow:hidden">
      <div class="card-header" style="padding:14px 16px;border-radius:0">
        <span>🦠 Pathologies</span>
      </div>
      <div style="padding:12px" id="path-list">
        <p style="color:#A0A8A5;font-size:12px">Loading...</p>
      </div>
    </div>
  </div>

  <div class="modal-overlay" id="modal-treatment">
    <div class="modal">
      <div class="modal-header">
        <div class="modal-title">Add Treatment<small>Record a new treatment or vaccine</small></div>
        <button class="modal-close" id="close-trt">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-row">
          <div class="form-group">
            <label>Rabbit Tag ID <span class="req">*</span></label>
            <input id="tf-rabbit-tag" type="text" placeholder="LP-XXXX-XXX">
          </div>
          <div class="form-group">
            <label>Rabbit Name</label>
            <input id="tf-rabbit-name" type="text" placeholder="Name">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Treatment Type <span class="req">*</span></label>
            <select id="tf-type">
              <option value="vaccin">Vaccine</option>
              <option value="medicament">Medication</option>
              <option value="antiparasitaire">Antiparasitic</option>
              <option value="vitamine">Vitamin</option>
              <option value="autre">Other</option>
            </select>
          </div>
          <div class="form-group">
            <label>Treatment Name <span class="req">*</span></label>
            <input id="tf-name" type="text" placeholder="e.g. VHD Vaccine">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Start Date</label>
            <input id="tf-start" type="date">
          </div>
          <div class="form-group">
            <label>End Date</label>
            <input id="tf-end" type="date">
          </div>
        </div>
        <div class="form-group">
          <label>Notes</label>
          <textarea id="tf-notes" placeholder="Dosage, observations..."></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-ghost" id="cancel-trt">Cancel</button>
        <button class="btn-primary" id="save-trt">💾 Save</button>
      </div>
    </div>
  </div>`;
}

export async function initHealth() {
  try {
    [treatments, pathologies] = await Promise.all([
      api.sante.getAll(),
      api.sante.pathologies(),
    ]);
  } catch (err) {
    showToast('Cannot load health data from API', 'error');
  }

  renderStats();
  renderTreatments();
  renderPathologies();
  initFilters();
  initModals();
}

function renderStats() {
  const overdue = treatments.filter(t => t.statut === 'en_retard').length;
  const ongoing = treatments.filter(t => t.statut === 'en_cours').length;
  const sick    = pathologies.filter(p => p.statut === 'en_cours').length;
  const managed = pathologies.filter(p => p.statut === 'stable').length;

  if (overdue > 0) {
    document.getElementById('health-alert-banner').innerHTML = `
      <div class="alert-banner" style="background:linear-gradient(90deg,rgba(231,76,60,.15),rgba(231,76,60,.03));border-color:rgba(231,76,60,.4)">
        <span class="alert-banner-icon">🚨</span>
        <div class="alert-banner-text">
          <strong>${overdue} overdue vaccine${overdue > 1 ? 's' : ''}</strong>
          <span>${treatments.filter(t => t.statut === 'en_retard').map(t => t.nom_lapin).join(', ')}</span>
        </div>
        <span class="alert-banner-arrow">→</span>
      </div>`;
  }

  document.getElementById('health-stats').innerHTML = `
    <div class="stat-card accent-red">
      <div class="stat-icon">🚨</div>
      <div class="stat-label">Overdue Vaccines</div>
      <div class="stat-value">${overdue}</div>
    </div>
    <div class="stat-card accent-gold">
      <div class="stat-icon">💊</div>
      <div class="stat-label">Ongoing Treatments</div>
      <div class="stat-value">${ongoing}</div>
    </div>
    <div class="stat-card accent-red">
      <div class="stat-icon">🦠</div>
      <div class="stat-label">Sick Rabbits</div>
      <div class="stat-value">${sick}</div>
    </div>
    <div class="stat-card accent-green">
      <div class="stat-icon">✅</div>
      <div class="stat-label">Managed / Stable</div>
      <div class="stat-value">${managed}</div>
    </div>`;
}

function renderTreatments() {
  document.getElementById('trt-tbody').innerHTML = treatments.map(t => {
    const s = statusStyle[t.statut] || statusStyle.planifie;
    return `<tr data-id="${t.id}" data-tstatus="${t.statut}">
      <td class="td-id">${t.code}</td>
      <td><span style="color:#4ade80;font-size:12px">${t.nom_lapin}</span><br>
          <span style="font-size:10px;color:#A0A8A5">${t.tag_lapin}</span></td>
      <td><span class="cage-badge">${t.type_soin}</span></td>
      <td style="font-size:12px">${t.nom_traitement}</td>
      <td style="font-size:11px;color:#A0A8A5">${t.date_debut || '-'}</td>
      <td style="font-size:11px;color:#A0A8A5">${t.date_fin  || '-'}</td>
      <td><span class="status ${s.cls}">${s.label}</span></td>
      <td class="action-cell">
        <button class="action-btn mark-done" data-id="${t.id}" title="Mark done">✓</button>
        <button class="action-btn danger del-trt" data-id="${t.id}" title="Delete">🗑</button>
      </td>
    </tr>`;
  }).join('') || `<tr><td colspan="8" style="text-align:center;color:#A0A8A5;padding:20px">No treatments</td></tr>`;
}

function renderPathologies() {
  document.getElementById('path-list').innerHTML = pathologies.map(p => {
    const ps = pathStyle[p.statut]    || { cls: 'gray', label: p.statut };
    const sv = sevStyle[p.severite]   || { cls: 'gray', label: p.severite };
    return `
    <div class="event-item" style="flex-direction:column;gap:6px;padding:10px 0">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:13px;font-weight:600;color:#E0E6E4">${p.maladie}</span>
        <span class="status ${ps.cls}">${ps.label}</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <span style="color:#4ade80;font-size:12px">🐇 ${p.nom_lapin}</span>
        <span style="font-size:10px;color:#A0A8A5">${p.tag_lapin}</span>
        <span class="status ${sv.cls}" style="margin-left:auto;font-size:9px">${sv.label}</span>
      </div>
      <div style="font-size:11px;color:#A0A8A5">📅 ${p.date_diagnostic || '-'} · ${p.notes || ''}</div>
    </div>`;
  }).join('') || `<p style="color:#A0A8A5;font-size:12px">No pathologies recorded</p>`;
}

function initFilters() {
  document.querySelectorAll('[data-tfilter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-tfilter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.tfilter;
      document.querySelectorAll('#trt-tbody tr').forEach(tr => {
        tr.style.display = (f === 'all' || tr.dataset.tstatus === f) ? '' : 'none';
      });
    });
  });
}

function initModals() {
  document.getElementById('trt-table').addEventListener('click', async e => {
    const doneBtn = e.target.closest('.mark-done');
    const delBtn  = e.target.closest('.del-trt');

    if (doneBtn) {
      try {
        await api.sante.update(doneBtn.dataset.id, { statut: 'termine' });
        const tr = doneBtn.closest('tr');
        tr.dataset.tstatus = 'termine';
        tr.querySelector('.status').className   = 'status green';
        tr.querySelector('.status').textContent = 'Done';
        showToast('Treatment marked as done ✅');
      } catch (err) {
        showToast(err.message, 'error');
      }
    }

    if (delBtn) {
      if (!confirm('Remove this treatment?')) return;
      try {
        await api.sante.delete(delBtn.dataset.id);
        delBtn.closest('tr').remove();
        showToast('Treatment removed');
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  });

  document.getElementById('btn-add-treatment').addEventListener('click', () => {
    document.getElementById('modal-treatment').classList.add('open');
  });

  ['close-trt','cancel-trt'].forEach(id => {
    document.getElementById(id).addEventListener('click', () => {
      document.getElementById('modal-treatment').classList.remove('open');
    });
  });

  document.getElementById('modal-treatment').addEventListener('click', e => {
    if (e.target.id === 'modal-treatment') {
      document.getElementById('modal-treatment').classList.remove('open');
    }
  });

  document.getElementById('save-trt').addEventListener('click', async () => {
    const tag  = document.getElementById('tf-rabbit-tag').value.trim();
    const name = document.getElementById('tf-name').value.trim();
    if (!tag || !name) { alert('Rabbit Tag ID and Treatment Name are required'); return; }

    try {
      const lapins = await api.lapins.getAll({ search: tag });
      const lapin  = lapins.find(l => l.tag === tag);
      if (!lapin) { alert(`No rabbit found with tag: ${tag}`); return; }

      const saved = await api.sante.create({
        lapin_id:       lapin.id,
        type_soin:      document.getElementById('tf-type').value,
        nom_traitement: name,
        date_debut:     document.getElementById('tf-start').value || null,
        date_fin:       document.getElementById('tf-end').value   || null,
        statut:         'planifie',
        notes:          document.getElementById('tf-notes').value.trim() || null,
      });

      treatments.unshift({ ...saved, nom_lapin: lapin.nom, tag_lapin: lapin.tag });
      renderTreatments();
      renderStats();
      document.getElementById('modal-treatment').classList.remove('open');
      showToast('Treatment added ✨');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}
