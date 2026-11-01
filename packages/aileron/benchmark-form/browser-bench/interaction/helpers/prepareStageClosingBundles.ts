import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { REGISTERED_STAGE_CLOSING_RULES as rules } from './stageClosing/registeredStageClosingRules';

/** Freeze clean pinned B/S and local L/F, plus the explicitly named non-product D8 probe. */
export async function prepareStageClosingBundles(
  root: string,
  baseline: string | undefined,
  stage: string | undefined,
  rulesCommit?: string,
  frozenBaselines?: string,
  provisional = false,
) {
  assert.ok(
    (baseline && stage) || frozenBaselines,
    'Closing requires clean B/S roots or verified frozen baselines',
  );
  assert.ok(
    root.endsWith('.noindex') && !fs.existsSync(root),
    'Never overwrite frozen products',
  );
  const repository = execFileSync('git', ['rev-parse', '--show-toplevel'], {
    encoding: 'utf8',
  }).trim();
  const git = (args: string[], cwd = repository) =>
    execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
  const scope = ['--', 'packages/canard/schema-form/src'];
  const cached = frozenBaselines
    ? JSON.parse(
        fs.readFileSync(path.join(frozenBaselines, 'inputs.json'), 'utf8'),
      )
    : undefined;
  if (cached) {
    assert.equal(cached.stage, 'closing');
    for (const lane of ['B', 'S']) {
      const expected = lane === 'B' ? rules.baselineCommit : rules.stageCommit;
      assert.equal(cached.bundles[lane].commit, expected);
      assert.equal(
        cached.sourceProof[lane],
        git(['ls-tree', '-r', expected, ...scope]),
      );
      const file = path.join(frozenBaselines ?? '', 'products', lane + '.mjs');
      assert.equal(
        createHash('sha256').update(fs.readFileSync(file)).digest('hex'),
        cached.bundles[lane].product.sha256,
        'Frozen baseline product hash',
      );
    }
  } else {
    assert.ok(baseline && stage);
    assert.equal(git(['rev-parse', 'HEAD'], baseline), rules.baselineCommit);
    assert.equal(git(['rev-parse', 'HEAD'], stage), rules.stageCommit);
    for (const cwd of [baseline, stage])
      assert.equal(
        git(['status', '--porcelain', '--untracked-files=all', ...scope], cwd),
        '',
        'Clean baseline product scope',
      );
  }
  assert.equal(
    git(['status', '--porcelain', '--untracked-files=all', ...scope]),
    '',
    'Clean F product scope',
  );
  const head = git(['rev-parse', 'HEAD']);
  if (rulesCommit) {
    git(['merge-base', '--is-ancestor', rulesCommit, head]);
    assert.equal(
      git(['show', rulesCommit + ':' + rules.rulesPath]),
      fs.readFileSync(path.join(repository, rules.rulesPath), 'utf8').trim(),
      'Registered rules equal committed rules',
    );
  }
  fs.mkdirSync(path.join(root, 'products'), { recursive: true });
  const source = {
    L: {
      product: path.resolve(
        '../../../node_modules/@canard/schema-form_0.16.1/dist/index.mjs',
      ),
      commit: 'public-0.16.1',
    },
    B: {
      product: frozenBaselines
        ? path.join(frozenBaselines, 'products/B.mjs')
        : path.resolve(
            baseline ?? '',
            'packages/canard/schema-form/dist/index.mjs',
          ),
      commit: rules.baselineCommit,
    },
    S: {
      product: frozenBaselines
        ? path.join(frozenBaselines, 'products/S.mjs')
        : path.resolve(
            stage ?? '',
            'packages/canard/schema-form/dist/index.mjs',
          ),
      commit: rules.stageCommit,
    },
    F: {
      product: path.resolve('../../canard/schema-form/dist/index.mjs'),
      commit: head,
    },
  };
  for (const [lane, entry] of Object.entries(source)) {
    const product = path.join(root, 'products', lane + '.mjs');
    fs.copyFileSync(entry.product, product);
    execFileSync(
      process.execPath,
      [
        '--import',
        'tsx',
        'browser-bench/interaction/helpers/prepareStageBundle.ts',
        '--root=' + root,
        '--lane=' + lane,
        '--product=' + product,
        '--commit=' + entry.commit,
        '--harness=closing',
      ],
      { stdio: 'inherit' },
    );
  }
  const probe = path.join(root, 'products', 'probe.mjs');
  const original = fs.readFileSync(source.F.product, 'utf8');
  assert.equal(
    original.split('!node.runtime.revisionObserved && ').length,
    2,
    'Exactly one probe omission guard',
  );
  assert.equal(
    original.split('node.runtime.revisionObserved = true;').length,
    2,
    'Exactly one probe latch write',
  );
  fs.writeFileSync(
    probe,
    original
      .replace('!node.runtime.revisionObserved && ', '')
      .replace('node.runtime.revisionObserved = true;', ''),
  );
  execFileSync(
    process.execPath,
    [
      '--import',
      'tsx',
      'browser-bench/interaction/helpers/prepareStageBundle.ts',
      '--root=' + root,
      '--lane=probe',
      '--product=' + probe,
      '--commit=' + head,
      '--harness=closing',
    ],
    { stdio: 'inherit' },
  );
  const manifest = path.join(root, 'inputs.json');
  const inputs = JSON.parse(fs.readFileSync(manifest, 'utf8'));
  inputs.stage = 'closing';
  inputs.provisional = provisional || !rulesCommit;
  inputs.preregisteredCommit = rulesCommit ?? head;
  inputs.ruleVersion = rules.version;
  inputs.rulesSha256 = createHash('sha256')
    .update(fs.readFileSync(path.join(repository, rules.rulesPath)))
    .digest('hex');
  inputs.sourceProof = Object.fromEntries(
    ['B', 'S', 'F'].map((lane) => [
      lane,
      git(['ls-tree', '-r', inputs.bundles[lane].commit, ...scope]),
    ]),
  );
  inputs.probe = {
    name: 'D8-revisionObserved-removed',
    base: head,
    productOnly: false,
    rows: rules.probeRows,
  };
  fs.writeFileSync(manifest, JSON.stringify(inputs, null, 2) + '\n');
  return inputs;
}
