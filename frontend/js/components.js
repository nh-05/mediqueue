/**
 * components.js — MediQueue Reusable UI Components
 */

// ── TOKEN CARD ────────────────────────────────────────────────
function tokenCardHTML({ token, dept, doctor, wait, time, priority, room }) {
  return `
    <div class="token-card">
      <div class="token-dept">${dept} · ${doctor}</div>
      <div class="token-number">${token}</div>
      <div class="token-status">⏳ ${wait}</div>
      <div class="token-info">
        <div class="token-info-item">
          <div class="token-info-label">Booked</div>
          <div class="token-info-value">${time}</div>
        </div>
        <div class="token-info-item">
          <div class="token-info-label">Priority</div>
          <div class="token-info-value">${priority.charAt(0).toUpperCase() + priority.slice(1)}</div>
        </div>
        <div class="token-info-item">
          <div class="token-info-label">Room</div>
          <div class="token-info-value">${room}</div>
        </div>
        <div class="token-info-item">
          <div class="token-info-label">Status</div>
          <div class="token-info-value">Active</div>
        </div>
      </div>
    </div>`;
}

// ── STAT CARD ─────────────────────────────────────────────────
function statCardHTML({ label, value, suffix, desc, accentColor }) {
  return `
    <div class="stat-card">
      <div class="accent" style="background:${accentColor}"></div>
      <div class="stat-label">${label}</div>
      <div class="stat-value">${value}${suffix ? `<span>${suffix}</span>` : ''}</div>
      <div class="stat-desc">${desc}</div>
    </div>`;
}

// ── QUEUE ROW ─────────────────────────────────────────────────
function queueRowHTML(p, isCurrent = false) {
  return `
    <div class="queue-row${isCurrent ? ' current' : ''}">
      <div class="queue-num">${p.token}</div>
      <div style="flex:1">
        <div class="queue-name">${p.name}</div>
        <div class="queue-meta">Age ${p.age} · ${p.reason}</div>
      </div>
      ${priorityBadge(p.priority)}
      <div class="queue-meta" style="min-width:48px;text-align:right">${p.wait} min</div>
    </div>`;
}

// ── NOTIFICATION ITEM ─────────────────────────────────────────
function notifHTML(n) {
  return `
    <div class="notif" style="${n.unread ? 'background:var(--blue-50);border-color:var(--blue-200)' : ''}">
      <div class="notif-icon" style="background:${n.bg}">${n.icon}</div>
      <div style="flex:1">
        <div class="notif-title">${n.type}</div>
        <div style="font-size:12px;color:var(--gray-500);margin-top:2px">${n.msg}</div>
        <div class="notif-time" style="margin-top:4px">${n.time}</div>
      </div>
      ${n.unread ? '<div style="width:8px;height:8px;border-radius:50%;background:var(--blue-500);flex-shrink:0;margin-top:4px"></div>' : ''}
    </div>`;
}

// ── DEPT QUEUE CARD (admin) ───────────────────────────────────
function deptQueueCardHTML(d) {
  const fillColor = d.queue > 8 ? 'var(--red-400)' : d.queue > 5 ? 'var(--amber-400)' : 'var(--green-400)';
  return `
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">${d.name}</div>
          <div class="card-sub">${d.doctors[0]} · ${d.room}</div>
        </div>
        <span class="badge badge-green"><span class="dot"></span>${d.queue} waiting</span>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <div>
          <div style="font-size:11px;color:var(--gray-400)">Now serving</div>
          <div style="font-size:28px;font-weight:700;color:var(--blue-600);font-variant-numeric:tabular-nums">${d.current}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:11px;color:var(--gray-400)">Avg wait</div>
          <div style="font-size:20px;font-weight:600;color:var(--gray-700)">${d.avg}m</div>
        </div>
      </div>
      <div style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--gray-400);margin-bottom:4px">
          <span>Next: ${d.next.slice(0,2).join(', ')}</span>
          <span>${d.queue} in queue</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${Math.min(100, d.queue * 9)}%;background:${fillColor}"></div>
        </div>
      </div>
      <button class="btn btn-ghost btn-sm btn-block" onclick="showToast('Detailed view: ${d.name}')">View Details</button>
    </div>`;
}

// ── BOOK APPOINTMENT MODAL ────────────────────────────────────
function renderBookModal() {
  const deptOptions = Object.keys(DATA.deptPrefix).map(d => `<option>${d}</option>`).join('');
  const html = `
    <div class="modal-overlay" id="bookModal" onclick="closeModalOnOverlay(event)">
      <div class="modal" onclick="event.stopPropagation()">
        <button class="modal-close" onclick="document.getElementById('bookModal').style.display='none'">✕</button>
        <div class="modal-title">Book Appointment</div>
        <div class="modal-sub">Fill in your details to get a queue token</div>
        <div class="form-group">
          <label class="form-label">Department</label>
          <select class="form-select" id="bk-dept" onchange="updateDoctorDropdown()">${deptOptions}</select>
        </div>
        <div class="form-group">
          <label class="form-label">Doctor</label>
          <select class="form-select" id="bk-doctor"></select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Date</label>
            <input class="form-input" type="date" id="bk-date" />
          </div>
          <div class="form-group">
            <label class="form-label">Preferred Time</label>
            <select class="form-select" id="bk-time">
              <option>Morning (9–12)</option>
              <option>Afternoon (12–4)</option>
              <option>Evening (4–7)</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Symptoms / Reason</label>
          <input class="form-input" placeholder="Brief description" id="bk-reason" />
        </div>
        <div class="form-group">
          <label class="form-label">Priority</label>
          <select class="form-select" id="bk-priority">
            <option value="standard">Standard</option>
            <option value="elderly">Elderly (65+)</option>
            <option value="emergency">Emergency</option>
          </select>
        </div>
        <button class="btn btn-primary btn-block btn-lg" onclick="bookAppointment()">Confirm &amp; Get Token</button>
      </div>
    </div>`;
  document.getElementById('modal-container').innerHTML = html;
  // Set today's date
  document.getElementById('bk-date').value = new Date().toISOString().split('T')[0];
  updateDoctorDropdown();
}

// ── TOKEN CONFIRMATION MODAL ──────────────────────────────────
function showTokenModal({ token, dept, doctor, priority, date, waitMins }) {
  const html = `
    <div class="modal-overlay" id="tokenModal" onclick="closeModalOnOverlay(event)">
      <div class="modal" onclick="event.stopPropagation()" style="text-align:center">
        <button class="modal-close" onclick="document.getElementById('tokenModal').style.display='none'">✕</button>
        <div style="font-size:14px;font-weight:500;color:var(--green-600);margin-bottom:12px">✓ Booking Confirmed!</div>
        ${tokenCardHTML({ token, dept, doctor, wait: `~${waitMins} min wait`, time: date, priority, room: 'See reception' })}
        <div style="display:flex;gap:10px;margin-top:16px">
          <button class="btn btn-ghost btn-block" onclick="showToast('PDF download — connect to backend')">Download PDF</button>
          <button class="btn btn-primary btn-block" onclick="document.getElementById('tokenModal').style.display='none';renderPatient()">Done</button>
        </div>
      </div>
    </div>`;
  document.getElementById('modal-container').innerHTML = html;
}

// ── DOCTOR DROPDOWN UPDATER ───────────────────────────────────
function updateDoctorDropdown() {
  const deptName = document.getElementById('bk-dept').value;
  const dept = DATA.departments.find(d => d.name === deptName) || DATA.departments[0];
  document.getElementById('bk-doctor').innerHTML = dept.doctors.map(doc => `<option>${doc}</option>`).join('');
}

// ── OPEN BOOK MODAL ───────────────────────────────────────────
function openBookModal() {
  renderBookModal();
  document.getElementById('bookModal').style.display = 'flex';
}

// ── BOOK APPOINTMENT HANDLER ──────────────────────────────────
function bookAppointment() {
  const dept     = document.getElementById('bk-dept').value;
  const doctor   = document.getElementById('bk-doctor').value;
  const priority = document.getElementById('bk-priority').value;
  const date     = document.getElementById('bk-date').value;
  const reason   = document.getElementById('bk-reason').value;

  if (!reason.trim()) { showToast('⚠ Please enter a reason for your visit'); return; }

  const token    = generateToken(dept);
  const waitMins = DATA.priorityWait[priority] || 22;
  const today    = new Date().toISOString().split('T')[0];

  document.getElementById('bookModal').style.display = 'none';
  showTokenModal({ token, dept, doctor, priority, date: date === today ? 'Today' : date, waitMins });
  document.getElementById('tokenModal').style.display = 'flex';
}
