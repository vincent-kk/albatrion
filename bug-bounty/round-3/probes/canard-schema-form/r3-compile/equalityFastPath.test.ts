import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '../../__tests__/fixtures/nodeFromJSONSchema';

const tree = (jsonSchema: any, defaultValue?: any) =>
  nodeFromJSONSchema({ jsonSchema, defaultValue } as any) as any;

/**
 * `../x === L` takes the equality fast path; `../x === L || false` has the same
 * JavaScript meaning but compiles through the general function.
 */
const literals = [
  '""',
  "''",
  '"A"',
  '0',
  '-0',
  '1',
  '1e21',
  '0x10',
  '.5',
  '5.',
  'null',
  'true',
  'false',
  '"\\u0041"',
  '"\\x41"',
  '"\\u{41}"',
  "'a\\'b'",
];

const schemaTypes: [string, any, any[]][] = [
  ['string', { type: 'string' }, ['', 'A', "a'b", undefined]],
  ['number', { type: 'number' }, [0, -0, 1, 16, 0.5, 5, 1e21, undefined]],
  ['nullable string', { type: ['string', 'null'] }, [null, '', 'A']],
  ['boolean', { type: 'boolean' }, [true, false, undefined]],
  ['array', { type: 'array', items: { type: 'string' } }, [[], ['A']]],
  ['object', { type: 'object', properties: { a: { type: 'string' } } }, [{}, { a: 'A' }]],
];

const build = (xSchema: any, control: string, expression: string) =>
  ({
    type: 'object',
    properties: {
      x: xSchema,
      g: { type: 'string', default: 'g', controls: { [control]: expression } },
      d: { type: 'boolean', controls: { derived: expression } },
    },
  });

const observe = (root: any) => {
  const g = root.find('/g');
  return {
    gActive: g?.isActive ?? false,
    gVisible: g?.isVisible,
    gReadOnly: g?.isReadOnly,
    gDisabled: g?.isDisabled,
    d: root.find('/d')?.value,
  };
};

describe('equality fast path against the general expression function', () => {
  for (const control of ['active', 'visible', 'readOnly', 'disabled']) {
    for (const [label, xSchema, values] of schemaTypes) {
      it(`${control} on ${label}`, () => {
        const mismatches: any[] = [];
        for (const literal of literals) {
          const fast = `../x === ${literal}`;
          const slow = `../x === ${literal} || false`;
          for (const loadValue of values) {
            const a = tree(build(xSchema, control, fast), { x: loadValue });
            const b = tree(build(xSchema, control, slow), { x: loadValue });
            const ra = observe(a);
            const rb = observe(b);
            if (JSON.stringify(ra) !== JSON.stringify(rb))
              mismatches.push({ literal, phase: 'load', loadValue, fast: ra, slow: rb });
            for (const writeValue of values) {
              a.find('/x').setValue(writeValue);
              b.find('/x').setValue(writeValue);
              const wa = observe(a);
              const wb = observe(b);
              if (JSON.stringify(wa) !== JSON.stringify(wb))
                mismatches.push({ literal, phase: 'write', loadValue, writeValue, fast: wa, slow: wb });
            }
          }
        }
        expect(mismatches.slice(0, 6)).toEqual([]);
      });
    }
  }
});
