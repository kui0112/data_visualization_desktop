<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as service from '../scripts/Service'
import { useRouter } from 'vue-router'
import { delay, Segment, clamp } from '../scripts/Utils'
import Video from './Video.vue'
import Mask from '../components/Mask.vue'

const router = useRouter()
const container = ref<HTMLDivElement | null>(null)
const picture = ref<any>(null)

let ws: WebSocket | null = null
let currentObjectName: string = 'nothing'
let animationLoop: AnimationLoop | null = null
let mask: HTMLElement | null = null

const reload = () => {
  // @ts-ignore
  window.api.reloadSilently()
}

class AnimationLoop {
  segments: Array<Segment>
  cursor: number
  animationId: number

  constructor(segments: Array<Segment>) {
    this.segments = segments
    this.cursor = 0
    this.animationId = 0
  }

  public async start() {
    this.animationId = Date.now()
    const currentAnimationId = this.animationId
    // let counter = 0
    while (currentAnimationId === this.animationId) {
      if (!this.segments.length || this.segments.length <= this.cursor) {
        return
      }

      const seg = this.segments[this.cursor]
      const preloadSeg = this.segments[(this.cursor + 1) % this.segments.length]

      picture?.value?.update(seg)
      setTimeout(() => {
        if (currentAnimationId === this.animationId) {
          picture?.value?.setPreloadVideo(preloadSeg)
        }
      }, 1000)

      this.cursor = (this.cursor + 1) % this.segments.length
      await delay(seg.aliveDuration)

      if (this.cursor === 0) {
        reload()
      }
    }
  }

  public stop() {
    this.animationId = Date.now()
    picture.value.stop()
  }
}

function setSegments(array: Array<Segment>) {
  if (animationLoop) {
    animationLoop.stop()
  }

  const filteredArray = new Array<Segment>()

  // 根据每个segment的字数，计算 aliveDuration 和 animInterval
  for (const seg of array) {
    if (!seg.video) continue

    const subtitle = seg.subtitle
    let stayTime = 0

    const lineCount = Math.floor(subtitle.length / 27)
    switch (lineCount) {
      case 0:
        stayTime = 5
        break
      case 1:
        stayTime = 6
        break
      case 2:
        stayTime = 7
        break
      case 3:
        stayTime = 7
        break
      default:
        stayTime = 7
        break
    }
    const interval = clamp(4 / subtitle.length, 0.2, 0.25)
    seg.aliveDuration = interval * subtitle.length + stayTime
    seg.animInterval = interval

    filteredArray.push(seg)
  }

  animationLoop = new AnimationLoop(array)
  animationLoop.start()
}

const onMessage = async (e: MessageEvent) => {
  if (router.currentRoute.value.name !== 'Pictures') {
    return
  }

  const data = JSON.parse(e.data)
  const object_name = data.object_name
  if (!object_name) {
    console.log('error: null result from websocket.')
    return
  }
  if (object_name === currentObjectName) {
    setTimeout(() => {
      ws.send('1')
    }, 1.0 + Math.random() * 0.5)
    return
  } else {
    currentObjectName = object_name

    if (object_name === 'nothing') {
      mask.style.display = 'block'
      animationLoop?.stop()
      return
    }
    const res = await service.pictures(currentObjectName)
    setSegments(res.content)
    mask.style.display = 'none'
  }
}

onMounted(async () => {
  mask = document.getElementById('picturesMask')

  service.connect().then((res) => {
    ws = res
    if (ws) {
      ws.onopen = async () => {
        console.log('ws opened.')
      }
      ws.onmessage = onMessage
      ws.onerror = () => {
        // try {
        //   ws.close()
        // } catch (err) {
        //   console.log(err)
        // }
        reload()
      }
      ws.onclose = async () => {
        // ws = await service.connect()
        reload()
      }
    }
  })
  const res1 = await service.currentObjectName()
  currentObjectName = res1.content
  if (!currentObjectName) {
    console.log('error: null result from http.')
    return
  }
  if (currentObjectName === 'nothing') {
    mask.style.display = 'block'
    animationLoop?.stop()
    return
  }

  mask.style.display = 'none'
  const res2 = await service.pictures(currentObjectName)
  if (res2.content) {
    setSegments(res2.content)
  }
})

onBeforeUnmount(async () => {
  if (animationLoop) {
    animationLoop.stop()
  }
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.close()
  }
})
</script>

<template>
  <div class="pictures" ref="container">
    <Mask id="picturesMask"></Mask>
    <Video ref="picture"></Video>
  </div>
</template>

<style scoped lang="less">
@font-face {
  font-family: 'Alibaba-Bold';
  src: url('../assets/fonts/Alibaba_PuHuiTi_2.0_55_Regular_85_Bold.ttf');
}

.pictures {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  position: relative;
  background-color: rgba(0, 0, 0, 1);

  .container {
    position: absolute;

    .mask {
      position: absolute;
    }
  }
}
</style>
