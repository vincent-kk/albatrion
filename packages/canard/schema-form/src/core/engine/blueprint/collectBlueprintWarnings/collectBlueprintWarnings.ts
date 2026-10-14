import { isArray } from '@winglet/common-utils/filter';

import { FormWarningCode } from '../../../../errors';
import type {
  Blueprint,
  BlueprintDiagnostic,
  BlueprintOptions,
} from '../types/blueprint';
import { readSchemaObject } from '../utils/analyze/readSchemaObject';
import { collectInlineTerminalWarnings } from './utils/collectInlineTerminalWarnings';

/** Dependency keywords the form ignores on any declaration. */
const IGNORED_DEPENDENCY_KEYWORDS = ['dependentSchemas', 'dependencies'];

/** Keywords the form ignores inside an `allOf` branch. */
const ALL_OF_IGNORED_KEYWORDS = [
  'not',
  'dependencies',
  'dependentRequired',
  'dependentSchemas',
  'unevaluatedProperties',
  'unevaluatedItems',
  'contains',
];

/** A schema path ending in an `allOf` branch index. */
const ALL_OF_BRANCH_PATH = /\/allOf\/\d+$/;

/** A schema path ending in a `oneOf` or `anyOf` branch index. */
const UNION_BRANCH_PATH = /\/(oneOf|anyOf)\/\d+$/;

/**
 * Collect advisory records only when a consumer explicitly requests diagnostics.
 * @param blueprint - Completed immutable graph retaining original declarations
 * @param collect - Requested collector; absent consumers cause no warning traversal
 * @returns Nothing; each code/location/discriminating-key occurrence is delivered once
 */
export const collectBlueprintWarnings = (
  blueprint: Blueprint,
  collect: BlueprintOptions['collect'],
): void => {
  if (!collect) return;
  const seen = new Set<string>();
  const emit = (diagnostic: BlueprintDiagnostic): void => {
    const key = `${diagnostic.code}:${diagnostic.schemaPath}:${diagnostic.details.keyword ?? ''}`;
    if (seen.has(key)) return;
    seen.add(key);
    collect(
      process.env.NODE_ENV !== 'production'
        ? Object.freeze(diagnostic)
        : diagnostic,
    );
  };
  for (const node of blueprint.nodes) {
    if (node.strategy === 'terminal') collectInlineTerminalWarnings(node, emit);
    for (const declaration of node.declarations) {
      const schema = readSchemaObject(declaration.schema);
      const warning = (
        code: FormWarningCode,
        details: Record<string, unknown> = {},
      ): void =>
        emit({
          code,
          level: 'warning',
          schemaPath: declaration.schemaPath,
          details,
        });
      for (const keyword of IGNORED_DEPENDENCY_KEYWORDS)
        if (schema[keyword] !== undefined)
          warning(FormWarningCode.DependentSchemasIgnoredForForm, {
            keyword,
          });
      if (ALL_OF_BRANCH_PATH.test(declaration.schemaPath))
        for (const keyword of ALL_OF_IGNORED_KEYWORDS)
          if (schema[keyword] !== undefined)
            warning(FormWarningCode.AllOfKeywordIgnoredForForm, {
              keyword,
            });
      if (
        node.kind === 'object' &&
        node.strategy === 'branch' &&
        (schema.readOnly !== undefined ||
          schema.controls?.readOnly !== undefined ||
          schema.controls?.disabled !== undefined)
      )
        warning(FormWarningCode.LockOnNonTerminalObject);
      if (UNION_BRANCH_PATH.test(declaration.schemaPath)) {
        if (schema.if !== undefined && schema.else !== false)
          warning(FormWarningCode.IfWithoutElseFalse);
        if (
          (schema.type === 'null' ||
            (isArray(schema.type) &&
              schema.type.length === 1 &&
              schema.type[0] === 'null')) &&
          (schema.properties !== undefined ||
            schema.controls?.active !== undefined)
        )
          warning(FormWarningCode.NullBranchIgnoredForForm);
      }
      for (const gate of declaration.gates) {
        if (gate.kind !== 'discriminator') continue;
        const descriptor = gate.condition;
        const tag = node.childEntries.find(
          (entry) => entry.name === descriptor.propertyName,
        )?.node;
        if (!tag) continue;
        const allowed: readonly unknown[] = isArray(tag.schemaType)
          ? tag.schemaType
          : [tag.schemaType];
        if (
          descriptor.values.some((value) =>
            value === null
              ? !tag.nullable
              : !allowed.includes(
                  isArray(value)
                    ? 'array'
                    : typeof value === 'number' &&
                        Number.isInteger(value) &&
                        allowed.includes('integer')
                      ? 'integer'
                      : typeof value,
                ),
          )
        )
          emit({
            code: FormWarningCode.DiscriminatorBranchUnreachable,
            level: 'warning',
            schemaPath: gate.schemaPath,
            details: { propertyName: descriptor.propertyName },
          });
      }
    }
  }
};
