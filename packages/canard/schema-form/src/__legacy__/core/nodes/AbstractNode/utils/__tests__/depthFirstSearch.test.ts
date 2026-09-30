import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AbstractNode } from '../../AbstractNode';
import { depthFirstSearch } from '../traversal/depthFirstSearch';

describe('depthFirstSearch', () => {
  let mockRootNode: any;
  let mockChildNode1: any;
  let mockChildNode2: any;
  let mockGrandchildNode1: any;
  let mockGrandchildNode2: any;

  beforeEach(() => {
    mockGrandchildNode1 = {
      escapedName: 'grandchild1',
      group: 'terminal',
      parentNode: null,
      rootNode: null,
      subnodes: null,
    };

    mockGrandchildNode2 = {
      escapedName: 'grandchild2',
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
      subnodes: [{ node: mockGrandchildNode1 }],
    };

    mockChildNode2 = {
      escapedName: 'child2',
      group: 'branch',
      parentNode: null,
      rootNode: null,
      subnodes: [{ node: mockGrandchildNode2 }],
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
    mockGrandchildNode1.parentNode = mockChildNode1;
    mockGrandchildNode1.rootNode = mockRootNode;
    mockGrandchildNode2.parentNode = mockChildNode2;
    mockGrandchildNode2.rootNode = mockRootNode;
  });

  describe('post-order traversal (default)', () => {
    it('should visit leaf nodes before their parents', () => {
      const visitedNodes: AbstractNode[] = [];
      const visitor = vi.fn((node: AbstractNode) => {
        visitedNodes.push(node);
      });

      depthFirstSearch(mockRootNode, visitor);

      // Post-order: grandchild1 -> child1 -> grandchild2 -> child2 -> root
      expect(visitedNodes).toEqual([
        mockGrandchildNode1,
        mockChildNode1,
        mockGrandchildNode2,
        mockChildNode2,
        mockRootNode,
      ]);
    });

    it('should visit root node last in post-order', () => {
      const visitedNodes: AbstractNode[] = [];
      const visitor = vi.fn((node: AbstractNode) => {
        visitedNodes.push(node);
      });

      depthFirstSearch(mockRootNode, visitor);

      expect(visitedNodes[visitedNodes.length - 1]).toBe(mockRootNode);
    });

    it('should call visitor for each node exactly once', () => {
      const visitor = vi.fn();

      depthFirstSearch(mockRootNode, visitor);

      expect(visitor).toHaveBeenCalledTimes(5);
    });

    it('should use post-order when postOrder is true', () => {
      const visitedNames: string[] = [];
      const visitor = vi.fn((node: any) => {
        visitedNames.push(node.escapedName);
      });

      depthFirstSearch(mockRootNode, visitor, true);

      expect(visitedNames).toEqual([
        'grandchild1',
        'child1',
        'grandchild2',
        'child2',
        'root',
      ]);
    });
  });

  describe('pre-order traversal', () => {
    it('should visit root node first in pre-order', () => {
      const visitedNodes: AbstractNode[] = [];
      const visitor = vi.fn((node: AbstractNode) => {
        visitedNodes.push(node);
      });

      depthFirstSearch(mockRootNode, visitor, false);

      expect(visitedNodes[0]).toBe(mockRootNode);
    });

    it('should visit nodes in pre-order when postOrder is false', () => {
      const visitedNodes: AbstractNode[] = [];
      const visitor = vi.fn((node: AbstractNode) => {
        visitedNodes.push(node);
      });

      depthFirstSearch(mockRootNode, visitor, false);

      // Pre-order: root -> child1 -> grandchild1 -> child2 -> grandchild2
      expect(visitedNodes).toEqual([
        mockRootNode,
        mockChildNode1,
        mockGrandchildNode1,
        mockChildNode2,
        mockGrandchildNode2,
      ]);
    });

    it('should visit parent before children in pre-order', () => {
      const visitedNames: string[] = [];
      const visitor = vi.fn((node: any) => {
        visitedNames.push(node.escapedName);
      });

      depthFirstSearch(mockRootNode, visitor, false);

      // Check parent comes before children
      const rootIndex = visitedNames.indexOf('root');
      const child1Index = visitedNames.indexOf('child1');
      const grandchild1Index = visitedNames.indexOf('grandchild1');

      expect(rootIndex).toBeLessThan(child1Index);
      expect(child1Index).toBeLessThan(grandchild1Index);
    });
  });

  describe('edge cases', () => {
    it('should handle single node without children', () => {
      const singleNode = {
        escapedName: 'single',
        group: 'terminal',
        subnodes: null,
      } as AbstractNode;

      const visitedNodes: AbstractNode[] = [];
      const visitor = vi.fn((node: AbstractNode) => {
        visitedNodes.push(node);
      });

      depthFirstSearch(singleNode, visitor);

      expect(visitedNodes).toEqual([singleNode]);
      expect(visitor).toHaveBeenCalledTimes(1);
    });

    it('should handle node with empty subnodes array', () => {
      const nodeWithEmptyChildren = {
        escapedName: 'empty',
        group: 'branch',
        subnodes: [],
      } as unknown as AbstractNode;

      const visitedNodes: AbstractNode[] = [];
      const visitor = vi.fn((node: AbstractNode) => {
        visitedNodes.push(node);
      });

      depthFirstSearch(nodeWithEmptyChildren, visitor);

      expect(visitedNodes).toEqual([nodeWithEmptyChildren]);
      expect(visitor).toHaveBeenCalledTimes(1);
    });

    it('should handle deeply nested structures in post-order', () => {
      const level4 = {
        escapedName: 'level4',
        group: 'terminal',
        subnodes: null,
      } as AbstractNode;

      const level3 = {
        escapedName: 'level3',
        group: 'branch',
        subnodes: [{ node: level4 }],
      } as AbstractNode;

      const level2 = {
        escapedName: 'level2',
        group: 'branch',
        subnodes: [{ node: level3 }],
      } as AbstractNode;

      const level1 = {
        escapedName: 'level1',
        group: 'branch',
        subnodes: [{ node: level2 }],
      } as AbstractNode;

      const visitedNames: string[] = [];
      const visitor = vi.fn((node: any) => {
        visitedNames.push(node.escapedName);
      });

      depthFirstSearch(level1, visitor);

      // Post-order: deepest first
      expect(visitedNames).toEqual(['level4', 'level3', 'level2', 'level1']);
    });

    it('should handle deeply nested structures in pre-order', () => {
      const level4 = {
        escapedName: 'level4',
        group: 'terminal',
        subnodes: null,
      } as AbstractNode;

      const level3 = {
        escapedName: 'level3',
        group: 'branch',
        subnodes: [{ node: level4 }],
      } as AbstractNode;

      const level2 = {
        escapedName: 'level2',
        group: 'branch',
        subnodes: [{ node: level3 }],
      } as AbstractNode;

      const level1 = {
        escapedName: 'level1',
        group: 'branch',
        subnodes: [{ node: level2 }],
      } as AbstractNode;

      const visitedNames: string[] = [];
      const visitor = vi.fn((node: any) => {
        visitedNames.push(node.escapedName);
      });

      depthFirstSearch(level1, visitor, false);

      // Pre-order: root first
      expect(visitedNames).toEqual(['level1', 'level2', 'level3', 'level4']);
    });

    it('should handle wide tree structures in post-order', () => {
      const child1 = { escapedName: 'a', group: 'terminal', subnodes: null };
      const child2 = { escapedName: 'b', group: 'terminal', subnodes: null };
      const child3 = { escapedName: 'c', group: 'terminal', subnodes: null };
      const child4 = { escapedName: 'd', group: 'terminal', subnodes: null };

      const wideRoot = {
        escapedName: 'root',
        group: 'branch',
        subnodes: [
          { node: child1 },
          { node: child2 },
          { node: child3 },
          { node: child4 },
        ],
      } as unknown as AbstractNode;

      const visitedNames: string[] = [];
      const visitor = vi.fn((node: any) => {
        visitedNames.push(node.escapedName);
      });

      depthFirstSearch(wideRoot, visitor);

      // Post-order: children first, then root
      expect(visitedNames).toEqual(['a', 'b', 'c', 'd', 'root']);
    });

    it('should handle wide tree structures in pre-order', () => {
      const child1 = { escapedName: 'a', group: 'terminal', subnodes: null };
      const child2 = { escapedName: 'b', group: 'terminal', subnodes: null };
      const child3 = { escapedName: 'c', group: 'terminal', subnodes: null };
      const child4 = { escapedName: 'd', group: 'terminal', subnodes: null };

      const wideRoot = {
        escapedName: 'root',
        group: 'branch',
        subnodes: [
          { node: child1 },
          { node: child2 },
          { node: child3 },
          { node: child4 },
        ],
      } as unknown as AbstractNode;

      const visitedNames: string[] = [];
      const visitor = vi.fn((node: any) => {
        visitedNames.push(node.escapedName);
      });

      depthFirstSearch(wideRoot, visitor, false);

      // Pre-order: root first, then children
      expect(visitedNames).toEqual(['root', 'a', 'b', 'c', 'd']);
    });

    it('should handle mixed depth tree in post-order', () => {
      // Tree structure:
      //        root
      //       /    \
      //     a       b
      //    / \
      //   c   d

      const c = { escapedName: 'c', group: 'terminal', subnodes: null };
      const d = { escapedName: 'd', group: 'terminal', subnodes: null };
      const a = {
        escapedName: 'a',
        group: 'branch',
        subnodes: [{ node: c }, { node: d }],
      };
      const b = { escapedName: 'b', group: 'terminal', subnodes: null };
      const root = {
        escapedName: 'root',
        group: 'branch',
        subnodes: [{ node: a }, { node: b }],
      } as unknown as AbstractNode;

      const visitedNames: string[] = [];
      const visitor = vi.fn((node: any) => {
        visitedNames.push(node.escapedName);
      });

      depthFirstSearch(root, visitor);

      // Post-order: c -> d -> a -> b -> root
      expect(visitedNames).toEqual(['c', 'd', 'a', 'b', 'root']);
    });

    it('should handle mixed depth tree in pre-order', () => {
      // Tree structure:
      //        root
      //       /    \
      //     a       b
      //    / \
      //   c   d

      const c = { escapedName: 'c', group: 'terminal', subnodes: null };
      const d = { escapedName: 'd', group: 'terminal', subnodes: null };
      const a = {
        escapedName: 'a',
        group: 'branch',
        subnodes: [{ node: c }, { node: d }],
      };
      const b = { escapedName: 'b', group: 'terminal', subnodes: null };
      const root = {
        escapedName: 'root',
        group: 'branch',
        subnodes: [{ node: a }, { node: b }],
      } as unknown as AbstractNode;

      const visitedNames: string[] = [];
      const visitor = vi.fn((node: any) => {
        visitedNames.push(node.escapedName);
      });

      depthFirstSearch(root, visitor, false);

      // Pre-order: root -> a -> c -> d -> b
      expect(visitedNames).toEqual(['root', 'a', 'c', 'd', 'b']);
    });

    it('should handle starting from non-root node', () => {
      const visitedNames: string[] = [];
      const visitor = vi.fn((node: any) => {
        visitedNames.push(node.escapedName);
      });

      depthFirstSearch(mockChildNode1, visitor);

      // Should only traverse child1's subtree in post-order
      expect(visitedNames).toEqual(['grandchild1', 'child1']);
    });

    it('should handle starting from non-root node in pre-order', () => {
      const visitedNames: string[] = [];
      const visitor = vi.fn((node: any) => {
        visitedNames.push(node.escapedName);
      });

      depthFirstSearch(mockChildNode1, visitor, false);

      // Should only traverse child1's subtree in pre-order
      expect(visitedNames).toEqual(['child1', 'grandchild1']);
    });
  });

  describe('visitor behavior', () => {
    it('should pass correct node to visitor', () => {
      const visitor = vi.fn();

      depthFirstSearch(mockChildNode1, visitor);

      expect(visitor).toHaveBeenCalledWith(mockGrandchildNode1);
      expect(visitor).toHaveBeenCalledWith(mockChildNode1);
    });

    it('should maintain order consistency across multiple runs', () => {
      const results: string[][] = [];

      for (let i = 0; i < 3; i++) {
        const visitedNames: string[] = [];
        const visitor = (node: any) => {
          visitedNames.push(node.escapedName);
        };
        depthFirstSearch(mockRootNode, visitor);
        results.push(visitedNames);
      }

      // All runs should produce the same order
      expect(results[0]).toEqual(results[1]);
      expect(results[1]).toEqual(results[2]);
    });
  });

  describe('comparison with pre-order vs post-order', () => {
    it('should produce different orders for pre-order and post-order', () => {
      const preOrderNames: string[] = [];
      const postOrderNames: string[] = [];

      depthFirstSearch(
        mockRootNode,
        (node: any) => {
          preOrderNames.push(node.escapedName);
        },
        false,
      );

      depthFirstSearch(
        mockRootNode,
        (node: any) => {
          postOrderNames.push(node.escapedName);
        },
        true,
      );

      // Orders should be different
      expect(preOrderNames).not.toEqual(postOrderNames);

      // But should contain the same elements
      expect([...preOrderNames].sort()).toEqual([...postOrderNames].sort());
    });

    it('should visit same number of nodes regardless of order', () => {
      let preOrderCount = 0;
      let postOrderCount = 0;

      depthFirstSearch(mockRootNode, () => preOrderCount++, false);
      depthFirstSearch(mockRootNode, () => postOrderCount++, true);

      expect(preOrderCount).toBe(postOrderCount);
      expect(preOrderCount).toBe(5);
    });
  });
});
