import { H as Hls } from './video-vendor-dru42stk.js';

export function initializePlayer(streamUrl) {
  const root = document.querySelector('[data-player-root]');

  if (!root) {
    return;
  }

  const video = root.querySelector('video');
  const overlay = root.querySelector('[data-player-overlay]');
  let hlsInstance = null;
  let started = false;

  const revealVideo = () => {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  };

  const startNative = () => {
    video.src = streamUrl;
    video.play().then(revealVideo).catch(() => {
      if (overlay) {
        overlay.classList.remove('is-hidden');
      }
    });
  };

  const startWithHls = () => {
    if (!hlsInstance) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MEDIA_ATTACHED, () => {
        hlsInstance.loadSource(streamUrl);
      });
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().then(revealVideo).catch(() => {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      });
    } else {
      video.play().then(revealVideo).catch(() => {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }
  };

  const startPlayer = () => {
    started = true;
    revealVideo();

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      startNative();
      return;
    }

    if (Hls.isSupported()) {
      startWithHls();
      return;
    }

    video.src = streamUrl;
    video.play().catch(() => {
      if (overlay) {
        overlay.classList.remove('is-hidden');
      }
    });
  };

  if (overlay) {
    overlay.addEventListener('click', startPlayer);
  }

  video.addEventListener('click', () => {
    if (!started) {
      startPlayer();
      return;
    }

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', revealVideo);
}
