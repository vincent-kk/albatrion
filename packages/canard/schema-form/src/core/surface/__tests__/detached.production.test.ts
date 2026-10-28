import { execFileSync } from 'node:child_process';
import { expect, it } from 'vitest';

// filid:contract surface-detached
it('keeps detached and inactive-resolver writes inert and silent in each production runtime bundle', () => {
  const packageRoot = process.cwd();
  const script = `
    import assert from 'node:assert/strict';
    import fs from 'node:fs';
    import path from 'node:path';
    import { pathToFileURL } from 'node:url';
    const bundle = process.argv[1];
    const commonjs = bundle.endsWith('.cjs');
    const target = path.resolve('dist/.detached-production-' + process.pid + (commonjs ? '.cjs' : '.mjs'));
    try {
      const source = fs.readFileSync(bundle, 'utf8');
      fs.writeFileSync(target, source + (commonjs ? '\\nObject.assign(module.exports, { blueprint, fieldNodeFactory, mountFieldNode, PathKeyedSet });\\n' : '\\nexport { blueprint, fieldNodeFactory, mountFieldNode, PathKeyedSet };\\n'));
      const loaded = await import(pathToFileURL(target));
      const M = commonjs ? loaded.default : loaded;
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
      let exitRoot;
      let calls = 0;
      let batches = 0;
      const resolve = () => {
        calls++;
        exitRoot.find('/stable').setValue('ignored');
        const items = exitRoot.find('/list');
        items.push('ignored'); items.pop(); items.insert(0, 'ignored');
        items.remove(0); items.update(0, 'ignored'); items.clear();
        exitRoot.batch(() => batches++);
        exitRoot.resetSubtree();
        return 'retained';
      };
      exitRoot = M.fieldNodeFactory(M.blueprint({
        type: 'object', properties: {
          open: { type: 'boolean' },
          stable: { type: 'string' },
          list: { type: 'array', items: { type: 'string' } },
          value: { type: 'string', controls: { active: '../open', inactiveValue: resolve } },
        },
      }), { diagnostics: { status: 'stable' }, misfitPaths: new M.PathKeyedSet() });
      M.mountFieldNode(exitRoot, { open: true, stable: 'held', list: ['a'], value: 'before' }, M.SetValueOption.Overwrite);
      exitRoot.find('/value').onInactive(() => { resolve(); return undefined; });
      exitRoot.find('/open').setValue(false);
      assert.equal(calls, 2);
      assert.equal(batches, 0);
      assert.deepEqual(exitRoot.value, { open: false, stable: 'held', list: ['a'] });
      assert.deepEqual(exitRoot.inactiveValues, [{ path: '/value', value: 'retained' }]);
      assert.equal(warnings.length, 0);
      console.log('B12_PRODUCTION_INERT_SILENT');
    } finally { fs.rmSync(target, { force: true }); }
  `;
  for (const bundle of ['index.mjs', 'index.node.mjs', 'index.cjs']) {
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
    expect(output).toContain('B12_PRODUCTION_INERT_SILENT');
  }
});
