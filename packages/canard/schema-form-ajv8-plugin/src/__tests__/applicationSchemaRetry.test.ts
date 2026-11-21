import Ajv from 'ajv';
import Ajv2019 from 'ajv/dist/2019';
import Ajv2020 from 'ajv/dist/2020';
import { describe, expect, it } from 'vitest';

import { createValidator as create2019Validator } from '../2019/index';
import { createValidator as create2020Validator } from '../2020/index';
import { createValidator } from '../default/index';

describe.each([
  [
    'draft-07',
    () => new Ajv({ allErrors: true, strict: false }),
    createValidator,
  ],
  [
    '2019-09',
    () => new Ajv2019({ allErrors: true, strict: false }),
    create2019Validator,
  ],
  [
    '2020-12',
    () => new Ajv2020({ allErrors: true, strict: false }),
    create2020Validator,
  ],
] as const)('%s', (_dialect, instance, adapterFor) => {
  it.each([
    [false, false],
    [false, true],
    [true, false],
    [true, true],
  ] as const)(
    'retries the same root after missing registration (DETAIL, root id=%s, guard first=%s)',
    async (withId, guardFirst) => {
      const ajv = instance();
      const adapter = adapterFor(ajv, { directGuardCompile: false });
      const id = 'https://app.invalid/late-8.json';
      const dependency = { $ref: id };
      const root = {
        ...(withId
          ? { $id: `https://form.invalid/late-${guardFirst}-8.json` }
          : {}),
        type: 'object',
        properties: { a: dependency, kind: { type: 'string' } },
        if: { properties: { a: dependency }, required: ['a'] },
        then: { required: ['kind'] },
      } satisfies Parameters<typeof adapter.compile>[0];
      const compileGuard = () => adapter.compileGuard(root, '/if');
      const compile = () => adapter.compile(root);
      expect(guardFirst ? compileGuard : compile).toThrow();
      ajv.addSchema({ $id: id, type: 'string', minLength: 2 });
      const guard = guardFirst ? compileGuard() : undefined;
      expect(await compile()({ a: 'x' })).toMatchObject([
        { keyword: 'minLength', dataPath: '/a' },
      ]);
      expect((guard ?? compileGuard())({ a: 'xyz' })).toBe(true);
    },
  );
});
