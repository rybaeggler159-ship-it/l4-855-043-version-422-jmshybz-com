(function () {
  var toggle = document.querySelector('.mobile-toggle');
  var menu = document.querySelector('.mobile-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var active = 0;
  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    active = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === active);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === active);
    });
  }
  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
    });
  });
  if (slides.length > 1) {
    setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
  panels.forEach(function (panel) {
    var search = panel.querySelector('.movie-search');
    var selects = Array.prototype.slice.call(panel.querySelectorAll('.filter-select'));
    var cards = Array.prototype.slice.call(panel.querySelectorAll('.filter-item'));
    var empty = panel.querySelector('.empty-state');
    function filterCards() {
      var term = search ? search.value.trim().toLowerCase() : '';
      var values = {};
      selects.forEach(function (select) {
        var key = select.getAttribute('data-filter');
        if (key) {
          values[key] = select.value;
        }
      });
      var visible = 0;
      cards.forEach(function (card) {
        var ok = true;
        if (term && (card.getAttribute('data-search') || '').toLowerCase().indexOf(term) === -1) {
          ok = false;
        }
        Object.keys(values).forEach(function (key) {
          if (values[key] && (card.getAttribute('data-' + key) || '') !== values[key]) {
            ok = false;
          }
        });
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }
    if (search) {
      search.addEventListener('input', filterCards);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', filterCards);
    });
  });
})();
