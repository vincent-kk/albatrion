import Ajv from 'ajv';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ajvValidatorPlugin } from '../validatorPlugin';

describe.each([true, false])('directGuardCompile=%s', (directGuardCompile) => {
  beforeEach(() => { ajvValidatorPlugin.configure({ directGuardCompile }); });
  afterEach(async () => {
    ajvValidatorPlugin.configure({ directGuardCompile: true });
    (await import('../validatorPlugin')).ajvValidatorPlugin.configure({ directGuardCompile: true });
  });
describe('VALIDATE-047 ajv6 case (i)', () => {
  it('resolves a relative $ref from an inner $id in the authored root', () => {
    ajvValidatorPlugin.bind!(new Ajv({ allErrors: true, format: false }));
    const root = {
      $id: 'https://example.test/guard-scope.json',
      type: 'object',
      definitions: {
        branch: {
          $id: 'nested/',
          definitions: { eligible: { properties: { kind: { const: 'yes' } }, required: ['kind'] } },
          if: { $ref: '#/definitions/eligible' },
          then: { required: ['accepted'] },
          else: { required: ['rejected'] },
        },
      },
      properties: { item: { $ref: 'nested/' } },
    } as const;
    const guard = ajvValidatorPlugin.compileGuard(root, '/definitions/branch/if');
    const direct = new Ajv({ allErrors: true, format: false }).compile(root);
    for (const [item, expected] of [
      [{ kind: 'yes', accepted: true }, true],
      [{ kind: 'no', rejected: true }, false],
    ] as const) {
      expect(guard(item)).toBe(expected);
      expect(direct({ item })).toBe(true);
    }
  });
});

});
