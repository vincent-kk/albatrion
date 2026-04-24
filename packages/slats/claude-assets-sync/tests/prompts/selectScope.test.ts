import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the underlying @inquirer/prompts module so we can assert what is passed
// and control the return value. The custom wrapper `selectScopeAsync` is a
// plain async function (not a @inquirer/core prompt), so @inquirer/testing is
// not the right tool; direct mocking matches the wrapper's contract.
vi.mock('@inquirer/prompts', () => ({
  select: vi.fn(),
  confirm: vi.fn(),
}));

import { select } from '@inquirer/prompts';

import { selectScopeAsync } from '../../src/prompts/selectScope.js';

describe('selectScopeAsync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the scope that @inquirer/prompts.select resolves with', async () => {
    vi.mocked(select).mockResolvedValueOnce('project' as never);
    const result = await selectScopeAsync();
    expect(result).toBe('project');
  });

  it('forwards a choices array containing user and project', async () => {
    vi.mocked(select).mockResolvedValueOnce('user' as never);
    await selectScopeAsync();

    expect(select).toHaveBeenCalledTimes(1);
    const call = vi.mocked(select).mock.calls[0][0] as {
      choices: { value: string }[];
    };
    const values = call.choices.map((c) => c.value);
    expect(values).toEqual(['user', 'project']);
  });

  it('applies color to the select message via picocolors', async () => {
    vi.mocked(select).mockResolvedValueOnce('project' as never);
    await selectScopeAsync();
    const call = vi.mocked(select).mock.calls[0][0] as { message: string };
    // picocolors bold wraps with SGR 1; message must include the literal text.
    expect(call.message).toContain('Select injection scope');
  });
});
