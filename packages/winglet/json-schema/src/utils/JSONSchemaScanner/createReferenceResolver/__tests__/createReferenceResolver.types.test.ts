import { expectTypeOf, it } from 'vitest';

import { createReferenceResolver } from '../createReferenceResolver';
import { createReferenceResolverAsync } from '../utils/createReferenceResolverAsync';

it('keeps built-in resource contexts opaque in the public protocol', () => {
  expectTypeOf(createReferenceResolver({}).root({})).toEqualTypeOf<unknown>();
  expectTypeOf(
    createReferenceResolverAsync({}).root({}),
  ).toEqualTypeOf<unknown>();
});
