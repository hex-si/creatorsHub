// ============================================================
// orders.js — Order Tracking Page Logic
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileNav();
  renderAllOrders();
  initTrackButton();
});

function initNavbar() {
  const navbar = document.querySelector('.navbar');
  navbar?.classList.add('scrolled');
}

function initMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  const closeBtn  = document.getElementById('mobileNavClose');
  hamburger?.addEventListener('click', () => mobileNav.classList.add('open'));
  closeBtn?.addEventListener('click', () => mobileNav.classList.remove('open'));
}

function initTrackButton() {
  const btn   = document.getElementById('trackOrderBtn');
  const input = document.getElementById('orderRefInput');
  
  btn?.addEventListener('click', () => searchOrder());
  input?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchOrder();
  });
}

function trackDemo(ref) {
  document.getElementById('orderRefInput').value = ref;
  searchOrder();
}

function searchOrder() {
  const input = document.getElementById('orderRefInput');
  const ref   = input?.value.trim().toUpperCase();
  
  if (!ref) {
    input?.focus();
    return;
  }

  const order = ORDERS.find(o => o.id === ref);

  const resultEl   = document.getElementById('orderResult');
  const notFoundEl = document.getElementById('orderNotFound');

  if (!order) {
    if (resultEl) resultEl.style.display = 'none';
    if (notFoundEl) notFoundEl.style.display = 'block';
    notFoundEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  if (notFoundEl) notFoundEl.style.display = 'none';
  if (resultEl) resultEl.style.display = 'block';

  renderOrderCard(order);
  resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderOrderCard(order) {
  const card = document.getElementById('orderCard');
  if (!card) return;

  const seller = SELLERS.find(s => s.id === order.sellerId);
  const statusSteps = ['pending', 'in-progress', 'delivered'];
  const currentStep = statusSteps.indexOf(order.status);

  const stepLabels = ['📋 Pending', '⚙️ In Progress', '✅ Delivered'];
  const stepEmojis = ['📋', '⚙️', '✅'];

  card.innerHTML = `
    <!-- Order Header -->
    <div class="order-card-header">
      <div>
        <div class="order-ref">${order.id}</div>
        <div class="order-service-name">${order.serviceName}</div>
        <div style="margin-top:var(--space-2)">
          <span class="badge ${order.type === 'on-demand' ? 'badge-gold' : 'badge-blue'}" style="font-size:0.7rem">
            ${order.type === 'on-demand' ? '⚡ On-Demand Request' : '🛒 Direct Order'}
          </span>
        </div>
      </div>
      <div style="text-align:right">
        <div class="order-price">₹${order.price.toLocaleString('en-IN')}</div>
        <div class="${getStatusClass(order.status)}" style="margin-top:var(--space-2)">
          ${getStatusLabel(order.status)}
        </div>
      </div>
    </div>

    <!-- Status Stepper -->
    <div class="status-stepper" style="margin-bottom:var(--space-8)">
      ${statusSteps.map((step, i) => {
        let itemClass = '';
        if (i < currentStep) itemClass = 'completed';
        else if (i === currentStep) itemClass = 'active';
        
        return `
          <div class="stepper-item ${itemClass}">
            <div class="stepper-dot">${i <= currentStep ? '✓' : stepEmojis[i]}</div>
            <div class="stepper-label">${['Pending', 'In Progress', 'Delivered'][i]}</div>
            ${i === currentStep ? '<div class="stepper-date" style="color:var(--purple-400)">Current</div>' : ''}
          </div>
        `;
      }).join('')}
    </div>

    <!-- Order Details -->
    <div class="order-details-grid">
      <div class="order-detail-item">
        <span class="order-detail-label">Seller</span>
        <span class="order-detail-value">${order.sellerName}</span>
      </div>
      <div class="order-detail-item">
        <span class="order-detail-label">Customer</span>
        <span class="order-detail-value">${order.customerName}</span>
      </div>
      <div class="order-detail-item">
        <span class="order-detail-label">Order Date</span>
        <span class="order-detail-value">${formatDate(order.orderDate)}</span>
      </div>
      <div class="order-detail-item">
        <span class="order-detail-label">Expected Delivery</span>
        <span class="order-detail-value">${order.deliveryDate ? formatDate(order.deliveryDate) : 'TBD by Admin'}</span>
      </div>
      <div class="order-detail-item">
        <span class="order-detail-label">Order Type</span>
        <span class="order-detail-value">${order.type === 'on-demand' ? 'Custom Request' : 'Direct Order'}</span>
      </div>
      <div class="order-detail-item">
        <span class="order-detail-label">Total Amount</span>
        <span class="order-detail-value" style="color:var(--gold-400)">₹${order.price.toLocaleString('en-IN')}</span>
      </div>
    </div>

    ${order.type === 'on-demand' && order.requestDetails ? `
    <div style="padding:var(--space-4); background:rgba(245,158,11,0.06); border:1px solid rgba(245,158,11,0.2); border-radius:var(--radius-md); margin-bottom:var(--space-5)">
      <div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.08em; color:var(--gold-400); font-weight:700; margin-bottom:var(--space-2)">Your Request</div>
      <p style="font-size:0.9rem; color:var(--text-secondary); line-height:1.6">${order.requestDetails}</p>
    </div>
    ` : ''}

    <!-- Actions -->
    <div style="display:flex; gap:var(--space-3); flex-wrap:wrap">
      ${seller ? `
      <a href="https://wa.me/${seller.whatsapp}?text=Hi%2C%20I%27m%20checking%20on%20order%20${order.id}%20%E2%80%94%20${encodeURIComponent(order.serviceName)}"
         target="_blank" rel="noopener" class="btn btn-whatsapp btn-sm">
        💬 Contact Seller on WhatsApp
      </a>` : ''}
      <a href="explore.html" class="btn btn-outline btn-sm">Browse More Services</a>
    </div>
  `;
}

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
    'pending':     'Pending',
    'in-progress': 'In Progress',
    'delivered':   'Delivered',
    'cancelled':   'Cancelled',
  };
  return map[status] || status;
}

function formatDate(dateStr) {
  if (!dateStr) return 'TBD';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function renderAllOrders() {
  const list = document.getElementById('ordersList');
  if (!list) return;

  list.innerHTML = ORDERS.map(order => `
    <div class="order-list-item" onclick="trackDemo('${order.id}')" id="order-item-${order.id}">
      <div>
        <div class="order-list-ref">${order.id}</div>
        <div class="order-list-name">${order.serviceName}</div>
        <div class="order-list-seller">Seller: ${order.sellerName} · ${formatDate(order.orderDate)}</div>
      </div>
      <div class="order-list-price">₹${order.price.toLocaleString('en-IN')}</div>
      <div class="${getStatusClass(order.status)}">${getStatusLabel(order.status)}</div>
    </div>
  `).join('');
}
