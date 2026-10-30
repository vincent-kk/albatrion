import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { FieldNode } from '@/schema-form/core';

import { VirtualizationManager } from '../VirtualizationManager';

// filid:contract virtualization-manager-contract
describe('per-task eager mount budget', () => {
  beforeEach(() => vi.stubGlobal('IntersectionObserver', class {}));
  afterEach(() => vi.unstubAllGlobals());

  it('shares the eager budget across branches even at leading child indexes', () => {
    const manager = VirtualizationManager.create({ eagerCount: 2 })!;
    expect(manager.forChild(0, {} as FieldNode)).toBeNull();
    expect(manager.forChild(0, {} as FieldNode)).toBeNull();
    expect(manager.forChild(0, {} as FieldNode)).toBe(manager);
  });

  it('resets the budget at the microtask boundary', async () => {
    const manager = VirtualizationManager.create({ eagerCount: 1 })!;
    expect(manager.forChild(0, {} as FieldNode)).toBeNull();
    expect(manager.forChild(0, {} as FieldNode)).toBe(manager);
    await Promise.resolve();
    expect(manager.forChild(0, {} as FieldNode)).toBeNull();
    expect(manager.forChild(0, {} as FieldNode)).toBe(manager);
  });

  it('keeps revealed nodes eager after exhausting the budget', () => {
    const manager = VirtualizationManager.create({ eagerCount: 1 })!;
    const revealed = {} as FieldNode;
    manager.markRevealed(revealed);
    manager.forChild(0, {} as FieldNode);
    expect(manager.forChild(20, revealed)).toBeNull();
  });

  it('has no gate when disabled or IntersectionObserver is unavailable', () => {
    expect(
      VirtualizationManager.create(false)?.forChild(100, {} as FieldNode) ??
        null,
    ).toBeNull();
    vi.stubGlobal('IntersectionObserver', undefined);
    expect(
      VirtualizationManager.create(true)?.forChild(100, {} as FieldNode) ??
        null,
    ).toBeNull();
  });
});
