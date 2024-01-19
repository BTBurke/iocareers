import { resolve } from 'path';
import handlebars from 'vite-plugin-handlebars';
import solid from 'vite-plugin-solid';
import { defineConfig } from 'vite';
//import purgeCSS from "@mojojoejo/vite-plugin-purgecss";

export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {

  const common = {
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          benefits: resolve(__dirname, 'benefits.html'),
          federal: resolve(__dirname, 'federal.html'),
          faq: resolve(__dirname, 'faq.html'),
          other: resolve(__dirname, 'other-opportunities.html'),
          positions: resolve(__dirname, 'positions.html'),
          process: resolve(__dirname, 'process.html'),
          jpo: resolve(__dirname, 'students-jpo.html'),
          jobs: resolve(__dirname, 'jobs.html'),
        },
        output: {
          assetFileNames: (assetInfo) => {
            let extType = assetInfo.name.split('.').at(1);
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
              extType = 'img';
            }
            if (extType === 'woff2') {
              extType = 'fonts';
            }
            return `${extType}/[name]-[hash][extname]`;
          },
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
        },
     },
    },
    plugins: [
      handlebars({
        partialDirectory: resolve(__dirname, 'partials'),
        context: {
          rewrite: false
        }
      }),
      solid()
    ]
  }
  
  return mode === 'production' ? Object.assign(common, {
      plugins: [
        handlebars({
          partialDirectory: resolve(__dirname, 'partials'),
          context: {
            rewrite: true  //adds <base> tag to rewrite internal links with /Main/Content/Public/<page> path
          }
        }),
        solid()
      ],
      experimental: {
        renderBuiltUrl(filename) {
            return '/Assets/v3/' + filename
          }
        }
    })
    : common
  })