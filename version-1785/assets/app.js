document.addEventListener("DOMContentLoaded", function() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (toggle && mobileNav) {
        toggle.addEventListener("click", function() {
            mobileNav.classList.toggle("open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    function setSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function(slide, i) {
            slide.classList.toggle("active", i === current);
        });
        dots.forEach(function(dot, i) {
            dot.classList.toggle("active", i === current);
        });
    }
    dots.forEach(function(dot, i) {
        dot.addEventListener("click", function() {
            setSlide(i);
        });
    });
    if (slides.length > 1) {
        setInterval(function() {
            setSlide(current + 1);
        }, 5200);
    }
    setSlide(0);

    var searchInput = document.querySelector("[data-search-input]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search]"));
    var empty = document.querySelector("[data-empty-note]");
    if (searchInput && cards.length) {
        searchInput.addEventListener("input", function() {
            var value = searchInput.value.trim().toLowerCase();
            var shown = 0;
            cards.forEach(function(card) {
                var text = (card.getAttribute("data-search") || "").toLowerCase();
                var matched = !value || text.indexOf(value) !== -1;
                card.style.display = matched ? "" : "none";
                if (matched) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.style.display = shown ? "none" : "block";
            }
        });
    }
});

function initMoviePlayer(source) {
    var video = document.getElementById("movieVideo");
    var button = document.getElementById("playerStart");
    var box = document.getElementById("playerBox");
    if (!video || !button || !box || !source) {
        return;
    }
    var ready = false;
    function attachSource() {
        if (ready) {
            return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            ready = true;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls();
            hls.loadSource(source);
            hls.attachMedia(video);
            ready = true;
            return;
        }
        video.src = source;
        ready = true;
    }
    function startPlayback() {
        attachSource();
        box.classList.add("is-playing");
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function() {
                box.classList.remove("is-playing");
            });
        }
    }
    button.addEventListener("click", startPlayback);
    box.addEventListener("click", function(event) {
        if (event.target === video && video.paused) {
            startPlayback();
        }
    });
    video.addEventListener("play", function() {
        box.classList.add("is-playing");
    });
    video.addEventListener("pause", function() {
        if (!video.seeking && video.currentTime === 0) {
            box.classList.remove("is-playing");
        }
    });
}
