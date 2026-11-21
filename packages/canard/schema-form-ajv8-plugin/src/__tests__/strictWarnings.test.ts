import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import Ajv2019 from 'ajv/dist/2019.js';
import Ajv2020 from 'ajv/dist/2020.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { plugin as plugin2019 } from '../2019/index';
import { plugin as plugin2020 } from '../2020/index';
import { plugin } from '../default/index';

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});
describe.each([
  ['default', plugin, Ajv],
  ['2019', plugin2019, Ajv2019],
  ['2020', plugin2020, Ajv2020],
] as const)(
  '%s default strict options (round-2 ajv8-plugin 2)',
  (_entry, entry, Constructor) => {
    it('compiles a context-free condition without strict warnings', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const schema: JSONSchema = {
        type: 'object',
        if: { properties: { receipt: { const: true } }, required: ['receipt'] },
      };
      try {
        expect(
          entry.validator.compileGuard(schema, '/if')({ receipt: true }),
        ).toBe(true);
        expect(warn.mock.calls).toEqual([]);
      } finally {
        entry.validator.release(schema);
      }
    });
    it('preserves a consumer strictTypes option', () => {
      const validator =
        _entry === 'default'
          ? plugin.validator
          : _entry === '2019'
            ? plugin2019.validator
            : plugin2020.validator;
      validator.bind(new Constructor({ strict: false, strictTypes: true }));
      const schema: JSONSchema = {
        if: { properties: { receipt: { const: true } } },
      };
      try {
        expect(() => validator.compileGuard(schema, '/if')).toThrow(
          /strict mode/,
        );
      } finally {
        validator.release(schema);
      }
    });
  },
);
it('compiles an open 2020 tuple without strict warnings (round-2 ajv8-plugin 2)', async () => {
  vi.resetModules();
  const { plugin: fresh } = await import('../2020/index');
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const schema: JSONSchema = {
    type: 'array',
    prefixItems: [{ type: 'string' }, { type: 'number' }],
  };
  try {
    fresh.validator.compile(schema);
    expect(warn.mock.calls).toEqual([]);
  } finally {
    fresh.validator.release(schema);
  }
});
