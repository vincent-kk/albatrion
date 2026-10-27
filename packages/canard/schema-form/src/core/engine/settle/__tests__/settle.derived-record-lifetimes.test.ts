import { expect, it } from 'vitest';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import {
  HostStaticPartition,
  blueprint,
  getItemEntries,
} from '../../blueprint';
import { WriteOption } from '../../types/value';
import { getHostDerived } from '../../utils/cache/derivedRecords';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import { readAdmittedEdgeSchema } from '../utils/compute/childSelection/readAdmittedEdgeSchema';
import { staticIds } from '../utils/compute/childSelection/staticIds';
import { staticShape } from '../utils/compute/childSelection/staticShape';
import type { StaticShapeMemo } from '../utils/compute/childSelection/staticShape';
import { createStaticEntryReuser } from '../utils/compute/childSelection/utils/createStaticEntryReuser';
import { getDependencyIndex } from '../utils/dependencies/getDependencyIndex';
import { getSettlementScratch } from '../utils/scratch/getSettlementScratch';
import { createSettlementContext } from '../utils/settlement/createSettlementContext';

it('retains distinct edge memo results when two entries refer to the same node', () => {
  const analysis = blueprint({ type: 'array', items: { type: 'string' } });
  const first = getItemEntries(analysis.root, 0)[0];
  const second = getItemEntries(analysis.root, 1)[0];
  expect(first.node).toBe(second.node);
  const ids = staticIds(first);
  expect(staticIds(second)).not.toBe(ids);
  expect(staticIds(first)).toBe(ids);
  const admitted = readAdmittedEdgeSchema(first, first.node, undefined);
  expect(readAdmittedEdgeSchema(second, second.node, undefined)).not.toBe(
    admitted,
  );
  expect(readAdmittedEdgeSchema(first, first.node, undefined)).toBe(admitted);
  const record = getHostDerived(first.node);
  expect(record.staticIds).toBeInstanceOf(Map);
  expect(record.admittedEdgeSchemas).toBeInstanceOf(Map);
});

it('keeps the by-entry derivative lazy after preparing a static shape', () => {
  const { root } = createTestTree({
    type: 'object',
    properties: {
      flag: { type: 'boolean' },
      stable: { type: 'string' },
      gated: { type: 'string', controls: { active: '../flag' } },
    },
  });
  loadFieldNodeAtMount(
    root,
    { flag: true, stable: 'value' },
    WriteOption.Overwrite,
  );
  const host = root.blueprintNode;
  const shape = staticShape(
    host,
    root.runtime.blueprint.isAtomic,
    HostStaticPartition.get(host).staticEntries,
  );
  const memo = getHostDerived<'staticShape', StaticShapeMemo>(
    host,
  ).staticShape!;
  expect(memo.entries).toBe(shape);
  expect(memo.byEntry).toBeUndefined();
  const context = createSettlementContext(
    root,
    'input',
    WriteOption.Overwrite,
    getSettlementScratch(root.runtime),
  );
  const reuser = createStaticEntryReuser(
    root,
    root.structure!,
    context,
    {},
    undefined,
    false,
    false,
  );
  expect(reuser).toBeTypeOf('function');
  expect(memo.byEntry).toBeInstanceOf(Map);
  expect(memo.entries).toBe(shape);
});

it('owns presence traversal memos in separate settlement contexts, outside the static index', () => {
  const { root } = createTestTree({
    type: 'object',
    properties: {
      flag: { type: 'boolean' },
      value: { type: 'string', controls: { active: '../flag' } },
    },
  });
  loadFieldNodeAtMount(
    root,
    { flag: true, value: 'value' },
    WriteOption.Overwrite,
  );
  const index = getDependencyIndex(root.runtime.blueprint);
  const scratch = getSettlementScratch(root.runtime);
  const first = createSettlementContext(
    root,
    'input',
    WriteOption.Overwrite,
    scratch,
  );
  const second = createSettlementContext(
    root,
    'input',
    WriteOption.Overwrite,
    scratch,
  );
  expect(first.dependencyPresenceMemo).toBeUndefined();
  expect(second.dependencyPresenceMemo).toBeUndefined();
  index.affectedByPresence('', 'flag', undefined, first);
  expect(first.dependencyPresenceMemo).toBeInstanceOf(Map);
  expect(second.dependencyPresenceMemo).toBeUndefined();
  index.affectedByPresence('', 'flag', undefined, second);
  expect(first.dependencyPresenceMemo).not.toBe(second.dependencyPresenceMemo);
  expect(Reflect.get(index, 'presenceMemos')).toBeUndefined();
});
