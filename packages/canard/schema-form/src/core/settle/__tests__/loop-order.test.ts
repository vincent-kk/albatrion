import { expect, it } from 'vitest';

import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount, writeSchemaNode } from '../index';
import { createTestTree } from './fixtures/createTestTree';

it('retains integer property order and untouched references across static selection', () => {
  const { root } = createTestTree({ type: 'object', properties: {
    '10': { type: 'string', default: 'ten' },
    '2': { type: 'string', default: 'two' },
    nested: { type: 'object', properties: {
      leaf: { type: 'string', default: 'leaf' },
    } },
  } });
  loadSchemaNodeAtMount(root, undefined, SetValueOption.Overwrite);
  expect(root.children?.map(child => child.name)).toEqual(['2', '10', 'nested']);
  expect([...root.runtime.deliveries ?? []].map(node => node.path))
    .toEqual(['', '/2', '/10', '/nested', '/nested/leaf']);
  const nested = root.structure!.nested;
  const value = nested.local;
  const children = root.children;
  const revision = nested.revisionLedger;
  writeSchemaNode(root.structure!['2'], 'next', 'input', SetValueOption.Overwrite);
  expect(root.local).toEqual({ '2': 'next', '10': 'ten', nested: { leaf: 'leaf' } });
  expect(root.children).toBe(children);
  expect(nested.local).toBe(value);
  expect(nested.revisionLedger).toBe(revision);
});
