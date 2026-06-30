import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';

import type { JsonSchema } from '@winglet/json-schema';

import { renderForm } from './renderForm';

/**
 * Smoke test for the render-test harness itself.
 * If this fails, every scenario suite built on the harness is suspect.
 */
describe('renderForm harness — smoke', () => {
  it('renders fields addressable by JSONPointer path and reads node + DOM', async () => {
    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string', default: 'Ada' },
        age: { type: 'number', default: 30 },
        active: { type: 'boolean', default: true },
        role: { type: 'string', enum: ['admin', 'user'], default: 'user' },
      },
    } satisfies JsonSchema;

    const form = await renderForm(schema);

    // DOM layer — presence via [data-path], values via id={path}
    expect(form.exists('/name')).toBe(true);
    expect(form.value('/name')).toBe('Ada');
    expect(form.value('/age')).toBe('30');
    expect(form.checked('/active')).toBe(true);
    expect(form.value('/role')).toBe('user');

    // node tree layer
    expect(form.getValue()).toMatchObject({
      name: 'Ada',
      age: 30,
      active: true,
      role: 'user',
    });
    expect(form.node('/name')?.value).toBe('Ada');
  });

  it('exposes [data-path] presence for object/array container nodes too', async () => {
    const schema = {
      type: 'object',
      properties: {
        profile: {
          type: 'object',
          properties: { city: { type: 'string', default: 'Seoul' } },
        },
        tags: { type: 'array', items: { type: 'string' }, default: ['a'] },
      },
    } satisfies JsonSchema;

    const form = await renderForm(schema);
    expect(form.exists('/profile')).toBe(true);
    expect(form.exists('/profile/city')).toBe(true);
    expect(form.exists('/tags')).toBe(true);
    expect(form.exists('/tags/0')).toBe(true);
    expect(form.renderedPaths()).toEqual(
      expect.arrayContaining(['/profile', '/profile/city', '/tags', '/tags/0']),
    );
  });

  it('reflects userEvent typing into node tree', async () => {
    const schema = {
      type: 'object',
      properties: { name: { type: 'string', default: '' } },
    } satisfies JsonSchema;

    const form = await renderForm(schema);
    await form.type('/name', 'Grace');

    expect(form.value('/name')).toBe('Grace');
    expect(form.node('/name')?.value).toBe('Grace');
    expect(form.lastValue()).toMatchObject({ name: 'Grace' });
  });

  it('reflects programmatic setValue into the DOM via the refresh cascade', async () => {
    const schema = {
      type: 'object',
      properties: { name: { type: 'string', default: 'a' } },
    } satisfies JsonSchema;

    const form = await renderForm(schema);
    await form.setValue({ name: 'b' });

    expect(form.getValue()).toMatchObject({ name: 'b' });
    expect(form.value('/name')).toBe('b');
  });

  it('supports array add/remove via userEvent', async () => {
    const schema = {
      type: 'object',
      properties: {
        tags: { type: 'array', items: { type: 'string' }, default: [] },
      },
    } satisfies JsonSchema;

    const form = await renderForm(schema);
    expect(form.exists('/tags/0')).toBe(false);

    await form.addItem('/tags');
    expect(form.exists('/tags/0')).toBe(true);
    await form.type('/tags/0', 'x');
    expect(form.node('/tags')?.value).toEqual(['x']);

    await form.addItem('/tags');
    expect(form.exists('/tags/1')).toBe(true);

    await form.removeItem('/tags', 0);
    expect((form.node('/tags')?.value as unknown[])?.length).toBe(1);
  });

  it('produces validation errors when the validator plugin is enabled', async () => {
    const schema = {
      type: 'object',
      properties: { email: { type: 'string', minLength: 5 } },
      required: ['email'],
    } satisfies JsonSchema;

    const form = await renderForm(schema, { validator: true });
    const errors = await form.validate();

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.dataPath === '/email')).toBe(true);
  });

  it('supports two-phase (synchronous-then-flushed) assertions', async () => {
    const schema = {
      type: 'object',
      properties: { name: { type: 'string', default: 'sync' } },
    } satisfies JsonSchema;

    const form = await renderForm(schema, { flushOnMount: false });
    // synchronous snapshot — field already present after the sync commit
    expect(form.exists('/name')).toBe(true);
    await form.flush();
    expect(form.value('/name')).toBe('sync');
  });

  it('tracks re-mounts via instrument mode (data-mount ordinal)', async () => {
    const schema = {
      type: 'object',
      properties: { name: { type: 'string', default: 'a' } },
    } satisfies JsonSchema;

    const form = await renderForm(schema, { instrument: true });
    const before = form.mountOrdinal('/name');
    expect(Number.isNaN(before)).toBe(false);

    // typing must NOT remount the uncontrolled input
    await form.type('/name', 'typed');
    expect(form.mountOrdinal('/name')).toBe(before);
  });

  it('renders under StrictMode without errors', async () => {
    const schema = {
      type: 'object',
      properties: { name: { type: 'string', default: 'x' } },
    } satisfies JsonSchema;

    const form = await renderForm(schema, { strictMode: true });
    expect(form.exists('/name')).toBe(true);
    expect(form.caughtErrors()).toEqual([]);
  });
});
