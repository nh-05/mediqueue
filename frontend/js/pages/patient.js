/**
 * pages/patient.js — MediQueue Patient Dashboard
 */

function renderPatient() {
  document.getElementById('patient-root').innerHTML = `
    <div class="page-header">
      <div class="page-title">Patient Dashboard</div>
      <div class="page-sub">Welcome back, Arjun Sharma — Token A-047 is active</div>
    </div>

    <div class="grid-2" style="margin-bottom:20px">
      <!-- TOKEN CARD -->
      ${tokenCardHTML({
        token: 'A-047', dept: 'Cardiology', doctor: 'Dr. Priya Nair',
        wait: '3 patients ahead', time: '10:30 AM', priority: 'standard', room: 'OPD-3B'
      })}

      <!-- QUEUE PROGRESS -->
      <div class="card" style="display:flex;flex-direction:column;gap:12px">
        <div class="card-header" style="margin-bottom:0">
          <div class="card-title">Queue Progress</div>
          <span class="badge badge-green"><span class="dot"></span>Active</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:12px;color:var(--gray-500)">Current serving</span>
            <span style="font-size:18px;font-weight:700;color:var(--blue-600);font-variant-numeric:tabular-nums">A-044</span>
          </div>
          <div class="progress-bar" style="height:8px">
            <div class="progress-fill" style="width:72%;background:var(--blue-500)"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--gray-400)">
            <span>A-001</span>
            <span>Your position: <b style="color:var(--gray-700)">A-047</b></span>
            <span>A-052</span>
          </div>
        </div>
        <div style="border-top:1px solid var(--gray-100);padding-top:12px">
          <div style="font-size:12px;font-weight:500;color:var(--gray-600);margin-bottom:8px">Upcoming in queue</div>
          <div id="upcomingQueueList"></div>
        </div>
        <button class="btn btn-primary btn-block" onclick="openBookModal()">+ Book New Appointment</button>
      </div>
    </div>

    <!-- TABS -->
    <div class="tabs">
      <button class="tab active"  onclick="switchTab('patient','appointments',this)">Appointments</button>
      <button class="tab"         onclick="switchTab('patient','history',this)">History</button>
      <button class="tab"         onclick="switchTab('patient','notifications',this)">
        Notifications <span class="badge badge-red" style="padding:1px 6px;font-size:10px">3</span>
      </button>
      <button class="tab"         onclick="switchTab('patient','profile',this)">Profile</button>
    </div>

    <!-- TAB: APPOINTMENTS -->
    <div id="patient-appointments" class="tab-content active">
      <div class="grid-2">
        <div class="card">
          <div class="card-header">
            <div class="card-title">Today's Appointments</div>
            <button class="btn btn-ghost btn-sm" onclick="openBookModal()">+ Book</button>
          </div>
          <div id="todayApptList"></div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Upcoming Appointments</div></div>
          <div id="upcomingApptList"></div>
        </div>
      </div>
    </div>

    <!-- TAB: HISTORY -->
    <div id="patient-history" class="tab-content">
      <div class="card">
        <div class="card-header"><div class="card-title">Visit History</div></div>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr><th>Date</th><th>Department</th><th>Doctor</th><th>Token</th><th>Wait</th><th>Status</th></tr>
            </thead>
            <tbody id="historyTableBody"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB: NOTIFICATIONS -->
    <div id="patient-notifications" class="tab-content">
      <div class="card">
        <div class="card-header">
          <div class="card-title">Notifications</div>
          <button class="btn btn-ghost btn-sm" onclick="showToast('All notifications marked as read')">Mark all read</button>
        </div>
        <div id="notificationList"></div>
      </div>
    </div>

    <!-- TAB: PROFILE -->
    <div id="patient-profile" class="tab-content">
      <div class="grid-2">
        <div class="card">
          <div class="card-header">
            <div class="card-title">Personal Information</div>
            <button class="btn btn-ghost btn-sm" onclick="showToast('Edit form — connect to backend')">Edit</button>
          </div>
          <div style="display:flex;flex-direction:column;gap:10px">
            <div style="display:flex;gap:14px;align-items:center;padding-bottom:12px;border-bottom:1px solid var(--gray-100)">
              <div class="patient-avatar" style="width:56px;height:56px;font-size:20px;background:var(--blue-100);color:var(--blue-700)">AS</div>
              <div>
                <div style="font-size:16px;font-weight:600;color:var(--gray-800)">Arjun Sharma</div>
                <div style="font-size:12px;color:var(--gray-400)">Patient ID: MQ-200847</div>
              </div>
            </div>
            <div class="form-row">
              <div><div class="form-label">Age</div><div style="font-size:13px;color:var(--gray-700)">34 years</div></div>
              <div><div class="form-label">Blood Group</div><div style="font-size:13px;color:var(--gray-700)">B+</div></div>
            </div>
            <div><div class="form-label">Phone</div><div style="font-size:13px;color:var(--gray-700)">+91 98765 43210</div></div>
            <div><div class="form-label">Email</div><div style="font-size:13px;color:var(--gray-700)">arjun.sharma@email.com</div></div>
            <div><div class="form-label">Address</div><div style="font-size:13px;color:var(--gray-700)">42, MG Road, Kochi, Kerala — 682001</div></div>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">QR Check-in</div></div>
          <div style="display:flex;flex-direction:column;align-items:center;gap:12px;padding:10px 0">
            <div class="qr-box" style="width:120px;height:120px;font-size:40px">⬛</div>
            <div style="text-align:center">
              <div style="font-size:13px;font-weight:500;color:var(--gray-700)">Scan at reception to check in</div>
              <div style="font-size:11px;color:var(--gray-400);margin-top:2px">Patient ID: MQ-200847</div>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="showToast('QR downloaded')">Download QR</button>
          </div>
        </div>
      </div>
    </div>`;

  // Populate dynamic sections
  _renderUpcomingQueue();
  _renderTodayAppts();
  _renderUpcomingAppts();
  _renderHistoryTable();
  _renderNotifications();
}

function _renderUpcomingQueue() {
  const el = document.getElementById('upcomingQueueList');
  if (!el) return;
  el.innerHTML = DATA.docQueue.slice(1, 4).map(p => `
    <div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--gray-100)">
      <span style="font-size:13px;font-weight:700;color:var(--gray-500);min-width:50px;font-variant-numeric:tabular-nums">${p.token}</span>
      <span style="font-size:12px;flex:1;color:var(--gray-700)">${p.name}</span>
      ${priorityBadge(p.priority)}
    </div>`).join('');
}

function _renderTodayAppts() {
  const el = document.getElementById('todayApptList');
  if (!el) return;
  el.innerHTML = `
    <div class="notif" style="border-color:var(--blue-200);background:var(--blue-50)">
      <div class="notif-icon" style="background:var(--blue-100)">💙</div>
      <div style="flex:1">
        <div class="notif-title">Cardiology — Dr. Priya Nair</div>
        <div class="notif-time">10:30 AM · Room OPD-3B · Token A-047</div>
        <div style="margin-top:6px"><span class="badge badge-green">Active</span></div>
      </div>
    </div>`;
}

function _renderUpcomingAppts() {
  const el = document.getElementById('upcomingApptList');
  if (!el) return;
  el.innerHTML = `
    <div class="notif">
      <div class="notif-icon" style="background:var(--gray-100)">🦴</div>
      <div style="flex:1">
        <div class="notif-title">Orthopedics — Dr. Suresh Iyer</div>
        <div class="notif-time">Tomorrow · 11:00 AM · Room OPD-1A</div>
        <div style="margin-top:6px"><span class="badge badge-blue">Confirmed</span></div>
      </div>
    </div>
    <div class="notif" style="margin-top:8px">
      <div class="notif-icon" style="background:var(--gray-100)">🔬</div>
      <div style="flex:1">
        <div class="notif-title">Dermatology — Dr. Deepa Nambiar</div>
        <div class="notif-time">Apr 15 · 3:00 PM · Room OPD-4B</div>
        <div style="margin-top:6px"><span class="badge badge-gray">Upcoming</span></div>
      </div>
    </div>`;
}

function _renderHistoryTable() {
  const tbody = document.getElementById('historyTableBody');
  if (!tbody) return;
  tbody.innerHTML = DATA.patientHistory.map(h => `
    <tr>
      <td>${h.date}</td>
      <td>${h.dept}</td>
      <td>${h.doctor}</td>
      <td><span style="font-weight:600;color:var(--blue-600);font-variant-numeric:tabular-nums">${h.token}</span></td>
      <td>${h.wait}</td>
      <td><span class="badge badge-green">Completed</span></td>
    </tr>`).join('');
}

function _renderNotifications() {
  const el = document.getElementById('notificationList');
  if (!el) return;
  el.innerHTML = DATA.notifications.map(n => notifHTML(n)).join('');
}
