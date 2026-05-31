/**
 * Copies the exported SPA index.html to additional routes served from S3/CloudFront.
 */
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const indexPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexPath)) {
    console.error('Missing', indexPath, '— run expo export first.');
    process.exit(1);
}

const html = fs.readFileSync(indexPath, 'utf8');

const privacyDir = path.join(distDir, 'privacy');
fs.mkdirSync(privacyDir, { recursive: true });
fs.writeFileSync(path.join(privacyDir, 'index.html'), html, 'utf8');
fs.writeFileSync(path.join(distDir, 'privacy.html'), html, 'utf8');

console.log('Copied index.html to dist/privacy/index.html and dist/privacy.html');
