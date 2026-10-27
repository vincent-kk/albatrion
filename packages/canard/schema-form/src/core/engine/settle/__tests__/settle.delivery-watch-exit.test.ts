import { afterEach, describe, expect, it, vi } from 'vitest';
import { beforeEach } from 'vitest';

import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import { FieldNodeEventType } from '@/schema-form/core/engine/record';
import {
  dispatchClear,
  dispatchInsert,
  dispatchRemove,
} from '@/schema-form/core/engine/write';

import { pinSlotShipping } from '../../../__tests__/fixtures/pinSlotShipping';
import type { DispatchTestNode } from '../../__tests__/fixtures/createDispatchTree';
import { compareWatchExitDeliveries } from './fixtures/compareWatchExitDeliveries';
import type { WatchExitObservation } from './fixtures/compareWatchExitDeliveries';

afterEach(() => vi.restoreAllMocks());
// Internal mark and index-read counts describe one shipping tree, excluding replay.
beforeEach(() => pinSlotShipping());

/**
 * List the paths that received one event bit in one step.
 * @param observation - One step of the candidate history
 * @param bit - Event bit to select
 * @returns Marked paths in call order
 */
const markedPaths = (
  observation: WatchExitObservation,
  bit: FieldNodeEventType,
): string[] =>
  observation.marks.flatMap((entry) =>
    entry !== null &&
    typeof entry === 'object' &&
    Reflect.get(entry, 'bit') === bit &&
    typeof Reflect.get(entry, 'path') === 'string'
      ? [String(Reflect.get(entry, 'path'))]
      : [],
  );

/**
 * List the paths that received the controlled-properties bit in one step.
 * @param observation - One step of the candidate history
 * @returns Marked paths in call order
 */
const watchMarks = (observation: WatchExitObservation): string[] =>
  markedPaths(observation, FieldNodeEventType.UpdateControlledProperties);

/**
 * List the paths that received the path bit in one step, the rekeyed records.
 * @param observation - One step of the candidate history
 * @returns Rekeyed paths, sorted
 */
const movedPaths = (observation: WatchExitObservation): string[] =>
  markedPaths(observation, FieldNodeEventType.UpdatePath).sort();

/**
 * Build N unrelated watchers reading the anchor.
 * @param count - Watcher count
 * @returns Declarations keyed `u0`..`u(count-1)`
 */
const unrelated = (count: number): Record<string, BlueprintSchema> => {
  const properties: Record<string, BlueprintSchema> = {};
  for (let index = 0; index < count; index++)
    properties[`u${index}`] = {
      type: 'number',
      controls: { watch: ['../anchor'] },
    };
  return properties;
};

// filid:contract settle-delivery-watch-exit
describe('L2 (c) EVENT-064 exits look up the watch index', () => {
  it('delivers a sibling exit and its re-entry to the watcher, as the full scan', () => {
    const history = compareWatchExitDeliveries(
      {
        type: 'object',
        properties: {
          flag: { type: 'boolean' },
          anchor: { type: 'number' },
          x: { type: 'number', controls: { active: '../flag' } },
          w: { type: 'number', controls: { watch: ['../x'] } },
          ...unrelated(3),
        },
      },
      { flag: true, anchor: 0, x: 1 },
      [
        { path: '/flag', value: false },
        { path: '/flag', value: true },
        { path: '/x', value: 2 },
        { path: '/flag', value: false },
      ],
    );
    expect(history.map(watchMarks)).toEqual([['/w'], ['/w'], ['/w'], ['/w']]);
  });

  it('delivers a group exit to watchers of its descendant, the group and the root', () => {
    const history = compareWatchExitDeliveries(
      {
        type: 'object',
        properties: {
          flag: { type: 'boolean' },
          anchor: { type: 'number' },
          grp: {
            type: 'object',
            controls: { active: '../flag' },
            properties: { x: { type: 'number' }, y: { type: 'number' } },
          },
          wx: { type: 'number', controls: { watch: ['../grp/x'] } },
          wg: { type: 'number', controls: { watch: ['../grp'] } },
          wr: { type: 'number', controls: { watch: ['/'] } },
          ...unrelated(3),
        },
      },
      { flag: true, anchor: 0, grp: { x: 1, y: 2 } },
      [
        { path: '/flag', value: false },
        { path: '/flag', value: true },
      ],
    );
    for (const step of history)
      expect(watchMarks(step).sort()).toEqual(['/wg', '/wr', '/wx']);
  });

  it('delivers a nested host exit to ancestor and descendant watchers and drops the watcher inside it', () => {
    const history = compareWatchExitDeliveries(
      {
        type: 'object',
        properties: {
          flag: { type: 'boolean' },
          anchor: { type: 'number' },
          outer: {
            type: 'object',
            properties: {
              keep: { type: 'number' },
              inner: {
                type: 'object',
                controls: { active: '../../flag' },
                properties: {
                  leaf: { type: 'number' },
                  iw: {
                    type: 'number',
                    controls: { watch: ['../../../anchor'] },
                  },
                },
              },
            },
          },
          wa: { type: 'number', controls: { watch: ['../outer'] } },
          wd: { type: 'number', controls: { watch: ['../outer/inner/leaf'] } },
          wk: { type: 'number', controls: { watch: ['../outer/keep'] } },
          ...unrelated(2),
        },
      },
      { flag: true, anchor: 0, outer: { keep: 1, inner: { leaf: 2 } } },
      [
        { path: '/flag', value: false },
        { path: '/anchor', value: 1 },
        { path: '/flag', value: true },
      ],
    );
    expect(watchMarks(history[0]).sort()).toEqual(['/wa', '/wd']);
    expect(history[0].watchers).not.toContain('/outer/inner/iw');
    expect(watchMarks(history[1]).sort()).toEqual(['/u0', '/u1']);
    expect(history[2].watchers).toContain('/outer/inner/iw');
  });

  it('delivers an exit beside a changed sibling, whose path alone omits the exited one', () => {
    const history = compareWatchExitDeliveries(
      {
        type: 'object',
        properties: {
          anchor: { type: 'number' },
          grp: {
            type: 'object',
            properties: {
              y: { type: 'number' },
              x: { type: 'number', controls: { active: '../y' } },
            },
          },
          w: { type: 'number', controls: { watch: ['../grp/x'] } },
          ...unrelated(3),
        },
      },
      { anchor: 0, grp: { y: 1, x: 5 } },
      [
        { path: '/grp/y', value: 0 },
        { path: '/grp/y', value: 2 },
      ],
    );
    expect(history.map(watchMarks)).toEqual([['/w'], ['/w']]);
  });

  it('re-reads on exit only the dependent watchers, whether 10 or 1,000 others exist', () => {
    const scene = (count: number) =>
      compareWatchExitDeliveries(
        {
          type: 'object',
          properties: {
            flag: { type: 'boolean' },
            anchor: { type: 'number' },
            g: { type: 'number', controls: { active: '../flag' } },
            wg: { type: 'number', controls: { watch: ['../g'] } },
            ...unrelated(count),
          },
        },
        { flag: true, anchor: 0, g: 1 },
        [{ path: '/flag', value: false }],
      )[0].reread;
    expect(scene(10)).toEqual(['/wg']);
    expect(scene(1_000)).toEqual(['/wg']);
  });

  // The gate reads an array position, so one array verb both closes it and moves the items.
  it.each([
    {
      verb: 'a remove before other items',
      apply: (list: DispatchTestNode) => dispatchRemove(list, 0),
      moved: ['/list/0', '/list/1'],
    },
    {
      verb: 'an insert before other items',
      apply: (list: DispatchTestNode) => dispatchInsert(list, 0, 'z'),
      moved: ['/list/1', '/list/2', '/list/3'],
    },
    {
      verb: 'a clear',
      apply: (list: DispatchTestNode) => dispatchClear(list),
      moved: [],
    },
  ])(
    'delivers a gate exit raised by $verb, as the full scan',
    ({ apply, moved }) => {
      const [step] = compareWatchExitDeliveries(
        {
          type: 'object',
          properties: {
            anchor: { type: 'number' },
            list: { type: 'array', items: { type: 'string' } },
            gated: {
              type: 'string',
              controls: { active: '../list/0 === "a"' },
            },
            wg: { type: 'string', controls: { watch: ['../gated'] } },
            w1: { type: 'string', controls: { watch: ['../list/1'] } },
            wl: { type: 'string', controls: { watch: ['../list'] } },
            wr: { type: 'string', controls: { watch: ['/'] } },
            ...unrelated(3),
          },
        },
        { anchor: 0, list: ['a', 'b', 'c'], gated: 'g' },
        [{ path: '/list', apply }],
      );
      expect(step.emit).not.toHaveProperty('gated');
      expect(movedPaths(step)).toEqual(moved);
      expect(watchMarks(step).sort()).toEqual(['/w1', '/wg', '/wl', '/wr']);
    },
  );

  it('delivers the exit and re-entry of a host holding a watched array beside a rekeyed sibling array', () => {
    const history = compareWatchExitDeliveries(
      {
        type: 'object',
        properties: {
          anchor: { type: 'number' },
          list: { type: 'array', items: { type: 'string' } },
          grp: {
            type: 'object',
            controls: { active: '../list/0 === "a"' },
            properties: {
              inner: { type: 'array', items: { type: 'number' } },
            },
          },
          wi: { type: 'number', controls: { watch: ['../grp/inner/1'] } },
          wh: { type: 'number', controls: { watch: ['../grp'] } },
          w1: { type: 'string', controls: { watch: ['../list/1'] } },
          ...unrelated(3),
        },
      },
      { anchor: 0, list: ['a', 'b', 'c'], grp: { inner: [1, 2, 3] } },
      [
        { path: '/list', apply: (list) => dispatchRemove(list, 0) },
        { path: '/list', apply: (list) => dispatchInsert(list, 0, 'a') },
      ],
    );
    expect(history[0].emit).not.toHaveProperty('grp');
    expect(history[1].emit).toHaveProperty('grp', { inner: [1, 2, 3] });
    expect(history.map(movedPaths)).toEqual([
      ['/list/0', '/list/1'],
      ['/list/1', '/list/2'],
    ]);
    for (const step of history)
      expect(watchMarks(step).sort()).toEqual(['/w1', '/wh', '/wi']);
  });

  it('delivers the exit of a gated field in another outer item while an inner object array is rekeyed', () => {
    const row: BlueprintSchema = {
      type: 'object',
      properties: {
        on: { type: 'boolean' },
        tags: { type: 'array', items: { type: 'string' } },
        note: {
          type: 'string',
          controls: { active: '../../../../1/rows/0/on === true' },
        },
        alt: {
          type: 'string',
          controls: { active: '../../../../1/rows/0/on === false' },
        },
      },
    };
    // The entering sibling `alt` drops the row's own path from the affected set,
    // so only the exit puts the unmoved note's path there.
    const [step] = compareWatchExitDeliveries(
      {
        type: 'object',
        properties: {
          anchor: { type: 'number' },
          groups: {
            type: 'array',
            items: {
              type: 'object',
              properties: { rows: { type: 'array', items: row } },
            },
          },
          wn: {
            type: 'string',
            controls: { watch: ['../groups/0/rows/0/note'] },
          },
          wt: {
            type: 'string',
            controls: { watch: ['../groups/1/rows/1/tags/0'] },
          },
          wrows: { type: 'string', controls: { watch: ['../groups/1/rows'] } },
          wr: { type: 'string', controls: { watch: ['/'] } },
          ...unrelated(3),
        },
      },
      {
        anchor: 0,
        groups: [
          { rows: [{ on: true, tags: ['a0'], note: 'm0' }] },
          {
            rows: [
              { on: true, tags: ['t0'], note: 'n0' },
              { on: false, tags: ['t1'], note: 'n1' },
              { on: true, tags: ['t2'], note: 'n2' },
            ],
          },
        ],
      },
      [{ path: '/groups/1/rows', apply: (rows) => dispatchRemove(rows, 0) }],
    );
    expect(step.emit).toEqual({
      anchor: 0,
      groups: [
        { rows: [{ on: true, tags: ['a0'] }] },
        {
          rows: [
            { on: false, tags: ['t1'] },
            { on: true, tags: ['t2'] },
          ],
        },
      ],
    });
    expect(movedPaths(step)).toEqual(
      expect.arrayContaining(['/groups/1/rows/1', '/groups/1/rows/1/tags/0']),
    );
    expect(movedPaths(step).some((path) => path.startsWith('/groups/0'))).toBe(
      false,
    );
    expect(watchMarks(step).sort()).toEqual(['/wn', '/wr', '/wrows', '/wt']);
  });
});
