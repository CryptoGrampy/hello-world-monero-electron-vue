<script setup lang="ts">
import { reactive, ref } from 'vue'
import { MoneroDaemonState } from '../main'

defineProps<{ msg: string }>()

let latestMonerodData = reactive({
    height: 0,
    isOffline: true,
    numTxsPool: 0,
    version: '',
    syncPercentage: 0
})

window.ipcRenderer.send('monero-message', 'hey')

window.ipcRenderer.on('monero-reply', (event, arg: MoneroDaemonState) => {
  console.log(event)
  console.log(arg)
    latestMonerodData.height = arg.height
    latestMonerodData.isOffline = arg.isOffline
    latestMonerodData.numTxsPool = arg.numTxsPool
    latestMonerodData.version = arg.version
    latestMonerodData.syncPercentage = Number(((arg.height / arg.targetHeight) * 100).toFixed(1))
})
</script>

<template>
  <h1>{{ msg }}</h1>

  <code>{{ latestMonerodData }}</code>
  <p>
    Recommended IDE setup:
    <a href="https://code.visualstudio.com/" target="_blank">VSCode</a>
    +
    <a href="https://github.com/johnsoncodehk/volar" target="_blank">Volar</a>
  </p>

  <p>See <code>README.md</code> for more information.</p>

  <p>
    <!-- <a href="https://vitejs.dev/guide/features.html" target="_blank">
      Vite Docs
    </a>
    | -->
    <a href="https://v3.vuejs.org/" target="_blank">Vue 3 Docs</a>
  </p>
</template>

<style scoped>
a {
  color: #42b983;
}

label {
  margin: 0 0.5em;
  font-weight: bold;
}

code {
  background-color: #eee;
  padding: 2px 4px;
  border-radius: 4px;
  color: #304455;
}
</style>
