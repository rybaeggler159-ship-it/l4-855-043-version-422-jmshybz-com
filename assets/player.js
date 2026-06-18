(function () {
  function startPlayer(box) {
    var video = box.querySelector('video');
    var overlay = box.querySelector('.play-overlay');
    if (!video || !overlay) {
      return;
    }
    var source = video.getAttribute('data-src');
    function attachSource() {
      if (video.getAttribute('data-ready') === '1') {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
        hls.loadSource(source);
        hls.attachMedia(video);
        video._hls = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
      video.setAttribute('data-ready', '1');
    }
    function playVideo() {
      attachSource();
      overlay.classList.add('is-hidden');
      video.controls = true;
      var attempt = video.play();
      if (attempt && attempt.catch) {
        attempt.catch(function () {
          overlay.classList.remove('is-hidden');
        });
      }
    }
    overlay.addEventListener('click', playVideo);
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });
  }
  Array.prototype.slice.call(document.querySelectorAll('.video-box')).forEach(startPlayer);
})();
