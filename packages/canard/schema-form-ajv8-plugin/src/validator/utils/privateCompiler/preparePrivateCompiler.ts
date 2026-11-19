import { equals } from '@winglet/common-utils/object';
import type { Ajv } from 'ajv';

import { assertBindableInstance } from '../assertBindableInstance';
import { checkRootCollisions } from './checkRootCollisions';
import { collectApplicationGraph } from './collectApplicationGraph';
import { collectSchemaDependencies } from './collectSchemaDependencies';
import { createNativeCompiler } from './createNativeCompiler';
import { importApplicationGraph } from './importApplicationGraph';
import { isPrivateCompilerCurrent } from './isPrivateCompilerCurrent';
import { recordDependencies } from './recordDependencies';
import { syncNativeProfile } from './syncNativeProfile';
import type { PrivateCompiler } from './types';

/**
 * Reuse only a current, compatible, bounded environment; application state is read-only.
 * @param source - Read-only application profile for this new compilation.
 * @param previous - Bounded environment considered for reuse; stale or conflicting environments are retired.
 * @param root - Detached form or guard schema whose current facts determine imports and async mode.
 * @param kind - Independent validation, guard or meta namespace.
 * @param allErrors - Native error collection policy required by the selected namespace.
 * @param key - Base address for relative schema resources and references.
 * @returns A current compatible environment with requested imports; failed imports retire it.
 */
export const preparePrivateCompiler = (
  source: Ajv,
  previous: PrivateCompiler | undefined,
  root: object | boolean,
  kind: PrivateCompiler['kind'],
  allErrors: boolean,
  key = '',
): PrivateCompiler => {
  assertBindableInstance(source);
  const facts = collectSchemaDependencies(source, root, key);
  const observations =
    kind !== 'meta' && facts.resources.length
      ? checkRootCollisions(source, facts.resources)
      : undefined;
  const graph = facts.references.length
    ? collectApplicationGraph(source, root, key, facts)
    : undefined;
  const compatible =
    previous &&
    previous.kind === kind &&
    previous.allErrors === allErrors &&
    previous.count < 64 &&
    isPrivateCompilerCurrent(previous) &&
    (!graph ||
      [...graph.claims].every(
        ([id, claim]) =>
          !previous.claims.has(id) ||
          equals(previous.claims.get(id)?.schema, claim.schema),
      ));
  const compiler = compatible
    ? previous
    : createNativeCompiler(source, kind, allErrors, false);
  syncNativeProfile(compiler);
  compiler.asynchronous = graph?.asynchronous ?? facts.asynchronous;
  if (observations)
    for (const [name, entry] of observations) compiler.entries.set(name, entry);
  if (kind !== 'meta') compiler.count++;
  recordDependencies(compiler, facts);
  try {
    if (graph) importApplicationGraph(compiler, graph);
  } catch (error) {
    compiler.retired = true;
    throw error;
  }
  return compiler;
};
