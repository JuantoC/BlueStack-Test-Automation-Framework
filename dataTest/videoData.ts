import { VideoType } from "../src/pages/videos_page/UploadVideoBtn.js";
import { VideoData } from "../src/interfaces/data.js"

export const YoutubeVideoData: VideoData[] = [
  {
    video_type: VideoType.YOUTUBE,
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    title: "Rick Astley - Never Gonna Give You Up",
    description: "Official Music Video",
  }
]

export const NativeVideoData: VideoData[] = [
  {
    video_type: VideoType.NATIVO,
    title: 'TEST Nativo',
    description: 'Este video se sube por QA Team para probar los videos nativos automatizados',
    path: "src/dataTest/Plataforma BLUESTACK CMS - 8.7.1 - Google Chrome 2026-03-09 14-29-32.mp4"
  }
]