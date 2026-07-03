/**
 * background.js
 * =============
 * Two background systems for the Zhineng Qigong website:
 *   1. Full-viewport image crossfade slideshow with Ken Burns effect
 *   2. Three.js particle field
 *
 * Public API:  window.BackgroundManager.init()
 *              window.BackgroundManager.updateParticleColor('#RRGGBB')
 */

(function () {
  'use strict';

  /* ====================================================================
   *  1.  IMAGE CROSSFADE SLIDESHOW
   * ==================================================================== */

  // Build the image list (h01 – h32, skip h13)
  const slideImages = [];
  for (let i = 1; i <= 32; i++) {
    if (i === 13) continue; // h13 is missing
    const num = String(i).padStart(2, '0');
    slideImages.push('assets/h' + num + '.png');
  }

  /**
   * Fisher-Yates shuffle (in-place).
   */
  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * Inject a <style> block for the Ken Burns keyframes so we don't need
   * an external CSS file for this animation.
   */
  function injectKenBurnsStyles() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes kenBurns {
        0%   { transform: scale(1)   translate(0, 0); }
        50%  { transform: scale(1.05) translate(-1%, 1%); }
        100% { transform: scale(1.1)  translate(1%, -0.5%); }
      }

      .bg-slideshow {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -2;
        overflow: hidden;
        background: #0F121B;
      }

      .bg-slideshow img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        filter: brightness(0.3);
        transition: opacity 2s ease-in-out;
        will-change: opacity, transform;
        animation: kenBurns 12s ease-in-out infinite alternate;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Initialise the slideshow DOM and start cycling.
   */
  function initSlideshow() {
    injectKenBurnsStyles();
    shuffleArray(slideImages);

    // Create container
    const container = document.createElement('div');
    container.classList.add('bg-slideshow');
    document.body.prepend(container);

    // Pre-create two <img> layers for crossfade
    const imgA = document.createElement('img');
    const imgB = document.createElement('img');

    imgA.alt = '';
    imgB.alt = '';
    imgA.setAttribute('aria-hidden', 'true');
    imgB.setAttribute('aria-hidden', 'true');

    // Start both transparent until the first image loads
    imgA.style.opacity = '0';
    imgB.style.opacity = '0';

    container.appendChild(imgA);
    container.appendChild(imgB);

    let currentIndex = 0;
    let activeImg = imgA;
    let nextImg = imgB;

    /**
     * Load a given image path into an <img> element.
     * Returns a Promise that resolves to true (success) or false (error).
     */
    function loadImage(imgEl, src) {
      return new Promise(function (resolve) {
        imgEl.onload = function () { resolve(true); };
        imgEl.onerror = function () { resolve(false); }; // resolve with status
        imgEl.src = src;

        // If already cached the browser may not fire onload
        if (imgEl.complete && imgEl.naturalWidth > 0) {
          resolve(true);
        }
      });
    }

    /**
     * Crossfade to the next image in the shuffled array.
     */
    async function showNext() {
      let attempts = 0;
      let loaded = false;

      // Scan the array for the next image that loads successfully
      while (!loaded && attempts < slideImages.length) {
        currentIndex = (currentIndex + 1) % slideImages.length;
        attempts++;
        loaded = await loadImage(nextImg, slideImages[currentIndex]);
      }

      // If no image could be loaded, do not perform transition (keep current image visible)
      if (!loaded) return;

      // Restart the Ken Burns animation so each new image begins fresh
      nextImg.style.animation = 'none';
      // Force reflow
      void nextImg.offsetWidth;
      nextImg.style.animation = 'kenBurns 12s ease-in-out infinite alternate';

      // Crossfade
      activeImg.style.opacity = '0';
      nextImg.style.opacity = '1';

      // Swap roles
      const temp = activeImg;
      activeImg = nextImg;
      nextImg = temp;
    }

    // Show the first valid image immediately
    async function showFirstValid() {
      let attempts = 0;
      let loaded = false;
      while (!loaded && attempts < slideImages.length) {
        loaded = await loadImage(imgA, slideImages[currentIndex]);
        if (!loaded) {
          currentIndex = (currentIndex + 1) % slideImages.length;
          attempts++;
        }
      }
      if (loaded) {
        imgA.style.opacity = '1';
      }
    }
    showFirstValid();

    // Cycle every 8 seconds
    setInterval(showNext, 8000);
  }

  /* ====================================================================
   *  2.  THREE.JS PARTICLE SYSTEM + WIREFRAME ICOSAHEDRON
   * ==================================================================== */

  // Three.js references – populated during init
  let scene, camera, renderer;
  let particlesMesh;
  let particleMaterial;

  // Mouse tracking (normalised –1 … +1)
  const mouse = { x: 0, y: 0 };

  // Color lerping state
  let currentColor = new THREE.Color(0x00E5FF);
  let targetColor  = new THREE.Color(0x00E5FF);
  const COLOR_LERP_SPEED = 0.03;

  /**
   * Initialise the Three.js scene, camera, renderer, particles,
   * and wireframe geometry.
   */
  function initThreeScene() {
    const container = document.getElementById('canvas-container');
    if (!container) {
      console.warn('background.js: #canvas-container not found – Three.js disabled.');
      return false;
    }

    // ---- Scene & Camera ----
    scene  = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // ---- Renderer ----
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // ---- Particles ----
    const PARTICLE_COUNT = 700;
    const SPREAD = 15;

    const positions = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * SPREAD; // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * SPREAD; // z
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );

    particleMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: 0x00E5FF,
      transparent: true,
      opacity: 0.8,
      depthWrite: false
    });

    particlesMesh = new THREE.Points(particlesGeometry, particleMaterial);
    scene.add(particlesMesh);

    // ---- Wireframe Icosahedron removed per request ----

    // ---- Event Listeners ----
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('resize', onResize, false);

    return true;
  }

  /**
   * Track mouse position normalised to –1 … +1 from viewport centre.
   */
  function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth)  * 2 - 1;
    mouse.y = (event.clientY / window.innerHeight) * 2 - 1;
  }

  /**
   * Keep renderer & camera in sync with the window size.
   */
  function onResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /**
   * Main render loop.
   */
  function animate() {
    requestAnimationFrame(animate);
    if (!renderer) return;

    const elapsed = performance.now() * 0.001; // seconds



    // ---- Particles follow mouse with lerp ----
    if (particlesMesh) {
      particlesMesh.rotation.x += (mouse.y * 0.3 - particlesMesh.rotation.x) * 0.05;
      particlesMesh.rotation.y += (mouse.x * 0.3 - particlesMesh.rotation.y) * 0.05;
      particlesMesh.rotation.z = elapsed * 0.05;
    }

    // ---- Smooth color lerp ----
    if (!currentColor.equals(targetColor)) {
      currentColor.lerp(targetColor, COLOR_LERP_SPEED);

      if (particleMaterial)  particleMaterial.color.copy(currentColor);
    }

    renderer.render(scene, camera);
  }

  /* ====================================================================
   *  PUBLIC API
   * ==================================================================== */

  /**
   * Change the particle & wireframe color with a smooth transition.
   * @param {string} hex  – CSS hex colour, e.g. '#D4A574'
   */
  function updateParticleColor(hex) {
    if (!hex) return;
    // Accept with or without leading '#'
    const sanitised = hex.charAt(0) === '#' ? hex : '#' + hex;
    targetColor = new THREE.Color(sanitised);
  }

  /**
   * Bootstrap everything.
   */
  function init() {
    // 1. Image slideshow
    initSlideshow();

    // 2. Three.js scene
    const threeOk = initThreeScene();

    // 3. Start animation loop (only if Three.js initialised)
    if (threeOk) {
      animate();
    }
  }

  // Expose on the global scope
  window.BackgroundManager = {
    init: init,
    updateParticleColor: updateParticleColor
  };
})();
