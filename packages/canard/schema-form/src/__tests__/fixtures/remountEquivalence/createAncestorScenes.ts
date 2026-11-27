import type { RemountScene } from './types';

/**
 * Build the hand-enumerated position/depth/chain/reader lattice.
 * @returns Sixteen histories whose ancestor recheck reachability is measured separately.
 */
export function createAncestorScenes(): RemountScene[] {
  const grid = [
    ['sibling', 0, 2, 'active'],
    ['sibling', 0, 2, 'visible'],
    ['sibling', 0, 4, 'active'],
    ['sibling', 0, 4, 'visible'],
    ['sibling', 2, 2, 'active'],
    ['sibling', 2, 2, 'visible'],
    ['sibling', 2, 4, 'active'],
    ['sibling', 2, 4, 'visible'],
    ['cousin', 0, 2, 'active'],
    ['cousin', 0, 2, 'visible'],
    ['cousin', 0, 4, 'active'],
    ['cousin', 0, 4, 'visible'],
    ['cousin', 2, 2, 'active'],
    ['cousin', 2, 2, 'visible'],
    ['cousin', 2, 4, 'active'],
    ['cousin', 2, 4, 'visible'],
  ] as const;
  return grid.map(([position, depth, length, key]) => {
    const reader = {
      type: 'string',
      controls: {
        [key]: `${position === 'sibling' ? '..' : '../../..'}/h/c === 'C'`,
      },
    };
    const body = {
      type: 'object',
      properties: {
        h: {
          type: 'object',
          properties: {
            t: { type: 'string' },
            m: { type: 'string', controls: { active: "../t === 'on'" } },
            ...(length === 4
              ? {
                  n: { type: 'string', controls: { active: "../m === 'M'" } },
                  o: {
                    type: 'string',
                    controls: { active: '../n !== undefined' },
                  },
                }
              : {}),
            c: {
              type: 'string',
              controls: {
                active: length === 2 ? "../m !== 'M'" : '../o === undefined',
              },
            },
          },
        },
        ...(position === 'sibling'
          ? { r: reader }
          : {
              branch: {
                type: 'object',
                properties: {
                  deep: { type: 'object', properties: { r: reader } },
                },
              },
            }),
      },
      oneOf: [
        {
          title: 'ancestor-witness',
          controls: { active: "./h/c === 'C'" },
          properties: { witness: { type: 'string', default: 'W' } },
        },
      ],
    };
    const value = {
      h: {
        t: 'off',
        m: 'M',
        ...(length === 4 ? { n: 'N', o: 'O' } : {}),
        c: 'C',
      },
      ...(position === 'sibling'
        ? { r: 'R' }
        : { branch: { deep: { r: 'R' } } }),
    };
    const base = depth ? '/box/inner' : '';
    return {
      id: `gap-ancestor-${position}-d${depth}-c${length}-${key}`,
      seed: 443,
      group: 'ancestor',
      schema: depth
        ? {
            type: 'object',
            properties: {
              box: { type: 'object', properties: { inner: body } },
            },
          }
        : body,
      initialValue: depth ? { box: { inner: value } } : value,
      writes: ['on', 'off', 'on', 'on'].map((state) => ({
        action: 'setValue' as const,
        path: `${base}/h/t`,
        value: state,
      })),
    };
  });
}
