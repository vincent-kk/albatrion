import { expect, it } from 'vitest';
import { compressCss } from '../../index';
import { afterEach, vi } from 'vitest';
import { createStyleHarness } from '../../__tests__/helpers/createStyleHarness';

afterEach(() => vi.unstubAllGlobals());

it('Q1 preserves empty style-query values nested inside conditional declaration values', () => {
  const css = '.a{color:if(style(--theme: ):red;else:blue)}';
  expect(compressCss(css)).toContain('style(--theme: )');
});

it('Q2 preserves empty supports-query values after an opening nested function', () => {
  const css = '@supports (color: if(style(--theme: ):red;else:blue)){.a{color:red}}';
  expect(compressCss(css)).toContain('style(--theme: )');
});

it('Q3 direct and variable-backed conditional values retain the same empty style query', () => {
  expect(compressCss('.a{--choice:if(style(--theme: ):red;else:blue);color:var(--choice)}')).toContain('style(--theme: )');
  expect(compressCss('.a{color:if(style(--theme: ):red;else:blue)}')).toContain('style(--theme: )');
});

it.each([false, true])('Q4 injected conditional queries preserve their empty value: shadow=%s', shadow => {
  const harness = createStyleHarness(shadow, 'r6query');
  try {
    harness.add('color', '.a{color:if(style(--theme: ):red;else:blue)}');
    expect(harness.flush()).toContain('style(--theme: )');
  } finally { harness.destroy(); }
});
