import { buildArraySchema } from '../../src/fixtures/scale-schemas';
import type { EquivalentFixture } from './types';

const items = Array.from({ length: 200 }, (_, index) => ({
  id: `s-${index}`,
  name: `item-${index}`,
  active: index % 2 === 0,
}));
const pushes = items.slice(0, 100).map((value) => ({
  kind: 'push' as const,
  path: '/items',
  value,
}));

export const arrayFixtures: EquivalentFixture[] = [
  {
    name: 'array-push-100',
    legacy: buildArraySchema(0),
    workspace: buildArraySchema(0),
    interactions: pushes,
  },
  {
    name: 'array-replace-200',
    legacy: buildArraySchema(0),
    workspace: buildArraySchema(0),
    interactions: [{ kind: 'set', path: '/items', value: items }],
  },
  {
    name: 'array-push-remove-100',
    legacy: buildArraySchema(0),
    workspace: buildArraySchema(0),
    interactions: [
      ...pushes,
      ...Array.from({ length: 100 }, (_, index) => ({
        kind: 'remove' as const,
        path: '/items',
        index: 99 - index,
      })),
    ],
  },
];
