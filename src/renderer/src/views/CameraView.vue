<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { eventbus, reload } from '../scripts/Utils'

const router = useRouter()
const videoNone = ref<HTMLVideoElement | null>(null)
const objectNameLabelName = ref<HTMLDivElement | null>(null)
const objectNameLabelProb = ref<HTMLDivElement | null>(null)
const objectNameLabelContainer = ref<HTMLDivElement | null>(null)

const objectNameUpdate = async (data: any) => {
  if (router.currentRoute.value.name !== 'CameraView') {
    return
  }

  const objectName = data.objectName
  const prob = data.prob

  if (prob && prob > 0.5 && objectName !== 'nothing') {
    if (objectNameLabelContainer.value) {
      const rect = videoNone.value.getBoundingClientRect()
      objectNameLabelContainer.value.style.left = rect.left + 'px'
      objectNameLabelContainer.value.style.width = rect.width + 'px'

      objectNameLabelContainer.value.style.display = 'flex'

      objectNameLabelName.value.innerHTML = `物品名: ${objectName}`
      objectNameLabelProb.value.innerHTML = `置信度: ${(prob * 100).toFixed(2)}%`
    }
  } else {
    if (objectNameLabelContainer.value) {
      objectNameLabelContainer.value.style.display = 'none'
    }
  }
}

onMounted(async () => {
  eventbus.on('objectNameUpdate', objectNameUpdate)

  setInterval(() => {
    reload()
  }, 1000 * 60 * 3)

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
  eventbus.off('objectNameUpdate', objectNameUpdate)
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
      color: black;

      font-size: 30px;
      font-weight: normal;
      font-family: Alibaba-Regular, sans-serif;

      text-align: center;
      padding: 10px;
      border-radius: 5px;
    }
  }
}

</style>
