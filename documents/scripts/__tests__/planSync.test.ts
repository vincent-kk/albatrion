import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { after, before, describe, it } from 'node:test';

import { planSync } from '../lib/planSync';

const AUTO_PAGE = '---\ntitle: old\n---\n<!-- sync-winglet-docs:auto -->\n\n# old\n';

let root: string;
let docsDir: string;
let packagesDir: string;

const at = (relativePath: string): string => path.join(root, relativePath);

const write = (relativePath: string, content: string): void => {
  fs.mkdirSync(path.dirname(at(relativePath)), { recursive: true });
  fs.writeFileSync(at(relativePath), content);
};

const packageJSON = (name: string, subPathKeys: string[]): string => {
  const exportsMap: Record<string, { types: string } | string> = { '.': { types: './dist/index.d.ts' } };
  for (const key of subPathKeys) exportsMap[key] = { types: `./dist/${key.slice(2)}/index.d.ts` };
  exportsMap['./package.json'] = './package.json';
  return JSON.stringify({ name, version: '1.0.0', exports: exportsMap });
};

const plan = (packageFilter: string | null) => planSync({ packageFilter, docsDir, packagesDir });

before(() => {
  root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'plan-sync-')));
  docsDir = at('documents/docs');
  packagesDir = at('packages');

  write('packages/winglet/good/package.json', packageJSON('@winglet/good', ['./alpha']));
  write('packages/winglet/good/dist/index.d.ts', "export * from './alpha/index.js';\n");
  write(
    'packages/winglet/good/dist/alpha/index.d.ts',
    "export { shared, shared as sharedAlias } from './shared.js';\nexport { kept } from './kept.js';\n",
  );
  write('packages/winglet/good/dist/alpha/shared.d.ts', '/** Shared. */\nexport declare const shared: number;\n');
  write('packages/winglet/good/dist/alpha/kept.d.ts', '/** Kept. */\nexport declare const kept: number;\n');
  write('documents/docs/winglet/good/index.mdx', '# good\n');
  write('documents/docs/winglet/good/alpha/kept.mdx', '# kept, written by hand\n');
  write('documents/docs/winglet/good/alpha/notes.mdx', '# notes, written by hand\n');
  write('documents/docs/winglet/good/stale/_category_.json', '{}\n');
  write('documents/docs/winglet/good/stale/old.mdx', AUTO_PAGE);

  write('packages/winglet/bad/package.json', packageJSON('@winglet/bad', []));
  write('packages/winglet/bad/dist/index.d.ts', '/** A namespace. */\nexport declare namespace Space {\n    const value: number;\n}\n');
  write('documents/docs/winglet/bad/index.mdx', '# bad\n');

  write('packages/winglet/unbuilt/package.json', packageJSON('@winglet/unbuilt', ['./alpha']));
  write('documents/docs/winglet/unbuilt/index.mdx', '# unbuilt\n');

  write(
    'documents/redirects.winglet.json',
    JSON.stringify([
      { from: '/docs/winglet/good/alpha/gone', to: '/docs/winglet/good/alpha/shared' },
      { from: '/docs/winglet/other/a', to: '/docs/winglet/other/b' },
    ]),
  );
});

after(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe('planSync', () => {
  it('reports an export without a page and plans no writes or deletes', () => {
    const result = plan('bad');
    assert.deepEqual(result.errors, [
      `exported but undocumented: @winglet/bad . Space (${at('packages/winglet/bad/dist/index.d.ts')})`,
    ]);
    assert.deepEqual(result.writes, []);
    assert.deepEqual(result.deletes, []);
  });

  it('reports a documented package whose declaration files are missing as not built', () => {
    const result = plan('unbuilt');
    assert.deepEqual(result.errors, ['not built: @winglet/unbuilt']);
    assert.deepEqual(result.writes, []);
    assert.deepEqual(result.deletes, []);
  });

  it('reports every package error together when no package is selected', () => {
    const result = plan(null);
    assert.equal(result.errors.length, 2);
    assert.deepEqual(result.writes, []);
  });

  it('plans pages, category metadata and redirects for a package without errors', () => {
    const result = plan('good');
    assert.deepEqual(result.errors, []);
    assert.equal(result.packageCount, 1);
    const written = result.writes.map(item => path.relative(root, item.path)).sort();
    assert.deepEqual(written, [
      'documents/docs/winglet/good/alpha/_category_.json',
      'documents/docs/winglet/good/alpha/shared.mdx',
      'documents/redirects.winglet.json',
    ]);
    const page = result.writes.find(item => item.path.endsWith('shared.mdx'));
    assert.ok(page?.content.includes("import { sharedAlias } from '@winglet/good/alpha';"));
  });

  it('replaces the selected package redirects and keeps the others', () => {
    const redirects = plan('good').writes.find(item => item.path.endsWith('redirects.winglet.json'));
    assert.equal(
      redirects?.content,
      JSON.stringify(
        [
          { from: '/docs/winglet/good/alpha/sharedAlias', to: '/docs/winglet/good/alpha/shared' },
          { from: '/docs/winglet/other/a', to: '/docs/winglet/other/b' },
        ],
        null,
        2,
      ) + '\n',
    );
  });

  it('deletes stale generated pages and the category metadata of a category left without pages', () => {
    assert.deepEqual(plan('good').deletes.map(item => path.relative(root, item)).sort(), [
      'documents/docs/winglet/good/stale/_category_.json',
      'documents/docs/winglet/good/stale/old.mdx',
    ]);
  });

  it('never writes or deletes a page without the generated marker', () => {
    const result = plan('good');
    const touched = [...result.writes.map(item => item.path), ...result.deletes];
    assert.equal(touched.includes(at('documents/docs/winglet/good/alpha/kept.mdx')), false);
    assert.equal(touched.includes(at('documents/docs/winglet/good/alpha/notes.mdx')), false);
    assert.equal(touched.includes(at('documents/docs/winglet/good/index.mdx')), false);
  });
});
