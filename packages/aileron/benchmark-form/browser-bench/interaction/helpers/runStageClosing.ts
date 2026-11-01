import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

import cases from '../../../fixtures/input-responsiveness/closing-cases.json';
import { observeCpu } from './observeCpu';
import { prepareStageClosingBundles } from './prepareStageClosingBundles';
import { readAncestorPids } from './readAncestorPids';
import { samplePageWithCpu } from './samplePageWithCpu';
import { sampleStageClosingPage } from './sampleStageClosingPage';
import { serializeEvidence } from './serializeEvidence';
import { checkStageClosingBuildRecord } from './stageClosing/checkStageClosingBuildRecord';
import { REGISTERED_STAGE_CLOSING_RULES as rules } from './stageClosing/registeredStageClosingRules';
import { stageClosingOrder } from './stageClosing/stageClosingOrder';
import { summarizePage } from './summarizePage';

/** Closing-only runner preserves the original IR-6 branch and refuses provisional formal windows. */
export async function runStageClosing(options: Record<string, string>) {
  const root = path.resolve(options.root),
    smoke = options.action === 'smoke';
  assert.ok(
    fs.existsSync(chromium.executablePath()),
    'Chromium missing; installation needs approval',
  );
  if (options.action === 'prepare') {
    assert.ok(
      !options['frozen-baselines-root'],
      'Amendment 3 requires fresh clean B/S builds',
    );
    const inputs = await prepareStageClosingBundles(
      root,
      options['baseline-root'],
      options['stage-root'],
      options['rules-commit'],
      options.provisional === 'true',
    );
    console.log('CLOSING_PREPARED ' + inputs.lanes.join(','));
    return;
  }
  const inputs = JSON.parse(
    fs.readFileSync(path.join(root, 'inputs.json'), 'utf8'),
  );
  assert.equal(inputs.stage, 'closing');
  checkStageClosingBuildRecord(root, inputs.bundles);
  assert.equal(inputs.ruleVersion, rules.version);
  const repository = execFileSync('git', ['rev-parse', '--show-toplevel'], {
    encoding: 'utf8',
  }).trim();
  assert.equal(
    createHash('sha256')
      .update(fs.readFileSync(path.join(repository, rules.rulesPath)))
      .digest('hex'),
    inputs.rulesSha256,
    'Active registered rules match frozen inputs',
  );
  for (const lane of inputs.lanes)
    for (const kind of ['browser', 'product']) {
      const file =
        kind === 'browser'
          ? path.join(root, lane, 'bundle.js')
          : path.join(root, 'products', lane + '.mjs');
      assert.equal(
        createHash('sha256').update(fs.readFileSync(file)).digest('hex'),
        inputs.bundles[lane][kind].sha256,
        'Frozen ' + kind + ' hash',
      );
    }
  const selected = options.fixture
    ? cases.filter((id) => id === options.fixture)
    : cases;
  assert.ok(selected.length);
  const count = smoke ? 1 : rules.pages,
    warmup = smoke ? 1 : rules.warmup;
  const toolCommit = execFileSync('git', ['rev-parse', 'HEAD'], {
    encoding: 'utf8',
  }).trim();
  const toolHashes = Object.fromEntries(
    execFileSync(
      'rg',
      ['--files', 'browser-bench', 'fixtures/input-responsiveness'],
      { encoding: 'utf8' },
    )
      .trim()
      .split('\n')
      .map((file) => [
        file,
        createHash('sha256').update(fs.readFileSync(file)).digest('hex'),
      ]),
  );
  if (!smoke) {
    assert.equal(inputs.provisional, false, 'Provisional F is smoke-only');
    assert.deepEqual(selected, cases, 'Formal window covers every row');
    assert.ok(
      !fs.existsSync(path.join(root, 'formal-start.json')),
      'Never restart a started window',
    );
    const priorSmoke = JSON.parse(
      fs.readFileSync(path.join(root, 'smoke-complete.json'), 'utf8'),
    );
    assert.deepEqual(priorSmoke.cases, cases);
    assert.deepEqual(priorSmoke.inputs, inputs);
    const excluded = readAncestorPids(),
      quiet = await observeCpu(30000, excluded);
    const attempt = {
      at: new Date().toISOString(),
      samples: 0,
      approved: quiet.heavy.length === 0,
      quiet,
      policy: { observationMs: 30000, maximumExternalPidPercent: 30, excluded },
    };
    fs.writeFileSync(
      path.join(root, 'start-' + attempt.at.replace(/[:.]/g, '-') + '.json'),
      serializeEvidence(attempt, root),
    );
    if (!attempt.approved) {
      console.log('CLOSING_START_REFUSED samples=0');
      return;
    }
    fs.writeFileSync(
      path.join(root, 'formal-start.json'),
      serializeEvidence(
        {
          at: attempt.at,
          mode: 'quiet',
          count,
          warmup,
          cases,
          lanes: inputs.lanes,
          toolCommit,
          toolHashes,
        },
        root,
      ),
    );
    console.log('CLOSING_FORMAL_STARTED');
  }
  const browser = await chromium.launch({ headless: true });
  const output = path.join(root, smoke ? 'smoke' : 'raw');
  fs.mkdirSync(output);
  const samples: object[] = [],
    startedAt = new Date().toISOString();
  try {
    for (const id of selected) {
      for (let index = -warmup; index < count; index++) {
        for (const lane of stageClosingOrder(id, index)) {
          const page = await samplePageWithCpu(
            browser,
            root,
            lane,
            id,
            sampleStageClosingPage,
          );
          if (index >= 0) {
            const file = id + '-' + lane + '-' + index + '.json';
            fs.writeFileSync(
              path.join(output, file),
              serializeEvidence(page, root),
            );
            samples.push({
              id,
              lane,
              index,
              file,
              summary: summarizePage(page),
            });
          }
        }
      }
      console.log(
        (smoke ? 'SMOKE' : 'MEASURED') + ' ' + id + ' pages/lane=' + count,
      );
    }
    fs.writeFileSync(
      path.join(root, smoke ? 'smoke-complete.json' : 'complete.json'),
      serializeEvidence(
        {
          stage: 'closing',
          mode: 'quiet',
          smoke,
          count,
          warmup,
          startedAt,
          endedAt: new Date().toISOString(),
          toolCommit,
          toolHashes,
          chromium: browser.version(),
          cases: selected,
          inputs,
          samples,
        },
        root,
      ),
    );
    console.log(smoke ? 'CLOSING_SMOKE_OK' : 'CLOSING_WINDOW_COMPLETE');
  } catch (error) {
    fs.writeFileSync(
      path.join(root, smoke ? 'smoke-failure.json' : 'failure.json'),
      serializeEvidence(
        { samples: samples.length, message: String(error) },
        root,
      ),
    );
    throw error;
  } finally {
    await browser.close();
  }
}
