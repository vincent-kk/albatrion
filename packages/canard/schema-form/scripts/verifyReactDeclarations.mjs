import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = resolve(packageRoot, '../../..');
const root = mkdtempSync(join(tmpdir(), 'schema-form-react-types-'));
try {
  writeFileSync(
    join(root, 'package.json'),
    JSON.stringify({ private: true, type: 'module' }),
  );
  const reactTypes = join(root, 'types-react');
  cpSync(
    join(
      repositoryRoot,
      'packages/aileron/development-helper/node_modules/@types/react',
    ),
    reactTypes,
    { recursive: true },
  );
  for (const file of ['jsx-runtime.d.ts', 'jsx-dev-runtime.d.ts'])
    writeFileSync(join(reactTypes, file), "import './';\n");
  const target = join(root, 'node_modules/@canard/schema-form');
  mkdirSync(dirname(target), { recursive: true });
  symlinkSync(packageRoot, target, 'dir');
  const file = join(root, 'consumer.mts');
  writeFileSync(file, "export * from '@canard/schema-form';\n");
  const program = ts.createProgram([file], {
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    target: ts.ScriptTarget.ES2022,
    strict: true,
    noEmit: true,
    skipLibCheck: false,
    types: [],
    jsx: ts.JsxEmit.ReactJSX,
    lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'],
    baseUrl: root,
    paths: {
      csstype: [join(repositoryRoot, 'node_modules/csstype/index.d.ts')],
      'prop-types': [
        join(repositoryRoot, 'node_modules/@types/prop-types/index.d.ts'),
      ],
      react: [join(reactTypes, 'index.d.ts')],
      'react/*': [join(reactTypes, '*.d.ts')],
      'react-dom': [
        join(
          repositoryRoot,
          'packages/aileron/development-helper/node_modules/@types/react-dom/index.d.ts',
        ),
      ],
      'react-dom/*': [
        join(
          repositoryRoot,
          'packages/aileron/development-helper/node_modules/@types/react-dom/*.d.ts',
        ),
      ],
    },
  });
  const diagnostics = ts.getPreEmitDiagnostics(program);
  if (diagnostics.length) {
    console.error(
      ts.formatDiagnosticsWithColorAndContext(diagnostics, {
        getCanonicalFileName: (file) => file,
        getCurrentDirectory: () => packageRoot,
        getNewLine: () => '\n',
      }),
    );
    process.exitCode = 1;
  } else
    console.log(
      'REACT_DECLARATIONS_OK (emulated pre-18.2.6 JSX runtime; strict skipLibCheck=false)',
    );
} finally {
  rmSync(root, { recursive: true, force: true });
}
