import { beforeEach, describe, expect, it } from 'vitest';

import type { SchemaNode } from '@/schema-form/core';

import { findAllNodes } from '../findNode';

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
      const result = findAllNodes(null as any, ['child1']);
      expect(result).toEqual([]);
    });

    it('should return source in array for null pointer', () => {
      const result = findAllNodes(mockRootNode, null);
      expect(result).toEqual([mockRootNode]);
    });

    it('should return source in array for empty segments', () => {
      const result = findAllNodes(mockRootNode, []);
      expect(result).toEqual([mockRootNode]);
    });

    it('should return source in array for empty string pointer', () => {
      const result = findAllNodes(mockRootNode, '');
      expect(result).toEqual([mockRootNode]);
    });
  });

  describe('single path traversal', () => {
    it('should find direct child node', () => {
      const result = findAllNodes(mockRootNode, ['child1']);
      expect(result).toEqual([mockChildNode1]);
    });

    it('should find terminal child node', () => {
      const result = findAllNodes(mockRootNode, ['child2']);
      expect(result).toEqual([mockChildNode2]);
    });

    it('should find nested grandchild node', () => {
      const result = findAllNodes(mockRootNode, ['child1', 'grandchild']);
      expect(result).toEqual([mockGrandchildNode]);
    });

    it('should return empty array for non-existent path', () => {
      const result = findAllNodes(mockRootNode, ['nonexistent']);
      expect(result).toEqual([]);
    });

    it('should return empty array for partial non-existent path', () => {
      const result = findAllNodes(mockRootNode, ['child1', 'nonexistent']);
      expect(result).toEqual([]);
    });
  });

  describe('special segment handling', () => {
    it('should handle # (Fragment) to navigate to root', () => {
      const result = findAllNodes(mockChildNode1, ['#', 'child2']);
      expect(result).toEqual([mockChildNode2]);
    });

    it('should handle .. (Parent) to navigate to parent', () => {
      const result = findAllNodes(mockGrandchildNode, ['..', '..', 'child2']);
      expect(result).toEqual([mockChildNode2]);
    });

    it('should handle . (Current) to reset to source', () => {
      const result = findAllNodes(mockChildNode1, ['.', 'grandchild']);
      expect(result).toEqual([mockGrandchildNode]);
    });

    it('should return empty array when parent navigation fails', () => {
      const result = findAllNodes(mockRootNode, ['..']);
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

      const result = findAllNodes(nodeWithoutRoot, ['#']);
      expect(result).toEqual([]);
    });
  });

  describe('terminal node handling', () => {
    it('should return terminal node when it is the final destination', () => {
      const result = findAllNodes(mockRootNode, ['child2']);
      expect(result).toEqual([mockChildNode2]);
    });

    it('should keep terminal node when trying to traverse beyond it', () => {
      // terminal node cannot be traversed further, but it remains in the result
      const result = findAllNodes(mockRootNode, ['child2', 'nonexistent']);
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

      const result = findAllNodes(mockRootNode, ['shared', 'grandchild']);
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
      const result = findAllNodes(parentWithOneOf, ['name']);
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

      const result = findAllNodes(parentWithOneOf, ['name', 'deep']);
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
      const result = findAllNodes(mockRootNode, ['branch', '#']);
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

      const result = findAllNodes(mockRootNode, ['shared']);
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
      const result = findAllNodes(mockRootNode, ['branch', '#', 'target']);
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
      const result = findAllNodes(mockRootNode, ['child', '..', 'target']);
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
      const result = findAllNodes(mockRootNode, ['child', '.', 'grandchild']);
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

      const result = findAllNodes(emptyNode, ['child']);
      expect(result).toEqual([]);
    });

    it('should handle node with empty subnodes array', () => {
      const emptyChildrenNode = {
        escapedName: 'empty',
        group: 'branch',
        subnodes: [],
      } as unknown as SchemaNode;

      const result = findAllNodes(emptyChildrenNode, ['child']);
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

      const result = findAllNodes(parentWithArray, ['0']);
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

      const result = findAllNodes(level1, ['level2', 'level3', 'level4']);
      expect(result).toEqual([level4]);
    });

    it('should handle string pointer with leading slash', () => {
      const result = findAllNodes(mockRootNode, '/child1');
      expect(result).toEqual([mockChildNode1]);
    });

    it('should handle string pointer with multiple segments', () => {
      const result = findAllNodes(mockRootNode, '/child1/grandchild');
      expect(result).toEqual([mockGrandchildNode]);
    });
  });

  describe('complex path scenarios', () => {
    it('should handle mixed special segments: #/../child1', () => {
      // # goes to root, .. goes to parent (null for root), should return []
      const result = findAllNodes(mockChildNode1, ['#', '..']);
      expect(result).toEqual([]);
    });

    it('should handle path with multiple consecutive special segments', () => {
      // . keeps cursors, . keeps cursors again
      const result = findAllNodes(mockChildNode1, ['.', '.', 'grandchild']);
      expect(result).toEqual([mockGrandchildNode]);
    });

    it('should handle path starting with . (Current)', () => {
      const result = findAllNodes(mockRootNode, ['.', 'child1']);
      expect(result).toEqual([mockChildNode1]);
    });

    it('should handle path with # in the middle resetting context', () => {
      // Start from grandchild, go to root, then find child2
      const result = findAllNodes(mockGrandchildNode, ['#', 'child2']);
      expect(result).toEqual([mockChildNode2]);
    });

    it('should handle complex path: child1/../child2', () => {
      // Go to child1, then parent (root), then child2
      const result = findAllNodes(mockRootNode, ['child1', '..', 'child2']);
      expect(result).toEqual([mockChildNode2]);
    });

    it('should handle path going down and up multiple times', () => {
      // child1 -> parent (root) -> child1 -> grandchild
      const result = findAllNodes(mockRootNode, [
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
      const result = findAllNodes(mockChildNode2, ['nonexistent']);
      expect(result).toEqual([mockChildNode2]);
    });

    it('should handle terminal at source with special segment #', () => {
      // Terminal can still navigate via # to root
      const result = findAllNodes(mockChildNode2, ['#', 'child1']);
      expect(result).toEqual([mockChildNode1]);
    });

    it('should handle terminal at source with special segment ..', () => {
      // Terminal can still navigate via .. to parent
      const result = findAllNodes(mockChildNode2, ['..']);
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
      const result = findAllNodes(mockRootNode, ['item', 'deeper']);
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
      const result = findAllNodes(mockRootNode, ['leaf', 'a', 'b', 'c']);
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
      const result = findAllNodes(mockRootNode, ['branch', 'shared']);
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
      const result = findAllNodes(mockRootNode, ['child', '#']);
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

      const result = findAllNodes(mockRootNode, ['parent', 'gc', '..']);
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

      const result = findAllNodes(mockRootNode, ['empty', 'child']);
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

      const result = findAllNodes(mockRootNode, ['nullsub', 'child']);
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

      const result = findAllNodes(mockRootNode, ['undefsub', 'child']);
      expect(result).toEqual([]);
    });

    it('should return empty array for single non-matching segment', () => {
      const result = findAllNodes(mockRootNode, ['nonexistent']);
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

      const result = findAllNodes(orphanNode, ['#']);
      expect(result).toEqual([]);
    });

    it('should handle parentNode being null during .. navigation', () => {
      const result = findAllNodes(mockRootNode, ['..']);
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

      const result = findAllNodes(mockRootNode, ['~0~1']);
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

      const result = findAllNodes(mockRootNode, ['123']);
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

      const result = findAllNodes(mockRootNode, ['']);
      expect(result).toEqual([emptyNameNode]);
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

      const result = findAllNodes(mockRootNode, ['sibling50']);
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

      const result = findAllNodes(mockRootNode, path);
      expect(result).toHaveLength(1);
      expect(result[0].escapedName).toBe('level19');
    });
  });
});
