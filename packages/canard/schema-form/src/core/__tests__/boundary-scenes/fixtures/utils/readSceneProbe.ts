import type { FieldNode } from '../../../../surface';
import { ABSENT } from '../types';
import { findSceneNode } from './findSceneNode';
import type { SceneRun } from './startSceneRun';

/**
 * Read one probe of a run (the tokens are listed on `BoundarySceneBase`).
 * @param run - The run to read
 * @param token - `<kind>` or `<kind> <argument>`
 * @returns The reading; throws on an unknown kind so a mistyped token cannot pass silently
 */
export const readSceneProbe = (run: SceneRun, token: string): unknown => {
  const space = token.indexOf(' ');
  const kind = space < 0 ? token : token.slice(0, space);
  const argument = space < 0 ? '' : token.slice(space + 1);
  if (kind === 'refresh') return run.refreshedPaths.has(argument);
  if (kind === 'detached')
    return run.heldNodes[argument]
      ? Reflect.get(run.heldNodes[argument], 'isDetached')
      : ABSENT;
  if (kind === 'find') return findSceneNode(run.root, argument) !== null;
  if (kind === 'names')
    return JSON.stringify(
      Reflect.get(Object(run.lastError), 'details') ?? null,
    ).includes(JSON.stringify(argument));
  if (kind === 'inactive')
    return run.root.inactiveValues
      .filter((entry) => entry.path === argument)
      .map((entry) => entry.value);
  if (kind in RUN_READERS) return RUN_READERS[kind](run);
  const node = findSceneNode(run.root, argument);
  if (kind.startsWith('schema.'))
    return node ? readKeyword(node, kind.slice(7)) : ABSENT;
  if (!(kind in NODE_READERS)) throw new Error(`unknown probe ${token}`);
  return node ? NODE_READERS[kind](node) : ABSENT;
};

/** Probe kinds that read one node, keyed by kind. */
const NODE_READERS: Record<string, (node: FieldNode) => unknown> = {
  value: (node) => node.value,
  source: (node) => node.source,
  types: (node) => [readKeyword(node, 'type')].flat(),
  errors: (node) => node.errors.map((issue) => issue.schemaPath).sort(),
};

/** A keyword of the node's effective schema; a boolean schema has none. */
const readKeyword = (node: FieldNode, keyword: string): unknown =>
  Reflect.get(Object(node.jsonSchema), keyword);

/** Probe kinds that read the run rather than a node, keyed by kind. */
const RUN_READERS: Record<string, (run: SceneRun) => unknown> = {
  log: (run) => [...run.log],
  updater: (run) => [...run.updaterInputs],
  thrown: (run) => [...run.thrownErrors],
  reports: (run) =>
    run.reports.map(({ level, code, origin }) => `${level} ${code} ${origin}`),
  status: (run) => run.root.diagnostics.status,
  budget: (run) => run.root.diagnostics.exceededBudget,
};
