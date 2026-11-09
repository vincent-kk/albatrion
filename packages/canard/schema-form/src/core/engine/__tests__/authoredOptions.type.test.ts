import { expectTypeOf, it } from 'vitest';

import type { AuthoredSchema } from '../types/jsonSchema';

it('keeps authored extensions any and reserved options precise', () => {
  expectTypeOf<NonNullable<AuthoredSchema['options']>['custom']>().toBeAny();
  expectTypeOf<NonNullable<AuthoredSchema['options']>['trim']>().toEqualTypeOf<boolean | undefined>();
  expectTypeOf<NonNullable<AuthoredSchema['options']>['propertyOrder']>().toEqualTypeOf<readonly string[] | undefined>();
  expectTypeOf<NonNullable<AuthoredSchema<{ custom: number }>['options']>['custom']>().toEqualTypeOf<number>();
});
