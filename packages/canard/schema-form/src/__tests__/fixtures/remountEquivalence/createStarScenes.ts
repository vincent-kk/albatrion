import type { RemountScene } from './types';

/**
 * Exercise literal star owners with value and context presence changes.
 * @returns Literal and prefix controls plus value-only and direct-context readers.
 */
export function createStarScenes(): RemountScene[] {
  const scenes = ['*', '*x'].flatMap((name) =>
    [false, true].flatMap((nested) =>
      [false, true].map((contextual) => {
        const reader = {
          type: 'string',
          controls: {
            visible: `${nested ? '../..' : '..'}/side/x === 'v'`,
            readOnly: `${nested ? '../..' : '..'}/side/x === 'v'`,
            disabled: `${nested ? '../..' : '..'}/side/x === 'v'`,
          },
        };
        return {
          id: `gap-star-${name === '*' ? 'literal' : 'prefix'}-${nested ? 'nested' : 'direct'}-${contextual ? 'context' : 'value'}`,
          group: 'star',
          seed: 443,
          schema: {
            type: 'object',
            properties: {
              ...(contextual ? {} : { on: { type: 'boolean' } }),
              side: {
                type: 'object',
                properties: {
                  x: {
                    type: 'string',
                    controls: {
                      active: contextual
                        ? '(@).on === true'
                        : '../../on === true',
                    },
                  },
                },
              },
              ...(nested
                ? { box: { type: 'object', properties: { [name]: reader } } }
                : { [name]: reader }),
            },
          },
          context: contextual ? { on: true } : {},
          initialValue: {
            ...(contextual ? {} : { on: true }),
            side: { x: 'v' },
            ...(nested ? { box: { [name]: 'R' } } : { [name]: 'R' }),
          },
          writes: contextual
            ? [
                { action: 'context', value: { on: false } },
                { action: 'context', value: { on: true } },
              ]
            : [
                { action: 'setValue', path: '/on', value: false },
                { action: 'setValue', path: '/on', value: true },
              ],
        } satisfies RemountScene;
      }),
    ),
  );
  return [
    ...scenes,
    {
      id: 'gap-star-literal-value-only',
      group: 'star',
      seed: 443,
      schema: {
        type: 'object',
        properties: {
          side: { type: 'object', properties: { x: { type: 'string' } } },
          '*': {
            type: 'string',
            controls: {
              visible: "../side/x === 'v'",
              readOnly: "../side/x === 'v'",
              disabled: "../side/x === 'v'",
            },
          },
        },
      },
      context: {},
      initialValue: { side: { x: 'v' }, '*': 'R' },
      writes: [
        { action: 'setValue', path: '/side/x', value: 'w' },
        { action: 'setValue', path: '/side/x', value: 'v' },
      ],
    },
    {
      id: 'gap-star-literal-direct-context-reader',
      group: 'star',
      seed: 443,
      schema: {
        type: 'object',
        properties: {
          '*': {
            type: 'string',
            controls: {
              visible: '(@).on === true',
              readOnly: '(@).on === true',
              disabled: '(@).on === true',
            },
          },
        },
      },
      context: { on: true },
      initialValue: { '*': 'R' },
      writes: [
        { action: 'context', value: { on: false } },
        { action: 'context', value: { on: true } },
      ],
    },
  ];
}
