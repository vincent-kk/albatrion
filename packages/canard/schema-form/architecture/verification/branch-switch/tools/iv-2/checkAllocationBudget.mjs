// Clock-free budget gate consumes fresh diagnoseRows output, including delivery allocations.
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { median } from '../b9-1/helpers/median.mjs';

const input = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
assert.equal(input.timed, false);
const limits = process.argv.slice(3).map(Number);
assert.equal(limits.length, 4);
const rows = ['switch-oneOf-80', 'switch-siblings-0'].map((label, index) => {
  const records = input.rows.filter(
    (row) => row.label === label && row.kind !== 'load',
  );
  assert.ok(records.length > 0);
  const counts = ['Map', 'Set'].map((kind) =>
    median(
      records.map((row) =>
        [row.allocations, row.deliveryAllocations ?? {}].reduce(
          (total, sites) =>
            total +
            Object.entries(sites)
              .filter(([site]) => site.endsWith(kind))
              .reduce((sum, [, count]) => sum + Number(count), 0),
          0,
        ),
      ),
    ),
  );
  const ceilings = limits.slice(index * 2, index * 2 + 2);
  for (let kind = 0; kind < 2; kind++)
    assert.ok(
      counts[kind] <= ceilings[kind],
      `${label} ${['Map', 'Set'][kind]}: ${counts[kind]} > ${ceilings[kind]}`,
    );
  return { label, maps: counts[0], sets: counts[1], ceilings };
});
console.log('IV_2_ALLOCATION_BUDGET_OK ' + JSON.stringify(rows));
