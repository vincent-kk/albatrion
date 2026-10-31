import { createHash } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { checkValidationAfterPaintRegistration } from '../checkValidationAfterPaintRegistration';
import { REGISTERED_ROUND6_RULES } from '../registeredRound6Rules';

const mocks = vi.hoisted(() => ({ exec: vi.fn() }));
vi.mock('node:child_process', async (importOriginal) => {
  const original = await importOriginal<typeof import('node:child_process')>();
  return {
    ...original,
    execFileSync: mocks.exec,
    default: { ...original, execFileSync: mocks.exec },
  };
});

const repositoryRoot = '/fixture-repository';
const registeredAt = '2026-10-31T14:00:00.000Z';
const contents = 'registered rule contents';
const sourceTree = '100644 blob F source';
const window = {
  at: '2026-10-31T14:01:00.000Z',
  quietStartedAt: registeredAt,
  toolCommit: 'f'.repeat(40),
};
/** Frozen metadata permits the historically empty round-6 F proof. */
const inputs = () => ({
  preregisteredCommit: REGISTERED_ROUND6_RULES.commit,
  ruleVersion: 'round-6',
  rulesSha256: createHash('sha256').update(contents).digest('hex'),
  sourceProof: { F: '' },
  bundles: { F: { commit: 'e'.repeat(40) } },
});

beforeEach(() => {
  mocks.exec.mockReset();
  mocks.exec.mockImplementation((_command, args) => {
    if (args[0] === 'ls-tree') return sourceTree;
    if (args[1] === '-s') return registeredAt;
    return contents;
  });
});

describe('validation-after-paint rule registration', () => {
  it('accepts quiet observation starting exactly at registration and the historical empty proof', () => {
    expect(
      checkValidationAfterPaintRegistration(inputs(), window, repositoryRoot),
    ).toBe('round-6');
  });

  it('rejects quiet observation before registration despite a later formal start', () => {
    expect(() =>
      checkValidationAfterPaintRegistration(
        inputs(),
        { ...window, quietStartedAt: '2026-10-31T13:59:59.999Z' },
        repositoryRoot,
      ),
    ).toThrow('Quiet observation must start at or after rule registration');
  });

  it('preserves an original-rule window before round-6 registration', () => {
    const original = {
      ...inputs(),
      preregisteredCommit: 'cfd4a9e2a',
      ruleVersion: undefined,
    };
    expect(
      checkValidationAfterPaintRegistration(
        original,
        { ...window, at: '2026-10-31T13:59:59.999Z' },
        repositoryRoot,
      ),
    ).toBeUndefined();
  });

  it('rejects an original-rule window at or after round-6 registration', () => {
    for (const at of [registeredAt, window.at])
      expect(() =>
        checkValidationAfterPaintRegistration(
          {
            ...inputs(),
            preregisteredCommit: 'cfd4a9e2a',
            ruleVersion: undefined,
          },
          { ...window, at },
          repositoryRoot,
        ),
      ).toThrow('Original-rule window must start before round-6 registration');
  });

  it('rejects an empty source proof for a version after round-6', () => {
    expect(() =>
      checkValidationAfterPaintRegistration(
        { ...inputs(), ruleVersion: 'round-7' },
        window,
        repositoryRoot,
      ),
    ).toThrow('F source proof must be non-empty after round-6');
  });

  it('rejects a future proof that differs from the F commit tree at the repository top', () => {
    expect(() =>
      checkValidationAfterPaintRegistration(
        {
          ...inputs(),
          ruleVersion: 'round-7',
          sourceProof: { F: 'wrong tree' },
        },
        window,
        repositoryRoot,
      ),
    ).toThrow('F source proof must match the committed product tree');
    expect(mocks.exec).toHaveBeenCalledWith(
      'git',
      [
        'ls-tree',
        '-r',
        'e'.repeat(40),
        '--',
        'packages/canard/schema-form/src',
      ],
      expect.objectContaining({ cwd: repositoryRoot }),
    );
  });

  it('still rejects an unsupported future version after its matching source proof passes', () => {
    expect(() =>
      checkValidationAfterPaintRegistration(
        { ...inputs(), ruleVersion: 'round-7', sourceProof: { F: sourceTree } },
        window,
        repositoryRoot,
      ),
    ).toThrow('Unsupported validation-after-paint rule version');
    expect(
      mocks.exec.mock.calls.some(([, args]) => args[0] === 'ls-tree'),
    ).toBe(true);
  });
});
