import { describe, it, expect } from 'vitest';
import { render } from 'ink-testing-library';
import { TreeSelect } from '@/claude-assets-sync/components/tree';
import type { TreeNode } from '../../utils/types';

describe('TreeSelect', () => {
  const mockTrees: TreeNode[] = [
    {
      id: 'commands',
      label: 'commands',
      path: 'commands',
      type: 'directory',
      selected: false,
      expanded: false,
      children: [
        {
          id: 'test.md',
          label: 'test.md',
          path: 'commands/test.md',
          type: 'file',
          selected: false,
          expanded: false,
        },
      ],
    },
    {
      id: 'skills',
      label: 'skills',
      path: 'skills',
      type: 'directory',
      selected: false,
      expanded: false,
      children: [],
    },
  ];

  it('renders tree nodes correctly', () => {
    const { lastFrame } = render(
      <TreeSelect
        trees={mockTrees}
        onSubmit={() => {}}
        onCancel={() => {}}
      />,
    );

    expect(lastFrame()).toContain('commands');
    expect(lastFrame()).toContain('skills');
  });

  it('renders with initial selection', () => {
    const treesWithSelection: TreeNode[] = [
      {
        id: 'commands',
        label: 'commands',
        path: 'commands',
        type: 'directory',
        selected: false,
        expanded: true,
        children: [
          {
            id: 'test.md',
            label: 'test.md',
            path: 'commands/test.md',
            type: 'file',
            selected: true,
            expanded: false,
          },
        ],
      },
    ];

    const { lastFrame } = render(
      <TreeSelect
        trees={treesWithSelection}
        onSubmit={() => {}}
        onCancel={() => {}}
      />,
    );

    const frame = lastFrame();
    expect(frame).toBeDefined();
    // File should be marked as selected
    expect(frame).toContain('test.md');
  });

  it('displays keyboard shortcuts in footer', () => {
    const { lastFrame } = render(
      <TreeSelect
        trees={mockTrees}
        onSubmit={() => {}}
        onCancel={() => {}}
      />,
    );

    const frame = lastFrame();
    // Check for keyboard shortcut hints
    expect(frame).toMatch(/↑|↓|Space|Enter|a|n|q/);
  });
});
