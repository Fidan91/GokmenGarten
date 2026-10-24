(() => {
  document.documentElement.classList.add('js');

  // Mobile-Navigation
  const burger = document.querySelector('.burger');
  const menu = document.getElementById('menu');
  const setMenu = open => {
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
  };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  // Logo-Klick: nach oben scrollen, ohne #top in der URL
  document.querySelector('.nav .logo').addEventListener('click', e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    history.replaceState(null, '', location.pathname + location.search);
  });

  // Karussell (Scroll-Snap + Pfeiltasten/Buttons)
  document.querySelectorAll('[data-carousel]').forEach(c => {
    const track = c.querySelector('.track');
    const step = () => track.clientWidth * 0.8;
    c.querySelector('[data-prev]').addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    c.querySelector('[data-next]').addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
    track.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') track.scrollBy({ left: step(), behavior: 'smooth' });
      if (e.key === 'ArrowLeft') track.scrollBy({ left: -step(), behavior: 'smooth' });
    });
  });

  // FAQ-Akkordeon (Buttons sind per Tab/Enter/Leertaste bedienbar, Pfeiltasten/Pos1/Ende zusätzlich)
  document.querySelectorAll('[data-acc]').forEach(acc => {
    const btns = [...acc.querySelectorAll('button')];
    btns.forEach((b, i) => {
      b.addEventListener('click', () => {
        const open = b.getAttribute('aria-expanded') === 'true';
        b.setAttribute('aria-expanded', !open);
        document.getElementById(b.getAttribute('aria-controls')).hidden = open;
      });
      b.addEventListener('keydown', e => {
        const k = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: btns.length - 1 }[e.key];
        if (k === undefined) return;
        e.preventDefault();
        btns[(k + btns.length) % btns.length].focus();
      });
    });
  });

  // Dezente Einblend-Animation
  const items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.15 });
    items.forEach(i => io.observe(i));
  } else {
    items.forEach(i => i.classList.add('in'));
  }



  // Blütenblatt-Navigation (Tabs-Muster: Pfeiltasten, Pos1/Ende, Buttons, Klick, Wischen)
  const bloom = document.querySelector('[data-bloom]');
  if (bloom) {
    const flower = bloom.querySelector('.flower');
    const petals = [...bloom.querySelectorAll('[role="tab"]')];
    const panels = petals.map(p => document.getElementById(p.getAttribute('aria-controls')));
    const num = bloom.querySelector('[data-bloom-num]');
    const count = bloom.querySelector('[data-bloom-count]');
    const status = bloom.querySelector('[data-bloom-status]');
    const n = petals.length, step = 360 / n;
    const pad = v => String(v).padStart(2, '0');
    let cur = 0, rot = 0, swiped = false, sx = 0, sy = 0;

    const select = (i, focus) => {
      i = ((i % n) + n) % n;
      let d = (((i - cur) % n) + n) % n;       // kürzester Drehweg
      if (d > n / 2) d -= n;
      rot -= d * step;                          // kumulativ, damit es nie „zurückspult“
      flower.style.setProperty('--rot', rot + 'deg');
      cur = i;
      petals.forEach((p, k) => {
        const on = k === i;
        p.setAttribute('aria-selected', on);
        p.tabIndex = on ? 0 : -1;
        panels[k].hidden = !on;
      });
      num.textContent = pad(i + 1);
      count.textContent = pad(i + 1) + ' / ' + pad(n);
      status.textContent = 'Leistung ' + (i + 1) + ' von ' + n + ': ' + petals[i].textContent.replace(/\u00ad/g, '').trim();
      if (focus) petals[i].focus();
    };

    petals.forEach((p, k) => p.addEventListener('click', () => {
      if (swiped) { swiped = false; return; }
      select(k);
    }));
    bloom.querySelector('[role="tablist"]').addEventListener('keydown', e => {
      const map = { ArrowRight: cur + 1, ArrowDown: cur + 1, ArrowLeft: cur - 1, ArrowUp: cur - 1, Home: 0, End: n - 1 };
      if (!(e.key in map)) return;
      e.preventDefault();
      select(map[e.key], true);
    });
    bloom.querySelector('[data-bloom-prev]').addEventListener('click', () => select(cur - 1));
    bloom.querySelector('[data-bloom-next]').addEventListener('click', () => select(cur + 1));

    // Touch: horizontal über die Blume wischen (vertikales Scrollen bleibt per touch-action erhalten)
    flower.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; swiped = false; });
    flower.addEventListener('pointerup', e => {
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { swiped = true; select(cur + (dx < 0 ? 1 : -1)); }
    });
  }


    // Kennzahlen hochzählen, sobald sie sichtbar werden (einmalig)
  const counters = document.querySelectorAll('[data-count]');
  const fmt = new Intl.NumberFormat('de-DE');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const run = el => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const dur = 2000;
    const t0 = performance.now();
    const tick = now => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);          // startet schnell, bremst sanft ab
      el.textContent = fmt.format(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (counters.length && 'IntersectionObserver' in window && !reduce) {
    const io2 = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        run(e.target);
        io2.unobserve(e.target);
      });
    }, { threshold: 0.4 });
    counters.forEach(c => {
      c.textContent = '0' + (c.dataset.suffix || '');  // Startwert nur mit JS
      io2.observe(c);
    });
  }

  
  // Jahr im Footer
  document.querySelectorAll(".year").forEach(el => {
    el.textContent = new Date().getFullYear();
  });
})();