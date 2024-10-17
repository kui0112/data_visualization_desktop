<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { MatrixAnimation } from '../scripts/MatrixAnimation'
import * as service from '../scripts/Service'
import { useRouter } from 'vue-router'
import Mask from '../components/Mask.vue'

const router = useRouter()
const canvas = ref<HTMLCanvasElement | null>(null)
const animation = new MatrixAnimation()

let ws: WebSocket | null = null
let currentObjectName: string = 'nothing'
let mask: HTMLElement | null = null

const onMessage = async (e: MessageEvent) => {
  if (router.currentRoute.value.name !== 'VectorAnimation') {
    return
  }

  const data = JSON.parse(e.data)
  const object_name = data.object_name
  if (!object_name) {
    console.log('error: null result from websocket.')
    return
  }

  if (object_name === currentObjectName) {
    ws.send('1')
    return
  } else {
    if (object_name === 'nothing') {
      currentObjectName = ''
      mask.style.display = 'block'
      return
    }

    currentObjectName = object_name
    mask.style.display = 'none'
    const res = await service.vectors(currentObjectName)
    await animation.updateVectors(res.content)
    await animation.start()
  }
}

onMounted(async () => {
  mask = document.getElementById('matrixAnimationMask')
  animation.initialize(canvas.value)

  service.ws_connect().then((res) => {
    ws = res
    if (ws) {
      ws.onopen = async (_: MessageEvent) => {
        console.log('ws connected.')
      }
      ws.onmessage = onMessage
      ws.onerror = () => location.reload()
    }
  })
  const res1 = await service.currentObjectName()
  currentObjectName = res1.content
  if (!currentObjectName) {
    console.log('error: null result from http.')
    return
  }

  if (currentObjectName == 'nothing') {
    mask.style.display = 'block'
    return
  } else {
    mask.style.display = 'none'
  }

  const res2 = await service.vectors(currentObjectName)
  animation.updateVectors(res2.content)
  animation.start()
})

onBeforeUnmount(() => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.close()
  }
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
