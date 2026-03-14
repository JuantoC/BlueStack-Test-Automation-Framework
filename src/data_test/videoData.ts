import { VideoType } from "../pages/videos_page/UploadVideoBtn.js";
import { VideoData } from "../interfaces/data.js"

export const YoutubeVideoData: VideoData[] = [
  {
    video_type: VideoType.YOUTUBE,
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    title: "Rick Astley - Never Gonna Give You Up",
    description: "Official Music Video"
  },
  {
    video_type: VideoType.YOUTUBE,
    url: 'https://www.youtube.com/watch?v=E1JiTkufJgY',
    title: 'Mamas Gun - This Is The Day (Full Band Version)',
    description: `Video to accompany the single THIS IS THE DAY - FULL BAND VERSION by Mamas Gun.
    Add the song to your streaming library: https://mamasgun.lnk.to/this-is-the-d...
    Scroll down for lyrics`
  },
  {
    video_type: VideoType.YOUTUBE,
    url: 'https://www.youtube.com/watch?v=SqcY0GlETPk',
    title: 'React in 100 Seconds',
    description: 'React is a popular JavaScript library for building user interfaces. Learn the basics in just 100 seconds!'
  }
]

export const NativeVideoData: VideoData[] = [
  {
    video_type: VideoType.NATIVO,
    title: 'TEST Nativo',
    description: 'Este video se sube por QA Team para probar los videos nativos automatizados',
    path: "src/data_test/Plataforma BLUESTACK CMS - 8.7.1 - Google Chrome 2026-03-09 14-29-32.mp4"
  }
]