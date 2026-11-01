import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { REGISTERED_STATE_VOCABULARY_RULES as rules } from './registeredStateVocabularyRules';

/** Verify rule registration and clean build provenance against every frozen artifact. */
export function checkStateVocabularyInputs(root: string) {
  const inputs = JSON.parse(
    fs.readFileSync(path.join(root, 'inputs.json'), 'utf8'),
  );
  const record = JSON.parse(
    fs.readFileSync(path.join(root, 'clean-build-record.json'), 'utf8'),
  );
  const repository = execFileSync('git', ['rev-parse', '--show-toplevel'], {
    encoding: 'utf8',
  }).trim();
  assert.deepEqual(inputs.lanes, ['B', 'F']);
  assert.equal(inputs.stage, rules.stage);
  assert.equal(inputs.ruleVersion, rules.version);
  assert.equal(
    inputs.rulesSha256,
    createHash('sha256')
      .update(fs.readFileSync(path.join(repository, rules.rulesPath)))
      .digest('hex'),
  );
  for (const lane of inputs.lanes) {
    const build = record.lanes[lane];
    assert.equal(build.exitCode, 0);
    assert.equal(build.cleanProductScope, true);
    assert.equal(build.commit, inputs.bundles[lane].commit);
    assert.equal(build.product.sha256, inputs.bundles[lane].product.sha256);
    for (const kind of ['product', 'browser', 'report']) {
      const file =
        kind === 'product'
          ? path.join(root, 'products', lane + '.mjs')
          : path.join(
              root,
              lane,
              kind === 'browser' ? 'bundle.js' : 'report.js',
            );
      assert.equal(
        createHash('sha256').update(fs.readFileSync(file)).digest('hex'),
        inputs.bundles[lane][kind].sha256,
      );
    }
  }
}
