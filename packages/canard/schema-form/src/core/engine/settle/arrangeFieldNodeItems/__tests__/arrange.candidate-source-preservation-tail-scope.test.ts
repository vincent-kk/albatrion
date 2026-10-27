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
  { kind: 'string', terminal: true, disabled: false, candidateHost: false },
  { kind: 'string', terminal: true, disabled: true, candidateHost: false },
  { kind: 'number', terminal: true, disabled: false, candidateHost: false },
  { kind: 'number', terminal: true, disabled: true, candidateHost: false },
  { kind: 'object', terminal: false, disabled: false, candidateHost: false },
  { kind: 'object', terminal: false, disabled: true, candidateHost: false },
  { kind: 'object', terminal: true, disabled: false, candidateHost: false },
  { kind: 'object', terminal: true, disabled: true, candidateHost: false },
  { kind: 'array', terminal: false, disabled: false, candidateHost: false },
  { kind: 'array', terminal: false, disabled: true, candidateHost: false },
  { kind: 'array', terminal: true, disabled: false, candidateHost: false },
  { kind: 'array', terminal: true, disabled: true, candidateHost: false },
  { kind: 'string', terminal: true, disabled: false, candidateHost: true },
  { kind: 'string', terminal: true, disabled: true, candidateHost: true },
  { kind: 'number', terminal: true, disabled: false, candidateHost: true },
  { kind: 'number', terminal: true, disabled: true, candidateHost: true },
  { kind: 'object', terminal: false, disabled: false, candidateHost: true },
  { kind: 'object', terminal: false, disabled: true, candidateHost: true },
  { kind: 'object', terminal: true, disabled: false, candidateHost: true },
  { kind: 'object', terminal: true, disabled: true, candidateHost: true },
  { kind: 'array', terminal: false, disabled: false, candidateHost: true },
  { kind: 'array', terminal: false, disabled: true, candidateHost: true },
  { kind: 'array', terminal: true, disabled: false, candidateHost: true },
  { kind: 'array', terminal: true, disabled: true, candidateHost: true },
])(
  'keeps base undeclared-tail sources for $kind terminal=$terminal disabled=$disabled candidateHost=$candidateHost',
  ({ kind, terminal, disabled, candidateHost }) => {
    const item: BlueprintSchema = {
      ...(kind === 'object'
        ? { type: 'object', properties: { v: { type: 'string' } } }
        : kind === 'array'
          ? { type: 'array', items: { type: 'string' } }
          : kind === 'number'
            ? { type: 'number' }
            : { type: 'string' }),
      ...(kind === 'object' || kind === 'array'
        ? { options: { terminal } }
        : {}),
      controls: { active: '../../open' },
    };
    const candidate: BlueprintSchema = {
      type: 'object',
      allOf: [
        { controls: { active: false }, properties: { x: { type: 'number' } } },
        { controls: { active: false }, properties: { x: { type: 'string' } } },
      ],
    };
    const { root, runtime } = createDispatchTree({
      type: 'object',
      properties: {
        open: { type: 'boolean' },
        list: {
          type: 'array',
          prefixItems: candidateHost ? [candidate, item] : [item],
        },
      },
    });
    const kept =
      kind === 'object'
        ? { v: 'kept' }
        : kind === 'array'
          ? ['kept']
          : kind === 'number'
            ? 37
            : 'kept';
    const replacement =
      kind === 'object'
        ? { v: 'new' }
        : kind === 'array'
          ? ['new']
          : kind === 'number'
            ? 71
            : 'new';
    const prefix = candidateHost ? [{}] : [];
    dispatchMount(root, { open: true, list: [...prefix, kept, 'tail'] });
    const list = getDispatchNode(root, 'list');
    expect(list.blueprintNode.hasCandidateDescendants === true).toBe(
      candidateHost,
    );
    runtime.disableAutomaticWrites = disabled;
    dispatchSetValue(getDispatchNode(root, 'open'), false);
    const index = candidateHost ? 1 : 0;
    dispatchInsert(list, index, replacement);
    const path = '/list/' + index;
    const sourcePath = kind === 'object' && !terminal ? path + '/v' : path;
    const value = kind === 'object' && !terminal ? 'new' : replacement;
    expect(readFieldNodeInactiveValues(root)).toEqual([
      { path: sourcePath, value },
    ]);
    expect(root.emit).toEqual({
      open: false,
      list: [
        ...prefix,
        kind === 'object' ? {} : kind === 'array' ? [] : null,
        kept,
        'tail',
      ],
    });
  },
);
