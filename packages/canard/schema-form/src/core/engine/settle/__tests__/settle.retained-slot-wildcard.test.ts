import { expect, it } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import { WriteOption } from '../../types/value';
import { dispatchMount, dispatchSetValue } from '../../write';
import { readFieldNodeInactiveValues } from '../utils/detached/readFieldNodeInactiveValues';
import { resetFieldNodeForm } from '../utils/reset/resetFieldNodeForm';
import { getDispatchNode } from './fixtures/getDispatchNode';

it.each(['off', 'on', 'verify'] as const)(
  '%s loads and replaces initially inactive mixed sources before ordinary parent entry',
  (_mode) => {
    const { root } = createDispatchTree({
      type: 'object',
      properties: {
        open: { type: 'boolean' },
        group: {
          type: 'object',
          controls: { active: '../open' },
          properties: {
            '*': { type: 'object', properties: { x: { type: 'string' } } },
            plain: { type: 'string' },
          },
        },
      },
    });
    dispatchMount(root, {
      open: false,
      group: { '*': { x: 'loaded' }, plain: 'plain' },
    });
    expect(readFieldNodeInactiveValues(root)).toEqual([
      { path: '/group/%2A/x', value: 'loaded' },
      { path: '/group/plain', value: 'plain' },
    ]);
    dispatchSetValue(getDispatchNode(root, 'open'), true);
    expect(root.emit).toEqual({
      open: true,
      group: { '*': { x: 'loaded' }, plain: 'plain' },
    });
    dispatchSetValue(getDispatchNode(root, 'open'), false);
    resetFieldNodeForm(
      root,
      { open: false, group: { '*': { x: 'replacement' }, plain: 'fresh' } },
      WriteOption.Overwrite,
    );
    expect(readFieldNodeInactiveValues(root)).toEqual([
      { path: '/group/%2A/x', value: 'replacement' },
      { path: '/group/plain', value: 'fresh' },
    ]);
    dispatchSetValue(getDispatchNode(root, 'open'), true);
    expect(root.emit).toEqual({
      open: true,
      group: { '*': { x: 'replacement' }, plain: 'fresh' },
    });
  },
);
