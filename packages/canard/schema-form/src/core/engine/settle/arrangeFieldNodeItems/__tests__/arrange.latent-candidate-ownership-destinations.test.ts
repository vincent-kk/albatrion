import { afterEach, expect, it, vi } from 'vitest';

import { createDispatchTree } from '../../../__tests__/fixtures/createDispatchTree';
import { dispatchInsert, dispatchMount, dispatchRemove } from '../../../write';
import * as rekeying from '../utils/rekey/rekeyArrayRuntimePaths';

afterEach(() => vi.restoreAllMocks());

it.each(['insert', 'remove'] as const)(
  '[control] W4 single-candidate tuple %s registers no recreated-source destination',
  (operation) => {
    const { root } = createDispatchTree({
      type: 'array',
      prefixItems: [{ type: 'string' }, { type: 'number' }, { type: 'string' }],
    });
    dispatchMount(
      root,
      operation === 'insert' ? ['first', 37] : ['first', 37, 'last'],
    );
    expect(root.blueprintNode.hasCandidateDescendants).toBeUndefined();
    const rekey = vi.spyOn(rekeying, 'rekeyArrayRuntimePaths');
    if (operation === 'insert') dispatchInsert(root, 0, 'new');
    else dispatchRemove(root, 0);
    expect(rekey).toHaveBeenCalledOnce();
    const moves = rekey.mock.calls[0]?.[2];
    expect(moves).toEqual(
      operation === 'insert'
        ? [
            { previous: '/0', current: undefined },
            { previous: '/1', current: undefined },
          ]
        : [
            { previous: '/0', current: undefined },
            { previous: '/1', current: undefined },
            { previous: '/2', current: undefined },
          ],
    );
    expect(root.local).toEqual(
      operation === 'insert' ? ['new', 'first', '37'] : ['37', 'last'],
    );
    expect(root.emit).toEqual(root.local);
  },
);
