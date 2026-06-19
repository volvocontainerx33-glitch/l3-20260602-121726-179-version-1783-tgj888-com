(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.main-nav');

    if (menuButton && nav) {
        menuButton.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(current + 1);
        }, 6200);
    }

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
    }

    function filterCards(form, query) {
        var scope = form.closest('main') || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
        var status = scope.querySelector('.filter-status');
        var keyword = normalize(query);
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute('data-search'));
            var matched = !keyword || haystack.indexOf(keyword) !== -1;
            card.classList.toggle('is-hidden', !matched);
            if (matched) {
                visible += 1;
            }
        });

        if (status) {
            status.textContent = keyword ? '已筛选出相关影片' : '';
        }
    }

    function renderQuickResults(form, query) {
        var holder = document.querySelector('.quick-search-results');
        if (!holder || !window.SITE_MOVIES) {
            return;
        }

        var keyword = normalize(query);
        holder.innerHTML = '';

        if (!keyword) {
            return;
        }

        var matches = window.SITE_MOVIES.filter(function (movie) {
            var haystack = normalize(movie.title + ' ' + movie.year + ' ' + movie.region + ' ' + movie.type + ' ' + movie.genre + ' ' + movie.category);
            return haystack.indexOf(keyword) !== -1;
        }).slice(0, 12);

        if (!matches.length) {
            holder.innerHTML = '<p class="search-empty">未找到相关影片</p>';
            return;
        }

        holder.innerHTML = matches.map(function (movie) {
            var nested = window.location.pathname.indexOf('/movies/') !== -1;
            var link = nested ? '../' + movie.url : movie.url;
            var poster = nested ? '../' + movie.poster : movie.poster;

            return '<a class="quick-result" href="' + link + '">' +
                '<img src="' + poster + '" alt="' + movie.title.replace(/"/g, '&quot;') + '">' +
                '<span><strong>' + movie.title + '</strong><em>' + movie.year + ' · ' + movie.region + ' · ' + movie.genre + '</em></span>' +
                '</a>';
        }).join('');
    }

    Array.prototype.slice.call(document.querySelectorAll('.site-search')).forEach(function (form) {
        var input = form.querySelector('input[type="search"]');

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var query = input ? input.value : '';
            filterCards(form, query);
            renderQuickResults(form, query);
        });

        if (input) {
            input.addEventListener('input', function () {
                if (form.classList.contains('inline-filter') || document.querySelector('.quick-search-results')) {
                    filterCards(form, input.value);
                    renderQuickResults(form, input.value);
                }
            });
        }
    });
})();
