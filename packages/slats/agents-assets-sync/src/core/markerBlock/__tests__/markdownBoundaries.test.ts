import { expect, it } from 'vitest';

import { upsertBlock } from '../markerBlock';

it.each([
  ['source', '', '# source\n```md\nexample\n'],
  ['document', '# user\n~~~md\nexample\n', '# source\n'],
] as const)(
  'refuses an open %s fence before transforming any text',
  (kind, document, body) => {
    expect(() =>
      upsertBlock(document, 'pkg:rules/a.md', body, {
        document: '/project/AGENTS.md',
        source: '/package/rules/a.md',
      }),
    ).toThrow(
      kind === 'source'
        ? '/package/rules/a.md:2: Unclosed fenced code block. Close the fence'
        : '/project/AGENTS.md:2: Unclosed fenced code block. Close the fence',
    );
  },
);
