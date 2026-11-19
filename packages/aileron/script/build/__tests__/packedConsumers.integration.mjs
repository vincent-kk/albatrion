// Run after workspace builds: yarn node --test packages/aileron/script/build/__tests__/packedConsumers.integration.mjs.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

/** Repository root selects Yarn and workspace packages; fixtures never install dependencies. */
const repository = fileURLToPath(new URL('../../../../../', import.meta.url));

for (const path of ['winglet/common-utils', 'canard/schema-form', 'canard/schema-form-ajv8-plugin', 'canard/schema-form-antd5-plugin']) {
  test(`packed ${path} supports ESM and CommonJS under Node16 and NodeNext`, () => {
    mkdirSync('/tmp/bb3-build', { recursive: true });
    const scratch = mkdtempSync('/tmp/bb3-build/packed-');
    try {
      const packageDir = join(repository, 'packages', path);
      const manifest = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'));
      const archive = join(scratch, 'package.tgz');
      const pack = spawnSync('yarn', ['workspace', manifest.name, 'pack', '--out', archive], { cwd: repository, encoding: 'utf8' });
      assert.equal(pack.status, 0, pack.stdout + pack.stderr);
      writeFileSync(`/tmp/bb3-build/pack-${manifest.name.replaceAll('/', '-')}.log`, pack.stdout);
      const installed = join(scratch, 'node_modules', manifest.name);
      mkdirSync(installed, { recursive: true });
      const extract = spawnSync('tar', ['-xzf', archive, '--strip-components=1', '-C', installed], { encoding: 'utf8' });
      assert.equal(extract.status, 0, extract.stderr);
      for (const dependency of Object.keys({ ...manifest.dependencies, ...manifest.peerDependencies })) {
        const target = join(scratch, 'node_modules', dependency);
        if (target === installed) continue;
        mkdirSync(dirname(target), { recursive: true });
        const local = resolve(packageDir, 'node_modules', dependency);
        symlinkSync(existsSync(local) ? local : join(repository, 'node_modules', dependency), target, 'dir');
      }
      const published = JSON.parse(readFileSync(join(installed, 'package.json'), 'utf8'));
      const source = Object.keys(published.exports).map((key, index) => `export * as entry${index} from '${manifest.name}${key === '.' ? '' : key.slice(1)}';`).join('\n');
      for (const extension of ['mts', 'cts']) {
        const consumer = join(scratch, `consumer.${extension}`);
        writeFileSync(consumer, source);
        for (const mode of [ts.ModuleKind.Node16, ts.ModuleKind.NodeNext]) {
          const program = ts.createProgram([consumer], { strict: true, noEmit: true, skipLibCheck: false, target: ts.ScriptTarget.ES2022, module: mode, moduleResolution: mode === ts.ModuleKind.Node16 ? ts.ModuleResolutionKind.Node16 : ts.ModuleResolutionKind.NodeNext, types: [], lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'], jsx: ts.JsxEmit.ReactJSX });
          const diagnostics = ts.getPreEmitDiagnostics(program);
          assert.equal(diagnostics.length, 0, `${extension} ${ts.ModuleKind[mode]}: ` + ts.formatDiagnostics(diagnostics, { getCurrentDirectory: () => scratch, getCanonicalFileName: (file) => file, getNewLine: () => '\n' }));
        }
      }
      assert.ok(!JSON.stringify(published.exports).includes('"source"'), 'packed exports omit source conditions');
    } finally {
      rmSync(scratch, { recursive: true, force: true });
    }
  });
}
