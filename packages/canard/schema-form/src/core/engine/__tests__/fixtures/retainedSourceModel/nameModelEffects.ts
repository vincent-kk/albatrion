import type { Route, Source } from '../retainedSourceModelCases';

/** Express the same named storage effects through the selected product route. */
export const nameModelEffects = (
  route: Route,
  groupWidth: 2 | undefined,
  z: string,
  nextValue: Source,
  held: boolean,
  heldValue: string,
) => {
  const m = { y: nextValue, ...(held ? { held: heldValue } : {}) };
  const whole = { z, n: { m } };
  if (route === 'virtual')
    return { '../group': groupWidth === 2 ? [whole, 'peer'] : [whole] };
  if (route === 'parent')
    return {
      '../o': whole,
      ...(groupWidth === 2 ? { '../peer': 'peer' } : {}),
    };
  return {
    '../o/z': z,
    ...(groupWidth === 2 ? { '../peer': 'peer' } : {}),
    '../o/n/m/y': nextValue,
    ...(held ? { '../o/n/m/held': heldValue } : {}),
  };
};
