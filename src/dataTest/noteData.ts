import { NoteData } from "./noteDataInterface.js";
import { AuthorType } from "../pages/post/note_editor/authorField.js";

export const noteData: NoteData[] = [
    {
        title: "La sequía extrema redefine el panorama agrícola regional",
        subTitle: "Productores uruguayos ajustan estrategias ante un déficit hídrico histórico",
        halfTitle: "Impacto en la campaña 2025",
        body: "La persistente falta de lluvias ha generado un escenario crítico para los productores agrícolas del país. Técnicos del sector advierten que los niveles de humedad en el suelo se encuentran entre los más bajos de los últimos diez años, lo que obliga a replantear estrategias y anticipar pérdidas. Las gremiales trabajan con el Ministerio de Ganadería para coordinar medidas de apoyo mientras se monitorea la evolución climática.",
        tags: ["agricultura", "clima", "economía"],
    },
    {
        title: "Crece el turismo interno impulsado por feriados y promociones",
        body: "Las agencias reportan un incremento notable de consultas y reservas para escapadas cortas dentro del país. Los operadores señalan que los paquetes con descuentos especiales y la mayor conectividad entre departamentos han favorecido el movimiento turístico. Las expectativas para la temporada de verano continúan en alza.",
        summary: "Las promociones y la conectividad impulsan el turismo interno con miras a una temporada récord.",
        authorName: "Julián Cabrera",
        authorDescription: "Redactor especializado en economía y tendencias sociales."
    },
    {
        title: "Innovación en salud: nuevos dispositivos portátiles permiten monitoreo continuo",
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