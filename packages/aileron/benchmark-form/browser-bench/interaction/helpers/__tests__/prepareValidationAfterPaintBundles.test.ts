import { beforeEach, describe, expect, it, vi } from 'vitest';

import { prepareValidationAfterPaintBundles } from '../prepareValidationAfterPaintBundles';

const mocks = vi.hoisted(() => ({
  exec: vi.fn(),
  read: vi.fn(),
  write: vi.fn(),
}));
vi.mock('node:child_process', async (importOriginal) => {
  const original = await importOriginal<typeof import('node:child_process')>();
  return {
    ...original,
    execFileSync: mocks.exec,
    default: { ...original, execFileSync: mocks.exec },
  };
});
vi.mock('node:fs', () => ({
  default: {
    existsSync: () => false,
    readFileSync: mocks.read,
    writeFileSync: mocks.write,
  },
}));

const repositoryRoot = '/fixture-repository';
const baseline = '/fixture-baseline';
const head = 'f'.repeat(40);
let dirty = false;

beforeEach(() => {
  vi.clearAllMocks();
  dirty = false;
  mocks.read.mockReturnValue('{}');
  mocks.exec.mockImplementation((command, args, options) => {
    if (command !== 'git') return '';
    if (args[0] === 'rev-parse' && args[1] === '--show-toplevel')
      return repositoryRoot;
    if (args[0] === 'rev-parse')
      return options?.cwd === baseline
        ? 'facd72a71c44a798f5484827509073a27fb678a3'
        : head;
    if (args[0] === 'diff')
      return dirty && options?.cwd === repositoryRoot ? 'dirty F source' : '';
    if (args[0] === 'ls-tree')
      return options?.cwd === repositoryRoot ? '100644 blob F source' : '';
    return '';
  });
});

describe('validation-after-paint source preparation', () => {
  it('reads F source from the repository top when launched from a package', async () => {
    const inputs = await prepareValidationAfterPaintBundles(
      '/fixture-output.noindex',
      baseline,
    );
    expect(inputs.sourceProof.F).toBe('100644 blob F source');
    expect(mocks.exec).toHaveBeenCalledWith(
      'git',
      ['ls-tree', '-r', head, '--', 'packages/canard/schema-form/src'],
      expect.objectContaining({ cwd: repositoryRoot }),
    );
    expect(
      mocks.exec.mock.calls.filter(
        ([command, args]) => command === 'git' && args[1] === '--show-toplevel',
      ),
    ).toHaveLength(1);
  });

  it('rejects dirty F source before preparing any bundle', async () => {
    dirty = true;
    await expect(
      prepareValidationAfterPaintBundles('/fixture-output.noindex', baseline),
    ).rejects.toThrow();
    expect(mocks.exec.mock.calls.every(([command]) => command === 'git')).toBe(
      true,
    );
    expect(mocks.write).not.toHaveBeenCalled();
  });
});
