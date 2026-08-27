(function () {
  const grid = document.getElementById('grid');
  const filtersEl = document.getElementById('filters');
  const emptyState = document.getElementById('empty-state');
  const template = document.getElementById('card-template');
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = '© ' + new Date().getFullYear();

  let apps = [];
  let activeTag = 'all';

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
  }

  function allTags(list) {
    const set = new Set();
    list.forEach((a) => (a.tags || []).forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }

  function renderFilters(list) {
    const tags = allTags(list);
    if (tags.length === 0) { filtersEl.hidden = true; return; }
    filtersEl.innerHTML = '';
    const makeBtn = (label, value) => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn' + (value === activeTag ? ' active' : '');
      btn.type = 'button';
      btn.textContent = label;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', value === activeTag ? 'true' : 'false');
      btn.addEventListener('click', () => {
        activeTag = value;
        renderFilters(list);
        renderGrid(list);
      });
      return btn;
    };
    filtersEl.appendChild(makeBtn('All', 'all'));
    tags.forEach((t) => filtersEl.appendChild(makeBtn(t, t)));
  }

  function renderGrid(list) {
    const filtered = activeTag === 'all'
      ? list
      : list.filter((a) => (a.tags || []).includes(activeTag));

    grid.innerHTML = '';

    if (filtered.length === 0) {
      emptyState.hidden = false;
      return;
    }
    emptyState.hidden = true;

    filtered.forEach((app) => {
      const node = template.content.cloneNode(true);
      const card = node.querySelector('.card');
      const title = node.querySelector('.cardtitle');
      const wintitle = node.querySelector('.wintitle');
      const desc = node.querySelector('.carddesc');
      const link = node.querySelector('.cardlink');
      const img = node.querySelector('img');
      const thumb = node.querySelector('.thumb');
      const tagsWrap = node.querySelector('.cardtags');

      title.textContent = app.name || 'Untitled app';
      wintitle.textContent = (app.url || '').replace(/^https?:\/\//, '').replace(/\/$/, '') || 'app';
      desc.textContent = app.description || '';
      link.href = app.url || '#';
      if (!app.url) link.setAttribute('aria-disabled', 'true');

      const priceTag = node.querySelector('.price-tag');
      const buyBtn = node.querySelector('.buy-btn');
      if (app.forSale && app.price > 0) {
        priceTag.textContent = '৳' + app.price;
        buyBtn.textContent = 'Buy now';
        buyBtn.href = 'checkout.html?name=' + encodeURIComponent(app.name || '') + '&price=' + encodeURIComponent(app.price);
      } else {
        priceTag.remove();
        buyBtn.remove();
      }

      if (app.screenshot) {
        img.src = app.screenshot;
        img.alt = (app.name || 'App') + ' screenshot';
      } else {
        thumb.removeChild(img);
        thumb.classList.add('no-image');
      }

      (app.tags || []).forEach((t) => {
        const span = document.createElement('span');
        span.className = 'tag';
        span.textContent = t;
        tagsWrap.appendChild(span);
      });

      grid.appendChild(card);
      void card; // clarity: card appended above
    });
  }

  fetch('data/apps.json', { cache: 'no-store' })
    .then((res) => {
      if (!res.ok) throw new Error('Could not load apps.json');
      return res.json();
    })
    .then((data) => {
      apps = Array.isArray(data.apps) ? data.apps : [];
      // Respect an optional "order" field, otherwise keep file order.
      apps.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      renderFilters(apps);
      renderGrid(apps);
    })
    .catch(() => {
      emptyState.hidden = false;
      emptyState.textContent = 'Could not load the app list. Check data/apps.json.';
    });
})();
