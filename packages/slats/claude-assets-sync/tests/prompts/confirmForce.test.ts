import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@inquirer/prompts', () => ({
  select: vi.fn(),
  confirm: vi.fn(),
}));

import { confirm } from '@inquirer/prompts';

import { confirmForceAsync } from '../../src/prompts/confirmForce.js';

describe('confirmForceAsync', () => {
  let stderrWrite: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    stderrWrite = vi
      .spyOn(process.stderr, 'write')
      .mockImplementation(() => true);
  });

  afterEach(() => {
    stderrWrite.mockRestore();
    vi.clearAllMocks();
  });

  it('returns true when @inquirer/prompts.confirm resolves true', async () => {
    vi.mocked(confirm).mockResolvedValueOnce(true);
    await expect(
      confirmForceAsync(2, 0, ['a.md', 'b.md']),
    ).resolves.toBe(true);
  });

  it('returns false when @inquirer/prompts.confirm resolves false', async () => {
    vi.mocked(confirm).mockResolvedValueOnce(false);
    await expect(
      confirmForceAsync(1, 1, ['only.md']),
    ).resolves.toBe(false);
  });

  it('defaults to false for the confirm prompt', async () => {
    vi.mocked(confirm).mockResolvedValueOnce(false);
    await confirmForceAsync(1, 0, ['x.md']);
    const call = vi.mocked(confirm).mock.calls[0][0] as { default: boolean };
    expect(call.default).toBe(false);
  });

  it('pre-prints the diverged/orphan preamble to stderr (not stdout)', async () => {
    vi.mocked(confirm).mockResolvedValueOnce(false);
    await confirmForceAsync(3, 0, ['a.md', 'b.md', 'c.md']);
    expect(stderrWrite).toHaveBeenCalled();
    const joinedOutput = stderrWrite.mock.calls
      .map((c) => c[0] as string)
      .join('');
    expect(joinedOutput).toContain('3 diverged file(s)');
    expect(joinedOutput).toContain('a.md');
    expect(joinedOutput).toContain('b.md');
    expect(joinedOutput).toContain('c.md');
  });

  it('renders an orphan segment when orphanCount > 0', async () => {
    vi.mocked(confirm).mockResolvedValueOnce(false);
    await confirmForceAsync(0, 2, ['x.md', 'y.md']);
    const joinedOutput = stderrWrite.mock.calls
      .map((c) => c[0] as string)
      .join('');
    expect(joinedOutput).toContain('delete 2 orphan(s)');
  });

  it('truncates the list with "and N more" when divergedCount + orphanCount > relPaths.length', async () => {
    vi.mocked(confirm).mockResolvedValueOnce(false);
    await confirmForceAsync(10, 0, ['a.md', 'b.md', 'c.md']);
    const joinedOutput = stderrWrite.mock.calls
      .map((c) => c[0] as string)
      .join('');
    expect(joinedOutput).toContain('and 7 more');
  });
});
