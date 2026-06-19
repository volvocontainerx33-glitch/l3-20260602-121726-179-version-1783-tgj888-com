(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function htmlEscape(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function setupMenu() {
    var toggle = qs("[data-menu-toggle]");
    var menu = qs("[data-site-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupForms() {
    qsa(".site-search").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = qs("input[name='q']", form);
        var query = input ? input.value.trim() : "";
        var action = form.getAttribute("action") || "./search.html";
        if (query) {
          window.location.href = action + "?q=" + encodeURIComponent(query);
        } else {
          window.location.href = action;
        }
      });
    });
  }

  function setupHero() {
    var root = qs("[data-hero]");
    if (!root) {
      return;
    }
    var slides = qsa(".hero-slide", root);
    var dots = qsa(".hero-dots button", root);
    var previous = qs("[data-hero-prev]", root);
    var next = qs("[data-hero-next]", root);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
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

    if (slides.length <= 1) {
      return;
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    if (previous) {
      previous.addEventListener("click", function () {
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

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    start();
  }

  function renderMovieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + htmlEscape(tag) + "</span>";
    }).join("");

    return [
      "<article class=\"movie-card\">",
      "  <a class=\"movie-cover\" href=\"" + htmlEscape(movie.url) + "\" aria-label=\"" + htmlEscape(movie.title) + " 在线观看\">",
      "    <img src=\"" + htmlEscape(movie.cover) + "\" alt=\"" + htmlEscape(movie.title) + "\" loading=\"lazy\">",
      "    <span class=\"movie-badge\">" + htmlEscape(movie.region) + "</span>",
      "    <span class=\"play-mark\">▶</span>",
      "  </a>",
      "  <div class=\"movie-card-body\">",
      "    <h3><a href=\"" + htmlEscape(movie.url) + "\">" + htmlEscape(movie.title) + "</a></h3>",
      "    <p>" + htmlEscape(movie.oneLine) + "</p>",
      "    <div class=\"movie-meta\"><span>" + htmlEscape(movie.type) + "</span><span>" + htmlEscape(movie.year) + "</span></div>",
      "    <div class=\"tag-list\">" + tags + "</div>",
      "  </div>",
      "</article>"
    ].join("");
  }

  function setupSearchPage() {
    var results = qs("[data-search-results]");
    if (!results || !window.SEARCH_MOVIES) {
      return;
    }

    var searchInput = qs("[data-search-input]");
    var regionSelect = qs("[data-filter-region]");
    var typeSelect = qs("[data-filter-type]");
    var yearSelect = qs("[data-filter-year]");
    var summary = qs("[data-search-summary]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (searchInput) {
      searchInput.value = initialQuery;
    }

    function fillSelect(select, values, label) {
      if (!select) {
        return;
      }
      select.innerHTML = "<option value=\"\">" + label + "</option>" + values.map(function (value) {
        return "<option value=\"" + htmlEscape(value) + "\">" + htmlEscape(value) + "</option>";
      }).join("");
    }

    function uniqueValues(key) {
      var seen = {};
      window.SEARCH_MOVIES.forEach(function (movie) {
        if (movie[key]) {
          seen[movie[key]] = true;
        }
      });
      return Object.keys(seen).sort();
    }

    fillSelect(regionSelect, uniqueValues("region"), "全部地区");
    fillSelect(typeSelect, uniqueValues("type"), "全部类型");
    fillSelect(yearSelect, uniqueValues("year").reverse().slice(0, 40), "全部年份");

    function filterMovies() {
      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var region = regionSelect ? regionSelect.value : "";
      var type = typeSelect ? typeSelect.value : "";
      var year = yearSelect ? yearSelect.value : "";

      var filtered = window.SEARCH_MOVIES.filter(function (movie) {
        var text = [movie.title, movie.oneLine, movie.summary, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(" ")].join(" ").toLowerCase();
        if (keyword && text.indexOf(keyword) === -1) {
          return false;
        }
        if (region && movie.region !== region) {
          return false;
        }
        if (type && movie.type !== type) {
          return false;
        }
        if (year && movie.year !== year) {
          return false;
        }
        return true;
      });

      if (summary) {
        summary.textContent = filtered.length ? "已匹配到相关影片" : "未找到匹配影片";
      }

      if (!filtered.length) {
        results.innerHTML = "<div class=\"empty-state\">没有找到相关影片</div>";
        return;
      }

      results.innerHTML = filtered.slice(0, 160).map(renderMovieCard).join("");
    }

    [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (node) {
      if (node) {
        node.addEventListener("input", filterMovies);
        node.addEventListener("change", filterMovies);
      }
    });

    var form = qs("[data-search-page-form]");
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        filterMovies();
      });
    }

    filterMovies();
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupForms();
    setupHero();
    setupSearchPage();
  });
})();
