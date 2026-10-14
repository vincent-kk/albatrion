import { isArray } from '@winglet/common-utils/filter';
import { escapeSegment } from '@winglet/json/pointer';

import { FormWarningCode } from '../../../../../errors';
import { SCHEMA_GROUP } from '../../../constants/schemaGroup';
import type {
  BlueprintDiagnostic,
  BlueprintNode,
  BlueprintSchema,
} from '../../type';
import { readSchemaObject } from '../analyze/readSchemaObject';

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
  const pending: {
    schema: BlueprintSchema;
    schemaPath: string;
    root: boolean;
    ancestors: object[];
  }[] = node.declarations
    .filter((declaration) => declaration.role === 'declaration')
    .map(({ schema, schemaPath }) => ({
      schema,
      schemaPath,
      root: true,
      ancestors: [],
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
      for (const keyword of [
        SCHEMA_GROUP.controls,
        SCHEMA_GROUP.options,
        SCHEMA_GROUP.presentation,
      ])
        if (record[keyword] !== undefined) {
          if (!keys.includes(keyword)) keys.push(keyword);
          if (!paths.includes(entry.schemaPath)) paths.push(entry.schemaPath);
        }
    /* eslint-disable @typescript-eslint/consistent-type-assertions -- Map-keyword children are unvalidated authored values the warning walk reads as schemas; a guard would change which values it visits. */
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
    /* eslint-enable @typescript-eslint/consistent-type-assertions */
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
      code: FormWarningCode.TerminalSubtreeKeyIgnoredForForm,
      level: 'warning',
      schemaPath: node.schemaPath,
      details: {
        keys:
          process.env.NODE_ENV !== 'production'
            ? Object.freeze(keys.sort())
            : keys.sort(),
        paths:
          process.env.NODE_ENV !== 'production'
            ? Object.freeze(paths.sort())
            : paths.sort(),
      },
    });
};
