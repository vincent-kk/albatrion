import { spawnSync } from 'node:child_process';
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const repositoryRoot = resolve(__dirname, '../../../../../..');
const requireFromHere = createRequire(__filename);
const ts = requireFromHere('typescript') as typeof import('typescript');

/** Workspace packages whose package.json declares `type: module` plus a `require` condition. */
const PACKAGES: Array<[name: string, dir: string, binding: string]> = [
  ['@winglet/common-utils', 'packages/winglet/common-utils', 'isPlainObject'],
  ['@winglet/json', 'packages/winglet/json', 'JSONPointer'],
  ['@winglet/json-schema', 'packages/winglet/json-schema', 'JSONSchemaScanner'],
  ['@winglet/data-loader', 'packages/winglet/data-loader', 'DataLoader'],
  ['@winglet/style-utils', 'packages/winglet/style-utils', 'cx'],
  ['@winglet/react-utils', 'packages/winglet/react-utils', 'useHandle'],
  // @lerx/promise-modal is left out: its SPECIFICATION.md:257 documents that no .d.cts is supplied.
  ['@canard/schema-form', 'packages/canard/schema-form', 'Form'],
  ['@canard/schema-form-ajv8-plugin', 'packages/canard/schema-form-ajv8-plugin', 'plugin'],
];

const makeConsumer = (type: 'commonjs' | 'module') => {
  const root = mkdtempSync(join(tmpdir(), `r3-contracts-${type}-`));
  writeFileSync(
    join(root, 'package.json'),
    JSON.stringify({ name: 'consumer', private: true, type }),
  );
  for (const [name, dir] of PACKAGES) {
    const target = join(root, 'node_modules', name);
    mkdirSync(dirname(target), { recursive: true });
    symlinkSync(join(repositoryRoot, dir), target, 'dir');
  }
  return root;
};

const typeCheck = (root: string, module: 'node16' | 'nodenext') => {
  const source = PACKAGES.map(
    ([name, , binding], index) =>
      `import { ${binding} as b${index} } from '${name}';\nexport const v${index} = b${index};`,
  ).join('\n');
  const file = join(root, 'index.ts');
  writeFileSync(file, source);
  const program = ts.createProgram([file], {
    module: module === 'node16' ? ts.ModuleKind.Node16 : ts.ModuleKind.NodeNext,
    moduleResolution:
      module === 'node16'
        ? ts.ModuleResolutionKind.Node16
        : ts.ModuleResolutionKind.NodeNext,
    target: ts.ScriptTarget.ES2022,
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    jsx: ts.JsxEmit.ReactJSX,
    lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'],
  });
  return ts
    .getPreEmitDiagnostics(program)
    .filter((diagnostic) => diagnostic.file?.fileName === file)
    .map(
      (diagnostic) =>
        `TS${diagnostic.code} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ').slice(0, 90)}`,
    );
};

describe('r3-contracts packaging', () => {
  it('a CommonJS TypeScript consumer (module node16) imports the packages that its runtime require() loads', () => {
    const root = makeConsumer('commonjs');
    const runtime = spawnSync(
      process.execPath,
      [
        '-e',
        PACKAGES.slice(0, 5)
          .map(([name]) => `require(${JSON.stringify(name)});`)
          .join(''),
      ],
      { cwd: root, encoding: 'utf8' },
    );
    // Control: Node's require condition loads the CommonJS build without error.
    expect(runtime.status, runtime.stderr).toBe(0);
    expect(typeCheck(root, 'node16')).toEqual([]);
  });

  it('control: an ESM TypeScript consumer (module node16) type-checks the same imports', () => {
    const root = makeConsumer('module');
    expect(typeCheck(root, 'node16')).toEqual([]);
  });

  it('control: a CommonJS consumer on module nodenext (TypeScript 5.8+ require of ESM) type-checks', () => {
    const root = makeConsumer('commonjs');
    expect(typeCheck(root, 'nodenext')).toEqual([]);
  });

  it('the published package resolves under a consumer that enables the "source" export condition', () => {
    const root = mkdtempSync(join(tmpdir(), 'r3-contracts-source-'));
    writeFileSync(
      join(root, 'package.json'),
      JSON.stringify({ name: 'consumer', private: true }),
    );
    // The npm artifact of @canard/schema-form 0.16.1, installed by the repository as an alias.
    const published = join(
      repositoryRoot,
      'node_modules/@canard/schema-form_0.16.1',
    );
    // A packed copy of the current @winglet/common-utils: its `files` list (dist, docs, README.md).
    const current = join(repositoryRoot, 'packages/winglet/common-utils');
    const packed = join(root, 'node_modules/@winglet/common-utils');
    mkdirSync(packed, { recursive: true });
    cpSync(join(current, 'package.json'), join(packed, 'package.json'));
    symlinkSync(join(current, 'dist'), join(packed, 'dist'), 'dir');
    mkdirSync(join(root, 'node_modules/@canard'), { recursive: true });
    symlinkSync(
      published,
      join(root, 'node_modules/@canard/schema-form'),
      'dir',
    );

    const packedManifest = JSON.parse(
      readFileSync(join(packed, 'package.json'), 'utf8'),
    );
    expect(packedManifest.files).not.toContain('src');

    const resolveWith = (name: string, conditions: string[]) =>
      spawnSync(
        process.execPath,
        [
          ...conditions.map((condition) => `--conditions=${condition}`),
          '-e',
          `console.log(require.resolve(${JSON.stringify(name)}))`,
        ],
        { cwd: root, encoding: 'utf8' },
      );

    const outcome = ['@winglet/common-utils', '@canard/schema-form'].map(
      (name) => {
        const plain = resolveWith(name, []);
        const source = resolveWith(name, ['source']);
        return {
          name,
          plain: plain.status === 0 ? 'resolved' : 'failed',
          source:
            source.status === 0
              ? 'resolved'
              : (/Cannot find module '[^']*'/.exec(source.stderr)?.[0] ??
                'failed'),
        };
      },
    );
    expect(outcome).toEqual([
      { name: '@winglet/common-utils', plain: 'resolved', source: 'resolved' },
      { name: '@canard/schema-form', plain: 'resolved', source: 'resolved' },
    ]);
  });

  it('a bundler (esbuild) configured with the "source" condition bundles the packed package', async () => {
    const esbuild = requireFromHere('esbuild') as typeof import('esbuild');
    const root = mkdtempSync(join(tmpdir(), 'r3-contracts-esbuild-'));
    const current = join(repositoryRoot, 'packages/winglet/common-utils');
    const packed = join(root, 'node_modules/@winglet/common-utils');
    mkdirSync(packed, { recursive: true });
    cpSync(join(current, 'package.json'), join(packed, 'package.json'));
    symlinkSync(join(current, 'dist'), join(packed, 'dist'), 'dir');
    writeFileSync(
      join(root, 'entry.js'),
      "import { isPlainObject } from '@winglet/common-utils';\nconsole.log(isPlainObject({}));\n",
    );
    const bundle = (conditions: string[]) =>
      esbuild
        .build({
          absWorkingDir: root,
          entryPoints: ['entry.js'],
          bundle: true,
          write: false,
          logLevel: 'silent',
          conditions,
        })
        .then(
          () => 'bundled',
          (error: { errors: Array<{ text: string }> }) => error.errors[0]?.text ?? 'failed',
        );
    expect({ plain: await bundle([]), source: await bundle(['source']) }).toEqual({
      plain: 'bundled',
      source: 'bundled',
    });
  });
});
