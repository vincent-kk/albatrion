import { describe, expect, it } from 'vitest';

import { createPreparedSelectionStructure } from '../utils/compute/childSelection/utils/createPreparedSelectionStructure';
import { flushPendingGateReads } from '../utils/gates/flushPendingGateReads';
import { createGateReadFixture } from './fixtures/createGateReadFixture';

// filid:contract settle-pending-structure-read
describe('pending gate structure reads', () => {
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
        const template = root.structure!.child.blueprintNode;
        context.pendingOutputs = new Set([root]);
        flushPendingGateReads(template, '/child', context);
        expect(context.pendingOutputs.has(root)).toBe(true);
        const baseline = root.structure!;
        const target =
          shape === 'dictionary'
            ? baseline
            : createPreparedSelectionStructure(
                baseline,
                baseline,
                [],
                Object.create(baseline),
              );
        root.structure = new Proxy(target, {
          getOwnPropertyDescriptor(target, name) {
            descriptors++;
            return Reflect.getOwnPropertyDescriptor(target, name);
          },
        });
        flushPendingGateReads(template, '/child', context);
        expect(context.pendingOutputs.has(root)).toBe(true);
        expect(descriptors).toBe(0);
      } finally {
        release();
      }
    },
  );

  it.each(['constructor', '__proto__', 'toString'])(
    'preserves an own node named %s when it emits undefined',
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
        const template = root.blueprintNode.childEntries.find(
          (entry) => entry.name === 'child',
        )!.node;
        expect(root.structure![name].emit).toBeUndefined();
        context.pendingOutputs = new Set([root]);
        flushPendingGateReads(template, '/child', context);
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
      const template = root.structure!.child.blueprintNode;
      delete root.structure!.source;
      context.pendingOutputs = new Set([root]);
      flushPendingGateReads(template, '/child', context);
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
      const template = root.structure!.child.blueprintNode;
      const ordinary = { ...root.structure };
      const source = ordinary.source;
      delete ordinary.source;
      Object.setPrototypeOf(ordinary, { source });
      root.structure = ordinary;
      context.pendingOutputs = new Set([root]);
      flushPendingGateReads(template, '/child', context);
      expect(context.pendingOutputs.has(root)).toBe(false);
    } finally {
      release();
    }
  });
});
