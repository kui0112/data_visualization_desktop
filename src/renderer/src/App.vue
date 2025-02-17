<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { eventbus } from './scripts/EventBus'
import { useRouter } from 'vue-router'
import { setAppConfig } from './scripts/GlobalConfig'

const router = useRouter()

const routerViewDiv = ref<HTMLDivElement | null>(null)

const reload = () => {
  // @ts-ignore
  window.api.reloadSilently()
}

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

onMounted(async () => {
  // 读取全局应用配置
  // @ts-ignore
  const cfg = await window.api.appConfig()
  setAppConfig(cfg)

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
})

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
