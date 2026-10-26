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
  private static readonly partitions = new WeakMap<BlueprintNode, Partition>();

  /**
   * Separate unconditionally declared entries without reading any live shape.
   * @param host - Completed immutable host template
   * @returns Stable membership, empty for virtual or duplicate-name candidates
   */
  static get(host: BlueprintNode): Partition {
    const cached = this.partitions.get(host);
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
      : host.childEntries.filter(
          (entry) =>
            entry.declarations.length > 0 &&
            entry.declarations.every(
              (declaration) => !declaration.gates.length,
            ) &&
            entry.node.declarations.every(
              (declaration) => !declaration.gates.length,
            ),
        );
    const partition = {
      hasGatedOverlays: host.childEntries.some((entry) => {
        const declarations = entry.node.declarations;
        return (
          declarations.some((declaration) => declaration.gates.length === 0) &&
          declarations.some((declaration) => declaration.gates.length > 0)
        );
      }),
      gated:
        staticEntries.length !== host.childEntries.length ||
        host.declarations.some((declaration) => declaration.gates.length > 0),
      staticEntries,
    };
    this.partitions.set(host, partition);
    return partition;
  }
}
