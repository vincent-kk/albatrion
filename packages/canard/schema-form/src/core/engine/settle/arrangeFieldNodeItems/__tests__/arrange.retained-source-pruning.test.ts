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

it.each([['clear'], ['replace'], ['load'], ['reset']] as const)(
  'removes retained sources on %s',
  (operation) => {
    const item: BlueprintSchema = {
      type: 'object',
      controls: { active: '../../show' },
      properties: { v: { type: 'string' } },
    };
    const { root } = createDispatchTree({
      type: 'object',
      properties: {
        show: { type: 'boolean' },
        list: { type: 'array', prefixItems: [item, item, item] },
      },
    });

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
