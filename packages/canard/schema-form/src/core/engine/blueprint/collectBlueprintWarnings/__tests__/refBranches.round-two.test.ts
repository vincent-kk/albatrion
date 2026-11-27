import { describe, expect, it } from 'vitest';

import { FormWarningCode } from '../../../../../errors';
import { blueprint } from '../../blueprint';
import type { BlueprintSchema } from '../../types/schema';

describe('round-2 schema-form 9: referenced branch warning equivalence', () => {
  it.each([
    {
      code: FormWarningCode.IfWithoutElseFalse,
      branch: {
        if: { required: ['kind'] },
        then: { properties: { x: { type: 'string' } } },
      },
    },
    {
      code: FormWarningCode.NullBranchIgnoredForForm,
      branch: { type: 'null', properties: { z: { type: 'string' } } },
    },
  ])('matches inline warning $code', ({ code, branch }) => {
    const run = (ref: boolean) => {
      const codes: string[] = [];
      const schema: BlueprintSchema = {
        type: ['object', 'null'],
        $defs: { B: branch },
        oneOf: [
          ref ? { $ref: '#/$defs/B' } : branch,
          { type: 'object', properties: { y: { type: 'string' } } },
        ],
      };
      blueprint(schema, { collect: (record) => codes.push(record.code) });
      return codes.filter((item) => item === code);
    };
    const inline = run(false);
    expect(inline).toEqual([code]);
    expect(run(true)).toEqual(inline);
  });
});
