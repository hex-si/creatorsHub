// ============================================================
// become-seller.js — Multi-Step Application Form Logic
// ============================================================

let currentStep = 1;
const totalSteps = 3;
const formData = {};

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileNav();
  renderSidebarSellers();
  initForm();
  initBioCounter();
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

// ——— Sidebar sellers ———
function renderSidebarSellers() {
  const container = document.getElementById('sidebarSellers');
  if (!container) return;

  const visible = SELLERS.slice(0, 4);
  container.innerHTML = `
    <div class="seller-mini-list">
      ${visible.map(s => `
        <div class="seller-mini-item" id="sidebar-seller-${s.id}">
          <img src="${s.avatar}" alt="${s.name}" class="seller-mini-avatar" loading="lazy" />
          <div>
            <div class="seller-mini-name">${s.name}</div>
            <div class="seller-mini-role">${s.tagline.split('&')[0].trim()}</div>
          </div>
          <span class="badge badge-green" style="margin-left:auto;font-size:0.65rem">Active</span>
        </div>
      `).join('')}
    </div>
    <div style="margin-top:var(--space-4); text-align:center">
      <a href="explore.html" class="btn btn-ghost btn-sm" style="font-size:0.8rem">See all sellers →</a>
    </div>
  `;
}

// ——— Bio Character Counter ———
function initBioCounter() {
  const bio   = document.getElementById('bio');
  const count = document.getElementById('bioCount');
  bio?.addEventListener('input', () => {
    const len = bio.value.length;
    count.textContent = len;
    count.style.color = len < 80 ? 'var(--red-400)' : 'var(--green-500)';
  });
}

// ——— Form Navigation ———
function initForm() {
  document.getElementById('nextStep1Btn')?.addEventListener('click', () => {
    if (validateStep(1)) goToStep(2);
  });

  document.getElementById('prevStep2Btn')?.addEventListener('click', () => goToStep(1));
  document.getElementById('nextStep2Btn')?.addEventListener('click', () => {
    if (validateStep(2)) {
      collectFormData();
      buildReviewSummary();
      goToStep(3);
    }
  });

  document.getElementById('prevStep3Btn')?.addEventListener('click', () => goToStep(2));

  document.getElementById('sellerApplicationForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (validateStep(3)) submitForm();
  });
}

function goToStep(step) {
  // Hide current, show target
  document.getElementById(`formStep${currentStep}`)?.classList.remove('active');
  document.getElementById(`formStep${step}`)?.classList.add('active');

  // Update indicators
  for (let i = 1; i <= totalSteps; i++) {
    const indicator = document.getElementById(`step-indicator-${i}`);
    if (!indicator) continue;
    indicator.classList.remove('active', 'completed');
    if (i < step) indicator.classList.add('completed');
    if (i === step) indicator.classList.add('active');

    // Override dot content for completed steps
    const dot = indicator.querySelector('.step-dot');
    if (dot && i < step) {
      dot.textContent = '✓';
    } else if (dot) {
      dot.textContent = i;
    }
  }

  currentStep = step;

  // Scroll to form top
  document.querySelector('.form-layout')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ——— Validation ———
function validateStep(step) {
  let isValid = true;

  // Clear previous errors
  document.querySelectorAll('.form-control.error').forEach(el => el.classList.remove('error'));
  document.querySelectorAll('.field-error').forEach(el => el.remove());

  if (step === 1) {
    isValid = validateField('fullName', 'Name is required') && isValid;
    isValid = validateEmail('email') && isValid;
    isValid = validatePhone('phone') && isValid;
    isValid = validatePhone('whatsapp') && isValid;
    isValid = validateField('city', 'City is required') && isValid;
  }

  if (step === 2) {
    isValid = validateField('category', 'Please select a category') && isValid;
    isValid = validateField('tagline', 'Tagline is required') && isValid;
    isValid = validateMinLength('bio', 80, 'Bio must be at least 80 characters') && isValid;
    isValid = validateField('sampleWork', 'Please describe your sample work') && isValid;
  }

  if (step === 3) {
    const agreeTerms = document.getElementById('agreeTerms');
    if (!agreeTerms?.checked) {
      showError(agreeTerms, 'You must agree to the terms to continue');
      isValid = false;
    }
  }

  return isValid;
}

function validateField(id, msg) {
  const el = document.getElementById(id);
  if (!el) return true;
  if (!el.value.trim()) {
    showError(el, msg);
    return false;
  }
  return true;
}

function validateEmail(id) {
  const el = document.getElementById(id);
  if (!el) return true;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!el.value.trim() || !re.test(el.value)) {
    showError(el, 'Please enter a valid email address');
    return false;
  }
  return true;
}

function validatePhone(id) {
  const el = document.getElementById(id);
  if (!el) return true;
  if (!/^\d{10}$/.test(el.value.replace(/\s/g, ''))) {
    showError(el, 'Please enter a valid 10-digit number');
    return false;
  }
  return true;
}

function validateMinLength(id, min, msg) {
  const el = document.getElementById(id);
  if (!el) return true;
  if (el.value.trim().length < min) {
    showError(el, msg);
    return false;
  }
  return true;
}

function showError(el, msg) {
  if (!el) return;
  el.classList.add('error');
  el.focus();
  const err = document.createElement('div');
  err.className = 'field-error';
  err.innerHTML = `<span>⚠</span> ${msg}`;
  el.parentNode.appendChild(err);
}

// ——— Collect Form Data ———
function collectFormData() {
  const ids = ['fullName', 'email', 'phone', 'whatsapp', 'city', 'category', 'tagline', 'bio', 'portfolio', 'sampleWork', 'priceMin', 'priceMax'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) formData[id] = el.value;
  });
}

// ——— Build Review Summary ———
function buildReviewSummary() {
  const container = document.getElementById('reviewSummary');
  if (!container) return;

  const catLabel = {
    creative: '🎨 Creative', student: '📚 Student Services',
    business: '📈 Business Growth', products: '📦 Products'
  }[formData.category] || formData.category;

  const rows = [
    { label: 'Name', value: formData.fullName },
    { label: 'Email', value: formData.email },
    { label: 'Phone', value: formData.phone },
    { label: 'WhatsApp', value: formData.whatsapp },
    { label: 'City', value: formData.city },
    { label: 'Category', value: catLabel },
    { label: 'Tagline', value: formData.tagline },
    { label: 'Portfolio', value: formData.portfolio || '—' },
    { label: 'Pricing', value: formData.priceMin && formData.priceMax
        ? `₹${parseInt(formData.priceMin).toLocaleString('en-IN')} – ₹${parseInt(formData.priceMax).toLocaleString('en-IN')}`
        : '—' },
  ];

  container.innerHTML = rows.map(r => `
    <div class="review-row">
      <span class="review-label">${r.label}</span>
      <span class="review-value">${r.value}</span>
    </div>
  `).join('');
}

// ——— Submit ———
function submitForm() {
  const btn = document.getElementById('submitBtn');
  if (btn) {
    btn.textContent = 'Submitting...';
    btn.disabled = true;
  }

  // Simulate API call
  setTimeout(() => {
    document.getElementById('sellerApplicationForm').style.display = 'none';
    document.getElementById('successScreen').style.display = 'block';

    // Hide progress indicator
    document.getElementById('formProgress').style.display = 'none';
  }, 1500);
}
