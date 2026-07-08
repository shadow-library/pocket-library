#!/usr/bin/env node
/**
 * Packs a source folder into a single `.novel` package (a zip) for Pocket Library.
 *
 * Usage:
 *   node scripts/make-novel.mjs <sourceDir> [outDir]
 *
 * The source folder must contain a `manifest.json` at its root. Every file under the folder is added
 * to the package, preserving relative paths (e.g. `chapters/001.md`, `images/cover.png`). The output
 * file is named `<manifest.id>.novel`.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { zipSync } from 'fflate';

function collectFiles(dir, base = dir, out = {}) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) collectFiles(fullPath, base, out);
    else out[relative(base, fullPath).split(sep).join('/')] = new Uint8Array(readFileSync(fullPath));
  }
  return out;
}

const sourceDir = process.argv[2];
const outDir = process.argv[3] ?? process.cwd();

if (!sourceDir) {
  console.error('Usage: node scripts/make-novel.mjs <sourceDir> [outDir]');
  process.exit(1);
}

const files = collectFiles(sourceDir);
const manifestBytes = files['manifest.json'];

if (!manifestBytes) {
  console.error(`No manifest.json found in ${sourceDir}`);
  process.exit(1);
}

const manifest = JSON.parse(Buffer.from(manifestBytes).toString('utf8'));
const id = typeof manifest.id === 'string' && manifest.id.length > 0 ? manifest.id : 'novel';
const zipped = zipSync(files, { level: 6 });
const outPath = join(outDir, `${id}.novel`);

writeFileSync(outPath, zipped);
console.log(`Wrote ${outPath} — ${zipped.length} bytes, ${Object.keys(files).length} entries.`);
