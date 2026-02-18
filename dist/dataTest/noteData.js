import { AuthorType } from "../pages/post/note_editor/NoteAuthorSection.js";
export const notesData = [
    {
        title: "Impacto económico del sector tecnológico",
        subTitle: "Cómo evolucionan las startups",
        halfTitle: "Informe 2025",
        body: "El sector tecnológico continúa expandiéndose con ritmos acelerados...",
        tags: ["economía", "tecnología", "startups"],
        hiddenTags: ["internal-report", "confidential"],
        authorName: "Departamento de Investigación",
        authorDescription: "Equipo interno especializado en análisis macroeconómico.",
        authorType: AuthorType.MANUAL
    },
    {
        title: "Experiencia en eventos masivos",
        body: `
Asistí a un festival con más de 50.000 personas y noté varios puntos críticos que vale la pena analizar desde una mirada organizativa y operativa.

Desde el ingreso, la logística mostró fortalezas y debilidades. Los accesos estaban correctamente señalizados, pero los tiempos de espera superaron lo previsto en horarios pico. La validación de entradas funcionó de manera ágil cuando el sistema respondía con normalidad, aunque ante pequeños retrasos en la conectividad se generaban cuellos de botella que impactaban directamente en la experiencia del público.

En materia de seguridad, la distribución del personal fue visible y estratégica en zonas de alta circulación, como accesos, escenarios principales y áreas gastronómicas. Sin embargo, en sectores intermedios la supervisión era menor, lo que dificultaba la rápida resolución de incidentes menores.

La infraestructura general estuvo bien dimensionada para el volumen de asistentes: sanitarios suficientes, múltiples puntos de hidratación y una oferta gastronómica variada. Aun así, en momentos de alta demanda se evidenció la necesidad de reforzar la reposición y limpieza continua para sostener estándares adecuados.

Otro punto relevante fue la gestión de la información en tiempo real. Las pantallas y anuncios oficiales ayudaban a ordenar los flujos de personas, aunque hubiera sido útil contar con notificaciones más dinámicas a través de una aplicación oficial o canales digitales para anticipar cambios de horario o ajustes en la programación.

En términos generales, la experiencia fue positiva, pero este tipo de eventos masivos exige planificación minuciosa, monitoreo constante y capacidad de reacción inmediata. Los pequeños detalles operativos, cuando se multiplican por decenas de miles de personas, pueden convertirse rápidamente en factores críticos.
  `,
        tags: ["eventos", "seguridad"],
        hiddenTags: ["anonymous"],
        authorName: "Anónimo",
        authorDescription: "El autor decidió no revelar su identidad.",
        authorType: AuthorType.MANUAL
    },
    {
        title: "Guía rápida de mantenimiento",
        secondaryTitle: "Equipo de impresión industrial",
        subTitle: "Modelo XT-900",
        body: "Para comenzar con el mantenimiento básico es necesario...",
        summary: "Pasos esenciales para mantenimiento preventivo.",
        tags: ["mantenimiento", "industria"],
        hiddenTags: [],
        authorName: "Carlos Pérez",
        authorDescription: "Técnico especializado en maquinaria industrial.",
        authorType: AuthorType.MANUAL
    },
    {
        title: "Arquitectura distribuida en sistemas de noticias en tiempo real",
        subTitle: "Diseño aplicado en grandes redacciones digitales",
        halfTitle: "Versión técnica 2025",
        body: `Los sistemas modernos de publicación de noticias requieren infraestructura capaz de soportar miles de operaciones concurrentes por minuto sin comprometer la latencia de lectura ni los tiempos de indexación. Este informe detalla la arquitectura distribuida utilizada para garantizar: - Replicación eventual con consistencia fuerte en segmentos críticos. - Persistencia optimizada para contenido temporal (drafts) y contenido permanente. - Colas de procesamiento para normalización, etiquetado automático y validación semántica. - Servicios de locking granular por nota para evitar “writing collisions” entre editores. Además, se documenta la estrategia de tolerancia a fallos aplicada mediante split-brain handling en escenarios de partición de red, así como las mejoras introducidas para acelerar el cierre editorial automatizado.`,
        tags: ["arquitectura", "distributed-systems", "newsroom-tech", "scalability"],
        hiddenTags: ["internal-design", "infra-deepdive"],
        authorName: "Equipo de Plataforma Editorial",
        authorDescription: "Área interna r esponsable del diseño e implementación de sistemas críticos de publicación.",
        authorType: AuthorType.MANUAL
    },
];
export const listicleData = [
    {
        "title": "Guía Maestra para el Trabajo Remoto",
        "subTitle": "Cómo mantener el enfoque y la productividad desde casa",
        "body": "El trabajo remoto ofrece flexibilidad, pero también presenta desafíos únicos de organización. Esta guía explora puntos clave para optimizar tu jornada laboral.",
        authorName: "Dra. Elena Quantum",
        authorDescription: "Investigadora principal en sistemas emergentes y divulgadora científica.",
        authorType: AuthorType.MANUAL,
        "listicleItems": [
            {
                "title": "Diseña un espacio dedicado",
                "body": "Tener un lugar físico separado para trabajar ayuda a tu cerebro a entrar en modo laboral y facilita la desconexión al terminar."
            },
            {
                "title": "Establece bloques de tiempo",
                "body": "Utiliza técnicas como Pomodoro para alternar periodos de alta concentración con breves descansos necesarios."
            },
            {
                "title": "Comunicación asíncrona",
                "body": "Prioriza mensajes claros y documentados para reducir la necesidad de reuniones constantes que interrumpen el flujo de trabajo."
            }
        ]
    },
    {
        "title": "Maximizando tu Potencial Diario",
        "subTitle": "Guía completa con 22 estrategias probadas para optimizar tu tiempo y energía.",
        "body": "La productividad no se trata de hacer más cosas, sino de hacer las cosas correctas de manera eficiente. Esta lista detalla hábitos prácticos que puedes implementar hoy mismo para transformar tu flujo de trabajo.",
        "listicleItems": [
            {
                "title": "La Regla de los 2 Minutos",
                "body": "Si una tarea toma menos de dos minutos, hazla de inmediato en lugar de posponerla."
            },
            {
                "title": "Técnica Pomodoro",
                "body": "Trabaja en bloques de 25 minutos seguidos de 5 minutos de descanso para mantener la agudeza mental."
            },
            {
                "title": "Priorización Eat the Frog",
                "body": "Realiza la tarea más difícil o importante a primera hora de la mañana."
            },
            {
                "title": "Bloqueo de Tiempo (Time Blocking)",
                "body": "Asigna espacios específicos en tu calendario para tareas particulares."
            },
            {
                "title": "Eliminación de Notificaciones",
                "body": "Desactiva las alertas no esenciales en tu móvil y ordenador para evitar distracciones."
            },
            {
                "title": "Revisión Semanal",
                "body": "Dedica un tiempo cada domingo para planificar los objetivos de la semana entrante."
            },
            {
                "title": "Delegación Efectiva",
                "body": "Identifica tareas que otros pueden hacer mejor o más rápido y delégalas."
            },
            {
                "title": "Espacio de Trabajo Limpio",
                "body": "Mantén tu escritorio ordenado para reducir la carga cognitiva y el estrés visual."
            },
            {
                "title": "Establecimiento de Límites",
                "body": "Aprende a decir 'no' a compromisos que no alinean con tus metas principales."
            },
            {
                "title": "Uso de Listas de Tareas",
                "body": "Escribe todo lo que necesitas hacer para liberar espacio mental."
            },
            {
                "title": "Descansos Activos",
                "body": "Levántate y camina unos minutos cada hora para mejorar la circulación y el enfoque."
            },
            {
                "title": "Sueño Reparador",
                "body": "Duerme entre 7 y 8 horas para que tu cerebro pueda procesar la información correctamente."
            },
            {
                "title": "Meditación y Mindfulness",
                "body": "Practica la atención plena para reducir el estrés y mejorar la concentración."
            },
            {
                "title": "Automatización de Procesos",
                "body": "Usa herramientas digitales para automatizar tareas repetitivas como correos o facturas."
            },
            {
                "title": "Agrupación de Tareas (Batching)",
                "body": "Realiza tareas similares al mismo tiempo, como responder todos los emails de una vez."
            },
            {
                "title": "Hidratación Constante",
                "body": "Beber agua regularmente mantiene tus niveles de energía y claridad mental."
            },
            {
                "title": "Matriz de Eisenhower",
                "body": "Clasifica tus tareas por urgencia e importancia para decidir qué atender primero."
            },
            {
                "title": "Lectura Diaria",
                "body": "Dedica 15 minutos al día a leer algo que aporte valor a tu carrera o vida personal."
            },
            {
                "title": "Diario de Logros",
                "body": "Anota tres cosas que lograste al final del día para mantener la motivación alta."
            },
            {
                "title": "Preparación la Noche Anterior",
                "body": "Prepara tu ropa y tu agenda la noche antes para reducir la fatiga de decisión por la mañana."
            },
            {
                "title": "Aprendizaje Continuo",
                "body": "Dedica tiempo a aprender nuevas habilidades que simplifiquen tu trabajo."
            },
            {
                "title": "Desconexión Digital",
                "body": "Establece una hora límite para dejar de usar pantallas antes de dormir."
            }
        ]
    },
    {
        title: "La Frontera del Mañana",
        subTitle: "Innovaciones que están transformando nuestra realidad cotidiana",
        body: "Desde la integración profunda de la IA hasta la computación cuántica accesible, este año marca un punto de inflexión en la evolución digital de la humanidad.",
        tags: ["Tecnología", "Innovación", "IA", "Futuro"],
        hiddenTags: ["tech_trends_2026", "future_is_now", "quantum_computing"],
        authorName: "Dra. Elena Quantum",
        authorDescription: "Investigadora principal en sistemas emergentes y divulgadora científica.",
        authorType: AuthorType.MANUAL,
        listicleItems: [
            {
                title: "IA Generativa de Video en Tiempo Real",
                body: "Capacidad de generar entornos visuales dinámicos mientras el usuario interactúa con ellos."
            },
            {
                title: "Baterías de Estado Sólido",
                body: "Mayor autonomía y carga ultra rápida para vehículos eléctricos comerciales."
            },
            {
                title: "Interfaces Cerebro-Computadora",
                body: "Avances significativos en dispositivos no invasivos para controlar interfaces con el pensamiento."
            },
            {
                title: "Medicina Personalizada por ADN",
                body: "Tratamientos diseñados específicamente según el código genético individual en tiempo récord."
            },
            {
                title: "Redes 6G Experimentales",
                body: "Primeras pruebas de conectividad con latencia casi nula en centros urbanos seleccionados."
            },
            {
                title: "Gemelos Digitales Urbanos",
                body: "Simulaciones exactas de ciudades para optimizar el tráfico y el consumo energético."
            },
            {
                title: "Agricultura Vertical Automatizada",
                body: "Producción masiva de alimentos en entornos urbanos controlados por robots."
            },
            {
                title: "Computación Cuántica en la Nube",
                body: "Acceso democratizado para empresas a procesadores cuánticos para cálculos complejos."
            },
            {
                title: "Robótica de Asistencia Doméstica",
                body: "Humanoides capaces de realizar tareas del hogar con destreza motriz fina."
            },
            {
                title: "Gafas de Realidad Aumentada Estilizadas",
                body: "Dispositivos que lucen como gafas normales pero proyectan información persistente."
            },
            {
                title: "Sistemas de Captura de Carbono",
                body: "Nuevas plantas de filtrado de aire con eficiencia mejorada para combatir el cambio climático."
            },
            {
                title: "Entrega por Drones Autónomos",
                body: "Logística de última milla completamente automatizada en zonas residenciales."
            },
            {
                title: "Ciberseguridad Cuántica",
                body: "Protocolos de encriptación diseñados para resistir ataques de ordenadores cuánticos."
            },
            {
                title: "Telas Inteligentes",
                body: "Ropa que monitorea signos vitales y ajusta su temperatura térmicamente."
            },
            {
                title: "Edición Genética CRISPR in-vivo",
                body: "Terapias directas para corregir mutaciones genéticas dentro del cuerpo humano."
            },
            {
                title: "Internet de las Cosas Aeroespacial",
                body: "Constelaciones de satélites que conectan dispositivos en los puntos más remotos."
            },
            {
                title: "IA Ética y Explicable",
                body: "Algoritmos que pueden detallar el 'por qué' de sus decisiones para evitar sesgos."
            },
            {
                title: "Micro-LEDs en Pantallas",
                body: "Nueva tecnología de visualización con brillo extremo y consumo mínimo de energía."
            },
            {
                title: "Bioplásticos de Tercera Generación",
                body: "Materiales biodegradables fabricados a partir de algas y residuos orgánicos."
            },
            {
                title: "Traducción de Voz Instantánea",
                body: "Auriculares que traducen idiomas en milisegundos sin necesidad de internet."
            },
            {
                title: "Almacenamiento de Datos en ADN",
                body: "Prototipos de archivo de información masiva con durabilidad de miles de años."
            },
            {
                title: "Metaverso de Trabajo Colaborativo",
                body: "Espacios de oficina virtuales que reemplazan por completo a las videollamadas tradicionales."
            }
        ]
    },
    {
        title: "El fin de las contraseñas: La biometría cuántica llega a los hogares",
        subTitle: "Cómo los nuevos sensores de pulso cardíaco están reemplazando al reconocimiento facial.",
        body: "Durante décadas, confiamos en lo que sabíamos (contraseñas) y luego en lo que éramos (huellas). Sin embargo, el robo de datos biométricos estáticos ha forzado a la industria a ``buscar soluciones dinámicas. La biometría de ritmo cardíaco utiliza sensores infrarrojos para mapear la firma eléctrica única de nuestro corazón, un dato que no se puede fotocopiar ni replicar con IA profunda. Esta tecnología ya no es exclusiva de búnkeres militares; este mes, los principales fabricantes de smartphones han anunciado su integración masiva.",
        tags: ["Tecnología", "Ciberseguridad", "Innovación", "Biometría"],
        hiddenTags: ["futurismo-2026", "seguridad-bancaria", "hardware-scans"],
        authorType: AuthorType.MANUAL,
        authorName: "Alex Rivers",
        authorDescription: "Especialista en seguridad informática con 15 años de trayectoria en el análisis de vulnerabilidades de hardware.",
        listicleItems: [
            {
                title: "Inviolabilidad",
                body: "A diferencia de una foto, el ritmo cardíaco requiere que el usuario esté vivo y presente."
            },
            {
                title: "Pasividad",
                body: "No necesitas mirar a la cámara ni poner el dedo; el reloj detecta quién eres al ponértelo."
            },
            {
                title: "Compatibilidad",
                body: "Se integra con los protocolos bancarios actuales sin necesidad de nuevas apps."
            }
        ]
    },
    {
        title: "25 estrategias prácticas para mejorar la productividad en equipos tecnológicos",
        subTitle: "Una guía completa con acciones concretas para optimizar tiempos, procesos y resultados",
        body: `
La productividad en equipos tecnológicos no depende únicamente de trabajar más horas, sino de implementar procesos claros, herramientas adecuadas y hábitos sostenibles.

En esta lista recopilamos estrategias concretas que pueden aplicarse en equipos de desarrollo, QA, producto y tecnología en general, con foco en eficiencia, calidad y colaboración.
`,
        tags: [
            "Productividad",
            "Tecnología",
            "Equipos",
            "Desarrollo",
            "QA",
            "Gestión"
        ],
        hiddenTags: [
            "nota-lista-productividad",
            "guia-equipos-tech",
            "contenido-evergreen-2026"
        ],
        authorName: "Equipo Editorial Tech",
        authorDescription: "Especialistas en gestión de equipos tecnológicos, metodologías ágiles y optimización de procesos digitales.",
        listicleItems: [
            {
                title: "1. Definir objetivos trimestrales claros",
                body: "Establecer metas medibles y alineadas al negocio permite que todo el equipo entienda prioridades y enfoque sus esfuerzos correctamente."
            },
            {
                title: "2. Utilizar metodologías ágiles",
                body: "Frameworks como Scrum o Kanban ayudan a organizar el trabajo en ciclos cortos y mejorar la visibilidad del avance."
            },
            {
                title: "3. Limitar el trabajo en progreso (WIP)",
                body: "Reducir la cantidad de tareas simultáneas mejora la concentración y disminuye la tasa de errores."
            },
            {
                title: "4. Automatizar tareas repetitivas",
                body: "La automatización en testing, despliegues o integraciones continuas reduce tiempos y evita errores manuales."
            },
            {
                title: "5. Implementar revisiones de código",
                body: "El code review mejora la calidad técnica y fomenta el aprendizaje compartido dentro del equipo."
            },
            {
                title: "6. Mantener reuniones breves y estructuradas",
                body: "Las dailies o reuniones de seguimiento deben tener un objetivo claro y duración limitada para no afectar el flujo de trabajo."
            },
            {
                title: "7. Documentar decisiones técnicas",
                body: "Registrar decisiones clave evita retrabajos y facilita la incorporación de nuevos integrantes."
            },
            {
                title: "8. Priorizar tareas según impacto",
                body: "Trabajar primero en lo que genera mayor valor permite optimizar recursos y tiempo."
            },
            {
                title: "9. Fomentar la comunicación asincrónica",
                body: "Reducir interrupciones constantes mejora la concentración y permite responder en momentos adecuados."
            },
            {
                title: "10. Establecer estándares de calidad",
                body: "Definir criterios claros de aceptación y definición de terminado ayuda a evitar ambigüedades."
            },
            {
                title: "11. Implementar integración continua",
                body: "Integrar cambios frecuentemente reduce conflictos y facilita detectar errores tempranamente."
            },
            {
                title: "12. Medir métricas relevantes",
                body: "Indicadores como lead time, throughput o tasa de bugs permiten identificar oportunidades de mejora."
            },
            {
                title: "13. Promover la capacitación constante",
                body: "Invertir en formación técnica y habilidades blandas mejora el rendimiento general del equipo."
            },
            {
                title: "14. Reducir dependencias externas",
                body: "Minimizar bloqueos entre equipos acelera la entrega y mejora la autonomía."
            },
            {
                title: "15. Crear un backlog priorizado y ordenado",
                body: "Un backlog claro facilita la planificación y evita discusiones innecesarias durante los sprints."
            },
            {
                title: "16. Realizar retrospectivas periódicas",
                body: "Analizar qué funcionó y qué no permite ajustar procesos de manera continua."
            },
            {
                title: "17. Definir roles y responsabilidades claras",
                body: "Evitar superposición de funciones reduce conflictos y mejora la eficiencia operativa."
            },
            {
                title: "18. Establecer tiempos de foco sin interrupciones",
                body: "Bloques de trabajo profundo aumentan la productividad en tareas técnicas complejas."
            },
            {
                title: "19. Mejorar la experiencia del desarrollador",
                body: "Optimizar entornos, tiempos de build y herramientas impacta directamente en la velocidad de entrega."
            },
            {
                title: "20. Fomentar la cultura de feedback",
                body: "El feedback constructivo fortalece el crecimiento profesional y la calidad del trabajo."
            },
            {
                title: "21. Planificar releases realistas",
                body: "Evitar plazos poco alcanzables reduce estrés y mejora la calidad final del producto."
            },
            {
                title: "22. Celebrar logros del equipo",
                body: "Reconocer avances y resultados refuerza la motivación y el compromiso."
            },
            {
                title: "23. Revisar procesos periódicamente",
                body: "Los procesos deben evolucionar junto al equipo y al producto para mantener su efectividad."
            },
            {
                title: "24. Centralizar la gestión de tareas",
                body: "Utilizar una única herramienta de seguimiento evita desorden y pérdida de información."
            },
            {
                title: "25. Mantener foco en el usuario final",
                body: "Recordar el impacto real del producto ayuda a priorizar correctamente y tomar mejores decisiones."
            }
        ]
    }
];
export const liveblogData = [
    {
        title: "Minuto a minuto: Conferencia y presentación oficial del nuevo proyecto tecnológico en Montevideo",
        subTitle: "Seguimos en vivo cada anuncio, declaraciones y reacciones desde el auditorio principal",
        halfTitle: "EN VIVO: Presentación tecnológica en Montevideo",
        /* tags: [
            "En Vivo",
            "LiveBlog",
            "Tecnología",
            "Montevideo",
            "Conferencia",
            "Innovación"
        ],
        hiddenTags: [
            "live-blog-interno",
            "cobertura-tiempo-real",
            "evento-tecnologico-2026"
         */
        //],
        authorName: "Redacción Digital",
        authorDescription: "Equipo especializado en coberturas en vivo, eventos tecnológicos y entrevistas en tiempo real.",
        listicleItems: [
            {
                title: "09:00 - Comienza el ingreso del público al auditorio",
                body: "Se abren las puertas del auditorio principal. Los primeros asistentes comienzan a ocupar sus lugares mientras se proyecta un video institucional en pantalla gigante."
            },
            {
                title: "09:07 - Expectativa y sala casi completa",
                body: "El auditorio ya se encuentra al 80% de su capacidad. Se observa presencia de prensa, desarrolladores y representantes del sector empresarial."
            },
            {
                title: "09:12 - Inicia la transmisión oficial",
                body: "Las pantallas laterales muestran la placa de 'Transmisión en vivo'. El equipo técnico confirma que el streaming está activo."
            },
            {
                title: "09:15 - Apertura a cargo del moderador",
                body: "El moderador da la bienvenida y presenta la agenda del día. Adelanta que habrá una demostración técnica en tiempo real."
            },
        ]
    }
];
//# sourceMappingURL=noteData.js.map