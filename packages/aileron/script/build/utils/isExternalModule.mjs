/**
 * Determines whether a module should be left as an external import.
 *
 * Bundled: `@aileron/*` (tsconfig paths alias, .d.ts only), `@/*` (tsconfig
 * paths alias to the package's own src), relative paths, absolute paths.
 * External: everything else — workspace packages (`@winglet/*`), peer
 * dependencies (`react`, `antd`, ...), regular dependencies, and `node:*`.
 *
 * Rolldown calls this twice per specifier: once with the raw specifier as
 * written in the source, and again with the resolved absolute path
 * (`isResolved: true`). Bare specifiers are decided on the first call, so a
 * dependency never has to be resolved to be recognized as external.
 *
 * One predicate serves both build shapes. Peer dependencies need no separate
 * handling: they are bare specifiers, so the bare-specifier rule above already
 * externalizes them.
 */

/** @type {(id: string) => boolean} */
export const isExternalModule = (id) =>
  !id.startsWith('@aileron') &&
  !id.startsWith('@/') &&
  !id.startsWith('.') &&
  !id.startsWith('/');
