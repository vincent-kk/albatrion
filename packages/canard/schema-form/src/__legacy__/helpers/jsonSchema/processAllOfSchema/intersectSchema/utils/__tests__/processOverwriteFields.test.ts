import { describe, expect, test } from 'vitest';

import type { StringSchema } from '@/schema-form/types';

import { processOverwriteFields } from '../processOverwriteFields';

describe('processOverwriteFields', () => {
  test('all fields except First-Win and Special are overwritten', () => {
    const base: StringSchema = {
      type: 'string',
      title: 'Base Title', // First-Win field
      pattern: 'base-pattern', // Special field
      customField1: 'base-custom1',
      customField2: 'base-custom2',
    } as any;
    const source: Partial<StringSchema> = {
      title: 'Source Title', // ignored (First-Win)
      pattern: 'source-pattern', // ignored (Special)
      customField1: 'source-custom1', // overwritten
      customField3: 'source-custom3', // added
    } as any;

    processOverwriteFields(base, source);

    expect(base.title).toBe('Base Title'); // preserved
    expect(base.pattern).toBe('base-pattern'); // preserved
    expect((base as any).customField1).toBe('source-custom1'); // overwritten
    expect((base as any).customField2).toBe('base-custom2'); // preserved
    expect((base as any).customField3).toBe('source-custom3'); // added
  });

  test('all base fields are preserved and only allowed source fields are added/overwritten', () => {
    const base: StringSchema = {
      type: 'string',
      minLength: 5, // Special field (preserved)
      maxLength: 10, // Special field (preserved)
      customProp: 'base-value',
    } as any;
    const source: Partial<StringSchema> = {
      minLength: 3, // ignored (Special)
      maxLength: 15, // ignored (Special)
      customProp: 'source-value', // overwritten
      newProp: 'new-value', // added
    } as any;

    processOverwriteFields(base, source);

    expect(base.type).toBe('string');
    expect(base.minLength).toBe(5); // preserved
    expect(base.maxLength).toBe(10); // preserved
    expect((base as any).customProp).toBe('source-value'); // overwritten
    expect((base as any).newProp).toBe('new-value'); // added
  });

  test('undefined values are not added', () => {
    const base: StringSchema = {
      type: 'string',
      customField: 'base-value',
    } as any;
    const source: Partial<StringSchema> = {
      customField: 'source-value',
      undefinedField: undefined,
    } as any;

    processOverwriteFields(base, source);

    expect((base as any).customField).toBe('source-value');
    expect((base as any).undefinedField).toBeUndefined();
  });

  test('all Special fields are excluded', () => {
    const base: StringSchema = {
      type: 'string',
      enum: ['a'], // Special
      const: 'value', // Special
      required: ['field'], // Special
      pattern: 'pattern', // Special
      minimum: 0, // Special
      maximum: 100, // Special
      customField: 'base',
    } as any;
    const source: Partial<StringSchema> = {
      enum: ['b'], // ignored
      const: 'other', // ignored
      required: ['other'], // ignored
      pattern: 'other', // ignored
      minimum: 10, // ignored
      maximum: 50, // ignored
      customField: 'source', // overwritten
    } as any;

    processOverwriteFields(base, source);

    expect(base.enum).toEqual(['a']); // preserved
    expect(base.const).toBe('value'); // preserved
    expect(base.required).toEqual(['field']); // preserved
    expect(base.pattern).toBe('pattern'); // preserved
    expect((base as any).minimum).toBe(0); // preserved
    expect((base as any).maximum).toBe(100); // preserved
    expect((base as any).customField).toBe('source'); // overwritten
  });
});
