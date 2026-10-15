import { expect, it } from 'vitest';

import type { FormErrorRecord } from '../../../../errors';
import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import type { BlueprintSchema } from '../../blueprint';
import { dispatchInsert, dispatchMount, dispatchRemove } from '../../write';
import { readFieldNodeInactiveValues } from '../utils/detached/readFieldNodeInactiveValues';
import { readFieldNodeMisfits } from '../utils/detached/readFieldNodeMisfits';
import { getDispatchNode } from './fixtures/getDispatchNode';

it.each([
  { operation: 'insert', layout: 'tuple', inactive: false },
  { operation: 'remove', layout: 'tuple', inactive: false },
  { operation: 'insert', layout: 'tuple', inactive: true },
  { operation: 'remove', layout: 'tuple', inactive: true },
  { operation: 'insert', layout: 'items', inactive: false },
  { operation: 'remove', layout: 'items', inactive: false },
  { operation: 'insert', layout: 'items', inactive: true },
  { operation: 'remove', layout: 'items', inactive: true },
] as const)(
  'M1 $layout $operation inactive=$inactive clears a real gate-exit misfit after rekey',
  (scene) => {
    const active =
      scene.operation === 'insert'
        ? '../../list/length < 3'
        : '../../list/length > 2';
    const item: BlueprintSchema = {
      type: 'object',
      ...(scene.inactive ? { controls: { active } } : {}),
      allOf: [
        { controls: { active }, properties: { v: { type: 'number' } } },
        { controls: { active: false }, properties: { v: { type: 'string' } } },
      ],
    };
    const reported: FormErrorRecord[] = [];
    const { root, runtime } = createDispatchTree(
      {
        type: 'object',
        properties: {
          list:
            scene.layout === 'tuple'
              ? { type: 'array', prefixItems: [item, item, item, item] }
              : { type: 'array', items: item },
        },
      },
      undefined,
      undefined,
      {
        /** Observe warnings delivered by the selected public entry. */
        report(record) {
          reported.push(record);
        },
        /** Enable structured warning production. */
        hasConsumer() {
          return true;
        },
      },
    );
    dispatchMount(root, {
      list:
        scene.operation === 'insert'
          ? [{ v: 'bad' }, {}]
          : [{}, { v: 'bad' }, {}],
    });
    const list = getDispatchNode(root, 'list');
    const source = scene.operation === 'insert' ? 0 : 1;
    const destination = scene.operation === 'insert' ? 1 : 0;
    const sourcePath = `/list/${source}/v`;
    const path = `/list/${destination}/v`;
    const oldItem = getDispatchNode(list, String(source));
    const oldChild = getDispatchNode(oldItem, 'v');
    expect(oldChild.raw).toBe('bad');
    expect([...runtime.misfitPaths]).toEqual([sourcePath]);
    expect(runtime.misfitRecords).toEqual([
      expect.objectContaining({ path: sourcePath, reason: 'unconvertible' }),
    ]);
    const commit = runtime.commitNumber;
    reported.length = 0;
    if (scene.operation === 'insert') dispatchInsert(list, 0, {});
    else dispatchRemove(list, 0);
    expect(runtime.commitNumber).toBe((commit ?? 0) + 1);
    const moved = list.structure?.[String(destination)];
    if (scene.inactive) expect(moved).toBeUndefined();
    else {
      expect(moved).toBeDefined();
      expect(moved?.structure?.v).toBeUndefined();
      if (scene.layout === 'items') expect(moved).toBe(oldItem);
    }
    expect(oldChild.detached).toBe(true);
    expect([...runtime.misfitPaths]).toEqual([]);
    expect(runtime.misfitsMemo?.get('')?.paths).toEqual([]);
    expect(runtime.misfitsMemo?.has(path)).toBe(false);
    expect(readFieldNodeMisfits(root)).toEqual([]);
    expect(readFieldNodeInactiveValues(root)).toEqual([{ path, value: 'bad' }]);
    expect(root.emit).toEqual({
      list: scene.operation === 'insert' ? [{}, {}, {}] : [{}, {}],
    });
    expect(runtime.misfitRecords).toEqual([]);
    expect(reported).toEqual([]);
  },
);
