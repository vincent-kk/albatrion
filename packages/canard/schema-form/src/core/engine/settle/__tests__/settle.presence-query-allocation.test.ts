import { afterEach, describe, expect, it, vi } from 'vitest';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { getDependencyIndex } from '../utils/dependencies/getDependencyIndex';

const createWork = () => ({
  owners: new Set<string>(),
  stateOnly: new Set<string>(),
  outerTemplates: new Set<string>(),
  directTemplates: new Set<string>(),
  ancestorOwners: new Set<string>(),
  direct: new Set<string>(),
});
const createIndex = () => {
  const { root, blueprint } = createTestTree({
    type: 'object',
    properties: {
      flag: { type: 'boolean' },
      a: { type: 'string', controls: { active: '../flag' } },
      b: { type: 'string', controls: { active: '../flag' } },
      '*': { type: 'string', controls: { active: '../flag' } },
    },
  });
  return { root, index: getDependencyIndex(blueprint) };
};
afterEach(() => vi.unstubAllGlobals());

// filid:contract settle-presence-query-work
describe('call-local presence query work', () => {
  it('reuses supplied sets without allocating a Set per query', () => {
    const { root, index } = createIndex();
    const work = createWork();
    const settlement = {};
    index.affectedByPresence('', 'flag', undefined, settlement, root.runtime);
    let allocations = 0;
    const SetConstructor = globalThis.Set;
    vi.stubGlobal(
      'Set',
      new Proxy(SetConstructor, {
        construct(target, args) {
          allocations++;
          return Reflect.construct(target, args);
        },
      }),
    );
    const result = index.affectedByPresence(
      '',
      'flag',
      undefined,
      settlement,
      root.runtime,
      work,
    );
    const count = allocations;
    vi.unstubAllGlobals();
    expect(count).toBe(0);
    expect(result.owners).toBe(work.owners);
    expect([...result.owners]).toEqual(['/a', '/b', '/%2A']);
  });

  it('clears all six reused sets before another query', () => {
    const { root, index } = createIndex();
    const work = createWork();
    for (const set of Object.values(work)) set.add('/stale');
    const first = index.affectedByPresence(
      '',
      'flag',
      undefined,
      {},
      root.runtime,
      work,
    );
    expect([...first.owners]).toEqual(['/a', '/b', '/%2A']);
    const second = index.affectedByPresence(
      '',
      'missing',
      undefined,
      {},
      root.runtime,
      work,
    );
    expect(Object.values(second).every((set) => set.size === 0)).toBe(true);
    expect(work.ancestorOwners.size).toBe(0);
    expect(work.direct.size).toBe(0);
  });

  it('keeps default results independent and insertion metrics unchanged', () => {
    const { root, index } = createIndex();
    const metrics = { ownerInsertions: 0 };
    const first = index.affectedByPresence(
      '',
      'flag',
      metrics,
      {},
      root.runtime,
    );
    index.affectedByPresence('', 'missing', metrics, {}, root.runtime);
    expect([...first.owners]).toEqual(['/a', '/b', '/%2A']);
    expect(metrics.ownerInsertions).toBe(3);
    const reusedMetrics = { ownerInsertions: 0 };
    const reused = index.affectedByPresence(
      '',
      'flag',
      reusedMetrics,
      {},
      root.runtime,
      createWork(),
    );
    expect([...reused.owners]).toEqual([...first.owners]);
    expect(reusedMetrics).toEqual(metrics);
  });

  it.each(['/rows', '/rows/0'])(
    'preserves wildcard binding at %s',
    (hostPath) => {
      const { root, blueprint } = createTestTree({
        type: 'object',
        properties: {
          rows: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                flag: { type: 'boolean' },
                field: { type: 'string', controls: { active: '../flag' } },
              },
            },
          },
        },
      });
      const index = getDependencyIndex(blueprint);
      const expected = index.affectedByPresence(
        hostPath,
        'flag',
        undefined,
        {},
        root.runtime,
      );
      const actual = index.affectedByPresence(
        hostPath,
        'flag',
        undefined,
        {},
        root.runtime,
        createWork(),
      );
      for (const key of [
        'owners',
        'stateOnly',
        'outerTemplates',
        'directTemplates',
      ] as const)
        expect([...actual[key]]).toEqual([...expected[key]]);
    },
  );
});
