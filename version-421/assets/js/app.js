import { H as Hls } from "../vendor/video-vendor-dru42stk.js";

const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function normalizeText(value) {
    return (value || "").toString().trim().toLowerCase();
}

function setupMobileMenu() {
    const button = qs("[data-mobile-toggle]");
    const menu = qs("[data-mobile-menu]");
    if (!button || !menu) {
        return;
    }

    button.addEventListener("click", () => {
        const isOpen = menu.classList.toggle("is-open");
        document.body.classList.toggle("menu-open", isOpen);
        button.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
}

function setupHeroCarousel() {
    const slides = qsa("[data-hero-slide]");
    if (slides.length <= 1) {
        return;
    }

    const dots = qsa("[data-hero-dot]");
    const miniButtons = qsa("[data-hero-target]");
    const prev = qs("[data-hero-prev]");
    const next = qs("[data-hero-next]");
    let activeIndex = 0;
    let timer = null;

    function show(index) {
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach((slide, itemIndex) => {
            slide.classList.toggle("is-active", itemIndex === activeIndex);
        });
        dots.forEach((dot, itemIndex) => {
            dot.classList.toggle("is-active", itemIndex === activeIndex);
        });
        miniButtons.forEach((button, itemIndex) => {
            button.classList.toggle("is-active", itemIndex === activeIndex);
        });
    }

    function startAutoPlay() {
        stopAutoPlay();
        timer = window.setInterval(() => show(activeIndex + 1), 6500);
    }

    function stopAutoPlay() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            show(Number(dot.dataset.heroDot || 0));
            startAutoPlay();
        });
    });

    miniButtons.forEach((button) => {
        button.addEventListener("click", () => {
            show(Number(button.dataset.heroTarget || 0));
            startAutoPlay();
        });
    });

    if (prev) {
        prev.addEventListener("click", () => {
            show(activeIndex - 1);
            startAutoPlay();
        });
    }

    if (next) {
        next.addEventListener("click", () => {
            show(activeIndex + 1);
            startAutoPlay();
        });
    }

    const hero = qs(".hero-carousel");
    if (hero) {
        hero.addEventListener("mouseenter", stopAutoPlay);
        hero.addEventListener("mouseleave", startAutoPlay);
    }

    show(0);
    startAutoPlay();
}

function setupImageFallbacks() {
    qsa("img").forEach((image) => {
        image.addEventListener("error", () => {
            const frame = image.closest(".poster-frame, .compact-thumb, .detail-poster, .hero-poster");
            if (frame) {
                frame.classList.add("is-missing");
            }
            image.style.opacity = "0";
        }, { once: true });
    });
}

function setupPageFilters() {
    qsa("[data-filter-scope]").forEach((scope) => {
        const input = qs("[data-filter-input]", scope);
        const year = qs("[data-filter-year]", scope);
        const type = qs("[data-filter-type]", scope);
        const grid = scope.parentElement ? qs("[data-filter-grid]", scope.parentElement) : null;
        const count = qs("[data-filter-count]", scope);
        if (!grid) {
            return;
        }

        const cards = qsa(".movie-card", grid);

        function applyFilter() {
            const query = normalizeText(input ? input.value : "");
            const selectedYear = normalizeText(year ? year.value : "");
            const selectedType = normalizeText(type ? type.value : "");
            let visible = 0;

            cards.forEach((card) => {
                const haystack = normalizeText([
                    card.dataset.title,
                    card.dataset.year,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.genre,
                    card.dataset.category
                ].join(" "));
                const matchesQuery = !query || haystack.includes(query);
                const matchesYear = !selectedYear || normalizeText(card.dataset.year) === selectedYear;
                const matchesType = !selectedType || normalizeText(card.dataset.type) === selectedType;
                const shouldShow = matchesQuery && matchesYear && matchesType;
                card.classList.toggle("is-hidden", !shouldShow);
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = String(visible);
            }
        }

        [input, year, type].forEach((element) => {
            if (element) {
                element.addEventListener("input", applyFilter);
                element.addEventListener("change", applyFilter);
            }
        });

        applyFilter();
    });
}

function createSearchCard(movie) {
    const tags = (movie.tags || []).slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
    return `
<article class="movie-card" data-title="${escapeHtml(movie.title)}" data-year="${escapeHtml(movie.year)}" data-region="${escapeHtml(movie.region)}" data-type="${escapeHtml(movie.type)}" data-genre="${escapeHtml(movie.genre)}" data-category="${escapeHtml(movie.category)}">
    <a class="poster-frame" data-title="${escapeHtml(movie.title)}" href="${movie.url}">
        <img src="${movie.image}" alt="${escapeHtml(movie.title)}" loading="lazy">
        <span class="play-chip">播放</span>
    </a>
    <div class="movie-card-body">
        <div class="movie-meta-line">
            <a href="${movie.categoryUrl}">${escapeHtml(movie.category)}</a>
            <span>${escapeHtml(movie.year)}</span>
            <span>${escapeHtml(movie.region)}</span>
        </div>
        <h3><a href="${movie.url}">${escapeHtml(movie.title)}</a></h3>
        <p>${escapeHtml(movie.oneLine || "")}</p>
        <div class="tag-row">${tags}</div>
    </div>
</article>`;
}

function escapeHtml(value) {
    return (value || "").toString()
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function setupSearchPage() {
    const page = qs("[data-search-page]");
    if (!page || !window.MOVIE_DATA) {
        return;
    }

    const form = qs("[data-search-form]", page);
    const input = qs("[data-search-input]", page);
    const resultGrid = qs("[data-search-results]", page);
    const count = qs("[data-search-count]", page);
    const chips = qsa("[data-search-chip]", page);
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q") || "";

    function render(query) {
        const q = normalizeText(query);
        const results = window.MOVIE_DATA.filter((movie) => {
            const haystack = normalizeText([
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.category,
                (movie.tags || []).join(" "),
                movie.oneLine
            ].join(" "));
            return !q || haystack.includes(q);
        }).slice(0, 240);

        if (count) {
            count.textContent = String(results.length);
        }

        if (resultGrid) {
            resultGrid.innerHTML = results.map(createSearchCard).join("\n");
            setupImageFallbacks();
        }
    }

    if (input) {
        input.value = initialQuery;
        input.addEventListener("input", () => render(input.value));
    }

    if (form) {
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            render(input ? input.value : "");
        });
    }

    chips.forEach((chip) => {
        chip.addEventListener("click", () => {
            if (input) {
                input.value = chip.dataset.searchChip || "";
            }
            render(input ? input.value : "");
        });
    });

    render(initialQuery);
}

function setupPlayers() {
    qsa(".js-player").forEach((player) => {
        const video = qs("video", player);
        const startButton = qs(".player-start", player);
        const status = qs("[data-player-status]", player);
        const source = player.dataset.videoSrc;
        let hls = null;
        let loaded = false;

        if (!video || !source || !startButton) {
            return;
        }

        function setStatus(message) {
            if (status) {
                status.textContent = message;
            }
        }

        function loadSource() {
            if (loaded) {
                return Promise.resolve();
            }
            loaded = true;
            setStatus("正在加载 m3u8");

            return new Promise((resolve, reject) => {
                if (Hls && Hls.isSupported()) {
                    hls = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(Hls.Events.MANIFEST_PARSED, () => {
                        setStatus("已就绪");
                        resolve();
                    });
                    hls.on(Hls.Events.ERROR, (event, data) => {
                        if (data && data.fatal) {
                            setStatus("播放源加载失败");
                            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                                hls.startLoad();
                            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                                hls.recoverMediaError();
                            } else {
                                reject(data);
                            }
                        }
                    });
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    video.addEventListener("loadedmetadata", () => {
                        setStatus("已就绪");
                        resolve();
                    }, { once: true });
                    video.addEventListener("error", reject, { once: true });
                } else {
                    setStatus("当前浏览器不支持 HLS");
                    reject(new Error("HLS is not supported"));
                }
            });
        }

        async function playVideo() {
            try {
                await loadSource();
                video.controls = true;
                player.classList.add("is-playing");
                await video.play();
                setStatus("正在播放");
            } catch (error) {
                console.error(error);
                setStatus("播放失败，请更换浏览器或检查网络");
            }
        }

        startButton.addEventListener("click", playVideo);
        video.addEventListener("play", () => {
            player.classList.add("is-playing");
            setStatus("正在播放");
        });
        video.addEventListener("pause", () => setStatus("已暂停"));
        video.addEventListener("ended", () => setStatus("播放结束"));

        window.addEventListener("beforeunload", () => {
            if (hls) {
                hls.destroy();
            }
        });
    });
}

setupMobileMenu();
setupHeroCarousel();
setupImageFallbacks();
setupPageFilters();
setupSearchPage();
setupPlayers();
