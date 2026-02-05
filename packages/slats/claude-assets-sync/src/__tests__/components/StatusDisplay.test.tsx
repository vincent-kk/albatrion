import { describe, it, expect } from 'vitest';
import { render } from 'ink-testing-library';
import { StatusDisplay, type PackageStatusItem } from '@/claude-assets-sync/components/status';

describe('StatusDisplay', () => {
  const mockPackages: PackageStatusItem[] = [
    {
      name: '@test/package-a',
      localVersion: '1.0.0',
      remoteVersion: '1.0.0',
      status: 'up-to-date' as const,
      syncedAt: '2024-01-01T00:00:00.000Z',
      files: {},
      fileCount: 0,
    },
    {
      name: '@test/package-b',
      localVersion: '2.0.0',
      remoteVersion: '1.5.0',
      status: 'outdated' as const,
      syncedAt: '2024-01-01T00:00:00.000Z',
      files: {},
      fileCount: 0,
    },
  ];

  it('renders package statuses', () => {
    const { lastFrame } = render(
      <StatusDisplay
        packages={mockPackages}
        loading={false}
        summary={{ upToDate: 1, outdated: 1, error: 0, unknown: 0 }}
      />
    );

    const frame = lastFrame();
    expect(frame).toContain('@test/package-a');
    expect(frame).toContain('@test/package-b');
  });

  it('shows correct status indicators', () => {
    const { lastFrame } = render(
      <StatusDisplay
        packages={mockPackages}
        loading={false}
        summary={{ upToDate: 1, outdated: 1, error: 0, unknown: 0 }}
      />
    );

    const frame = lastFrame();
    // Should show up-to-date status for package-a
    expect(frame).toContain('1.0.0');
    // Should show outdated status for package-b
    expect(frame).toContain('2.0.0');
    expect(frame).toContain('1.5.0');
  });

  it('displays summary statistics', () => {
    const { lastFrame } = render(
      <StatusDisplay
        packages={mockPackages}
        loading={false}
        summary={{ upToDate: 1, outdated: 1, error: 0, unknown: 0 }}
      />
    );

    const frame = lastFrame();
    // Should show summary with up to date count
    expect(frame).toContain('1 up to date');
    expect(frame).toContain('1 updates available');
  });

  it('handles empty package list', () => {
    const { lastFrame } = render(
      <StatusDisplay
        packages={[]}
        loading={false}
        summary={{ upToDate: 0, outdated: 0, error: 0, unknown: 0 }}
      />
    );

    const frame = lastFrame();
    // Empty list should still render the component
    expect(frame).toBeDefined();
  });

  it('shows loading state', () => {
    const { lastFrame } = render(
      <StatusDisplay
        packages={[]}
        loading={true}
        summary={{ upToDate: 0, outdated: 0, error: 0, unknown: 0 }}
      />
    );

    const frame = lastFrame();
    expect(frame).toContain('Checking package versions');
  });
});
