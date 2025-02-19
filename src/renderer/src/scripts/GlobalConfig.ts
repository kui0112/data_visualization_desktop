import { MixedNode } from './MixedNode'
import { ExtensionCategory, register } from '@antv/g6'
import { ExtendedForceLayout } from './ExtendedForceLayout'
import { ref } from 'vue'

register(ExtensionCategory.NODE, 'mixed-node', MixedNode)
register(ExtensionCategory.LAYOUT, 'extended-force', ExtendedForceLayout)

interface GlobalConfig {
  maxIteration: number
  dark: boolean
  displayOrder: string
  displayDuration: number
  subtitleLanguage: string
  vectorDisplayDuration: number
  pictureDisplayDuration: number
  pictureSubtitleAnimInterval: number
}

const config = ref<GlobalConfig>()

export const appConfig = (): GlobalConfig => {
  return config.value
}

export const setAppConfig = (cfg: GlobalConfig): void => {
  config.value = cfg
}
