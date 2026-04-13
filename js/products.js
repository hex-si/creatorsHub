// ============================================================
// products.js — Products Marketplace Logic
// ============================================================

// ——— State ———
let cart = JSON.parse(localStorage.getItem('ch_cart') || '[]');
let wishlist = JSON.parse(localStorage.getItem('ch_wishlist') || '[]');
let activeCategory = 'all';
let activeSellers = [];
let pMin = 0;
let pMax = Infinity;
let activeDelivery = 'all';
let activeSort = 'default';
let searchQuery = '';
let isListLayout = false;
let allProducts = [];
let allSellers = [];

const PRODUCT_SUBCATEGORIES = [
  { id: 'all', name: 'All Products', icon: '🌐' },
  { id: 'food', name: 'Food & Home Cooks', icon: '🥘' },
  { id: 'handicraft', name: 'Handicrafts', icon: '🧺' },
  { id: 'clothing', name: 'Local Apparel', icon: '👗' },
  { id: 'art', name: 'Art Prints', icon: '🖼️' }
];

document.addEventListener('DOMContentLoaded', async () => {
  initNavbar();
  initMobileNav();
  initSearch();
  initFilters();
  initCart();
  initProductModal();
  updateCartUI();
  
  const grid = document.getElementById('productsGrid');
  if (grid) grid.innerHTML = '<p style="padding:40px;text-align:center;color:var(--text-muted)">Loading products...</p>';

  const [prods, slrs] = await Promise.all([getProducts(), getSellers()]);
  allProducts = prods;
  allSellers = slrs;

  renderCategoryPills();
  renderSellerFilters();
  renderFeaturedBanner();
  renderProducts();  
});

// ——— Navbar ———
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });
  navbar.classList.add('scrolled');
}

function initMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  const closeBtn  = document.getElementById('mobileNavClose');
  hamburger?.addEventListener('click', () => mobileNav?.classList.add('open'));
  closeBtn?.addEventListener('click', () => mobileNav?.classList.remove('open'));
}

// ——— Category Pills ———
function renderCategoryPills() {
  const container = document.getElementById('categoryPills');
  if (!container) return;

  container.innerHTML = PRODUCT_SUBCATEGORIES.map(cat => `
    <button class="category-pill ${cat.id === activeCategory ? 'active' : ''}"
      data-cat="${cat.id}" id="pill-${cat.id}">
      <span>${cat.icon}</span>${cat.name}
    </button>
  `).join('');

  container.querySelectorAll('.category-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.cat;
      container.querySelectorAll('.category-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderProducts();
    });
  });
}

// ——— Featured Banner ———
function renderFeaturedBanner() {
  const scroll = document.getElementById('featuredScroll');
  if (!scroll) return;

  const featured = allProducts.filter(p => p.featured);
  scroll.innerHTML = featured.map(p => {
    const seller = allSellers.find(s => s.id === p.seller_id);
    return `
      <div class="featured-product-chip" onclick="openProductModal('${p.id}')">
        <img src="${p.thumbnail}" alt="${p.title}" class="featured-chip-img" loading="lazy" />
        <div>
          <div class="featured-chip-name">${p.title.length > 28 ? p.title.substring(0,28)+'…' : p.title}</div>
          <div class="featured-chip-price">₹${p.price.toLocaleString('en-IN')}</div>
        </div>
      </div>
    `;
  }).join('');
}

// ——— Seller Filters ———
function renderSellerFilters() {
  const container = document.getElementById('sellerFilterList');
  if (!container) return;

  // Sellers who have products
  const productSellerIds = [...new Set(allProducts.map(p => p.seller_id))];
  const sellers = allSellers.filter(s => productSellerIds.includes(s.id));

  container.innerHTML = sellers.map(s => `
    <label class="seller-filter-item">
      <input type="checkbox" value="${s.id}" onchange="toggleSellerFilter('${s.id}', this.checked)" />
      <img src="${s.avatar}" alt="${s.name}" loading="lazy" />
      <span>${s.name}</span>
    </label>
  `).join('');
}

window.toggleSellerFilter = (sellerId, checked) => {
  if (checked) {
    if (!activeSellers.includes(sellerId)) activeSellers.push(sellerId);
  } else {
    activeSellers = activeSellers.filter(id => id !== sellerId);
  }
  renderProducts();
};

// ——— Filters ———
function initFilters() {
  // Price inputs
  const minInp = document.getElementById('priceMin');
  const maxInp = document.getElementById('priceMax');
  const onPrice = () => {
    pMin = parseInt(minInp.value) || 0;
    pMax = parseInt(maxInp.value) || Infinity;
    renderProducts();
  };
  minInp?.addEventListener('input', onPrice);
  maxInp?.addEventListener('input', onPrice);

  // Price presets
  document.querySelectorAll('.price-preset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.price-preset-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      pMin = parseInt(chip.dataset.min) || 0;
      pMax = parseInt(chip.dataset.max) || Infinity;
      if (minInp) minInp.value = chip.dataset.min === '0' ? '' : chip.dataset.min;
      if (maxInp) maxInp.value = chip.dataset.max || '';
      renderProducts();
    });
  });

  // Delivery radios
  document.querySelectorAll('input[name="delivery"]').forEach(r => {
    r.addEventListener('change', e => { activeDelivery = e.target.value; renderProducts(); });
  });

  // Sort radios
  document.querySelectorAll('input[name="sort"]').forEach(r => {
    r.addEventListener('change', e => { activeSort = e.target.value; renderProducts(); });
  });

  // Clear all
  document.getElementById('clearAllBtn')?.addEventListener('click', clearAllFilters);
  document.getElementById('resetBtn')?.addEventListener('click', clearAllFilters);

  // Layout toggles
  document.getElementById('layoutGrid')?.addEventListener('click', () => setLayout(false));
  document.getElementById('layoutList')?.addEventListener('click', () => setLayout(true));

  // Mobile filter panel
  const sidebar = document.getElementById('productsSidebar');
  document.getElementById('mobileFilterBtn')?.addEventListener('click', () => sidebar?.classList.add('open'));
  document.getElementById('applyFiltersBtn')?.addEventListener('click', () => sidebar?.classList.remove('open'));
  document.addEventListener('click', e => {
    if (!sidebar?.contains(e.target) && !document.getElementById('mobileFilterBtn')?.contains(e.target)) {
      sidebar?.classList.remove('open');
    }
  });
}

function setLayout(isList) {
  isListLayout = isList;
  const grid = document.getElementById('productsGrid');
  const btnGrid = document.getElementById('layoutGrid');
  const btnList = document.getElementById('layoutList');
  if (isList) {
    grid?.classList.add('list-layout');
    btnList?.classList.add('active');
    btnGrid?.classList.remove('active');
  } else {
    grid?.classList.remove('list-layout');
    btnGrid?.classList.add('active');
    btnList?.classList.remove('active');
  }
}

function clearAllFilters() {
  activeCategory = 'all';
  activeSellers = [];
  pMin = 0;
  pMax = Infinity;
  activeDelivery = 'all';
  activeSort = 'default';
  searchQuery = '';

  document.getElementById('priceMin').value = '';
  document.getElementById('priceMax').value = '';
  document.getElementById('productSearch').value = '';
  document.getElementById('searchClear').style.display = 'none';
  document.querySelectorAll('.price-preset-chip').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('input[name="delivery"]')[0].checked = true;
  document.querySelectorAll('input[name="sort"]')[0].checked = true;
  document.querySelectorAll('.seller-filter-item input').forEach(c => c.checked = false);

  document.querySelectorAll('.category-pill').forEach(b => b.classList.remove('active'));
  document.getElementById('pill-all')?.classList.add('active');

  document.getElementById('productsSidebar')?.classList.remove('open');
  renderProducts();
}

// ——— Search ———
function initSearch() {
  const inp  = document.getElementById('productSearch');
  const clear = document.getElementById('searchClear');

  inp?.addEventListener('input', e => {
    searchQuery = e.target.value.toLowerCase().trim();
    clear.style.display = searchQuery ? 'block' : 'none';
    renderProducts();
  });

  clear?.addEventListener('click', () => {
    inp.value = '';
    searchQuery = '';
    clear.style.display = 'none';
    renderProducts();
  });
}

// ——— Render Products ———
function renderProducts() {
  let filtered = [...allProducts];

  // Category
  if (activeCategory !== 'all') {
    // In schema the field is sub_category
    filtered = filtered.filter(p => p.sub_category === activeCategory);
  }

  // Seller
  if (activeSellers.length > 0) {
    filtered = filtered.filter(p => activeSellers.includes(p.seller_id));
  }

  // Price
  filtered = filtered.filter(p => p.price >= pMin && p.price <= pMax);

  // Delivery
  if (activeDelivery !== 'all') {
    const maxDays = parseInt(activeDelivery);
    filtered = filtered.filter(p => {
      const days = extractDays(p.deliveryTime);
      return days <= maxDays;
    });
  }

  // Search
  if (searchQuery) {
    filtered = filtered.filter(p => {
      const seller = allSellers.find(s => s.id === p.seller_id);
      return (
        p.title.toLowerCase().includes(searchQuery) ||
        (p.subtitle || '').toLowerCase().includes(searchQuery) ||
        (p.description || '').toLowerCase().includes(searchQuery) ||
        (seller?.name || '').toLowerCase().includes(searchQuery)
      );
    });
  }

  // Sort
  if (activeSort === 'price-asc')  filtered.sort((a, b) => a.price - b.price);
  if (activeSort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
  if (activeSort === 'rating')     filtered.sort((a, b) => b.rating - a.rating);
  if (activeSort === 'delivery')   filtered.sort((a, b) => extractDays(a.deliveryTime) - extractDays(b.deliveryTime));

  // Update stat
  const statProducts = document.getElementById('stat-products');
  if (statProducts) statProducts.textContent = allProducts.length;

  // Results count
  const countEl = document.getElementById('resultsCount');
  if (countEl) {
    countEl.textContent = `${filtered.length} product${filtered.length !== 1 ? 's' : ''} found`;
  }

  const grid  = document.getElementById('productsGrid');
  const empty = document.getElementById('productsEmpty');
  const featuredBanner = document.getElementById('featuredBanner');

  if (!grid) return;

  // Hide featured banner when searching/filtering
  const isFiltering = activeCategory !== 'all' || activeSellers.length > 0 || pMin > 0 || pMax < Infinity || activeDelivery !== 'all' || searchQuery;
  if (featuredBanner) featuredBanner.style.display = isFiltering ? 'none' : 'block';

  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }

  if (empty) empty.style.display = 'none';

  grid.innerHTML = filtered.map(p => buildProductCard(p)).join('');

  // Animate cards in
  grid.querySelectorAll('.product-card').forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(16px)';
    requestAnimationFrame(() => {
      card.style.transition = `opacity 0.4s ease ${i * 0.05}s, transform 0.4s ease ${i * 0.05}s`;
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    });
  });
}

function extractDays(t) {
  if (!t) return 999;
  if (t.toLowerCase().includes('same')) return 1;
  const m = t.match(/(\d+)/);
  if (!m) return 999;
  const n = parseInt(m[1]);
  if (t.includes('week'))  return n * 7;
  if (t.includes('month')) return n * 30;
  return n;
}

// ——— Build Product Card ———
function buildProductCard(p) {
  const seller = allSellers.find(s => s.id === p.seller_id);
  const discount = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
  const isWished = wishlist.includes(p.id);
  const stockText = p.stock <= 5 ? `Only ${p.stock} left` : 'In stock';
  const stockClass = p.stock <= 5 ? 'stock-low' : 'stock-ok';
  const stars = renderStars(p.rating);

  return `
    <div class="product-card" id="pcard-${p.id}">
      <div class="product-card-img-wrap" onclick="openProductModal('${p.id}')">
        <img src="${p.thumbnail}" alt="${p.title}" class="product-card-img" loading="lazy" />
        ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''}
        <button class="product-wishlist-btn ${isWished ? 'wished' : ''}"
          onclick="event.stopPropagation(); toggleWishlist('${p.id}', this)"
          title="${isWished ? 'Remove from wishlist' : 'Add to wishlist'}">
          ${isWished ? '❤️' : '🤍'}
        </button>
        <div class="product-stock-badge ${stockClass}">${stockText}</div>
      </div>
      <div class="product-card-body">
        <div class="product-seller-row">
          <img src="${seller?.avatar || ''}" alt="${seller?.name}" class="product-seller-avatar" loading="lazy" />
          <span class="product-seller-name">${seller?.name || 'Artisan'}</span>
          <span class="badge" style="font-size:0.65rem; background:rgba(217,119,6,0.1); color:var(--gold-400); margin-left:6px; padding:2px 6px;">${seller?.role || 'Seller'}</span>
          ${seller?.verified ? '<span class="product-verified" style="margin-left:auto;">✓ Verified</span>' : ''}
        </div>
        <div class="product-card-title" onclick="openProductModal('${p.id}')">${p.title}</div>
        <div class="product-card-subtitle">${p.subtitle}</div>
        <div class="product-rating-row">
          <div class="product-stars">${stars}</div>
          <span class="product-rating-num">${p.rating.toFixed(1)}</span>
          <span class="product-review-count">(${p.reviews} reviews)</span>
        </div>
        <div class="product-card-footer">
          <div class="product-price-block">
            <div class="product-price">₹${p.price.toLocaleString('en-IN')}</div>
            ${p.originalPrice ? `
              <div class="product-original-price">₹${p.originalPrice.toLocaleString('en-IN')}</div>
            ` : ''}
            ${discount > 0 ? `<div class="product-discount-pct">−${discount}% off</div>` : ''}
          </div>
          <div class="product-delivery-pill">
            ⚡ ${p.deliveryTime}
          </div>
        </div>
        <button class="btn-add-cart" onclick="addToCart('${p.id}')">
          + Add to Cart
        </button>
      </div>
    </div>
  `;
}

function renderStars(rating) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

// ——— Wishlist ———
window.toggleWishlist = (id, btn) => {
  const idx = wishlist.indexOf(id);
  if (idx === -1) {
    wishlist.push(id);
    btn.textContent = '❤️';
    btn.classList.add('wished');
    showToast('❤️ Added to wishlist');
  } else {
    wishlist.splice(idx, 1);
    btn.textContent = '🤍';
    btn.classList.remove('wished');
    showToast('Removed from wishlist');
  }
  localStorage.setItem('ch_wishlist', JSON.stringify(wishlist));
};

// ——— Cart ———
function initCart() {
  const cartBtn   = document.getElementById('cartBtn');
  const cartClose = document.getElementById('cartClose');
  const overlay   = document.getElementById('cartOverlay');
  const drawer    = document.getElementById('cartDrawer');

  const openCart = () => {
    drawer?.classList.add('open');
    overlay.style.display = 'block';
    renderCartItems();
  };

  const closeCart = () => {
    drawer?.classList.remove('open');
    overlay.style.display = 'none';
  };

  cartBtn?.addEventListener('click', openCart);
  cartClose?.addEventListener('click', closeCart);
  overlay?.addEventListener('click', closeCart);

  document.getElementById('cartContinueShopping')?.addEventListener('click', closeCart);
  document.getElementById('clearCartBtn')?.addEventListener('click', () => {
    cart = [];
    saveCart();
    updateCartUI();
    renderCartItems();
  });

  document.getElementById('checkoutBtn')?.addEventListener('click', checkoutViaWhatsApp);
}

window.addToCart = (productId) => {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(i => i.id === productId);
  if (existing) {
    existing.qty = Math.min(existing.qty + 1, product.stock);
  } else {
    cart.push({ id: productId, qty: 1 });
  }

  saveCart();
  updateCartUI();

  // Show cart drawer
  const drawer  = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  drawer?.classList.add('open');
  overlay.style.display = 'block';
  renderCartItems();

  showToast(`🛍️ Added to cart!`);
};

function renderCartItems() {
  const container  = document.getElementById('cartItems');
  const footer     = document.getElementById('cartFooter');
  const emptyEl    = document.getElementById('cartEmpty');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = '';
    if (footer)  footer.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'flex';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';
  if (footer)  footer.style.display = 'block';

  let total = 0;

  container.innerHTML = cart.map(item => {
    const p = allProducts.find(pr => pr.id === item.id);
    if (!p) return '';
    const seller = allSellers.find(s => s.id === p.seller_id);
    const lineTotal = p.price * item.qty;
    total += lineTotal;
    return `
      <div class="cart-item" id="cart-item-${p.id}">
        <img src="${p.thumbnail}" alt="${p.title}" class="cart-item-img" loading="lazy" />
        <div>
          <div class="cart-item-name">${p.title}</div>
          <div class="cart-item-seller">by ${seller?.name || 'Artisan'}</div>
          <div class="cart-item-qty-row">
            <button class="qty-btn" onclick="changeQty('${p.id}', -1)">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" onclick="changeQty('${p.id}', 1)">+</button>
          </div>
        </div>
        <div style="text-align:right">
          <div class="cart-item-price">₹${lineTotal.toLocaleString('en-IN')}</div>
          <button class="cart-item-remove" onclick="removeFromCart('${p.id}')">Remove</button>
        </div>
      </div>
    `;
  }).join('');

  const totalEl = document.getElementById('cartTotal');
  if (totalEl) totalEl.textContent = `₹${total.toLocaleString('en-IN')}`;
}

window.changeQty = (productId, delta) => {
  const item = cart.find(i => i.id === productId);
  const product = allProducts.find(p => p.id === productId);
  if (!item || !product) return;

  item.qty = Math.max(1, Math.min(item.qty + delta, product.stock));
  saveCart();
  updateCartUI();
  renderCartItems();
};

window.removeFromCart = (productId) => {
  cart = cart.filter(i => i.id !== productId);
  saveCart();
  updateCartUI();
  renderCartItems();
};

function updateCartUI() {
  const count = cart.reduce((sum, i) => sum + i.qty, 0);
  const badge = document.getElementById('cartCount');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline' : 'none';
  }
}

function saveCart() {
  localStorage.setItem('ch_cart', JSON.stringify(cart));
}

function checkoutViaWhatsApp() {
  if (cart.length === 0) return;

  let lines = cart.map(item => {
    const p = allProducts.find(pr => pr.id === item.id);
    if (!p) return '';
    return `• ${p.title} ×${item.qty} = ₹${(p.price * item.qty).toLocaleString('en-IN')}`;
  }).filter(Boolean);

  const total = cart.reduce((sum, item) => {
    const p = allProducts.find(pr => pr.id === item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);

  const message = `Hi! I'd like to place an order on CreatorHub:\n\n${lines.join('\n')}\n\nTotal: ₹${total.toLocaleString('en-IN')}\n\nPlease confirm delivery details and payment. Thank you!`;

  // Use the seller's WhatsApp for single-seller orders, else admin
  const sellerIds = [...new Set(cart.map(i => allProducts.find(p => p.id === i.id)?.seller_id))];
  let whatsapp = '919876543210'; // default admin
  if (sellerIds.length === 1 && sellerIds[0]) {
    const seller = allSellers.find(s => s.id === sellerIds[0]);
    if (seller?.whatsapp) whatsapp = seller.whatsapp;
  }

  window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
}

// ——— Product Modal ———
function initProductModal() {
  const overlay = document.getElementById('productModal');
  const closeBtn = document.getElementById('productModalClose');

  closeBtn?.addEventListener('click', closeProductModal);
  overlay?.addEventListener('click', e => {
    if (e.target === overlay) closeProductModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeProductModal();
  });
}

window.openProductModal = (productId) => {
  const p = allProducts.find(pr => pr.id === productId);
  if (!p) return;

  const seller = allSellers.find(s => s.id === p.seller_id);
  const discount = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
  const stars = renderStars(p.rating);

  const content = document.getElementById('productModalContent');
  if (!content) return;

  content.innerHTML = `
    <div class="modal-body">
      <!-- Images -->
      <div class="modal-images">
        <img src="${(p.images && p.images[0]) ? p.images[0] : p.thumbnail}" alt="${p.title}" class="modal-main-img" id="modalMainImg" loading="lazy" />
        ${(p.images && p.images.length > 1) ? `
        <div class="modal-img-thumbs">
          ${p.images.map((img, i) => `
            <img src="${img}" alt="View ${i+1}" class="modal-thumb ${i===0?'active':''}"
              onclick="switchModalImg('${img}', this)" loading="lazy" />
          `).join('')}
        </div>
        ` : ''}
      </div>

      <!-- Info -->
      <div class="modal-info">
        ${p.badge ? `<div class="product-badge" style="position:static;display:inline-block;margin-bottom:var(--space-2)">${p.badge}</div>` : ''}
        <div>
          <h2 class="modal-title">${p.title}</h2>
          <div class="modal-subtitle">${p.subtitle}</div>
        </div>

        <div class="modal-price-row">
          <div class="modal-price">₹${p.price.toLocaleString('en-IN')}</div>
          ${p.originalPrice ? `<div class="modal-original-price">₹${p.originalPrice.toLocaleString('en-IN')}</div>` : ''}
          ${discount > 0 ? `<div class="modal-discount">−${discount}% off</div>` : ''}
        </div>

        <div class="product-rating-row">
          <div class="product-stars">${stars}</div>
          <span class="product-rating-num">${p.rating.toFixed(1)}</span>
          <span class="product-review-count">(${p.reviews} reviews)</span>
        </div>

        <p class="modal-desc">${p.description}</p>

        ${(p.specs && p.specs.length > 0) ? `
        <div>
          <div class="modal-specs-title">What's included</div>
          <div class="modal-specs-list">
            ${p.specs.map(spec => `<div class="modal-spec-item">${spec}</div>`).join('')}
          </div>
        </div>
        ` : ''}

        ${seller ? `
        <div class="modal-seller-row">
          <img src="${seller.avatar}" alt="${seller.name}" class="modal-seller-avatar" loading="lazy" />
          <div>
            <div class="modal-seller-name">${seller.name}</div>
            <div class="modal-seller-tag">${seller.tagline}</div>
          </div>
          ${seller.verified ? '<span class="badge badge-purple" style="margin-left:auto;font-size:0.7rem">✓ Verified</span>' : ''}
        </div>
        ` : ''}

        <div class="modal-delivery-info">
          ⚡ <strong>Delivery:</strong>&nbsp;${p.deliveryTime}&nbsp;&nbsp;
          📦 <strong>Stock:</strong>&nbsp;${p.stock <= 5 ? `Only ${p.stock} left!` : 'Available'}
        </div>

        <div class="modal-actions">
          <button class="btn btn-primary btn-lg w-full" onclick="addToCart('${p.id}'); closeProductModal()">
            🛍️ Add to Cart — ₹${p.price.toLocaleString('en-IN')}
          </button>
          ${seller ? `
          <a href="https://wa.me/${seller.whatsapp}?text=${encodeURIComponent(`Hi! I'm interested in "${p.title}" (₹${p.price.toLocaleString('en-IN')}) on CreatorHub. Can you share delivery details?`)}"
             target="_blank" rel="noopener" class="btn btn-whatsapp w-full">
            💬 Ask Seller on WhatsApp
          </a>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  const overlay = document.getElementById('productModal');
  if (overlay) overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
};

window.switchModalImg = (src, thumb) => {
  document.getElementById('modalMainImg').src = src;
  document.querySelectorAll('.modal-thumb').forEach(t => t.classList.remove('active'));
  thumb.classList.add('active');
};

function closeProductModal() {
  const overlay = document.getElementById('productModal');
  if (overlay) overlay.style.display = 'none';
  document.body.style.overflow = '';
}

// ——— Toast ———
let toastTimeout;
function showToast(msg) {
  const toast = document.getElementById('productsToast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 2800);
}
