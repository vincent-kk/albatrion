import { afterEach, describe, expect, it, vi } from 'vitest';

import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import { FieldNodeEventType } from '@/schema-form/core/engine/record';

import { compareWatchExitDeliveries } from './fixtures/compareWatchExitDeliveries';
import type { WatchExitObservation } from './fixtures/compareWatchExitDeliveries';

afterEach(() => vi.restoreAllMocks());

/**
 * List the paths that received the controlled-properties bit in one step.
 * @param observation - One step of the candidate history
 * @returns Marked paths in call order
 */
const watchMarks = (observation: WatchExitObservation): string[] =>
  observation.marks.flatMap((entry) =>
    entry !== null &&
    typeof entry === 'object' &&
    Reflect.get(entry, 'bit') ===
      FieldNodeEventType.UpdateControlledProperties &&
    typeof Reflect.get(entry, 'path') === 'string'
      ? [String(Reflect.get(entry, 'path'))]
      : [],
  );

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
});
