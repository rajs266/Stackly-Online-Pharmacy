
let cart = JSON.parse(localStorage.getItem('stackly_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('stackly_wishlist')) || [];
let qvCurrentProduct = null;
let qvQty = 1;


function saveCart() {
  localStorage.setItem('stackly_cart', JSON.stringify(cart));
}

function addToCart(name, brand, price, img, qty=1) {
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty += qty;
    showToast(`${name} quantity updated`, 'fa-cart-plus');
  } else {
    cart.push({ name, brand: brand || '', price, img: img || '', qty: qty });
    showToast(`${name} added to cart`, 'fa-cart-plus');
  }
  saveCart();
  renderCart();
  updateCartBadge();
}


function toggleWishlist(name, brand, price, img, btn) {
  const index = wishlist.findIndex(i => i.name === name);
  const icon = btn ? btn.querySelector('i') : null;

  if (index === -1) {
    wishlist.push({ name, brand, price, img });
    showToast(`${name} added to wishlist ❤️`, 'fa-heart');
    if (icon) { icon.classList.replace('fa-regular', 'fa-solid'); btn.classList.add('wishlist-active'); }
  } else {
    wishlist.splice(index, 1);
    showToast(`${name} removed from wishlist`, 'fa-heart');
    if (icon) { icon.classList.replace('fa-solid', 'fa-regular'); btn.classList.remove('wishlist-active'); }
  }
  localStorage.setItem('stackly_wishlist', JSON.stringify(wishlist));
  updateWishlistBadge();
}


function removeFromCart(name) {
  cart = cart.filter(i => i.name !== name);
  saveCart();
  renderCart();
  updateCartBadge();
  showToast('Item removed from cart', 'fa-trash');
}


function changeItemQty(name, delta) {
  const item = cart.find(i => i.name === name);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) { removeFromCart(name); return; }
  saveCart();
  renderCart();
  updateCartBadge();
}


function injectCartHTML() {
  if (document.getElementById('cartSidebar')) return;
  const style = `
    <style>
      .cart-overlay {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.5); z-index: 1040; opacity: 0; visibility: hidden;
        transition: all 0.3s ease;
      }
      .cart-overlay.active { opacity: 1; visibility: visible; }
      .cart-sidebar {
        position: fixed; top: 0; right: -400px; width: 100%; max-width: 400px;
        height: 100%; background: #fff; z-index: 1050; display: flex; flex-direction: column;
        transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: -5px 0 15px rgba(0,0,0,0.1);
      }
      .cart-sidebar.active { right: 0; }
      .cart-header {
        padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center;
        border-bottom: 1px solid var(--border-light, #eee); background: var(--bg, #f4faf7);
      }
      .cart-header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; color: var(--primary, #0a7c5e); }
      .cart-close { background: none; border: none; font-size: 1.25rem; cursor: pointer; color: #666; }
      .cart-body { flex: 1; overflow-y: auto; padding: 1.5rem; }
      .cart-footer { padding: 1.5rem; border-top: 1px solid var(--border-light, #eee); background: #fff; }
      .cart-total-row { display: flex; justify-content: space-between; align-items: center; }
      .cart-empty { text-align: center; padding: 3rem 1rem; color: #888; }
      .cart-empty i { font-size: 3rem; margin-bottom: 1rem; color: #ccc; }
      .cart-empty-title { font-weight: 600; font-size: 1.1rem; color: #444; margin-bottom: 0.5rem; }
      .cart-item { display: flex; gap: 1rem; margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid #f0f0f0; position: relative; }
      .cart-item-img { width: 70px; height: 70px; flex-shrink: 0; background: #f9f9f9; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
      .cart-item-img img { max-width: 100%; max-height: 100%; object-fit: contain; }
      .cart-item-info { flex: 1; }
      .cart-item-name { font-weight: 600; font-size: 0.95rem; color: #222; margin-bottom: 0.25rem; line-height: 1.2; padding-right: 20px;}
      .cart-item-brand { font-size: 0.8rem; color: #888; margin-bottom: 0.5rem; }
      .cart-item-price { font-weight: 700; color: var(--primary, #0a7c5e); }
      .cart-item-controls { display: flex; align-items: center; gap: 0.75rem; margin-top: 0.5rem; }
      .cart-qty-btn { background: #eee; border: none; width: 24px; height: 24px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; }
      .cart-qty-num { font-weight: 600; font-size: 0.9rem; }
      .cart-item-remove { position: absolute; top: 0; right: 0; background: none; border: none; color: #aaa; cursor: pointer; font-size: 1.1rem; }
      .cart-item-remove:hover { color: #f05a5a; }
    </style>
  `;
  const html = `
    <div class="cart-overlay" id="cartOverlay" onclick="closeCart()"></div>
    <div class="cart-sidebar" id="cartSidebar">
      <div class="cart-header">
        <h3><i class="fa-solid fa-cart-shopping"></i> Your Cart</h3>
        <button class="cart-close" onclick="closeCart()" aria-label="Close cart"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="cart-body" id="cartBody"></div>
      <div class="cart-footer" id="cartFooter">
        <div class="cart-total-row"><span>Subtotal:</span><strong id="cartSubtotal">₹0</strong></div>
        <div class="cart-total-row" style="font-size:1.1rem;margin-top:0.5rem;"><span>Total:</span><strong id="cartTotal" style="color:#0a7c5e;">₹0</strong></div>
        <button class="btn btn-primary" style="width:100%;margin-top:1rem;font-size:1.05rem;" onclick="location.href='404.html'">Proceed to Checkout</button>
      </div>
    </div>
  `;
  document.head.insertAdjacentHTML('beforeend', style);
  document.body.insertAdjacentHTML('beforeend', html);
}

function openCart() {
  injectCartHTML();
  const overlay = document.getElementById('cartOverlay');
  const sidebar = document.getElementById('cartSidebar');
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


function updateCartBadge() {
  const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
  document.querySelectorAll('.cart-count, .cart-badge, #cartBadge').forEach(el => {
    el.textContent = totalQty;
    el.classList.add('show');
    el.style.display = 'flex';
  });
}

function updateWishlistBadge() {
  const totalQty = wishlist.length;
  document.querySelectorAll('.wishlist-count').forEach(el => {
    el.textContent = totalQty;
    el.style.display = 'flex'; 
  });
  syncAllWishlistButtonsState();
}

function syncAllWishlistButtonsState() {
  const cards = document.querySelectorAll('.prod-card, .top-pick-item, .prod-col');
  cards.forEach(card => {
    const nameEl = card.querySelector('.prod-name');
    if (!nameEl) return;
    const name = nameEl.textContent.trim();
    const isWishlisted = wishlist.some(i => i.name === name);
    const btns = card.querySelectorAll('.prod-action-btn[aria-label="Wishlist"], .mobile-action-btn[onclick*="toggleWishlist"], .prod-action-btn[onclick*="404.html"], .prod-action-btn[onclick*="addWishlist"]');
    btns.forEach(btn => {
      const icon = btn.querySelector('i');
      if (isWishlisted) {
        if (icon) {
          icon.classList.remove('fa-regular');
          icon.classList.add('fa-solid');
        }
        btn.classList.add('wishlist-active');
        btn.style.background = '#f05a5a';
        btn.style.color = '#fff';
      } else {
        if (icon) {
          icon.classList.remove('fa-solid');
          icon.classList.add('fa-regular');
        }
        btn.classList.remove('wishlist-active');
        btn.style.background = '';
        btn.style.color = '';
      }
    });
  });

  if (typeof qvCurrentProduct !== 'undefined' && qvCurrentProduct) {
    updateQVWishlistState(qvCurrentProduct.name);
  }
}

function initWishlistButtons() {
  const cards = document.querySelectorAll('.prod-card');
  cards.forEach(card => {
    const nameEl = card.querySelector('.prod-name');
    const brandEl = card.querySelector('.prod-brand');
    const priceEl = card.querySelector('.prod-price');
    const imgEl = card.querySelector('.prod-img, .prod-thumb-img');
    
    if (!nameEl) return;
    
    const name = nameEl.textContent.trim();
    const brand = brandEl ? brandEl.textContent.trim() : '';
    const img = imgEl ? imgEl.getAttribute('src') : '';
    let price = 0;
    if (priceEl) {
      const priceText = priceEl.textContent.replace(/[^\d]/g, '');
      price = parseInt(priceText, 10) || 0;
    }
    
    const btns = card.querySelectorAll('.prod-action-btn, .mobile-action-btn');
    btns.forEach(btn => {
      
      const isWishlistBtn = btn.getAttribute('aria-label') === 'Wishlist' || 
                            btn.querySelector('.fa-heart') || 
                            (btn.getAttribute('onclick') && (btn.getAttribute('onclick').includes('Wishlist') || btn.getAttribute('onclick').includes('404.html')));
      
      if (isWishlistBtn) {
        btn.removeAttribute('onclick');
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(name, brand, price, img, btn);
        });
      }
    });
  });
}

function addWishlist(btn) {
  const card = btn.closest('.prod-card');
  if (!card) return;

  const nameEl = card.querySelector('.prod-name');
  const brandEl = card.querySelector('.prod-brand');
  const priceEl = card.querySelector('.prod-price');
  const imgEl = card.querySelector('.prod-img, .prod-thumb-img');

  if (!nameEl) return;

  const name = nameEl.textContent.trim();
  const brand = brandEl ? brandEl.textContent.trim() : '';
  const img = imgEl ? imgEl.getAttribute('src') : '';
  let price = 0;
  if (priceEl) {
    const priceText = priceEl.textContent.replace(/[^\d]/g, '');
    price = parseInt(priceText, 10) || 0;
  }

  toggleWishlist(name, brand, price, img, btn);
}

function updateQVWishlistState(name) {
  const isWishlisted = wishlist.some(i => i.name === name);
  const qvBtn = document.getElementById('qvWishlistBtn');
  if (qvBtn) {
    const icon = qvBtn.querySelector('i');
    if (isWishlisted) {
      if (icon) {
        icon.classList.remove('fa-regular');
        icon.classList.add('fa-solid');
      }
      qvBtn.classList.add('wishlist-active');
      qvBtn.style.background = '#f05a5a';
      qvBtn.style.color = '#fff';
    } else {
      if (icon) {
        icon.classList.remove('fa-solid');
        icon.classList.add('fa-regular');
      }
      qvBtn.classList.remove('wishlist-active');
      qvBtn.style.background = '';
      qvBtn.style.color = '';
    }
  }
}

function injectWishlistHTML() {
  if (document.getElementById('wishlistSidebar')) return;
  const style = `
    <style>
      .wishlist-overlay {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.5); z-index: 1040; opacity: 0; visibility: hidden;
        transition: all 0.3s ease;
      }
      .wishlist-overlay.active { opacity: 1; visibility: visible; }
      .wishlist-sidebar {
        position: fixed; top: 0; right: -400px; width: 100%; max-width: 400px;
        height: 100%; background: #fff; z-index: 1050; display: flex; flex-direction: column;
        transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: -5px 0 15px rgba(0,0,0,0.1);
      }
      .wishlist-sidebar.active { right: 0; }
      .wishlist-header {
        padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center;
        border-bottom: 1px solid var(--border-light, #eee); background: var(--bg, #f4faf7);
      }
      .wishlist-header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; color: var(--primary, #0a7c5e); }
      .wishlist-close { background: none; border: none; font-size: 1.25rem; cursor: pointer; color: #666; }
      .wishlist-body { flex: 1; overflow-y: auto; padding: 1.5rem; }
      .wishlist-empty { text-align: center; padding: 3rem 1rem; color: #888; }
      .wishlist-empty i { font-size: 3rem; margin-bottom: 1rem; color: #ccc; }
      .wishlist-empty-title { font-weight: 600; font-size: 1.1rem; color: #444; margin-bottom: 0.5rem; }
      .wishlist-item { display: flex; gap: 1rem; margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid #f0f0f0; position: relative; align-items: center; }
      .wishlist-item-img { width: 70px; height: 70px; flex-shrink: 0; background: #f9f9f9; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
      .wishlist-item-img img { max-width: 100%; max-height: 100%; object-fit: contain; }
      .wishlist-item-info { flex: 1; min-width: 0; }
      .wishlist-item-name { font-weight: 600; font-size: 0.95rem; color: #222; margin-bottom: 0.25rem; line-height: 1.2; padding-right: 20px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; }
      .wishlist-item-brand { font-size: 0.8rem; color: #888; margin-bottom: 0.5rem; }
      .wishlist-item-price { font-weight: 700; color: var(--primary, #0a7c5e); margin-bottom: 0.5rem; }
      .wishlist-item-remove { position: absolute; top: 0; right: 0; background: none; border: none; color: #aaa; cursor: pointer; font-size: 1.1rem; }
      .wishlist-item-remove:hover { color: #f05a5a; }
      .wishlist-to-cart-btn {
        padding: 0.4rem 0.8rem;
        font-size: 0.8rem;
        border-radius: 6px;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
      }
    </style>
  `;
  const html = `
    <div class="wishlist-overlay" id="wishlistOverlay" onclick="closeWishlist()"></div>
    <div class="wishlist-sidebar" id="wishlistSidebar">
      <div class="wishlist-header">
        <h3><i class="fa-solid fa-heart"></i> Your Wishlist</h3>
        <button class="wishlist-close" onclick="closeWishlist()" aria-label="Close wishlist"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="wishlist-body" id="wishlistBody"></div>
    </div>
  `;
  document.head.insertAdjacentHTML('beforeend', style);
  document.body.insertAdjacentHTML('beforeend', html);
}

function openWishlist() {
  injectWishlistHTML();
  const overlay = document.getElementById('wishlistOverlay');
  const sidebar = document.getElementById('wishlistSidebar');
  if (overlay) overlay.classList.add('active');
  if (sidebar) sidebar.classList.add('active');
  document.body.style.overflow = 'hidden';
  renderWishlist();
}

function closeWishlist() {
  const overlay = document.getElementById('wishlistOverlay');
  const sidebar = document.getElementById('wishlistSidebar');
  if (overlay) overlay.classList.remove('active');
  if (sidebar) sidebar.classList.remove('active');
  document.body.style.overflow = '';
}

function renderWishlist() {
  const body = document.getElementById('wishlistBody');
  if (!body) return;

  body.innerHTML = '';

  if (wishlist.length === 0) {
    body.innerHTML = `
      <div class="wishlist-empty">
        <i class="fa-solid fa-heart"></i>
        <div class="wishlist-empty-title">Your wishlist is empty</div>
        <p style="font-size:0.85rem;">Save your favorite products here</p>
        <button class="btn btn-primary btn-sm" onclick="closeWishlist();window.location.href='store.html';">
          <i class="fa-solid fa-store"></i> Browse Store
        </button>
      </div>`;
    return;
  }

  wishlist.forEach(item => {
    const el = document.createElement('div');
    el.className = 'wishlist-item';
    el.innerHTML = `
      <div class="wishlist-item-img">
        <img src="${item.img || 'assets/prod_vitamin.png'}" alt="${item.name}" />
      </div>
      <div class="wishlist-item-info">
        <div class="wishlist-item-name">${item.name}</div>
        <div class="wishlist-item-brand">${item.brand}</div>
        <div class="wishlist-item-price">₹${item.price.toLocaleString('en-IN')}</div>
        <button class="btn btn-primary wishlist-to-cart-btn" onclick="addToCart('${item.name.replace(/'/g, "\\'")}', '${item.brand.replace(/'/g, "\\'")}', ${item.price}, '${item.img}'); toggleWishlist('${item.name.replace(/'/g, "\\'")}', '${item.brand.replace(/'/g, "\\'")}', ${item.price}, '${item.img}', null); renderWishlist();">
          <i class="fa-solid fa-cart-plus"></i> Add to Cart
        </button>
      </div>
      <button class="wishlist-item-remove" onclick="toggleWishlist('${item.name.replace(/'/g, "\\'")}', '${item.brand.replace(/'/g, "\\'")}', ${item.price}, '${item.img}', null); renderWishlist();" aria-label="Remove"><i class="fa-solid fa-xmark"></i></button>`;
    body.appendChild(el);
  });
}


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


function applyPromo() {
  const input = document.getElementById('promoInput');
  if (!input) return;
  const code = input.value.trim().toUpperCase();
  if (code === 'STACK40') showToast('Promo STACK40 applied! 40% off.', 'fa-tag');
  else showToast('Invalid code. Try STACK40', 'fa-circle-xmark');
}


document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  updateWishlistBadge();
  initWishlistButtons();
  initMobileQuickViewButtons();
  renderCart();
});

function initMobileQuickViewButtons() {
  const cards = document.querySelectorAll('.prod-card');
  cards.forEach(card => {
    if (card.querySelector('.prod-quick-btn')) return;
    
    const cartBtn = card.querySelector('.prod-cart-btn');
    if (!cartBtn) return;
    
    const overlayQvBtn = card.querySelector('.prod-overlay .prod-action-btn[aria-label="Quick View"], .prod-overlay button[onclick*="openQuickView"]');
    if (!overlayQvBtn) return;
    
    const onclickAttr = overlayQvBtn.getAttribute('onclick');
    if (!onclickAttr) return;
    
    const qvBtn = document.createElement('button');
    qvBtn.className = 'prod-quick-btn';
    qvBtn.setAttribute('aria-label', 'Quick View');
    qvBtn.setAttribute('onclick', onclickAttr);
    qvBtn.innerHTML = '<i class="fa-regular fa-eye"></i>';
    
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.gap = '0.4rem';
    wrapper.style.alignItems = 'center';
    
    cartBtn.parentNode.insertBefore(wrapper, cartBtn);
    wrapper.appendChild(qvBtn);
    wrapper.appendChild(cartBtn);
  });
}


function injectQuickViewHTML() {
  if (document.getElementById('qvBackdrop')) return;
  const style = `
    <style>
      .qv-modal-backdrop {
        position: fixed; inset: 0;
        background: rgba(13,27,42,0.65);
        z-index: 2000;
        display: flex; align-items: center; justify-content: center;
        padding: 1rem;
        opacity: 0; visibility: hidden;
        transition: opacity 0.3s, visibility 0.3s;
        backdrop-filter: blur(4px);
      }
      .qv-modal-backdrop.open { opacity: 1; visibility: visible; }
      .qv-modal {
        background: #fff;
        border-radius: 1.5rem;
        max-width: 700px;
        width: 100%;
        max-height: 92vh;
        overflow-y: auto;
        transform: scale(0.9) translateY(30px);
        transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
        position: relative;
        text-align: left;
      }
      .qv-modal-backdrop.open .qv-modal { transform: scale(1) translateY(0); }
      .qv-close {
        position: absolute; top: 1rem; right: 1rem;
        width: 36px; height: 36px;
        border-radius: 50%;
        background: #f0f6f4;
        border: none;
        display: flex; align-items: center; justify-content: center;
        font-size: 1rem; color: #0d1b2a;
        cursor: pointer; z-index: 5;
        transition: background 0.2s, transform 0.3s;
        -webkit-tap-highlight-color: transparent;
      }
      .qv-close:hover { background: #0a7c5e; color: #fff; transform: rotate(90deg); }
      .qv-thumb {
        background: linear-gradient(135deg, #e8f9f4, #f0faf7);
        height: 220px;
        display: flex; align-items: center; justify-content: center;
        font-size: 6rem;
        border-radius: 1.5rem 1.5rem 0 0;
      }
      .qv-thumb img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
      .qv-body { padding: 1.5rem; }
      .qv-brand { font-size: 0.78rem; color: #687d94; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; }
      .qv-name { font-family: var(--font-display); font-size: 1.4rem; font-weight: 800; color: #0d1b2a; margin: 0.4rem 0 0.5rem; }
      .qv-stars { color: #f7b731; font-size: 0.88rem; margin-bottom: 0.85rem; }
      .qv-stars span { color: #687d94; }
      .qv-desc { font-size: 0.9rem; color: #2e4057; line-height: 1.7; margin-bottom: 1.25rem; }
      .qv-price-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem; }
      .qv-price { font-family: var(--font-body); font-size: 1.6rem; font-weight: 800; color: #0a7c5e; }
      .qv-price-old { font-size: 1rem; color: #687d94; text-decoration: line-through; }
      .qv-save { background: #e8f9f4; color: #0a7c5e; font-size: 0.76rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 9999px; }
      .qv-qty { display: flex; align-items: center; gap: 0; border: 1.5px solid rgba(10,124,94,0.2); border-radius: 9999px; overflow: hidden; margin-bottom: 1rem; width: fit-content; }
      .qv-qty-btn { width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; background: #f0f6f4; border: none; font-size: 1rem; color: #0a7c5e; cursor: pointer; transition: background 0.2s; }
      .qv-qty-btn:hover { background: #0a7c5e; color: #fff; }
      .qv-qty-num { width: 44px; text-align: center; font-weight: 700; font-size: 0.95rem; }
    </style>
  `;
  const html = `
    <div class="qv-modal-backdrop" id="qvBackdrop" role="dialog" aria-modal="true" aria-label="Quick View" onclick="closeQV(event)">
      <div class="qv-modal" id="qvModal">
        <button class="qv-close" onclick="closeQV(event)" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
        <div class="qv-thumb" id="qvThumb"></div>
        <div class="qv-body">
          <div class="qv-brand" id="qvBrand"></div>
          <div class="qv-name" id="qvName"></div>
          <div class="qv-stars" id="qvStars"></div>
          <p class="qv-desc" id="qvDesc"></p>
          <div class="qv-price-row">
            <div class="qv-price" id="qvPrice"></div>
            <div class="qv-price-old" id="qvOld"></div>
            <div class="qv-save" id="qvSave" style="display:none;"></div>
          </div>
          <div class="qv-qty">
            <button class="qv-qty-btn" onclick="changeQty(-1)" aria-label="Decrease"><i class="fa-solid fa-minus"></i></button>
            <span class="qv-qty-num" id="qvQtyNum">1</span>
            <button class="qv-qty-btn" onclick="changeQty(1)" aria-label="Increase"><i class="fa-solid fa-plus"></i></button>
          </div>
          <div style="display:flex;gap:0.75rem;flex-wrap:wrap;">
            <button class="btn btn-primary" style="flex:1;min-width:0;" onclick="addToCartFromQV()" id="qvAddBtn">
              <i class="fa-solid fa-cart-plus"></i> Add to Cart
            </button>
            <button class="btn btn-outline" style="flex-shrink:0;" onclick="addWishlistQV()" id="qvWishlistBtn" aria-label="Add to Wishlist">
              <i class="fa-regular fa-heart"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.head.insertAdjacentHTML('beforeend', style);
  document.body.insertAdjacentHTML('beforeend', html);
}

function openQuickView(name, brand, emoji, desc, price, oldPrice, rating, reviewCount, badgeClass, badgeText) {
  injectQuickViewHTML();
  qvCurrentProduct = { name, brand, emoji, price };
  qvQty = 1;
  const qtyNumEl = document.getElementById('qvQtyNum');
  if (qtyNumEl) qtyNumEl.textContent = 1;

  const thumbEl = document.getElementById('qvThumb');
  if (thumbEl) {
    if (emoji && emoji.includes('assets/')) {
      thumbEl.innerHTML = `<img src="${emoji}" alt="${name}" style="width: 100%; height: 100%; object-fit: contain;">`;
    } else {
      thumbEl.innerHTML = emoji || '';
    }
  }
  const brandEl = document.getElementById('qvBrand');
  if (brandEl) brandEl.textContent = brand;
  const nameEl = document.getElementById('qvName');
  if (nameEl) nameEl.textContent = name;
  const descEl = document.getElementById('qvDesc');
  if (descEl) descEl.innerHTML = desc;
  const priceEl = document.getElementById('qvPrice');
  if (priceEl) priceEl.textContent = '₹' + price.toLocaleString('en-IN');

  const oldEl = document.getElementById('qvOld');
  const saveEl = document.getElementById('qvSave');
  if (oldEl && saveEl) {
    if (oldPrice) {
      oldEl.textContent = '₹' + oldPrice.toLocaleString('en-IN');
      const pct = Math.round((1 - price/oldPrice)*100);
      saveEl.textContent = 'Save ' + pct + '%';
      saveEl.style.display = '';
    } else {
      oldEl.textContent = '';
      saveEl.style.display = 'none';
    }
  }

  const starsEl = document.getElementById('qvStars');
  if (starsEl) {
    const ratingNum = parseFloat(rating);
    let stars = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(ratingNum)) stars += '<i class="fa-solid fa-star"></i>';
      else if (i - ratingNum < 1) stars += '<i class="fa-solid fa-star-half-stroke"></i>';
      else stars += '<i class="fa-regular fa-star"></i>';
    }
    starsEl.innerHTML = stars + ` <span style="color:#687d94;">(${reviewCount} reviews)</span>`;
  }

  updateQVWishlistState(name);

  const backdrop = document.getElementById('qvBackdrop');
  if (backdrop) backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
}

function closeQVModal() {
  const backdrop = document.getElementById('qvBackdrop');
  if (backdrop) backdrop.classList.remove('open');
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
}

function closeQV(e) {
  if (!e || e.target === document.getElementById('qvBackdrop') || e.currentTarget.classList.contains('qv-close')) {
    closeQVModal();
  }
}

function changeQty(delta) {
  qvQty = Math.max(1, Math.min(99, qvQty + delta));
  const qtyEl = document.getElementById('qvQtyNum');
  if (qtyEl) qtyEl.textContent = qvQty;
}

function addToCartFromQV() {
  if (!qvCurrentProduct) return;
  const brandVal = document.getElementById('qvBrand') ? document.getElementById('qvBrand').textContent : '';
  const imgVal = document.getElementById('qvThumb') && document.getElementById('qvThumb').querySelector('img') ? document.getElementById('qvThumb').querySelector('img').src : '';
  addToCart(qvCurrentProduct.name, brandVal, qvCurrentProduct.price, imgVal, qvQty);
  closeQVModal();
}

function addWishlistQV() {
  if (!qvCurrentProduct) return;
  const { name, brand, emoji, price } = qvCurrentProduct;
  toggleWishlist(name, brand, price, emoji, null);
  updateQVWishlistState(name);
}


function setupMobileQuickViewButtons() {
  
  document.querySelectorAll('.prod-overlay .prod-action-btn[onclick*="openQuickView"]').forEach(btn => {
    btn.style.display = 'none';
  });

  
  const cards = document.querySelectorAll('.prod-card');
  cards.forEach(card => {
    const cartBtn = card.querySelector('.prod-price-row .prod-cart-btn');
    
    if (cartBtn && !card.querySelector('.prod-eye-btn-mobile')) {
      const mobileEyeBtn = document.createElement('button');
      mobileEyeBtn.className = 'prod-eye-btn-mobile';
      mobileEyeBtn.setAttribute('aria-label', 'Quick View');
      
      const name = card.querySelector('.prod-name') ? card.querySelector('.prod-name').textContent.trim() : '';
      const brand = card.querySelector('.prod-brand') ? card.querySelector('.prod-brand').textContent.trim() : '';
      const img = card.querySelector('.prod-img') ? card.querySelector('.prod-img').getAttribute('src') : '';
      const priceText = card.querySelector('.prod-price') ? card.querySelector('.prod-price').textContent.replace(/[^\d]/g, '') : '0';
      const price = parseInt(priceText, 10);
      const oldPriceText = card.querySelector('.prod-price-old') ? card.querySelector('.prod-price-old').textContent.replace(/[^\d]/g, '') : '';
      const oldPrice = oldPriceText ? parseInt(oldPriceText, 10) : null;
      
      const stars = card.querySelectorAll('.prod-stars .fa-star, .prod-stars .fa-star-half-stroke');
      let rating = 0;
      stars.forEach(star => {
        if (star.classList.contains('fa-star')) rating += 1;
        else if (star.classList.contains('fa-star-half-stroke')) rating += 0.5;
      });
      const reviewText = card.querySelector('.prod-stars span, .reviews') ? card.querySelector('.prod-stars span, .reviews').textContent.replace(/[^\d]/g, '') : '0';
      const reviewCount = parseInt(reviewText, 10);
      
      const badge = card.querySelector('.prod-badge');
      let badgeClass = '';
      let badgeText = '';
      if (badge) {
        badgeText = badge.textContent.trim();
        badgeClass = badge.classList.contains('sale') ? 'sale' : (badge.classList.contains('new') ? 'new' : 'rx');
      }
      
      const desc = `Premium quality ${name} from ${brand}. Trusted by thousands for effective results.`;
      
      mobileEyeBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        openQuickView(name, brand, img, desc, price, oldPrice, rating || 4.5, reviewCount || 100, badgeClass, badgeText);
      };
      
      mobileEyeBtn.innerHTML = '<i class="fa-regular fa-eye"></i>';
      
      
      mobileEyeBtn.style.cssText = `
        display: inline-flex !important;
        width: 36px !important;
        height: 36px !important;
        border-radius: 50% !important;
        background-color: #e8f9f4 !important;
        border: none !important;
        align-items: center !important;
        justify-content: center !important;
        color: #0a7c5e !important;
        font-size: 0.95rem !important;
        cursor: pointer !important;
        margin-left: auto !important;
        margin-right: 0.5rem !important;
        flex-shrink: 0 !important;
        box-shadow: 0 4px 10px rgba(10,124,94,0.08) !important;
        transition: background-color 0.25s, color 0.25s, transform 0.2s !important;
        -webkit-tap-highlight-color: transparent !important;
      `;
      
      
      const activeStyle = () => {
        mobileEyeBtn.style.backgroundColor = '#0a7c5e';
        mobileEyeBtn.style.color = '#ffffff';
        mobileEyeBtn.style.transform = 'scale(0.9)';
      };
      
      const inactiveStyle = () => {
        mobileEyeBtn.style.backgroundColor = '#e8f9f4';
        mobileEyeBtn.style.color = '#0a7c5e';
        mobileEyeBtn.style.transform = 'scale(1)';
      };

      mobileEyeBtn.addEventListener('touchstart', activeStyle, { passive: true });
      mobileEyeBtn.addEventListener('touchend', inactiveStyle, { passive: true });
      mobileEyeBtn.addEventListener('mouseenter', activeStyle);
      mobileEyeBtn.addEventListener('mouseleave', inactiveStyle);
      
      cartBtn.parentNode.insertBefore(mobileEyeBtn, cartBtn);
    }
  });
}

// Register listeners
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupMobileQuickViewButtons);
} else {
  setupMobileQuickViewButtons();
}
window.addEventListener('resize', setupMobileQuickViewButtons);
