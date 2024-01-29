import { resolve } from 'path';
import handlebars from 'vite-plugin-handlebars';
import solid from 'vite-plugin-solid';
import { defineConfig } from 'vite';

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
            if (assetInfo.name.match('hero.jpg')) {
              return 'v3-hero.jpg'
            }
            let extType = assetInfo.name.split('.').at(1);
            if (/min|png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
              extType = 'img';
            }
            if (extType === 'woff2') {
              extType = 'fonts';
            }
            return `${extType}/[name][extname]`;
          },
          chunkFileNames: 'js/[name].js',
          //entryFileNames: 'js/[name].js',
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
          if (filename.match('hero.jpg')) {
            return '/Main/Content/File/v3-hero'
          }
            return '/Assets/v3/' + filename
          }
        }
    })
    : common
  })
