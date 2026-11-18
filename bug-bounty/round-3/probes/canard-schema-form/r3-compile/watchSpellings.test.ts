import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '../../__tests__/fixtures/nodeFromJSONSchema';

const tree = (jsonSchema: any, defaultValue?: any) =>
  nodeFromJSONSchema({ jsonSchema, defaultValue } as any) as any;

const spellings = ['/top', '#/top', '../../top', '../.././../top', './../../top', '../../g/../top'];

describe('EQ8 watch path spellings of one address', () => {
  it('every spelling follows the same writes', () => {
    const results: Record<string, unknown> = {};
    for (const spelling of spellings) {
      const root = tree(
        {
          type: 'object',
          properties: {
            top: { type: 'string', default: 't0' },
            g: {
              type: 'object',
              properties: {
                w: { type: 'string', controls: { watch: [spelling] } },
                d: { type: 'string', controls: { derived: `(${spelling}) + "!"` } },
              },
            },
          },
        },
        {},
      );
      const seen: unknown[] = [[root.find('/g/w').watchValues[0], root.value.g.d]];
      root.find('/top').setValue('t1');
      seen.push([root.find('/g/w').watchValues[0], root.value.g.d]);
      root.setValue({ top: 't2' }, 2);
      seen.push([root.find('/g/w').watchValues[0], root.value.g.d]);
      results[spelling] = seen;
    }
    const expected = [
      ['t0', 't0!'],
      ['t1', 't1!'],
      ['t2', 't2!'],
    ];
    expect(results).toEqual(Object.fromEntries(spellings.map((s) => [s, expected])));
  });
});
