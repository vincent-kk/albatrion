import { describe, expect, it } from 'vitest';

import { makeSchemaNodeTree } from '../makeSchemaNodeTree';

const branchSchema = (keyword: 'oneOf' | 'anyOf', withElse: boolean) => ({
  type: 'object',
  properties: { kind: { type: 'string' } },
  [keyword]: ['a', 'b'].map((kind) => ({
    if: { properties: { kind: { const: kind } }, required: ['kind'] },
    then: { properties: { [kind]: { type: 'string', default: kind.toUpperCase() } },
      required: [kind] },
    ...(withElse ? { else: false } : {}),
  })),
});

// filid:contract factory-single-path
describe('round9 P3 notification and validation ports', () => {
  for (const keyword of ['oneOf', 'anyOf'] as const) {
    for (const withElse of [true, false]) {
      it(`r9.mjs:76 ${keyword} else ${withElse} reports the branch warnings`, () => {
        const codes: string[] = [];
        const { root } = makeSchemaNodeTree(branchSchema(keyword, withElse), {
          errorReporter: { hasConsumer: () => true,
            report: (record) => { codes.push(record.code); } },
        });
        root.setValue({ kind: 'a' });
        expect(codes.filter((code) => code.includes('IF_WITHOUT_ELSE_FALSE')))
          .toHaveLength(withElse ? 0 : 2);
      });

      it(`r9.mjs:80 ${keyword} else ${withElse} validates the authored schema`, async () => {
        const { root } = makeSchemaNodeTree(branchSchema(keyword, withElse));
        const results: boolean[] = [];
        for (const value of [{ kind: 'a', a: 'A' }, { kind: 'a' }, { kind: 'z' }]) {
          root.setValue(value);
          results.push((await root.validate()).length === 0);
        }
        expect(results).toEqual(withElse ? [true, false, false]
          : keyword === 'oneOf' ? [false, true, false] : [true, true, true]);
      });
    }
  }
});
