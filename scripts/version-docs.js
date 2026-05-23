#!/usr/bin/env node
// Reads docs/*.md source files, writes versioned .txt copies + manifest.json
// to client/public/files/. Run before `vite build` so the injected filename
// (via vite.config.ts define) matches what's on disk.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const outDir = resolve(root, 'client/public/files');
const BASE_URL = 'https://mvla.ericgio.com';

mkdirSync(outDir, { recursive: true });

// PROJECT_INSTRUCTIONS first so manifest entry is set when SETUP substitution runs.
const docs = [
  { name: 'PROJECT_INSTRUCTIONS', src: 'docs/PROJECT_INSTRUCTIONS.md' },
  { name: 'SETUP', src: 'docs/SETUP.md' },
];

const manifest = {};

for (const { name, src } of docs) {
  const bytes = readFileSync(resolve(root, src));
  const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 8);
  const filename = `${name}-${hash}.txt`;
  manifest[name] = filename;

  let content = bytes.toString('utf-8');

  // Substitute the PROJECT_INSTRUCTIONS_URL placeholder in SETUP.
  content = content.replace(
    '{{PROJECT_INSTRUCTIONS_URL}}',
    `${BASE_URL}/files/${manifest['PROJECT_INSTRUCTIONS']}`,
  );

  writeFileSync(resolve(outDir, filename), content);
  console.log(`wrote ${outDir}/${filename}`);
}

writeFileSync(resolve(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`wrote ${outDir}/manifest.json`);
