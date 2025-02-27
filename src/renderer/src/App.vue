<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { delay, eventbus, reload } from './scripts/Utils'
import { useRouter } from 'vue-router'
import { appConfig, setAppConfig } from './scripts/GlobalConfig'
import { wsAddress } from './scripts/Service'

const router = useRouter()
const routerViewDiv = ref<HTMLDivElement | null>(null)

const ws = shallowRef<WebSocket | null>(null)

const openNav = () => {
  console.log('openNav')
  // @ts-ignore
  window.api.openNav()
}

const closeNav = () => {
  console.log('closeNav')
  // @ts-ignore
  window.api.closeNav()
}

const openDevTools = () => {
  // @ts-ignore
  window.api.openDevTools()
}

const closeDevTools = () => {
  // @ts-ignore
  window.api.closeDevTools()
}

function enterFullScreen(): void {
  closeNav()
  // @ts-ignore
  window.api.setFullScreen(true)
}

function exitFullScreen(): void {
  openNav()
  // @ts-ignore
  window.api.setFullScreen(false)
}

async function keydownListener(e: KeyboardEvent) {
  e.preventDefault()

  if (e.key === 'F11') {
    // @ts-ignore
    const flag = await window.api.isFullScreen()
    // 如果当前处于全屏状态，则按下F11表示要退出全屏状态，否则表示要进入全屏状态
    if (flag) {
      exitFullScreen()
    } else {
      enterFullScreen()
    }
    reload()
  }
}

const onMessage = async (e: MessageEvent) => {
  ws.value.send('1')

  const data = JSON.parse(e.data)
  const objectName = data.object_name
  const prob = data.prob

  eventbus.emit('objectNameUpdate', {
    objectName: objectName,
    prob: prob
  })
}

onMounted(async () => {
  // 读取全局应用配置
  // @ts-ignore
  const cfg = await window.api.appConfig()
  setAppConfig(cfg)

  // console.log(appConfig())

  window.addEventListener('keydown', keydownListener)

  // @ts-ignore
  const flag = await window.api.isFullScreen()
  if (flag) {
    enterFullScreen()
  } else {
    exitFullScreen()
  }

  // @ts-ignore
  window.api.receiveMessage('switch', (data: string) => {
    router.push({ name: data })
  })

  eventbus.on('openDevTools', openDevTools)
  eventbus.on('closeDevTools', closeDevTools)
  eventbus.on('openNav', openNav)
  eventbus.on('closeNav', closeNav)

  // 连接websocket
  connect()
})

const connect = () => {
  ws.value = new WebSocket(wsAddress('/ws'))
  console.log('ws connect connecting...')

  ws.value.onopen = () => {
    console.log('ws connected.')
  }
  ws.value.onmessage = onMessage
  ws.value.onerror = (e) => {
    console.log('ws error, reconnecting.')
    console.log(e)
    ws.value = null
    reconnect()
  }
  ws.value.onclose = () => {
    console.log('ws closed, reconnecting.')
    ws.value = null
    reconnect()
  }
}

const reconnect = async () => {
  while (ws.value === null || ws.value.readyState !== WebSocket.OPEN) {
    if (ws.value === null) {
      connect()
    }
    // 每5秒重试一次
    await delay(5)
  }
}

onBeforeUnmount(() => {
  eventbus.off('openDevTools', openDevTools)
  eventbus.off('closeDevTools', closeDevTools)
  eventbus.off('openNav', openNav)
  eventbus.off('closeNav', closeNav)
})
</script>

<template>
  <div ref="routerViewDiv" class="router-view">
    <router-view></router-view>
  </div>
</template>

<style lang="less" scoped>

.router-view {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
