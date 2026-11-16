import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { generateMdx } from '../lib/mdxGenerator';
import type { ParsedFunction } from '../lib/types';

const parsed = (overrides: Partial<ParsedFunction>): ParsedFunction => ({
  name: 'getValue',
  kind: 'function',
  description: 'Reads a value.',
  typeSignature: 'function getValue(): unknown',
  params: [],
  returns: undefined,
  templates: [],
  examples: [],
  remarks: undefined,
  deprecated: false,
  packageName: '@winglet/json',
  packageVersion: '1.0.0',
  categoryPath: 'pointer-manipulator',
  sourceFile: '/pkg/dist/getValue.d.ts',
  importPaths: [
    { entryKey: './pointer-manipulator', moduleSpecifier: '@winglet/json/pointer-manipulator', exportedName: 'getValue', isTypeOnly: false },
    { entryKey: './pointer', moduleSpecifier: '@winglet/json/pointer', exportedName: 'getValue', isTypeOnly: false },
    { entryKey: '.', moduleSpecifier: '@winglet/json', exportedName: 'getValue', isTypeOnly: false },
  ],
  externalSource: null,
  ...overrides,
});

describe('generateMdx', () => {
  it('writes an Import section with one line per entry, after the description and before the signature', () => {
    const mdx = generateMdx(parsed({}));
    assert.ok(
      mdx.includes(
        [
          'Reads a value.',
          '',
          '## Import',
          '',
          '```typescript',
          "import { getValue } from '@winglet/json/pointer-manipulator';",
          "import { getValue } from '@winglet/json/pointer';",
          "import { getValue } from '@winglet/json';",
          '```',
          '',
          '## Signature',
        ].join('\n'),
      ),
      mdx,
    );
  });

  it('writes `import type` for a type-only path and the exported name for an alias', () => {
    const mdx = generateMdx(
      parsed({
        name: 'unescapePath',
        importPaths: [
          { entryKey: './pointer-escape', moduleSpecifier: '@winglet/json/pointer-escape', exportedName: 'unescapePath', isTypeOnly: false },
          { entryKey: './pointer-escape', moduleSpecifier: '@winglet/json/pointer-escape', exportedName: 'unescapeSegment', isTypeOnly: false },
          { entryKey: '.', moduleSpecifier: '@winglet/json', exportedName: 'unescapeSegment', isTypeOnly: true },
        ],
      }),
    );
    assert.ok(mdx.includes("import { unescapePath } from '@winglet/json/pointer-escape';\n"), mdx);
    assert.ok(mdx.includes("import { unescapeSegment } from '@winglet/json/pointer-escape';\n"), mdx);
    assert.ok(mdx.includes("import type { unescapeSegment } from '@winglet/json';\n"), mdx);
  });

  it('pins the address with a slug when the page name matches its category directory', () => {
    const mdx = generateMdx(parsed({ name: 'Portal', categoryPath: 'portal' }));
    assert.ok(mdx.startsWith("---\ntitle: 'Portal'\nsidebar_label: 'Portal'\nslug: Portal\n---\n"), mdx);
  });

  it('writes no slug when the page name differs from its category directory', () => {
    assert.ok(!generateMdx(parsed({})).includes('slug:'));
    assert.ok(!generateMdx(parsed({ name: 'Inner', categoryPath: 'inner/deep' })).includes('slug:'));
  });

  it('pins the address against the last segment of a nested category directory', () => {
    assert.ok(generateMdx(parsed({ name: 'deep', categoryPath: 'inner/deep' })).includes('\nslug: deep\n'));
  });

  it('renders an inline link tag in an example title as text', () => {
    const mdx = generateMdx(parsed({ examples: [{ title: 'Use {@link gcd}', code: 'gcd(4, 6);' }] }));
    assert.ok(mdx.includes('### Use `gcd`\n'));
  });

  it('states the source module of a re-exported declaration after the Import section', () => {
    const mdx = generateMdx(
      parsed({
        name: 'isReactElement',
        kind: 're-export',
        typeSignature: "export { isValidElement as isReactElement } from 'react';",
        externalSource: { moduleSpecifier: 'react', originalName: 'isValidElement' },
        importPaths: [
          { entryKey: './filter', moduleSpecifier: '@winglet/react-utils/filter', exportedName: 'isReactElement', isTypeOnly: false },
        ],
      }),
    );
    assert.ok(
      mdx.includes(
        [
          "import { isReactElement } from '@winglet/react-utils/filter';",
          '```',
          '',
          'Re-exported from `react` as `isValidElement`.',
          '',
          '## Signature',
          '',
          '```typescript',
          "export { isValidElement as isReactElement } from 'react';",
          '```',
        ].join('\n'),
      ),
      mdx,
    );
  });
});
