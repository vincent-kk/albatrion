import { act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  type FieldInputProps,
  type JSONSchema,
  ValidationMode,
} from '@/schema-form';

import { renderForm } from '../renderForm';

/** Declared enum tags select one branch while inactive fields retain or discard edits. */
const declaredTagSchema = {
  type: 'object',
  controls: { discriminator: 'kind' },
  properties: { kind: { type: 'string', enum: ['a', 'b'] } },
  oneOf: [
    { properties: { kind: { const: 'a' }, a: { type: 'string' } } },
    { properties: { kind: { const: 'b' }, b: { type: 'string' } } },
  ],
} satisfies JSONSchema;

/** Branch-only tag declarations provide a mounted selector even without a selection. */
const liftedTagSchema = {
  type: 'object',
  controls: { discriminator: 'kind' },
  oneOf: [
    {
      properties: {
        kind: { type: 'string', const: 'a' },
        a: { type: 'string', default: 'seed-a' },
      },
    },
    {
      properties: {
        kind: { type: 'string', const: 'b' },
        b: { type: 'string', default: 'seed-b' },
      },
    },
  ],
} satisfies JSONSchema;

/**
 * Render a public input adapter that preserves the string/number distinction.
 * @param props - Form-provided union value, pointer, and draft publisher.
 * @returns A selector publishing 'a' or the number 1 through onChange.
 */
const UnionTagInput = ({
  path,
  value,
  onChange,
}: FieldInputProps<string | number>) => (
  <select
    id={path}
    value={value === 1 ? 'number' : 'string'}
    onChange={(event) => onChange(event.target.value === 'number' ? 1 : 'a')}
  >
    <option value="string">a</option>
    <option value="number">1</option>
  </select>
);

describe('discriminator union selection through the public Form', () => {
  it.each([false, true])(
    'U1 submits only active fields and applies unsetOnInactive=%s on re-entry',
    async (unsetOnInactive) => {
      const onSubmit = vi.fn();
      const form = await renderForm(declaredTagSchema, {
        validationMode: ValidationMode.None,
        defaultValue: { kind: 'a', a: 'initial-a' },
        unsetOnInactive,
        onSubmit,
      });
      try {
        expect(form.field('/kind')).not.toBeNull();
        expect(form.value('/kind')).toBe('a');
        expect(form.value('/a')).toBe('initial-a');
        expect(form.exists('/b')).toBe(false);
        expect(form.handle.getValue()).toEqual({ kind: 'a', a: 'initial-a' });
        await act(async () => {
          await form.handle.submit();
        });
        expect(onSubmit).toHaveBeenNthCalledWith(1, {
          kind: 'a',
          a: 'initial-a',
        });

        await form.type('/a', 'edited-a');
        await form.selectOption('/kind', 'b');
        expect(form.exists('/a')).toBe(false);
        expect(form.field('/b')).not.toBeNull();
        expect(form.handle.getValue()).not.toHaveProperty('a');
        await form.type('/b', 'edited-b');
        expect(form.handle.getValue()).toEqual({ kind: 'b', b: 'edited-b' });
        await act(async () => {
          await form.handle.submit();
        });
        expect(onSubmit).toHaveBeenNthCalledWith(2, {
          kind: 'b',
          b: 'edited-b',
        });

        await form.selectOption('/kind', 'a');
        expect(form.field('/a')).not.toBeNull();
        expect(form.exists('/b')).toBe(false);
        expect(form.value('/a')).toBe(unsetOnInactive ? '' : 'edited-a');
        const restored = unsetOnInactive
          ? { kind: 'a' }
          : { kind: 'a', a: 'edited-a' };
        expect(form.handle.getValue()).toEqual(restored);
        expect(form.handle.getValue()).not.toHaveProperty('b');
        await act(async () => {
          await form.handle.submit();
        });
        expect(onSubmit).toHaveBeenNthCalledWith(3, restored);
        expect(onSubmit).toHaveBeenCalledTimes(3);

        await form.selectOption('/kind', 'b');
        expect(form.value('/b')).toBe(unsetOnInactive ? '' : 'edited-b');
        expect(form.errorRecords()).toEqual([]);
        expect(form.caughtErrors()).toEqual([]);
      } finally {
        form.unmount();
      }
    },
  );

  it('U2 mounts a lifted tag before selection and selects a branch when a value arrives', async () => {
    const form = await renderForm(liftedTagSchema, {
      validationMode: ValidationMode.None,
    });
    try {
      expect(form.field('/kind')).not.toBeNull();
      expect(form.exists('/a')).toBe(false);
      expect(form.exists('/b')).toBe(false);
      expect(form.handle.getValue()).toEqual({});
      await form.setValue({ kind: 'a' });
      expect(form.value('/kind')).toBe('a');
      expect(form.value('/a')).toBe('seed-a');
      expect(form.exists('/b')).toBe(false);
      expect(form.handle.getValue()).toEqual({ kind: 'a', a: 'seed-a' });
      expect(form.errorRecords()).toEqual([]);
    } finally {
      form.unmount();
    }
  });

  it('U2 selects a lifted tag from Form defaultValue and submits that branch', async () => {
    const onSubmit = vi.fn();
    const form = await renderForm(liftedTagSchema, {
      validationMode: ValidationMode.None,
      defaultValue: { kind: 'b', b: 'caller-b' },
      onSubmit,
    });
    try {
      expect(form.field('/kind')).not.toBeNull();
      expect(form.value('/kind')).toBe('b');
      expect(form.exists('/a')).toBe(false);
      expect(form.value('/b')).toBe('caller-b');
      expect(form.handle.getValue()).toEqual({ kind: 'b', b: 'caller-b' });
      await act(async () => {
        await form.handle.submit();
      });
      expect(onSubmit).toHaveBeenCalledExactlyOnceWith({
        kind: 'b',
        b: 'caller-b',
      });
      expect(form.errorRecords()).toEqual([]);
    } finally {
      form.unmount();
    }
  });

  it('U2 selects a lifted tag from controls.default without a caller value', async () => {
    const schema = {
      ...liftedTagSchema,
      controls: { discriminator: 'kind', default: { kind: 'a' } },
    } satisfies JSONSchema;
    const form = await renderForm(schema, {
      validationMode: ValidationMode.None,
    });
    try {
      expect(form.field('/kind')).not.toBeNull();
      expect(form.value('/kind')).toBe('a');
      expect(form.value('/a')).toBe('seed-a');
      expect(form.exists('/b')).toBe(false);
      expect(form.handle.getValue()).toEqual({ kind: 'a', a: 'seed-a' });
      expect(form.errorRecords()).toEqual([]);
    } finally {
      form.unmount();
    }
  });

  it('U3 C7 shows both anyOf branches for their shared tag and one for each exclusive tag', async () => {
    const schema = {
      type: 'object',
      controls: { discriminator: 'kind' },
      properties: {
        kind: { type: 'string', enum: ['shared', 'left', 'right'] },
      },
      anyOf: [
        {
          properties: {
            kind: { enum: ['shared', 'left'] },
            left: { type: 'string', default: 'L' },
          },
        },
        {
          properties: {
            kind: { enum: ['shared', 'right'] },
            right: { type: 'string', default: 'R' },
          },
        },
      ],
    } satisfies JSONSchema;
    const onSubmit = vi.fn();
    const form = await renderForm(schema, {
      validationMode: ValidationMode.None,
      defaultValue: { kind: 'shared' },
      onSubmit,
    });
    try {
      const tag = form.handle.findNode('/kind');
      if (!tag) throw new Error('Expected the declared discriminator input');
      expect(form.value('/left')).toBe('L');
      expect(form.value('/right')).toBe('R');
      expect(form.handle.getValue()).toEqual({
        kind: 'shared',
        left: 'L',
        right: 'R',
      });
      await act(async () => {
        await form.handle.submit();
      });
      expect(onSubmit).toHaveBeenCalledExactlyOnceWith({
        kind: 'shared',
        left: 'L',
        right: 'R',
      });
      await act(async () => {
        tag.setValue('left');
      });
      await form.flush();
      expect(form.field('/left')).not.toBeNull();
      expect(form.exists('/right')).toBe(false);
      expect(form.handle.getValue()).toEqual({ kind: 'left', left: 'L' });
      await act(async () => {
        tag.setValue('right');
      });
      await form.flush();
      expect(form.exists('/left')).toBe(false);
      expect(form.field('/right')).not.toBeNull();
      expect(form.handle.getValue()).toEqual({ kind: 'right', right: 'R' });
      await act(async () => {
        tag.setValue('shared');
      });
      await form.flush();
      expect(form.field('/left')).not.toBeNull();
      expect(form.field('/right')).not.toBeNull();
      expect(form.handle.getValue()).toEqual({
        kind: 'shared',
        left: 'L',
        right: 'R',
      });
      expect(form.errorRecords()).toEqual([]);
    } finally {
      form.unmount();
    }
  });

  it('U4 C9 switches between string and number tags without changing their kinds', async () => {
    const schema = {
      type: 'object',
      controls: { discriminator: 'kind' },
      properties: { kind: { type: ['string', 'number'] } },
      oneOf: [
        {
          properties: {
            kind: { const: 'a' },
            text: { type: 'string', default: 'text' },
          },
        },
        {
          properties: {
            kind: { const: 1 },
            count: { type: 'number', default: 7 },
          },
        },
      ],
    } satisfies JSONSchema;
    const onSubmit = vi.fn();
    const form = await renderForm(schema, {
      validationMode: ValidationMode.None,
      defaultValue: { kind: 'a' },
      fieldInputMap: { '/kind': UnionTagInput },
      onSubmit,
    });
    try {
      expect(form.value('/kind')).toBe('string');
      expect(form.value('/text')).toBe('text');
      expect(form.exists('/count')).toBe(false);
      expect(form.handle.getValue()).toEqual({ kind: 'a', text: 'text' });
      await form.selectOption('/kind', 'number');
      expect(form.exists('/text')).toBe(false);
      expect(form.value('/count')).toBe('7');
      expect(form.handle.getValue()).toEqual({ kind: 1, count: 7 });
      await act(async () => {
        await form.handle.submit();
      });
      expect(onSubmit).toHaveBeenCalledExactlyOnceWith({ kind: 1, count: 7 });
      await form.selectOption('/kind', 'string');
      expect(form.value('/text')).toBe('text');
      expect(form.exists('/count')).toBe(false);
      expect(form.handle.getValue()).toEqual({ kind: 'a', text: 'text' });
      expect(form.errorRecords()).toEqual([]);
    } finally {
      form.unmount();
    }
  });
});
