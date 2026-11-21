import { expect, it } from 'vitest';

import { FORMS, TARGETS } from './fixtures/liveWholeCases';
import { observeLiveWholeNestedFillExit } from './fixtures/observeLiveWholeNestedFillExit';

const SHAPES = [
  'object',
  'array parent',
  'array descendant',
  'inactive slot',
] as const;

it.each(SHAPES)('keeps a named grandchild under a filled %s', (shape) => {
  const expected = {
    value: { on: false, src: 's', end: 'closed' },
    retained:
      shape === 'array parent'
        ? { '/o': [{ z: 'mid', n: { m: { y: 'latest' } } }] }
        : {
            '/o/n/m/y': shape === 'array descendant' ? ['latest'] : 'latest',
            '/o/z': 'mid',
            ...(shape === 'inactive slot' ? { '/o/n/m/held': 'held0' } : {}),
          },
    diagnostics: [],
  };
  for (const target of TARGETS)
    for (const form of FORMS)
      expect
        .soft(
          observeLiveWholeNestedFillExit(shape, target, form),
          `${target} / ${form}`,
        )
        .toEqual(expected);
});
