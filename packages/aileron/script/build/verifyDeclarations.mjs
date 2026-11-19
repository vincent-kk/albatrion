// Invoked by workspace build:verify:types; the cwd package's exports select both declaration formats.
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import ts from 'typescript';

import { validatePublishedDeclarations } from './utils/validatePublishedDeclarations.mjs';

import { getDeclarationEntries } from './utils/getDeclarationEntries.mjs';

const packageDir = process.cwd();
const manifest = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'));
validatePublishedDeclarations(manifest);
const { entries, blocked } = getDeclarationEntries(manifest);
for (const key of blocked) console.log(`${manifest.name}: blocked export ${key}`);

const scratch = mkdtempSync(join(tmpdir(), 'declaration-consumer-'));
try {
  const link = join(scratch, 'node_modules', manifest.name);
  mkdirSync(dirname(link), { recursive: true });
  symlinkSync(packageDir, link, 'dir');
  for (const extension of ['mts', 'cts']) {
    const consumer = join(scratch, `consumer.${extension}`);
    writeFileSync(consumer, entries.map(([key], index) =>
      `export * as entry${index} from '${manifest.name}${key === '.' ? '' : key.slice(1)}';`,
    ).join('\n'));
    for (const [name, module, moduleResolution] of [
      ['Node16', ts.ModuleKind.Node16, ts.ModuleResolutionKind.Node16],
      ['NodeNext', ts.ModuleKind.NodeNext, ts.ModuleResolutionKind.NodeNext],
      ...(extension === 'mts' ? [['Bundler', ts.ModuleKind.ESNext, ts.ModuleResolutionKind.Bundler]] : []),
    ]) {
      const options = { strict: true, noEmit: true, skipLibCheck: false,
        target: ts.ScriptTarget.ES2022, module, moduleResolution, types: [],
        lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'] };
      let program = ts.createProgram([consumer], options);
      const diagnostics = ts.getPreEmitDiagnostics(program);
      for (const [key, branches] of entries) {
        const address = `${manifest.name}${key === '.' ? '' : key.slice(1)}`;
        const result = ts.resolveModuleName(address, consumer, options, ts.sys, undefined, undefined,
          extension === 'cts' ? ts.ModuleKind.CommonJS : ts.ModuleKind.ESNext).resolvedModule;
        const target = resolve(packageDir, branches[extension === 'cts' ? 'require' : 'import']);
        const isDeclaration = /\.d\.[cm]?ts$/.test(target);
        if (!result || (isDeclaration && (!existsSync(target) || realpathSync(result.resolvedFileName) !== realpathSync(target)))) {
          console.error(`${address} ${name} ${extension}: declaration target mismatch (${target})`);
          process.exitCode = 1;
        }
      }
      if (diagnostics.length) {
        console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, {
          getCurrentDirectory: () => packageDir, getCanonicalFileName: (path) => path,
          getNewLine: () => '\n',
        }));
        process.exitCode = 1;
      }
      program = undefined;
      console.log(`${manifest.name} ${name} ${extension}: ${diagnostics.length} diagnostics (${entries.length} exports)`);
    }
  }
  if (!process.exitCode) console.log(`DECLARATIONS_OK ${manifest.name}`);
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
