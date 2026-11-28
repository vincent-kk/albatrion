import { FormWarningCode } from '@/schema-form/errors';

import type { BoundaryScene } from '../types';

/** The warning a write through a retired reference delivers. */
const DETACHED_WRITE = `warning ${FormWarningCode.DetachedNodeWrite} write`;

/** An object with a list of the given items and two unrelated strings, `a` and `b`, to write beside it. */
const listOfStrings = (items: Record<string, unknown>, options?: object) => ({
  type: 'object' as const,
  properties: {
    list: { type: 'array' as const, items, ...(options ? { options } : {}) },
    a: { type: 'string' as const },
    b: { type: 'string' as const },
  },
});

/**
 * Batched writes: a batch must leave the stored state the same calls leave one after the other (batch design T2),
 * keep untouched positions as they were and report nothing as written there (T3).
 */
export const batchedWriteScenes: readonly BoundaryScene[] = [
  {
    id: 'batched-writes/untouched-union-keeps-its-value',
    origin:
      'batch differences D2, D15 and D26 (probe P1): a batch rewrites an untouched union and refreshes it',
    schema: {
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        a: { type: 'string' },
        b: { type: 'string' },
        data: { type: ['string', 'number'] },
      },
      allOf: [
        {
          controls: { active: './flag === true' },
          properties: { data: { type: 'number' } },
        },
      ],
    },
    load: { flag: true, data: '2', a: 'a' },
    steps: [
      { set: '/a', value: 'b' },
      { set: '/b', value: 'c' },
    ],
    probes: ['source /data', 'value /data', 'refresh /data'],
    modes: ['sequential', 'batch'],
    state: 'known',
    expected: { 'source /data': '2', 'value /data': 2, 'refresh /data': false },
    difference:
      'the load stores the converted number (WRITE-098), so the untouched union holds no raw text for a batch to rewrite',
    known: {
      sequential: {
        'source /data': 2,
        'value /data': 2,
        'refresh /data': false,
      },
      batch: { 'source /data': 2, 'value /data': 2, 'refresh /data': false },
    },
  },
  {
    id: 'batched-writes/untouched-omit-empty-item',
    origin:
      'batch difference D3 (probe P2): an untouched empty item of an omitEmpty list becomes null',
    schema: listOfStrings({ type: 'string', options: { omitEmpty: true } }),
    load: { list: ['a', '', 'c'] },
    steps: [
      { set: '/a', value: '2' },
      { set: '/b', value: '3' },
    ],
    probes: ['source /list/1', 'value /list/1', 'refresh /list/1'],
    modes: ['sequential', 'batch'],
    state: 'known',
    expected: {
      'source /list/1': '',
      'value /list/1': '',
      'refresh /list/1': false,
    },
    difference:
      'the batch writes null into the untouched empty item and refreshes it',
    known: {
      sequential: {
        'source /list/1': '',
        'value /list/1': '',
        'refresh /list/1': false,
      },
      batch: {
        'source /list/1': null,
        'value /list/1': undefined,
        'refresh /list/1': true,
      },
    },
  },
  {
    id: 'batched-writes/untouched-nullable-item-without-value',
    origin:
      'batch difference D4 (probe P3): an untouched nullable item without a value becomes null',
    schema: listOfStrings({ type: ['string', 'null'] }),
    load: { list: [undefined, 'b'] },
    steps: [
      { set: '/a', value: '2' },
      { set: '/b', value: '3' },
    ],
    probes: ['source /list/0', 'value /list/0'],
    modes: ['sequential', 'batch'],
    state: 'known',
    expected: { 'source /list/0': undefined, 'value /list/0': undefined },
    difference: 'the batch writes null into the untouched nullable item',
    known: {
      sequential: { 'source /list/0': undefined, 'value /list/0': undefined },
      batch: { 'source /list/0': null, 'value /list/0': null },
    },
  },
  {
    id: 'batched-writes/untouched-trailing-empty-items',
    origin:
      'batch difference D5 (probe P4): a batch drops the untouched trailing empty items of a list',
    schema: listOfStrings({ type: 'string' }, { omitTrailingEmpty: true }),
    load: { list: ['a', null] },
    steps: [
      { set: '/a', value: '2' },
      { set: '/b', value: '3' },
    ],
    probes: ['value /list', 'find /list/1'],
    modes: ['sequential', 'batch'],
    state: 'known',
    expected: { 'value /list': ['a', null], 'find /list/1': true },
    difference:
      'the batch writes the trimmed output back, so the trailing item is removed',
    known: {
      sequential: { 'value /list': ['a', null], 'find /list/1': true },
      batch: { 'value /list': ['a'], 'find /list/1': false },
    },
  },
  {
    id: 'batched-writes/write-into-a-position-the-output-omits',
    origin:
      'batch difference D6 (probe P5): a write into a list the output omits turns the list into an object',
    schema: listOfStrings({ type: 'string' }, { omitTrailingEmpty: true }),
    load: { list: [null, null] },
    steps: [
      { set: '/list/1', value: 'b' },
      { set: '/a', value: '2' },
    ],
    probes: ['value /list'],
    modes: ['sequential', 'batch'],
    state: 'known',
    expected: { 'value /list': [null, 'b'] },
    difference:
      'the batch writes into the trimmed output, which keeps the list as an object and shows it empty',
    known: {
      sequential: { 'value /list': [null, 'b'] },
      batch: { 'value /list': [] },
    },
  },
  {
    id: 'batched-writes/reference-to-a-shrunk-position',
    origin:
      'batch difference D7 (probe P6): a reference whose position an earlier write removed writes again',
    schema: listOfStrings({ type: 'string' }),
    load: { list: ['a', 'b'] },
    hold: { item1: '/list/1' },
    steps: [
      { set: '/list', value: [] },
      { set: '/list', value: ['x', 'y'] },
      { setHeld: 'item1', value: 'z' },
    ],
    probes: ['value /list', 'detached item1', 'reports'],
    modes: ['sequential', 'batch'],
    state: 'known',
    expected: {
      'value /list': ['x', 'y'],
      'detached item1': true,
      reports: [DETACHED_WRITE],
    },
    difference:
      'the batch keeps the removed position alive, so the retired reference writes z',
    known: {
      sequential: {
        'value /list': ['x', 'y'],
        'detached item1': true,
        reports: [DETACHED_WRITE],
      },
      batch: {
        'value /list': ['x', 'z'],
        'detached item1': false,
        reports: [],
      },
    },
  },
  {
    id: 'batched-writes/reset-barrier-revives-a-removed-reference',
    origin:
      'batch evaluation G5 (base defect): a subtree reset drops the mark that retired a reference',
    schema: listOfStrings({ type: 'string' }),
    load: { list: ['a', 'b'] },
    hold: { item1: '/list/1' },
    steps: [
      { set: '/list', value: ['p'] },
      { set: '/a', value: 'x' },
      { reset: '/list' },
      { setHeld: 'item1', value: 'Z' },
    ],
    probes: ['value /list', 'detached item1', 'reports'],
    modes: ['sequential', 'batch'],
    state: 'known',
    expected: {
      'value /list': ['a'],
      'detached item1': true,
      reports: [DETACHED_WRITE],
    },
    difference:
      'the reset drops the mark that retired /list/1, so the removed reference writes again',
    known: {
      sequential: {
        'value /list': ['a'],
        'detached item1': true,
        reports: [DETACHED_WRITE],
      },
      batch: {
        'value /list': ['a', 'Z'],
        'detached item1': false,
        reports: [],
      },
    },
  },
  {
    id: 'batched-writes/reset-barrier-loads-the-cut-snapshot',
    origin:
      'batch evaluation G3 (base defect): a subtree reset loads the snapshot tail an earlier write cut',
    schema: listOfStrings({ type: 'string' }),
    load: { list: ['a', 'b'], a: 'a0' },
    steps: [
      { set: '/a', value: '1' },
      { set: '/list', value: ['p'] },
      { reset: '/list' },
      { append: '/list', value: 'r' },
      { set: '/b', value: '2' },
    ],
    probes: ['value /list', 'updater'],
    modes: ['sequential', 'batch'],
    state: 'known',
    expected: { 'value /list': ['a', 'r'], updater: [['a']] },
    difference:
      'the reset loads the snapshot tail the earlier write cut, so b comes back',
    known: {
      sequential: { 'value /list': ['a', 'r'], updater: [['a']] },
      batch: { 'value /list': ['a', 'b', 'r'], updater: [['a', 'b']] },
    },
  },
  {
    id: 'batched-writes/merge-replaces-an-array-of-objects',
    origin:
      'batch difference D8 (probe P7) and batch design T6: Merge replaces an array whole in both routes',
    schema: {
      type: 'object',
      properties: {
        list: {
          type: 'array',
          items: {
            type: 'object',
            properties: { a: { type: 'string' }, b: { type: 'string' } },
          },
        },
        z: { type: 'string' },
      },
    },
    load: { list: [{ a: '1', b: '2' }] },
    steps: [
      { set: '', value: { list: [{ a: 'x' }] }, merge: true },
      { set: '/z', value: '2' },
    ],
    probes: ['value /list'],
    modes: ['sequential', 'batch'],
    state: 'known',
    expected: { 'value /list': [{ a: 'x' }] },
    difference:
      'a sequential Merge merges the array items instead of replacing the array',
    known: {
      sequential: { 'value /list': [{ a: 'x', b: '2' }] },
      batch: { 'value /list': [{ a: 'x' }] },
    },
  },
  {
    id: 'batched-writes/merge-reads-a-non-enumerable-declared-key',
    origin:
      'batch difference D9 (probe P8) and batch design section 4 item 7: a non-enumerable declared key',
    schema: {
      type: 'object',
      properties: {
        o: {
          type: 'object',
          properties: {
            a: { type: 'string' },
            list: { type: 'array', items: { type: 'string' } },
          },
        },
        x: { type: 'string' },
      },
    },
    load: { o: { a: 'A', list: ['a', 'b'] } },
    steps: [
      { set: '/o', value: { a: 'B' }, hidden: { list: [] }, merge: true },
      { set: '/x', value: '2' },
    ],
    probes: ['value /o/a', 'value /o/list'],
    modes: ['sequential', 'batch'],
    state: 'known',
    expected: { 'value /o/a': 'B', 'value /o/list': [] },
    difference:
      'the batch skips the non-enumerable declared key, so the list keeps its items',
    known: {
      sequential: { 'value /o/a': 'B', 'value /o/list': [] },
      batch: { 'value /o/a': 'B', 'value /o/list': ['a', 'b'] },
    },
  },
  {
    id: 'batched-writes/null-host-released-by-a-union-child',
    origin:
      'batch evaluation W6n (prototype regression): a union child write releases a null host',
    schema: {
      type: 'object',
      properties: {
        o: {
          type: 'object',
          nullable: true,
          properties: {
            a: { type: 'string' },
            u: { type: ['string', 'number'] },
          },
        },
        z: { type: 'string' },
      },
    },
    load: { o: null },
    steps: [
      { set: '/o/u', value: 5 },
      { set: '/z', value: 'z1' },
    ],
    probes: ['value /o'],
    modes: ['sequential', 'batch'],
    state: 'expected',
    expected: { 'value /o': { u: 5 } },
  },
  {
    id: 'batched-writes/null-host-kept-by-an-inactive-candidate-merge',
    origin:
      'batch prototype round four W3 (prototype regression, batch decision 14): a Merge that supplies only an inactive candidate keeps a null host',
    schema: {
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        o: {
          type: 'object',
          nullable: true,
          properties: {
            a: { type: 'string' },
            c: { type: 'string', controls: { active: '../../flag' } },
          },
        },
        z: { type: 'string' },
      },
    },
    load: { flag: false, o: null },
    steps: [
      { set: '', value: { o: { c: 'v' } }, merge: true },
      { set: '/z', value: 'z1' },
    ],
    probes: ['value /o'],
    modes: ['sequential', 'batch'],
    state: 'expected',
    expected: { 'value /o': null },
  },
  {
    id: 'batched-writes/context-change-after-marks',
    origin:
      'batch difference D22 and batch evaluation G7: a context change inside a batch overtakes the earlier marks',
    schema: {
      type: 'object',
      properties: {
        a: { type: 'string' },
        g: { type: 'string', controls: { active: '@.open' } },
        list: { type: 'array', items: { type: 'string' } },
      },
    },
    load: { a: 'a0', g: 'g0', list: ['x', 'y'] },
    context: { open: true },
    steps: [
      { set: '/a', value: 'a1' },
      { set: '/list', value: ['p'] },
      { set: '/g', value: 'g1' },
      { context: { open: false } },
      { note: 'after' },
    ],
    probes: ['value /a', 'value /list', 'inactive /g'],
    modes: ['sequential', 'batch'],
    state: 'known',
    expected: {
      'after: value /a': 'a1',
      'after: value /list': ['p'],
      'after: inactive /g': ['g1'],
      'value /a': 'a1',
      'value /list': ['p'],
      'inactive /g': ['g1'],
    },
    difference:
      'the context change settles before the earlier marks, so the reads after it miss them',
    known: {
      sequential: {
        'after: value /a': 'a1',
        'after: value /list': ['p'],
        'after: inactive /g': ['g1'],
        'value /a': 'a1',
        'value /list': ['p'],
        'inactive /g': ['g1'],
      },
      batch: {
        'after: value /a': 'a0',
        'after: value /list': ['x', 'y'],
        'after: inactive /g': ['g0'],
        'value /a': 'a1',
        'value /list': ['p'],
        'inactive /g': ['g1'],
      },
    },
  },
  {
    id: 'batched-writes/find-sees-the-last-commit',
    origin:
      'batch difference D11 (probe P10) and batch design B4: find inside a batch sees the last commit',
    schema: listOfStrings({ type: 'string' }),
    load: { list: ['a'] },
    steps: [{ set: '/list', value: ['a', 'b'] }, { note: 'inside' }],
    probes: ['find /list/1', 'value /list'],
    modes: ['batch'],
    state: 'expected',
    expected: {
      'inside: find /list/1': false,
      'inside: value /list': ['a'],
      'find /list/1': true,
      'value /list': ['a', 'b'],
    },
  },
  {
    id: 'batched-writes/throwing-getter-in-a-solitary-write',
    origin:
      'batch evaluation H1s (base defect): a solitary write whose deep getter throws is left half stored',
    schema: {
      type: 'object',
      properties: {
        o: {
          type: 'object',
          properties: {
            a: { type: 'string' },
            inner: {
              type: 'object',
              properties: { m: { type: 'string' }, n: { type: 'string' } },
            },
          },
        },
        z: { type: 'string' },
      },
    },
    load: { o: { a: 'A', inner: { m: 'M', n: 'N' } } },
    steps: [
      {
        set: '/o',
        value: { a: 'x', inner: { m: 'mm', n: 'N' } },
        throwAt: '/inner/n',
      },
      { note: 'thrown' },
      { set: '/z', value: 'z1' },
    ],
    probes: ['source /o/a', 'value /o/a'],
    modes: ['sequential', 'batch'],
    state: 'known',
    expected: {
      'thrown: source /o/a': 'A',
      'thrown: value /o/a': 'A',
      'source /o/a': 'A',
      'value /o/a': 'A',
    },
    difference:
      'the write stores the source x before the getter throws and never commits it, so source and value disagree',
    known: {
      sequential: {
        'thrown: source /o/a': 'x',
        'thrown: value /o/a': 'A',
        'source /o/a': 'x',
        'value /o/a': 'A',
      },
      batch: {
        'thrown: source /o/a': 'A',
        'thrown: value /o/a': 'A',
        'source /o/a': 'x',
        'value /o/a': 'A',
      },
    },
  },
];
