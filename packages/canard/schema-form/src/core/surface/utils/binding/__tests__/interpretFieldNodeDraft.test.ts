import { expect, it } from 'vitest';

import { buildFieldNodeTree } from '../buildFieldNodeTree';
import { interpretFieldNodeDraft } from '../interpretFieldNodeDraft';
import { mountFieldNode } from '../mountFieldNode';

it('REACT-033 preserves the string member 42 without writing or notifying', () => {
  const root = buildFieldNodeTree({
    jsonSchema: { type: ['number', 'string'] },
  });
  mountFieldNode(root);
  const revision = root.revision();
  expect(interpretFieldNodeDraft(root, '42')).toEqual({
    value: '42',
    isMember: true,
  });
  expect(root.value).toBeUndefined();
  expect(root.revision()).toBe(revision);
});

it('REACT-033 interprets drafts using the current effective type list', () => {
  const root = buildFieldNodeTree({
    jsonSchema: {
      type: 'object',
      properties: {
        narrow: { type: 'boolean' },
        field: {
          type: ['number', 'string'],
          allOf: [{ controls: { active: '#/narrow' }, type: 'number' }],
        },
      },
    },
    defaultValue: { narrow: false },
  });
  mountFieldNode(root);
  const field = root.find('/field')!;
  expect(interpretFieldNodeDraft(field, '42')).toEqual({
    value: '42',
    isMember: true,
  });
  root.find('/narrow')!.setValue(true);
  expect(interpretFieldNodeDraft(field, '42')).toEqual({
    value: 42,
    isMember: true,
  });
  expect(interpretFieldNodeDraft(field, 'invalid')).toEqual({
    value: 'invalid',
    isMember: false,
  });
  expect(field.value).toBeUndefined();
});
