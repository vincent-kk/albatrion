import { describe, expectTypeOf, it } from 'vitest';

import type { FormTypeInputProps, InferValueType } from '../../index';

// filid:contract union-input-types
describe('public union input typing', () => {
  it('retains readonly schema literals in the public onChange contract', () => {
    const _schema = { type: ['string', 'number'] } as const;
    type Value = InferValueType<typeof _schema>;
    type Change = FormTypeInputProps<Value>['onChange'];
    expectTypeOf<Value>().toEqualTypeOf<string | number>();
    expectTypeOf<Parameters<Change>[0]>().toEqualTypeOf<
      | string
      | number
      | undefined
      | ((previous: string | number | undefined) => string | number | undefined)
    >();
    const check = (change: Change) => {
      change('text');
      change(1);
      change(undefined);
      change((previous) => previous);
      // @ts-expect-error The authored union excludes boolean values.
      change(true);
      // @ts-expect-error The authored union excludes object values.
      change({});
    };
    expectTypeOf(check).toBeFunction();
  });

  it('retains null when the authored readonly type tuple includes it', () => {
    type Value = InferValueType<{
      readonly type: readonly ['integer', 'null'];
    }>;
    expectTypeOf<Value>().toEqualTypeOf<number | null>();
  });
});
