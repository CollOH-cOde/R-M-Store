/* ============================================================
   R & M COLLECTION — Modals
   Login, Signup, Cart, Orders, Profile
   ============================================================ */

// ── Auth Modals ───────────────────────────────────────────────
function openLoginModal() {
  openModal(`
    <div class="modal-box animate-scale">
      <button class="modal-close"><i class="fa-solid fa-xmark"></i></button>
      <div class="auth-icon"><i class="fa-solid fa-shirt" style="color:var(--gold)"></i></div>
      <h2 class="auth-title">Welcome Back</h2>
      <p class="auth-sub">Sign in to shop &amp; track your orders</p>
      <div id="auth-error" class="form-error" style="display:none"></div>
      <div class="form-group">
        <label>Email Address</label>
        <div class="input-wrap">
          <i class="fa-solid fa-envelope"></i>
          <input type="email" id="login-email" placeholder="you@example.com" autocomplete="email">
        </div>
      </div>
      <div class="form-group">
        <label>Password</label>
        <div class="input-wrap" style="position:relative">
          <i class="fa-solid fa-lock"></i>
          <input type="password" id="login-pw" placeholder="••••••••" autocomplete="current-password" style="padding-right:2.5rem">
          <button class="pw-toggle" id="pw-toggle-login" type="button"><i class="fa-solid fa-eye"></i></button>
        </div>
      </div>
      <button class="btn btn-gold btn-full btn-lg" id="login-submit">
        <i class="fa-solid fa-arrow-right-to-bracket"></i> Login
      </button>
      <p class="auth-switch">Don't have an account? <button id="switch-to-signup">Sign Up Free</button></p>
    </div>
  `);

  // Toggle password visibility
  document.getElementById('pw-toggle-login').addEventListener('click', function() {
    const input = document.getElementById('login-pw');
    const icon  = this.querySelector('i');
    input.type  = input.type === 'password' ? 'text' : 'password';
    icon.className = input.type === 'password' ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash';
  });

  document.getElementById('switch-to-signup').addEventListener('click', () => { closeModal(); openSignupModal(); });

  document.getElementById('login-submit').addEventListener('click', async () => {
    const email = document.getElementById('login-email').value.trim();
    const pw    = document.getElementById('login-pw').value;
    const errEl = document.getElementById('auth-error');
    errEl.style.display = 'none';
    if (!email || !pw) { errEl.textContent = 'Please enter your email and password.'; errEl.style.display = 'block'; return; }
    const btn = document.getElementById('login-submit');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Logging in...';
    try {
      const data = await API.post('/auth/login', { email, password: pw });
      Auth.save(data.user, data.token);
      updateHeaderAuth();
      showToast(`Welcome back, ${data.user.name}!`, 'success');
      closeModal();
    } catch (err) {
      errEl.textContent = err.message || 'Login failed.';
      errEl.style.display = 'block';
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket"></i> Login';
    }
  });

  // Enter key support
  document.getElementById('login-pw').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('login-submit').click(); });
}

function openSignupModal() {
  openModal(`
    <div class="modal-box animate-scale">
      <button class="modal-close"><i class="fa-solid fa-xmark"></i></button>
      <div class="auth-icon"><i class="fa-solid fa-star" style="color:var(--gold)"></i></div>
      <h2 class="auth-title">Create Account</h2>
      <p class="auth-sub">Join R &amp; M Collection — it's free!</p>
      <div id="auth-error" class="form-error" style="display:none"></div>
      <div class="form-group">
        <label>Full Name</label>
        <div class="input-wrap">
          <i class="fa-solid fa-user"></i>
          <input type="text" id="signup-name" placeholder="e.g. John Kamau">
        </div>
      </div>
      <div class="form-group">
        <label>Email Address</label>
        <div class="input-wrap">
          <i class="fa-solid fa-envelope"></i>
          <input type="email" id="signup-email" placeholder="you@example.com">
        </div>
      </div>
      <div class="form-group">
        <label>Password <small>(min. 6 characters)</small></label>
        <div class="input-wrap" style="position:relative">
          <i class="fa-solid fa-lock"></i>
          <input type="password" id="signup-pw" placeholder="Choose a strong password" style="padding-right:2.5rem">
          <button class="pw-toggle" id="pw-toggle-signup" type="button"><i class="fa-solid fa-eye"></i></button>
        </div>
      </div>
      <button class="btn btn-gold btn-full btn-lg" id="signup-submit">
        <i class="fa-solid fa-user-plus"></i> Create Account
      </button>
      <p class="auth-switch">Already have an account? <button id="switch-to-login">Login here</button></p>
    </div>
  `);

  document.getElementById('pw-toggle-signup').addEventListener('click', function() {
    const input = document.getElementById('signup-pw');
    const icon  = this.querySelector('i');
    input.type  = input.type === 'password' ? 'text' : 'password';
    icon.className = input.type === 'password' ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash';
  });

  document.getElementById('switch-to-login').addEventListener('click', () => { closeModal(); openLoginModal(); });

  document.getElementById('signup-submit').addEventListener('click', async () => {
    const name  = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const pw    = document.getElementById('signup-pw').value;
    const errEl = document.getElementById('auth-error');
    errEl.style.display = 'none';
    if (!name || !email || !pw) { errEl.textContent = 'All fields are required.'; errEl.style.display = 'block'; return; }
    if (pw.length < 6) { errEl.textContent = 'Password must be at least 6 characters.'; errEl.style.display = 'block'; return; }
    const btn = document.getElementById('signup-submit');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Creating account...';
    try {
      const data = await API.post('/auth/signup', { name, email, password: pw });
      Auth.save(data.user, data.token);
      updateHeaderAuth();
      showToast(`Welcome to R & M, ${data.user.name}!`, 'success');
      closeModal();
    } catch (err) {
      errEl.textContent = err.message || 'Sign up failed.';
      errEl.style.display = 'block';
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Create Account';
    }
  });
}

// ── Cart Modal ────────────────────────────────────────────────
function openCartModal() {
  renderCartModal();
}

function renderCartModal() {
  const items = Cart.get();
  const total = Cart.total();
  const user  = Auth.getUser();

  let itemsHTML = '';
  if (items.length === 0) {
    itemsHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-bag-shopping"></i>
        <p>Your cart is empty</p>
        <small>Add some items to get started</small>
      </div>`;
  } else {
    items.forEach(item => {
      itemsHTML += `
        <div class="cart-item" data-id="${item.id}">
          <img src="${item.image_url || '/images/store1.jpg'}" alt="${item.name}" class="cart-item-img" onerror="this.src='/images/store1.jpg'">
          <div class="cart-item-info">
            <span class="cart-item-name">${item.name}</span>
            <span class="cart-item-price">${formatKES(item.price)}</span>
          </div>
          <div class="cart-qty">
            <button class="qty-btn" data-action="dec" data-id="${item.id}"><i class="fa-solid fa-minus"></i></button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" data-action="inc" data-id="${item.id}" data-max="${item.stock_quantity}"><i class="fa-solid fa-plus"></i></button>
          </div>
          <span class="cart-sub">${formatKES(item.price * item.qty)}</span>
          <button class="cart-remove" data-id="${item.id}"><i class="fa-solid fa-trash-can"></i></button>
        </div>`;
    });
  }

  openModal(`
    <div class="modal-box modal-box-wide animate-scale cart-modal">
      <button class="modal-close"><i class="fa-solid fa-xmark"></i></button>
      <div class="cart-header">
        <div style="display:flex;align-items:center;gap:0.75rem">
          <i class="fa-solid fa-bag-shopping" style="color:var(--gold);font-size:1.2rem"></i>
          <h2 style="font-family:var(--font-serif);font-size:1.6rem">Your Cart</h2>
        </div>
        ${items.length > 0 ? '<button id="clear-cart" class="btn btn-ghost btn-sm">Clear all</button>' : ''}
      </div>

      <div id="cart-items-container">${itemsHTML}</div>

      ${items.length > 0 ? `
        <div class="cart-total-row">
          <span>Total</span>
          <strong id="cart-total-display">${formatKES(total)}</strong>
        </div>
        <div class="checkout-section">
          <h3><i class="fa-solid fa-location-dot" style="color:var(--gold)"></i> Delivery Details</h3>
          <div class="form-group">
            <label>Delivery Address</label>
            <div class="input-wrap">
              <i class="fa-solid fa-map-pin"></i>
              <input type="text" id="delivery-address" placeholder="e.g. 12 Kenyatta Ave, Eldoret">
            </div>
          </div>
          <div class="form-group">
            <label>Phone Number</label>
            <div class="input-wrap">
              <i class="fa-solid fa-phone"></i>
              <input type="tel" id="delivery-phone" placeholder="e.g. 0712 345 678" value="${user?.phone_number || ''}">
            </div>
          </div>
          <button class="btn btn-gold btn-full btn-lg" id="place-order-btn">
            <i class="fa-solid fa-cart-shopping"></i> Place Order • ${formatKES(total)}
          </button>
        </div>
      ` : ''}
    </div>
  `, { wide: true });

  // Bind qty + remove
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id  = parseInt(btn.dataset.id);
      const max = parseInt(btn.dataset.max) || 999;
      const items = Cart.get();
      const item  = items.find(i => i.id === id);
      if (!item) return;
      if (btn.dataset.action === 'inc') Cart.updateQty(id, Math.min(item.qty + 1, max));
      else Cart.updateQty(id, item.qty - 1);
      closeModal(); renderCartModal();
    });
  });
  document.querySelectorAll('.cart-remove').forEach(btn => {
    btn.addEventListener('click', () => { Cart.remove(parseInt(btn.dataset.id)); closeModal(); renderCartModal(); });
  });
  const clearBtn = document.getElementById('clear-cart');
  if (clearBtn) clearBtn.addEventListener('click', () => { Cart.clear(); closeModal(); renderCartModal(); });

  const placeBtn = document.getElementById('place-order-btn');
  if (placeBtn) {
    placeBtn.addEventListener('click', async () => {
      const address = document.getElementById('delivery-address').value.trim();
      const phone   = document.getElementById('delivery-phone').value.trim();
      if (!address) { showToast('Please enter a delivery address.', 'error'); return; }
      if (!phone)   { showToast('Please enter a phone number.', 'error'); return; }
      placeBtn.disabled = true;
      placeBtn.innerHTML = '<span class="spinner"></span> Placing Order...';
      try {
        const items = Cart.get().map(i => ({ product_id: i.id, quantity: i.qty }));
        await API.post('/orders', { items, delivery_address: address, phone_number: phone });
        Cart.clear();
        showToast('Order placed! Check your email for confirmation.', 'success');
        closeModal();
      } catch (err) {
        showToast(err.message || 'Order failed. Please try again.', 'error');
        placeBtn.disabled = false;
        placeBtn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> Place Order • ${formatKES(Cart.total())}`;
      }
    });
  }
}

// ── Orders Modal ──────────────────────────────────────────────
async function openOrdersModal() {
  openModal(`
    <div class="modal-box modal-box-wide animate-scale">
      <button class="modal-close"><i class="fa-solid fa-xmark"></i></button>
      <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.5rem">
        <i class="fa-solid fa-box" style="color:var(--gold);font-size:1.2rem"></i>
        <h2 style="font-family:var(--font-serif);font-size:1.6rem">My Orders</h2>
      </div>
      <div id="orders-content">
        <div class="empty-state"><span class="spinner" style="width:28px;height:28px;border-width:3px"></span><p>Loading your orders...</p></div>
      </div>
    </div>
  `, { wide: true });

  try {
    const data = await API.get('/orders');
    const orders = data.orders || [];
    const el = document.getElementById('orders-content');
    if (!el) return;

    if (orders.length === 0) {
      el.innerHTML = `<div class="empty-state"><i class="fa-solid fa-box-open"></i><p>No orders yet</p><small>Your order history will appear here</small></div>`;
      return;
    }

    el.innerHTML = orders.map(order => `
      <div class="order-card" id="oc-${order.id}">
        <div class="order-card-head" onclick="toggleOrder(${order.id})">
          <div>
            <span class="order-num">Order #${order.id}</span>
            <span class="order-date">${formatDate(order.created_at)}</span>
          </div>
          <div style="display:flex;align-items:center;gap:0.75rem">
            <strong style="color:var(--gold)">${formatKES(order.total_price)}</strong>
            ${badgeHTML(order.status)}
            <i class="fa-solid fa-chevron-down order-chevron" id="ch-${order.id}" style="font-size:0.8rem;color:var(--white-50)"></i>
          </div>
        </div>
        <div class="order-card-body" id="ob-${order.id}" style="display:none">
          <div class="order-meta">
            <span><i class="fa-solid fa-map-pin" style="color:var(--gold)"></i> ${order.delivery_address}</span>
            <a href="/track/?order=${order.id}" class="track-link">Track order <i class="fa-solid fa-arrow-right"></i></a>
          </div>
          ${(order.items || []).map(item => `
            <div class="order-item-row">
              <img src="${item.image_url || '/images/store1.jpg'}" alt="${item.product_name}" onerror="this.src='/images/store1.jpg'">
              <span class="oi-name">${item.product_name}</span>
              <span class="oi-qty" style="color:var(--white-50)">×${item.quantity}</span>
              <span class="oi-price" style="color:var(--gold)">${formatKES(item.unit_price * item.quantity)}</span>
            </div>`).join('')}
        </div>
      </div>
    `).join('');
  } catch (err) {
    const el = document.getElementById('orders-content');
    if (el) el.innerHTML = `<div class="form-error">Failed to load orders. Please try again.</div>`;
  }
}

function toggleOrder(id) {
  const body    = document.getElementById(`ob-${id}`);
  const chevron = document.getElementById(`ch-${id}`);
  if (!body) return;
  const open = body.style.display === 'none';
  body.style.display = open ? 'block' : 'none';
  if (chevron) chevron.style.transform = open ? 'rotate(180deg)' : '';
}

// ── Profile Modal ─────────────────────────────────────────────
function openProfileModal() {
  const user = Auth.getUser();
  openModal(`
    <div class="modal-box animate-scale">
      <button class="modal-close"><i class="fa-solid fa-xmark"></i></button>
      <div class="auth-icon"><i class="fa-solid fa-user" style="color:var(--gold)"></i></div>
      <h2 class="auth-title">My Profile</h2>
      <p class="auth-sub">Manage your account details</p>
      <div class="profile-tabs">
        <button class="active" id="tab-details" onclick="switchProfileTab('details')"><i class="fa-solid fa-user"></i> My Details</button>
        <button id="tab-password" onclick="switchProfileTab('password')"><i class="fa-solid fa-lock"></i> Change Password</button>
      </div>
      <div id="profile-tab-content">
        <div id="msg-details" class="form-error" style="display:none"></div>
        <div class="form-group">
          <label>Full Name</label>
          <div class="input-wrap">
            <i class="fa-solid fa-user"></i>
            <input type="text" id="profile-name" value="${user?.name || ''}" placeholder="Your full name">
          </div>
        </div>
        <div class="form-group">
          <label>Email Address <small>(cannot be changed)</small></label>
          <input type="email" value="${user?.email || ''}" disabled style="opacity:0.5">
        </div>
        <div class="form-group">
          <label>Phone Number</label>
          <div class="input-wrap">
            <i class="fa-solid fa-phone"></i>
            <input type="tel" id="profile-phone" value="${user?.phone_number || ''}" placeholder="e.g. 0712 345 678">
          </div>
        </div>
        <button class="btn btn-gold btn-full" id="save-profile">Save Changes</button>
      </div>
    </div>
  `);

  document.getElementById('save-profile').addEventListener('click', async () => {
    const name  = document.getElementById('profile-name')?.value.trim();
    const phone = document.getElementById('profile-phone')?.value.trim();
    const msg   = document.getElementById('msg-details');
    if (!name) { if(msg){msg.textContent='Name is required.';msg.style.display='block';} return; }
    const btn = document.getElementById('save-profile');
    btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Saving...';
    try {
      const data = await API.put('/auth/profile', { name, phone_number: phone });
      const updated = { ...Auth.getUser(), name: data.user?.name || name, phone_number: data.user?.phone_number || phone };
      Auth.save(updated, Auth.getToken());
      updateHeaderAuth();
      showToast('Profile updated!', 'success');
      closeModal();
    } catch (err) {
      if(msg){msg.textContent=err.message||'Update failed.';msg.style.display='block';}
      btn.disabled = false; btn.innerHTML = 'Save Changes';
    }
  });
}

function switchProfileTab(tab) {
  document.getElementById('tab-details')?.classList.toggle('active', tab === 'details');
  document.getElementById('tab-password')?.classList.toggle('active', tab === 'password');

  const content = document.getElementById('profile-tab-content');
  if (!content) return;

  if (tab === 'details') {
    const user = Auth.getUser();
    content.innerHTML = `
      <div id="msg-details" class="form-error" style="display:none"></div>
      <div class="form-group">
        <label>Full Name</label>
        <div class="input-wrap"><i class="fa-solid fa-user"></i><input type="text" id="profile-name" value="${user?.name||''}" placeholder="Your full name"></div>
      </div>
      <div class="form-group">
        <label>Email <small>(cannot be changed)</small></label>
        <input type="email" value="${user?.email||''}" disabled style="opacity:0.5">
      </div>
      <div class="form-group">
        <label>Phone Number</label>
        <div class="input-wrap"><i class="fa-solid fa-phone"></i><input type="tel" id="profile-phone" value="${user?.phone_number||''}" placeholder="e.g. 0712 345 678"></div>
      </div>
      <button class="btn btn-gold btn-full" id="save-profile">Save Changes</button>`;
    document.getElementById('save-profile').addEventListener('click', async () => {
      const name  = document.getElementById('profile-name')?.value.trim();
      const phone = document.getElementById('profile-phone')?.value.trim();
      const msg   = document.getElementById('msg-details');
      if (!name) { if(msg){msg.textContent='Name is required.';msg.style.display='block';} return; }
      const btn = document.getElementById('save-profile');
      btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Saving...';
      try {
        const data = await API.put('/auth/profile', { name, phone_number: phone });
        const updated = { ...Auth.getUser(), name: data.user?.name || name, phone_number: data.user?.phone_number || phone };
        Auth.save(updated, Auth.getToken());
        updateHeaderAuth();
        showToast('Profile updated!', 'success');
        closeModal();
      } catch (err) {
        if(msg){msg.textContent=err.message||'Update failed.';msg.style.display='block';}
        btn.disabled = false; btn.innerHTML = 'Save Changes';
      }
    });
  } else {
    content.innerHTML = `
      <div id="msg-pw" class="form-error" style="display:none"></div>
      <div class="form-group"><label>Current Password</label><input type="password" id="pw-current" placeholder="Enter current password"></div>
      <div class="form-group"><label>New Password</label><input type="password" id="pw-new" placeholder="Min. 6 characters"></div>
      <div class="form-group"><label>Confirm New Password</label><input type="password" id="pw-confirm" placeholder="Repeat new password"></div>
      <button class="btn btn-gold btn-full" id="save-password">Change Password</button>`;
    document.getElementById('save-password').addEventListener('click', async () => {
      const cur  = document.getElementById('pw-current')?.value;
      const nw   = document.getElementById('pw-new')?.value;
      const conf = document.getElementById('pw-confirm')?.value;
      const msg  = document.getElementById('msg-pw');
      const show = (t) => { if(msg){msg.textContent=t;msg.style.display='block';} };
      if (!cur || !nw || !conf) { show('All fields are required.'); return; }
      if (nw.length < 6) { show('New password must be at least 6 characters.'); return; }
      if (nw !== conf) { show('Passwords do not match.'); return; }
      const btn = document.getElementById('save-password');
      btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Changing...';
      try {
        await API.put('/auth/change-password', { current_password: cur, new_password: nw });
        showToast('Password changed!', 'success');
        closeModal();
      } catch (err) {
        show(err.message || 'Password change failed.');
        btn.disabled = false; btn.innerHTML = 'Change Password';
      }
    });
  }
}
