import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api/strava-token': {
        target: 'https://www.strava.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/strava-token/, '/oauth/token'),
      },
    },
  },
})
