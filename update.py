import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

new_products = '''    <div class= row g-4 id=top-picks-grid>
      <!-- Product 1 -->
      <div class=col-6 col-md-4 col-lg-3 top-pick-item data-category=vitamins data-aos=fade-up data-aos-delay=0>
        <div class=prod-card>
          <div class=prod-thumb>
            <img src=assets/img_vitamin.png class=prod-img alt=Vitamin D3 + K2 Capsules>
            <div class=prod-overlay>
              <button class=prod-action-btn title=Quick View onclick=location.href=store.html aria-label=Quick View><i class=fa-regular fa-eye></i></button>
              <button class=prod-action-btn title=Wishlist onclick=location.href=store.html aria-label=Wishlist><i class=fa-regular fa-heart></i></button>
              <button class=prod-action-btn title=Compare onclick=location.href=store.html aria-label=Compare><i class=fa-solid fa-right-left></i></button>
            </div>
            <span class=prod-badge sale>-20%</span>
          </div>
          <div class=prod-body>
            <div class=prod-brand>Sun Pharma</div>
            <div class=prod-name>Vitamin D3 + K2 Capsules</div>
            <div class=prod-stars>
              <i class=fa-solid fa-star></i><i class=fa-solid fa-star></i><i class=fa-solid fa-star></i><i class=fa-solid fa-star></i><i class=fa-solid fa-star-half-stroke></i>
              <span>(142)</span>
            </div>
            <div class=prod-price-row>
              <span class=prod-price>?349 <del>?430</del></span>
              <button class=prod-cart-btn onclick=location.href=store.html aria-label=Add to cart><i class=fa-solid fa-cart-plus></i></button>
            </div>
          </div>
        </div>
      </div>

      <!-- Product 2 -->
      <div class=col-6 col-md-4 col-lg-3 top-pick-item data-category=ayurveda data-aos=fade-up data-aos-delay=80>
        <div class=prod-card>
          <div class=prod-thumb>
            <img src=assets/img_ashwagandha.png class=prod-img alt=Ashwagandha Stress Relief>
            <div class=prod-overlay>
              <button class=prod-action-btn onclick=location.href=store.html aria-label=Quick View><i class=fa-regular fa-eye></i></button>
              <button class=prod-action-btn onclick=location.href=store.html aria-label=Wishlist><i class=fa-regular fa-heart></i></button>
              <button class=prod-action-btn onclick=location.href=store.html aria-label=Compare><i class=fa-solid fa-right-left></i></button>
            </div>
            <span class=prod-badge new>New</span>
          </div>
          <div class=prod-body>
            <div class=prod-brand>Himalaya</div>
            <div class=prod-name>Ashwagandha Stress Relief</div>
            <div class=prod-stars>
              <i class=fa-solid fa-star></i><i class=fa-solid fa-star></i><i class=fa-solid fa-star></i><i class=fa-solid fa-star></i><i class=fa-regular fa-star></i>
              <span>(98)</span>
            </div>
            <div class=prod-price-row>
              <span class=prod-price>?279</span>
              <button class=prod-cart-btn onclick=location.href=store.html aria-label=Add to cart><i class=fa-solid fa-cart-plus></i></button>
            </div>
          </div>
        </div>
      </div>

      <!-- Product 3 -->
      <div class=col-6 col-md-4 col-lg-3 top-pick-item data-category=skincare data-aos=fade-up data-aos-delay=160>
        <div class=prod-card>
          <div class=prod-thumb>
            <img src=assets/img_skincare.png class=prod-img alt=Moisturising Cream SPF 50>
            <div class=prod-overlay>
              <button class=prod-action-btn onclick=location.href=store.html aria-label=Quick View><i class=fa-regular fa-eye></i></button>
              <button class=prod-action-btn onclick=location.href=store.html aria-label=Wishlist><i class=fa-regular fa-heart></i></button>
              <button class=prod-action-btn onclick=location.href=store.html aria-label=Compare><i class=fa-solid fa-right-left></i></button>
            </div>
            <span class=prod-badge sale>-15%</span>
          </div>
          <div class=prod-body>
            <div class=prod-brand>CeraVe</div>
            <div class=prod-name>Moisturising Cream SPF 50</div>
            <div class=prod-stars>
              <i class=fa-solid fa-star></i><i class=fa-solid fa-star></i><i class=fa-solid fa-star></i><i class=fa-solid fa-star></i><i class=fa-solid fa-star></i>
              <span>(215)</span>
            </div>
            <div class=prod-price-row>
              <span class=prod-price>?520 <del>?610</del></span>
              <button class=prod-cart-btn onclick=location.href=store.html aria-label=Add to cart><i class=fa-solid fa-cart-plus></i></button>
            </div>
          </div>
        </div>
      </div>

      <!-- Product 4 -->
      <div class=col-6 col-md-4 col-lg-3 top-pick-item data-category=medicines data-aos=fade-up data-aos-delay=240>
        <div class=prod-card>
          <div class=prod-thumb>
            <img src=assets/img_paracetamol.png class=prod-img alt=Paracetamol 500mg Tablets>
            <div class=prod-overlay>
              <button class=prod-action-btn onclick=location.href=store.html aria-label=Quick View><i class=fa-regular fa-eye></i></button>
              <button class=prod-action-btn onclick=location.href=store.html aria-label=Wishlist><i class=fa-regular fa-heart></i></button>
              <button class=prod-action-btn onclick=location.href=store.html aria-label=Compare><i class=fa-solid fa-right-left></i></button>
            </div>
          </div>
          <div class=prod-body>
            <div class=prod-brand>GSK</div>
            <div class=prod-name>Paracetamol 500mg Tablets</div>
            <div class=prod-stars>
              <i class=fa-solid fa-star></i><i class=fa-solid fa-star></i><i class=fa-solid fa-star></i><i class=fa-solid fa-star></i><i class=fa-solid fa-star-half-stroke></i>
              <span>(308)</span>
            </div>
            <div class=prod-price-row>
              <span class=prod-price>?45</span>
              <button class=prod-cart-btn onclick=location.href=store.html aria-label=Add to cart><i class=fa-solid fa-cart-plus></i></button>
            </div>
          </div>
        </div>
      </div>

      <!-- Product 5 -->
      <div class=col-6 col-md-4 col-lg-3 top-pick-item data-category=vitamins data-aos=fade-up data-aos-delay=0>
        <div class=prod-card>
          <div class=prod-thumb>
            <img src=assets/img_omega3.png class=prod-img alt=Omega-3 Fish Oil 1000mg>
            <div class=prod-overlay>
              <button class=prod-action-btn onclick=location.href=store.html aria-label=Quick View><i class=fa-regular fa-eye></i></button>
              <button class=prod-action-btn onclick=location.href=store.html aria-label=Wishlist><i class=fa-regular fa-heart></i></button>
              <button class=prod-action-btn onclick=location.href=store.html aria-label=Compare><i class=fa-solid fa-right-left></i></button>
            </div>
            <span class=prod-badge>RX</span>
          </div>
          <div class=prod-body>
            <div class=prod-brand>Cipla</div>
            <div class=prod-name>Omega-3 Fish Oil 1000mg</div>
            <div class=prod-stars>
              <i class=fa-solid fa-star></i><i class=fa-solid fa-star></i><i class=fa-solid fa-star></i><i class=fa-solid fa-star></i><i class=fa-regular fa-star></i>
              <span>(187)</span>
            </div>
            <div class=prod-price-row>
              <span class=prod-price>?449</span>
              <button class=prod-cart-btn onclick=location.href=store.html aria-label=Add to cart><i class=fa-solid fa-cart-plus></i></button>
            </div>
          </div>
        </div>
      </div>

      <!-- Product 6 -->
      <div class=col-6 col-md-4 col-lg-3 top-pick-item data-category=skincare data-aos=fade-up data-aos-delay=80>
        <div class=prod-card>
          <div class=prod-thumb>
            <img src=assets/img_serum.png class=prod-img alt=Hydrating Face Serum>
            <div class=prod-overlay>
              <button class=prod-action-btn onclick=location.href=store.html aria-label=Quick View><i class=fa-regular fa-eye></i></button>
              <button class=prod-action-btn onclick=location.href=store.html aria-label=Wishlist><i class=fa-regular fa-heart></i></button>
              <button class=prod-action-btn onclick=location.href=store.html aria-label=Compare><i class=fa-solid fa-right-left></i></button>
            </div>
            <span class=prod-badge new>New</span>
          </div>
          <div class=prod-body>
            <div class=prod-brand>Olay</div>
            <div class=prod-name>Hydrating Face Serum</div>
            <div class=prod-stars>
              <i class=fa-solid fa-star></i><i class=fa-solid fa-star></i><i class=fa-solid fa-star></i><i class=fa-solid fa-star></i><i class=fa-solid fa-star></i>
              <span>(421)</span>
            </div>
            <div class=prod-price-row>
              <span class=prod-price>?650</span>
              <button class=prod-cart-btn onclick=location.href=store.html aria-label=Add to cart><i class=fa-solid fa-cart-plus></i></button>
            </div>
          </div>
        </div>
      </div>

      <!-- Product 7 -->
      <div class=col-6 col-md-4 col-lg-3 top-pick-item data-category=ayurveda data-aos=fade-up data-aos-delay=160>
        <div class=prod-card>
          <div class=prod-thumb>
            <img src=assets/img_brahmi.png class=prod-img alt=Brahmi Brain Wellness>
            <div class=prod-overlay>
              <button class=prod-action-btn onclick=location.href=store.html aria-label=Quick View><i class=fa-regular fa-eye></i></button>
              <button class=prod-action-btn onclick=location.href=store.html aria-label=Wishlist><i class=fa-regular fa-heart></i></button>
              <button class=prod-action-btn onclick=location.href=store.html aria-label=Compare><i class=fa-solid fa-right-left></i></button>
            </div>
            <span class=prod-badge sale>-25%</span>
          </div>
          <div class=prod-body>
            <div class=prod-brand>Patanjali</div>
            <div class=prod-name>Brahmi Brain Wellness</div>
            <div class=prod-stars>
              <i class=fa-solid fa-star></i><i class=fa-solid fa-star></i><i class=fa-solid fa-star></i><i class=fa-solid fa-star></i><i class=fa-solid fa-star-half-stroke></i>
              <span>(93)</span>
            </div>
            <div class=prod-price-row>
              <span class=prod-price>?199 <del>?250</del></span>
              <button class=prod-cart-btn onclick=location.href=store.html aria-label=Add to cart><i class=fa-solid fa-cart-plus></i></button>
            </div>
          </div>
        </div>
      </div>

      <!-- Product 8 -->
      <div class=col-6 col-md-4 col-lg-3 top-pick-item data-category=medicines data-aos=fade-up data-aos-delay=240>
        <div class=prod-card>
          <div class=prod-thumb>
            <img src=assets/img_paracetamol.png class=prod-img alt=Allergy Relief Cetirizine>
            <div class=prod-overlay>
              <button class=prod-action-btn onclick=location.href=store.html aria-label=Quick View><i class=fa-regular fa-eye></i></button>
              <button class=prod-action-btn onclick=location.href=store.html aria-label=Wishlist><i class=fa-regular fa-heart></i></button>
              <button class=prod-action-btn onclick=location.href=store.html aria-label=Compare><i class=fa-solid fa-right-left></i></button>
            </div>
          </div>
          <div class=prod-body>
            <div class=prod-brand>Cipla</div>
            <div class=prod-name>Allergy Relief Cetirizine</div>
            <div class=prod-stars>
              <i class=fa-solid fa-star></i><i class=fa-solid fa-star></i><i class=fa-solid fa-star></i><i class=fa-solid fa-star></i><i class=fa-regular fa-star></i>
              <span>(76)</span>
            </div>
            <div class=prod-price-row>
              <span class=prod-price>?85</span>
              <button class=prod-cart-btn onclick=location.href=store.html aria-label=Add to cart><i class=fa-solid fa-cart-plus></i></button>
            </div>
          </div>
        </div>
      </div>
    </div>'''

html = re.sub(r'<div class=row g-4>.*?</div>\s*</div>\s*<div class=text-center mt-5', new_products + '\n\n    <div class=text-center mt-5', html, flags=re.DOTALL)

js_old = '''  /* -- Product filter tabs -- */
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });'''

js_new = '''  /* -- Product filter tabs -- */
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filterValue = btn.getAttribute('data-filter');
      document.querySelectorAll('.top-pick-item').forEach(item => {
        if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });'''

html = html.replace(js_old, js_new)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
