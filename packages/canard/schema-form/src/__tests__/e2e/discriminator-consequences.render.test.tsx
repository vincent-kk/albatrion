import { describe, expect, it } from 'vitest';

import type { JSONSchema } from '@/schema-form';

import { renderForm } from '../renderForm';

describe('discriminator selection in the rendered form', () => {
  it('C7 selects both anyOf branches sharing one tag and closes both on another value', async () => {
    const schema = {
      type: 'object',
      controls: { discriminator: 'kind' },
      properties: { kind: { type: 'string' } },
      anyOf: [
        {
          properties: {
            kind: { const: 'shared' },
            first: { type: 'string', default: 'first' },
          },
        },
        {
          properties: {
            kind: { const: 'shared' },
            second: { type: 'string', default: 'second' },
          },
        },
      ],
    } satisfies JSONSchema;
    const form = await renderForm(schema, {
      defaultValue: { kind: 'shared' },
    });
    expect(form.getValue()).toEqual({
      kind: 'shared',
      first: 'first',
      second: 'second',
    });
    await form.setValue({ kind: 'none' });
    expect(form.exists('/first')).toBe(false);
    expect(form.exists('/second')).toBe(false);
    expect(form.getValue()).toEqual({ kind: 'none' });
    await form.setValue({ kind: 'shared' });
    expect(form.exists('/first')).toBe(true);
    expect(form.exists('/second')).toBe(true);
    expect(form.getValue()).toEqual({
      kind: 'shared',
      first: 'first',
      second: 'second',
    });
    expect(
      form.errorRecords().filter(({ code }) => code.includes('DISCRIMINATOR')),
    ).toEqual([]);
    form.unmount();
  });

  it('C9 selects every tag kind admitted by the host tag union', async () => {
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
            numeric: { type: 'number', default: 7 },
          },
        },
      ],
    } satisfies JSONSchema;
    const form = await renderForm(schema, {
      defaultValue: { kind: 'a' },
    });
    expect(form.getValue()).toEqual({ kind: 'a', text: 'text' });
    await form.setValue({ kind: 1 });
    expect(form.exists('/text')).toBe(false);
    expect(form.exists('/numeric')).toBe(true);
    expect(form.getValue()).toEqual({ kind: 1, numeric: 7 });
    await form.setValue({ kind: 'a' });
    expect(form.exists('/text')).toBe(true);
    expect(form.exists('/numeric')).toBe(false);
    expect(form.getValue()).toEqual({ kind: 'a', text: 'text' });
    expect(
      form.errorRecords().filter(({ code }) => code.includes('DISCRIMINATOR')),
    ).toEqual([]);
    form.unmount();
  });

  it('C12 selects independent unions with different keys on the same node', async () => {
    const schema = {
      type: 'object',
      properties: {
        target: {
          type: 'object',
          properties: { kind: { type: 'string' }, mode: { type: 'string' } },
          controls: { discriminator: 'kind' },
          oneOf: [
            {
              properties: {
                kind: { const: 'a' },
                first: { type: 'string', default: 'first' },
              },
            },
            {
              properties: {
                kind: { const: 'b' },
                second: { type: 'string', default: 'second' },
              },
            },
          ],
        },
      },
      allOf: [
        {
          properties: {
            target: {
              type: 'object',
              controls: { discriminator: 'mode' },
              oneOf: [
                {
                  properties: {
                    mode: { const: 'x' },
                    left: { type: 'string', default: 'left' },
                  },
                },
                {
                  properties: {
                    mode: { const: 'y' },
                    right: { type: 'string', default: 'right' },
                  },
                },
              ],
            },
          },
        },
      ],
    } satisfies JSONSchema;
    const form = await renderForm(schema, {
      defaultValue: { target: { kind: 'a', mode: 'x' } },
    });
    expect(form.getValue()).toEqual({
      target: { kind: 'a', mode: 'x', first: 'first', left: 'left' },
    });
    await form.type('/target/kind', 'b');
    expect(form.exists('/target/first')).toBe(false);
    expect(form.exists('/target/second')).toBe(true);
    expect(form.exists('/target/left')).toBe(true);
    expect(form.getValue()).toEqual({
      target: { kind: 'b', mode: 'x', second: 'second', left: 'left' },
    });
    await form.type('/target/mode', 'y');
    expect(form.exists('/target/second')).toBe(true);
    expect(form.exists('/target/left')).toBe(false);
    expect(form.exists('/target/right')).toBe(true);
    expect(form.getValue()).toEqual({
      target: { kind: 'b', mode: 'y', second: 'second', right: 'right' },
    });
    expect(
      form.errorRecords().filter(({ code }) => code.includes('DISCRIMINATOR')),
    ).toEqual([]);
    form.unmount();
  });
});
