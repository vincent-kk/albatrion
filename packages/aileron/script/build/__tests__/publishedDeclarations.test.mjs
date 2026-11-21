// Loaded by test:build-scripts before builds; package manifests define publication contracts.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

for (const path of ['winglet/common-utils', 'canard/schema-form', 'canard/schema-form-ajv8-plugin', 'canard/schema-form-antd5-plugin']) {
  test(`${path} publishes a complete dual declaration export map without source targets`, () => {
    const manifest = JSON.parse(readFileSync(new URL(`../../../../${path}/package.json`, import.meta.url), 'utf8'));
    assert.ok(manifest.publishConfig?.exports, 'published export override is required');
    for (const [key, entry] of Object.entries(manifest.publishConfig.exports)) {
      assert.equal(entry.source, undefined, key);
      for (const condition of ['import', 'require']) {
        assert.equal(Object.keys(entry[condition])[0], 'types', `${key} ${condition}`);
        assert.ok(entry[condition].types.endsWith(condition === 'import' ? '.d.ts' : '.d.cts'), `${key} ${condition}`);
      }
    }
  });
}


test('the ESM-only asset-sync package publishes every public address without a source condition', () => {
  const manifest = JSON.parse(readFileSync(new URL('../../../../slats/agents-assets-sync/package.json', import.meta.url), 'utf8'));
  assert.equal(manifest.exports['.'].source, './src/index.ts');
  const published = Object.fromEntries(Object.entries(manifest.exports).map(([key, entry]) =>
    [key, typeof entry === 'string' ? entry : Object.fromEntries(Object.entries(entry).filter(([condition]) => condition !== 'source'))],
  ));
  assert.deepEqual(manifest.publishConfig?.exports, published);
  assert.equal(manifest.exports['.'].require, undefined);
  assert.deepEqual(Object.keys(published), ['.', './buildHashes', './package.json']);
  assert.deepEqual(Object.keys(manifest.bin), ['agents-assets-sync', 'agents-build-hashes', 'inject-agents-settings']);
});
