/* ==========================================================================
   i18n.js — Internationalization System for Vida ZhìNéng QìGōng
   Supports: Español (es) | English (en)
   Usage:
     - Add data-i18n="key" to any element for innerHTML translation
     - Add data-i18n-placeholder="key" to any input/textarea for placeholder
     - Language buttons: <button class="lang-btn" data-lang="es">ES</button>
     - Dispatches 'languageChanged' event on document when language changes
   ========================================================================== */

;(function () {
  'use strict';

  /* ---------- Translation dictionary ---------- */
  const translations = {

    /* ============================
       ESPAÑOL
       ============================ */
    es: {

      /* — Navigation — */
      'nav.home':       'Inicio',
      'nav.qigong':     'Zhineng Qigong',
      'nav.activities':  'Actividades',
      'nav.about':      'Quiénes Somos',
      'nav.contact':    'Contacto',
      'nav.courses':    'Cursos',

      /* — Hero — */
      'hero.badge':     'Bienestar Integral',
      'hero.title.aureon':
        'TRANSFORMA TU VIDA CON <span class=\'accent\'>ZHINENG QIGONG</span>',
      'hero.title.hui':
        'DESPIERTA TU <span class=\'accent\'>POTENCIAL</span> INTERIOR',
      'hero.title.indira-y-hui':
        'CAMINO HACIA LA <span class=\'accent\'>SABIDURÍA</span>',
      'hero.subtitle':
        'Descubre la práctica milenaria que ha transformado la vida de millones de personas en el mundo.',
      'hero.cta1':      'Conoce Más',
      'hero.cta2':      'Contáctanos',

      /* — What is Zhineng Qigong — */
      'qigong.title':   '¿Qué es ZhìNéng QìGōng?',
      'qigong.text1':
        'ZhìNéng QìGōng es la cúspide del desarrollo del QìGōng. Es el legado del Dr. Pang He Ming, médico alópata y tradicional chino, heredero de diecinueve linajes de QìGōng tradicional y fundador del Centro Huaxia de ZhìNéng QìGōng, conocido como el Hospital más grande del mundo que trabajaba sin medicamentos, el cual compartió este tesoro con más de 3.8 millones de personas y actualmente se enseña en muchos países del mundo.',
      'qigong.text2':
        'ZhìNéng QìGōng es toda una cultura, cuya práctica se realiza con una actitud científica, promoviendo los cambios que buscamos obtener a través de toda una forma de vida que implica una serie de ejercicios físicos y mentales, así como los hábitos físicos, emocionales y mentales más evolucionados que puede cultivar el ser humano.',
      'qigong.text3':
        'ZhìNéng QìGōng puede ser practicado por todo tipo de personas, no tiene que ver con corrientes políticas ni religiosas, no es un deporte ni un arte marcial.',
      'qigong.text4':
        'Se han realizado investigaciones científicas formales en diferentes áreas, como la medicina, la agricultura, la industria, la educación, en ciencias forestales y con animales.',

      /* — Stages of Benefits — */
      'stages.title':    'Etapas de los Beneficios',
      'stages.subtitle': 'Vida ZhìNéng QìGōng',
      'stages.1.title':  'Recuperar la Salud',
      'stages.1.text':
        'Beneficios para las personas que necesitan recuperar la salud',
      'stages.2.title':  'Mantener y Elevar la Salud',
      'stages.2.text':
        'Para las personas que desean mantener su salud e incluso elevarla a un nivel superior a la media',
      'stages.3.title':  'Desarrollar el Máximo Potencial',
      'stages.3.text':
        'Para las personas que desean desarrollar todo su potencial físico, mental y emocional para lograr el más alto nivel que puede alcanzar el ser humano',

      /* — Benefits — */
      'benefits.title':  'Beneficios de la Práctica',
      'benefits.1':      'Fortalece el sistema inmunológico',
      'benefits.2':      'Incrementa la concentración y la capacidad de análisis',
      'benefits.3':      'Mejora el manejo de las emociones',
      'benefits.4':      'Mejora la circulación',
      'benefits.5':      'Mejora la digestión',
      'benefits.6':      'Mejora la sensibilidad',
      'benefits.7':      'La vista, el oído, el olfato y todos los sentidos se mejoran',
      'benefits.8':      'Ayuda a manejar el estrés',
      'benefits.9':      'Se incrementa la flexibilidad',
      'benefits.10':     'Despierta la sabiduría del cuerpo, emociones y mente',
      'benefits.11':     'Tiene el potencial de eliminar todo tipo de enfermedades',
      'benefits.12':     'Ayuda a vivir en paz y armonía',
      'benefits.13':     'Puede eliminar trastornos del sueño',
      'benefits.14':     'Ayuda a despertar la alegría',
      'benefits.15':     'Mejora la autoestima',

      /* — FAQ — */
      'faq.title':       'Preguntas Frecuentes',

      'faq.1.q': '¿Qué es ZhìNéng QìGōng?',
      'faq.1.a':
        'Es la cúspide del desarrollo del QìGōng. Es toda una cultura cuya práctica se realiza con una actitud científica, promoviendo los cambios que buscamos obtener a través de una forma de vida completa que implica una serie de ejercicios físicos y mentales, así como los hábitos físicos, emocionales y mentales más evolucionados que puede cultivar el ser humano.',

      'faq.2.q': '¿De dónde viene?',
      'faq.2.a':
        'Es el legado del Dr. Pang He Ming, doctor en medicina alópata y tradicional china, heredero de diecinueve linajes de QìGōng tradicional y fundador del Centro Huaxia, conocido como el hospital más grande del mundo que trabajaba sin medicamentos, compartiendo este tesoro con más de 3.8 millones de personas.',

      'faq.3.q': '¿Quién puede practicarlo?',
      'faq.3.a':
        'Puede ser practicado por todo tipo de personas, no tiene que ver con corrientes políticas ni religiosas, no es un deporte ni un arte marcial. Cualquier persona que pueda seguir instrucciones sencillas puede practicarlo.',

      'faq.4.q': '¿Cuál es su efectividad?',
      'faq.4.a':
        'En el Centro Huaxia se midió una efectividad del 95% en lograr disminuir o recuperarse completamente de más de 180 padecimientos, tras 24 días de práctica de 8 horas diarias con el primer nivel PengQìGuanDingFa.',

      'faq.5.q': '¿Cuántos niveles existen?',
      'faq.5.a':
        'El Maestro Pang estructuró el ZhìNéng QìGōng en 6 niveles. Actualmente, sólo se han abierto los tres primeros: PengQìGuanDingFa, XingShenZhuang y WuYuanZhuang. Cada nivel trabaja con aspectos cada vez más profundos del cuerpo, la mente y las emociones.',

      'faq.6.q': '¿Puedo mandarle Qì a otra persona?',
      'faq.6.a':
        'Sí, existe un método llamado Fa Qì para mandar Qì a personas, animales, plantas u objetos. Es un trabajo generoso que eleva el nivel del practicante, aunque cada persona debe hacer su propio trabajo de transformación.',

      /* — Testimonials — */
      'testimonials.title': 'Testimonios',

      'testimonial.1.text':
        'Me sentía con muchas ganas de trabajar, con muchas ganas de superarme a mí mismo cada día y de entrenar al máximo. Yo me sentía muy satisfecho con mi trabajo y fue gracias a que estaba abierto a aprender nuevas cosas como es el ZhìNéng QìGōng.',
      'testimonial.1.author':   'Diego Rivera',
      'testimonial.1.location': '13 Años, Veracruz',

      'testimonial.2.text':
        'Siento como si hubiera desbloqueado un archivo de antigua sabiduría, y me sorprende el impulso que tengo por aprender y hacer cosas nuevas.',
      'testimonial.2.author':   'Gaby Álvarez',
      'testimonial.2.location': 'Colima, México',

      'testimonial.3.text':
        'A veces siento que debo cuidar delicadamente como si fuera un capullo, una semilla abriéndose, un recién nacido, apenas un tallito de Qi que cultivo en mi práctica, que navega en el Dan Tian ¡con tan hermosa sensación!',
      'testimonial.3.author':   'Magie Slim',
      'testimonial.3.location': 'Puebla, México',

      /* — Contact — */
      'contact.title':    'Contacto',
      'contact.subtitle':
        '¿Tienes preguntas? Escríbenos y con gusto te atendemos.',
      'contact.name':              'Nombre',
      'contact.name.placeholder':  'Tu nombre',
      'contact.email':             'Correo Electrónico',
      'contact.email.placeholder': 'Para poder responderte',
      'contact.subject':             'Asunto',
      'contact.subject.placeholder': '¿De qué quieres hablar?',
      'contact.message':             'Mensaje',
      'contact.message.placeholder': 'Escribe tu mensaje aquí...',
      'contact.submit':  'Enviar Mensaje',
      'contact.success': '¡Mensaje enviado con éxito!',
      'contact.error':   'Error al enviar. Intenta de nuevo.',

      /* — Footer — */
      'footer.copy':    '© 2025 Vida ZhìNéng QìGōng. Todos los derechos reservados.',

      /* — Courses — */
      'courses.title':    'Cursos y Sesiones',
      'courses.subtitle': 'Aprende con nuestras sesiones grabadas',
      'courses.cta':      'Ver en YouTube',
      'courses.v1.title': 'Sonido y Mudra de los Riñones',
      'courses.v2.title': 'Sonido y Mudra del Hígado',
      'courses.v3.title': 'Sonido y Mudra de los Pulmones',
      'courses.v4.title': 'Mudra y Sonido del Corazón',
      'courses.v5.title': 'Sonido y Mudra del Páncreas — Ejercicio Roufu',
      'courses.v6.title': 'Práctica de Luna Llena',

      /* — Aula Virtual — */
      'nav.aula':            'Aula Virtual',
      'courses.aulaCta':     'Entrar al Aula Virtual',
      'aula.kicker':         'Vida ZhìNéng QìGōng',
      'aula.title':          'Aula Virtual',
      'aula.loading':        'Cargando lecciones…',
      'aula.empty':          'Aún no hay lecciones publicadas.',
      'aula.module.empty':   'Este módulo aún no tiene lecciones.',
      'aula.publicBadge':    'Público',
      'aula.premiumBadge':   'Alumnos',
      'aula.lockedCard':     'Solo alumnos',
      'aula.locked.label':   'Hay contenido exclusivo para alumnos',
      'aula.unlocked.label': 'Acceso de alumno activo',
      'aula.unlock.cta':     'Ingresar código',
      'aula.logout':         'Cerrar acceso',
      'aula.type.youtube':   'Video',
      'aula.type.drive':     'Drive',
      'aula.type.pdf':       'PDF',
      'aula.type.link':      'Enlace',
      'aula.code.title':     'Contenido para alumnos',
      'aula.code.h':         'Ingresa tu código de acceso',
      'aula.code.submit':    'Entrar',
      'aula.code.empty':     'Escribe tu código.',
      'aula.code.checking':  'Verificando…',
      'aula.code.ok':        '¡Acceso concedido!',
      'aula.code.wrong':     'Código incorrecto. Inténtalo de nuevo.',
      'aula.open.desc':      'Este contenido se abre en una pestaña nueva.',
      'aula.open.cta':       'Abrir contenido',

      'footer.privacy': 'Aviso de Privacidad'
    },

    /* ============================
       ENGLISH
       ============================ */
    en: {

      /* — Navigation — */
      'nav.home':       'Home',
      'nav.qigong':     'Zhineng Qigong',
      'nav.activities':  'Activities',
      'nav.about':      'About Us',
      'nav.contact':    'Contact',
      'nav.courses':    'Courses',

      /* — Hero — */
      'hero.badge':     'Holistic Wellness',
      'hero.title.aureon':
        'TRANSFORM YOUR LIFE WITH <span class=\'accent\'>ZHINENG QIGONG</span>',
      'hero.title.hui':
        'AWAKEN YOUR INNER <span class=\'accent\'>POTENTIAL</span>',
      'hero.title.indira-y-hui':
        'PATH TO <span class=\'accent\'>WISDOM</span>',
      'hero.subtitle':
        'Discover the ancient practice that has transformed the lives of millions around the world.',
      'hero.cta1':      'Learn More',
      'hero.cta2':      'Contact Us',

      /* — What is Zhineng Qigong — */
      'qigong.title':   'What is ZhìNéng QìGōng?',
      'qigong.text1':
        'ZhìNéng QìGōng is the pinnacle of QìGōng development. It is the legacy of Dr. Pang He Ming, a Western and Traditional Chinese Medicine doctor, heir to nineteen lineages of traditional QìGōng, and founder of the Huaxia Center for ZhìNéng QìGōng — known as the world\'s largest hospital that operated without medication — which shared this treasure with over 3.8 million people and is currently taught in many countries around the world.',
      'qigong.text2':
        'ZhìNéng QìGōng is an entire culture whose practice is carried out with a scientific attitude, promoting the changes we seek through a complete way of life involving a series of physical and mental exercises, as well as the most evolved physical, emotional, and mental habits that a human being can cultivate.',
      'qigong.text3':
        'ZhìNéng QìGōng can be practiced by all types of people; it has nothing to do with political or religious movements, and it is neither a sport nor a martial art.',
      'qigong.text4':
        'Formal scientific research has been conducted in various areas, including medicine, agriculture, industry, education, forestry sciences, and with animals.',

      /* — Stages of Benefits — */
      'stages.title':    'Stages of Benefits',
      'stages.subtitle': 'Vida ZhìNéng QìGōng',
      'stages.1.title':  'Recover Health',
      'stages.1.text':
        'Benefits for people who need to recover their health',
      'stages.2.title':  'Maintain and Elevate Health',
      'stages.2.text':
        'For people who wish to maintain their health and even elevate it above average levels',
      'stages.3.title':  'Develop Maximum Potential',
      'stages.3.text':
        'For people who wish to develop their full physical, mental, and emotional potential to achieve the highest level a human being can reach',

      /* — Benefits — */
      'benefits.title':  'Benefits of Practice',
      'benefits.1':      'Strengthens the immune system',
      'benefits.2':      'Increases concentration and analytical capacity',
      'benefits.3':      'Improves emotional management',
      'benefits.4':      'Improves circulation',
      'benefits.5':      'Improves digestion',
      'benefits.6':      'Improves sensitivity',
      'benefits.7':      'Sight, hearing, smell, and all senses improve',
      'benefits.8':      'Helps manage stress',
      'benefits.9':      'Increases flexibility',
      'benefits.10':     'Awakens the wisdom of body, emotions, and mind',
      'benefits.11':     'Has the potential to eliminate all types of diseases',
      'benefits.12':     'Helps live in peace and harmony',
      'benefits.13':     'Can eliminate sleep disorders',
      'benefits.14':     'Helps awaken joy',
      'benefits.15':     'Improves self-esteem',

      /* — FAQ — */
      'faq.title':       'Frequently Asked Questions',

      'faq.1.q': 'What is ZhìNéng QìGōng?',
      'faq.1.a':
        'It is the pinnacle of QìGōng development. It is an entire culture whose practice is carried out with a scientific attitude, promoting the changes we seek through a complete way of life involving physical and mental exercises, as well as the most evolved physical, emotional, and mental habits a human can cultivate.',

      'faq.2.q': 'Where does it come from?',
      'faq.2.a':
        'It is the legacy of Dr. Pang He Ming, a doctor of Western and Traditional Chinese Medicine, heir to nineteen lineages of traditional QìGōng, and founder of the Huaxia Center — known as the world\'s largest hospital that operated without medication — sharing this treasure with over 3.8 million people.',

      'faq.3.q': 'Who can practice it?',
      'faq.3.a':
        'It can be practiced by all types of people. It has nothing to do with political or religious movements, and it is neither a sport nor a martial art. Anyone who can follow simple instructions can practice it.',

      'faq.4.q': 'What is its effectiveness?',
      'faq.4.a':
        'At the Huaxia Center, a 95% effectiveness rate was measured in reducing or fully recovering from over 180 conditions, after 24 days of 8-hour daily practice with the first level PengQìGuanDingFa.',

      'faq.5.q': 'How many levels exist?',
      'faq.5.a':
        'Master Pang structured ZhìNéng QìGōng into 6 levels. Currently, only the first three have been opened: PengQìGuanDingFa, XingShenZhuang, and WuYuanZhuang. Each level works with increasingly deeper aspects of body, mind, and emotions.',

      'faq.6.q': 'Can I send Qì to another person?',
      'faq.6.a':
        'Yes, there is a method called Fa Qì for sending Qì to people, animals, plants, or objects. It is a generous practice that elevates the practitioner\'s level, although each person must do their own transformative work.',

      /* — Testimonials — */
      'testimonials.title': 'Testimonials',

      'testimonial.1.text':
        'I felt eager to work, eager to surpass myself every day and train to the maximum. I felt very satisfied with my work, and it was thanks to being open to learning new things like ZhìNéng QìGōng.',
      'testimonial.1.author':   'Diego Rivera',
      'testimonial.1.location': '13 Years Old, Veracruz',

      'testimonial.2.text':
        'I feel as if I\'ve unlocked a file of ancient wisdom, and I\'m amazed at the drive I have to learn and do new things.',
      'testimonial.2.author':   'Gaby Álvarez',
      'testimonial.2.location': 'Colima, México',

      'testimonial.3.text':
        'Sometimes I feel I must carefully nurture, as if it were a cocoon, a seed opening, a newborn — just a little sprout of Qi that I cultivate in my practice, navigating in the Dan Tian with such a beautiful sensation!',
      'testimonial.3.author':   'Magie Slim',
      'testimonial.3.location': 'Puebla, México',

      /* — Contact — */
      'contact.title':    'Contact',
      'contact.subtitle':
        'Have questions? Write to us and we\'ll be happy to help.',
      'contact.name':              'Name',
      'contact.name.placeholder':  'Your name',
      'contact.email':             'Email',
      'contact.email.placeholder': 'So we can reply to you',
      'contact.subject':             'Subject',
      'contact.subject.placeholder': 'What would you like to talk about?',
      'contact.message':             'Message',
      'contact.message.placeholder': 'Write your message here...',
      'contact.submit':  'Send Message',
      'contact.success': 'Message sent successfully!',
      'contact.error':   'Error sending. Please try again.',

      /* — Footer — */
      'footer.copy':    '© 2025 Vida ZhìNéng QìGōng. All rights reserved.',

      /* — Courses — */
      'courses.title':    'Courses & Sessions',
      'courses.subtitle': 'Learn with our recorded sessions',
      'courses.cta':      'Watch on YouTube',
      'courses.v1.title': 'Sound and Mudra of the Kidneys',
      'courses.v2.title': 'Sound and Mudra of the Liver',
      'courses.v3.title': 'Sound and Mudra of the Lungs',
      'courses.v4.title': 'Mudra and Sound of the Heart',
      'courses.v5.title': 'Sound and Mudra of the Pancreas — Roufu Exercise',
      'courses.v6.title': 'Full Moon Practice',

      /* — Virtual Classroom — */
      'nav.aula':            'Virtual Classroom',
      'courses.aulaCta':     'Enter the Virtual Classroom',
      'aula.kicker':         'Vida ZhìNéng QìGōng',
      'aula.title':          'Virtual Classroom',
      'aula.loading':        'Loading lessons…',
      'aula.empty':          'No lessons published yet.',
      'aula.module.empty':   'This module has no lessons yet.',
      'aula.publicBadge':    'Public',
      'aula.premiumBadge':   'Students',
      'aula.lockedCard':     'Students only',
      'aula.locked.label':   'There is exclusive content for students',
      'aula.unlocked.label': 'Student access active',
      'aula.unlock.cta':     'Enter code',
      'aula.logout':         'Sign out',
      'aula.type.youtube':   'Video',
      'aula.type.drive':     'Drive',
      'aula.type.pdf':       'PDF',
      'aula.type.link':      'Link',
      'aula.code.title':     'Student content',
      'aula.code.h':         'Enter your access code',
      'aula.code.submit':    'Enter',
      'aula.code.empty':     'Enter your code.',
      'aula.code.checking':  'Checking…',
      'aula.code.ok':        'Access granted!',
      'aula.code.wrong':     'Incorrect code. Please try again.',
      'aula.open.desc':      'This content opens in a new tab.',
      'aula.open.cta':       'Open content',

      'footer.privacy': 'Privacy Policy'
    }
  };

  /* ---------- Internal state ---------- */
  const STORAGE_KEY = 'vidaznqg_lang';
  let currentLang  = 'es';

  /* ---------- Helper: resolve a translation key ---------- */
  function t(key, lang) {
    const dict = translations[lang];
    if (!dict) {
      console.warn(`[i18n] Unknown language: "${lang}"`);
      return key;
    }
    if (dict[key] === undefined) {
      console.warn(`[i18n] Missing key "${key}" for language "${lang}"`);
      return key;
    }
    return dict[key];
  }

  /* ---------- Core: apply translations to the DOM ---------- */
  function setLanguage(lang) {
    if (!translations[lang]) {
      console.warn(`[i18n] Language "${lang}" is not available. Falling back to "es".`);
      lang = 'es';
    }

    currentLang = lang;

    /* 1. Translate all elements with data-i18n (innerHTML) */
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      el.innerHTML = t(key, lang);
    });

    /* 2. Translate all placeholders with data-i18n-placeholder */
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      el.setAttribute('placeholder', t(key, lang));
    });

    /* 3. Update language-button active states (both old .lang-btn and new toggle) */
    document.querySelectorAll('.lang-btn, .lang-toggle-option').forEach(function (btn) {
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    /* 3b. Sync toggle slider position */
    document.querySelectorAll('.lang-toggle').forEach(function (toggle) {
      toggle.classList.toggle('en', lang === 'en');
    });

    /* 4. Update the root <html> lang attribute */
    document.documentElement.lang = lang;

    /* 5. Persist choice in localStorage */
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      /* localStorage may be unavailable (private mode, etc.) — fail silently */
    }

    /* 6. Dispatch a custom event so other scripts can react */
    document.dispatchEvent(
      new CustomEvent('languageChanged', { detail: { language: lang } })
    );
  }

  /* ---------- Initialisation ---------- */
  function init() {
    /* 1. Read persisted language, default to 'es' */
    var savedLang = 'es';
    try {
      savedLang = localStorage.getItem(STORAGE_KEY) || 'es';
    } catch (e) {
      /* localStorage unavailable */
    }

    /* 2. Apply translations */
    setLanguage(savedLang);

    /* 3. Bind click handlers to language-switch buttons (old + new) */
    document.querySelectorAll('.lang-btn, .lang-toggle-option').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var lang = btn.getAttribute('data-lang');
        if (lang) {
          setLanguage(lang);
        }
      });
    });
  }

  /* ---------- Public API ---------- */
  function getCurrentLanguage() {
    return currentLang;
  }

  /**
   * Public translation lookup.
   * @param {string} key - Translation key (e.g. 'hero.title.hui')
   * @returns {string} Translated string or key itself if not found
   */
  function translate(key) {
    return t(key, currentLang);
  }

  /* Expose on window */
  window.I18n = {
    init:               init,
    setLanguage:        setLanguage,
    getCurrentLanguage: getCurrentLanguage,
    t:                  translate
  };
})();
