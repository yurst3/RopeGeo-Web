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

const spaRoutes = [
    'privacy',
    'documentation',
    'documentation/ropewikiscraper',
    'documentation/ropewikipageprocessor',
    'documentation/mapdataprocessor',
];

for (const route of spaRoutes) {
    const routeDir = path.join(distDir, route);
    fs.mkdirSync(routeDir, { recursive: true });
    fs.writeFileSync(path.join(routeDir, 'index.html'), html, 'utf8');
    fs.writeFileSync(path.join(distDir, `${route}.html`), html, 'utf8');
}

console.log(
    'Copied index.html to:',
    spaRoutes
        .flatMap((route) => [
            `dist/${route}/index.html`,
            `dist/${route}.html`,
        ])
        .join(', ')
);
