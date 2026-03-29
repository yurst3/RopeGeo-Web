/**
 * Writes minimal valid PNGs so `expo export` can run without checked-in binary assets.
 */
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src', 'site', 'landing', 'assets');
const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64',
);

fs.mkdirSync(dir, { recursive: true });
for (const name of ['icon.png', 'splash-icon.png', 'adaptive-icon.png', 'favicon.png']) {
    const f = path.join(dir, name);
    if (!fs.existsSync(f)) {
        fs.writeFileSync(f, png);
    }
}
