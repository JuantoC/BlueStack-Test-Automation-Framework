import { NoteData } from "./noteDataInterface.js";
import { AuthorType } from "../pages/post/note_editor/NoteAuthorSection.js";

export const noteData: NoteData[] = [
    {
        title: "La sequía extrema redefine el panorama agrícola regional | Creado por BlueStack_Test_Automation Framework",
        subTitle: "Productores uruguayos ajustan estrategias ante un déficit hídrico histórico",
        halfTitle: "Impacto en la campaña 2025",
        body: "La persistente falta de lluvias ha generado un escenario crítico para los productores agrícolas del país. Técnicos del sector advierten que los niveles de humedad en el suelo se encuentran entre los más bajos de los últimos diez años, lo que obliga a replantear estrategias y anticipar pérdidas. Las gremiales trabajan con el Ministerio de Ganadería para coordinar medidas de apoyo mientras se monitorea la evolución climática.",
        tags: ["agricultura", "clima", "economía"],
    },
    {
        title: "Innovación en salud: nuevos dispositivos portátiles permiten monitoreo continuo | Creado por BlueStack_Test_Automation Framework",
        subTitle: "Expertos destacan la utilidad de la tecnología en prevención y diagnóstico temprano",
        body: "El avance de los dispositivos médicos portátiles está transformando la forma en que los pacientes y profesionales de la salud acceden a la información. Con sensores cada vez más precisos, estos equipos permiten un monitoreo constante de la actividad cardíaca, patrones de sueño y niveles de oxigenación. Las empresas del sector anticipan un crecimiento sostenido durante los próximos años.",
        tags: ["salud", "tecnología", "innovación"],
        authorName: "Lucía Ortega",
        authorDescription: "Periodista enfocada en innovación científica y tecnológica."
    },
    {
        title: "Explorando las Maravillas de la Naturaleza: Una Aventura Inolvidable",
        body: `La naturaleza nos ofrece un espectáculo sin igual, lleno de paisajes impresionantes, flora y fauna diversa, y experiencias que nos conectan con el mundo que nos rodea. En esta aventura, exploraremos algunos de los destinos más fascinantes donde la naturaleza despliega toda su grandeza. Desde las majestuosas montañas hasta las serenas playas, cada lugar tiene su propia historia que contar. Acompáñanos en este viaje para descubrir los secretos mejor guardados de la naturaleza y cómo podemos preservarlos para las futuras generaciones.`,
        summary: "Una exploración detallada de los destinos naturales más impresionantes del mundo y la importancia de su conservación.",
        authorName: "Juan Torres",
        authorDescription: "Apasionado por la naturaleza y la aventura, Juan ha recorrido el mundo documentando sus experiencias al aire libre."
    },
    {
        title: "La Revolución de la Tecnología Verde: Innovaciones para un Futuro Sostenible",
        body: `En los últimos años, la tecnología verde ha emergido como una fuerza transformadora en la lucha contra el cambio climático y la promoción de la sostenibilidad. Desde energías renovables hasta soluciones de eficiencia energética, estas innovaciones están cambiando la forma en que interactuamos con nuestro entorno. Este artículo explora las últimas tendencias en tecnología verde, destacando proyectos innovadores y su impacto positivo en el medio ambiente. Además, discutiremos cómo las empresas y los individuos pueden adoptar estas tecnologías para contribuir a un futuro más sostenible.`,
        summary: "Un análisis de las innovaciones en tecnología verde y su papel crucial en la construcción de un futuro sostenible.",
        authorName: "María López",
        authorDescription: "Ingeniera ambiental y defensora de la sostenibilidad, María se dedica a promover soluciones tecnológicas que beneficien al planeta."
    }
]

export const notesData: NoteData[] = [
    {
        title: "Impacto económico del sector tecnológico",
        secondaryTitle: "Tendencias actuales",
        subTitle: "Cómo evolucionan las startups",
        halfTitle: "Informe 2025",
        body: "El sector tecnológico continúa expandiéndose con ritmos acelerados...",
        summary: "Resumen del análisis económico del sector tech en 2025.",
        tags: ["economía", "tecnología", "startups"],
        hiddenTags: ["internal-report", "confidential"],
        authorName: "Departamento de Investigación",
        authorDescription: "Equipo interno especializado en análisis macroeconómico.",
        authorType: AuthorType.MANUAL
    },
    {
        title: "Experiencia en eventos masivos",
        secondaryTitle: "Seguridad y logística",
        body: "Asistí a un festival con más de 50.000 personas y noté varios puntos críticos...",
        summary: "Relato anónimo sobre organización en eventos multitudinarios.",
        tags: ["eventos", "seguridad"],
        hiddenTags: ["anonymous"],
        authorName: "Anónimo",
        authorDescription: "El autor decidió no revelar su identidad.",
        authorType: AuthorType.ANONYMOUS
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

export const listicleData: NoteData[] = [
    {
        "title": "Guía Maestra para el Trabajo Remoto | Creado por BlueStack_Test_Automation Framework",
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
        title: "La Frontera del Mañana | Creado por BlueStack_Test_Automation Framework",
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
    }
];