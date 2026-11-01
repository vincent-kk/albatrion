import { build } from 'esbuild';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';

/**
 * Freeze production React browser bundles before any quiet observation or measurement.
 * @param root - New external .noindex directory; existing evidence is never overwritten
 * @param stageRoot - Existing iv-5 preparation containing inputs.json and bundles/A/index.mjs
 * @returns Path-free input evidence, including product and compiled-page SHA-256 hashes
 */
export async function prepareBundles(root: string, stageRoot?: string) {
  assert.ok(
    root.endsWith('.noindex') && !fs.existsSync(root),
    'Use a new .noindex directory',
  );
  const repository = path.resolve('../..', '..');
  const require = createRequire(path.resolve('package.json'));
  const sources: Record<string, string> = {
    L: path.resolve(
      '../../../node_modules/@canard/schema-form_0.16.1/dist/index.mjs',
    ),
    E: path.resolve('../../canard/schema-form/dist/index.mjs'),
  };
  let stageProof: object | null = null;
  if (stageRoot) {
    const prepared = JSON.parse(
      fs.readFileSync(path.join(stageRoot, 'inputs.json'), 'utf8'),
    );
    assert.equal(
      prepared.startCommit,
      '0eb03ff3bb54bf06af95271d157aefece1b9bf32',
    );
    assert.equal(prepared.sourceProof.stageStartAllBlobsMatch, true);
    sources.S = path.join(stageRoot, 'bundles/A/index.mjs');
    const expected = prepared.files['bundles/A/index.mjs'];
    const digest = createHash('sha256')
      .update(fs.readFileSync(sources.S))
      .digest('hex');
    assert.equal(digest, expected.sha256);
    stageProof = {
      commit: prepared.startCommit,
      sha256: digest,
      sourceProof: prepared.sourceProof,
      preparation: 'branch-switch/tools/iv-5/prepare.mjs',
    };
  }
  const productDiff = execFileSync(
    'git',
    [
      'diff',
      '5d1348ed1',
      '--',
      'packages/canard/schema-form',
      ':!packages/canard/schema-form/architecture',
    ],
    { cwd: repository, encoding: 'utf8' },
  );
  assert.equal(productDiff, '', 'Product must equal E baseline');
  fs.mkdirSync(root, { recursive: true });
  const bundles: Record<string, object> = {};
  for (const lane of ['L', 'S', 'E'].filter((lane) => lane in sources)) {
    const output = path.join(root, lane);
    fs.mkdirSync(output);
    await build({
      entryPoints: [path.resolve('browser-bench/interaction/harness.tsx')],
      bundle: true,
      format: 'iife',
      platform: 'browser',
      jsx: 'automatic',
      outfile: path.join(output, 'bundle.js'),
      define: {
        'process.env.NODE_ENV': '"production"',
        __IR0_LANE__: JSON.stringify(lane),
      },
      alias: {
        '@canard/schema-form': sources[lane],
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
    const product = fs.readFileSync(sources[lane]);
    const page = fs.readFileSync(path.join(output, 'bundle.js'));
    bundles[lane] = {
      product: {
        sha256: createHash('sha256').update(product).digest('hex'),
        bytes: product.length,
      },
      browser: {
        sha256: createHash('sha256').update(page).digest('hex'),
        bytes: page.length,
      },
    };
  }
  const inputs = {
    preparedAt: new Date().toISOString(),
    productCommit: '5d1348ed16054efa1ec431945eb00472f4eef7f1',
    toolCommit: execFileSync('git', ['rev-parse', 'HEAD'], {
      encoding: 'utf8',
    }).trim(),
    lanes: Object.keys(bundles),
    bundles,
    stageProof,
    stageOmission: stageRoot
      ? null
      : 'Existing lane preparation not supplied; S is optional.',
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
    viewport: { width: 900, height: 700 },
    productionReact: true,
  };
  fs.writeFileSync(
    path.join(root, 'inputs.json'),
    JSON.stringify(inputs, null, 2) + '\n',
  );
  return inputs;
}
