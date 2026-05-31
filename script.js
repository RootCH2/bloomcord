(function () {
  'use strict';

  requestAnimationFrame(() => {
    document.querySelectorAll('.moon-hero [data-reveal], .hero-eyebrow-marquee').forEach((el, i) => {
      setTimeout(() => el.classList.add('revealed'), 80 + i * 120);
    });
  });

  const counter = document.getElementById('download-counter');
  if (counter) {
    const target = 39904;
    const duration = 2200;
    let started = false;

    function animateCounter() {
      if (started) return;
      started = true;
      const start = performance.now();
      counter.classList.add('counting');

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = Math.floor(eased * target).toLocaleString();
        if (progress < 1) requestAnimationFrame(tick);
        else counter.textContent = target.toLocaleString();
      }

      requestAnimationFrame(tick);
    }

    animateCounter();
  }

  document.querySelectorAll('.plugin-switch').forEach((btn) => {
    btn.addEventListener('click', () => {
      const on = btn.classList.toggle('is-on');
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      const card = btn.closest('.feature-plugin-card');
      if (card) card.dataset.enabled = on ? 'true' : 'false';
    });
  });

  const modal = document.getElementById('contribute-modal');
  const contributeBtn = document.getElementById('contribute-btn');
  const modalClose = modal?.querySelector('.modal-close');
  const modalBackdrop = modal?.querySelector('.modal-backdrop');
  const modalStatus = modal?.querySelector('.contribute-modal-status');

  function openModal() {
    if (!modal) return;
    modal.hidden = false;
    document.body.classList.add('modal-open');
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove('modal-open');
  }

  contributeBtn?.addEventListener('click', openModal);
  modalClose?.addEventListener('click', closeModal);
  modalBackdrop?.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.hidden) closeModal();
  });

  modal?.querySelectorAll('.contribute-copy-card').forEach((card) => {
    const btn = card.querySelector('.contribute-copy-button');
    const code = card.querySelector('code');
    btn?.addEventListener('click', async () => {
      if (!code) return;
      try {
        await navigator.clipboard.writeText(code.textContent.trim());
        card.classList.add('is-copied');
        btn.textContent = 'Copied';
        if (modalStatus) modalStatus.textContent = `Copied ${code.textContent.trim().slice(0, 12)}…`;
        setTimeout(() => {
          card.classList.remove('is-copied');
          btn.textContent = 'Copy';
        }, 2000);
      } catch {
        if (modalStatus) modalStatus.textContent = 'Copy failed — select the address manually';
      }
    });
  });
})();
