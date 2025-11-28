import { describe, expect, test } from 'vitest';

import type { StringSchema } from '@/schema-form/types';

import { processFirstWinFields } from '../processFirstWinFields';

describe('processFirstWinFields', () => {
  test('First-Win fields in base are preserved', () => {
    const base: StringSchema = {
      type: 'string',
      title: 'Base Title',
      format: 'email',
      description: 'Base Description',
    };
    const source: Partial<StringSchema> = {
      title: 'Source Title',
      format: 'uri',
      examples: ['example'],
    };

    processFirstWinFields(base, source);

    expect(base.title).toBe('Base Title');
    expect(base.format).toBe('email');
    expect(base.description).toBe('Base Description');
    expect(base.examples).toEqual(['example']); // not in base, so taken from source
  });

  test('First-Win fields not in base are taken from source', () => {
    const base: StringSchema = { type: 'string' };
    const source: Partial<StringSchema> = {
      title: 'Source Title',
      format: 'uri',
      description: 'Source Description',
      readOnly: true,
      writeOnly: false,
    };

    processFirstWinFields(base, source);

    expect(base.title).toBe('Source Title');
    expect(base.format).toBe('uri');
    expect(base.description).toBe('Source Description');
    expect(base.readOnly).toBe(true);
    expect(base.writeOnly).toBe(false);
  });

  test('fields not in both are not included in result', () => {
    const base: StringSchema = { type: 'string' };
    const source: Partial<StringSchema> = {};

    processFirstWinFields(base, source);

    expect(base.title).toBeUndefined();
    expect(base.format).toBeUndefined();
    expect(base.description).toBeUndefined();
  });

  test('processes all First-Win fields', () => {
    const base: StringSchema = {
      type: 'string',
      title: 'Base Title',
      $comment: 'Base Comment',
    };
    const source: Partial<StringSchema> = {
      title: 'Source Title', // ignored
      description: 'Source Description', // used
      examples: ['example'], // used
      default: 'default', // used
      readOnly: true, // used
      writeOnly: false, // used
      format: 'email', // used
    };

    processFirstWinFields(base, source);

    expect(base.title).toBe('Base Title');
    expect(base['$comment']).toBe('Base Comment');
    expect(base.description).toBe('Source Description');
    expect(base.examples).toEqual(['example']);
    expect(base.default).toBe('default');
    expect(base.readOnly).toBe(true);
    expect(base.writeOnly).toBe(false);
    expect(base.format).toBe('email');
  });
});
