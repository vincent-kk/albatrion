import type { PropsWithChildren, ReactPortal } from 'react';

import { expectTypeOf, it } from 'vitest';

import { Portal } from '../index';

it('round-2 react-utils 1: exposes the portal-or-null call result', () => {
  expectTypeOf<ReturnType<typeof Portal>>().toEqualTypeOf<ReactPortal | null>();
  expectTypeOf<ReturnType<typeof Portal>>().not.toExtend<null>();
  expectTypeOf<typeof Portal>().parameter(0).toEqualTypeOf<PropsWithChildren>();
});
