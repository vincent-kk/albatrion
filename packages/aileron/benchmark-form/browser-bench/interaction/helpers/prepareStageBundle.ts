// Invoked with node --import tsx; explicit CLI arguments select frozen local product inputs.
import { build } from 'esbuild';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';

/**
 * Freeze one IR-1 lane using the existing IR-0 production interaction harness.
 * @param args - --root, --lane, --product and --commit identify immutable local inputs.
 * @returns Resolves after the page and hash manifest are saved; existing lanes are refused.
 */
export async function prepareStageBundle(args: string[]) {
  const options = Object.fromEntries(
    args.map((arg) => {
      const at = arg.indexOf('=');
      return [arg.slice(2, at), arg.slice(at + 1)];
    }),
  );
  assert.ok(options.root && options.lane && options.product && options.commit);
  const root = path.resolve(options.root);
  assert.ok(root.endsWith('.noindex'));
  const output = path.join(root, options.lane);
  assert.ok(!fs.existsSync(output), 'Never overwrite a frozen lane');
  assert.ok(!fs.existsSync(path.join(root, 'formal-start.json')));
  fs.mkdirSync(output, { recursive: true });
  const productPath = path.resolve(options.product);
  const repository = path.resolve('../../..');
  await build({
    entryPoints: [
      path.resolve(
        options.harness === 'ir-6'
          ? 'browser-bench/interaction/validationAfterPaint.tsx'
          : 'browser-bench/interaction/harness.tsx',
      ),
    ],
    bundle: true,
    format: 'iife',
    platform: 'browser',
    jsx: 'automatic',
    outfile: path.join(output, 'bundle.js'),
    define: {
      'process.env.NODE_ENV': '"production"',
      __IR0_LANE__: options.lane === 'L' ? '"L"' : '"E"',
    },
    alias: {
      '@canard/schema-form': productPath,
      '@canard/schema-form-ajv8-plugin': path.resolve(
        '../../canard/schema-form-ajv8-plugin/dist/default/index.mjs',
      ),
    },
    nodePaths: [path.join(repository, 'node_modules')],
    logLevel: 'warning',
  });
  fs.writeFileSync(
    path.join(output, 'index.html'),
    '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><div id="root" style="width:800px"></div><script src="./bundle.js"></script></body></html>',
  );
  const manifestPath = path.join(root, 'inputs.json');
  const require = createRequire(path.resolve('package.json'));
  const inputs = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    : {
        stage: 'IR-1',
        preparedAt: new Date().toISOString(),
        lanes: [],
        bundles: {},
        viewport: { width: 900, height: 700 },
        productionReact: true,
        versions: {
          node: process.version,
          react: require('react/package.json').version,
          playwright: require('playwright/package.json').version,
          esbuild: require('esbuild/package.json').version,
          ajv: createRequire(
            path.resolve('../../canard/schema-form-ajv8-plugin/package.json'),
          )('ajv/package.json').version,
        },
        environment: {
          cpu: os.cpus()[0].model,
          logicalCpus: os.cpus().length,
          platform: os.platform(),
          arch: os.arch(),
          release: os.release(),
          memoryGiB: os.totalmem() / 2 ** 30,
        },
      };
  const digest = (file: string) => {
    const bytes = fs.readFileSync(file);
    return {
      sha256: createHash('sha256').update(bytes).digest('hex'),
      bytes: bytes.length,
    };
  };
  inputs.lanes.push(options.lane);
  inputs.bundles[options.lane] = {
    commit: options.commit,
    toolCommit: execFileSync('git', ['rev-parse', 'HEAD'], {
      encoding: 'utf8',
    }).trim(),
    product: digest(productPath),
    browser: digest(path.join(output, 'bundle.js')),
  };
  fs.writeFileSync(manifestPath, JSON.stringify(inputs, null, 2) + '\n');
  console.log('IR1_LANE_FROZEN ' + options.lane);
}

await prepareStageBundle(process.argv.slice(2));
