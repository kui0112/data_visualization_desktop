<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as service from '../scripts/Service'
import { useRouter } from 'vue-router'

const router = useRouter()
const videoNone = ref<HTMLVideoElement | null>(null)
const objectNameLabelName = ref<HTMLDivElement | null>(null)
const objectNameLabelProb = ref<HTMLDivElement | null>(null)
const objectNameLabelContainer = ref<HTMLDivElement | null>(null)

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
  if (prob && prob > 0.5 && object_name !== 'nothing') {
    console.log(`prob: ${prob}`)
    if (objectNameLabelContainer.value) {

      const rect = videoNone.value.getBoundingClientRect()
      // objectNameLabelContainer.value.style.top = rect.top + 'px'
      objectNameLabelContainer.value.style.left = rect.left + 'px'
      objectNameLabelContainer.value.style.width = rect.width + 'px'

      objectNameLabelContainer.value.style.display = 'flex'

      objectNameLabelName.value.innerText = `物品名: ${object_name}`
      objectNameLabelProb.value.innerText = `置信度: ${prob}`
    }
  } else {
    if (objectNameLabelContainer.value) {
      objectNameLabelContainer.value.style.display = 'none'
    }
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
      ws.onerror = () => location.reload()
    }
  })

  const devices = await navigator.mediaDevices.enumerateDevices()
  let virtualCameraDevice: MediaDeviceInfo | null = null

  for (const device of devices) {
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
    <div ref="objectNameLabelContainer" class="objectNameLabelContainer">
      <div ref="objectNameLabelName" class="objectNameLabel"></div>
      <div ref="objectNameLabelProb" class="objectNameLabel"></div>
    </div>
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

  .videoNone {
    width: 100%;
    height: 100%;
  }

  .objectNameLabelContainer {
    display: none;
    height: 50px;

    justify-content: center;
    position: absolute;
    top: 10%;
    left: 0;

    .objectNameLabel {
      display: block;
      height: 100%;

      //color: white;
      //background-color: rgba(0, 0, 0, 0.5);
      color: black;

      font-size: 30px;
      font-weight: normal;
      font-family: Alibaba-Regular, sans-serif;

      text-align: center;
      padding: 10px;
      border-radius: 5px;
      overflow-wrap: break-word;
    }
  }
}

</style>
