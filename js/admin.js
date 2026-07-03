/**
 * ============================================================
 *  admin.js — Panel de administración del Aula Virtual
 *  Zhineng Qigong · Indira-Web
 * ============================================================
 *  • Acceso con contraseña (hash local)
 *  • Editor visual de módulos y lecciones (bilingüe ES/EN)
 *  • Contenido público y premium (cifrado con el código de alumnos)
 *  • Publicar directo a GitHub (API) + Exportar / Importar (respaldo)
 *  • Vista previa antes de publicar
 *
 *  Nada sensible (token, código, contraseña) se publica: vive solo
 *  en el navegador (localStorage) de quien administra.
 * ============================================================
 */

(function () {
  'use strict';

  var AD = window.AulaData;

  /* Claves de almacenamiento local (este navegador) */
  var K = {
    pass: 'znqg-admin-pass',
    draft: 'znqg-admin-draft',
    gh: 'znqg-gh',
    token: 'znqg-gh-token',
    code: 'znqg-student-code'
  };

  var draft = null;
  var openModules = {};      // id -> true (acordeones abiertos)
  var originalCode = '';     // código de alumnos al abrir (para detectar cambios)
  var saveTimer = null;
  var publishing = false;
  var appReady = false;

  /* ─────────────────────────────────────────────
     Utilidades
     ───────────────────────────────────────────── */

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function deepCopy(o) { return JSON.parse(JSON.stringify(o)); }

  function setPath(obj, path, val) {
    var parts = path.split('.');
    var cur = obj;
    for (var i = 0; i < parts.length - 1; i++) {
      if (cur[parts[i]] == null || typeof cur[parts[i]] !== 'object') cur[parts[i]] = {};
      cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = val;
  }

  function lobj(x) { x = x || {}; return { es: x.es || '', en: x.en || '' }; }

  function sha256(str) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(str)).then(function (buf) {
      var b = new Uint8Array(buf), h = '';
      for (var i = 0; i < b.length; i++) h += b[i].toString(16).padStart(2, '0');
      return h;
    });
  }

  function b64utf8(str) {
    var bytes = new TextEncoder().encode(str);
    var bin = '';
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }

  function toast(msg, kind, ms) {
    var t = $('#toast');
    t.textContent = msg;
    t.className = 'admin-toast show ' + (kind || 'info');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.className = 'admin-toast ' + (kind || 'info'); }, ms || 3800);
  }

  /* ─────────────────────────────────────────────
     Acceso (contraseña)
     ───────────────────────────────────────────── */

  function initGate() {
    var stored = null;
    try { stored = localStorage.getItem(K.pass); } catch (_e) {}
    var setupMode = !stored;

    var pass2 = $('#gate-pass2');
    var btn = $('#gate-btn');
    var txt = $('#gate-text');

    if (setupMode) {
      txt.textContent = 'Crea una contraseña para tu panel (se guarda solo en este navegador).';
      pass2.style.display = 'block';
      btn.textContent = 'Crear y entrar';
    }

    function attempt() {
      var p1 = $('#gate-pass').value;
      var msg = $('#gate-msg');
      msg.textContent = '';
      if (setupMode) {
        var p2 = pass2.value;
        if (p1.length < 4) { msg.textContent = 'Usa al menos 4 caracteres.'; return; }
        if (p1 !== p2) { msg.textContent = 'Las contraseñas no coinciden.'; return; }
        sha256(p1).then(function (h) {
          try { localStorage.setItem(K.pass, h); } catch (_e) {}
          enterApp();
        });
      } else {
        sha256(p1).then(function (h) {
          if (h === stored) enterApp();
          else { msg.textContent = 'Contraseña incorrecta.'; $('#gate-pass').select(); }
        });
      }
    }

    btn.addEventListener('click', attempt);
    $('#gate-pass').addEventListener('keydown', function (e) { if (e.key === 'Enter') attempt(); });
    pass2.addEventListener('keydown', function (e) { if (e.key === 'Enter') attempt(); });
  }

  function enterApp() {
    $('#admin-gate').style.display = 'none';
    $('#admin-app').style.display = 'block';
    if (!appReady) { appReady = true; appInit(); }
  }

  /* ─────────────────────────────────────────────
     Arranque de la aplicación (tras autenticar)
     ───────────────────────────────────────────── */

  function appInit() {
    try { originalCode = localStorage.getItem(K.code) || ''; } catch (_e) {}

    bindTabs();
    bindTopbar();
    bindSettings();
    bindConnect();
    bindModulesHost();
    renderHelp();

    loadDraft().then(function () {
      loadSettingsIntoForm();
      renderModules();
    });
  }

  /* ---- Pestañas ---- */
  function bindTabs() {
    $all('.admin-tab').forEach(function (tab) {
      tab.addEventListener('click', function () { switchTab(tab.getAttribute('data-tab')); });
    });
  }
  function switchTab(name) {
    $all('.admin-tab').forEach(function (t) {
      t.classList.toggle('active', t.getAttribute('data-tab') === name);
    });
    $all('.admin-pane').forEach(function (p) {
      p.classList.toggle('active', p.id === 'pane-' + name);
    });
  }

  /* ---- Barra superior ---- */
  function bindTopbar() {
    $('#btn-add-module').addEventListener('click', addModule);
    $('#btn-publish').addEventListener('click', publish);
    $('#btn-export').addEventListener('click', exportJson);
    $('#btn-import').addEventListener('click', function () { $('#import-file').click(); });
    $('#import-file').addEventListener('change', importJson);
    $('#btn-preview').addEventListener('click', preview);
    $('#btn-logout').addEventListener('click', function () {
      $('#admin-app').style.display = 'none';
      $('#admin-gate').style.display = 'block';
      $('#gate-pass').value = '';
    });
  }

  /* ─────────────────────────────────────────────
     Borrador (carga / guardado)
     ───────────────────────────────────────────── */

  function loadDraft() {
    var raw = null;
    try { raw = localStorage.getItem(K.draft); } catch (_e) {}
    if (raw) {
      try { draft = AD.normalize(JSON.parse(raw)); return Promise.resolve(); } catch (_e) {}
    }
    // Primera vez: tomar el contenido publicado como punto de partida
    return AD.loadContent({ bust: true }).then(function (content) {
      draft = content;
      // Intentar descifrar premium si ya hay un código guardado
      var code = getStudentCode();
      if (code) return decryptDraftPremium(code).then(function () { save(); });
      save();
    });
  }

  function save() {
    try { localStorage.setItem(K.draft, JSON.stringify(draft)); } catch (_e) {}
  }
  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 400);
  }

  /* ─────────────────────────────────────────────
     Helpers de modelo
     ───────────────────────────────────────────── */

  function getModule(id) {
    return draft.modules.filter(function (m) { return m.id === id; })[0];
  }
  function getLesson(modId, lesId) {
    var m = getModule(modId);
    if (!m) return null;
    return m.lessons.filter(function (l) { return l.id === lesId; })[0];
  }
  function anyPremium(d) {
    return d.modules.some(function (m) {
      if (m.access === 'premium') return true;
      return m.lessons.some(function (l) { return l.access === 'premium'; });
    });
  }
  function anyLocked(d) {
    return d.modules.some(function (m) {
      return m.lessons.some(function (l) {
        return AD.effectiveAccess(m, l) === 'premium' && l.urlEnc && !l.url;
      });
    });
  }
  function getStudentCode() {
    try { return (localStorage.getItem(K.code) || '').trim(); } catch (_e) { return ''; }
  }

  /* ─────────────────────────────────────────────
     Render del editor de módulos
     ───────────────────────────────────────────── */

  function sel(cur, val) { return cur === val ? ' selected' : ''; }

  function renderModules() {
    var host = $('#modules-host');
    if (!draft.modules.length) {
      host.innerHTML = '<div class="inline-note">Aún no hay módulos. Pulsa <b>Agregar módulo</b> para empezar.</div>';
      return;
    }
    host.innerHTML = draft.modules.map(function (m, i) {
      return moduleHTML(m, i);
    }).join('');
  }

  function moduleHTML(m, idx) {
    var open = !!openModules[m.id];
    var name = AD.pickLang(m.title) || '(módulo sin título)';
    var prem = m.access === 'premium';
    var lessons = m.lessons.map(function (l, li) { return lessonHTML(m, l, li); }).join('');

    return '' +
    '<div class="mod-editor' + (open ? ' open' : '') + '" data-id="' + esc(m.id) + '">' +
      '<div class="mod-editor-head">' +
        '<span class="drag-num">' + (idx + 1) + '</span>' +
        '<span class="mod-name">' + esc(name) + '</span>' +
        '<span class="mod-count">' + m.lessons.length + ' lección(es)</span>' +
        '<span class="les-access-pill ' + (prem ? 'premium' : 'public') + '">' + (prem ? 'Alumnos' : 'Público') + '</span>' +
        '<span class="row-tools">' +
          toolBtn('mod-up', m.id, '', 'bi-arrow-up', 'Subir') +
          toolBtn('mod-down', m.id, '', 'bi-arrow-down', 'Bajar') +
          toolBtn('mod-del', m.id, '', 'bi-trash', 'Eliminar', true) +
        '</span>' +
        '<i class="bi bi-chevron-down chev"></i>' +
      '</div>' +
      '<div class="mod-editor-body">' +
        fieldRow(
          textField('mod', m.id, '', 'title.es', 'Título', 'ES', m.title.es),
          textField('mod', m.id, '', 'title.en', 'Title', 'EN', m.title.en)
        ) +
        fieldRow(
          areaField('mod', m.id, '', 'description.es', 'Descripción', 'ES', m.description.es),
          areaField('mod', m.id, '', 'description.en', 'Description', 'EN', m.description.en)
        ) +
        fieldRow(
          '<div class="field"><label>Acceso</label><select data-scope="mod" data-id="' + esc(m.id) + '" data-path="access">' +
            '<option value="public"' + sel(m.access, 'public') + '>Público (todos)</option>' +
            '<option value="premium"' + sel(m.access, 'premium') + '>Alumnos (con código)</option>' +
          '</select></div>',
          '<div class="field"><label>Mostrar en perfil</label><select data-scope="mod" data-id="' + esc(m.id) + '" data-path="profile">' +
            '<option value="all"' + sel(m.profile, 'all') + '>Todos los perfiles</option>' +
            '<option value="aureon"' + sel(m.profile, 'aureon') + '>Solo AUREON</option>' +
            '<option value="hui"' + sel(m.profile, 'hui') + '>Solo HUI</option>' +
            '<option value="indira-y-hui"' + sel(m.profile, 'indira-y-hui') + '>Solo INDIRA Y HUI</option>' +
          '</select></div>'
        ) +
        '<div class="field"><label>Imagen de portada (ruta o URL — ej.: assets/v01.png)</label>' +
          '<input type="text" data-scope="mod" data-id="' + esc(m.id) + '" data-path="cover" value="' + esc(m.cover) + '" spellcheck="false"></div>' +
        '<div class="lessons-host">' + lessons + '</div>' +
        '<div class="admin-actions-row">' +
          '<button class="btn ghost small" data-act="les-add" data-mod="' + esc(m.id) + '"><i class="bi bi-plus"></i> Agregar lección</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function lessonHTML(m, l, idx) {
    var name = AD.pickLang(l.title) || '(lección sin título)';
    var acc = l.access || 'inherit';
    var pill = acc === 'premium'
      ? '<span class="les-access-pill premium">Alumnos</span>'
      : (acc === 'public' ? '<span class="les-access-pill public">Público</span>' : '');
    var urlLocked = (!l.url && l.urlEnc);

    return '' +
    '<div class="les-editor" data-id="' + esc(l.id) + '" data-mod="' + esc(m.id) + '">' +
      '<div class="les-editor-head">' +
        '<span class="les-ix">#' + (idx + 1) + '</span>' +
        '<span class="les-name">' + esc(name) + '</span>' +
        pill +
        '<span class="row-tools">' +
          toolBtn('les-up', l.id, m.id, 'bi-arrow-up', 'Subir') +
          toolBtn('les-down', l.id, m.id, 'bi-arrow-down', 'Bajar') +
          toolBtn('les-del', l.id, m.id, 'bi-trash', 'Eliminar', true) +
        '</span>' +
      '</div>' +
      '<div class="les-editor-grid">' +
        textField('les', l.id, m.id, 'title.es', 'Título', 'ES', l.title.es) +
        textField('les', l.id, m.id, 'title.en', 'Title', 'EN', l.title.en) +
        areaField('les', l.id, m.id, 'description.es', 'Descripción', 'ES', l.description.es) +
        areaField('les', l.id, m.id, 'description.en', 'Description', 'EN', l.description.en) +
        '<div class="field"><label>Tipo de contenido</label><select data-scope="les" data-id="' + esc(l.id) + '" data-mod="' + esc(m.id) + '" data-path="type">' +
          '<option value="youtube"' + sel(l.type, 'youtube') + '>YouTube</option>' +
          '<option value="drive"' + sel(l.type, 'drive') + '>Google Drive</option>' +
          '<option value="pdf"' + sel(l.type, 'pdf') + '>PDF</option>' +
          '<option value="link"' + sel(l.type, 'link') + '>Enlace / otro</option>' +
        '</select></div>' +
        '<div class="field"><label>Acceso</label><select data-scope="les" data-id="' + esc(l.id) + '" data-mod="' + esc(m.id) + '" data-path="access">' +
          '<option value="inherit"' + sel(acc, 'inherit') + '>Igual que el módulo</option>' +
          '<option value="public"' + sel(acc, 'public') + '>Público</option>' +
          '<option value="premium"' + sel(acc, 'premium') + '>Alumnos</option>' +
        '</select></div>' +
        '<div class="field full"><label>Enlace (URL)' +
          (urlLocked ? ' <span class="field-lang-tag">🔒 cifrado</span>' : '') + '</label>' +
          '<input type="text" data-scope="les" data-id="' + esc(l.id) + '" data-mod="' + esc(m.id) + '" data-path="url" ' +
          'value="' + esc(l.url) + '" spellcheck="false" placeholder="' +
          (urlLocked ? 'Contenido cifrado — ve a Ajustes › Cargar contenido de alumnos para editarlo' : 'https://...') + '"></div>' +
        '<div class="field"><label>Miniatura (opcional — ruta o URL)</label>' +
          '<input type="text" data-scope="les" data-id="' + esc(l.id) + '" data-mod="' + esc(m.id) + '" data-path="thumbnail" value="' + esc(l.thumbnail) + '" spellcheck="false" placeholder="(YouTube se toma sola)"></div>' +
        '<div class="field"><label>Duración (opcional)</label>' +
          '<input type="text" data-scope="les" data-id="' + esc(l.id) + '" data-mod="' + esc(m.id) + '" data-path="duration" value="' + esc(l.duration) + '" placeholder="Ej.: 12:30"></div>' +
      '</div>' +
    '</div>';
  }

  function toolBtn(act, id, mod, icon, title, danger) {
    return '<button class="icon-btn' + (danger ? ' danger' : '') + '" data-act="' + act + '" data-id="' + esc(id) + '"' +
      (mod ? ' data-mod="' + esc(mod) + '"' : '') + ' title="' + esc(title) + '"><i class="bi ' + icon + '"></i></button>';
  }
  function fieldRow(a, b) { return '<div class="field-row">' + a + b + '</div>'; }
  function textField(scope, id, mod, path, label, tag, val) {
    return '<div class="field"><label>' + esc(label) + ' <span class="field-lang-tag">' + tag + '</span></label>' +
      '<input type="text" data-scope="' + scope + '" data-id="' + esc(id) + '"' + (mod ? ' data-mod="' + esc(mod) + '"' : '') +
      ' data-path="' + path + '" value="' + esc(val) + '" spellcheck="false"></div>';
  }
  function areaField(scope, id, mod, path, label, tag, val) {
    return '<div class="field"><label>' + esc(label) + ' <span class="field-lang-tag">' + tag + '</span></label>' +
      '<textarea data-scope="' + scope + '" data-id="' + esc(id) + '"' + (mod ? ' data-mod="' + esc(mod) + '"' : '') +
      ' data-path="' + path + '">' + esc(val) + '</textarea></div>';
  }

  /* ─────────────────────────────────────────────
     Eventos del editor (delegación)
     ───────────────────────────────────────────── */

  function bindModulesHost() {
    var host = $('#modules-host');

    host.addEventListener('input', function (e) {
      var t = e.target;
      if (!t.dataset || !t.dataset.scope) return;
      applyField(t);
      if (t.dataset.scope === 'mod') updateModName(t.dataset.id);
      if (t.dataset.scope === 'les') updateLesName(t.dataset.mod, t.dataset.id);
      scheduleSave();
    });

    host.addEventListener('change', function (e) {
      var t = e.target;
      if (!t.dataset || !t.dataset.scope || t.tagName !== 'SELECT') return;
      applyField(t);
      save();
      if (t.dataset.path === 'access' || t.dataset.path === 'type') renderModules();
    });

    host.addEventListener('click', function (e) {
      var actBtn = e.target.closest('[data-act]');
      if (actBtn) {
        e.preventDefault();
        handleAct(actBtn.getAttribute('data-act'), actBtn.getAttribute('data-id'), actBtn.getAttribute('data-mod'));
        return;
      }
      var head = e.target.closest('.mod-editor-head');
      if (head) {
        var ed = head.closest('.mod-editor');
        var id = ed.getAttribute('data-id');
        var nowOpen = !ed.classList.contains('open');
        ed.classList.toggle('open', nowOpen);
        if (nowOpen) openModules[id] = true; else delete openModules[id];
      }
    });
  }

  function applyField(t) {
    var path = t.dataset.path;
    var val = t.value;
    if (t.dataset.scope === 'mod') {
      var m = getModule(t.dataset.id);
      if (m) setPath(m, path, val);
    } else {
      var l = getLesson(t.dataset.mod, t.dataset.id);
      if (l) setPath(l, path, val);
    }
  }

  function updateModName(id) {
    var m = getModule(id);
    var node = $('.mod-editor[data-id="' + cssEsc(id) + '"] .mod-name');
    if (m && node) node.textContent = AD.pickLang(m.title) || '(módulo sin título)';
  }
  function updateLesName(modId, lesId) {
    var l = getLesson(modId, lesId);
    var node = $('.les-editor[data-id="' + cssEsc(lesId) + '"] .les-name');
    if (l && node) node.textContent = AD.pickLang(l.title) || '(lección sin título)';
  }
  function cssEsc(s) { return String(s).replace(/["\\]/g, '\\$&'); }

  /* ---- Acciones estructurales ---- */
  function handleAct(act, id, mod) {
    switch (act) {
      case 'mod-up': moveModule(id, -1); break;
      case 'mod-down': moveModule(id, 1); break;
      case 'mod-del': delModule(id); break;
      case 'les-add': addLesson(id); break;       // aquí id = modId (data-mod en el botón)
      case 'les-up': moveLesson(mod, id, -1); break;
      case 'les-down': moveLesson(mod, id, 1); break;
      case 'les-del': delLesson(mod, id); break;
    }
  }

  function addModule() {
    var m = AD.normalizeModule({ title: { es: 'Nuevo módulo', en: '' }, access: 'public' });
    draft.modules.push(m);
    openModules[m.id] = true;
    save();
    switchTab('content');
    renderModules();
    var node = $('.mod-editor[data-id="' + cssEsc(m.id) + '"]');
    if (node) node.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function delModule(id) {
    var m = getModule(id);
    var name = (m && AD.pickLang(m.title)) || 'este módulo';
    if (!confirm('¿Eliminar el módulo "' + name + '" y todas sus lecciones?')) return;
    draft.modules = draft.modules.filter(function (x) { return x.id !== id; });
    delete openModules[id];
    save();
    renderModules();
  }

  function moveModule(id, dir) {
    var i = draft.modules.findIndex(function (m) { return m.id === id; });
    var j = i + dir;
    if (i < 0 || j < 0 || j >= draft.modules.length) return;
    var tmp = draft.modules[i]; draft.modules[i] = draft.modules[j]; draft.modules[j] = tmp;
    save();
    renderModules();
  }

  function addLesson(modId) {
    var m = getModule(modId);
    if (!m) return;
    var l = AD.normalizeLesson({ title: { es: 'Nueva lección', en: '' }, type: 'youtube', access: 'inherit' });
    m.lessons.push(l);
    openModules[modId] = true;
    save();
    renderModules();
    var node = $('.les-editor[data-id="' + cssEsc(l.id) + '"]');
    if (node) node.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function delLesson(modId, lesId) {
    var m = getModule(modId);
    if (!m) return;
    if (!confirm('¿Eliminar esta lección?')) return;
    m.lessons = m.lessons.filter(function (l) { return l.id !== lesId; });
    save();
    renderModules();
  }

  function moveLesson(modId, lesId, dir) {
    var m = getModule(modId);
    if (!m) return;
    var i = m.lessons.findIndex(function (l) { return l.id === lesId; });
    var j = i + dir;
    if (i < 0 || j < 0 || j >= m.lessons.length) return;
    var tmp = m.lessons[i]; m.lessons[i] = m.lessons[j]; m.lessons[j] = tmp;
    save();
    renderModules();
  }

  /* ─────────────────────────────────────────────
     Ajustes (intro + premium)
     ───────────────────────────────────────────── */

  function loadSettingsIntoForm() {
    $('#set-intro-es').value = (draft.settings.intro && draft.settings.intro.es) || '';
    $('#set-intro-en').value = (draft.settings.intro && draft.settings.intro.en) || '';
    var p = draft.settings.premium || {};
    $('#set-prem-enabled').checked = !!p.enabled;
    $('#set-hint-es').value = (p.hint && p.hint.es) || '';
    $('#set-hint-en').value = (p.hint && p.hint.en) || '';
    $('#set-student-code').value = getStudentCode();
  }

  function bindSettings() {
    $('#set-intro-es').addEventListener('input', function () {
      setPath(draft, 'settings.intro.es', this.value); scheduleSave();
    });
    $('#set-intro-en').addEventListener('input', function () {
      setPath(draft, 'settings.intro.en', this.value); scheduleSave();
    });
    $('#set-prem-enabled').addEventListener('change', function () {
      setPath(draft, 'settings.premium.enabled', this.checked); save();
    });
    $('#set-hint-es').addEventListener('input', function () {
      setPath(draft, 'settings.premium.hint.es', this.value); scheduleSave();
    });
    $('#set-hint-en').addEventListener('input', function () {
      setPath(draft, 'settings.premium.hint.en', this.value); scheduleSave();
    });
    $('#set-student-code').addEventListener('input', function () {
      var v = this.value.trim();
      try { localStorage.setItem(K.code, v); } catch (_e) {}
      var changed = originalCode && v && v !== originalCode;
      $('#code-change-warn').style.display = changed ? 'block' : 'none';
    });
    $('#btn-load-premium').addEventListener('click', function () {
      var code = $('#set-student-code').value.trim();
      if (!code) { toast('Escribe primero el código de alumnos.', 'error'); return; }
      try { localStorage.setItem(K.code, code); } catch (_e) {}
      decryptDraftPremium(code).then(function (r) {
        if (!r.ok) { toast('No se pudo: ' + (r.reason || 'código incorrecto') + '.', 'error'); return; }
        save();
        renderModules();
        toast('Contenido de alumnos cargado (' + r.count + ' enlace(s)).', 'ok');
      });
    });
  }

  function decryptDraftPremium(code) {
    var prem = draft.settings.premium;
    if (!prem || !prem.salt || !prem.verifier) return Promise.resolve({ ok: false, reason: 'no hay contenido cifrado' });
    return AD.deriveKey(code, prem.salt, prem.iterations).then(function (key) {
      return AD.checkVerifier(prem.verifier, key).then(function (ok) {
        if (!ok) return { ok: false, reason: 'código incorrecto' };
        var chain = Promise.resolve(), n = 0;
        draft.modules.forEach(function (m) {
          m.lessons.forEach(function (l) {
            if (l.urlEnc && !l.url) {
              chain = chain.then(function () {
                return AD.decryptText(l.urlEnc, key).then(function (u) { l.url = u; n++; }).catch(function () {});
              });
            }
          });
        });
        return chain.then(function () { return { ok: true, count: n }; });
      });
    }).catch(function () { return { ok: false, reason: 'error' }; });
  }

  /* ─────────────────────────────────────────────
     Conexión (GitHub) + contraseña
     ───────────────────────────────────────────── */

  function getGhConfig() {
    var c = {};
    try { c = JSON.parse(localStorage.getItem(K.gh) || '{}'); } catch (_e) {}
    return {
      owner: c.owner || '', repo: c.repo || '',
      branch: c.branch || 'main', path: c.path || 'data/lecciones.json'
    };
  }
  function getToken() { try { return localStorage.getItem(K.token) || ''; } catch (_e) { return ''; } }

  function bindConnect() {
    var cfg = getGhConfig();
    $('#gh-owner').value = cfg.owner;
    $('#gh-repo').value = cfg.repo;
    $('#gh-branch').value = cfg.branch;
    $('#gh-path').value = cfg.path;
    $('#gh-token').value = getToken();

    $('#btn-save-conn').addEventListener('click', function () {
      var c = {
        owner: $('#gh-owner').value.trim(),
        repo: $('#gh-repo').value.trim(),
        branch: $('#gh-branch').value.trim() || 'main',
        path: $('#gh-path').value.trim() || 'data/lecciones.json'
      };
      try {
        localStorage.setItem(K.gh, JSON.stringify(c));
        localStorage.setItem(K.token, $('#gh-token').value.trim());
      } catch (_e) {}
      toast('Conexión guardada en este navegador.', 'ok');
    });

    $('#btn-test-conn').addEventListener('click', testConnection);
    $('#btn-change-pw').addEventListener('click', changePassword);
  }

  function ghHeaders(token) {
    return {
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };
  }

  function ghContentsUrl(cfg) {
    return 'https://api.github.com/repos/' + encodeURIComponent(cfg.owner) + '/' +
      encodeURIComponent(cfg.repo) + '/contents/' + cfg.path.split('/').map(encodeURIComponent).join('/');
  }

  function ghGetSha(cfg, token) {
    return fetch(ghContentsUrl(cfg) + '?ref=' + encodeURIComponent(cfg.branch), { headers: ghHeaders(token) })
      .then(function (res) {
        if (res.status === 200) return res.json().then(function (j) { return j.sha; });
        if (res.status === 404) return null;
        return res.text().then(function (t) { throw new Error('GitHub ' + res.status + ': ' + shortErr(t)); });
      });
  }

  function ghPut(cfg, token, contentStr, sha) {
    var body = {
      message: 'Aula virtual: actualizar lecciones (' + new Date().toLocaleString('es') + ')',
      content: b64utf8(contentStr),
      branch: cfg.branch
    };
    if (sha) body.sha = sha;
    return fetch(ghContentsUrl(cfg), {
      method: 'PUT',
      headers: Object.assign({ 'Content-Type': 'application/json' }, ghHeaders(token)),
      body: JSON.stringify(body)
    }).then(function (res) {
      if (res.ok) return res.json();
      return res.text().then(function (t) { throw new Error('GitHub ' + res.status + ': ' + shortErr(t)); });
    });
  }

  function shortErr(t) {
    try { var j = JSON.parse(t); return j.message || t; } catch (_e) { return (t || '').slice(0, 140); }
  }

  function testConnection() {
    var cfg = {
      owner: $('#gh-owner').value.trim(), repo: $('#gh-repo').value.trim(),
      branch: $('#gh-branch').value.trim() || 'main', path: $('#gh-path').value.trim() || 'data/lecciones.json'
    };
    var token = $('#gh-token').value.trim();
    var msg = $('#conn-msg');
    if (!cfg.owner || !cfg.repo || !token) {
      msg.className = 'code-msg error'; msg.textContent = 'Completa usuario, repositorio y token.';
      return;
    }
    msg.className = 'code-msg'; msg.textContent = 'Probando…';
    ghGetSha(cfg, token).then(function (sha) {
      msg.className = 'code-msg ok';
      msg.textContent = sha
        ? '✓ Conexión correcta. El archivo existe y se puede actualizar.'
        : '✓ Conexión correcta. El archivo aún no existe; se creará al publicar.';
    }).catch(function (e) {
      msg.className = 'code-msg error';
      msg.textContent = '✗ ' + e.message;
    });
  }

  function changePassword() {
    var cur = $('#pw-current').value, nw = $('#pw-new').value, msg = $('#pw-msg');
    var stored = null; try { stored = localStorage.getItem(K.pass); } catch (_e) {}
    if (nw.length < 4) { msg.className = 'code-msg error'; msg.textContent = 'La nueva debe tener al menos 4 caracteres.'; return; }
    sha256(cur).then(function (h) {
      if (h !== stored) { msg.className = 'code-msg error'; msg.textContent = 'La contraseña actual no es correcta.'; return; }
      return sha256(nw).then(function (hn) {
        try { localStorage.setItem(K.pass, hn); } catch (_e) {}
        msg.className = 'code-msg ok'; msg.textContent = 'Contraseña actualizada.';
        $('#pw-current').value = ''; $('#pw-new').value = '';
      });
    });
  }

  /* ─────────────────────────────────────────────
     Construir el JSON publicable (cifra premium)
     ───────────────────────────────────────────── */

  function buildPublished() {
    var d = deepCopy(draft);
    var prem = d.settings.premium || {};
    var enabled = !!prem.enabled;
    var hasPrem = anyPremium(d);
    var code = getStudentCode();

    if (hasPrem && (!enabled || !code)) {
      return Promise.reject(new Error(
        !enabled
          ? 'Tienes contenido para alumnos: activa "Contenido para alumnos" en Ajustes.'
          : 'Falta el código de alumnos: defínelo en Ajustes.'
      ));
    }

    var out = {
      version: 1,
      updatedAt: new Date().toISOString(),
      settings: {
        intro: lobj(d.settings.intro),
        premium: {
          enabled: enabled,
          salt: prem.salt || '',
          iterations: AD.CRYPTO.iterations,
          verifier: prem.verifier || '',
          hint: lobj(prem.hint)
        }
      },
      modules: []
    };

    var keyP;
    var codeChanged = false;

    if (enabled && hasPrem) {
      if (!out.settings.premium.salt) out.settings.premium.salt = AD.randomSaltB64();
      keyP = AD.deriveKey(code, out.settings.premium.salt, out.settings.premium.iterations)
        .then(function (key) {
          var pre = Promise.resolve();
          if (out.settings.premium.verifier) {
            pre = AD.checkVerifier(out.settings.premium.verifier, key).then(function (ok) { codeChanged = !ok; });
          }
          return pre.then(function () {
            return AD.makeVerifier(key).then(function (v) { out.settings.premium.verifier = v; return key; });
          });
        });
    } else {
      // sin premium activo → no se cifra nada; limpiar verifier
      out.settings.premium.verifier = enabled ? (prem.verifier || '') : '';
      keyP = Promise.resolve(null);
    }

    return keyP.then(function (key) {
      var chain = Promise.resolve();
      d.modules.forEach(function (m, mi) {
        var om = {
          id: m.id, title: lobj(m.title), description: lobj(m.description),
          access: m.access === 'premium' ? 'premium' : 'public',
          profile: m.profile || 'all', cover: m.cover || '', order: mi, lessons: []
        };
        out.modules.push(om);
        m.lessons.forEach(function (l, li) {
          var eff = AD.effectiveAccess(m, l);
          var ol = {
            id: l.id, title: lobj(l.title), description: lobj(l.description),
            type: l.type || 'link', url: '', urlEnc: '',
            thumbnail: l.thumbnail || '', duration: l.duration || '',
            access: l.access || 'inherit', order: li
          };
          om.lessons.push(ol);
          if (eff === 'premium' && enabled && key) {
            if (l.url) {
              chain = chain.then(function () {
                return AD.encryptText(l.url, key).then(function (ct) { ol.urlEnc = ct; });
              });
            } else if (l.urlEnc) {
              ol.urlEnc = l.urlEnc; // preservar contenido bloqueado
            }
          } else {
            ol.url = l.url || '';
          }
        });
      });
      return chain.then(function () {
        return { json: out, codeChanged: codeChanged, hasLocked: anyLocked(d) };
      });
    });
  }

  /* ─────────────────────────────────────────────
     Publicar / Exportar / Importar / Vista previa
     ───────────────────────────────────────────── */

  function setPublishBusy(busy) {
    publishing = busy;
    var b = $('#btn-publish');
    b.disabled = busy;
    b.innerHTML = busy
      ? '<i class="bi bi-arrow-repeat"></i> Publicando…'
      : '<i class="bi bi-cloud-arrow-up-fill"></i> Publicar';
  }

  function publish() {
    if (publishing) return;
    var cfg = getGhConfig();
    var token = getToken();
    if (!cfg.owner || !cfg.repo || !token) {
      toast('Primero configura la conexión a GitHub.', 'error');
      switchTab('connect');
      return;
    }
    buildPublished().then(function (built) {
      if (built.codeChanged && built.hasLocked &&
          !confirm('Cambiaste el código y hay enlaces de alumnos que no se pudieron volver a cifrar. ¿Publicar de todos modos?')) {
        return;
      }
      if (!confirm('¿Publicar los cambios?\nSe verán en tu sitio en aproximadamente 1 minuto.')) return;

      setPublishBusy(true);
      var contentStr = JSON.stringify(built.json, null, 2);
      ghGetSha(cfg, token).then(function (sha) {
        return ghPut(cfg, token, contentStr, sha);
      }).then(function () {
        // reflejar salt/verifier resultantes en el borrador
        draft.settings.premium.salt = built.json.settings.premium.salt;
        draft.settings.premium.verifier = built.json.settings.premium.verifier;
        if ($('#set-student-code').value.trim()) originalCode = $('#set-student-code').value.trim();
        $('#code-change-warn').style.display = 'none';
        save();
        toast('¡Publicado! Tu sitio se actualizará en ~1 minuto.', 'ok', 6000);
      }).catch(function (e) {
        toast('No se pudo publicar. ' + e.message, 'error', 9000);
      }).finally(function () { setPublishBusy(false); });
    }).catch(function (e) {
      toast(e.message, 'error', 7000);
      switchTab(e.message.indexOf('código') >= 0 || e.message.indexOf('alumnos') >= 0 ? 'settings' : 'content');
    });
  }

  function exportJson() {
    buildPublished().then(function (built) {
      var blob = new Blob([JSON.stringify(built.json, null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'lecciones.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1500);
      toast('Archivo lecciones.json descargado (respaldo).', 'ok');
    }).catch(function (e) { toast(e.message, 'error', 7000); switchTab('settings'); });
  }

  function importJson(e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!confirm('Importar reemplazará el contenido actual del editor. ¿Continuar?')) { e.target.value = ''; return; }
    var reader = new FileReader();
    reader.onload = function () {
      try {
        draft = AD.normalize(JSON.parse(reader.result));
        var code = getStudentCode();
        var done = code ? decryptDraftPremium(code) : Promise.resolve();
        done.then(function () {
          save();
          loadSettingsIntoForm();
          renderModules();
          switchTab('content');
          toast('Contenido importado.', 'ok');
        });
      } catch (err) {
        toast('No se pudo leer el archivo: ' + err.message, 'error', 7000);
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  }

  function preview() {
    buildPublished().then(function (built) {
      try { localStorage.setItem('znqg-aula-preview', JSON.stringify(built.json)); } catch (_e) {}
      window.open('aula.html?preview=1', '_blank');
    }).catch(function (e) { toast(e.message, 'error', 7000); switchTab('settings'); });
  }

  /* ─────────────────────────────────────────────
     Ayuda
     ───────────────────────────────────────────── */

  function renderHelp() {
    $('#help-host').innerHTML =
      '<h2><i class="bi bi-question-circle"></i> Cómo usar el panel</h2>' +
      '<div class="card-hint" style="font-size:0.9rem;line-height:1.8;">' +
        '<p style="margin-bottom:14px;"><b>1. Edita el contenido.</b> En la pestaña <b>Contenido</b> creas módulos y, dentro de cada uno, lecciones (YouTube, Drive, PDF o enlace). Escribe al menos el título en español; el inglés es opcional.</p>' +
        '<p style="margin-bottom:14px;"><b>2. Contenido para alumnos.</b> Marca un módulo como <b>Alumnos</b> para protegerlo. En <b>Ajustes</b> activa "Contenido para alumnos" y define el <b>código</b> que compartirás con ellos. Los enlaces protegidos se guardan cifrados: sin el código, nadie puede abrirlos.</p>' +
        '<p style="margin-bottom:14px;"><b>3. Revisa.</b> Pulsa <b>Vista previa</b> para ver el aula tal como quedará, sin publicar todavía.</p>' +
        '<p style="margin-bottom:14px;"><b>4. Publica.</b> Pulsa <b>Publicar</b>. Los cambios aparecen en el sitio en ~1 minuto. (También puedes <b>Exportar</b> un respaldo del contenido.)</p>' +
      '</div>' +
      '<h2 style="margin-top:24px;"><i class="bi bi-github"></i> Conectar con GitHub (una sola vez)</h2>' +
      '<div class="card-hint" style="font-size:0.9rem;line-height:1.8;">' +
        '<p style="margin-bottom:10px;">Para que el botón <b>Publicar</b> funcione, necesitas un <b>token</b> de GitHub:</p>' +
        '<ol style="list-style:decimal;padding-left:22px;margin-bottom:14px;">' +
          '<li>Entra a <a class="muted-link" href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">github.com → Settings → Developer settings → Fine-grained tokens</a>.</li>' +
          '<li>En <b>Repository access</b> elige <b>Only select repositories</b> y selecciona tu repositorio del sitio.</li>' +
          '<li>En <b>Permissions › Repository permissions › Contents</b>, elige <b>Read and write</b>.</li>' +
          '<li>Genera el token, cópialo y pégalo en la pestaña <b>Conexión</b>, junto con tu usuario y el nombre del repositorio. Pulsa <b>Guardar</b> y luego <b>Probar conexión</b>.</li>' +
        '</ol>' +
        '<div class="inline-note warn">Por seguridad, usa este panel solo en tu computadora de confianza. El token, el código de alumnos y la contraseña se guardan únicamente en este navegador, nunca se suben al sitio.</div>' +
      '</div>';
  }

  /* ─────────────────────────────────────────────
     Arranque
     ───────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', initGate);
})();
