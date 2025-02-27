import { LayoutOptions } from '@antv/g6'
import { appConfig } from './GlobalConfig'

export const PresetForceLayoutOptions = (): LayoutOptions => {
  return {
    type: 'extended-force',
    frameTimeInterval: 40,
    speed: 8,
    dimensions: 2,
    maxIteration: appConfig().KnowledgeGraphConfig.maxIteration,
    gravity: 10,
    factor: 1,
    edgeStrength: 50,
    nodeStrength: 1000,
    coulombDisScale: 0.005,
    damping: 0.9,
    maxSpeed: 10,
    minMovement: 0.001,
    interval: 0.02,
    linkDistance: 200,
    preventOverlap: true,
    nodeSpacing: 10,
    distanceThresholdMode: 'mean',
    animation: true
  }
}
