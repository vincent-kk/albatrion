import type { RemountScene } from './types';

/**
 * Exercise literal star owners with value and context presence changes.
 * @returns Four star targets and four star-prefix controls with identical writes.
 */
export function createStarScenes(): RemountScene[] {
  return ['*', '*x'].flatMap((name) =>
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
}
