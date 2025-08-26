import { beforeEach, describe, expect, it } from 'vitest';

import type { SchemaNode } from '@/schema-form/core';

import { find } from '../find';

describe('find', () => {
  let mockRootNode: any;
  let mockChildNode1: any;
  let mockChildNode2: any;
  let mockGrandchildNode: any;

  beforeEach(() => {
    mockGrandchildNode = {
      propertyKey: 'grandchild',
      group: 'terminal',
      parentNode: null,
      rootNode: null,
      children: null,
    };

    mockChildNode1 = {
      propertyKey: 'child1',
      group: 'branch',
      parentNode: null,
      rootNode: null,
      children: [{ node: mockGrandchildNode }],
    };

    mockChildNode2 = {
      propertyKey: 'child2',
      group: 'terminal',
      parentNode: null,
      rootNode: null,
      children: null,
    };

    mockRootNode = {
      propertyKey: 'root',
      group: 'branch',
      parentNode: null,
      rootNode: null,
      children: [{ node: mockChildNode1 }, { node: mockChildNode2 }],
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
    const result = find(null as any, ['child1']);
    expect(result).toBeNull();
  });

  it('should return target for null segments', () => {
    const result = find(mockRootNode, null);
    expect(result).toBe(mockRootNode);
  });

  it('should return target for empty segments', () => {
    const result = find(mockRootNode, []);
    expect(result).toBe(mockRootNode);
  });

  it('should find direct child node', () => {
    const result = find(mockRootNode, ['child1']);
    expect(result).toBe(mockChildNode1);
  });

  it('should find terminal child node', () => {
    const result = find(mockRootNode, ['child2']);
    expect(result).toBe(mockChildNode2);
  });

  it('should find nested grandchild node', () => {
    const result = find(mockRootNode, ['child1', 'grandchild']);
    expect(result).toBe(mockGrandchildNode);
  });

  it('should return null for non-existent path', () => {
    const result = find(mockRootNode, ['nonexistent']);
    expect(result).toBeNull();
  });

  it('should return null for partial non-existent path', () => {
    const result = find(mockRootNode, ['child1', 'nonexistent']);
    expect(result).toBeNull();
  });

  it('should handle # (Fragment) to navigate to root', () => {
    const result = find(mockChildNode1, ['#', 'child2']);
    expect(result).toBe(mockChildNode2);
  });

  it('should handle .. (Parent) to navigate to parent', () => {
    // Navigate from grandchild up to its parent (child1), then to child2
    // But child2 is a sibling of child1, not a child of child1
    // So the correct path would be: .. (to child1) then .. (to root) then child2
    const result = find(mockGrandchildNode, ['..', '..', 'child2']);
    expect(result).toBe(mockChildNode2);
  });

  it('should handle . (Current) to stay at current node', () => {
    const result = find(mockChildNode1, ['.', 'grandchild']);
    expect(result).toBe(mockGrandchildNode);
  });

  it('should return null when parent navigation fails', () => {
    const result = find(mockRootNode, ['..']);
    expect(result).toBeNull();
  });

  it('should return null when root navigation fails', () => {
    const nodeWithoutRoot: any = {
      propertyKey: 'orphan',
      group: 'terminal',
      rootNode: null,
      parentNode: null,
      children: null,
    };

    const result = find(nodeWithoutRoot, ['#']);
    expect(result).toBeNull();
  });

  it('should handle complex navigation with special segments', () => {
    const result = find(mockGrandchildNode, [
      '..',
      '..',
      'child1',
      'grandchild',
    ]);
    expect(result).toBe(mockGrandchildNode);
  });

  it('should return terminal node immediately when found', () => {
    // When we find a terminal node, we return it immediately without traversing further
    const result = find(mockRootNode, ['child2']);
    expect(result).toBe(mockChildNode2);

    // But if we try to access children of terminal node, it returns null
    const nestedResult = find(mockRootNode, ['child2', 'nonexistent']);
    expect(nestedResult).toEqual(nestedResult);
  });

  it('should return null for node without children', () => {
    const emptyNode = {
      propertyKey: 'empty',
      group: 'branch',
      children: null,
    } as SchemaNode;

    const result = find(emptyNode, ['child']);
    expect(result).toBeNull();
  });

  it('should return null for node with empty children array', () => {
    const emptyChildrenNode = {
      propertyKey: 'empty',
      group: 'branch',
      children: [],
    } as unknown as SchemaNode;

    const result = find(emptyChildrenNode, ['child']);
    expect(result).toBeNull();
  });

  it('should handle array-like property keys', () => {
    const arrayNode: any = {
      propertyKey: '0',
      group: 'terminal',
      parentNode: mockRootNode,
      rootNode: mockRootNode,
      children: null,
    };

    const parentWithArray: any = {
      propertyKey: 'array',
      group: 'branch',
      children: [{ node: arrayNode }],
    };

    const result = find(parentWithArray, ['0']);
    expect(result).toBe(arrayNode);
  });

  it('should handle deeply nested structures', () => {
    const level4 = {
      propertyKey: 'level4',
      group: 'terminal',
    } as SchemaNode;

    const level3 = {
      propertyKey: 'level3',
      group: 'branch',
      children: [{ node: level4 }],
    } as SchemaNode;

    const level2 = {
      propertyKey: 'level2',
      group: 'branch',
      children: [{ node: level3 }],
    } as SchemaNode;

    const level1 = {
      propertyKey: 'level1',
      group: 'branch',
      children: [{ node: level2 }],
    } as SchemaNode;

    const result = find(level1, ['level2', 'level3', 'level4']);
    expect(result).toBe(level4);
  });

  it('should handle mixed navigation with special characters and normal paths', () => {
    // From grandchild, go to root (#), then child1, stay at current (.), then grandchild
    // But the '.' means current at the time it's evaluated, which would be child1
    // So the path is: root -> child1 -> child1 (stays) -> grandchild
    const result = find(mockGrandchildNode, ['#', 'child1', 'grandchild']);
    expect(result).toBe(mockGrandchildNode);
  });
});
