/**
 * pages/admin.js — MediQueue Admin Dashboard
 */

function renderAdmin() {
  document.getElementById('admin-root').innerHTML = `
    <div class="page-header">
      <div class="page-title">Admin Dashboard</div>
      <div class="page-sub">All departments · Real-time monitoring</div>
    </div>

    <!-- KPI STATS -->
    <div class="grid-4" style="margin-bottom:20px">
      ${statCardHTML({ label:'Total Patients', value:'247', desc:'Active & waiting',     accentColor:'var(--blue-500)' })}
      ${statCardHTML({ label:'Served Today',   value:'183', desc:'Consultations done',   accentColor:'var(--green-500)' })}
      ${statCardHTML({ label:'Avg Wait',       value:'18',  suffix:'min', desc:'↓ 6 min vs last week', accentColor:'var(--amber-500)' })}
      ${statCardHTML({ label:'Emergencies',    value:'3',   desc:'Priority escalated',   accentColor:'var(--red-500)' })}
    </div>

    <!-- TABS -->
    <div class="tabs">
      <button class="tab active" onclick="switchTab('admin','queues',this)">All Queues</button>
      <button class="tab"        onclick="switchTab('admin','walkin',this)">Walk-in</button>
      <button class="tab"        onclick="switchTab('admin','doctors',this)">Doctors</button>
      <button class="tab"        onclick="switchTab('admin','analytics',this)">Analytics</button>
    </div>

    <!-- TAB: ALL QUEUES -->
    <div id="admin-queues" class="tab-content active">
      <div class="grid-3" id="allQueuesGrid"></div>
    </div>

    <!-- TAB: WALK-IN -->
    <div id="admin-walkin" class="tab-content">
      <div class="grid-2">
        <div class="card">
          <div class="card-header"><div class="card-title">Add Walk-in Patient</div></div>
          <div class="form-group">
            <label class="form-label">Patient Name</label>
            <input class="form-input" placeholder="Full name" id="wi-name" />
          </div>
          <div class="form-group">
            <label class="form-label">Age</label>
            <input class="form-input" type="number" placeholder="Age" id="wi-age" min="0" max="120" />
          </div>
          <div class="form-group">
            <label class="form-label">Department</label>
            <select class="form-select" id="wi-dept">
              ${Object.keys(DATA.deptPrefix).map(d => `<option>${d}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Priority</label>
            <select class="form-select" id="wi-priority">
              <option value="standard">Standard</option>
              <option value="elderly">Elderly (65+)</option>
              <option value="emergency">Emergency</option>
              <option value="vip">VIP</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Symptoms (optional)</label>
            <input class="form-input" placeholder="Brief description" id="wi-symptoms" />
          </div>
          <button class="btn btn-primary btn-block" onclick="addWalkIn()">+ Assign Token &amp; Add to Queue</button>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Recent Walk-ins</div></div>
          <div id="walkinList"></div>
        </div>
      </div>
    </div>

    <!-- TAB: DOCTORS -->
    <div id="admin-doctors" class="tab-content">
      <div class="card">
        <div class="card-header">
          <div class="card-title">Doctor Management</div>
          <button class="btn btn-primary btn-sm" onclick="showToast('Add doctor — connect to backend')">+ Add Doctor</button>
        </div>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr><th>Doctor</th><th>Department</th><th>Room</th><th>Status</th><th>Queue</th><th>Avg Time</th><th>Served</th><th>Actions</th></tr>
            </thead>
            <tbody id="doctorTableBody"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB: ANALYTICS -->
    <div id="admin-analytics" class="tab-content">
      <div class="grid-2" style="margin-bottom:16px">
        <div class="card">
          <div class="card-header">
            <div class="card-title">Patients by Hour</div>
            <div class="card-sub">Today's flow</div>
          </div>
          <div class="bar-chart" id="hourlyChart" style="margin-top:8px"></div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Department Load</div></div>
          <div id="deptLoadChart" style="margin-top:4px"></div>
        </div>
      </div>
      <div class="grid-3">
        <div class="card">
          <div class="card-title" style="margin-bottom:12px">Priority Breakdown</div>
          <div id="priorityBreakdown"></div>
        </div>
        <div class="card">
          <div class="card-title" style="margin-bottom:12px">Wait Time Trend</div>
          <div id="waitTimeTrend"></div>
        </div>
        <div class="card">
          <div class="card-title" style="margin-bottom:12px">Peak Hours</div>
          <div id="peakHoursChart"></div>
        </div>
      </div>
    </div>`;

  _renderAllQueues();
  _renderWalkInList();
  _renderDoctorTable();
  _renderAnalytics();
}

// ── QUEUES ─────────────────────────────────────────────────────
function _renderAllQueues() {
  const el = document.getElementById('allQueuesGrid');
  if (!el) return;
  el.innerHTML = DATA.departments.map(d => deptQueueCardHTML(d)).join('');
}

// ── WALK-INS ───────────────────────────────────────────────────
function _renderWalkInList() {
  const el = document.getElementById('walkinList');
  if (!el) return;
  if (!DATA.walkIns.length) {
    el.innerHTML = '<div class="empty-state"><div class="icon">🚶</div><p>No walk-ins today yet</p></div>';
    return;
  }
  el.innerHTML = DATA.walkIns.map(w => `
    <div class="queue-row">
      <div class="queue-num">${w.token}</div>
      <div style="flex:1">
        <div class="queue-name">${w.name}</div>
        <div class="queue-meta">${w.dept} · ${w.time}</div>
      </div>
      ${priorityBadge(w.priority)}
    </div>`).join('');
}

function addWalkIn() {
  const name     = (document.getElementById('wi-name').value.trim()) || 'Walk-in Patient';
  const age      = document.getElementById('wi-age').value || '—';
  const dept     = document.getElementById('wi-dept').value;
  const priority = document.getElementById('wi-priority').value;
  const token    = generateToken(dept);

  // Validate
  if (name === 'Walk-in Patient') {
    showToast('⚠ Please enter the patient name');
    return;
  }

  DATA.walkIns.unshift({ token, name, age, dept, priority, time: nowTimeStr() });

  // Clear form
  document.getElementById('wi-name').value     = '';
  document.getElementById('wi-age').value      = '';
  document.getElementById('wi-symptoms').value = '';

  // Update dept queue count
  const deptObj = DATA.departments.find(d => d.name === dept);
  if (deptObj) deptObj.queue++;

  _renderWalkInList();
  _renderAllQueues();
  showToast(`✓ Token ${token} assigned to ${name}`);
}

// ── DOCTORS ────────────────────────────────────────────────────
function _renderDoctorTable() {
  const tbody = document.getElementById('doctorTableBody');
  if (!tbody) return;
  tbody.innerHTML = DATA.doctors.map(d => `
    <tr>
      <td><b>${d.name}</b></td>
      <td>${d.dept}</td>
      <td><span style="font-family:var(--mono);font-size:12px">${d.room}</span></td>
      <td>${statusBadge(d.status)}</td>
      <td><span class="badge badge-blue">${d.queue}</span></td>
      <td>${d.avg}</td>
      <td>${d.served}</td>
      <td>
        <div style="display:flex;gap:4px">
          <button class="btn btn-ghost btn-sm" onclick="showToast('Editing ${d.name}')">Edit</button>
          <button class="btn btn-ghost btn-sm" onclick="toggleDoctorStatus('${d.name}')">
            ${d.status === 'active' ? 'Pause' : 'Activate'}
          </button>
        </div>
      </td>
    </tr>`).join('');
}

function toggleDoctorStatus(name) {
  const doc = DATA.doctors.find(d => d.name === name);
  if (doc) {
    doc.status = doc.status === 'active' ? 'break' : 'active';
    _renderDoctorTable();
    showToast(`${name} status → ${doc.status}`);
  }
}

// ── ANALYTICS ──────────────────────────────────────────────────
function _renderAnalytics() {
  _renderHourlyChart();
  _renderDeptLoad();
  _renderPriorityBreakdown();
  _renderWaitTrend();
  _renderPeakHours();
}

function _renderHourlyChart() {
  const el = document.getElementById('hourlyChart');
  if (!el) return;
  const max = Math.max(...DATA.hourlyFlow.map(d => d.v));
  el.innerHTML = DATA.hourlyFlow.map(d => `
    <div class="bar-wrap">
      <div class="bar-val">${d.v}</div>
      <div class="bar" style="height:${Math.round((d.v / max) * 65) + 4}px;background:${d.v === max ? 'var(--blue-600)' : 'var(--blue-200)'}"></div>
      <div class="bar-label">${d.h}</div>
    </div>`).join('');
}

function _renderDeptLoad() {
  const el = document.getElementById('deptLoadChart');
  if (!el) return;
  el.innerHTML = DATA.departments.map(d => {
    const pct = Math.min(100, d.queue * 8);
    const clr = d.queue > 9 ? 'var(--red-400)' : d.queue > 6 ? 'var(--amber-400)' : 'var(--blue-400)';
    return `
      <div style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
          <span style="font-weight:500;color:var(--gray-700)">${d.name}</span>
          <span style="color:var(--gray-400)">${d.queue} patients</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${pct}%;background:${clr}"></div>
        </div>
      </div>`;
  }).join('');
}

function _renderPriorityBreakdown() {
  const el = document.getElementById('priorityBreakdown');
  if (!el) return;
  const rows = [
    ['Standard', 182, 'badge-gray'],
    ['Elderly',  38,  'badge-amber'],
    ['Emergency',18,  'badge-red'],
    ['VIP',       9,  'badge-purple'],
  ];
  el.innerHTML = `<div style="display:flex;flex-direction:column;gap:8px">` +
    rows.map(([label, n, cls]) => `
      <div style="display:flex;align-items:center;gap:8px">
        <span class="badge ${cls}" style="min-width:72px;justify-content:center">${label}</span>
        <div class="progress-bar" style="flex:1">
          <div class="progress-fill" style="width:${Math.round(n / 2.47)}%;background:var(--blue-300)"></div>
        </div>
        <span style="font-size:12px;font-weight:600;color:var(--gray-700);min-width:28px;text-align:right">${n}</span>
      </div>`).join('') + `</div>`;
}

function _renderWaitTrend() {
  const el = document.getElementById('waitTimeTrend');
  if (!el) return;
  const data = [['Mon','24 min'],['Tue','21 min'],['Wed','19 min'],['Thu','22 min'],['Fri','18 min']];
  el.innerHTML = `<div style="display:flex;flex-direction:column;gap:0">` +
    data.map(([day, val]) => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--gray-100);font-size:12px">
        <span style="color:var(--gray-500)">${day}</span>
        <span style="font-weight:600;color:var(--gray-700)">${val}</span>
      </div>`).join('') + `</div>`;
}

function _renderPeakHours() {
  const el = document.getElementById('peakHoursChart');
  if (!el) return;
  const rows = [
    ['10–11 AM','🔴','Peak','45'],
    ['3–4 PM',  '🟠','High','42'],
    ['9–10 AM', '🟡','Med', '28'],
    ['2–3 PM',  '🟡','Med', '30'],
    ['8–9 AM',  '🟢','Low', '12'],
  ];
  el.innerHTML = `<div style="display:flex;flex-direction:column;gap:0">` +
    rows.map(([t, dot, level, n]) => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--gray-100);font-size:12px">
        <span style="color:var(--gray-500);min-width:70px">${t}</span>
        <span>${dot} ${level}</span>
        <span style="font-weight:600;color:var(--gray-700)">${n} pts</span>
      </div>`).join('') + `</div>`;
}
