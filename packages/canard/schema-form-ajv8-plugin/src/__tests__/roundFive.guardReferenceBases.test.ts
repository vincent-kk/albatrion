import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import Ajv2019 from 'ajv/dist/2019';
import Ajv2020 from 'ajv/dist/2020';
import { expect, it } from 'vitest';

import { createValidator as create2019 } from '../2019/index';
import { createValidator as create2020 } from '../2020/index';
import { createValidator } from '../default/index';

it.each([
  { dialect: 'Draft-07', Native: Ajv, createValidator },
  { dialect: 'Draft 2019-09', Native: Ajv2019, createValidator: create2019 },
  { dialect: 'Draft 2020-12', Native: Ajv2020, createValidator: create2020 },
])(
  '$dialect guard bases agree with whole-root validation',
  async ({ Native, createValidator: makeValidator }) => {
    for (const named of [false, true])
      for (const relative of [false, true]) {
        for (const compileFirst of [false, true])
          for (const directGuardCompile of [false, true]) {
            const source = new Native({ allErrors: true, logger: false });
            const oracle = new Native({ allErrors: true, logger: false });
            const id = 'https://guard-base.invalid/folder/root';
            const reference = relative
              ? 'external'
              : 'https://guard-base.invalid/external';
            const key =
              relative && named ? new URL(reference, id).href : reference;
            const external = { $id: key, type: 'string', minLength: 3 };
            for (const native of [source, oracle])
              native.addSchema({ ...external }, key);
            const root: JSONSchema = {
              ...(named ? { $id: id } : {}),
              type: 'object',
              properties: { value: { $ref: reference } },
            };
            const nativeValidate = oracle.compile(
              JSON.parse(JSON.stringify(root)),
            );
            const adapter = makeValidator(source, { directGuardCompile });
            let whole = compileFirst ? adapter.compile(root) : undefined;
            const guard = adapter.compileGuard(root, '/properties/value');
            whole ??= adapter.compile(root);
            const context = JSON.stringify({
              named,
              relative,
              compileFirst,
              directGuardCompile,
            });
            for (const value of ['', 'xx', 'valid']) {
              const expected = nativeValidate({ value });
              expect((await whole({ value })) === null, context).toBe(expected);
              expect(guard(value), context).toBe(expected);
            }
            adapter.release?.(root);
            expect(guard('valid'), context).toBe(true);
          }
      }
  },
);
