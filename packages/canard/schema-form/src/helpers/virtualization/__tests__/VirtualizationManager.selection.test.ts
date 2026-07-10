import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { SchemaNode } from '@/schema-form/core';
import { VirtualizationManager } from '@/schema-form/helpers/virtualization';

/**
 * Selection API of VirtualizationManager: the static `create` factory and the
 * self-selecting gate methods (`forBranch` / `forChild` / `estimateHeight`)
 * consumed via optional chaining by the render layer.
 */

class NoopIntersectionObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

describe('VirtualizationManager selection API', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', NoopIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('create returns null when virtualization is disabled', () => {
    expect(VirtualizationManager.create(undefined)).toBeNull();
    expect(VirtualizationManager.create(false)).toBeNull();
  });

  it('create returns null when IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    expect(VirtualizationManager.create(true)).toBeNull();
    expect(VirtualizationManager.create({ threshold: 1 })).toBeNull();
  });

  it('create(true) applies the documented defaults (threshold 30, eagerCount 20, estimateHeight 40)', () => {
    const manager = VirtualizationManager.create(true);
    expect(manager).toBeInstanceOf(VirtualizationManager);
    expect(manager?.forBranch(29)).toBeNull();
    expect(manager?.forBranch(30)).toBe(manager);
    const node = {} as unknown as SchemaNode;
    expect(manager?.forChild(19, node)).toBeNull();
    expect(manager?.forChild(20, node)).toBe(manager);
    expect(manager?.estimateHeight(node)).toBe(40);
  });

  it('create merges partial options over the defaults', () => {
    const manager = VirtualizationManager.create({ threshold: 5 });
    expect(manager?.forBranch(5)).toBe(manager);
    const node = {} as unknown as SchemaNode;
    expect(manager?.forChild(20, node)).toBe(manager);
    expect(manager?.forChild(19, node)).toBeNull();
  });

  it('forChild selects nothing for a node that was already revealed', () => {
    const manager = VirtualizationManager.create({
      threshold: 1,
      eagerCount: 0,
    });
    const node = {} as unknown as SchemaNode;
    expect(manager?.forChild(0, node)).toBe(manager);
    manager?.markRevealed(node);
    expect(manager?.forChild(0, node)).toBeNull();
  });

  it('estimateHeight supports a per-node estimator function', () => {
    const manager = VirtualizationManager.create({
      estimateHeight: (node) => (node.path === '/tall' ? 120 : 32),
    });
    const tall = { path: '/tall' } as unknown as SchemaNode;
    const short = { path: '/short' } as unknown as SchemaNode;
    expect(manager?.estimateHeight(tall)).toBe(120);
    expect(manager?.estimateHeight(short)).toBe(32);
  });
});
