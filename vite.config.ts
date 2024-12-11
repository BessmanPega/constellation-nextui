import path from 'node:path'

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { normalizePath } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),

    // https://www.npmjs.com/package/vite-plugin-static-copy
    viteStaticCopy({
      targets: [

        // Step 2 here: https://docs.pega.com/bundle/constellation-sdk/page/constellation-sdks/sdks/updating-next-js-application-integration-react-sdk.html
        {
          src: './node_modules/@pega/auth/lib/oauth-client/authDone.html',
          dest: normalizePath(path.resolve(__dirname, 'public')),
          rename: (fileName, fileExtension, fullPath) => {
            return "auth.html";
          }
        },
        {
          src: './node_modules/@pega/auth/lib/oauth-client/authDone.js',
          dest: normalizePath(path.resolve(__dirname, 'public'))
       },
       {
          src: './node_modules/@pega/constellationjs/dist/bootstrap-shell.js',
          dest: normalizePath(path.resolve(__dirname, 'public/constellation')),
          overwrite: true,

       },
       {
          src: './node_modules/@pega/constellationjs/dist/bootstrap-shell.*.*',
          dest: normalizePath(path.resolve(__dirname, 'public/constellation')),
          overwrite: true
       },
       {
          src: './node_modules/@pega/constellationjs/dist/lib_asset.json',
          dest: normalizePath(path.resolve(__dirname, 'public/constellation')),
          overwrite: true
       },
       {
          src: './node_modules/@pega/constellationjs/dist/constellation-core.*.*',
          dest: normalizePath(path.resolve(__dirname, 'public/constellation/prerequisite')),
          transform: (content, filename) => {
            if (filename.endsWith('.map')) {
              // Skip.
              return null;
            }

            return content;
          },
          overwrite: true
       },
       {
          src: './node_modules/@pega/constellationjs/dist/js/*',
          dest: normalizePath(path.resolve(__dirname, 'public/constellation/prerequisite/js')),
          overwrite: true
       }
      ]
    })
  ],
})
