import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';

import cases from '../../../../fixtures/input-responsiveness/closing-cases.json';
import { getStageClosingFixture } from '../../../../fixtures/input-responsiveness/getStageClosingFixture';
import type { StageClosingPage } from '../../stageClosingTypes';
import { readPostPaintBusy } from '../stageClosing/readPostPaintBusy';
import { summarizePage } from '../summarizePage';
import type { SampleResult } from '../summarizeResults';
import { checkStateVocabularyInputs } from './checkStateVocabularyInputs';
import { checkStateVocabularyIntegrity } from './checkStateVocabularyIntegrity';
import { deriveStateVocabularyReports } from './deriveStateVocabularyReports';
import { deriveStateVocabularyResults } from './deriveStateVocabularyResults';
import { REGISTERED_STATE_VOCABULARY_RULES as rules } from './registeredStateVocabularyRules';
import { renderStateVocabularyTables } from './renderStateVocabularyTables';
import type { StateVocabularyReport } from './reportTypes';
import { stateVocabularyOrder } from './stateVocabularyOrder';

/** Verify complete raw coverage, registration, rotation, identity and exact reproducibility without trusting saved summaries. */
export function checkStateVocabularyResults(
  root: string,
  write: boolean,
  smokeOnly = false,
) {
  const read = (name: string) => {
    const file = path.join(root, name),
      compressed = !fs.existsSync(file);
    return JSON.parse(
      compressed
        ? gunzipSync(fs.readFileSync(file + '.gz')).toString()
        : fs.readFileSync(file, 'utf8'),
    );
  };
  const complete = read(smokeOnly ? 'smoke-complete.json' : 'complete.json'),
    inputs = read('inputs.json');
  assert.deepEqual(complete.inputs, inputs);
  assert.deepEqual(complete.cases, cases);
  assert.equal(inputs.stage, rules.stage);
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
  checkStateVocabularyInputs(root);
  assert.equal(complete.count, smokeOnly ? 1 : rules.pages);
  assert.equal(complete.warmup, smokeOnly ? 1 : rules.warmup);
  assert.equal(complete.smoke, smokeOnly);
  if (!smokeOnly) {
    assert.equal(inputs.provisional, false, 'Formal F is not provisional');
    const start = read('formal-start.json');
    assert.equal(start.mode, 'quiet');
    checkStateVocabularyIntegrity(
      repository,
      inputs.preregisteredCommit,
      complete.toolCommit,
      start.toolHashes,
    );
    assert.deepEqual(start.toolHashes, complete.toolHashes);
    assert.equal(start.toolCommit, complete.toolCommit);
    assert.deepEqual(read('smoke-complete.json').inputs, inputs);
    const attempt = fs
      .readdirSync(root)
      .filter((name) => name.startsWith('start-'))
      .map(read)
      .find((entry) => entry.at === start.at);
    assert.ok(attempt);
    assert.equal(attempt.approved, true);
    assert.equal(attempt.samples, 0);
    assert.equal(attempt.policy.observationMs, 30000);
    assert.equal(attempt.policy.maximumExternalPidPercent, 30);
    assert.deepEqual(attempt.quiet.heavy, []);
    const git = (args: string[]) =>
      execFileSync('git', args, { encoding: 'utf8' }).trim();
    git([
      'merge-base',
      '--is-ancestor',
      inputs.preregisteredCommit,
      complete.toolCommit,
    ]);
    assert.equal(
      createHash('sha256')
        .update(
          execFileSync('git', [
            'show',
            inputs.preregisteredCommit + ':' + rules.rulesPath,
          ]),
        )
        .digest('hex'),
      inputs.rulesSha256,
    );
    assert.ok(
      git([
        'show',
        inputs.preregisteredCommit + ':' + rules.verificationPath,
      ]).includes('## 상태 어휘 단계 측정 — 측정 전 고정 규칙'),
    );
    assert.ok(
      Date.parse(
        git(['show', '-s', '--format=%cI', inputs.preregisteredCommit]),
      ) <= Date.parse(attempt.quiet.startedAt),
    );
    assert.ok(Date.parse(complete.startedAt) >= Date.parse(start.at));
    assert.ok(Date.parse(complete.endedAt) >= Date.parse(complete.startedAt));
  }
  const pages: Record<string, StageClosingPage> =
    smokeOnly && fs.existsSync(path.join(root, 'smoke-pages.json.gz'))
      ? read('smoke-pages.json')
      : fs.existsSync(path.join(root, 'pages.json.gz'))
        ? read('pages.json')
        : Object.fromEntries(
            complete.samples.map((s: SampleResult) => [
              s.file,
              read((smokeOnly ? 'smoke/' : 'raw/') + s.file),
            ]),
          );
  const samples: SampleResult[] = complete.samples;
  let expected = 0;
  for (const id of cases)
    for (let index = 0; index < complete.count; index++) {
      const order = stateVocabularyOrder(index);
      expected += order.length;
      assert.deepEqual(
        samples
          .filter((s) => s.id === id && s.index === index)
          .map((s) => s.lane),
        order,
        'Williams order and coverage',
      );
    }
  assert.equal(samples.length, expected);
  assert.equal(Object.keys(pages).length, expected);
  for (const sample of samples) {
    const page = pages[sample.file],
      fixture = getStageClosingFixture(sample.id);
    assert.deepEqual(summarizePage(page), sample.summary);
    assert.ok(page.externalCpu);
    assert.equal(page.final.inputs, fixture.expectedInputs);
    assert.equal(page.mount.allDeferred, 0);
    assert.ok(Number.isFinite(page.mount.firstPaintedMs));
    assert.equal(
      page.handlers.length,
      fixture.mount || fixture.streamFrames ? 0 : fixture.firstKey ? 1 : 20,
    );
    assert.ok(
      page.handlers.every((h) => h.trusted && Number.isFinite(h.wallMs)),
    );
    assert.equal(page.closing.legacyReset, false);
    assert.equal(page.closing.operations.length, fixture.operation ? 10 : 0);
    assert.equal(
      page.closing.mountPostPaintBusy,
      readPostPaintBusy(
        page.frames,
        page.closing.validatorWork,
        (page.mount.startedAt ?? 0) + (page.mount.firstPaintedMs ?? 0),
        (page.mount.startedAt ?? 0) + 1000,
      ),
    );
    for (const [index, op] of page.closing.operations.entries()) {
      assert.equal(op.index, index + 1);
      assert.equal(op.end - op.start, 1000);
      assert.equal(
        op.nodeChanged,
        fixture.operation !== 'validate' &&
          (sample.lane === 'L' || sample.id !== 'reset-flat-500-same'),
      );
      assert.equal(op.nodeChanged, op.expectedNodeChanged);
      assert.equal(op.nextPainted, op.firstPaint - op.start);
      assert.ok(
        op.paintBoundary >= op.start && op.paintBoundary <= op.firstPaint,
      );
      assert.ok(Number.isFinite(op.callDuration));
      assert.equal(
        op.postPaintBusy,
        readPostPaintBusy(
          page.frames,
          page.closing.validatorWork,
          op.paintBoundary,
          op.end,
        ),
      );
      const operationFrames = page.frames.filter(
        (frame) =>
          frame.startTime < op.end &&
          frame.startTime + frame.duration > op.start,
      );
      assert.equal(
        op.longFrameCount,
        operationFrames.filter((frame) => frame.duration >= 50).length,
      );
      assert.equal(
        op.longestFrame,
        Math.max(0, ...operationFrames.map((frame) => frame.duration)),
      );
      if (index > 0)
        assert.ok(op.start >= page.closing.operations[index - 1].end);
      if (fixture.operation === 'validate')
        assert.ok(Number.isFinite(op.resolutionTime));
      if (sample.id === 'reset-flat-500-replace')
        assert.equal(op.schemaTitle, 'replace-' + (index + 1));
    }
  }
  for (const lane of inputs.lanes)
    for (const kind of ['product', 'browser'])
      assert.match(inputs.bundles[lane][kind].sha256, /^[a-f0-9]{64}$/);
  const reports: StateVocabularyReport[] = read(
    smokeOnly ? 'smoke-reports.json' : 'reports.json',
  );
  assert.equal(reports.length, 3 * complete.count);
  for (const id of rules.reportRows)
    for (let index = 0; index < complete.count; index++) {
      const group = reports.filter((r) => r.id === id && r.index === index);
      assert.deepEqual(
        group.map((r) => r.lane),
        stateVocabularyOrder(index).filter(
          (lane) => id !== 'is-divergent-flat-2000' || lane === 'F',
        ),
      );
      for (const report of group) {
        assert.equal(report.edits, id === 'is-divergent-flat-2000' ? 1 : 100);
        if (id === 'is-divergent-flat-2000') {
          assert.ok(report.read);
          if (!smokeOnly)
            assert.equal(report.read.status, 'ran', 'Formal F getter must run');
          if (report.read.status === 'ran') {
            assert.equal(report.read.first, true);
            assert.equal(report.read.repeated, true);
            assert.ok(
              Number.isFinite(report.read.firstMs) && report.read.firstMs >= 0,
            );
            assert.ok(
              Number.isFinite(report.read.repeatedMs) &&
                report.read.repeatedMs >= 0,
            );
          }
        } else {
          assert.ok(
            report.heap &&
              report.heap.usedSize > 0 &&
              report.heap.totalSize >= report.heap.usedSize,
          );
        }
      }
    }
  const data = deriveStateVocabularyResults(samples, pages);
  for (const [name, value] of Object.entries({
    'derived.json': { ...data, reports: deriveStateVocabularyReports(reports) },
    'decision.json': {
      sv1: data.sv1,
      sv2: data.validatorWork.status,
      gates: data.gates,
    },
    'comparisons.json': data.comparisons,
    'validator-work.json': data.validatorWork,
    'tables.md': renderStateVocabularyTables(data, reports),
  })) {
    const content =
      typeof value === 'string' ? value : JSON.stringify(value, null, 2) + '\n';
    if (write)
      fs.writeFileSync(
        path.join(root, (smokeOnly ? 'smoke-' : '') + name),
        content,
      );
    else
      assert.equal(
        fs.readFileSync(
          path.join(root, (smokeOnly ? 'smoke-' : '') + name),
          'utf8',
        ),
        content,
        name + ' reproduces',
      );
  }
  console.log(
    'SV_RAW_REPRODUCED samples=' +
      samples.length +
      ' gates=' +
      data.gates.map((g) => g.id + ':' + g.status).join(',') +
      ' validatorWork=' +
      data.validatorWork.status,
  );
}
