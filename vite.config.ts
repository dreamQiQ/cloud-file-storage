import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "vue-i18n": "vue-i18n/dist/vue-i18n.cjs.js",
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 3000,
  },
  server: {
    host: true, //ip地址 或 '0.0.0.0' 或 "loaclhost"
    port: 4009, //端口号
    open: false, //启动后是否自动打开浏览器
    https: false, // 是否开启 https
    proxy: { // 代理
      '/api': {
        target: 'http://172.17.0.1:4006',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
