/**
 * Ensures exported web index.html contains <!-- LINK_PREVIEW_HEAD --> for the explore Lambda.
 */
const fs = require('fs');
const path = require('path');

const marker = '<!-- LINK_PREVIEW_HEAD -->';
const indexPath = path.join(__dirname, '..', 'dist', 'index.html');

if (!fs.existsSync(indexPath)) {
    console.error('Missing', indexPath, '— run expo export first.');
    process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf8');
if (html.includes('LINK_PREVIEW_HEAD')) {
    console.log('LINK_PREVIEW_HEAD already present.');
    process.exit(0);
}

// Insert after viewport meta (typical Expo web template).
const re = /(<meta\s+name=["']viewport["'][^>]*\/?>)/i;
if (re.test(html)) {
    html = html.replace(re, `$1\n    ${marker}`);
} else {
    html = html.replace(/<head[^>]*>/i, (m) => `${m}\n    ${marker}`);
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Injected LINK_PREVIEW_HEAD into', indexPath);
