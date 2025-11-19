export const CUSTOM_USER_AGENT =
  "Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36";

export const INJECTED_JAVASCRIPT = `
  (function() {
    // 1. Setup Subtitle Layer
    let subtitleLayer = document.getElementById('custom-subtitle-layer');
    if (!subtitleLayer) {
      subtitleLayer = document.createElement('div');
      subtitleLayer.id = 'custom-subtitle-layer';
      // Style: Match Flutter Reference (Layered Outline)
      // - Bottom: ~5-10px
      // - Font: 16px, w600
      // - Stroke: 3px black (using paint-order to keep text readable)
      subtitleLayer.style.cssText = 'position: absolute; bottom: 6px; left: 20px; right: 20px; text-align: center; color: white; font-size: 16px; font-weight: 600; font-family: sans-serif; -webkit-text-stroke: 3px black; paint-order: stroke fill; pointer-events: none; z-index: 2147483647; display: none; line-height: 1.3; letter-spacing: 0.5px;';
      document.body.appendChild(subtitleLayer);
    }

    // 2. Time Polling
    let lastTime = -1;
    setInterval(() => {
      const video = document.querySelector('video');
      if (video && !video.paused) {
        const currentTime = video.currentTime;
        if (Math.abs(currentTime - lastTime) > 0.1) {
          lastTime = currentTime;
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'currentTime',
            payload: currentTime
          }));
        }
      }
    }, 100);

    // 3. Listen for Subtitles from RN
    function handleMessage(event) {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'setSubtitle') {
          const text = data.payload;
          if (text) {
            subtitleLayer.innerText = text;
            subtitleLayer.style.display = 'block';
          } else {
            subtitleLayer.style.display = 'none';
          }
        }
      } catch (e) {}
    }

    document.addEventListener('message', handleMessage);
    window.addEventListener('message', handleMessage);

    // 4. Handle Fullscreen
    // Move subtitle layer to the fullscreen element so it stays visible
    function handleFullscreenChange() {
      const fsElement = document.fullscreenElement || document.webkitFullscreenElement;
      if (fsElement) {
        fsElement.appendChild(subtitleLayer);
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'fullscreen_open' }));
      } else {
        document.body.appendChild(subtitleLayer);
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'fullscreen_close' }));
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    // Periodic check to ensure subtitle layer is attached to the correct parent
    setInterval(() => {
       const fsElement = document.fullscreenElement || document.webkitFullscreenElement;
       const targetParent = fsElement || document.body;
       if (subtitleLayer.parentElement !== targetParent) {
         targetParent.appendChild(subtitleLayer);
       }
    }, 1000);

  })();
  true;
`;
