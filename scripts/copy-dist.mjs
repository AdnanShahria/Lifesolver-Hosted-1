import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const frontendDistSrc = path.join(rootDir, 'website', 'frontend', 'dist');
const frontendDistDest = path.join(rootDir, 'dist');

const functionsSrc = path.join(rootDir, 'website', 'functions');
const functionsDest = path.join(rootDir, 'functions');

// Copy Frontend Build
if (fs.existsSync(frontendDistSrc)) {
  if (fs.existsSync(frontendDistDest)) {
    fs.rmSync(frontendDistDest, { recursive: true, force: true });
  }
  fs.cpSync(frontendDistSrc, frontendDistDest, { recursive: true });
  console.log('Successfully copied website/frontend/dist to dist for Cloudflare Pages deployment.');
} else {
  console.error('Error: Could not find website/frontend/dist. Make sure the frontend build succeeded.');
  process.exit(1);
}

// Copy Functions
if (fs.existsSync(functionsSrc)) {
  if (fs.existsSync(functionsDest)) {
    fs.rmSync(functionsDest, { recursive: true, force: true });
  }
  fs.cpSync(functionsSrc, functionsDest, { recursive: true });
  console.log('Successfully copied website/functions to functions for Cloudflare Pages deployment.');
} else {
  console.warn('Warning: Could not find website/functions. Skipping functions copy.');
}
