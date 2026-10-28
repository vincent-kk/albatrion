// CLI parent launches exactly one paired process per canonical row; --worker selects that row.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildAlternatingRows } from '../../../design-optimization/tools/helpers/buildAlternatingRows.mjs';
import { measurePair } from '../../../design-optimization/tools/helpers/measurePair.mjs';
import { prepareEngines } from '../../../design-optimization/tools/helpers/prepareEngines.mjs';

process.env.NODE_ENV = 'production';
assert.equal(process.versions.node.split('.')[0], '26');
const [root, worker, bundle] = process.argv.slice(2);
assert.ok(path.isAbsolute(root));
const rows = buildAlternatingRows(true);
assert.equal(rows.length, 22);
if (worker === '--prepare') {
  assert.ok(!fs.existsSync(root), 'Pilot artifacts must be new');
  const pkg = fileURLToPath(new URL('../../../../../', import.meta.url));
  prepareEngines(pkg, root, '0.16.1', bundle);
  const smoke = spawnSync(
    process.execPath,
    [
      '--import',
      fileURLToPath(
        new URL(
          '../../../design-optimization/tools/profile/register.mjs',
          import.meta.url,
        ),
      ),
      fileURLToPath(new URL('../b9-0/smoke.mjs', import.meta.url)),
      root,
      'engines/legacy.mjs',
      'legacy',
    ],
    { encoding: 'utf8' },
  );
  fs.writeFileSync(path.join(root, 'smoke.stderr'), smoke.stderr);
  assert.equal(smoke.status, 0, smoke.stderr);
  fs.writeFileSync(path.join(root, 'smoke.json'), smoke.stdout);
  console.log('B9_1_PILOT_SMOKE_OK legacy-oneOf-writes=120');
} else if (worker) {
  const row = rows.find((entry) => entry.id === worker);
  assert.ok(row);
  const engines = JSON.parse(
    fs.readFileSync(path.join(root, 'engines.json'), 'utf8'),
  ).engines;
  console.log(
    JSON.stringify(
      await measurePair(row, { warmups: 20, samples: 100 }, engines, 0),
    ),
  );
} else {
  assert.ok(fs.existsSync(path.join(root, 'smoke.json')));
  assert.ok(!fs.existsSync(path.join(root, 'pilot.json')), 'No pilot rerun');
  const prepared = JSON.parse(
    fs.readFileSync(path.join(root, 'engines.json'), 'utf8'),
  );
  const results = [];
  for (const row of rows) {
    const child = spawnSync(
      process.execPath,
      [
        '--import',
        fileURLToPath(
          new URL(
            '../../../design-optimization/tools/profile/register.mjs',
            import.meta.url,
          ),
        ),
        fileURLToPath(import.meta.url),
        root,
        row.id,
      ],
      { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 },
    );
    fs.writeFileSync(path.join(root, row.id + '.stderr'), child.stderr);
    assert.equal(child.status, 0, child.stderr);
    const result = JSON.parse(child.stdout);
    results.push(result);
    fs.writeFileSync(path.join(root, row.id + '.json'), child.stdout);
    console.log('PILOT_ROW_OK ' + row.id);
  }
  const summary = results.map((result) => ({
    row: result.row,
    lanes: Object.fromEntries(
      Object.entries(result.samples)
        .filter(([, samples]) => samples.length)
        .map(([lane, samples]) => {
          assert.equal(samples.length, 100);
          const sorted = samples.toSorted((a, b) => a - b);
          const median = (sorted[49] + sorted[50]) / 2;
          return [
            lane,
            { minMs: sorted[0], medianMs: median, ratio: median / sorted[0] },
          ];
        }),
    ),
  }));
  fs.writeFileSync(
    path.join(root, 'pilot.json'),
    JSON.stringify(
      {
        node: process.version,
        warmups: 20,
        samples: 100,
        processes: results.length,
        sourceSha256: prepared.engines.current.sha256,
        legacySha256: prepared.engines.legacy.sha256,
        rows: summary,
        results,
      },
      null,
      2,
    ) + '\n',
  );
  console.log('B9_1_PILOT_OK processes=' + results.length);
}
