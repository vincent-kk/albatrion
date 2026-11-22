import { expect, it } from 'vitest';

import { FORMS, POLICIES, TARGETS } from './fixtures/liveWholeCases';
import { observeLiveWholeFillOrder } from './fixtures/observeLiveWholeFillOrder';

const ORDERS = ['omit then name', 'name then omit'] as const;

it.each(POLICIES)(
  'uses the last write to classify an exit under %s',
  (policy) => {
    for (const order of ORDERS) {
      const y =
        policy === 'default'
          ? order === 'omit then name'
            ? 'latest'
            : 'y0'
          : 'resolved';
      const expected = {
        value: { on: false, src: 's', end: 'closed' },
        retained:
          policy === 'unsetOnInactive'
            ? { '/o/z': 'mid' }
            : { '/o/y': y, '/o/z': 'mid' },
        diagnostics: [],
      };
      for (const target of TARGETS)
        for (const form of FORMS)
          expect
            .soft(
              observeLiveWholeFillOrder(policy, order, target, form),
              `${order} / ${target} / ${form}`,
            )
            .toEqual(expected);
    }
  },
);
