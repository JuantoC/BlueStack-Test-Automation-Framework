import { NoteData } from "./noteDataInterface.js";
import { AuthorType } from "../pages/post_page/note_editor_page/EditorAuthorSection.js";

export const PostData: NoteData[] = [
  {
    title: "Gran avance en la computación cuántica",
    subTitle: "Científicos logran estabilidad en cúbits a temperatura ambiente",
    halfTitle: "Tecnología del Futuro",
    body: "Un equipo internacional de investigadores ha marcado un hito histórico al mantener la coherencia cuántica durante más de 10 minutos sin necesidad de refrigeración extrema...",
    tags: ["Tecnología", "Ciencia", "Computación"],
    hiddenTags: ["Quantum", "BreakingNews", "Tech2026"],
    authorName: "Dra. Elena Galán",
    authorDescription: "Especialista en física de partículas y divulgadora tecnológica.",
    authorType: AuthorType.MANUAL
  },
  {
    title: "La selección nacional clasifica al mundial",
    subTitle: "Victoria agónica en el último minuto frente al clásico rival",
    halfTitle: "Deportes",
    body: "Con un gol de media distancia en el minuto 94, el conjunto dirigido por Scaloni selló su pase directo a la próxima cita mundialista en un estadio colmado...",
    tags: ["Fútbol", "Selección", "Eliminatorias"],
    hiddenTags: ["Mundial", "DeportesVivos", "AFA"],
    authorName: "Juan Pablo Relator",
    authorDescription: "Cronista deportivo con 20 años cubriendo la actualidad del fútbol.",
    authorType: AuthorType.MANUAL
  },
  {
    title: "5 Destinos exóticos para visitar en 2026",
    subTitle: "Desde las costas de Albania hasta las montañas de Bután",
    halfTitle: "Tendencias de Viaje",
    body: "El turismo post-pandemia ha mutado hacia la búsqueda de experiencias auténticas y desconexión total. Aquí te presentamos los lugares que serán tendencia...",
    tags: ["Viajes", "Turismo", "Aventura"],
    hiddenTags: ["Travel2026", "Destinos", "Verano"],
    authorName: "Martina Viajera",
    authorDescription: "Editora de contenidos de estilo de vida y trotamundos profesional.",
    authorType: AuthorType.MANUAL
  },
  {
    title: "Nueva política económica: ¿Qué significa para tu bolsillo?",
    subTitle: "Análisis detallado de los cambios en el impuesto a las ganancias",
    halfTitle: "Economía Hoy",
    body: "El Ministerio de Economía anunció una serie de medidas que buscan incentivar el consumo interno a través de una reducción impositiva para la clase media...",
    tags: ["Economía", "Finanzas", "Impuestos"],
    hiddenTags: ["Bolsillo", "Mercados", "EconoCheck"],
    authorName: "Lic. Carlos Inversión",
    authorDescription: "Analista financiero y consultor de mercados emergentes.",
    authorType: AuthorType.MANUAL
  },
  {
    title: "Reseña: El último gran estreno de ciencia ficción",
    subTitle: "Una obra maestra visual que redefine el género en el cine",
    halfTitle: "Cine y Series",
    body: "La nueva película de Christopher Nolan no solo desafía las leyes de la física, sino también la paciencia del espectador con una narrativa no lineal fascinante...",
    tags: ["Cine", "Estrenos", "Sci-Fi"],
    hiddenTags: ["Nolan", "Hollywood", "Crítica"],
    authorName: "Sofía Butaca",
    authorDescription: "Crítica de cine y conductora de podcasts sobre cultura pop.",
    authorType: AuthorType.MANUAL
  },
  {
    title: "Receta: El secreto del mejor asado argentino",
    subTitle: "Técnicas ancestrales para dominar el fuego y la carne",
    halfTitle: "Gastronomía",
    body: "No se trata solo de la calidad del corte, sino del tiempo, la leña y la paciencia. En esta guía te enseñamos paso a paso cómo lograr el punto perfecto...",
    tags: ["Cocina", "Asado", "Tradición"],
    hiddenTags: ["Foodie", "Parrilla", "Gourmet"],
    authorName: "Maestro Parrillero",
    authorDescription: "Chef especializado en cocina a fuegos abiertos.",
    authorType: AuthorType.MANUAL
  }
];

export const ListicleData: NoteData[] = [
  {
    title: "22 hábitos para maximizar tu productividad diaria",
    subTitle: "Estrategias prácticas para mejorar tu rendimiento personal y profesional",
    body: "La productividad no depende únicamente de trabajar más, sino de trabajar mejor. Adoptar hábitos efectivos puede marcar una gran diferencia en tu desempeño diario.\n\nEsta lista reúne prácticas comprobadas que ayudan a optimizar el tiempo y la concentración.",
    tags: ["productividad", "hábitos", "rendimiento"],
    hiddenTags: ["self-improvement", "productivity-hacks"],
    authorName: "Martín Rodríguez",
    authorDescription: "Consultor en desarrollo profesional y optimización de procesos.",
    listicleItems: [
      { title: "Definir objetivos claros", body: "Tener metas específicas mejora el enfoque diario." },
      { title: "Planificar el día", body: "Organizar tareas con anticipación evita pérdidas de tiempo." },
      { title: "Priorizar tareas importantes", body: "Enfocarse en lo que genera mayor impacto." },
      { title: "Evitar multitarea", body: "Trabajar en una sola tarea mejora la calidad." },
      { title: "Usar bloques de tiempo", body: "Asignar períodos específicos para cada actividad." },
      { title: "Tomar descansos", body: "Pausas regulares aumentan la concentración." },
      { title: "Eliminar distracciones", body: "Reducir interrupciones mejora el rendimiento." },
      { title: "Delegar cuando sea posible", body: "Optimizar recursos distribuyendo tareas." },
      { title: "Automatizar tareas repetitivas", body: "Ahorrar tiempo en procesos rutinarios." },
      { title: "Mantener un entorno ordenado", body: "Un espacio limpio favorece la claridad mental." },
      { title: "Establecer límites de tiempo", body: "Evitar que las tareas se extiendan innecesariamente." },
      { title: "Revisar avances diarios", body: "Evaluar progreso permite ajustar estrategias." },
      { title: "Dormir bien", body: "El descanso adecuado mejora la productividad." },
      { title: "Hacer ejercicio", body: "La actividad física aumenta energía y enfoque." },
      { title: "Evitar reuniones innecesarias", body: "Optimizar el uso del tiempo laboral." },
      { title: "Aprender a decir no", body: "Evitar sobrecarga de tareas." },
      { title: "Usar herramientas digitales", body: "Aprovechar apps para organizar trabajo." },
      { title: "Reducir consumo de redes sociales", body: "Minimizar distracciones digitales." },
      { title: "Establecer rutinas", body: "Crear hábitos consistentes mejora el rendimiento." },
      { title: "Dividir tareas grandes", body: "Hacerlas más manejables y ejecutables." },
      { title: "Celebrar logros", body: "Reconocer avances motiva a continuar." },
      { title: "Aprender continuamente", body: "Mejorar habilidades incrementa eficiencia." }
    ]
  }
];

export const LiveBlogData: NoteData[] = [
  {
    title: "Cobertura en vivo: Cumbre global de tecnología 2026",
    subTitle: "Anuncios, lanzamientos y reacciones en tiempo real desde el evento",
    halfTitle: "Cumbre tech en vivo",
    tags: ["tecnología", "evento", "liveblog"],
    hiddenTags: ["live-tech", "coverage"],
    authorName: "Lucía Fernández",
    authorDescription: "Periodista especializada en tecnología cubriendo eventos en vivo.",
    listicleItems: [
      { title: "09:00 - Inicio del evento", body: "Arranca la transmisión en vivo con una presentación introductoria sobre el estado actual de la tecnología." },
      { title: "09:15 - Keynote principal", body: "El CEO abre el evento destacando avances en inteligencia artificial." },
      { title: "09:30 - Anuncio de nueva IA", body: "Se presenta un modelo de IA con capacidades autónomas mejoradas." },
      { title: "09:45 - Reacción del público", body: "El auditorio responde con entusiasmo al anuncio principal." },
      { title: "10:00 - Panel de expertos", body: "Especialistas debaten sobre el futuro del trabajo." },
      { title: "10:20 - Demo en vivo", body: "Se muestra una herramienta que automatiza procesos complejos." },
      { title: "10:40 - Actualización", body: "Se confirma integración con múltiples plataformas." },
      { title: "11:00 - Networking", body: "Participantes comparten impresiones iniciales." },
      { title: "11:20 - Startup destacada", body: "Una nueva empresa presenta innovación en robótica." },
      { title: "11:40 - Entrevista en vivo", body: "Ejecutivo comenta impacto de las nuevas tecnologías." },
      { title: "12:00 - Pausa", body: "Break del evento con cobertura de ambiente." },
      { title: "12:30 - Reanudación", body: "Se retoman actividades con foco en ciberseguridad." },
      { title: "13:00 - Lanzamiento producto", body: "Nueva plataforma cloud es presentada oficialmente." },
      { title: "13:30 - Reacciones en redes", body: "Usuarios comentan en tiempo real los anuncios." },
      { title: "14:00 - Panel de innovación", body: "Debate sobre startups emergentes." },
      { title: "14:30 - Caso de éxito", body: "Empresa comparte resultados con IA aplicada." },
      { title: "15:00 - Demo técnica", body: "Ingenieros muestran capacidades avanzadas." },
      { title: "15:30 - Actualización en vivo", body: "Se anuncian nuevas alianzas estratégicas." },
      { title: "16:00 - Cierre del evento", body: "Resumen de los principales anuncios." },
      { title: "16:30 - Conclusiones", body: "Expertos analizan impacto global." },
      { title: "17:00 - Post-evento", body: "Se comparten impresiones finales y próximos pasos." }
    ],
    eventLiveBlog: {
      eventTitle: "Cumbre global de tecnología 2026",
    }
  },
  {
    title: "Minuto a minuto: Final del torneo internacional de fútbol",
    subTitle: "Seguimiento en vivo del partido decisivo con jugadas y reacciones",
    halfTitle: "Final en vivo",
    tags: ["deportes", "fútbol", "liveblog"],
    hiddenTags: ["live-match", "sports"],
    authorName: "Martín Rodríguez",
    authorDescription: "Periodista deportivo cubriendo eventos en tiempo real.",
    listicleItems: [
      { title: "18:00 - Inicio del partido", body: "Comienza la final con ambos equipos mostrando intensidad." },
      { title: "18:05 - Primer ataque", body: "El equipo local genera la primera llegada de peligro." },
      { title: "18:10 - Falta cerca del área", body: "Oportunidad de tiro libre para el visitante." },
      { title: "18:15 - Gol anulado", body: "El VAR invalida un gol por fuera de juego." },
      { title: "18:20 - Tarjeta amarilla", body: "Primera amonestación del partido." },
      { title: "18:25 - Atajada clave", body: "El arquero evita el primer gol con gran reacción." },
      { title: "18:30 - Gol del local", body: "Se abre el marcador con un remate desde el área." },
      { title: "18:35 - Reacción visitante", body: "El equipo rival adelanta líneas en busca del empate." },
      { title: "18:40 - Remate al palo", body: "El visitante casi iguala el partido." },
      { title: "18:45 - Final del primer tiempo", body: "El local se va al descanso en ventaja." },
      { title: "19:00 - Inicio segundo tiempo", body: "Se reanuda el partido con cambios tácticos." },
      { title: "19:05 - Gol del empate", body: "El visitante iguala tras jugada colectiva." },
      { title: "19:10 - Partido intenso", body: "Ambos equipos buscan la victoria." },
      { title: "19:20 - Nueva amarilla", body: "Fuerte entrada sancionada por el árbitro." },
      { title: "19:30 - Cambios", body: "Ambos entrenadores realizan modificaciones." },
      { title: "19:40 - Oportunidad clara", body: "El local falla una ocasión frente al arco." },
      { title: "19:50 - Gol decisivo", body: "El visitante marca el segundo gol." },
      { title: "19:55 - Tiempo agregado", body: "Se adicionan minutos finales." },
      { title: "20:00 - Final del partido", body: "El visitante se consagra campeón." },
      { title: "20:10 - Celebración", body: "Jugadores festejan el título." },
      { title: "20:20 - Declaraciones", body: "Entrenadores analizan el resultado." }
    ]
  }
];
