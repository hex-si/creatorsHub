// auth.js
function triggerAuthRender() {
  const user = localStorage.getItem('creatorHubUser');
  const authBtns = document.querySelectorAll('#authLoginBtn');
  
  if (user) {
    const parsedUser = JSON.parse(user);
    authBtns.forEach(btn => {
      btn.outerHTML = `
        <div class="user-dropdown" style="display:flex; align-items:center; gap:8px; cursor:pointer;" onclick="toggleUserDropdown()">
          <img src="${parsedUser.picture}" style="width:32px; height:32px; border-radius:50%; border:2px solid var(--purple-500);" />
          <span style="font-size:0.875rem; font-weight:600;">${parsedUser.name}</span>
        </div>
        <div id="userMenu" style="display:none; position:absolute; top:60px; right:20px; background:var(--bg-card); border:1px solid var(--border-medium); border-radius:var(--radius-md); padding:10px; z-index:100; min-width:150px;">
          <button onclick="mockLogout()" class="btn btn-ghost w-full" style="text-align:left; color:var(--red-400)">Sign Out</button>
        </div>
      `;
    });
  }
}

function openAuthModal() {
  let modal = document.getElementById('authModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'authModal';
    modal.style.position = 'fixed';
    modal.style.inset = '0';
    modal.style.background = 'rgba(0,0,0,0.8)';
    modal.style.backdropFilter = 'blur(5px)';
    modal.style.zIndex = '9999';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    
    modal.innerHTML = `
      <div class="glass-card" style="width:90%; max-width:400px; padding:32px; position:relative;">
        <button onclick="closeAuthModal()" style="position:absolute; top:16px; right:16px; background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:1.2rem;">✕</button>
        <h2 style="font-size:1.5rem; font-weight:800; margin-bottom:8px; text-align:center;">Welcome to CreatorHub</h2>
        <p style="color:var(--text-secondary); text-align:center; font-size:0.9rem; margin-bottom:24px;">Sign in to hire local talent instantly.</p>
        
        <button onclick="mockGoogleLogin()" class="btn w-full" style="background:white; color:#333; font-weight:600; display:flex; align-items:center; justify-content:center; gap:12px; margin-bottom:16px;">
          <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </button>
        <p style="text-align:center; font-size:0.8rem; color:var(--text-muted); margin-top:24px;">By signing in, you agree to our Terms and Privacy Policy.</p>
      </div>
    `;
    document.body.appendChild(modal);
  }
  modal.style.display = 'flex';
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.style.display = 'none';
}

function mockGoogleLogin() {
  const user = {
    id: "seller-1",
    name: "Priya Sharma", 
    picture: "https://ui-avatars.com/api/?name=Priya+Sharma&background=7C3AED&color=fff&size=200&bold=true",
    email: "priya@example.com"
  };
  localStorage.setItem('creatorHubUser', JSON.stringify(user));
  closeAuthModal();
  window.location.reload();
}

function mockLogout() {
  localStorage.removeItem('creatorHubUser');
  window.location.reload();
}

function toggleUserDropdown() {
  const menu = document.getElementById('userMenu');
  if(menu) menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}
