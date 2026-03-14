import { NoteData } from "../interfaces/data.js";
import { AuthorType } from "../pages/post_page/note_editor_page/EditorAuthorSection.js"

export const PostData: NoteData[] = [
  {
    title: "Optimización de performance en aplicaciones Angular",
    subTitle: "Buenas prácticas para mejorar tiempos de carga",
    halfTitle: "Performance Angular",
    body: "En este artículo exploramos distintas estrategias para optimizar el rendimiento en aplicaciones Angular, incluyendo lazy loading, change detection strategy y uso eficiente de observables.",
    tags: ["angular", "performance", "frontend"],
    hiddenTags: ["internal", "optimization"],
    authorName: "Juan Pérez",
    authorDescription: "Frontend Developer especializado en Angular",
    authorType: AuthorType.MANUAL
  },
  {
    title: "Testing end-to-end con Playwright",
    subTitle: "Automatización moderna para aplicaciones web",
    halfTitle: "E2E Testing",
    body: "Playwright se ha convertido en una herramienta clave para testing E2E. Permite automatizar escenarios complejos con múltiples navegadores y mejorar la calidad del software.",
    tags: ["testing", "playwright", "qa"],
    hiddenTags: ["automation", "e2e"],
    authorName: "María Gómez",
    authorDescription: "QA Engineer enfocada en automatización",
    authorType: AuthorType.MANUAL
  },
  {
    title: "Gestión de estado en frontend",
    subTitle: "Comparativa entre NgRx y señales",
    halfTitle: "State Management",
    body: "Analizamos diferentes enfoques para manejar estado en aplicaciones frontend, comparando NgRx con nuevas alternativas como signals en Angular.",
    tags: ["angular", "state", "ngrx"],
    hiddenTags: ["signals", "architecture"],
    authorName: "Carlos Rodríguez",
    authorDescription: "Arquitecto de software",
    authorType: AuthorType.MANUAL
  },
  {
    title: "Buenas prácticas en diseño de APIs",
    subTitle: "Cómo estructurar servicios escalables",
    halfTitle: "API Design",
    body: "Diseñar una API robusta implica seguir estándares como REST, manejo adecuado de errores y versionado. Esto facilita la integración y mantenimiento a largo plazo.",
    tags: ["api", "backend", "rest"],
    hiddenTags: ["design", "best-practices"],
    authorName: "Lucía Fernández",
    authorDescription: "Backend Developer con experiencia en microservicios",
    authorType: AuthorType.MANUAL
  },
  {
    title: "Introducción a Docker para desarrolladores",
    subTitle: "Contenerización de aplicaciones paso a paso",
    halfTitle: "Docker Basics",
    body: "Docker permite empaquetar aplicaciones junto con sus dependencias, facilitando la portabilidad y consistencia entre entornos de desarrollo y producción.",
    tags: ["docker", "devops", "containers"],
    hiddenTags: ["infrastructure", "deployment"],
    authorName: "Andrés Silva",
    authorDescription: "DevOps Engineer",
    authorType: AuthorType.MANUAL
  },
  {
    title: "Accesibilidad en aplicaciones web",
    subTitle: "Cómo construir interfaces inclusivas",
    halfTitle: "Web Accessibility",
    body: "La accesibilidad es clave para garantizar que todas las personas puedan utilizar una aplicación. Incluye buenas prácticas como uso de ARIA, contraste de colores y navegación por teclado.",
    tags: ["accessibility", "frontend", "ux"],
    hiddenTags: ["a11y", "inclusive-design"],
    authorName: "Sofía Martínez",
    authorDescription: "UX/UI Designer especializada en accesibilidad",
    authorType: AuthorType.MANUAL
  },
  {
    title: "El futuro de las IA Generativas en 2026",
    subTitle: "Nuevos modelos y aplicaciones prácticas",
    halfTitle: "IA Generativa 2026",
    body: "La inteligencia artificial generativa sigue evolucionando a pasos agigantados. En este post analizamos los últimos modelos revelados que permiten autonomía nivel agente y cuáles serán sus aplicaciones prácticas en la industria del software.",
    tags: ["ia", "tecnología", "innovación", "futuro"],
    hiddenTags: ["gen-ai", "agents", "automation"],
    authorName: "Roberto Gómez",
    authorDescription: "Especialista en Inteligencia Artificial y Machine Learning",
    authorType: AuthorType.MANUAL
  }
];

export const ListicleData: NoteData[] = [
  {
    title: "5 estrategias para mejorar la performance en Angular",
    subTitle: "Optimización clave para aplicaciones modernas",
    body: "Estas estrategias ayudan a mejorar significativamente el rendimiento en aplicaciones Angular, reduciendo tiempos de carga y mejorando la experiencia de usuario.",
    tags: ["angular", "performance", "frontend"],
    hiddenTags: ["optimization", "internal"],
    authorName: "Juan Pérez",
    authorDescription: "Frontend Developer especializado en Angular",
    authorType: AuthorType.MANUAL,
    listicleItems: [
      { title: "Lazy Loading", body: "Carga módulos solo cuando son necesarios para reducir el bundle inicial." },
      { title: "OnPush Change Detection", body: "Optimiza la detección de cambios evitando renders innecesarios." },
      { title: "TrackBy en ngFor", body: "Mejora el rendimiento en listas evitando recrear elementos." },
      { title: "Uso eficiente de RxJS", body: "Evita suscripciones innecesarias y memory leaks." },
      { title: "Code Splitting", body: "Divide el código en partes más pequeñas para mejorar tiempos de carga." }
    ]
  },
  {
    title: "4 buenas prácticas en testing E2E",
    subTitle: "Cómo mejorar la estabilidad de tus tests",
    body: "Aplicar buenas prácticas en testing end-to-end permite reducir la flakiness y mejorar la confiabilidad de los resultados.",
    tags: ["testing", "qa", "automation"],
    hiddenTags: ["e2e", "playwright"],
    authorName: "María Gómez",
    authorDescription: "QA Engineer experta en automatización",
    authorType: AuthorType.MANUAL,
    listicleItems: [
      { title: "Evitar sleeps fijos", body: "Usar esperas dinámicas basadas en condiciones reales." },
      { title: "Selectores estables", body: "Preferir data-testid sobre clases o textos." },
      { title: "Tests independientes", body: "Cada test debe poder ejecutarse aislado." },
      { title: "Ambientes controlados", body: "Reducir dependencias externas para mayor estabilidad." }
    ]
  },
  {
    title: "6 tips para diseñar APIs escalables",
    subTitle: "Arquitectura backend eficiente",
    body: "Diseñar APIs escalables requiere considerar estructura, versionado y manejo adecuado de errores.",
    tags: ["api", "backend", "rest"],
    hiddenTags: ["design", "scalability"],
    authorName: "Carlos Rodríguez",
    authorDescription: "Backend Developer y arquitecto de software",
    authorType: AuthorType.MANUAL,
    listicleItems: [
      { title: "Versionado de API", body: "Permite evolucionar sin romper clientes existentes." },
      { title: "Manejo de errores consistente", body: "Respuestas claras y estandarizadas." },
      { title: "Paginación", body: "Evita sobrecargar respuestas con grandes volúmenes de datos." },
      { title: "Autenticación robusta", body: "Protege endpoints con mecanismos seguros." },
      { title: "Documentación clara", body: "Facilita la integración con otros equipos." },
      { title: "Uso de caching", body: "Reduce carga en el servidor y mejora tiempos de respuesta." }
    ]
  },
  {
    title: "5 claves para una buena accesibilidad web",
    subTitle: "Interfaces inclusivas para todos",
    body: "La accesibilidad es fundamental para garantizar que cualquier usuario pueda interactuar con una aplicación.",
    tags: ["accessibility", "ux", "frontend"],
    hiddenTags: ["a11y", "inclusive"],
    authorName: "Sofía Martínez",
    authorDescription: "UX/UI Designer especializada en accesibilidad",
    authorType: AuthorType.MANUAL,
    listicleItems: [
      { title: "Uso de etiquetas semánticas", body: "Mejora la interpretación por lectores de pantalla." },
      { title: "Contraste de colores", body: "Asegura legibilidad para usuarios con dificultades visuales." },
      { title: "Navegación por teclado", body: "Permite interacción sin mouse." },
      { title: "ARIA labels", body: "Proveen contexto adicional a elementos interactivos." },
      { title: "Textos alternativos", body: "Describe imágenes para usuarios con discapacidad visual." }
    ]
  },
  {
    title: "4 fundamentos de Docker para developers",
    subTitle: "Contenerización simplificada",
    body: "Docker facilita la creación de entornos consistentes y portables para desarrollo y producción.",
    tags: ["docker", "devops", "containers"],
    hiddenTags: ["infrastructure", "deployment"],
    authorName: "Andrés Silva",
    authorDescription: "DevOps Engineer",
    authorType: AuthorType.MANUAL,
    listicleItems: [
      { title: "Imágenes", body: "Plantillas inmutables para crear contenedores." },
      { title: "Contenedores", body: "Instancias ejecutables de una imagen." },
      { title: "Dockerfile", body: "Define cómo construir una imagen." },
      { title: "Docker Compose", body: "Orquesta múltiples contenedores fácilmente." }
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
    ],
    eventLiveBlog: {
      eventTitle: "Cumbre global de tecnología 2026",
    }
  }
];

export const DebugData: NoteData = {
  secondaryTitle: "Prueba de titulo secundario"
}

