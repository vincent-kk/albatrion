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
  const stack = [
    {
      schema: context.schema,
      schemaPath: '#',
      resource: root,
      ancestors: new Set<object>(),
    },
  ];
  while (stack.length) {
    const entry = stack.pop()!;
    const { schema, schemaPath, ancestors } = entry;
    if (typeof schema === 'boolean' || ancestors.has(schema)) continue;
    let resource = entry.resource;
    if (typeof schema.$id === 'string') {
      const identifier = new URL(schema.$id, resource.uri);
      if (identifier.hash)
        throw new Error(
          'A schema resource identifier cannot contain a non-empty fragment.',
        );
      resource = { schema, schemaPath, uri: identifier.href.replace(/#$/, '') };
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
