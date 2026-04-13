// ============================================================
// admin.js — Admin Dashboard Logic
// ============================================================

const ADMIN_PASSWORD = 'admin123';

// State
let sellerApps = (typeof SELLER_APPLICATIONS !== 'undefined') ? JSON.parse(JSON.stringify(SELLER_APPLICATIONS)) : [];
let sellersState = [];
let ordersState = (typeof ORDERS !== 'undefined') ? JSON.parse(JSON.stringify(ORDERS)) : [];

document.addEventListener('DOMContentLoaded', async () => {
  if (typeof getSellers === 'function') {
    try {
      sellersState = await getSellers();
    } catch(e) { console.warn(e); }
  } else if (typeof SELLERS !== 'undefined') {
    sellersState = JSON.parse(JSON.stringify(SELLERS));
  }
  initLogin();
});

// ——— Login ———
function initLogin() {
  const btn = document.getElementById('loginBtn');
  const input = document.getElementById('adminPassword');

  const tryLogin = () => {
    const val = input?.value.trim();
    if (val === ADMIN_PASSWORD) {
      document.getElementById('loginGate').style.display = 'none';
      document.getElementById('adminDashboard').style.display = 'grid';
      initDashboard();
    } else {
      document.getElementById('loginError').style.display = 'block';
      input.focus();
      input.select();
    }
  };

  btn?.addEventListener('click', tryLogin);
  input?.addEventListener('keypress', (e) => { if (e.key === 'Enter') tryLogin(); });
}

// ——— Dashboard Init ———
function initDashboard() {
  initSidebarNav();
  initMobileMenu();
  renderOverview();
  renderSellerApprovals();
  renderServiceApprovals();
  renderSubscriptions();
  renderOrders();
  renderCommissions();
  renderPerformance();

  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    document.getElementById('adminDashboard').style.display = 'none';
    document.getElementById('loginGate').style.display = 'flex';
    document.getElementById('adminPassword').value = '';
  });
}

// ——— Sidebar Navigation ———
function initSidebarNav() {
  document.querySelectorAll('.admin-nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = item.dataset.tab;
      switchTab(tab);

      // Close sidebar on mobile
      document.getElementById('adminSidebar')?.classList.remove('open');
    });
  });
}

function switchTab(tabId) {
  document.querySelectorAll('.admin-nav-item').forEach(i => i.classList.remove('active'));
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));

  document.querySelector(`[data-tab="${tabId}"]`)?.classList.add('active');
  document.getElementById(`tab-${tabId}`)?.classList.add('active');

  const titles = {
    'overview': 'Overview',
    'seller-approvals': 'Seller Approvals',
    'service-approvals': 'Service / Freelance Approvals',
    'subscriptions': 'Subscriptions',
    'orders': 'Order Management',
    'commissions': 'Commission Log',
    'performance': 'Seller Performance',
  };
  document.getElementById('adminHeaderTitle').textContent = titles[tabId] || tabId;
}

// ——— Mobile Menu ———
function initMobileMenu() {
  const toggle  = document.getElementById('adminMenuToggle');
  const sidebar = document.getElementById('adminSidebar');
  toggle?.addEventListener('click', () => sidebar?.classList.toggle('open'));
  document.addEventListener('click', (e) => {
    if (!sidebar?.contains(e.target) && !toggle?.contains(e.target)) {
      sidebar?.classList.remove('open');
    }
  });
}

// ——— Overview ———
function renderOverview() {
  renderStats();
  renderOverviewPending();
  renderOverviewOrders();
  renderRevenueChart();
}

function renderStats() {
  const totalRevenue = ordersState.reduce((sum, o) => sum + o.commission, 0);
  const activeOrders = ordersState.filter(o => o.status !== 'delivered').length;
  const activeSellers = sellersState.filter(s => s.subscriptionActive).length;
  const pendingApprovals = sellerApps.filter(a => a.status === 'pending').length;

  const grid = document.getElementById('statsGrid');
  if (!grid) return;

  grid.innerHTML = `
    <div class="stat-card purple">
      <div class="stat-card-icon">👤</div>
      <div class="stat-card-value">${activeSellers}</div>
      <div class="stat-card-label">Active Sellers</div>
      <div class="stat-card-change">+2 this month</div>
    </div>
    <div class="stat-card gold">
      <div class="stat-card-icon">💰</div>
      <div class="stat-card-value">₹${totalRevenue.toLocaleString('en-IN')}</div>
      <div class="stat-card-label">Platform Earnings</div>
      <div class="stat-card-change">Commission + Subscriptions</div>
    </div>
    <div class="stat-card green">
      <div class="stat-card-icon">📦</div>
      <div class="stat-card-value">${ordersState.length}</div>
      <div class="stat-card-label">Total Orders</div>
      <div class="stat-card-change">${activeOrders} active now</div>
    </div>
    <div class="stat-card blue">
      <div class="stat-card-icon">🔔</div>
      <div class="stat-card-value">${pendingApprovals}</div>
      <div class="stat-card-label">Pending Approvals</div>
      <div class="stat-card-change">Needs your review</div>
    </div>
  `;
}

function renderOverviewPending() {
  const container = document.getElementById('overviewPendingApprovals');
  if (!container) return;

  const pending = sellerApps.filter(a => a.status === 'pending').slice(0, 3);

  if (!pending.length) {
    container.innerHTML = '<p style="font-size:0.875rem; color:var(--text-muted); padding:var(--space-4) 0">No pending approvals 🎉</p>';
    return;
  }

  container.innerHTML = pending.map(app => `
    <div style="display:flex; align-items:center; justify-content:space-between; padding:var(--space-3) 0; border-bottom:1px solid var(--border-subtle); gap:var(--space-4)">
      <div>
        <div style="font-size:0.9rem; font-weight:600">${app.name}</div>
        <div style="font-size:0.75rem; color:var(--text-muted)">${app.category} · ${app.appliedDate}</div>
      </div>
      <div style="display:flex; gap:var(--space-2)">
        <button class="btn-approve" onclick="quickApprove('${app.id}', this)">✓</button>
        <button class="btn-reject" onclick="quickReject('${app.id}', this)">✗</button>
      </div>
    </div>
  `).join('');
}

function renderOverviewOrders() {
  const container = document.getElementById('overviewRecentOrders');
  if (!container) return;

  const recent = ordersState.slice(0, 4);

  container.innerHTML = recent.map(order => `
    <div style="display:flex; align-items:center; justify-content:space-between; padding:var(--space-3) 0; border-bottom:1px solid var(--border-subtle); gap:var(--space-4)">
      <div>
        <div style="font-size:0.875rem; font-weight:600; font-family:var(--font-heading); letter-spacing:0.04em; color:var(--purple-400)">${order.id}</div>
        <div style="font-size:0.8rem; color:var(--text-muted)">${order.serviceName.substring(0,28)}${order.serviceName.length > 28 ? '...' : ''}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:0.875rem; font-weight:700; color:var(--gold-400)">₹${order.price.toLocaleString('en-IN')}</div>
        <div class="${getStatusClass(order.status)}" style="font-size:0.7rem">${getStatusLabel(order.status)}</div>
      </div>
    </div>
  `).join('');
}

function renderRevenueChart() {
  const container = document.getElementById('revenueBars');
  if (!container) return;

  const months = [
    { label: 'Jan', subscriptions: 800, commissions: 450 },
    { label: 'Feb', subscriptions: 800, commissions: 750 },
    { label: 'Mar', subscriptions: 800, commissions: 1050 },
    { label: 'Apr', subscriptions: 800, commissions: 1245 },
  ];

  const maxVal = Math.max(...months.map(m => m.subscriptions + m.commissions));

  container.innerHTML = months.map(m => {
    const total = m.subscriptions + m.commissions;
    const height = Math.round((total / maxVal) * 120);
    return `
      <div class="revenue-bar-item">
        <div class="revenue-bar-value">₹${total.toLocaleString('en-IN')}</div>
        <div class="revenue-bar" style="height:${height}px" title="Subscriptions: ₹${m.subscriptions} | Commissions: ₹${m.commissions}"></div>
        <div class="revenue-bar-label">${m.label}</div>
      </div>
    `;
  }).join('');
}

// ——— Seller Approvals ———
function renderSellerApprovals() {
  const container = document.getElementById('sellerApprovalsContent');
  if (!container) return;

  const updateBadge = () => {
    const pending = sellerApps.filter(a => a.status === 'pending').length;
    const badge = document.getElementById('approval-badge');
    if (badge) badge.textContent = pending;
  };

  const render = () => {
    container.innerHTML = sellerApps.map(app => `
      <div class="application-card" id="app-card-${app.id}">
        <div class="application-header">
          <div>
            <div class="application-name">${app.name}</div>
            <div class="application-meta">${app.email} · 📞 ${app.phone} · Applied: ${app.appliedDate}</div>
          </div>
          <span class="status-pill status-${app.status === 'pending' ? 'pending' : app.status === 'approved' ? 'delivered' : 'cancelled'}">${app.status}</span>
        </div>

        <div class="application-body">
          <div class="application-detail">
            <strong>Category:</strong> ${CATEGORIES.find(c => c.id === app.category)?.name || app.category}
          </div>
          <div class="application-detail">
            <strong>Bio:</strong> ${app.bio}
          </div>
          <div class="application-detail">
            <strong>Portfolio:</strong> <a href="${app.portfolio}" target="_blank" rel="noopener" style="color:var(--purple-400)">${app.portfolio}</a>
          </div>
          <div class="application-detail">
            <strong>Sample Work:</strong> ${app.sampleWork}
          </div>
          <div class="application-detail">
            <strong>Pricing:</strong> ${app.suggestedPricing}
          </div>
        </div>

        ${app.status === 'pending' ? `
        <div class="table-actions">
          <button class="btn-approve" onclick="approveApplication('${app.id}')">✓ Approve</button>
          <button class="btn-reject" onclick="rejectApplication('${app.id}')">✗ Reject</button>
        </div>
        ` : `<span style="font-size:0.8rem; color:var(--text-muted)">Decision made: <strong style="color:${app.status === 'approved' ? 'var(--green-500)' : 'var(--red-400)'}">${app.status.toUpperCase()}</strong></span>`}
      </div>
    `).join('');

    updateBadge();
  };

  render();

  // Expose for inline handlers
  window.approveApplication = (id) => {
    const app = sellerApps.find(a => a.id === id);
    if (app) { app.status = 'approved'; render(); renderOverview(); showToast('✓ Seller approved!', 'success'); }
  };

  window.rejectApplication = (id) => {
    const app = sellerApps.find(a => a.id === id);
    if (app) { app.status = 'rejected'; render(); renderOverview(); showToast('✗ Seller rejected', 'error'); }
  };

  window.quickApprove = (id, btn) => {
    window.approveApplication(id);
    renderOverviewPending();
  };

  window.quickReject = (id, btn) => {
    window.rejectApplication(id);
    renderOverviewPending();
  };
}

// ——— Subscriptions ———
let subStateInitialized = false;

function renderSubscriptions() {
  const container = document.getElementById('subscriptionsContent');
  if (!container) return;

  if (!subStateInitialized) {
    // initialize payment info in sellersState for demonstration
    sellersState.forEach(seller => {
      if (!seller.hasOwnProperty('paymentStatus')) {
        const isOverdue = seller.id === 'seller-6' || seller.id === 'seller-3';
        seller.paymentStatus = isOverdue ? 'overdue' : 'paid';
        seller.lastPaid = isOverdue ? '2025-03-01' : '2025-04-01';
        seller.warned = false;
        seller.banned = false; 
      }
    });
    subStateInitialized = true;
  }

  container.innerHTML = `
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Seller</th>
            <th>Category</th>
            <th>Last Payment</th>
            <th>Status</th>
            <th>Profile Visibility</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${sellersState.map(seller => {
            const isOverdue = seller.paymentStatus === 'overdue';
            const rowClass = seller.banned ? 'style="opacity:0.6; background: rgba(239, 68, 68, 0.05);"' : '';

            return `
              <tr id="sub-row-${seller.id}" ${rowClass}>
                <td>
                  <div style="display:flex; align-items:center; gap:var(--space-3)">
                    <img src="${seller.avatar}" alt="${seller.name}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;" loading="lazy" />
                    <div>
                      <div style="font-weight:600; color:var(--text-primary)">
                        ${seller.name} ${seller.banned ? '<span style="color:var(--red-400); font-weight:800; font-size:0.7rem; margin-left:4px;">(BANNED)</span>' : ''}
                      </div>
                      <div style="font-size:0.75rem; color:var(--text-muted)">${seller.id}</div>
                    </div>
                  </div>
                </td>
                <td>${CATEGORIES.find(c => c.id === seller.category)?.name || seller.category}</td>
                <td>${seller.lastPaid}</td>
                <td>
                  <span class="${isOverdue ? 'status-pill status-pending' : 'status-pill status-delivered'}">
                    ${isOverdue ? 'Overdue' : 'Paid'}
                  </span>
                  ${seller.warned ? '<div style="font-size:0.65rem; color:var(--red-400); font-weight:bold; margin-top:4px;">Warned</div>' : ''}
                </td>
                <td>
                  <div style="display:flex; align-items:center; gap:8px;">
                     <label class="toggle-switch" title="Toggle visibility on platform">
                       <input type="checkbox" ${seller.subscriptionActive ? 'checked' : ''} 
                         onchange="toggleSeller('${seller.id}', this.checked)" ${seller.banned ? 'disabled' : ''} />
                       <span class="toggle-slider"></span>
                     </label>
                     <span style="font-size:0.75rem; color:var(--text-muted)">${seller.subscriptionActive ? 'Active' : 'Hidden'}</span>
                  </div>
                </td>
                <td>
                  <select class="form-control" style="width: 140px; padding: 6px 10px; font-size: 0.8rem; height: auto;" onchange="handleSellerAction('${seller.id}', this.value); this.value='';">
                    <option value="">Actions...</option>
                    ${isOverdue ? '<option value="mark-paid">✓ Mark as Paid</option>' : '<option value="mark-overdue">⚠ Mark Overdue</option>'}
                    ${isOverdue && !seller.warned && !seller.banned ? '<option value="warn">✉ Warn to Pay</option>' : ''}
                    ${!seller.banned ? '<option value="ban">🚫 Ban Seller</option>' : '<option value="unban">↺ Unban Seller</option>'}
                  </select>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
    <div style="padding:var(--space-4); background:rgba(245,158,11,0.06); border:1px solid rgba(245,158,11,0.2); border-radius:var(--radius-lg); font-size:0.875rem; color:var(--text-secondary); margin-top:16px;">
      💡 <strong style="color:var(--gold-400)">Auto-hide policy:</strong> Sellers who miss a payment will have their profiles hidden automatically after 5 days grace period. Warning a seller pushes an automated notification to their registered WhatsApp.
    </div>
  `;

  window.toggleSeller = (id, active) => {
    const seller = sellersState.find(s => s.id === id);
    if (seller) {
      seller.subscriptionActive = active;
      showToast(`${seller.name} profile ${active ? 'activated ✓' : 'hidden ✗'}`, active ? 'success' : 'error');
      renderStats();
      renderSubscriptions(); 
    }
  };

  window.handleSellerAction = (id, action) => {
    const seller = sellersState.find(s => s.id === id);
    if (!seller) return;

    if (action === 'mark-paid') {
      seller.paymentStatus = 'paid';
      seller.lastPaid = new Date().toISOString().split('T')[0];
      seller.warned = false;
      if (!seller.banned) seller.subscriptionActive = true; 
      showToast('Marked as paid for ' + seller.name, 'success');
    } else if (action === 'mark-overdue') {
      seller.paymentStatus = 'overdue';
      showToast('Marked as overdue for ' + seller.name, 'error');
    } else if (action === 'warn') {
      seller.warned = true;
      showToast('Warning text sent to ' + seller.name, 'success');
    } else if (action === 'ban') {
      seller.banned = true;
      seller.subscriptionActive = false;
      showToast(seller.name + ' has been BANNED', 'error');
    } else if (action === 'unban') {
      seller.banned = false;
      showToast(seller.name + ' unbanned. (Remember to toggle profile active)', 'success');
    }
    
    renderSubscriptions();
    renderStats();
  };
}

// ——— Orders ———
function renderOrders() {
  const container = document.getElementById('ordersContent');
  if (!container) return;

  const sellerOptions = sellersState.map(s => `<option value="${s.id}">${s.name}</option>`).join('');

  container.innerHTML = `
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Service</th>
            <th>Customer</th>
            <th>Amount</th>
            <th>Assign Seller</th>
            <th>Status</th>
            <th>Update</th>
          </tr>
        </thead>
        <tbody>
          ${ordersState.map(order => `
            <tr id="order-row-${order.id}">
              <td class="purple" style="font-family:var(--font-heading); letter-spacing:0.04em; font-size:0.8rem">${order.id}</td>
              <td class="font-semibold">${order.serviceName.length > 24 ? order.serviceName.substring(0,24)+'...' : order.serviceName}</td>
              <td>${order.customerName}</td>
              <td class="gold">₹${order.price.toLocaleString('en-IN')}</td>
              <td>
                <select class="assign-select" onchange="assignSeller('${order.id}', this.value)">
                  <option value="">Assign seller...</option>
                  ${sellerOptions}
                </select>
              </td>
              <td>
                <span class="${getStatusClass(order.status)}" id="status-${order.id}">${getStatusLabel(order.status)}</span>
              </td>
              <td>
                <select class="assign-select" onchange="updateOrderStatus('${order.id}', this.value)">
                  <option value="">Change status</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  window.assignSeller = (orderId, sellerId) => {
    const order = ordersState.find(o => o.id === orderId);
    const seller = sellersState.find(s => s.id === sellerId);
    if (order && seller) {
      order.sellerId = sellerId;
      order.sellerName = seller.name;
      showToast(`Assigned ${seller.name} to ${orderId}`, 'success');
    }
  };

  window.updateOrderStatus = (orderId, status) => {
    if (!status) return;
    const order = ordersState.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      const statusEl = document.getElementById(`status-${orderId}`);
      if (statusEl) {
        statusEl.className = getStatusClass(status);
        statusEl.textContent = getStatusLabel(status);
      }
      showToast(`Order ${orderId} → ${status}`, 'success');
      renderStats();
    }
  };
}

// ——— Commissions ———
function renderCommissions() {
  const container = document.getElementById('commissionsContent');
  if (!container) return;

  const totalCommission = ordersState.reduce((sum, o) => sum + o.commission, 0);
  const totalRevenue    = ordersState.reduce((sum, o) => sum + o.price, 0);

  container.innerHTML = `
    <div class="stats-grid" style="grid-template-columns:repeat(3,1fr); margin-bottom:var(--space-6)">
      <div class="stat-card gold">
        <div class="stat-card-icon">💰</div>
        <div class="stat-card-value">₹${totalCommission.toLocaleString('en-IN')}</div>
        <div class="stat-card-label">Total Commission Earned</div>
      </div>
      <div class="stat-card purple">
        <div class="stat-card-icon">📋</div>
        <div class="stat-card-value">${ordersState.length}</div>
        <div class="stat-card-label">Total Orders</div>
      </div>
      <div class="stat-card green">
        <div class="stat-card-icon">📊</div>
        <div class="stat-card-value">15%</div>
        <div class="stat-card-label">Average Commission Rate</div>
      </div>
    </div>

    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Service</th>
            <th>Seller</th>
            <th>Order Value</th>
            <th>Commission (15%)</th>
            <th>Seller Payout</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${ordersState.map(order => {
            const commission = order.commission;
            const payout = order.price - commission;
            return `
              <tr>
                <td class="purple" style="font-family:var(--font-heading); letter-spacing:0.04em; font-size:0.8rem">${order.id}</td>
                <td class="font-semibold">${order.serviceName.substring(0,24)}${order.serviceName.length > 24 ? '...' : ''}</td>
                <td>${order.sellerName}</td>
                <td class="gold">₹${order.price.toLocaleString('en-IN')}</td>
                <td style="color:var(--green-500); font-weight:700">₹${commission.toLocaleString('en-IN')}</td>
                <td style="color:var(--text-secondary)">₹${payout.toLocaleString('en-IN')}</td>
                <td><span class="${getStatusClass(order.status)}">${getStatusLabel(order.status)}</span></td>
              </tr>
            `;
          }).join('')}
          <tr style="background:rgba(245,158,11,0.05)">
            <td colspan="3" style="font-weight:700; color:var(--text-primary)">TOTAL</td>
            <td class="gold" style="font-weight:700">₹${totalRevenue.toLocaleString('en-IN')}</td>
            <td style="color:var(--green-500); font-weight:700">₹${totalCommission.toLocaleString('en-IN')}</td>
            <td style="color:var(--text-secondary); font-weight:700">₹${(totalRevenue - totalCommission).toLocaleString('en-IN')}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div style="padding:var(--space-5); background:rgba(124,58,237,0.06); border:1px solid rgba(124,58,237,0.2); border-radius:var(--radius-lg); margin-top:var(--space-4); font-size:0.875rem; color:var(--text-secondary); line-height:1.6">
      📌 <strong style="color:var(--purple-400)">Commission Policy:</strong> Current rate is 15% of each order. You can adjust this between 10–20% based on seller tier and order size. Subscription revenue (₹100/month × active sellers) is tracked separately.
    </div>
  `;
}

// ——— Performance ———
function renderPerformance() {
  const container = document.getElementById('performanceContent');
  if (!container) return;

  container.innerHTML = `
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Seller</th>
            <th>Category</th>
            <th>Orders Done</th>
            <th>Avg Delivery</th>
            <th>Response Rate</th>
            <th>Activity Score</th>
            <th>Subscription</th>
          </tr>
        </thead>
        <tbody>
          ${sellersState.map(seller => {
            const score = Math.round((seller.stats.ordersCompleted / 100) * 70 + (parseFloat(seller.stats.responseRate) / 100) * 30);
            const barWidth = Math.min(score, 100);
            return `
              <tr>
                <td>
                  <div style="display:flex; align-items:center; gap:var(--space-3)">
                    <img src="${seller.avatar}" alt="${seller.name}" style="width:32px;height:32px;border-radius:50%;" loading="lazy" />
                    <div>
                      <div style="font-weight:600; color:var(--text-primary); font-size:0.875rem">${seller.name}</div>
                      ${seller.verified ? '<div style="font-size:0.7rem; color:var(--purple-400)">✓ Verified</div>' : ''}
                    </div>
                  </div>
                </td>
                <td>${CATEGORIES.find(c => c.id === seller.category)?.name || seller.category}</td>
                <td class="font-semibold" style="color:var(--text-primary)">${seller.stats.ordersCompleted}</td>
                <td>${seller.stats.avgDelivery}</td>
                <td>
                  <div class="perf-bar-wrap">
                    <div class="perf-bar">
                      <div class="perf-bar-fill" style="width:${parseFloat(seller.stats.responseRate)}%"></div>
                    </div>
                    <span style="font-size:0.8rem; font-weight:600; min-width:36px">${seller.stats.responseRate}</span>
                  </div>
                </td>
                <td>
                  <div class="perf-bar-wrap">
                    <div class="perf-bar">
                      <div class="perf-bar-fill" style="width:${barWidth}%; background:${barWidth > 70 ? 'var(--green-500)' : barWidth > 40 ? 'var(--gold-400)' : 'var(--red-400)'}"></div>
                    </div>
                    <span style="font-size:0.8rem; font-weight:600; min-width:36px">${barWidth}%</span>
                  </div>
                </td>
                <td>
                  <span class="${seller.subscriptionActive ? 'status-pill status-delivered' : 'status-pill status-cancelled'}">
                    ${seller.subscriptionActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ——— Helpers ———
function getStatusClass(status) {
  const map = {
    'pending':     'status-pill status-pending',
    'in-progress': 'status-pill status-in-progress',
    'delivered':   'status-pill status-delivered',
    'cancelled':   'status-pill status-cancelled',
  };
  return map[status] || 'badge';
}

function getStatusLabel(status) {
  const map = {
    'pending': 'Pending', 'in-progress': 'In Progress',
    'delivered': 'Delivered', 'cancelled': 'Cancelled',
  };
  return map[status] || status;
}

// ——— Toast ———
let toastTimeout;
function showToast(msg, type = 'success') {
  let toast = document.getElementById('adminToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'adminToast';
    toast.className = 'admin-toast';
    document.body.appendChild(toast);
  }

  toast.textContent = msg;
  toast.className = `admin-toast ${type}`;

  clearTimeout(toastTimeout);
  requestAnimationFrame(() => {
    toast.classList.add('show');
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 3000);
  });
}

// ——— Service Approvals ———
function renderServiceApprovals() {
  const container = document.getElementById('serviceApprovalsContent');
  if (!container) return;

  const pendingJSON = localStorage.getItem('pendingServices');
  let pending = [];
  try { pending = JSON.parse(pendingJSON || '[]'); } catch(e){}

  if(pending.length === 0) {
    container.innerHTML = `<div class="glass-card" style="padding:40px; text-align:center;"><p class="text-secondary">No pending services found ✨. Creators haven't listed anything new recently.</p></div>`;
    return;
  }

  container.innerHTML = pending.map(svc => {
    const seller = sellersState.find(s => s.id === svc.sellerId) || { name: 'Unknown Creator' };
    return `
      <div class="application-card" id="pending-svc-${svc.id}">
        <div class="application-header">
          <div>
            <div class="application-name">${svc.title}</div>
            <div class="application-meta">By ${seller.name} (${svc.sellerId}) · Price: ₹${svc.price}</div>
          </div>
          <span class="status-pill status-pending">Needs Review</span>
        </div>
        <div class="application-body">
          <div class="application-detail" style="display:flex; gap:16px;">
            <img src="${svc.thumbnail}" style="width:120px; height:80px; object-fit:cover; border-radius:8px;" />
            <div style="flex:1;">
              <p><strong>Category:</strong> ${svc.category}</p>
              <p><strong>Delivery:</strong> ${svc.deliveryTime}</p>
              <p style="margin-top:8px;"><strong>Description:</strong> ${svc.description}</p>
            </div>
          </div>
        </div>
        <div class="table-actions" style="margin-top:16px;">
          <button class="btn btn-primary" onclick="approveService('${svc.id}')">✓ Approve</button>
          <button class="btn btn-outline" onclick="suggestServiceChanges('${svc.id}')">💬 Suggest Changes</button>
        </div>
      </div>
    `;
  }).join('');
}

window.approveService = (id) => {
  let pending = JSON.parse(localStorage.getItem('pendingServices') || '[]');
  const index = pending.findIndex(s => s.id === id);
  if (index !== -1) {
    const svc = pending[index];
    svc.status = 'active';
    // Append to live services locally (mock behavior since no real DB)
    SERVICES.push(svc); 
    pending.splice(index, 1);
    localStorage.setItem('pendingServices', JSON.stringify(pending));
    renderServiceApprovals();
    showToast('Service approved and is now live.', 'success');
  }
};

window.suggestServiceChanges = (id) => {
  const reason = prompt("Enter feedback to send to the creator (via Mock WhatsApp/Email)");
  if (reason) {
    // In a real database we wouldn't delete but mark as 'Changes Requested'
    let pending = JSON.parse(localStorage.getItem('pendingServices') || '[]');
    const index = pending.findIndex(s => s.id === id);
    if (index !== -1) {
      pending.splice(index, 1);
      localStorage.setItem('pendingServices', JSON.stringify(pending));
      renderServiceApprovals();
      showToast('Feedback sent to creator. Removed from queue.', 'error');
    }
  }
};
