import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { REGISTERED_ROUND6_RULES } from './validationAfterPaint/registeredRound6Rules';

/** Freeze local L/E/F products through the shared production bundle preparer.
 * @param root - New external .noindex directory; existing lanes are never overwritten.
 * @param baseline - Built, clean facd72a71 checkout.
 * @param rulesCommit - Registered owner-rule commit; omitted preserves first-window metadata.
 * @returns Frozen product/browser hashes, source proof and the exact rule version. */
export async function prepareValidationAfterPaintBundles(
  root: string,
  baseline?: string,
  rulesCommit?: string,
) {
  assert.ok(
    baseline,
    '--baseline-root must identify the built facd72a71 checkout',
  );
  assert.ok(root.endsWith('.noindex') && !fs.existsSync(root));
  const git = (args: string[], cwd?: string) =>
    execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
  const baselineCommit = git(['rev-parse', 'HEAD'], baseline);
  assert.equal(baselineCommit, 'facd72a71c44a798f5484827509073a27fb678a3');
  const productScope = ['--', 'packages/canard/schema-form/src'];
  assert.equal(git(['diff', 'HEAD', ...productScope], baseline), '');
  assert.equal(git(['diff', 'HEAD', ...productScope]), '');
  const head = git(['rev-parse', 'HEAD']);
  const sources = {
    L: {
      product: path.resolve(
        '../../../node_modules/@canard/schema-form_0.16.1/dist/index.mjs',
      ),
      commit: 'public-0.16.1',
    },
    E: {
      product: path.join(
        path.resolve(baseline),
        'packages/canard/schema-form/dist/index.mjs',
      ),
      commit: baselineCommit,
    },
    F: {
      product: path.resolve('../../canard/schema-form/dist/index.mjs'),
      commit: head,
    },
  };
  for (const [lane, source] of Object.entries(sources))
    execFileSync(
      process.execPath,
      [
        '--import',
        'tsx',
        'browser-bench/interaction/helpers/prepareStageBundle.ts',
        `--root=${root}`,
        `--lane=${lane}`,
        `--product=${source.product}`,
        `--commit=${source.commit}`,
        '--harness=ir-6',
      ],
      { stdio: 'inherit' },
    );
  const manifest = path.join(root, 'inputs.json');
  const inputs = JSON.parse(fs.readFileSync(manifest, 'utf8'));
  inputs.stage = 'IR-6';
  inputs.preregisteredCommit = rulesCommit ?? 'cfd4a9e2a';
  if (rulesCommit) {
    assert.equal(rulesCommit, REGISTERED_ROUND6_RULES.commit);
    inputs.ruleVersion = REGISTERED_ROUND6_RULES.version;
    inputs.rulesSha256 = createHash('sha256')
      .update(
        execFileSync('git', [
          'show',
          rulesCommit + ':' + REGISTERED_ROUND6_RULES.verificationPath,
        ]),
      )
      .digest('hex');
  }
  inputs.sourceProof = {
    E: git(['ls-tree', '-r', baselineCommit, ...productScope], baseline),
    F: git(['ls-tree', '-r', head, ...productScope]),
  };
  fs.writeFileSync(manifest, JSON.stringify(inputs, null, 2) + '\n');
  return inputs;
}
