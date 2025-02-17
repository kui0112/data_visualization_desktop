<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { delay, eventbus, Segment } from '../scripts/Utils'
import { apiAddress } from '../scripts/Service'

const image = ref<HTMLImageElement | null>(null)
const video = ref<HTMLVideoElement | null>(null)
const subtitleDiv = ref<HTMLDivElement | null>(null)
const subtitleEnDiv = ref<HTMLDivElement | null>(null)
const spinningDiv = ref<HTMLDivElement | null>(null)
const audio = ref<HTMLAudioElement | null>(null)

let animationId: number = Date.now()
let subtitleMode: string = 'typewriter'
let contentMode: string = 'video'
let audioAvailable = false
let videoAvailable = false
let segmentId: number | null = null
let segment: Segment | null = null

function subtitleNoAnimation(subtitle: string, subtitleEn: string, maxWidth: number) {
  if (!subtitle || subtitle.length === 0) {
    return
  }

  subtitleDiv.value.style.maxWidth = `${maxWidth}px`
  subtitleDiv.value.textContent = subtitle

  subtitleEnDiv.value.style.maxWidth = `${maxWidth}px`
  subtitleEnDiv.value.textContent = subtitleEn
}

async function subtitleAnimation(subtitle: string, subtitleEn: string, maxWidth: number, animInterval: number) {
  const currentAnimationId = animationId
  if (!subtitle || subtitle.length === 0) {
    return
  }
  // console.log(subtitle)
  // console.log(subtitleEn)

  subtitleDiv.value.style.maxWidth = `${maxWidth}px`
  subtitleEnDiv.value.style.maxWidth = `${maxWidth}px`

  subtitleEnDiv.value.textContent = subtitleEn

  for (let i = 0; i < subtitle.length; i++) {
    if (currentAnimationId !== animationId) return

    if (subtitleDiv?.value) {
      subtitleDiv.value.textContent = subtitle.slice(0, i + 1)
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

function showSpinning() {
  spinningDiv.value.style.display = 'block'

  subtitleDiv.value.style.display = 'none'
  subtitleEnDiv.value.style.display = 'none'
  image.value.style.display = 'none'
  video.value.style.display = 'none'
}

function showImage() {
  if (spinningDiv?.value?.style) {
    spinningDiv.value.style.display = 'none'
  }
  if (video?.value?.style) {
    video.value.style.display = 'none'
  }
  if (subtitleDiv?.value?.style) {
    subtitleDiv.value.style.display = 'block'
    subtitleEnDiv.value.style.display = 'block'
  }
  if (image?.value?.style) {
    image.value.style.display = 'block'
  }
}

function showVideo() {
  if (spinningDiv?.value?.style) {
    spinningDiv.value.style.display = 'none'
  }
  if (image?.value?.style) {
    image.value.style.display = 'none'
  }
  if (subtitleDiv?.value?.style) {
    subtitleDiv.value.style.display = 'block'
  }
  if (subtitleEnDiv?.value?.style) {
    subtitleEnDiv.value.style.display = 'block'
  }
  if (video?.value?.style) {
    video.value.style.display = 'block'
  }
}


function setVideo(e: HTMLVideoElement, s: string) {
  videoAvailable = false
  const currentSegmentId = segmentId
  return new Promise<void>(async (resolve, reject) => {
    if (e) {
      e.onerror = (err) => reject(err)
      e.src = apiAddress(s)
      e.load()
      while (!videoAvailable && currentSegmentId === segmentId) {
        await delay(0.02)
      }
      resolve()
    } else {
      reject('image element is null.')
    }
  })
}

function setImage(e: HTMLImageElement, s: string) {
  return new Promise<void>((resolve, reject) => {
    if (e) {
      e.onload = () => resolve()
      e.onerror = (err) => reject(err)
      e.src = apiAddress(s)
    } else {
      reject('image element is null.')
    }
  })
}

async function update(seg: Segment) {
  segment = seg
  segmentId = Date.now()

  if (!image?.value || !video?.value) return

  let maxWidth = 0

  if (contentMode === 'image' || (contentMode === 'mix' && Math.random() > 0.5)) {
    await setImage(image.value, seg.image)
    showImage()
    maxWidth = image.value.clientWidth
  } else {
    await setVideo(video.value, seg.video)
    showVideo()
    maxWidth = video.value.clientWidth
  }

  animationId = Date.now()
  if (subtitleMode === 'typewriter') {
    await subtitleAnimation(seg.subtitle, seg.subtitleEn, maxWidth, seg.animInterval)
  } else {
    subtitleNoAnimation(seg.subtitle, seg.subtitleEn, maxWidth)
  }
}

const subtitleModeHandler = (m: string) => {
  subtitleMode = m
  update(segment)
}
const contentModeHandler = (m: string) => {
  contentMode = m
  update(segment)
}

const audioOnCanPlayThrough = () => {
  audioAvailable = true
  console.log('audio loaded.')

  audio?.value?.removeEventListener('canplaythrough', audioOnCanPlayThrough)
}
const stopHandler = () => {
  animationId = Date.now()
  audio.value.pause()
}

const audioOnError = () => {
  audioAvailable = false
  console.log('audio load failed.')
}

const videoOnLoadedMetaData = () => {
  videoAvailable = true
}

onMounted(async () => {
  audioAvailable = false
  if (audio?.value) {
    audio.value.addEventListener('canplaythrough', audioOnCanPlayThrough)
    audio.value.addEventListener('error', audioOnError)
    audio.value.src = apiAddress('/static/tick.mp3')
    audio.value.load()
  }

  videoAvailable = false
  if (video?.value) {
    video.value.addEventListener('loadedmetadata', videoOnLoadedMetaData)
  }

  showSpinning()

  eventbus.on('Pictures:update', update)
  eventbus.on('Pictures:subtitleMode', subtitleModeHandler)
  eventbus.on('Pictures:contentMode', contentModeHandler)
  eventbus.on('Pictures:stop', stopHandler)
})
onBeforeUnmount(async () => {
  audio.value.removeEventListener('canplaythrough', audioOnCanPlayThrough)
  audio.value.removeEventListener('error', audioOnError)

  video.value.removeEventListener('loadedmetadata', videoOnLoadedMetaData)

  eventbus.off('Pictures:update', update)
  eventbus.off('Pictures:subtitleMode', subtitleModeHandler)
  eventbus.off('Pictures:contentMode', contentModeHandler)
  eventbus.off('Pictures:stop', stopHandler)
})

</script>

<template>
  <div class="container">
    <div ref="spinningDiv" class="spinning">
      <a-spin tip="Loading..." :spinning="true" size="large"></a-spin>
    </div>
    <img ref="image" alt="image" class="image" src="" />
    <video ref="video" class="video" autoplay loop muted playsinline></video>
    <div ref="subtitleEnDiv" class="subtitleEn"></div>
    <div ref="subtitleDiv" class="subtitle"></div>
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
    bottom: 3%;
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
    bottom: 10%;
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

  .spinning {
    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
