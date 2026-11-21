import { expect, it } from 'vitest';

import { FORMS, POLICIES, TARGETS } from './fixtures/liveWholeCases';
import { observeLiveWholeWriteExit } from './fixtures/observeLiveWholeWriteExit';

it.each(POLICIES)(
  'keeps named live values through an exit with %s policy',
  (policy) => {
    for (const scenario of ['single rule', 'repeat exit', 'caller'] as const) {
      const merged = observeLiveWholeWriteExit(
        scenario,
        'own path',
        policy,
        'Merge',
      );
      const value =
        policy === 'default' || scenario === 'caller' ? 'latest' : 'resolved';
      expect(merged.retained, scenario).toEqual(
        policy === 'unsetOnInactive' ? [] : [{ path: '/o/y', value }],
      );
      expect(merged.diagnostics).toEqual([]);
      for (const target of TARGETS)
        for (const form of FORMS)
          expect
            .soft(
              observeLiveWholeWriteExit(scenario, target, policy, form),
              `${scenario} / ${target} / ${form}`,
            )
            .toEqual(merged);
    }
  },
);

it.each([
  'omitted sibling',
  'nested object',
  'array parent',
  'schema default',
  'lower rank',
  'appearance fill',
] as const)('keeps path and settlement parity for %s', (scenario) => {
  const merged = observeLiveWholeWriteExit(
    scenario,
    'own path',
    'default',
    'Merge',
  );
  const path =
    scenario === 'nested object'
      ? '/o/n/m/y'
      : scenario === 'array parent'
        ? '/o'
        : '/o/y';
  expect(merged.retained).toEqual([
    {
      path,
      value:
        scenario === 'array parent'
          ? ['latest']
          : scenario === 'lower rank'
            ? 'lower'
            : 'latest',
    },
    ...(scenario === 'omitted sibling' ? [{ path: '/o/z', value: 'z0' }] : []),
  ]);
  expect(merged.diagnostics).toEqual([]);
  for (const target of TARGETS)
    for (const form of FORMS)
      expect
        .soft(
          observeLiveWholeWriteExit(scenario, target, 'default', form),
          `${target} / ${form}`,
        )
        .toEqual(merged);
});
