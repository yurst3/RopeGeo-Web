/**
 * Merges all CloudFormation YAML under a stack directory into a single template file.
 * Usage: node scripts/mergeTemplate.cjs <inDir> <outFile> <description> [--fix-transform]
 */
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const fixTransform = args.includes('--fix-transform');
const positional = args.filter((a) => a !== '--fix-transform');

const inDir = path.resolve(projectRoot, positional[0] ?? '');
const outFile = path.resolve(projectRoot, positional[1] ?? '');
const description = positional[2] ?? '';

const SAM_TRANSFORM = "'AWS::Serverless-2016-10-31'";

if (!positional[0] || !positional[1] || !description) {
    console.error(
        'Usage: node scripts/mergeTemplate.cjs <inDir> <outFile> <description> [--fix-transform]',
    );
    process.exit(1);
}

if (!fs.existsSync(inDir)) {
    console.error(`Input directory not found: ${inDir}`);
    console.error(`Repo root: ${projectRoot}`);
    process.exit(1);
}

function fixTransformEmptyDescription(content) {
    return content.replace(
        /^Transform:\nDescription:/m,
        `Transform:\n  - ${SAM_TRANSFORM}\nDescription:`,
    );
}

function removeOrphanTransformItem(content) {
    let s = content.replace(
        new RegExp(`\n  - ${SAM_TRANSFORM}\nParameters:`, 'g'),
        '\nParameters:',
    );
    s = s.replace(new RegExp(`\n  - ${SAM_TRANSFORM}\nGlobals:`, 'g'), '\nGlobals:');
    return s;
}

function applyTransformFixes(content) {
    return removeOrphanTransformItem(fixTransformEmptyDescription(content));
}

function setDescription(content, newDescription) {
    return content.replace(/^Description: .*$/m, `Description: ${newDescription}`);
}

function assertMergedOutputWritten() {
    if (!fs.existsSync(outFile)) {
        console.error(`Merge failed: output not written at ${outFile}`);
        process.exit(1);
    }
    if (fs.statSync(outFile).size === 0) {
        console.error(`Merge failed: output is empty at ${outFile}`);
        process.exit(1);
    }
}

function main() {
    const merger = require('cloudformation-yml-merger').default;

    if (!inDir.startsWith('/') || !outFile.startsWith('/')) {
        console.error(
            'cloudformation-yml-merger requires absolute POSIX paths.',
        );
        console.error(`inDir=${inDir} outFile=${outFile}`);
        process.exit(1);
    }

    try {
        merger(inDir, outFile);
    } catch (err) {
        console.error(`cloudformation-yml-merger failed for ${inDir}:`, err);
        process.exit(1);
    }

    assertMergedOutputWritten();

    let content = fs.readFileSync(outFile, 'utf8');
    if (fixTransform) {
        content = applyTransformFixes(content);
    }
    content = setDescription(content, description);
    fs.writeFileSync(outFile, content, 'utf8');
    assertMergedOutputWritten();
    console.log(`Wrote merged template: ${outFile}`);
}

main();
