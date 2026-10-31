import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';

import { getValidationAfterPaintFixture } from '../../../fixtures/input-responsiveness/getValidationAfterPaintFixture';
import cases from '../../../fixtures/input-responsiveness/ir-6-cases.json';
import type { ValidationAfterPaintPage } from '../validationAfterPaintTypes';
import { deriveValidationAfterPaintResults } from './deriveValidationAfterPaintResults';
import { renderValidationAfterPaintTables } from './renderValidationAfterPaintTables';
import { summarizePage } from './summarizePage';
import type { SampleResult } from './summarizeResults';

/** Reproduce every IR-6 numeric artifact and inline table from canonical retained pages. */
export function checkValidationAfterPaintResults(
  destination: string,
  write: boolean,
) {
  const base = path.join(destination, 'raw/ir-6/browser');
  const suites = fs
    .readdirSync(base)
    .filter((name) => fs.existsSync(path.join(base, name, 'complete.json.gz')))
    .sort();
  assert.ok(suites.includes('main'), 'Main measurement is required');
  for (const suite of suites) {
    const raw = path.join(base, suite);
    const read = (name: string) =>
      JSON.parse(
        name.endsWith('.gz')
          ? gunzipSync(fs.readFileSync(path.join(raw, name))).toString()
          : fs.readFileSync(path.join(raw, name), 'utf8'),
      );
    const complete = read('complete.json.gz');
    const pages: Record<string, ValidationAfterPaintPage> =
      read('pages.json.gz');
    const inputs = read('inputs.json'),
      start = read('formal-start.json'),
      smoke = read('smoke-complete.json.gz'),
      authorization = read('window-authorization.json');
    assert.deepEqual(complete.inputs, inputs);
    assert.equal(inputs.stage, 'IR-6');
    assert.deepEqual(inputs.lanes, ['L', 'E', 'F']);
    assert.equal(inputs.bundles.L.commit, 'public-0.16.1');
    assert.equal(
      inputs.bundles.E.commit,
      'facd72a71c44a798f5484827509073a27fb678a3',
    );
    assert.equal(inputs.preregisteredCommit, 'cfd4a9e2a');
    assert.match(inputs.bundles.F.commit, /^[a-f0-9]{40}$/);
    assert.deepEqual(smoke.inputs.bundles, inputs.bundles);
    assert.deepEqual(smoke.cases, cases);
    assert.equal(smoke.smoke, true);
    assert.equal(smoke.samples.length, cases.length * 3);
    assert.deepEqual(start.cases, complete.cases);
    assert.deepEqual(start.toolHashes, complete.toolHashes);
    assert.equal(start.toolCommit, complete.toolCommit);
    assert.ok(Date.parse(start.at) >= Date.parse(authorization.at));
    assert.ok(Date.parse(complete.startedAt) >= Date.parse(start.at));
    assert.ok(Date.parse(complete.endedAt) >= Date.parse(complete.startedAt));
    assert.equal(complete.smoke, false);
    assert.equal(complete.count, 10);
    assert.equal(complete.warmup, 3);
    assert.deepEqual(complete.cases, cases);
    assert.equal(complete.samples.length, cases.length * 30);
    assert.equal(Object.keys(pages).length, complete.samples.length);
    const attempts = fs
      .readdirSync(raw)
      .filter((name) => name.startsWith('start-'))
      .map(read);
    const attempt = attempts.find((entry) => entry.at === start.at);
    assert.ok(attempt);
    assert.equal(attempt.samples, 0);
    assert.equal(attempt.policy.observationMs, 30000);
    assert.equal(attempt.policy.maximumExternalPidPercent, 30);
    assert.ok(
      Date.parse(attempt.quiet.startedAt) >= Date.parse(authorization.at),
    );
    if (complete.mode === 'quiet') assert.equal(attempt.approved, true);
    else {
      assert.equal(complete.mode, 'paired-relative');
      const prior = read('prior-refusals.json');
      assert.ok(
        prior.length >= 3 &&
          prior.every(
            (entry: { samples: number; approved: boolean }) =>
              entry.samples === 0 && !entry.approved,
          ),
      );
    }
    for (const sample of complete.samples as SampleResult[]) {
      const page = pages[sample.file],
        fixture = getValidationAfterPaintFixture(sample.id);
      assert.deepEqual(summarizePage(page), sample.summary, sample.file);
      assert.ok(page.externalCpu);
      assert.equal(page.mount.allDeferred, 0);
      assert.ok(Number.isFinite(page.mount.firstPaintedMs));
      assert.equal(page.final.inputs, fixture.expectedInputs);
      assert.ok(
        page.handlers.every(
          (event) => event.trusted && Number.isFinite(event.wallMs),
        ),
      );
      assert.equal(
        page.handlers.length,
        fixture.mount || fixture.streamFrames ? 0 : fixture.firstKey ? 1 : 20,
      );
      if (fixture.mount)
        assert.ok(Math.abs(page.end - page.start - 1000) < 0.001);
      else if (fixture.streamFrames) {
        assert.equal(page.stream?.writeFrames, 60);
        assert.equal(page.stream?.scriptMs.length, 60);
        assert.equal(page.final.targetValue, 'a'.repeat(60));
        assert.ok(Number.isFinite(page.stream?.validationRuns));
      } else
        assert.ok(
          page.final.targetValue.endsWith(
            fixture.firstKey ? 'a' : 'abcdefghijklmnopqrst',
          ),
        );
    }
    for (const id of cases)
      for (let index = 0; index < 10; index++) {
        const lanes = inputs.lanes as string[];
        const order =
          complete.mode === 'paired-relative'
            ? [...lanes.slice(index % 3), ...lanes.slice(0, index % 3)]
            : index % 2 === 0
              ? lanes
              : [...lanes].reverse();
        assert.deepEqual(
          (complete.samples as SampleResult[])
            .filter((sample) => sample.id === id && sample.index === index)
            .map((sample) => sample.lane),
          order,
        );
      }
    for (const lane of inputs.lanes)
      for (const kind of ['product', 'browser'])
        assert.match(inputs.bundles[lane][kind].sha256, /^[a-f0-9]{64}$/);
    const data = deriveValidationAfterPaintResults(
      complete.samples,
      complete.mode,
      pages,
    );
    const tables = renderValidationAfterPaintTables(data);
    for (const [name, value] of Object.entries({
      'summary.json': data.rows,
      'decision.json': data.gates,
      'bootstrap.json': data.bootstrap,
      'owner-goals.json': data.ownerGoals,
      'derived.json': data,
      'tables.md': tables,
    })) {
      const content =
        typeof value === 'string'
          ? value
          : JSON.stringify(value, null, 2) + '\n';
      if (write) fs.writeFileSync(path.join(raw, name), content);
      else
        assert.equal(
          fs.readFileSync(path.join(raw, name), 'utf8'),
          content,
          name + ' reproduces',
        );
    }
    if (!write) {
      const report = fs.readFileSync(
        path.join(destination, 'ir-6-results.md'),
        'utf8',
      );
      assert.equal(
        report
          .split(`<!-- IR6_${suite.toUpperCase()}_TABLES_START -->\n`)[1]
          ?.split(`<!-- IR6_${suite.toUpperCase()}_TABLES_END -->`)[0],
        tables,
      );
    }
    console.log(
      `IR6_RAW_REPRODUCED suite=${suite} samples=${complete.samples.length} gates=${data.gates.map((gate) => gate.id + ':' + gate.status).join(',')}`,
    );
  }
}
