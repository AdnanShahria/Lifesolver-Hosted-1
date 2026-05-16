#!/usr/bin/env node
/**
 * build-store.mjs
 * Creates a ZIP archive of the built extension for Chrome Web Store upload.
 * Run: npm run build:store (from apps/extension)
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync, mkdirSync, readdirSync, statSync, createWriteStream } from 'fs';
import { join, resolve, relative } from 'path';
import { createGzip } from 'zlib';
import { Buffer } from 'buffer';

const ROOT = resolve(import.meta.dirname, '..');
const DIST = join(ROOT, 'dist');
const OUTPUT_DIR = join(ROOT, 'store-builds');

// Read version from manifest
const manifest = JSON.parse(readFileSync(join(ROOT, 'manifest.json'), 'utf-8'));
const version = manifest.version;
const zipName = `lifesolver-extension-v${version}.zip`;

if (!existsSync(DIST)) {
  console.error('❌ dist/ directory not found. Run "npm run build" first.');
  process.exit(1);
}

// Create output directory
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

const outputPath = join(OUTPUT_DIR, zipName);

// Use PowerShell's Compress-Archive on Windows, zip on Unix
const isWindows = process.platform === 'win32';

try {
  if (isWindows) {
    // Remove existing zip if present
    const psRemove = `if (Test-Path '${outputPath}') { Remove-Item '${outputPath}' -Force }`;
    execSync(`powershell -Command "${psRemove}"`, { stdio: 'inherit' });
    
    // Create ZIP using PowerShell
    const psCommand = `Compress-Archive -Path '${join(DIST, '*')}' -DestinationPath '${outputPath}' -Force`;
    execSync(`powershell -Command "${psCommand}"`, { stdio: 'inherit' });
  } else {
    execSync(`cd "${DIST}" && zip -r "${outputPath}" .`, { stdio: 'inherit' });
  }

  // Get file size
  const stats = statSync(outputPath);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  ✅  Chrome Web Store Package Ready!                        ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log(`║  📦 File: ${zipName.padEnd(48)}║`);
  console.log(`║  📏 Size: ${(sizeMB + ' MB').padEnd(48)}║`);
  console.log(`║  📁 Path: store-builds/                                     ║`);
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║  Next steps:                                                ║');
  console.log('║  1. Go to https://chrome.google.com/webstore/devconsole     ║');
  console.log('║  2. Click "New Item" → Upload this ZIP                      ║');
  console.log('║  3. Fill in listing details & submit for review              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
} catch (err) {
  console.error('❌ Failed to create ZIP:', err.message);
  process.exit(1);
}
