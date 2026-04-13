// admin.js - CreatorHub Admin Panel Logic

let adminSession = null;

document.addEventListener('DOMContentLoaded', () => {
  initUI();
  checkSession();
});

function initUI() {
  // Tabs Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
      
      item.classList.add('active');
      const target = item.getAttribute('data-tab');
      document.getElementById('tab-' + target).classList.add('active');
      
      if (target === 'verifications') loadVerifications();
      if (target === 'users') loadUsers();
    });
  });

  // Time Widget
  setInterval(() => {
    document.getElementById('timeWidget').innerText = new Date().toLocaleString();
  }, 1000);

  // Auth Buttons
  document.getElementById('loginBtn').addEventListener('click', handleLogin);
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
}

function showLoader(text = 'Processing...') {
  const loader = document.getElementById('globalLoader');
  loader.querySelector('.text').innerText = text;
  loader.classList.remove('hidden');
}

function hideLoader() {
  document.getElementById('globalLoader').classList.add('hidden');
}

// --- Supabase Authentication ---

async function checkSession() {
  if (!supabaseClient) {
    document.getElementById('authError').innerText = "Supabase not initialized! Check config.js.";
    return;
  }

  showLoader('Authenticating...');
  const { data: { session }, error } = await supabaseClient.auth.getSession();
  
  if (session) {
    // Verify if this user is actually an admin in the database.
    // In a real scenario, you'd use RLS or a specific admins table.
    // For now, we trust the login.
    adminSession = session;
    showDashboard();
  } else {
    showLogin();
  }
  hideLoader();
}

async function handleLogin() {
  const email = document.getElementById('adminEmail').value.trim();
  const password = document.getElementById('adminPassword').value;
  const errDiv = document.getElementById('authError');

  if (!email || !password) {
    errDiv.innerText = "Please enter both email and password.";
    return;
  }

  showLoader('Verifying Credentials...');
  errDiv.innerText = "";

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      errDiv.innerText = error.message;
    } else if (!data || !data.session) {
      errDiv.innerText = "Login succeeded but no active session was returned. Did you confirm your email?";
    } else {
      adminSession = data.session;
      showDashboard();
    }
  } catch (err) {
    console.error("Login Exception:", err);
    errDiv.innerText = "A critical error occurred: " + err.message;
  } finally {
    hideLoader();
  }
}

async function handleLogout() {
  showLoader('Signing off...');
  await supabaseClient.auth.signOut();
  adminSession = null;
  showLogin();
  hideLoader();
}

function showDashboard() {
  document.getElementById('authGate').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  
  document.getElementById('adminName').innerText = adminSession.user.email.split('@')[0];
  document.getElementById('adminAvatar').innerText = adminSession.user.email.charAt(0).toUpperCase();
  
  loadOverview();
}

function showLogin() {
  document.getElementById('authGate').classList.remove('hidden');
  document.getElementById('dashboard').classList.add('hidden');
}

// --- Data Fetching ---

async function loadOverview() {
  document.getElementById('statUsers').innerText = "...";
  document.getElementById('statSellers').innerText = "...";
  document.getElementById('statServices').innerText = "...";

  try {
    const { count: userCount, error: errC } = await supabaseClient.from('sellers').select('*', { count: 'exact', head: true });
    const { count: svcCount, error: errS } = await supabaseClient.from('services').select('*', { count: 'exact', head: true });
    const { count: orderCount, error: errO } = await supabaseClient.from('orders').select('*', { count: 'exact', head: true });
    
    document.getElementById('statUsers').innerText = orderCount || "0";
    document.getElementById('statSellers').innerText = userCount || "0";
    document.getElementById('statServices').innerText = svcCount || "0";
  } catch (e) {
    document.getElementById('statUsers').innerText = "0";
    document.getElementById('statSellers').innerText = "0";
    document.getElementById('statServices').innerText = "0";
  }
}

async function loadVerifications() {
  const tbody = document.getElementById('verificationsTableBody');
  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 40px; color:var(--text-muted);">Fetching pending verifications...</td></tr>';
  
  try {
    const { data: pendings, error } = await supabaseClient.from('seller_applications').select('*').eq('status', 'pending');
    
    if (error || !pendings || pendings.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 40px;">No pending applications! 🎉</td></tr>';
      document.getElementById('verificationCount').innerText = "0";
      return;
    }
    
    document.getElementById('verificationCount').innerText = pendings.length;
    
    tbody.innerHTML = pendings.map(app => `
      <tr>
        <td style="font-weight:600;">${app.name} <div class="text-xs text-muted">${app.email || app.id}</div></td>
        <td>${new Date(app.applied_date).toLocaleDateString()}</td>
        <td>${app.category}</td>
        <td><span class="badge" style="background:rgba(217, 119, 6, 0.2); color:var(--gold);">Pending</span></td>
        <td>
          <button class="btn btn-primary btn-sm" onclick="approveSeller('${app.id}')">Approve</button>
          <button class="btn btn-ghost btn-sm" style="color:var(--red);" onclick="rejectSeller('${app.id}')">Reject</button>
        </td>
      </tr>
    `).join('');
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 40px; color:var(--red);">Failed to load data.</td></tr>';
    document.getElementById('verificationCount').innerText = "0";
  }
}

async function loadUsers() {
  // Similar logic to fetch all users.
  document.getElementById('usersTableBody').innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 40px;">System user fetching will be tied to Supabase Admin Endpoint.</td></tr>';
}

function approveSeller(id) {
  alert(`In production, this will UPDATE users SET is_verified = true WHERE id = '${id}'`);
}
function rejectSeller(id) {
  alert(`In production, this will DELETE FROM seller_applications WHERE id = '${id}'`);
}
