
(function () {
  const toggle = document.querySelector('.mobile-toggle');
  const panel = document.querySelector('.mobile-panel');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    let current = 0;

    const activate = function (index) {
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
      current = index;
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        activate(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        activate((current + 1) % slides.length);
      }, 5600);
    }
  }

  const searchPage = document.querySelector('[data-search-page]');
  if (searchPage) {
    const input = searchPage.querySelector('[data-search-input]');
    const categoryButtons = Array.from(searchPage.querySelectorAll('[data-filter-category]'));
    const cards = Array.from(searchPage.querySelectorAll('[data-movie-card]'));
    const params = new URLSearchParams(window.location.search);
    let category = 'all';

    if (input && params.get('q')) {
      input.value = params.get('q');
    }

    const apply = function () {
      const query = input ? input.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        const haystack = (card.getAttribute('data-search') || '').toLowerCase();
        const cardCategory = card.getAttribute('data-category') || '';
        const matchesQuery = !query || haystack.indexOf(query) !== -1;
        const matchesCategory = category === 'all' || cardCategory === category;
        card.classList.toggle('hidden-card', !(matchesQuery && matchesCategory));
      });
    };

    if (input) {
      input.addEventListener('input', apply);
      apply();
    }

    categoryButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        category = button.getAttribute('data-filter-category') || 'all';
        categoryButtons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        apply();
      });
    });
  }

  const sortAreas = Array.from(document.querySelectorAll('[data-sort-area]'));
  sortAreas.forEach(function (area) {
    const grid = area.querySelector('[data-sort-grid]');
    const buttons = Array.from(area.querySelectorAll('[data-sort]'));
    if (!grid || buttons.length === 0) {
      return;
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        const mode = button.getAttribute('data-sort');
        const cards = Array.from(grid.querySelectorAll('[data-movie-card]'));
        buttons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        cards.sort(function (a, b) {
          if (mode === 'score') {
            return Number(b.getAttribute('data-score')) - Number(a.getAttribute('data-score'));
          }
          if (mode === 'views') {
            return Number(b.getAttribute('data-views')) - Number(a.getAttribute('data-views'));
          }
          return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
        });
        cards.forEach(function (card) {
          grid.appendChild(card);
        });
      });
    });
  });
})();

function initMoviePlayer(source) {
  const video = document.getElementById('movie-player');
  const overlay = document.getElementById('player-start');
  const frame = document.querySelector('.player-frame');
  let prepared = false;
  let hlsInstance = null;

  if (!video || !overlay || !frame || !source) {
    return;
  }

  const prepare = function () {
    if (prepared) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }

    video.controls = true;
    prepared = true;
  };

  const start = function () {
    prepare();
    frame.classList.add('is-playing');
    const playRequest = video.play();
    if (playRequest && typeof playRequest.catch === 'function') {
      playRequest.catch(function () {});
    }
  };

  overlay.addEventListener('click', start);
  frame.addEventListener('click', function (event) {
    if (event.target.closest('button') || event.target === video) {
      return;
    }
    if (!prepared) {
      start();
    }
  });
  video.addEventListener('play', function () {
    frame.classList.add('is-playing');
  });
  video.addEventListener('pause', function () {
    if (!video.ended) {
      frame.classList.remove('is-playing');
    }
  });
  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
