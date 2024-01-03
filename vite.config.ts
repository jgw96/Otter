import { defineConfig, splitVendorChunkPlugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import copy from 'rollup-plugin-copy';
import wasm from "vite-plugin-wasm";

import minifyHTML from 'rollup-plugin-minify-html-literals';

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  build: {
    sourcemap: false,
    assetsDir: "code",
    cssCodeSplit: true,
    target: ['esnext', 'edge100', 'firefox100', 'chrome100', 'safari18']
  },
  plugins: [
    splitVendorChunkPlugin(),
    VitePWA({
      strategies: "injectManifest",
      injectManifest: {
        swSrc: 'public/sw.js',
        swDest: 'dist/sw.js',
        globDirectory: 'dist',
        globPatterns: [
          // glob pattern for index-*.js files
          '**/*.{html,json,svg,css,js,png}',
        ],
      },
      injectRegister: false,
      manifest: false,
      devOptions: {
        enabled: true
      },
    }),
    wasm(),
    minifyHTML(),
    copy({
      targets: [
        { src: 'light.css', dest: 'dist/' },
        { src: 'dark.css', dest: 'dist/' },
        { src: 'global.css', dest: 'dist/' },
      ]
    }),
  ],
})
