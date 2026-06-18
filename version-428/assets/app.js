(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function hideBrokenImages() {
    document.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("image-hidden");
      }, { once: true });
    });
  }

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".nav-menu");
    var search = document.querySelector(".nav-search");
    if (!toggle || !menu || !search) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = !menu.classList.contains("is-open");
      menu.classList.toggle("is-open", open);
      search.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  function setupHero() {
    var slider = document.querySelector(".hero-slider");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var prev = slider.querySelector(".hero-prev");
    var next = slider.querySelector(".hero-next");
    var active = 0;
    var timer;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupPlayers() {
    document.querySelectorAll(".player-card").forEach(function (box) {
      var video = box.querySelector("video");
      var overlay = box.querySelector(".play-overlay");
      if (!video) {
        return;
      }
      var stream = video.getAttribute("data-stream");
      var initialized = false;
      var hlsInstance = null;

      function init() {
        if (initialized || !stream) {
          return;
        }
        initialized = true;
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            } else {
              hlsInstance.destroy();
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else {
          video.src = stream;
        }
      }

      function play() {
        init();
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      init();
      if (overlay) {
        overlay.addEventListener("click", play);
      }
      video.addEventListener("play", function () {
        box.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (video.currentTime <= 0 || video.ended) {
          box.classList.remove("is-playing");
        }
      });
      video.addEventListener("ended", function () {
        box.classList.remove("is-playing");
      });
      box.addEventListener("click", function (event) {
        if (event.target === video || event.target === overlay || overlay && overlay.contains(event.target)) {
          play();
        }
      });
    });
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get("q") || "").trim();
  }

  function safe(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderSearch() {
    var mount = document.getElementById("searchResults");
    if (!mount || !window.SEARCH_INDEX) {
      return;
    }
    var q = getQuery();
    var input = document.getElementById("searchInput");
    var title = document.getElementById("searchTitle");
    if (input) {
      input.value = q;
    }
    if (title) {
      title.textContent = q ? "搜索：" + q : "搜索影片";
    }
    if (!q) {
      mount.innerHTML = '<div class="empty-state">输入片名、地区、类型或标签即可查找影片。</div>';
      return;
    }
    var words = q.toLowerCase().split(/\s+/).filter(Boolean);
    var results = window.SEARCH_INDEX.filter(function (item) {
      var haystack = [item.title, item.region, item.genre, item.tags, item.oneLine].join(" ").toLowerCase();
      return words.every(function (word) {
        return haystack.indexOf(word) !== -1;
      });
    }).slice(0, 120);
    if (!results.length) {
      mount.innerHTML = '<div class="empty-state">未找到匹配影片，换一个关键词再试。</div>';
      return;
    }
    mount.innerHTML = '<div class="movie-grid">' + results.map(function (item) {
      return '<article class="movie-card">'
        + '<a href="' + safe(item.url) + '" class="card-link">'
        + '<span class="poster-surface"><img src="' + safe(item.cover) + '" alt="' + safe(item.title) + '" loading="lazy"><span class="duration-badge">' + safe(item.duration) + '</span><span class="poster-copy">' + safe(item.oneLine) + '</span></span>'
        + '<span class="card-body"><strong>' + safe(item.title) + '</strong><span class="card-meta"><em>' + safe(item.category) + '</em><span>★ ' + safe(item.rating) + '</span></span><span class="card-tags"><span>' + safe(item.year) + '</span><span>' + safe(item.region) + '</span></span></span>'
        + '</a></article>';
    }).join("") + '</div>';
    hideBrokenImages();
  }

  ready(function () {
    hideBrokenImages();
    setupMenu();
    setupHero();
    setupPlayers();
    renderSearch();
  });
})();
