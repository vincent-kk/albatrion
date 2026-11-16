import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { after, before, describe, it } from 'node:test';

import { type DeclarationIndex, type DeclarationPage, buildDeclarationIndex } from '../lib/buildDeclarationIndex';
import type { PackageEntry } from '../lib/types';

let root: string;

/** Writes a fake built package under the temporary root and describes it as `discoverPackages` would. */
const writePackage = (shortName: string, subPathKeys: string[], files: Record<string, string>): PackageEntry => {
  const packageRoot = path.join(root, shortName);
  const exportsMap: Record<string, { types: string }> = { '.': { types: './dist/index.d.ts' } };
  for (const key of subPathKeys) exportsMap[key] = { types: `./dist/${key.slice(2)}/index.d.ts` };
  const allFiles = { 'package.json': JSON.stringify({ name: `@winglet/${shortName}`, version: '1.0.0', exports: exportsMap }), ...files };
  for (const [relativePath, content] of Object.entries(allFiles)) {
    fs.mkdirSync(path.dirname(path.join(packageRoot, relativePath)), { recursive: true });
    fs.writeFileSync(path.join(packageRoot, relativePath), content);
  }
  return {
    name: `@winglet/${shortName}`,
    version: '1.0.0',
    namespace: 'winglet',
    shortName,
    mainDtsPath: path.join(packageRoot, 'dist/index.d.ts'),
    mdxPath: '',
    subPaths: subPathKeys.map(exportKey => ({ exportKey, dtsPath: path.join(packageRoot, `dist/${exportKey.slice(2)}/index.d.ts`) })),
  };
};

const pageOf = (index: DeclarationIndex, category: string, pageName: string): DeclarationPage => {
  const found = index.pages.find(page => page.category === category && page.pageName === pageName);
  assert.ok(found, `no page ${category}/${pageName}`);
  return found;
};

const importLines = (page: DeclarationPage): string[] =>
  page.importPaths.map(item => `${item.typeOnly ? 'type ' : ''}${item.exportedName} ${item.moduleSpecifier}`);

let fake: DeclarationIndex;

before(() => {
  root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'build-declaration-index-')));
  fake = buildDeclarationIndex(
    writePackage('fake', ['./alpha', './beta'], {
      'dist/alpha/shared.d.ts': '/** Shared helper. */\nexport declare function shared(value: number): number;\n',
      'dist/alpha/unescapePath.d.ts': '/** Unescapes a path. */\nexport declare const unescapePath: (path: string) => string;\n',
      'dist/alpha/format.d.ts': '/** Formats a string. */\nexport declare function format(value: string): string;\n',
      'dist/alpha/legacyFormat.d.ts': '/** Formats a number. */\nexport declare function format(value: number): string;\n',
      'dist/alpha/Options.d.ts': '/** Options. */\nexport interface Options {\n    strict: boolean;\n}\n',
      'dist/alpha/isElement.d.ts':
        "/**\n * Checks whether a value is an element.\n */\nexport { isValidElement as isElement } from 'extlib';\n",
      'dist/alpha/pointer.d.ts': '/** Builds a pointer. */\nexport declare function getJSONPointer(): string;\n',
      'dist/alpha/legacyPointer.d.ts': '/** @deprecated Use getJSONPointer. */\nexport declare function getJsonPointer(): string;\n',
      'dist/alpha/path.d.ts': '/** Joins a path. */\nexport declare function joinPath(): string;\n',
      'dist/alpha/legacyPath.d.ts': '/** Joins a path in capitals. */\nexport declare function joinPATH(): string;\n',
      'dist/alpha/index.d.ts': [
        "export { shared } from './shared.js';",
        "export { unescapePath, unescapePath as unescapeSegment, unescapePath as UnescapePath } from './unescapePath.js';",
        "export { format } from './format.js';",
        "export { format as formatLegacy } from './legacyFormat.js';",
        "export type { Options } from './Options.js';",
        "export { isElement } from './isElement.js';",
        "export { getJSONPointer } from './pointer.js';",
        "export { getJsonPointer } from './legacyPointer.js';",
        "export { joinPath } from './path.js';",
        "export {\n/** @deprecated Use joinPath. */\njoinPATH, } from './legacyPath.js';",
        "export { Beta } from '../beta/Beta.js';",
        '',
      ].join('\n'),
      'dist/beta/Beta.d.ts': '/** The beta declaration. */\nexport declare const Beta: number;\n',
      'dist/beta/index.d.ts': "export { Beta } from './Beta.js';\nexport { shared } from '../alpha/shared.js';\n",
      'dist/rootOnly.d.ts': '/** Only the root exports this. */\nexport declare function rootOnly(): void;\n',
      'dist/index.d.ts': [
        "export * from './alpha/index.js';",
        "export { Beta } from './beta/index.js';",
        "export { rootOnly } from './rootOnly.js';",
        '',
      ].join('\n'),
    }),
  );
});

after(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe('buildDeclarationIndex', () => {
  it('builds one page per declaration and leaves no exported name undocumented', () => {
    assert.deepEqual(
      fake.pages.map(page => `${page.category}/${page.pageName}`).sort(),
      [
        '/rootOnly',
        'alpha/Options',
        'alpha/format',
        'alpha/formatLegacy',
        'alpha/getJSONPointer',
        'alpha/isElement',
        'alpha/joinPath',
        'alpha/shared',
        'alpha/unescapePath',
        'beta/Beta',
      ],
    );
    assert.deepEqual(fake.undocumented, []);
  });

  it('places a declaration exported by two sub-paths under the nearest one and lists every import path in order', () => {
    const shared = pageOf(fake, 'alpha', 'shared');
    assert.equal(shared.key, `${path.join(root, 'fake/dist/alpha/shared.d.ts')}#shared`);
    assert.deepEqual(importLines(shared), [
      'shared @winglet/fake/alpha',
      'shared @winglet/fake/beta',
      'shared @winglet/fake',
    ]);
  });

  it('places a declaration whose name matches a category under that category', () => {
    assert.deepEqual(importLines(pageOf(fake, 'beta', 'Beta')), [
      'Beta @winglet/fake/beta',
      'Beta @winglet/fake/alpha',
      'Beta @winglet/fake',
    ]);
  });

  it('places a declaration that only the root exports directly under the package directory', () => {
    assert.deepEqual(importLines(pageOf(fake, '', 'rootOnly')), ['rootOnly @winglet/fake']);
  });

  it('lists every alias under its entry, the page name first', () => {
    assert.deepEqual(importLines(pageOf(fake, 'alpha', 'unescapePath')), [
      'unescapePath @winglet/fake/alpha',
      'UnescapePath @winglet/fake/alpha',
      'unescapeSegment @winglet/fake/alpha',
      'unescapePath @winglet/fake',
      'UnescapePath @winglet/fake',
      'unescapeSegment @winglet/fake',
    ]);
  });

  it('marks type-only import paths', () => {
    assert.deepEqual(importLines(pageOf(fake, 'alpha', 'Options')), [
      'type Options @winglet/fake/alpha',
      'type Options @winglet/fake',
    ]);
  });

  it('names a page after its exported alias when the canonical entry does not export the declared name', () => {
    const legacy = pageOf(fake, 'alpha', 'formatLegacy');
    assert.equal(legacy.parsed.description, 'Formats a number.');
    assert.equal(legacy.parsed.name, 'formatLegacy');
    assert.equal(pageOf(fake, 'alpha', 'format').parsed.description, 'Formats a string.');
  });

  it('documents a re-export of a declaration from another module with its source', () => {
    const isElement = pageOf(fake, 'alpha', 'isElement');
    assert.equal(isElement.parsed.kind, 're-export');
    assert.equal(isElement.parsed.description, 'Checks whether a value is an element.');
    assert.equal(isElement.parsed.typeSignature, "export { isValidElement as isElement } from 'extlib';");
    assert.deepEqual(isElement.parsed.externalSource, { moduleSpecifier: 'extlib', originalName: 'isValidElement' });
  });

  it('skips a deprecated declaration whose page path differs from a current page only by case', () => {
    assert.equal(
      fake.pages.some(page => /^(getJsonPointer|joinPATH)$/.test(page.pageName)),
      false,
    );
  });

  it('redirects non-canonical sub-path addresses and aliases, but not root addresses or case-insensitive page paths', () => {
    assert.deepEqual(fake.redirects, [
      { from: '/docs/winglet/fake/alpha/Beta', to: '/docs/winglet/fake/beta/Beta' },
      { from: '/docs/winglet/fake/alpha/unescapeSegment', to: '/docs/winglet/fake/alpha/unescapePath' },
      { from: '/docs/winglet/fake/beta/shared', to: '/docs/winglet/fake/alpha/shared' },
    ]);
  });

  it('does not redirect an address that is a category directory', () => {
    const nested = buildDeclarationIndex(
      writePackage('nest', ['./group', './group/inner'], {
        'dist/group/inner/inner.d.ts': '/** Inner. */\nexport declare const inner: number;\n',
        'dist/group/inner/index.d.ts': "export { inner } from './inner.js';\n",
        'dist/group/index.d.ts': "export { inner } from './inner/inner.js';\n",
        'dist/index.d.ts': "export { inner } from './group/inner/index.js';\n",
      }),
    );
    assert.deepEqual(
      nested.pages.map(page => `${page.category}/${page.pageName}`),
      ['group/inner/inner'],
    );
    assert.deepEqual(nested.redirects, []);
  });

  it('throws when two current declarations need the same page path', () => {
    const clash = writePackage('clash', ['./a'], {
      'dist/a/x.d.ts': '/** Lower. */\nexport declare const thing: number;\n',
      'dist/a/y.d.ts': '/** Upper. */\nexport declare const Thing: number;\n',
      'dist/a/index.d.ts': "export { thing } from './x.js';\nexport { Thing } from './y.js';\n",
      'dist/index.d.ts': "export * from './a/index.js';\n",
    });
    assert.throws(() => buildDeclarationIndex(clash), /page path collision: @winglet\/clash a\/Thing \(.*y\.d\.ts\), a\/thing \(.*x\.d\.ts\)/);
  });

  it('redirects an alias of a package without sub-paths from its root address', () => {
    const solo = buildDeclarationIndex(
      writePackage('solo', [], {
        'dist/main.d.ts': '/** Main. */\nexport declare function main(): void;\n',
        'dist/index.d.ts': "export { main, main as alias } from './main.js';\n",
      }),
    );
    assert.deepEqual(
      solo.pages.map(page => `${page.category}/${page.pageName}`),
      ['/main'],
    );
    assert.deepEqual(solo.redirects, [{ from: '/docs/winglet/solo/alias', to: '/docs/winglet/solo/main' }]);
  });
});
