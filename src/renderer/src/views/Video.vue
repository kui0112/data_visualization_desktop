<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { delay, Segment } from '../scripts/Utils'
import { apiAddress } from '../scripts/Service'
import { appConfig } from '../scripts/GlobalConfig'

const cfg = appConfig()
const subtitleLanguage = cfg.PicturesConfig.subtitleLanguage

const zh = subtitleLanguage.indexOf('zh') !== -1
const en = subtitleLanguage.indexOf('en') !== -1

let video: HTMLVideoElement | null = null
let preloadVideo: HTMLVideoElement | null = null

const subtitleDiv = ref<HTMLDivElement | null>(null)
const subtitleEnDiv = ref<HTMLDivElement | null>(null)
const subtitleTestDiv = ref<HTMLDivElement | null>(null)
const audio = ref<HTMLAudioElement | null>(null)

let animationId: number = Date.now()
let audioAvailable = false
let segmentId: number | null = null

async function subtitleAnimation(subtitle: string, subtitleEn: string, maxWidth: number, animInterval: number) {
  const currentAnimationId = animationId
  if (!subtitle || subtitle.length === 0 || (!zh && !en)) {
    return
  }

  if (zh) {
    subtitleDiv.value.style.maxWidth = `${maxWidth}px`
  } else {
    subtitleDiv.value.style.display = 'none'
  }
  if (en) {
    subtitleEnDiv.value.style.maxWidth = `${maxWidth}px`
  } else {
    subtitleEnDiv.value.style.display = 'none'
  }

  subtitleDiv.value.style.bottom = '50px'
  subtitleEnDiv.value.style.bottom = `50px`

  if (zh && en) {
    subtitleEnDiv.value.style.bottom = `130.391px`
  }

  for (let i = 0; i < subtitle.length; i++) {
    if (currentAnimationId !== animationId) return

    const sectionZH = subtitle.slice(0, i + 1)
    if (subtitleDiv?.value && zh) {
      subtitleDiv.value.textContent = sectionZH
    }
    if (subtitleEnDiv?.value && en) {
      let rightBoundary = Math.ceil((i + 1) * (subtitleEn.length / subtitle.length))
      if (rightBoundary > subtitleEn.length) {
        rightBoundary = subtitleEn.length
      }
      subtitleEnDiv.value.textContent = subtitleEn.slice(0, rightBoundary)
    }

    // 根据zh行数调整中英文字幕间距
    if (zh && en) {
      subtitleDiv.value.style.bottom = '50px'
      subtitleEnDiv.value.style.bottom = `${50 + subtitleDiv.value.offsetHeight + 5}px`
    }

    if (audioAvailable) {
      audioAvailable = false
      audio.value.currentTime = 0
      audio.value.volume = 1
      audio.value.play().finally(() => {
        audioAvailable = true
      }).catch((err) => {
        console.log(err)
      })
    }
    await delay(animInterval)
  }
}

function showVideo() {
  // console.log('show video.')
  if (subtitleDiv?.value?.style && zh) {
    subtitleDiv.value.style.display = 'block'
  }
  if (subtitleEnDiv?.value?.style && en) {
    subtitleEnDiv.value.style.display = 'block'
  }
  if (video?.style) {
    video.style.display = 'block'
  }
  if (preloadVideo?.style) {
    preloadVideo.style.display = 'none'
  }
}

function setPreloadVideo(seg: Segment) {
  //@ts-ignore
  preloadVideo.available = false
  const currentSegmentId = segmentId

  // 使用 currentSegmentId === segmentId 判断是否发生了切换
  return new Promise<void>(async (resolve, reject) => {
    if (preloadVideo) {
      preloadVideo.onerror = (err) => {
        console.log(`preload failed, ${err}`)
      }
      preloadVideo.src = apiAddress(seg.video)
      preloadVideo.load()
      //@ts-ignore
      while (!preloadVideo.available && currentSegmentId === segmentId) {
        await delay(0.02)
      }

      // console.log('preload video, loaded.')
      resolve()
    } else {
      reject('image element is null.')
    }
  })
}

function setVideo(s: string) {
  //@ts-ignore
  video.available = false
  //@ts-ignore
  if (preloadVideo && preloadVideo.available) {
    [video, preloadVideo] = [preloadVideo, video]

    //@ts-ignore
    video.available = true
    //@ts-ignore
    preloadVideo.available = false

    // console.log('preload video available, switch.')
    return Promise.resolve()
  }
  // console.log('preload video not available, load now.')

  const currentSegmentId = segmentId
  return new Promise<void>(async (resolve, reject) => {
    if (video) {
      video.onerror = (err) => reject(err)
      video.src = apiAddress(s)
      video.load()

      //@ts-ignore
      while (!video.available && currentSegmentId === segmentId) {
        await delay(0.02)
      }

      // console.log('video loaded.')
      resolve()
    } else {
      reject('image element is null.')
    }
  })
}

async function update(seg: Segment, animInterval: number) {
  segmentId = Date.now()

  if (!video) return

  await setVideo(seg.video)
  showVideo()

  animationId = Date.now()
  await subtitleAnimation(seg.subtitle, seg.subtitleEn, video.clientWidth, animInterval)
}

const audioOnCanPlayThrough = () => {
  audioAvailable = true
  // console.log('audio loaded.')

  audio?.value?.removeEventListener('canplaythrough', audioOnCanPlayThrough)
}
const stop = () => {
  animationId = Date.now()
  audio.value.pause()
  if (video) {
    //@ts-ignore
    video.available = false
  }
  if (preloadVideo) {
    //@ts-ignore
    preloadVideo.available = false
  }
}

const audioOnError = () => {
  audioAvailable = false
  // console.log('audio load failed.')
}

const videoOnLoadedMetaData = (e: any) => {
  //@ts-ignore
  e.target.available = true
}

// @ts-ignore
const subtitleDivSize = (str: string, maxWidth: number) => {
  if (maxWidth <= 0) {
    subtitleTestDiv.value.style.maxWidth = ''
  } else {
    subtitleTestDiv.value.style.maxWidth = `${maxWidth}px`
  }
  subtitleTestDiv.value.textContent = str

  return {
    width: subtitleTestDiv.value.offsetWidth,
    height: subtitleTestDiv.value.offsetHeight
  }
}

onMounted(async () => {
  video = document.getElementById('video') as HTMLVideoElement
  preloadVideo = document.getElementById('preloadVideo') as HTMLVideoElement

  audioAvailable = false
  if (audio?.value) {
    audio.value.addEventListener('canplaythrough', audioOnCanPlayThrough)
    audio.value.addEventListener('error', audioOnError)
    audio.value.src = apiAddress('/static/tick.mp3')
    audio.value.load()
  }

  // @ts-ignore
  video.available = false
  if (video) {
    video.addEventListener('loadedmetadata', videoOnLoadedMetaData)
  }

  // @ts-ignore
  preloadVideo.available = false
  if (preloadVideo) {
    preloadVideo.addEventListener('loadedmetadata', videoOnLoadedMetaData)
  }
})

onBeforeUnmount(async () => {
  audio.value.removeEventListener('canplaythrough', audioOnCanPlayThrough)
  audio.value.removeEventListener('error', audioOnError)

  video.removeEventListener('loadedmetadata', videoOnLoadedMetaData)
  preloadVideo.removeEventListener('loadedmetadata', videoOnLoadedMetaData)

  video.style.display = 'none'
  preloadVideo.style.display = 'none'
})

defineExpose({ update, stop, setPreloadVideo })

</script>

<template>
  <div class="container">
    <video id="video" class="video" autoplay loop muted playsinline></video>
    <video id="preloadVideo" class="video" autoplay loop muted playsinline></video>
    <div ref="subtitleEnDiv" class="subtitleEn"></div>
    <div ref="subtitleDiv" class="subtitle"></div>
    <div ref="subtitleTestDiv" class="subtitleTest"></div>
    <audio ref="audio"></audio>
  </div>
</template>

<style scoped lang="less">

@font-face {
  font-family: 'Alibaba-Regular';
  src: url('../assets/fonts/Alibaba_PuHuiTi_2.0_55_Regular_55_Regular.ttf');
}

.container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  position: relative;
  background-color: rgba(0, 0, 0, 1);

  .image {
    display: block;
    width: auto;
    height: 100%;
  }

  .video {
    display: none;
    width: auto;
    height: 100%;
  }

  .subtitle {
    display: block;
    position: absolute;
    bottom: 50px;
    color: white;
    background-color: rgba(0, 0, 0, 0.5);

    font-size: 16px;
    font-weight: normal;
    font-family: Alibaba-Regular, sans-serif;

    text-align: center;
    padding: 10px;
    border-radius: 5px;
    overflow-wrap: break-word;
  }

  .subtitleEn {
    display: block;
    position: absolute;
    bottom: 100.391px;
    color: white;
    background-color: rgba(0, 0, 0, 0.5);

    font-size: 16px;
    font-weight: normal;
    font-family: Alibaba-Regular, sans-serif;

    text-align: center;
    padding: 10px;
    border-radius: 5px;
    overflow-wrap: break-word;
  }

  .subtitleTest {
    display: block;
    position: absolute;
    bottom: -2000px;
    color: white;
    background-color: rgba(0, 0, 0, 0);
    opacity: 0;

    font-size: 16px;
    font-weight: normal;
    font-family: Alibaba-Regular, sans-serif;

    text-align: center;
    padding: 10px;
    border-radius: 5px;
    overflow-wrap: break-word;
  }
}
</style>
