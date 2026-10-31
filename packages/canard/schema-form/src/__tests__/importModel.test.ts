/**
 * Import model: an owner may directly read its internals and ancestor internals.
 * U: importing an owner's or ancestor's own index is forbidden.
 * D: descendant fractals are reached only through the topmost child fractal index.
 * S1: non-lineage fractals are reached through their own index, never internals.
 * B1: organs do not import their owner's direct child fractals, subject to B7.
 * Index retention: exported names have product consumers outside their owner's subtree (stated, not asserted here).
 * D7: public-API tests under __tests__/e2e, scenarios and migration may read the root index.
 * O and deeper non-lineage index re-exports are outside these assertions.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { expect, it } from 'vitest';

/** Source root derived from this test, independent of the checkout location. */
const sourceRoot = resolve(fileURLToPath(new URL('../', import.meta.url)));

/** A resolved edge rejected by the U, D or S1 rules. */
interface ImportViolation {
  /** Source-root-relative importing file. */
  importer: string;
  /** One-based line at the import or re-export node. */
  line: number;
  /** Source-root-relative resolved target file. */
  target: string;
  /** Rule violated by this edge, excluding the O classification. */
  verdict: 'U' | 'D' | 'S1';
}

/**
 * Enumerates source and contract files without legacy or generated compartments.
 * @param directory - Existing directory beneath the package source root.
 * @returns Files available to the import-model census.
 */
function walkFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (
      entry.name.includes('__legacy__') ||
      entry.name.startsWith('.') ||
      ['node_modules', 'dist', 'build'].includes(entry.name)
    )
      return [];
    const file = join(directory, entry.name);
    return entry.isDirectory() ? walkFiles(file) : [file];
  });
}

/**
 * Resolves the model's relative and package-local alias specifiers.
 * @param specifier - Literal import target; external dependencies are ignored.
 * @param importer - Absolute path used as the base for relative imports.
 * @returns Existing TS, TSX or explicit JSON target, or undefined when unresolved.
 */
function resolveImport(
  specifier: string,
  importer: string,
): string | undefined {
  let base: string;
  if (specifier.startsWith('.')) base = resolve(dirname(importer), specifier);
  else if (specifier.startsWith('@/schema-form'))
    base = join(sourceRoot, specifier.slice('@/schema-form'.length));
  else return undefined;

  return [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    join(base, 'index.ts'),
    join(base, 'index.tsx'),
  ].find((file) => existsSync(file) && statSync(file).isFile());
}

/**
 * Checks whether a file or owner belongs to a directory's subtree.
 * @param file - Absolute file or directory path to classify.
 * @param directory - Absolute subtree root.
 * @returns True for the root itself or any of its descendants.
 */
function isWithin(file: string, directory: string): boolean {
  return file === directory || file.startsWith(`${directory}${sep}`);
}

/**
 * Finds the nearest contract owner, with src as the unconditional root fractal.
 * @param file - Resolved file inside src.
 * @param fractals - Reused index of directories containing INTENT or DETAIL.
 * @returns The closest containing fractal directory.
 */
function findOwner(file: string, fractals: ReadonlySet<string>): string {
  let directory = dirname(file);
  while (!fractals.has(directory)) directory = dirname(directory);
  return directory;
}

/**
 * Reads literal import/export declarations, string dynamic import() and import type nodes.
 * @param file - Existing TS or TSX file, parsed without type checking.
 * @returns Specifiers and their one-based declaration lines, including type-only edges.
 */
function readImports(file: string): { specifier: string; line: number }[] {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const imports: { specifier: string; line: number }[] = [];
  const visit = (node: ts.Node): void => {
    let literal: ts.StringLiteral | undefined;
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    )
      literal = node.moduleSpecifier;
    else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments[0] &&
      ts.isStringLiteral(node.arguments[0])
    )
      literal = node.arguments[0];
    else if (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument) &&
      ts.isStringLiteral(node.argument.literal)
    )
      literal = node.argument.literal;
    if (literal)
      imports.push({
        specifier: literal.text,
        line: source.getLineAndCharacterOfPosition(node.getStart()).line + 1,
      });
    ts.forEachChild(node, visit);
  };
  visit(source);
  return imports;
}

/**
 * Classifies one resolved edge under the U, D and S1 rules.
 * @param importer - Absolute source file path inside src.
 * @param target - Absolute resolved target inside src, including JSON fixtures.
 * @param fractals - Contract directories defining the model's owner tree.
 * @returns A forbidden verdict, or undefined for edges outside these rules.
 */
function classifyImport(
  importer: string,
  target: string,
  fractals: ReadonlySet<string>,
): ImportViolation['verdict'] | undefined {
  const importerOwner = findOwner(importer, fractals);
  const targetOwner = findOwner(target, fractals);
  const ownIndex =
    /^index\.tsx?$/.test(basename(target)) && dirname(target) === targetOwner;

  if (isWithin(importerOwner, targetOwner)) return ownIndex ? 'U' : undefined;
  if (!isWithin(targetOwner, importerOwner)) return ownIndex ? undefined : 'S1';

  let gateway = targetOwner;
  for (
    let directory = targetOwner;
    directory !== importerOwner;
    directory = dirname(directory)
  )
    if (fractals.has(directory)) gateway = directory;
  return ownIndex && dirname(target) === gateway ? undefined : 'D';
}

it('keeps U outside D7, D and S1 import-model edges at zero', () => {
  const files = walkFiles(sourceRoot);
  const fractals = new Set([
    sourceRoot,
    ...files
      .filter((file) => /^(INTENT|DETAIL)\.md$/.test(basename(file)))
      .map((file) => dirname(file)),
  ]);
  const violations: ImportViolation[] = [];
  let totalU = 0;
  let exemptU = 0;
  const revealRuntimeBridges: string[] = [];
  for (const importer of files.filter((file) => /\.tsx?$/.test(file))) {
    for (const { specifier, line } of readImports(importer)) {
      const target = resolveImport(specifier, importer);
      if (
        !target ||
        !isWithin(target, sourceRoot) ||
        target.includes('__legacy__')
      )
        continue;
      const verdict = classifyImport(importer, target, fractals);
      if (!verdict) continue;
      const importerPath = relative(sourceRoot, importer).split(sep).join('/');
      if (
        verdict === 'D' &&
        (importerPath === '__tests__/helpers/readFieldNodeRuntime.ts' ||
          importerPath ===
            '__tests__/helpers/releaseFieldNodeRevealHistory.ts') &&
        relative(sourceRoot, target).split(sep).join('/') ===
          'core/surface/runtime/requireRuntimeFieldNode.ts'
      ) {
        revealRuntimeBridges.push(importerPath);
        continue;
      }
      if (verdict === 'U') {
        totalU++;
        if (/^__tests__\/(e2e|scenarios|migration)\//.test(importerPath)) {
          exemptU++;
          continue;
        }
      }
      violations.push({
        importer: importerPath,
        line,
        target: relative(sourceRoot, target).split(sep).join('/'),
        verdict,
      });
    }
  }
  const counts = {
    U: violations.filter((edge) => edge.verdict === 'U').length,
    D: violations.filter((edge) => edge.verdict === 'D').length,
    S1: violations.filter((edge) => edge.verdict === 'S1').length,
  };
  const edges = violations.map(
    (edge) =>
      `${edge.importer}:${edge.line} -> ${edge.target} [${edge.verdict}]`,
  );
  const message = [
    `Import model: U=${totalU} (D7=${exemptU}, asserted=${counts.U}), D=${counts.D}, S1=${counts.S1}`,
    ...edges.sort(),
  ].join('\n');
  expect(
    revealRuntimeBridges.sort(),
    'exact named reveal verification bridges',
  ).toEqual([
    '__tests__/helpers/readFieldNodeRuntime.ts',
    '__tests__/helpers/releaseFieldNodeRevealHistory.ts',
  ]);
  console.info(
    'IMPORT_MODEL_REVEAL_BRIDGE count=' + revealRuntimeBridges.length,
  );
  expect(counts, message).toEqual({ U: 0, D: 0, S1: 0 });
}, 60000);

/**
 * B1: organ files cannot import their owner's direct child fractals, including internals.
 * B7: verification organs and child fractals within the importer's top organ are exempt.
 */
it('B1: organ files do not import a direct child fractal of their owner', () => {
  const files = walkFiles(sourceRoot);
  const fractals = new Set([
    sourceRoot,
    ...files
      .filter((file) => /^(INTENT|DETAIL)\.md$/.test(basename(file)))
      .map((file) => dirname(file)),
  ]);
  const violations: Pick<ImportViolation, 'importer' | 'line' | 'target'>[] =
    [];
  for (const importer of files.filter((file) => /\.tsx?$/.test(file))) {
    const importerPath = relative(sourceRoot, importer).split(sep).join('/');
    if (
      importerPath
        .split('/')
        .some((segment) =>
          ['__tests__', '__benchmarks__', 'fixtures'].includes(segment),
        )
    )
      continue;
    const owner = findOwner(importer, fractals);
    if (dirname(importer) === owner) continue;
    const importerOrgan = relative(owner, importer).split(sep)[0];
    const children = [...fractals].filter(
      (fractal) =>
        fractal !== sourceRoot && findOwner(fractal, fractals) === owner,
    );
    for (const { specifier, line } of readImports(importer)) {
      const target = resolveImport(specifier, importer);
      if (
        !target ||
        !isWithin(target, sourceRoot) ||
        target.includes('__legacy__')
      )
        continue;
      const child = children.find((fractal) => isWithin(target, fractal));
      if (!child || relative(owner, child).split(sep)[0] === importerOrgan)
        continue;
      violations.push({
        importer: importerPath,
        line,
        target: relative(sourceRoot, target).split(sep).join('/'),
      });
    }
  }
  const edges = violations.map(
    (edge) => `${edge.importer}:${edge.line} -> ${edge.target}`,
  );
  const message = [
    `Import model: B1=${violations.length}`,
    ...edges.sort(),
  ].join('\n');
  expect(violations, message).toEqual([]);
}, 60000);
