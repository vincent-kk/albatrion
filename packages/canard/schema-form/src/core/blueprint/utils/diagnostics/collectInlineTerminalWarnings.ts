import { isArray } from '@winglet/common-utils/filter';
import { escapeSegment } from '@winglet/json/pointer';

import type {
  BlueprintDiagnostic,
  BlueprintNode,
  BlueprintSchema,
} from '../../type';
import { readSchemaObject } from '../analyze/readSchemaObject';
import { BlueprintWarningCode } from './constant';

/** Warning memberships follow the diagnostic envelope's development policy. */
const DEVELOPMENT = process.env.NODE_ENV !== 'production';

/**
 * Find ignored form groups below a terminal without following reference targets.
 * @param node - Terminal node whose authored contributions are inspected
 * @param emit - Root-local diagnostic consumer with duplicate suppression
 * @returns Nothing; visits schema positions only, leaving literal data opaque
 */
export const collectInlineTerminalWarnings = (
  node: BlueprintNode,
  emit: (diagnostic: BlueprintDiagnostic) => void,
): void => {
  const pending = node.declarations
    .filter((declaration) => declaration.role === 'declaration')
    .map(({ schema, schemaPath }) => ({
      schema,
      schemaPath,
      root: true,
      ancestors: [] as object[],
    }));
  const keys: string[] = [];
  const paths: string[] = [];
  while (pending.length) {
    const entry = pending.pop()!;
    if (
      typeof entry.schema === 'boolean' ||
      entry.ancestors.includes(entry.schema)
    )
      continue;
    const ancestors = [...entry.ancestors, entry.schema];
    const record = readSchemaObject(entry.schema);
    if (!entry.root)
      for (const keyword of ['controls', 'options', 'presentation'])
        if (record[keyword] !== undefined) {
          if (!keys.includes(keyword)) keys.push(keyword);
          if (!paths.includes(entry.schemaPath)) paths.push(entry.schemaPath);
        }
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
            ancestors,
          });
    for (const keyword of ['allOf', 'oneOf', 'anyOf', 'prefixItems'])
      if (isArray(record[keyword]))
        record[keyword].forEach((child: BlueprintSchema, index: number) =>
          pending.push({
            schema: child,
            schemaPath: `${entry.schemaPath}/${keyword}/${index}`,
            root: false,
            ancestors,
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
      if (isArray(child))
        child.forEach((item: BlueprintSchema, index: number) =>
          pending.push({
            schema: item,
            schemaPath: `${entry.schemaPath}/${keyword}/${index}`,
            root: false,
            ancestors,
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
          ancestors,
        });
    }
  }
  if (keys.length)
    emit({
      code: BlueprintWarningCode.TerminalSubtreeKeyIgnoredForForm,
      level: 'warning',
      schemaPath: node.schemaPath,
      details: {
        keys: DEVELOPMENT ? Object.freeze(keys.sort()) : keys.sort(),
        paths: DEVELOPMENT ? Object.freeze(paths.sort()) : paths.sort(),
      },
    });
};
