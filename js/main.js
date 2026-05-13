/* Armory Fitness — motion & interactions */
(function () {
  const isTouch = window.matchMedia('(hover: none)').matches;

  /* ---------- Scroll-aware nav ---------- */
  const nav = document.querySelector('.nav');
  const onScroll = () => {
    if (!nav) return;
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile toggle ---------- */
  const toggle = document.querySelector('.nav__toggle');
  const links = document.querySelector('.nav__links');
  if (toggle && links) {
    const setOpen = (open) => {
      links.classList.toggle('open', open);
      if (nav) nav.classList.toggle('menu-open', open);
      document.documentElement.classList.toggle('menu-open', open);
      document.body.classList.toggle('menu-open', open);
    };
    toggle.addEventListener('click', () => setOpen(!links.classList.contains('open')));
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
  }

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => io.observe(el));

  /* ---------- Current year ---------- */
  const y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Scroll progress bar ---------- */
  if (!document.querySelector('.scroll-progress')) {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.prepend(bar);
    window.addEventListener('scroll', () => {
      const h = document.documentElement;
      const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      bar.style.width = pct + '%';
    }, { passive: true });
  }

  /* ---------- Number count-up on scroll ----------
     Mark element with data-count="42" data-suffix="+" data-prefix="$" data-duration="1500"
  */
  const countEls = document.querySelectorAll('[data-count]');
  if (countEls.length) {
    const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
    const animate = (el) => {
      const target = parseFloat(el.dataset.count);
      const dur = parseInt(el.dataset.duration || '1500', 10);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const decimals = (target % 1 !== 0) ? (el.dataset.count.split('.')[1] || '').length : 0;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / dur);
        const v = target * easeOutCubic(t);
        const formatted = el.dataset.format === 'plain'
          ? v.toFixed(decimals)
          : v.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        el.textContent = prefix + formatted + suffix;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animate(e.target);
          cio.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    countEls.forEach(el => {
      el.textContent = (el.dataset.prefix || '') + '0' + (el.dataset.suffix || '');
      cio.observe(el);
    });
  }

  /* ---------- Magnetic buttons (desktop hover only) ---------- */
  if (!isTouch && window.matchMedia('(pointer: fine)').matches) {
    const magnets = document.querySelectorAll('.btn, .nav__cta, .nav__contact');
    magnets.forEach(el => {
      el.setAttribute('data-magnetic', '');
      const STRENGTH = 0.18;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const mx = (e.clientX - (r.left + r.width / 2)) * STRENGTH;
        const my = (e.clientY - (r.top + r.height / 2)) * STRENGTH;
        el.style.setProperty('--mx', mx + 'px');
        el.style.setProperty('--my', my + 'px');
      });
      el.addEventListener('mouseleave', () => {
        el.style.setProperty('--mx', '0px');
        el.style.setProperty('--my', '0px');
      });
    });
  }

  /* ---------- Subtle 3D tilt on cards (desktop only) ---------- */
  if (!isTouch && window.matchMedia('(pointer: fine)').matches) {
    const tiltable = document.querySelectorAll('.gym-card, .w-card, .trainer, .pillar');
    tiltable.forEach(el => {
      const MAX = 4; // degrees
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = (py - .5) * -MAX;
        const ry = (px - .5) * MAX;
        el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }
})();
