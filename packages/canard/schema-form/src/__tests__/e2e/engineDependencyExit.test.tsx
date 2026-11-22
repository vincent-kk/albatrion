import { expect, it } from 'vitest';

import { mountEngineForm } from './fixtures/mountEngineForm';

it('re-evaluates derive and unset when a gate removes their dependency', () => {
  const root = mountEngineForm({
    jsonSchema: {
      type: 'object',
      properties: {
        on: { type: 'boolean' },
        dependency: { type: 'string', controls: { active: '/on === true' } },
        derived: {
          type: 'string',
          controls: { derived: '(/dependency) ?? "missing"' },
        },
        unset: {
          type: 'string',
          controls: { unsetValue: '/dependency === undefined' },
        },
      },
    },
    defaultValue: { on: true, dependency: 'original', unset: 'load' },
  });
  expect(root.find('/derived')!.value).toBe('original');
  root.find('/on')!.setValue(false);
  expect(root.find('/dependency')).toBeNull();
  expect(root.find('/derived')!.value).toBe('missing');
  expect(root.find('/unset')!.value).toBeUndefined();
});

it('keeps the watch snapshot until a watched reference or scalar changes', () => {
  const items = [1];
  const root = mountEngineForm({
    jsonSchema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: { type: 'number' },
          options: { terminal: true },
        },
        a: { type: 'string' },
        other: { type: 'string' },
        watcher: { type: 'string', controls: { watch: ['/items', '/a'] } },
      },
    },
    defaultValue: { items, a: 'first' },
  });
  const watcher = root.find('/watcher')!;
  const before = watcher.watchValues;
  expect(before).toEqual([[1], 'first']);
  const stored = root.find('/items')!.value;
  if (!Array.isArray(stored)) throw new Error('Expected the stored array');
  expect(before?.[0]).toBe(stored);
  stored.push(2);
  root.find('/other')!.setValue('unrelated');
  expect(watcher.watchValues).toBe(before);
  root.find('/a')!.setValue('second');
  expect(watcher.watchValues).not.toBe(before);
  expect(watcher.watchValues?.[1]).toBe('second');
});
