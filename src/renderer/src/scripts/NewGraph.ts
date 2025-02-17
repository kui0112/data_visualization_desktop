import { Graph } from '@antv/g6'
import type { GraphOptions } from '@antv/g6'
import { delay } from './Utils'

export interface NewGraphOptions extends GraphOptions {
  data_zh: Map<string, unknown>
  data_en: Map<string, unknown>
  data_image: Map<string, unknown>
  display_order: string
  display_duration: number
  current_display: number
}

export class NewGraph extends Graph {
  public maxLevel: number = 0
  public nodeTypes: Array<string> = []
  public displayDuration: number = 0

  constructor(options: NewGraphOptions) {
    // 创建父类对象
    super(options)

    // 持续时间
    this.displayDuration = options.display_duration

    // 获取最大层级
    this.maxLevel = this.getNodeData().map((node) => node.data.level as number).reduce((pre, cur) => Math.max(pre, cur))
    this.nodeTypes = options.display_order.split('_')

    // node初始化
    const currentType = this.nodeTypes[options.current_display % this.nodeTypes.length]
    for (const node of this.getNodeData()) {
      node.data.isZH = currentType === 'zh'
      node.data.isEN = currentType === 'en'
      node.data.isIMAGE = currentType === 'image'

      if (node.data.isZH) {
        node.data.text = options.data_zh.get(node.id) as string
      }
      if (node.data.isEN) {
        node.data.text = options.data_en.get(node.id) as string
      }
      if (node.data.isIMAGE) {
        node.data.src = options.data_image.get(node.id) as string
      }
    }

    // 将所有的边设置为透明
    for (const edge of this.getEdgeData()) {
      edge.style.opacity = 0
    }
  }

  public async render(): Promise<void> {
    return super.render()
  }

  public async animation(): Promise<void> {
    const emergeInterval = 3
    const disappearInterval = 0.8

    // 动画：节点逐层浮现
    for (let i = 0; i < this.maxLevel + 1; i++) {
      this.emit('NewGraph:EmergeLevelUpdate', i)
      await delay(emergeInterval)
    }

    // 节点主要动画
    await delay(this.displayDuration)

    // 动画：节点逐层消失
    this.emit('NewGraph:Disappear')
    for (let i = 0; i < this.maxLevel + 1; i++) {
      this.emit('NewGraph:DisappearLevelUpdate', i)
      await delay(disappearInterval)
    }
    await delay(3)
  }

  public destroy() {
    console.log('destroy Graph.')
    return super.destroy()
  }
}
