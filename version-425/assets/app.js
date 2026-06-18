(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupMenu() {
    var button = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-nav]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var open = panel.classList.toggle('is-open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupSearchForms() {
    qsa('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = qs('input[name="q"]', form);
        var value = input ? input.value.trim() : '';
        if (!value) {
          event.preventDefault();
          return;
        }
        event.preventDefault();
        window.location.href = './search.html?q=' + encodeURIComponent(value);
      });
    });
  }

  function setupHero() {
    var root = qs('[data-hero-slider]');
    if (!root) {
      return;
    }
    var slides = qsa('.hero-slide', root);
    var dots = qsa('.hero-dot', root);
    var prev = qs('[data-hero-prev]', root);
    var next = qs('[data-hero-next]', root);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    start();
  }

  function setupFilters() {
    var input = qs('#searchInput');
    var year = qs('#filterYear');
    var region = qs('#filterRegion');
    var list = qs('[data-movie-list]');
    var empty = qs('[data-empty-state]');
    if (!list) {
      return;
    }
    var cards = qsa('[data-title]', list);

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (input && query) {
      input.value = query;
    }

    function match(card) {
      var q = normalize(input ? input.value : '');
      var y = normalize(year ? year.value : '');
      var r = normalize(region ? region.value : '');
      var text = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.year,
        card.dataset.type,
        card.dataset.genre,
        card.dataset.tags,
        card.textContent
      ].join(' '));
      if (q && text.indexOf(q) === -1) {
        return false;
      }
      if (y && normalize(card.dataset.year) !== y) {
        return false;
      }
      if (r && normalize(card.dataset.region) !== r) {
        return false;
      }
      return true;
    }

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var ok = match(card);
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, year, region].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupSearchForms();
    setupHero();
    setupFilters();
  });
})();
