import { EdgeOptions } from '@antv/g6'
import { appConfig } from './GlobalConfig'

const cfg = appConfig()

export const PresetEdgeOptions: EdgeOptions = {
  type: 'line',
  style: {
    startArrow: false,
    endArrow: false,
    lineWidth: 0.5,
    stroke: cfg.dark ? '#ffffff' : '#557bd8'
  }
}
