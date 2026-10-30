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
      : filterArray(host.childEntries, (entry) => {
          if (entry.declarations.length === 0) return false;
          for (const declaration of entry.declarations)
            if (declaration.gates.length) return false;
          for (const declaration of entry.node.declarations)
            if (declaration.gates.length) return false;
          return true;
        });
    let hasGatedOverlays = false;
    for (const entry of host.childEntries) {
      let hasUngated = false;
      for (const declaration of entry.node.declarations)
        if (declaration.gates.length === 0) {
          hasUngated = true;
          break;
        }
      if (!hasUngated) continue;
      for (const declaration of entry.node.declarations)
        if (declaration.gates.length > 0) {
          hasGatedOverlays = true;
          break;
        }
      if (hasGatedOverlays) break;
    }
    let gated = staticEntries.length !== host.childEntries.length;
    if (!gated)
      for (const declaration of host.declarations)
        if (declaration.gates.length > 0) {
          gated = true;
          break;
        }
    const partition = { hasGatedOverlays, gated, staticEntries };
    getHostDerived<'staticPartition', Partition>(host).staticPartition =
      partition;
    return partition;
  }
}
