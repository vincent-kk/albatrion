import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';

import * as entries from '../blueprint';
import { buildFieldNodeTree, mountFieldNode } from '../../surface';
import { isTestFieldNode } from '../../__tests__/fixtures/testFieldNode';

/** Per-form observations emitted for the independent fail-first evidence parser. */
const rows: unknown[] = [];
/** Fresh compiler outputs must never borrow a prior form's memo population. */
const blueprints: unknown[] = [];

afterEach(() => vi.restoreAllMocks());
afterAll(() => console.log('ITEMLESS_COST_ROWS ' + JSON.stringify({ rows })));

describe('generic itemless mounts bound empty declaration queries', () => {
  it.each([
    ['root', 1000, 1],
    ['root', 8000, 1],
    ['nested', 1000, 1],
    ['nested', 8000, 1],
    ['root', 1000, 2],
    ['root', 8000, 2],
    ['nested', 1000, 2],
    ['nested', 8000, 2],
  ] as const)('%s N=%i fresh form %i', (host, n, freshRun) => {
    const input = Array.from({ length: n }, (_, index) => index);
    const caller = host === 'root' ? input : { list: input };
    const before = structuredClone(caller);
    const lookups = vi.spyOn(entries, 'getItemEntries');
    const root = buildFieldNodeTree({
      jsonSchema:
        host === 'root'
          ? { type: 'array' }
          : { type: 'object', properties: { list: { type: 'array' } } },
      defaultValue: caller,
    });
    mountFieldNode(root);
    const target = host === 'root' ? root : root.find('/list')!;
    if (!isTestFieldNode(target)) throw new Error('Missing array runtime record');
    expect(root.value).toStrictEqual(caller);
    expect(caller).toStrictEqual(before);
    expect(target.children).toEqual([]);
    expect(target.value).not.toBe(input);
    expect(blueprints).not.toContain(target.blueprintNode);
    blueprints.push(target.blueprintNode);
    rows.push({
      host,
      n,
      freshRun,
      calls: lookups.mock.calls.length,
      children: target.children?.length ?? 0,
      blueprintIdentity: 'fresh-' + blueprints.length,
    });
    expect(
      lookups.mock.calls.length,
      'ITEMLESS_LOOKUP_BOUND',
    ).toBeLessThanOrEqual(4);
  });
});
