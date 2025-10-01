(function() {
  // Prevent the script from running multiple times
  if (window.hasRunStats) {
    return;
  }
  window.hasRunStats = true;

  // Function to create and inject the stats overlay HTML
  function injectStatsOverlay() {
    const statsHTML = `
      <div id="stats">
        <div class="stat">
          <div class="label">FPS</div>
          <div id="fps" class="value">0</div>
        </div>
        <div class="stat">
          <div class="label">CPU</div>
          <div id="cpu" class="value">0 ms</div>
        </div>
        <div class="stat">
          <div class="label">GPU</div>
          <div id="gpu" class="value">0 ms</div>
        </div>
      </div>
    `;
    const statsElement = document.createElement('div');
    statsElement.innerHTML = statsHTML;
    document.body.appendChild(statsElement);
  }

  // A simple class to manage the stats overlay
  class MiniStats {
    constructor() {
      // Create and inject the HTML first
      injectStatsOverlay();

      // Get HTML elements
      this.fpsElement = document.getElementById('fps');
      this.cpuElement = document.getElementById('cpu');
      this.gpuElement = document.getElementById('gpu');

      // Stats variables
      this.lastFrameTime = performance.now();
      this.frameTimes = [];
      this.cpuTime = 0;
      this.gpuTime = 0;

      // GPU timer query (WebGL2 only). Requires accessing the page's WebGL context.
      // This is the tricky part. Content scripts cannot directly access page variables.
      // You may need to use a more complex injection method or message passing.
      this.gpuTimer = null;
      this.isGpuTimerSupported = false;
      this.gl = null; // Cannot easily get the page's context here.

      // Initialize the main animation loop
      this.loop = this.loop.bind(this);
      requestAnimationFrame(this.loop);

      // We need to inject a script tag to get the GL context and GPU data.
      this.injectGpuScript();
    }

    injectGpuScript() {
      const script = document.createElement('script');
      script.textContent = `
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2');

        if (gl) {
          const isGpuTimerSupported = gl.getExtension('EXT_disjoint_timer_query_webgl2');
          if (isGpuTimerSupported) {
            window.postMessage({ type: 'GPU_TIMER_SUPPORT', supported: true }, '*');
          } else {
            window.postMessage({ type: 'GPU_TIMER_SUPPORT', supported: false }, '*');
          }
        }
      `;
      document.head.appendChild(script);
      script.remove(); // Clean up the injected script tag.
    }

    loop(timestamp) {
      const frameStartTime = performance.now();

      // 1. **Measure FPS**
      this.frameTimes.push(timestamp);
      while (this.frameTimes.length > 60) {
        this.frameTimes.shift();
      }
      const duration = this.frameTimes[this.frameTimes.length - 1] - this.frameTimes[0];
      const fps = Math.round(this.frameTimes.length / (duration / 1000));
      this.fpsElement.textContent = fps;

      // 2. **Measure CPU Time**
      // The CPU time will be a bit inflated by the browser extension's overhead.
      this.cpuTime = performance.now() - frameStartTime;
      this.cpuElement.textContent = this.cpuTime.toFixed(2) + ' ms';

      // 3. **GPU Time (requires communication)**
      // For a more complete solution, you would need to use `window.postMessage`
      // to communicate with an injected page script that has access to the
      // WebGL/WebGPU context, as a content script cannot access it directly.

      // Continue the loop
      requestAnimationFrame(this.loop);
    }
  }

  // Start the stats monitor
  new MiniStats();
})();
