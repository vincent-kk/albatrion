import { expect, it } from 'vitest';

import { createDispatchTree } from '../../../__tests__/fixtures/createDispatchTree';
import type { BlueprintSchema } from '../../../blueprint';
import {
  dispatchInsert,
  dispatchMount,
  dispatchSetValue,
} from '../../../write';
import { getDispatchNode } from '../../__tests__/fixtures/getDispatchNode';
import { readFieldNodeInactiveValues } from '../../utils/detached/readFieldNodeInactiveValues';

it.each([
  ['on', false],
  ['off', false],
  ['verify', false],
  ['on', true],
  ['off', true],
  ['verify', true],
] as const)(
  '%s applies the exit policy after conversion, candidate=%s',
  (mode, candidate) => {
    const item: BlueprintSchema = {
      type: 'object',
      controls: { active: '../../show' },
      properties: {
        keep: { type: 'string', controls: { unsetOnInactive: false } },
        drop: { type: 'string' },
      },
      ...(candidate
        ? {
            allOf: [
              {
                controls: { active: false },
                properties: { choice: { type: 'number' } },
              },
              {
                controls: { active: false },
                properties: { choice: { type: 'string' } },
              },
            ],
          }
        : {}),
    };
    const { root, runtime } = createDispatchTree({
      type: 'object',
      properties: {
        open: { type: 'boolean' },
        show: { type: 'boolean' },
        list: {
          type: 'array',
          controls: { active: '../open', unsetOnInactive: true },
          prefixItems: [item, item, item],
        },
      },
    });
    runtime.slots = mode;
    dispatchMount(root, {
      open: true,
      show: true,
      list: [{ keep: 'held', drop: 'gone' }],
    });
    const list = getDispatchNode(root, 'list');
    dispatchSetValue(getDispatchNode(root, 'show'), false);
    dispatchInsert(list, 0, {});
    dispatchSetValue(getDispatchNode(root, 'open'), false);
    expect(readFieldNodeInactiveValues(root)).toEqual([]);
    dispatchSetValue(getDispatchNode(root, 'open'), true);
    expect(getDispatchNode(root, 'list').local).toEqual([]);
    expect(readFieldNodeInactiveValues(root)).toEqual([]);
  },
);
