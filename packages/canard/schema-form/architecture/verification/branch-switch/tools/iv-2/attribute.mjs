// Loaded directly by CLI; preserved IV-0 timers are never executed by this projection.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';

import { median } from '../b9-1/helpers/median.mjs';

const base = fileURLToPath(new URL('../../', import.meta.url));
const read = (file) =>
  JSON.parse(fs.readFileSync(path.join(base, file), 'utf8'));
const labels = ['switch-oneOf-80', 'switch-siblings-0'];
const diagnostics = read('raw/iv-2/attribution-diagnostics.json');
const original = JSON.parse(
  gunzipSync(
    fs.readFileSync(path.join(base, 'raw/iv-0/diagnostics.json.gz')),
  ).toString(),
);
const allocationTotals = read('raw/iv-0/allocations.json');
const owners = read('raw/iv-0/owners.json');
const floor = read('raw/iv-0/floor.json');
assert.equal(diagnostics.timed, false);
const cacheable = [
  'selectEffectiveDeclarations',
  'mergeEffectiveSchema',
  'selectNodeSchema',
  'prepareGateTableRound',
];
const reusable = [
  'selectChildren',
  'computeNode',
  'markCommitDeliveries',
  'commitSettlement',
  'commitSlotChanges',
  'registerRecalculation',
  'registerPresenceChanges',
  'finalizeExits',
  'finalizePendingExitLoop',
  'finalizeRetainLoop',
  'getRetainedChildEntry',
  'createExitSlotOverlay',
  'assembleObject',
];
const rows = labels.map((label) => {
  const records = diagnostics.rows.filter(
    (row) => row.label === label && row.kind !== 'load',
  );
  const oldRecords = original.rows.rows.filter(
    (row) => row.label === label && row.kind !== 'load',
  );
  const timed = owners.find((row) => row.row === label).stages;
  const files = oldRecords
    .flatMap((row) => [
      ...Object.keys(row.allocations),
      ...Object.keys(row.deliveryAllocations ?? {}),
    ])
    .filter((key, index, keys) => keys.indexOf(key) === index)
    .sort();
  const sites = records
    .flatMap((row) => [
      ...Object.keys(row.allocationSites),
      ...Object.keys(row.deliveryAllocationSites ?? {}),
    ])
    .filter((key, index, keys) => keys.indexOf(key) === index)
    .sort();
  const allocations = sites.map((site) => {
    const file = site.split(':')[0];
    const kind = site.slice(file.length + 1).split('@')[0];
    const owner = path.basename(file, '.ts');
    const count = median(
      records.map(
        (row) =>
          (row.allocationSites[site] ?? 0) +
          (row.deliveryAllocationSites?.[site] ?? 0),
      ),
    );
    return {
      site,
      kind,
      count,
      classification:
        owner === 'advanceFieldNodeRevision' || owner === 'getGateRegistry'
          ? 'must stay'
          : 'reusable scratch',
      owner,
      siteNetUs: 'unattributed',
      ownerNetUs: timed[owner]?.selfNetUs ?? 'unattributed',
    };
  });
  for (const file of files) {
    const expected = median(
      oldRecords.map(
        (row) =>
          (row.allocations[file] ?? 0) + (row.deliveryAllocations?.[file] ?? 0),
      ),
    );
    const actual = median(
      records.map(
        (row) =>
          (row.allocations[file] ?? 0) + (row.deliveryAllocations?.[file] ?? 0),
      ),
    );
    assert.equal(actual, expected, label + ':' + file);
    const siteCounts = records.map((row) =>
      Object.entries({ ...row.allocationSites, ...row.deliveryAllocationSites })
        .filter(([key]) => key.startsWith(file + '@'))
        .reduce((sum, [, count]) => sum + Number(count), 0),
    );
    assert.equal(median(siteCounts), actual, 'Site reconciliation: ' + file);
  }
  const maps = median(
    records.map((row) =>
      Object.entries({ ...row.allocationSites, ...row.deliveryAllocationSites })
        .filter(([key]) => /:.*Map@/.test(key))
        .reduce((sum, [, count]) => sum + Number(count), 0),
    ),
  );
  const sets = median(
    records.map((row) =>
      Object.entries({ ...row.allocationSites, ...row.deliveryAllocationSites })
        .filter(([key]) => /:.*Set@/.test(key))
        .reduce((sum, [, count]) => sum + Number(count), 0),
    ),
  );
  const expected = allocationTotals.rows.find(
    (row) => row.label === label,
  ).allocations;
  assert.equal(maps, expected.maps);
  assert.equal(sets, expected.sets);
  const timers = Object.entries(timed).map(([owner, record]) => ({
    owner,
    callsPerWrite: record.calls,
    netUsPerWrite: record.selfNetUs,
    classification:
      owner === 'readDepartingAncestorPolicy'
        ? 'pure in (ancestor layers, selected ids) — cacheable per host'
        : cacheable.includes(owner)
          ? 'pure in (discriminant value, blueprint) — cacheable per host per bucket'
          : reusable.includes(owner)
            ? 'reusable scratch'
            : 'must stay',
  }));
  return {
    label,
    writes: records.length,
    maps,
    sets,
    allocations,
    timers,
    floor: floor.filter((row) => row.row === label),
  };
});
const output = {
  timed: false,
  sourceHead: diagnostics.sourceHead,
  method:
    'Counts are per-write medians. Timer selfNetUs are aggregate per write, never multiplied by call count. Site costs are unattributed; owner totals overlap different timer lanes and must not be added.',
  rows,
};
const bytes = JSON.stringify(output, null, 2) + '\n';
const target = path.join(base, 'raw/iv-2/attribution.json');
if (process.argv.includes('--check'))
  assert.equal(fs.readFileSync(target, 'utf8'), bytes);
else fs.writeFileSync(target, bytes);
const tables = rows
  .map((row) =>
    [
      `## ${row.label}`,
      '',
      '| allocation site | count/write | classification | site net µs | owner net µs |',
      '| --- | ---: | --- | --- | --- |',
      ...row.allocations.map(
        (site) =>
          `| ${site.site} | ${site.count} | ${site.classification} | ${site.siteNetUs} | ${typeof site.ownerNetUs === 'number' ? site.ownerNetUs.toFixed(3) : site.ownerNetUs} |`,
      ),
      '',
      '| timer owner | calls/write | aggregate net µs/write | classification |',
      '| --- | ---: | ---: | --- |',
      ...row.timers.map(
        (timer) =>
          `| ${timer.owner} | ${timer.callsPerWrite} | ${timer.netUsPerWrite.toFixed(3)} | ${timer.classification} |`,
      ),
      '',
    ].join('\n'),
  )
  .join('\n');
const tablePath = path.join(base, 'raw/iv-2/attribution.md');
if (process.argv.includes('--check'))
  assert.equal(fs.readFileSync(tablePath, 'utf8'), tables);
else fs.writeFileSync(tablePath, tables);
console.log(
  'IV_2_ATTRIBUTION_OK ' +
    rows
      .map(
        (row) =>
          `${row.label}=${row.maps}Map+${row.sets}Set sites=${row.allocations.length} owners=${row.timers.length}`,
      )
      .join(' '),
);
