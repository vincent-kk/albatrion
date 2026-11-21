import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import {
  SCHEMA_LIST_KEYWORDS,
  SCHEMA_MAP_KEYWORDS,
  SCHEMA_SINGLE_KEYWORDS,
} from '../../../../../constants/schemaKeywords';
import type {
  AnalysisContext,
  SchemaResource,
  SchemaResourceIndex,
} from '../../../../types/analysis';
import { isBlueprintSchema } from '../isBlueprintSchema';
import { resolveResourceIdentifier } from './resolveResourceIdentifier';

/**
 * Index authored schema resources through vocabulary-defined schema positions only.
 * @param context - Analysis owning the immutable authored document.
 * @returns Cached resource identities and lexical scopes, without external I/O.
 */
export const getResourceIndex = (
  context: AnalysisContext,
): SchemaResourceIndex => {
  if (context.resourceIndex) return context.resourceIndex;
  const root: SchemaResource = {
    schema: context.schema,
    schemaPath: '#',
    uri: 'https://schema-form.invalid/',
  };
  const resources = new Map<string, SchemaResource>();
  const scopes = new Map<string, SchemaResource>();
  const stack: {
    schema: typeof context.schema;
    schemaPath: string;
    resource: SchemaResource;
    ancestors: Set<object>;
    dialect: string | undefined;
  }[] = [
    {
      schema: context.schema,
      schemaPath: '#',
      resource: root,
      ancestors: new Set<object>(),
      dialect: undefined,
    },
  ];
  while (stack.length) {
    const entry = stack.pop()!;
    const { schema, schemaPath, ancestors } = entry;
    if (typeof schema === 'boolean' || ancestors.has(schema)) continue;
    const dialect =
      typeof schema.$schema === 'string' ? schema.$schema : entry.dialect;
    const identifier = dialect?.includes('draft-04') ? schema.id : schema.$id;
    const isModern =
      dialect?.includes('2019-09') || dialect?.includes('2020-12');
    let resource = entry.resource;
    if (
      typeof identifier === 'string' &&
      identifier !== '' &&
      identifier !== '#' &&
      (isModern || identifier[0] !== '#')
    ) {
      resource = {
        schema,
        schemaPath,
        uri: resolveResourceIdentifier(
          identifier,
          resource.uri,
          schemaPath,
          context,
        ),
      };
    }
    resources.set(resource.uri, resource);
    scopes.set(schemaPath, resource);
    const lineage = new Set(ancestors).add(schema);
    const add = (child: unknown, path: string) => {
      if (isBlueprintSchema(child))
        stack.push({
          schema: child,
          schemaPath: path,
          resource,
          ancestors: lineage,
          dialect,
        });
    };
    for (const keyword of SCHEMA_SINGLE_KEYWORDS) {
      const value = schema[keyword];
      const path = appendSegment(schemaPath, keyword);
      if (Array.isArray(value))
        value.forEach((child, index) => add(child, appendSegment(path, index)));
      else add(value, path);
    }
    for (const keyword of SCHEMA_LIST_KEYWORDS) {
      const value = schema[keyword];
      if (Array.isArray(value))
        value.forEach((child, index) =>
          add(child, appendSegment(appendSegment(schemaPath, keyword), index)),
        );
    }
    for (const keyword of SCHEMA_MAP_KEYWORDS) {
      const value = schema[keyword];
      if (value && typeof value === 'object' && !Array.isArray(value))
        for (const [name, child] of Object.entries(value))
          add(child, appendSegment(appendSegment(schemaPath, keyword), name));
    }
  }
  return (context.resourceIndex = { resources, scopes });
};
