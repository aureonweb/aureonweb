/**
 * ============================================================
 *  aula-data.js — Aula Virtual: carga de datos, helpers y cifrado
 *  Zhineng Qigong · Indira-Web
 * ============================================================
 *  Módulo COMPARTIDO entre la página del aula (aula.js) y el
 *  panel de administración (admin.js).
 *
 *  Responsabilidades:
 *    • Cargar y normalizar data/lecciones.json
 *    • Helpers para YouTube / Google Drive / PDF / enlaces
 *    • Cifrado AES-GCM (Web Crypto) de los enlaces premium,
 *      con clave derivada del "código de alumnos" via PBKDF2.
 *
 *  Expone:  window.AulaData
 * ============================================================
 */

window.AulaData = (function () {
  'use strict';

  /* ─────────────────────────────────────────────
     Parámetros de cifrado (NO cambiar a la ligera:
     deben coincidir entre cifrar y descifrar)
     ───────────────────────────────────────────── */
  var CRYPTO = {
    iterations: 150000,        // PBKDF2
    hash: 'SHA-256',
    keyLength: 256,            // AES-GCM 256
    ivBytes: 12,
    saltBytes: 16,
    verifierText: 'znqg-aula-ok' // texto conocido para validar el código
  };

  var DATA_URL = 'data/lecciones.json';

  /* ─────────────────────────────────────────────
     Utilidades base64 / texto
     ───────────────────────────────────────────── */

  function bufToB64(buf) {
    var bytes = new Uint8Array(buf);
    var bin = '';
    for (var i = 0; i < bytes.length; i++) {
      bin += String.fromCharCode(bytes[i]);
    }
    return btoa(bin);
  }

  function b64ToBuf(b64) {
    var bin = atob(b64);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) {
      bytes[i] = bin.charCodeAt(i);
    }
    return bytes.buffer;
  }

  function strToBuf(str) {
    return new TextEncoder().encode(str);
  }

  function bufToStr(buf) {
    return new TextDecoder().decode(buf);
  }

  /* ─────────────────────────────────────────────
     Idioma actual (se apoya en I18n si existe)
     ───────────────────────────────────────────── */

  function getLang() {
    if (window.I18n && typeof window.I18n.getCurrentLanguage === 'function') {
      return window.I18n.getCurrentLanguage();
    }
    try {
      return localStorage.getItem('vidaznqg_lang') || 'es';
    } catch (_e) {
      return 'es';
    }
  }

  /**
   * Devuelve el texto del idioma pedido desde un objeto {es, en}.
   * Si falta, cae a español, luego inglés, luego cadena vacía.
   * Acepta también strings simples (devuelve tal cual).
   */
  function pickLang(value, lang) {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    lang = lang || getLang();
    if (value[lang] && String(value[lang]).trim() !== '') return value[lang];
    if (value.es && String(value.es).trim() !== '') return value.es;
    if (value.en && String(value.en).trim() !== '') return value.en;
    return '';
  }

  /* ─────────────────────────────────────────────
     Helpers de proveedores de video / archivos
     ───────────────────────────────────────────── */

  function youtubeId(url) {
    if (!url) return '';
    var m = String(url).match(
      /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
    );
    return m ? m[1] : '';
  }

  function youtubeListId(url) {
    if (!url) return '';
    var m = String(url).match(/[?&]list=([A-Za-z0-9_-]+)/);
    return m ? m[1] : '';
  }

  function youtubeThumb(url) {
    var id = youtubeId(url);
    return id ? 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg' : '';
  }

  function youtubeEmbed(url) {
    var id = youtubeId(url);
    if (!id) return '';
    var src = 'https://www.youtube.com/embed/' + id + '?rel=0&modestbranding=1';
    var list = youtubeListId(url);
    if (list) src += '&list=' + list;
    return src;
  }

  function driveId(url) {
    if (!url) return '';
    var m = String(url).match(/\/d\/([A-Za-z0-9_-]+)/) ||
            String(url).match(/[?&]id=([A-Za-z0-9_-]+)/);
    return m ? m[1] : '';
  }

  function driveEmbed(url) {
    // Documentos / archivos de Drive admiten /preview en un iframe.
    var u = String(url || '');
    var id = driveId(u);
    if (/document\.google\.com|docs\.google\.com\/document/.test(u) && id) {
      return 'https://docs.google.com/document/d/' + id + '/preview';
    }
    if (/spreadsheets/.test(u) && id) {
      return 'https://docs.google.com/spreadsheets/d/' + id + '/preview';
    }
    if (/presentation/.test(u) && id) {
      return 'https://docs.google.com/presentation/d/' + id + '/preview';
    }
    if (id) {
      return 'https://drive.google.com/file/d/' + id + '/preview';
    }
    return '';
  }

  /**
   * Decide cómo mostrar una lección ya con su URL en claro.
   * Devuelve { kind: 'iframe'|'link', src, raw }.
   */
  function embedFor(type, url) {
    var raw = url || '';
    switch (type) {
      case 'youtube': {
        var ye = youtubeEmbed(raw);
        return ye ? { kind: 'iframe', src: ye, raw: raw }
                  : { kind: 'link', src: raw, raw: raw };
      }
      case 'drive': {
        var de = driveEmbed(raw);
        return de ? { kind: 'iframe', src: de, raw: raw }
                  : { kind: 'link', src: raw, raw: raw };
      }
      case 'pdf': {
        // Si es un PDF de Drive, usar preview; si es un PDF directo, incrustarlo.
        var dp = driveEmbed(raw);
        if (dp) return { kind: 'iframe', src: dp, raw: raw };
        return { kind: 'iframe', src: raw, raw: raw };
      }
      default:
        return { kind: 'link', src: raw, raw: raw };
    }
  }

  /**
   * Miniatura por defecto según el tipo, cuando la lección no trae una.
   */
  function autoThumb(type, url) {
    if (type === 'youtube') {
      var t = youtubeThumb(url);
      if (t) return t;
    }
    return '';
  }

  /* ─────────────────────────────────────────────
     Cifrado AES-GCM con clave derivada (PBKDF2)
     ───────────────────────────────────────────── */

  function randomBytes(n) {
    var b = new Uint8Array(n);
    crypto.getRandomValues(b);
    return b;
  }

  function randomSaltB64() {
    return bufToB64(randomBytes(CRYPTO.saltBytes).buffer);
  }

  /**
   * Deriva una clave AES-GCM a partir del código de alumnos.
   * @returns {Promise<CryptoKey>}
   */
  function deriveKey(code, saltB64, iterations) {
    var baseKeyP = crypto.subtle.importKey(
      'raw', strToBuf(code), { name: 'PBKDF2' }, false, ['deriveKey']
    );
    return baseKeyP.then(function (baseKey) {
      return crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: b64ToBuf(saltB64),
          iterations: iterations || CRYPTO.iterations,
          hash: CRYPTO.hash
        },
        baseKey,
        { name: 'AES-GCM', length: CRYPTO.keyLength },
        false,
        ['encrypt', 'decrypt']
      );
    });
  }

  /**
   * Cifra un texto. Formato de salida: "v1:<b64 iv>:<b64 ct>"
   * (el ciphertext de Web Crypto ya incluye el tag de autenticación).
   * @returns {Promise<string>}
   */
  function encryptText(plain, key) {
    var iv = randomBytes(CRYPTO.ivBytes);
    return crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv }, key, strToBuf(plain)
    ).then(function (ct) {
      return 'v1:' + bufToB64(iv.buffer) + ':' + bufToB64(ct);
    });
  }

  /**
   * Descifra un payload "v1:iv:ct". Lanza error si la clave es incorrecta.
   * @returns {Promise<string>}
   */
  function decryptText(payload, key) {
    var parts = String(payload || '').split(':');
    if (parts.length !== 3 || parts[0] !== 'v1') {
      return Promise.reject(new Error('Formato cifrado inválido'));
    }
    var iv = new Uint8Array(b64ToBuf(parts[1]));
    return crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv }, key, b64ToBuf(parts[2])
    ).then(function (buf) {
      return bufToStr(buf);
    });
  }

  function makeVerifier(key) {
    return encryptText(CRYPTO.verifierText, key);
  }

  /**
   * Comprueba que la clave (derivada del código) es correcta,
   * descifrando el verificador y comparándolo con el texto conocido.
   * @returns {Promise<boolean>}
   */
  function checkVerifier(payload, key) {
    return decryptText(payload, key).then(function (txt) {
      return txt === CRYPTO.verifierText;
    }).catch(function () {
      return false;
    });
  }

  /* ─────────────────────────────────────────────
     Carga y normalización del contenido
     ───────────────────────────────────────────── */

  function uid(prefix) {
    return (prefix || 'id') + '-' +
      Date.now().toString(36) + '-' +
      Math.random().toString(36).slice(2, 7);
  }

  function emptyContent() {
    return {
      version: 1,
      updatedAt: '',
      settings: {
        intro: { es: '', en: '' },
        premium: {
          enabled: false,
          salt: '',
          iterations: CRYPTO.iterations,
          verifier: '',
          hint: { es: '', en: '' }
        }
      },
      modules: []
    };
  }

  function normLangObj(v) {
    if (v == null) return { es: '', en: '' };
    if (typeof v === 'string') return { es: v, en: '' };
    return { es: v.es || '', en: v.en || '' };
  }

  function normalizeLesson(les) {
    les = les || {};
    return {
      id: les.id || uid('les'),
      title: normLangObj(les.title),
      description: normLangObj(les.description),
      type: les.type || 'youtube',          // youtube | drive | pdf | link
      url: les.url || '',                    // en claro (público o borrador admin)
      urlEnc: les.urlEnc || '',              // cifrado (premium publicado)
      thumbnail: les.thumbnail || '',
      duration: les.duration || '',
      access: les.access || 'inherit',       // inherit | public | premium
      order: typeof les.order === 'number' ? les.order : 0
    };
  }

  function normalizeModule(mod) {
    mod = mod || {};
    var lessons = (mod.lessons || []).map(normalizeLesson);
    lessons.sort(function (a, b) { return a.order - b.order; });
    return {
      id: mod.id || uid('mod'),
      title: normLangObj(mod.title),
      description: normLangObj(mod.description),
      access: mod.access === 'premium' ? 'premium' : 'public',
      profile: mod.profile || 'all',         // all | aureon | hui | indira-y-hui
      cover: mod.cover || '',
      order: typeof mod.order === 'number' ? mod.order : 0,
      lessons: lessons
    };
  }

  function normalize(data) {
    var base = emptyContent();
    if (!data || typeof data !== 'object') return base;

    base.version = data.version || 1;
    base.updatedAt = data.updatedAt || '';

    var s = data.settings || {};
    base.settings.intro = normLangObj(s.intro);
    var p = s.premium || {};
    base.settings.premium = {
      enabled: !!p.enabled,
      salt: p.salt || '',
      iterations: p.iterations || CRYPTO.iterations,
      verifier: p.verifier || '',
      hint: normLangObj(p.hint)
    };

    base.modules = (data.modules || []).map(normalizeModule);
    base.modules.sort(function (a, b) { return a.order - b.order; });
    return base;
  }

  /**
   * Acceso efectivo de una lección: si es 'inherit', toma el del módulo.
   */
  function effectiveAccess(mod, les) {
    if (!les || les.access === 'inherit' || !les.access) {
      return mod ? mod.access : 'public';
    }
    return les.access;
  }

  /**
   * Carga el JSON publicado. Acepta cache-busting opcional.
   * @returns {Promise<Object>} contenido normalizado
   */
  function loadContent(opts) {
    opts = opts || {};
    var url = DATA_URL + (opts.bust ? ('?t=' + Date.now()) : '');
    return fetch(url, { cache: opts.bust ? 'no-store' : 'default' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (json) { return normalize(json); })
      .catch(function (err) {
        console.warn('[AulaData] No se pudo cargar ' + url + ':', err);
        return emptyContent();
      });
  }

  /* ─────────────────────────────────────────────
     API pública
     ───────────────────────────────────────────── */
  return {
    CRYPTO: CRYPTO,
    DATA_URL: DATA_URL,

    // idioma / texto
    getLang: getLang,
    pickLang: pickLang,

    // proveedores
    youtubeId: youtubeId,
    youtubeThumb: youtubeThumb,
    youtubeEmbed: youtubeEmbed,
    driveId: driveId,
    driveEmbed: driveEmbed,
    embedFor: embedFor,
    autoThumb: autoThumb,

    // cifrado
    randomSaltB64: randomSaltB64,
    deriveKey: deriveKey,
    encryptText: encryptText,
    decryptText: decryptText,
    makeVerifier: makeVerifier,
    checkVerifier: checkVerifier,

    // datos
    uid: uid,
    emptyContent: emptyContent,
    normalize: normalize,
    normalizeModule: normalizeModule,
    normalizeLesson: normalizeLesson,
    effectiveAccess: effectiveAccess,
    loadContent: loadContent
  };
})();
