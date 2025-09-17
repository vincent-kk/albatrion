import { describe, expect, it } from 'vitest';

import type { SchemaNode } from '@/schema-form/core/nodes/type';

import { detectsCandidate } from '../detectsCandidate';

describe('detectsCandidate', () => {
  // Helper function to create a mock SchemaNode
  const createMockNode = (
    options: {
      variant?: number;
      parentNode?: SchemaNode;
    } = {},
  ): SchemaNode => {
    return {
      variant: options.variant,
      parentNode: options.parentNode,
      // Other required properties for SchemaNode (minimal mock)
      escapedName: 'mock',
      group: 'terminal',
      rootNode: undefined,
      subnodes: undefined,
    } as any;
  };

  // Helper function to create a mock parent node with oneOfIndex
  const createMockParent = (oneOfIndex?: number): SchemaNode => {
    return {
      oneOfIndex: oneOfIndex,
      variant: undefined,
      parentNode: undefined,
      escapedName: 'parent',
      group: 'branch',
      rootNode: undefined,
      subnodes: undefined,
    } as any;
  };

  describe('when target node has undefined variant', () => {
    it('should return true (valid candidate)', () => {
      const source = createMockNode({ variant: 0 });
      const target = createMockNode({ variant: undefined });

      const result = detectsCandidate(source, target);

      expect(result).toBe(true);
    });

    it('should return true even when source has variant', () => {
      const parentNode = createMockParent();
      const source = createMockNode({ variant: 1, parentNode });
      const target = createMockNode({ variant: undefined, parentNode });

      const result = detectsCandidate(source, target);

      expect(result).toBe(true);
    });
  });

  describe('when target variant matches parent oneOfIndex', () => {
    it('should return true (valid candidate) when variants match parent oneOfIndex', () => {
      const parentNode = createMockParent(0);
      const source = createMockNode({ variant: 0, parentNode });
      const target = createMockNode({ variant: 0, parentNode });

      const result = detectsCandidate(source, target);

      expect(result).toBe(true);
    });

    it('should return true when target variant is 1 and parent oneOfIndex is 1', () => {
      const parentNode = createMockParent(1);
      const source = createMockNode({ variant: 1, parentNode });
      const target = createMockNode({ variant: 1, parentNode });

      const result = detectsCandidate(source, target);

      expect(result).toBe(true);
    });
  });

  describe('when target variant differs from parent oneOfIndex', () => {
    describe('and source and target are in same variant with same parent', () => {
      it('should return true (valid candidate)', () => {
        const parentNode = createMockParent(1); // oneOfIndex different from variant
        const source = createMockNode({ variant: 0, parentNode });
        const target = createMockNode({ variant: 0, parentNode });

        const result = detectsCandidate(source, target);

        // target.variant (0) !== undefined ✓ (false)
        // target.variant (0) === target.parentNode?.oneOfIndex (1) ✗ (false)
        // source.variant (0) === target.variant (0) && source.parentNode === target.parentNode
        // -> true && true = true ✓
        // Result: false || false || true = true
        expect(result).toBe(true);
      });
    });

    describe('and source and target are in different variants', () => {
      it('should return false (invalid candidate) when variants differ', () => {
        const parentNode = createMockParent(0);
        const source = createMockNode({ variant: 0, parentNode });
        const target = createMockNode({ variant: 1, parentNode });

        const result = detectsCandidate(source, target);

        expect(result).toBe(false);
      });

      it('should return false when source variant is 1 and target variant is 2', () => {
        const parentNode = createMockParent(0);
        const source = createMockNode({ variant: 1, parentNode });
        const target = createMockNode({ variant: 2, parentNode });

        const result = detectsCandidate(source, target);

        expect(result).toBe(false);
      });
    });

    describe('and source and target have different parents', () => {
      it('should return false (invalid candidate) when parents differ', () => {
        const sourceParent = createMockParent(1);
        const targetParent = createMockParent(1);

        const source = createMockNode({ variant: 0, parentNode: sourceParent });
        const target = createMockNode({ variant: 0, parentNode: targetParent });

        const result = detectsCandidate(source, target);

        expect(result).toBe(false);
      });

      it('should return false even when variants are the same but parents differ', () => {
        const sourceParent = createMockParent(0);
        const targetParent = createMockParent(0);

        const source = createMockNode({ variant: 1, parentNode: sourceParent });
        const target = createMockNode({ variant: 1, parentNode: targetParent });

        const result = detectsCandidate(source, target);

        expect(result).toBe(false);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle target with no parent node', () => {
      const source = createMockNode({ variant: 0 });
      const target = createMockNode({
        variant: 1,
        parentNode: undefined,
      });

      const result = detectsCandidate(source, target);

      // Since target.parentNode is null, target.parentNode?.oneOfIndex is undefined
      // target.variant (1) !== undefined, so first condition is false
      // target.variant (1) !== undefined, so second condition is false
      // Different variants (0 vs 1) makes the last condition false
      expect(result).toBe(false);
    });

    it('should handle source with no parent node', () => {
      const targetParent = createMockParent(0);
      const source = createMockNode({ variant: 0, parentNode: undefined });
      const target = createMockNode({ variant: 1, parentNode: targetParent });

      const result = detectsCandidate(source, target);

      // target.variant (1) !== target.parentNode?.oneOfIndex (0), so second condition is false
      // Different variants (0 vs 1) makes the last condition false
      expect(result).toBe(false);
    });

    it('should handle both nodes with no parent', () => {
      const source = createMockNode({ variant: 0, parentNode: undefined });
      const target = createMockNode({
        variant: 1,
        parentNode: undefined,
      });

      const result = detectsCandidate(source, target);

      // target.variant (1) !== undefined (target.parentNode?.oneOfIndex), so second condition is false
      // Different variants and different parents (both null) makes the last condition false
      expect(result).toBe(false);
    });

    it('should handle variant 0 correctly', () => {
      const parentNode = createMockParent(1);
      const source = createMockNode({ variant: 0, parentNode });
      const target = createMockNode({ variant: 0, parentNode });

      const result = detectsCandidate(source, target);

      // target.variant (0) !== target.parentNode?.oneOfIndex (1), so second condition is false
      // Same variants and same parent makes the last condition true
      expect(result).toBe(true);
    });

    it('should handle undefined oneOfIndex on parent', () => {
      const parentNode = createMockParent(undefined);
      const source = createMockNode({ variant: 0, parentNode });
      const target = createMockNode({ variant: 1, parentNode });

      const result = detectsCandidate(source, target);

      // target.variant (1) !== undefined (target.parentNode?.oneOfIndex), so second condition is false
      // Different variants makes the last condition false
      expect(result).toBe(false);
    });
  });

  describe('complex scenarios - oneOf branch isolation', () => {
    it('should not detect candidate when target is from different oneOf branch that is not currently active', () => {
      // Simulating a oneOf scenario with 3 branches
      const parentNode = createMockParent(0); // Currently active branch is 0

      // Source is in branch 0 (currently active)
      const source = createMockNode({ variant: 0, parentNode });

      // Target is in branch 1, but parent's current oneOfIndex is 0
      const target = createMockNode({ variant: 1, parentNode });

      const result = detectsCandidate(source, target);

      // Should not be a valid candidate because:
      // 1. target.variant (1) is defined (first condition false)
      // 2. target.variant (1) !== target.parentNode?.oneOfIndex (0) (second condition false)
      // 3. source.variant (0) !== target.variant (1) - different variants (third condition false)
      expect(result).toBe(false);
    });

    it('should detect candidate when navigating within the same active oneOf branch', () => {
      const parentNode = createMockParent(0); // Currently active branch is 0

      // Both source and target are in the currently active branch (0)
      const source = createMockNode({ variant: 0, parentNode });
      const target = createMockNode({ variant: 0, parentNode });

      const result = detectsCandidate(source, target);

      // Should be a valid candidate because target.variant matches parent's oneOfIndex
      expect(result).toBe(true);
    });

    it('should handle switching between oneOf branches', () => {
      const parentNode = createMockParent(1); // Currently active branch is 1

      // Source is in branch 1
      const source = createMockNode({ variant: 1, parentNode });

      // Target is in branch 0, and parent's oneOfIndex is now 1
      const target = createMockNode({ variant: 0, parentNode });

      const result = detectsCandidate(source, target);

      // Should not be a valid candidate because:
      // 1. target.variant (0) is defined (first condition false)
      // 2. target.variant (0) !== target.parentNode?.oneOfIndex (1) (second condition false)
      // 3. source.variant (1) !== target.variant (0) - different variants (third condition false)
      expect(result).toBe(false);
    });
  });
});
