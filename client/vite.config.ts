import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const manifestPath = resolve(__dirname, 'public/files/manifest.json');

const setupFile = existsSync(manifestPath)
  ? (JSON.parse(readFileSync(manifestPath, 'utf-8')) as Record<string, string>)['SETUP']
  : 'SETUP.txt';

export default defineConfig({
  plugins: [react()],
  define: {
    __SETUP_FILE__: JSON.stringify(setupFile),
  },
});
