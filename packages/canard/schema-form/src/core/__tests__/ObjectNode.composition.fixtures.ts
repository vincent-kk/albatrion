import { nodeFromJSONSchema } from '@/schema-form/core';
import type { JSONSchema } from '@/schema-form/types';

import type { ObjectNode } from '../nodes/ObjectNode';

/** The `type` declaration of a schema, in any form a JSON document can carry — including forms the TypeScript schema types exclude. */
export type TypeForm = { type?: unknown; nullable?: boolean };

/** Whether `type` names `null` alone; such a branch owns no fields, so the fixture gives it none. */
const isNullType = (type: unknown) =>
  type === 'null' || (Array.isArray(type) && String(type) === 'null');

/**
 * Builds the form for a `target` object whose first composition branch declares `branch`.
 * The schema goes through JSON, as schemas arriving from a server do, so type forms the static types reject are judged too.
 * @param scope - Composition keyword carrying the branches
 * @param parent - Type declaration of the `target` object
 * @param branch - Type declaration of the first branch, which also gets one field unless it is a null branch; `{}` omits `type`
 * @returns The root node
 */
export const buildCompositionTarget = (
  scope: 'oneOf' | 'anyOf',
  parent: TypeForm,
  branch: TypeForm,
) => {
  const jsonSchema: JSONSchema = JSON.parse(
    JSON.stringify({
      type: 'object',
      properties: {
        target: {
          ...parent,
          properties: { kind: { type: 'string' } },
          [scope]: [
            isNullType(branch.type)
              ? branch
              : { ...branch, properties: { first: { type: 'string' } } },
            { properties: { other: { type: 'string' } } },
          ],
        },
      },
    }),
  );
  return nodeFromJSONSchema({ onChange: () => {}, jsonSchema }) as ObjectNode;
};

export const NULLABLE_ARRAY = { type: ['object', 'null'] };
export const NULLABLE_REVERSED = { type: ['null', 'object'] };
export const NULLABLE_FLAG = { type: 'object', nullable: true };
export const PLAIN = { type: 'object' };
