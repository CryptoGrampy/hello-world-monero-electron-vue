<script setup lang="ts">
import { on } from 'events'
import { reactive, ref } from 'vue'
import { MoneroDaemonState } from '../main'

defineProps<{ msg: string }>()

interface MonerodTimer {
  onTime?: string
  offTime?: string
}

let latestMonerodData = reactive({
    height: 0,
    isOffline: true,
    numTxsPool: 0,
    version: '',
    syncPercentage: 0
})

let currentTimer = reactive({ onTime: 'xx:xx', offTime: 'xx:xx' } as MonerodTimer)
let currentTime = reactive({now: ''})
let onTime = ref(currentTimer.onTime)
let offTime = ref(currentTimer.offTime)

// Ask for info on init
window.ipcRenderer.send('get-monero-message')
window.ipcRenderer.send('get-timer-message')

// Receive monerod info events
window.ipcRenderer.on('get-monero-reply', (event, arg: MoneroDaemonState) => {
  console.log(event)
  console.log(arg)
  latestMonerodData.height = arg.height
  latestMonerodData.isOffline = arg.isOffline
  latestMonerodData.numTxsPool = arg.numTxsPool
  latestMonerodData.version = arg.version
  latestMonerodData.syncPercentage = Number(((arg.height / arg.targetHeight) * 100).toFixed(1))
})

// Receive timer info events
window.ipcRenderer.on('get-timer-message-reply', (event, arg?: MonerodTimer) => {
  console.log(event)
  console.log(arg)
  if (arg?.onTime && arg.offTime) {
    currentTimer.onTime = arg.onTime
    currentTimer.offTime = arg.offTime
  }
})

const clearTimer = () => {
  onTime.value = 'xx:xx'
  offTime.value = 'xx:xx'
  setTimer()
}

// Trigger Monerod on/off events
setInterval(() => {
 const t = new Date()
 const s = t.getHours() + ':' + t.getMinutes()
 currentTime.now = s

 if (s === currentTimer.onTime) {
   console.log('Turning on Monerod')
   monerodSwitch(true)
 } else if (s === currentTimer.offTime) {
   console.log('Turning off Monerod')
   monerodSwitch(false)
 }
}, 55*1000)

// Turns Monerod on/off
const monerodSwitch = (toggle: boolean): void => {
  window.ipcRenderer.send('set-monero-switch', toggle)
}

// Sends timer update to dashboard store
const setTimer = () => {
  window.ipcRenderer.send('set-timer-message', { onTime: onTime.value, offTime: offTime.value })
}
</script>

<template>
  <h1>{{ msg }}</h1>

  <h2>Latest Monerod Data</h2>
  <code>{{ latestMonerodData }}</code>
  <h3>Monerod Controls</h3>
  <button type="button" @click="monerodSwitch(true)">Turn Monerod On</button>
  <button type="button" @click="monerodSwitch(false)">Turn Monerod Off</button>

  <h2>Monerod Timer</h2>
  <h3>Start and Stop Monerod on a schedule!</h3>
  <p>Formatting: For 01:01 PM, type 13:1, for 1:01 AM, type 1:1, for 11:15 PM, type 23:15</p>
  <p>Your current time: {{ currentTime.now }}</p>
  <p>Your saved timer: On at {{ currentTimer.onTime }}, Off at {{ currentTimer.offTime }} </p>
  <p>Turn Monerod On At: </p>
  <p>
  <input v-model="onTime" placeholder="xx:xx" />
  </p>
  <p>Turn Monerod Off At: </p>
  <p>
  <input v-model="offTime" placeholder="xx:xx"  />
  </p>
  <button type="button" @click="setTimer()">Set Timer</button>
  <button type="button" @click="clearTimer()">Delete Saved Timer</button>

  <br>
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
