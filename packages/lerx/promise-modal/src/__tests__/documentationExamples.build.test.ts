// @vitest-environment node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';
import { expect, it } from 'vitest';

/** The published guides promise standalone modules in their TypeScript fences. */
const documents = [
  'README.md',
  'README-ko_kr.md',
  'docs/en/SPECIFICATION.md',
  'docs/ko/SPECIFICATION.md',
];

it('typechecks the shipped documentation examples against the built public declarations', () => {
  const packageRoot = resolve(__dirname, '../..');
  const snippets = new Map<string, string>();
  for (const document of documents) {
    const source = readFileSync(resolve(packageRoot, document), 'utf8');
    const fences = [
      ...source.matchAll(/^```(?:tsx?|typescript)\n([\s\S]*?)^```/gm),
    ];
    expect(fences.length, document).toBeGreaterThan(0);
    for (const fence of fences) {
      const line = source.slice(0, fence.index).split('\n').length;
      const name = `${document.replace(/\//g, '-')}-${line}.tsx`;
      snippets.set(resolve(packageRoot, '__documentation__', name), fence[1]);
    }
  }

  const options: ts.CompilerOptions = {
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
    types: ['react'],
  };
  const host = ts.createCompilerHost(options);
  const getSourceFile = host.getSourceFile;
  host.getSourceFile = (
    file,
    languageVersion,
    onError,
    shouldCreateNewSourceFile,
  ) => {
    const snippet = snippets.get(resolve(file));
    return snippet === undefined
      ? getSourceFile(file, languageVersion, onError, shouldCreateNewSourceFile)
      : ts.createSourceFile(
          file,
          snippet,
          languageVersion,
          true,
          ts.ScriptKind.TSX,
        );
  };
  const program = ts.createProgram([...snippets.keys()], options, host);
  const diagnostics = ts.formatDiagnosticsWithColorAndContext(
    ts.getPreEmitDiagnostics(program),
    host,
  );
  expect(diagnostics).toBe('');
  expect(
    program
      .getSourceFiles()
      .some(
        (source) =>
          resolve(source.fileName) === resolve(packageRoot, 'dist/index.d.ts'),
      ),
  ).toBe(true);
});
