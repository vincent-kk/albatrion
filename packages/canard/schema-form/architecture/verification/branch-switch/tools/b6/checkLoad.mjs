// Invoked before the quiet window; verifies every row without timers or formal samples.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

process.env.NODE_ENV = 'production';
const packageDir = fileURLToPath(new URL('../../../../../', import.meta.url));
const root = path.resolve(process.argv[2]);
const helper = path.join(
  packageDir,
  'architecture/verification/design-optimization/tools/helpers',
);
const { prepareEngines } = await import(
  pathToFileURL(path.join(helper, 'prepareEngines.mjs'))
);
const { buildAlternatingRows } = await import(
  pathToFileURL(path.join(helper, 'buildAlternatingRows.mjs'))
);
const { setupOperation } = await import(
  pathToFileURL(path.join(helper, 'setupOperation.mjs'))
);
const require = createRequire(path.join(packageDir, 'package.json'));
const pluginFile = require.resolve('@canard/schema-form-ajv8-plugin');
assert.ok(fs.statSync(pluginFile).isFile());
const rows = buildAlternatingRows(true);
assert.equal(rows.length, 22);
const report = {
  timed: false,
  plugin: {
    name: '@canard/schema-form-ajv8-plugin',
    entry: path.basename(pluginFile),
    sha256: createHash('sha256')
      .update(fs.readFileSync(pluginFile))
      .digest('hex'),
  },
  lanes: {},
};
for (const lane of ['A', 'B']) {
  const prepared = prepareEngines(
    packageDir,
    path.join(root, 'load-check-' + lane),
    '0.16.1',
    path.join(root, 'bundles', lane, 'index.node.mjs'),
  );
  const mod = await import(pathToFileURL(prepared.engines.current.destination));
  const checked = [];
  for (const row of rows) {
    const operation = await setupOperation(row, 'current', mod);
    await operation.preflight?.();
    for (let index = 0; index < 2; index++) {
      await operation.run();
      operation.check();
    }
    checked.push({ row: row.id, operations: 2, passed: true });
  }
  report.lanes[lane] = {
    rows: checked,
    operations: 44,
    sha256: prepared.engines.current.sha256,
  };
  if (lane === 'A') {
    const legacy = await import(
      pathToFileURL(prepared.engines.legacy.destination)
    );
    let count = 0;
    for (const row of rows.filter((row) => !row.currentOnly)) {
      const operation = await setupOperation(row, 'legacy', legacy);
      await operation.preflight?.();
      for (let index = 0; index < 2; index++) {
        await operation.run();
        operation.check();
        count++;
      }
    }
    assert.equal(count, 36);
    report.legacy = { rows: 18, operations: count, passed: true };
  }
}
fs.writeFileSync(
  path.join(root, 'untimed-load-check.json'),
  JSON.stringify(report, null, 2) + '\n',
);
console.log('B6_UNTIMED_LOAD_OK A=44 B=44 legacy=36 plugin=resolved');
