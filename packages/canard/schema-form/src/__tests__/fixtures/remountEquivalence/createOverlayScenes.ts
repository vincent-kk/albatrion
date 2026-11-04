import type { RemountScene } from './types';

/**
 * Place projection readers outside the host whose overlay changes output.
 * @returns Three projection targets and the original same-host control.
 */
export function createOverlayScenes(): RemountScene[] {
  const rows = [
    {
      name: 'empty',
      base: { type: 'string', options: { omitEmpty: false } },
      overlay: { options: { omitEmpty: true } },
      value: '',
      read: "../../source/data === ''",
      gate: "../../../source/data === ''",
    },
    {
      name: 'trailing',
      base: {
        type: 'array',
        items: { type: 'string' },
        options: { omitTrailing: false },
      },
      overlay: { options: { omitTrailing: true } },
      value: ['x', undefined],
      read: '(../../source/data).length === 2',
      gate: '(../../../source/data).length === 2',
    },
    {
      name: 'type',
      base: { type: ['string', 'number'] },
      overlay: { type: 'number' },
      value: '2',
      read: "typeof ../../source/data === 'string'",
      gate: "typeof ../../../source/data === 'string'",
    },
  ];
  const targets: RemountScene[] = rows.map((row) => ({
    id: `gap-overlay-${row.name}`,
    group: 'overlay',
    seed: 443,
    schema: {
      type: 'object',
      properties: {
        source: {
          type: 'object',
          properties: { flag: { type: 'boolean' }, data: row.base },
          allOf: [
            {
              controls: { active: './flag === true' },
              properties: { data: row.overlay },
            },
          ],
        },
        observer: {
          type: 'object',
          properties: {
            state: {
              type: 'string',
              controls: {
                visible: row.read,
                readOnly: row.read,
                disabled: row.read,
              },
            },
            gate: {
              type: 'object',
              properties: {
                leaf: {
                  type: 'string',
                  default: 'G',
                  controls: { active: row.gate },
                },
              },
            },
            watcher: {
              type: 'string',
              controls: { watch: ['../../source/data'] },
            },
          },
        },
      },
    },
    initialValue: {
      source: { flag: false, data: row.value },
      observer: { state: 'S', gate: {}, watcher: 'W' },
    },
    writes: [
      { action: 'setValue', path: '/source/flag', value: true },
      { action: 'setValue', path: '/source/flag', value: false },
    ],
  }));
  targets.push({
    id: 'control-overlay-same-host',
    group: 'overlay',
    seed: 443,
    schema: {
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        cfg: { type: 'string', options: { omitEmpty: false } },
      },
      allOf: [
        {
          controls: { active: './cfg === ""' },
          properties: { p: { type: 'string', default: 'P' } },
        },
        {
          controls: { active: './flag === true' },
          properties: { cfg: { options: { omitEmpty: true } } },
        },
      ],
    },
    initialValue: { flag: false, cfg: '' },
    writes: [
      { action: 'setValue', path: '/flag', value: true },
      { action: 'setValue', path: '/flag', value: false },
    ],
  });
  return targets;
}
