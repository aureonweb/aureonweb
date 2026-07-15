/* ==========================================================================
   i18n.js — Internationalization System for AUREON
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
        'Una práctica milenaria, viva y al alcance de todos, que ha acompañado la transformación de millones de personas en el mundo.',
      'hero.cta1':      'Conoce Más',
      'hero.cta2':      'Contáctanos',

      /* — What is Zhineng Qigong — */
      'qigong.title':   '¿Qué es ZhìNéng QìGōng?',
      'qigong.text1':
        'ZhìNéng QìGōng representa la etapa más evolucionada del QìGōng. Es el legado del Dr. Pang He Ming —médico formado en medicina occidental y tradicional china, y heredero de diecinueve linajes de QìGōng tradicional—, fundador del Proyecto Aureon, reconocido como el hospital sin medicamentos más grande del mundo. Este tesoro ha llegado a más de 3.8 millones de personas y hoy se enseña en numerosos países.',
      'qigong.text2':
        'Más que una técnica, es toda una cultura: se practica con una actitud científica y promueve los cambios que buscamos a través de una forma de vida completa, que integra ejercicios físicos y mentales junto con los hábitos más elevados que el ser humano puede cultivar en su cuerpo, sus emociones y su mente.',
      'qigong.text3':
        'Cualquier persona puede practicarlo: no pertenece a ninguna corriente política ni religiosa, y no es un deporte ni un arte marcial. Basta con poder seguir instrucciones sencillas.',
      'qigong.text4':
        'Su alcance ha sido objeto de investigaciones científicas formales en campos tan diversos como la medicina, la agricultura, la industria, la educación, las ciencias forestales y el trabajo con animales.',

      /* — About Us (Quiénes Somos) — */
      'about.title':    'Quiénes Somos',
      'about.subtitle': 'AUREON',
      'about.text1':
        '<strong>Indira</strong> es instructora certificada de ZhìNéng QìGōng, con más de quince años de práctica y formación directa con maestros del linaje del Proyecto Aureon. Ha acompañado a cientos de alumnos en México y Latinoamérica con una enseñanza cercana y amorosa, y al mismo tiempo rigurosa y fiel al sistema original.',
      'about.text2':
        '<strong>Hui</strong> es maestro de ZhìNéng QìGōng con décadas de experiencia en la enseñanza del sistema del Dr. Pang He Ming. Imparte cursos internacionales en línea y presenciales, y es reconocido por la profundidad y la claridad con que transmite tanto la práctica como la teoría del campo de Qì.',
      'about.text3':
        'Juntos creamos <strong>AUREON</strong> con una misión sencilla: que esta práctica llegue a cualquier persona —sin importar su edad, su condición física o sus creencias— como un camino real de salud, serenidad y despertar del potencial interior.',

      /* — Activities (Actividades) — */
      'activities.title':    'Actividades',
      'activities.subtitle': 'Formas de practicar con nosotros',
      'activities.1.title':  'Clases semanales en vivo',
      'activities.1.text':
        'Sesiones en línea para practicar en grupo desde casa, con guía en tiempo real y espacio para resolver tus dudas.',
      'activities.2.title':  'Cursos en línea',
      'activities.2.text':
        'Programas temáticos de varias semanas, como «El Anhelo del Espacio», que combinan teoría, ejercicios de flujo y meditación.',
      'activities.3.title':  'Sesiones de sanación',
      'activities.3.text':
        'Encuentros dedicados al trabajo con el campo de Qì para acompañar procesos de recuperación de la salud.',
      'activities.4.title':  'Talleres y retiros',
      'activities.4.text':
        'Experiencias intensivas, en línea y presenciales, para profundizar en la práctica y convivir con la comunidad.',
      'activities.5.title':  'Formación de profesores',
      'activities.5.text':
        'Programas de certificación en Ba Duan Jin y en Cuerpo y Mente, para quienes desean compartir la práctica.',
      'activities.6.title':  'Práctica de Luna Llena',
      'activities.6.text':
        'Práctica especial, abierta y gratuita, que realizamos en cada luna llena junto a toda la comunidad.',

      /* — Stages of Benefits — */
      'stages.title':    'Etapas de los Beneficios',
      'stages.subtitle': 'AUREON',
      'stages.1.title':  'Recuperar la Salud',
      'stages.1.text':
        'El primer paso: acompañar a quienes atraviesan una enfermedad o un desequilibrio y necesitan recuperar su bienestar',
      'stages.2.title':  'Mantener y Elevar la Salud',
      'stages.2.text':
        'Para quienes ya se sienten bien y desean conservar su salud, e incluso llevarla a un nivel superior al promedio',
      'stages.3.title':  'Desarrollar el Máximo Potencial',
      'stages.3.text':
        'Para quienes buscan desplegar todo su potencial físico, mental y emocional, hacia el nivel más alto que puede alcanzar el ser humano',

      /* — Benefits — */
      'benefits.title':  'Beneficios de la Práctica',
      'benefits.1':      'Refuerza el sistema inmunológico',
      'benefits.2':      'Aumenta la concentración y la claridad mental',
      'benefits.3':      'Favorece el equilibrio emocional',
      'benefits.4':      'Estimula la circulación',
      'benefits.5':      'Favorece una buena digestión',
      'benefits.6':      'Afina la sensibilidad y la percepción',
      'benefits.7':      'Agudiza la vista, el oído y todos los sentidos',
      'benefits.8':      'Reduce y ayuda a gestionar el estrés',
      'benefits.9':      'Aumenta la flexibilidad del cuerpo',
      'benefits.10':     'Despierta la sabiduría del cuerpo, las emociones y la mente',
      'benefits.11':     'Tiene el potencial de revertir todo tipo de padecimientos',
      'benefits.12':     'Invita a vivir en paz y armonía',
      'benefits.13':     'Ayuda a recuperar un sueño reparador',
      'benefits.14':     'Reaviva la alegría de vivir',
      'benefits.15':     'Fortalece la autoestima',

      /* — FAQ — */
      'faq.title':       'Preguntas Frecuentes',

      'faq.1.q': '¿Qué es exactamente el ZhìNéng QìGōng?',
      'faq.1.a':
        'Es la forma más evolucionada del QìGōng: toda una cultura que se practica con actitud científica. Los cambios que buscamos no dependen de un ejercicio aislado, sino de una forma de vida completa que integra movimiento, trabajo mental y los hábitos físicos, emocionales y mentales más elevados que una persona puede cultivar.',

      'faq.2.q': '¿Cuál es su origen?',
      'faq.2.a':
        'Nace del trabajo del Dr. Pang He Ming, médico en medicina occidental y tradicional china, heredero de diecinueve linajes de QìGōng tradicional. Él fundó el Proyecto Aureon, conocido como el hospital sin medicamentos más grande del mundo, donde este método llegó a más de 3.8 millones de personas.',

      'faq.3.q': '¿Necesito experiencia previa o alguna condición especial?',
      'faq.3.a':
        'No. Cualquier persona capaz de seguir instrucciones sencillas puede practicarlo, a cualquier edad y en cualquier condición física. No está ligado a corrientes políticas ni religiosas, y no es un deporte ni un arte marcial.',

      'faq.4.q': '¿Qué resultados se han documentado?',
      'faq.4.a':
        'En el Proyecto Aureon se registró un 95% de efectividad en la mejoría o recuperación completa de más de 180 padecimientos, tras 24 días de práctica de 8 horas diarias con el primer nivel, PengQìGuanDingFa.',

      'faq.5.q': '¿Cómo se organizan los niveles de práctica?',
      'faq.5.a':
        'El Maestro Pang estructuró el sistema en 6 niveles, de los cuales se han abierto los tres primeros: PengQìGuanDingFa, XingShenZhuang y WuYuanZhuang. Cada nivel trabaja aspectos cada vez más profundos del cuerpo, la mente y las emociones.',

      'faq.6.q': '¿Es posible enviarle Qì a otra persona?',
      'faq.6.a':
        'Sí. Existe un método llamado Fa Qì para enviar Qì a personas, animales, plantas u objetos. Es un trabajo generoso que además eleva el nivel del practicante, aunque cada persona debe realizar su propio proceso de transformación.',

      /* — Testimonials — */
      'testimonials.title': 'Testimonios',

      'testimonial.1.text':
        'En el curso encontré que las técnicas de sanación no se contraponen a mis creencias e ideología, y logré dejar de sentir dolor. (Un dolor al que ya estoy acostumbrada después de años de sentirlo). Para mí fue abrir una puerta para un cambio de vida. Recomiendo mucho darse la oportunidad. ¡La maestra Indira es extraordinaria!',
      'testimonial.1.author':   'Rebeca Cárdenas',
      'testimonial.1.location': '59 años',

      'testimonial.2.text':
        'Más allá del asombro, lo que descubrí fue la certeza de que cuando la mente se aquieta, el universo coopera. Que el poder no está en controlar, sino en fluir con la conciencia despierta. Todo ello fue posible gracias a mi querida instructora Indira, cuya sabiduría y guía amorosa hicieron de esta experiencia un verdadero despertar.',
      'testimonial.2.author':   'Angélica Alamillo',
      'testimonial.2.location': '61 años',

      /* — Contact — */
      'contact.title':    'Contacto',
      'contact.subtitle':
        '¿Tienes dudas o quieres inscribirte? Escríbenos: tu mensaje nos llega directo por WhatsApp.',
      'contact.name':              'Nombre',
      'contact.name.placeholder':  'Tu nombre',
      'contact.email':             'Correo Electrónico (opcional)',
      'contact.email.placeholder': 'Por si prefieres respuesta por correo',
      'contact.subject':             'Asunto',
      'contact.subject.placeholder': '¿De qué quieres hablar?',
      'contact.message':             'Mensaje',
      'contact.message.placeholder': 'Escribe tu mensaje aquí...',
      'contact.submit':  'Enviar por WhatsApp',
      'contact.success': '¡Listo! Se abrió WhatsApp con tu mensaje.',
      'contact.error':   'No se pudo abrir WhatsApp. Intenta de nuevo.',

      /* — WhatsApp messages — */
      'wa.course.msg':
        'Hola 👋 Me interesa el curso «{title}» y me gustaría recibir más información.',
      'wa.generic.msg':
        'Hola 👋 Me gustaría recibir más información sobre sus cursos y actividades.',
      'wa.membership.msg':
        'Hola 👋 Me interesa la Membresía Qi y me gustaría recibir más información.',
      'wa.contact.intro':  'Hola, soy',
      'wa.contact.subject': 'Asunto',
      'wa.contact.email':   'Correo',

      /* — Promo banner buttons — */
      'promo.more':    'Más información',
      'promo.next':    'Siguiente',
      'promo.contact': 'Contactar por WhatsApp',

      /* — Footer — */
      'footer.copy':    '© 2025 AUREON. Todos los derechos reservados.',

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
      'aula.kicker':         'AUREON',
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
      'aula.code.wa':        'Pedir mi código por WhatsApp',
      'wa.code.msg':
        'Hola 👋 Soy alumno(a) inscrito(a) y necesito mi código de acceso al Aula Virtual.',
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
        'A living, ancient practice within everyone\'s reach — one that has accompanied the transformation of millions of people around the world.',
      'hero.cta1':      'Learn More',
      'hero.cta2':      'Contact Us',

      /* — What is Zhineng Qigong — */
      'qigong.title':   'What is ZhìNéng QìGōng?',
      'qigong.text1':
        'ZhìNéng QìGōng represents the most evolved stage of QìGōng. It is the legacy of Dr. Pang He Ming — a physician trained in both Western and Traditional Chinese Medicine, and heir to nineteen lineages of traditional QìGōng — founder of the Aureon Project, recognized as the world\'s largest medicine-free hospital. This treasure has reached more than 3.8 million people and is now taught in many countries.',
      'qigong.text2':
        'More than a technique, it is an entire culture: it is practiced with a scientific attitude, and the changes we seek come through a complete way of life that combines physical and mental exercises with the most refined habits a human being can cultivate in body, emotions, and mind.',
      'qigong.text3':
        'Anyone can practice it: it belongs to no political or religious movement, and it is neither a sport nor a martial art. Being able to follow simple instructions is enough.',
      'qigong.text4':
        'Its scope has been the subject of formal scientific research in fields as diverse as medicine, agriculture, industry, education, forestry sciences, and work with animals.',

      /* — About Us (Quiénes Somos) — */
      'about.title':    'About Us',
      'about.subtitle': 'AUREON',
      'about.text1':
        '<strong>Indira</strong> is a certified ZhìNéng QìGōng instructor with more than fifteen years of practice and direct training with masters of the Aureon Project lineage. She has guided hundreds of students across Mexico and Latin America with a warm, caring style of teaching that remains rigorous and faithful to the original system.',
      'about.text2':
        '<strong>Hui</strong> is a ZhìNéng QìGōng master with decades of experience teaching Dr. Pang He Ming\'s system. He leads international courses, both online and in person, and is renowned for the depth and clarity with which he transmits both the practice and the theory of the Qì field.',
      'about.text3':
        'Together we created <strong>AUREON</strong> with a simple mission: to bring this practice to anyone — regardless of age, physical condition, or beliefs — as a real path toward health, serenity, and the awakening of inner potential.',

      /* — Activities (Actividades) — */
      'activities.title':    'Activities',
      'activities.subtitle': 'Ways to practice with us',
      'activities.1.title':  'Weekly live classes',
      'activities.1.text':
        'Online sessions to practice as a group from home, with real-time guidance and space to ask your questions.',
      'activities.2.title':  'Online courses',
      'activities.2.text':
        'Multi-week thematic programs, such as "The Longing of Space," combining theory, flow exercises, and meditation.',
      'activities.3.title':  'Healing sessions',
      'activities.3.text':
        'Gatherings dedicated to working with the Qì field to support health-recovery processes.',
      'activities.4.title':  'Workshops and retreats',
      'activities.4.text':
        'Intensive experiences, online and in person, to deepen the practice and share time with the community.',
      'activities.5.title':  'Teacher training',
      'activities.5.text':
        'Certification programs in Ba Duan Jin and Body & Mind, for those who wish to share the practice.',
      'activities.6.title':  'Full Moon Practice',
      'activities.6.text':
        'A special practice, open and free of charge, held on every full moon together with the whole community.',

      /* — Stages of Benefits — */
      'stages.title':    'Stages of Benefits',
      'stages.subtitle': 'AUREON',
      'stages.1.title':  'Recover Health',
      'stages.1.text':
        'The first step: supporting those going through illness or imbalance who need to regain their well-being',
      'stages.2.title':  'Maintain and Elevate Health',
      'stages.2.text':
        'For those who already feel well and wish to preserve their health — and even raise it above the average level',
      'stages.3.title':  'Develop Maximum Potential',
      'stages.3.text':
        'For those seeking to unfold their full physical, mental, and emotional potential, toward the highest level a human being can reach',

      /* — Benefits — */
      'benefits.title':  'Benefits of Practice',
      'benefits.1':      'Reinforces the immune system',
      'benefits.2':      'Increases concentration and mental clarity',
      'benefits.3':      'Supports emotional balance',
      'benefits.4':      'Stimulates circulation',
      'benefits.5':      'Promotes healthy digestion',
      'benefits.6':      'Refines sensitivity and perception',
      'benefits.7':      'Sharpens sight, hearing, and all the senses',
      'benefits.8':      'Reduces and helps manage stress',
      'benefits.9':      'Increases the body\'s flexibility',
      'benefits.10':     'Awakens the wisdom of body, emotions, and mind',
      'benefits.11':     'Has the potential to reverse all kinds of ailments',
      'benefits.12':     'Invites you to live in peace and harmony',
      'benefits.13':     'Helps restore restful sleep',
      'benefits.14':     'Rekindles the joy of living',
      'benefits.15':     'Strengthens self-esteem',

      /* — FAQ — */
      'faq.title':       'Frequently Asked Questions',

      'faq.1.q': 'What exactly is ZhìNéng QìGōng?',
      'faq.1.a':
        'It is the most evolved form of QìGōng: an entire culture practiced with a scientific attitude. The changes we seek do not come from an isolated exercise, but from a complete way of life that combines movement, mental work, and the most refined physical, emotional, and mental habits a person can cultivate.',

      'faq.2.q': 'Where does it come from?',
      'faq.2.a':
        'It was born from the work of Dr. Pang He Ming, a physician in both Western and Traditional Chinese Medicine and heir to nineteen lineages of traditional QìGōng. He founded the Aureon Project, known as the world\'s largest medicine-free hospital, where this method reached more than 3.8 million people.',

      'faq.3.q': 'Do I need previous experience or any special condition?',
      'faq.3.a':
        'No. Anyone able to follow simple instructions can practice it, at any age and in any physical condition. It is not tied to political or religious movements, and it is neither a sport nor a martial art.',

      'faq.4.q': 'What results have been documented?',
      'faq.4.a':
        'At the Aureon Project, a 95% effectiveness rate was recorded in the improvement or full recovery from more than 180 conditions, after 24 days of 8-hour daily practice with the first level, PengQìGuanDingFa.',

      'faq.5.q': 'How are the practice levels organized?',
      'faq.5.a':
        'Master Pang structured the system into 6 levels, of which the first three have been opened: PengQìGuanDingFa, XingShenZhuang, and WuYuanZhuang. Each level works with increasingly deeper aspects of body, mind, and emotions.',

      'faq.6.q': 'Is it possible to send Qì to another person?',
      'faq.6.a':
        'Yes. There is a method called Fa Qì for sending Qì to people, animals, plants, or objects. It is a generous practice that also elevates the practitioner\'s level, although each person must carry out their own process of transformation.',

      /* — Testimonials — */
      'testimonials.title': 'Testimonials',

      'testimonial.1.text':
        'In the course I found that the healing techniques do not conflict with my beliefs and ideology, and I managed to stop feeling pain — a pain I had grown used to after years of living with it. For me, it was like opening a door to a life change. I highly recommend giving yourself the opportunity. Teacher Indira is extraordinary!',
      'testimonial.1.author':   'Rebeca Cárdenas',
      'testimonial.1.location': '59 years old',

      'testimonial.2.text':
        'Beyond the amazement, what I discovered was the certainty that when the mind grows still, the universe cooperates. That true power lies not in controlling, but in flowing with an awakened consciousness. All of this was possible thanks to my dear instructor Indira, whose wisdom and loving guidance made this experience a true awakening.',
      'testimonial.2.author':   'Angélica Alamillo',
      'testimonial.2.location': '61 years old',

      /* — Contact — */
      'contact.title':    'Contact',
      'contact.subtitle':
        'Questions, or ready to enroll? Write to us — your message reaches us directly on WhatsApp.',
      'contact.name':              'Name',
      'contact.name.placeholder':  'Your name',
      'contact.email':             'Email (optional)',
      'contact.email.placeholder': 'In case you prefer a reply by email',
      'contact.subject':             'Subject',
      'contact.subject.placeholder': 'What would you like to talk about?',
      'contact.message':             'Message',
      'contact.message.placeholder': 'Write your message here...',
      'contact.submit':  'Send via WhatsApp',
      'contact.success': 'Done! WhatsApp opened with your message.',
      'contact.error':   'WhatsApp could not be opened. Please try again.',

      /* — WhatsApp messages — */
      'wa.course.msg':
        'Hello 👋 I\'m interested in the course "{title}" and would like more information.',
      'wa.generic.msg':
        'Hello 👋 I would like more information about your courses and activities.',
      'wa.membership.msg':
        'Hello 👋 I\'m interested in the Qi Membership and would like more information.',
      'wa.contact.intro':  'Hello, my name is',
      'wa.contact.subject': 'Subject',
      'wa.contact.email':   'Email',

      /* — Promo banner buttons — */
      'promo.more':    'More information',
      'promo.next':    'Next',
      'promo.contact': 'Contact via WhatsApp',

      /* — Footer — */
      'footer.copy':    '© 2025 AUREON. All rights reserved.',

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
      'aula.kicker':         'AUREON',
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
      'aula.code.wa':        'Request my code on WhatsApp',
      'wa.code.msg':
        'Hello 👋 I am an enrolled student and I need my access code for the Virtual Classroom.',
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
