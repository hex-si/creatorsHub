// ============================================================
// home.js — Home Page Logic
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
  initNavbar();
  initMobileNav();
  initAdsAutoScroll();
  
  // Await sequential renders that depend on data
  await renderFeaturedServices();
  await renderCategories();
  renderTestimonials(); // keep static since testimonials aren't in Supabase yet
  await renderSellerStack();
  
  animateOnScroll();
});

// ——— Navbar scroll effect ———
function initNavbar() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });
}

// ——— Mobile Nav ———
function initMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  const closeBtn  = document.getElementById('mobileNavClose');

  hamburger?.addEventListener('click', () => mobileNav.classList.add('open'));
  closeBtn?.addEventListener('click', () => mobileNav.classList.remove('open'));
  mobileNav?.addEventListener('click', (e) => {
    if (e.target === mobileNav) mobileNav.classList.remove('open');
  });
}

// ——— Ads Banner Auto Scroll ———
function initAdsAutoScroll() {
  const adContainer = document.querySelector('.ads-horizontal-scroll');
  if (!adContainer) return;
  
  // Disable snap while auto-scrolling to prevent smooth scroll fighting snap points
  let scrollInterval = setInterval(() => {
    if (adContainer.scrollLeft + adContainer.clientWidth >= adContainer.scrollWidth - 20) {
      adContainer.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      adContainer.scrollBy({ left: 320, behavior: 'smooth' });
    }
  }, 3500);

  // Pause on hover or touch
  adContainer.addEventListener('mouseenter', () => clearInterval(scrollInterval));
  adContainer.addEventListener('touchstart', () => clearInterval(scrollInterval), {passive: true});
  
  // Resume on leave
  const resumeScroll = () => {
    clearInterval(scrollInterval);
    scrollInterval = setInterval(() => {
      if (adContainer.scrollLeft + adContainer.clientWidth >= adContainer.scrollWidth - 20) {
        adContainer.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        adContainer.scrollBy({ left: 320, behavior: 'smooth' });
      }
    }, 3500);
  };
  
  adContainer.addEventListener('mouseleave', resumeScroll);
  adContainer.addEventListener('touchend', resumeScroll, {passive: true});
}

// ——— Render Categories ———
async function renderCategories() {
  const grid = document.getElementById('categoriesGrid');
  if (!grid) return;

  const services = await getServices();
  const counts = {};
  services.forEach(s => { counts[s.category] = (counts[s.category] || 0) + 1; });

  grid.innerHTML = CATEGORIES.map(cat => `
    <a href="explore.html?category=${cat.id}" class="category-card category-card--${cat.id}" id="cat-${cat.id}">
      <div class="category-icon-wrap">${cat.icon}</div>
      <div class="category-name">${cat.name}</div>
      <div class="category-desc">${cat.description}</div>
      <div class="category-count">${counts[cat.id] || 0} services →</div>
    </a>
  `).join('');
}

// ——— Render Featured Services ———
async function renderFeaturedServices() {
  const grid = document.getElementById('featuredServicesGrid');
  if (!grid) return;
  grid.innerHTML = '<p style="padding:40px;text-align:center;color:var(--text-muted)">Loading premium services...</p>';

  const [services, sellers] = await Promise.all([getServices(), getSellers()]);
  const featured = services.filter(s => s.featured).slice(0, 6);

  if (featured.length === 0) {
    grid.innerHTML = '<p style="padding:40px;text-align:center;color:var(--text-muted)">Check back shortly for premium services!</p>';
    return;
  }

  grid.innerHTML = featured.map(svc => {
    const seller = sellers.find(s => s.id === svc.seller_id);
    return buildServiceCard(svc, seller);
  }).join('');
}

// ——— Build Service Card HTML ———
function buildServiceCard(svc, seller) {
  const catColor = {
    creative: '#7C3AED', student: '#2563EB', business: '#059669', products: '#D97706'
  }[svc.category] || '#7C3AED';

  return `
    <div class="service-card" onclick="window.location='seller.html?id=${svc.seller_id}'" id="svc-card-${svc.id}">
      <img src="${svc.thumbnail}" alt="${svc.title}" class="service-card-thumb" loading="lazy" />
      <div class="service-card-body">
        <div class="service-card-seller">
          <img src="${seller?.avatar || ''}" alt="${seller?.name}" class="seller-avatar-sm" loading="lazy" />
          <span class="text-sm text-secondary">${seller?.name || 'Creator'}</span>
          ${seller?.verified ? '<span class="verified-badge" style="margin-left:auto">Verified</span>' : ''}
        </div>
        <div class="service-card-title">${svc.title}</div>
        <div style="margin-bottom:var(--space-2)">
          <span class="badge badge-purple" style="font-size:0.7rem; border-color: ${catColor}33; color: ${catColor}">
            ${CATEGORIES.find(c => c.id === svc.category)?.name || svc.category}
          </span>
        </div>
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
          onclick="event.stopPropagation(); window.location='seller.html?id=${svc.seller_id}'">
          Hire Now
        </button>
      </div>
    </div>
  `;
}

// ——— Render Testimonials ———
async function renderTestimonials() {
  const grid = document.getElementById('testimonialsGrid');
  if (!grid) return;

  const testimonials = await getTestimonials();

  if (testimonials.length === 0) {
    grid.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding: 40px; grid-column: 1 / -1;">No testimonials yet. Be the first to leave a review!</p>';
    return;
  }

  grid.innerHTML = testimonials.map(t => `
    <div class="testimonial-card" id="testimonial-${t.id}">
      <div class="testimonial-quote">"</div>
      <div class="stars">${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}</div>
      <p class="testimonial-text" style="margin-top:var(--space-3)">${t.text}</p>
      <div class="testimonial-footer">
        <img src="${t.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + t.name}" alt="${t.name}" class="testimonial-avatar" loading="lazy" />
        <div>
          <div class="testimonial-name">${t.name}</div>
          <div class="testimonial-role">${t.role || 'Customer'}</div>
        </div>
        <div class="testimonial-service">${t.service || 'Service Review'}</div>
      </div>
    </div>
  `).join('');
}

// ——— Render Seller Avatar Stack ———
async function renderSellerStack() {
  const container = document.getElementById('sellerStack');
  if (!container) return;

  const sellers = await getSellers();
  const visible = sellers.slice(0, 5);
  container.innerHTML = visible.map((s, i) => `
    <img src="${s.avatar}" alt="${s.name}" class="seller-avatar-stack"
      style="left:${i * 36}px; z-index:${10 - i}; width:56px; height:56px;"
      loading="lazy" title="${s.name}" />
  `).join('');
  container.style.width = `${(visible.length - 1) * 36 + 56}px`;
}

// ——— Scroll animations ———
function animateOnScroll() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

  const targets = document.querySelectorAll('.category-card, .service-card, .testimonial-card, .step-card');
  targets.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `opacity 0.5s ease ${i * 0.07}s, transform 0.5s ease ${i * 0.07}s`;
    observer.observe(el);

    // Immediately show if already in viewport
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        observer.unobserve(el);
      }, i * 60);
    }
  });
}
