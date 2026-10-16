import { expect, it } from 'vitest';

import type { FormErrorRecord } from '../../../../../errors';
import { createDispatchTree } from '../../../__tests__/fixtures/createDispatchTree';
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
import { createMoveReplayScene } from './fixtures/createMoveReplayScene';
import type { MoveReplayCase } from './fixtures/createMoveReplayScene';

it.each([
  ['R-A object branch to terminal on insert', 'object-terminal', 'insert'],
  ['R-A object branch to terminal on remove', 'object-terminal', 'remove'],
  ['R-A terminal null to nullable branch on insert', 'terminal-null', 'insert'],
  ['R-A terminal null to nullable branch on remove', 'terminal-null', 'remove'],
  ['R-A array branch to terminal on insert', 'array-terminal', 'insert'],
  ['R-B nested object complement on insert', 'nested-object', 'insert'],
  ['R-B nested object complement on remove', 'nested-object', 'remove'],
  ['R-B complement through a nested array', 'nested-array', 'insert'],
  [
    'R-B retained child input wins over destination default',
    'nested-default',
    'insert',
  ],
  [
    'R-C inactive destination stores its missing kind on insert',
    'inactive-number',
    'insert',
  ],
  [
    'R-C inactive destination stores its missing kind on remove',
    'inactive-number',
    'remove',
  ],
] satisfies readonly [
  string,
  MoveReplayCase['mode'],
  MoveReplayCase['operation'],
][])('%s', async (name, mode, operation) => {
  const scene = { name, mode, operation };
  const fixture = createMoveReplayScene(scene);
  const validationInputs: unknown[] = [];
  const validator: Validator = {
    compile: () => (value) => {
      validationInputs.push(value);
      return null;
    },
    compileGuard: () => () => true,
  };
  const reports: FormErrorRecord[] = [];
  const { root } = createDispatchTree(fixture.schema, undefined, validator, {
    report: (record) => reports.push(record),
    hasConsumer: () => true,
  });
  dispatchMount(root, fixture.initial);
  const events: FieldNodeDelivery[] = [];
  subscribeFieldNode(root, (event) => events.push(event));
  if (scene.operation === 'insert') dispatchInsert(root, 0, fixture.inserted);
  else dispatchRemove(root, 0);
  const moved = getDispatchNode(root, fixture.destinationIndex);
  if (scene.mode !== 'terminal-null') {
    expect(moved.local).toEqual(fixture.expectedMoved);
    expect(moved.emit).toEqual(fixture.expectedMoved);
  }
  if (
    scene.mode === 'object-terminal' ||
    scene.mode === 'terminal-null' ||
    scene.mode === 'array-terminal'
  )
    expect(moved.raw).toEqual(fixture.expectedMoved);
  expect(root.local).toEqual(fixture.expected);
  expect(root.emit).toEqual(fixture.expected);
  expect(
    events.at(-1)?.payload?.[FieldNodeEventType.UpdateValue],
  ).toMatchObject({
    current: { local: fixture.expected, emit: fixture.expected },
  });
  await dispatchValidate(root);
  expect(validationInputs.at(-1)).toEqual(fixture.expected);
  if (scene.mode === 'inactive-number') {
    const path = `/${fixture.destinationIndex}/v`;
    const key = JSON.stringify([path, 'number']);
    expect(root.runtime.latentRaw.get(key)).toBe(123);
    expect(root.runtime.latentRawMetadata?.get(key)).toMatchObject({
      path,
      blueprintNode: { kind: 'number' },
    });
    dispatchSetValue(getDispatchNode(moved, 'enabled'), true);
    const expectedMoved = { enabled: true, v: 123, extra: 9 };
    const expected =
      scene.operation === 'insert' ? [{}, expectedMoved] : [expectedMoved];
    expect(getDispatchNode(moved, 'v').raw).toBe(123);
    expect(root.local).toEqual(expected);
    expect(root.emit).toEqual(expected);
    expect(
      events.at(-1)?.payload?.[FieldNodeEventType.UpdateValue],
    ).toMatchObject({ current: { local: expected, emit: expected } });
    await dispatchValidate(root);
    expect(validationInputs.at(-1)).toEqual(expected);
  }
  expect(reports.filter((record) => record.level === 'warning')).toEqual([]);
});
