import { expect, it } from 'vitest';

import { createTestTree } from '../../../../__tests__/fixtures/createTestTree';
import { WriteOption } from '../../../../types/value';
import { loadFieldNodeAtMount } from '../../../loadFieldNodeAtMount';
import { mountPresenceTree } from '../../../__tests__/helpers/mountPresenceTree';
import { getDependencyIndex } from '../getDependencyIndex';

it('registers a fragment-derived array item watch under the wildcard operator', () => {
  const { root, blueprint } = createTestTree({
    type: 'object',
    properties: {
      source: { type: 'string' },
      list: {
        type: 'array',
        allOf: [
          {
            items: {
              type: 'object',
              properties: { x: { type: 'string' }, y: { type: 'string' } },
              controls: { watch: ['./x'] },
            },
            controls: { derived: '../source' },
          },
        ],
      },
    },
  });
  loadFieldNodeAtMount(
    root,
    { source: 'A', list: [{ x: 'a', y: 'b' }] },
    WriteOption.Overwrite,
  );
  const index = getDependencyIndex(blueprint);
  expect(index.affected('/list/0/x', root)).toContain('/list');
  expect(index.affected('/list/0/y', root)).not.toContain('/list');
});

it('registers a fragment-derived object property named * under its literal percent form', () => {
  const root = mountPresenceTree(
    {
      type: 'object',
      properties: {
        group: {
          type: 'object',
          properties: { source: { type: 'string' } },
          allOf: [
            {
              properties: {
                '*': {
                  type: 'object',
                  properties: { sub: { type: 'string' } },
                  controls: { watch: ['./sub'] },
                },
              },
              controls: { derived: './source' },
            },
          ],
        },
      },
    },
    { group: { source: 'A', '*': { sub: 's' } } },
  );
  const index = getDependencyIndex(root.runtime.blueprint);
  expect(index.affected('/group/%2A/sub', root)).toContain('/group');
  expect(index.affected('/group/0/sub', root)).not.toContain('/group');
});
