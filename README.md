# Hello World Monero + Electron + Vue

## What is this?

This is a very basic / rough / messy and *incredibly* sloppy example of a desktop app that can interact with Monerod through the monero-javascript library, but it should be enough to get you running. The app leverages the new monerod binary interaction monero-javascript library and isn't without a few errors when starting/stopping the process. There are many, many bugs in this app.  

PLEASE make sure to set the hardcoded config values before pressing the 'Start Monerod' button or you will almomst certainly mess up your lmdb.  Feel free to make pr's.  

## Setup Instructions

```bash
# 1. clone repo

# 2. update the config in src/main/MonerodService.ts (hardcoded currently)

# 3. install
yarn

# 4. run the app (ensure you're using the latest Node.JS LTS- I recommend using nvm)
yarn dev

# 5. specify the location of your monerod file ( you can set this later in the system tray menu

# 6. interact - run start / stop node from vue or from the system tray

```
## Directory

```tree
├
├── configs
├   ├── vite-main.config.ts          Main-process config file, for -> src/main
├   ├── vite-preload.config.ts       Preload-script config file, for -> src/preload
├   ├── vite-renderer.config.ts      Renderer-script config file, for -> src/renderer
├
├── scripts
├   ├── build.mjs                    Build script, for -> npm run build
├   ├── electron-builder.config.mjs
├   ├── watch.mjs                    Develop script, for -> npm run dev
├
├── src
├   ├── main                         Main-process source code
├   ├── preload                      Preload-script source code
├   ├── renderer                     Renderer-process source code
├
```

#### `dist` and `src`

- Once `npm run dev` or `npm run build` is executed. Will be generated `dist`, it is the same as the `src` structure.

- This ensures the accuracy of path calculation.

```tree
├── dist
├   ├── main
├   ├── preload
├   ├── renderer
├── src
├   ├── main
├   ├── preload
├   ├── renderer
├
```

## Communication

**All NodeJs、Electron API invoke passed `Preload-script`**

* **src/preload/index.ts**

  ```typescript
  // --------- Expose some API to Renderer process. ---------
  contextBridge.exposeInMainWorld('fs', fs)
  contextBridge.exposeInMainWorld('ipcRenderer', ipcRenderer)
  ```

* **src/renderer/src/main.ts**

  ```typescript
  console.log('fs', window.fs)
  console.log('ipcRenderer', window.ipcRenderer)
  ```