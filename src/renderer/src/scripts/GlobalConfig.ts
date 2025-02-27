export class KnowledgeGraphConfig {
  // 动画总帧数
  maxIteration: number = 1000000
  // 暗黑模式
  darkMode: boolean = false
  // 知识图谱展示顺序，下划线分割
  displayOrder: string = 'zh_image_en_image'
  // 知识图谱持续时间（刷新间隔），单位秒
  displayDuration: number = 8
}

export class VectorAnimationConfig {
  //向量动画刷新间隔，单位秒
  displayDuration: number = 180
}

export class PicturesConfig {
  // 字幕语言：zh、en、zh_en
  subtitleLanguage: string = 'zh_en'

  // 打字机动画打字间隔
  subtitleAnimInterval: number = 0.25

  // 打字机动画结束之后的停留时间
  // 固定时间，单位是秒
  stayTime: number = 2
  // 打字动画乘以一个倍数再加上 stayTime
  stayTimePercent: number = 0.7

  // 字数条件，字数比较多的话，会使用第二组配置
  characterCountCondition: number = 35

  // 第二个打字机动画打字间隔，更短的时间间隔
  subtitleAnimInterval2: number = 0.2

  // 固定时间，单位是秒
  stayTime2: number = 3
  // 打字动画乘以一个倍数再加上 stayTime2
  stayTime2Percent: number = 0.5
}

export class GlobalConfig {
  KnowledgeGraphConfig: KnowledgeGraphConfig
  VectorAnimationConfig: VectorAnimationConfig
  PicturesConfig: PicturesConfig
}

let config = null

export const appConfig = (): GlobalConfig => {
  return config as GlobalConfig
}

export const setAppConfig = (cfg: GlobalConfig): void => {
  config = cfg
}
