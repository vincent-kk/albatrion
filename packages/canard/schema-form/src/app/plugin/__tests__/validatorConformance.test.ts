import { describe, expect, it, vi } from 'vitest';

import type { ValidatorPlugin } from '../../../index';
import type { Validator } from '../../../core/validation';
import { readSchemaNodeGuard } from '../../../core/validation';
import { blueprint } from '../../../core/blueprint';
import { releaseValidationRoot, retainValidationRoot } from '../../../core';

describe('validator plugin contract', () => {
  it('34C-01 ValidatorPlugin satisfies Validator when compileGuard is provided', () => {
    const plugin = {
      compile: () => () => null,
      compileGuard: () => () => true,
      release: () => undefined,
      dialect: 'draft-07',
    } satisfies ValidatorPlugin;
    const validator: Validator = plugin;
    expect(validator.compileGuard({}, '')(null)).toBe(true);
    expect(validator.dialect).toBe('draft-07');
  });

  it('U8 runs ValidatorPlugin through retainValidationRoot and a core guard read', () => {
    const compile = vi.fn(() => () => null);
    const compileGuard = vi.fn(() => (value: unknown) => value === 'ready');
    const release = vi.fn();
    const plugin = { compile, compileGuard, release } satisfies ValidatorPlugin;
    const validator: Validator = plugin;
    const authored = { type: 'object', if: { const: 'ready' },
      then: { properties: { ready: { type: 'string' } } } };
    const analysis = blueprint(authored);
    const gate = analysis.nodes.flatMap((node) => node.declarations)
      .flatMap((declaration) => declaration.gates)
      .find((candidate) => candidate.kind === 'if');
    if (!gate) throw new Error('Expected an authored if guard');
    retainValidationRoot(validator, authored);
    expect(readSchemaNodeGuard({ blueprint: analysis, validator }, gate)?.('ready')).toBe(true);
    expect(compile).toHaveBeenCalledTimes(1);
    expect(compileGuard).toHaveBeenCalledTimes(1);
    releaseValidationRoot(validator, authored);
    expect(release).not.toHaveBeenCalled();
  });
});
