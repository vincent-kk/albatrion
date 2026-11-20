import { readPointer } from './readPointer';
import { recordDependencies } from './recordDependencies';
import type { ApplicationGraph, PrivateCompiler } from './types';

/**
 * Copy requested raw documents into a private compiler, preserving current public aliases only.
 * @param compiler - Plugin-owned destination; the application instance is never written.
 * @param graph - Current raw references and aliases already checked for conflicting ids.
 * @returns No value; registers detached copies and records current aliases on the private instance.
 */
export const importApplicationGraph = (
  compiler: PrivateCompiler,
  graph: ApplicationGraph,
): void => {
  for (const [key, entry] of graph.observations)
    compiler.entries.set(key, entry);
  for (const resource of graph.resources.values()) {
    const imported = compiler.imported.has(resource.key);
    if (imported && resource.target === resource.document) continue;
    const facts = graph.documents.get(resource.document);
    if (!facts) throw new Error('Application dependency facts are missing');
    recordDependencies(compiler, facts);
    if (imported) continue;
    let copy =
      typeof resource.document === 'boolean'
        ? resource.document
        : compiler.copies.get(resource.document);
    if (copy === undefined) {
      copy = JSON.parse(JSON.stringify(resource.document));
      if (copy === undefined)
        throw new TypeError('Application schema must be JSON');
      if (typeof resource.document === 'object')
        compiler.copies.set(resource.document, copy);
    }
    if (
      (facts.asynchronous ||
        (compiler.kind === 'validation' &&
          compiler.macroProfile !== undefined)) &&
      typeof copy === 'object' &&
      !resource.meta
    )
      Reflect.set(copy, '$async', true);
    if (resource.meta && typeof copy === 'object')
      compiler.instance.addMetaSchema(copy, resource.key, false);
    else compiler.instance.addSchema(copy, resource.key, false, false);
    compiler.imported.add(resource.key);
  }
  for (const [id, claim] of graph.claims) {
    const document =
      typeof claim.document === 'boolean'
        ? claim.document
        : compiler.copies.get(claim.document);
    const schema =
      document === undefined
        ? undefined
        : readPointer(document, claim.pointer, false);
    if (document === undefined || schema === undefined)
      throw new Error('Detached application resource claim is missing');
    compiler.claims.set(id, { document, key: claim.key, schema });
  }
  if (compiler.kind === 'meta') compiler.count = compiler.imported.size;
  for (const [key, observed] of graph.observations) {
    if (typeof observed.ref === 'string')
      compiler.instance.refs[key] = observed.ref;
  }
};
