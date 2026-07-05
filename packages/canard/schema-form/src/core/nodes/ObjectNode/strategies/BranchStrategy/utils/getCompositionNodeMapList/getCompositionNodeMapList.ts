import { isArray, isPlainObject } from '@winglet/common-utils/filter';
import { isIdenticalSchemaType } from '@winglet/json-schema/filter';

import type { Fn, Nullish } from '@aileron/declare';

import type { ObjectNode } from '@/schema-form/core/nodes/ObjectNode';
import type {
  HandleChange,
  SchemaNodeFactory,
} from '@/schema-form/core/nodes/type';
import { JsonSchemaError } from '@/schema-form/errors';
import {
  formatCompositionPropertyExclusivenessError,
  formatCompositionPropertyRedefinitionError,
  formatCompositionTypeRedefinitionError,
  formatNestedCompositionIgnoredWarning,
} from '@/schema-form/helpers/error';
import {
  NESTED_COMPOSITION_IGNORED_FOR_FORM,
  SCHEMA_FORM_WARNING,
  warnDevelopmentIssue,
} from '@/schema-form/helpers/warning';
import type {
  JsonSchema,
  ObjectSchema,
  ObjectValue,
} from '@/schema-form/types';

import type { ChildNodeMap } from '../../type';

/**
 * Generate child node maps for composition schemas (oneOf/anyOf)
 *
 * @param parentNode - Parent ObjectNode that contains the composition
 * @param scope - Type of composition schema ('oneOf' or 'anyOf')
 * @param jsonSchema - Object schema containing composition definitions
 * @param defaultValue - Default values for child properties
 * @param childNodeMap - Map of existing child nodes to check for conflicts
 * @param keySetList - List of allowed key sets for each composition branch (for validation)
 * @param excludeKeySet - Set of keys to exclude from composition processing
 * @param handleChangeFactory - Factory function to create change handlers for child nodes
 * @param nodeFactory - Factory function to create schema nodes
 * @returns Array of child node maps for each composition branch, or undefined if no composition schema exists
 */
export const getCompositionNodeMapList = (
  parentNode: ObjectNode,
  scope: 'oneOf' | 'anyOf',
  jsonSchema: ObjectSchema,
  defaultValue: ObjectValue | Nullish,
  childNodeMap: ChildNodeMap,
  keySetList: Set<string>[] | undefined,
  excludeKeySet: Set<string> | undefined,
  handleChangeFactory: Fn<[name: string], HandleChange>,
  nodeFactory: SchemaNodeFactory,
) => {
  const compositionSchemas = jsonSchema[scope];
  if (!compositionSchemas || !isArray(compositionSchemas)) return undefined;

  const propertyKeySet = scope === 'anyOf' ? new Set<string>() : null;
  const compositionLength = compositionSchemas.length;
  const childNodeMapList = new Array<ChildNodeMap>(compositionLength);
  for (let index = 0; index < compositionLength; index++) {
    const subSchema = compositionSchemas[index] as Partial<ObjectSchema>;

    const nestedScope =
      subSchema.oneOf !== undefined
        ? 'oneOf'
        : subSchema.anyOf !== undefined
          ? 'anyOf'
          : undefined;
    if (nestedScope !== undefined)
      warnDevelopmentIssue({
        code: `${SCHEMA_FORM_WARNING}.${NESTED_COMPOSITION_IGNORED_FOR_FORM}`,
        message: formatNestedCompositionIgnoredWarning(
          scope,
          nestedScope,
          parentNode.path,
        ),
        details: { path: parentNode.path, scope, nestedScope },
      });

    if (
      subSchema.type !== undefined &&
      isIdenticalSchemaType(jsonSchema, subSchema) === false
    )
      throw new JsonSchemaError(
        'COMPOSITION_TYPE_REDEFINITION',
        formatCompositionTypeRedefinitionError(
          scope,
          jsonSchema,
          parentNode.path,
          jsonSchema.type,
          subSchema.type,
        ),
        {
          jsonSchema,
          type: jsonSchema.type,
          path: parentNode.path,
          compositionType: scope,
          subSchemaType: subSchema.type,
        },
      );

    const properties = subSchema.properties;
    if (!isPlainObject(properties)) continue;

    const keys = Object.keys(properties);
    const compositionChildNodeMap = new Map() as ChildNodeMap;
    const required = subSchema.required;
    for (let i = 0, k = keys[0], l = keys.length; i < l; i++, k = keys[i]) {
      if (keySetList && !keySetList[index].has(k)) continue;
      if (excludeKeySet?.has(k) || propertyKeySet?.has(k))
        throw new JsonSchemaError(
          'COMPOSITION_PROPERTY_EXCLUSIVENESS_REDEFINITION',
          formatCompositionPropertyExclusivenessError(
            scope,
            parentNode.path,
            k,
          ),
          {
            jsonSchema,
            compositionType: scope,
            path: parentNode.path,
            property: k,
          },
        );
      if (childNodeMap.has(k))
        throw new JsonSchemaError(
          'COMPOSITION_PROPERTY_REDEFINITION',
          formatCompositionPropertyRedefinitionError(scope, parentNode.path, k),
          {
            jsonSchema,
            compositionType: scope,
            path: parentNode.path,
            property: k,
          },
        );

      const childSchema = properties[k] as JsonSchema;
      const inputDefault = defaultValue?.[k];
      compositionChildNodeMap.set(k, {
        node: nodeFactory({
          name: k,
          scope: scope,
          variant: index,
          jsonSchema: childSchema,
          defaultValue:
            inputDefault !== undefined ? inputDefault : childSchema.default,
          onChange: handleChangeFactory(k),
          nodeFactory,
          parentNode,
          required: required?.includes(k),
        }),
      });
      propertyKeySet?.add(k);
    }
    childNodeMapList[index] = compositionChildNodeMap;
  }

  return childNodeMapList;
};
