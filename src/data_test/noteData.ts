import { AINoteData, NoteData } from "../interfaces/data.js";
import { AuthorType } from "../pages/post_page/note_editor_page/EditorAuthorSection.js"

export const PostData: NoteData[] = [
  {
    title: "Optimización de performance en aplicaciones Angular",
    subTitle: "Buenas prácticas para mejorar tiempos de carga",
    halfTitle: "Performance Angular",
    body: "En este artículo exploramos distintas estrategias para optimizar el rendimiento en aplicaciones Angular, incluyendo lazy loading, change detection strategy y uso eficiente de observables. Implementar estas mejoras puede reducir el First Contentful Paint (FCP) a la mitad.",
    tags: ["angular", "performance", "frontend"],
    hiddenTags: ["internal", "optimization"],
    authorName: "Juan Pérez",
    authorDescription: "Frontend Developer especializado en Angular",
    authorType: AuthorType.MANUAL
  },
  {
    title: "El auge de Rust en el backend moderno",
    subTitle: "Por qué las startups están migrando de Node.js a Rust",
    halfTitle: "Rust en el Backend",
    body: "La seguridad de memoria y el rendimiento sin garbage collector están haciendo de Rust una opción sumamente atractiva. Analizamos tres casos de éxito de empresas de la lista Fortune 500 que reescribieron sus microservicios clave.",
    tags: ["rust", "backend", "microservicios", "seguridad"],
    hiddenTags: ["tech-trends-2026", "rust-lang"],
    authorName: "Sofía Martínez",
    authorDescription: "Ingeniera de Software y entusiasta del código seguro.",
    authorType: AuthorType.MANUAL
  },
  {
    title: "Ciberseguridad: Amenazas comunes en 2026",
    subTitle: "Protege tu infraestructura cloud contra ataques Zero-Day",
    halfTitle: "Ciberseguridad 2026",
    body: "Con la evolución de las herramientas automatizadas, los ataques a infraestructuras en la nube han cambiado radicalmente. En esta guía cubrimos desde la configuración de políticas IAM hasta la mitigación de ataques DDoS apoyados por redes neuronales.",
    tags: ["ciberseguridad", "cloud", "aws", "zero-day"],
    hiddenTags: ["security-alert", "devsecops"],
    authorName: "Carlos Dev",
    authorDescription: "DevSecOps Architect con 10 años de experiencia.",
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
      { title: "Uso eficiente de RxJS", body: "Evita suscripciones innecesarias y memory leaks usando takeUntil." },
      { title: "Code Splitting", body: "Divide el código en partes más pequeñas para mejorar tiempos de carga." }
    ]
  },
  {
    title: "Top 3 extensiones de VS Code para productividad",
    subTitle: "Herramientas que todo desarrollador debe instalar",
    body: "Acelera tu flujo de trabajo y reduce errores tipográficos con estas herramientas imprescindibles que la comunidad ha adoptado como estándar.",
    tags: ["vscode", "productividad", "herramientas"],
    hiddenTags: ["dev-tools", "editor"],
    authorName: "Laura Gómez",
    authorDescription: "Tech Lead y creadora de contenido.",
    authorType: AuthorType.MANUAL,
    listicleItems: [
      { title: "GitLens", body: "Superpoderes para Git directamente en tu editor. Mira quién escribió cada línea de código." },
      { title: "Prettier", body: "Formateador de código automático que mantiene un estilo consistente en todo el equipo." },
      { title: "Error Lens", body: "Visualiza los errores y warnings de forma directa en la línea donde ocurren, sin hacer hover." }
    ]
  },
  {
    title: "4 pasos para asegurar tu API en Node.js",
    subTitle: "Guía rápida para evitar vulnerabilidades comunes",
    body: "No dejes tu base de datos expuesta. Implementar estas medidas básicas te salvará del 90% de los ataques automatizados.",
    tags: ["nodejs", "api", "seguridad"],
    hiddenTags: ["backend-security", "tutorial"],
    authorName: "Martín Rivas",
    authorDescription: "Backend Developer y auditor de seguridad.",
    authorType: AuthorType.MANUAL,
    listicleItems: [
      { title: "Helmet.js", body: "Configura cabeceras HTTP seguras con una sola línea de código." },
      { title: "Rate Limiting", body: "Limita la cantidad de peticiones por IP para mitigar ataques de fuerza bruta." },
      { title: "Validación de Inputs", body: "Usa librerías como Zod o Joi para sanear y validar todos los datos entrantes." },
      { title: "Variables de Entorno", body: "Nunca hardcodees credenciales; utiliza dotenv y mantén tus secretos seguros." }
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
    authorType: AuthorType.MANUAL,
    listicleItems: [
      { title: "09:00 - Inicio del evento", body: "Arranca la transmisión en vivo con una presentación introductoria sobre el estado actual de la tecnología." },
      { title: "09:30 - Anuncio de nueva IA", body: "Se presenta un modelo de IA con capacidades autónomas mejoradas." },
      { title: "10:20 - Demo en vivo", body: "Se muestra una herramienta que automatiza procesos complejos financieros." },
      { title: "11:00 - Networking", body: "Los participantes debaten acaloradamente sobre el impacto de la demo." },
      { title: "09:00 - Inicio del evento", body: "Arranca la transmisión en vivo con una presentación introductoria sobre el estado actual de la tecnología." },
      { title: "09:30 - Anuncio de nueva IA", body: "Se presenta un modelo de IA con capacidades autónomas mejoradas." },
      { title: "10:20 - Demo en vivo", body: "Se muestra una herramienta que automatiza procesos complejos financieros." },
      { title: "11:00 - Networking", body: "Los participantes debaten acaloradamente sobre el impacto de la demo." },
      { title: "09:00 - Inicio del evento", body: "Arranca la transmisión en vivo con una presentación introductoria sobre el estado actual de la tecnología." },
      { title: "09:30 - Anuncio de nueva IA", body: "Se presenta un modelo de IA con capacidades autónomas mejoradas." },
      { title: "10:20 - Demo en vivo", body: "Se muestra una herramienta que automatiza procesos complejos financieros." },
      { title: "11:00 - Networking", body: "Los participantes debaten acaloradamente sobre el impacto de la demo." },
      { title: "09:00 - Inicio del evento", body: "Arranca la transmisión en vivo con una presentación introductoria sobre el estado actual de la tecnología." },
      { title: "09:30 - Anuncio de nueva IA", body: "Se presenta un modelo de IA con capacidades autónomas mejoradas." },
      { title: "10:20 - Demo en vivo", body: "Se muestra una herramienta que automatiza procesos complejos financieros." },
      { title: "11:00 - Networking", body: "Los participantes debaten acaloradamente sobre el impacto de la demo." },
      { title: "09:00 - Inicio del evento", body: "Arranca la transmisión en vivo con una presentación introductoria sobre el estado actual de la tecnología." },
      { title: "09:30 - Anuncio de nueva IA", body: "Se presenta un modelo de IA con capacidades autónomas mejoradas." },
      { title: "10:20 - Demo en vivo", body: "Se muestra una herramienta que automatiza procesos complejos financieros." },
      { title: "11:00 - Networking", body: "Los participantes debaten acaloradamente sobre el impacto de la demo." }
    ],
    eventLiveBlog: {
      eventTitle: "Cumbre global de tecnología 2026",
    }
  },
  {
    title: "Minuto a Minuto: Lanzamiento Misión Artemis V",
    subTitle: "Sigue el retorno de la humanidad a la luna en tiempo real",
    halfTitle: "Lanzamiento Artemis V",
    tags: ["espacio", "nasa", "artemis", "liveblog"],
    hiddenTags: ["space-launch", "breaking-news"],
    authorName: "Diego Silva",
    authorDescription: "Corresponsal científico de la agencia aeroespacial.",
    authorType: AuthorType.MANUAL,
    listicleItems: [
      { title: "T-02:00:00 - Carga de combustible", body: "Comienza la carga de hidrógeno líquido en la etapa central del cohete SLS." },
      { title: "T-00:45:00 - Verificación climática", body: "El equipo meteorológico da luz verde. Condiciones óptimas para el despegue." },
      { title: "T-00:10:00 - Retirada de pasarela", body: "La pasarela de acceso de la tripulación se retira exitosamente." },
      { title: "T-00:00:00 - ¡Despegue!", body: "Ignición de los motores principales. El cohete abandona la plataforma." },
      { title: "T+00:08:30 - SECO", body: "Apagado del motor principal. La cápsula Orion entra en órbita terrestre preliminar." },
      { title: "T-02:00:00 - Carga de combustible", body: "Comienza la carga de hidrógeno líquido en la etapa central del cohete SLS." },
      { title: "T-00:45:00 - Verificación climática", body: "El equipo meteorológico da luz verde. Condiciones óptimas para el despegue." },
      { title: "T-00:10:00 - Retirada de pasarela", body: "La pasarela de acceso de la tripulación se retira exitosamente." },
      { title: "T-00:00:00 - ¡Despegue!", body: "Ignición de los motores principales. El cohete abandona la plataforma." },
      { title: "T+00:08:30 - SECO", body: "Apagado del motor principal. La cápsula Orion entra en órbita terrestre preliminar." },
      { title: "T-02:00:00 - Carga de combustible", body: "Comienza la carga de hidrógeno líquido en la etapa central del cohete SLS." },
      { title: "T-00:45:00 - Verificación climática", body: "El equipo meteorológico da luz verde. Condiciones óptimas para el despegue." },
      { title: "T-00:10:00 - Retirada de pasarela", body: "La pasarela de acceso de la tripulación se retira exitosamente." },
      { title: "T-00:00:00 - ¡Despegue!", body: "Ignición de los motores principales. El cohete abandona la plataforma." },
      { title: "T+00:08:30 - SECO", body: "Apagado del motor principal. La cápsula Orion entra en órbita terrestre preliminar." },
      { title: "T-02:00:00 - Carga de combustible", body: "Comienza la carga de hidrógeno líquido en la etapa central del cohete SLS." },
      { title: "T-00:45:00 - Verificación climática", body: "El equipo meteorológico da luz verde. Condiciones óptimas para el despegue." },
      { title: "T-00:10:00 - Retirada de pasarela", body: "La pasarela de acceso de la tripulación se retira exitosamente." },
      { title: "T-00:00:00 - ¡Despegue!", body: "Ignición de los motores principales. El cohete abandona la plataforma." },
      { title: "T+00:08:30 - SECO", body: "Apagado del motor principal. La cápsula Orion entra en órbita terrestre preliminar." },
      { title: "T-02:00:00 - Carga de combustible", body: "Comienza la carga de hidrógeno líquido en la etapa central del cohete SLS." },
      { title: "T-00:45:00 - Verificación climática", body: "El equipo meteorológico da luz verde. Condiciones óptimas para el despegue." },
      { title: "T-00:10:00 - Retirada de pasarela", body: "La pasarela de acceso de la tripulación se retira exitosamente." },
      { title: "T-00:00:00 - ¡Despegue!", body: "Ignición de los motores principales. El cohete abandona la plataforma." },
      { title: "T+00:08:30 - SECO", body: "Apagado del motor principal. La cápsula Orion entra en órbita terrestre preliminar." }
    ],
    eventLiveBlog: {
      eventTitle: "Misión Artemis V - Lanzamiento",
    }
  },
  {
    title: "En directo: Final del Mundial de Esports 2026",
    subTitle: "El enfrentamiento definitivo por el campeonato mundial",
    halfTitle: "Final Mundial Esports",
    tags: ["esports", "gaming", "torneo", "live"],
    hiddenTags: ["gaming-finals", "esports-coverage"],
    authorName: "Elena Ruiz",
    authorDescription: "Caster y analista profesional de deportes electrónicos.",
    authorType: AuthorType.MANUAL,
    listicleItems: [
      { title: "18:00 - Ceremonia de apertura", body: "Un show de hologramas y música en vivo inaugura el estadio lleno." },
      { title: "18:30 - Partida 1: Fase de selección", body: "Sorpresa en los picks. El equipo A elige una composición altamente agresiva." },
      { title: "19:15 - ¡Victoria de la Partida 1!", body: "Tras una batalla épica de 40 minutos, el equipo B logra remontar y asegura el primer punto." },
      { title: "19:30 - Pausa táctica", body: "Los entrenadores discuten estrategias mientras el público ruge en las gradas." },
      { title: "18:00 - Ceremonia de apertura", body: "Un show de hologramas y música en vivo inaugura el estadio lleno." },
      { title: "18:30 - Partida 1: Fase de selección", body: "Sorpresa en los picks. El equipo A elige una composición altamente agresiva." },
      { title: "19:15 - ¡Victoria de la Partida 1!", body: "Tras una batalla épica de 40 minutos, el equipo B logra remontar y asegura el primer punto." },
      { title: "19:30 - Pausa táctica", body: "Los entrenadores discuten estrategias mientras el público ruge en las gradas." },
      { title: "18:00 - Ceremonia de apertura", body: "Un show de hologramas y música en vivo inaugura el estadio lleno." },
      { title: "18:30 - Partida 1: Fase de selección", body: "Sorpresa en los picks. El equipo A elige una composición altamente agresiva." },
      { title: "19:15 - ¡Victoria de la Partida 1!", body: "Tras una batalla épica de 40 minutos, el equipo B logra remontar y asegura el primer punto." },
      { title: "19:30 - Pausa táctica", body: "Los entrenadores discuten estrategias mientras el público ruge en las gradas." },
      { title: "18:00 - Ceremonia de apertura", body: "Un show de hologramas y música en vivo inaugura el estadio lleno." },
      { title: "18:30 - Partida 1: Fase de selección", body: "Sorpresa en los picks. El equipo A elige una composición altamente agresiva." },
      { title: "19:15 - ¡Victoria de la Partida 1!", body: "Tras una batalla épica de 40 minutos, el equipo B logra remontar y asegura el primer punto." },
      { title: "19:30 - Pausa táctica", body: "Los entrenadores discuten estrategias mientras el público ruge en las gradas." },
      { title: "18:00 - Ceremonia de apertura", body: "Un show de hologramas y música en vivo inaugura el estadio lleno." },
      { title: "18:30 - Partida 1: Fase de selección", body: "Sorpresa en los picks. El equipo A elige una composición altamente agresiva." },
      { title: "19:15 - ¡Victoria de la Partida 1!", body: "Tras una batalla épica de 40 minutos, el equipo B logra remontar y asegura el primer punto." },
      { title: "19:30 - Pausa táctica", body: "Los entrenadores discuten estrategias mientras el público ruge en las gradas." }
    ],
    eventLiveBlog: {
      eventTitle: "World Championship Finals 2026",
    }
  }
];

export const AIData: AINoteData[] = [
  {
    task: "Escribe un artículo periodístico profundo de 1200 palabras sobre el impacto de la inteligencia artificial en la educación secundaria latinoamericana. El texto debe estar estructurado con una introducción cautivadora, tres subtítulos analíticos evaluando pros y contras (como la brecha digital y la hiper-personalización del aprendizaje), y concluir con testimonios hipotéticos pero realistas de docentes. Debe optimizarse con SEO para las palabras clave: 'IA en educación', 'futuro escolar', y 'edtech latinoamérica'.",
    context: "Soy un periodista uruguayo de investigación especializado en políticas públicas y educación moderna. Mi postura política es progresista y enfocada en la igualdad de derechos sociales. Escribo con un tono empático, riguroso y levemente crítico frente a las corporaciones, priorizando siempre el impacto humano y social. Tengo un estilo narrativo rico, usando metáforas locales.",
    section: 0,
    paragraph: 6,
    tone: 0,
    language: 1
  },
  {
    task: "Redacta un análisis técnico exhaustivo comparando las arquitecturas de micro-frontends frente a las aplicaciones monolíticas SPA (Single Page Applications). Necesito que incluyas métricas de rendimiento estimadas, impacto en la experiencia del desarrollador (DX) y estrategias de despliegue continuo (CI/CD) para ambas arquitecturas. Finaliza con un árbol de decisión (en formato de viñetas) para ayudar a CTOs a elegir el modelo adecuado.",
    context: "Soy un Arquitecto de Software Senior nacido en España, trabajando en Silicon Valley para una empresa FAANG. Soy pragmático, muy directo y agnóstico a las tecnologías (no me caso con ningún framework). Escribo para una audiencia de líderes técnicos (CTOs y Tech Leads). Mi vocabulario es altamente especializado, técnico, con uso frecuente de anglicismos propios del rubro IT. No tolero el contenido 'fluff' o de relleno.",
    section: 0,
    paragraph: 5,
    tone: 1,
    language: 1
  },
  {
    task: "Crea una crónica financiera de 800 palabras sobre la volatilidad del mercado de criptomonedas durante el último trimestre. Detalla cómo las nuevas regulaciones en la Unión Europea afectaron a los exchanges centralizados (CEX) y generaron una migración masiva hacia las finanzas descentralizadas (DeFi). El texto debe invitar a la reflexión sobre la soberanía financiera sin ser un consejo de inversión directo.",
    context: "Soy una analista financiera y blogger mexicana, libertaria en lo económico, gran defensora de la descentralización y la tecnología blockchain. Mi tono es enérgico, persuasivo, optimista pero cauteloso con las regulaciones gubernamentales. Escribo de manera muy dinámica, buscando empoderar al lector común para que tome control de sus finanzas, usando anécdotas cortas para explicar conceptos macroeconómicos complejos.",
    section: 1,
    paragraph: 4,
    tone: 0,
    language: 1
  }
];

export const DebugData: NoteData = {
  secondaryTitle: "Prueba de titulo secundario"
}