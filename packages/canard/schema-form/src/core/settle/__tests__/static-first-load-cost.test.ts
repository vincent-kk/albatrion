import { expect, it } from 'vitest';

import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount } from '../index';
import { canLoadStaticFirstTree } from '../utils/load/canLoadStaticFirstTree';
import { createTestTree } from './fixtures/createTestTree';

it('computes every static occurrence once without allocating generic scratch', () => {
  const { root, visits } = createTestTree({ type: 'object', properties: {
    items: { type: 'array', default: [{}, {}, {}], items: {
      type: 'object', properties: { value: { type: 'string', default: 'item' } },
    } }, tail: { type: 'number', default: 1 },
  } });
  expect(canLoadStaticFirstTree(root, undefined)).toBe(true);
  loadSchemaNodeAtMount(root, undefined, SetValueOption.Overwrite);
  const nodes = [...root.runtime.deliveries ?? []];
  const assemblies = visits.filter(path => !path.startsWith('select:'));
  expect(assemblies.length).toBe(nodes.length);
  for (const node of nodes)
    expect(assemblies.filter(path => path === node.path)).toHaveLength(1);
  expect(root.runtime).not.toHaveProperty('settlementScratch');
  expect(root.runtime).not.toHaveProperty('committedDeclarationIds');
  expect(canLoadStaticFirstTree(root, undefined)).toBe(false);
});

it('rejects existing children, latent sources and caller inputs before mutation', () => {
  const { root } = createTestTree({ type: 'object', properties: {
    value: { type: 'string', default: 'x' },
  } });
  for (const input of [null, {}, { value: undefined }, { value: 'x' }, 4]) {
    expect(canLoadStaticFirstTree(root, input)).toBe(false);
    expect(root.runtime.commitNumber).toBeUndefined();
    expect(root.children).toEqual([]);
  }
  root.runtime.latentRaw.set('["/value","string"]', 'latent');
  expect(canLoadStaticFirstTree(root, undefined)).toBe(false);
});
