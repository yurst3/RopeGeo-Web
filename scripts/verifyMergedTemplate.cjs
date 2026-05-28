/**
 * Verifies a merged CloudFormation template exists under the Web repo root.
 * Usage: node scripts/verifyMergedTemplate.cjs <path-relative-to-repo-root>
 */
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const relativePath = process.argv[2];

if (!relativePath) {
    console.error('Usage: node scripts/verifyMergedTemplate.cjs <relative-path>');
    process.exit(1);
}

const absolutePath = path.resolve(projectRoot, relativePath);

if (!fs.existsSync(absolutePath)) {
    console.error(
        `::error::Merged template missing: ${absolutePath}`,
    );
    console.error(`::error::Repo root: ${projectRoot}`);
    console.error(`::error::Process cwd: ${process.cwd()}`);
    process.exit(1);
}

if (fs.statSync(absolutePath).size === 0) {
    console.error(`::error::Merged template is empty: ${absolutePath}`);
    process.exit(1);
}

console.log(`Verified merged template: ${absolutePath}`);
