import { VideoType } from "../pages/videos_page/UploadVideoBtn.js";
import { VideoData } from "../interfaces/data.js"

export const YoutubeVideoData: VideoData[] = [
  {
    video_type: VideoType.YOUTUBE,
    url: "https://www.youtube.com/watch?v=OzYybi5IEGg",
    title: "¿Es éste el peor escenario posible para el petróleo?",
    description: "La guerra en Irán está dañando con gravedad la infraestructura energética de los países del Golfo Pérsico. ¿Estamos adentrándonos a un punto de no retorno en materia de precios?"
  },
  {
    video_type: VideoType.YOUTUBE,
    url: 'https://www.youtube.com/watch?v=IZ7QyVMaG8E',
    title: 'El día que EE.UU. rompió el sistema financiero mundial - ¿Qué era Bretton Woods?',
    description: `¿Sabías que Estados Unidos firmó el mayor impago de la historia y casi nadie lo recuerda? 
    El 15 de agosto de 1971, Nixon suspendió la convertibilidad del dólar en oro y rompió el sistema de Bretton Woods. En este vídeo te explico cómo funcionaba ese sistema, por qué fracasó y qué consecuencias arrastramos hoy por vivir en un mundo donde el dinero ya no se respalda en nada. Es la historia de cómo todos los gobiernos se aprovecharon… y el resultado es el sistema inflacionario en el que seguimos atrapados.`
  }
]

export const NativeVideoData: VideoData[] = [
  {
    video_type: VideoType.NATIVO,
    title: 'TEST Nativo',
    description: 'Este video se sube por QA Team para probar los videos nativos automatizados',
    path: "src/data_test/videos/Plataforma BLUESTACK CMS - 8.7.1 - Google Chrome 2026-03-17 13-12-08.mp4"
  }
]

export const EmbeddedVideoData: VideoData[] = [
  {
    video_type: VideoType.EMBEDDED,
    url: '<iframe width="560" height="315" src="https://www.youtube.com/embed/HVec3aAlWkg?si=synAOCHz0va1u_x5" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
    title: `We Spent $1,850 On Coffee Scales. What’s Actually Good?`,
    description: 'Today we delve into the world of coffee scales and take a look at their accuracy, build quality, responsiveness and UX/UI. Additionally, we find out which scale has the most melodic beep.'
  }
]