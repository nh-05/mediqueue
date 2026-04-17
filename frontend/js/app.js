/**
 * app.js — MediQueue Application Bootstrap
 * Initializes the app, starts real-time simulation, and wires up global events.
 */

// ── BOOT ───────────────────────────────────────────────────────
(function init() {
  // Render initial page
  renderHome();

  // Real-time queue simulation (polls every 5 seconds)
  setInterval(_simulateRealtimeUpdates, 5000);

  console.log('%cMediQueue loaded ✓', 'color:#2563EB;font-weight:600;font-size:14px');
  console.log('Navigate with navigate("home" | "patient" | "doctor" | "admin" | "display")');
})();

// ── REAL-TIME SIMULATION ───────────────────────────────────────
function _simulateRealtimeUpdates() {
  // Randomly increment or decrement a queue
  const idx = Math.floor(Math.random() * DATA.departments.length);
  const dept = DATA.departments[idx];
  const delta = Math.random() > 0.45 ? 1 : -1;
  dept.queue = Math.max(0, dept.queue + delta);

  // Re-render live table if home is active
  const homePage = document.getElementById('page-home');
  if (homePage && homePage.classList.contains('active')) {
    renderLiveTable();
  }

  // Re-render admin queues if admin is active
  const adminQueues = document.getElementById('allQueuesGrid');
  if (adminQueues) {
    _renderAllQueues && _renderAllQueues();
  }

  // Re-render display if active
  const displayGrid = document.getElementById('displayGrid');
  if (displayGrid) {
    _renderDisplayGrid(null);
  }
}
