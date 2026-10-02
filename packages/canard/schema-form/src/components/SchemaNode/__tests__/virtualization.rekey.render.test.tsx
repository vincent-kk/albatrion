import { act, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { VirtualizationBackfill } from '@/schema-form';
import { renderForm } from '@/schema-form/__tests__/renderForm';

// filid:contract schema-node-contract
// Browser observer delivery is injected through jsdom's global API.
describe('LANDING-087 reveal identity across array reindexing', () => {
  let deliver: IntersectionObserverCallback;

  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback: IntersectionObserverCallback) { deliver = callback; }
      observe() {}
      unobserve() {}
      disconnect() {}
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('keeps the revealed field mounted after a real earlier-row removal', async () => {
    const form = await renderForm({
      type: 'object',
      properties: { items: { type: 'array', items: { type: 'string' } } },
    }, {
      virtualization: {
        threshold: 10, eagerCount: 3, backfill: VirtualizationBackfill.None,
      },
      defaultValue: { items: Array.from({ length: 12 }, (_, index) => `v${index}`) },
    });
    const revealedNode = form.node('/items/11');
    const placeholder = form.container.querySelector(
      '[data-path="/items/11"][data-deferred]',
    );
    expect(placeholder).not.toBeNull();
    await act(async () => {
      deliver([{ target: placeholder!, isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver);
    });
    const revealedInput = form.container.querySelector('input[id="/items/11"]');
    expect(revealedInput).not.toBeNull();
    expect(form.value('/items/11')).toBe('v11');

    await form.removeItem('/items', 0);

    expect(form.node('/items/10')).toBe(revealedNode);
    expect(form.deferred('/items/10')).toBe(false);
    expect(form.exists('/items/10')).toBe(true);
    expect(form.value('/items/10')).toBe('v11');
    expect(form.container.querySelector('input[id="/items/10"]')).toBe(revealedInput);
    expect(form.container.querySelectorAll('[data-path="/items/10"]')).toHaveLength(1);
    expect(form.container.querySelector('[data-path="/items/11"]')).toBeNull();
    expect(form.deferred('/items/9')).toBe(true);
    expect(form.caughtErrors()).toEqual([]);
  });
});
