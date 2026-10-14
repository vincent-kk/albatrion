import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createValidator } from '../../default/createValidator';
import { ajvValidatorPlugin } from '../../default/validatorPlugin';

describe.each([true, false])('directGuardCompile=%s', (directGuardCompile) => {
  beforeEach(() => ajvValidatorPlugin.configure({ directGuardCompile }));
  afterEach(() => ajvValidatorPlugin.configure({ directGuardCompile: true }));

  it('rejects a pointer that locates a non-schema value', () => {
    const root = {
      $id: 'https://example.test/guard-pointer',
      type: 'string',
    } as unknown as JSONSchema;
    expect(() => ajvValidatorPlugin.compileGuard(root, '/type')).toThrowError(
      expect.objectContaining({
        name: 'GuardPointerNotSchemaError',
        group: 'UNHANDLED_ERROR',
        code: 'GUARD_POINTER_NOT_SCHEMA',
        details: {
          root: 'https://example.test/guard-pointer',
          pointer: '/type',
        },
      }),
    );

    const noId = { type: 'string' } as unknown as JSONSchema;
    expect(() => ajvValidatorPlugin.compileGuard(noId, '/type')).toThrowError(
      expect.objectContaining({
        name: 'GuardPointerNotSchemaError',
        group: 'UNHANDLED_ERROR',
        code: 'GUARD_POINTER_NOT_SCHEMA',
        details: { root: '', pointer: '/type' },
      }),
    );

    const union = { type: ['string', 'null'] } as unknown as JSONSchema;
    expect(() => ajvValidatorPlugin.compileGuard(union, '/type')).toThrowError(
      expect.objectContaining({
        code: 'GUARD_POINTER_NOT_SCHEMA',
        details: { root: '', pointer: '/type' },
      }),
    );
  });

  it('rejects a pointer that locates no value', () => {
    const root = {
      $id: 'https://example.test/guard-missing',
      type: 'string',
    } as unknown as JSONSchema;
    let thrown: unknown;
    try {
      ajvValidatorPlugin.compileGuard(root, '/nope');
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeInstanceOf(Error);
    expect(thrown).toMatchObject({
      name: 'GuardPointerNotSchemaError',
      message: 'guard pointer does not locate a schema: /nope',
      group: 'UNHANDLED_ERROR',
      code: 'GUARD_POINTER_NOT_SCHEMA',
      details: {
        root: 'https://example.test/guard-missing',
        pointer: '/nope',
      },
    });
  });

  it('isolates two roots with the same $id at a schema-valued sub-pointer', async () => {
    const rootA = {
      $id: 'https://example.test/guard-same',
      type: 'object',
      properties: { v: { type: 'string' } },
    } as unknown as JSONSchema;
    const sameId = {
      $id: 'https://example.test/guard-same',
      type: 'object',
      properties: { v: { type: 'number' } },
    } as unknown as JSONSchema;

    expect(await ajvValidatorPlugin.compile(rootA)({ v: 'x' })).toBeNull();
    expect(await ajvValidatorPlugin.compile(sameId)({ v: 1 })).toBeNull();
    const a = ajvValidatorPlugin.compileGuard(rootA, '/properties/v');
    expect(a('x')).toBe(true);
    expect(a(2)).toBe(false);
    const b = ajvValidatorPlugin.compileGuard(sameId, '/properties/v');
    expect(b(2)).toBe(true);
    expect(b('x')).toBe(false);
    ajvValidatorPlugin.release(rootA);
    ajvValidatorPlugin.release(sameId);
  });
});

it('rejects the pointer through a per-instance createValidator object', () => {
  const root = {
    $id: 'https://example.test/guard-pointer',
    type: 'string',
  } as unknown as JSONSchema;
  expect(() =>
    createValidator(new Ajv({ strict: false })).compileGuard(root, '/type'),
  ).toThrowError(
    expect.objectContaining({
      name: 'GuardPointerNotSchemaError',
      group: 'UNHANDLED_ERROR',
      code: 'GUARD_POINTER_NOT_SCHEMA',
      details: { root: 'https://example.test/guard-pointer', pointer: '/type' },
    }),
  );
});
