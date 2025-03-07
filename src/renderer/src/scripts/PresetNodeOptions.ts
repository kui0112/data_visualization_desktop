import chroma from 'chroma-js'
import { NodeOptions, NodeData } from '@antv/g6'
import { appConfig } from './GlobalConfig'

function dynamicNodeSize(node: NodeData): number {
  let size = 10
  let level = node.data.level as number
  switch (level) {
    case 0:
      size = 150
      break
    case 1:
      size = 55
      break
    case 2:
      size = 30
      break
    case 3:
      size = 20
      break
    default:
      break
  }
  return size
}

function dynamicNodeLineWidth(node: NodeData): number {
  if (appConfig().KnowledgeGraphConfig.darkMode) {
    return 0.04 * ((node.data.level as number + 1) * 0.5) * dynamicNodeSize(node)
  }
  return 0.02 * ((node.data.level as number + 1) * 0.5) * dynamicNodeSize(node)
}

function dynamicNodeColor(node: NodeData): string {
  let colors = ['#eaf2ff', '#90aeff', '#5187fb']
  if (appConfig().KnowledgeGraphConfig.darkMode) {
    return '#ffffff'
  }
  let i = node.data.level as number
  if (i > colors.length - 1) {
    i = colors.length - 1
  }
  return colors[i]
}

function dynamicNodeLineColor(node: NodeData): string {
  if (appConfig().KnowledgeGraphConfig.darkMode) {
    let color = dynamicNodeColor(node)
    return chroma(color).darken(1).hex()
  }

  if (node.data.level === 0) {
    return '#90aeff'
  }
  let color = dynamicNodeColor(node)
  return chroma(color).darken(1).hex()
}

function dynamicLabelText(node: NodeData): string {
  if (!node.data?.text) {
    return ''
  }
  // if (node.data && node.data.isEN && node.data.level === 0 && !node.data.modified) {
  //   let str = node.data.text as string
  //   if (str.length > 8) {
  //     let index = Math.floor(str.length / 2)
  //     node.data.text = str.slice(0, index) + '\n\n' + str.slice(index)
  //     node.data.modified = true
  //   }
  // }
  return node.data.text as string
}

function dynamicLabelFontSize(node: NodeData): number {
  const level = node.data.level as number
  if (level === 0) {
    return 35
  }
  if (level === 1) {
    const text = dynamicLabelText(node)
    if (text.length === 2) {
      return 18
    }
  }
  return 12
}

function dynamicLabelOffsetY(node: NodeData) {
  const level = node.data.level as number
  const fontSize = dynamicLabelFontSize(node)
  if (dynamicLabelTextAlign(node) === 'center') {
    if (level === 0) {
      return fontSize * 0.4
    }
    const text = dynamicLabelText(node)
    if (level === 1 && text.length <= 2) {
      return fontSize * 0.25
    }
    if (level >= 2) {
      return fontSize * 0.1
    }
  }

  return 0
}

function dynamicLabelFill(node: NodeData): string {
  if (appConfig().KnowledgeGraphConfig.darkMode) {
    if (dynamicLabelTextAlign(node) === 'center') {
      return '#000000'
    }

    return '#ffffff'
  }
  return '#000000'
}

function dynamicLabelPlacement(node: NodeData) {
  if (node.data.level === 0) {
    return 'center'
  }
  const text = dynamicLabelText(node)
  if (text.length === 1) {
    return 'center'
  }
  const nodeSize = dynamicNodeSize(node)
  const fontSize = dynamicLabelFontSize(node)
  if (text.length * fontSize < nodeSize) {
    return 'center'
  }

  return 'right'
}

function dynamicLabelTextAlign(node: NodeData) {
  const placement = dynamicLabelPlacement(node)
  if (placement === 'right') {
    return 'left'
  }
  return 'center'
}

export const PresetMixedNodeOptions: NodeOptions = {
  type: 'mixed-node',
  style: {
    size: dynamicNodeSize,
    fill: dynamicNodeColor,

    labelText: dynamicLabelText,
    labelTextAlign: dynamicLabelTextAlign,
    labelPlacement: dynamicLabelPlacement,
    labelOffsetY: dynamicLabelOffsetY,
    labelMaxWidth: 200,
    labelFill: dynamicLabelFill,
    labelBackground: false,
    labelFontSize: dynamicLabelFontSize,
    stroke: dynamicNodeLineColor,
    lineWidth: dynamicNodeLineWidth,
    src: (node: NodeData) => node.data.src,

    droppable: false,
    draggable: false,

    opacity: 0,
    labelOpacity: 0
  }
}
