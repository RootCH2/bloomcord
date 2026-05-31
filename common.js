(function () {
  'use strict';

  /** Change this URL to host the installer elsewhere (e.g. GitHub Releases). */
  const WINDOWS_DOWNLOAD_URL = 'downloads/bloomcord-Installer.exe';

  window.BloomcordCommon = {
    WINDOWS_DOWNLOAD_URL,
    escapeHtml(value) {
      return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    },

    initScrollReveal() {
      const revealEls = document.querySelectorAll('[data-reveal]');
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed');
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      );
      revealEls.forEach((el) => revealObserver.observe(el));
    },

    initMobileNav() {
      const hamburger = document.querySelector('.nav-hamburger');
      const drawer = document.querySelector('.mobile-nav-drawer');
      const mobileClose = document.querySelector('.mobile-nav-close');
      const mobileBackdrop = document.querySelector('.mobile-nav-backdrop');

      function closeMobileNav() {
        hamburger?.classList.remove('is-open');
        drawer?.classList.remove('is-open');
        drawer?.setAttribute('aria-hidden', 'true');
        hamburger?.setAttribute('aria-expanded', 'false');
      }

      function openMobileNav() {
        hamburger?.classList.add('is-open');
        drawer?.classList.add('is-open');
        drawer?.setAttribute('aria-hidden', 'false');
        hamburger?.setAttribute('aria-expanded', 'true');
      }

      hamburger?.addEventListener('click', () => {
        if (drawer?.classList.contains('is-open')) closeMobileNav();
        else openMobileNav();
      });
      mobileClose?.addEventListener('click', closeMobileNav);
      mobileBackdrop?.addEventListener('click', closeMobileNav);
    },

    initHeaderHide() {
      const header = document.querySelector('.site-header');
      let lastScroll = 0;
      window.addEventListener(
        'scroll',
        () => {
          const y = window.scrollY;
          if (!header) return;
          if (y > lastScroll && y > 120) header.classList.add('is-hidden');
          else header.classList.remove('is-hidden');
          lastScroll = y;
        },
        { passive: true }
      );
    },

    init() {
      this.initScrollReveal();
      this.initMobileNav();
      this.initHeaderHide();
    },
  };

  BloomcordCommon.init();
})();
