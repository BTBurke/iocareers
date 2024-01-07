import { resolve } from 'path';
import handlebars from 'vite-plugin-handlebars';
import solid from 'vite-plugin-solid';

export default {
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
      },
   },
  },
  plugins: [
    handlebars({
      partialDirectory: resolve(__dirname, 'partials'),
    }),
    solid()
  ],
};
