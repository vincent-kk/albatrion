import { afterEach, expect, it, vi } from 'vitest';

import { plugin as plugin2020 } from '../../2020/index';
import { plugin } from '../../default/index';

afterEach(() => vi.restoreAllMocks());

/** The conditional schema from schema-form docs/agents/.../validation-ux.md ("Declare required and conditional fields"). */
const receiptSchema = () => ({
  type: 'object',
  properties: { receipt: { type: 'boolean' } },
  allOf: [
    {
      if: { properties: { receipt: { const: true } }, required: ['receipt'] },
      then: {
        properties: { email: { type: 'string', minLength: 3 } },
        required: ['email'],
      },
    },
  ],
});

const strictWarnings = (run: () => void) => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  run();
  return warn.mock.calls
    .map((args) => args.join(' '))
    .filter((text) => text.includes('strict mode'));
};

it('control: whole-schema compile of the documented conditional schema logs no strict-mode warning', () => {
  expect(strictWarnings(() => plugin.validator.compile(receiptSchema()))).toEqual([]);
});

it('the if guard of the documented conditional schema compiles without strict-mode console warnings (default settings)', () => {
  expect(
    strictWarnings(() =>
      plugin.validator.compileGuard(receiptSchema(), '/allOf/0/if')({ receipt: true }),
    ),
  ).toEqual([]);
});

it('a prefixItems tuple field compiles without strict-mode console warnings on the 2020 entry (default settings)', () => {
  expect(
    strictWarnings(() =>
      plugin2020.validator.compile({
        type: 'object',
        properties: {
          pair: { type: 'array', prefixItems: [{ type: 'string' }, { type: 'number' }] },
        },
      }),
    ),
  ).toEqual([]);
});
