import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import {
  NodeEventType,
  type ObjectNode,
  type SchemaNode,
  type StringNode,
  nodeFromJSONSchema,
} from '@/schema-form/core';
import type { JSONSchema } from '@/schema-form/types';

/**
 * A read of a pending value is remembered until the value changes again. Each
 * case reads an object in its pending window, then changes the object by a path
 * other than a child write, and expects what a run without the read gives.
 */
describe('ObjectNode branch — a remembered read never outlives the value it read', () => {
  /** Runs `act` twice on fresh trees — reading `path` right after `write`, and not — and returns both results. */
  const withAndWithoutRead = async (
    jsonSchema: JSONSchema,
    defaultValue: Record<string, unknown> | undefined,
    path: string,
    write: (find: (path: string) => SchemaNode | null) => void,
    then: (find: (path: string) => SchemaNode | null) => void,
  ) => {
    const run = async (read: boolean) => {
      const node = nodeFromJSONSchema({
        onChange: () => {},
        jsonSchema,
        defaultValue,
      });
      await delay(10);
      const find = (target: string) => node.find(target);
      write(find);
      if (read) void find(path)?.value;
      then(find);
      const sync = find(path)?.value;
      await delay(10);
      return { sync, settled: node.value };
    };
    return { quiet: await run(false), read: await run(true) };
  };

  const nested = {
    type: 'object',
    properties: {
      target: {
        type: ['object', 'null'],
        properties: {
          inner: {
            type: 'object',
            properties: {
              note: { type: 'string' },
              kept: { type: 'string', default: 'K' },
            },
          },
        },
      },
    },
  } satisfies JSONSchema;

  it('forgets a read when the object is rebuilt as a blank form', async () => {
    const { quiet, read } = await withAndWithoutRead(
      nested,
      { target: { inner: { note: 'seed', kept: 'seed' } } },
      'target/inner',
      (find) => (find('target/inner/note') as StringNode).setValue('child'),
      (find) => (find('target') as ObjectNode).setValue(null),
    );

    expect(quiet).toEqual({ sync: { kept: 'K' }, settled: { target: null } });
    expect(read).toEqual(quiet);
  });

  const branching = {
    type: 'object',
    properties: {
      group: {
        type: 'object',
        properties: {
          kind: { type: 'string', enum: ['a', 'b'], default: 'a' },
        },
        oneOf: [
          {
            '&if': "./kind === 'a'",
            properties: { aValue: { type: 'string', default: 'A' } },
          },
          {
            '&if': "./kind === 'b'",
            properties: { bValue: { type: 'string', default: 'B' } },
          },
        ],
      },
    },
  } satisfies JSONSchema;

  it('forgets a read when the branch is recomposed', async () => {
    const { quiet, read } = await withAndWithoutRead(
      branching,
      undefined,
      'group',
      (find) => (find('group/kind') as StringNode).setValue('b'),
      () => {},
    );

    expect(quiet.settled).toEqual({ group: { kind: 'b', bValue: 'B' } });
    expect(read.settled).toEqual(quiet.settled);
  });

  const conditional = {
    type: 'object',
    properties: {
      group: {
        type: 'object',
        properties: {
          kind: { type: 'string', enum: ['a', 'b'], default: 'a' },
          aValue: { type: 'string', computed: { active: "../kind === 'a'" } },
          bValue: { type: 'string', computed: { active: "../kind === 'b'" } },
        },
      },
    },
  } satisfies JSONSchema;

  it('forgets a read when an inactive key is dropped from the pending draft', async () => {
    const { quiet, read } = await withAndWithoutRead(
      conditional,
      { group: { kind: 'a', aValue: 'x' } },
      'group',
      (find) => {
        (find('group') as ObjectNode).setValue({
          kind: 'b',
          aValue: 'x',
          bValue: 'y',
        });
        (find('group/bValue') as StringNode).setValue('z');
      },
      () => {},
    );

    expect(quiet.settled).toEqual({ group: { kind: 'b', bValue: 'z' } });
    expect(read.settled).toEqual(quiet.settled);
  });

  const plain = {
    type: 'object',
    properties: {
      group: {
        type: 'object',
        properties: { a: { type: 'string' }, b: { type: 'string' } },
      },
    },
  } satisfies JSONSchema;

  it('forgets a read when a whole assignment replaces the pending write', async () => {
    const { quiet, read } = await withAndWithoutRead(
      plain,
      { group: { a: 'a0', b: 'b0' } },
      'group',
      (find) => (find('group/a') as StringNode).setValue('child'),
      (find) => (find('group') as ObjectNode).setValue({ b: 'whole' }),
    );

    expect(quiet).toEqual({
      sync: { b: 'whole' },
      settled: { group: { b: 'whole' } },
    });
    expect(read).toEqual(quiet);
  });

  it('forgets a read once any commit has taken the pending write', async () => {
    const updatesOf = async (read: boolean) => {
      const node = nodeFromJSONSchema({
        onChange: () => {},
        jsonSchema: plain,
        defaultValue: { group: { a: 'a0', b: 'b0' } },
      });
      await delay(10);
      const group = node.find('group') as ObjectNode;
      let updates = 0;
      group.subscribe(({ type }) => {
        if (type & NodeEventType.UpdateValue) updates++;
      });
      (node.find('group/a') as StringNode).setValue('child');
      if (read) void group.value;
      group.setValue({ a: 'child', b: 'b0' });
      await delay(10);
      return { updates, value: node.value };
    };
    const quiet = await updatesOf(false);

    expect(quiet.value).toEqual({ group: { a: 'child', b: 'b0' } });
    expect(await updatesOf(true)).toEqual(quiet);
  });

  it('shows a child the committed value while the object is rebuilding it', async () => {
    const node = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: nested,
      defaultValue: { target: { inner: { note: 'seed', kept: 'seed' } } },
    });
    await delay(10);
    const inner = node.find('target/inner');
    const seen: unknown[] = [];
    node.find('target/inner/kept')?.subscribe(({ type }) => {
      if (type & NodeEventType.UpdateValue) seen.push(inner?.value);
    });
    (node.find('target') as ObjectNode).setValue(null);
    await delay(10);

    expect(seen).toEqual([{}]);
  });
});
