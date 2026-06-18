(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function applyFilter(input, cards) {
        var keyword = normalize(input.value);
        cards.forEach(function (card) {
            var text = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-tags"),
                card.getAttribute("data-year"),
                card.getAttribute("data-region"),
                card.textContent
            ].join(" "));
            card.classList.toggle("hidden", keyword && text.indexOf(keyword) === -1);
        });
    }

    function initMenus() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function restart() {
            window.clearInterval(timer);
            start();
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                restart();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                restart();
            });
        });
        if (slides.length > 1) {
            start();
        }
    }

    function initPageFilters() {
        Array.prototype.slice.call(document.querySelectorAll("[data-page-filter]")).forEach(function (form) {
            var input = form.querySelector("[data-filter-input]");
            var list = document.querySelector("[data-filter-list]");
            if (!input || !list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                applyFilter(input, cards);
            });
            input.addEventListener("input", function () {
                applyFilter(input, cards);
            });
        });
    }

    function initSearchPage() {
        var form = document.querySelector("[data-search-page]");
        var list = document.querySelector("[data-search-list]");
        if (!form || !list) {
            return;
        }
        var input = form.querySelector("[data-search-input]");
        var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";
        input.value = q;
        applyFilter(input, cards);
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            applyFilter(input, cards);
        });
        input.addEventListener("input", function () {
            applyFilter(input, cards);
        });
    }

    window.setupMoviePlayer = function (videoId, coverId, movieSource) {
        var video = document.getElementById(videoId);
        var cover = document.getElementById(coverId);
        if (!video || !cover || !movieSource) {
            return;
        }
        var shell = video.closest(".video-shell");
        var loaded = false;
        var hlsInstance = null;

        function attach() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = movieSource;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(movieSource);
                hlsInstance.attachMedia(video);
            } else {
                video.src = movieSource;
            }
            if (shell) {
                shell.classList.add("playing");
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        cover.addEventListener("click", attach);
        video.addEventListener("click", function () {
            if (!loaded) {
                attach();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        initMenus();
        initHero();
        initPageFilters();
        initSearchPage();
    });
})();
