/// <reference types="vitest" />
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import IconsResolver from "unplugin-icons/resolver";
import Icons from "unplugin-icons/vite";
// import { VitePWA } from "vite-plugin-pwa";
// https://vitejs.dev/config/

const pathSrc = resolve(__dirname, "src");
export default defineConfig({
  test: {},
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => /^emoji-picker$/i.test(tag),
        },
      },
    }),
    // VitePWA({
    //   manifest: {
    //     name: "WebChatX",
    //     description: "WebChatX",
    //     theme_color: "#ffffff",
    //     icons: [
    //       {
    //         src: "/WebChatX_192.svg",
    //         sizes: "192x192",
    //         type: "image/svg+xml",
    //       },
    //       {
    //         src: "/WebChatX_512.svg",
    //         sizes: "512x512",
    //         type: "image/svg+xml",
    //       },
    //     ],
    //   },

    //   strategies: "injectManifest",
    //   srcDir: "src",
    //   filename: "sw.ts",
    //   registerType: "autoUpdate",
    //   devOptions: {
    //     // 如果想在`vite dev`命令下调试PWA, 必须启用它
    //     enabled: true,
    //     // Vite在dev模式下会使用浏览器原生的ESModule，将type设置为`"module"`与原先的保持一致
    //     type: "module",
    //   },
    // }),
    AutoImport({
      // Auto import functions from Vue, e.g. ref, reactive, toRef...
      // 自动导入 Vue 相关函数，如：ref, reactive, toRef 等
      imports: ["vue"],

      // Auto import functions from Element Plus, e.g. ElMessage, ElMessageBox... (with style)
      // 自动导入 Element Plus 相关函数，如：ElMessage, ElMessageBox... (带样式)
      resolvers: [
        ElementPlusResolver(),

        // Auto import icon components
        // 自动导入图标组件
        IconsResolver({
          prefix: "Icon",
        }),
      ],

      dts: resolve(pathSrc, "auto-imports.d.ts"),
    }),

    Components({
      resolvers: [
        // Auto register icon components
        // 自动注册图标组件
        IconsResolver({
          enabledCollections: ["ep"],
        }),
        // Auto register Element Plus components
        // 自动导入 Element Plus 组件
        ElementPlusResolver(),
      ],

      dts: resolve(pathSrc, "components.d.ts"),
    }),

    Icons({
      compiler: "vue3",
      autoInstall: true,
    }),
  ],
  build: {
    outDir: "./dist",
    emptyOutDir: true,
    target: "es2022",
    chunkSizeWarningLimit: 1000 * 1024, // 将警告阈值调整为1MB
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "lodash-es": ["lodash-es"],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": pathSrc,
    },
  },
});
