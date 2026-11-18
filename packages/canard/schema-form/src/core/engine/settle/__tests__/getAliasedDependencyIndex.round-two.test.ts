import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { type FieldNode, isArrayNode } from '@/schema-form/core/surface';

import { FieldNodeWriteKind, WriteOption } from '../../types/value';
import { getAliasedDependencyIndex } from '../utils/dependencies/getAliasedDependencyIndex';
import { getSettlementScratch } from '../utils/scratch/getSettlementScratch';
import { releaseSettlementScratch } from '../utils/scratch/releaseSettlementScratch';
import { createSettlementContext } from '../utils/settlement/createSettlementContext';
import { restoreArrayStructure } from '../utils/transition/restoreArrayStructure';

it('round-2 schema-form 2: rolled-back array admission retains the original occurrence set', () => {
  const root: FieldNode = nodeFromJSONSchema({
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
  const list = root.find('/list');
  if (!isArrayNode(list)) throw new Error('Expected array');
  const previousItems = [...(list.children ?? [])];
  const previousItemCount = list.itemCount;
  const previousExtras = list.extras;
  const scratch = getSettlementScratch(root.runtime);
  const context = createSettlementContext(root, FieldNodeWriteKind.Automatic, WriteOption.Overwrite, scratch);
  const index = getAliasedDependencyIndex(context);
  if (!index) throw new Error('Expected occurrence index');
  const registrations = Reflect.get(index, 'byNode');
  if (!(registrations instanceof Map)) throw new Error('Expected identity registrations');
  const before = [...registrations.keys()];
  releaseSettlementScratch(scratch);
  list.push({ a: 'new' });
  const rollbackScratch = getSettlementScratch(root.runtime);
  const rollback = createSettlementContext(root, FieldNodeWriteKind.Automatic, WriteOption.Overwrite, rollbackScratch);
  rollback.arrayStructureLog.push({ host: list, previousItems, previousItemCount, previousExtras });
  restoreArrayStructure(rollback);
  getAliasedDependencyIndex(rollback);
  expect(new Set(registrations.keys())).toEqual(new Set(before));
  releaseSettlementScratch(rollbackScratch);
});
