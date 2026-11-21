import { describe, expect, it } from 'vitest';

import { blueprint } from '../../core';
import { FormWarningCode } from '../../errors';

const codes = (schema: any) => {
  const seen: any[] = [];
  blueprint(schema, { collect: (d: any) => seen.push(d) } as any);
  return seen.map((d) => `${d.code}@${d.schemaPath}`);
};

describe('warnings through $ref', () => {
  it('W1 allOf branch via $ref with not warns like the inline branch', () => {
    const inline = codes({
      type: 'object',
      properties: { a: { type: 'string' } },
      allOf: [{ not: { required: ['a'] } }],
    });
    const viaRef = codes({
      type: 'object',
      properties: { a: { type: 'string' } },
      allOf: [{ $ref: '#/$defs/N' }],
      $defs: { N: { not: { required: ['a'] } } },
    });
    expect(inline.some((c) => c.includes(FormWarningCode.AllOfKeywordIgnoredForForm))).toBe(true);
    expect(viaRef.some((c) => c.includes(FormWarningCode.AllOfKeywordIgnoredForForm))).toBe(true);
  });

  it('W2 oneOf branch via $ref with if and no else:false warns', () => {
    const viaRef = codes({
      type: 'object',
      properties: { k: { type: 'string' } },
      oneOf: [{ $ref: '#/$defs/B' }, { properties: { y: { type: 'string' } } }],
      $defs: {
        B: { if: { properties: { k: { const: 'a' } } }, then: { properties: { x: { type: 'string' } } } },
      },
    });
    expect(viaRef.some((c) => c.includes(FormWarningCode.IfWithoutElseFalse))).toBe(true);
  });

  it('W3 null branch via $ref with properties warns', () => {
    const viaRef = codes({
      type: ['object', 'null'],
      oneOf: [{ $ref: '#/$defs/Nul' }, { type: 'object', properties: { y: { type: 'string' } } }],
      $defs: { Nul: { type: 'null', properties: { z: { type: 'string' } } } },
    });
    expect(viaRef.some((c) => c.includes(FormWarningCode.NullBranchIgnoredForForm))).toBe(true);
  });

  it('W4 LockOnNonTerminalObject does not fire for a terminal object', () => {
    const c = codes({
      type: 'object',
      properties: { o: { type: 'object', options: { terminal: true }, readOnly: true } },
    });
    expect(c.filter((x) => x.includes(FormWarningCode.LockOnNonTerminalObject))).toEqual([]);
  });

  it('W5 IfOnNonObjectHost for a nullable object host does not fire', () => {
    const c = codes({
      type: 'object',
      properties: {
        o: {
          type: ['object', 'null'],
          properties: { k: { type: 'string' } },
          if: { properties: { k: { const: 'a' } }, required: ['k'] },
          then: { properties: { x: { type: 'string' } } },
        },
      },
    });
    expect(c.filter((x) => x.includes(FormWarningCode.IfOnNonObjectHost))).toEqual([]);
  });

  it('W6 dependentSchemas inside $defs that is referenced warns once', () => {
    const c = codes({
      type: 'object',
      properties: { a: { $ref: '#/$defs/O' }, b: { $ref: '#/$defs/O' } },
      $defs: {
        O: { type: 'object', properties: { p: { type: 'string' } }, dependentSchemas: { p: {} } },
      },
    });
    expect(c.filter((x) => x.includes(FormWarningCode.DependentSchemasIgnoredForForm)).length).toBe(1);
  });
});

import { nodeFromJSONSchema } from '../../__tests__/fixtures/nodeFromJSONSchema';

describe('null branch shape through $ref', () => {
  const mk = (ref: boolean) => ({
    type: ['object', 'null'],
    properties: { y: { type: 'string' } },
    oneOf: [
      ref ? { $ref: '#/$defs/Nul' } : { type: 'null', properties: { z: { type: 'string', default: 'zz' } } },
      { type: 'object', properties: { y: { type: 'string' } } },
    ],
    $defs: { Nul: { type: 'null', properties: { z: { type: 'string', default: 'zz' } } } },
  });
  it('W7 null branch via $ref creates the same shape as inline', () => {
    const inline: any = nodeFromJSONSchema({ jsonSchema: mk(false) as any, defaultValue: {} as any });
    const ref: any = nodeFromJSONSchema({ jsonSchema: mk(true) as any, defaultValue: {} as any });
    expect(ref.children.map((c: any) => c.path)).toEqual(inline.children.map((c: any) => c.path));
    expect(ref.value).toEqual(inline.value);
  });
});
