import { equals } from '@winglet/common-utils/object';
import type { Ajv } from 'ajv';

import { assertBindableInstance } from '../assertBindableInstance';
import { checkRootCollisions } from './checkRootCollisions';
import { collectApplicationGraph } from './collectApplicationGraph';
import { collectSchemaDependencies } from './collectSchemaDependencies';
import { createNativeCompiler } from './createNativeCompiler';
import { hasNativeDefinitions } from './hasNativeDefinitions';
import { importApplicationGraph } from './importApplicationGraph';
import { isFormNamespaceCompatible } from './isFormNamespaceCompatible';
import { isPrivateCompilerCurrent } from './isPrivateCompilerCurrent';
import { observeIdentity } from './observeIdentity';
import { recordDependencies } from './recordDependencies';
import { recordMacroProfile } from './recordMacroProfile';
import type { PrivateCompiler } from './types';

/**
 * Reuse only a current, compatible, bounded environment; application state is read-only.
 * @param source - Read-only application profile for this new compilation.
 * @param previous - Bounded environment considered for reuse; stale or conflicting environments are retired.
 * @param root - Detached form or guard schema whose current facts determine imports and async mode.
 * @param kind - Independent validation, guard or meta namespace.
 * @param allErrors - Native error collection policy required by the selected namespace.
 * @param key - Base address for relative schema resources and references.
 * @param owner - Detached registration key reserving form resource addresses in this compiler.
 * @param serialized - Current root serialization, eligible for schema-free facts reuse only at the empty base.
 * @returns A current compatible environment with requested imports; failed imports retire it.
 */
export const preparePrivateCompiler = (
  source: Ajv,
  previous: PrivateCompiler | undefined,
  root: object | boolean,
  kind: PrivateCompiler['kind'],
  allErrors: boolean,
  key = '',
  owner = key,
  serialized?: string,
): PrivateCompiler => {
  assertBindableInstance(source);
  const current = previous && isPrivateCompilerCurrent(previous);
  const cached =
    current &&
    !key &&
    serialized !== undefined &&
    previous.factsCache?.serialized === serialized
      ? previous.factsCache.facts
      : undefined;
  const facts = cached ?? collectSchemaDependencies(source, root, key);
  const observations =
    kind !== 'meta' && facts.resources.length
      ? checkRootCollisions(source, facts.resources)
      : undefined;
  const graph = facts.references.length
    ? collectApplicationGraph(source, root, key, facts)
    : undefined;
  const hasMacro = graph?.hasMacro ?? facts.hasMacro;
  const compatible =
    !hasMacro &&
    !previous?.macroProfile &&
    previous &&
    previous.kind === kind &&
    previous.allErrors === allErrors &&
    previous.count < 64 &&
    hasNativeDefinitions(previous, facts, graph) &&
    [...(graph?.formats ?? facts.formats)].every(
      ([name, definition]) =>
        observeIdentity(
          previous.identities,
          previous.instance._formats[name],
        ) === definition,
    ) &&
    current &&
    isFormNamespaceCompatible(previous, facts, graph, owner) &&
    (!graph ||
      [...graph.claims].every(
        ([id, claim]) =>
          !previous.claims.has(id) ||
          equals(previous.claims.get(id)?.schema, claim.schema),
      ));
  const compiler = compatible
    ? previous
    : createNativeCompiler(source, kind, allErrors, false);
  compiler.asynchronous =
    (graph?.asynchronous ?? facts.asynchronous) ||
    (kind === 'validation' && hasMacro);
  if (hasMacro) recordMacroProfile(compiler);
  if (observations)
    for (const [name, entry] of observations) compiler.entries.set(name, entry);
  if (kind !== 'meta') compiler.count++;
  if (facts.resources.length) {
    compiler.formOwners ??= new Map();
    for (const resource of facts.resources)
      compiler.formOwners.set(resource.address, owner);
  }
  compiler.factsCache =
    !key && serialized !== undefined && !facts.resources.length
      ? { serialized, facts }
      : undefined;
  if (!cached || compiler !== previous) recordDependencies(compiler, facts);
  try {
    if (graph) importApplicationGraph(compiler, graph);
  } catch (error) {
    compiler.retired = true;
    throw error;
  }
  return compiler;
};
