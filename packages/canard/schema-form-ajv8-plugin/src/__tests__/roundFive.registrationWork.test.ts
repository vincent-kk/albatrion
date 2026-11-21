import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { afterEach, expect, it, vi } from 'vitest';

import { createValidator, createValidatorFactory } from '../default/index';

const NativeWeakRef = WeakRef;
afterEach(() => vi.unstubAllGlobals());

it('one registration never scans all retained forms, for factories and adapters with or without ids', () => {
  let reads = 0;
  class ObservedReference<T extends object> extends NativeWeakRef<T> {
    deref() {
      reads++;
      return super.deref();
    }
  }
  vi.stubGlobal('WeakRef', ObservedReference);
  for (const factory of [false, true])
    for (const named of [false, true]) {
      const source = new Ajv({ allErrors: true, logger: false });
      const adapter = createValidator(source);
      const compile = factory
        ? createValidatorFactory(source)
        : adapter.compile;
      const roots: JSONSchema[] = [];
      for (let index = 0; index < 512; index++) {
        const root: JSONSchema = {
          ...(named
            ? { $id: `https://registration-work.invalid/${index}` }
            : {}),
          type: 'string',
        };
        roots.push(root);
        compile(root);
      }
      reads = 0;
      const root: JSONSchema = { type: 'number' };
      roots.push(root);
      compile(root);
      expect
        .soft(reads, `factory=${factory} named=${named}`)
        .toBeLessThanOrEqual(4);
      expect(roots).toHaveLength(513);
      for (const retained of roots) adapter.release?.(retained);
    }
});
