// Invoked by workspace build:verify:types; the cwd package's exports select the declarations checked.
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import ts from 'typescript';

const packageDir = process.cwd();
const manifest = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'));
const entries = Object.entries(manifest.exports).filter(([, target]) => target.types);
if (!entries.length) throw new Error(`${manifest.name}: no typed public exports found`);

const scratch = mkdtempSync(join(tmpdir(), 'declaration-consumer-'));
try {
  const link = join(scratch, 'node_modules', manifest.name);
  mkdirSync(dirname(link), { recursive: true });
  symlinkSync(packageDir, link, 'dir');
  writeFileSync(join(scratch, 'package.json'), '{"type":"module"}\n');
  const consumer = join(scratch, 'consumer.mts');
  writeFileSync(consumer, entries.map(([key], index) =>
    `export * as entry${index} from '${manifest.name}${key === '.' ? '' : key.slice(1)}';`,
  ).join('\n'));

  for (const [name, module, moduleResolution] of [
    ['NodeNext', ts.ModuleKind.NodeNext, ts.ModuleResolutionKind.NodeNext],
    ['Bundler', ts.ModuleKind.ESNext, ts.ModuleResolutionKind.Bundler],
  ]) {
    const program = ts.createProgram([consumer], {
      strict: true,
      noEmit: true,
      skipLibCheck: false,
      target: ts.ScriptTarget.ES2022,
      module,
      moduleResolution,
      types: [],
      lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'],
    });
    const diagnostics = ts.getPreEmitDiagnostics(program);
    if (diagnostics.length) {
      console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, {
        getCurrentDirectory: () => packageDir,
        getCanonicalFileName: (path) => path,
        getNewLine: () => '\n',
      }));
      process.exitCode = 1;
    }
    console.log(`${manifest.name} ${name}: ${diagnostics.length} diagnostics (${entries.length} exports)`);
  }
  if (!process.exitCode) console.log(`DECLARATIONS_OK ${manifest.name}`);
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
