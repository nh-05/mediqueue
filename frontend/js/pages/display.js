/**
 * pages/display.js — MediQueue Queue Display Screen
 * Designed for hospital waiting area TVs.
 */

let _clockInterval = null;
let _announceIndex = 0;

const ANNOUNCEMENTS = [
  '📢 Token A-044 please proceed to Cardiology — Room OPD-3B',
  '📢 Token B-022 please proceed to Orthopedics — Room OPD-1A',
  '🚨 Emergency: please report to General Medicine immediately',
  '📢 Token C-015 please proceed to Pediatrics — Room OPD-5C',
  '📢 Token D-038 please proceed to General Medicine — Room OPD-2A',
];

function renderDisplay() {
  document.getElementById('display-root').innerHTML = `
    <div class="display-screen">
      <div class="display-header">
        <div class="display-title">MediQueue · City General Hospital</div>
        <div class="display-time" id="displayClock">--:--:--</div>
      </div>
      <div class="display-grid" id="displayGrid"></div>
      <div class="display-announce" id="displayAnnounce">
        📢 Token A-044 please proceed to Cardiology — Room OPD-3B
      </div>
    </div>

    <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap;align-items:center">
      <div class="chip active"  onclick="_filterDisplay(this,'all')">All Departments</div>
      <div class="chip"         onclick="_filterDisplay(this,'card')">Cardiology</div>
      <div class="chip"         onclick="_filterDisplay(this,'ortho')">Orthopedics</div>
      <div class="chip"         onclick="_filterDisplay(this,'peds')">Pediatrics</div>
      <div class="chip"         onclick="_filterDisplay(this,'gm')">General Medicine</div>
      <button class="btn btn-ghost btn-sm" style="margin-left:auto" onclick="simulateNextCall()">🔔 Simulate Call</button>
    </div>

    <div class="card" style="margin-top:16px">
      <div class="card-header">
        <div class="card-title">Display Screen Guide</div>
      </div>
      <div style="font-size:13px;color:var(--gray-600);line-height:1.7">
        <p>This screen is designed for large TVs in hospital waiting areas. It auto-refreshes every 10 seconds.</p>
        <p style="margin-top:6px">Click <b>Simulate Call</b> to cycle through voice announcements. In production, this is triggered automatically when a doctor calls the next patient.</p>
      </div>
    </div>`;

  _renderDisplayGrid(null);
  _startClock();
}

function _renderDisplayGrid(filterDeptId) {
  const el = document.getElementById('displayGrid');
  if (!el) return;
  const depts = filterDeptId ? DATA.departments.filter(d => d.id === filterDeptId) : DATA.departments;
  el.innerHTML = depts.map(d => `
    <div class="display-dept">
      <div class="display-dept-name">${d.name} · ${d.room}</div>
      <div class="display-current">Now serving</div>
      <div class="display-token-big">${d.current}</div>
      <div class="display-next-list">
        ${d.next.slice(0, 3).map(t => `
          <div class="display-next-item">
            <span style="color:rgba(255,255,255,.5);font-size:11px">Next</span>
            <span style="font-weight:600;font-variant-numeric:tabular-nums">${t}</span>
          </div>`).join('')}
      </div>
    </div>`).join('');
}

function _startClock() {
  if (_clockInterval) clearInterval(_clockInterval);
  _clockInterval = setInterval(() => {
    const el = document.getElementById('displayClock');
    if (el) {
      el.textContent = new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
      });
    } else {
      clearInterval(_clockInterval);
    }
  }, 1000);
  // Trigger once immediately
  const el = document.getElementById('displayClock');
  if (el) el.textContent = new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false });
}

function simulateNextCall() {
  const el = document.getElementById('displayAnnounce');
  if (!el) return;
  el.textContent = ANNOUNCEMENTS[_announceIndex++ % ANNOUNCEMENTS.length];
  showToast('🔔 Voice announcement triggered');
}

function _filterDisplay(chipEl, deptId) {
  document.querySelectorAll('#display-root .chip').forEach(c => c.classList.remove('active'));
  chipEl.classList.add('active');
  _renderDisplayGrid(deptId === 'all' ? null : deptId);
}
