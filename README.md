# CreatorHub

A curated marketplace for local creators — design, tutoring, marketing, food & more.
Fixed prices · Admin-approved · WhatsApp checkout.

---

## Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript (no framework)
- **Styling**: Custom dark-mode design system (`css/main.css` + `css/mobile.css`)
- **Data**: Mock data in `js/data.js` (to be replaced with Supabase)
- **Auth**: Mock auth in `js/auth.js` (to be replaced with Supabase/Firebase Auth)
- **PWA**: `sw.js` + `js/pwa.js` — offline caching + push notifications (Firebase VAPID needed)
- **Hosting**: Netlify (current) → Cloudflare Pages (planned)

---

## Project Structure

```
app/
├── index.html              # Home page
├── explore.html            # Browse services
├── products.html           # Physical products marketplace
├── profile.html            # Creator profile
├── become-seller.html      # Seller application form
├── orders.html             # Order tracking
├── request.html            # Custom service request
├── admin.html              # Admin dashboard (password: admin2025)
├── 404.html                # Error page
├── sw.js                   # Service worker (PWA + Push)
├── manifest.json           # PWA manifest
├── _headers                # Cloudflare / Netlify response headers
├── _redirects              # Cloudflare / Netlify redirect rules
├── netlify.toml            # Netlify-specific config (delete when on Cloudflare)
├── css/
│   ├── main.css            # Global design system
│   ├── mobile.css          # Mobile fixes + bottom nav
│   ├── home.css            # Home page styles
│   ├── explore.css         # Explore page styles
│   ├── products.css        # Products page styles
│   ├── forms.css           # Form styles (become-seller, request)
│   ├── orders.css          # Order tracking styles
│   ├── seller.css          # Seller page styles
│   └── admin.css           # Admin dashboard styles
└── js/
    ├── data.js             # ⚠️ Mock data → replace with Supabase queries
    ├── auth.js             # ⚠️ Mock auth → replace with Supabase/Firebase Auth
    ├── nav.js              # Shared navigation (hamburger + bottom nav)
    ├── pwa.js              # PWA install prompt + push notifications
    ├── home.js             # Home page logic
    ├── explore.js          # Service explorer + filters
    ├── products.js         # Products marketplace + cart
    ├── profile.js          # Creator profile tabs
    ├── orders.js           # Order tracking
    ├── become-seller.js    # Seller application form
    ├── request.js          # Custom request form
    └── admin.js            # Admin dashboard
```

---

## Planned Integrations

### Supabase
- Replace `js/data.js` with Supabase client queries
- Replace `js/auth.js` with `@supabase/supabase-js` auth
- Tables needed: `sellers`, `services`, `products`, `orders`, `applications`
- Storage bucket for profile images + portfolio

### Firebase
- Push notifications via Firebase Cloud Messaging
- Set VAPID key in `js/pwa.js` → `const VAPID_KEY = 'your-key'`
- Add firebase config script to `index.html`

### GitHub
```bash
git init
git add .
git commit -m "feat: initial CreatorHub release"
git remote add origin https://github.com/YOUR_USERNAME/creatorhub.git
git push -u origin main
```

### Cloudflare Pages
1. Connect GitHub repo in Cloudflare Dashboard → Pages
2. Build command: *(none — static site)*
3. Build output: `/` (root)
4. Delete `netlify.toml` — `_headers` and `_redirects` handle Cloudflare

---

## Deployment (Current — Netlify)

Drag the entire `app/` folder to: **https://app.netlify.com/drop**

