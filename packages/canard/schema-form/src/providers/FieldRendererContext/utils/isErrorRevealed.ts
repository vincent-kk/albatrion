import {
  type FieldNode,
  readFieldNodeRevealBaseline,
  readFieldNodeRevealPolicy,
} from '@/schema-form/core';

import { resolveErrorVisibility } from './resolveErrorVisibility';

/** Shared empty history without per-render allocation. */
const EMPTY_ENTRIES: readonly [] = [];

/** Check a live display against its node and policy history since the last release.
 * @param node - Caller established checkShowError(node.state) and, when includeEnabled, node.enabled.
 * @param policy - Policy rendered by the current context.
 * @param includeEnabled - Renderer and input include enabled; child-error aggregates do not.
 * @returns Whether the error stayed eligible throughout all unreleased intervals. */
export const isErrorRevealed = (
  node: FieldNode,
  policy: unknown,
  includeEnabled: boolean,
): boolean =>
  resolveErrorVisibility(
    true,
    node.state,
    node.isPresent,
    policy,
    readFieldNodeRevealBaseline(node)?.entries ?? EMPTY_ENTRIES,
    readFieldNodeRevealPolicy(node),
    includeEnabled,
  );
