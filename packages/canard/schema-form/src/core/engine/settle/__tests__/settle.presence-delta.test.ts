import { afterEach, expect, it, vi } from 'vitest';

import type { PlainNode } from '../../__tests__/fixtures/createPlainNode';
import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { WriteOption } from '../../types/value';
import { getHostDerived } from '../../utils/cache/derivedRecords';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import type { PreparedStaticHost } from '../utils/compute/childSelection/utils/prepareStaticHost';
import { collectPresenceChangeNames } from '../utils/dependencies/collectPresenceChangeNames';
import { getSettlementScratch } from '../utils/scratch/getSettlementScratch';
import { releaseSettlementScratch } from '../utils/scratch/releaseSettlementScratch';
import { createSettlementContext } from '../utils/settlement/createSettlementContext';
import { writeFieldNode } from '../utils/write/writeFieldNode';
import { observePresenceChangeNames } from './helpers/observePresenceChangeNames';

afterEach(() => vi.restoreAllMocks());

// filid:contract settle-b9-presence-delta
it('does not enumerate the previous 1000-sibling shape on a steady switch', () => {
  const { root } = createTestTree({
    type: 'object',
    properties: {
      type: { type: 'string', default: 'a' },
      ...Object.fromEntries(
        Array.from({ length: 1000 }, (_, index) => [
          `pad_${index}`,
          { type: 'number', default: index },
        ]),
      ),
    },
    oneOf: ['a', 'b'].map((type) => ({
      controls: { active: `./type === "${type}"` },
      properties: { x: { type: 'string', default: type } },
    })),
  });
  loadFieldNodeAtMount(root, {}, WriteOption.Overwrite);
  writeFieldNode(root.structure!.type, 'b', 'input', WriteOption.Overwrite);
  let scans = 0;
  root.structure = new Proxy(root.structure!, {
    ownKeys(target) {
      scans++;
      return Reflect.ownKeys(target);
    },
  });
  writeFieldNode(root.structure.type, 'a', 'input', WriteOption.Overwrite);
  expect(scans).toBe(0);
  expect(root.local).toMatchObject({ type: 'a', x: 'a', pad_999: 999 });
});

it('keeps actual multi-round dynamic key order instead of authored admission order', () => {
  const { root } = createTestTree({
    type: 'object',
    properties: { type: { type: 'boolean', default: false } },
    allOf: [
      {
        controls: { active: './type && ./q === "on"' },
        properties: { p: { type: 'string', default: 'p' } },
      },
      {
        controls: { active: './type' },
        properties: { q: { type: 'string', default: 'on' } },
      },
    ],
  });
  loadFieldNodeAtMount(root, {}, WriteOption.Overwrite);
  const counts = observePresenceChangeNames();
  writeFieldNode(root.structure!.type, true, 'input', WriteOption.Overwrite);
  expect(
    Reflect.get(getHostDerived(root).preparedStaticHost!, 'dynamicNames'),
  ).toEqual(
    Object.keys(root.structure!).filter((name) => name === 'p' || name === 'q'),
  );
  expect(root.local).toEqual({ type: true, p: 'p', q: 'on' });
  writeFieldNode(root.structure!.type, false, 'input', WriteOption.Overwrite);
  expect(counts.bounded).toBeGreaterThan(0);
});

it('matches full presence traversal across a 1000-sibling switch', () => {
  const { root } = createTestTree({
    type: 'object',
    properties: {
      kind: { type: 'boolean', default: false },
      ...Object.fromEntries(
        Array.from({ length: 1000 }, (_, index) => [
          `pad_${index}`,
          { type: 'number' },
        ]),
      ),
    },
    oneOf: [false, true].map((kind) => ({
      controls: { active: `./kind === ${kind}` },
      properties: { [kind ? 'b' : 'a']: { type: 'string' } },
    })),
  });
  loadFieldNodeAtMount(root, {}, WriteOption.Overwrite);
  const counts = observePresenceChangeNames();
  writeFieldNode(root.structure!.kind, true, 'input', WriteOption.Overwrite);
  writeFieldNode(root.structure!.kind, false, 'input', WriteOption.Overwrite);
  expect(counts.bounded).toBeGreaterThan(0);
});

it('matches full presence traversal when a nullable prepared host is nullified and restored', () => {
  const { root } = createTestTree({
    type: ['object', 'null'],
    properties: { kind: { type: 'boolean', default: false } },
    oneOf: [false, true].map((kind) => ({
      controls: { active: `./kind === ${kind}` },
      properties: { x: { type: 'string', default: String(kind) } },
    })),
  });
  loadFieldNodeAtMount(root, {}, WriteOption.Overwrite);
  writeFieldNode(root.structure!.kind, true, 'input', WriteOption.Overwrite);
  const counts = observePresenceChangeNames();
  writeFieldNode(root, null, 'input', WriteOption.Overwrite);
  writeFieldNode(root, { kind: false }, 'input', WriteOption.Overwrite);
  expect(counts.calls).toBeGreaterThan(0);
  expect(counts.null + counts.missing).toBeGreaterThan(0);
});

it('matches full presence traversal when a prepared host exits and re-enters', () => {
  const { root } = createTestTree({
    type: 'object',
    properties: { show: { type: 'boolean', default: true } },
    oneOf: [
      {
        controls: { active: './show' },
        properties: {
          host: {
            type: 'object',
            properties: { kind: { type: 'boolean', default: false } },
            oneOf: [false, true].map((kind) => ({
              controls: { active: `./kind === ${kind}` },
              properties: { x: { type: 'string' } },
            })),
          },
        },
      },
    ],
  });
  loadFieldNodeAtMount(root, {}, WriteOption.Overwrite);
  writeFieldNode(
    root.structure!.host.structure!.kind,
    true,
    'input',
    WriteOption.Overwrite,
  );
  const counts = observePresenceChangeNames();
  writeFieldNode(root.structure!.show, false, 'input', WriteOption.Overwrite);
  writeFieldNode(root.structure!.show, true, 'input', WriteOption.Overwrite);
  expect(root.structure!.host.structure!.kind).toBeDefined();
  expect(
    counts.missing + counts.entered + counts.exited + counts.revived,
  ).toBeGreaterThan(0);
});

it('matches full presence traversal after the prepared witness is deleted', () => {
  const { root } = createTestTree({
    type: 'object',
    properties: { kind: { type: 'boolean', default: false } },
    oneOf: [false, true].map((kind) => ({
      controls: { active: `./kind === ${kind}` },
      properties: { x: { type: 'string' } },
    })),
  });
  loadFieldNodeAtMount(root, {}, WriteOption.Overwrite);
  writeFieldNode(root.structure!.kind, true, 'input', WriteOption.Overwrite);
  delete getHostDerived(root).preparedStaticHost;
  const counts = observePresenceChangeNames();
  writeFieldNode(root.structure!.kind, false, 'input', WriteOption.Overwrite);
  expect(counts.calls).toBeGreaterThan(0);
  expect(getHostDerived(root).preparedStaticHost).toBeDefined();
});

it('reaches every full-scan fallback with a previously prepared host', () => {
  const { root } = createTestTree({
    type: 'object',
    properties: { kind: { type: 'boolean', default: false } },
    oneOf: [false, true].map((kind) => ({
      controls: { active: `./kind === ${kind}` },
      properties: { x: { type: 'string' } },
    })),
  });
  loadFieldNodeAtMount(root, {}, WriteOption.Overwrite);
  writeFieldNode(root.structure!.kind, true, 'input', WriteOption.Overwrite);
  const derived = getHostDerived<
    'preparedStaticHost',
    PreparedStaticHost<PlainNode>
  >(root);
  const prepared = derived.preparedStaticHost!;
  expect(prepared).toBeDefined();
  const structure = root.structure!;
  const scratch = getSettlementScratch(root.runtime);
  const context = createSettlementContext(root, 'callerReplace', 0, scratch);
  context.preparedStaticHosts = new Set([root]);
  context.presenceSelections = new Map([
    [root, { structure, names: prepared.dynamicNames }],
  ]);
  const counts = observePresenceChangeNames();
  try {
    collectPresenceChangeNames(root, structure, context);
    const previous = Object.assign(Object.create(null), structure);
    delete previous.kind;
    const lifecycle: ('entered' | 'exited' | 'perished' | 'revived')[] = [
      'entered',
      'exited',
      'perished',
      'revived',
    ];
    for (const kind of lifecycle) {
      context.presenceSelections.set(root, {
        structure: previous,
        names: prepared.dynamicNames,
      });
      context[kind].add(root);
      expect(collectPresenceChangeNames(root, previous, context)).toEqual([
        'kind',
      ]);
      context[kind].delete(root);
      expect(counts[kind]).toBeGreaterThan(0);
    }
    const raw = root.raw;
    context.presenceSelections.set(root, {
      structure: previous,
      names: prepared.dynamicNames,
    });
    root.raw = null;
    expect(collectPresenceChangeNames(root, previous, context)).toEqual([
      'kind',
    ]);
    root.raw = raw;
    context.presenceSelections.set(root, {
      structure,
      names: prepared.dynamicNames,
    });
    expect(collectPresenceChangeNames(root, previous, context)).toEqual([
      'kind',
    ]);
    context.presenceSelections.set(root, {
      structure: previous,
      names: prepared.dynamicNames,
    });
    context.preparedStaticHosts.delete(root);
    expect(collectPresenceChangeNames(root, previous, context)).toEqual([
      'kind',
    ]);
    context.preparedStaticHosts.add(root);
    delete derived.preparedStaticHost;
    expect(collectPresenceChangeNames(root, previous, context)).toEqual([
      'kind',
    ]);
    derived.preparedStaticHost = prepared;
    expect(counts.null).toBeGreaterThan(0);
    expect(counts.mismatch).toBeGreaterThan(0);
    expect(counts.missing).toBeGreaterThan(0);
    expect(counts.bounded).toBeGreaterThan(0);
  } finally {
    releaseSettlementScratch(scratch);
  }
});
