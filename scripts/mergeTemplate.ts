/**
 * Merges all CloudFormation YAML under a stack directory into a single template file.
 * Usage: ts-node scripts/mergeTemplate.ts <inDir> <outFile> <description> [--fix-transform]
 */
import * as fs from 'fs';
import * as path from 'path';

/** Repo root (Web/), not process.cwd() — npm/npx can run with an unexpected cwd on CI. */
const projectRoot = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const fixTransform = args.includes('--fix-transform');
const positional = args.filter((a) => a !== '--fix-transform');

const inDir = path.resolve(projectRoot, positional[0] ?? '');
const outFile = path.resolve(projectRoot, positional[1] ?? '');
const description = positional[2] ?? '';

if (!inDir || !outFile || !description) {
  console.error('Usage: mergeTemplate.ts <inDir> <outFile> <description> [--fix-transform]');
  process.exit(1);
}

if (!fs.existsSync(inDir)) {
  console.error(`Input directory not found: ${inDir}`);
  console.error(
    'Run from the Web repo root (where package.json and cloudformation/stacks/ live).',
  );
  process.exit(1);
}

const SAM_TRANSFORM = "'AWS::Serverless-2016-10-31'";

function fixTransformEmptyDescription(content: string): string {
  return content.replace(
    /^Transform:\nDescription:/m,
    `Transform:\n  - ${SAM_TRANSFORM}\nDescription:`,
  );
}

function removeOrphanTransformItem(content: string): string {
  let s = content.replace(
    new RegExp(`\n  - ${SAM_TRANSFORM}\nParameters:`, 'g'),
    '\nParameters:',
  );
  s = s.replace(new RegExp(`\n  - ${SAM_TRANSFORM}\nGlobals:`, 'g'), '\nGlobals:');
  return s;
}

function applyTransformFixes(content: string): string {
  return removeOrphanTransformItem(fixTransformEmptyDescription(content));
}

function setDescription(content: string, newDescription: string): string {
  return content.replace(/^Description: .*$/m, `Description: ${newDescription}`);
}

function assertMergedOutputWritten(): void {
  if (!fs.existsSync(outFile)) {
    console.error(`Merge failed: output not written at ${outFile}`);
    process.exit(1);
  }
  if (fs.statSync(outFile).size === 0) {
    console.error(`Merge failed: output is empty at ${outFile}`);
    process.exit(1);
  }
}

function main(): void {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const merger = require('cloudformation-yml-merger') as {
    default: (inputDir: string, outputFile: string) => void;
  };

  try {
    merger.default(inDir, outFile);
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
