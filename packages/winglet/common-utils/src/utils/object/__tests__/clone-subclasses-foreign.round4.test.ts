import { describe, it } from 'vitest';
import { checkBuiltinSubclass } from './helpers/checkBuiltinSubclass';

describe('round-4 foreign built-in subclass equivalence', () => {
  for (const kind of ['Map', 'Set', 'Date', 'RegExp', 'Array'])
    for (const ownField of [false, true])
      for (const override of [false, true])
        it(`${kind} ownField=${ownField} override=${override}`, () => {
          checkBuiltinSubclass(kind, ownField, override, true);
        });
});
