import { afterEach, expect, it, vi } from 'vitest';

import type { PlainNode } from '../../__tests__/fixtures/createPlainNode';
import { getHostDerived } from '../../utils/cache/derivedRecords';
import { selectChildren } from '../utils/compute/childSelection/selectChildren';
import type { ChildSelectionFrame } from '../utils/compute/childSelection/selectEntryStep';
import * as selection from '../utils/compute/childSelection/selectEntryStep';
import { createPreparedSelectionStructure } from '../utils/compute/childSelection/utils/createPreparedSelectionStructure';
import { prepareStaticHost } from '../utils/compute/childSelection/utils/prepareStaticHost';
import { publishPreparedSelection } from '../utils/compute/childSelection/utils/publishPreparedSelection';
import { releaseSettlementScratch } from '../utils/scratch/releaseSettlementScratch';
import { createPreparedPublicationFixture } from './helpers/createPreparedPublicationFixture';

afterEach(() => vi.restoreAllMocks());

// filid:contract settle-b9-prepared-publication
it('does not publish an admitted name whose recursive candidate never entered the view', () => {
  const { root, prepared, scratch, context } =
    createPreparedPublicationFixture();
  const prior = root.structure!;
  const dynamic: Record<string, PlainNode> = Object.create(prepared.baseline);
  const next = createPreparedSelectionStructure(
    prepared.baseline,
    prior,
    prepared.dynamicNames,
    dynamic,
  );
  const frame: ChildSelectionFrame<PlainNode> = {
    preparedStatic: prepared,
    preparedDynamic: dynamic,
    node: root,
    context,
    prior,
    computeChild: () => {},
    immediate: false,
    next,
    seen: new Map([['phantom', root.blueprintNode]]),
    inactiveEntries: [],
    changed: false,
    flushReads: false,
  };
  try {
    publishPreparedSelection(frame);
    expect(prepared.dynamicNames).toEqual(['x']);
    expect(root.structure).toBe(prior);
    expect(root.structure!.phantom).toBeUndefined();
  } finally {
    releaseSettlementScratch(scratch);
  }
});

it('restores the finalized shape when a prepared selection throws', () => {
  const { root, scratch, context } = createPreparedPublicationFixture();
  const prior = root.structure!;
  vi.spyOn(selection, 'selectEntryStep').mockImplementation(() => {
    throw new Error('selection failure');
  });
  try {
    expect(() =>
      selectChildren(root, context, prior, () => {}, false, false),
    ).toThrow('selection failure');
    expect(root.structure).toBe(prior);
    expect(() => {
      root.structure!.kind = prior.kind;
    }).not.toThrow();
  } finally {
    releaseSettlementScratch(scratch);
  }
});

it('captures the prior full child list when preparation follows a general prime', () => {
  const { root, scratch, context } = createPreparedPublicationFixture();
  const prior = root.structure!;
  const children = root.children!;
  delete getHostDerived(root).preparedStaticHost;
  root.structure = { kind: prior.kind };
  root.children = [prior.kind];
  try {
    const prepared = prepareStaticHost(root, prior, context, false);
    expect(prepared?.selectedChildren).toEqual(children);
    expect(prepared?.selectedStructure).toBe(prior);
  } finally {
    releaseSettlementScratch(scratch);
  }
});
