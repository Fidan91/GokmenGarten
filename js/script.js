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

  // Jahr im Footer
  document.querySelectorAll(".year").forEach(el => {
    el.textContent = new Date().getFullYear();
  });
})();