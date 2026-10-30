import { afterEach, describe, expect, it, vi } from 'vitest';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { WriteOption } from '../../types/value';
import { engineModes } from '../../utils/cache/engineModes';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import { getDependencyIndex } from '../utils/dependencies/getDependencyIndex';
import { gateTableCases } from './fixtures/gate-table/gateTableCases';

const previous = engineModes.gateSelection;
afterEach(() => {
  vi.restoreAllMocks();
  engineModes.setMode('gateSelection', previous);
});

// filid:contract settle-registration-query-work
describe('registration direct emission', () => {
  it('does not build and sort an event queue without split owners', () => {
    const { root, blueprint } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        a: { type: 'string', controls: { active: '../flag' } },
        b: { type: 'string', controls: { active: '../flag' } },
      },
    });
    const index = getDependencyIndex(blueprint);
    const owners: string[] = [];
    const sort = vi.spyOn(Array.prototype, 'sort');
    index.affectedForRegistration('/flag', root, {
      owner: (path) => {
        owners.push(path);
      },
      hit: () => [],
    });
    const count = sort.mock.calls.length;
    sort.mockRestore();
    expect(owners).toEqual(['/a', '/b']);
    expect(count).toBe(0);
  });

  it('emits hit, anchor, host and living members in their original rank order', () => {
    engineModes.setMode('gateSelection', 'table');
    const { root, blueprint } = createTestTree(gateTableCases[2].schema);
    loadFieldNodeAtMount(
      root,
      { a: { kind: 'kind_0' } },
      WriteOption.Overwrite,
    );
    const index = getDependencyIndex(blueprint);
    expect(index.hasSplitOwners).toBe(true);
    const events: string[] = [];
    index.affectedForRegistration('/a/kind', root, {
      hit: (bucket, ranks) => {
        events.push('hit:' + bucket.hostPath + ':' + ranks.join(','));
        return [
          {
            rank: bucket.firstRank,
            insert: () => {
              events.push('anchor');
            },
          },
        ];
      },
      owner: (path, kind) => {
        events.push(kind + ':' + path);
      },
    });
    expect(events).toEqual([
      'hit:/a:1,2,3',
      'plain:/a',
      'anchor',
      'host:/a',
      'split:/a/payload_0_a',
      'split:/a/payload_0_b',
      'split:/a/payload_0_c',
    ]);
    expect(events.indexOf('anchor')).toBeLessThan(events.indexOf('host:/a'));
    expect(events.filter((entry) => entry.startsWith('split:'))).toEqual([
      'split:/a/payload_0_a',
      'split:/a/payload_0_b',
      'split:/a/payload_0_c',
    ]);
  });
});
