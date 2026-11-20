import type { JSONSchema, ValidateFunction } from '@canard/schema-form';
import Ajv from 'ajv';
import { afterEach, expect, it, vi } from 'vitest';

import { createValidator } from '../default/index';

const NativeWeakRef = WeakRef;
afterEach(() => vi.unstubAllGlobals());

it('release removes only its own weak slot with bounded work and preserves snapshot functions', async () => {
  let reads = 0;
  class ObservedReference<T extends object> extends NativeWeakRef<T> {
    deref() {
      reads++;
      return super.deref();
    }
  }
  vi.stubGlobal('WeakRef', ObservedReference);
  for (const named of [false, true]) {
    const adapter = createValidator(
      new Ajv({ allErrors: true, logger: false }),
    );
    const roots: JSONSchema[] = [];
    const checks: ValidateFunction[] = [];
    for (let index = 0; index < 512; index++) {
      const root: JSONSchema = {
        ...(named ? { $id: `https://release-work.invalid/${index}` } : {}),
        type: 'string',
        minLength: 2 + (index % 2),
      };
      roots.push(root);
      checks.push(adapter.compile(root));
    }
    for (const index of [0, 256, 511, 0]) {
      reads = 0;
      adapter.release?.(roots[index]);
      expect
        .soft(reads, `named=${named} release index=${index}`)
        .toBeLessThanOrEqual(4);
      expect(await checks[index]('valid')).toBeNull();
      expect(await checks[index]('x')).not.toBeNull();
    }
    for (const root of roots) adapter.release?.(root);
  }
});
