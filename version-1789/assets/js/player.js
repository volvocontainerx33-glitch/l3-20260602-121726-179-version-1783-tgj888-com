import { H as Hls } from './hls.js';

function startPlayer(shell) {
  var video = shell.querySelector('video');
  var button = shell.querySelector('.play-cover');

  if (!video || !button) {
    return;
  }

  var stream = video.getAttribute('data-stream');
  var loaded = false;

  function loadStream() {
    if (loaded || !stream) {
      return;
    }

    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      return;
    }

    if (Hls && Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false
      });

      hls.loadSource(stream);
      hls.attachMedia(video);
      shell.hlsPlayer = hls;
      return;
    }

    video.src = stream;
  }

  function playVideo() {
    loadStream();
    button.classList.add('is-hidden');

    var result = video.play();

    if (result && typeof result.catch === 'function') {
      result.catch(function() {
        button.classList.remove('is-hidden');
      });
    }
  }

  button.addEventListener('click', playVideo);

  video.addEventListener('click', function() {
    if (video.paused) {
      playVideo();
    }
  });

  video.addEventListener('play', function() {
    button.classList.add('is-hidden');
  });
}

document.querySelectorAll('.video-shell').forEach(startPlayer);
