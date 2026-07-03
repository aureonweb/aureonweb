/**
 * ============================================================
 *  components.js — Reusable UI Components
 *  Zhineng Qigong · Indira-Web
 * ============================================================
 *  Provides self-contained, defensively-coded UI modules:
 *    1. FAQ Accordion (single-open)
 *    2. Testimonial auto-rotation
 *    3. Contact Form (Formspree)
 *    4. Scroll Animations (IntersectionObserver)
 *    5. Smooth Scroll for anchor links
 *    6. Header scroll effect
 *    7. Mobile menu
 * ============================================================
 */

window.Components = window.Components || {};

/* ─────────────────────────────────────────────
   1. FAQ Accordion
   ───────────────────────────────────────────── */
Components.initFAQ = function () {
  var faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(function (item) {
    var questionBtn = item.querySelector('.faq-question');
    if (!questionBtn) return;

    questionBtn.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');

      // Close every other open item (single-open accordion)
      faqItems.forEach(function (sibling) {
        if (sibling !== item && sibling.classList.contains('open')) {
          sibling.classList.remove('open');
          _collapseFAQ(sibling);
        }
      });

      // Toggle clicked item
      if (isOpen) {
        item.classList.remove('open');
        _collapseFAQ(item);
      } else {
        item.classList.add('open');
        _expandFAQ(item);
      }
    });
  });

  /**
   * Smoothly expand the answer panel via max-height.
   * @param {HTMLElement} faqItem
   */
  function _expandFAQ(faqItem) {
    var answer = faqItem.querySelector('.faq-answer');
    if (!answer) return;
    // Measure natural height, then animate
    answer.style.maxHeight = answer.scrollHeight + 'px';
  }

  /**
   * Collapse the answer panel.
   * @param {HTMLElement} faqItem
   */
  function _collapseFAQ(faqItem) {
    var answer = faqItem.querySelector('.faq-answer');
    if (!answer) return;
    answer.style.maxHeight = '0';
  }
};

/* ─────────────────────────────────────────────
   2. Testimonial Auto-Rotation
   ───────────────────────────────────────────── */
Components.initTestimonials = function () {
  var container = document.querySelector('.testimonials-grid, .testimonials-container');
  if (!container) return;

  var cards = container.querySelectorAll('.testimonial-card');
  if (!cards.length) return;

  // Add reveal animations to all cards
  cards.forEach(function (card) {
    card.classList.add('animate-in');
  });

  // If there are more than 3 testimonials, enable auto-rotation on mobile
  if (cards.length <= 3) return;

  var _rotationInterval = null;
  var _currentIndex = 0;
  var ROTATION_DELAY = 5000; // 5 seconds

  /**
   * Show only the card at `index`; hide the rest.
   * Only active on viewports ≤ 768px.
   */
  function _showCard(index) {
    cards.forEach(function (card, i) {
      card.style.opacity = i === index ? '1' : '0';
      card.style.position = i === index ? 'relative' : 'absolute';
      card.style.pointerEvents = i === index ? 'auto' : 'none';
    });
  }

  function _startRotation() {
    // Only rotate on narrow viewports
    if (window.innerWidth > 768) {
      _stopRotation();
      // Restore all cards to normal flow
      cards.forEach(function (card) {
        card.style.opacity = '';
        card.style.position = '';
        card.style.pointerEvents = '';
      });
      return;
    }

    // Set container to relative so absolute cards stack
    container.style.position = 'relative';
    _showCard(_currentIndex);

    _rotationInterval = setInterval(function () {
      _currentIndex = (_currentIndex + 1) % cards.length;
      _showCard(_currentIndex);
    }, ROTATION_DELAY);
  }

  function _stopRotation() {
    if (_rotationInterval) {
      clearInterval(_rotationInterval);
      _rotationInterval = null;
    }
  }

  // Kick off and re-evaluate on resize
  _startRotation();

  var _resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(function () {
      _stopRotation();
      _startRotation();
    }, 250);
  });
};

/* ─────────────────────────────────────────────
   3. Contact Form (Formspree)
   ───────────────────────────────────────────── */
Components.initContactForm = function () {
  var form = document.getElementById('contact-form');
  if (!form) return;

  var _isSubmitting = false;

  /**
   * Simple email regex – covers the vast majority of valid addresses.
   * @param {string} email
   * @returns {boolean}
   */
  function _isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Display a status message below the form.
   * @param {string} message
   * @param {'success'|'error'} type
   */
  function _showStatus(message, type) {
    var statusEl = document.getElementById('contact-form-status');
    if (!statusEl) {
      // Create one dynamically if missing
      statusEl = document.createElement('div');
      statusEl.id = 'contact-form-status';
      form.parentNode.appendChild(statusEl);
    }

    statusEl.textContent = message;
    statusEl.className = 'form-status form-status--' + type;
    statusEl.style.marginTop = '20px';
    statusEl.style.padding = '15px 20px';
    statusEl.style.borderRadius = '8px';
    statusEl.style.fontWeight = '500';
    statusEl.style.textAlign = 'center';

    if (type === 'success') {
      statusEl.style.background = 'rgba(108, 145, 125, 0.2)';
      statusEl.style.border = '1px solid rgba(108, 145, 125, 0.4)';
      statusEl.style.color = '#6c917d';
    } else {
      statusEl.style.background = 'rgba(220, 53, 69, 0.15)';
      statusEl.style.border = '1px solid rgba(220, 53, 69, 0.4)';
      statusEl.style.color = '#ff6b6b';
    }

    // Auto-clear after 6 seconds
    setTimeout(function () {
      if (statusEl) statusEl.textContent = '';
      statusEl.style.background = '';
      statusEl.style.border = '';
      statusEl.style.padding = '';
    }, 6000);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Prevent double submission
    if (_isSubmitting) return;

    // Gather field values
    var nameField = form.querySelector('[name="nombre"], [name="name"]');
    var emailField = form.querySelector('[name="email"]');
    var subjectField = form.querySelector('[name="asunto"], [name="subject"]');
    var messageField = form.querySelector('[name="mensaje"], [name="message"]');

    var nameVal = nameField ? nameField.value.trim() : '';
    var emailVal = emailField ? emailField.value.trim() : '';
    var subjectVal = subjectField ? subjectField.value.trim() : '';
    var messageVal = messageField ? messageField.value.trim() : '';

    // ── Validation ───────────────────────────
    if (!nameVal) {
      _showStatus('Por favor, ingresa tu nombre.', 'error');
      if (nameField) nameField.focus();
      return;
    }
    if (!emailVal) {
      _showStatus('Por favor, ingresa tu correo electrónico.', 'error');
      if (emailField) emailField.focus();
      return;
    }
    if (!_isValidEmail(emailVal)) {
      _showStatus('Por favor, ingresa un correo electrónico válido.', 'error');
      if (emailField) emailField.focus();
      return;
    }
    if (!subjectVal) {
      _showStatus('Por favor, ingresa el asunto.', 'error');
      if (subjectField) subjectField.focus();
      return;
    }
    if (!messageVal) {
      _showStatus('Por favor, escribe tu mensaje.', 'error');
      if (messageField) messageField.focus();
      return;
    }

    // ── Submission ───────────────────────────
    _isSubmitting = true;
    var submitBtn = form.querySelector('[type="submit"]');
    var originalBtnText = '';

    if (submitBtn) {
      originalBtnText = submitBtn.textContent;
      submitBtn.textContent = 'Enviando…';
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.6';
    }

    // Determine action URL from the form's action attribute
    var actionURL = form.getAttribute('action');
    if (!actionURL) {
      _showStatus('Error de configuración: falta la URL de envío.', 'error');
      _isSubmitting = false;
      if (submitBtn) {
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
        submitBtn.style.opacity = '';
      }
      return;
    }

    // Build form data
    var formData = new FormData(form);

    fetch(actionURL, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    })
      .then(function (response) {
        if (response.ok) {
          _showStatus('¡Mensaje enviado con éxito! Te responderemos pronto.', 'success');
          form.reset();
        } else {
          return response.json().then(function (data) {
            var errorMsg = 'Error al enviar el mensaje.';
            if (data && data.errors) {
              errorMsg = data.errors.map(function (err) { return err.message; }).join(', ');
            }
            _showStatus(errorMsg, 'error');
          });
        }
      })
      .catch(function () {
        _showStatus('Error de red. Por favor, inténtalo de nuevo.', 'error');
      })
      .finally(function () {
        _isSubmitting = false;
        if (submitBtn) {
          submitBtn.textContent = originalBtnText;
          submitBtn.disabled = false;
          submitBtn.style.opacity = '';
        }
      });
  });
};

/* ─────────────────────────────────────────────
   4. Scroll Animations (IntersectionObserver)
   ───────────────────────────────────────────── */
Components.initScrollAnimations = function () {
  var targets = document.querySelectorAll('.animate-in');
  if (!targets.length) return;

  // Fallback for browsers without IntersectionObserver
  if (!('IntersectionObserver' in window)) {
    targets.forEach(function (el) {
      el.classList.add('visible');
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        var el = entry.target;
        var delay = parseInt(el.getAttribute('data-delay'), 10) || 0;

        if (delay > 0) {
          setTimeout(function () {
            el.classList.add('visible');
          }, delay);
        } else {
          el.classList.add('visible');
        }

        // Stop watching once revealed
        observer.unobserve(el);
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach(function (el) {
    observer.observe(el);
  });
};

/* ─────────────────────────────────────────────
   5. Smooth Scroll for Anchor Links
   ───────────────────────────────────────────── */
Components.initSmoothScroll = function () {
  var HEADER_OFFSET = 80; // pixels to offset for fixed header

  document.addEventListener('click', function (e) {
    // Walk up to find an anchor tag
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;

    var hash = link.getAttribute('href');
    if (!hash || hash === '#') return;

    var targetEl = document.querySelector(hash);
    if (!targetEl) return;

    e.preventDefault();

    // Calculate position with header offset
    var targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - HEADER_OFFSET;

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });

    // Close mobile menu if open
    _closeMobileMenu();

    // Update URL hash without jumping
    if (history.pushState) {
      history.pushState(null, null, hash);
    }
  });

  /**
   * Helper: close mobile menu if it is currently open.
   */
  function _closeMobileMenu() {
    var mobileNav = document.querySelector('.mobile-nav');
    var mobileOverlay = document.querySelector('.mobile-overlay');

    if (mobileNav && mobileNav.classList.contains('open')) {
      mobileNav.classList.remove('open');
    }
    if (mobileOverlay && mobileOverlay.classList.contains('open')) {
      mobileOverlay.classList.remove('open');
    }
    document.body.style.overflow = '';
  }
};

/* ─────────────────────────────────────────────
   6. Header Scroll Effect
   ───────────────────────────────────────────── */
Components.initHeader = function () {
  var header = document.querySelector('.main-header');
  if (!header) return;

  var SCROLL_THRESHOLD = 50;
  var _ticking = false;

  /**
   * Add/remove 'scrolled' class based on scroll position.
   */
  function _onScroll() {
    if (!_ticking) {
      window.requestAnimationFrame(function () {
        if (window.scrollY > SCROLL_THRESHOLD) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
        _updateActiveNavLink();
        _ticking = false;
      });
      _ticking = true;
    }
  }

  /**
   * Highlight the nav link corresponding to the currently-visible section.
   */
  function _updateActiveNavLink() {
    var navLinks = header.querySelectorAll('a[href^="#"]');
    if (!navLinks.length) return;

    var sections = [];
    navLinks.forEach(function (link) {
      var hash = link.getAttribute('href');
      if (hash && hash !== '#') {
        var section = document.querySelector(hash);
        if (section) {
          sections.push({ link: link, section: section });
        }
      }
    });

    if (!sections.length) return;

    var scrollPos = window.scrollY + 120; // offset for better UX

    // Determine which section is currently in view
    var activeLink = null;
    sections.forEach(function (item) {
      var top = item.section.offsetTop;
      var bottom = top + item.section.offsetHeight;
      if (scrollPos >= top && scrollPos < bottom) {
        activeLink = item.link;
      }
    });

    // Toggle active class
    navLinks.forEach(function (link) {
      if (link === activeLink) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', _onScroll, { passive: true });

  // Run once on init
  _onScroll();
};

/* ─────────────────────────────────────────────
   7. Mobile Menu
   ───────────────────────────────────────────── */
Components.initMobileMenu = function () {
  var menuToggle = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  var mobileOverlay = document.querySelector('.mobile-overlay');
  var mobileClose = document.querySelector('.mobile-close');

  // Bail out if essential elements are missing
  if (!menuToggle || !mobileNav) return;

  /**
   * Open the mobile menu.
   */
  function _openMenu() {
    mobileNav.classList.add('open');
    if (mobileOverlay) mobileOverlay.classList.add('open');
    document.body.style.overflow = 'hidden'; // prevent background scroll
  }

  /**
   * Close the mobile menu.
   */
  function _closeMenu() {
    mobileNav.classList.remove('open');
    if (mobileOverlay) mobileOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Toggle on hamburger click
  menuToggle.addEventListener('click', function (e) {
    e.stopPropagation();
    if (mobileNav.classList.contains('open')) {
      _closeMenu();
    } else {
      _openMenu();
    }
  });

  // Close on overlay click
  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', _closeMenu);
  }

  // Close on X button click
  if (mobileClose) {
    mobileClose.addEventListener('click', _closeMenu);
  }

  // Close when a nav link inside the mobile menu is clicked
  var mobileLinks = mobileNav.querySelectorAll('a');
  mobileLinks.forEach(function (link) {
    link.addEventListener('click', _closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
      _closeMenu();
    }
  });
};

/* ─────────────────────────────────────────────
   8. Promotions Banner (Carousel)
   ───────────────────────────────────────────── */
Components.initPromotionsBanner = function () {
  var overlay = document.getElementById('promo-banner-overlay');
  if (!overlay) return;

  var carousel = document.getElementById('promo-carousel');
  var btnClose = document.querySelector('.promo-close');
  var btnAdvance = document.getElementById('promo-advance-btn');
  var dotsContainer = document.getElementById('promo-dots');
  var footerBtn = document.getElementById('footer-promo-btn');

  var currentSlide = 0;
  var slidesCount = 0;
  var autoAdvanceInterval = null;

  // Open the banner
  function openBanner(e) {
    if (e) e.preventDefault();
    if (slidesCount > 0) {
      overlay.style.display = 'flex';
      setTimeout(function() {
        overlay.classList.add('show');
        resetInterval();
      }, 10);
    }
  }

  // Close the banner
  function closeBanner() {
    overlay.classList.remove('show');
    clearInterval(autoAdvanceInterval);
    setTimeout(function() {
      overlay.style.display = 'none';
    }, 400);
  }

  // Update dots
  function updateDots(index) {
    if (!dotsContainer) return;
    var dots = dotsContainer.querySelectorAll('.promo-dot');
    dots.forEach(function(d, i) {
      d.classList.toggle('active', i === index);
    });
  }

  // Update advance button label depending on slide position
  function updateAdvanceBtn(index) {
    if (!btnAdvance) return;
    if (index >= slidesCount - 1) {
      btnAdvance.innerHTML = 'Contactar / Inscribirse <i class="bi bi-envelope-fill"></i>';
      btnAdvance.classList.add('promo-advance-last');
    } else {
      btnAdvance.innerHTML = 'Más información <i class="bi bi-arrow-right"></i>';
      btnAdvance.classList.remove('promo-advance-last');
    }
  }

  function showSlide(index) {
    var slides = carousel.querySelectorAll('.promo-slide');
    if (!slides.length) return;
    if (index >= slides.length) index = 0;
    if (index < 0) index = slides.length - 1;
    slides.forEach(function(s, i) {
      s.classList.toggle('active', i === index);
    });
    currentSlide = index;
    updateDots(index);
    updateAdvanceBtn(index);
  }

  function nextSlide() {
    showSlide(currentSlide + 1);
    resetInterval();
  }

  function resetInterval() {
    clearInterval(autoAdvanceInterval);
    autoAdvanceInterval = setInterval(nextSlide, 6000);
  }

  // Fetch promotions
  fetch('data/lecciones.json?t=' + Date.now())
    .then(function(res) { return res.json(); })
    .then(function(data) {
      var promotions = data.promotions || [];
      if (!promotions.length) return;

      slidesCount = promotions.length;

      // Determine language
      var lang = 'es';
      if (window.I18n && typeof window.I18n.getCurrentLanguage === 'function') {
        lang = window.I18n.getCurrentLanguage();
      }

      // Build slides HTML (no contact button inside each slide)
      var html = promotions.map(function(p, i) {
        var title = p.title && p.title[lang] ? p.title[lang] : (p.title && p.title.es ? p.title.es : '');
        var text  = p.text  && p.text[lang]  ? p.text[lang]  : (p.text  && p.text.es  ? p.text.es  : '');
        var dates = p.dates && p.dates[lang] ? p.dates[lang] : (p.dates && p.dates.es  ? p.dates.es  : '');

        return '' +
          '<div class="promo-slide" style="background-image: url(\'' + p.image + '\')">' +
            '<div class="promo-content">' +
              '<h2 class="promo-title">' + title + '</h2>' +
              '<div class="promo-meta">' +
                (p.price ? '<span><i class="bi bi-tag-fill"></i> ' + p.price + '</span>' : '') +
                (dates   ? '<span><i class="bi bi-calendar-event-fill"></i> ' + dates + '</span>' : '') +
              '</div>' +
              '<p class="promo-text">' + text + '</p>' +
            '</div>' +
          '</div>';
      }).join('');

      carousel.innerHTML = html;

      // Build dots
      if (dotsContainer) {
        dotsContainer.innerHTML = promotions.map(function(_, i) {
          return '<span class="promo-dot' + (i === 0 ? ' active' : '') + '"></span>';
        }).join('');
      }

      showSlide(0);

      // Bind close
      if (btnClose) btnClose.addEventListener('click', closeBanner);
      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) closeBanner();
      });

      // Bind footer button
      if (footerBtn) footerBtn.addEventListener('click', openBanner);

      // Bind membership button
      var btnMembership = document.getElementById('promo-membership-btn');
      if (btnMembership) {
        btnMembership.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          closeBanner();
          if (window.openMembershipBanner) {
            window.openMembershipBanner();
          }
        });
      }

      // Advance button: next slide or contact on last
      if (btnAdvance) {
        btnAdvance.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          if (currentSlide >= slidesCount - 1) {
            // Last slide → close and scroll to contact
            closeBanner();
            var targetEl = document.querySelector('#contact');
            if (targetEl) {
              var HEADER_OFFSET = 80;
              var targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - HEADER_OFFSET;
              window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
          } else {
            nextSlide();
          }
        });
      }

      // Auto-open after delay
      setTimeout(function() { openBanner(); }, 1500);
    })
    .catch(function(err) {
      console.warn('Error fetching promotions:', err);
    });
};

/* ─────────────────────────────────────────────
   9. Membership Banner (Carousel)
   ───────────────────────────────────────────── */
Components.initMembershipBanner = function () {
  var overlay = document.getElementById('membership-banner-overlay');
  if (!overlay) return;

  var carousel = document.getElementById('membership-carousel');
  var btnClose = document.getElementById('membership-close');
  var btnAdvance = document.getElementById('membership-advance-btn');
  var dotsContainer = document.getElementById('membership-dots');

  var currentSlide = 0;
  var slidesCount = 0;
  var autoAdvanceInterval = null;

  var slides = carousel.querySelectorAll('.promo-slide');
  slidesCount = slides.length;
  if (!slidesCount) return;

  // Build dots
  if (dotsContainer) {
    dotsContainer.innerHTML = Array.from(slides).map(function(_, i) {
      return '<span class="promo-dot' + (i === 0 ? ' active' : '') + '"></span>';
    }).join('');
  }

  // Open the banner
  function openBanner() {
    overlay.style.display = 'flex';
    setTimeout(function() {
      overlay.classList.add('show');
      resetInterval();
    }, 10);
  }
  
  // Expose to window for the promo banner button
  window.openMembershipBanner = openBanner;

  // Close the banner
  function closeBanner() {
    overlay.classList.remove('show');
    clearInterval(autoAdvanceInterval);
    setTimeout(function() {
      overlay.style.display = 'none';
    }, 400);
  }

  // Update dots
  function updateDots(index) {
    if (!dotsContainer) return;
    var dots = dotsContainer.querySelectorAll('.promo-dot');
    dots.forEach(function(d, i) {
      d.classList.toggle('active', i === index);
    });
  }

  // Update advance button label
  function updateAdvanceBtn(index) {
    if (!btnAdvance) return;
    if (index >= slidesCount - 1) {
      btnAdvance.innerHTML = 'Contactar / Inscribirse <i class="bi bi-envelope-fill"></i>';
      btnAdvance.classList.add('promo-advance-last');
    } else {
      btnAdvance.innerHTML = 'Siguiente <i class="bi bi-arrow-right"></i>';
      btnAdvance.classList.remove('promo-advance-last');
    }
  }

  function showSlide(index) {
    if (index >= slidesCount) index = 0;
    if (index < 0) index = slidesCount - 1;
    slides.forEach(function(s, i) {
      s.classList.toggle('active', i === index);
    });
    currentSlide = index;
    updateDots(index);
    updateAdvanceBtn(index);
  }

  function nextSlide() {
    showSlide(currentSlide + 1);
    resetInterval();
  }

  function resetInterval() {
    clearInterval(autoAdvanceInterval);
    autoAdvanceInterval = setInterval(nextSlide, 6000);
  }

  showSlide(0);

  // Bind close
  if (btnClose) btnClose.addEventListener('click', closeBanner);
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeBanner();
  });

  // Advance button
  if (btnAdvance) {
    btnAdvance.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (currentSlide >= slidesCount - 1) {
        // Last slide -> close and scroll to contact
        closeBanner();
        var targetEl = document.querySelector('#contact');
        if (targetEl) {
          var HEADER_OFFSET = 80;
          var targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - HEADER_OFFSET;
          window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        }
      } else {
        nextSlide();
      }
    });
  }
};
