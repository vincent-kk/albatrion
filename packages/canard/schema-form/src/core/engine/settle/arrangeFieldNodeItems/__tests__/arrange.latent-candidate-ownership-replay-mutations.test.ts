import { expect, it } from 'vitest';

import type { FormErrorRecord } from '../../../../../errors';
import { createDispatchTree } from '../../../__tests__/fixtures/createDispatchTree';
import type { BlueprintSchema } from '../../../blueprint';
import { FieldNodeEventType } from '../../../record';
import type { FieldNodeDelivery } from '../../../record';
import type { Validator } from '../../../validation';
import {
  dispatchInsert,
  dispatchMount,
  dispatchRemove,
  dispatchSetValue,
  dispatchValidate,
  subscribeFieldNode,
} from '../../../write';
import { getDispatchNode } from '../../__tests__/fixtures/getDispatchNode';
import { hasRetainedSlotOwnSource } from '../../__tests__/fixtures/readRetainedSlotRaw';
import { readRetainedSlotRaw } from '../../__tests__/fixtures/readRetainedSlotRaw';

it.each([
  [
    'M1 insert restores branch source into terminal on later gate entry',
    'branch-to-terminal',
    'insert',
  ],
  [
    'M1 remove restores branch source into terminal on later gate entry',
    'branch-to-terminal',
    'remove',
  ],
  [
    'M1 insert restores terminal null into branch on later gate entry',
    'terminal-to-branch',
    'insert',
  ],
  [
    'M1 remove restores terminal null into branch on later gate entry',
    'terminal-to-branch',
    'remove',
  ],
] satisfies readonly [
  string,
  'branch-to-terminal' | 'terminal-to-branch',
  'insert' | 'remove',
][])('%s', async (_name, direction, operation) => {
  const terminalSource = direction === 'terminal-to-branch';
  const source: BlueprintSchema = terminalSource
    ? { type: 'object', nullable: true, options: { terminal: true } }
    : { type: 'object', properties: { v: { type: 'string' } } };
  const destination: BlueprintSchema = {
    type: 'object',
    controls: { active: '../../destinationOn' },
    ...(terminalSource
      ? { nullable: true, properties: { v: { type: 'number', default: 29 } } }
      : { options: { terminal: true } }),
  };
  const schema: BlueprintSchema = {
    type: 'object',
    properties: {
      destinationOn: { type: 'boolean' },
      list: {
        type: 'array',
        allOf: [
          {
            controls: { active: true },
            prefixItems:
              operation === 'insert'
                ? [source, destination]
                : [destination, source],
          },
          {
            controls: { active: false },
            prefixItems: [{ type: 'boolean' }, { type: 'boolean' }],
          },
        ],
      },
    },
  };
  const validationInputs: unknown[] = [];
  const validator: Validator = {
    compile: () => (value) => {
      validationInputs.push(value);
      return null;
    },
    compileGuard: () => () => true,
  };
  const reports: FormErrorRecord[] = [];
  const { root } = createDispatchTree(schema, undefined, validator, {
    report: (record) => reports.push(record),
    hasConsumer: () => true,
  });
  const value = terminalSource ? null : { v: '123', extra: 9 };
  dispatchMount(root, {
    destinationOn: false,
    list: operation === 'insert' ? [value] : [{}, value],
  });
  const events: FieldNodeDelivery[] = [];
  subscribeFieldNode(root, (event) => events.push(event));
  const list = getDispatchNode(root, 'list');
  if (operation === 'insert') dispatchInsert(list, 0, {});
  else dispatchRemove(list, 0);
  const name = operation === 'insert' ? '1' : '0';
  expect(list.structure?.[name]).toBeUndefined();
  expect(hasRetainedSlotOwnSource(root, '/list/' + name, 'object')).toBe(true);
  dispatchSetValue(getDispatchNode(root, 'destinationOn'), true);
  const expected = {
    destinationOn: true,
    list: operation === 'insert' ? [{}, value] : [value],
  };
  expect(getDispatchNode(list, name).raw).toEqual(value);
  expect(root.local).toEqual(expected);
  expect(root.emit).toEqual(expected);
  expect(
    events.at(-1)?.payload?.[FieldNodeEventType.UpdateValue],
  ).toMatchObject({ current: { local: expected, emit: expected } });
  await dispatchValidate(root);
  expect(validationInputs.at(-1)).toEqual(expected);
  expect(hasRetainedSlotOwnSource(root, '/list/' + name, 'object')).toBe(false);
  expect(reports.filter((record) => record.level === 'warning')).toEqual([]);
});

it.each([
  [
    'M2 insert preserves an inactive host source value through deferred replay',
    'insert',
  ],
  [
    'M2 remove preserves an inactive host source value through deferred replay',
    'remove',
  ],
] satisfies readonly [string, 'insert' | 'remove'][])(
  '%s',
  async (_name, operation) => {
    const source: BlueprintSchema = {
      type: 'object',
      controls: { active: '../../sourceOn' },
    };
    const destination: BlueprintSchema = {
      type: 'object',
      controls: { active: '../../destinationOn' },
    };
    const validationInputs: unknown[] = [];
    const validator: Validator = {
      compile: () => (value) => {
        validationInputs.push(value);
        return null;
      },
      compileGuard: () => () => true,
    };
    const { root } = createDispatchTree(
      {
        type: 'object',
        properties: {
          sourceOn: { type: 'boolean' },
          destinationOn: { type: 'boolean' },
          list: {
            type: 'array',
            allOf: [
              {
                controls: { active: true },
                prefixItems:
                  operation === 'insert'
                    ? [source, destination]
                    : [destination, source],
              },
              {
                controls: { active: false },
                prefixItems: [{ type: 'boolean' }, { type: 'boolean' }],
              },
            ],
          },
        },
      },
      undefined,
      validator,
    );
    dispatchMount(root, {
      sourceOn: true,
      destinationOn: false,
      list:
        operation === 'insert'
          ? [{ extra: 9 }]
          : [{ removed: 1 }, { extra: 9 }],
    });
    dispatchSetValue(getDispatchNode(root, 'sourceOn'), false);
    const from = operation === 'insert' ? '0' : '1';
    const to = operation === 'insert' ? '1' : '0';
    const list = getDispatchNode(root, 'list');
    const held = readRetainedSlotRaw(root, '/list/' + from, 'object');
    expect(held).toEqual({ extra: 9 });
    const events: FieldNodeDelivery[] = [];
    subscribeFieldNode(root, (event) => events.push(event));
    if (operation === 'insert') dispatchInsert(list, 0, {});
    else dispatchRemove(list, 0);
    expect(readRetainedSlotRaw(root, '/list/' + to, 'object')).toEqual(held);
    expect(hasRetainedSlotOwnSource(root, '/list/' + from, 'object')).toBe(
      false,
    );
    expect(held).toEqual({ extra: 9 });
    dispatchSetValue(getDispatchNode(root, 'destinationOn'), true);
    const expected = {
      sourceOn: false,
      destinationOn: true,
      list: operation === 'insert' ? [{}, { extra: 9 }] : [{ extra: 9 }],
    };
    expect(root.local).toEqual(expected);
    expect(root.emit).toEqual(expected);
    expect(getDispatchNode(list, to).undeclaredValues).toEqual({ extra: 9 });
    expect(
      events.at(-1)?.payload?.[FieldNodeEventType.UpdateValue],
    ).toMatchObject({ current: { local: expected, emit: expected } });
    await dispatchValidate(root);
    expect(validationInputs.at(-1)).toEqual(expected);
    expect(hasRetainedSlotOwnSource(root, '/list/' + to, 'object')).toBe(false);
  },
);
