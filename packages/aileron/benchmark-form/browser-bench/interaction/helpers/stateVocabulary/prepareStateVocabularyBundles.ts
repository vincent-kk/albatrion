import { build } from 'esbuild';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { REGISTERED_STATE_VOCABULARY_RULES as rules } from './registeredStateVocabularyRules';

/** Freeze clean B/F builds and report bundles; formal preparation requires committed registration. */
export async function prepareStateVocabularyBundles(
  root: string,
  options: Record<string, string>,
) {
  assert.ok(
    root.endsWith('.noindex') && !fs.existsSync(root),
    'Never overwrite frozen inputs',
  );
  const repository = execFileSync('git', ['rev-parse', '--show-toplevel'], {
    encoding: 'utf8',
  }).trim();
  const provisional = options.provisional === 'true';
  assert.ok(
    provisional || options['rules-commit'],
    'Formal preparation requires rules-commit',
  );
  const record = JSON.parse(fs.readFileSync(options['build-record'], 'utf8'));
  fs.mkdirSync(path.join(root, 'products'), { recursive: true });
  for (const lane of ['B', 'F']) {
    const source = options[lane === 'B' ? 'baseline-root' : 'candidate-root'];
    const commit =
      options[lane === 'B' ? 'baseline-commit' : 'candidate-commit'];
    assert.ok(source && commit, 'Explicit clean root and commit for ' + lane);
    assert.equal(
      execFileSync('git', ['rev-parse', 'HEAD'], {
        cwd: source,
        encoding: 'utf8',
      }).trim(),
      commit,
    );
    assert.equal(
      execFileSync(
        'git',
        [
          'status',
          '--porcelain',
          '--untracked-files=all',
          '--',
          'packages/canard/schema-form/src',
        ],
        { cwd: source, encoding: 'utf8' },
      ).trim(),
      '',
    );
    const product = path.join(root, 'products', lane + '.mjs');
    fs.copyFileSync(
      path.join(source, 'packages/canard/schema-form/dist/index.mjs'),
      product,
    );
    execFileSync(
      process.execPath,
      [
        '--import',
        'tsx',
        'browser-bench/interaction/helpers/prepareStageBundle.ts',
        '--root=' + root,
        '--lane=' + lane,
        '--product=' + product,
        '--commit=' + commit,
        '--harness=closing',
      ],
      { stdio: 'inherit' },
    );
    await build({
      entryPoints: [
        'browser-bench/interaction/helpers/stateVocabulary/reportPage.ts',
      ],
      bundle: true,
      format: 'iife',
      nodePaths: [path.join(repository, 'node_modules')],
      platform: 'browser',
      jsx: 'automatic',
      outfile: path.join(root, lane, 'report.js'),
      define: { 'process.env.NODE_ENV': '"production"', __IR0_LANE__: '"E"' },
      alias: {
        '@canard/schema-form': product,
        '@canard/schema-form-ajv8-plugin': path.resolve(
          '../../canard/schema-form-ajv8-plugin/dist/default/index.mjs',
        ),
      },
      logLevel: 'warning',
    });
    fs.writeFileSync(
      path.join(root, lane, 'report.html'),
      '<!DOCTYPE html><div id="root"></div><script src="./report.js"></script>',
    );
  }
  const inputs = JSON.parse(
    fs.readFileSync(path.join(root, 'inputs.json'), 'utf8'),
  );
  for (const lane of ['B', 'F']) {
    inputs.bundles[lane].report = {
      sha256: createHash('sha256')
        .update(fs.readFileSync(path.join(root, lane, 'report.js')))
        .digest('hex'),
    };
    assert.equal(record.lanes[lane].commit, inputs.bundles[lane].commit);
    assert.equal(
      record.lanes[lane].product.sha256,
      inputs.bundles[lane].product.sha256,
    );
    assert.equal(record.lanes[lane].exitCode, 0);
    assert.equal(record.lanes[lane].cleanProductScope, true);
  }
  inputs.stage = rules.stage;
  inputs.provisional = provisional;
  inputs.preregisteredCommit =
    options['rules-commit'] ??
    execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const ruleBytes = fs.readFileSync(path.join(repository, rules.rulesPath));
  if (!provisional)
    assert.deepEqual(
      execFileSync('git', [
        'show',
        inputs.preregisteredCommit + ':' + rules.rulesPath,
      ]),
      ruleBytes,
    );
  inputs.ruleVersion = rules.version;
  inputs.rulesSha256 = createHash('sha256').update(ruleBytes).digest('hex');
  fs.writeFileSync(
    path.join(root, 'inputs.json'),
    JSON.stringify(inputs, null, 2) + '\n',
  );
  fs.writeFileSync(
    path.join(root, 'clean-build-record.json'),
    JSON.stringify(record, null, 2) + '\n',
  );
  return inputs;
}
