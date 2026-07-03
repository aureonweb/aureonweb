/**
 * ============================================================
 *  aula.js — Página del Aula Virtual
 *  Zhineng Qigong · Indira-Web
 * ============================================================
 *  • Bootstrap de la página (perfil, i18n, fondo, header, menú)
 *  • Render de módulos y lecciones desde data/lecciones.json
 *  • Reproductor embebido (YouTube / Drive / PDF / enlace)
 *  • Desbloqueo de contenido premium con código (descifrado)
 * ============================================================
 */

(function () {
  'use strict';

  var AD = window.AulaData;

  var state = {
    content: null,
    unlocked: false,
    key: null,            // CryptoKey en memoria cuando está desbloqueado
    profile: 'hui'
  };

  var PROFILE_COLORS = {
    'aureon': '#D4A574',
    'hui': '#6c917d',
    'indira-y-hui': '#9B7FBF'
  };

  var CODE_STORAGE = 'znqg-aula-code';

  /* ─────────────────────────────────────────────
     Helpers
     ───────────────────────────────────────────── */

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function T(key, fb) {
    if (window.I18n && typeof I18n.t === 'function') {
      var v = I18n.t(key);
      if (v && v !== key) return v;
    }
    return fb;
  }

  function lang() { return AD.getLang(); }

  var TYPE_META = {
    youtube: { icon: 'bi-youtube', key: 'aula.type.youtube', fb: 'Video' },
    drive:   { icon: 'bi-hdd-network', key: 'aula.type.drive', fb: 'Drive' },
    pdf:     { icon: 'bi-file-earmark-pdf', key: 'aula.type.pdf', fb: 'PDF' },
    link:    { icon: 'bi-link-45deg', key: 'aula.type.link', fb: 'Enlace' }
  };

  function typeMeta(type) { return TYPE_META[type] || TYPE_META.link; }

  /* ─────────────────────────────────────────────
     Bootstrap
     ───────────────────────────────────────────── */

  function init() {
    // Perfil guardado
    try {
      var saved = localStorage.getItem('znqg-profile');
      if (saved && PROFILE_COLORS[saved]) state.profile = saved;
    } catch (_e) {}
    applyProfile(state.profile, false);

    // i18n
    if (window.I18n && I18n.init) {
      try { I18n.init(); } catch (e) {}
    }

    // Fondo (partículas + slideshow)
    if (window.BackgroundManager && BackgroundManager.init) {
      try {
        BackgroundManager.init();
        BackgroundManager.updateParticleColor(PROFILE_COLORS[state.profile]);
      } catch (e) {}
    }

    // Componentes reutilizables (header scroll, menú móvil, smooth scroll)
    ['initHeader', 'initMobileMenu', 'initSmoothScroll'].forEach(function (fn) {
      if (window.Components && typeof Components[fn] === 'function') {
        try { Components[fn](); } catch (e) {}
      }
    });

    bindProfileSwitchers();
    bindLangToggles();
    buildModals();

    // Re-render al cambiar idioma o perfil
    document.addEventListener('languageChanged', render);
    document.addEventListener('profileChanged', render);

    // Cargar contenido (modo vista previa o publicado)
    loadContentForPage().then(function (content) {
      state.content = content;
      return restoreUnlock();
    }).then(function () {
      render();
    });
  }

  /**
   * En modo "?preview=1" el aula lee un borrador guardado por el panel
   * de administración (localStorage 'znqg-aula-preview') en lugar del
   * archivo publicado. Útil para revisar cambios antes de publicar.
   */
  function loadContentForPage() {
    var isPreview = /[?&]preview=1\b/.test(window.location.search);
    if (isPreview) {
      try {
        var raw = localStorage.getItem('znqg-aula-preview');
        if (raw) {
          showPreviewBanner();
          return Promise.resolve(AD.normalize(JSON.parse(raw)));
        }
      } catch (_e) {}
    }
    return AD.loadContent({ bust: true });
  }

  function showPreviewBanner() {
    var b = document.createElement('div');
    b.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:5000;background:#f2c879;' +
      'color:#1a1300;text-align:center;padding:7px 14px;font-size:0.8rem;font-weight:700;' +
      'letter-spacing:0.5px;';
    b.textContent = 'VISTA PREVIA — así se verá el aula tras publicar (contenido sin publicar)';
    document.addEventListener('DOMContentLoaded', function () { document.body.appendChild(b); });
    if (document.body) document.body.appendChild(b);
  }

  /* ─────────────────────────────────────────────
     Perfil (versión ligera del de app.js)
     ───────────────────────────────────────────── */

  function applyProfile(profile, persist) {
    if (!PROFILE_COLORS[profile]) return;
    state.profile = profile;
    document.body.setAttribute('data-profile', profile);

    document.querySelectorAll('.profile-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-profile') === profile);
    });

    if (persist) {
      try { localStorage.setItem('znqg-profile', profile); } catch (_e) {}
    }

    if (window.BackgroundManager && BackgroundManager.updateParticleColor) {
      try { BackgroundManager.updateParticleColor(PROFILE_COLORS[profile]); } catch (e) {}
    }

    try {
      document.dispatchEvent(new CustomEvent('profileChanged', {
        detail: { profile: profile, color: PROFILE_COLORS[profile] }
      }));
    } catch (_e) {}
  }

  function bindProfileSwitchers() {
    document.querySelectorAll('.profile-btn, .profile-btn-link').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var p = btn.getAttribute('data-profile');
        if (p) {
          applyProfile(p, true);
          var nav = document.querySelector('.mobile-nav');
          var ov = document.querySelector('.mobile-overlay');
          if (nav) nav.classList.remove('open');
          if (ov) ov.classList.remove('open');
          document.body.style.overflow = '';
        }
      });
    });
  }

  function bindLangToggles() {
    var allToggles = document.querySelectorAll('.lang-toggle');
    var allOptions = document.querySelectorAll('.lang-toggle-option');
    allOptions.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var lg = btn.getAttribute('data-lang');
        if (!lg) return;
        allOptions.forEach(function (b) {
          b.classList.toggle('active', b.getAttribute('data-lang') === lg);
        });
        allToggles.forEach(function (t) { t.classList.toggle('en', lg === 'en'); });
        // i18n.js ya tiene su propio handler que llama a setLanguage;
        // por seguridad lo invocamos también aquí.
        if (window.I18n && I18n.setLanguage) I18n.setLanguage(lg);
      });
    });
  }

  /* ─────────────────────────────────────────────
     Premium: restaurar desbloqueo guardado
     ───────────────────────────────────────────── */

  function premiumCfg() {
    return state.content && state.content.settings && state.content.settings.premium;
  }

  function hasPremiumContent() {
    var p = premiumCfg();
    if (!p || !p.enabled) return false;
    return state.content.modules.some(function (m) {
      if (m.access === 'premium') return true;
      return m.lessons.some(function (l) { return l.access === 'premium'; });
    });
  }

  function restoreUnlock() {
    var p = premiumCfg();
    if (!p || !p.enabled || !p.verifier || !p.salt) return Promise.resolve();
    var code = null;
    try { code = localStorage.getItem(CODE_STORAGE); } catch (_e) {}
    if (!code) return Promise.resolve();

    return AD.deriveKey(code, p.salt, p.iterations).then(function (key) {
      return AD.checkVerifier(p.verifier, key).then(function (ok) {
        if (ok) { state.unlocked = true; state.key = key; }
        else { try { localStorage.removeItem(CODE_STORAGE); } catch (_e) {} }
      });
    }).catch(function () {});
  }

  function unlockWithCode(code) {
    var p = premiumCfg();
    if (!p || !p.salt || !p.verifier) return Promise.resolve(false);
    return AD.deriveKey(code, p.salt, p.iterations).then(function (key) {
      return AD.checkVerifier(p.verifier, key).then(function (ok) {
        if (ok) {
          state.unlocked = true;
          state.key = key;
          try { localStorage.setItem(CODE_STORAGE, code); } catch (_e) {}
        }
        return ok;
      });
    }).catch(function () { return false; });
  }

  function lockOut() {
    state.unlocked = false;
    state.key = null;
    try { localStorage.removeItem(CODE_STORAGE); } catch (_e) {}
    render();
  }

  /* ─────────────────────────────────────────────
     Render principal
     ───────────────────────────────────────────── */

  function render() {
    if (!state.content) return;
    renderIntro();
    renderStatusbar();
    renderModules();
  }

  function renderIntro() {
    var host = document.getElementById('aula-intro');
    if (!host) return;
    var txt = AD.pickLang(state.content.settings.intro, lang());
    host.innerHTML = txt ? '<p>' + esc(txt) + '</p>' : '';
  }

  function renderStatusbar() {
    var host = document.getElementById('aula-status');
    if (!host) return;
    host.innerHTML = '';
    if (!hasPremiumContent()) return;

    if (state.unlocked) {
      var chip = document.createElement('span');
      chip.className = 'aula-status-chip unlocked';
      chip.innerHTML = '<i class="bi bi-unlock-fill"></i> ' +
        esc(T('aula.unlocked.label', 'Acceso de alumno activo'));
      var out = document.createElement('button');
      out.className = 'btn ghost small';
      out.textContent = T('aula.logout', 'Cerrar acceso');
      out.addEventListener('click', lockOut);
      host.appendChild(chip);
      host.appendChild(out);
    } else {
      var chip2 = document.createElement('span');
      chip2.className = 'aula-status-chip';
      chip2.innerHTML = '<i class="bi bi-lock-fill"></i> ' +
        esc(T('aula.locked.label', 'Hay contenido exclusivo para alumnos'));
      var btn = document.createElement('button');
      btn.className = 'btn filled small';
      btn.innerHTML = '<i class="bi bi-key-fill"></i> ' + esc(T('aula.unlock.cta', 'Ingresar código'));
      btn.addEventListener('click', openCodeModal);
      host.appendChild(chip2);
      host.appendChild(btn);
    }
  }

  function renderModules() {
    var host = document.getElementById('aula-modules');
    if (!host) return;
    host.innerHTML = '';

    var mods = (state.content.modules || []).filter(function (m) {
      return m.profile === 'all' || !m.profile || m.profile === state.profile;
    });

    if (!mods.length) {
      host.innerHTML =
        '<div class="aula-empty"><i class="bi bi-collection-play"></i>' +
        '<p>' + esc(T('aula.empty', 'Aún no hay lecciones publicadas.')) + '</p></div>';
      return;
    }

    mods.forEach(function (mod) {
      host.appendChild(renderModule(mod));
    });
  }

  function renderModule(mod) {
    var block = document.createElement('section');
    block.className = 'module-block';

    var lg = lang();
    var title = esc(AD.pickLang(mod.title, lg)) || 'Módulo';
    var desc = esc(AD.pickLang(mod.description, lg));

    var badge = mod.access === 'premium'
      ? '<span class="access-badge premium"><i class="bi bi-lock-fill"></i>' +
        esc(T('aula.premiumBadge', 'Alumnos')) + '</span>'
      : '<span class="access-badge public"><i class="bi bi-unlock"></i>' +
        esc(T('aula.publicBadge', 'Público')) + '</span>';

    var cover = mod.cover
      ? '<img class="module-cover" src="' + esc(mod.cover) + '" alt="" loading="lazy">'
      : '';

    var head = document.createElement('div');
    head.className = 'module-header';
    head.innerHTML =
      cover +
      '<div class="module-headtext">' +
        '<div class="module-title">' + title + badge + '</div>' +
        (desc ? '<p class="module-desc">' + desc + '</p>' : '') +
      '</div>';
    block.appendChild(head);

    var grid = document.createElement('div');
    grid.className = 'lessons-grid';

    if (!mod.lessons.length) {
      var em = document.createElement('p');
      em.className = 'module-desc';
      em.style.opacity = '0.7';
      em.textContent = T('aula.module.empty', 'Este módulo aún no tiene lecciones.');
      block.appendChild(em);
      return block;
    }

    mod.lessons.forEach(function (les) {
      grid.appendChild(renderLessonCard(mod, les));
    });
    block.appendChild(grid);
    return block;
  }

  function renderLessonCard(mod, les) {
    var lg = lang();
    var access = AD.effectiveAccess(mod, les);
    var locked = (access === 'premium' && !state.unlocked);

    var card = document.createElement('div');
    card.className = 'lesson-card' + (locked ? ' locked' : '');

    var tm = typeMeta(les.type);
    var thumb = les.thumbnail || AD.autoThumb(les.type, les.url) || '';

    var thumbHtml;
    if (thumb) {
      thumbHtml = '<div class="lesson-thumb"><img src="' + esc(thumb) + '" alt="" loading="lazy">';
    } else {
      thumbHtml = '<div class="lesson-thumb noimg"><i class="bi ' + tm.icon + '"></i>';
    }

    // Etiqueta de tipo
    thumbHtml += '<span class="lesson-type-tag"><i class="bi ' + tm.icon + '"></i>' +
      esc(T(tm.key, tm.fb)) + '</span>';

    // Duración
    if (les.duration) {
      thumbHtml += '<span class="lesson-duration">' + esc(les.duration) + '</span>';
    }

    // Overlay
    if (locked) {
      thumbHtml += '<div class="lesson-lock"><i class="bi bi-lock-fill"></i>' +
        '<span>' + esc(T('aula.lockedCard', 'Solo alumnos')) + '</span></div>';
    } else {
      thumbHtml += '<div class="lesson-play"><i class="bi bi-play-fill"></i></div>';
    }
    thumbHtml += '</div>';

    var title = esc(AD.pickLang(les.title, lg)) || 'Lección';
    var desc = esc(AD.pickLang(les.description, lg));

    card.innerHTML = thumbHtml +
      '<div class="lesson-info">' +
        '<div class="lesson-title">' + title + '</div>' +
        (desc ? '<div class="lesson-desc">' + desc + '</div>' : '') +
      '</div>';

    card.addEventListener('click', function () {
      onLessonClick(mod, les, access);
    });
    return card;
  }

  /* ─────────────────────────────────────────────
     Click en lección
     ───────────────────────────────────────────── */

  function onLessonClick(mod, les, access) {
    if (access === 'premium' && !state.unlocked) {
      openCodeModal();
      return;
    }
    if (access === 'premium') {
      // Descifrar la URL con la clave en memoria
      if (!state.key || !les.urlEnc) {
        openCodeModal();
        return;
      }
      AD.decryptText(les.urlEnc, state.key).then(function (url) {
        openPlayer(les, url);
      }).catch(function () {
        // La clave dejó de servir (código cambiado) → re-pedir
        lockOut();
        openCodeModal();
      });
    } else {
      openPlayer(les, les.url);
    }
  }

  /* ─────────────────────────────────────────────
     Modales (reproductor + código)
     ───────────────────────────────────────────── */

  var playerOverlay, codeOverlay;

  function buildModals() {
    // Reproductor
    playerOverlay = document.createElement('div');
    playerOverlay.className = 'aula-modal-overlay';
    playerOverlay.innerHTML =
      '<div class="aula-modal" role="dialog" aria-modal="true">' +
        '<div class="aula-modal-head">' +
          '<h3 id="player-title"></h3>' +
          '<button class="aula-modal-close" aria-label="Cerrar">&times;</button>' +
        '</div>' +
        '<div class="aula-modal-body" id="player-body"></div>' +
      '</div>';
    document.body.appendChild(playerOverlay);

    // Código de acceso
    codeOverlay = document.createElement('div');
    codeOverlay.className = 'aula-modal-overlay';
    codeOverlay.innerHTML =
      '<div class="aula-modal code-modal" role="dialog" aria-modal="true">' +
        '<div class="aula-modal-head">' +
          '<h3 id="code-title"></h3>' +
          '<button class="aula-modal-close" aria-label="Cerrar">&times;</button>' +
        '</div>' +
        '<div class="code-body">' +
          '<div class="code-lock-icon"><i class="bi bi-key-fill"></i></div>' +
          '<h3 id="code-h"></h3>' +
          '<p class="code-hint" id="code-hint"></p>' +
          '<div class="code-input-row">' +
            '<input type="password" id="code-input" autocomplete="off" spellcheck="false">' +
          '</div>' +
          '<div class="code-msg" id="code-msg"></div>' +
          '<button class="btn filled" id="code-submit" style="width:100%"></button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(codeOverlay);

    // Cerrar handlers
    [playerOverlay, codeOverlay].forEach(function (ov) {
      ov.addEventListener('click', function (e) {
        if (e.target === ov) closeModals();
      });
      ov.querySelector('.aula-modal-close').addEventListener('click', closeModals);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModals();
    });

    // Código submit
    var submit = codeOverlay.querySelector('#code-submit');
    var input = codeOverlay.querySelector('#code-input');
    submit.addEventListener('click', submitCode);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') submitCode();
    });
  }

  function openPlayer(les, url) {
    var titleEl = playerOverlay.querySelector('#player-title');
    var body = playerOverlay.querySelector('#player-body');
    titleEl.textContent = AD.pickLang(les.title, lang()) || 'Lección';

    var info = AD.embedFor(les.type, url);
    var descFull = AD.pickLang(les.description, lang());
    var descBlock = descFull
      ? '<div class="aula-modal-foot"><span class="lesson-desc-full">' + esc(descFull) + '</span></div>'
      : '';

    if (info.kind === 'iframe' && info.src) {
      var playerClass = 'aula-player' + (les.type === 'pdf' ? ' aula-player-pdf' : '');
      body.innerHTML =
        '<div class="' + playerClass + '">' +
          '<iframe src="' + esc(info.src) + '" allow="accelerometer; autoplay; clipboard-write; ' +
          'encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe>' +
        '</div>' + descBlock;
    } else {
      // No incrustable → botón para abrir
      body.innerHTML =
        '<div class="aula-openlink">' +
          '<i class="bi bi-box-arrow-up-right"></i>' +
          '<p>' + esc(T('aula.open.desc', 'Este contenido se abre en una pestaña nueva.')) + '</p>' +
          '<a class="btn filled" href="' + esc(info.raw || url) + '" target="_blank" rel="noopener">' +
            esc(T('aula.open.cta', 'Abrir contenido')) + '</a>' +
        '</div>' + descBlock;
    }

    openOverlay(playerOverlay);
  }

  function openCodeModal() {
    var p = premiumCfg();
    codeOverlay.querySelector('#code-title').textContent = T('aula.code.title', 'Contenido para alumnos');
    codeOverlay.querySelector('#code-h').textContent = T('aula.code.h', 'Ingresa tu código de acceso');
    var hint = (p && AD.pickLang(p.hint, lang())) || '';
    codeOverlay.querySelector('#code-hint').textContent = hint;
    codeOverlay.querySelector('#code-hint').style.display = hint ? 'block' : 'none';
    codeOverlay.querySelector('#code-msg').textContent = '';
    codeOverlay.querySelector('#code-msg').className = 'code-msg';
    codeOverlay.querySelector('#code-submit').textContent = T('aula.code.submit', 'Entrar');
    var input = codeOverlay.querySelector('#code-input');
    input.value = '';
    openOverlay(codeOverlay);
    setTimeout(function () { input.focus(); }, 120);
  }

  function submitCode() {
    var input = codeOverlay.querySelector('#code-input');
    var msg = codeOverlay.querySelector('#code-msg');
    var submit = codeOverlay.querySelector('#code-submit');
    var code = input.value.trim();
    if (!code) {
      msg.className = 'code-msg error';
      msg.textContent = T('aula.code.empty', 'Escribe tu código.');
      return;
    }
    submit.disabled = true;
    msg.className = 'code-msg';
    msg.textContent = T('aula.code.checking', 'Verificando…');

    unlockWithCode(code).then(function (ok) {
      submit.disabled = false;
      if (ok) {
        msg.className = 'code-msg ok';
        msg.textContent = T('aula.code.ok', '¡Acceso concedido!');
        setTimeout(function () {
          closeModals();
          render();
        }, 500);
      } else {
        msg.className = 'code-msg error';
        msg.textContent = T('aula.code.wrong', 'Código incorrecto. Inténtalo de nuevo.');
        input.select();
      }
    });
  }

  function openOverlay(ov) {
    ov.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModals() {
    [playerOverlay, codeOverlay].forEach(function (ov) {
      if (ov) ov.classList.remove('open');
    });
    // Detener cualquier reproducción vaciando el body del reproductor
    var body = playerOverlay && playerOverlay.querySelector('#player-body');
    if (body) body.innerHTML = '';
    document.body.style.overflow = '';
  }

  /* ─────────────────────────────────────────────
     Arranque
     ───────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', init);
})();
