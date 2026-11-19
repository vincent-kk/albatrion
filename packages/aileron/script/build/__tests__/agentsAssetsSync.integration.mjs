// Run after the package build: yarn node --test packages/aileron/script/build/__tests__/agentsAssetsSync.integration.mjs.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

/** Repository installation supplies dependencies; the consumer uses only packed package files. */
const repository = fileURLToPath(new URL('../../../../../', import.meta.url));

test('the packed ESM asset-sync package resolves every subpath and runs every bin under source conditions', (context) => {
  mkdirSync('/tmp/bb3-build', { recursive: true });
  const scratch = mkdtempSync('/tmp/bb3-build/asset-sync-published-');
  context.after(() => rmSync(scratch, { recursive: true, force: true }));
  const name = '@slats/agents-assets-sync';
  const packageDir = join(repository, 'packages/slats/agents-assets-sync');
  const archive = join(scratch, 'package.tgz');
  const pack = spawnSync('yarn', ['workspace', name, 'pack', '--out', archive], { cwd: repository, encoding: 'utf8' });
  assert.equal(pack.status, 0, pack.stdout + pack.stderr);
  const installed = join(scratch, 'node_modules', name);
  mkdirSync(installed, { recursive: true });
  const extract = spawnSync('tar', ['-xzf', archive, '--strip-components=1', '-C', installed], { encoding: 'utf8' });
  assert.equal(extract.status, 0, extract.stderr);
  const manifest = JSON.parse(readFileSync(join(installed, 'package.json'), 'utf8'));
  assert.ok(!JSON.stringify(manifest.exports).includes('"source"'), 'packed exports omit development source conditions');
  for (const dependency of Object.keys(manifest.dependencies)) {
    const local = join(packageDir, 'node_modules', dependency);
    const target = join(scratch, 'node_modules', dependency);
    mkdirSync(dirname(target), { recursive: true });
    symlinkSync(existsSync(local) ? local : join(repository, 'node_modules', dependency), target, 'dir');
  }
  for (const entry of Object.values(manifest.exports)) {
    for (const target of typeof entry === 'string' ? [entry] : Object.values(entry))
      assert.ok(existsSync(join(installed, target)), `missing packed export ${target}`);
  }
  const imports = spawnSync(process.execPath, ['--conditions=source', '--input-type=module', '-e', `
    import assert from 'node:assert/strict';
    import { runCli } from '@slats/agents-assets-sync';
    import { buildHashes } from '@slats/agents-assets-sync/buildHashes';
    import manifest from '@slats/agents-assets-sync/package.json' with { type: 'json' };
    assert.equal(typeof runCli, 'function'); assert.equal(typeof buildHashes, 'function');
    assert.equal(manifest.name, '@slats/agents-assets-sync');
  `], { cwd: scratch, encoding: 'utf8' });
  assert.equal(imports.status, 0, imports.stdout + imports.stderr);
  writeFileSync(join(scratch, 'package.json'), JSON.stringify({ name: 'asset-sync-consumer', version: '1.0.0', agents: { assetPath: 'assets' } }));
  mkdirSync(join(scratch, 'assets'));
  writeFileSync(join(scratch, 'assets/rule.md'), 'Fixture rule.');
  for (const [bin, target] of Object.entries(manifest.bin)) {
    assert.ok(existsSync(join(installed, target)), `missing packed bin ${bin}`);
    const run = spawnSync(process.execPath, ['--conditions=source', join(installed, target), ...(bin === 'agents-build-hashes' ? [] : ['--help'])], { cwd: scratch, encoding: 'utf8' });
    assert.equal(run.status, 0, `${bin}: ${run.stdout}${run.stderr}`);
  }
  const hashes = JSON.parse(readFileSync(join(scratch, 'dist/agents-hashes.json'), 'utf8'));
  assert.ok(hashes.files['rule.md']);
});
