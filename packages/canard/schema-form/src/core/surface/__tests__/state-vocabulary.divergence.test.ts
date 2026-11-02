import { afterEach, describe, expect, it, vi } from 'vitest';

import { blueprint } from '../../engine';
import { requireRuntimeFieldNode } from '../runtime/requireRuntimeFieldNode';
import { reloadFieldNodeForm } from '../utils/binding/reloadFieldNodeForm';
import { fieldNodeFactory } from '../utils/fieldNodeFactory';
import { makeVocabularyTree } from './fixtures/makeVocabularyTree';

afterEach(() => vi.restoreAllMocks());

describe('state-vocabulary output divergence', () => {
  it('before the first load the baseline is unset', () => {
    const root = fieldNodeFactory(blueprint({ type: 'string' }), {
      diagnostics: { status: 'stable' },
      loadSnapshot: undefined,
    });
    root.setValue('before mount');
    expect(root.isDivergent).toBe(false);
  });
  it('static-first load captures the final filled output baseline', () => {
    const root = makeVocabularyTree(
      { type: 'object', properties: { a: { type: 'string', default: 'd' } } },
      undefined,
    );
    expect(requireRuntimeFieldNode(root).runtime.loadBaseline).toEqual({
      value: { a: 'd' },
    });
    const child = root.find('/a');
    if (!child) throw new Error('Missing filled field');
    expect(child.isDivergent).toBe(false);
    child.setValue('x');
    expect(child.isDivergent).toBe(true);
  });
  it('settled value load, setValue and revert use the last root load output', () => {
    const root = makeVocabularyTree(
      { type: 'object', properties: { a: { type: 'string' } } },
      { a: 'loaded' },
    );
    expect(root.isDivergent).toBe(false);
    root.find('/a')?.setValue('edited');
    expect(root.isDivergent).toBe(true);
    expect(root.find('/a')?.isDivergent).toBe(true);
    root.find('/a')?.setValue('loaded');
    expect(root.isDivergent).toBe(false);
  });
  it('settled load with expressions captures the final output', () => {
    const root = makeVocabularyTree(
      {
        type: 'object',
        properties: {
          a: { type: 'string' },
          b: { type: 'string', controls: { derived: '../a' } },
        },
      },
      { a: 'loaded' },
    );
    expect(requireRuntimeFieldNode(root).runtime.loadBaseline).toEqual({
      value: { a: 'loaded', b: 'loaded' },
    });
    expect(root.find('/b')?.value).toBe('loaded');
    expect(root.isDivergent).toBe(false);
    expect(root.find('/b')?.isDivergent).toBe(false);
  });
  it('a default-filled field compares against the filled output, not the raw load source', () => {
    const root = makeVocabularyTree(
      {
        type: 'object',
        properties: { a: { type: 'string', default: 'filled' } },
      },
      {},
    );
    expect(requireRuntimeFieldNode(root).runtime.loadBaseline).toEqual({
      value: { a: 'filled' },
    });
    expect(root.find('/a')?.value).toBe('filled');
    expect(root.find('/a')?.isDivergent).toBe(false);
  });
  it('resets with and without a value move the root baseline', () => {
    const root = makeVocabularyTree({ type: 'string' }, 'loaded');
    root.setValue('edited');
    expect(root.isDivergent).toBe(true);
    reloadFieldNodeForm(root, 'edited');
    expect(root.isDivergent).toBe(false);
    root.setValue('another');
    expect(root.isDivergent).toBe(true);
    reloadFieldNodeForm(root, undefined);
    expect(root.isDivergent).toBe(false);
    root.setValue('after undefined baseline');
    expect(root.isDivergent).toBe(true);
  });
  it('child reset restores its subtree without moving a sibling baseline', () => {
    const root = makeVocabularyTree(
      {
        type: 'object',
        properties: { a: { type: 'string' }, b: { type: 'string' } },
      },
      { a: 'a', b: 'b' },
    );
    root.find('/a')?.setValue('edited a');
    root.find('/b')?.setValue('edited b');
    root.find('/a')?.resetSubtree();
    expect(root.find('/a')?.isDivergent).toBe(false);
    expect(root.find('/b')?.isDivergent).toBe(true);
    expect(root.isDivergent).toBe(true);
    root.resetSubtree();
    expect(root.isDivergent).toBe(false);
  });
  it('array holes compare the contribution in the root output', () => {
    const root = makeVocabularyTree(
      { type: 'array', items: { type: 'string' } },
      ['a', '', 'c'],
    );
    expect(root.find('/1')?.outputValue).toBeUndefined();
    expect(root.find('/1')?.isDivergent).toBe(false);
    root.find('/1')?.setValue('filled hole');
    expect(root.find('/1')?.isDivergent).toBe(true);
  });
  it('a moved array item invalidates its memo even when its own emit is unchanged', () => {
    const root = makeVocabularyTree(
      { type: 'array', items: { type: 'string' } },
      ['a', 'b', 'c'],
    );
    if (root.type !== 'array') throw new Error('Expected array');
    const moved = root.find('/1');
    expect(moved?.isDivergent).toBe(false);
    root.remove(0);
    expect(root.find('/0')).toBe(moved);
    expect(moved?.isDivergent).toBe(true);
    moved?.resetSubtree();
    expect(moved?.isDivergent).toBe(true);
    root.resetSubtree();
    expect(root.isDivergent).toBe(false);
    expect(moved?.isDivergent).toBe(false);
  });
  it('added items compare by position, including an equal baseline value', () => {
    const root = makeVocabularyTree(
      { type: 'array', items: { type: 'string' } },
      ['a', 'b'],
    );
    if (root.type !== 'array') throw new Error('Expected array');
    root.push('c');
    expect(root.find('/2')?.isDivergent).toBe(true);
    root.remove(1);
    root.insert(1, 'b');
    expect(root.find('/1')?.isDivergent).toBe(false);
  });
  it('switching a branch back restores false and detached nodes read false', () => {
    const root = makeVocabularyTree(
      {
        type: 'object',
        properties: {
          flag: { type: 'boolean' },
          a: { type: 'string', controls: { active: '../flag' } },
        },
      },
      { flag: true, a: 'loaded' },
    );
    const old = root.find('/a');
    old?.setValue('edited');
    expect(old?.isDivergent).toBe(true);
    root.find('/flag')?.setValue(false);
    expect(old?.isDivergent).toBe(false);
    root.find('/flag')?.setValue(true);
    root.find('/a')?.setValue('loaded');
    expect(root.find('/a')?.isDivergent).toBe(false);
    expect(root.isDivergent).toBe(false);
  });
  it('hidden fields remain part of the output comparison', () => {
    const root = makeVocabularyTree(
      {
        type: 'object',
        properties: { a: { type: 'string', controls: { visible: false } } },
      },
      { a: 'loaded' },
    );
    expect(root.find('/a')?.isDivergent).toBe(false);
    root.find('/a')?.setValue('edited');
    expect(root.find('/a')?.isDivergent).toBe(true);
    expect(root.isDivergent).toBe(true);
  });
  it('undeclared key order follows sameValue semantics', () => {
    const root = makeVocabularyTree({ type: 'object' }, { a: 1, b: 2 });
    root.setValue({ b: 2, a: 1 });
    expect(root.isDivergent).toBe(true);
  });
});
