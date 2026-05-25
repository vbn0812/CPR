/* ═══════════════════════════════════════════════
   間歇性心肺復甦術 — script.js
═══════════════════════════════════════════════ */

'use strict';

/* ─── Global state ─── */
let activeTimers = [];       // setInterval / setTimeout handles to clear on navigate
let countdownTimers = {};    // per-page countdown state { pageId: intervalId }

/* ════════════════════════════════════════════
   Page Navigation
════════════════════════════════════════════ */
function showPage(id) {
  // 1. 先清空目前所有正在跑的計時器（5秒、10秒自動跳轉等）
  clearAllTimers();
  
  // 2. 終極修正：找出畫面上所有帶著 active 的殘留頁面，全部扒掉 active 並強制隱形
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
    page.style.opacity = '0';
    page.style.pointerEvents = 'none'; // 沒亮出來的頁面一律不准接收觸控
  });

  // 3. 抓取我們接下來要前往的目標頁面
  const next = document.getElementById(id);
  if (!next) return;

  // 4. 強制讓目標頁面單獨亮起、啟動觸控功能
  next.classList.add('active');
  
  // 5. 用最安全的補幀動畫，讓目標頁面平滑淡入
  requestAnimationFrame(() => {
    next.style.opacity = '1';
    next.style.pointerEvents = 'auto'; // 只有這一頁能接收點擊
    
    // 執行該頁面專屬的進入計時邏輯（例如 page-15 的 10秒倒數）
    onPageEnter(id);
  });
}

/* Called once whenever a page becomes active */
function onPageEnter(id) {
  switch (id) {
    case 'page-14-2':
      startCountdown('countdown-14-2', 5, 'page-15');
      break;
    case 'page-15':
      startCountdown('countdown-15', 10, 'page-16');
      break;
    case 'page-16':
      startCountdown(null, 3, 'page-17');   // 1-second auto-advance
      break;
    case 'page-17':
      startTimer('timer-17', 117, 'page-18');   // 2 min phase 1
      break;
    case 'page-18':
      startRestAutoAdvance('page-19', 3);
      break;
    case 'page-19':
      startTimer('timer-19', 15, 'page-20');
      break;
    case 'page-20':
      startRestAutoAdvance('page-21', 3);
      break;
    case 'page-21':
      startTimer('timer-21', 15, 'page-22');
      break;
    case 'page-22':
      startRestAutoAdvance('page-23', 3);
      break;
    case 'page-23':
      startTimer('timer-23', 15, 'page-24');
      break;
    case 'page-24':
      startRestAutoAdvance('page-19', 3);   // loop back to start of phase 2
      break;
  }
}

/* ════════════════════════════════════════════
   Timer helpers
════════════════════════════════════════════ */

/** Generic countdown displayed in #elementId, fires showPage(nextPage) at 0 */
function startCountdown(elementId, seconds, nextPage) {
  let remaining = seconds;

  if (elementId) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = remaining;
  }

  const id = setInterval(() => {
    remaining--;

    if (elementId) {
      const el = document.getElementById(elementId);
      if (el) el.textContent = Math.max(0, remaining);
    }

    if (remaining <= 0) {
      clearInterval(id);
      activeTimers = activeTimers.filter(t => t !== id);
      showPage(nextPage);
    }
  }, 1000);

  activeTimers.push(id);
  return id;
}

/** Press timer — shows elapsed seconds and fires next page when done */
function startTimer(elementId, totalSeconds, nextPage) {
  const el = document.getElementById(elementId);
  let elapsed = 0;

  if (el) el.textContent = pad(elapsed);

  const id = setInterval(() => {
    elapsed++;
    if (el) el.textContent = pad(elapsed);

    if (elapsed >= totalSeconds) {
      clearInterval(id);
      activeTimers = activeTimers.filter(t => t !== id);
      showPage(nextPage);
    }
  }, 1000);

  activeTimers.push(id);
  return id;
}

/** Rest pages — auto-advance with a visual 3-second countdown on screen */
function startRestAutoAdvance(nextPage, delaySeconds) {
  const id = setTimeout(() => {
    activeTimers = activeTimers.filter(t => t !== id);
    showPage(nextPage);
  }, delaySeconds * 1000);

  activeTimers.push(id);
  return id;
}

/** Zero-pad a number to 2 digits */
function pad(n) {
  return String(n).padStart(2, '0');
}

/** Clears all pending timers */
function clearAllTimers() {
  activeTimers.forEach(id => {
    clearInterval(id);
    clearTimeout(id);
  });
  activeTimers = [];
}

/* ════════════════════════════════════════════
   Modal helpers
════════════════════════════════════════════ */
function openModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.remove('open');
  document.body.style.overflow = '';
}

/* Close modal on Escape key */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => {
      m.classList.remove('open');
    });
    document.body.style.overflow = '';
  }
});

/* ════════════════════════════════════════════
   Sidebar buttons (page 11)
   — Book icon → page 3 (教學)
   — Gear icon → (no-op placeholder for settings)
════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const sidebarIcons = document.querySelectorAll('.sidebar-icon');
  if (sidebarIcons.length >= 1) {
    sidebarIcons[0].addEventListener('click', () => showPage('page-3'));
  }
  // Gear icon: placeholder for future settings
  if (sidebarIcons.length >= 2) {
    sidebarIcons[1].addEventListener('click', () => {
      // Could open a settings modal in the future
      console.log('Settings tapped');
    });
  }

  /* Pre-hide all pages except the first active one */
  document.querySelectorAll('.page:not(.active)').forEach(p => {
    p.style.opacity = '0';
  });
});

/* ════════════════════════════════════════════
   Swipe / touch gesture support for teaching pages
════════════════════════════════════════════ */
const TEACH_PAGES = [
  { id: 'page-3', prev: null,      next: 'page-6'  },
  { id: 'page-6', prev: 'page-3',  next: 'page-7'  },
  { id: 'page-7', prev: 'page-6',  next: 'page-8'  },
  { id: 'page-8', prev: 'page-7',  next: 'page-9'  },
  { id: 'page-9', prev: 'page-8',  next: 'page-10' },
];

let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;

  // Only register horizontal swipes that are clearly dominant
  if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return;

  const activePage = document.querySelector('.page.active');
  if (!activePage) return;

  const entry = TEACH_PAGES.find(p => p.id === activePage.id);
  if (!entry) return;

  if (dx < 0 && entry.next)  showPage(entry.next);   // swipe left → next
  if (dx > 0 && entry.prev)  showPage(entry.prev);   // swipe right → prev
}, { passive: true });

/* ════════════════════════════════════════════
   Wake lock — keep screen on during CPR
   (best-effort; silently fails on older browsers)
════════════════════════════════════════════ */
let wakeLock = null;

async function requestWakeLock() {
  if ('wakeLock' in navigator) {
    try {
      wakeLock = await navigator.wakeLock.request('screen');
    } catch (_) { /* ignore */ }
  }
}

async function releaseWakeLock() {
  if (wakeLock) {
    try { await wakeLock.release(); } catch (_) {}
    wakeLock = null;
  }
}

// Acquire wake lock when timer pages are active
const TIMER_PAGES = ['page-16','page-17','page-18','page-19',
                     'page-20','page-21','page-22','page-23','page-24'];

const _origShowPage = showPage;
window.showPage = function(id) {
  if (TIMER_PAGES.includes(id)) {
    requestWakeLock();
  } else {
    releaseWakeLock();
  }
  _origShowPage(id);
};

/* ════════════════════════════════════════════
   Haptic feedback (Vibration API)
   — short pulse on button taps during CPR
════════════════════════════════════════════ */
function vibrate(pattern) {
  if ('vibrate' in navigator) {
    try { navigator.vibrate(pattern); } catch (_) {}
  }
}

// Add haptic on CPR circle press
document.addEventListener('DOMContentLoaded', () => {
  const cprCircle = document.querySelector('.cpr-circle');
  if (cprCircle) {
    cprCircle.addEventListener('click', () => vibrate(30));
  }
});

/* ════════════════════════════════════════════
   Progress dot sync
   (dots are static in HTML but kept in sync if
    pages are re-entered during phase-2 loop)
════════════════════════════════════════════ */
// Nothing extra needed — dots are baked into HTML per design.
