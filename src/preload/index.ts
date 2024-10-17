import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  onFullScreenStateChange: (callback: (a: boolean) => void) => {
    ipcRenderer.on('fullscreen-state-change', (_, value: boolean) => callback(value))
  },
  isFullScreen: () => {
    return ipcRenderer.invoke('isFullScreen')
  },
  setFullScreen: (flag: boolean) => {
    return ipcRenderer.invoke('setFullScreen', flag)
  },
  reloadSilently: () => {
    return ipcRenderer.invoke('reloadSilently')
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

