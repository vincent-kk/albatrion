import { act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  FormWarningCode,
  type JSONSchema,
  ValidationMode,
} from '@/schema-form';
import { ErrorVisibility } from '@/schema-form/types';

import { renderForm } from '../renderForm';

describe('discriminator union boundaries through the public Form', () => {
  it('U5 C10/C11 warns once per unreachable branch and never renders it while reachable branches work', async () => {
    const schema = {
      type: 'object',
      controls: { discriminator: 'kind' },
      properties: { kind: { type: 'string' } },
      oneOf: [
        {
          properties: {
            kind: { const: 'a' },
            a: { type: 'string', default: 'A' },
          },
        },
        {
          properties: {
            kind: { const: 'b' },
            b: { type: 'string', default: 'B' },
          },
        },
        { properties: { kind: { const: 1 }, untyped: { type: 'string' } } },
        {
          properties: {
            kind: { type: 'number', const: 2 },
            typed: { type: 'string' },
          },
        },
        { properties: { kind: { enum: [] }, empty: { type: 'string' } } },
        {
          properties: {
            kind: { const: 'never', enum: ['other'] },
            disjoint: { type: 'string' },
          },
        },
        {
          properties: {
            kind: {
              type: 'string',
              enum: ['first'],
              allOf: [{ enum: ['second'] }],
            },
            conjunction: { type: 'string' },
          },
        },
      ],
    } satisfies JSONSchema;
    const onError = vi.fn();
    const onSubmit = vi.fn();
    const form = await renderForm(schema, {
      defaultValue: { kind: 'a' },
      onError,
      validationMode: ValidationMode.None,
      onSubmit,
    });
    try {
      const expected = [
        { schemaPath: '#/oneOf/2', reason: 'kind' },
        { schemaPath: '#/oneOf/3', reason: 'kind' },
        { schemaPath: '#/oneOf/4', reason: 'empty' },
        { schemaPath: '#/oneOf/5', reason: 'empty' },
        { schemaPath: '#/oneOf/6', reason: 'empty' },
      ].map(({ schemaPath, reason }) => ({
        code: FormWarningCode.DiscriminatorBranchUnreachable,
        level: 'warning',
        path: undefined,
        schemaPath,
        details: { propertyName: 'kind', reason },
        origin: 'load',
      }));
      expect(
        form
          .errorRecords()
          .map(({ code, level, path, schemaPath, details, origin }) => ({
            code,
            level,
            path,
            schemaPath,
            details,
            origin,
          })),
      ).toEqual(expected);
      expect(onError).toHaveBeenCalledTimes(5);
      expect(form.value('/a')).toBe('A');
      expect(form.exists('/b')).toBe(false);
      expect(form.handle.getValue()).toEqual({ kind: 'a', a: 'A' });

      for (const tag of [
        'b',
        'never',
        'other',
        'first',
        'second',
        '1',
        '2',
        'a',
      ]) {
        await form.type('/kind', tag);
        for (const path of [
          '/untyped',
          '/typed',
          '/empty',
          '/disjoint',
          '/conjunction',
        ]) {
          expect(form.exists(path)).toBe(false);
          expect(form.field(path)).toBeNull();
        }
        expect(form.exists('/a')).toBe(tag === 'a');
        expect(form.exists('/b')).toBe(tag === 'b');
        const expectedValue =
          tag === 'a'
            ? { kind: tag, a: 'A' }
            : tag === 'b'
              ? { kind: tag, b: 'B' }
              : { kind: tag };
        expect(form.handle.getValue()).toEqual(expectedValue);
      }
      await form.type('/kind', 'b');
      expect(form.value('/b')).toBe('B');
      expect(form.handle.getValue()).toEqual({ kind: 'b', b: 'B' });
      await act(async () => {
        await form.handle.submit();
      });
      expect(onSubmit).toHaveBeenCalledExactlyOnceWith({ kind: 'b', b: 'B' });
      expect(form.errorRecords()).toHaveLength(5);
      expect(onError).toHaveBeenCalledTimes(5);
      expect(form.caughtErrors()).toEqual([]);
    } finally {
      form.unmount();
    }
  });

  it('U6 C5 keeps an untagged common branch beside the selected branch', async () => {
    const schema = {
      type: 'object',
      controls: { discriminator: 'kind' },
      properties: { kind: { type: 'string', enum: ['a', 'b', 'none'] } },
      anyOf: [
        { properties: { common: { type: 'string', default: 'shared' } } },
        {
          properties: {
            kind: { const: 'a' },
            a: { type: 'string', default: 'A' },
          },
        },
        {
          properties: {
            kind: { const: 'b' },
            b: { type: 'string', default: 'B' },
          },
        },
      ],
    } satisfies JSONSchema;
    const onSubmit = vi.fn();
    const form = await renderForm(schema, {
      defaultValue: { kind: 'a' },
      onSubmit,
      validationMode: ValidationMode.None,
    });
    try {
      expect(form.value('/common')).toBe('shared');
      expect(form.value('/a')).toBe('A');
      expect(form.exists('/b')).toBe(false);
      await form.type('/common', 'edited-common');
      await form.selectOption('/kind', 'b');
      expect(form.value('/common')).toBe('edited-common');
      expect(form.exists('/a')).toBe(false);
      expect(form.value('/b')).toBe('B');
      expect(form.handle.getValue()).toEqual({
        kind: 'b',
        common: 'edited-common',
        b: 'B',
      });
      await form.selectOption('/kind', 'none');
      expect(form.value('/common')).toBe('edited-common');
      expect(form.exists('/a')).toBe(false);
      expect(form.exists('/b')).toBe(false);
      expect(form.handle.getValue()).toEqual({
        kind: 'none',
        common: 'edited-common',
      });
      await act(async () => {
        await form.handle.submit();
      });
      expect(onSubmit).toHaveBeenCalledExactlyOnceWith({
        kind: 'none',
        common: 'edited-common',
      });
      expect(form.errorRecords()).toEqual([]);
    } finally {
      form.unmount();
    }
  });

  it('U7 selects nested unions by separate keys and removes the inner union on outer exit', async () => {
    const schema = {
      type: 'object',
      controls: { discriminator: 'kind' },
      properties: { kind: { type: 'string', enum: ['nested', 'flat'] } },
      oneOf: [
        {
          properties: {
            kind: { const: 'nested' },
            detail: {
              type: 'object',
              controls: { discriminator: 'mode' },
              properties: {
                mode: { type: 'string', enum: ['x', 'y'], default: 'x' },
              },
              oneOf: [
                {
                  properties: {
                    mode: { const: 'x' },
                    x: { type: 'string', default: 'X' },
                  },
                },
                {
                  properties: {
                    mode: { const: 'y' },
                    y: { type: 'string', default: 'Y' },
                  },
                },
              ],
            },
          },
        },
        {
          properties: {
            kind: { const: 'flat' },
            flat: { type: 'string', default: 'flat' },
          },
        },
      ],
    } satisfies JSONSchema;
    const onSubmit = vi.fn();
    const form = await renderForm(schema, {
      defaultValue: { kind: 'nested' },
      validationMode: ValidationMode.None,
      onSubmit,
    });
    try {
      expect(form.value('/detail/mode')).toBe('x');
      expect(form.value('/detail/x')).toBe('X');
      expect(form.exists('/detail/y')).toBe(false);
      expect(form.exists('/flat')).toBe(false);
      expect(form.handle.getValue()).toEqual({
        kind: 'nested',
        detail: { mode: 'x', x: 'X' },
      });
      await form.selectOption('/detail/mode', 'y');
      expect(form.value('/kind')).toBe('nested');
      expect(form.exists('/detail/x')).toBe(false);
      expect(form.value('/detail/y')).toBe('Y');
      expect(form.handle.getValue()).toEqual({
        kind: 'nested',
        detail: { mode: 'y', y: 'Y' },
      });
      await form.selectOption('/kind', 'flat');
      expect(form.exists('/detail')).toBe(false);
      expect(form.field('/detail/mode')).toBeNull();
      expect(form.exists('/detail/x')).toBe(false);
      expect(form.exists('/detail/y')).toBe(false);
      expect(form.value('/flat')).toBe('flat');
      expect(form.handle.getValue()).toEqual({ kind: 'flat', flat: 'flat' });
      await act(async () => {
        await form.handle.submit();
      });
      expect(onSubmit).toHaveBeenCalledExactlyOnceWith({
        kind: 'flat',
        flat: 'flat',
      });
      await form.selectOption('/kind', 'nested');
      expect(form.value('/detail/mode')).toBe('y');
      expect(form.value('/detail/y')).toBe('Y');
      expect(form.exists('/detail/x')).toBe(false);
      expect(form.exists('/flat')).toBe(false);
      expect(form.handle.getValue()).toEqual({
        kind: 'nested',
        detail: { mode: 'y', y: 'Y' },
      });
      expect(form.errorRecords()).toEqual([]);
    } finally {
      form.unmount();
    }
  });

  it('U8 requires both the matching tag and the branch active gate', async () => {
    const schema = {
      type: 'object',
      controls: { discriminator: 'kind' },
      properties: {
        kind: { type: 'string', enum: ['a', 'b'] },
        enabled: { type: 'boolean' },
      },
      oneOf: [
        {
          controls: { active: './enabled === true' },
          properties: {
            kind: { const: 'a' },
            a: { type: 'string', default: 'A' },
          },
        },
        {
          properties: {
            kind: { const: 'b' },
            b: { type: 'string', default: 'B' },
          },
        },
      ],
    } satisfies JSONSchema;
    const form = await renderForm(schema, {
      defaultValue: { kind: 'a', enabled: false },
      validationMode: ValidationMode.None,
    });
    try {
      expect(form.exists('/a')).toBe(false);
      expect(form.exists('/b')).toBe(false);
      expect(form.handle.getValue()).toEqual({ kind: 'a', enabled: false });
      await form.toggle('/enabled');
      expect(form.value('/a')).toBe('A');
      expect(form.exists('/b')).toBe(false);
      expect(form.handle.getValue()).toEqual({
        kind: 'a',
        enabled: true,
        a: 'A',
      });
      await form.selectOption('/kind', 'b');
      expect(form.exists('/a')).toBe(false);
      expect(form.value('/b')).toBe('B');
      expect(form.handle.getValue()).toEqual({
        kind: 'b',
        enabled: true,
        b: 'B',
      });
      await form.toggle('/enabled');
      expect(form.exists('/a')).toBe(false);
      expect(form.value('/b')).toBe('B');
      await form.selectOption('/kind', 'a');
      expect(form.exists('/a')).toBe(false);
      expect(form.exists('/b')).toBe(false);
      expect(form.handle.getValue()).toEqual({ kind: 'a', enabled: false });
      await form.toggle('/enabled');
      expect(form.value('/a')).toBe('A');
      expect(form.errorRecords()).toEqual([]);
    } finally {
      form.unmount();
    }
  });

  it('U9 leaves all branch fields absent for null and selects a branch for an object', async () => {
    const schema = {
      type: 'object',
      properties: {
        target: {
          type: ['object', 'null'],
          controls: { discriminator: 'kind' },
          properties: { kind: { type: 'string', enum: ['a', 'b'] } },
          oneOf: [
            {
              properties: {
                kind: { const: 'a' },
                a: { type: 'string', default: 'A' },
              },
            },
            {
              properties: {
                kind: { const: 'b' },
                b: { type: 'string', default: 'B' },
              },
            },
          ],
        },
      },
    } satisfies JSONSchema;
    const onSubmit = vi.fn();
    const form = await renderForm(schema, {
      defaultValue: { target: null },
      validationMode: ValidationMode.None,
      onSubmit,
    });
    try {
      expect(form.exists('/target/a')).toBe(false);
      expect(form.exists('/target/b')).toBe(false);
      expect(form.handle.getValue()).toEqual({ target: null });
      await form.setValue({ target: { kind: 'a' } });
      expect(form.field('/target/kind')).not.toBeNull();
      expect(form.value('/target/a')).toBe('A');
      expect(form.exists('/target/b')).toBe(false);
      expect(form.handle.getValue()).toEqual({ target: { kind: 'a', a: 'A' } });
      await form.selectOption('/target/kind', 'b');
      expect(form.exists('/target/a')).toBe(false);
      expect(form.value('/target/b')).toBe('B');
      expect(form.handle.getValue()).toEqual({ target: { kind: 'b', b: 'B' } });
      await form.setValue({ target: null });
      expect(form.exists('/target/a')).toBe(false);
      expect(form.exists('/target/b')).toBe(false);
      expect(form.handle.getValue()).toEqual({ target: null });
      await act(async () => {
        await form.handle.submit();
      });
      expect(onSubmit).toHaveBeenCalledExactlyOnceWith({ target: null });
      expect(form.errorRecords()).toEqual([]);
    } finally {
      form.unmount();
    }
  });

  it('U10 validates with AJV, drops departed branch errors, and submits a valid selected branch', async () => {
    const schema = {
      type: 'object',
      controls: { discriminator: 'kind' },
      properties: { kind: { type: 'string', enum: ['a', 'b'] } },
      required: ['kind'],
      oneOf: [
        {
          properties: {
            kind: { const: 'a' },
            a: {
              type: 'string',
              minLength: 3,
              presentation: { errorMessages: { minLength: 'A_TOO_SHORT' } },
            },
          },
          required: ['a'],
        },
        {
          properties: {
            kind: { const: 'b' },
            b: {
              type: 'string',
              minLength: 3,
              presentation: { errorMessages: { minLength: 'B_TOO_SHORT' } },
            },
          },
          required: ['b'],
        },
      ],
    } satisfies JSONSchema;
    const onSubmit = vi.fn();
    const form = await renderForm(schema, {
      defaultValue: { kind: 'a', a: 'x' },
      validator: true,
      validationMode: ValidationMode.OnChange,
      errorVisibility: ErrorVisibility.Always,
      onSubmit,
    });
    try {
      const initialErrors = await form.validate();
      expect(initialErrors).toContainEqual(
        expect.objectContaining({ dataPath: '/a', keyword: 'minLength' }),
      );
      expect(form.node('/a')?.errors).toContainEqual(
        expect.objectContaining({ dataPath: '/a', keyword: 'minLength' }),
      );
      expect(form.node('/b')).toBeNull();
      expect(form.errorTexts()).toContain('A_TOO_SHORT');
      expect(form.exists('/b')).toBe(false);
      expect(onSubmit).not.toHaveBeenCalled();

      await form.selectOption('/kind', 'b');
      expect(form.exists('/a')).toBe(false);
      expect(form.field('/b')).not.toBeNull();
      const switchedErrors = await form.validate();
      expect(switchedErrors).toContainEqual(
        expect.objectContaining({ dataPath: '/b', keyword: 'required' }),
      );
      expect(form.node('/a')).toBeNull();
      expect(form.node('/b')?.errors).toContainEqual(
        expect.objectContaining({ dataPath: '/b', keyword: 'required' }),
      );
      expect(
        form.node('/b')?.errors.some(({ dataPath }) => dataPath === '/a'),
      ).toBe(false);
      expect(form.errorTexts()).not.toContain('A_TOO_SHORT');
      expect(form.handle.getValue()).not.toHaveProperty('a');

      await form.type('/b', 'valid-b');
      expect(await form.validate()).toEqual([]);
      expect(form.getErrors()).toEqual([]);
      expect(form.errorTexts()).toEqual([]);
      expect(form.value('/b')).toBe('valid-b');
      expect(form.handle.getValue()).toEqual({ kind: 'b', b: 'valid-b' });
      await act(async () => {
        await form.handle.submit();
      });
      expect(onSubmit).toHaveBeenCalledExactlyOnceWith({
        kind: 'b',
        b: 'valid-b',
      });
      expect(form.errorRecords()).toEqual([]);
      expect(form.caughtErrors()).toEqual([]);
    } finally {
      form.unmount();
    }
  });
});
