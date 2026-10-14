import { describe, expect, it, vi } from 'vitest';

import { blueprint } from '../../blueprint';
import type { Validator } from '../type';
import { readFieldNodeGuard } from '../utils/guard/readFieldNodeGuard';
import { releaseValidationRoot } from '../utils/lifetime/releaseValidationRoot';
import { retainValidationRoot } from '../utils/lifetime/retainValidationRoot';

describe('validator lifetime and guard read', () => {
  it('U8 runs ValidatorPlugin through retainValidationRoot and a core guard read', () => {
    const compile = vi.fn(() => () => null);
    const compileGuard = vi.fn(() => (value: unknown) => value === 'ready');
    const release = vi.fn();
    const plugin = { compile, compileGuard, release };
    const validator: Validator = plugin;
    const authored = {
      type: 'object',
      if: { const: 'ready' },
      then: { properties: { ready: { type: 'string' } } },
    };
    const analysis = blueprint(authored);
    const gate = analysis.nodes
      .flatMap((node) => node.declarations)
      .flatMap((declaration) => declaration.gates)
      .find((candidate) => candidate.kind === 'if');
    if (!gate) throw new Error('Expected an authored if guard');
    retainValidationRoot(validator, authored);
    expect(
      readFieldNodeGuard({ blueprint: analysis, validator }, gate)?.('ready'),
    ).toBe(true);
    expect(compile).toHaveBeenCalledTimes(1);
    expect(compileGuard).toHaveBeenCalledTimes(1);
    releaseValidationRoot(validator, authored);
    expect(release).not.toHaveBeenCalled();
  });
});
