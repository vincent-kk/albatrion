import { expect, it } from 'vitest';

import { expandTemplatePaths } from '../utils/templatePaths/expandTemplatePaths';
import { mountPresenceTree } from './helpers/mountPresenceTree';

it('keeps an object child named star as a literal owner path', () => {
  const root = mountPresenceTree(
    { type: 'object', properties: { '*': { type: 'string' } } },
    { '*': 'R' },
  );

  expect(expandTemplatePaths(root, '/%2A')).toEqual(['/%2A']);
});

it('keeps a gated-out final star child as a literal owner path', () => {
  const root = mountPresenceTree(
    {
      type: 'object',
      properties: { '*': { type: 'string', controls: { active: 'false' } } },
    },
    { '*': 'R' },
  );

  expect(root.structure?.['*']).toBeUndefined();
  expect(expandTemplatePaths(root, '/%2A')).toEqual(['/%2A']);
});

it('expands repeating array items to their current indices in order', () => {
  const root = mountPresenceTree(
    { type: 'array', items: { type: 'string' } },
    ['A', 'B'],
  );

  expect(expandTemplatePaths(root, '/*')).toEqual(['/0', '/1']);
});
