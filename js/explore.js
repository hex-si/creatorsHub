// ============================================================
// explore.js — Explore Services Page Logic
// ============================================================

let activeCategory = 'all';
let activeDelivery = 'all';
let priceMin = 0;
let priceMax = Infinity;
let activeSort = 'default';
let searchQuery = '';

let allServices = [];
let allSellers = [];

document.addEventListener('DOMContentLoaded', async () => {
  initNavbar();
  initMobileNav();
  initFilters();
  initSearch();
  initSort();
  initMobileFilter();
  readURLParams();
  
  // Wait for Supabase data
  const grid = document.getElementById('servicesGrid');
  if (grid) grid.innerHTML = '<p style="padding:40px;text-align:center;color:var(--text-muted)">Loading services...</p>';

  const [svcs, slrs] = await Promise.all([getServices(), getSellers()]);
  allServices = svcs;
  allSellers = slrs;

  buildCategoryFilters();
  buildCategoryChips();
  renderServices();
});

function initNavbar() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });
  navbar.classList.add('scrolled');
}

function initMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  const closeBtn  = document.getElementById('mobileNavClose');
  hamburger?.addEventListener('click', () => mobileNav.classList.add('open'));
  closeBtn?.addEventListener('click', () => mobileNav.classList.remove('open'));
}

// ——— Read URL Params ———
function readURLParams() {
  const params = new URLSearchParams(window.location.search);
  const cat = params.get('category');
  if (cat && cat !== 'all') {
    setCategory(cat);
  }
}

// ——— Build Category Filter Radio Buttons ———
function buildCategoryFilters() {
  const container = document.getElementById('categoryFilters');
  if (!container) return;

  const counts = {};
  allServices.forEach(s => { counts[s.category] = (counts[s.category] || 0) + 1; });
  document.getElementById('count-all').textContent = allServices.length;

  CATEGORIES.forEach(cat => {
    const label = document.createElement('label');
    label.className = 'filter-option';
    label.innerHTML = `
      <input type="radio" name="category" value="${cat.id}" id="cat-filter-${cat.id}" />
      <span class="filter-option-content">
        <span class="filter-option-icon">${cat.icon}</span>
        <span>${cat.name}</span>
        <span class="filter-count">${counts[cat.id] || 0}</span>
      </span>
    `;
    container.appendChild(label);
  });

  document.querySelectorAll('input[name="category"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      setCategory(e.target.value);
    });
  });
}

// ——— Category Chips ———
function buildCategoryChips() {
  const container = document.getElementById('categoryChips');
  if (!container) return;

  const allChip = createChip('all', '🌐', 'All');
  container.appendChild(allChip);

  CATEGORIES.forEach(cat => {
    container.appendChild(createChip(cat.id, cat.icon, cat.name));
  });
}

function createChip(id, icon, name) {
  const btn = document.createElement('button');
  btn.className = 'category-chip' + (id === 'all' ? ' active' : '');
  btn.dataset.category = id;
  btn.innerHTML = `${icon} ${name}`;
  btn.addEventListener('click', () => setCategory(id));
  return btn;
}

function setCategory(val) {
  activeCategory = val;

  // sync radio
  const radio = document.querySelector(`input[name="category"][value="${val}"]`);
  if (radio) radio.checked = true;

  // sync chips
  document.querySelectorAll('.category-chip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.category === val);
  });

  renderServices();
}

// ——— Init Filters ———
function initFilters() {
  // Delivery
  document.querySelectorAll('input[name="delivery"]').forEach(r => {
    r.addEventListener('change', (e) => {
      activeDelivery = e.target.value;
      renderServices();
    });
  });

  // Price inputs
  const minInput = document.getElementById('priceMin');
  const maxInput = document.getElementById('priceMax');

  const updatePrice = () => {
    priceMin = parseInt(minInput.value) || 0;
    priceMax = parseInt(maxInput.value) || Infinity;
    renderServices();
  };

  minInput?.addEventListener('input', updatePrice);
  maxInput?.addEventListener('input', updatePrice);

  // Price presets
  document.querySelectorAll('.price-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.price-preset').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const min = parseInt(btn.dataset.min) || 0;
      const max = parseInt(btn.dataset.max) || Infinity;
      if (minInput) minInput.value = min === 0 ? '' : min;
      if (maxInput) maxInput.value = isFinite(max) ? max : '';
      priceMin = min;
      priceMax = max;
      renderServices();
    });
  });

  // Clear all
  document.getElementById('clearFiltersBtn')?.addEventListener('click', clearAllFilters);
  document.getElementById('resetFiltersBtn')?.addEventListener('click', clearAllFilters);
}

function clearAllFilters() {
  setCategory('all');
  activeDelivery = 'all';
  priceMin = 0;
  priceMax = Infinity;
  searchQuery = '';

  const minInput = document.getElementById('priceMin');
  const maxInput = document.getElementById('priceMax');
  if (minInput) minInput.value = '';
  if (maxInput) maxInput.value = '';

  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';

  const searchClear = document.getElementById('searchClear');
  if (searchClear) searchClear.style.display = 'none';

  document.querySelectorAll('input[name="delivery"]')[0].checked = true;
  document.querySelectorAll('.price-preset').forEach(b => b.classList.remove('active'));

  renderServices();
}

// ——— Search ———
function initSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchClear = document.getElementById('searchClear');

  searchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    searchClear.style.display = searchQuery ? 'block' : 'none';
    renderServices();
  });

  searchClear?.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    searchClear.style.display = 'none';
    renderServices();
  });
}

// ——— Sort ———
function initSort() {
  document.getElementById('sortSelect')?.addEventListener('change', (e) => {
    activeSort = e.target.value;
    renderServices();
  });
}

// ——— Mobile Filter Panel ———
function initMobileFilter() {
  const fab     = document.getElementById('filterFab');
  const sidebar = document.getElementById('filtersSidebar');
  const overlay = document.getElementById('filterOverlay');
  const applyBtn = document.getElementById('applyFiltersBtn');

  const openFilter = () => {
    sidebar?.classList.add('open');
    overlay.style.display = 'block';
    document.body.style.overflow = 'hidden';
  };

  const closeFilter = () => {
    sidebar?.classList.remove('open');
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  };

  fab?.addEventListener('click', openFilter);
  overlay?.addEventListener('click', closeFilter);
  applyBtn?.addEventListener('click', closeFilter);
}

// ——— Render Services ———
function renderServices() {
  let filtered = [...allServices];

  // Category filter
  if (activeCategory !== 'all') {
    filtered = filtered.filter(s => s.category === activeCategory);
  }

  // Search filter
  if (searchQuery) {
    filtered = filtered.filter(s => {
      const seller = allSellers.find(sl => sl.id === s.seller_id);
      return (
        s.title.toLowerCase().includes(searchQuery) ||
        s.description.toLowerCase().includes(searchQuery) ||
        (seller?.name || '').toLowerCase().includes(searchQuery) ||
        s.category.includes(searchQuery)
      );
    });
  }

  // Price filter
  filtered = filtered.filter(s => s.price >= priceMin && s.price <= priceMax);

  // Delivery filter
  if (activeDelivery !== 'all') {
    const maxDays = parseInt(activeDelivery);
    filtered = filtered.filter(s => {
      const days = extractDays(s.deliveryTime);
      return days <= maxDays;
    });
  }

  // Sort
  if (activeSort === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (activeSort === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (activeSort === 'delivery') {
    filtered.sort((a, b) => extractDays(a.deliveryTime) - extractDays(b.deliveryTime));
  }

  // Update results count
  const countEl = document.getElementById('resultsCount');
  if (countEl) countEl.textContent = `${filtered.length} service${filtered.length !== 1 ? 's' : ''} found`;

  // Render
  const grid = document.getElementById('servicesGrid');
  const emptyState = document.getElementById('emptyState');

  if (!grid) return;

  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  grid.innerHTML = filtered.map(svc => {
    const seller = allSellers.find(s => s.id === svc.seller_id);
    return buildServiceCardExplore(svc, seller);
  }).join('');

  // Animate
  grid.querySelectorAll('.service-card').forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(16px)';
    requestAnimationFrame(() => {
      card.style.transition = `opacity 0.4s ease ${i * 0.06}s, transform 0.4s ease ${i * 0.06}s`;
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    });
  });
}

function extractDays(deliveryTime) {
  const match = deliveryTime.match(/(\d+)/);
  if (!match) return 999;
  const num = parseInt(match[1]);
  if (deliveryTime.includes('week')) return num * 7;
  if (deliveryTime.includes('month')) return num * 30;
  return num;
}

function buildServiceCardExplore(svc, seller) {
  const catEmoji = { creative: '🎨', student: '📚', business: '📈', products: '📦' }[svc.category] || '⚡';
  const catName  = CATEGORIES.find(c => c.id === svc.category)?.name || svc.category;

  return `
    <div class="service-card" id="svc-${svc.id}">
      <div style="position:relative; overflow:hidden;">
        <img src="${svc.thumbnail}" alt="${svc.title}" class="service-card-thumb" loading="lazy" />
        ${svc.featured ? '<div style="position:absolute;top:10px;right:10px"><span class="badge badge-gold" style="font-size:0.7rem">⭐ Featured</span></div>' : ''}
        <div style="position:absolute;top:10px;left:10px">
          <span class="badge" style="font-size:0.7rem;background:rgba(0,0,0,0.7);color:white;border-color:rgba(255,255,255,0.2)">${catEmoji} ${catName}</span>
        </div>
      </div>
      <div class="service-card-body">
        <div class="service-card-seller">
          <img src="${seller?.avatar || ''}" alt="${seller?.name}" class="seller-avatar-sm" loading="lazy" />
          <span class="text-sm text-secondary">${seller?.name || 'Creator'}</span>
          <span class="badge" style="font-size:0.65rem; background:rgba(124,58,237,0.1); color:var(--purple-400); margin-left:6px; padding:2px 6px;">${seller?.role || 'Creator'}</span>
          ${seller?.verified ? '<span style="margin-left:auto;font-size:0.7rem;color:var(--purple-400)">✓ Verified</span>' : ''}
        </div>
        <div class="service-card-title">${svc.title}</div>
        <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:var(--space-3);line-height:1.5">${svc.description}</p>
        <div class="service-card-footer">
          <div>
            <div class="text-xs text-muted">Starting at</div>
            <div class="service-price">₹${svc.price.toLocaleString('en-IN')}</div>
          </div>
          <div class="service-delivery">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            ${svc.deliveryTime}
          </div>
        </div>
        <button class="btn btn-primary w-full" style="margin-top:var(--space-3)"
          onclick="window.location='seller.html?id=${svc.seller_id}'">
          Hire Now
        </button>
      </div>
    </div>
  `;
}
