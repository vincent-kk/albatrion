import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

/** Loaded by the unit suite; every non-test source edge is checked on each run. */
const CORE = fileURLToPath(new URL('..', import.meta.url));
const FRACTALS = ['blueprint', 'record', 'behaviors', 'navigation',
  'settle', 'SchemaNode'];
const BEHAVIOR_KINDS = ['stringBehavior', 'numberBehavior', 'booleanBehavior',
  'nullBehavior', 'objectBehavior', 'virtualBehavior', 'unionBehavior'];
const ORDER: Readonly<Record<string, number>> = {
  blueprint: 0, record: 1, behaviors: 2, navigation: 2,
  settle: 3, SchemaNode: 4,
};

interface Edge {
  readonly source: string;
  readonly target: string;
  readonly specifier: string;
}

/** Walk the declared source roots, excluding verification files. */
const sourceFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === '__tests__') return [];
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return entry.name.endsWith('.ts') && !/\.(?:test|spec)\.ts$/.test(entry.name)
      ? [path] : [];
  });

/** Resolve local imports, including directory entry points and type-only edges. */
const resolveImport = (source: string, specifier: string): string | null => {
  const base = specifier.startsWith('@/schema-form/')
    ? resolve(CORE, '..', specifier.slice('@/schema-form/'.length))
    : specifier.startsWith('.') ? resolve(dirname(source), specifier) : null;
  if (!base) return null;
  if (existsSync(`${base}.ts`)) return `${base}.ts`;
  if (existsSync(join(base, 'index.ts'))) return join(base, 'index.ts');
  return existsSync(base) ? base : null;
};

/** Parse static imports and re-exports rather than matching comments or strings. */
const importsIn = (source: string): Edge[] => {
  const text = readFileSync(source, 'utf8');
  const syntax = ts.createSourceFile(source, text, ts.ScriptTarget.Latest, true);
  return syntax.statements.flatMap((statement) => {
    if ((!ts.isImportDeclaration(statement) &&
      !ts.isExportDeclaration(statement)) ||
      !statement.moduleSpecifier || !ts.isStringLiteral(statement.moduleSpecifier))
      return [];
    const specifier = statement.moduleSpecifier.text;
    const target = resolveImport(source, specifier) ?? specifier;
    return [{ source, target, specifier }];
  });
};

/** Classify by the first new-fractal path segment. */
const owner = (file: string): string | null => {
  const first = relative(CORE, file).split(sep)[0];
  return FRACTALS.includes(first) ? first : null;
};

/** Kind modules are child fractals; the root behavior table consumes their entries. */
const behaviorKind = (file: string): string | null => {
  if (owner(file) !== 'behaviors') return null;
  const first = relative(join(CORE, 'behaviors'), file).split(sep)[0];
  return BEHAVIOR_KINDS.includes(first) ? first : null;
};

const files = FRACTALS.flatMap((name) => sourceFiles(join(CORE, name)));
const edges = files.flatMap(importsIn);

describe('NODE-016 and NODE-045 dependency direction', () => {
  it('reads every non-test TypeScript file in the five fractals and blueprint', () => {
    for (const name of FRACTALS)
      expect(files.some((file) => owner(file) === name)).toBe(true);
    for (const nested of [
      'record/type.ts',
      'SchemaNode/utils/guards.ts',
      'settle/utils/write/writeSchemaNode.ts',
      'behaviors/utils/parse/utils/number/parseNumber.ts',
    ])
      expect(files).toContain(join(CORE, ...nested.split('/')));
    expect(files).not.toContainEqual(expect.stringContaining('__tests__'));
  });

  it('includes type-only imports and export-from edges in the parsed graph', () => {
    expect(edges.some(({ source, specifier }) =>
      source.endsWith(`${sep}record${sep}type.ts`) &&
      specifier === '../blueprint')).toBe(true);
    expect(edges.some(({ source, specifier }) =>
      source.endsWith(`${sep}SchemaNode${sep}index.ts`) &&
      specifier === './type')).toBe(true);
  });

  it('orders imports and type imports from blueprint through SchemaNode', () => {
    const reversed = edges.filter(({ source, target }) => {
      const from = owner(source);
      const to = owner(target);
      return from && to && from !== to && ORDER[from] <= ORDER[to];
    });
    expect(reversed.map(({ source, specifier }) =>
      `${relative(CORE, source)} -> ${specifier}`)).toEqual([]);
  });

  it('blocks record imports of settle, SchemaNode, dispatch, validation, app/plugin, and legacy', () => {
    const forbidden = edges.filter(({ source, target, specifier }) =>
      owner(source) === 'record' &&
      /(?:^|\/)(?:settle|SchemaNode|dispatch|validation|__legacy__)(?:\/|$)|(?:^|\/)app\/plugin(?:\/|$)/
        .test(`${target} ${specifier}`));
    expect(forbidden.map(({ source, specifier }) =>
      `${relative(CORE, source)} -> ${specifier}`)).toEqual([]);
  });

  it('crosses sibling fractals only through their index.ts entry points', () => {
    const direct = edges.filter(({ source, target }) => {
      const from = owner(source);
      const to = owner(target);
      if (!from || !to) return false;
      if (from !== to) return target !== join(CORE, to, 'index.ts');
      const targetKind = behaviorKind(target);
      return targetKind !== null && behaviorKind(source) !== targetKind &&
        target !== join(CORE, 'behaviors', targetKind, 'index.ts');
    });
    expect(direct.map(({ source, specifier }) =>
      `${relative(CORE, source)} -> ${specifier}`)).toEqual([]);
  });

  it('keeps every new fractal independent of the legacy engine', () => {
    expect(edges.filter(({ target, specifier }) =>
      target.includes(`${sep}__legacy__${sep}`) ||
      specifier.includes('/__legacy__/')).map(({ source, specifier }) =>
      `${relative(CORE, source)} -> ${specifier}`)).toEqual([]);
  });
});
