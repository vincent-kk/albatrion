import { escapeSegment } from '@winglet/json/pointer';

import type { BlueprintDiagnostic, BlueprintSchema } from '../../type';
import { readSchemaObject } from '../analyze/readSchemaObject';
import { BlueprintWarningCode } from './constant';

/**
 * Find ignored form groups below a terminal without following reference targets.
 * @param schema - Terminal's authored schema
 * @param schemaPath - Terminal's original location
 * @param emit - Root-local diagnostic consumer with duplicate suppression
 * @returns Nothing; visits schema positions only, leaving literal data opaque
 */
export const collectInlineTerminalWarnings = (
  schema: BlueprintSchema,
  schemaPath: string,
  emit: (diagnostic: BlueprintDiagnostic) => void,
): void => {
  const pending = [{ schema, schemaPath, root: true }];
  const visited = new Set<object>();
  while (pending.length) {
    const entry = pending.pop()!;
    if (typeof entry.schema === 'boolean' || visited.has(entry.schema))
      continue;
    visited.add(entry.schema);
    const record = readSchemaObject(entry.schema);
    if (!entry.root)
      for (const keyword of ['controls', 'options', 'presentation'])
        if (record[keyword] !== undefined)
          emit({
            code: BlueprintWarningCode.TerminalSubtreeKeyIgnoredForForm,
            level: 'warning',
            schemaPath: entry.schemaPath,
            details: { keyword },
          });
    for (const keyword of [
      'properties',
      'patternProperties',
      '$defs',
      'definitions',
      'dependentSchemas',
    ])
      if (record[keyword] && typeof record[keyword] === 'object')
        for (const [name, child] of Object.entries(record[keyword]))
          pending.push({
            schema: child as BlueprintSchema,
            schemaPath: `${entry.schemaPath}/${keyword}/${escapeSegment(name)}`,
            root: false,
          });
    for (const keyword of ['allOf', 'oneOf', 'anyOf', 'prefixItems'])
      if (Array.isArray(record[keyword]))
        record[keyword].forEach((child: BlueprintSchema, index: number) =>
          pending.push({
            schema: child,
            schemaPath: `${entry.schemaPath}/${keyword}/${index}`,
            root: false,
          }),
        );
    for (const keyword of [
      'items',
      'additionalItems',
      'additionalProperties',
      'contains',
      'not',
      'if',
      'then',
      'else',
      'unevaluatedProperties',
      'unevaluatedItems',
    ]) {
      const child = record[keyword];
      if (Array.isArray(child))
        child.forEach((item: BlueprintSchema, index: number) =>
          pending.push({
            schema: item,
            schemaPath: `${entry.schemaPath}/${keyword}/${index}`,
            root: false,
          }),
        );
      else if (
        typeof child === 'boolean' ||
        (child && typeof child === 'object')
      )
        pending.push({
          schema: child,
          schemaPath: `${entry.schemaPath}/${keyword}`,
          root: false,
        });
    }
  }
};
