import type { DisplayObjectConfig, CircleStyleProps as GCircleStyleProps, Group } from '@antv/g'
import { BaseNode, BaseNodeStyleProps, EdgeData } from '@antv/g6'
import { mergeOptions } from '@antv/g6/lib/utils/style'
import { IconStyleProps } from '@antv/g6'
import { ICON_SIZE_RATIO } from '@antv/g6/lib/constants/element'
import { Point } from '@antv/g6/lib/types'
import { getEllipseIntersectPoint } from '@antv/g6/src/utils/point'
import { Circle as GCircle } from '@antv/g'
import { Image as GImage, ImageStyleProps as GImageStyleProps } from '@antv/g'
import { subStyleProps } from '@antv/g6'
import type { NodeLabelStyleProps } from '@antv/g6'

import { getTextStyleByPlacement } from '@antv/g6/lib/utils/element'
import { getWordWrapWidthByBox } from '@antv/g6/lib/utils/text'
import { NewGraph } from './NewGraph'

export interface MixedNodeStyleProps extends BaseNodeStyleProps {
  // 图片来源，即图片地址字符串
  img?: string | HTMLImageElement;
  // 该属性为 img 的别名
  src?: string | HTMLImageElement;
}

export class MixedNode extends BaseNode {
  static defaultStyleProps: Partial<MixedNodeStyleProps> = {
    size: 32
  }

  public level: number = 0
  public keyOpacity: number = 0
  public imageOpacity: number = 0
  public lastKeyOpacity: number = 0
  public lastImageOpacity: number = 0

  public emergeStep: number = 0.01
  public disappearStep: number = 0.02

  public initialized: boolean = false
  public disappear: boolean = false
  public imageMode: boolean = false
  public emergeEnd: boolean = false
  public leafOpacityIncreaseFlag: number = 1
  public maxLevelThisGraph: number = 0
  public isLeaf: boolean = false
  public leafOpacityUpdate: boolean = true

  public currentEmergeLevel: number = 0
  public currentDisappearLevel: number = 0

  public targetEdges: Array<EdgeData> = null
  public sourceEdges: Array<EdgeData> = null

  public constructor(options: DisplayObjectConfig<MixedNodeStyleProps>) {
    console.log('node created.')
    super(mergeOptions({ style: MixedNode.defaultStyleProps }, options))

    options.style.opacity = 0
    options.style.labelOpacity = 0

    const arr = this.context.model.getNodeData([this.id])
    const data = arr[0]

    this.keyOpacity = 0
    this.imageOpacity = 0
    this.lastKeyOpacity = 0
    this.lastImageOpacity = 0
    this.disappear = false
    this.imageMode = false
    this.emergeEnd = false
    this.level = data.data.level as number
    this.initialized = false
    this.currentEmergeLevel = 0
    this.currentDisappearLevel = 0
    this.maxLevelThisGraph = (this.context.graph as NewGraph).maxLevel
    this.isLeaf = data.data.type === 'leaf'
    this.leafOpacityUpdate = true

    this.context.graph.on('NewGraph:Initialize', () => {
      this.keyOpacity = 0
      this.imageOpacity = 0
      this.disappear = false
      this.imageMode = false
      this.emergeEnd = false
    })
    this.context.graph.on('NewGraph:EnterTextState', () => {
      if (this.disappear) return
      if (this.imageMode) {
        this.imageOpacity = 0
        this.keyOpacity = 0
        this.emergeEnd = false
      }
      this.imageMode = false
    })
    this.context.graph.on('NewGraph:EnterImageState', () => {
      if (this.disappear) return
      if (!this.imageMode) {
        this.imageOpacity = 0
        this.keyOpacity = 0
        this.emergeEnd = false
      }
      this.imageMode = true
    })
    this.context.graph.on('NewGraph:Disappear', () => {
      this.disappear = true
    })
    this.context.graph.on('NewGraph:EmergeLevelUpdate', (e) => {
      this.currentEmergeLevel = e as unknown as number
    })
    this.context.graph.on('NewGraph:DisappearLevelUpdate', (e) => {
      this.currentDisappearLevel = e as unknown as number
    })
    this.context.graph.on('MixedNode:emergeEnd', () => {
      if (this.isLeaf) {
        this.emergeEnd = true
      }
    })

    // 缓存边
    this.targetEdges = new Array<EdgeData>()
    this.sourceEdges = new Array<EdgeData>()
    for (const edge of this.context.graph.getEdgeData()) {
      if (edge.target === this.id) {
        this.targetEdges.push(edge)
      }
      if (edge.source === this.id) {
        this.sourceEdges.push(edge)
      }
    }
  }

  protected drawKeyShape(attributes: Required<MixedNodeStyleProps>, container: Group) {
    return this.upsert('key', GCircle, this.getKeyStyle(attributes), container)
  }

  protected getKeyStyle(attributes: Required<MixedNodeStyleProps>): GCircleStyleProps {
    if (typeof this.initialized === 'undefined') {
      const keyStyle = super.getKeyStyle(attributes)
      return { ...keyStyle, opacity: 0, r: 0 }
    }

    let opacity = 0
    let r = 0
    if (this.imageMode) {
      opacity = 0
      r = 16
    } else {
      opacity = this.keyOpacity
      r = Math.min(...this.getSize(attributes)) / 2
    }
    const keyStyle = super.getKeyStyle(attributes)
    return { ...keyStyle, opacity: opacity, r: r }
  }

  protected getIconStyle(attributes: Required<MixedNodeStyleProps>): false | IconStyleProps {
    const style = super.getIconStyle(attributes)
    const { r } = this.getShape<GCircle>('key').attributes
    const size = (r as number) * 2 * ICON_SIZE_RATIO
    return style ? ({ width: size, height: size, ...style } as IconStyleProps) : false
  }

  public getIntersectPoint(point: Point): Point {
    const keyShapeBounds = this.getShape('key').getBounds()
    return getEllipseIntersectPoint(point, keyShapeBounds)
  }

  public getImageStyle(attributes: Required<MixedNodeStyleProps>): GImageStyleProps {
    if (typeof this.initialized === 'undefined') {
      const [width, height] = [48, 48]
      return {
        ...super.getKeyStyle(attributes),
        opacity: 0,
        width: width,
        height: height,
        x: -width / 2,
        y: -height / 2
      }
    }

    let opacity = 0
    if (!this.imageMode) {
      opacity = 0
    } else {
      opacity = this.imageOpacity
    }

    const [width, height] = [48, 48]
    return {
      ...super.getKeyStyle(attributes),
      opacity: opacity,
      width: width,
      height: height,
      x: -width / 2,
      y: -height / 2
    }
  }

  protected getLabelStyle(attributes: Required<MixedNodeStyleProps>): false | NodeLabelStyleProps {
    if (attributes.label === false || !attributes.labelText) return false
    if (!this.initialized) {
      return {
        placement: 'center',
        maxWidth: 10,
        offsetX: 0,
        offsetY: 0,
        text: '',
        opacity: 0
      }
    }

    let opacity = 0
    if (this.imageMode || typeof this.initialized === 'undefined') {
      opacity = 0
    } else {
      opacity = this.keyOpacity
    }

    const {
      placement,
      maxWidth,
      offsetX,
      offsetY,
      ...labelStyle
    } = subStyleProps<Required<NodeLabelStyleProps>>(this.getGraphicStyle(attributes), 'label')
    labelStyle.opacity = opacity
    const keyBounds = this.getShape('key').getLocalBounds()
    return Object.assign(
      getTextStyleByPlacement(keyBounds, placement, offsetX, offsetY),
      { wordWrapWidth: getWordWrapWidthByBox(keyBounds, maxWidth) },
      labelStyle
    )
  }

  public drawImageShape(attributes: Required<Required<MixedNodeStyleProps>>, container?: Group) {
    return this.upsert('image', GImage, this.getImageStyle(attributes), container)
  }

  public updateOpacity() {
    // 文字模式
    if (!this.imageMode) {
      if (this.disappear) {
        if (this.currentDisappearLevel >= this.level && this.keyOpacity > 0) {
          this.keyOpacity -= this.disappearStep
          if (this.keyOpacity < 0) {
            this.keyOpacity = 0
          }
        }
      } else {
        if (this.currentEmergeLevel >= this.level && this.keyOpacity < 0.8 && !this.emergeEnd) {
          this.keyOpacity += this.emergeStep
          if (this.keyOpacity > 0.8) {
            this.keyOpacity = 0.8
            if (this.level === this.maxLevelThisGraph && !this.emergeEnd) {
              this.context.graph.emit('MixedNode:emergeEnd')
            }
          }
        }

        // 叶节点循环浮现、渐隐
        if (this.isLeaf && this.emergeEnd) {
          if (this.leafOpacityUpdate) {
            this.keyOpacity += (this.emergeStep * this.leafOpacityIncreaseFlag)
          }
          if (this.keyOpacity < 0) {
            this.keyOpacity = 0
            this.leafOpacityUpdate = false
            // console.log("keyOpacity = 0, leafOpacityUpdate = false")
            setTimeout(() => {
              this.leafOpacityIncreaseFlag = 1
              this.leafOpacityUpdate = true
              // console.log("leafOpacityUpdate = true")
            }, 0.2 * 1000)
          }
          if (this.keyOpacity > 0.8) {
            this.keyOpacity = 0.8
            this.leafOpacityUpdate = false
            // console.log("keyOpacity = 0.8, leafOpacityUpdate = false")
            setTimeout(() => {
              this.leafOpacityIncreaseFlag = -1
              this.leafOpacityUpdate = true
              // console.log("leafOpacityUpdate = true")
            }, 5.0 * 1000)
          }
        }
      }
    }

    // 图像模式
    if (this.imageMode) {
      if (this.disappear) {
        if (this.currentDisappearLevel >= this.level && this.imageOpacity > 0) {
          this.imageOpacity -= this.disappearStep
          if (this.imageOpacity < 0) {
            this.imageOpacity = 0
          }
        }
      } else {
        // if (this.currentEmergeLevel >= this.level && this.imageOpacity < 0.8 && !this.emergeEnd) {
        if (this.currentEmergeLevel >= this.level && this.imageOpacity < 0.8) {
          this.imageOpacity += this.emergeStep
          if (this.imageOpacity > 0.8) {
            this.imageOpacity = 0.8
            // if (this.level === this.maxLevelThisGraph && !this.emergeEnd) {
            //     this.context.graph.emit("MixedNode:emergeEnd")
            // }
          }
        }

        // 叶节点循环浮现、渐隐
        // if (this.isLeaf && this.emergeEnd) {
        //     if (this.leafOpacityUpdate) {
        //         this.imageOpacity += (this.emergeStep * this.leafOpacityIncreaseFlag)
        //     }
        //     if (this.imageOpacity < 0) {
        //         this.imageOpacity = 0
        //         this.leafOpacityUpdate = false
        //         setTimeout(() => {
        //             this.leafOpacityIncreaseFlag = 1
        //             this.leafOpacityUpdate = true
        //         }, 0.2 * 1000)
        //     }
        //     if (this.imageOpacity > 0.8) {
        //         this.imageOpacity = 0.8
        //         this.leafOpacityUpdate = false
        //         setTimeout(() => {
        //             this.leafOpacityIncreaseFlag = -1
        //             this.leafOpacityUpdate = true
        //         }, 0.2 * 1000)
        //     }
        // }

      }
    }

    if (this.disappear) {
      // 设置边的透明度
      for (const edge of this.sourceEdges) {
        edge.style.opacity = this.imageMode ? this.imageOpacity : this.keyOpacity
      }
    } else {
      // 设置边的透明度
      for (const edge of this.targetEdges) {
        edge.style.opacity = this.imageMode ? this.imageOpacity : this.keyOpacity
      }
    }
  }

  public render(attributes?: Required<MixedNodeStyleProps>, container?: Group) {
    if (this.destroyed) {
      return
    }
    if (!this.initialized) {
      if (this.initialized === undefined) {
        return super.render(attributes, container)
      }
      if (this.initialized === false) {
        this.initialized = true
      }
    }

    this.updateOpacity()
    // 1. key shape
    if (this.lastKeyOpacity !== this.keyOpacity) {
      this.lastKeyOpacity = this.keyOpacity
      this.drawKeyShape(attributes, container)
      this.drawLabelShape(attributes, container)
    }
    // 2. image
    if (this.lastImageOpacity !== this.imageOpacity) {
      this.lastImageOpacity = this.imageOpacity
      this.drawImageShape(attributes, container)
    }
  }

  destroy() {
    this.targetEdges = null
    this.sourceEdges = null
    super.destroy()
  }
}