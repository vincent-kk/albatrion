import { expect, it, vi } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';

// filid:contract literal-star-controls
it('derives only the named star property through a fields target', () => {
  const { root } = makeFieldNodeTree({
    type: 'object',
    controls: { fields: [{ targets: ['*'], controls: { derived: './seed' } }] },
    properties: {
      seed: { type: 'string' },
      '*': { type: 'string' },
      sibling: { type: 'string' },
    },
  });
  root.setValue({ seed: 'first', sibling: 'untouched' });
  expect(root.find('/%2A')!.value).toBe('first');
  root.find('/seed')!.setValue('second');
  expect(root.find('/%2A')!.value).toBe('second');
  expect(root.find('/sibling')!.value).toBe('untouched');
});

it('injects into a literal star address without selecting sibling properties', () => {
  const injectTo = vi.fn(() => ({ '../%2A': 'injected' }));
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      source: { type: 'string', controls: { injectTo } },
      '*': { type: 'string' },
      sibling: { type: 'string' },
    },
  });
  root.setValue({ source: 'changed', sibling: 'untouched' });
  expect(injectTo).toHaveBeenCalled();
  expect(root.find('/%2A')!.value).toBe('injected');
  expect(root.find('/sibling')!.value).toBe('untouched');
});

it('keeps watch values specific to the literal star property', () => {
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      watched: { type: 'string' },
      '*': { type: 'string', controls: { watch: ['../watched'] } },
      observer: { type: 'string', controls: { watch: ['../%2A'] } },
      sibling: { type: 'string' },
    },
  });
  root.setValue({ watched: 'first', '*': 'literal', sibling: 'untouched' });
  const star = root.find('/%2A')!;
  const observer = root.find('/observer')!;
  expect(star.watchValues).toEqual(['first']);
  expect(observer.watchValues).toEqual(['literal']);
  root.find('/sibling')!.setValue('different');
  expect(observer.watchValues).toEqual(['literal']);
  root.find('/watched')!.setValue('second');
  expect(star.watchValues).toEqual(['second']);
  expect(observer.watchValues).toEqual(['literal']);
  star.setValue('patched');
  expect(observer.watchValues).toEqual(['patched']);
});
