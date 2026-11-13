// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import fumadocs from '@fumadocs/astro';

export default defineConfig({
  site: 'https://kiboar.raulmoracode.com',
  integrations: [
    fumadocs({
      components: './src/components/mdx.tsx',
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
