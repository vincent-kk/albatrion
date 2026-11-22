import type { Optional } from '@aileron/declare';

import type { FieldNodeRuntime } from '../../../../record';

/** A held validator issue; only its address is rewritten here. */
type Issue = { readonly dataPath: string };

/**
 * Move held validator issues with their array items until the next validation.
 * @param runtime - Tree-owned validation stores; `globalErrors` must be root external issues followed by the routed list
 * @param mapPath - Current address for a previous one, or undefined when its item perished
 * @returns Held-list owners whose list was replaced (empty when only the form list changed); undefined when no issue moved
 */
export const rekeyValidationIssuePaths = <Self>(
  runtime: FieldNodeRuntime<Self>,
  mapPath: (path: string) => Optional<string>,
): Optional<Set<unknown>> => {
  const routed = runtime.routedValidationErrors;
  if (!routed?.length) return undefined;
  let moved: Optional<Map<unknown, Issue | null>>;
  for (const issue of routed) {
    const path = mapPath(issue.dataPath);
    if (path === issue.dataPath) continue;
    (moved ??= new Map()).set(
      issue,
      path === undefined ? null : { ...issue, dataPath: path },
    );
  }
  if (!moved) return undefined;
  const replacements = moved;
  const next = rewriteIssues(routed, replacements) ?? routed;
  const global = runtime.globalErrors ?? routed;
  runtime.globalErrors =
    global === routed
      ? next
      : [...global.slice(0, global.length - routed.length), ...next];
  runtime.routedValidationErrors = next;
  const changed = new Set<unknown>();
  const held = runtime.validationErrors;
  if (!held) return changed;
  for (const [node, issues] of held) {
    const rewritten = rewriteIssues(issues, replacements);
    if (!rewritten) continue;
    held.set(node, rewritten);
    runtime.combinedErrors?.delete(node);
    changed.add(node);
  }
  return changed;
};

/**
 * Replace moved issues and drop perished ones, keeping order.
 * @param issues - Held list in its current order
 * @param moved - Replacement per moved issue, or null for a perished one
 * @returns A new list only when an issue moved; unmoved issues keep their identity
 */
const rewriteIssues = <Item>(
  issues: readonly Item[],
  moved: ReadonlyMap<unknown, Item | null>,
): Optional<Item[]> => {
  let next: Item[] | undefined;
  for (let index = 0; index < issues.length; index++) {
    const issue = issues[index];
    const replacement = moved.get(issue);
    if (replacement !== undefined) next ??= issues.slice(0, index).filter(Boolean);
    const current = replacement === undefined ? issue : replacement;
    if (current) next?.push(current);
  }
  return next;
};
