import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('.', import.meta.url));

const banner = `/**
   LMTUD v1.0.0 (c) Min Xu the ORNL Land Model Testbed (LMT) LDRD project, and US Department of Energy RUBISCO Science Focus Area
   @license BSD-3-Clause
 */`;

export default defineConfig({
  publicDir: false,
  build: {
    outDir: 'dist/js',
    emptyOutDir: false,
    minify: 'oxc',
    lib: {
      entry: resolve(root, 'assets/js/lmt_tab.js'),
      name: 'LMTUD',
      formats: ['iife'],
      fileName: () => 'lmtud_bundle.min.js'
    }
  },
  plugins: [
    {
      name: 'lmtud-banner',
      generateBundle(_options, bundle) {
        for (const file of Object.values(bundle)) {
          if (file.type === 'chunk') {
            file.code = `${banner}\n${file.code}`;
          }
        }
      }
    }
  ]
});
