import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

// filid:contract surface-detached
it('keeps detached writes inert and silent in each production runtime bundle', () => {
  const packageRoot = fileURLToPath(new URL('../../../../', import.meta.url));
  const script = `
    import assert from 'node:assert/strict';
    import fs from 'node:fs';
    import path from 'node:path';
    import { pathToFileURL } from 'node:url';
    const bundle = process.argv[1];
    const target = path.resolve('dist/.detached-production-' + process.pid + '.mjs');
    try {
      const source = fs.readFileSync(bundle, 'utf8');
      fs.writeFileSync(target, source + '\\nexport { blueprint, fieldNodeFactory, mountFieldNode, PathKeyedSet };\\n');
      const M = await import(pathToFileURL(target));
      const warnings = [];
      console.warn = (...args) => warnings.push(args);
      const root = M.fieldNodeFactory(M.blueprint({
        type: 'object', properties: {
          open: { type: 'boolean' },
          leaf: { type: 'string', controls: { active: '../open' } },
          list: { type: 'array', items: { type: 'string' }, controls: { active: '../open' } },
        },
      }), { diagnostics: { status: 'stable' }, misfitPaths: new M.PathKeyedSet(), unsetOnInactive: false });
      M.mountFieldNode(root, { open: true, leaf: 'held', list: ['a'] }, M.SetValueOption.Overwrite);
      const old = root.find('/leaf');
      const list = root.find('/list');
      root.find('/open').setValue(false);
      old.setValue('ignored');
      assert.equal(list.push('ignored'), 1);
      list.insert(0, 'ignored'); list.pop(); list.remove(0); list.update(0, 'ignored'); list.clear();
      root.find('/open').setValue(true);
      old.setValue('ignored again');
      assert.equal(root.find('/leaf').value, 'held');
      assert.deepEqual(root.find('/list').value, ['a']);
      assert.equal(warnings.length, 0);
      console.log('B11_PRODUCTION_INERT_SILENT');
    } finally { fs.rmSync(target, { force: true }); }
  `;
  for (const bundle of ['index.mjs', 'index.node.mjs']) {
    const output = execFileSync(
      process.execPath,
      ['--input-type=module', '--eval', script, `dist/${bundle}`],
      {
        cwd: packageRoot,
        env: { ...process.env, NODE_ENV: 'production' },
        encoding: 'utf8',
      },
    );
    expect(output).toContain('B11_PRODUCTION_INERT_SILENT');
  }
});
