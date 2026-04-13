document.addEventListener('DOMContentLoaded', async () => {
  if(typeof triggerAuthRender === 'function') triggerAuthRender();
  await loadProfile();
});

async function loadProfile() {
  try {
    const params = new URLSearchParams(window.location.search);
    const sellerId = params.get('id'); // Default for demo
    
    const header = document.getElementById('profileHeaderContent');
    if (!sellerId) {
      if (header) header.innerHTML = `<h2 style="color:red;">Error: No ID specified!</h2>`;
      return;
    }

    const seller = await getSellerById(sellerId);
    if(!seller) {
      if (header) header.innerHTML = `<h2>Seller not found</h2>`;
      return;
    }

    // Check Ownership
    const userCache = localStorage.getItem('creatorHubUser');
    let isOwner = false;
    let overridedData = null;
    if(userCache) {
      try {
        const parsed = JSON.parse(userCache);
        if(parsed.id === seller.id) {
          isOwner = true;
          overridedData = parsed;
        }
      } catch(e){}
    }

    const dispName = overridedData && overridedData.name ? overridedData.name : seller.name;
    const dispAvatar = overridedData && overridedData.avatar ? overridedData.avatar : seller.avatar;
    const dispRole = overridedData && overridedData.role ? overridedData.role : (seller.role || 'Creator');
    const dispTagline = overridedData && overridedData.tagline ? overridedData.tagline : (seller.tagline || '');
    const dispBio = overridedData && overridedData.bio ? overridedData.bio : (seller.bio || '');

    const stats = seller.stats || { ordersCompleted: 0, avgDelivery: 'N/A', responseRate: 'N/A' };

    // Header Inject
    const header = document.getElementById('profileHeaderContent');
    header.innerHTML = `
      <img src="${dispAvatar}" class="profile-avatar" alt="${dispName}" />
      <div>
        <h1 class="page-title" style="margin-bottom:4px;">${dispName} ${seller.verified ? '<span class="badge badge-green" style="font-size:0.8rem; vertical-align:middle;">✓ Verified</span>' : ''}</h1>
        <p style="font-size:1rem; color:var(--text-muted); margin-bottom:12px;">${seller.username || '@user'} <span style="margin-left:8px; display:inline-block; padding:2px 8px; background:rgba(124,58,237,0.1); color:var(--purple-400); border-radius:12px; font-size:0.75rem; font-weight:600; text-transform:uppercase; letter-spacing:0.05em;">${dispRole}</span></p>
        <p class="text-secondary" style="font-size:1.1rem; margin-bottom:16px;">${dispTagline}</p>
        <div style="display:flex; gap:16px; flex-wrap:wrap;">
          <span class="badge" style="background:rgba(255,255,255,0.05);">📦 ${stats.ordersCompleted} Orders</span>
          <span class="badge" style="background:rgba(255,255,255,0.05);">⏱️ ${stats.avgDelivery} Avg</span>
          <span class="badge" style="background:rgba(255,255,255,0.05);">💬 ${stats.responseRate} Response</span>
        </div>
      </div>
      <div style="margin-left:auto; text-align:right;">
        ${isOwner ? 
          `<button class="btn btn-outline btn-lg" style="margin-right:8px;" onclick="openEditProfileModal()">✏️ Edit Profile</button>
           <button class="btn btn-primary btn-lg" onclick="openAddServiceModal()">+ Add Service / Charge</button>` 
          : 
          `<a href="https://wa.me/${seller.whatsapp || ''}" target="_blank" class="btn btn-primary btn-lg" style="background:#25D366; border-color:#25D366; color:white;">💬 Chat on WhatsApp</a>`
        }
      </div>
    `;


  // Services/Packages Inject
  const servicesContainer = document.getElementById('tab-services');
  const sellerServices = await getServices(seller.id);
  const sellerPackages = seller.packages || [];
  
  let packagesHTML = `<h3 style="font-size:1.5rem; margin-bottom:20px;">Packages Built for You</h3><div class="packages-grid">`;
  if (sellerPackages.length === 0) packagesHTML += '<p>No packages defined.</p>';
  sellerPackages.forEach(pkg => {
    packagesHTML += `
      <div class="glass-card" style="padding:24px; display:flex; flex-direction:column;">
        <h4 style="font-size:1.2rem; color:var(--purple-400); margin-bottom:8px;">${pkg.name}</h4>
        <div style="font-size:1.8rem; font-weight:800; margin-bottom:16px;">₹${pkg.price}</div>
        <ul style="color:var(--text-secondary); margin-bottom:24px; font-size:0.9rem; flex:1;">
          ${pkg.deliverables.map(d => `<li style="margin-bottom:8px;">✓ ${d}</li>`).join('')}
        </ul>
        <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:16px;">⏱️ Delivery in ${pkg.timeline}</div>
        <button class="btn btn-outline w-full">Select Package</button>
      </div>
    `;
  });
  packagesHTML += `</div>`;
  
  if (sellerServices.length > 0) {
    packagesHTML += `<h3 style="font-size:1.5rem; margin-top:40px; margin-bottom:20px;">Individual Services</h3><div class="services-grid-explore" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">`;
    sellerServices.forEach(svc => {
      packagesHTML += `
        <div class="glass-card" style="padding:16px;">
          <img src="${svc.thumbnail}" style="width:100%; height:150px; object-fit:cover; border-radius:8px; margin-bottom:16px;" />
          <div style="font-weight:700; margin-bottom:8px;">${svc.title}</div>
          <div style="color:var(--text-muted); font-size:0.85rem; margin-bottom:16px;">${svc.description}</div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="font-weight:800; font-size:1.1rem; color:var(--purple-400);">₹${svc.price}</div>
            <button class="btn btn-primary btn-sm">Hire</button>
          </div>
        </div>
      `;
    });
    packagesHTML += `</div>`;
  }
  servicesContainer.innerHTML = packagesHTML;

  // Portfolio Inject
  const portfolioContainer = document.getElementById('tab-portfolio');
  let portHTML = `<div class="portfolio-grid">`;
  const sellerPortfolio = seller.portfolio || [];
  sellerPortfolio.forEach(item => {
    portHTML += `
      <div class="portfolio-item glass-card" style="padding:12px;">
        <img src="${item.url}" alt="${item.caption}" />
        <div style="padding-top:12px; font-weight:600; text-align:center; font-size:0.9rem;">${item.caption}</div>
      </div>
    `;
  });
  portHTML += `</div>`;
  portfolioContainer.innerHTML = portHTML;

  // About Inject
  const aboutContainer = document.getElementById('tab-about');
  const featuresHTML = (seller.features && seller.features.length > 0)
    ? `
      <div style="margin-top:28px; padding-top:24px; border-top:1px solid var(--border-medium);">
        <div style="color:var(--text-muted); font-size:0.8rem; font-weight:600; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:14px;">Skills & Expertise</div>
        <div style="display:flex; flex-wrap:wrap; gap:10px;">
          ${seller.features.map(f => `<span style="display:inline-block; padding:6px 14px; background:rgba(124,58,237,0.12); color:var(--purple-400); border:1px solid rgba(124,58,237,0.25); border-radius:20px; font-size:0.85rem; font-weight:600;">${f}</span>`).join('')}
        </div>
      </div>`
    : '';

  aboutContainer.innerHTML = `
    <div class="glass-card" style="padding:32px; max-width:800px;">
      <h3 style="font-size:1.5rem; margin-bottom:16px;">About ${dispName.split(' ')[0]}</h3>
      <p style="color:var(--text-secondary); line-height:1.7; font-size:1.05rem; margin-bottom:0;">${dispBio}</p>
      ${featuresHTML}
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; border-top:1px solid var(--border-medium); padding-top:24px; margin-top:24px;">
        <div>
          <div style="color:var(--text-muted); font-size:0.8rem; margin-bottom:4px;">Member Since</div>
          <div style="font-weight:600;">${seller.memberSince}</div>
        </div>
        <div>
          <div style="color:var(--text-muted); font-size:0.8rem; margin-bottom:4px;">Primary Category</div>
          <div style="font-weight:600; text-transform:capitalize;">${seller.category}</div>
        </div>
      </div>
    </div>
  `;
  } catch (err) {
    console.error('Failed to load profile:', err);
    const header = document.getElementById('profileHeaderContent');
    if (header) {
      header.innerHTML = `<h2 style="color:red;">Error rendering profile: ${err.message}</h2>`;
    }
  }
}

function switchTab(tabId, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

  if (btn) btn.classList.add('active');
  document.getElementById('tab-' + tabId).classList.add('active');
}

// —— Add Service Modal Logic ——
function openAddServiceModal() {
  document.getElementById('addServiceModal').style.display = 'flex';
}
function closeAddServiceModal() {
  document.getElementById('addServiceModal').style.display = 'none';
}
function submitNewService(e) {
  e.preventDefault();
  const form = e.target;
  const newSvc = {
    id: 'svc-pending-' + Date.now(),
    sellerId: new URLSearchParams(window.location.search).get('id') || 'seller-1',
    title: form.title.value,
    category: form.category.value,
    price: parseInt(form.price.value),
    deliveryTime: form.deliveryTime.value,
    description: form.description.value,
    thumbnail: 'https://picsum.photos/seed/' + Date.now() + '/400/250',
    status: 'pending_review'
  };

  let pending = JSON.parse(localStorage.getItem('pendingServices') || '[]');
  pending.push(newSvc);
  localStorage.setItem('pendingServices', JSON.stringify(pending));

  closeAddServiceModal();
  alert('Service submitted! Awaiting Admin approval.');
  form.reset();
}

// —— Edit Profile Modal Logic ——
let selectedAvatarFile = null;

async function openEditProfileModal() {
  const sellerId = new URLSearchParams(window.location.search).get('id') || 'seller-1';
  // Attempt to load current data
  const userCache = localStorage.getItem('creatorHubUser');
  let currentRole = 'Creator';
  let tagline = '';
  let bio = '';
  let avatar = '';

  if (userCache) {
    const parsed = JSON.parse(userCache);
    if (parsed.avatar) avatar = parsed.avatar;
    if (parsed.tagline) tagline = parsed.tagline;
    if (parsed.bio) bio = parsed.bio;
    if (parsed.role) currentRole = parsed.role;
  }
  
  if (!avatar) {
    const s = await getSellerById(sellerId);
    if (s) {
      avatar = s.avatar_url || s.avatar;
      tagline = tagline || s.tagline;
      bio = bio || s.bio;
      currentRole = currentRole || s.role;
    }
  }

  document.getElementById('avatarPreview').src = avatar || 'https://via.placeholder.com/150';
  document.getElementById('editTagline').value = tagline || '';
  document.getElementById('editBio').value = bio || '';
  
  const radios = document.getElementsByName('accountRole');
  for (let i = 0; i < radios.length; i++) {
    if (radios[i].value.toLowerCase() === (currentRole || '').toLowerCase()) {
      radios[i].checked = true;
    }
  }

  document.getElementById('editProfileModal').style.display = 'flex';
}

function closeEditProfileModal() {
  document.getElementById('editProfileModal').style.display = 'none';
  selectedAvatarFile = null;
}

function handleAvatarSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  selectedAvatarFile = file;
  
  // Local preview immediately
  const previewUrl = URL.createObjectURL(file);
  document.getElementById('avatarPreview').src = previewUrl;
}

async function submitProfileEdit(e) {
  e.preventDefault();
  const btn = document.getElementById('saveProfileBtn');
  btn.textContent = 'Saving...';
  btn.disabled = true;

  try {
    const formData = new FormData();
    formData.append('tagline', document.getElementById('editTagline').value);
    formData.append('bio', document.getElementById('editBio').value);
    
    let role = 'Creator';
    const radios = document.getElementsByName('accountRole');
    for (let i = 0; i < radios.length; i++) {
      if (radios[i].checked) role = radios[i].value;
    }
    formData.append('role', role);

    if (selectedAvatarFile) {
      formData.append('avatar', selectedAvatarFile);
    }

    // Mock Backend Fetch
    // const response = await fetch('/api/user/profile', { method: 'POST', body: formData });
    await new Promise(r => setTimeout(r, 800)); // Simulate network

    let currentAvatarUrl = document.getElementById('avatarPreview').src;
    
    const userCache = localStorage.getItem('creatorHubUser');
    if (userCache) {
      const parsed = JSON.parse(userCache);
      parsed.tagline = document.getElementById('editTagline').value;
      parsed.bio = document.getElementById('editBio').value;
      parsed.role = role;
      if (selectedAvatarFile) {
        parsed.avatar = currentAvatarUrl;
      }
      localStorage.setItem('creatorHubUser', JSON.stringify(parsed));
    }

    closeEditProfileModal();
    window.location.reload(); 
  } catch (error) {
    console.error('Error saving profile:', error);
    alert('Failed to save profile.');
  } finally {
    btn.textContent = 'Save Changes';
    btn.disabled = false;
  }
}
