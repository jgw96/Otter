import { defineConfig } from 'vite';
import copy from 'rollup-plugin-copy';
import wasm from "vite-plugin-wasm";
import { promises as fs } from 'fs';
import path from 'path';

// Plugin to handle service worker precaching
function serviceWorkerPlugin() {
  return {
    name: 'service-worker-plugin',
    async closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const swPath = path.join(__dirname, 'public/sw.js');
      const distSwPath = path.join(distDir, 'sw.js');

      // Read the service worker file
      let swContent = await fs.readFile(swPath, 'utf-8');

      // Get all files in dist to precache
      async function getFiles(dir, baseDir = dir) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        const files = await Promise.all(
          entries.map(async (entry) => {
            const res = path.join(dir, entry.name);
            if (entry.isDirectory()) {
              return getFiles(res, baseDir);
            } else {
              // Only include specific file types
              if (/\.(json|svg|css|js|html)$/.test(entry.name)) {
                return '/' + path.relative(baseDir, res).replace(/\\/g, '/');
              }
              return null;
            }
          })
        );
        return files.flat().filter(Boolean);
      }

      try {
        const filesToCache = await getFiles(distDir);
        const manifest = JSON.stringify(filesToCache, null, 2);

        // Inject the precache manifest
        swContent = swContent.replace(
          'self.__PRECACHE_MANIFEST || []',
          manifest
        );

        // Write the modified service worker to dist
        await fs.writeFile(distSwPath, swContent);
        console.log(`Service worker generated with ${filesToCache.length} files to precache`);
      } catch (error) {
        console.error('Error generating service worker:', error);
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  build: {
    sourcemap: false,
    assetsDir: "code",
    cssCodeSplit: true,
    minify: "terser",
    target: ['esnext', 'edge100', 'firefox100', 'chrome100', 'safari18']
  },
  plugins: [
    wasm(),
    copy({
      targets: [
        { src: 'light.css', dest: 'dist/' },
        { src: 'dark.css', dest: 'dist/' },
        { src: 'global.css', dest: 'dist/' },
        { src: 'public/sw.js', dest: 'dist/' },
      ]
    }),
    serviceWorkerPlugin(),
  ],
})
