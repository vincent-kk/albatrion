import { expectTypeOf, it } from 'vitest';

import { type OrphanScan, resolveDestinations } from '../index.js';

it('keeps recorded-file scans internal to planning', () => {
  expectTypeOf<OrphanScan['kind']>().toEqualTypeOf<'directory' | 'block-file'>();
  expectTypeOf<ReturnType<typeof resolveDestinations>['orphanScans'][number]>()
    .toEqualTypeOf<OrphanScan>();
  expectTypeOf<Parameters<typeof resolveDestinations>[0]>()
    .not.toHaveProperty('previous');
});
