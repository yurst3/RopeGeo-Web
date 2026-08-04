/**
 * Writes a minimal valid PNG so `expo export` can run without a checked-in favicon.
 */
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src', 'site', 'landing', 'assets');
const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64',
);

fs.mkdirSync(dir, { recursive: true });
const favicon = path.join(dir, 'favicon.png');
if (!fs.existsSync(favicon)) {
    fs.writeFileSync(favicon, png);
}
