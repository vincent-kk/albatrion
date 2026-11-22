import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { destroyScope, styleManagerFactory } from '../../index';

const flush = () => vi.advanceTimersByTime(20);
beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  document.head.innerHTML = '';
});

/**
 * Packaged agent knowledge, unchanged by the round-2 style-utils 1 fix (3fde341db):
 * - SKILL.md:44 "`destroyScope` cannot reach shadow-root managers. It resolves the document-mode key only."
 * - SKILL.md:66 "`destroyScope` left a shadow host's styles behind | Expected; use the per-style cleanups or drop the host"
 * - knowledge/style-manager.md:162 and :168, the cleanup table and "It cannot reach shadow instances".
 * The README (README.md:321) and the code release a shadow scope through destroyScope(id, { shadowRoot }).
 */
it('the packaged knowledge matches the code: destroyScope cannot release a shadow-root scope', () => {
  const shadowRoot = document.createElement('div').attachShadow({ mode: 'open' });
  styleManagerFactory('r3docs', { shadowRoot })('x', '.a { color: red; }');
  flush();
  expect(shadowRoot.querySelectorAll('style').length).toBe(1);

  destroyScope('r3docs', { shadowRoot });

  // What the packaged knowledge tells an agent to expect: the shadow host's styles are left behind.
  expect(shadowRoot.querySelectorAll('style').length).toBe(1);
});
