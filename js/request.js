// ============================================================
// request.js — Request a Service Form Logic
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileNav();
  initDescCounter();
  setMinDate();
  initForm();
  readURLParams();
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

function initDescCounter() {
  const desc  = document.getElementById('requestDesc');
  const count = document.getElementById('descCount');
  desc?.addEventListener('input', () => {
    count.textContent = desc.value.length;
  });
}

function setMinDate() {
  const deadline = document.getElementById('requestDeadline');
  if (deadline) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    deadline.min = tomorrow.toISOString().split('T')[0];
  }
}

function readURLParams() {
  const params = new URLSearchParams(window.location.search);
  const seller = params.get('seller');
  if (seller) {
    const sellerObj = SELLERS.find(s => s.id === seller);
    if (sellerObj && document.getElementById('requestDesc')) {
      document.getElementById('requestDesc').placeholder = 
        `I'd like to hire ${sellerObj.name}. Please describe what you need from them...`;
    }
  }
}

function fillExample(text) {
  const desc = document.getElementById('requestDesc');
  if (desc) {
    desc.value = text;
    desc.dispatchEvent(new Event('input'));
    desc.scrollIntoView({ behavior: 'smooth', block: 'center' });
    desc.focus();
  }
}

function initForm() {
  const form = document.getElementById('requestForm');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (validateRequestForm()) submitRequest();
  });
}

function validateRequestForm() {
  let isValid = true;

  // Clear errors
  document.querySelectorAll('.form-control.error').forEach(el => el.classList.remove('error'));
  document.querySelectorAll('.field-error').forEach(el => el.remove());

  const reqDesc     = document.getElementById('requestDesc');
  const reqCategory = document.getElementById('requestCategory');
  const reqBudget   = document.getElementById('requestBudget');
  const reqDeadline = document.getElementById('requestDeadline');
  const reqName     = document.getElementById('reqName');
  const reqWhatsapp = document.getElementById('reqWhatsapp');

  if (!reqDesc?.value.trim() || reqDesc.value.trim().length < 20) {
    showError(reqDesc, 'Please describe your request in at least 20 characters');
    isValid = false;
  }

  if (!reqCategory?.value) {
    showError(reqCategory, 'Please select a category');
    isValid = false;
  }

  if (!reqBudget?.value || parseInt(reqBudget.value) < 100) {
    showError(reqBudget, 'Please enter a budget of at least ₹100');
    isValid = false;
  }

  if (!reqDeadline?.value) {
    showError(reqDeadline, 'Please select a deadline');
    isValid = false;
  }

  if (!reqName?.value.trim()) {
    showError(reqName, 'Your name is required');
    isValid = false;
  }

  if (!reqWhatsapp?.value || !/^\d{10}$/.test(reqWhatsapp.value.replace(/\s/g, ''))) {
    showError(reqWhatsapp, 'Please enter a valid 10-digit WhatsApp number');
    isValid = false;
  }

  return isValid;
}

function showError(el, msg) {
  if (!el) return;
  el.classList.add('error');
  el.focus();
  const err = document.createElement('div');
  err.className = 'field-error';
  err.innerHTML = `<span>⚠</span> ${msg}`;
  el.closest('.form-group')?.appendChild(err) || el.parentNode.appendChild(err);
}

function submitRequest() {
  const btn = document.getElementById('submitRequestBtn');
  if (btn) {
    btn.textContent = 'Submitting...';
    btn.disabled = true;
  }

  setTimeout(() => {
    // Generate reference number
    const ref = 'REQ-' + Date.now().toString(36).toUpperCase();
    document.getElementById('refNumber').textContent = ref;

    document.getElementById('requestForm').style.display = 'none';
    document.getElementById('requestSuccess').style.display = 'block';

    // Scroll to success
    document.getElementById('requestSuccess').scrollIntoView({ behavior: 'smooth' });
  }, 1200);
}
