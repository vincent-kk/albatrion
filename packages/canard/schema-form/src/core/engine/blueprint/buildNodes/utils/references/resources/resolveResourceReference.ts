import { hasOwnProperty } from '@winglet/common-utils/lib';
import { joinPointerWithPrefixOf, parseStandardPointer } from '@/schema-form/helpers/jsonPointer';
import type { AnalysisContext } from '../../../../types/analysis';
import { isBlueprintSchema } from '../isBlueprintSchema';
import { getResourceIndex } from './getResourceIndex';

/**
 * Resolve a URI against its authored resource and return the canonical document location.
 * @param context - Analysis with embedded resources or a resource URI reference.
 * @param reference - URI reference authored at schemaPath.
 * @param schemaPath - Referring schema's canonical document location.
 * @returns Local schema and document pointer; throws for unknown resources or invalid pointers.
 */
export const resolveResourceReference = (context: AnalysisContext, reference: string, schemaPath: string) => {
  const index = getResourceIndex(context);
  const scope = index.scopes.get(schemaPath) ?? index.scopes.get('#');
  if (!scope) throw new Error('The referring schema has no resource base.');
  const uri = new URL(reference, scope.uri);
  const fragment = uri.hash || '#';
  uri.hash = '';
  const resource = index.resources.get(uri.href.replace(/#$/, ''));
  if (!resource) throw new Error('The resource is outside the authored document.');
  const names = parseStandardPointer(fragment);
  let schema: unknown = resource.schema;
  for (const name of names) {
    schema = schema !== null && typeof schema === 'object' && hasOwnProperty(schema, name) ? Reflect.get(schema, name) : undefined;
  }
  if (!isBlueprintSchema(schema)) throw new Error('The reference must identify a schema.');
  const pointer = joinPointerWithPrefixOf(fragment, names);
  return { schema, schemaPath: resource.schemaPath + pointer.slice(1) };
};
