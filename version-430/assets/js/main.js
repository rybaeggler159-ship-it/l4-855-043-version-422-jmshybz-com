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

    ready(function () {
        var toggle = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");

        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                var expanded = toggle.getAttribute("aria-expanded") === "true";
                toggle.setAttribute("aria-expanded", expanded ? "false" : "true");
                panel.hidden = expanded;
            });
        }

        var hero = document.querySelector(".hero");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
            var prev = hero.querySelector(".hero-arrow.prev");
            var next = hero.querySelector(".hero-arrow.next");
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, idx) {
                    slide.classList.toggle("is-active", idx === current);
                });
                dots.forEach(function (dot, idx) {
                    dot.classList.toggle("is-active", idx === current);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            dots.forEach(function (dot, idx) {
                dot.addEventListener("click", function () {
                    show(idx);
                    start();
                });
            });

            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    start();
                });
            }

            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            show(0);
            start();
        }

        var pageSearch = document.querySelector(".page-search");
        var localFilter = document.querySelector(".local-filter-input");

        function filterCards(scope) {
            var container = scope || document;
            var cards = Array.prototype.slice.call(container.querySelectorAll(".movie-card"));
            var empty = container.querySelector(".empty-state") || document.querySelector(".empty-state");
            var searchInput = container.querySelector(".filter-query") || localFilter;
            var categorySelect = container.querySelector(".filter-category");
            var typeSelect = container.querySelector(".filter-type");
            var q = normalize(searchInput ? searchInput.value : "");
            var category = categorySelect ? categorySelect.value : "";
            var type = typeSelect ? typeSelect.value : "";
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-search"));
                var cardCategory = card.getAttribute("data-category") || "";
                var cardType = card.getAttribute("data-type") || "";
                var matched = true;

                if (q && text.indexOf(q) === -1) {
                    matched = false;
                }
                if (category && cardCategory !== category) {
                    matched = false;
                }
                if (type && cardType !== type) {
                    matched = false;
                }

                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        if (pageSearch) {
            var params = new URLSearchParams(window.location.search);
            var queryInput = pageSearch.querySelector(".filter-query");
            if (queryInput && params.get("q")) {
                queryInput.value = params.get("q");
            }
            pageSearch.addEventListener("submit", function (event) {
                event.preventDefault();
                filterCards(document);
            });
            pageSearch.addEventListener("input", function () {
                filterCards(document);
            });
            pageSearch.addEventListener("change", function () {
                filterCards(document);
            });
            filterCards(document);
        }

        if (localFilter) {
            localFilter.addEventListener("input", function () {
                filterCards(document);
            });
        }
    });

    window.bindMoviePlayer = function (streamUrl) {
        var video = document.getElementById("movie-player");
        var poster = document.querySelector(".player-poster");
        var button = document.querySelector(".play-button");
        var hls = null;
        var attached = false;

        if (!video || !streamUrl) {
            return;
        }

        function attemptPlay() {
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {});
            }
        }

        function begin() {
            if (poster) {
                poster.classList.add("is-hidden");
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                if (!video.getAttribute("src")) {
                    video.setAttribute("src", streamUrl);
                }
                attemptPlay();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                if (!attached) {
                    hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        attemptPlay();
                    });
                    attached = true;
                }
                attemptPlay();
                return;
            }

            if (!video.getAttribute("src")) {
                video.setAttribute("src", streamUrl);
            }
            attemptPlay();
        }

        if (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                begin();
            });
        }

        if (poster) {
            poster.addEventListener("click", function () {
                begin();
            });
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                begin();
            } else {
                video.pause();
            }
        });
    };
})();
