function initPlayer(streamUrl) {
  var video = document.getElementById('moviePlayer');
  var cover = document.getElementById('playerStart');
  if (!video || !cover || !streamUrl) {
    return;
  }

  var attached = false;
  var hlsInstance = null;

  function attach() {
    if (attached) {
      return;
    }
    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = streamUrl;
  }

  function play() {
    attach();
    cover.classList.add('is-hidden');
    var task = video.play();
    if (task && typeof task.catch === 'function') {
      task.catch(function () {
        cover.classList.remove('is-hidden');
      });
    }
  }

  cover.addEventListener('click', play);
  video.addEventListener('click', function () {
    if (!attached) {
      play();
    }
  });
  video.addEventListener('play', function () {
    cover.classList.add('is-hidden');
  });
  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
