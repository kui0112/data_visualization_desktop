import electron, { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  isFullScreen: () => ipcRenderer.invoke('isFullScreen'),
  setFullScreen: (flag: boolean) => ipcRenderer.invoke('setFullScreen', flag),
  reloadSilently: () => ipcRenderer.invoke('reloadSilently'),
  openDevTools: () => ipcRenderer.invoke('openDevTools'),
  closeDevTools: () => ipcRenderer.invoke('closeDevTools'),
  appConfig: () => ipcRenderer.invoke('appConfig'),
  receiveMessage: (channel: string, callback: Function) => {
    electron.ipcRenderer.on(channel, (_, data) => callback(data))
  },
  sendMessage: (channel: string, data: string) => {
    ipcRenderer.send(channel, data)
  },
  openNav: () => ipcRenderer.invoke('openNav'),
  closeNav: () => ipcRenderer.invoke('closeNav')
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

