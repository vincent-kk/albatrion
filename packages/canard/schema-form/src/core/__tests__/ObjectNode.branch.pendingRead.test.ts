import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import {
  NodeEventType,
  type NumberNode,
  type ObjectNode,
  type SchemaNode,
  SetValueOption,
  type StringNode,
  nodeFromJSONSchema,
} from '@/schema-form/core';
import type { JSONSchema } from '@/schema-form/types';

/**
 * Node-tree twin of `nullable.object-pending-read.render.test.tsx`: the same
 * writes give the same value, events and injection whether or not an object's
 * value was read while a child's commit was still queued.
 *
 * A defect still open is held twice: `[pin]` asserts the wrong value it gives
 * today, `it.fails` asserts the behavior wanted.
 */
describe('ObjectNode branch — reading a value while a child commit is pending', () => {
  const nestedDerived = {
    type: 'object',
    properties: {
      quantity: { type: 'number', default: 2 },
      target: {
        type: ['object', 'null'],
        properties: {
          inner: {
            type: 'object',
            properties: {
              note: { type: 'string' },
              total: {
                type: 'number',
                computed: { derived: '(../../../quantity || 0) * 10' },
              },
            },
          },
        },
      },
    },
  } satisfies JSONSchema;

  /** Changes the dependency of a derived field under a null seed; `read` picks who reads `inner` in the pending window. */
  const changeDependency = async (
    read: 'none' | 'subscriber' | 'microtask',
  ) => {
    const node = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: nestedDerived,
      defaultValue: { target: null },
    });
    await delay(10);
    const inner = node.find('target/inner');
    node.find('target/inner/total')?.subscribe(({ type }) => {
      if (read === 'subscriber' && type & NodeEventType.UpdateValue)
        void inner?.value;
    });
    (node.find('quantity') as NumberNode).setValue(5);
    if (read === 'microtask') queueMicrotask(() => void inner?.value);
    await delay(10);
    return node.value;
  };

  it('[pin] a read in the pending window turns a derived write into a promotion', async () => {
    const promoted = { quantity: 5, target: { inner: { total: 50 } } };

    expect(await changeDependency('none')).toEqual({
      quantity: 5,
      target: null,
    });
    expect(await changeDependency('subscriber')).toEqual(promoted);
    expect(await changeDependency('microtask')).toEqual(promoted);
  });

  it.fails(
    '[parity] a derived write under a null seed keeps null whoever reads the object // BUG: the getter commits the pending write as an intended one',
    async () => {
      const quiet = await changeDependency('none');

      expect(quiet).toEqual({ quantity: 5, target: null });
      expect(await changeDependency('subscriber')).toEqual(quiet);
      expect(await changeDependency('microtask')).toEqual(quiet);
    },
  );

  const watched = {
    type: 'object',
    properties: {
      seed: { type: 'number', default: 1 },
      source: {
        type: 'object',
        properties: {
          note: { type: 'string', default: 'u' },
          total: {
            type: 'number',
            computed: { derived: '(../../seed || 0) * 10' },
          },
        },
      },
      watcher: { type: 'string', computed: { watch: ['../source'] } },
    },
  } satisfies JSONSchema;

  /** Changes the seed; with `write`, a subscriber repeats a sibling's value, which walks the ancestors and reads them. */
  const changeSeed = async (write: boolean) => {
    const node = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: watched,
    });
    await delay(10);
    const source = node.find('source');
    const note = node.find('source/note') as StringNode;
    let updates = 0;
    source?.subscribe(({ type }) => {
      if (type & NodeEventType.UpdateValue) updates++;
    });
    node.find('source/total')?.subscribe(({ type }) => {
      if (write && type & NodeEventType.UpdateValue)
        note.setValue('u', SetValueOption.Merge);
    });
    (node.find('seed') as NumberNode).setValue(2);
    await delay(10);
    return {
      value: node.value,
      updates,
      watched: node.find('watcher')?.watchValues,
    };
  };

  it('[pin] a same-value write beside a pending commit drops the update of the object and leaves its watcher stale', async () => {
    const written = await changeSeed(true);

    expect(written.updates).toBe(0);
    expect(written.watched).toEqual([{ note: 'u', total: 10 }]);
    expect(written.value).toEqual({
      seed: 2,
      source: { note: 'u', total: 20 },
    });
  });

  it.fails(
    '[parity] a same-value write beside a pending commit leaves the update of the object and its watcher intact // BUG: the ancestor walk reads the parent, and the getter commits without publishing UpdateValue',
    async () => {
      const quiet = await changeSeed(false);

      expect(quiet.updates).toBe(1);
      expect(quiet.watched).toEqual([{ note: 'u', total: 20 }]);
      expect(await changeSeed(true)).toEqual(quiet);
    },
  );

  const injecting = {
    type: 'object',
    properties: {
      seed: { type: 'number', default: 1 },
      source: {
        type: 'object',
        injectTo: (value: { total?: number } | null) => ({
          '/target/mirror': value?.total,
        }),
        properties: {
          note: { type: 'string' },
          total: {
            type: 'number',
            computed: { derived: '(../../seed || 0) * 10' },
          },
        },
      },
      target: {
        type: ['object', 'null'],
        properties: { mirror: { type: 'number' } },
      },
    },
  } satisfies JSONSchema;

  /** Writes into the injecting object, then changes the seed; with `read`, the object is read in the tick of the write. */
  const writeThenDerive = async (read: boolean) => {
    const node = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: injecting,
      defaultValue: { target: null },
    });
    await delay(10);
    const source = node.find('source');
    (node.find('source/note') as StringNode).setValue('user');
    if (read) void source?.value;
    await delay(10);
    const afterWrite = node.value;
    (node.find('seed') as NumberNode).setValue(2);
    await delay(10);
    return { afterWrite, afterDerive: node.value };
  };

  it('[pin] a read in the tick of an intended write loses its injection and hands the intent to the next derived update', async () => {
    const read = await writeThenDerive(true);

    expect(read.afterWrite).toEqual({
      seed: 1,
      source: { note: 'user', total: 10 },
      target: null,
    });
    expect(read.afterDerive).toEqual({
      seed: 2,
      source: { note: 'user', total: 20 },
      target: { mirror: 20 },
    });
  });

  it.fails(
    '[parity] an intended write injects in its own settle whether or not the object was read // BUG: the getter commits without publishing UpdateValue, which carries the injection',
    async () => {
      const quiet = await writeThenDerive(false);

      expect(quiet.afterWrite).toEqual({
        seed: 1,
        source: { note: 'user', total: 10 },
        target: { mirror: 10 },
      });
      expect(await writeThenDerive(true)).toEqual(quiet);
    },
  );

  it('keeps null when only a derived value drives the injection', async () => {
    const node = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: injecting,
      defaultValue: { target: null },
    });
    await delay(10);
    (node.find('seed') as NumberNode).setValue(2);
    await delay(10);

    expect(node.value).toEqual({
      seed: 2,
      source: { total: 20 },
      target: null,
    });
  });

  const nestedNote = {
    type: 'object',
    properties: {
      target: {
        type: ['object', 'null'],
        properties: {
          inner: { type: 'object', properties: { note: { type: 'string' } } },
          list: {
            type: 'array',
            items: { type: 'object', properties: { note: { type: 'string' } } },
          },
        },
      },
    },
  } satisfies JSONSchema;

  /** Gives `path` the same value twice in one tick: first as an automatic write, then as an intended one. */
  const repeatAsIntended = async (path: string) => {
    const node = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: nestedNote,
      defaultValue: { target: null },
    });
    await delay(10);
    const note = node.find(path) as StringNode;
    note.setValue('same', SetValueOption.Overwrite | SetValueOption.Automatic);
    note.setValue('same');
    await delay(10);
    return node.value;
  };

  it('[pin] an intended write repeating an automatic one in the same tick leaves the ancestor null', async () => {
    expect(await repeatAsIntended('target/inner/note')).toEqual({
      target: null,
    });
  });

  it.fails(
    'promotes when an intended write repeats, in one tick, the value an automatic write just gave // BUG: the duplicate check returns before the intent is latched',
    async () => {
      expect(await repeatAsIntended('target/inner/note')).toEqual({
        target: { inner: { note: 'same' } },
      });
    },
  );

  /** Runs `act` on a settled tree and reports what nobody reading the object observes: the value, the object's `UpdateValue` count and the root `onChange` payloads. */
  const observe = async (
    jsonSchema: JSONSchema,
    defaultValue: Record<string, unknown> | undefined,
    act: (find: (path: string) => SchemaNode | null) => void,
  ) => {
    const changes: unknown[] = [];
    const node = nodeFromJSONSchema({
      onChange: (value) => changes.push(value),
      jsonSchema,
      defaultValue,
    });
    await delay(10);
    changes.length = 0;
    let updates = 0;
    node.find('group')?.subscribe(({ type }) => {
      if (type & NodeEventType.UpdateValue) updates++;
    });
    act((path) => node.find(path));
    await delay(10);
    return { value: node.value, updates, changes };
  };

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

  it('[baseline] a child write in the tick of an unsettled object write lands on it, and the inactive key is dropped', async () => {
    const seen = await observe(conditional, undefined, (find) => {
      (find('group') as ObjectNode).setValue({
        kind: 'b',
        aValue: 'x',
        bValue: 'y',
      });
      (find('group/bValue') as StringNode).setValue('z');
    });

    expect(seen).toEqual({
      value: { group: { kind: 'b', bValue: 'z' } },
      updates: 2,
      changes: [{ group: { kind: 'b', bValue: 'z' } }],
    });
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
  const filled = { group: { a: 'a0', b: 'b0' } };

  it('[baseline] a whole assignment replaces a child write still pending', async () => {
    const seen = await observe(plain, filled, (find) => {
      (find('group/a') as StringNode).setValue('child');
      (find('group') as ObjectNode).setValue({ b: 'whole' });
    });

    expect(seen).toEqual({
      value: { group: { b: 'whole' } },
      updates: 1,
      changes: [{ group: { b: 'whole' } }],
    });
  });

  it('[baseline] a functional assignment builds on a child write still pending', async () => {
    const seen = await observe(plain, filled, (find) => {
      (find('group/a') as StringNode).setValue('child');
      (find('group') as ObjectNode).setValue((previous) => ({
        ...previous,
        b: 'whole',
      }));
    });

    expect(seen).toEqual({
      value: { group: { a: 'child', b: 'whole' } },
      updates: 1,
      changes: [{ group: { a: 'child', b: 'whole' } }],
    });
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

  it('[baseline] a whole assignment that switches the branch settles in one change', async () => {
    const seen = await observe(branching, undefined, (find) => {
      (find('group') as ObjectNode).setValue({ kind: 'b', bValue: 'typed' });
    });

    expect(seen).toEqual({
      value: { group: { kind: 'b', bValue: 'typed' } },
      updates: 2,
      changes: [{ group: { kind: 'b', bValue: 'typed' } }],
    });
  });

  it('[baseline] a discriminator write switches the branch back to its default in one change', async () => {
    const seen = await observe(
      branching,
      { group: { kind: 'b', bValue: 'typed' } },
      (find) => {
        (find('group/kind') as StringNode).setValue('a');
      },
    );

    expect(seen).toEqual({
      value: { group: { kind: 'a', aValue: 'A' } },
      updates: 2,
      changes: [{ group: { kind: 'a', aValue: 'A' } }],
    });
  });
});
