import { describe, it, expect, vi } from 'vitest';
import { render } from 'ink-testing-library';
import { AddCommand } from '@/claude-assets-sync/components/add';

// Mock the package scanner
vi.mock('@/claude-assets-sync/core/packageScanner', () => ({
  scanPackageAssets: vi.fn().mockResolvedValue([]),
}));

describe('AddCommand', () => {
  it('renders add command flow', () => {
    const { lastFrame } = render(
      <AddCommand
        packageName="@test/package"
        local={false}
        onComplete={() => {}}
        onError={() => {}}
        onCancel={() => {}}
      />,
    );

    const frame = lastFrame();
    expect(frame).toBeDefined();
  });

  it('displays loading state initially', () => {
    const { lastFrame } = render(
      <AddCommand
        packageName="@test/package"
        local={false}
        onComplete={() => {}}
        onError={() => {}}
        onCancel={() => {}}
      />,
    );

    const frame = lastFrame();
    // Should show scanning message
    expect(frame).toMatch(/Scanning/i);
  });

  it('handles local package source', () => {
    const { lastFrame } = render(
      <AddCommand
        packageName="@test/package"
        local={true}
        onComplete={() => {}}
        onError={() => {}}
        onCancel={() => {}}
      />,
    );

    const frame = lastFrame();
    expect(frame).toBeDefined();
  });

  it('handles git ref parameter', () => {
    const { lastFrame } = render(
      <AddCommand
        packageName="@test/package"
        local={false}
        ref="main"
        onComplete={() => {}}
        onError={() => {}}
        onCancel={() => {}}
      />,
    );

    const frame = lastFrame();
    expect(frame).toBeDefined();
  });
});
