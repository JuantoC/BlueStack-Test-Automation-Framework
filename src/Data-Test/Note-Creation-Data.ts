import { NoteDataInterface } from './Note-Creation-Interface.js';

export const NewPostData: NoteDataInterface[] = [
    {
        title: "La sequía extrema redefine el panorama agrícola regional",
        subtitle: "Productores uruguayos ajustan estrategias ante un déficit hídrico histórico",
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
        subtitle: "Expertos destacan la utilidad de la tecnología en prevención y diagnóstico temprano",
        body: "El avance de los dispositivos médicos portátiles está transformando la forma en que los pacientes y profesionales de la salud acceden a la información. Con sensores cada vez más precisos, estos equipos permiten un monitoreo constante de la actividad cardíaca, patrones de sueño y niveles de oxigenación. Las empresas del sector anticipan un crecimiento sostenido durante los próximos años.",
        tags: ["salud", "tecnología", "innovación"],
        summary: "La tecnología wearable se consolida como herramienta clave para el monitoreo preventivo en salud.",
        authorName: "Lucía Ortega",
        authorDescription: "Periodista enfocada en innovación científica y tecnológica."
    },
    {
        title: "Explorando las Maravillas de la Naturaleza: Una Aventura Inolvidable",
        body: `La naturaleza nos ofrece un espectáculo sin igual, lleno de paisajes impresionantes, flora y fauna diversa, y experiencias que nos conectan con el mundo que nos rodea. En esta aventura, exploraremos algunos de los destinos más fascinantes donde la naturaleza despliega toda su grandeza.
Desde las majestuosas montañas hasta las serenas playas, cada lugar tiene su propia historia que contar. Acompáñanos en este viaje para descubrir los secretos mejor guardados de la naturaleza y cómo podemos preservarlos para las futuras generaciones.`,
        summary: "Una exploración detallada de los destinos naturales más impresionantes del mundo y la importancia de su conservación.",
        authorName: "Juan Torres",
        authorDescription: "Apasionado por la naturaleza y la aventura, Juan ha recorrido el mundo documentando sus experiencias al aire libre."
    },
    {
        title: "La Revolución de la Tecnología Verde: Innovaciones para un Futuro Sostenible",
        body: `En los últimos años, la tecnología verde ha emergido como una fuerza transformadora en la lucha contra el cambio climático y la promoción de la sostenibilidad. Desde energías renovables hasta soluciones de eficiencia energética, estas innovaciones están cambiando la forma en que interactuamos con nuestro entorno.
Este artículo explora las últimas tendencias en tecnología verde, destacando proyectos innovadores y su impacto positivo en el medio ambiente. Además, discutiremos cómo las empresas y los individuos pueden adoptar estas tecnologías para contribuir a un futuro más sostenible.`,
        summary: "Un análisis de las innovaciones en tecnología verde y su papel crucial en la construcción de un futuro sostenible.",
        authorName: "María López",
        authorDescription: "Ingeniera ambiental y defensora de la sostenibilidad, María se dedica a promover soluciones tecnológicas que beneficien al planeta."
    }
]

export const NewListicleData: NoteDataInterface[] = [
    {
        title: "Cinco cambios que marcarán el futuro del trabajo remoto",
        subtitle: "Empresas y empleados ajustan sus dinámicas ante un nuevo paradigma laboral",
        body: "El trabajo remoto continúa evolucionando y plantea nuevos desafíos para organizaciones de todos los tamaños. Expertos coinciden en que la flexibilidad y la digitalización serán claves durante los próximos años.",
        tags: ["trabajo", "tendencias", "tecnología"],
        summary: "El futuro del trabajo remoto estará definido por flexibilidad, automatización y nuevas estrategias de liderazgo.",
        authorName: "Sofía Méndez",
        authorDescription: "Redactora especializada en tendencias laborales y transformación digital.",
        listicleTitle: [
            "Mayor adopción de modelos híbridos",
            "Automatización de procesos cotidianos",
            "Espacios virtuales colaborativos",
            "Evaluaciones basadas en resultados",
            "Programas de bienestar digital"
        ],
        listicleBody: [
            "Las empresas avanzan hacia esquemas que combinan presencialidad y teletrabajo según necesidades operativas.",
            "Herramientas basadas en IA permitirán reducir tareas repetitivas y mejorar la eficiencia.",
            "Los entornos colaborativos inmersivos facilitarán el trabajo en equipo sin importar la ubicación.",
            "La medición del desempeño priorizará objetivos concretos por encima del tiempo conectado.",
            "Las organizaciones incorporarán iniciativas que promuevan pausas activas, ergonomía y salud mental."
        ]
    },
    {
        title: "Siete destinos emergentes para viajar en 2025",
        halfTitle: "Tendencias del turismo global",
        body: "Un informe reciente destaca regiones poco exploradas que comienzan a captar la atención de viajeros alrededor del mundo. Con propuestas culturales y naturales únicas, estos destinos se posicionan como alternativas frescas frente a los circuitos tradicionales.",
        tags: ["turismo", "viajes", "tendencias"],
        summary: "Destinos menos conocidos comienzan a ganar protagonismo en las preferencias de viajeros internacionales.",
        authorName: "Tomás Villalba",
        authorDescription: "Periodista de viajes y cultura.",
        listicleTitle: [
            "Georgia",
            "Albania",
            "Sri Lanka",
            "Islas Feroe",
            "Namibia",
            "Laos",
            "Eslovenia"
        ],
        listicleBody: [
            "Un cruce perfecto entre tradición, gastronomía y paisajes montañosos.",
            "Playas cristalinas, costos accesibles y creciente infraestructura turística.",
            "Reabre sus rutas con propuestas de aventura, templos y biodiversidad.",
            "Un destino remoto ideal para amantes de la naturaleza y la fotografía.",
            "Desiertos, fauna salvaje y experiencias de safari distintas a las tradicionales.",
            "Templos, selva y cultura ancestral en una región aún poco explorada.",
            "Uno de los países verdes de Europa con lagos, montañas y ciudades históricas."
        ]
    },
    {
        title: "10 Consejos para Mejorar tu Productividad Diaria",
        listicleTitle: [
            "Establece Metas Claras",
            "Prioriza tus Tareas",
            "Elimina Distracciones",
            "Toma Descansos Regulares",
            "Utiliza Herramientas de Gestión del Tiempo",
            "Mantén un Espacio de Trabajo Ordenado",
            "Aprende a Decir No",
            "Automatiza Tareas Repetitivas",
            "Cuida tu Salud Física y Mental",
            "Reflexiona sobre tu Progreso"
        ],
        listicleBody: [
            "Definir objetivos específicos te ayuda a mantener el enfoque y medir tu progreso.",
            "Identifica las tareas más importantes y abórdalas primero para maximizar tu eficiencia.",
            "Minimiza las interrupciones apagando notificaciones y creando un entorno de trabajo tranquilo.",
            "Breves pausas durante el día pueden revitalizar tu mente y mejorar la concentración.",
            "Herramientas como calendarios y aplicaciones de tareas pueden ayudarte a organizar tu tiempo efectivamente.",
            "Un espacio limpio y organizado reduce el estrés y aumenta la productividad.",
            "Aprender a rechazar compromisos innecesarios te permite centrarte en lo que realmente importa.",
            "Utiliza la tecnología para automatizar tareas rutinarias y liberar tiempo para actividades más importantes.",
            "Una buena alimentación, ejercicio y descanso son fundamentales para mantener altos niveles de energía.",
            "Revisar tus logros te motiva y te ayuda a ajustar tus estrategias para mejorar continuamente."
        ],
        body: "",
        summary: "Descubre diez estrategias efectivas para aumentar tu productividad diaria y alcanzar tus objetivos con mayor eficiencia.",
        authorName: "Laura Martínez",
        authorDescription: "Consultora en productividad y desarrollo personal, Laura ayuda a profesionales a optimizar su tiempo y alcanzar sus metas."
    }
];