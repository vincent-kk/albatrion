import type { JSONSchema } from '@canard/schema-form';
import { afterEach, describe, expect, it } from 'vitest';

import { plugin as plugin2019 } from '../2019/index';
import { plugin as plugin2020 } from '../2020/index';
import { plugin } from '../default/index';

describe.each([
  ['default', plugin],
  ['2019', plugin2019],
  ['2020', plugin2020],
] as const)('%s guard pointer compatibility', (_entry, plugin) => {
  afterEach(() => plugin.validator.configure({ directGuardCompile: true }));
  describe.each([true, false])(
    'directGuardCompile=%s',
    (directGuardCompile) => {
      it('uses native fragment handling for encoded separators', () => {
        plugin.validator.configure({ directGuardCompile });
        const root: JSONSchema = {
          properties: { field: { if: { type: 'string' } } },
        };
        const pointer = '#%2Fproperties%2Ffield%2Fif';
        try {
          if (directGuardCompile) {
            const guard = plugin.validator.compileGuard(root, pointer);
            expect(guard('x')).toBe(true);
            expect(guard(1)).toBe(false);
          } else {
            expect(() => plugin.validator.compileGuard(root, pointer)).toThrow(
              /can't resolve reference/,
            );
          }
        } finally {
          plugin.validator.release(root);
        }
      });

      it('requires the JSON Pointer escape for a slash in a property name', () => {
        plugin.validator.configure({ directGuardCompile });
        const root: JSONSchema = {
          properties: { 'a/b': { if: { const: 'selected' } } },
        };
        try {
          expect(() =>
            plugin.validator.compileGuard(root, '#/properties/a%2Fb/if'),
          ).toThrow(
            expect.objectContaining({ name: 'GuardPointerNotSchemaError' }),
          );
          expect(
            plugin.validator.compileGuard(
              root,
              '/properties/a~1b/if',
            )('selected'),
          ).toBe(true);
        } finally {
          plugin.validator.release(root);
        }
      });
    },
  );
});
