import { expect, it } from 'vitest';

import { dispatchMount, dispatchRemove, dispatchSetValue } from '../../write';
import { createSlotVerifyPair } from './fixtures/createSlotVerifyPair';
import { getDispatchNode } from './fixtures/getDispatchNode';

it('compares schemas and revisions when a retained nested kind changes', () => {
  const { root } = createSlotVerifyPair(
    {
      type: 'object',
      properties: {
        open: { type: 'boolean' },
        kind: { type: 'string' },
        group: {
          type: 'object',
          controls: { active: '../open' },
          oneOf: [
            {
              controls: { active: '../kind === "string"' },
              properties: { value: { type: 'string' } },
            },
            {
              controls: { active: '../kind === "number"' },
              properties: { value: { type: 'number', default: 37 } },
            },
          ],
        },
      },
    },
    'verify',
  );
  dispatchMount(root, {
    open: true,
    kind: 'string',
    group: { value: 'saved' },
  });
  dispatchSetValue(getDispatchNode(root, 'open'), false);
  dispatchSetValue(getDispatchNode(root, 'kind'), 'number');
  dispatchSetValue(getDispatchNode(root, 'open'), true);
  expect(getDispatchNode(root, 'group', 'value').local).toBe(37);
  dispatchSetValue(getDispatchNode(root, 'kind'), 'string');
  expect(getDispatchNode(root, 'group', 'value').local).toBe('saved');
  expect(root.runtime.slotVerification?.differences).toBe(0);
});

it('compares inactive descendants after a gate changes while their host is absent', () => {
  const { root } = createSlotVerifyPair(
    {
      type: 'object',
      properties: {
        open: { type: 'boolean' },
        allow: { type: 'boolean' },
        group: {
          type: 'object',
          controls: { active: '../open' },
          properties: {
            value: { type: 'string', controls: { active: '#/allow' } },
          },
        },
      },
    },
    'verify',
  );
  dispatchMount(root, { open: true, allow: true, group: { value: 'saved' } });
  dispatchSetValue(getDispatchNode(root, 'open'), false);
  dispatchSetValue(getDispatchNode(root, 'allow'), false);
  dispatchSetValue(getDispatchNode(root, 'open'), true);
  expect(getDispatchNode(root, 'group').local).toEqual({});
  dispatchSetValue(getDispatchNode(root, 'allow'), true);
  expect(getDispatchNode(root, 'group', 'value').local).toBe('saved');
  expect(root.runtime.slotVerification?.differences).toBe(0);
});

it('compares cloned array subtrees and a following structural move', () => {
  const { root } = createSlotVerifyPair(
    {
      type: 'object',
      properties: {
        open: { type: 'boolean' },
        group: {
          type: 'object',
          controls: { active: '../open' },
          properties: {
            list: {
              type: 'array',
              items: {
                type: 'object',
                properties: { text: { type: 'string' } },
              },
            },
          },
        },
      },
    },
    'verify',
  );
  dispatchMount(root, {
    open: true,
    group: { list: [{ text: 'first' }, { text: 'second' }] },
  });
  const old = getDispatchNode(root, 'group', 'list', '0');
  dispatchSetValue(getDispatchNode(root, 'open'), false);
  dispatchSetValue(getDispatchNode(root, 'open'), true);
  expect(getDispatchNode(root, 'group', 'list', '0')).not.toBe(old);
  dispatchRemove(getDispatchNode(root, 'group', 'list'), 0);
  expect(getDispatchNode(root, 'group', 'list', '0', 'text').local).toBe(
    'second',
  );
  expect(root.runtime.slotVerification?.differences).toBe(0);
});
