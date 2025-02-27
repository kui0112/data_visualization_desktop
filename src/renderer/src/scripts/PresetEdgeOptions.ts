import { EdgeOptions } from '@antv/g6'
import { appConfig } from './GlobalConfig'

export const PresetEdgeOptions = (): EdgeOptions => {
  return {
    type: 'line',
    style: {
      startArrow: false,
      endArrow: false,
      lineWidth: 0.5,
      stroke: appConfig().KnowledgeGraphConfig.darkMode ? '#ffffff' : '#557bd8'
    }
  }
}
