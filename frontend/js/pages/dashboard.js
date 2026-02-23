
export function dashboardHTML() {
  const dashboardHTML =
    `
  <div class="page-header">
    <div>
      <h2 class="page-title">Welcome back, Admin 👋</h2>
      <p class="page-sub" id="current-date">Sunday, 22 February 2026 &bull; Dashboard overview</p>
    </div>
  </div>

  <div class="alert-banner">
    <span class="alert-banner-icon">🚨</span>
    <div class="alert-banner-text">
      <strong>3 alerts require your attention today</strong>
      <span>Critical hay stock &bull; 2 expected births in 48h &bull; 1 overdue vaccine</span>
    </div>
    <span class="alert-banner-arrow">→</span>
  </div>

    <div class="stats-row">
    <div class="stat-card accent-green">
      <div class="stat-icon">🐇</div>
      <div class="stat-label">Active Rabbits</div>
      <div class="stat-value">38</div>
      <div class="stat-sub">
        <span class="stat-change up">&#9650; +3</span>
        <span>this month</span>
      </div>
    </div>
    <div class="stat-card accent-blue">
      <div class="stat-icon">🤰</div>
      <div class="stat-label">Pregnant Females</div>
      <div class="stat-value">8</div>
      <div class="stat-sub">
        <span class="stat-change neutral">&#9654; stable</span>
      </div>
    </div>
    <div class="stat-card accent-gold">
      <div class="stat-icon">🐣</div>
      <div class="stat-label">Expected Births</div>
      <div class="stat-value">2</div>
      <div class="stat-sub">
        <span class="stat-change warn">⚠ within 48h</span>
      </div>
    </div>
    <div class="stat-card accent-red">
      <div class="stat-icon">💀</div>
      <div class="stat-label">Deaths (month)</div>
      <div class="stat-value">2</div>
      <div class="stat-sub">
        <span class="stat-change down">&#9660; +1 vs last</span>
      </div>
    </div>
  </div>

        <div class="quick-actions-row">
    <button class="qa-btn">
      <span class="qa-icon">➕</span>
      <span>Add Rabbit</span>
    </button>
    <button class="qa-btn">
      <span class="qa-icon">💞</span>
      <span>New Mating</span>
    </button>
    <button class="qa-btn">
      <span class="qa-icon">⚖️</span>
      <span>Weigh Rabbit</span>
    </button>
    <button class="qa-btn">
      <span class="qa-icon">💊</span>
      <span>Add Treatment</span>
    </button>
    <button class="qa-btn">
      <span class="qa-icon">🌾</span>
      <span>Feed Distribution</span>
    </button>
    <button class="qa-btn">
      <span class="qa-icon">💰</span>
      <span>Record Sale</span>
    </button>
  </div>

  <div class="middle-row">

    <!-- Alerts & Events (sources: accouplements, suivis_sante, evenements) -->
    <div class="card">
      <div class="card-header">
        <span>🚨 Alerts &amp; Events</span>
        <a href="#" class="card-link">View all →</a>
      </div>
      <div class="event-item">
        <div class="alert-dot red pulse"></div>
        <div class="alert-info">
          <div class="alert-title">Expected Birth · Noisette #LP-2023-003</div>
          <div class="alert-desc">Cage B-01 · Mating #14 · Day 31 · Prepare maternity cage</div>
        </div>
        <span class="alert-badge urgent">URGENT</span>
      </div>
      <div class="event-item">
        <div class="alert-dot red"></div>
        <div class="alert-info">
          <div class="alert-title">Overdue Vaccine · Atlas, Rex, Oscar</div>
          <div class="alert-desc">VHD vaccine · Due: 20 Feb · 3 rabbits</div>
        </div>
        <span class="alert-badge urgent">OVERDUE</span>
      </div>
      <div class="event-item">
        <div class="alert-dot gold"></div>
        <div class="alert-info">
          <div class="alert-title">Cage Overcrowded · Cage B-03</div>
          <div class="alert-desc">2 rabbits · Individual max: 1</div>
        </div>
        <span class="alert-badge warn">WARN</span>
      </div>
      <div class="event-item">
        <div class="alert-dot gold"></div>
        <div class="alert-info">
          <div class="alert-title">Low Hay Stock</div>
          <div class="alert-desc">12 kg remaining · Threshold: 20 kg</div>
        </div>
        <span class="alert-badge warn">STOCK</span>
      </div>
      <div class="event-item">
        <div class="alert-dot green"></div>
        <div class="alert-info">
          <div class="alert-title">Birth · Litter #13 · Cleo</div>
          <div class="alert-desc">5 healthy kittens · Cage C-01</div>
        </div>
        <span class="alert-time">2h ago</span>
      </div>
    </div>

    <!-- Statistics Overview (sources: indicateurs_performance, lapins) -->
    <div class="card">
      <div class="card-header">
        <span>📊 Statistics Overview</span>
        <a href="#" class="card-link">Details →</a>
      </div>
      <div class="key-stats">
        <div class="kstat">
          <div class="kstat-label"><span>Birth Rate</span><span class="kstat-val green-text">85%</span></div>
          <div class="kstat-bar"><div class="kstat-fill green" style="width:85%"></div></div>
        </div>
      </div>
      <div class="key-stats">
        <div class="kstat">
          <div class="kstat-label"><span>Survival Rate</span><span class="kstat-val green-text">92%</span></div>
          <div class="kstat-bar"><div class="kstat-fill green" style="width:92%"></div></div>
        </div>
      </div>
      <div class="key-stats">
        <div class="kstat">
          <div class="kstat-label"><span>Mortality Rate</span><span class="kstat-val red-text">8%</span></div>
          <div class="kstat-bar"><div class="kstat-fill red" style="width:8%"></div></div>
        </div>
      </div>
      <div class="key-stats">
        <div class="kstat">
          <div class="kstat-label"><span>Pregnant Females</span><span class="kstat-val gold-text">33%</span></div>
          <div class="kstat-bar"><div class="kstat-fill gold" style="width:33%"></div></div>
        </div>
      </div>
      <div class="key-stats">
        <div class="kstat">
          <div class="kstat-label"><span>Avg. Litter Size</span><span class="kstat-val green-text">6.2</span></div>
          <div class="kstat-bar"><div class="kstat-fill green" style="width:62%"></div></div>
        </div>
      </div>
      <div class="key-stats">
        <div class="kstat">
          <div class="kstat-label"><span>Avg. Weaning Weight</span><span class="kstat-val gold-text">580g</span></div>
          <div class="kstat-bar"><div class="kstat-fill gold" style="width:58%"></div></div>
        </div>
      </div>

      <!-- Feed Stocks (sources: stocks_aliment, v_alertes_stock) -->
      <div class="card-sub-header">🌾 Feed Stocks</div>
      <div class="stock-item">
        <div class="stock-top">
          <span class="stock-name">Hay</span>
          <span class="stock-qty red-text">12 kg</span>
        </div>
        <div class="kstat-bar"><div class="kstat-fill red" style="width:24%"></div></div>
        <div class="stock-meta">⚠ Critical · Threshold: 20 kg</div>
      </div>
      <div class="stock-item">
        <div class="stock-top">
          <span class="stock-name">Pellets</span>
          <span class="stock-qty gold-text">8 kg</span>
        </div>
        <div class="kstat-bar"><div class="kstat-fill gold" style="width:32%"></div></div>
        <div class="stock-meta">⚠ Low · Threshold: 15 kg</div>
      </div>
      <div class="stock-item">
        <div class="stock-top">
          <span class="stock-name">Greens</span>
          <span class="stock-qty green-text">45 kg</span>
        </div>
        <div class="kstat-bar"><div class="kstat-fill green" style="width:90%"></div></div>
        <div class="stock-meta">✅ OK · Expires: 05 Mar</div>
      </div>
    </div>

    <!-- Recent Activities (source: evenements) -->
    <div class="card">
      <div class="card-header">
        <span>🕐 Recent Activities</span>
        <a href="#" class="card-link">All events →</a>
      </div>
      <div class="activity-item">
        <div class="activity-dot green"></div>
        <div class="activity-info">
          <div class="activity-title">Birth · Litter #13 · 5 kittens</div>
          <div class="activity-time">Today, 10:30 AM · Cleo LP-2024-019</div>
        </div>
      </div>
      <div class="activity-item">
        <div class="activity-dot gold"></div>
        <div class="activity-info">
          <div class="activity-title">Sale · Petit Paul LP-2024-002</div>
          <div class="activity-time">Today, 09:15 AM · 45,000 Ar</div>
        </div>
      </div>
      <div class="activity-item">
        <div class="activity-dot green"></div>
        <div class="activity-info">
          <div class="activity-title">Weigh · Atlas · 4.20 kg</div>
          <div class="activity-time">Yesterday, 02:00 PM</div>
        </div>
      </div>
      <div class="activity-item">
        <div class="activity-dot red"></div>
        <div class="activity-info">
          <div class="activity-title">Treatment · Blanche · VHD Vaccine</div>
          <div class="activity-time">Yesterday, 11:00 AM</div>
        </div>
      </div>
      <div class="activity-item">
        <div class="activity-dot gold"></div>
        <div class="activity-info">
          <div class="activity-title">Transfer · Luna → Cage B-02</div>
          <div class="activity-time">2 days ago · Gestation</div>
        </div>
      </div>
      <div class="activity-item">
        <div class="activity-dot green"></div>
        <div class="activity-info">
          <div class="activity-title">Mating #16 planned · Atlas × Cleo</div>
          <div class="activity-time">2 days ago</div>
        </div>
      </div>
    </div>
  </div>

  <div class="bottom-row">
    <div class="bottom-row-header">
      <span class="card-head">Recently Added Rabbits</span>
      <a href="livestock.html" class="view-btn">View All →</a>
    </div>
    <table class="livestock-table">
      <thead>
        <tr>
          <th>TAG / ID</th>
          <th>NAME</th>
          <th>GENDER</th>
          <th>BREED</th>
          <th>AGE</th>
          <th>CAGE</th>
          <th>WEIGHT</th>
          <th>STATUS</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="td-id">LP-2024-015</td>
          <td>Oscar</td>
          <td><span class="sex-badge male">♂ M</span></td>
          <td>Flemish Giant</td>
          <td>5 months</td>
          <td><span class="cage-badge">A-04</span></td>
          <td>3.10 kg</td>
          <td><span class="status green">Healthy</span></td>
        </tr>
        <tr>
          <td class="td-id">LP-2024-008</td>
          <td>Blanche</td>
          <td><span class="sex-badge female">♀ F</span></td>
          <td>Rex</td>
          <td>6 months</td>
          <td><span class="cage-badge">C-01</span></td>
          <td>2.40 kg</td>
          <td><span class="status green">Healthy</span></td>
        </tr>
        <tr>
          <td class="td-id">LP-2024-002</td>
          <td>Petit Paul</td>
          <td><span class="sex-badge male">♂ M</span></td>
          <td>Californian</td>
          <td>8 months</td>
          <td>—</td>
          <td>2.90 kg</td>
          <td><span class="status gold">Sold</span></td>
        </tr>
      </tbody>
    </table>
  </div>
`
  return dashboardHTML;
}
