import { VideoType } from "../pages/videos_page/UploadVideoBtn.js";

export interface VideoData {
  video_type: VideoType
  url?: string;
  title: string;
  description?: string;
  path?: string;
}

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
    title: 'Nativo para probar subida',
    description: 'Este video se sube por QA Team para probar los videos nativos automatizados',
    path: "/app/dataTest/youtube_video2.mp4"
  }
]