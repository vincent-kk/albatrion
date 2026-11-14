import type { Dictionary, Nullable, Optional } from '@aileron/declare';

import { getHostDerived } from '../cache/derivedRecords';

/**
 * Read a static child's blueprint-constant IDs from its current parent's witnesses.
 * @param node - Occurrence whose parent, path, blueprint and identity must match preparation
 * @returns The existing ID array, or undefined when committed lookup must handle the occurrence.
 * Reads structural fields only; settlement owns preparation and invalidation.
 */
export const getStaticDeclarationIds = <
  Self extends {
    readonly name: string;
    readonly path: string;
    readonly blueprintNode: object;
    readonly parent: Nullable<Self>;
    readonly runtime: { readonly blueprint?: object };
  },
>(
  node: Self,
): Optional<readonly number[]> => {
  const parent = node.parent;
  if (!parent) return undefined;
  const prepared = getHostDerived<
    'preparedStaticHost',
    {
      readonly blueprint: object;
      readonly template: object;
      readonly path: string;
      readonly baseline: Readonly<Dictionary<Self>>;
      readonly entries: ReadonlyMap<
        string,
        { readonly ids: readonly number[] }
      >;
    }
  >(parent).preparedStaticHost;
  if (
    !prepared ||
    prepared.blueprint !== parent.runtime.blueprint ||
    prepared.template !== parent.blueprintNode ||
    prepared.path !== parent.path ||
    prepared.baseline[node.name] !== node
  )
    return undefined;
  return prepared.entries.get(node.name)?.ids;
};
