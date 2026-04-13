// ============================================================
// seller.js — Seller Profile Page Logic
// ============================================================

let currentLightboxIndex = 0;
let portfolioItems = [];

document.addEventListener('DOMContentLoaded', async () => {
  initNavbar();
  initMobileNav();
  await loadSellerProfile();
});

function initNavbar() {
  const navbar = document.getElementById('navbar');
  navbar?.classList.add('scrolled');
  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 20);
  });
}

function initMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  const closeBtn  = document.getElementById('mobileNavClose');
  hamburger?.addEventListener('click', () => mobileNav.classList.add('open'));
  closeBtn?.addEventListener('click', () => mobileNav.classList.remove('open'));
}

async function loadSellerProfile() {
  const params = new URLSearchParams(window.location.search);
  const sellerId = params.get('id');
  const main = document.getElementById('profileMain');

  if (!sellerId) {
    main.innerHTML = `
      <div class="seller-not-found container" style="text-align:center; padding: 100px 20px;">
        <div style="font-size:4rem">😕</div>
        <h2>Profile Not Specified</h2>
        <p class="text-secondary">No user ID was provided in the URL.</p>
        <a href="explore.html" class="btn btn-primary" style="margin-top:var(--space-4)">Browse All Services</a>
      </div>
    `;
    return;
  }

  main.innerHTML = '<p style="padding:100px; text-align:center; color:var(--text-muted);">Loading profile...</p>';

  const seller = await getSellerById(sellerId);

  if (!seller) {
    main.innerHTML = `
      <div class="seller-not-found container" style="text-align:center; padding: 100px 20px;">
        <div style="font-size:4rem">😕</div>
        <h2>Seller not found</h2>
        <p class="text-secondary">This creator may have been removed or the ID is incorrect.</p>
        <a href="explore.html" class="btn btn-primary" style="margin-top:var(--space-4)">Browse All Services</a>
      </div>
    `;
    return;
  }

  const sellerServices = await getServices(seller.id);
  portfolioItems = seller.portfolio || [];
  const pkgs = seller.packages || [];

  // Update page title
  document.title = `${seller.name} — CreatorHub`;

  const catData = CATEGORIES.find(c => c.id === seller.category);

  main.innerHTML = `
    <!-- Profile Hero -->
    <section class="profile-hero">
      <div class="profile-hero-bg"></div>
      <div class="container">
        <div class="breadcrumb" style="position:relative;z-index:1;margin-bottom:var(--space-6)">
          <a href="index.html">Home</a>
          <span>›</span>
          <a href="explore.html">Explore</a>
          <span>›</span>
          <span>${seller.name}</span>
        </div>
        <div class="profile-hero-inner">
          <div class="profile-avatar-wrap">
            <img src="${seller.avatar}" alt="${seller.name}" class="profile-avatar" />
            ${seller.verified ? '<div class="profile-verified-badge" title="Verified Seller">✓</div>' : ''}
          </div>
          <div class="profile-info">
            <h1 class="profile-name">${seller.name}</h1>
            <p class="profile-tagline">${seller.tagline}</p>
            <div class="profile-meta">
              ${seller.verified ? '<span class="badge badge-purple">✓ Verified Seller</span>' : ''}
              ${seller.subscriptionActive ? '<span class="badge badge-green">● Active</span>' : ''}
              <span class="badge" style="background:${catData?.color}22;color:${catData?.color};border-color:${catData?.color}44">
                ${catData?.icon} ${catData?.name}
              </span>
              <span class="profile-meta-item">📅 Member since ${seller.memberSince}</span>
            </div>
          </div>
          <div class="profile-actions">
            <a href="https://wa.me/${seller.whatsapp}?text=Hi%20${encodeURIComponent(seller.name)}%2C%20I%20found%20your%20profile%20on%20CreatorHub%20and%20would%20like%20to%20hire%20you." 
               class="btn btn-whatsapp" target="_blank" rel="noopener" id="whatsapp-btn-${seller.id}">
              💬 WhatsApp
            </a>
            <a href="request.html?seller=${seller.id}" class="btn btn-primary" id="hire-btn-${seller.id}">
              ⚡ Hire Now
            </a>
          </div>
        </div>

        <!-- Stats Bar -->
        <div class="profile-stats-bar">
          <div class="profile-stat">
            <span class="profile-stat-value">${seller.stats?.ordersCompleted || 0}</span>
            <span class="profile-stat-label">Orders Completed</span>
          </div>
          <div class="profile-stat">
            <span class="profile-stat-value">${seller.stats?.avgDelivery || 'N/A'}</span>
            <span class="profile-stat-label">Avg. Delivery Time</span>
          </div>
          <div class="profile-stat">
            <span class="profile-stat-value">${seller.stats?.responseRate || '100%'}</span>
            <span class="profile-stat-label">Response Rate</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Profile Body -->
    <section class="profile-body">
      <div class="container">
        <div class="profile-layout">

          <!-- Left Column -->
          <div class="profile-left">

            <!-- Bio -->
            <div class="profile-section">
              <h2 class="profile-section-title">📝 About</h2>
              <p class="profile-bio">${seller.bio}</p>
            </div>

            <!-- Portfolio -->
            ${portfolioItems.length > 0 ? `
            <div class="profile-section">
              <h2 class="profile-section-title">🎨 Portfolio</h2>
              <div class="portfolio-grid" id="portfolioGrid">
                ${portfolioItems.map((item, i) => `
                  <div class="portfolio-item" onclick="openLightbox(${i})" id="portfolio-item-${i}">
                    <img src="${item.url}" alt="${item.caption}" loading="lazy" />
                    <div class="portfolio-item-overlay">
                      <span class="portfolio-item-caption">🔍 ${item.caption}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
            ` : ''}

            <!-- Services -->
            ${sellerServices.length > 0 ? `
            <div class="profile-section">
              <h2 class="profile-section-title">⚡ Services by ${seller.name}</h2>
              <div class="services-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); display:grid; gap:var(--space-4)">
                ${sellerServices.map(svc => `
                  <div class="service-card" id="svc-mini-${svc.id}">
                    <img src="${svc.thumbnail}" alt="${svc.title}" class="service-card-thumb" loading="lazy" />
                    <div class="service-card-body">
                      <div class="service-card-title">${svc.title}</div>
                      <div class="service-card-footer">
                        <div class="service-price">₹${svc.price.toLocaleString('en-IN')}</div>
                        <div class="service-delivery">⏱ ${svc.deliveryTime}</div>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
            ` : ''}

          </div>

          <!-- Right Column — Packages -->
          <div class="packages-sidebar">
            <h2 class="profile-section-title">💎 Service Packages</h2>
            <div class="packages-grid">
              ${pkgs.length > 0 ? pkgs.map((pkg, i) => `
                <div class="package-card ${i === 1 ? 'featured-pkg' : ''}" id="pkg-${i}">
                  <div class="package-name">${pkg.name}</div>
                  <div class="package-price">₹${(pkg.price || 0).toLocaleString('en-IN')}</div>
                  <div class="package-timeline">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    Delivery in ${pkg.timeline}
                  </div>
                  <ul class="package-deliverables">
                    ${(pkg.deliverables || []).map(d => `<li class="package-deliverable">${d}</li>`).join('')}
                  </ul>
                  <a href="https://wa.me/${seller.whatsapp}?text=Hi%20${encodeURIComponent(seller.name)}%2C%20I%27d%20like%20to%20order%20your%20${encodeURIComponent(pkg.name)}%20package%20(₹${pkg.price})%20from%20CreatorHub."
                     target="_blank" rel="noopener"
                     class="btn ${i === 1 ? 'btn-primary' : 'btn-outline'} w-full" id="pkg-cta-${i}">
                    ${i === 1 ? '⚡ Hire Now' : 'Select Package'}
                  </a>
                </div>
              `).join('') : '<p class="text-secondary text-sm">No custom packages listed.</p>'}
            </div>

            <!-- Contact Card -->
            <div class="glass-card" style="margin-top:var(--space-5); padding:var(--space-5); text-align:center;">
              <div style="font-size:1.5rem; margin-bottom:var(--space-3)">💬</div>
              <div class="font-semibold" style="margin-bottom:var(--space-2)">Have questions?</div>
              <p class="text-secondary text-sm" style="margin-bottom:var(--space-4)">Chat directly with ${seller.name} on WhatsApp before ordering.</p>
              <a href="https://wa.me/${seller.whatsapp}" target="_blank" rel="noopener" class="btn btn-whatsapp w-full" id="contact-whatsapp-${seller.id}">
                WhatsApp ${seller.name.split(' ')[0]}
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  `;

  initLightbox();
}

// ——— Lightbox ———
function openLightbox(index) {
  currentLightboxIndex = index;
  const lightbox = document.getElementById('lightbox');
  lightbox.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  updateLightboxImage();
}

function updateLightboxImage() {
  const img     = document.getElementById('lightboxImg');
  const caption = document.getElementById('lightboxCaption');
  const item    = portfolioItems[currentLightboxIndex];
  if (!item) return;
  img.src         = item.url;
  img.alt         = item.caption;
  caption.textContent = item.caption;
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  lightbox.style.display = 'none';
  document.body.style.overflow = '';
}

function initLightbox() {
  document.getElementById('lightboxClose')?.addEventListener('click', closeLightbox);
  document.getElementById('lightboxPrev')?.addEventListener('click', () => {
    currentLightboxIndex = (currentLightboxIndex - 1 + portfolioItems.length) % portfolioItems.length;
    updateLightboxImage();
  });
  document.getElementById('lightboxNext')?.addEventListener('click', () => {
    currentLightboxIndex = (currentLightboxIndex + 1) % portfolioItems.length;
    updateLightboxImage();
  });

  document.getElementById('lightbox')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (document.getElementById('lightbox')?.style.display === 'flex') {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') {
        currentLightboxIndex = (currentLightboxIndex - 1 + portfolioItems.length) % portfolioItems.length;
        updateLightboxImage();
      }
      if (e.key === 'ArrowRight') {
        currentLightboxIndex = (currentLightboxIndex + 1) % portfolioItems.length;
        updateLightboxImage();
      }
    }
  });
}
