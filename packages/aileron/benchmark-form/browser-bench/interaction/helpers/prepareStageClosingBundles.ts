import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { REGISTERED_STAGE_CLOSING_RULES as rules } from './stageClosing/registeredStageClosingRules';

/** Freeze clean pinned B/S and local L/F products. */
export async function prepareStageClosingBundles(
  root: string,
  baseline: string | undefined,
  stage: string | undefined,
  rulesCommit?: string,
  provisional = false,
) {
  assert.ok(
    baseline && stage,
    'Closing requires fresh clean B/S roots; frozen baselines are not accepted',
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
  assert.ok(baseline && stage);
  assert.equal(git(['rev-parse', 'HEAD'], baseline), rules.baselineCommit);
  assert.equal(git(['rev-parse', 'HEAD'], stage), rules.stageCommit);
  for (const cwd of [baseline, stage])
    assert.equal(
      git(['status', '--porcelain', '--untracked-files=all', ...scope], cwd),
      '',
      'Clean baseline product scope',
    );
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
      product: path.resolve(
        baseline,
        'packages/canard/schema-form/dist/index.mjs',
      ),
      commit: rules.baselineCommit,
    },
    S: {
      product: path.resolve(
        stage,
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
  fs.writeFileSync(manifest, JSON.stringify(inputs, null, 2) + '\n');
  return inputs;
}
