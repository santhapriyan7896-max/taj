/* ============================================================
   CoGe — interactions
   Ink-trail cursor · scroll motion · parallax · WhatsApp send
   ============================================================ */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover:none), (pointer:coarse)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ================================================
     1. INK-TRAIL CURSOR
     ================================================ */
  const inkTrail = $('#inkTrail');
  const trailPath = $('#trailPath');
  const inkTip = $('#inkTip');
  const inkLabel = $('#inkLabel');
  if (!isTouch && inkTip && trailPath) {
    let mx = innerWidth / 2, my = innerHeight / 2;
    let tx = mx, ty = my;
    const pts = [];
    const MAX = 24;

    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
    }, { passive: true });

    let hovered = null;
    document.addEventListener('mouseover', e => {
      const el = e.target.closest('[data-cur]');
      if (el !== hovered) {
        hovered = el;
        const states = ['is-link', 'is-card', 'is-btn', 'is-text'];
        inkTip.classList.remove(...states);
        if (el) {
          inkTip.classList.add('is-' + el.getAttribute('data-cur'));
          inkLabel.textContent = el.getAttribute('data-cur-label') || '';
        } else {
          inkLabel.textContent = '';
          if (e.target.closest('p, li, label, h1, h2, h3, h4')) {
            inkTip.classList.add('is-text');
          }
        }
      }
    });
    document.addEventListener('mouseout', e => {
      if (e.target === hovered) {
        hovered = null;
        inkTip.classList.remove('is-link', 'is-card', 'is-btn', 'is-text');
        inkLabel.textContent = '';
      }
    });
    document.addEventListener('mousedown', () => inkTip.classList.add('is-down'));
    document.addEventListener('mouseup', () => inkTip.classList.remove('is-down'));

    function tick() {
      tx = lerp(tx, mx, 0.28);
      ty = lerp(ty, my, 0.28);
      pts.push({ x: tx, y: ty });
      if (pts.length > MAX) pts.shift();

      if (pts.length > 2) {
        let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
        for (let i = 1; i < pts.length - 1; i++) {
          const xc = (pts[i].x + pts[i + 1].x) / 2;
          const yc = (pts[i].y + pts[i + 1].y) / 2;
          d += ` Q ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)} ${xc.toFixed(1)} ${yc.toFixed(1)}`;
        }
        trailPath.setAttribute('d', d);
      }
      inkTip.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ================================================
     2. MOBILE NAV TOGGLE
     ================================================ */
  const navToggle = $('#navToggle');
  const navList = $('#navList');
  if (navToggle && navList) {
    navToggle.addEventListener('click', () => {
      document.body.classList.toggle('nav-open');
      navToggle.classList.toggle('is-open');
    });
    navList.addEventListener('click', e => {
      if (e.target.tagName === 'A') {
        document.body.classList.remove('nav-open');
        navToggle.classList.remove('is-open');
      }
    });
  }

  /* ================================================
     3. HERO LETTER REVEAL (split + animate)
     ================================================ */
  $$('.hero-h1 .line[data-text]').forEach((el, li) => {
    const txt = el.getAttribute('data-text');
    const tmp = document.createElement('div');
    tmp.innerHTML = txt;
    const decoded = tmp.textContent;
    const frag = document.createDocumentFragment();
    decoded.split('').forEach((ch, i) => {
      const s = document.createElement('span');
      s.className = 'char';
      s.textContent = ch === ' ' ? '\u00a0' : ch;
      s.style.setProperty('--d', (li * 0.18 + i * 0.028) + 's');
      frag.appendChild(s);
    });
    el.appendChild(frag);
  });

  /* ================================================
     4. WORD REVEAL on h2
     ================================================ */
  $$('h2.word-reveal').forEach(h2 => {
    // Preserve <span class="em|outline"> children by walking nodes
    const newNodes = [];
    let wordIdx = 0;
    h2.childNodes.forEach(node => {
      if (node.nodeType === 3) { // text
        const words = node.textContent.split(/(\s+)/);
        words.forEach(w => {
          if (!w) return;
          if (/^\s+$/.test(w)) {
            newNodes.push(document.createTextNode(w));
          } else {
            const s = document.createElement('span');
            s.className = 'word';
            s.textContent = w;
            s.style.setProperty('--wd', (wordIdx * 0.06) + 's');
            wordIdx++;
            newNodes.push(s);
          }
        });
      } else if (node.nodeType === 1) {
        // span — wrap its text content into one .word but keep its class
        const cls = node.className || '';
        const inner = node.textContent;
        const inWords = inner.split(/(\s+)/);
        inWords.forEach(w => {
          if (!w) return;
          if (/^\s+$/.test(w)) {
            newNodes.push(document.createTextNode(w));
          } else {
            const s = document.createElement('span');
            s.className = 'word ' + cls;
            s.textContent = w;
            s.style.setProperty('--wd', (wordIdx * 0.06) + 's');
            wordIdx++;
            newNodes.push(s);
          }
        });
      }
    });
    h2.innerHTML = '';
    newNodes.forEach(n => h2.appendChild(n));
  });

  /* ================================================
     5. INTERSECTION REVEAL
     ================================================ */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        if (e.target.classList.contains('stat-item')) animateCounter(e.target.querySelector('.stat-num'));
        if (e.target.id === 'heroBadgeNum') animateCounter(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  $$('.reveal, .reveal-left, .reveal-right, .reveal-clip, .word-reveal, .stat-item, .service-card, .step, .pricing-card').forEach(el => io.observe(el));

  const heroBadge = $('#heroBadgeNum');
  if (heroBadge) {
    heroBadge.setAttribute('data-target', '48');
    heroBadge.setAttribute('data-suffix', 'h');
    io.observe(heroBadge);
  }

  /* ================================================
     6. COUNTERS
     ================================================ */
  function animateCounter(el) {
    if (!el || el.dataset.done) return;
    el.dataset.done = '1';
    const target = parseInt(el.dataset.target || '0', 10);
    const suffix = el.dataset.suffix || '';
    const dur = 1600;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ================================================
     7. SCROLL: progress bar + parallax + everything
     ================================================ */
  const scrollBar = $('#scrollBar');
  const xtTrack = $('#xtTrack');
  const mmTrack = $('#mmTrack');
  const heroMesh = $('.hero-mesh');
  const orbs = $$('.orb');
  let ticking = false;

  // collect floating elements
  const floaters = $$('[data-float]');

  function onScroll() {
    const sy = window.scrollY;
    const doc = document.documentElement;
    const max = doc.scrollHeight - innerHeight;
    const p = max > 0 ? (sy / max) : 0;

    // progress bar
    if (scrollBar) scrollBar.style.transform = `scaleX(${p})`;

    // hero mesh parallax (slow)
    if (heroMesh && sy < innerHeight * 1.2) {
      heroMesh.style.transform = `translateY(${sy * 0.35}px)`;
    }

    // orbs slow drift on scroll
    orbs.forEach((o, i) => {
      const k = (i + 1) * 0.04;
      o.style.transform = `translate3d(${Math.sin(sy * 0.001 + i) * 30}px, ${sy * k}px, 0)`;
    });

    // floaters subtle rise on scroll
    floaters.forEach(el => {
      const r = el.getBoundingClientRect();
      const mid = r.top + r.height / 2;
      const off = (innerHeight / 2 - mid) * 0.08;
      el.style.transform = `translateY(${off.toFixed(1)}px)`;
    });

    // x-text scroll marquee
    if (xtTrack) {
      const r = xtTrack.parentElement.getBoundingClientRect();
      const prog = 1 - (r.top / innerHeight);
      xtTrack.style.transform = `translateX(${-prog * 280}px)`;
    }
    if (mmTrack) {
      const r = mmTrack.parentElement.getBoundingClientRect();
      const prog = 1 - (r.top / innerHeight);
      mmTrack.style.transform = `translateX(${-prog * 480}px)`;
    }

    // section labels — fade their text in based on viewport position
    $$('.section-head').forEach(sh => {
      const r = sh.getBoundingClientRect();
      const prog = clamp(1 - (r.top / (innerHeight * 0.8)), 0, 1);
      sh.style.setProperty('--head-prog', prog);
    });

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });

  /* ================================================
     9. 3D TILT CARDS
     ================================================ */
  if (!isTouch && !reduced) {
    $$('.tilt-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(1000px) rotateX(${-y * 7}deg) rotateY(${x * 9}deg) translateY(-6px) translateZ(0)`;
        card.style.setProperty('--mx', `${(x + 0.5) * 100}%`);
        card.style.setProperty('--my', `${(y + 0.5) * 100}%`);
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ================================================
     10. MAGNETIC BUTTONS
     ================================================ */
  if (!isTouch && !reduced) {
    $$('.btn-primary, .btn-submit, .nav-cta').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.28;
        const y = (e.clientY - r.top - r.height / 2) * 0.28;
        btn.style.transform = `translate(${x}px, ${y}px)`;
      });
      btn.addEventListener('mouseleave', () => btn.style.transform = '');
    });
  }

  /* ================================================
     11. PRICING EXPAND + AUTOFILL
     ================================================ */
  const planMap = {
    local: 'Local Business Website',
    custom: 'Custom Website Concept',
    ai: 'Custom AI Workflow'
  };
  const pricingGrid = $('#pricingGrid');
  $$('.pricing-card').forEach(card => {
    if (!card.dataset.plan) return;
    card.addEventListener('click', () => {
      const wasActive = card.classList.contains('active');
      $$('.pricing-card').forEach(c => c.classList.remove('active'));
      if (!wasActive) {
        card.classList.add('active');
        pricingGrid && pricingGrid.classList.add('has-active');
        const plan = card.getAttribute('data-plan');
        const sel = $('#fservice');
        if (sel && planMap[plan]) {
          sel.value = planMap[plan];
          sel.dispatchEvent(new Event('change'));
        }
      } else {
        pricingGrid && pricingGrid.classList.remove('has-active');
      }
    });
  });

  /* ================================================
     12. SMOOTH SCROLL
     ================================================ */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id && id.length > 1) {
        const t = document.querySelector(id);
        if (t) {
          e.preventDefault();
          window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 24, behavior: reduced ? 'auto' : 'smooth' });
        }
      }
    });
  });

  /* ================================================
     13. KINETIC TYPE on service titles
     ================================================ */
  $$('[data-kinetic]').forEach(el => {
    const txt = el.textContent;
    el.textContent = '';
    txt.split('').forEach((ch, i) => {
      const s = document.createElement('span');
      s.setAttribute('data-kchar', '');
      s.textContent = ch === ' ' ? '\u00a0' : ch;
      const ky = (Math.random() * 16 - 8).toFixed(1);
      const kr = (Math.random() * 18 - 9).toFixed(1);
      s.style.setProperty('--ky', `${ky}px`);
      s.style.setProperty('--kr', `${kr}deg`);
      s.style.setProperty('--kd', `${i * 0.025}s`);
      el.appendChild(s);
    });
  });

  /* ================================================
     14. TEXT SCRAMBLE on hover (eyebrows, ticker items)
     ================================================ */
  const SCRAMBLE_CHARS = '!<>-_\\/[]{}—=+*^?#________';
  function scrambleEffect(el) {
    if (!el || el.dataset.scrambling) return;
    const orig = el.textContent;
    el.dataset.scrambling = '1';
    let frame = 0;
    const queue = orig.split('').map((ch, i) => ({
      from: SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)],
      to: ch,
      start: Math.random() * 12,
      end: Math.random() * 18 + 14
    }));
    function update() {
      let out = '', done = 0;
      for (let i = 0; i < queue.length; i++) {
        const q = queue[i];
        if (frame >= q.end) { out += q.to; done++; }
        else if (frame >= q.start) {
          if (Math.random() < 0.28) q.from = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          out += q.from;
        } else out += q.from;
      }
      el.textContent = out;
      if (done === queue.length) { delete el.dataset.scrambling; el.textContent = orig; return; }
      frame++;
      requestAnimationFrame(update);
    }
    update();
  }
  $$('.section-label span, .ticker-item, .step-title, .pricing-tier').forEach(el => {
    el.addEventListener('mouseenter', () => scrambleEffect(el));
  });

  /* ================================================
     15. CONTACT FORM → WhatsApp
     ================================================ */
  const form = $('#contactForm');
  if (form) {
    const fields = $$('input, select, textarea', form);
    const validators = {
      fname: v => v.trim().length >= 2,
      femail: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
      fservice: v => !!v,
      fmessage: v => v.trim().length >= 4
    };

    function validateField(el) {
      const fn = validators[el.id];
      const wrap = el.closest('.field');
      if (!fn) return true;
      const ok = fn(el.value);
      if (wrap) wrap.classList.toggle('error', !ok);
      return ok;
    }

    fields.forEach(el => {
      el.addEventListener('blur', () => validateField(el));
      el.addEventListener('input', () => {
        const wrap = el.closest('.field');
        if (wrap && wrap.classList.contains('error')) validateField(el);
      });
      el.addEventListener('change', () => validateField(el));
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      const required = ['fname', 'femail', 'fservice', 'fmessage'];
      let allOk = true;
      required.forEach(id => {
        const el = $('#' + id);
        if (!validateField(el)) allOk = false;
      });
      if (!allOk) {
        const firstErr = form.querySelector('.field.error');
        if (firstErr) firstErr.querySelector('input, select, textarea').focus();
        return;
      }

      const btn = $('#btnSubmit');
      btn.classList.add('loading');
      btn.disabled = true;

      // Build the WhatsApp message
      const data = {
        name: $('#fname').value.trim(),
        email: $('#femail').value.trim(),
        phone: $('#fphone').value.trim(),
        business: $('#fbusiness').value.trim(),
        service: $('#fservice').value.trim(),
        message: $('#fmessage').value.trim()
      };
      const lines = [
        `Hi CoGe, I'd like to start a project.`,
        ``,
        `*Name:* ${data.name}`,
        `*Email:* ${data.email}`,
      ];
      if (data.phone) lines.push(`*Phone:* ${data.phone}`);
      if (data.business) lines.push(`*Business:* ${data.business}`);
      lines.push(`*Service:* ${data.service}`);
      lines.push(``);
      lines.push(`*Project details:*`);
      lines.push(data.message);

      const phone = form.dataset.waPhone || '919876543210';
      const text = encodeURIComponent(lines.join('\n'));
      const url = `https://wa.me/${phone}?text=${text}`;

      setTimeout(() => {
        btn.classList.remove('loading');
        form.classList.add('submitted');
        const successPanel = $('#successPanel');
        const successName = $('#successName');
        const nameVal = data.name.split(' ')[0];
        if (successName) successName.textContent = nameVal || 'there';
        if (successPanel) successPanel.classList.add('show');
        burstConfetti();
        // open WhatsApp in a new tab
        window.open(url, '_blank', 'noopener');
      }, 900);
    });

    const resetBtn = $('#resetForm');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        form.reset();
        form.classList.remove('submitted');
        $('#successPanel').classList.remove('show');
        const btn = $('#btnSubmit');
        btn.disabled = false;
        $$('.field', form).forEach(f => f.classList.remove('error'));
      });
    }
  }

  /* ================================================
     16. CONFETTI
     ================================================ */
  function burstConfetti() {
    if (reduced) return;
    const layer = $('#confettiLayer');
    if (!layer) return;
    layer.innerHTML = '';
    const colors = ['#4cff91', '#c9a97a', '#ffffff', '#6ad8a0', '#2adb6f'];
    for (let i = 0; i < 80; i++) {
      const c = document.createElement('i');
      c.className = 'confetti';
      c.style.left = (28 + Math.random() * 44) + '%';
      c.style.top = '60%';
      c.style.background = colors[i % colors.length];
      const cx = (Math.random() * 700 - 350);
      const cy = (-200 - Math.random() * 360);
      const cr = (Math.random() * 720 - 360);
      const cd = (1 + Math.random() * 0.7);
      c.style.animation = `confettiBurst ${cd}s cubic-bezier(.2,.8,.4,1) forwards`;
      c.style.setProperty('--cx', cx + 'px');
      c.style.setProperty('--cy', cy + 'px');
      c.style.setProperty('--cr', cr + 'deg');
      layer.appendChild(c);
    }
    setTimeout(() => { if (layer) layer.innerHTML = ''; }, 2400);
  }

  /* ================================================
     17. CURSOR-REACTIVE GRADIENT on hero
     ================================================ */
  const hero = $('.hero');
  if (hero && !isTouch && !reduced) {
    hero.addEventListener('mousemove', e => {
      const r = hero.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      hero.style.setProperty('--cx', x + '%');
      hero.style.setProperty('--cy', y + '%');
    });
  }

  /* ================================================
     18. AUTO-FLOAT random spots (decorative)
     ================================================ */
  // Idle micro-bob on stat-num
  $$('.stat-num').forEach((el, i) => {
    el.style.animation = `floatBob 4.${i}s ease-in-out infinite`;
    el.style.animationDelay = (i * 0.3) + 's';
  });

  /* ================================================
     19. RESIZE
     ================================================ */
  let resizeT;
  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => { onScroll(); }, 100);
  });

  // initial paint
  onScroll();
})();
