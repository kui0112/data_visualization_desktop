import { reactive } from 'vue'

export const eventbus = reactive({
  events: new Map<string, Array<Function>>(),

  on(event: string, callback: Function) {
    if (!this.events.has(event)) {
      this.events.set(event, new Array<Function>())
    }
    this.events.get(event)?.push(callback)
  },

  off(event: string, callback: Function) {
    const callbacks = this.events.get(event)
    if (callbacks) {
      this.events.set(
        event,
        callbacks.filter((cb: Function) => cb !== callback)
      )
    }
  },

  emit(event: string, ...args: any[]) {
    const callbacks = this.events.get(event)
    if (callbacks) {
      callbacks.forEach((callback: Function) => callback(...args))
    }
  }
})
