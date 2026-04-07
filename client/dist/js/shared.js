/* ============================================================
   R & M COLLECTION — Shared Utilities
   API, Auth, Cart, Toast
   ============================================================ */

// ── API ──────────────────────────────────────────────────────
const API = {
  BASE: '/api',

  getHeaders(extra = {}) {
    const token = Auth.getToken();
    const headers = { 'Content-Type': 'application/json', ...extra };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  },

  async request(method, path, body = null, isFormData = false) {
    const opts = { method, headers: isFormData ? {} : this.getHeaders() };
    if (isFormData) {
      const token = Auth.getToken();
      if (token) opts.headers['Authorization'] = `Bearer ${token}`;
      opts.body = body;
    } else if (body) {
      opts.body = JSON.stringify(body);
    }
    const res = await fetch(this.BASE + path, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw { status: res.status, message: data.message || 'Request failed' };
    return data;
  },

  get   (path)       { return this.request('GET', path); },
  post  (path, body) { return this.request('POST', path, body); },
  put   (path, body) { return this.request('PUT', path, body); },
  patch (path, body) { return this.request('PATCH', path, body); },
  delete(path)       { return this.request('DELETE', path); },
  upload(path, fd)   { return this.request('POST', path, fd, true); },
};

// ── Toast ────────────────────────────────────────────────────
function initToast() {
  if (!document.getElementById('toast-container')) {
    const el = document.createElement('div');
    el.id = 'toast-container';
    document.body.appendChild(el);
  }
}

function showToast(message, type = 'info') {
  initToast();
  const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i><span>${message}</span>`;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(100%)'; el.style.transition = '0.3s ease'; setTimeout(() => el.remove(), 300); }, 3500);
}

// ── Auth ─────────────────────────────────────────────────────
const Auth = {
  KEY_TOKEN: 'rm_token',
  KEY_USER:  'rm_user',

  getToken() { return localStorage.getItem(this.KEY_TOKEN); },
  getUser()  {
    try { return JSON.parse(localStorage.getItem(this.KEY_USER)); }
    catch { return null; }
  },
  isLoggedIn() { return !!this.getToken(); },
  isAdmin()    { return this.getUser()?.role === 'admin'; },

  save(user, token) {
    localStorage.setItem(this.KEY_TOKEN, token);
    localStorage.setItem(this.KEY_USER, JSON.stringify(user));
  },
  logout() {
    localStorage.removeItem(this.KEY_TOKEN);
    localStorage.removeItem(this.KEY_USER);
  },
};

// ── Cart ─────────────────────────────────────────────────────
const Cart = {
  KEY: 'rm_cart',

  get() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || []; }
    catch { return []; }
  },
  save(items) { localStorage.setItem(this.KEY, JSON.stringify(items)); Cart.onUpdate(); },
  clear()     { localStorage.removeItem(this.KEY); Cart.onUpdate(); },

  add(product) {
    const items = this.get();
    const idx = items.findIndex(i => i.id === product.id);
    if (idx > -1) {
      items[idx].qty = Math.min(items[idx].qty + 1, product.stock_quantity);
    } else {
      items.push({ ...product, qty: 1 });
    }
    this.save(items);
  },

  remove(id) {
    this.save(this.get().filter(i => i.id !== id));
  },

  updateQty(id, qty) {
    if (qty < 1) { this.remove(id); return; }
    const items = this.get();
    const idx = items.findIndex(i => i.id === id);
    if (idx > -1) {
      const max = items[idx].stock_quantity || 999;
      items[idx].qty = Math.min(qty, max);
      this.save(items);
    }
  },

  count() { return this.get().reduce((s, i) => s + i.qty, 0); },
  total() { return this.get().reduce((s, i) => s + i.price * i.qty, 0); },

  onUpdate() {
    const badge = document.getElementById('cart-count');
    if (badge) {
      const count = Cart.count();
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  },
};

// ── Modal System ─────────────────────────────────────────────
function openModal(html, opts = {}) {
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'active-modal';
  overlay.innerHTML = html;
  if (opts.wide) overlay.querySelector('.modal-box')?.classList.add('modal-box-wide');
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  const closeBtn = overlay.querySelector('.modal-close');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  return overlay;
}

function closeModal() {
  const m = document.getElementById('active-modal');
  if (m) { m.remove(); document.body.style.overflow = ''; }
}

// ── Format helpers ───────────────────────────────────────────
function formatKES(n) { return 'KES ' + Number(n).toLocaleString('en-KE'); }
function formatDate(d) { return new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }); }
function formatDateTime(d) { return new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
function badgeHTML(status) {
  return `<span class="badge badge-${status}">${status}</span>`;
}

// ── Update Header Auth State ─────────────────────────────────
// ── Update Header Auth State ─────────────────────────────────
function updateHeaderAuth() {
  const user = Auth.getUser();
  // Desktop
  const guestBtns = document.getElementById('header-guest');
  const userBtns  = document.getElementById('header-user');
  const userName  = document.getElementById('header-username');
  if (guestBtns) guestBtns.style.display = user ? 'none' : 'flex';
  if (userBtns)  userBtns.style.display  = user ? 'flex' : 'none';
  if (userName)  userName.textContent = user?.name?.split(' ')[0] || '';
  const adminBtn = document.getElementById('btn-admin');
  if (adminBtn) adminBtn.style.display = (user?.role === 'admin') ? 'flex' : 'none';
  // Mobile nav
  const mobInfo    = document.getElementById('mob-user-info');  if (mobInfo)    mobInfo.style.display    = user ? 'block' : 'none';
  const mobUname   = document.getElementById('mob-username');   if (mobUname)   mobUname.textContent     = user ? user.name.split(' ')[0] : '';
  const mobLogin   = document.getElementById('mob-login');      if (mobLogin)   mobLogin.style.display   = user ? 'none'  : 'block';
  const mobSignup  = document.getElementById('mob-signup');     if (mobSignup)  mobSignup.style.display  = user ? 'none'  : 'block';
  const mobOrders  = document.getElementById('mob-orders');     if (mobOrders)  mobOrders.style.display  = user ? 'block' : 'none';
  const mobProfile = document.getElementById('mob-profile');    if (mobProfile) mobProfile.style.display = user ? 'block' : 'none';
  const mobAdmin   = document.getElementById('mob-admin');      if (mobAdmin)   mobAdmin.style.display   = (user?.role === 'admin') ? 'block' : 'none';
  const mobLogout  = document.getElementById('mob-logout');     if (mobLogout)  mobLogout.style.display  = user ? 'block' : 'none';
  Cart.onUpdate();
}

// ── Init on DOM Ready ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initToast();
  Cart.onUpdate();
  updateHeaderAuth();
});