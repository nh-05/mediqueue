/**
 * pages/doctor.js — MediQueue Doctor Console
 */

function renderDoctor() {
  const curr = DATA.docQueue[DATA.currentDocIndex];

  document.getElementById('doctor-root').innerHTML = `
    <div class="page-header">
      <div class="page-title">Doctor Console</div>
      <div class="page-sub">Dr. Priya Nair · Cardiology · Room OPD-3B</div>
    </div>

    <!-- STATS -->
    <div class="grid-4" style="margin-bottom:20px">
      ${statCardHTML({ label:'Total Today',  value:'24', desc:'Scheduled patients',   accentColor:'var(--blue-500)' })}
      ${statCardHTML({ label:'Completed',    value: String(DATA.currentDocIndex + 11), desc:'Consultations done', accentColor:'var(--green-500)' })}
      ${statCardHTML({ label:'Remaining',    value: String(DATA.docQueue.length - DATA.currentDocIndex - 1), desc:'In queue', accentColor:'var(--amber-500)' })}
      ${statCardHTML({ label:'Avg Consult',  value:'7', suffix:'min', desc:'Per patient today',  accentColor:'var(--teal-500)' })}
    </div>

    <div class="grid-2">
      <!-- CURRENT PATIENT -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Current Patient</div>
            <div class="card-sub">Now consulting</div>
          </div>
          <span class="badge badge-green"><span class="dot"></span>In Session</span>
        </div>
        <div id="currentPatientDetail"></div>
        <div style="display:flex;gap:8px;margin-top:16px">
          <button class="btn btn-green btn-block" onclick="completeConsult()">✓ Complete &amp; Call Next</button>
          <button class="btn btn-ghost btn-sm" onclick="holdPatient()">Hold</button>
        </div>
      </div>

      <!-- QUEUE -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Queue</div>
            <div class="card-sub">Upcoming patients</div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="callNext()">Call Next</button>
        </div>
        <div id="doctorQueueList"></div>
      </div>
    </div>

    <!-- TIMELINE -->
    <div class="card" style="margin-top:16px">
      <div class="card-header"><div class="card-title">Today's Activity</div></div>
      <div class="timeline">
        <div class="tl-item">
          <div class="tl-dot" style="background:var(--green-500)"></div>
          <div class="tl-time">9:00</div>
          <div class="tl-text">Started consultations · First token A-034</div>
        </div>
        <div class="tl-item">
          <div class="tl-dot" style="background:var(--blue-500)"></div>
          <div class="tl-time">10:15</div>
          <div class="tl-text">Emergency case A-041 prioritized — Chest pain</div>
        </div>
        <div class="tl-item">
          <div class="tl-dot" style="background:var(--amber-500)"></div>
          <div class="tl-time">10:30</div>
          <div class="tl-text">Short break · Queue paused 5 min</div>
        </div>
        <div class="tl-item">
          <div class="tl-dot" style="background:var(--blue-500)"></div>
          <div class="tl-time">10:42</div>
          <div class="tl-text">Resumed · Calling ${curr.token} (current)</div>
        </div>
      </div>
    </div>`;

  _renderCurrentPatient();
  _renderDoctorQueue();
}

function _renderCurrentPatient() {
  const el = document.getElementById('currentPatientDetail');
  if (!el) return;
  const curr = DATA.docQueue[DATA.currentDocIndex];

  el.innerHTML = `
    <div style="display:flex;gap:14px;align-items:flex-start;margin-bottom:14px">
      <div class="patient-avatar" style="width:52px;height:52px;font-size:18px;${avatarStyle(curr.priority)}">
        ${initials(curr.name)}
      </div>
      <div style="flex:1">
        <div style="font-size:16px;font-weight:600;color:var(--gray-800)">${curr.name}</div>
        <div style="font-size:12px;color:var(--gray-400)">Age ${curr.age} · ${curr.gender === 'M' ? 'Male' : 'Female'}</div>
        <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">
          ${priorityBadge(curr.priority)}
          <span class="badge badge-gray">${curr.token}</span>
        </div>
      </div>
      <div style="text-align:right">
        <div style="font-size:11px;color:var(--gray-400)">Token</div>
        <div style="font-size:22px;font-weight:700;color:var(--blue-600);font-variant-numeric:tabular-nums">${curr.token}</div>
      </div>
    </div>
    <div style="background:var(--gray-50);border-radius:8px;padding:10px;display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <div>
        <div style="font-size:10px;color:var(--gray-400);text-transform:uppercase;letter-spacing:.05em">Reason</div>
        <div style="font-size:13px;font-weight:500;margin-top:2px">${curr.reason}</div>
      </div>
      <div>
        <div style="font-size:10px;color:var(--gray-400);text-transform:uppercase;letter-spacing:.05em">History</div>
        <div style="font-size:13px;font-weight:500;margin-top:2px">${curr.history}</div>
      </div>
    </div>`;
}

function _renderDoctorQueue() {
  const el = document.getElementById('doctorQueueList');
  if (!el) return;
  const queue = DATA.docQueue.slice(DATA.currentDocIndex + 1, DATA.currentDocIndex + 8);
  if (!queue.length) {
    el.innerHTML = '<div class="empty-state"><div class="icon">✓</div><p>Queue is empty</p></div>';
    return;
  }
  el.innerHTML = queue.map(p => queueRowHTML(p)).join('');
}

// ── ACTIONS ────────────────────────────────────────────────────
function completeConsult() {
  if (DATA.currentDocIndex < DATA.docQueue.length - 1) {
    DATA.currentDocIndex++;
    showToast('✓ Consultation complete · Calling ' + DATA.docQueue[DATA.currentDocIndex].token);
    renderDoctor();
  } else {
    showToast('✓ All patients served for today!');
  }
}

function callNext() {
  completeConsult();
}

function holdPatient() {
  showToast('⏸ Patient placed on hold — queue paused');
}
