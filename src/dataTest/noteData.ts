import { NoteData } from "./noteDataInterface.js";
import { AuthorType } from "../pages/post/note_editor/NoteAuthorSection.js";

export const notesData: NoteData[] = [
    {
        title: "Avances en baterías de estado sólido prometen duplicar la autonomía de los vehículos eléctricos",
        subTitle: "Un consorcio europeo anunció pruebas exitosas con celdas más seguras y de carga ultrarrápida",
        halfTitle: "Baterías de estado sólido duplican autonomía",
        body: `Un consorcio de investigación europeo confirmó esta semana resultados positivos en el desarrollo de baterías de estado sólido capaces de duplicar la autonomía actual de los vehículos eléctricos. Según los datos preliminares, las nuevas celdas alcanzan densidades energéticas superiores a los 450 Wh/kg, lo que permitiría recorrer más de 900 kilómetros con una sola carga en modelos de gama media.

A diferencia de las baterías de ion-litio tradicionales, la tecnología de estado sólido reemplaza el electrolito líquido por un material sólido, reduciendo significativamente el riesgo de incendios y mejorando la estabilidad térmica. Además, los investigadores aseguran que el tiempo de carga podría reducirse a menos de 15 minutos para alcanzar el 80% de la capacidad.

Las primeras pruebas en prototipos industriales demostraron un rendimiento estable tras más de 1.000 ciclos de carga completa. Aunque aún restan desafíos en la escalabilidad y los costos de producción, varias automotrices ya iniciaron acuerdos estratégicos para incorporar esta tecnología en sus próximos modelos eléctricos hacia 2028.

Especialistas del sector energético destacan que este avance podría acelerar la transición hacia la movilidad sostenible y disminuir la dependencia de combustibles fósiles en los próximos años.`,
        tags: ["Tecnología", "Movilidad eléctrica", "Innovación", "Energía"],
        hiddenTags: ["baterías estado sólido", "autonomía vehículos eléctricos", "carga rápida"],
        authorName: "Mariana López",
        authorDescription: "Periodista especializada en tecnología e innovación energética."
    },
    {
        title: "Inteligencia artificial generativa transforma la atención al cliente en América Latina",
        subTitle: "Empresas regionales integran asistentes conversacionales para reducir costos y mejorar tiempos de respuesta",
        halfTitle: "IA generativa redefine atención al cliente",
        body: `La adopción de inteligencia artificial generativa crece de forma sostenida en América Latina, especialmente en áreas de atención al cliente. Empresas de telecomunicaciones, banca y comercio electrónico comenzaron a implementar asistentes conversacionales capaces de resolver consultas complejas en tiempo real y en múltiples idiomas.

De acuerdo con consultoras del sector, las organizaciones que integraron estos sistemas reportaron reducciones de hasta un 35% en costos operativos y mejoras significativas en los niveles de satisfacción del usuario. Los nuevos modelos permiten comprender contexto, historial del cliente y matices del lenguaje natural, ofreciendo respuestas más precisas y personalizadas.

Sin embargo, expertos advierten sobre la importancia de establecer marcos éticos claros, proteger los datos personales y mantener supervisión humana en procesos críticos. La transparencia en el uso de algoritmos y la capacitación interna son factores clave para una implementación responsable.

Analistas proyectan que, en los próximos tres años, más del 60% de las interacciones digitales en la región estarán mediadas por sistemas de inteligencia artificial, consolidando un cambio estructural en la relación entre empresas y consumidores.`,
        tags: ["Inteligencia artificial", "Transformación digital", "Empresas", "América Latina"],
        hiddenTags: ["IA generativa", "chatbots empresariales", "automatización atención cliente"],
        authorName: "Santiago Ferrer",
        authorDescription: "Editor de negocios y tecnología con foco en transformación digital."
    },
    {
        title: "Descubren un nuevo exoplaneta potencialmente habitable a 120 años luz de la Tierra",
        subTitle: "El planeta orbita una estrella similar al Sol y presenta condiciones compatibles con agua líquida",
        halfTitle: "Nuevo exoplaneta con potencial habitable",
        body: `Un equipo internacional de astrónomos anunció el hallazgo de un exoplaneta ubicado a 120 años luz de la Tierra que podría reunir condiciones aptas para albergar agua líquida en su superficie. El descubrimiento fue realizado mediante observaciones combinadas de telescopios terrestres y satelitales especializados en la detección de tránsito planetario.

El nuevo mundo, clasificado como supertierra por su tamaño y masa, orbita dentro de la denominada "zona habitable" de su estrella, una región donde la temperatura permitiría la existencia de agua en estado líquido. Los análisis preliminares indican que posee una atmósfera densa y un período orbital de aproximadamente 37 días.

Si bien todavía no es posible confirmar la presencia de vida, los científicos consideran que se trata de uno de los candidatos más prometedores identificados en los últimos años. Próximas misiones espaciales buscarán estudiar su composición atmosférica con mayor precisión para detectar posibles biofirmas.

El hallazgo refuerza la hipótesis de que planetas con características similares a la Tierra podrían ser más comunes de lo que se creía en la galaxia.`,
        tags: ["Ciencia", "Astronomía", "Espacio", "Investigación"],
        hiddenTags: ["exoplaneta", "zona habitable", "supertierra", "vida extraterrestre"],
        authorName: "Lucía Andrade",
        authorDescription: "Divulgadora científica especializada en astronomía y exploración espacial."
    },
    {
        title: "Uruguay impulsa un plan nacional para expandir la conectividad 5G en zonas rurales",
        subTitle: "El proyecto busca reducir la brecha digital y fortalecer el desarrollo productivo del interior",
        halfTitle: "Plan 5G para zonas rurales",
        body: `El gobierno presentó un nuevo plan nacional orientado a ampliar la cobertura 5G en localidades rurales y pequeñas ciudades del interior del país. La iniciativa contempla inversiones público-privadas para desplegar infraestructura de telecomunicaciones en áreas donde actualmente el acceso a internet de alta velocidad es limitado.

El programa incluye la instalación de nuevas antenas, actualización de redes existentes y subsidios para operadores que amplíen su cobertura en regiones estratégicas. Según autoridades del sector, el objetivo es mejorar la competitividad de productores agropecuarios, facilitar el acceso a educación digital y potenciar el comercio electrónico local.

Especialistas en transformación digital sostienen que la conectividad de alta velocidad puede generar impactos directos en la productividad y la inclusión social, permitiendo el desarrollo de soluciones de telemedicina, monitoreo agrícola inteligente y capacitación remota.

El despliegue comenzará en el segundo semestre del año y se prevé que alcance a más del 85% del territorio nacional en los próximos tres años.`,
        tags: ["Uruguay", "Telecomunicaciones", "5G", "Desarrollo"],
        hiddenTags: ["conectividad rural", "brecha digital", "infraestructura telecom"],
        authorName: "Federico Núñez",
        authorDescription: "Periodista especializado en políticas públicas y tecnología."
    }
];

export const listicleData: NoteData[] = [
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

export const liveblogData: NoteData[] = [
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