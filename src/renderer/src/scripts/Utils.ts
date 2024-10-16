import mitt from 'mitt'

export const eventbus = mitt()

export function randomChoice<T>(choices: Array<T>): T {
  return choices[Math.floor(Math.random() * choices.length)]
}

export async function delay(timeout: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, timeout * 1000))
}

export interface Segment {
  id: string
  image: string
  video: string
  subtitle: string
  aliveDuration: number
  animInterval: number
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}