import type { Ajv } from 'ajv';

import { visitApplicationDocument } from './collectApplicationGraph/helpers/visitApplicationDocument';
import type { ApplicationGraph, SchemaDependencies } from './types';

/**
 * Resolve only references used by this root, refusing incompatible raw documents with one native id.
 * @param source - Read-only application registries and extension definitions.
 * @param root - Detached root whose external references must resolve now.
 * @param key - Registration base for relative schema addresses.
 * @param rootFacts - Already collected root facts, avoiding a second schema walk.
 * @returns The requested raw graph; throws on unresolved references or incompatible id claims.
 */
export const collectApplicationGraph = (
  source: Ajv,
  root: object | boolean,
  key = '',
  rootFacts?: SchemaDependencies,
): ApplicationGraph => {
  const graph: ApplicationGraph = {
    resources: new Map(),
    documents: new Map(),
    formats: new Map(),
    claims: new Map(),
    observations: new Map(),
    asynchronous: false,
    hasMacro: false,
  };
  visitApplicationDocument(
    source,
    graph,
    new Map(),
    root,
    key,
    false,
    rootFacts,
  );
  return graph;
};
