<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as service from '../scripts/Service'
import { useRouter } from 'vue-router'
import { delay, eventbus, reload, Segment } from '../scripts/Utils'
import Video from './Video.vue'
import Mask from '../components/Mask.vue'
import { appConfig } from '../scripts/GlobalConfig'

const cfg = appConfig()

const router = useRouter()
const container = ref<HTMLDivElement | null>(null)
const picture = ref<any>(null)

let currentObjectName: string = 'nothing'
let animationLoop: AnimationLoop | null = null
let mask: HTMLElement | null = null

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

    while (currentAnimationId === this.animationId) {
      if (!this.segments.length || this.segments.length <= this.cursor) {
        return
      }

      const seg = this.segments[this.cursor]
      const preloadSeg = this.segments[(this.cursor + 1) % this.segments.length]

      const characterCountCondition = cfg.PicturesConfig.characterCountCondition

      let stayTime = cfg.PicturesConfig.stayTime
      let stayTimePercent = cfg.PicturesConfig.stayTimePercent
      let animInterval = cfg.PicturesConfig.subtitleAnimInterval

      if (seg.subtitle.length > characterCountCondition) {
        stayTime = cfg.PicturesConfig.stayTime2
        stayTimePercent = cfg.PicturesConfig.stayTime2Percent
        animInterval = cfg.PicturesConfig.subtitleAnimInterval2
      }

      picture.value.update(seg, animInterval)
      // 预加载下一个视频
      setTimeout(() => {
        if (currentAnimationId === this.animationId) {
          picture.value.setPreloadVideo(preloadSeg)
        }
      }, 1000)

      this.cursor = (this.cursor + 1) % this.segments.length

      const animTime = seg.subtitle.length * animInterval
      // 此处不能直接写表达式计算，有未知bug，会出现如下情况：
      // stayTime(2) + animTime(7.5)*stayTimePercent(0.7) = delayTime(25.25)
      //
      const delayTime = eval(`${animTime} + ${stayTime} + ${animTime} * ${stayTimePercent}`)
      // console.log(`delayTime=${delayTime}`)
      await delay(delayTime)

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
    filteredArray.push(seg)
  }

  animationLoop = new AnimationLoop(array)
  animationLoop.start()
}

const objectNameUpdate = async (data: any) => {
  if (router.currentRoute.value.name !== 'Pictures') {
    return
  }
  if (data.objectName !== currentObjectName) {
    reload()
  }
}

onMounted(async () => {
  eventbus.on('objectNameUpdate', objectNameUpdate)
  mask = document.getElementById('picturesMask')

  currentObjectName = (await service.currentObjectName()).content
  if (!currentObjectName) {
    console.log('error: null result from server.')
    mask.style.display = 'block'
    animationLoop?.stop()
    return
  }
  if (currentObjectName === 'nothing') {
    mask.style.display = 'block'
    animationLoop?.stop()
    return
  }

  mask.style.display = 'none'
  const picturesData = await service.pictures(currentObjectName)
  if (picturesData.content) {
    setSegments(picturesData.content)
  }
})

onBeforeUnmount(async () => {
  if (animationLoop) {
    animationLoop.stop()
  }
  eventbus.off('objectNameUpdate', objectNameUpdate)
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
  display: block;
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
