import { beforeEach, describe, expect, it } from 'vitest';

import type { SchemaNode } from '@/schema-form/core';

import { findNodes } from '../findNode';

describe('findAllNodes', () => {
  let mockRootNode: any;
  let mockChildNode1: any;
  let mockChildNode2: any;
  let mockGrandchildNode: any;

  beforeEach(() => {
    mockGrandchildNode = {
      escapedName: 'grandchild',
      group: 'terminal',
      parentNode: null,
      rootNode: null,
      subnodes: null,
    };

    mockChildNode1 = {
      escapedName: 'child1',
      group: 'branch',
      parentNode: null,
      rootNode: null,
      subnodes: [{ node: mockGrandchildNode }],
    };

    mockChildNode2 = {
      escapedName: 'child2',
      group: 'terminal',
      parentNode: null,
      rootNode: null,
      subnodes: null,
    };

    mockRootNode = {
      escapedName: 'root',
      group: 'branch',
      parentNode: null,
      rootNode: null,
      subnodes: [{ node: mockChildNode1 }, { node: mockChildNode2 }],
    };

    // Set up relationships
    mockRootNode.rootNode = mockRootNode;
    mockChildNode1.parentNode = mockRootNode;
    mockChildNode1.rootNode = mockRootNode;
    mockChildNode2.parentNode = mockRootNode;
    mockChildNode2.rootNode = mockRootNode;
    mockGrandchildNode.parentNode = mockChildNode1;
    mockGrandchildNode.rootNode = mockRootNode;
  });

  describe('basic behavior', () => {
    it('should return empty array for null source', () => {
      const result = findNodes(null as any, ['child1']);
      expect(result).toEqual([]);
    });

    it('should return source in array for null pointer', () => {
      const result = findNodes(mockRootNode, null);
      expect(result).toEqual([mockRootNode]);
    });

    it('should return source in array for empty segments', () => {
      const result = findNodes(mockRootNode, []);
      expect(result).toEqual([mockRootNode]);
    });

    it('should return source in array for empty string pointer', () => {
      const result = findNodes(mockRootNode, '');
      expect(result).toEqual([mockRootNode]);
    });
  });

  describe('single path traversal', () => {
    it('should find direct child node', () => {
      const result = findNodes(mockRootNode, ['child1']);
      expect(result).toEqual([mockChildNode1]);
    });

    it('should find terminal child node', () => {
      const result = findNodes(mockRootNode, ['child2']);
      expect(result).toEqual([mockChildNode2]);
    });

    it('should find nested grandchild node', () => {
      const result = findNodes(mockRootNode, ['child1', 'grandchild']);
      expect(result).toEqual([mockGrandchildNode]);
    });

    it('should return empty array for non-existent path', () => {
      const result = findNodes(mockRootNode, ['nonexistent']);
      expect(result).toEqual([]);
    });

    it('should return empty array for partial non-existent path', () => {
      const result = findNodes(mockRootNode, ['child1', 'nonexistent']);
      expect(result).toEqual([]);
    });
  });

  describe('special segment handling', () => {
    it('should handle # (Fragment) to navigate to root', () => {
      const result = findNodes(mockChildNode1, ['#', 'child2']);
      expect(result).toEqual([mockChildNode2]);
    });

    it('should handle .. (Parent) to navigate to parent', () => {
      const result = findNodes(mockGrandchildNode, ['..', '..', 'child2']);
      expect(result).toEqual([mockChildNode2]);
    });

    it('should handle . (Current) to reset to source', () => {
      const result = findNodes(mockChildNode1, ['.', 'grandchild']);
      expect(result).toEqual([mockGrandchildNode]);
    });

    it('should return empty array when parent navigation fails', () => {
      const result = findNodes(mockRootNode, ['..']);
      expect(result).toEqual([]);
    });

    it('should return empty array when root navigation fails', () => {
      const nodeWithoutRoot: any = {
        escapedName: 'orphan',
        group: 'terminal',
        rootNode: null,
        parentNode: null,
        subnodes: null,
      };

      const result = findNodes(nodeWithoutRoot, ['#']);
      expect(result).toEqual([]);
    });
  });

  describe('terminal node handling', () => {
    it('should return terminal node when it is the final destination', () => {
      const result = findNodes(mockRootNode, ['child2']);
      expect(result).toEqual([mockChildNode2]);
    });

    it('should keep terminal node when trying to traverse beyond it', () => {
      // terminal node cannot be traversed further, but it remains in the result
      const result = findNodes(mockRootNode, ['child2', 'nonexistent']);
      expect(result).toEqual([mockChildNode2]);
    });

    it('should include terminal nodes alongside traversable results', () => {
      // When both terminal and branch nodes match, terminal stays in result
      // while branch continues traversal
      const nodeWithSameName: any = {
        escapedName: 'shared',
        group: 'terminal',
        parentNode: mockRootNode,
        rootNode: mockRootNode,
        subnodes: null,
      };

      const nodeWithSubnodes: any = {
        escapedName: 'shared',
        group: 'branch',
        parentNode: mockRootNode,
        rootNode: mockRootNode,
        subnodes: [{ node: mockGrandchildNode }],
      };

      mockRootNode.subnodes = [
        { node: nodeWithSameName },
        { node: nodeWithSubnodes },
      ];

      const result = findNodes(mockRootNode, ['shared', 'grandchild']);
      // terminal 'shared' node stays, branch 'shared' traverses to grandchild
      expect(result).toHaveLength(2);
      expect(result).toContain(nodeWithSameName);
      expect(result).toContain(mockGrandchildNode);
    });
  });

  describe('oneOf/anyOf scenarios - multiple nodes with same name', () => {
    let variant0Child: any;
    let variant1Child: any;
    let parentWithOneOf: any;

    beforeEach(() => {
      variant0Child = {
        escapedName: 'name',
        group: 'terminal',
        parentNode: null,
        rootNode: null,
        subnodes: null,
        variant: 0,
      };

      variant1Child = {
        escapedName: 'name',
        group: 'terminal',
        parentNode: null,
        rootNode: null,
        subnodes: null,
        variant: 1,
      };

      parentWithOneOf = {
        escapedName: 'parent',
        group: 'branch',
        parentNode: null,
        rootNode: null,
        subnodes: [{ node: variant0Child }, { node: variant1Child }],
        oneOfIndex: 0,
      };

      parentWithOneOf.rootNode = parentWithOneOf;
      variant0Child.parentNode = parentWithOneOf;
      variant0Child.rootNode = parentWithOneOf;
      variant1Child.parentNode = parentWithOneOf;
      variant1Child.rootNode = parentWithOneOf;
    });

    it('should return all nodes with same escapedName regardless of variant', () => {
      const result = findNodes(parentWithOneOf, ['name']);
      expect(result).toHaveLength(2);
      expect(result).toContain(variant0Child);
      expect(result).toContain(variant1Child);
    });

    it('should handle nested oneOf with multiple matches', () => {
      const deepVariant0: any = {
        escapedName: 'deep',
        group: 'terminal',
        variant: 0,
      };

      const deepVariant1: any = {
        escapedName: 'deep',
        group: 'terminal',
        variant: 1,
      };

      variant0Child.group = 'branch';
      variant0Child.subnodes = [{ node: deepVariant0 }];

      variant1Child.group = 'branch';
      variant1Child.subnodes = [{ node: deepVariant1 }];

      deepVariant0.parentNode = variant0Child;
      deepVariant0.rootNode = parentWithOneOf;
      deepVariant1.parentNode = variant1Child;
      deepVariant1.rootNode = parentWithOneOf;

      const result = findNodes(parentWithOneOf, ['name', 'deep']);
      expect(result).toHaveLength(2);
      expect(result).toContain(deepVariant0);
      expect(result).toContain(deepVariant1);
    });
  });

  describe('deduplication', () => {
    it('should not include same node twice when reached through different branches', () => {
      // Create a scenario where # from two different cursors leads to same root
      const branch1: any = {
        escapedName: 'branch',
        group: 'branch',
        parentNode: mockRootNode,
        rootNode: mockRootNode,
        subnodes: [],
      };

      const branch2: any = {
        escapedName: 'branch',
        group: 'branch',
        parentNode: mockRootNode,
        rootNode: mockRootNode,
        subnodes: [],
      };

      mockRootNode.subnodes = [{ node: branch1 }, { node: branch2 }];

      // Both branches lead to same root via #
      const result = findNodes(mockRootNode, ['branch', '#']);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(mockRootNode);
    });

    it('should deduplicate when same node appears in subnodes multiple times', () => {
      const sharedNode: any = {
        escapedName: 'shared',
        group: 'terminal',
        parentNode: mockRootNode,
        rootNode: mockRootNode,
        subnodes: null,
      };

      // Same node referenced twice in subnodes (unusual but possible)
      mockRootNode.subnodes = [{ node: sharedNode }, { node: sharedNode }];

      const result = findNodes(mockRootNode, ['shared']);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(sharedNode);
    });
  });

  describe('special segment with multiple cursors', () => {
    it('should apply # to all cursors', () => {
      const branch1: any = {
        escapedName: 'branch',
        group: 'branch',
        parentNode: mockRootNode,
        rootNode: mockRootNode,
        subnodes: [],
      };

      const branch2: any = {
        escapedName: 'branch',
        group: 'branch',
        parentNode: mockRootNode,
        rootNode: mockRootNode,
        subnodes: [],
      };

      const targetNode: any = {
        escapedName: 'target',
        group: 'terminal',
        parentNode: mockRootNode,
        rootNode: mockRootNode,
        subnodes: null,
      };

      mockRootNode.subnodes = [
        { node: branch1 },
        { node: branch2 },
        { node: targetNode },
      ];

      // From 2 branch nodes, go to root, then find target
      const result = findNodes(mockRootNode, ['branch', '#', 'target']);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(targetNode);
    });

    it('should apply .. to all cursors', () => {
      const child1: any = {
        escapedName: 'child',
        group: 'branch',
        parentNode: mockRootNode,
        rootNode: mockRootNode,
        subnodes: [],
      };

      const child2: any = {
        escapedName: 'child',
        group: 'branch',
        parentNode: mockRootNode,
        rootNode: mockRootNode,
        subnodes: [],
      };

      const targetNode: any = {
        escapedName: 'target',
        group: 'terminal',
        parentNode: mockRootNode,
        rootNode: mockRootNode,
        subnodes: null,
      };

      mockRootNode.subnodes = [
        { node: child1 },
        { node: child2 },
        { node: targetNode },
      ];

      // From 2 child nodes, go to parent (root), then find target
      const result = findNodes(mockRootNode, ['child', '..', 'target']);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(targetNode);
    });

    it('should apply . to keep current cursors unchanged', () => {
      const child1: any = {
        escapedName: 'child',
        group: 'branch',
        parentNode: mockRootNode,
        rootNode: mockRootNode,
        subnodes: [{ node: mockGrandchildNode }],
      };

      const child2: any = {
        escapedName: 'child',
        group: 'branch',
        parentNode: mockRootNode,
        rootNode: mockRootNode,
        subnodes: [{ node: mockGrandchildNode }],
      };

      mockRootNode.subnodes = [{ node: child1 }, { node: child2 }];

      // . keeps current cursors (child1, child2), then find grandchild
      const result = findNodes(mockRootNode, ['child', '.', 'grandchild']);
      // Both child nodes have grandchild, but it's the same node so deduplicated
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(mockGrandchildNode);
    });
  });

  describe('edge cases', () => {
    it('should handle node with null subnodes', () => {
      const emptyNode = {
        escapedName: 'empty',
        group: 'branch',
        subnodes: null,
      } as SchemaNode;

      const result = findNodes(emptyNode, ['child']);
      expect(result).toEqual([]);
    });

    it('should handle node with empty subnodes array', () => {
      const emptyChildrenNode = {
        escapedName: 'empty',
        group: 'branch',
        subnodes: [],
      } as unknown as SchemaNode;

      const result = findNodes(emptyChildrenNode, ['child']);
      expect(result).toEqual([]);
    });

    it('should handle array-like property keys', () => {
      const arrayNode: any = {
        escapedName: '0',
        group: 'terminal',
        parentNode: mockRootNode,
        rootNode: mockRootNode,
        subnodes: null,
      };

      const parentWithArray: any = {
        escapedName: 'array',
        group: 'branch',
        rootNode: mockRootNode,
        subnodes: [{ node: arrayNode }],
      };

      const result = findNodes(parentWithArray, ['0']);
      expect(result).toEqual([arrayNode]);
    });

    it('should handle deeply nested structures', () => {
      const level4 = {
        escapedName: 'level4',
        group: 'terminal',
      } as SchemaNode;

      const level3 = {
        escapedName: 'level3',
        group: 'branch',
        subnodes: [{ node: level4 }],
      } as SchemaNode;

      const level2 = {
        escapedName: 'level2',
        group: 'branch',
        subnodes: [{ node: level3 }],
      } as SchemaNode;

      const level1 = {
        escapedName: 'level1',
        group: 'branch',
        subnodes: [{ node: level2 }],
      } as SchemaNode;

      const result = findNodes(level1, ['level2', 'level3', 'level4']);
      expect(result).toEqual([level4]);
    });

    it('should handle string pointer with leading slash', () => {
      const result = findNodes(mockRootNode, '/child1');
      expect(result).toEqual([mockChildNode1]);
    });

    it('should handle string pointer with multiple segments', () => {
      const result = findNodes(mockRootNode, '/child1/grandchild');
      expect(result).toEqual([mockGrandchildNode]);
    });
  });

  describe('complex path scenarios', () => {
    it('should handle mixed special segments: #/../child1', () => {
      // # goes to root, .. goes to parent (null for root), should return []
      const result = findNodes(mockChildNode1, ['#', '..']);
      expect(result).toEqual([]);
    });

    it('should handle path with multiple consecutive special segments', () => {
      // . keeps cursors, . keeps cursors again
      const result = findNodes(mockChildNode1, ['.', '.', 'grandchild']);
      expect(result).toEqual([mockGrandchildNode]);
    });

    it('should handle path starting with . (Current)', () => {
      const result = findNodes(mockRootNode, ['.', 'child1']);
      expect(result).toEqual([mockChildNode1]);
    });

    it('should handle path with # in the middle resetting context', () => {
      // Start from grandchild, go to root, then find child2
      const result = findNodes(mockGrandchildNode, ['#', 'child2']);
      expect(result).toEqual([mockChildNode2]);
    });

    it('should handle complex path: child1/../child2', () => {
      // Go to child1, then parent (root), then child2
      const result = findNodes(mockRootNode, ['child1', '..', 'child2']);
      expect(result).toEqual([mockChildNode2]);
    });

    it('should handle path going down and up multiple times', () => {
      // child1 -> parent (root) -> child1 -> grandchild
      const result = findNodes(mockRootNode, [
        'child1',
        '..',
        'child1',
        'grandchild',
      ]);
      expect(result).toEqual([mockGrandchildNode]);
    });
  });

  describe('terminal node edge cases', () => {
    it('should handle all cursors being terminal', () => {
      // When source itself is terminal and we try to traverse
      const result = findNodes(mockChildNode2, ['nonexistent']);
      expect(result).toEqual([mockChildNode2]);
    });

    it('should handle terminal at source with special segment #', () => {
      // Terminal can still navigate via # to root
      const result = findNodes(mockChildNode2, ['#', 'child1']);
      expect(result).toEqual([mockChildNode1]);
    });

    it('should handle terminal at source with special segment ..', () => {
      // Terminal can still navigate via .. to parent
      const result = findNodes(mockChildNode2, ['..']);
      expect(result).toEqual([mockRootNode]);
    });

    it('should handle mixed terminal and branch results across multiple segments', () => {
      const terminalA: any = {
        escapedName: 'item',
        group: 'terminal',
        parentNode: mockRootNode,
        rootNode: mockRootNode,
        subnodes: null,
      };

      const branchB: any = {
        escapedName: 'item',
        group: 'branch',
        parentNode: mockRootNode,
        rootNode: mockRootNode,
        subnodes: [],
      };

      const terminalC: any = {
        escapedName: 'item',
        group: 'terminal',
        parentNode: mockRootNode,
        rootNode: mockRootNode,
        subnodes: null,
      };

      mockRootNode.subnodes = [
        { node: terminalA },
        { node: branchB },
        { node: terminalC },
      ];

      // First segment finds all 3, next segment:
      // - terminalA stays (can't traverse)
      // - branchB has no subnodes, drops out
      // - terminalC stays (can't traverse)
      const result = findNodes(mockRootNode, ['item', 'deeper']);
      expect(result).toHaveLength(2);
      expect(result).toContain(terminalA);
      expect(result).toContain(terminalC);
    });

    it('should preserve terminal nodes through multiple segments', () => {
      const terminal: any = {
        escapedName: 'leaf',
        group: 'terminal',
        parentNode: mockRootNode,
        rootNode: mockRootNode,
        subnodes: null,
      };

      mockRootNode.subnodes = [{ node: terminal }];

      // Terminal found, then 3 more segments that can't match anything
      const result = findNodes(mockRootNode, ['leaf', 'a', 'b', 'c']);
      expect(result).toEqual([terminal]);
    });
  });

  describe('multiple cursors edge cases', () => {
    it('should handle diverging and reconverging paths', () => {
      const sharedGrandchild: any = {
        escapedName: 'shared',
        group: 'terminal',
        parentNode: null,
        rootNode: mockRootNode,
        subnodes: null,
      };

      const branch1: any = {
        escapedName: 'branch',
        group: 'branch',
        parentNode: mockRootNode,
        rootNode: mockRootNode,
        subnodes: [{ node: sharedGrandchild }],
      };

      const branch2: any = {
        escapedName: 'branch',
        group: 'branch',
        parentNode: mockRootNode,
        rootNode: mockRootNode,
        subnodes: [{ node: sharedGrandchild }],
      };

      sharedGrandchild.parentNode = branch1; // arbitrarily set

      mockRootNode.subnodes = [{ node: branch1 }, { node: branch2 }];

      // Both branches lead to same shared grandchild
      const result = findNodes(mockRootNode, ['branch', 'shared']);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(sharedGrandchild);
    });

    it('should handle # from multiple cursors with same root', () => {
      const child1: any = {
        escapedName: 'child',
        group: 'branch',
        parentNode: mockRootNode,
        rootNode: mockRootNode,
        subnodes: [],
      };

      const child2: any = {
        escapedName: 'child',
        group: 'branch',
        parentNode: mockRootNode,
        rootNode: mockRootNode,
        subnodes: [],
      };

      mockRootNode.subnodes = [{ node: child1 }, { node: child2 }];

      // Both children go to same root via #
      const result = findNodes(mockRootNode, ['child', '#']);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(mockRootNode);
    });

    it('should handle .. from multiple cursors with different parents', () => {
      const grandchild1: any = {
        escapedName: 'gc',
        group: 'terminal',
        parentNode: mockChildNode1,
        rootNode: mockRootNode,
        subnodes: null,
      };

      const grandchild2: any = {
        escapedName: 'gc',
        group: 'terminal',
        parentNode: mockChildNode2,
        rootNode: mockRootNode,
        subnodes: null,
      };

      mockChildNode1.subnodes = [{ node: grandchild1 }];
      mockChildNode2.group = 'branch';
      mockChildNode2.subnodes = [{ node: grandchild2 }];

      mockRootNode.subnodes = [
        { node: mockChildNode1 },
        { node: mockChildNode2 },
      ];

      // Find both grandchildren, then go to their parents
      const parent1: any = {
        escapedName: 'parent',
        group: 'branch',
        parentNode: mockRootNode,
        rootNode: mockRootNode,
        subnodes: [{ node: grandchild1 }, { node: grandchild2 }],
      };

      grandchild1.parentNode = parent1;
      grandchild2.parentNode = parent1;

      mockRootNode.subnodes = [{ node: parent1 }];

      const result = findNodes(mockRootNode, ['parent', 'gc', '..']);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(parent1);
    });
  });

  describe('empty and null edge cases', () => {
    it('should handle branch node with empty subnodes array', () => {
      const emptyBranch: any = {
        escapedName: 'empty',
        group: 'branch',
        parentNode: mockRootNode,
        rootNode: mockRootNode,
        subnodes: [],
      };

      mockRootNode.subnodes = [{ node: emptyBranch }];

      const result = findNodes(mockRootNode, ['empty', 'child']);
      expect(result).toEqual([]);
    });

    it('should handle branch node with null subnodes', () => {
      const nullSubnodesBranch: any = {
        escapedName: 'nullsub',
        group: 'branch',
        parentNode: mockRootNode,
        rootNode: mockRootNode,
        subnodes: null,
      };

      mockRootNode.subnodes = [{ node: nullSubnodesBranch }];

      const result = findNodes(mockRootNode, ['nullsub', 'child']);
      expect(result).toEqual([]);
    });

    it('should handle undefined subnodes', () => {
      const undefinedSubnodesBranch: any = {
        escapedName: 'undefsub',
        group: 'branch',
        parentNode: mockRootNode,
        rootNode: mockRootNode,
        subnodes: undefined,
      };

      mockRootNode.subnodes = [{ node: undefinedSubnodesBranch }];

      const result = findNodes(mockRootNode, ['undefsub', 'child']);
      expect(result).toEqual([]);
    });

    it('should return empty array for single non-matching segment', () => {
      const result = findNodes(mockRootNode, ['nonexistent']);
      expect(result).toEqual([]);
    });

    it('should handle rootNode being null during # navigation', () => {
      const orphanNode: any = {
        escapedName: 'orphan',
        group: 'branch',
        parentNode: null,
        rootNode: null,
        subnodes: [],
      };

      const result = findNodes(orphanNode, ['#']);
      expect(result).toEqual([]);
    });

    it('should handle parentNode being null during .. navigation', () => {
      const result = findNodes(mockRootNode, ['..']);
      expect(result).toEqual([]);
    });
  });

  describe('special characters in segment names', () => {
    it('should handle escaped special characters in node names', () => {
      const specialNode: any = {
        escapedName: '~0~1', // escaped ~ and /
        group: 'terminal',
        parentNode: mockRootNode,
        rootNode: mockRootNode,
        subnodes: null,
      };

      mockRootNode.subnodes = [{ node: specialNode }];

      const result = findNodes(mockRootNode, ['~0~1']);
      expect(result).toEqual([specialNode]);
    });

    it('should handle numeric segment names', () => {
      const numericNode: any = {
        escapedName: '123',
        group: 'terminal',
        parentNode: mockRootNode,
        rootNode: mockRootNode,
        subnodes: null,
      };

      mockRootNode.subnodes = [{ node: numericNode }];

      const result = findNodes(mockRootNode, ['123']);
      expect(result).toEqual([numericNode]);
    });

    it('should handle empty string as segment name', () => {
      const emptyNameNode: any = {
        escapedName: '',
        group: 'terminal',
        parentNode: mockRootNode,
        rootNode: mockRootNode,
        subnodes: null,
      };

      mockRootNode.subnodes = [{ node: emptyNameNode }];

      const result = findNodes(mockRootNode, ['']);
      expect(result).toEqual([emptyNameNode]);
    });
  });

  describe('wildcard (*) operator', () => {
    it('should match all direct children with * operator', () => {
      const result = findNodes(mockRootNode, ['*']);
      expect(result).toHaveLength(2);
      expect(result).toContain(mockChildNode1);
      expect(result).toContain(mockChildNode2);
    });

    it('should match all children at specific level with */child pattern', () => {
      const grandchild1: any = {
        escapedName: 'nested',
        group: 'terminal',
        parentNode: mockChildNode1,
        rootNode: mockRootNode,
        subnodes: null,
      };

      const grandchild2: any = {
        escapedName: 'nested',
        group: 'terminal',
        parentNode: mockChildNode2,
        rootNode: mockRootNode,
        subnodes: null,
      };

      mockChildNode1.subnodes = [{ node: grandchild1 }];
      mockChildNode2.group = 'branch';
      mockChildNode2.subnodes = [{ node: grandchild2 }];

      // */nested should find all 'nested' nodes under all children
      const result = findNodes(mockRootNode, ['*', 'nested']);
      expect(result).toHaveLength(2);
      expect(result).toContain(grandchild1);
      expect(result).toContain(grandchild2);
    });

    it('should handle multiple wildcards in path', () => {
      const level3a: any = {
        escapedName: 'leaf',
        group: 'terminal',
        parentNode: null,
        rootNode: mockRootNode,
        subnodes: null,
      };

      const level3b: any = {
        escapedName: 'leaf',
        group: 'terminal',
        parentNode: null,
        rootNode: mockRootNode,
        subnodes: null,
      };

      const level2a: any = {
        escapedName: 'mid',
        group: 'branch',
        parentNode: mockChildNode1,
        rootNode: mockRootNode,
        subnodes: [{ node: level3a }],
      };

      const level2b: any = {
        escapedName: 'mid',
        group: 'branch',
        parentNode: mockChildNode2,
        rootNode: mockRootNode,
        subnodes: [{ node: level3b }],
      };

      level3a.parentNode = level2a;
      level3b.parentNode = level2b;

      mockChildNode1.subnodes = [{ node: level2a }];
      mockChildNode2.group = 'branch';
      mockChildNode2.subnodes = [{ node: level2b }];

      // */*  should find all level2 nodes
      const result = findNodes(mockRootNode, ['*', '*']);
      expect(result).toHaveLength(2);
      expect(result).toContain(level2a);
      expect(result).toContain(level2b);

      // */* /leaf should find all level3 nodes
      const leafResult = findNodes(mockRootNode, ['*', '*', 'leaf']);
      expect(leafResult).toHaveLength(2);
      expect(leafResult).toContain(level3a);
      expect(leafResult).toContain(level3b);
    });

    it('should handle wildcard with specific path segments', () => {
      const targetA: any = {
        escapedName: 'target',
        group: 'terminal',
        parentNode: mockChildNode1,
        rootNode: mockRootNode,
        subnodes: null,
      };

      const targetB: any = {
        escapedName: 'target',
        group: 'terminal',
        parentNode: mockChildNode2,
        rootNode: mockRootNode,
        subnodes: null,
      };

      const otherA: any = {
        escapedName: 'other',
        group: 'terminal',
        parentNode: mockChildNode1,
        rootNode: mockRootNode,
        subnodes: null,
      };

      mockChildNode1.subnodes = [{ node: targetA }, { node: otherA }];
      mockChildNode2.group = 'branch';
      mockChildNode2.subnodes = [{ node: targetB }];

      // */target should find all 'target' nodes under all children
      const result = findNodes(mockRootNode, ['*', 'target']);
      expect(result).toHaveLength(2);
      expect(result).toContain(targetA);
      expect(result).toContain(targetB);
      expect(result).not.toContain(otherA);
    });

    it('should return empty array when wildcard matches no children', () => {
      const emptyNode: any = {
        escapedName: 'empty',
        group: 'branch',
        parentNode: null,
        rootNode: null,
        subnodes: [],
      };

      const result = findNodes(emptyNode, ['*']);
      expect(result).toEqual([]);
    });

    it('should handle wildcard on terminal nodes', () => {
      // Terminal node cannot be traversed, so wildcard should keep terminal in result
      const result = findNodes(mockChildNode2, ['*']);
      expect(result).toEqual([mockChildNode2]);
    });

    it('should combine wildcard with special segments', () => {
      const nested: any = {
        escapedName: 'nested',
        group: 'branch',
        parentNode: mockChildNode1,
        rootNode: mockRootNode,
        subnodes: [],
      };

      mockChildNode1.subnodes = [{ node: nested }];
      nested.subnodes = [{ node: mockGrandchildNode }];
      mockGrandchildNode.parentNode = nested;

      // Go to child1, then *, then parent
      const result = findNodes(mockRootNode, ['child1', '*', '..']);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(mockChildNode1);
    });

    it('should deduplicate when wildcard leads to same node', () => {
      const sharedChild: any = {
        escapedName: 'shared',
        group: 'terminal',
        parentNode: mockRootNode,
        rootNode: mockRootNode,
        subnodes: null,
      };

      // Both subnodes point to same node
      mockRootNode.subnodes = [{ node: sharedChild }, { node: sharedChild }];

      const result = findNodes(mockRootNode, ['*']);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(sharedChild);
    });

    it('should handle string pointer with wildcard', () => {
      const result = findNodes(mockRootNode, '/*');
      expect(result).toHaveLength(2);
      expect(result).toContain(mockChildNode1);
      expect(result).toContain(mockChildNode2);
    });

    it('should handle nested path with string pointer containing wildcard', () => {
      // Reset child2 to terminal (no grandchild)
      mockChildNode2.group = 'terminal';
      mockChildNode2.subnodes = null;
      mockChildNode1.subnodes = [{ node: mockGrandchildNode }];

      const result = findNodes(mockRootNode, '/*/grandchild');
      // child1 has grandchild, child2 is terminal and preserved
      expect(result).toHaveLength(2);
      expect(result).toContain(mockGrandchildNode);
      expect(result).toContain(mockChildNode2); // terminal preserved
    });

    it('should handle wildcard at different levels', () => {
      const deep1: any = {
        escapedName: 'deep',
        group: 'terminal',
        parentNode: mockChildNode1,
        rootNode: mockRootNode,
        subnodes: null,
      };

      const deep2: any = {
        escapedName: 'deep',
        group: 'terminal',
        parentNode: mockChildNode2,
        rootNode: mockRootNode,
        subnodes: null,
      };

      mockChildNode1.subnodes = [{ node: deep1 }];
      mockChildNode2.group = 'branch';
      mockChildNode2.subnodes = [{ node: deep2 }];

      // First use specific path, then wildcard
      const result1 = findNodes(mockRootNode, ['child1', '*']);
      expect(result1).toHaveLength(1);
      expect(result1).toContain(deep1);

      // Use wildcard first, then specific path
      const result2 = findNodes(mockRootNode, ['*', 'deep']);
      expect(result2).toHaveLength(2);
      expect(result2).toContain(deep1);
      expect(result2).toContain(deep2);
    });

    it('should handle wildcard with oneOf-like structures', () => {
      const variant0: any = {
        escapedName: 'data',
        group: 'terminal',
        parentNode: mockRootNode,
        rootNode: mockRootNode,
        subnodes: null,
        variant: 0,
      };

      const variant1: any = {
        escapedName: 'data',
        group: 'terminal',
        parentNode: mockRootNode,
        rootNode: mockRootNode,
        subnodes: null,
        variant: 1,
      };

      const variant2: any = {
        escapedName: 'other',
        group: 'terminal',
        parentNode: mockRootNode,
        rootNode: mockRootNode,
        subnodes: null,
        variant: 1,
      };

      mockRootNode.subnodes = [
        { node: variant0 },
        { node: variant1 },
        { node: variant2 },
      ];

      // Wildcard should get all variants
      const result = findNodes(mockRootNode, ['*']);
      expect(result).toHaveLength(3);
      expect(result).toContain(variant0);
      expect(result).toContain(variant1);
      expect(result).toContain(variant2);
    });
  });

  describe('performance edge cases', () => {
    it('should handle wide tree with many siblings', () => {
      const siblings: any[] = [];
      for (let i = 0; i < 100; i++) {
        siblings.push({
          node: {
            escapedName: `sibling${i}`,
            group: 'terminal',
            parentNode: mockRootNode,
            rootNode: mockRootNode,
            subnodes: null,
          },
        });
      }

      mockRootNode.subnodes = siblings;

      const result = findNodes(mockRootNode, ['sibling50']);
      expect(result).toHaveLength(1);
      expect(result[0].escapedName).toBe('sibling50');
    });

    it('should handle deep tree traversal', () => {
      let current: any = mockRootNode;
      const path: string[] = [];

      for (let i = 0; i < 20; i++) {
        const next: any = {
          escapedName: `level${i}`,
          group: i === 19 ? 'terminal' : 'branch',
          parentNode: current,
          rootNode: mockRootNode,
          subnodes: i === 19 ? null : [],
        };
        current.subnodes = [{ node: next }];
        current = next;
        path.push(`level${i}`);
      }

      const result = findNodes(mockRootNode, path);
      expect(result).toHaveLength(1);
      expect(result[0].escapedName).toBe('level19');
    });
  });
});
