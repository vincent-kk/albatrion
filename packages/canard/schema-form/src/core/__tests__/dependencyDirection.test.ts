import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

/** Loaded by the unit suite; every non-test source edge is checked on each run. */
const CORE = fileURLToPath(new URL('..', import.meta.url));
const FRACTALS = [
  'engine/blueprint',
  'engine/record',
  'engine/behaviors',
  'engine/navigation',
  'engine/validation',
  'engine/settle',
  'engine/write',
  'surface',
];
const BEHAVIOR_KINDS = [
  'stringBehavior',
  'numberBehavior',
  'booleanBehavior',
  'nullBehavior',
  'objectBehavior',
  'arrayBehavior',
  'virtualBehavior',
  'unionBehavior',
];
const ORDER: Readonly<Record<string, number>> = {
  'engine/blueprint': 0,
  'engine/record': 1,
  'engine/behaviors': 2,
  'engine/navigation': 2,
  'engine/validation': 3,
  'engine/settle': 4,
  'engine/write': 5,
  surface: 6,
};

const BINDING_FORBIDDEN_ENGINE_NAMES = [
  'readFieldNodeDefaultValue',
  'readFieldNodeInactiveValues',
  'readFieldNodeTypeMismatch',
  'readFieldNodeTypeMismatches',
  'readFieldNodeWatchValues',
  'loadFieldNodeAtMount',
  'resetFieldNodeForm',
  'find',
  'findNodes',
  'PathKeyedMap',
  'PathKeyedSet',
  '*',
];

interface Edge {
  readonly source: string;
  readonly target: string;
  readonly specifier: string;
  /** Source export names before local aliasing; '*' denotes an unbounded import. */
  readonly names: readonly string[];
}

/** Walk the declared source roots, excluding verification files. */
const sourceFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === '__tests__') return [];
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return entry.name.endsWith('.ts') &&
      !/\.(?:test|spec)\.ts$/.test(entry.name)
      ? [path]
      : [];
  });

/** Resolve local imports, including directory entry points and type-only edges. */
const resolveImport = (source: string, specifier: string): string | null => {
  const base = specifier.startsWith('@/schema-form/')
    ? resolve(CORE, '..', specifier.slice('@/schema-form/'.length))
    : specifier.startsWith('.')
      ? resolve(dirname(source), specifier)
      : null;
  if (!base) return null;
  if (existsSync(`${base}.ts`)) return `${base}.ts`;
  if (existsSync(join(base, 'index.ts'))) return join(base, 'index.ts');
  return existsSync(base) ? base : null;
};

/** Parse static imports and re-exports rather than matching comments or strings. */
const importsIn = (source: string): Edge[] => {
  const text = readFileSync(source, 'utf8');
  const syntax = ts.createSourceFile(
    source,
    text,
    ts.ScriptTarget.Latest,
    true,
  );
  return syntax.statements.flatMap((statement) => {
    if (
      (!ts.isImportDeclaration(statement) &&
        !ts.isExportDeclaration(statement)) ||
      !statement.moduleSpecifier ||
      !ts.isStringLiteral(statement.moduleSpecifier)
    )
      return [];
    const specifier = statement.moduleSpecifier.text;
    const target = resolveImport(source, specifier) ?? specifier;
    const bindings = ts.isImportDeclaration(statement)
      ? statement.importClause?.namedBindings
      : statement.exportClause;
    const names =
      bindings && (ts.isNamedImports(bindings) || ts.isNamedExports(bindings))
        ? bindings.elements.map(
            ({ propertyName, name }) => (propertyName ?? name).text,
          )
        : ['*'];
    if (
      ts.isImportDeclaration(statement) &&
      statement.importClause?.name &&
      names[0] !== '*'
    )
      names.unshift('*');
    return [{ source, target, specifier, names }];
  });
};

/** Classify by the first new-fractal path segment. */
const owner = (file: string): string | null => {
  const path = relative(CORE, file);
  return FRACTALS.find((name) => path.startsWith(name + sep)) ?? null;
};

/** Kind modules are child fractals; the root behavior table consumes their entries. */
const behaviorKind = (file: string): string | null => {
  if (owner(file) !== 'engine/behaviors') return null;
  const first = relative(join(CORE, 'engine', 'behaviors'), file).split(sep)[0];
  return BEHAVIOR_KINDS.includes(first) ? first : null;
};

const files = FRACTALS.flatMap((name) => sourceFiles(join(CORE, name)));
const edges = files.flatMap(importsIn);

describe('NODE-016 and NODE-045 dependency direction', () => {
  it('REACT-009 binding organ depends only on its owner and lower core entry points', () => {
    const binding = join(CORE, 'surface', 'utils', 'binding') + sep;
    const bindings = files.filter((file) => file.startsWith(binding));
    expect(bindings.length).toBeGreaterThanOrEqual(7);
    const engineEntry = join(CORE, 'engine', 'index.ts');
    const forbidden = edges.filter(
      ({ source, target, names }) =>
        source.startsWith(binding) &&
        owner(target) !== 'surface' &&
        (target === engineEntry
          ? names.some((name) => BINDING_FORBIDDEN_ENGINE_NAMES.includes(name))
          : !target.startsWith(join(CORE, 'engine', 'types') + sep) &&
            !target.startsWith(join(CORE, '..', 'types') + sep) &&
            target !== join(CORE, '..', 'errors', 'index.ts') &&
            target !== '@winglet/common-utils/filter' &&
            !target.startsWith('@aileron/')),
    );
    expect(forbidden.map(({ specifier }) => specifier)).toEqual([]);
  });

  it('reads every non-test TypeScript file in the declared fractals', () => {
    for (const name of FRACTALS)
      expect(files.some((file) => owner(file) === name)).toBe(true);
    for (const nested of [
      'engine/record/types/runtime.ts',
      'surface/utils/guards.ts',
      'engine/settle/utils/write/writeFieldNode.ts',
      'engine/behaviors/utils/parse/utils/number/parseNumber.ts',
    ])
      expect(files).toContain(join(CORE, ...nested.split('/')));
    expect(files).not.toContainEqual(expect.stringContaining('__tests__'));
  });

  it('includes type-only imports and export-from edges in the parsed graph', () => {
    expect(
      edges.some(
        ({ source, specifier }) =>
          source.endsWith(`${sep}record${sep}types${sep}runtime.ts`) &&
          specifier === '../../blueprint',
      ),
    ).toBe(true);
    expect(
      edges.some(
        ({ source, specifier }) =>
          source.endsWith(`${sep}surface${sep}index.ts`) &&
          specifier === './type',
      ),
    ).toBe(true);
  });

  it('orders imports and type imports from blueprint through surface', () => {
    const reversed = edges.filter(({ source, target }) => {
      const from = owner(source);
      const to = owner(target);
      return from && to && from !== to && ORDER[from] <= ORDER[to];
    });
    expect(
      reversed.map(
        ({ source, specifier }) => `${relative(CORE, source)} -> ${specifier}`,
      ),
    ).toEqual([]);
  });

  it('blocks record imports of settle, surface, write, validation, app/plugin, and legacy', () => {
    const forbidden = edges.filter(
      ({ source, target, specifier }) =>
        owner(source) === 'engine/record' &&
        /(?:^|\/)(?:settle|FieldNode|dispatch|write|surface|validation|__legacy__)(?:\/|$)|(?:^|\/)app\/plugin(?:\/|$)/.test(
          `${target} ${specifier}`,
        ),
    );
    expect(
      forbidden.map(
        ({ source, specifier }) => `${relative(CORE, source)} -> ${specifier}`,
      ),
    ).toEqual([]);
  });

  it('crosses sibling fractals only through their index.ts entry points', () => {
    const direct = edges.filter(({ source, target }) => {
      const from = owner(source);
      const to = owner(target);
      if (!from || !to) return false;
      if (from !== to) return target !== join(CORE, to, 'index.ts');
      const targetKind = behaviorKind(target);
      return (
        targetKind !== null &&
        behaviorKind(source) !== targetKind &&
        target !== join(CORE, 'engine', 'behaviors', targetKind, 'index.ts')
      );
    });
    expect(
      direct.map(
        ({ source, specifier }) => `${relative(CORE, source)} -> ${specifier}`,
      ),
    ).toEqual([]);
  });

  it('surface reaches engine only through engine/index.ts', () => {
    const surfaceRoot = join(CORE, 'surface') + sep;
    const engineRoot = join(CORE, 'engine') + sep;
    const direct = edges.filter(
      ({ source, target }) =>
        source.startsWith(surfaceRoot) &&
        target.startsWith(engineRoot) &&
        target !== join(CORE, 'engine', 'index.ts'),
    );
    expect(
      direct.map(
        ({ source, specifier }) => `${relative(CORE, source)} -> ${specifier}`,
      ),
    ).toEqual([]);
  });

  it('engine source files never import the engine barrel, core barrel or surface', () => {
    const engineFiles = sourceFiles(join(CORE, 'engine'));
    expect(engineFiles).toContain(join(CORE, 'engine', 'index.ts'));
    const forbidden = engineFiles
      .flatMap(importsIn)
      .filter(
        ({ target }) =>
          target === join(CORE, 'engine', 'index.ts') ||
          target === join(CORE, 'index.ts') ||
          target.startsWith(join(CORE, 'surface') + sep),
      );
    expect(
      forbidden.map(
        ({ source, specifier }) => `${relative(CORE, source)} -> ${specifier}`,
      ),
    ).toEqual([]);
  });

  it('keeps every new fractal independent of the legacy engine', () => {
    expect(
      edges
        .filter(
          ({ target, specifier }) =>
            target.includes(`${sep}__legacy__${sep}`) ||
            specifier.includes('/__legacy__/'),
        )
        .map(
          ({ source, specifier }) =>
            `${relative(CORE, source)} -> ${specifier}`,
        ),
    ).toEqual([]);
  });

  it('keeps derive below settle without importing its orchestration or type', () => {
    const deriveRoot = join(CORE, 'engine', 'settle', 'derive') + sep;
    const settleRoot = join(CORE, 'engine', 'settle') + sep;
    const sameValue = join(
      CORE,
      'engine',
      'settle',
      'utils',
      'compute',
      'sameValue.ts',
    );
    const resolveDependencyPath = join(
      CORE,
      'engine',
      'settle',
      'utils',
      'paths',
      'resolveDependencyPath.ts',
    );
    const forbidden = edges.filter(
      ({ source, target }) =>
        source.startsWith(deriveRoot) &&
        target.startsWith(settleRoot) &&
        !target.startsWith(deriveRoot) &&
        target !== sameValue &&
        target !== resolveDependencyPath &&
        !target.startsWith(
          join(CORE, 'engine', 'settle', 'utils', 'controls') + sep,
        ),
    );
    expect(
      forbidden.map(
        ({ source, specifier }) => `${relative(CORE, source)} -> ${specifier}`,
      ),
    ).toEqual([]);
  });

  it('routes settle organ imports of derive through its index.ts', () => {
    const deriveRoot = join(CORE, 'engine', 'settle', 'derive') + sep;
    const direct = edges.filter(
      ({ source, target }) =>
        source.startsWith(join(CORE, 'engine', 'settle', 'utils') + sep) &&
        target.startsWith(deriveRoot) &&
        target !== join(CORE, 'engine', 'settle', 'derive', 'index.ts'),
    );
    expect(
      direct.map(
        ({ source, specifier }) => `${relative(CORE, source)} -> ${specifier}`,
      ),
    ).toEqual([]);
  });

  it('keeps shared controls interpretation independent of settle orchestration types', () => {
    const controlsRoot =
      join(CORE, 'engine', 'settle', 'utils', 'controls') + sep;
    const direct = edges.filter(
      ({ source, target }) =>
        source.startsWith(controlsRoot) &&
        target === join(CORE, 'engine', 'settle', 'type.ts'),
    );
    expect(
      direct.map(
        ({ source, specifier }) => `${relative(CORE, source)} -> ${specifier}`,
      ),
    ).toEqual([]);
  });
});
