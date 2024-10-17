<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import * as service from '../scripts/Service'
import { useRouter } from 'vue-router'
import { PresetMixedNodeOptions } from '../scripts/PresetNodeOptions'
import { PresetEdgeOptions } from '../scripts/PresetEdgeOptions'
import { PresetForceLayoutOptions } from '../scripts/PresetLayoutOptions'
import { NewGraph } from '../scripts/NewGraph'
import * as settings from '../scripts/GlobalSettings'
import { randomChoice } from '../scripts/Utils'
import Mask from '../components/Mask.vue'

const reload = () => {
  // location.reload()
  // @ts-ignore
  window.api.reloadSilently()
}
const router = useRouter()

let knowledgeGraph: NewGraph | null = null
let ws: WebSocket | null = null
let currentObjectName: string = 'nothing'
let mask: HTMLElement | null = null

const onMessage = async (e: MessageEvent) => {
  if (router.currentRoute.value.name !== 'KnowledgeGraph') {
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
    reload()
  }
}

onMounted(async () => {
  mask = document.getElementById('knowledgeGraphMask')!

  service.connect().then((res) => {
    ws = res
    if (ws) {
      ws.onopen = async (_: MessageEvent) => {
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
  if (currentObjectName == 'nothing') {
    mask.style.display = 'block'
    return
  } else {
    mask.style.display = 'none'
  }

  const res2 = await service.knowledgeGraph(currentObjectName)
  const content = res2.content
  if (content?.data && content?.images?.length > 0) {
    const images: Array<string> = []
    for (const image of content.images) {
      images.push(service.apiAddress(image))
    }

    knowledgeGraph = new NewGraph({
      // 指定容器元素
      container: document.getElementById('knowledgeGraphMountNode'),
      // 自动调整画布大小
      autoResize: false,
      // 画布内边距
      padding: 0,
      // 启用全局动画
      animation: false,
      // 背景颜色
      background: settings.dark ? '#000000' : '#ffffff',
      // 动态图片数据源
      dynamicImageSource: () => randomChoice(images),
      // 数据
      data: content.data,
      // 节点配置
      node: PresetMixedNodeOptions,
      // 边配置
      edge: PresetEdgeOptions,
      // 布局配置
      layout: PresetForceLayoutOptions,
      // 交互行为配置
      behaviors: []
    })

    await Promise.race([knowledgeGraph.render(), knowledgeGraph.animation()])
    reload()
  }
})

onBeforeUnmount(async () => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.close()
  }
  knowledgeGraph?.destroy()
})
</script>

<template>
  <div class="mountNodeParent">
    <Mask id="knowledgeGraphMask"></Mask>
    <div id="knowledgeGraphMountNode" class="mountNode"></div>
  </div>
</template>

<style lang="less" scoped>
.mountNodeParent {
  width: 100%;
  height: 100%;
  padding: 0;
}

.mountNode {
  width: 100%;
  height: 100%;
}
</style>
