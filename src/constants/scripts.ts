export const CUSTOM_USER_AGENT =
  "Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36";

export const INJECTED_JAVASCRIPT = `
  (function() {
    // Cache DOM references
    let subtitleLayer = null;
    let cachedVideo = null;
    let lastTime = -1;
    let lastSubtitle = '';
    let timePollingId = null;
    let parentCheckId = null;

    // 1. Setup Subtitle Layer (optimized)
    function initSubtitleLayer() {
      if (subtitleLayer) return subtitleLayer;
      subtitleLayer = document.getElementById('custom-subtitle-layer');
      if (!subtitleLayer) {
        subtitleLayer = document.createElement('div');
        subtitleLayer.id = 'custom-subtitle-layer';
        subtitleLayer.style.cssText = 'position:absolute;bottom:8px;left:16px;right:16px;text-align:center;color:#FFF;font-size:15px;font-weight:600;font-family:system-ui,sans-serif;text-shadow:0 1px 3px rgba(0,0,0,.9),-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,1px 1px 0 #000;pointer-events:none;z-index:2147483647;display:none;line-height:1.5;will-change:contents;contain:content';
        document.body.appendChild(subtitleLayer);
      }
      return subtitleLayer;
    }

    // 2. Optimized video element finder with caching
    function getVideo() {
      if (cachedVideo && document.contains(cachedVideo)) return cachedVideo;
      cachedVideo = document.querySelector('video');
      return cachedVideo;
    }

    // 3. Time Polling - optimized with requestAnimationFrame fallback
    function startTimePolling() {
      if (timePollingId) return;
      
      const poll = () => {
        const video = getVideo();
        if (video && !video.paused) {
          const t = video.currentTime;
          if (Math.abs(t - lastTime) > 0.15) {
            lastTime = t;
            window.ReactNativeWebView.postMessage('{"type":"currentTime","payload":' + t + '}');
          }
        }
      };
      
      timePollingId = setInterval(poll, 150);
    }

    // 4. Listen for Subtitles from RN (optimized)
    function handleMessage(e) {
      try {
        const d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (d.type === 'setSubtitle' && d.payload !== lastSubtitle) {
          lastSubtitle = d.payload;
          const layer = initSubtitleLayer();
          if (d.payload) {
            layer.textContent = d.payload;
            layer.style.display = 'block';
          } else {
            layer.style.display = 'none';
          }
        }
      } catch (e) {}
    }

    document.addEventListener('message', handleMessage, { passive: true });
    window.addEventListener('message', handleMessage, { passive: true });

    // 5. Handle Fullscreen (optimized)
    function handleFullscreenChange() {
      const fs = document.fullscreenElement || document.webkitFullscreenElement;
      const layer = initSubtitleLayer();
      if (fs) {
        fs.appendChild(layer);
        window.ReactNativeWebView.postMessage('{"type":"fullscreen_open"}');
      } else {
        document.body.appendChild(layer);
        window.ReactNativeWebView.postMessage('{"type":"fullscreen_close"}');
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange, { passive: true });
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange, { passive: true });

    // 6. Parent check - less frequent
    parentCheckId = setInterval(() => {
      const fs = document.fullscreenElement || document.webkitFullscreenElement;
      const target = fs || document.body;
      const layer = initSubtitleLayer();
      if (layer.parentElement !== target) {
        target.appendChild(layer);
      }
    }, 2000);

    // Initialize
    initSubtitleLayer();
    startTimePolling();

  })();
  true;
`;
