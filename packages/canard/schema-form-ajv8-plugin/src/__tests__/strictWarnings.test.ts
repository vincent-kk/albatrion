import Ajv from 'ajv';
import { expect, it, vi } from 'vitest';

import { plugin as plugin2019 } from '../2019/index';
import { plugin as plugin2020 } from '../2020/index';
import { createValidator, plugin } from '../default/index';

it.each([
  ['Draft-07', plugin],
  ['Draft 2019-09', plugin2019],
  ['Draft 2020-12', plugin2020],
] as const)(
  'compiles a conditional requirement quietly by default for %s',
  (_dialect, entry) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const guard = entry.validator.compileGuard(
        { if: { required: ['name'] } },
        '/if',
      );
      expect(guard({})).toBe(false);
      expect(warn).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();
    }
  },
);

it('compiles an open Draft 2020 tuple without a strict warning', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  try {
    const validate = plugin2020.validator.compile({
      type: 'array',
      prefixItems: [{ type: 'number' }],
    });
    await expect(validate([1])).resolves.toBeNull();
    expect(warn).not.toHaveBeenCalled();
  } finally {
    warn.mockRestore();
  }
});

it('preserves strictTypes on an application instance', () => {
  const validator = createValidator(
    new Ajv({ strict: false, strictTypes: true }),
  );
  expect(() =>
    validator.compileGuard({ if: { required: ['name'] } }, '/if'),
  ).toThrow(/strict mode: missing type/);
});
