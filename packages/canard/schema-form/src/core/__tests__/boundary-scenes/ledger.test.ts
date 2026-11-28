import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { batchedWriteScenes } from './fixtures/scenes/batchedWrites';
import { childConsistencyScenes } from './fixtures/scenes/childConsistency';
import { derivedOrderScenes } from './fixtures/scenes/derivedOrder';
import { eventRuleScenes } from './fixtures/scenes/eventRules';
import { fillScenes } from './fixtures/scenes/fills';
import { itemGateScenes } from './fixtures/scenes/itemGates';
import { refreshScenes } from './fixtures/scenes/refresh';
import { settlementScenes } from './fixtures/scenes/settlement';
import { supportLimitScenes } from './fixtures/scenes/supportLimits';
import { unionReadingScenes } from './fixtures/scenes/unionReading';
import type { BoundaryScene } from './fixtures/types';

/** Every area, keyed by the id prefix its scenes carry; each list has a runner of its own. */
const AREAS: Readonly<Record<string, readonly BoundaryScene[]>> = {
  settlement: settlementScenes,
  'union-reading': unionReadingScenes,
  fills: fillScenes,
  'derived-order': derivedOrderScenes,
  'event-rules': eventRuleScenes,
  refresh: refreshScenes,
  'child-consistency': childConsistencyScenes,
  'item-gates': itemGateScenes,
  'batched-writes': batchedWriteScenes,
  'support-limits': supportLimitScenes,
};

/**
 * The checked-in ledger: every scene id under its state. A change that removes a scene's difference moves its id from `known` to `expected` in the
 * same pull request; an id leaves the ledger only with its scene, and such a scene stays as `expected`.
 */
const LEDGER = {
  expected: [
    'settlement/derived-null-satisfies-if-at-load',
    'settlement/stale-derived-satisfies-gate-on-write',
    'settlement/gate-reads-later-gated-sibling-as-absent',
    'settlement/stale-derived-switches-on-a-loop',
    'settlement/item-gate-reads-later-gated-sibling-as-absent',
    'settlement/child-gate-reads-a-primed-out-sibling',
    'event-rules/inject-source-cleared-in-same-settlement',
    'item-gates/outer-item-declares-on-its-children',
    'batched-writes/null-host-released-by-a-union-child',
    'batched-writes/find-sees-the-last-commit',
    'support-limits/field-flips-its-own-presence',
    'settlement/presence-gate-reads-union-before-typing',
  ],
  known: [
    'settlement/gate-reads-before-default-fill',
    'settlement/root-gate-reads-value-derived-in-same-pass',
    'settlement/value-rule-write-to-middle-pass-node',
    'union-reading/direct-self-reader',
    'union-reading/self-reader-switched-off-and-on',
    'union-reading/second-presented-change-in-one-settlement',
    'fills/default-chosen-by-a-filled-default',
    'fills/chain-of-gated-defaults',
    'derived-order/chain-reads-round-start-value',
    'derived-order/shape-decided-by-stale-derived',
    'derived-order/chain-through-an-aliased-template',
    'event-rules/same-value-reset-fires-once',
    'event-rules/inject-from-a-middle-pass-node',
    'event-rules/unset-on-stale-derived',
    'event-rules/inject-from-a-revived-node',
    'refresh/typed-value-cleared-by-unset-rule',
    'refresh/narrowed-union-input-keeps-typed-text',
    'child-consistency/if-turned-off-two-levels-up',
    'item-gates/nested-item-takes-own-branch',
    'item-gates/item-level-if-on-the-item-itself',
    'item-gates/outer-item-declares-at-depth-two',
    'batched-writes/untouched-union-keeps-its-value',
    'batched-writes/context-change-after-marks',
    'batched-writes/untouched-omit-empty-item',
    'batched-writes/untouched-nullable-item-without-value',
    'batched-writes/untouched-trailing-empty-items',
    'batched-writes/write-into-a-position-the-output-omits',
    'batched-writes/reference-to-a-shrunk-position',
    'batched-writes/reset-barrier-revives-a-removed-reference',
    'batched-writes/reset-barrier-loads-the-cut-snapshot',
    'batched-writes/merge-replaces-an-array-of-objects',
    'batched-writes/merge-reads-a-non-enumerable-declared-key',
    'batched-writes/throwing-getter-in-a-solitary-write',
    'support-limits/error-names-the-loop-participants',
    'support-limits/self-reader-through-a-derived-copy',
    'support-limits/conditions-that-negate-each-other',
    'support-limits/even-ring-of-typing-gates',
    'fills/default-chosen-by-its-own-value',
    'derived-order/rule-dropped-by-a-later-pass',
  ],
  open: [],
};

/** The file stem of an area's scene list and runner: the area id in camelCase. */
const areaFileStem = (area: string) =>
  area.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());

/** A scene id: a kebab-case area, a slash, then a kebab-case name that may contain digits. */
const ID_PATTERN = /^[a-z]+(?:-[a-z]+)*\/[a-z0-9]+(?:-[a-z0-9]+)*$/;

describe('boundary scene ledger', () => {
  it('lists every scene id under the state its scene declares', () => {
    const recorded: Record<BoundaryScene['state'], string[]> = {
      expected: [],
      known: [],
      open: [],
    };
    for (const scene of Object.values(AREAS).flat())
      recorded[scene.state].push(scene.id);
    for (const ids of Object.values(recorded)) ids.sort();
    expect(recorded).toEqual({
      expected: [...LEDGER.expected].sort(),
      known: [...LEDGER.known].sort(),
      open: [...LEDGER.open].sort(),
    });
  });

  it('gives each scene a unique id that starts with its area', () => {
    const ids = Object.values(AREAS)
      .flat()
      .map((scene) => scene.id);
    expect(ids.filter((id, index) => ids.indexOf(id) !== index)).toEqual([]);
    const misplaced = Object.entries(AREAS).flatMap(([area, scenes]) =>
      scenes
        .map((scene) => scene.id)
        .filter((id) => !ID_PATTERN.test(id) || !id.startsWith(`${area}/`)),
    );
    expect(misplaced).toEqual([]);
  });

  it('registers every scene file of fixtures/scenes in AREAS', () => {
    const files = readdirSync(new URL('./fixtures/scenes/', import.meta.url))
      .filter((name) => name.endsWith('.ts'))
      .sort();
    const registered = Object.keys(AREAS)
      .map((area) => `${areaFileStem(area)}.ts`)
      .sort();
    expect(files).toEqual(registered);
  });

  it('gives every area a runner of its own', () => {
    const runners = readdirSync(new URL('./', import.meta.url))
      .filter(
        (name) => name.endsWith('.test.ts') && name !== 'ledger.test.ts',
      )
      .sort();
    const expected = Object.keys(AREAS)
      .map((area) => `${areaFileStem(area)}.test.ts`)
      .sort();
    expect(runners).toEqual(expected);
  });
});
