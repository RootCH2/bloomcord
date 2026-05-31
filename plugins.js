(function () {
  'use strict';

  const esc = BloomcordCommon.escapeHtml;
  const PLUGIN_ICON =
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2v6"></path><path d="M15 2v6"></path><path d="M12 17v5"></path><path d="M5 8h14"></path><path d="M6 11v1a6 6 0 0 0 12 0v-1"></path></svg>';
  const CARD_ARROW =
    '<svg class="plugin-card-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';

  const grid = document.getElementById('plugin-grid');
  const searchInput = document.getElementById('plugin-search');
  const countEl = document.getElementById('plugin-count');
  const filtersEl = document.getElementById('plugin-filters');
  const modalShell = document.getElementById('plugin-modal');
  const modalTitle = document.getElementById('plugin-modal-title');
  const modalCategory = document.getElementById('plugin-modal-category');
  const modalDesc = document.getElementById('plugin-modal-desc');

  let plugins = [];
  let activeCategory = 'All';
  let searchQuery = '';

  function slugify(name) {
    return name.replace(/[^a-zA-Z0-9_-]/g, '');
  }

  function getCategories(list) {
    return ['All', ...[...new Set(list.map((p) => p.category).filter(Boolean))].sort()];
  }

  function filteredPlugins() {
    const q = searchQuery.trim().toLowerCase();
    return plugins.filter((plugin) => {
      if (activeCategory !== 'All' && plugin.category !== activeCategory) return false;
      if (!q) return true;
      const haystack = [plugin.name, plugin.category, plugin.description].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }

  function renderFilters(categories) {
    filtersEl.innerHTML = categories
      .map(
        (cat) =>
          `<button type="button" class="plugin-cat-pill${cat === activeCategory ? ' is-active' : ''}" data-category="${esc(cat)}">${esc(cat)}</button>`
      )
      .join('');

    filtersEl.querySelectorAll('.plugin-cat-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeCategory = btn.dataset.category || 'All';
        renderFilters(categories);
        renderGrid();
      });
    });
  }

  function renderGrid() {
    const list = filteredPlugins();
    countEl.innerHTML = `Browsing <span>${list.length.toLocaleString()}</span> plugins`;

    if (!list.length) {
      grid.innerHTML = '<article class="plugin-card glass plugin-card-empty"><h3>No plugins found</h3><p>Try another search or category.</p></article>';
      return;
    }

    grid.innerHTML = list
      .map((plugin, i) => {
        const desc = plugin.description || 'No description available.';
        return `<button type="button" class="plugin-card glass plugin-card-clickable" style="--i:${i % 20};" data-plugin="${esc(slugify(plugin.name))}">
          <span class="plugin-video-dot" data-has-video="false" aria-hidden="true"></span>
          <div class="plugin-card-top">
            <div class="plugin-card-icon" aria-hidden="true">${PLUGIN_ICON}</div>
            <div style="display:flex;gap:6px;align-items:center;">
              <span class="plugin-card-badge">${esc(plugin.category || 'Utility')}</span>
            </div>
          </div>
          <h3>${esc(plugin.name)}</h3>
          <p>${esc(desc)}</p>
          ${CARD_ARROW}
        </button>`;
      })
      .join('');

    grid.querySelectorAll('[data-plugin]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const plugin = plugins.find((p) => slugify(p.name) === btn.dataset.plugin);
        if (plugin) openModal(plugin);
      });
    });
  }

  function openModal(plugin) {
    modalTitle.textContent = plugin.name;
    modalCategory.textContent = plugin.category || 'Utility';
    modalDesc.textContent = plugin.description || 'No description available.';
    modalShell.hidden = false;
    document.body.classList.add('modal-open');
  }

  function closeModal() {
    modalShell.hidden = true;
    document.body.classList.remove('modal-open');
  }

  modalShell?.querySelector('.modal-close')?.addEventListener('click', closeModal);
  modalShell?.querySelector('.modal-backdrop')?.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalShell && !modalShell.hidden) closeModal();
  });

  searchInput?.addEventListener('input', () => {
    searchQuery = searchInput.value;
    renderGrid();
  });

  fetch('plugins-data.json')
    .then((res) => res.json())
    .then((data) => {
      plugins = Array.isArray(data) ? data : [];
      const categories = getCategories(plugins);
      renderFilters(categories);
      renderGrid();
      document.querySelector('.page-plugins')?.classList.add('revealed');
    })
    .catch(() => {
      countEl.textContent = 'Failed to load plugins.';
      grid.innerHTML = '<article class="plugin-card glass plugin-card-empty"><h3>Could not load plugins</h3><p>Check that plugins-data.json is available.</p></article>';
    });
})();
