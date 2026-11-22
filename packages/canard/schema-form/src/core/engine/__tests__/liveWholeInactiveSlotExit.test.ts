import { expect, it } from 'vitest';

import { FORMS, TARGETS } from './fixtures/liveWholeCases';
import { observeLiveWholeInactiveSlotExit } from './fixtures/observeLiveWholeInactiveSlotExit';

const HELD_INPUTS = ['omitted', 'named'] as const;

it.each(HELD_INPUTS)(
  'retains the source of an inactive slot that is %s',
  (heldInput) => {
    const expected = {
      value: { on: false, src: 's', end: 'closed' },
      retained: {
        '/o/n/m/y': 'latest',
        '/o/z': 'mid',
        '/o/n/m/held': heldInput === 'named' ? 'held1' : 'held0',
      },
      diagnostics: [],
    };
    for (const target of TARGETS)
      for (const form of FORMS)
        expect
          .soft(
            observeLiveWholeInactiveSlotExit(heldInput, target, form),
            `${target} / ${form}`,
          )
          .toEqual(expected);
  },
);
