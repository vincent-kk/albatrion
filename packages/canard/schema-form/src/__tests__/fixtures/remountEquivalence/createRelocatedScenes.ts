import type { RemountScene } from './types';

/**
 * Separate value-only relocated-gate histories from presence-change controls.
 * @returns Value-only targets, a deep target and two existing controls.
 */
export function createRelocatedScenes(): RemountScene[] {
  const first = {
    type: 'object',
    properties: {
      current: {
        type: 'object',
        properties: {
          value: { type: 'string' },
          primer: {
            type: 'string',
            controls: { active: '../value === "in-progress"' },
          },
          x: {
            type: 'object',
            properties: {
              reader2: {
                type: 'string',
                default: 'R',
                controls: { active: '../../primer === "ready"' },
              },
            },
          },
        },
      },
    },
  };
  return [
    {
      id: 'gap-relocated-primer-value',
      group: 'relocated',
      seed: 443,
      schema: first,
      initialValue: { current: { value: 'in-progress', primer: 'ready' } },
      writes: [
        { action: 'setValue', path: '/current/primer', value: 'no' },
        { action: 'setValue', path: '/current/primer', value: 'ready' },
      ],
    },
    {
      id: 'control-relocated-primer-presence',
      group: 'relocated',
      seed: 443,
      schema: first,
      initialValue: { current: { value: 'off', primer: 'ready' } },
      writes: [
        { action: 'setValue', path: '/current/value', value: 'in-progress' },
        { action: 'setValue', path: '/current/value', value: 'off' },
      ],
    },
    ...[false, true].map(
      (deep): RemountScene => ({
        id: `gap-relocated-cousin-value-${deep ? 'deep' : 'shallow'}`,
        group: 'relocated',
        seed: 443,
        schema: {
          type: 'object',
          properties: {
            mode: { type: 'string' },
            p: deep
              ? {
                  type: 'object',
                  properties: {
                    inner: {
                      type: 'object',
                      properties: {
                        deep: {
                          type: 'object',
                          properties: {
                            child: {
                              type: 'string',
                              controls: { active: '#/later === true' },
                            },
                          },
                        },
                      },
                    },
                  },
                }
              : {
                  type: 'object',
                  properties: {
                    child: {
                      type: 'string',
                      controls: { active: '#/later === true' },
                    },
                  },
                },
          },
          allOf: [
            {
              controls: { active: './mode === "x"' },
              properties: { later: { type: 'boolean' } },
            },
          ],
        },
        initialValue: { mode: 'x', later: true },
        writes: [
          { action: 'setValue', path: '/later', value: false },
          { action: 'setValue', path: '/later', value: true },
        ],
      }),
    ),
  ];
}
