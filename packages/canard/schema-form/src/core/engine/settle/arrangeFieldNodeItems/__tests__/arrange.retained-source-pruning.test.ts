import { expect, it } from 'vitest';

import { createDispatchTree } from '../../../__tests__/fixtures/createDispatchTree';
import type { BlueprintSchema } from '../../../blueprint';
import {
  dispatchClear,
  dispatchInsert,
  dispatchMount,
  dispatchResetForm,
  dispatchResetSubtree,
  dispatchSetValue,
} from '../../../write';
import { getDispatchNode } from '../../__tests__/fixtures/getDispatchNode';
import { readFieldNodeInactiveValues } from '../../utils/detached/readFieldNodeInactiveValues';

it.each([
  ['on', 'clear'],
  ['off', 'clear'],
  ['verify', 'clear'],
  ['on', 'replace'],
  ['off', 'replace'],
  ['verify', 'replace'],
  ['on', 'load'],
  ['off', 'load'],
  ['verify', 'load'],
  ['on', 'reset'],
  ['off', 'reset'],
  ['verify', 'reset'],
] as const)(
  '%s removes both source representations on %s',
  (mode, operation) => {
    const item: BlueprintSchema = {
      type: 'object',
      controls: { active: '../../show' },
      properties: { v: { type: 'string' } },
    };
    const { root, runtime } = createDispatchTree({
      type: 'object',
      properties: {
        show: { type: 'boolean' },
        list: { type: 'array', prefixItems: [item, item, item] },
      },
    });
    runtime.slots = mode;
    dispatchMount(root, { show: true, list: [{ v: 'old' }] });
    const list = getDispatchNode(root, 'list');
    dispatchSetValue(getDispatchNode(root, 'show'), false);
    dispatchInsert(list, 0, {});
    expect(readFieldNodeInactiveValues(root)).toContainEqual({
      path: '/list/1/v',
      value: 'old',
    });
    if (operation === 'clear') dispatchClear(list);
    else if (operation === 'replace')
      dispatchSetValue(root, { show: true, list: [] });
    else if (operation === 'load')
      dispatchResetForm(root, { show: true, list: [] });
    else {
      dispatchResetSubtree(list);
      dispatchSetValue(getDispatchNode(root, 'show'), true);
    }
    expect(readFieldNodeInactiveValues(root)).toEqual([]);
    expect(list.local).toEqual(operation === 'reset' ? [{}, { v: 'old' }] : []);
  },
);
