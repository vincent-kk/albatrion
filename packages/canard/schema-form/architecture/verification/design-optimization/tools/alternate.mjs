// Invoked by Node CLI; --worker binds one role while the parent owns row-wise interleaving.
process.env.NODE_ENV = 'production';
const assert = (await import('node:assert/strict')).default;
const fs = await import('node:fs');
const path = await import('node:path');
const { buildAlternatingRows } = await import(
  './helpers/buildAlternatingRows.mjs'
);
const { measurePair } = await import('./helpers/measurePair.mjs');
const { readAlternatingConfig } = await import(
  './helpers/readAlternatingConfig.mjs'
);
const { runAlternatingParent } = await import(
  './helpers/runAlternatingParent.mjs'
);
assert.equal(process.versions.node.split('.')[0], '26', 'Node26 required');
const config = readAlternatingConfig(process.argv.slice(2));
const allRows = buildAlternatingRows();
if (config.worker) {
  const row = allRows.find((candidate) => candidate.id === config.worker);
  assert.ok(row, 'Unknown worker row');
  const record = JSON.parse(
    fs.readFileSync(
      path.join(config.runDir, config.lane, 'engines.json'),
      'utf8',
    ),
  );
  console.log(
    JSON.stringify(
      await measurePair(row, config, record.engines, config.repeat),
    ),
  );
} else {
  assert.ok(
    !config.only?.some(
      (id, index) =>
        !allRows.some((row) => row.id === id) ||
        config.only.indexOf(id) !== index,
    ),
    'Unknown or duplicate --only row',
  );
  const rows = allRows.filter(
    (row) => !config.only || config.only.includes(row.id),
  );
  process.exitCode = runAlternatingParent(config, rows);
}
