import { describe, expect, it } from 'vitest';

import { find, findNodes, walkSchemaNodes } from '../index';
import { createNode, type TestNode } from './fixtures/createNode';

// filid:contract navigation-shape
describe('navigation over the committed shape', () => {
  it('returns the starting node for an empty or null relative pointer', () => {
    const root = createNode('');
    const child = createNode('child', root);
    expect(find(child, '')).toBe(child);
    expect(findNodes(child, null)).toEqual([child]);
    expect(find(child, '#')).toBe(root);
  });

  it('resolves absolute paths from the live root', () => {
    const root = createNode('');
    const branch = createNode('branch', root);
    const leaf = createNode('leaf', branch, 'terminal');
    expect(find(branch, '/branch/leaf')).toBe(leaf);
    expect(find(branch, '#/branch/leaf')).toBe(leaf);
    expect(find(branch, ['#', 'branch', 'leaf'])).toBe(leaf);
  });

  it('decodes JSON Pointer names and rejects expression tokens', () => {
    const root = createNode('');
    const child = createNode('a~/b', root);
    expect(find(root, '/a~0~1b')).toBe(child);
    expect(find(root, '/@')).toBeNull();
    expect(findNodes(root, '@')).toEqual([]);
  });

  it('returns no node for an out-of-shape path or below a terminal', () => {
    const root = createNode('');
    const leaf = createNode('leaf', root, 'terminal');
    const absent = createNode('absent', root);
    delete root.structure?.absent;
    root.children = [leaf];
    expect(find(root, '/absent')).toBeNull();
    expect(findNodes(root, '/absent')).toEqual([]);
    expect(find(root, '/leaf/deeper')).toBeNull();
    expect(findNodes(root, '/leaf/deeper')).toEqual([]);
    expect(absent.path).toBe('/absent');
  });

  it('returns wildcard matches once in current path order', () => {
    const root = createNode('');
    const first = createNode('first', root);
    const second = createNode('second', root);
    if (root.structure !== null) root.structure.alias = first;
    expect(findNodes(root, '/*')).toEqual([first, second]);
    expect(find(root, '/*')).toBe(first);
  });

  it('resolves a virtual reference to the same canonical sibling instance', () => {
    const root = createNode('');
    const startDate = createNode('startDate', root);
    const period = createNode('period', root);
    period.structure = { startDate };
    period.children = [startDate];
    expect(find(root, '/period/startDate')).toBe(startDate);
    expect(find(root, '/period/startDate')?.path).toBe('/startDate');
  });

  it('walks parents first and does not revisit alias instances', () => {
    const root = createNode('');
    const first = createNode('first', root);
    const second = createNode('second', root);
    second.structure = { first };
    second.children = [first];
    const visited: TestNode[] = [];
    walkSchemaNodes(root, (node) => visited.push(node));
    expect(visited).toEqual([root, first, second]);
  });
});

// filid:contract navigation-detached
describe('detached navigation reads', () => {
  it('keeps relative reads in the removed subtree but resolves absolute paths live', () => {
    const root = createNode('');
    const oldBranch = createNode('branch', root);
    const oldChild = createNode('oldChild', oldBranch);
    oldBranch.detached = true;
    oldChild.detached = true;
    delete root.structure?.branch;
    root.children = [];
    const liveBranch = createNode('branch', root);
    const liveChild = createNode('liveChild', liveBranch);
    expect(find(oldBranch, 'oldChild')).toBe(oldChild);
    expect(find(oldBranch, '/branch/liveChild')).toBe(liveChild);
    expect(find(oldBranch, '/branch/oldChild')).toBeNull();
    expect(findNodes(oldBranch, 'oldChild')).toEqual([oldChild]);
  });

  it('does not escape a detached subtree through a relative parent step', () => {
    const root = createNode('');
    const branch = createNode('branch', root);
    const child = createNode('child', branch);
    branch.detached = true;
    child.detached = true;
    delete root.structure?.branch;
    root.children = [];
    createNode('live', root);
    expect(find(child, '..')).toBe(branch);
    expect(find(branch, '../live')).toBeNull();
    expect(find(branch, '/live')).not.toBeNull();
  });
});
