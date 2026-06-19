(function () {
    var video = document.querySelector('[data-player-video]');
    var button = document.querySelector('[data-player-button]');
    var hlsInstance = null;
    var sourceLoaded = false;

    if (!video || !button) {
        return;
    }

    function loadSource() {
        var source = video.getAttribute('data-stream');

        if (sourceLoaded || !source) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            sourceLoaded = true;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            sourceLoaded = true;
            return;
        }

        video.src = source;
        sourceLoaded = true;
    }

    function startPlayback() {
        loadSource();
        video.controls = true;
        button.classList.add('is-hidden');
        video.play().catch(function () {
            button.classList.remove('is-hidden');
        });
    }

    button.addEventListener('click', startPlayback);
    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
})();
