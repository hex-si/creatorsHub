// ============================================================
// nav.js — CreatorHub Shared Navigation
// Handles: hamburger, mobile nav, bottom nav, active links
// ============================================================

(function () {
  'use strict';

  // ——— Inject Mobile Nav if missing ———
  if (!document.getElementById('mobileNav')) {
    const mobileNav = document.createElement('div');
    mobileNav.className = 'mobile-nav';
    mobileNav.id = 'mobileNav';
    mobileNav.innerHTML = `
      <button class="mobile-nav-close" id="mobileNavClose" aria-label="Close menu">✕</button>
      <a href="index.html" class="nav-link">🏠 Home</a>
      <a href="explore.html" class="nav-link">🔍 Explore Services</a>
      <a href="products.html" class="nav-link">🛍️ Products</a>
      <a href="become-seller.html" class="nav-link">✨ Become a Seller</a>
      <a href="request.html" class="nav-link">⚡ Request a Service</a>
      <a href="orders.html" class="nav-link">📦 Track Order</a>
      <div style="height:1px; background:rgba(255,255,255,0.08); width:80%; margin: 8px 0;"></div>
      <a href="become-seller.html" class="btn btn-primary" style="margin-top:8px; min-width:200px;">Start Selling →</a>
    `;
    document.body.appendChild(mobileNav);
  }

  // ——— Hamburger Toggle ———
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  const mobileNavClose = document.getElementById('mobileNavClose');

  function openMobileNav() {
    mobileNav?.classList.add('open');
    document.body.style.overflow = 'hidden';
    hamburger?.setAttribute('aria-expanded', 'true');
  }

  function closeMobileNav() {
    mobileNav?.classList.remove('open');
    document.body.style.overflow = '';
    hamburger?.setAttribute('aria-expanded', 'false');
  }

  hamburger?.addEventListener('click', openMobileNav);
  mobileNavClose?.addEventListener('click', closeMobileNav);

  // Close on nav link click
  mobileNav?.querySelectorAll('a').forEach((link) =>
    link.addEventListener('click', closeMobileNav)
  );

  // Close on backdrop click
  mobileNav?.addEventListener('click', (e) => {
    if (e.target === mobileNav) closeMobileNav();
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileNav();
  });

  // ——— Navbar Scroll Effect ———
  const navbar = document.getElementById('navbar');
  if (navbar && !navbar.classList.contains('scrolled')) {
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Run on load
  }

  // ——— Active Nav Link Detection ———
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach((link) => {
    const href = link.getAttribute('href')?.split('?')[0].split('/').pop();
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // ——— Bottom Navigation Bar (mobile only) ———
  if (!document.getElementById('bottomNav')) {
    const currentUser = localStorage.getItem('creatorHubUser');
    const page = window.location.pathname.split('/').pop() || 'index.html';

    const isActive = (p) => (page === p || (page === '' && p === 'index.html') ? 'active' : '');

    const accountHref = currentUser ? 'profile.html?id=seller-1' : '#';
    const accountOnClick = currentUser ? '' : 'onclick="if(typeof openAuthModal!==\'undefined\'){openAuthModal();}return false;"';

    const nav = document.createElement('nav');
    nav.id = 'bottomNav';
    nav.className = 'bottom-nav';
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Main navigation');
    nav.innerHTML = `
      <a href="index.html" class="bottom-nav-link ${isActive('index.html')}" aria-label="Home">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span>Home</span>
      </a>
      <a href="explore.html" class="bottom-nav-link ${isActive('explore.html')}" aria-label="Explore">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <span>Explore</span>
      </a>
      <a href="products.html" class="bottom-nav-link ${isActive('products.html')}" aria-label="Products">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        <span>Products</span>
      </a>
      <a href="${accountHref}" class="bottom-nav-link ${isActive('profile.html')}" aria-label="Account" ${accountOnClick}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
        <span>Account</span>
      </a>
    `;
    document.body.appendChild(nav);
  }
})();
