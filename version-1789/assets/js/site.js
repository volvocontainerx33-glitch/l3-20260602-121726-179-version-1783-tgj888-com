(function() {
  var menuButton = document.querySelector('[data-menu-button]');
  var navLinks = document.querySelector('[data-nav-links]');

  if (menuButton && navLinks) {
    menuButton.addEventListener('click', function() {
      navLinks.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function(dot, dotIndex) {
      dot.addEventListener('click', function() {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      setInterval(function() {
        showSlide(index + 1);
      }, 5200);
    }
  }

  var filterRoot = document.querySelector('[data-filter-root]');

  if (filterRoot) {
    var searchInput = filterRoot.querySelector('[data-search-input]');
    var typeSelect = filterRoot.querySelector('[data-type-filter]');
    var sortSelect = filterRoot.querySelector('[data-sort-filter]');
    var grid = filterRoot.querySelector('[data-card-grid]');
    var empty = filterRoot.querySelector('[data-no-results]');

    if (grid) {
      var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

      function normalize(value) {
        return String(value || '').toLowerCase().trim();
      }

      function applyFilters() {
        var keyword = normalize(searchInput && searchInput.value);
        var type = typeSelect ? typeSelect.value : 'all';
        var visible = 0;

        cards.forEach(function(card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' '));
          var typeMatch = type === 'all' || card.getAttribute('data-type-group') === type;
          var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
          var show = typeMatch && keywordMatch;

          card.style.display = show ? '' : 'none';

          if (show) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      function applySort() {
        if (!sortSelect) {
          applyFilters();
          return;
        }

        var mode = sortSelect.value;
        var sorted = cards.slice().sort(function(a, b) {
          var yearA = Number(a.getAttribute('data-year')) || 0;
          var yearB = Number(b.getAttribute('data-year')) || 0;
          var titleA = a.getAttribute('data-title') || '';
          var titleB = b.getAttribute('data-title') || '';

          if (mode === 'year-asc') {
            return yearA - yearB || titleA.localeCompare(titleB, 'zh-Hans-CN');
          }

          if (mode === 'title') {
            return titleA.localeCompare(titleB, 'zh-Hans-CN');
          }

          return yearB - yearA || titleA.localeCompare(titleB, 'zh-Hans-CN');
        });

        sorted.forEach(function(card) {
          grid.appendChild(card);
        });

        cards = sorted;
        applyFilters();
      }

      if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
      }

      if (typeSelect) {
        typeSelect.addEventListener('change', applyFilters);
      }

      if (sortSelect) {
        sortSelect.addEventListener('change', applySort);
      }

      applySort();
    }
  }
})();
