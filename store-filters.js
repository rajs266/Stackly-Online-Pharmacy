/* =============================================================================
   STORE-FILTERS.JS — Stackly Pharmacy
   Real-time filtering: Category, Price, Brand, Star Rating, Search, Sort
   ============================================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const products     = document.querySelectorAll('.prod-col');
  const noResults    = document.getElementById('noResults');
  const prodCount    = document.getElementById('prodCount');
  const priceSlider  = document.getElementById('priceSlider');
  const priceMax     = document.getElementById('priceMax');
  const storeSearch  = document.getElementById('storeSearch');
  const sortSelect   = document.getElementById('sortSelect');
  const gridViewBtn  = document.getElementById('gridViewBtn');
  const listViewBtn  = document.getElementById('listViewBtn');
  const productsGrid = document.getElementById('productsGrid');

  // ── State ──
  let activeCat   = 'all';
  let maxPrice    = 5000;
  let searchQuery = '';
  let brands      = [];
  let minRating   = 0;

  // ── Category Tab Filter ──
  document.querySelectorAll('#catFilterWrap .filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#catFilterWrap .filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeCat = tab.dataset.cat;
      filterProducts();
    });
  });

  // ── Price Range Slider ──
  if (priceSlider) {
    priceSlider.addEventListener('input', () => {
      maxPrice = parseInt(priceSlider.value, 10);
      const pct = (maxPrice / 5000) * 100;
      priceSlider.style.setProperty('--val', pct + '%');
      if (priceMax) priceMax.textContent = '₹' + maxPrice.toLocaleString('en-IN');
      filterProducts();
    });
  }

  // ── Brand Checkboxes ──
  document.querySelectorAll('.brand-cb').forEach(cb => {
    cb.addEventListener('change', () => {
      brands = Array.from(document.querySelectorAll('.brand-cb:checked')).map(c => c.value.toLowerCase());
      filterProducts();
    });
  });

  // ── Rating Filter ──
  document.querySelectorAll('.rating-filter-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.rating-filter-item').forEach(r => r.classList.remove('active'));
      if (minRating === parseInt(item.dataset.rating)) {
        minRating = 0; // toggle off
      } else {
        item.classList.add('active');
        minRating = parseInt(item.dataset.rating);
      }
      filterProducts();
    });
  });

  // ── Search Input ──
  if (storeSearch) {
    storeSearch.addEventListener('input', () => {
      searchQuery = storeSearch.value.trim().toLowerCase();
      filterProducts();
    });
  }

  // ── Sort ──
  if (sortSelect) {
    sortSelect.addEventListener('change', () => sortProducts(sortSelect.value));
  }

  // ── View Toggle (Grid / List) ──
  if (gridViewBtn && listViewBtn && productsGrid) {
    gridViewBtn.addEventListener('click', () => {
      gridViewBtn.classList.add('active');
      listViewBtn.classList.remove('active');
      document.querySelectorAll('.prod-col').forEach(c => {
        c.className = c.className.replace(/col-12\s*/g, '');
        if (!c.classList.contains('col-6')) c.classList.add('col-6');
      });
    });
    listViewBtn.addEventListener('click', () => {
      listViewBtn.classList.add('active');
      gridViewBtn.classList.remove('active');
      document.querySelectorAll('.prod-col').forEach(c => {
        c.classList.remove('col-6', 'col-md-4', 'col-xl-3');
        c.classList.add('col-12');
      });
    });
  }

  // ── Core Filter Function ──
  function filterProducts() {
    let count = 0;
    products.forEach(prod => {
      const cat    = prod.dataset.cat   || '';
      const price  = parseInt(prod.dataset.price  || 0, 10);
      const rating = parseFloat(prod.dataset.rating || 0);
      const brand  = (prod.dataset.brand || '').toLowerCase();
      const name   = (prod.dataset.name  || '').toLowerCase();

      const matchCat    = activeCat === 'all' || cat === activeCat;
      const matchPrice  = price <= maxPrice;
      const matchBrand  = brands.length === 0 || brands.includes(brand);
      const matchRating = rating >= minRating;
      const matchSearch = searchQuery === '' || name.includes(searchQuery) || brand.includes(searchQuery);

      const show = matchCat && matchPrice && matchBrand && matchRating && matchSearch;

      if (show) {
        prod.style.display = '';
        count++;
        // Animate in
        prod.style.opacity = '0';
        prod.style.transform = 'translateY(12px)';
        requestAnimationFrame(() => {
          prod.style.transition = 'opacity 0.3s, transform 0.3s';
          prod.style.opacity = '1';
          prod.style.transform = 'translateY(0)';
        });
      } else {
        prod.style.display = 'none';
      }
    });

    if (prodCount) prodCount.textContent = count;
    if (noResults) {
      noResults.classList.toggle('show', count === 0);
      noResults.style.display = count === 0 ? 'block' : 'none';
    }
  }

  // ── Sort Function ──
  function sortProducts(mode) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    const cols = Array.from(grid.querySelectorAll('.prod-col'));
    cols.sort((a, b) => {
      if (mode === 'price-asc')  return parseInt(a.dataset.price) - parseInt(b.dataset.price);
      if (mode === 'price-desc') return parseInt(b.dataset.price) - parseInt(a.dataset.price);
      if (mode === 'rating')     return parseFloat(b.dataset.rating) - parseFloat(a.dataset.rating);
      if (mode === 'name')       return (a.dataset.name || '').localeCompare(b.dataset.name || '');
      return 0;
    });
    cols.forEach(col => grid.appendChild(col));
  }

  // ── Global Reset Function ──
  window.resetFilters = () => {
    activeCat = 'all';
    maxPrice = 5000;
    searchQuery = '';
    brands = [];
    minRating = 0;

    document.querySelectorAll('#catFilterWrap .filter-tab').forEach(t => t.classList.remove('active'));
    const allTab = document.querySelector('#catFilterWrap .filter-tab[data-cat="all"]');
    if (allTab) allTab.classList.add('active');

    if (priceSlider) { priceSlider.value = 5000; priceSlider.style.setProperty('--val', '100%'); }
    if (priceMax) priceMax.textContent = '₹5,000';
    if (storeSearch) storeSearch.value = '';

    document.querySelectorAll('.brand-cb').forEach(cb => cb.checked = false);
    document.querySelectorAll('.rating-filter-item').forEach(r => r.classList.remove('active'));

    filterProducts();
    showToast('All filters cleared', 'fa-rotate-left');
  };

  // ── Read URL params (e.g. store.html?cat=vitamins) ──
  const params = new URLSearchParams(window.location.search);
  const urlCat = params.get('cat');
  if (urlCat) {
    activeCat = urlCat;
    const tab = document.querySelector(`#catFilterWrap .filter-tab[data-cat="${urlCat}"]`);
    if (tab) {
      document.querySelectorAll('#catFilterWrap .filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    }
  }

  // Initial filter run
  filterProducts();
});
