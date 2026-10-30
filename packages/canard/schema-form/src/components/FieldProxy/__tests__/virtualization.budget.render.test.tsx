import { act, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { renderForm } from '@/schema-form/__tests__/renderForm';
import { VirtualizationBackfill } from '@/schema-form/helpers/virtualization';

// filid:contract field-contract
// jsdom injects observer availability; delivery stays idle to inspect synchronous DOM.
describe('structural replacement mount budget', () => {
  beforeEach(() =>
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    ),
  );
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('mounts at most eagerCount real inputs for a 200-item replacement below threshold', async () => {
    const form = await renderForm(
      { type: 'array', items: { type: 'string' } },
      {
        defaultValue: [],
        strictMode: false,
        virtualization: {
          threshold: 500,
          eagerCount: 20,
          backfill: VirtualizationBackfill.None,
        },
      },
    );
    act(() =>
      form
        .node('')
        .setValue(Array.from({ length: 200 }, (_, index) => `v${index}`)),
    );
    expect(form.container.querySelectorAll('input')).toHaveLength(20);
    expect(form.container.querySelectorAll('[data-deferred]')).toHaveLength(
      180,
    );
    expect(form.node('').value).toHaveLength(200);
  });

  it('mounts every replacement input when the manager is null', async () => {
    const form = await renderForm(
      { type: 'array', items: { type: 'string' } },
      { defaultValue: [], strictMode: false, virtualization: false },
    );
    act(() => form.node('').setValue(Array.from({ length: 200 }, () => 'v')));
    expect(form.container.querySelectorAll('input')).toHaveLength(200);
    expect(form.container.querySelector('[data-deferred]')).toBeNull();
  });
});
