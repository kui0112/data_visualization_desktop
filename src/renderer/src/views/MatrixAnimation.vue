<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { MatrixAnimation } from '../scripts/MatrixAnimation'
import * as service from '../scripts/Service'
import { useRouter } from 'vue-router'
import Mask from '../components/Mask.vue'
import { appConfig } from '../scripts/GlobalConfig'
import { eventbus, reload } from '../scripts/Utils'

const router = useRouter()
const canvas = ref<HTMLCanvasElement | null>(null)
const animation = new MatrixAnimation()
const cfg = appConfig()

let currentObjectName: string = 'nothing'
let mask: HTMLElement | null = null

const objectNameUpdate = async (data: any) => {
  if (router.currentRoute.value.name !== 'VectorAnimation') {
    return
  }
  if (data.objectName !== currentObjectName) {
    reload()
  }
}

onMounted(async () => {
  eventbus.on('objectNameUpdate', objectNameUpdate)

  mask = document.getElementById('matrixAnimationMask')
  animation.initialize(canvas.value)

  currentObjectName = (await service.currentObjectName()).content
  if (!currentObjectName) {
    console.log('error: null result from http.')
    mask.style.display = 'block'
    return
  }

  if (currentObjectName == 'nothing') {
    mask.style.display = 'block'
    return
  } else {
    mask.style.display = 'none'
  }

  const vectorsData = await service.vectors(currentObjectName)
  animation.updateVectors(vectorsData.content)
  animation.start()
})

onBeforeUnmount(() => {
  eventbus.off('objectNameUpdate', objectNameUpdate)
})

</script>

<template>
  <div class="canvasParent">
    <Mask id="matrixAnimationMask"></Mask>
    <canvas class="canvas" ref="canvas"></canvas>
  </div>
</template>

<style scoped lang="less">
.canvasParent {
  width: 100%;
  height: 100%;
  padding: 0;
}

.canvas {
  width: 100%;
  height: 100%;
  display: block;
  margin: 0;
}
</style>
