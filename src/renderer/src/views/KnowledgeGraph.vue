<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import * as service from '../scripts/Service'
import { useRouter } from 'vue-router'
import { PresetMixedNodeOptions } from '../scripts/PresetNodeOptions'
import { PresetEdgeOptions } from '../scripts/PresetEdgeOptions'
import { PresetForceLayoutOptions } from '../scripts/PresetLayoutOptions'
import { NewGraph } from '../scripts/NewGraph'
import { appConfig } from '../scripts/GlobalConfig'
import Mask from '../components/Mask.vue'
import { MixedNode } from '../scripts/MixedNode'
import { ExtensionCategory, register } from '@antv/g6'
import { ExtendedForceLayout } from '../scripts/ExtendedForceLayout'
import { eventbus, reload } from '../scripts/Utils'

register(ExtensionCategory.NODE, 'mixed-node', MixedNode)
register(ExtensionCategory.LAYOUT, 'extended-force', ExtendedForceLayout)

const cfg = appConfig()
const router = useRouter()

let knowledgeGraph: NewGraph | null = null
let currentObjectName: string = 'nothing'
let mask: HTMLElement | null = null

const objectNameUpdate = async (data: any) => {
  if (router.currentRoute.value.name !== 'KnowledgeGraph') {
    return
  }
  if (data.objectName !== currentObjectName) {
    reload()
  }
}

onMounted(async () => {
  eventbus.on('objectNameUpdate', objectNameUpdate)

  mask = document.getElementById('knowledgeGraphMask')!

  currentObjectName = (await service.currentObjectName()).content
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

  const knowledgeGraphData = await service.knowledgeGraphEx(currentObjectName)
  const content = knowledgeGraphData?.content

  const images = new Map(Object.entries(content.data.image))
  for (const [key, value] of images) {
    images.set(key, service.apiAddress(value as string))
  }

  if (!content?.data) {
    console.log('null result from server.')
    reload()
  }

  let currentDisplay = parseInt(localStorage.getItem('knowledgeGraph:current_display') || '0', 10)

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
    background: cfg.KnowledgeGraphConfig.darkMode ? '#000000' : '#ffffff',

    // 图数据
    data: content.data.shape,
    // 中文
    data_zh: new Map(Object.entries(content.data.zh)),
    // 英文
    data_en: new Map(Object.entries(content.data.en)),
    // 图片
    data_image: images,
    // 节点类型按层级的分布顺序
    display_order: cfg.KnowledgeGraphConfig.displayOrder,
    // 持续时间
    display_duration: cfg.KnowledgeGraphConfig.displayDuration,
    // 当前播放内容
    current_display: currentDisplay,

    // 节点配置
    node: PresetMixedNodeOptions,
    // 边配置
    edge: PresetEdgeOptions(),
    // 布局配置
    layout: PresetForceLayoutOptions(),
    // 交互行为配置
    behaviors: []
  })

  Promise.race([knowledgeGraph.render(), knowledgeGraph.animation()]).then(() => {
    localStorage.setItem('knowledgeGraph:current_display', (currentDisplay + 1).toString())
    reload()
  })
})

onBeforeUnmount(async () => {
  eventbus.off('objectNameUpdate', objectNameUpdate)
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
