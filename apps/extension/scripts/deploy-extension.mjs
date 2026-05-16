#!/usr/bin/env node
/**
 * deploy-extension.mjs
 * Builds the extension, creates a ZIP, and copies it to the web app's public
 * folder so it can be served as a static download from the LifeSolver website.
 *
 * Run: node apps/extension/scripts/deploy-extension.mjs (from repo root)
 *   OR: npm run deploy:extension (from repo root)
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, copyFileSync, statSync } from 'fs';
import { join, resolve } from 'path';

const EXTENSION_ROOT = resolve(import.meta.dirname, '..');
const WEB_PUBLIC = resolve(EXTENSION_ROOT, '..', 'web', 'frontend', 'web-app', 'public');
const DIST = join(EXTENSION_ROOT, 'dist');
const STORE_BUILDS = join(EXTENSION_ROOT, 'store-builds');

console.log('');
console.log('🔨 Building LifeSolver Extension...');
console.log('');

// Step 1: Build the extension
try {
  execSync('npm run build', { cwd: EXTENSION_ROOT, stdio: 'inherit' });
} catch (err) {
  console.error('❌ Extension build failed.');
  process.exit(1);
}

if (!existsSync(DIST)) {
  console.error('❌ dist/ not found after build.');
  process.exit(1);
}

// Step 2: Create ZIP
if (!existsSync(STORE_BUILDS)) {
  mkdirSync(STORE_BUILDS, { recursive: true });
}

const zipName = 'lifesolver-extension.zip';
const zipPath = join(STORE_BUILDS, zipName);
const isWindows = process.platform === 'win32';

console.log('');
console.log('📦 Creating ZIP package...');

try {
  if (isWindows) {
    const psRemove = `if (Test-Path '${zipPath}') { Remove-Item '${zipPath}' -Force }`;
    execSync(`powershell -Command "${psRemove}"`, { stdio: 'inherit' });
    const psCommand = `Compress-Archive -Path '${join(DIST, '*')}' -DestinationPath '${zipPath}' -Force`;
    execSync(`powershell -Command "${psCommand}"`, { stdio: 'inherit' });
  } else {
    execSync(`cd "${DIST}" && zip -r "${zipPath}" .`, { stdio: 'inherit' });
  }
} catch (err) {
  console.error('❌ ZIP creation failed:', err.message);
  process.exit(1);
}

// Step 3: Copy ZIP to web app's public folder
console.log('');
console.log('📋 Copying to web app public folder...');

const webDownloadDir = join(WEB_PUBLIC, 'downloads');
if (!existsSync(webDownloadDir)) {
  mkdirSync(webDownloadDir, { recursive: true });
}

const webZipPath = join(webDownloadDir, zipName);
copyFileSync(zipPath, webZipPath);

const sizeMB = (statSync(webZipPath).size / (1024 * 1024)).toFixed(2);

console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║  ✅  Extension deployed to web app!                         ║');
console.log('╠══════════════════════════════════════════════════════════════╣');
console.log(`║  📦 File: ${zipName.padEnd(48)}║`);
console.log(`║  📏 Size: ${(sizeMB + ' MB').padEnd(48)}║`);
console.log(`║  📁 Web:  public/downloads/${zipName.padEnd(32)}║`);
console.log('╠══════════════════════════════════════════════════════════════╣');
console.log('║  Users can now download from your website!                  ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log('');
