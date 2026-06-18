(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = document.querySelector('.menu-toggle');
    var menu = document.querySelector('.nav-menu');
    var search = document.querySelector('.nav-search');
    if (!button || !menu || !search) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
      search.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('.hero-slide', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
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
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
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

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  window.initMoviePlayer = function (source) {
    var box = document.querySelector('.player-box');
    if (!box) {
      return;
    }
    var video = box.querySelector('video');
    var overlay = box.querySelector('.play-overlay');
    var prepared = false;
    var hls = null;

    function prepare() {
      if (prepared || !video || !source) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      prepared = true;
    }

    function play() {
      prepare();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      video.setAttribute('controls', 'controls');
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  window.initSearchPage = function () {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = document.getElementById('searchInput');
    var summary = document.getElementById('searchSummary');
    var results = document.getElementById('searchResults');
    var data = window.SEARCH_MOVIES || [];

    if (input) {
      input.value = query;
    }

    function card(movie) {
      return [
        '<article class="movie-card">',
        '<a href="./' + movie.url + '" class="movie-link">',
        '<div class="poster-wrap">',
        '<img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, '&quot;') + '" loading="lazy">',
        '<span class="duration">' + movie.duration + '</span>',
        '<div class="poster-mask"><p>' + movie.one_line + '</p></div>',
        '</div>',
        '<div class="movie-card-body">',
        '<h3>' + movie.title + '</h3>',
        '<div class="movie-meta-row"><span>' + movie.category + '</span><strong>★ ' + movie.rating + '</strong></div>',
        '</div>',
        '</a>',
        '</article>'
      ].join('');
    }

    if (!results || !summary) {
      return;
    }

    if (!query) {
      summary.textContent = '可搜索完整片库中的 ' + data.length + ' 部影片。';
      results.innerHTML = data.slice(0, 40).map(card).join('');
      return;
    }

    var lower = query.toLowerCase();
    var matched = data.filter(function (movie) {
      return movie.search_text.toLowerCase().indexOf(lower) !== -1;
    });

    summary.textContent = '“' + query + '” 找到 ' + matched.length + ' 部影片。';
    results.innerHTML = matched.slice(0, 120).map(card).join('');
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
  });
})();
