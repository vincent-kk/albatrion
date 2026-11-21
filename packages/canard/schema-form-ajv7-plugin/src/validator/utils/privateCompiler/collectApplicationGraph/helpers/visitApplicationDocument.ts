import { equals } from '@winglet/common-utils/object';
import type Ajv from 'ajv';

import { collectSchemaDependencies } from '../../collectSchemaDependencies';
import { missingReference } from '../../missingReference';
import { readApplicationResource } from '../../readApplicationResource';
import type { ApplicationGraph, SchemaDependencies } from '../../types';

/**
 * Resolve one raw document depth first without borrowing native compiled environments.
 * @param source - Read-only application whose current registries determine every external reference.
 * @param graph - Accumulated requested documents, observations and resource claims.
 * @param visiting - Raw documents already visited, terminating recursive references.
 * @param schema - Detached form root or raw application document currently visited.
 * @param base - Registration key establishing the native URI resolution base.
 * @param importedDocument - Whether embedded aliases resolve through the current application registry.
 * @param knownFacts - Facts already collected for this exact document and base.
 * @param selection - Incoming fragment address, allowing distinct targets in one raw document.
 * @returns No value; adds only reachable raw resources or throws a native reference/conflict error.
 */
export const visitApplicationDocument = (
  source: Ajv,
  graph: ApplicationGraph,
  visiting: Map<object | boolean, Set<string>>,
  schema: object | boolean,
  base: string,
  importedDocument = false,
  knownFacts?: SchemaDependencies,
  selection = '',
): void => {
  let selections = visiting.get(schema);
  if (selections?.has(selection)) return;
  if (selections) selections.add(selection);
  else visiting.set(schema, new Set([selection]));
  const facts = knownFacts ?? collectSchemaDependencies(source, schema, base);
  const previousFacts = graph.documents.get(schema);
  if (previousFacts) {
    for (const [name, definition] of facts.rules)
      previousFacts.rules.set(name, definition);
    for (const [name, definition] of facts.formats)
      previousFacts.formats.set(name, definition);
    previousFacts.asynchronous ||= facts.asynchronous;
    previousFacts.hasMacro ||= facts.hasMacro;
  } else graph.documents.set(schema, facts);
  graph.asynchronous ||= facts.asynchronous;
  graph.hasMacro ||= facts.hasMacro;
  for (const [name, definition] of facts.formats)
    graph.formats.set(name, definition);
  const local = new Set(facts.resources.map((resource) => resource.address));
  for (const reference of facts.references) {
    const documentAddress = reference.address.split('#')[0];
    if (
      reference.ref[0] === '#' ||
      (!importedDocument &&
        (local.has(reference.address) || local.has(documentAddress))) ||
      (importedDocument &&
        facts.resources.some(
          (resource) => resource.root && resource.address === documentAddress,
        ))
    )
      continue;
    const resource = readApplicationResource(source, reference.address);
    if (!resource)
      return missingReference(source, reference.base, reference.ref);
    for (const [name, entry] of resource.observations)
      graph.observations.set(name, entry);
    const imported = collectSchemaDependencies(
      source,
      resource.document,
      resource.key,
      reference.address.includes('#') ? reference.address : undefined,
    );
    for (const claim of imported.resources) {
      const previous = graph.claims.get(claim.address);
      if (previous && !equals(previous.schema, claim.schema))
        throw new Error(
          `Conflicting application schema id "${claim.address}" through keys "${previous.key}" and "${reference.address}"`,
        );
      graph.claims.set(claim.address, {
        document: resource.document,
        key: reference.address,
        schema: claim.schema,
        pointer: claim.pointer,
      });
    }
    graph.resources.set(reference.address, resource);
    visitApplicationDocument(
      source,
      graph,
      visiting,
      resource.document,
      resource.key,
      true,
      imported,
      reference.address.includes('#') ? reference.address : '',
    );
  }
};
