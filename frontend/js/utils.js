/**
 * utils.js — MediQueue Shared Utilities
 */

// ── TOAST ──────────────────────────────────────────────────────
let _toastTimer = null;
function showToast(msg, duration = 2800) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.style.opacity = '1';
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => { el.style.opacity = '0'; }, duration);
}

// ── NAVIGATION ────────────────────────────────────────────────
function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');

  const order = ['home', 'patient', 'doctor', 'admin', 'display'];
  const idx = order.indexOf(page);
  if (idx > -1) document.querySelectorAll('.nav-tab')[idx].classList.add('active');

  const meta = {
    home:    { name: 'Demo User',      avatar: 'D'  },
    patient: { name: 'Arjun Sharma',   avatar: 'AS' },
    doctor:  { name: 'Dr. Priya Nair', avatar: 'PN' },
    admin:   { name: 'Admin',          avatar: 'AD' },
    display: { name: 'Receptionist',   avatar: 'RC' },
  };
  const m = meta[page] || meta.home;
  document.getElementById('navUserName').textContent  = m.name;
  document.getElementById('navAvatarEl').textContent = m.avatar;

  // Lazy-render pages
  if (page === 'home')    renderHome();
  if (page === 'patient') renderPatient();
  if (page === 'doctor')  renderDoctor();
  if (page === 'admin')   renderAdmin();
  if (page === 'display') renderDisplay();
}

// ── TAB SWITCHER ──────────────────────────────────────────────
function switchTab(section, tabId, btn) {
  document.querySelectorAll('#page-' + section + ' .tab-content').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('#page-' + section + ' .tab').forEach(t => t.classList.remove('active'));
  const contentEl = document.getElementById(section + '-' + tabId);
  if (contentEl) contentEl.classList.add('active');
  if (btn) btn.classList.add('active');
}

// ── MODAL HELPERS ─────────────────────────────────────────────
function closeModalOnOverlay(evt) {
  if (evt.target.classList.contains('modal-overlay')) {
    evt.target.style.display = 'none';
  }
}

// ── PRIORITY BADGE ────────────────────────────────────────────
function priorityBadge(priority) {
  const map = { emergency: 'badge-red', elderly: 'badge-amber', vip: 'badge-purple', standard: 'badge-gray' };
  const cls = map[priority] || 'badge-gray';
  const label = priority.charAt(0).toUpperCase() + priority.slice(1);
  return `<span class="badge ${cls}">${label}</span>`;
}

// ── STATUS BADGE ──────────────────────────────────────────────
function statusBadge(status) {
  if (status === 'active') return `<span class="badge badge-green"><span class="dot"></span>Active</span>`;
  if (status === 'break')  return `<span class="badge badge-amber">Break</span>`;
  return `<span class="badge badge-gray">${status}</span>`;
}

// ── INITIALS ──────────────────────────────────────────────────
function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

// ── AVATAR COLOR ─────────────────────────────────────────────
function avatarStyle(priority) {
  const colors = {
    emergency: 'background:var(--red-100);color:var(--red-700)',
    elderly:   'background:var(--amber-100);color:var(--amber-700)',
    vip:       'background:var(--purple-100);color:var(--purple-700)',
    standard:  'background:var(--blue-100);color:var(--blue-700)',
  };
  return colors[priority] || colors.standard;
}

// ── GENERATE TOKEN ────────────────────────────────────────────
function generateToken(dept) {
  const prefix = DATA.deptPrefix[dept] || 'X';
  const num = DATA.walkInCounter++;
  return `${prefix}-${String(num).padStart(3, '0')}`;
}

// ── CURRENT TIME STRING ───────────────────────────────────────
function nowTimeStr() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}
