<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as service from '../scripts/Service'
import { useRouter } from 'vue-router'

const router = useRouter()
const videoNone = ref<HTMLVideoElement | null>(null)

let ws: WebSocket | null = null

const onMessage = async (e: MessageEvent) => {
  if (router.currentRoute.value.name !== 'CameraView') {
    return
  }
  const data = JSON.parse(e.data)
  const object_name = data.object_name
  const prob = data.prob
  if (!object_name) {
    console.log('error: null result from websocket.')
    return
  }
  if (prob && prob > 0.5) {
    console.log(`prob: ${prob}`)
  }
}

onMounted(async () => {
  service.ws_connect().then((res) => {
    ws = res
    if (ws) {
      ws.onopen = async () => {
        console.log('ws connected.')
      }
      ws.onmessage = onMessage
    }
  })

  const devices = await navigator.mediaDevices.enumerateDevices()
  let virtualCameraDevice: MediaDeviceInfo | null = null

  for (const device of devices) {
    console.log(device.label)
    if (device.label.trim() == 'OBS Virtual Camera') {
      virtualCameraDevice = device
    }
  }
  navigator.mediaDevices.getUserMedia({
    video: {
      deviceId: { exact: virtualCameraDevice.deviceId }
    },
    audio: false
  }).then((stream) => {
    videoNone.value.srcObject = stream
    videoNone.value.onloadedmetadata = () => {
      videoNone.value.play()
    }
  }).catch(() => {
    console.log('can not visit camera.')
  })

  if (!virtualCameraDevice) {
    console.log('can not find OBS Virtual Camera')
    return
  }
})

onBeforeUnmount(() => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.close()
  }
})

</script>

<template>
  <div class="container">
    <video class="videoNone" ref="videoNone"></video>
  </div>
</template>

<style scoped lang="less">

.container {
  width: 100%;
  height: 100%;

  .videoNone {
    width: 100%;
    height: 100%;
  }
}

</style>
