/**
 * Unified declaration build; workspace manifests opt into a parallel .d.cts graph.
 *
 * Runs: tsc → tsc-alias → ESM extension repair → optional CommonJS declaration graph
 *
 * Usage:
 *   node buildTypes.mjs [--tsconfig <path>] [--outDir <dir>]
 *
 * Defaults:
 *   --tsconfig ./tsconfig.declarations.json
 *   --outDir   dist
 */

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

import { emitCommonJsDeclarations } from './utils/emitCommonJsDeclarations.mjs';
import { fixDtsExtensions } from './utils/fixDtsExtensions.mjs';

const args = process.argv.slice(2);

function getArg(name, defaultValue) {
  const index = args.indexOf(name);
  if (index !== -1 && args[index + 1]) {
    return args[index + 1];
  }
  return defaultValue;
}

const tsconfig = getArg('--tsconfig', './tsconfig.declarations.json');
const outDir = getArg('--outDir', 'dist');

const execOptions = { stdio: 'inherit' };

execSync(`tsc -p ${tsconfig}`, execOptions);
execSync(`tsc-alias -p ${tsconfig}`, execOptions);

const { filesProcessed, importsFixed } = fixDtsExtensions(outDir);
if (filesProcessed > 0) {
  console.log(
    `Fixed ${importsFixed} imports in ${filesProcessed} .d.ts files.`,
  );
}

const manifest = JSON.parse(readFileSync('package.json', 'utf8'));
const commonJsCount = emitCommonJsDeclarations(outDir, manifest);
if (commonJsCount) console.log(`Emitted ${commonJsCount} CommonJS declarations.`);
