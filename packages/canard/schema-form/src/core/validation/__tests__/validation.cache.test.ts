import { describe, expect, it, vi } from 'vitest';
import type { Validator } from '../type';
import { readValidationEntry } from '../utils/cache/readValidationEntry';

describe('validator cache', () => {
  it('VALIDATE-048 shares one copy and whole-schema compile per validator and authored root', () => {
    const root = { type: 'object', controls: { active: true } };
    const compile = vi.fn(() => () => null);
    const compileGuard = vi.fn(() => () => true);
    const first: Validator = { compile, compileGuard };
    const second: Validator = { compile: vi.fn(() => () => null), compileGuard };
    const entry = readValidationEntry(first, root);
    expect(readValidationEntry(first, root)).toBe(entry);
    expect(entry.copy).not.toBe(root);
    expect(compile).toHaveBeenCalledTimes(1);
    expect(compile).toHaveBeenCalledWith(entry.copy);
    expect(readValidationEntry(first, { ...root })).not.toBe(entry);
    expect(readValidationEntry(second, root)).not.toBe(entry);
  });

  it('VALIDATE-044 core never binds a validator', () => {
    const bind = vi.fn();
    const validator = { compile: () => () => null,
      compileGuard: () => () => true, bind };
    readValidationEntry(validator, { type: 'string' });
    expect(bind).not.toHaveBeenCalled();
  });
});
