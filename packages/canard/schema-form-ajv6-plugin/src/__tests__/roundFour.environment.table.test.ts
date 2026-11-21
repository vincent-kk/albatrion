import Ajv from 'ajv';
import { afterEach, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

it.each([
  { dialect: 'default', weak: true, finalizer: true },
  { dialect: 'default', weak: false, finalizer: true },
  { dialect: 'default', weak: true, finalizer: false },
  { dialect: 'default', weak: false, finalizer: false },
])(
  'keeps explicit lifetime behavior in $dialect with WeakRef=$weak FinalizationRegistry=$finalizer',
  async ({ weak, finalizer }) => {
    if (!weak) vi.stubGlobal('WeakRef', undefined);
    if (!finalizer) vi.stubGlobal('FinalizationRegistry', undefined);
    vi.resetModules();
    const { createValidator } = await import('../index');
    const instance = new Ajv({ allErrors: true });
    const validator = createValidator(instance);
    const root = {
      $id: 'https://round-four.invalid/lifetime',
      type: 'object',
      properties: { n: { type: 'number' } },
      if: { properties: { n: { minimum: 0 } } },
    } as const;
    const guard = validator.compileGuard!(root, '/if');
    const validate = validator.compile(root);
    const issues = await validate({ n: 'x' });
    const observed = {
      matches: guard({ n: 3 }),
      rejects: guard({ n: -1 }),
      issues: issues?.map(({ keyword }) => keyword),
    };
    validator.release?.(root);
    expect(observed).toEqual({
      matches: true,
      rejects: false,
      issues: ['type'],
    });
    expect(instance.getSchema(root.$id)).toBeUndefined();
  },
);
