(function () {
  'use strict';

  const esc = BloomcordCommon.escapeHtml;
  const HEART =
    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';

  const grid = document.getElementById('themes-grid');
  const searchInput = document.getElementById('themes-search');
  const countEl = document.getElementById('themes-count');
  const tabsEl = document.getElementById('themes-tabs');
  const overlay = document.getElementById('theme-modal-overlay');

  let themes = [];
  let activeTab = 'all';
  let searchQuery = '';
  let selected = null;
  let copyState = false;

  function decodeContent(theme) {
    if (!theme?.content) return '';
    try {
      return atob(theme.content);
    } catch {
      return '';
    }
  }

  function formatDate(value) {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return '—';
    }
  }

  function getVersion(source) {
    const match = source.match(/@version\s+([^\s*/]+)/);
    return match ? match[1] : '—';
  }

  function getCssUrl(source, theme) {
    const match = source.match(/@import\s+url\(['"]?([^'"\)]+)['"]?\)/i);
    return match ? match[1] : theme.source || '';
  }

  function authorName(theme) {
    return theme.author?.discord_name || theme.author?.github_name || 'Unknown';
  }

  function filteredThemes() {
    const q = searchQuery.trim().toLowerCase();
    return themes
      .filter((theme) => {
        if (activeTab !== 'all' && theme.type !== activeTab) return false;
        if (!q) return true;
        const haystack = [
          theme.name,
          theme.description,
          theme.author?.discord_name,
          theme.author?.github_name,
          ...(theme.tags || []),
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      })
      .sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
  }

  function renderTabs() {
    tabsEl.innerHTML = [
      { id: 'all', label: 'All' },
      { id: 'theme', label: 'Themes' },
      { id: 'snippet', label: 'Snippets' },
    ]
      .map(
        (tab) =>
          `<button type="button" class="themes-tab${activeTab === tab.id ? ' themes-tab-active' : ''}" role="tab" data-tab="${tab.id}">${tab.label}</button>`
      )
      .join('');

    tabsEl.querySelectorAll('[data-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeTab = btn.dataset.tab;
        renderTabs();
        renderGrid();
      });
    });
  }

  function renderGrid() {
    const list = filteredThemes();
    countEl.textContent = `${list.length} result${list.length === 1 ? '' : 's'}`;

    if (!list.length) {
      grid.innerHTML = '<p class="themes-empty">No themes found.</p>';
      return;
    }

    grid.innerHTML = list
      .map((theme) => {
        const typeClass = theme.type === 'snippet' ? 'theme-card-type-snippet' : 'theme-card-type-theme';
        const typeLabel = theme.type === 'snippet' ? 'Snippet' : 'Theme';
        const tags = (theme.tags || []).slice(0, 3);
        const thumb = theme.thumbnail_url
          ? `<img src="${esc(theme.thumbnail_url)}" alt="${esc(theme.name)}" loading="lazy" decoding="async">`
          : '<div class="theme-card-thumb-placeholder"></div>';

        return `<div class="theme-card glass" role="button" tabindex="0" data-theme-id="${theme.id}">
          <div class="theme-card-thumb">${thumb}<span class="theme-card-type ${typeClass}">${typeLabel}</span></div>
          <div class="theme-card-body">
            <div class="theme-card-tags">${tags.map((tag) => `<span class="theme-card-tag">${esc(tag)}</span>`).join('')}</div>
            <strong class="theme-card-name">${esc(theme.name)}</strong>
            <p class="theme-card-desc">${esc(theme.description || '')}</p>
          </div>
          <div class="theme-card-footer">
            <span class="theme-card-stat">${HEART} ${theme.likes ?? 0}</span>
            <span class="theme-card-author">by ${esc(authorName(theme))}</span>
          </div>
        </div>`;
      })
      .join('');

    grid.querySelectorAll('[data-theme-id]').forEach((card) => {
      const open = () => {
        const theme = themes.find((t) => String(t.id) === card.dataset.themeId);
        if (theme) openModal(theme);
      };
      card.addEventListener('click', open);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      });
    });
  }

  function renderModal(theme) {
    const source = decodeContent(theme);
    const cssUrl = getCssUrl(source, theme);
    const typeClass = theme.type === 'snippet' ? 'theme-card-type-snippet' : 'theme-card-type-theme';
    const typeLabel = theme.type === 'snippet' ? 'Snippet' : 'Theme';
    const preview = theme.thumbnail_url
      ? `<img class="theme-modal-preview-img" src="${esc(theme.thumbnail_url)}" alt="${esc(theme.name)}" loading="lazy">`
      : '<div class="theme-modal-preview-placeholder"></div>';

    overlay.innerHTML = `<div class="theme-modal glass" role="dialog" aria-modal="true" aria-labelledby="theme-modal-title">
      <button class="theme-modal-close" type="button" aria-label="Close">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
      <div class="theme-modal-layout">
        <div class="theme-modal-left">
          <div class="theme-modal-left-header">
            <span class="theme-card-type ${typeClass}">${typeLabel}</span>
            <h2 class="theme-modal-name" id="theme-modal-title">${esc(theme.name)}</h2>
            <p class="theme-modal-desc">${esc(theme.description || '')}</p>
            <div class="theme-modal-tags">${(theme.tags || []).map((tag) => `<span class="theme-card-tag">${esc(tag)}</span>`).join('')}</div>
          </div>
          <div class="theme-modal-preview-wrap">${preview}</div>
          ${
            source
              ? `<div class="theme-modal-code-section">
                  <div class="theme-modal-code-header">
                    <span>Source Code</span>
                    <button type="button" class="theme-modal-copy-code-btn" id="theme-copy-code">${copyState ? 'Copied!' : 'Copy'}</button>
                  </div>
                  <pre class="theme-modal-code"><code>${esc(source)}</code></pre>
                </div>`
              : ''
          }
        </div>
        <aside class="theme-modal-sidebar">
          <div class="theme-modal-stats-section">
            <p class="theme-modal-section-title">Stats</p>
            <div class="theme-modal-stats-grid">
              <div class="theme-modal-stat-cell"><strong>${theme.downloads != null ? new Intl.NumberFormat('en-US').format(theme.downloads) : '—'}</strong><span>Downloads</span></div>
              <div class="theme-modal-stat-cell"><strong>${theme.likes ?? '—'}</strong><span>Likes</span></div>
              <div class="theme-modal-stat-cell"><strong>${formatDate(theme.release_date)}</strong><span>Released</span></div>
              <div class="theme-modal-stat-cell"><strong>${source ? getVersion(source) : '—'}</strong><span>Version</span></div>
            </div>
          </div>
          ${
            cssUrl
              ? `<div class="theme-modal-cssurl-section">
                  <p class="theme-modal-section-title">CSS URL</p>
                  <div class="theme-modal-cssurl-row">
                    <code class="theme-modal-cssurl-code">${esc(cssUrl)}</code>
                    <button type="button" class="theme-modal-copy-url-btn" id="theme-copy-url" aria-label="Copy CSS URL">⧉</button>
                  </div>
                </div>`
              : ''
          }
          <div class="theme-modal-contrib-actions">
            ${theme.source ? `<a class="theme-modal-github-btn" href="${esc(theme.source)}" target="_blank" rel="noopener noreferrer">GitHub</a>` : ''}
            ${source ? `<button type="button" class="theme-modal-download-btn" id="theme-download">Download .css</button>` : ''}
          </div>
          <div class="theme-modal-contrib-card">
            <div class="theme-modal-contrib-info">
              <span class="theme-modal-section-title">Author</span>
              <strong class="theme-modal-contrib-name">${esc(authorName(theme))}</strong>
              ${theme.author?.discord_snowflake ? `<span class="theme-modal-contrib-id">ID: ${esc(theme.author.discord_snowflake)}</span>` : ''}
            </div>
            <div class="theme-modal-contrib-actions">
              ${theme.author?.discord_snowflake ? `<a class="theme-modal-contrib-btn" href="https://discord.com/users/${esc(theme.author.discord_snowflake)}" target="_blank" rel="noopener noreferrer">Discord</a>` : ''}
              ${theme.author?.github_name ? `<a class="theme-modal-contrib-btn" href="https://github.com/${esc(theme.author.github_name)}" target="_blank" rel="noopener noreferrer">GitHub</a>` : ''}
            </div>
          </div>
        </aside>
      </div>
    </div>`;

    overlay.querySelector('.theme-modal-close')?.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    overlay.querySelector('#theme-copy-code')?.addEventListener('click', async () => {
      await navigator.clipboard.writeText(source).catch(() => {});
      copyState = true;
      renderModal(theme);
    });

    overlay.querySelector('#theme-copy-url')?.addEventListener('click', async (e) => {
      await navigator.clipboard.writeText(cssUrl).catch(() => {});
      e.currentTarget.classList.add('copied');
    });

    overlay.querySelector('#theme-download')?.addEventListener('click', () => {
      const blob = new Blob([source], { type: 'text/css' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${(theme.name || 'theme').replace(/[^a-z0-9_-]/gi, '_')}.theme.css`;
      link.click();
      URL.revokeObjectURL(url);
    });
  }

  function openModal(theme) {
    selected = theme;
    copyState = false;
    renderModal(theme);
    overlay.hidden = false;
    document.body.classList.add('modal-open');
  }

  function closeModal() {
    overlay.hidden = true;
    selected = null;
    copyState = false;
    document.body.classList.remove('modal-open');
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay && !overlay.hidden) closeModal();
  });

  searchInput?.addEventListener('input', () => {
    searchQuery = searchInput.value;
    renderGrid();
  });

  fetch('themes-data.json')
    .then((res) => res.json())
    .then((data) => {
      themes = Array.isArray(data) ? data : [];
      renderTabs();
      renderGrid();
      document.querySelector('.page-themes')?.classList.add('revealed');
    })
    .catch(() => {
      countEl.textContent = 'Failed to load themes.';
      grid.innerHTML = '<p class="themes-empty">Could not load themes-data.json.</p>';
    });
})();
