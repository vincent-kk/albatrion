import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';

import cases from '../../../fixtures/input-responsiveness/ir-2-cases.json';
import type { PageRecord } from '../types';
import { deriveHeavyValidationResults } from './deriveHeavyValidationResults';
import { renderHeavyValidationTables } from './renderHeavyValidationTables';
import { summarizePage } from './summarizePage';
import type { SampleResult } from './summarizeResults';

/**
 * Reproduce IR-2 numeric records and audit raw pages, lane ordering and path hygiene.
 * @param destination - Canonical input-responsiveness evidence directory.
 * @param write - Save derived records once; default checks every byte against raw-derived output.
 * @returns Logs a success marker only after all assertions; throws on any evidence mismatch.
 */
export function checkHeavyValidationResults(
  destination: string,
  write: boolean,
) {
  const base = path.join(destination, 'raw/ir-2');
  for (const suite of ['main', 'quiet'].filter((suite) =>
    fs.existsSync(path.join(base, suite)),
  )) {
    const raw = path.join(base, suite);
    const complete = JSON.parse(
      gunzipSync(
        fs.readFileSync(path.join(raw, 'complete.json.gz')),
      ).toString(),
    );
    const pages: Record<string, PageRecord> = JSON.parse(
      gunzipSync(fs.readFileSync(path.join(raw, 'pages.json.gz'))).toString(),
    );
    assert.equal(complete.smoke, false);
    assert.equal(complete.count, 10);
    assert.equal(complete.warmup, 3);
    assert.deepEqual(complete.inputs.lanes, ['L', 'E1']);
    if (suite === 'main') assert.deepEqual(complete.cases, cases);
    else
      assert.ok(
        complete.cases.every(
          (id: string) => cases.includes(id) && id.endsWith('-nonburst'),
        ),
      );
    assert.equal(complete.samples.length, complete.cases.length * 20);
    assert.equal(Object.keys(pages).length, complete.samples.length);
    for (const sample of complete.samples as SampleResult[]) {
      const page = pages[sample.file];
      assert.deepEqual(summarizePage(page), sample.summary);
      assert.equal(page.mount.allDeferred, 0);
      assert.ok('externalCpu' in page);
      assert.ok(
        page.handlers.every(
          (event) => event.trusted && Number.isFinite(event.wallMs),
        ),
      );
      if (!sample.id.startsWith('mount-')) {
        assert.equal(page.handlers.length, 20);
        assert.ok(page.final.targetValue.endsWith('abcdefghijklmnopqrst'));
        if (sample.id.endsWith('-nonburst'))
          assert.equal(
            page.handlers.filter((handler) =>
              page.validations.some(
                (delivery) => delivery.sequence === handler.sequence,
              ),
            ).length,
            20,
          );
      } else {
        assert.equal(page.handlers.length, 0);
        assert.ok(Math.abs(page.end - page.start - 1000) < 0.001);
      }
    }
    for (const id of complete.cases)
      for (let index = 0; index < 10; index++)
        assert.deepEqual(
          (complete.samples as SampleResult[])
            .filter((sample) => sample.id === id && sample.index === index)
            .map((sample) => sample.lane),
          index % 2 === 0 ? ['L', 'E1'] : ['E1', 'L'],
        );
    for (const lane of complete.inputs.lanes) {
      assert.match(
        complete.inputs.bundles[lane].product.sha256,
        /^[a-f0-9]{64}$/,
      );
      assert.match(
        complete.inputs.bundles[lane].browser.sha256,
        /^[a-f0-9]{64}$/,
      );
    }
    const data = deriveHeavyValidationResults(complete.samples, complete.mode);
    for (const [name, value] of Object.entries({
      'summary.json': data.rows,
      'pairs.json': data.pairs,
      'decision.json': data.decision,
      'tables.md': renderHeavyValidationTables(data),
    })) {
      const text =
        typeof value === 'string'
          ? value
          : JSON.stringify(value, null, 2) + '\n';
      if (write) fs.writeFileSync(path.join(raw, name), text);
      else
        assert.equal(
          fs.readFileSync(path.join(raw, name), 'utf8'),
          text,
          name + ' reproduces',
        );
    }
    console.log(
      `IR2_RAW_REPRODUCED suite=${suite} samples=${complete.samples.length}`,
    );
  }
  assert.ok(fs.existsSync(path.join(base, 'main/complete.json.gz')));
  const repository = path.resolve('../../..');
  const changed = execFileSync('git', ['diff', '--name-only', '317f215dc'], {
    cwd: repository,
    encoding: 'utf8',
  })
    .trim()
    .split('\n');
  const untracked = execFileSync(
    'git',
    ['ls-files', '--others', '--exclude-standard'],
    { cwd: repository, encoding: 'utf8' },
  )
    .trim()
    .split('\n');
  for (const file of [...changed, ...untracked].filter(Boolean)) {
    const location = path.join(repository, file);
    if (!fs.existsSync(location) || !fs.statSync(location).isFile()) continue;
    const bytes = fs.readFileSync(location);
    assert.ok(
      !new RegExp('/' + '(?:Users|private/tmp|home)/').test(
        (file.endsWith('.gz') ? gunzipSync(bytes) : bytes).toString(),
      ),
      file + ' has a machine path',
    );
    assert.ok(
      !file.startsWith('packages/canard/schema-form/src/'),
      'No product changes',
    );
  }
  console.log('IR2_PATH_AND_PRODUCT_AUDIT_OK');
}
