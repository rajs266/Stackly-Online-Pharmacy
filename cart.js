/* =============================================================================
   CART.JS — Stackly Pharmacy
   Shared cart logic using localStorage. Works across all pages.
   ============================================================================= */

let cart = JSON.parse(localStorage.getItem('stackly_cart')) || [];

/* ── Save & Broadcast ── */
function saveCart() {
  localStorage.setItem('stackly_cart', JSON.stringify(cart));
}

/* ── Add to Cart ── */
function addToCart(name, brand, price, img) {
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty += 1;
    showToast(`${name} quantity updated`, 'fa-cart-plus');
  } else {
    cart.push({ name, brand: brand || '', price, img: img || '', qty: 1 });
    showToast(`${name} added to cart`, 'fa-cart-plus');
  }
  saveCart();
  renderCart();
  updateCartBadge();
  openCart();
}

/* ── Remove from Cart ── */
function removeFromCart(name) {
  cart = cart.filter(i => i.name !== name);
  saveCart();
  renderCart();
  updateCartBadge();
  showToast('Item removed from cart', 'fa-trash');
}

/* ── Change Item Quantity ── */
function changeItemQty(name, delta) {
  const item = cart.find(i => i.name === name);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) { removeFromCart(name); return; }
  saveCart();
  renderCart();
  updateCartBadge();
}

/* ── Open / Close Sidebar ── */
function openCart() {
  const overlay = document.getElementById('cartOverlay');
  const sidebar = document.getElementById('cartSidebar');
  if (!overlay && !sidebar) return;
  if (overlay) overlay.classList.add('active');
  if (sidebar) sidebar.classList.add('active');
  document.body.style.overflow = 'hidden';
  renderCart();
}
function closeCart() {
  const overlay = document.getElementById('cartOverlay');
  const sidebar = document.getElementById('cartSidebar');
  if (overlay) overlay.classList.remove('active');
  if (sidebar) sidebar.classList.remove('active');
  document.body.style.overflow = '';
}

/* ── Render Cart Body ── */
function renderCart() {
  const body = document.getElementById('cartBody');
  const footer = document.getElementById('cartFooter');
  const subtotalEl = document.getElementById('cartSubtotal');
  const totalEl = document.getElementById('cartTotal');
  if (!body) return;

  body.innerHTML = '';

  if (cart.length === 0) {
    body.innerHTML = `
      <div class="cart-empty">
        <i class="fa-solid fa-bag-shopping"></i>
        <div class="cart-empty-title">Your cart is empty</div>
        <p style="font-size:0.85rem;">Add some products to get started</p>
        <button class="btn btn-primary btn-sm" onclick="closeCart();window.location.href='store.html';">
          <i class="fa-solid fa-store"></i> Shop Now
        </button>
      </div>`;
    if (footer) footer.style.display = 'none';
    return;
  }

  let subtotal = 0;
  cart.forEach(item => {
    subtotal += item.price * item.qty;
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <div class="cart-item-img">
        <img src="${item.img || 'assets/prod_vitamin.png'}" alt="${item.name}" />
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-brand">${item.brand}</div>
        <div class="cart-item-price">₹${(item.price * item.qty).toLocaleString('en-IN')}</div>
        <div class="cart-item-controls">
          <button class="cart-qty-btn" onclick="changeItemQty('${item.name}', -1)" aria-label="Decrease"><i class="fa-solid fa-minus"></i></button>
          <span class="cart-qty-num">${item.qty}</span>
          <button class="cart-qty-btn" onclick="changeItemQty('${item.name}', 1)" aria-label="Increase"><i class="fa-solid fa-plus"></i></button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart('${item.name}')" aria-label="Remove"><i class="fa-solid fa-xmark"></i></button>`;
    body.appendChild(el);
  });

  if (footer) footer.style.display = 'block';
  if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  if (totalEl) totalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
}

/* ── Update Badge Count ── */
function updateCartBadge() {
  const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
  document.querySelectorAll('.cart-badge, #cartBadge').forEach(el => {
    el.textContent = totalQty;
    if (totalQty > 0) { el.classList.add('show'); el.style.display = 'flex'; }
    else { el.classList.remove('show'); el.style.display = 'none'; }
  });
}

/* ── Toast Notification ── */
function showToast(message, icon = 'fa-circle-check') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fa-solid ${icon}"></i>${message}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(16px)';
    toast.style.transition = 'all 0.35s';
    setTimeout(() => toast.remove(), 400);
  }, 3200);
}

/* ── Apply Promo (placeholder) ── */
function applyPromo() {
  const input = document.getElementById('promoInput');
  if (!input) return;
  const code = input.value.trim().toUpperCase();
  if (code === 'STACK40') showToast('Promo STACK40 applied! 40% off.', 'fa-tag');
  else showToast('Invalid code. Try STACK40', 'fa-circle-xmark');
}

/* ── Initialize on Page Load ── */
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  renderCart();
});
