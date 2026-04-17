/**
 * pages/home.js — MediQueue Home Page
 */

function renderHome() {
  document.getElementById('home-root').innerHTML = `
    <!-- HERO -->
    <div class="hero">
      <h1>Smart Hospital Queue Management</h1>
      <p>Reduce wait times, improve patient flow, and give every patient a seamless experience with real-time queue intelligence.</p>
      <div class="hero-btns">
        <button class="btn btn-white btn-lg" onclick="navigate('patient')">Book Appointment</button>
        <button class="btn btn-outline-white btn-lg" onclick="navigate('display')">View Queue Display</button>
      </div>
    </div>

    <!-- KPI STATS -->
    <div class="grid-4" style="margin-bottom:24px">
      ${statCardHTML({ label:'Patients Today', value:'247', desc:'↑ 12% from yesterday', accentColor:'var(--blue-500)' })}
      ${statCardHTML({ label:'Avg Wait Time', value:'18', suffix:'min', desc:'↓ 6 min from last week', accentColor:'var(--green-500)' })}
      ${statCardHTML({ label:'Doctors Active', value:'8', desc:'Across 6 departments', accentColor:'var(--teal-500)' })}
      ${statCardHTML({ label:'Queue Efficiency', value:'94', suffix:'%', desc:'AI-optimized routing', accentColor:'var(--amber-500)' })}
    </div>

    <!-- FEATURES -->
    <div class="feature-grid">
      <div class="feature-card" onclick="navigate('patient')">
        <div class="feature-icon" style="background:var(--blue-50)">📋</div>
        <div class="feature-name">Patient Portal</div>
        <div class="feature-desc">Book appointments, get digital tokens, and track your queue in real time.</div>
      </div>
      <div class="feature-card" onclick="navigate('doctor')">
        <div class="feature-icon" style="background:var(--green-50)">🩺</div>
        <div class="feature-name">Doctor Console</div>
        <div class="feature-desc">Manage daily patient queue, call next patient, and view case details.</div>
      </div>
      <div class="feature-card" onclick="navigate('admin')">
        <div class="feature-icon" style="background:var(--amber-50)">⚙️</div>
        <div class="feature-name">Admin Dashboard</div>
        <div class="feature-desc">Monitor all queues, manage departments, analytics, and walk-in patients.</div>
      </div>
      <div class="feature-card" onclick="navigate('display')">
        <div class="feature-icon" style="background:var(--purple-50)">📺</div>
        <div class="feature-name">Queue Display</div>
        <div class="feature-desc">Hospital waiting area screen showing current tokens and next patients.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon" style="background:var(--teal-50)">🚨</div>
        <div class="feature-name">Smart Prioritization</div>
        <div class="feature-desc">Emergency, elderly, and VIP patients auto-promoted with AI scoring.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon" style="background:var(--red-50)">📱</div>
        <div class="feature-name">Notifications</div>
        <div class="feature-desc">SMS and email alerts when your turn is 2–3 patients away.</div>
      </div>
    </div>

    <!-- LIVE STATUS TABLE -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Live Hospital Status</div>
          <div class="card-sub">Updated every 30 seconds</div>
        </div>
        <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--green-600);font-weight:500">
          <div class="live-dot"></div>LIVE
        </div>
      </div>
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Department</th><th>Doctor</th><th>Current Token</th>
              <th>Queue Length</th><th>Est. Wait</th><th>Status</th>
            </tr>
          </thead>
          <tbody id="liveStatusTable"></tbody>
        </table>
      </div>
    </div>`;

  renderLiveTable();
}

function renderLiveTable() {
  const tbody = document.getElementById('liveStatusTable');
  if (!tbody) return;
  tbody.innerHTML = DATA.departments.map(d => `
    <tr>
      <td><b>${d.name}</b></td>
      <td>${d.doctors[0]}</td>
      <td><span style="font-weight:700;color:var(--blue-600);font-variant-numeric:tabular-nums">${d.current}</span></td>
      <td><span class="badge badge-blue">${d.queue} waiting</span></td>
      <td>${d.avg} min</td>
      <td><span class="badge badge-green"><span class="dot"></span>Active</span></td>
    </tr>`).join('');
}
