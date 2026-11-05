// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

export default defineConfig({
  output: 'static',
  build: {
    assets: '_assets',
  },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Bebas Neue',
      cssVariable: '--font-bebas',
      weights: [400],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['sans-serif'],
      formats: ['woff2'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Oswald',
      cssVariable: '--font-oswald',
      weights: [500],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['sans-serif'],
      formats: ['woff2'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Inter',
      cssVariable: '--font-inter',
      weights: [400, 500],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['sans-serif'],
      formats: ['woff2'],
    },
  ],
});