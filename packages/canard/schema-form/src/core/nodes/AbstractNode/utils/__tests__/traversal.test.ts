import { beforeEach, describe, expect, it } from 'vitest';

import type { SchemaNode } from '@/schema-form/core';

import { traversal } from '../traversal';

describe('find', () => {
  let mockRootNode: any;
  let mockChildNode1: any;
  let mockChildNode2: any;
  let mockGrandchildNode: any;

  beforeEach(() => {
    mockGrandchildNode = {
      name: 'grandchild',
      group: 'terminal',
      parentNode: null,
      rootNode: null,
      subnodes: null,
    };

    mockChildNode1 = {
      name: 'child1',
      group: 'branch',
      parentNode: null,
      rootNode: null,
      subnodes: [{ node: mockGrandchildNode }],
    };

    mockChildNode2 = {
      name: 'child2',
      group: 'terminal',
      parentNode: null,
      rootNode: null,
      subnodes: null,
    };

    mockRootNode = {
      name: 'root',
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

  it('should return null for null target', () => {
    const result = traversal(null as any, ['child1']);
    expect(result).toBeNull();
  });

  it('should return target for null segments', () => {
    const result = traversal(mockRootNode, null);
    expect(result).toBe(mockRootNode);
  });

  it('should return target for empty segments', () => {
    const result = traversal(mockRootNode, []);
    expect(result).toBe(mockRootNode);
  });

  it('should find direct child node', () => {
    const result = traversal(mockRootNode, ['child1']);
    expect(result).toBe(mockChildNode1);
  });

  it('should find terminal child node', () => {
    const result = traversal(mockRootNode, ['child2']);
    expect(result).toBe(mockChildNode2);
  });

  it('should find nested grandchild node', () => {
    const result = traversal(mockRootNode, ['child1', 'grandchild']);
    expect(result).toBe(mockGrandchildNode);
  });

  it('should return null for non-existent path', () => {
    const result = traversal(mockRootNode, ['nonexistent']);
    expect(result).toBeNull();
  });

  it('should return null for partial non-existent path', () => {
    const result = traversal(mockRootNode, ['child1', 'nonexistent']);
    expect(result).toBeNull();
  });

  it('should handle # (Fragment) to navigate to root', () => {
    const result = traversal(mockChildNode1, ['#', 'child2']);
    expect(result).toBe(mockChildNode2);
  });

  it('should handle .. (Parent) to navigate to parent', () => {
    // Navigate from grandchild up to its parent (child1), then to child2
    // But child2 is a sibling of child1, not a child of child1
    // So the correct path would be: .. (to child1) then .. (to root) then child2
    const result = traversal(mockGrandchildNode, ['..', '..', 'child2']);
    expect(result).toBe(mockChildNode2);
  });

  it('should handle . (Current) to stay at current node', () => {
    const result = traversal(mockChildNode1, ['.', 'grandchild']);
    expect(result).toBe(mockGrandchildNode);
  });

  it('should return null when parent navigation fails', () => {
    const result = traversal(mockRootNode, ['..']);
    expect(result).toBeNull();
  });

  it('should return null when root navigation fails', () => {
    const nodeWithoutRoot: any = {
      name: 'orphan',
      group: 'terminal',
      rootNode: null,
      parentNode: null,
      subnodes: null,
    };

    const result = traversal(nodeWithoutRoot, ['#']);
    expect(result).toBeNull();
  });

  it('should handle complex navigation with special segments', () => {
    const result = traversal(mockGrandchildNode, [
      '..',
      '..',
      'child1',
      'grandchild',
    ]);
    expect(result).toBe(mockGrandchildNode);
  });

  it('should return terminal node immediately when found', () => {
    // When we find a terminal node, we return it immediately without traversing further
    const result = traversal(mockRootNode, ['child2']);
    expect(result).toBe(mockChildNode2);

    // But if we try to access subnodes of terminal node, it returns null
    const nestedResult = traversal(mockRootNode, ['child2', 'nonexistent']);
    expect(nestedResult).toEqual(nestedResult);
  });

  it('should return null for node without subnodes', () => {
    const emptyNode = {
      name: 'empty',
      group: 'branch',
      subnodes: null,
    } as SchemaNode;

    const result = traversal(emptyNode, ['child']);
    expect(result).toBeNull();
  });

  it('should return null for node with empty subnodes array', () => {
    const emptyChildrenNode = {
      name: 'empty',
      group: 'branch',
      subnodes: [],
    } as unknown as SchemaNode;

    const result = traversal(emptyChildrenNode, ['child']);
    expect(result).toBeNull();
  });

  it('should handle array-like property keys', () => {
    const arrayNode: any = {
      name: '0',
      group: 'terminal',
      parentNode: mockRootNode,
      rootNode: mockRootNode,
      subnodes: null,
    };

    const parentWithArray: any = {
      name: 'array',
      group: 'branch',
      subnodes: [{ node: arrayNode }],
    };

    const result = traversal(parentWithArray, ['0']);
    expect(result).toBe(arrayNode);
  });

  it('should handle deeply nested structures', () => {
    const level4 = {
      name: 'level4',
      group: 'terminal',
    } as SchemaNode;

    const level3 = {
      name: 'level3',
      group: 'branch',
      subnodes: [{ node: level4 }],
    } as SchemaNode;

    const level2 = {
      name: 'level2',
      group: 'branch',
      subnodes: [{ node: level3 }],
    } as SchemaNode;

    const level1 = {
      name: 'level1',
      group: 'branch',
      subnodes: [{ node: level2 }],
    } as SchemaNode;

    const result = traversal(level1, ['level2', 'level3', 'level4']);
    expect(result).toBe(level4);
  });

  it('should handle mixed navigation with special characters and normal paths', () => {
    // From grandchild, go to root (#), then child1, stay at current (.), then grandchild
    // But the '.' means current at the time it's evaluated, which would be child1
    // So the path is: root -> child1 -> child1 (stays) -> grandchild
    const result = traversal(mockGrandchildNode, ['#', 'child1', 'grandchild']);
    expect(result).toBe(mockGrandchildNode);
  });
});
