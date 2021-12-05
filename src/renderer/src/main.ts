import { ipcRenderer } from 'electron'
import { createApp } from 'vue'
import App from './App.vue'

export interface MoneroDaemonState {
  adjustedTimestamp: number,
  numAltBlocks: number,
  blockSizeLimit: number,
  blockSizeMedian: number,
  blockWeightLimit: number,
  blockWeightMedian: number,
  isBusySyncing: boolean,
  databaseSize: number,
  freeSpace: any,
  numOfflinePeers: number,
  height: number,
  heightWithoutBootstrap: number,
  numIncomingConnections: number,
  networkType: number,
  isOffline: boolean,
  numOutgoingConnections: number,
  numRpcConnections: number,
  startTimestamp: number,
  isSynchronized: boolean,
  target: number,
  targetHeight: number,
  topBlockHash: string,
  numTxs: number,
  numTxsPool: number,
  updateAvailable: boolean,
  version: string,
  wasBootstrapEverUsed: boolean,
  numOnlinePeers: number,
  cumulativeDifficulty: any,
  difficulty: any
}

createApp(App)
  .mount('#app')
  .$nextTick(window.removeLoading)

console.log('fs', window.fs)
console.log('ipcRenderer', window.ipcRenderer)

