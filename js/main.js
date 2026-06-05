// ========================================
    // [NUEVO] CONTADOR DE VISITAS GLOBAL (propio backend)
    // ========================================
    const COUNT_API_KEY = 'protonlab-site-visits'; // namespace único (ya no se usa, pero lo dejamos por si acaso)
    let globalVisitCount = 0;

    async function updateGlobalVisitCounter() {
      const visitSpan = document.getElementById('visit-count');
      if (!visitSpan) return;

      try {
        const response = await fetch(`https://api.counterapi.dev/v1/protonlab/sitevisits/up`);
        if (response.ok) {
          const data = await response.json();
          globalVisitCount = data.count;
          visitSpan.textContent = globalVisitCount.toLocaleString();
        } else {
          throw new Error('Error en la respuesta del servidor');
        }
      } catch (error) {
        console.error('No se pudo obtener el contador de visitas:', error);
        visitSpan.textContent = '✨'; // fallback elegante
      }
    }

    // ========================================
    // PERSISTENCIA CON LOCALSTORAGE (sin cambios)
    // ========================================
    const STORAGE_KEYS = {
      THEME: 'protonlab_theme',
      LANG: 'protonlab_lang'
    };

    function setPreference(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.warn('No se pudo guardar en localStorage', e);
      }
    }

    function getPreference(key, defaultValue = null) {
      try {
        return localStorage.getItem(key) || defaultValue;
      } catch (e) {
        console.warn('No se pudo leer localStorage', e);
        return defaultValue;
      }
    }

    // ========================================
    // CONFIGURACIÓN PRINCIPAL - MODIFICADA
    // ========================================
    
    // URL CORREGIDA: Usando tu dominio de ngrok
    const OLLAMA_SERVER_URL = 'https://liberatory-adeline-unlaudable.ngrok-free.dev';
    
    console.log('🚀 Configuración de producción activada');
    console.log('🌐 URL del backend:', OLLAMA_SERVER_URL);
    console.log('🔗 Verificando conexión...');

    // Función de utilidad para añadir headers de ngrok
    function getNgrokHeaders() {
      return {
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
    }

    // === Variables globales ===
    let isAIChatOpen = false;
    let isDebugChatOpen = false;
    let isGenerating = false;
    let isDebugging = false;
    let isServerAvailable = false;
    let currentSessionId = null;
    let debugEditor = null;
    let editorInitialized = false;

    // === Elementos DOM ===
    const floatButtonsContainer = document.querySelector('.float-buttons-container');
    const simulationFloatBtn = document.getElementById('simulation-float-btn');
    const pitfallFloatBtn = document.getElementById('pitfall-float-btn');
    const trafficFloatBtn = document.getElementById('traffic-float-btn');
    const debugFloatBtn = document.getElementById('debug-float-btn');
    const aiFloatBtn = document.getElementById('ai-float-btn');
    const pagosFloatBtn = document.getElementById('pagos-float-btn');
    const galeriaFloatBtn = document.getElementById('galeria-float-btn');
    const alexFloatBtn = document.getElementById('alex-float-btn');
    
    const passwordModal = document.getElementById('password-modal');
    const passwordInputField = document.getElementById('password-input-field');
    const passwordSubmitBtn = document.getElementById('password-submit-btn');
    const passwordCloseBtn = document.getElementById('password-close-btn');
    const passwordError = document.getElementById('password-error');
    
    const debugChatWindow = document.getElementById('debug-chat-window');
    const debugCloseBtn = document.getElementById('debug-close-btn');
    const debugAnalyzeBtn = document.getElementById('debug-analyze-btn');
    const debugOutput = document.getElementById('debug-output');
    const debugDragHandle = document.getElementById('debug-drag-handle');
    const debugStatus = document.getElementById('debug-status');
    const debugLoading = document.getElementById('debug-loading');
    const languageSelector = document.getElementById('language-selector');
    
    const aiChatWindow = document.getElementById('ai-chat-window');
    const aiCloseBtn = document.getElementById('ai-close-btn');
    const aiMessages = document.getElementById('ai-messages');
    const aiInput = document.getElementById('ai-input');
    const aiSendBtn = document.getElementById('ai-send-btn');
    const aiDragHandle = document.getElementById('ai-drag-handle');
    const contactBtn = document.getElementById('contact-btn');
    
    // === Elementos Matrix ===
    const matrixOverlay = document.getElementById('matrix-overlay');
    const matrixCanvas = document.getElementById('matrix-canvas');
    const tearContainer = document.querySelector('.tear-container');
    const tear = document.querySelector('.tear');
    
    // === FUNCIÓN PARA HACER VENTANAS ARRASTRABLES ===
    function makeDraggable(element, handle) {
      let isDragging = false;
      let currentX;
      let currentY;
      let initialX;
      let initialY;
      let xOffset = 0;
      let yOffset = 0;
      let startX, startY;

      handle.addEventListener('mousedown', dragStart);
      document.addEventListener('mousemove', drag);
      document.addEventListener('mouseup', dragEnd);

      handle.addEventListener('touchstart', dragStart);
      document.addEventListener('touchmove', drag);
      document.addEventListener('touchend', dragEnd);

      function dragStart(e) {
        if (e.target.closest('.ai-chat-close') || e.target.closest('.debug-chat-close')) {
          return; 
        }

        if (e.type === 'touchstart') {
          initialX = e.touches[0].clientX - xOffset;
          initialY = e.touches[0].clientY - yOffset;
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
        } else {
          initialX = e.clientX - xOffset;
          initialY = e.clientY - yOffset;
          startX = e.clientX;
          startY = e.clientY;
        }

        if (e.target === handle || handle.contains(e.target)) {
          isDragging = true;
          element.classList.add('dragging');
          
          const rect = element.getBoundingClientRect();
          element._initialPosition = {
            top: rect.top,
            left: rect.left
          };
        }
        
        e.preventDefault();
      }

      function drag(e) {
        if (isDragging) {
          e.preventDefault();

          if (e.type === 'touchmove') {
            currentX = e.touches[0].clientX - initialX;
            currentY = e.touches[0].clientY - initialY;
          } else {
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
          }

          xOffset = currentX;
          yOffset = currentY;

          setTranslate(currentX, currentY, element);
        }
      }

      function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
      }

      function dragEnd(e) {
        isDragging = false;
        element.classList.remove('dragging');
        
        const rect = element.getBoundingClientRect();
        element._currentPosition = {
          top: rect.top,
          left: rect.left
        };
      }
    }

    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(() => {
        if (debugChatWindow && debugDragHandle) {
          makeDraggable(debugChatWindow, debugDragHandle);
        }
        if (aiChatWindow && aiDragHandle) {
          makeDraggable(aiChatWindow, aiDragHandle);
        }
      }, 1000);
    });
    
    // === EFECTO MATRIX ===
    let matrixCtx = matrixCanvas.getContext('2d');
    let matrixChars = [];
    let matrixAnimationId = null;
    let isTearing = false;
    let tearForce = 0;
    const MAX_TEAR_FORCE = 100;
    
    const MATRIX_CONFIG = {
      fontSize: 14,
      columns: 0,
      charSet: "01",
      colors: ['#0f0', '#0c0', '#090', '#060', '#0f0']
    };
    
    function initMatrixEffect() {
      console.log("🟢 Inicializando efecto Matrix...");
      
      matrixCanvas.width = window.innerWidth;
      matrixCanvas.height = window.innerHeight;
      
      MATRIX_CONFIG.columns = Math.floor(window.innerWidth / MATRIX_CONFIG.fontSize);
      
      matrixChars = [];
      for (let i = 0; i < MATRIX_CONFIG.columns; i++) {
        matrixChars.push({
          x: i * MATRIX_CONFIG.fontSize,
          y: Math.random() * -window.innerHeight,
          speed: 2 + Math.random() * 5,
          chars: [],
          charCount: 10 + Math.floor(Math.random() * 20)
        });
      }
      
      if (matrixAnimationId) {
        cancelAnimationFrame(matrixAnimationId);
      }
      drawMatrix();
    }
    
    function drawMatrix() {
      matrixCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
      
      matrixCtx.font = `bold ${MATRIX_CONFIG.fontSize}px 'JetBrains Mono', monospace`;
      
      matrixChars.forEach(column => {
        column.y += column.speed;
        
        if (column.y > window.innerHeight) {
          column.y = Math.random() * -100;
          column.chars = [];
        }
        
        if (column.chars.length < column.charCount) {
          const newChar = {
            char: MATRIX_CONFIG.charSet[Math.floor(Math.random() * MATRIX_CONFIG.charSet.length)],
            color: MATRIX_CONFIG.colors[Math.floor(Math.random() * MATRIX_CONFIG.colors.length)]
          };
          column.chars.push(newChar);
        }
        
        column.chars.forEach((charObj, index) => {
          const yPos = column.y - (index * MATRIX_CONFIG.fontSize);
          
          if (yPos > -MATRIX_CONFIG.fontSize && yPos < window.innerHeight) {
            matrixCtx.fillStyle = charObj.color;
            matrixCtx.fillText(charObj.char, column.x, yPos);
          }
        });
        
        if (column.chars.length > column.charCount) {
          column.chars.shift();
        }
      });
      
      if (matrixOverlay.classList.contains('active')) {
        matrixAnimationId = requestAnimationFrame(drawMatrix);
      }
    }
    
    function handleTearEffect() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
      const overscroll = Math.max(0, (scrollTop + clientHeight) - scrollHeight);
      
      if (isAtBottom && overscroll > 0) {
        tearForce = Math.min(MAX_TEAR_FORCE, overscroll * 2);
        
        if (tearForce > 5 && !isTearing) {
          isTearing = true;
          matrixOverlay.classList.add('active');
          tearContainer.classList.add('active');
          tear.classList.add('active');
          initMatrixEffect();
          // === ACTUALIZAR CONTADOR AL ACTIVAR MATRIX (ELIMINADO: ahora solo se actualiza al cargar la página) ===
          // updateGlobalVisitCounter();  <-- Línea eliminada
        }
        
        const tearPosition = 70 - (tearForce / MAX_TEAR_FORCE) * 25;
        tear.style.top = `${tearPosition}%`;
        
      } else {
        tearForce = Math.max(0, tearForce - 8);
        
        if (tearForce <= 0 && isTearing) {
          isTearing = false;
          tear.classList.remove('active');
          
          setTimeout(() => {
            matrixOverlay.classList.remove('active');
            tearContainer.classList.remove('active');
            
            if (matrixAnimationId) {
              cancelAnimationFrame(matrixAnimationId);
              matrixAnimationId = null;
            }
          }, 600);
        } else if (isTearing) {
          const tearPosition = 70 - (tearForce / MAX_TEAR_FORCE) * 25;
          tear.style.top = `${tearPosition}%`;
        }
      }
    }
    
    // === CONFIGURACIÓN DE COLORES MEJORADA ===
    const colorPalettes = [
      { r: '255, 100, 100', hex: '#ff6464' },
      { r: '255, 165, 80',  hex: '#ffa550' },
      { r: '255, 220, 100', hex: '#ffdc64' },
      { r: '100, 220, 150', hex: '#64dc96' },
      { r: '100, 180, 255', hex: '#64b4ff' },
      { r: '180, 120, 255', hex: '#b478ff' }
    ];
    
    function applyRandomColors() {
      const theme = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
      
      const accentColor = `rgb(${theme.r})`;
      const glowColor = `rgba(${theme.r}, 0.4)`;
      const bgColor = `rgba(${theme.r}, 0.1)`;
      
      const btns = document.querySelectorAll('.float-btn');
      btns.forEach(btn => {
        btn.style.setProperty('--btn-accent', accentColor);
        btn.style.setProperty('--btn-accent-glow', glowColor);
        btn.style.setProperty('--btn-bg', bgColor);
      });

      if(contactBtn) {
        contactBtn.style.background = `rgba(${theme.r}, 0.15)`;
        contactBtn.style.border = `1px solid rgba(${theme.r}, 0.3)`;
        contactBtn.onmouseenter = () => {
           contactBtn.style.boxShadow = `0 12px 40px ${glowColor}`;
           contactBtn.style.borderColor = accentColor;
        };
        contactBtn.onmouseleave = () => {
           contactBtn.style.boxShadow = `0 8px 32px rgba(${theme.r}, 0.25)`;
           contactBtn.style.borderColor = `rgba(${theme.r}, 0.3)`;
        };
      }
      
      const modals = [debugChatWindow, aiChatWindow];
      modals.forEach(modal => {
        if(modal) {
          modal.style.border = `1px solid rgba(${theme.r}, 0.3)`;
          modal.style.boxShadow = `0 8px 32px rgba(${theme.r}, 0.2)`;
          modal.style.background = document.body.dataset.theme === 'dark' 
            ? `rgba(${theme.r}, 0.08)` 
            : `rgba(${theme.r}, 0.1)`;
        }
      });
    }

    // === Lógica de tema con persistencia ===
    const modeButtons = document.querySelectorAll('[data-mode]');
    
    function applyTheme(mode) {
      if (mode === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.dataset.theme = prefersDark ? 'dark' : 'light';
      } else {
        document.body.dataset.theme = mode;
      }
      
      if (debugEditor && editorInitialized) {
        const theme = document.body.dataset.theme === 'dark' ? 'vs-dark' : 'vs';
        monaco.editor.setTheme(theme);
      }
      setTimeout(applyRandomColors, 50);
    }

    // Cargar tema guardado al inicio
    const savedTheme = getPreference(STORAGE_KEYS.THEME, 'auto');
    modeButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === savedTheme);
    });
    applyTheme(savedTheme);

    modeButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        modeButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const selectedMode = this.dataset.mode;
        setPreference(STORAGE_KEYS.THEME, selectedMode);
        applyTheme(selectedMode);
      });
    });

    if (savedTheme === 'auto') {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (getPreference(STORAGE_KEYS.THEME) === 'auto') {
          applyTheme('auto');
        }
      });
    }

    // ========================================
    // LOGICA DE TRADUCCION
    // ========================================
    const translations = {
      nav_home: { en: "Home", es: "Inicio" },
      nav_services: { en: "Services", es: "Servicios" },
      nav_departments: { en: "Departments", es: "Departamentos" },
      nav_contact: { en: "Contact", es: "Contacto" },
      nav_about: { en: "About", es: "Acerca" },
      mode_auto: { en: "Auto", es: "Auto" },
      mode_light: { en: "Light", es: "Claro" },
      mode_dark: { en: "Dark", es: "Oscuro" },
      hero_subtitle: { en: "Software and hardware within everyone's reach.", es: "Software y hardware al alcance de todos." },
      hero_p1: { 
        en: "We are a development laboratory specializing in native iOS applications, scalable web solutions, electronic systems integration, and additive manufacturing (3D printing). We combine cutting-edge technologies with agile methodologies to deliver innovative products that solve complex problems.", 
        es: "Somos un laboratorio de desarrollo especializado en aplicaciones iOS nativas, soluciones web escalables, integración de sistemas electrónicos y fabricación aditiva (impresión 3D). Combinamos tecnologías de vanguardia con metodologías ágiles para ofrecer productos innovadores que resuelvan problemas complejos." 
      },
      hero_p2: { 
        en: "Our multidisciplinary approach allows us to tackle projects from conception to implementation, creating comprehensive solutions that connect the digital world with the physical.", 
        es: "Nuestro enfoque multidisciplinario nos permite abordar proyectos desde la concepción hasta la implementación, creando soluciones integrales que conectan el mundo digital con el físico." 
      },
      services_title: { en: "Services", es: "Servicios" },
      services_lead: { en: "Custom development, technical consulting, and rapid prototyping. We transform ideas into functional products.", es: "Desarrollo a medida, consultoría técnica y prototipado rápido. Transformamos ideas en productos funcionales." },
      service_ios_title: { en: "iOS Development", es: "Desarrollo iOS" },
      service_ios_desc: { en: "Native applications for iPhone and iPad using Swift and SwiftUI. Optimized interfaces and exceptional user experience with full Apple ecosystem integration.", es: "Aplicaciones nativas para iPhone y iPad usando Swift y SwiftUI. Interfaces optimizadas y experiencia de usuario excepcional con integración completa del ecosistema Apple." },
      service_web_title: { en: "Web Solutions", es: "Soluciones Web" },
      service_web_desc: { en: "Development of modern web applications, RESTful APIs, and scalable backend systems with the latest technologies. Robust and maintainable architectures.", es: "Desarrollo de aplicaciones web modernas, APIs RESTful y sistemas backend escalables con las últimas tecnologías. Arquitecturas robustas y mantenibles." },
      service_hw_title: { en: "Hardware/Software Integration", es: "Integración Hardware/Software" },
      service_hw_desc: { en: "Embedded systems, IoT, automation, and physical device control via custom software. Seamless connection between the digital and physical worlds.", es: "Sistemas embebidos, IoT, automatización y control de dispositivos físicos mediante software personalizado. Conexión perfecta entre mundo digital y físico." },
      service_3d_title: { en: "Additive Manufacturing", es: "Fabricación Aditiva" },
      service_3d_desc: { en: "Rapid prototyping, custom parts, and 3D printing solutions for hardware projects and physical products. From concept to final product.", es: "Prototipado rápido, piezas personalizadas y soluciones de impresión 3D para proyectos de hardware y productos físicos. Desde concepto hasta producto final." },
      service_consulting_title: { en: "Technical Consulting", es: "Consultoría Técnica" },
      service_consulting_desc: { en: "Specialized advice on software architecture, process optimization, and technology strategies. We maximize the value of your technological investment.", es: "Asesoramiento especializado en arquitectura de software, optimización de procesos y estrategias tecnológicas. Maximizamos el valor de tu inversión tecnológica." },
      service_maintenance_title: { en: "Maintenance & Support", es: "Mantenimiento & Soporte" },
      service_maintenance_desc: { en: "Continuous maintenance services, updates, and technical support to ensure optimal operation of your systems in the long term.", es: "Servicios continuos de mantenimiento, actualizaciones y soporte técnico para garantizar el funcionamiento óptimo de tus sistemas a largo plazo." },
      dept_title: { en: "Departments", es: "Departamentos" },
      dept_lead: { en: "Specialized teams working in synergy to offer complete and innovative solutions.", es: "Equipos especializados trabajando en sinergia para ofrecer soluciones completas e innovadoras." },
      dept_ios_title: { en: "iOS Development", es: "Desarrollo iOS" },
      dept_ios_desc: { en: "Specialists in Swift, SwiftUI, and the Apple ecosystem. Creation of high-performance native applications with fluid interfaces and exceptional user experiences.", es: "Especialistas en Swift, SwiftUI y el ecosistema Apple. Creación de aplicaciones nativas de alto rendimiento con interfaces fluidas y experiencias de usuario excepcionales." },
      dept_eng_title: { en: "Software Engineering", es: "Ingeniería de Software" },
      dept_eng_desc: { en: "Systems architecture, backend development, databases, and APIs. Modern and scalable technologies to build robust and maintainable solutions.", es: "Arquitectura de sistemas, desarrollo backend, bases de datos y APIs. Tecnologías modernas y escalables para construir soluciones robustas y mantenibles." },
      dept_elec_title: { en: "Electronics & IoT", es: "Electrónica & IoT" },
      dept_elec_desc: { en: "Circuit design, embedded systems, sensors, and connectivity. Bridge between the digital and physical worlds, creating tangible and innovative solutions.", es: "Diseño de circuitos, sistemas embebidos, sensores y conectividad. Puente entre el mundo digital y físico, creando soluciones tangibles e innovadoras." },
      dept_design_title: { en: "Design & UX/UI", es: "Diseño & UX/UI" },
      dept_design_desc: { en: "Intuitive interfaces, optimized user experience, and attractive visual design for all our products. Focused on usability and aesthetics.", es: "Interfaces intuitivas, experiencia de usuario optimizada y diseño visual atractivo para todos nuestros productos. Centrados en la usabilidad y estética." },
      dept_fab_title: { en: "Manufacturing & Prototyping", es: "Fabricación & Prototipado" },
      dept_fab_desc: { en: "3D printing, CNC machining, and fabrication of functional prototypes for concept validation. Materialization of ideas into physical products.", es: "Impresión 3D, mecanizado CNC y fabricación de prototipos funcionales para validación de conceptos. Materialización de ideas en productos físicos." },
      dept_qa_title: { en: "Quality Control", es: "Control de Calidad" },
      dept_qa_desc: { en: "Exhaustive testing, test automation, and quality assurance at every stage of development. Committed to excellence and reliability.", es: "Testing exhaustivo, automatización de pruebas y garantía de calidad en cada etapa del desarrollo. Comprometidos con la excelencia y fiabilidad." },
      contact_title: { en: "Contact", es: "Contacto" },
      contact_lead: { en: "Do you have a project in mind? Let's talk about how we can make it happen.", es: "¿Tienes un proyecto en mente? Hablemos sobre cómo podemos hacerlo realidad." },
      contact_info_title: { en: "Contact Information", es: "Información de Contacto" },
      contact_phone: { en: "Phone:", es: "Teléfono:" },
      contact_msg: { en: "Send message", es: "Enviar mensaje" },
      contact_btn: { en: "CONTACT", es: "CONTACTO" },
      contact_hours_title: { en: "Business Hours", es: "Horario de Atención" },
      contact_mon_fri: { en: "Monday to Friday:", es: "Lunes a Viernes:" },
      contact_sat: { en: "Saturdays:", es: "Sábados:" },
      contact_tz: { en: "EST Time (Eastern US)", es: "Horario EST (Este de EE. UU.)" },
      contact_process_title: { en: "Work Process", es: "Proceso de Trabajo" },
      process_1: { en: "Initial consultation", es: "Consulta inicial" },
      process_2: { en: "Analysis and planning", es: "Análisis y planificación" },
      process_3: { en: "Detailed proposal", es: "Propuesta detallada" },
      process_4: { en: "Iterative development", es: "Desarrollo iterativo" },
      process_5: { en: "Delivery and support", es: "Entrega y soporte" },
      about_title: { en: "About ProtonLab", es: "Acerca de ProtonLab" },
      about_lead: { en: "More than a development company, we are an innovation laboratory where ideas take shape.", es: "Más que una empresa de desarrollo, somos un laboratorio de innovación donde las ideas toman forma." },
      about_phil_title: { en: "Our Philosophy", es: "Nuestra Filosofía" },
      about_phil_desc: { en: "We believe in the intersection of software and hardware as the future of technology. Every project is an opportunity to create something unique and meaningful that solves real problems and improves the user experience.", es: "Creemos en la intersección entre software y hardware como el futuro de la tecnología. Cada proyecto es una oportunidad para crear algo único y significativo que resuelva problemas reales y mejore la experiencia del usuario." },
      about_method_title: { en: "Methodology", es: "Metodología" },
      about_method_desc: { en: "We combine agile development with solid engineering principles. We prioritize transparent communication and iterative value delivery, ensuring that each stage of the project is aligned with the client's objectives.", es: "Combinamos desarrollo ágil con principios de ingeniería sólidos. Priorizamos la comunicación transparente y la entrega iterativa de valor, asegurando que cada etapa del proyecto esté alineada con los objetivos del cliente." },
      about_tech_title: { en: "Technologies", es: "Tecnologías" },
      about_tech_desc: { en: "We work with a modern and versatile technology stack, always selecting the right tool for each specific challenge. We stay updated with the latest trends and best practices in the industry.", es: "Trabajamos con un stack tecnológico moderno y versátil, seleccionando siempre la herramienta adecuada para cada desafío específico. Mantenemos actualizados con las últimas tendencias y mejores prácticas de la industria." },
      about_quality_title: { en: "Commitment to Quality", es: "Compromiso con la Calidad" },
      about_quality_desc: { en: "At ProtonLab, we don't just deliver code; we deliver solutions that work, scale, and endure. Our commitment is to technical excellence and customer satisfaction in every project we undertake, ensuring that every line of code and every physical component meets the highest quality standards.", es: "En ProtonLab, no entregamos solo código; entregamos soluciones que funcionan, escalan y perduran. Nuestro compromiso es con la excelencia técnica y la satisfacción del cliente en cada proyecto que emprendemos, asegurando que cada línea de código y cada componente físico cumplan con los más altos estándares de calidad." },
      footer_text: { en: "Innovation in every line of code, precision in every physical component.", es: "Innovación en cada línea de código, precisión en cada componente físico." },
      pay_modal_title: { en: "Payment Access", es: "Acceso a Pagos" },
      pay_modal_label: { en: "Password", es: "Contraseña" },
      pay_modal_error: { en: "Incorrect password. Try again.", es: "Contraseña incorrecta. Intente nuevamente." },
      pay_modal_btn: { en: "Access", es: "Acceder" },
      float_sim: { en: "Simulation", es: "Simulación" },
      float_traffic: { en: "Traffic", es: "Tráfico" },
      float_pay: { en: "Payments", es: "Pagos" },
      float_gallery: { en: "Gallery", es: "Galería" },
      debug_editor_title: { en: "Code Editor", es: "Editor de Código" },
      debug_analysis: { en: "Analysis", es: "Análisis" },
      debug_verifying: { en: "verifying...", es: "verificando..." },
      debug_btn_analyze: { en: "Analyze", es: "Analizar" },
      debug_placeholder: { en: "💡 Write your code and press \"Analyze\"", es: "💡 Escribe tu código y presiona \"Analizar\"" },
      debug_analyzing_txt: { en: "Analyzing code...", es: "Analizando código..." },
      
      ai_greeting: {
        en: "Hello! I'm RickGPT, your AI assistant specialized in software and hardware development. How can I help you today?",
        es: "¡Hola! Soy RickGPT, tu asistente de IA especializado en desarrollo de software y hardware. ¿En qué puedo ayudarte hoy?"
      },
      ai_input_placeholder: {
        en: "Write your message...",
        es: "Escribe tu mensaje..."
      },
      debug_status_checking: {
        en: "verifying...",
        es: "verificando..."
      },
      debug_status_online: {
        en: "online",
        es: "online"
      },
      debug_status_offline: {
        en: "offline",
        es: "offline"
      },
      debug_editor_example: {
        en: `// Write or paste your code here\n// Example in JavaScript:\n\nfunction factorial(n) {\n  if (n === 1) {\n    return 1;\n  }\n  return n * factorial(n - 1);\n}\n\nconsole.log(factorial(5));`,
        es: `// Escribe o pega tu código aquí\n// Ejemplo en JavaScript:\n\nfunction factorial(n) {\n  if (n === 1) {\n    return 1;\n  }\n  return n * factorial(n - 1);\n}\n\nconsole.log(factorial(5));`
      },
      visits: {
        en: "TOTAL VISITS",
        es: "VISITAS TOTALES"
      }
    };

    const langButtons = document.querySelectorAll('[data-lang]');
    let currentLang = 'en';

    function changeLanguage(lang) {
      currentLang = lang;
      
      langButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
      });

      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[key] && translations[key][lang]) {
          if (el.id === 'typed-subtitle' || el.tagName === 'P') {
            el.innerText = translations[key][lang];
          } else {
            el.innerText = translations[key][lang];
          }
        }
      });
      
      const passwordInput = document.getElementById('password-input-field');
      if (passwordInput) {
        passwordInput.placeholder = lang === 'en' ? "Enter password" : "Ingrese la contraseña";
      }
      
      const aiInputEl = document.getElementById('ai-input');
      if (aiInputEl) {
        const ph = aiInputEl.getAttribute('placeholder');
        if (ph !== 'Conectando...' && ph !== 'Connecting...' && ph !== 'Servidor no disponible' && ph !== 'Server unavailable') {
          aiInputEl.placeholder = translations.ai_input_placeholder[lang];
        }
      }
      
      document.documentElement.lang = lang;
      
      if (debugEditor && editorInitialized) {
        const currentLanguage = languageSelector.value;
        updateExampleCode(currentLanguage, true);
      }
      
      if (debugStatus) {
        const currentClass = debugStatus.className;
        if (currentClass.includes('status-checking')) {
          debugStatus.textContent = translations.debug_status_checking[lang];
        } else if (currentClass.includes('status-online')) {
          debugStatus.textContent = translations.debug_status_online[lang];
        } else if (currentClass.includes('status-offline')) {
          debugStatus.textContent = translations.debug_status_offline[lang];
        }
      }

      // Actualizar texto del contador de visitas
      const visitText = document.querySelector('.visit-counter span:first-child');
      if (visitText && translations.visits && translations.visits[lang]) {
        visitText.textContent = translations.visits[lang];
      }
    }

    const savedLang = getPreference(STORAGE_KEYS.LANG, 'en');
    changeLanguage(savedLang);

    langButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        const selectedLang = this.dataset.lang;
        setPreference(STORAGE_KEYS.LANG, selectedLang);
        changeLanguage(selectedLang);
      });
    });

    // === ANIMACIÓN TÍTULO ===
    const typed = document.getElementById('typed');
    const brandMini = document.getElementById('brandMini');
    const finalText = 'ProtonLab';
    const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const revealOrder = [0, 6, 3, 7, 2, 5, 8, 1, 4];
    
    let currentText = Array(9).fill('');
    let currentStep = 0;
    let animationPhase = 1;
    let animationInterval;
    let animationStartTime;
    const animationSpeed = 100;
    
    function startTitleAnimation() {
      currentText = Array(9).fill('');
      currentStep = 0;
      animationPhase = 1;
      animationStartTime = Date.now();
      
      if (animationInterval) clearInterval(animationInterval);
      
      animationInterval = setInterval(updateAnimation, animationSpeed);
      
      const phase1Steps = 9;
      const phase1TimePerStep = 3000 / phase1Steps;
      
      for (let i = 0; i < phase1Steps; i++) {
        setTimeout(() => {
          if (currentStep < 9) currentStep++;
        }, i * phase1TimePerStep);
      }
      
      setTimeout(() => { animationPhase = 2; }, 3000);
      setTimeout(() => {
        clearInterval(animationInterval);
        typed.textContent = finalText;
      }, 5000);
    }
    
    function updateAnimation() {
      if (animationPhase === 1) {
        for (let i = 0; i < 9; i++) {
          if (i < currentStep) {
            const pos = revealOrder[i];
            currentText[pos] = randomChars[Math.floor(Math.random() * randomChars.length)];
          } else {
            const pos = revealOrder[i];
            currentText[pos] = '';
          }
        }
      } else if (animationPhase === 2) {
        const progress = (Date.now() - animationStartTime - 3000) / 2000;
        const charsToReveal = Math.min(9, Math.floor(progress * 9));
        
        for (let i = 0; i < 9; i++) {
          if (i < charsToReveal) {
            const pos = revealOrder[i];
            currentText[pos] = finalText[pos];
          } else {
            const pos = revealOrder[i];
            currentText[pos] = randomChars[Math.floor(Math.random() * randomChars.length)];
          }
        }
      }
      
      typed.textContent = currentText.join('');
    }
    
    startTitleAnimation();
    brandMini.addEventListener('click', () => { startTitleAnimation(); });

    // === PARALLAX PANELS (OPTIMIZADO PARA MÓVILES) ===
    const panels = document.getElementById('panels');
    
    const rainbowColors = ['color-red', 'color-orange', 'color-yellow', 'color-green', 'color-blue', 'color-violet'];
    const occupiedPositions = [];
    
    function isOverlapping(pos1, pos2, size1, size2, margin = 5) {
      const left1 = parseFloat(pos1.left);
      const top1 = parseFloat(pos1.top);
      const left2 = parseFloat(pos2.left);
      const top2 = parseFloat(pos2.top);
      
      const right1 = left1 + size1.width + margin;
      const bottom1 = top1 + size1.height + margin;
      const right2 = left2 + size2.width + margin;
      const bottom2 = top2 + size2.height + margin;
      
      return !(right1 < left2 || left1 > right2 || bottom1 < top2 || top1 > bottom2);
    }
    
    function getRandomPosition(sizeType) {
      let leftMin, leftMax, topMin, topMax, size;
      
      switch(sizeType) {
        case 'large':
          leftMin = 2; leftMax = 70; topMin = 15; topMax = 70;
          size = { width: 20, height: 15 };
          break;
        case 'medium':
          leftMin = 5; leftMax = 75; topMin = 10; topMax = 75;
          size = { width: 16, height: 12 };
          break;
        case 'small':
          leftMin = 8; leftMax = 82; topMin = 5; topMax = 80;
          size = { width: 12, height: 8 };
          break;
      }
      
      let attempts = 0;
      const maxAttempts = 50;
      
      while (attempts < maxAttempts) {
        const position = {
          left: (leftMin + Math.random() * (leftMax - leftMin)).toFixed(1) + '%',
          top: (topMin + Math.random() * (topMax - topMin)).toFixed(1) + '%'
        };
        
        let hasOverlap = false;
        for (const occupied of occupiedPositions) {
          if (isOverlapping(position, occupied.position, size, occupied.size)) {
            hasOverlap = true;
            break;
          }
        }
        
        if (!hasOverlap) {
          occupiedPositions.push({ position, size });
          return position;
        }
        
        attempts++;
      }
      
      const fallbackPosition = {
        left: (leftMin + Math.random() * (leftMax - leftMin)).toFixed(1) + '%',
        top: (topMin + Math.random() * (topMax - topMin)).toFixed(1) + '%'
      };
      occupiedPositions.push({ position: fallbackPosition, size });
      return fallbackPosition;
    }
    
    function shuffleArray(array) {
      const newArray = [...array];
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
      return newArray;
    }
    
    const shuffledColors = shuffleArray(rainbowColors);
    
    const largePanelsContent = [
      { speed: 0.9, lines: ['// Inicializando...', 'const a = 42;', 'function ping() {', '  return "pong";', '}', 'console.log(ping());'] },
      { speed: 0.8, lines: ['<init/>', '#include <stdio.h>', 'int main() {', '  printf("Hola");', '  return 0;', '}', 'boot> OK'] },
      { speed: 0.7, lines: ['// Lectura sensor', 'val = analogRead(A0);', 'if (val > 512) {', '  digitalWrite(HIGH);', '} else {', '  digitalWrite(LOW);', '}', 'send(val);'] },
      { speed: 0.6, lines: ['class Device {', '  constructor(name) {', '    this.name = name;', '    this.status = "off";', '  }', '  run() {', '    status="running";', '  }', '}'] }
    ];
    
    const mediumPanelsContent = [
      { speed: 0.5, lines: ['// Config API', 'const config = {', '  endpoint: "/api",', '  timeout: 5000,', '  retries: 3', '}', 'export config;'] },
      { speed: 0.45, lines: ['func calculate() {', '  let x = 10', '  let y = 20', '  return x + y', '}', 'print(result)'] },
      { speed: 0.4, lines: ['public class Hello {', '  public static void', '  main(String[] args) {', '    System.out.println("Hi");', '  }', '}'] },
      { speed: 0.35, lines: ['-- Tabla usuarios', 'CREATE TABLE users (', '  id INT PRIMARY KEY,', '  name VARCHAR(100)', ');', 'INSERT...'] },
      { speed: 0.3, lines: ['import SwiftUI', 'struct ContentView: View {', '  var body: some View {', '    Text("Hello")', '  }', '}'] }
    ];
    
    const smallPanelsContent = [
      { speed: 0.25, lines: ['npm install...', '✓ Dependencies', 'build completed'] },
      { speed: 0.2, lines: ['git commit -m', '"update: features"', 'push origin main'] },
      { speed: 0.18, lines: ['DEBUG MODE', 'WARNING: check', 'parameters valid'] },
      { speed: 0.15, lines: ['CPU: 45% load', 'MEM: 2.3GB used', 'NET: 120kb/s'] },
      { speed: 0.12, lines: ['test.py running', '✓ 15/15 passed', 'coverage: 92%'] },
      { speed: 0.1, lines: ['docker build', 'image: ready', 'container: run'] }
    ];
    
    const isMobile = window.innerWidth <= 768;
    
    const largePanelsToUse = isMobile ? largePanelsContent.slice(0, 2) : largePanelsContent;
    const mediumPanelsToUse = isMobile ? mediumPanelsContent.slice(0, 3) : mediumPanelsContent;
    const smallPanelsToUse = isMobile ? smallPanelsContent.slice(0, 3) : smallPanelsContent;
    
    const largePanels = largePanelsToUse.map(content => ({ ...content, ...getRandomPosition('large') }));
    const mediumPanels = mediumPanelsToUse.map(content => ({ ...content, ...getRandomPosition('medium') }));
    const smallPanels = smallPanelsToUse.map(content => ({ ...content, ...getRandomPosition('small') }));
    
    function typeText(element, text, speed, onComplete) {
      let i = 0;
      element.innerHTML = '';
      
      function typeChar() {
        if (i < text.length) {
          const char = text.charAt(i);
          element.innerHTML += char === ' ' ? '&nbsp;' : char;
          i++;
          
          let delay = speed;
          if (char === '.' || char === ';' || char === '}') delay = speed * 3;
          else if (char === ',' || char === ' ') delay = speed * 1.5;
          
          setTimeout(typeChar, delay);
        } else if (onComplete) {
          setTimeout(onComplete, 1000);
        }
      }
      
      typeChar();
    }
    
    function animatePanel(panel, lines, isSmall = false) {
      const inner = panel.querySelector('.inner');
      let currentLine = 0;
      let isAnimating = false;
      let timeoutId = null;
      
      function stopAnimation() {
        isAnimating = false;
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      }
      
      function typeNextLine() {
        if (!isAnimating) return;
        
        if (currentLine < lines.length) {
          const lineElement = document.createElement('div');
          lineElement.className = 'code-line';
          inner.appendChild(lineElement);
          
          const baseSpeed = isSmall ? 25 + Math.random() * 20 : 40 + Math.random() * 30;
          
          typeText(lineElement, lines[currentLine], baseSpeed, () => {
            if (!isAnimating) return;
            
            currentLine++;
            if (currentLine < lines.length) {
              const pauseTime = isSmall ? 200 : 300;
              timeoutId = setTimeout(typeNextLine, pauseTime);
            } else {
              timeoutId = setTimeout(() => {
                if (!isAnimating) return;
                inner.innerHTML = '';
                currentLine = 0;
                timeoutId = setTimeout(typeNextLine, isSmall ? 500 : 800);
              }, isSmall ? 1500 : 2000);
            }
          });
        }
      }
      
      return {
        start: () => { if (!isAnimating) { isAnimating = true; typeNextLine(); } },
        stop: () => { stopAnimation(); }
      };
    }
    
    const animationControllers = new Map();
    const panelObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const panelEl = entry.target;
        const controller = animationControllers.get(panelEl);
        
        if (entry.isIntersecting) {
          if (controller) controller.start();
        } else {
          if (controller) controller.stop();
        }
      });
    }, { root: null, rootMargin: '100px', threshold: 0 });
    
    largePanels.forEach((c, index) => {
      const el = document.createElement('div');
      el.className = 'panel large ' + shuffledColors[index % shuffledColors.length];
      el.style.left = c.left;
      el.style.top = c.top;
      const inner = document.createElement('div');
      inner.className = 'inner';
      el.appendChild(inner);
      panels.appendChild(el);
      c.el = el;
      const controller = animatePanel(el, c.lines, false);
      animationControllers.set(el, controller);
      panelObserver.observe(el);
    });
    
    const shuffledColorsMedium = shuffleArray(rainbowColors);
    mediumPanels.forEach((c, index) => {
      const el = document.createElement('div');
      el.className = 'panel medium ' + shuffledColorsMedium[index % shuffledColorsMedium.length];
      el.style.left = c.left;
      el.style.top = c.top;
      const inner = document.createElement('div');
      inner.className = 'inner';
      el.appendChild(inner);
      panels.appendChild(el);
      c.el = el;
      const controller = animatePanel(el, c.lines, false);
      animationControllers.set(el, controller);
      panelObserver.observe(el);
    });
    
    const shuffledColorsSmall = shuffleArray(rainbowColors);
    smallPanels.forEach((c, index) => {
      const el = document.createElement('div');
      el.className = 'panel small ' + shuffledColorsSmall[index % shuffledColorsSmall.length];
      el.style.left = c.left;
      el.style.top = c.top;
      const inner = document.createElement('div');
      inner.className = 'inner';
      el.appendChild(inner);
      panels.appendChild(el);
      c.el = el;
      const controller = animatePanel(el, c.lines, true);
      animationControllers.set(el, controller);
      panelObserver.observe(el);
    });

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          largePanels.forEach(c => { c.el.style.transform = `translate3d(0, ${-scrollY * c.speed}px, 0)`; });
          mediumPanels.forEach(c => { c.el.style.transform = `translate3d(0, ${-scrollY * c.speed}px, 0)`; });
          smallPanels.forEach(c => { c.el.style.transform = `translate3d(0, ${-scrollY * c.speed}px, 0)`; });
          ticking = false;
        });
        ticking = true;
      }
      
      handleTearEffect();
    });

    // === Ocultar header ===
    const topbar = document.getElementById('topbar'); 
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if(y > lastScroll + 10) topbar.classList.add('hidden');
      else if(y < lastScroll - 10) topbar.classList.remove('hidden');
      lastScroll = y;
    });

    // === Menú hamburguesa ===
    const hamburger = document.getElementById('hamburger');
    const nav = document.getElementById('nav');
    let isMenuOpen = false;
    
    function toggleMenu() {
      isMenuOpen = !isMenuOpen;
      hamburger.classList.toggle('active');
      nav.classList.toggle('active');
      
      if (isMenuOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
    
    hamburger.addEventListener('click', toggleMenu);
    
    document.querySelectorAll('.navlink').forEach(link => {
      link.addEventListener('click', () => {
        if (isMenuOpen) {
          toggleMenu();
        }
      });
    });
    
    document.addEventListener('click', (e) => {
      if (isMenuOpen && !nav.contains(e.target) && !hamburger.contains(e.target)) {
        toggleMenu();
      }
    });
    
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && isMenuOpen) {
        toggleMenu();
      }
      
      if (matrixOverlay.classList.contains('active')) {
        initMatrixEffect();
      }
    });

    // ========================================
    // FUNCIONALIDAD SIMULACIÓN
    // ========================================

    simulationFloatBtn.addEventListener('click', () => {
      window.location.href = 'simulation.html';
    });

    // ========================================
    // FUNCIONALIDAD PITFALL
    // ========================================

    pitfallFloatBtn.addEventListener('click', () => {
      window.location.href = 'pitfall.html';
    });

    // ========================================
    // FUNCIONALIDAD TRÁFICO AÉREO
    // ========================================

    trafficFloatBtn.addEventListener('click', () => {
      window.location.href = 'traficoaereo.html';
    });

    // ========================================
    // FUNCIONALIDAD GALERÍA
    // ========================================

    galeriaFloatBtn.addEventListener('click', () => {
      window.location.href = 'galeria.html';
    });

    // ========================================
    // FUNCIONALIDAD ALEX BETA
    // ========================================

    alexFloatBtn.addEventListener('click', () => {
      window.location.href = 'friendbot.html';
    });

    // ========================================
    // FUNCIONALIDAD PAGOS CON CONTRASEÑA
    // ========================================

    pagosFloatBtn.addEventListener('click', () => {
      openPasswordModal();
    });

    function openPasswordModal() {
      passwordModal.classList.add('active');
      passwordInputField.value = '';
      passwordError.classList.remove('show');
      setTimeout(() => {
        passwordInputField.focus();
      }, 300);
    }

    function closePasswordModal() {
      passwordModal.classList.remove('active');
      passwordInputField.value = '';
      passwordError.classList.remove('show');
    }

    function validatePassword() {
      const password = passwordInputField.value.trim();
      
      if (password === 'swordfish') {
        closePasswordModal();
        window.location.href = 'intercom.html';
      } else {
        passwordError.classList.add('show');
        passwordInputField.value = '';
        passwordInputField.focus();
        
        passwordInputField.style.animation = 'none';
        setTimeout(() => {
          passwordInputField.style.animation = 'shake 0.5s ease-in-out';
        }, 10);
      }
    }

    const style = document.createElement('style');
    style.textContent = `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
      }
    `;
    document.head.appendChild(style);

    passwordSubmitBtn.addEventListener('click', validatePassword);
    
    passwordInputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        validatePassword();
      }
    });
    
    passwordCloseBtn.addEventListener('click', closePasswordModal);
    
    passwordModal.addEventListener('click', (e) => {
      if (e.target === passwordModal) {
        closePasswordModal();
      }
    });

    // ========================================
    // FUNCIONALIDAD DEBUGBOT - CON HEADERS NGrok
    // ========================================
    
    require.config({ 
      paths: { 
        vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' 
      } 
    });

    debugFloatBtn.addEventListener('click', () => {
      if (!isDebugChatOpen) openDebugChat();
    });

    debugCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeDebugChat();
    });

    function openDebugChat() {
      isDebugChatOpen = true;
      floatButtonsContainer.style.display = 'none';
      debugChatWindow.style.display = 'flex';
      
      const isMobile = window.innerWidth <= 1024;
      
      setTimeout(() => {
        debugChatWindow.classList.add('expanding');
        if (isMobile) {
          debugChatWindow.style.left = '2.5vw';
          debugChatWindow.style.bottom = '20px';
          debugChatWindow.style.right = 'auto';
          debugChatWindow.style.top = 'auto';
        }
      }, 50);
      
      setTimeout(() => { 
        if (!editorInitialized) {
          initDebugEditor();
        }
        checkDebugServer();
      }, 600);
    }

    function closeDebugChat() {
      isDebugChatOpen = false;
      debugChatWindow.classList.remove('expanding');
      
      setTimeout(() => {
        debugChatWindow.style.display = 'none';
        floatButtonsContainer.style.display = 'flex';
        
        debugChatWindow.style.bottom = '';
        debugChatWindow.style.right = '';
        debugChatWindow.style.top = '';
        debugChatWindow.style.left = '';
        debugChatWindow.style.width = '';
        debugChatWindow.style.height = '';
      }, 600);
    }

    function initDebugEditor() {
      require(['vs/editor/editor.main'], () => {
        const theme = document.body.dataset.theme === 'dark' ? 'vs-dark' : 'vs';
        
        const exampleCode = translations.debug_editor_example[currentLang] || translations.debug_editor_example['en'];
        
        debugEditor = monaco.editor.create(document.getElementById('debug-editor'), {
          value: exampleCode,
          language: 'javascript',
          theme: theme,
          fontSize: 13,
          fontFamily: "'JetBrains Mono', monospace",
          lineHeight: 1.5,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          readOnly: false,
          wordWrap: 'on',
          lineNumbers: 'on',
          roundedSelection: true,
          renderLineHighlight: 'all',
          cursorBlinking: 'smooth',
          selectOnLineNumbers: true,
          mouseWheelZoom: false,
          dragAndDrop: true,
          folding: true,
          links: true,
          contextmenu: true,
          quickSuggestions: true,
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: 'on',
          tabCompletion: 'on',
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          formatOnPaste: true,
          formatOnType: true
        });

        editorInitialized = true;
        
        languageSelector.addEventListener('change', function() {
          const language = this.value;
          const model = debugEditor.getModel();
          monaco.editor.setModelLanguage(model, language);
          updateExampleCode(language);
        });
        
        setTimeout(() => {
          if (debugEditor) {
            debugEditor.focus();
          }
        }, 300);
        
        debugEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, analyzeCode);
        
        console.log('✅ Editor Debug inicializado');
      });
    }

    function updateExampleCode(language, forceLang = false) {
      const examples = {
        javascript: translations.debug_editor_example[currentLang] || translations.debug_editor_example['en'],
        python: currentLang === 'en' 
          ? `# Example in Python\ndef factorial(n):\n    if n == 1:\n        return 1\n    return n * factorial(n - 1)\n\nprint(factorial(5))`
          : `# Ejemplo en Python\ndef factorial(n):\n    if n == 1:\n        return 1\n    return n * factorial(n - 1)\n\nprint(factorial(5))`,
        java: currentLang === 'en'
          ? `// Example in Java\npublic class Main {\n    public static int factorial(int n) {\n        if (n == 1) {\n            return 1;\n        }\n        return n * factorial(n - 1);\n    }\n    \n    public static void main(String[] args) {\n        System.out.println(factorial(5));\n    }\n}`
          : `// Ejemplo en Java\npublic class Main {\n    public static int factorial(int n) {\n        if (n == 1) {\n            return 1;\n        }\n        return n * factorial(n - 1);\n    }\n    \n    public static void main(String[] args) {\n        System.out.println(factorial(5));\n    }\n}`,
      };
      
      const example = examples[language] || translations.debug_editor_example[currentLang];
      debugEditor.setValue(example);
    }

    function updateDebugStatus(status, message = '') {
      debugStatus.className = 'debug-status-indicator';
      
      switch(status) {
        case 'checking':
          debugStatus.classList.add('status-checking');
          debugStatus.textContent = translations.debug_status_checking[currentLang];
          break;
        case 'online':
          debugStatus.classList.add('status-online');
          debugStatus.textContent = translations.debug_status_online[currentLang];
          break;
        case 'offline':
          debugStatus.classList.add('status-offline');
          debugStatus.textContent = translations.debug_status_offline[currentLang];
          break;
      }
      
      if (message) {
        debugOutput.innerHTML = `<div class="info">${message}</div>`;
      }
    }

    function showDebugLoading() {
      debugLoading.classList.add('active');
      debugOutput.scrollTop = debugOutput.scrollHeight;
    }

    function hideDebugLoading() {
      debugLoading.classList.remove('active');
    }

    async function checkDebugServer() {
      try {
        updateDebugStatus('checking', '🔍 Verificando servidor...');
        
        const response = await fetch(`${OLLAMA_SERVER_URL}/health`, {
          headers: getNgrokHeaders()
        });
        
        if (response.ok) {
          const data = await response.json();
          isServerAvailable = true;
          
          updateDebugStatus('online');
          const successMsg = currentLang === 'en' 
            ? `✅ Server working. Models: ${data.chat}, ${data.debug}`
            : `✅ Servidor funcionando. Modelos: ${data.chat}, ${data.debug}`;
          debugOutput.innerHTML = `<div class="success">${successMsg}</div>`;
          console.log('✅ Backend conectado correctamente:', data);
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        console.error('❌ Error de conexión:', error);
        isServerAvailable = false;
        
        let errorMsg = currentLang === 'en'
          ? `❌ Could not connect to server<br>URL: ${OLLAMA_SERVER_URL}<br>Error: ${error.message}<br><br>Possible solutions:<br>1. Check that OllamaServer.py is running<br>2. Verify that ngrok is active<br>3. Check your internet connection`
          : `❌ No se pudo conectar al servidor<br>URL: ${OLLAMA_SERVER_URL}<br>Error: ${error.message}<br><br>Posibles soluciones:<br>1. Verifica que el backend OllamaServer.py esté corriendo<br>2. Revisa que ngrok esté activo<br>3. Verifica tu conexión a internet`;
        
        updateDebugStatus('offline');
        debugOutput.innerHTML = `<div class="error">${errorMsg}</div>`;
      }
    }

    debugAnalyzeBtn.addEventListener('click', analyzeCode);

    async function analyzeCode() {
      if (isDebugging) {
        console.warn("Análisis en progreso");
        return;
      }
      
      if (!debugEditor || !editorInitialized) {
        debugOutput.innerHTML = '<div class="error">❌ Editor no inicializado</div>';
        return;
      }
      
      if (!isServerAvailable) {
        debugOutput.innerHTML = '<div class="error">❌ Servidor no disponible</div>';
        return;
      }
      
      const code = debugEditor.getValue().trim();
      if (!code || code.length < 10) {
        const warningMsg = currentLang === 'en' 
          ? '⚠️ Write code to analyze'
          : '⚠️ Escribe código para analizar';
        debugOutput.innerHTML = `<div class="warning">${warningMsg}</div>`;
        return;
      }
      
      const selectedLanguage = languageSelector.value;
      const languageName = languageSelector.options[languageSelector.selectedIndex].text;
      
      debugOutput.innerHTML = '';
      showDebugLoading();
      debugAnalyzeBtn.disabled = true;
      debugAnalyzeBtn.textContent = currentLang === 'en' ? 'Analyzing...' : 'Analizando...';
      debugAnalyzeBtn.classList.add('analyzing');
      isDebugging = true;

      try {
        console.log('📤 Enviando código para análisis...');
        
        const response = await fetch(`${OLLAMA_SERVER_URL}/debug`, {
          method: 'POST',
          headers: getNgrokHeaders(),
          body: JSON.stringify({ 
            code: code,
            language: selectedLanguage,
            lang: currentLang
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        hideDebugLoading();
        debugOutput.innerHTML = '';
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.token) {
                  debugOutput.innerHTML += data.token;
                  debugOutput.scrollTop = debugOutput.scrollHeight;
                }
              } catch (e) {
                console.warn('Línea no JSON:', line);
              }
            }
          }
        }
        
        updateDebugStatus('online');
        
      } catch (err) {
        console.error('Error:', err);
        hideDebugLoading();
        const errorMsg = currentLang === 'en'
          ? `❌ Error: ${err.message}`
          : `❌ Error: ${err.message}`;
        debugOutput.innerHTML = `<div class="error">${errorMsg}</div>`;
        updateDebugStatus('offline');
      } finally {
        debugAnalyzeBtn.disabled = false;
        debugAnalyzeBtn.textContent = currentLang === 'en' ? 'Analyze' : 'Analizar';
        debugAnalyzeBtn.classList.remove('analyzing');
        isDebugging = false;
      }
    }

    // ========================================
    // FUNCIONALIDAD RICKGPT (IA) - CON HEADERS NGrok
    // ========================================

    aiFloatBtn.addEventListener('click', () => {
      if (!isAIChatOpen) openAIChat();
    });

    aiCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAIChat();
    });

    function openAIChat() {
      isAIChatOpen = true;
      floatButtonsContainer.style.display = 'none';
      aiChatWindow.style.display = 'flex';
      
      const isMobile = window.innerWidth <= 768;
      
      setTimeout(() => {
        aiChatWindow.classList.add('expanding');
        if (isMobile) {
          aiChatWindow.style.left = '2.5vw';
          aiChatWindow.style.bottom = '20px';
          aiChatWindow.style.right = 'auto';
          aiChatWindow.style.top = 'auto';
        }
      }, 50);
      
      setTimeout(() => { initAIConnection(); }, 600);
    }

    function closeAIChat() {
      isAIChatOpen = false;
      aiChatWindow.classList.remove('expanding');
      
      setTimeout(() => {
        aiChatWindow.style.display = 'none';
        floatButtonsContainer.style.display = 'flex';
        
        aiChatWindow.style.bottom = '';
        aiChatWindow.style.right = '';
        aiChatWindow.style.top = '';
        aiChatWindow.style.left = '';
        aiChatWindow.style.width = '';
        aiChatWindow.style.height = '';
        
        currentSessionId = null;
        aiMessages.innerHTML = '';
        aiInput.value = '';
        aiInput.disabled = true;
        aiSendBtn.disabled = true;
        aiInput.placeholder = currentLang === 'en' ? 'Connecting...' : 'Conectando...';
        isServerAvailable = false;
      }, 600);
    }

    async function initAIConnection() {
      try {
        addAIMessage(currentLang === 'en' ? 'Connecting to RickGPT...' : 'Conectando con RickGPT...', false);
        
        currentSessionId = "ai-session-" + Date.now();
        
        const testResponse = await fetch(`${OLLAMA_SERVER_URL}/chat`, {
          method: 'POST',
          headers: getNgrokHeaders(),
          body: JSON.stringify({
            message: "ping",
            session_id: currentSessionId,
            assistant: "rickgpt",
            lang: currentLang
          })
        });
        
        if (testResponse.ok) {
          const data = await testResponse.json();
          aiMessages.innerHTML = '';
          addAIMessage(translations.ai_greeting[currentLang], false);
          isServerAvailable = true;
          
          aiInput.disabled = false;
          aiSendBtn.disabled = false;
          aiInput.placeholder = translations.ai_input_placeholder[currentLang];
          aiInput.focus();
        } else {
          throw new Error(`HTTP ${testResponse.status}`);
        }
        
      } catch (error) {
        console.error('Error en inicialización:', error);
        aiMessages.innerHTML = '';
        const errorMsg = currentLang === 'en'
          ? '⚠️ Could not connect to AI server. Please check your connection or try again later.'
          : '⚠️ No se pudo conectar con el servidor de IA. Por favor, verifica tu conexión o intenta más tarde.';
        addAIMessage(errorMsg, false);
        isServerAvailable = false;
        
        aiInput.disabled = true;
        aiSendBtn.disabled = true;
        aiInput.placeholder = currentLang === 'en' ? 'Server unavailable' : 'Servidor no disponible';
      }
    }

    function addAIMessage(content, isUser = false) {
      const messageDiv = document.createElement('div');
      messageDiv.className = `ai-message ${isUser ? 'user' : 'ai'}`;
      
      const avatarDiv = document.createElement('div');
      avatarDiv.className = 'ai-message-avatar';
      avatarDiv.textContent = isUser ? (currentLang === 'en' ? 'You' : 'Tú') : 'IA';
      
      const contentDiv = document.createElement('div');
      contentDiv.className = 'ai-message-content';
      contentDiv.innerHTML = content.replace(/\n/g, '<br>');
      
      messageDiv.appendChild(avatarDiv);
      messageDiv.appendChild(contentDiv);
      aiMessages.appendChild(messageDiv);
      
      aiMessages.scrollTop = aiMessages.scrollHeight;
      
      return contentDiv;
    }

    function showAITyping() {
      const messageDiv = document.createElement('div');
      messageDiv.className = 'ai-message ai';
      messageDiv.id = 'ai-typing-indicator';
      
      const avatarDiv = document.createElement('div');
      avatarDiv.className = 'ai-message-avatar';
      avatarDiv.textContent = 'IA';
      
      const contentDiv = document.createElement('div');
      contentDiv.className = 'ai-message-content';
      
      const typingDiv = document.createElement('div');
      typingDiv.className = 'ai-typing';
      typingDiv.innerHTML = `
        <div class="ai-typing-dot"></div>
        <div class="ai-typing-dot"></div>
        <div class="ai-typing-dot"></div>
      `;
      
      contentDiv.appendChild(typingDiv);
      messageDiv.appendChild(avatarDiv);
      messageDiv.appendChild(contentDiv);
      aiMessages.appendChild(messageDiv);
      
      aiMessages.scrollTop = aiMessages.scrollHeight;
      
      return messageDiv;
    }

    aiInput.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = (this.scrollHeight) + 'px';
    });

    aiInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!isGenerating) sendAIMessage();
      }
    });

    aiSendBtn.addEventListener('click', sendAIMessage);

    async function sendAIMessage() {
      const text = aiInput.value.trim();
      if (!text || isGenerating) return;
      
      aiInput.value = '';
      aiInput.style.height = 'auto';
      
      addAIMessage(text, true);
      
      aiInput.disabled = true;
      aiSendBtn.disabled = true;
      isGenerating = true;
      
      const typingIndicator = showAITyping();
      
      try {
        const response = await fetch(`${OLLAMA_SERVER_URL}/chat`, {
          method: 'POST',
          headers: getNgrokHeaders(),
          body: JSON.stringify({ 
            message: text,
            session_id: currentSessionId,
            assistant: "rickgpt",
            lang: currentLang
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        typingIndicator.remove();
        
        if (data.status === 'success' && data.response) {
          addAIMessage(data.response);
          isServerAvailable = true;
        } else {
          throw new Error('Respuesta inválida del servidor');
        }
        
      } catch (error) {
        typingIndicator.remove();
        
        let errorMessage = currentLang === 'en'
          ? '❌ Error connecting to AI. Please try again later.'
          : '❌ Error al conectar con la IA. Por favor, intenta nuevamente más tarde.';
        
        addAIMessage(errorMessage);
        console.error('Error detallado:', error);
        isServerAvailable = false;
      } finally {
        aiInput.disabled = false;
        aiSendBtn.disabled = false;
        isGenerating = false;
        aiInput.focus();
      }
    }

    // ========================================
    // INICIALIZACIÓN FINAL
    // ========================================
    
    document.addEventListener('DOMContentLoaded', function() {
      matrixCanvas.width = window.innerWidth;
      matrixCanvas.height = window.innerHeight;
      
      console.log("✅ ProtonLab cargado correctamente");
      console.log("🌐 URL del backend configurada:", OLLAMA_SERVER_URL);

      const floatBtns = document.querySelectorAll('.float-btn');
      floatBtns.forEach(btn => btn.classList.add('init-hidden'));

      setTimeout(() => {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const targetScale = 6;

        floatBtns.forEach((btn, index) => {
          setTimeout(() => {
            const rect = btn.getBoundingClientRect();
            const btnCenterX = rect.left + rect.width / 2;
            const btnCenterY = rect.top + rect.height / 2;

            const moveX = centerX - btnCenterX;
            const moveY = centerY - btnCenterY;

            btn.style.setProperty('--tx', `${moveX}px`);
            btn.style.setProperty('--ty', `${moveY}px`);
            btn.style.setProperty('--s', targetScale);

            btn.classList.add('intro-pop');
            
            void btn.offsetWidth;

            btn.classList.remove('init-hidden');

            setTimeout(() => {
              btn.classList.remove('intro-pop');
            }, 500);

          }, index * 300);
        });
      }, 1000);

      // === LLAMAR AL CONTADOR AL CARGAR LA PÁGINA (una sola vez) ===
      updateGlobalVisitCounter();
    });

    window.addEventListener('wheel', function(e) {
      handleTearEffect();
    }, { passive: true });

    window.addEventListener('touchmove', function() {
      handleTearEffect();
    }, { passive: true });

    window.addEventListener('resize', function() {
      if (matrixOverlay.classList.contains('active')) {
        initMatrixEffect();
      }
    });