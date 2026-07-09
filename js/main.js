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

/* ---- Contact form failover (added 2026-07-09) ----
 * FormSubmit.co had an origin outage (Cloudflare 522) that dumped visitors
 * on a raw Cloudflare error page mid-submit. This intercepts every
 * formsubmit.co form, submits via their AJAX API in the background, and:
 *   - on success: shows an inline thank-you (no redirect needed)
 *   - on failure: shows the gym's phone + email instead of an error page
 * Auto-recovers when FormSubmit is healthy again. No behavior change otherwise.
 */
(function () {
  if (!window.fetch || !window.FormData) return; // let old browsers submit natively

  var PHONE_DISPLAY = '360-380-4405';
  var PHONE_TEL = '+13603804405';

  function emailFromAction(action) {
    var m = action.match(/formsubmit\.co\/(?:ajax\/)?([^/?#]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  }

  function showNotice(form, html, isError) {
    var n = form.querySelector('.form-failover-notice');
    if (!n) {
      n = document.createElement('div');
      n.className = 'form-failover-notice';
      form.insertBefore(n, form.firstChild);
    }
    n.style.cssText = 'padding:14px 16px;margin:0 0 16px;border-radius:6px;font-size:15px;line-height:1.5;' +
      (isError
        ? 'background:rgba(162,49,56,.12);border:1px solid rgba(162,49,56,.5);color:inherit;'
        : 'background:rgba(76,175,80,.12);border:1px solid rgba(76,175,80,.5);color:inherit;');
    n.innerHTML = html;
    n.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || !form.action || form.action.indexOf('formsubmit.co') === -1) return;
    var email = emailFromAction(form.action);
    if (!email || email.indexOf('@') === -1) return; // unknown shape: submit natively

    e.preventDefault();

    var btn = form.querySelector('[type="submit"]');
    var btnText = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

    var data = {};
    new FormData(form).forEach(function (v, k) {
      if (k === '_next' || k === '_captcha') return; // not applicable to AJAX
      data[k] = v;
    });

    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, 12000);

    fetch('https://formsubmit.co/ajax/' + email, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data),
      signal: ctrl.signal
    }).then(function (res) {
      clearTimeout(timer);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).then(function () {
      showNotice(form,
        '<strong>Message sent.</strong> Thanks for reaching out — we’ll get back to you within one business day.',
        false);
      form.reset();
      if (btn) { btn.disabled = false; btn.textContent = btnText; }
    }).catch(function () {
      clearTimeout(timer);
      showNotice(form,
        '<strong>Sorry, our contact form is having a temporary issue.</strong> ' +
        'Your message was not sent. Please call <a href="tel:' + PHONE_TEL + '">' + PHONE_DISPLAY + '</a> ' +
        'or email <a href="mailto:' + email + '">' + email + '</a> and we’ll get right back to you. ' +
        'Your text below is still saved if you want to copy it.',
        true);
      if (btn) { btn.disabled = false; btn.textContent = btnText; }
    });
  }, true);
})();
