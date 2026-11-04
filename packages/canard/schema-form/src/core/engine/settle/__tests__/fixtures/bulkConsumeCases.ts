import type { BlueprintSchema } from '../../../blueprint';
import type { gateSelectionCases } from './gateSelectionCases';

/** Build the measured string-leaf nested schema and its full changed input together. */
const nested = (depth: number): { schema: BlueprintSchema; value: unknown } => {
  if (!depth) return { schema: { type: 'string', default: 'leaf' }, value: 'changed' };
  const children = Array.from({ length: 4 }, (_, index) => ({ key: 'n' + index, ...nested(depth - 1) }));
  return {
    schema: { type: 'object', properties: Object.fromEntries(children.map(child => [child.key, child.schema])) },
    value: Object.fromEntries(children.map(child => [child.key, child.value])),
  };
};

const tree = nested(6);

/** Bulk histories share the gate-table observer's complete observation surface. */
export const bulkConsumeCases: typeof gateSelectionCases = [
  {
    name: 'bulk consume flat-2000',
    schema: { type: 'object', properties: Object.fromEntries(
      Array.from({ length: 2000 }, (_, index) => ['field_' + index, { type: 'string', default: 'leaf' }]),
    ) },
    input: {},
    writes: [{ value: Object.fromEntries(Array.from({ length: 2000 }, (_, index) => ['field_' + index, 'changed'])) }],
  },
  { name: 'bulk consume nested-d6-f4', schema: tree.schema, input: {}, writes: [{ value: tree.value }] },
  {
    name: 'bulk consume recreated array child after parent consumption',
    schema: { type: 'object', properties: {
      source: { type: 'boolean' },
      list: { type: 'array', items: { type: 'string' }, controls: { derived: '../source ? ["new"] : ["old"]' } },
    } },
    input: { source: false, list: ['old'] },
    writes: [{ value: { source: true, list: [] } }],
  },
];
