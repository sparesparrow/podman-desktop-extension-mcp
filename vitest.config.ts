import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      // @podman-desktop/api is provided by Podman Desktop at runtime and has no
      // importable entry point, so tests resolve it to the local mock.
      '@podman-desktop/api': fileURLToPath(new URL('./src/__mocks__/@podman-desktop/api.ts', import.meta.url))
    }
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,ts}']
  }
});
