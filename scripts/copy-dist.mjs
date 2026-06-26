import fs from 'fs';
import path from 'path';

const src = path.join(process.cwd(), 'apps', 'web', 'dist');
const dest = path.join(process.cwd(), 'dist');

if (fs.existsSync(src)) {
  fs.cpSync(src, dest, { recursive: true });
  console.log('Successfully copied apps/web/dist to dist for Cloudflare Pages deployment.');
} else {
  console.log('Could not find apps/web/dist. Make sure the build succeeded.');
}
