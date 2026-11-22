import Ajv from 'ajv';
import { expect, it } from 'vitest';

import { createValidator } from '../default/index';

it.each([false, true])(
  'keeps generated form validation code out of the app (fresh adapter: %s)',
  async (freshAdapter) => {
    const instance = new Ajv({ strict: false });
    const countCode = () =>
      Object.values(Reflect.get(instance.scope, '_values')).reduce<number>(
        (count, entries) => count + (entries instanceof Map ? entries.size : 0),
        0,
      );
    const baseline = countCode();
    const shared = createValidator(instance);

    for (let index = 0; index < 65; index++) {
      const adapter = freshAdapter ? createValidator(instance) : shared;
      const root = { type: 'string', minLength: 3 } as const;
      await expect(adapter.compile(root)('abc')).resolves.toBeNull();
      adapter.release?.(root);
    }

    expect(countCode()).toBe(baseline);
  },
);
