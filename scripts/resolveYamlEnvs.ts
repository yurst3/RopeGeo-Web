#!/usr/bin/env node
/**
 * Replaces $env-VAR_NAME placeholders in a file with process.env values.
 * Usage: ts-node scripts/resolveYamlEnvs.ts <inputFile> <outputFile>
 */
import * as fs from 'fs';
import * as path from 'path';

const argv = process.argv.slice(2);
const inputFile = argv[0];
const outputFile = argv[1];

if (!inputFile || !outputFile) {
  console.error('Usage: ts-node scripts/resolveYamlEnvs.ts <inputFile> <outputFile>');
  process.exit(1);
}

const inputPath = path.resolve(process.cwd(), inputFile);
const outputPath = path.resolve(process.cwd(), outputFile);

let content = fs.readFileSync(inputPath, 'utf8');

const envPlaceholderRegex = /\$env-([A-Za-z0-9_]+)/g;
let hasMissingEnv = false;
content = content.replace(envPlaceholderRegex, (_match, varName: string) => {
  const value = process.env[varName];
  if (value === undefined) {
    console.error(`Error: environment variable ${varName} is not set (used in $env-${varName})`);
    hasMissingEnv = true;
    return '';
  }
  return value;
});
if (hasMissingEnv) {
  process.exit(1);
}

fs.writeFileSync(outputPath, content, 'utf8');
console.log('Wrote', outputPath);
