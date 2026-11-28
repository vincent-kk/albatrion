import { describe, expect, it } from 'vitest';

import { createPreparedChildrenByName } from '../utils/compute/childSelection/utils/createPreparedChildrenByName';
import { flushPendingGateReads } from '../utils/gates/flushPendingGateReads';
import { createGateReadFixture } from './fixtures/createGateReadFixture';

/**
 * Read the `child` entry that every case's root declares.
 * @param root - Fixture root whose blueprint declares a `child` property
 * @returns The `child` entry; throws when the fixture schema lacks it
 */
const readChildEntry = (
  root: ReturnType<typeof createGateReadFixture>['root'],
) => {
  const entry = root.blueprintNode.childEntries.find(
    (entry) => entry.name === 'child',
  );
  if (!entry) throw new Error('Missing child entry');
  return entry;
};

// filid:contract settle-pending-children-read
describe('pending gate __childrenByName__ reads', () => {
  it.each(['dictionary', 'prepared-view'])(
    'checks a %s without own-key descriptors',
    (shape) => {
      const { root, context, release } = createGateReadFixture(
        {
          type: 'object',
          properties: {
            source: { type: 'string' },
            child: {
              type: 'string',
              controls: { active: "../source === 'yes'" },
            },
          },
        },
        { source: 'yes', child: 'kept' },
      );
      let descriptors = 0;
      try {
        const entry = readChildEntry(root);
        context.pendingOutputs = new Set([root]);
        flushPendingGateReads(root, entry, context);
        expect(context.pendingOutputs.has(root)).toBe(true);
        const baseline = root.__childrenByName__!;
        const target =
          shape === 'dictionary'
            ? baseline
            : createPreparedChildrenByName(
                baseline,
                baseline,
                [],
                Object.create(baseline),
              );
        root.__childrenByName__ = new Proxy(target, {
          getOwnPropertyDescriptor(target, name) {
            descriptors++;
            return Reflect.getOwnPropertyDescriptor(target, name);
          },
        });
        flushPendingGateReads(root, entry, context);
        expect(context.pendingOutputs.has(root)).toBe(true);
        expect(descriptors).toBe(0);
      } finally {
        release();
      }
    },
  );

  it.each(['constructor', '__proto__', 'toString'])(
    'preserves an own node named %s when its output value is undefined',
    (name) => {
      const { root, context, release } = createGateReadFixture(
        {
          type: 'object',
          properties: Object.fromEntries([
            [name, { type: 'string' }],
            [
              'child',
              { type: 'string', controls: { active: `../${name} === 'yes'` } },
            ],
          ]),
        },
        {},
      );
      try {
        const entry = readChildEntry(root);
        expect(root.__childrenByName__![name].__outputValue__).toBeUndefined();
        context.pendingOutputs = new Set([root]);
        flushPendingGateReads(root, entry, context);
        expect(context.pendingOutputs.has(root)).toBe(true);
      } finally {
        release();
      }
    },
  );

  it('flushes a genuinely missing source node', () => {
    const { root, context, release } = createGateReadFixture(
      {
        type: 'object',
        properties: {
          source: { type: 'string' },
          child: {
            type: 'string',
            controls: { active: "../source === 'yes'" },
          },
        },
      },
      { source: 'yes', child: 'kept' },
    );
    try {
      const entry = readChildEntry(root);
      delete root.__childrenByName__!['source'];
      context.pendingOutputs = new Set([root]);
      flushPendingGateReads(root, entry, context);
      expect(context.pendingOutputs.has(root)).toBe(false);
    } finally {
      release();
    }
  });

  it('does not treat an ordinary prototype source as an own node', () => {
    const { root, context, release } = createGateReadFixture(
      {
        type: 'object',
        properties: {
          source: { type: 'string' },
          child: {
            type: 'string',
            controls: { active: "../source === 'yes'" },
          },
        },
      },
      { source: 'yes', child: 'kept' },
    );
    try {
      const entry = readChildEntry(root);
      const ordinary = { ...root.__childrenByName__ };
      const instance = ordinary['source'];
      delete ordinary['source'];
      Object.setPrototypeOf(ordinary, { source: instance });
      root.__childrenByName__ = ordinary;
      context.pendingOutputs = new Set([root]);
      flushPendingGateReads(root, entry, context);
      expect(context.pendingOutputs.has(root)).toBe(false);
    } finally {
      release();
    }
  });
});
