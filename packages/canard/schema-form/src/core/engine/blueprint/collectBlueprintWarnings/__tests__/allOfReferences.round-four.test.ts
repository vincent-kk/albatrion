import { expect, it } from 'vitest';

import { FormWarningCode } from '@/schema-form/errors';

import { blueprint } from '../../blueprint';

it.each(['not', 'contains', 'dependentRequired', 'unevaluatedProperties'])(
  'allOf reference and inline %s emit equivalent warnings',
  (keyword) => {
    const part = {
      [keyword]:
        keyword === 'not'
          ? { required: ['name'] }
          : keyword === 'contains'
            ? { type: 'string' }
            : keyword === 'dependentRequired'
              ? { name: ['other'] }
              : false,
    };
    const warnings = (ref: boolean) => {
      const result: unknown[] = [];
      blueprint(
        {
          type: 'object',
          properties: { name: { type: 'string' } },
          allOf: [ref ? { $ref: '#/$defs/Part' } : part],
          $defs: { Part: part },
        },
        {
          collect: (record) => {
            if (record.code === FormWarningCode.AllOfKeywordIgnoredForForm)
              result.push({
                code: record.code,
                keyword: record.details.keyword,
              });
          },
        },
      );
      return result;
    };
    const inline = warnings(false);
    expect(inline).toEqual([
      { code: FormWarningCode.AllOfKeywordIgnoredForForm, keyword },
    ]);
    expect(warnings(true)).toEqual(inline);
  },
);
