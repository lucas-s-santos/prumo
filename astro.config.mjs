import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Na Vercel, o domínio de produção chega por variável de ambiente; usado nas URLs absolutas (og:image, canonical).
const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export default defineConfig({
  site: prod ? `https://${prod}` : 'http://localhost:4321',
  // CSS embutido no HTML: a primeira pintura não espera um arquivo .css.
  build: { inlineStylesheets: 'always' },
  vite: { plugins: [tailwindcss()] },
});
