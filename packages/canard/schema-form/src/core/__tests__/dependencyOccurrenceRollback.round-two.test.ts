import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { isArrayNode } from '@/schema-form/core/surface';
import { FieldNode } from '@/schema-form/core/surface/runtime/FieldNode';

import { FieldNodeWriteKind, WriteOption } from '../engine/types/value';
import { getAliasedDependencyIndex } from '../engine/settle/utils/dependencies/getAliasedDependencyIndex';
import { getSettlementScratch } from '../engine/settle/utils/scratch/getSettlementScratch';
import { releaseSettlementScratch } from '../engine/settle/utils/scratch/releaseSettlementScratch';
import { createSettlementContext } from '../engine/settle/utils/settlement/createSettlementContext';
import { restoreArrayStructure } from '../engine/settle/utils/transition/restoreArrayStructure';

/** Recover the concrete test runtime only after its class identity is verified. */
const internalNode = (node: unknown): FieldNode => {
  if (!(node instanceof FieldNode)) throw new Error('Expected engine node');
  return node;
};

it('round-2 schema-form 2: rolled-back array admission retains the original occurrence set', () => {
  const rootSurface = nodeFromJSONSchema({
    jsonSchema: {
      type: 'object',
      $defs: { item: { type: 'object', properties: {
        a: { type: 'string' },
        b: { type: 'string', controls: { derived: '(../a) + "!"' } },
      } } },
      properties: {
        first: { $ref: '#/$defs/item' },
        list: { type: 'array', items: { $ref: '#/$defs/item' } },
      },
    },
    defaultValue: { first: { a: 'first' }, list: [{ a: 'existing' }] },
  });
  const root = internalNode(rootSurface);
  const listSurface = rootSurface.find('/list');
  if (!isArrayNode(listSurface)) throw new Error('Expected array');
  const list = internalNode(listSurface);
  const previousItems = [...(list.children ?? [])];
  const previousItemCount = list.itemCount ?? 0;
  const previousExtras = list.extras;
  const scratch = getSettlementScratch(root.runtime);
  const context = createSettlementContext(root, FieldNodeWriteKind.Automatic, WriteOption.Overwrite, scratch);
  const index = getAliasedDependencyIndex(context);
  if (!index) throw new Error('Expected occurrence index');
  const registrations = Reflect.get(index, 'byNode');
  if (!(registrations instanceof Map)) throw new Error('Expected identity registrations');
  const before = [...registrations.keys()];
  releaseSettlementScratch(scratch);
  listSurface.push({ a: 'new' });
  const rollbackScratch = getSettlementScratch(root.runtime);
  const rollback = createSettlementContext(root, FieldNodeWriteKind.Automatic, WriteOption.Overwrite, rollbackScratch);
  rollback.arrayStructureLog.push({ host: list, previousItems, previousItemCount, previousExtras });
  restoreArrayStructure(rollback);
  getAliasedDependencyIndex(rollback);
  expect(new Set(registrations.keys())).toEqual(new Set(before));
  releaseSettlementScratch(rollbackScratch);
});
