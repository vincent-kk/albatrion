import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AbstractNode } from '../../AbstractNode';
import { breadthFirstSearch } from '../traversal/breadthFirstSearch';

describe('breadthFirstSearch', () => {
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

  it('should visit root node first', () => {
    const visitedNodes: AbstractNode[] = [];
    const visitor = vi.fn((node: AbstractNode) => {
      visitedNodes.push(node);
    });

    breadthFirstSearch(mockRootNode, visitor);

    expect(visitedNodes[0]).toBe(mockRootNode);
  });

  it('should visit nodes in breadth-first order', () => {
    const visitedNodes: AbstractNode[] = [];
    const visitor = vi.fn((node: AbstractNode) => {
      visitedNodes.push(node);
    });

    breadthFirstSearch(mockRootNode, visitor);

    // BFS order: root -> child1, child2 -> grandchild1, grandchild2
    expect(visitedNodes).toEqual([
      mockRootNode,
      mockChildNode1,
      mockChildNode2,
      mockGrandchildNode1,
      mockGrandchildNode2,
    ]);
  });

  it('should call visitor for each node exactly once', () => {
    const visitor = vi.fn();

    breadthFirstSearch(mockRootNode, visitor);

    expect(visitor).toHaveBeenCalledTimes(5);
    expect(visitor).toHaveBeenNthCalledWith(1, mockRootNode);
    expect(visitor).toHaveBeenNthCalledWith(2, mockChildNode1);
    expect(visitor).toHaveBeenNthCalledWith(3, mockChildNode2);
    expect(visitor).toHaveBeenNthCalledWith(4, mockGrandchildNode1);
    expect(visitor).toHaveBeenNthCalledWith(5, mockGrandchildNode2);
  });

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

    breadthFirstSearch(singleNode, visitor);

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

    breadthFirstSearch(nodeWithEmptyChildren, visitor);

    expect(visitedNodes).toEqual([nodeWithEmptyChildren]);
    expect(visitor).toHaveBeenCalledTimes(1);
  });

  it('should visit all siblings before moving to next level', () => {
    const visitedNames: string[] = [];
    const visitor = vi.fn((node: any) => {
      visitedNames.push(node.escapedName);
    });

    breadthFirstSearch(mockRootNode, visitor);

    // Check that child1 and child2 are visited before any grandchild
    const child1Index = visitedNames.indexOf('child1');
    const child2Index = visitedNames.indexOf('child2');
    const grandchild1Index = visitedNames.indexOf('grandchild1');
    const grandchild2Index = visitedNames.indexOf('grandchild2');

    expect(child1Index).toBeLessThan(grandchild1Index);
    expect(child1Index).toBeLessThan(grandchild2Index);
    expect(child2Index).toBeLessThan(grandchild1Index);
    expect(child2Index).toBeLessThan(grandchild2Index);
  });

  it('should handle deeply nested structures', () => {
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

    breadthFirstSearch(level1, visitor);

    expect(visitedNames).toEqual(['level1', 'level2', 'level3', 'level4']);
  });

  it('should handle wide tree structures', () => {
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

    breadthFirstSearch(wideRoot, visitor);

    expect(visitedNames).toEqual(['root', 'a', 'b', 'c', 'd']);
  });

  it('should handle mixed depth tree', () => {
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

    breadthFirstSearch(root, visitor);

    // BFS: root -> a, b -> c, d
    expect(visitedNames).toEqual(['root', 'a', 'b', 'c', 'd']);
  });

  it('should handle starting from non-root node', () => {
    const visitedNames: string[] = [];
    const visitor = vi.fn((node: any) => {
      visitedNames.push(node.escapedName);
    });

    breadthFirstSearch(mockChildNode1, visitor);

    // Should only traverse child1's subtree
    expect(visitedNames).toEqual(['child1', 'grandchild1']);
  });

  it('should pass correct node to visitor', () => {
    const visitor = vi.fn();

    breadthFirstSearch(mockChildNode1, visitor);

    expect(visitor).toHaveBeenCalledWith(mockChildNode1);
    expect(visitor).toHaveBeenCalledWith(mockGrandchildNode1);
  });
});
