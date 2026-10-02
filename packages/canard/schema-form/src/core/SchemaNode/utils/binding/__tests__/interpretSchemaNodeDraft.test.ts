import { expect, it } from 'vitest';

import { buildSchemaNodeTree } from '../buildSchemaNodeTree';
import { mountSchemaNode } from '../mountSchemaNode';
import { interpretSchemaNodeDraft } from '../interpretSchemaNodeDraft';

it('REACT-033 preserves the string member 42 without writing or notifying', () => {
  const root = buildSchemaNodeTree({ jsonSchema: { type: ['number', 'string'] } });
  mountSchemaNode(root);
  const revision = root.revision();
  expect(interpretSchemaNodeDraft(root, '42')).toEqual({ value: '42', isMember: true });
  expect(root.value).toBeUndefined();
  expect(root.revision()).toBe(revision);
});

it('REACT-033 interprets drafts using the current effective type list', () => {
  const root = buildSchemaNodeTree({ jsonSchema: {
    type: 'object', properties: {
      narrow: { type: 'boolean' },
      field: { type: ['number', 'string'], allOf: [
        { controls: { active: '#/narrow' }, type: 'number' },
      ] },
    },
  }, defaultValue: { narrow: false } });
  mountSchemaNode(root);
  const field = root.find('/field')!;
  expect(interpretSchemaNodeDraft(field, '42')).toEqual({ value: '42', isMember: true });
  root.find('/narrow')!.setValue(true);
  expect(interpretSchemaNodeDraft(field, '42')).toEqual({ value: 42, isMember: true });
  expect(interpretSchemaNodeDraft(field, 'invalid')).toEqual({ value: 'invalid', isMember: false });
  expect(field.value).toBeUndefined();
});
