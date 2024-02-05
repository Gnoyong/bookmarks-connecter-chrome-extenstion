import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import copy from 'rollup-plugin-copy'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  module: {

  },
  build: {
    rollupOptions: {
      plugins: [
        copy({
          targets: [
            { src: 'src/background', dest: 'dist/' },
            { src: 'manifest.json', dest: 'dist/' },
            { src: 'src/popup', dest: 'dist/' }
          ],
          verbose: true,
          hook: 'writeBundle'
        })
      ]
    }
  }
})

