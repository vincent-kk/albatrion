import { describe, expect, it } from 'vitest';

import type { DispatchTestNode } from '../../__tests__/fixtures/createDispatchTree';
import { find } from '../../navigation';
import { readFieldNodeErrors } from '../../validation';
import { readFieldNodeWatchValues } from '../utils/controls/readFieldNodeWatchValues';
import { captureDetachedFieldNodeReads } from '../utils/detached/captureDetachedFieldNodeReads';
import { readFieldNodeIsMisfit } from '../utils/detached/readFieldNodeIsMisfit';
import { readFieldNodeMisfits } from '../utils/detached/readFieldNodeMisfits';
import { readFieldNodeDefaultValue } from '../utils/loadValues/readFieldNodeDefaultValue';
import { createDetachedCaptureTree } from './fixtures/createDetachedCaptureTree';

/** Resolve an actual mounted occurrence or fail at the fixture boundary. */
const requireNode = (root: DispatchTestNode, path: string) => {
  const node = find(root, path);
  if (!node) throw new Error(`Mounted node missing: ${path}`);
  return node;
};

/** Capture the last live reads and expose them through detached readers. */
const detach = (node: DispatchTestNode, load?: { readonly value: unknown }) => {
  const snapshot = {
    schema: node.schema.schema,
    emit: node.rootNode.emit,
    context: node.runtime.context,
  };
  captureDetachedFieldNodeReads(node, snapshot, load);
  node.detached = true;
};

describe('468C-01 exit default read characterization', () => {
  it('retains a scalar when the caller replaces the source property', () => {
    const root = createDetachedCaptureTree(
      { type: 'object', properties: { field: { type: 'string' } } },
      { field: 'loaded' },
    );
    const node = requireNode(root, '/field');
    const source = { field: 'at-exit' };
    root.runtime.loadSnapshot = source;
    detach(node);
    source.field = 'later';
    expect(readFieldNodeDefaultValue(node)).toBe('at-exit');
  });

  it('retains the object reference, including later mutations inside it', () => {
    const root = createDetachedCaptureTree(
      {
        type: 'object',
        properties: {
          field: { type: 'object', properties: { inner: { type: 'string' } } },
        },
      },
      { field: { inner: 'loaded' } },
    );
    const node = requireNode(root, '/field');
    const value = { inner: 'at-exit' };
    root.runtime.loadSnapshot = { field: value };
    detach(node);
    value.inner = 'later';
    root.runtime.loadSnapshot = { field: { inner: 'replacement' } };
    expect(readFieldNodeDefaultValue(node)).toBe(value);
    expect(readFieldNodeDefaultValue(node)).toEqual({ inner: 'later' });
  });

  it('prefers a supplied load reference over the snapshot', () => {
    const root = createDetachedCaptureTree({ type: 'string' }, 'snapshot');
    const supplied = { supplied: true };
    detach(root, { value: supplied });
    expect(readFieldNodeDefaultValue(root)).toBe(supplied);
  });

  it('prefers a supplied undefined without consulting a Proxy snapshot', () => {
    const root = createDetachedCaptureTree(
      { type: 'object', properties: { field: { type: 'string' } } },
      { field: 'loaded' },
    );
    const reads: PropertyKey[] = [];
    root.runtime.loadSnapshot = new Proxy(
      { field: 'wrong' },
      {
        get(target, key) {
          reads.push(key);
          return Reflect.get(target, key);
        },
      },
    );
    const node = requireNode(root, '/field');
    detach(node, { value: undefined });
    expect(readFieldNodeDefaultValue(node)).toBeUndefined();
    expect(reads).toEqual([]);
  });

  it('recaptures an already detached default without reading the new source', () => {
    const root = createDetachedCaptureTree(
      { type: 'object', properties: { field: { type: 'string' } } },
      { field: 'loaded' },
    );
    const node = requireNode(root, '/field');
    detach(node);
    const reads: PropertyKey[] = [];
    root.runtime.loadSnapshot = new Proxy(
      { field: 'wrong' },
      {
        get(target, key) {
          reads.push(key);
          return Reflect.get(target, key);
        },
      },
    );
    detach(node);
    expect(readFieldNodeDefaultValue(node)).toBe('loaded');
    expect(reads).toEqual([]);
  });

  it('keeps an absent already detached default undefined', () => {
    const root = createDetachedCaptureTree({ type: 'string' }, 'live-source');
    root.detached = true;
    detach(root);
    expect(readFieldNodeDefaultValue(root)).toBeUndefined();
  });

  it('reads nested arrays and escaped, reserved and empty property names', () => {
    const properties = {
      'a/b': { type: 'string' },
      '~leaf': { type: 'string' },
      '*': { type: 'string' },
      '..': { type: 'string' },
      '.': { type: 'string' },
      '@': { type: 'string' },
      '': { type: 'string' },
    };
    const value = {
      'a/b': 'slash',
      '~leaf': 'tilde',
      '*': 'star',
      '..': 'parent',
      '.': 'self',
      '@': 'context',
      '': 'empty',
    };
    const root = createDetachedCaptureTree(
      {
        type: 'object',
        properties: {
          rows: {
            type: 'array',
            items: { type: 'array', items: { type: 'object', properties } },
          },
        },
      },
      { rows: [[value]] },
    );
    for (const [name, expected] of [
      ['a~1b', 'slash'],
      ['~0leaf', 'tilde'],
      ['%2A', 'star'],
      ['%2E%2E', 'parent'],
      ['%2E', 'self'],
      ['%40', 'context'],
      ['', 'empty'],
    ]) {
      const node = requireNode(root, `/rows/0/0/${name}`);
      detach(node);
      root.runtime.loadSnapshot = undefined;
      expect(readFieldNodeDefaultValue(node)).toBe(expected);
      root.runtime.loadSnapshot = { rows: [[value]] };
    }
  });

  it('captures a virtual default while its real siblings retain their own sources', () => {
    const root = createDetachedCaptureTree(
      {
        type: 'object',
        properties: { start: { type: 'string' }, end: { type: 'string' } },
        options: { virtual: { period: { fields: ['start', 'end'] } } },
      },
      { start: 'a', end: 'b' },
    );
    const group = requireNode(root, '/period');
    detach(group);
    expect(readFieldNodeDefaultValue(group)).toBeUndefined();
    expect(readFieldNodeDefaultValue(requireNode(root, '/start'))).toBe('a');
    expect(readFieldNodeDefaultValue(requireNode(root, '/end'))).toBe('b');
  });

  it('uses the departing branch schema and prior emission for watched reads', () => {
    const root = createDetachedCaptureTree(
      {
        type: 'object',
        properties: {
          first: { type: 'number' },
          second: { type: 'number' },
          field: { type: 'string', controls: { watch: ['../first', '@'] } },
        },
      },
      { first: 1, second: 2, field: 'loaded' },
    );
    const node = requireNode(root, '/field');
    const original = node.schema.schema;
    const context = { atExit: true };
    node.schema = {
      ...node.schema,
      schema: { type: 'string', controls: { watch: ['../second'] } },
    };
    captureDetachedFieldNodeReads(node, {
      schema: original,
      emit: { first: 7, second: 8 },
      context,
    });
    node.detached = true;
    root.emit = { first: 10, second: 11 };
    root.runtime.context = { later: true };
    const watched = readFieldNodeWatchValues(node);
    expect(watched).toEqual([7, context]);
    expect(Object.isFrozen(watched)).toBe(true);
    expect(readFieldNodeDefaultValue(node)).toBe('loaded');
  });

  it('retains the external-only error source identity after live cleanup', () => {
    const root = createDetachedCaptureTree({ type: 'string' }, 'loaded');
    const issues = [{ dataPath: '', message: 'external' }];
    root.runtime.nodeErrors = new Map([[root, issues]]);
    detach(root);
    root.runtime.nodeErrors.clear();
    Reflect.set(issues[0], 'dataPath', 9);
    expect(readFieldNodeErrors(root)).toBe(issues);
  });

  it('retains the validator-only error source identity after live cleanup', () => {
    const root = createDetachedCaptureTree({ type: 'string' }, 'loaded');
    const issues = [{ dataPath: '', message: 'validator' }];
    root.runtime.validationErrors = new Map([[root, issues]]);
    detach(root);
    root.runtime.validationErrors.clear();
    Reflect.set(issues[0], 'dataPath', 9);
    expect(readFieldNodeErrors(root)).toBe(issues);
  });

  it('retains the combined error identity independently of later source growth', () => {
    const root = createDetachedCaptureTree({ type: 'string' }, 'loaded');
    const external = [{ dataPath: '', message: 'external' }];
    const validation = [{ dataPath: '', message: 'validator' }];
    root.runtime.nodeErrors = new Map([[root, external]]);
    root.runtime.validationErrors = new Map([[root, validation]]);
    const combined = readFieldNodeErrors(root);
    detach(root);
    external.push({ dataPath: '', message: 'later external' });
    validation.push({ dataPath: '', message: 'later validator' });
    root.runtime.combinedErrors?.clear();
    root.runtime.nodeErrors.clear();
    root.runtime.validationErrors.clear();
    expect(readFieldNodeErrors(root)).toBe(combined);
    expect(combined).toHaveLength(2);
  });

  it('reads errors before walking the Proxy source modified during exit', () => {
    const root = createDetachedCaptureTree(
      {
        type: 'object',
        properties: {
          group: { type: 'object', properties: { field: { type: 'string' } } },
        },
      },
      { group: { field: 'loaded' } },
    );
    const node = requireNode(root, '/group/field');
    const events: string[] = [];
    const source = { group: { field: 'before-exit' } };
    root.runtime.loadSnapshot = new Proxy(source, {
      get(target, key) {
        events.push(`get:${String(key)}`);
        return Reflect.get(target, key);
      },
    });
    root.runtime.nodeErrors = new Map([
      [
        node,
        [
          {
            get dataPath() {
              events.push('issue');
              source.group = { field: 'during-exit' };
              return '/group/field';
            },
          },
        ],
      ],
    ]);
    detach(node);
    expect(events).toEqual(['issue', 'get:group']);
    expect(readFieldNodeDefaultValue(node)).toBe('during-exit');
  });

  it('freezes the final misfit paths and flags alongside watched values', () => {
    const root = createDetachedCaptureTree(
      {
        type: 'object',
        properties: {
          source: { type: 'number' },
          field: { type: 'number', controls: { watch: ['../source'] } },
        },
      },
      { source: 3, field: 'bad' },
    );
    const node = requireNode(root, '/field');
    const paths = readFieldNodeMisfits(node);
    expect(readFieldNodeIsMisfit(node)).toBe(true);
    node.isVisible = false;
    node.isReadOnly = true;
    node.isDisabled = true;
    detach(node);
    root.runtime.misfitPaths.clear();
    root.runtime.misfitsMemo?.clear();
    root.emit = { source: 9, field: 1 };
    expect(readFieldNodeWatchValues(node)).toEqual([3]);
    expect(readFieldNodeIsMisfit(node)).toBe(true);
    expect(readFieldNodeMisfits(node)).toBe(paths);
    expect(root.runtime.detachedReads?.get(node)).toMatchObject({
      isVisible: false,
      isReadOnly: true,
      isDisabled: true,
    });
    expect(Object.isFrozen(root.runtime.detachedReads?.get(node))).toBe(true);
  });
});
