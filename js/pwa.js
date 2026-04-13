// ============================================================
// pwa.js — CreatorHub PWA: Install Prompt + Push Notifications
// ============================================================

// ——— Service Worker Registration ———
async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    return reg;
  } catch (err) {
    console.warn('[PWA] SW registration failed:', err);
    return null;
  }
}

// ——— Install Prompt ———
let _deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  _deferredInstallPrompt = e;
  // Show install banner after 4 seconds if user hasn't dismissed before
  if (!localStorage.getItem('ch-install-dismissed') && !isStandalone()) {
    setTimeout(showInstallBanner, 4000);
  }
});

window.addEventListener('appinstalled', () => {
  _deferredInstallPrompt = null;
  dismissInstallBanner();
});

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
}

function showInstallBanner() {
  if (isStandalone() || document.getElementById('ch-install-banner')) return;

  const banner = document.createElement('div');
  banner.id = 'ch-install-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Install CreatorHub app');
  banner.style.cssText = `
    position:fixed; bottom:80px; left:16px; right:16px;
    background:linear-gradient(135deg,#141428 0%,#1e1e3a 100%);
    border:1px solid rgba(124,58,237,0.4); border-radius:20px;
    padding:16px 20px; display:flex; align-items:center; gap:14px;
    z-index:8998; box-shadow:0 12px 40px rgba(0,0,0,0.6);
    max-width:460px; margin:0 auto;
    animation:ch-slide-up 0.4s cubic-bezier(0.34,1.56,0.64,1);
    font-family:'Inter',sans-serif;
  `;
  banner.innerHTML = `
    <div style="font-size:2.2rem;flex-shrink:0;line-height:1">⚡</div>
    <div style="flex:1;min-width:0;">
      <div style="font-weight:700;font-size:0.95rem;color:#F8F8FF;margin-bottom:2px;">Install CreatorHub</div>
      <div style="font-size:0.78rem;color:rgba(248,248,255,0.55);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Add to home screen for the best experience</div>
    </div>
    <button id="ch-install-btn" style="
      background:linear-gradient(135deg,#7C3AED,#A855F7); color:white;
      border:none; border-radius:12px; padding:9px 16px;
      font-size:0.82rem; font-weight:700; cursor:pointer; flex-shrink:0;
      font-family:'Inter',sans-serif; white-space:nowrap;
    ">Install</button>
    <button id="ch-install-dismiss" aria-label="Dismiss" style="
      background:none; border:none; color:rgba(248,248,255,0.35);
      font-size:1.2rem; cursor:pointer; padding:4px; flex-shrink:0;
    ">✕</button>
  `;

  if (!document.getElementById('ch-pwa-styles')) {
    const style = document.createElement('style');
    style.id = 'ch-pwa-styles';
    style.textContent = `
      @keyframes ch-slide-up { from{transform:translateY(24px);opacity:0} to{transform:translateY(0);opacity:1} }
      @keyframes ch-slide-in-right { from{transform:translateX(16px);opacity:0} to{transform:translateX(0);opacity:1} }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(banner);
  banner.querySelector('#ch-install-btn').addEventListener('click', triggerInstall);
  banner.querySelector('#ch-install-dismiss').addEventListener('click', dismissInstallBanner);
}

async function triggerInstall() {
  if (!_deferredInstallPrompt) return;
  _deferredInstallPrompt.prompt();
  await _deferredInstallPrompt.userChoice;
  _deferredInstallPrompt = null;
  dismissInstallBanner();
}

function dismissInstallBanner() {
  document.getElementById('ch-install-banner')?.remove();
  localStorage.setItem('ch-install-dismissed', '1');
}

// ——— Push Notification Permission ———
// 📋 FIREBASE SETUP (do this once after creating your Firebase project):
// 1. Go to console.firebase.google.com → New Project → "creatorhub"
// 2. Settings → General → Web App → Register → Copy config
// 3. Settings → Cloud Messaging → Generate Web Push cert → Copy VAPID key
// 4. Replace VAPID_KEY below with your key
// 5. Replace the firebase config in the <script> tag you add to index.html with your config

const VAPID_KEY = 'woK_mXf7gPPmqQbKhn2mXbRxUQS1Y4v6fsVlOaC1sKE'; // 🔑 Replace with Firebase VAPID key

async function requestPushPermission() {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return false;
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

async function subscribeToPush() {
  const reg = await navigator.serviceWorker.ready;
  if (!reg.pushManager) return null;

  // Skip if VAPID key is placeholder
  if (VAPID_KEY === 'YOUR_VAPID_PUBLIC_KEY') {
    console.warn('[PWA] Push: Set your VAPID key in js/pwa.js to enable real push notifications.');
    return null;
  }

  try {
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: _urlB64ToUint8Array(VAPID_KEY),
    });
    // 📋 Send `sub` to your backend / Firebase Function to store it
    // await fetch('/api/push/subscribe', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(sub) });
    localStorage.setItem('ch-push-subscribed', '1');
    return sub;
  } catch (err) {
    console.warn('[PWA] Push subscription failed:', err);
    return null;
  }
}

function _urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

// ——— Show local notification (no backend needed — works immediately) ———
async function showLocalNotification(title, body, url = '/') {
  if (Notification.permission !== 'granted') {
    const granted = await requestPushPermission();
    if (!granted) return;
  }
  try {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url },
      vibrate: [200, 100, 200],
      tag: 'ch-local-' + Date.now(),
    });
  } catch (e) {
    // Fallback if SW not ready
    new Notification(title, { body, icon: '/icon-192.png' });
  }
}

// ——— Notification Permission Prompt (shown after 10s on first visit) ———
function _showNotifPrompt() {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'default') return;
  if (localStorage.getItem('ch-notif-dismissed')) return;
  if (isStandalone()) return; // Already installed — they'll get notified later

  setTimeout(() => {
    if (document.getElementById('ch-notif-prompt')) return;
    const el = document.createElement('div');
    el.id = 'ch-notif-prompt';
    el.style.cssText = `
      position:fixed; top:80px; right:16px; z-index:8997;
      background:linear-gradient(135deg,#141428,#1e1e3a);
      border:1px solid rgba(124,58,237,0.35); border-radius:18px;
      padding:16px 18px; max-width:300px; font-family:'Inter',sans-serif;
      box-shadow:0 8px 32px rgba(0,0,0,0.5);
      animation:ch-slide-in-right 0.4s cubic-bezier(0.34,1.56,0.64,1);
    `;
    el.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
        <span style="font-size:1.6rem;flex-shrink:0">🔔</span>
        <div>
          <div style="font-weight:700;font-size:0.9rem;color:#F8F8FF;">Stay updated</div>
          <div style="color:rgba(248,248,255,0.55);font-size:0.75rem;margin-top:2px;">Get notified when creators respond to you</div>
        </div>
      </div>
      <div style="display:flex;gap:8px;">
        <button id="ch-notif-enable" style="
          flex:1;background:linear-gradient(135deg,#7C3AED,#A855F7);
          color:white;border:none;border-radius:10px;padding:9px;
          font-size:0.82rem;font-weight:700;cursor:pointer;font-family:'Inter',sans-serif;
        ">Enable</button>
        <button id="ch-notif-skip" style="
          flex:1;background:rgba(255,255,255,0.05);color:rgba(248,248,255,0.6);
          border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:9px;
          font-size:0.82rem;cursor:pointer;font-family:'Inter',sans-serif;
        ">Not now</button>
      </div>
    `;
    document.body.appendChild(el);

    el.querySelector('#ch-notif-enable').addEventListener('click', async () => {
      el.remove();
      const granted = await requestPushPermission();
      if (granted) {
        localStorage.setItem('ch-notif-enabled', '1');
        showLocalNotification('🎉 Notifications on!', 'You\'ll hear from creators instantly.', '/');
      }
    });
    el.querySelector('#ch-notif-skip').addEventListener('click', () => {
      el.remove();
      localStorage.setItem('ch-notif-dismissed', '1');
    });
  }, 10000);
}

// ——— Init ———
document.addEventListener('DOMContentLoaded', () => {
  registerServiceWorker();
  _showNotifPrompt();
});
