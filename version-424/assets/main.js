(() => {
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', () => {
      mobilePanel.classList.toggle('is-open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let heroIndex = 0;

  const showHero = (index) => {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, current) => {
      slide.classList.toggle('is-active', current === heroIndex);
    });

    dots.forEach((dot, current) => {
      dot.classList.toggle('is-active', current === heroIndex);
    });
  };

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const index = Number(dot.getAttribute('data-hero-dot')) || 0;
      showHero(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(() => {
      showHero(heroIndex + 1);
    }, 6500);
  }

  const normalize = (value) => String(value || '').trim().toLowerCase();

  const initializeFilter = () => {
    const input = document.querySelector('[data-filter-input]');
    const list = document.querySelector('[data-card-list]');
    const emptyState = document.querySelector('[data-empty-state]');
    const sortControl = document.querySelector('[data-sort-control]');

    if (!list) {
      return;
    }

    const cards = Array.from(list.querySelectorAll('.movie-card'));

    const applyFilter = () => {
      const query = normalize(input ? input.value : '');
      let visibleCount = 0;

      cards.forEach((card) => {
        const haystack = normalize(card.getAttribute('data-search'));
        const matched = !query || haystack.includes(query);
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visibleCount === 0);
      }
    };

    const applySort = () => {
      const value = sortControl ? sortControl.value : 'default';
      const sorted = cards.slice().sort((a, b) => {
        if (value === 'views') {
          return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
        }

        if (value === 'year') {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        }

        if (value === 'title') {
          return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-Hans-CN');
        }

        return Number(a.dataset.index || 0) - Number(b.dataset.index || 0);
      });

      sorted.forEach((card) => list.appendChild(card));
      applyFilter();
    };

    if (input) {
      const params = new URLSearchParams(window.location.search);
      const searchValue = params.get('search');
      if (searchValue) {
        input.value = searchValue;
      }

      input.addEventListener('input', applyFilter);
      applyFilter();
    }

    if (sortControl) {
      sortControl.addEventListener('change', applySort);
    }
  };

  initializeFilter();
})();
