import { afterEach, describe, expect, it, vi } from 'vitest';

import { warnDevelopmentIssue } from '@/schema-form/helpers/warning';

import { VirtualizationManager } from '../VirtualizationManager';

vi.mock('@/schema-form/helpers/warning', () => ({
  warnDevelopmentIssue: vi.fn(),
}));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('virtualization creation without IntersectionObserver', () => {
  it('supports server rendering without a disabled warning', () => {
    vi.stubGlobal('window', undefined);
    vi.stubGlobal('IntersectionObserver', undefined);
    expect(VirtualizationManager.create(true)).toBeNull();
    expect(warnDevelopmentIssue).not.toHaveBeenCalled();
  });

  it('warns in a browser and describes the eager fallback', () => {
    vi.stubGlobal('window', {});
    vi.stubGlobal('IntersectionObserver', undefined);
    expect(VirtualizationManager.create(true)).toBeNull();
    expect(warnDevelopmentIssue).toHaveBeenCalledOnce();
    const warning = vi.mocked(warnDevelopmentIssue).mock.calls[0][0];
    expect(warning.message).toContain('browser');
    expect(warning.message).not.toContain('mismatch');
  });

  it('keeps the default-off browser path silent', () => {
    vi.stubGlobal('window', {});
    vi.stubGlobal('IntersectionObserver', undefined);
    expect(VirtualizationManager.create(false)).toBeNull();
    expect(warnDevelopmentIssue).not.toHaveBeenCalled();
  });
});
