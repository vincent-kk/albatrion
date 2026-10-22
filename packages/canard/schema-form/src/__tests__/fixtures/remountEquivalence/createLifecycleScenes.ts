import type { ObservationMask, RemountScene } from './types';

/**
 * State exact hand-written reload differences for automatic-write targets.
 * @returns Three scenes whose masks predict one target and six value channels.
 */
export function createLifecycleScenes(): RemountScene[] {
  const rows = [
    {
      id: 'derived',
      target: 'target',
      fresh: 2,
      clause: 'CONTROLS-026/SETTLE-046',
      reads: ['/n'],
      schema: {
        type: 'object',
        properties: {
          n: { type: 'number' },
          target: { type: 'number', controls: { derived: '../n * 2' } },
        },
      },
      initial: { n: 1 },
      value: 999,
    },
    {
      id: 'inject',
      target: 'target',
      fresh: 'source',
      clause: 'CONTROLS-027/SETTLE-046',
      reads: ['/source'],
      schema: {
        type: 'object',
        properties: {
          source: {
            type: 'string',
            controls: {
              injectTo: (value: unknown) => ({ '../target': value }),
            },
          },
          target: { type: 'string' },
        },
      },
      initial: { source: 'source' },
      value: 'manual',
    },
    {
      id: 'unset',
      target: 'cleared',
      fresh: undefined,
      clause: 'CONTROLS-028/SETTLE-046',
      reads: ['/on'],
      schema: {
        type: 'object',
        properties: {
          on: { type: 'boolean' },
          cleared: {
            type: 'string',
            controls: { unsetValue: '../on === true' },
          },
        },
      },
      initial: { on: true },
      value: 'manual',
    },
  ];
  return rows.map((row) => {
    const entries: ObservationMask[] = [
      ...['raw', 'value', 'outputValue'].map(
        (channel): ObservationMask => ({
          path: `/nodes/~1${row.target}/${channel}`,
          updated: row.value,
          fresh: row.fresh,
          category: 'lifecycle',
          clause: row.clause,
        }),
      ),
      ...[
        `/nodes//value/${row.target}`,
        `/nodes//outputValue/${row.target}`,
        `/output/${row.target}`,
      ].map(
        (path): ObservationMask => ({
          path,
          updated: row.value,
          fresh: row.fresh,
          freshPresent: row.fresh !== undefined,
          category: 'lifecycle',
          clause: row.clause,
        }),
      ),
    ];
    return {
      id: `lifecycle-${row.id}`,
      seed: 443,
      group: 'lifecycle',
      schema: row.schema,
      initialValue: row.initial,
      writes: [
        { action: 'setValue', path: `/${row.target}`, value: row.value },
      ],
      manualReads: row.reads,
      masks: [{ prefix: 1, entries }],
    };
  });
}
