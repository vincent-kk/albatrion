import { filter as filterArray } from '@winglet/common-utils/array';

import { getHostDerived } from '../../../utils/cache/derivedRecords';
import type { BlueprintChildEntry, BlueprintNode } from '../../types/node';

/** Authored static membership; contains no occurrence or gate verdict. */
interface Partition {
  /** Whether any authored contribution requires gate-dependent selection. */
  readonly gated: boolean;
  /** A gated overlay shares an entry with an unconditional declaration. */
  readonly hasGatedOverlays: boolean;
  /** Unique nonvirtual edges with ungated declarations and overlays. */
  readonly staticEntries: readonly BlueprintChildEntry[];
}

/** Lazy blueprint-owned partition consumed by settlement's fixed baseline. */
export class HostStaticPartition {
  /** Immutable host identities own the lifetime of their derived membership. */

  /**
   * Separate unconditionally declared entries without reading any live shape.
   * @param host - Completed immutable host template
   * @returns Stable membership, empty for virtual or duplicate-name candidates
   */
  static get(host: BlueprintNode): Partition {
    const cached = getHostDerived<'staticPartition', Partition>(
      host,
    ).staticPartition;
    if (cached) return cached;
    const names = new Map<string, number>();
    let ambiguous = false;
    for (const entry of host.childEntries) {
      if (names.has(entry.name) || entry.node.kind === 'virtual')
        ambiguous = true;
      names.set(entry.name, 1);
    }
    const staticEntries = ambiguous
      ? []
      : filterArray(
          host.childEntries,
          (entry) =>
            entry.declarations.length > 0 &&
            (() => {
              const items = entry.declarations;
              for (
                let index = 0, count = items.length;
                index < count;
                index++
              ) {
                if (!(index in items)) continue;
                const declaration = items[index];
                if (declaration.gates.length) return false;
              }
              return true;
            })() &&
            (() => {
              const items = entry.node.declarations;
              for (
                let index = 0, count = items.length;
                index < count;
                index++
              ) {
                if (!(index in items)) continue;
                const declaration = items[index];
                if (declaration.gates.length) return false;
              }
              return true;
            })(),
        );
    const partition = {
      hasGatedOverlays: (() => {
        const values = host.childEntries;
        iterate: for (
          let position = 0, limit = values.length;
          position < limit;
          position++
        ) {
          if (!(position in values)) continue;
          const item = values[position];
          const entry = item;
          {
            const declarations = entry.node.declarations;
            {
              if (
                (() => {
                  const items = declarations;
                  for (
                    let index = 0, count = items.length;
                    index < count;
                    index++
                  ) {
                    if (!(index in items)) continue;
                    const declaration = items[index];
                    if (declaration.gates.length === 0) return true;
                  }
                  return false;
                })() &&
                (() => {
                  const items = declarations;
                  for (
                    let index = 0, count = items.length;
                    index < count;
                    index++
                  ) {
                    if (!(index in items)) continue;
                    const declaration = items[index];
                    if (declaration.gates.length > 0) return true;
                  }
                  return false;
                })()
              )
                return true;
              continue iterate;
            }
          }
        }
        return false;
      })(),
      gated:
        staticEntries.length !== host.childEntries.length ||
        (() => {
          const items = host.declarations;
          for (let index = 0, count = items.length; index < count; index++) {
            if (!(index in items)) continue;
            const declaration = items[index];
            if (declaration.gates.length > 0) return true;
          }
          return false;
        })(),
      staticEntries,
    };
    getHostDerived<'staticPartition', Partition>(host).staticPartition =
      partition;
    return partition;
  }
}
