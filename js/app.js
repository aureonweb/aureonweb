/**
 * ============================================================
 *  app.js — Main Application Logic
 *  Zhineng Qigong · Indira-Web
 * ============================================================
 *  Orchestrates:
 *    • Profile system (aureon / hui / indira-y-hui)
 *    • Component initialization
 *    • I18n integration
 *    • Background particle manager integration
 *    • localStorage persistence
 * ============================================================
 */

window.App = {

  /** @type {'aureon'|'hui'|'indira-y-hui'} */
  currentProfile: 'hui',

  /** Profile color map used for particles & accents. */
  _profileColors: {
    'aureon':       '#D4A574',
    'hui':          '#6c917d',
    'indira-y-hui': '#9B7FBF'
  },

  /* ─────────────────────────────────────────────
     Initialization
     ───────────────────────────────────────────── */

  /**
   * Bootstrap the entire application.
   * Called on DOMContentLoaded.
   */
  init: function () {
    // 1. Load saved profile from localStorage (or fall back to default)
    var savedProfile = null;
    try {
      savedProfile = localStorage.getItem('znqg-profile');
    } catch (_e) {
      // localStorage may be blocked — ignore silently
    }

    if (savedProfile && this._profileColors.hasOwnProperty(savedProfile)) {
      this.currentProfile = savedProfile;
    }

    // 2. Initialize I18n (translation system)
    if (window.I18n && typeof window.I18n.init === 'function') {
      try {
        window.I18n.init();
      } catch (err) {
        console.warn('[App] I18n initialization failed:', err);
      }
    }

    // 3. Initialize BackgroundManager (particles / canvas)
    if (window.BackgroundManager && typeof window.BackgroundManager.init === 'function') {
      try {
        window.BackgroundManager.init();
      } catch (err) {
        console.warn('[App] BackgroundManager initialization failed:', err);
      }
    }

    // 4. Initialize all UI Components
    this._initComponents();

    // 5. Set up profile switcher event listeners
    this._bindProfileSwitchers();

    // 6. Apply the initial profile (updates DOM, particles, hero, etc.)
    this.setProfile(this.currentProfile);

    // 7. Listen for hash changes for section navigation
    this._bindHashNavigation();

    // 8. Initialize AOS (Animate On Scroll)
    this._initAOS();

    // 9. Initialize GSAP ScrollTrigger animations
    this._initGSAP();

    // 10. Bind language toggle switches
    this._bindLangToggles();

    // Dev convenience log
    console.info('[App] Initialized with profile:', this.currentProfile);
  },

  /* ─────────────────────────────────────────────
     Profile Management
     ───────────────────────────────────────────── */

  /**
   * Switch to a new profile.
   * @param {'aureon'|'hui'|'indira-y-hui'} profileName
   */
  setProfile: function (profileName) {
    // Guard: only accept known profiles
    if (!this._profileColors.hasOwnProperty(profileName)) {
      console.warn('[App] Unknown profile:', profileName);
      return;
    }

    this.currentProfile = profileName;

    // 1. Update data-profile attribute on <body>
    document.body.setAttribute('data-profile', profileName);

    // 2. Update .profile-btn active states
    var profileBtns = document.querySelectorAll('.profile-btn');
    profileBtns.forEach(function (btn) {
      var btnProfile = btn.getAttribute('data-profile');
      if (btnProfile === profileName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // 3. Persist to localStorage
    try {
      localStorage.setItem('znqg-profile', profileName);
    } catch (_e) {
      // Silently fail if localStorage is unavailable
    }

    // 4. Update hero content based on profile
    this._updateHeroContent(profileName);

    // 5. Update particle colors via BackgroundManager
    var color = this._profileColors[profileName];
    if (window.BackgroundManager && typeof window.BackgroundManager.updateParticleColor === 'function') {
      try {
        window.BackgroundManager.updateParticleColor(color);
      } catch (err) {
        console.warn('[App] BackgroundManager.updateParticleColor failed:', err);
      }
    }

    // 6. Update hero title using I18n translation
    this._setHeroTitle(profileName);

    // 7. Dispatch custom event so other modules can react
    var event;
    try {
      event = new CustomEvent('profileChanged', {
        detail: { profile: profileName, color: color }
      });
    } catch (_e) {
      // IE11 fallback
      event = document.createEvent('CustomEvent');
      event.initCustomEvent('profileChanged', true, true, {
        profile: profileName,
        color: color
      });
    }
    document.dispatchEvent(event);
  },

  /* ─────────────────────────────────────────────
     Private Helpers
     ───────────────────────────────────────────── */

  /**
   * Initialize every Component module that is available.
   * @private
   */
  _initComponents: function () {
    var C = window.Components;
    if (!C) return;

    var modules = [
      'initFAQ',
      'initTestimonials',
      'initContactForm',
      'initSmoothScroll',
      'initHeader',
      'initMobileMenu',
      'initPromotionsBanner'
    ];

    modules.forEach(function (fn) {
      if (typeof C[fn] === 'function') {
        try {
          C[fn]();
        } catch (err) {
          console.warn('[App] Component ' + fn + ' failed:', err);
        }
      }
    });
  },

  /**
   * Bind click listeners to all .profile-btn elements.
   * @private
   */
  _bindProfileSwitchers: function () {
    var self = this;
    var btns = document.querySelectorAll('.profile-btn, .profile-btn-link');

    btns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var target = btn.getAttribute('data-profile');
        if (target) {
          // 1. Apply the new profile layout first (so we transition "starting in that selected profile")
          self.setProfile(target);

          // 2. Reset GSAP hero content states to ensure it is visible and not hidden by ScrollTrigger
          var heroContent = document.querySelector('.hero-content');
          if (heroContent && typeof gsap !== 'undefined') {
            gsap.killTweensOf(heroContent);
            gsap.killTweensOf(heroContent.children);
            gsap.set(heroContent, { y: 0, opacity: 1 });
            gsap.set(heroContent.children, { y: 0, opacity: 1 });
          }

          // 3. Close mobile menu if open
          var mobileNav = document.querySelector('.mobile-nav');
          var mobileOverlay = document.querySelector('.mobile-overlay');
          if (mobileNav && mobileNav.classList.contains('open')) {
            mobileNav.classList.remove('open');
          }
          if (mobileOverlay && mobileOverlay.classList.contains('open')) {
            mobileOverlay.classList.remove('open');
          }
          document.body.style.overflow = '';

          // 4. Scroll to the top of the page smoothly
          window.scrollTo({ top: 0, behavior: 'smooth' });

          // 5. Refresh ScrollTrigger and AOS ONLY after we reach the top (scrollY === 0).
          // This prevents layout calculations from interrupting and stalling the smooth scroll.
          if (window.scrollY === 0) {
            if (typeof ScrollTrigger !== 'undefined') {
              ScrollTrigger.refresh();
            }
            if (typeof AOS !== 'undefined') {
              AOS.refresh();
            }
          } else {
            var limitTimeout = setTimeout(function () {
              window.removeEventListener('scroll', onScrollEnded);
              if (typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.refresh();
              }
              if (typeof AOS !== 'undefined') {
                AOS.refresh();
              }
            }, 2500); // 2.5 seconds safety fallback

            var onScrollEnded = function () {
              if (window.scrollY === 0) {
                window.removeEventListener('scroll', onScrollEnded);
                clearTimeout(limitTimeout);
                
                // Small extra delay to make sure rendering is settled
                setTimeout(function () {
                  if (typeof ScrollTrigger !== 'undefined') {
                    ScrollTrigger.refresh();
                  }
                  if (typeof AOS !== 'undefined') {
                    AOS.refresh();
                  }
                }, 50);
              }
            };
            window.addEventListener('scroll', onScrollEnded);
          }
        }
      });
    });
  },

  /**
   * Handle hash-based navigation on load and on hashchange.
   * @private
   */
  _bindHashNavigation: function () {
    var _navigate = function () {
      var hash = window.location.hash;
      if (!hash) return;

      var target = document.querySelector(hash);
      if (!target) return;

      // Small delay to allow the page to render first
      setTimeout(function () {
        var headerOffset = 80;
        var position = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        window.scrollTo({ top: position, behavior: 'smooth' });
      }, 100);
    };

    // On initial load
    if (window.location.hash) {
      _navigate();
    }

    // On hash change
    window.addEventListener('hashchange', _navigate);
  },

  /**
   * Update data-i18n attributes on the hero section
   * to match the selected profile.
   * @param {string} profileName
   * @private
   */
  _updateHeroContent: function (profileName) {
    // Use attribute-starts-with selector to match "hero.title.xxx" regardless of current profile
    var heroTitle = document.getElementById('hero-title') ||
                    document.querySelector('[data-i18n^="hero.title."]');

    if (heroTitle) {
      heroTitle.setAttribute('data-i18n', 'hero.title.' + profileName);
    }
  },

  /**
   * Set the hero title innerHTML using the I18n module.
   * Falls back to a simple text map if I18n is unavailable.
   * @param {string} profileName
   * @private
   */
  _setHeroTitle: function (profileName) {
    var heroTitleEl = document.querySelector('.hero-title, #hero-title, [data-i18n*="hero.title"]');
    if (!heroTitleEl) return;

    // Attempt to use I18n for the translation
    if (window.I18n && typeof window.I18n.t === 'function') {
      var translated = window.I18n.t('hero.title.' + profileName);
      if (translated && translated !== 'hero.title.' + profileName) {
        heroTitleEl.innerHTML = translated;
        return;
      }
    }

    // Fallback: static title map
    var _titles = {
      'aureon':       'AUREON<br><span class="subtitle">El Campo Interior</span>',
      'hui':          'HUI<br><span class="subtitle">ZhìNéng QìGōng</span>',
      'indira-y-hui': 'INDIRA & HUI<br><span class="subtitle">El Algoritmo Ancestral</span>'
    };

    heroTitleEl.innerHTML = _titles[profileName] || '';
  },

  /* ─────────────────────────────────────────────
     Language Toggle (pill switch)
     ───────────────────────────────────────────── */

  /**
   * Bind click events on .lang-toggle-option buttons.
   * Syncs both hero and mobile toggles.
   * @private
   */
  _bindLangToggles: function () {
    var self = this;
    var allToggles = document.querySelectorAll('.lang-toggle');
    var allOptions = document.querySelectorAll('.lang-toggle-option');

    allOptions.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var lang = btn.getAttribute('data-lang');
        if (!lang) return;

        // Update all toggle options across hero + mobile
        allOptions.forEach(function (b) {
          b.classList.toggle('active', b.getAttribute('data-lang') === lang);
        });

        // Slide the toggle indicator
        allToggles.forEach(function (toggle) {
          toggle.classList.toggle('en', lang === 'en');
        });

        // Change language via I18n
        if (window.I18n && typeof window.I18n.setLang === 'function') {
          window.I18n.setLang(lang);
        }

        // Refresh AOS positions after text changes
        setTimeout(function () {
          if (typeof AOS !== 'undefined') AOS.refresh();
        }, 400);
      });
    });
  },

  /* ─────────────────────────────────────────────
     AOS — Animate On Scroll
     ───────────────────────────────────────────── */


  /**
   * Initialise AOS with bidirectional animations.
   * Elements animate in when scrolling down AND re-animate when scrolling back up.
   * @private
   */
  _initAOS: function () {
    if (typeof AOS === 'undefined') {
      console.warn('[App] AOS library not loaded — scroll animations disabled.');
      return;
    }

    AOS.init({
      duration: 800,            // animation duration in ms
      easing: 'ease-out-cubic', // smooth deceleration
      once: false,              // animate every time element enters viewport
      mirror: true,             // animate OUT when scrolling past
      offset: 80,               // trigger 80px before element is visible
      anchorPlacement: 'top-bottom'
    });
  },

  /* ─────────────────────────────────────────────
     GSAP ScrollTrigger — Advanced Scroll Effects
     ───────────────────────────────────────────── */

  /**
   * Set up GSAP-powered scroll animations:
   *  • Hero parallax (text drifts up + fades as you scroll away)
   *  • Hero entrance animation (on page load)
   *  • Section-level opacity fades tied to scroll position
   * @private
   */
  _initGSAP: function () {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('[App] GSAP/ScrollTrigger not loaded — advanced animations disabled.');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // ── Hero entrance animation (runs once on page load) ──
    var heroContent = document.querySelector('.hero-content');
    if (heroContent) {
      var heroChildren = heroContent.children;

      // Set initial state on individual children
      gsap.set(heroChildren, { opacity: 0, y: 35 });

      // Staggered reveal of individual children
      gsap.to(heroChildren, {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.12,
        ease: 'power3.out',
        delay: 0.3
      });

      // ── Hero parallax on scroll ──
      gsap.to(heroContent, {
        y: 120,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6
        }
      });
    }

    // ── Section-level opacity fade (enter/leave viewport) ──
    var sections = document.querySelectorAll('.section');
    sections.forEach(function (section) {
      // Skip the hero — it has its own custom animation
      if (section.id === 'hero') return;

      gsap.fromTo(section,
        { opacity: 0.15 },
        {
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 90%',
            end: 'top 30%',
            scrub: 0.4,
            toggleActions: 'play reverse play reverse'
          }
        }
      );
    });
  }
};

/* ─────────────────────────────────────────────
   Boot on DOM ready
   ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  App.init();
});
