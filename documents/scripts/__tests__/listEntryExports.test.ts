import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { after, before, describe, it } from 'node:test';

import { type EntryExport, listEntryExports } from '../lib/listEntryExports';

let root: string;
let packageRoot: string;

const write = (relativePath: string, content: string): void => {
  const filePath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
};

const inPackage = (relativePath: string): string => path.join(packageRoot, relativePath);

const exportOf = (entry: string, exportedName: string): EntryExport => {
  const found = listEntryExports(inPackage(entry), packageRoot).find(item => item.exportedName === exportedName);
  assert.ok(found, `${entry} does not export ${exportedName}`);
  return found;
};

before(() => {
  root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'list-entry-exports-')));
  packageRoot = path.join(root, 'pkg');
  write('node_modules/extlib/package.json', JSON.stringify({ name: 'extlib', types: 'index.d.ts' }));
  write('node_modules/extlib/index.d.ts', 'export declare function isValidElement(value: unknown): boolean;\n');

  write('pkg/nested/index.d.ts', "export { leaf } from './dir/index.js';\n");
  write('pkg/nested/dir/index.d.ts', "export { leaf } from './a.js';\n");
  write('pkg/nested/dir/a.d.ts', 'export declare const leaf: number;\n');

  write('pkg/star/index.d.ts', "export * from './one.js';\nexport * from './dir/index.js';\n");
  write('pkg/star/one.d.ts', 'export declare const fromOne: number;\n');
  write('pkg/star/dir/index.d.ts', "export * from './two.js';\n");
  write('pkg/star/dir/two.d.ts', 'export declare const fromTwo: number;\n');

  write('pkg/proto/index.d.ts', "export { hasOwnProperty } from './hasOwnProperty.js';\n");
  write('pkg/proto/hasOwnProperty.d.ts', 'export declare function hasOwnProperty(value: object, key: string): boolean;\n');

  write('pkg/alias/index.d.ts', "export { unescapeSegment } from './escape/index.js';\n");
  write('pkg/alias/escape/index.d.ts', "export { unescapePath as unescapeSegment } from './unescapePath.js';\n");
  write('pkg/alias/escape/unescapePath.d.ts', 'export declare const unescapePath: (path: string) => string;\n');

  write(
    'pkg/inline/index.d.ts',
    [
      "import { Base } from './Base.js';",
      'export type { Base };',
      'export declare const Inline: number;',
      'export declare const Both: number;',
      'export type Both = string;',
      '',
    ].join('\n'),
  );
  write('pkg/inline/Base.d.ts', 'export declare const Base: () => null;\n');

  write('pkg/typestar/index.d.ts', "export type * from './values.js';\n");
  write('pkg/typestar/values.d.ts', 'export declare const valueThroughTypeStar: number;\n');

  write('pkg/external/index.d.ts', "export { isReactElement } from './filter/isReactElement.js';\n");
  write('pkg/external/filter/isReactElement.d.ts', "export { isValidElement as isReactElement } from 'extlib';\n");
  write('pkg/missing/index.d.ts', "export { gone as renamed } from 'missing-module';\n");
  write('pkg/outside-star/index.d.ts', "export * from 'extlib';\n");
});

after(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe('listEntryExports', () => {
  it('follows nested named re-exports to the leaf file', () => {
    const leaf = exportOf('nested/index.d.ts', 'leaf');
    assert.equal(leaf.filePath, inPackage('nested/dir/a.d.ts'));
    assert.equal(leaf.declaredName, 'leaf');
    assert.equal(leaf.hops, 2);
    assert.equal(leaf.external, null);
  });

  it('counts each file an `export *` chain passes through', () => {
    assert.equal(exportOf('star/index.d.ts', 'fromOne').hops, 1);
    const fromTwo = exportOf('star/index.d.ts', 'fromTwo');
    assert.equal(fromTwo.hops, 2);
    assert.equal(fromTwo.filePath, inPackage('star/dir/two.d.ts'));
  });

  it('lists an export named after an Object.prototype member', () => {
    const exported = exportOf('proto/index.d.ts', 'hasOwnProperty');
    assert.equal(exported.filePath, inPackage('proto/hasOwnProperty.d.ts'));
  });

  it('resolves an alias made by an inner entry and re-exported by name to the original declaration', () => {
    const exported = exportOf('alias/index.d.ts', 'unescapeSegment');
    assert.equal(exported.declaredName, 'unescapePath');
    assert.equal(exported.filePath, inPackage('alias/escape/unescapePath.d.ts'));
    assert.equal(exported.hops, 2);
  });

  it('lists a declaration inside the entry file with zero hops', () => {
    const inline = exportOf('inline/index.d.ts', 'Inline');
    assert.equal(inline.hops, 0);
    assert.equal(inline.filePath, inPackage('inline/index.d.ts'));
    assert.equal(inline.typeOnly, false);
  });

  it('marks an imported value exported by a specifier-less `export type` as type-only, one file away', () => {
    const base = exportOf('inline/index.d.ts', 'Base');
    assert.equal(base.typeOnly, true);
    assert.equal(base.hops, 1);
    assert.equal(base.filePath, inPackage('inline/Base.d.ts'));
  });

  it('keeps a name declared as both a const and a type as a value', () => {
    assert.equal(exportOf('inline/index.d.ts', 'Both').typeOnly, false);
  });

  it('marks a value that arrives through `export type *` as type-only', () => {
    assert.equal(exportOf('typestar/index.d.ts', 'valueThroughTypeStar').typeOnly, true);
  });

  it('reports a re-export of a declaration outside the package with its module and re-export site', () => {
    const site = inPackage('external/filter/isReactElement.d.ts');
    assert.deepEqual(exportOf('external/index.d.ts', 'isReactElement'), {
      exportedName: 'isReactElement',
      declaredName: 'isValidElement',
      filePath: site,
      hops: 1,
      typeOnly: false,
      external: 'extlib',
      reexportSite: site,
    });
  });

  it('reports a re-export from a module that cannot be resolved the same way', () => {
    const site = inPackage('missing/index.d.ts');
    const renamed = exportOf('missing/index.d.ts', 'renamed');
    assert.equal(renamed.external, 'missing-module');
    assert.equal(renamed.declaredName, 'gone');
    assert.equal(renamed.reexportSite, site);
    assert.equal(renamed.filePath, site);
  });

  it('reports an `export *` from a module outside the package as external', () => {
    const site = inPackage('outside-star/index.d.ts');
    const exported = exportOf('outside-star/index.d.ts', 'isValidElement');
    assert.equal(exported.external, 'extlib');
    assert.equal(exported.reexportSite, site);
    assert.equal(exported.filePath, site);
    assert.equal(exported.declaredName, 'isValidElement');
  });
});
