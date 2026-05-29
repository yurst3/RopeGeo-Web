#!/usr/bin/env node
/**
 * Replaces $env-VAR_NAME placeholders in a file with process.env values.
 * Usage: node scripts/resolveYamlEnvs.cjs <inputFile> <outputFile>
 */
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const inputFile = process.argv[2];
const outputFile = process.argv[3];

if (!inputFile || !outputFile) {
    console.error(
        'Usage: node scripts/resolveYamlEnvs.cjs <inputFile> <outputFile>',
    );
    process.exit(1);
}

const inputPath = path.resolve(projectRoot, inputFile);
const outputPath = path.resolve(projectRoot, outputFile);

if (!fs.existsSync(inputPath)) {
    console.error(`::error::Input file not found: ${inputPath}`);
    process.exit(1);
}

let content = fs.readFileSync(inputPath, 'utf8');

const envPlaceholderRegex = /\$env-([A-Za-z0-9_]+)/g;
let hasMissingEnv = false;
content = content.replace(envPlaceholderRegex, (_match, varName) => {
    const value = process.env[varName];
    if (value === undefined || value === '') {
        console.error(
            `::error::Environment variable ${varName} is not set (used in $env-${varName})`,
        );
        hasMissingEnv = true;
        return '';
    }
    return value;
});

if (hasMissingEnv) {
    process.exit(1);
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, content, 'utf8');
console.log(`Wrote ${outputPath}`);
