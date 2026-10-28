import type { FieldNodeRecord } from '../../../record';
import type { TreeMemoStores } from '../../../types/treeMemoStores';
import { getSlotOrder } from '../slots/getSlotOrder';

/** Mutable write destination, independent of a reference's frozen reads. */
interface Address {
  path: string;
  order: readonly number[];
  /** Set once the occurrence's slot was discarded; a write addressed at it has no destination. */
  discarded?: true;
}

/** Tree-owned weak identity links; retained address state survives every reset. */
export class DetachedWriteAddress {
  /**
   * Bind a captured occurrence to the cell retained by its latent metadata.
   * @param node - Captured occurrence whose public reads remain unchanged
   * @param metadata - Classification at the occurrence's current address
   * @param runtime - Root owner shared by the node and its latent metadata
   * @returns Nothing; subsequent rekeys update this reference's write destination
   */
  static retain(
    node: object,
    metadata: Readonly<Address>,
    runtime: Pick<TreeMemoStores, 'detachedWriteAddresses'>,
  ): void {
    const cells = (runtime.detachedWriteAddresses ??= new WeakMap());
    const address = cells.get(metadata) ??
      cells.get(node) ?? {
        path: metadata.path,
        order: metadata.order,
      };
    cells.set(node, address);
    cells.set(metadata, address);
  }

  /**
   * Carry a cell across metadata replacement, including a structural rekey.
   * @param previous - Classification object being replaced
   * @param current - Replacement's current path and document order
   * @param runtime - Root owner shared by the node and its latent metadata
   * @returns Nothing; references keep the cell even when latent values are erased
   */
  static transfer(
    previous: object,
    current: Readonly<Address>,
    runtime: Pick<TreeMemoStores, 'detachedWriteAddresses'>,
  ): void {
    const cells = runtime.detachedWriteAddresses;
    if (!cells) return;
    const address = cells.get(previous);
    if (!address) return;
    address.path = current.path;
    address.order = current.order;
    cells.set(current, address);
  }

  /**
   * Mark an occurrence, and every descendant resolved through it, as having no write destination.
   * @param node - Captured occurrence whose slot did not survive its host's compaction
   * @param runtime - Root owner shared by the node and its latent metadata
   * @returns Nothing; later writes through any reference to it are dropped
   */
  static discard(
    node: object,
    runtime: Pick<TreeMemoStores, 'detachedWriteAddresses'>,
  ): void {
    const cells = (runtime.detachedWriteAddresses ??= new WeakMap());
    const address = cells.get(node) ?? { path: '', order: [] };
    address.discarded = true;
    cells.set(node, address);
  }

  /**
   * Resolve a detached write, including descendants folded into an array source.
   * @param node - Detached occurrence with its original parent chain and path
   * @returns Its cell, an address relative to a captured ancestor, or undefined;
   * marked discarded when the occurrence or any ancestor did not survive a compaction
   */
  static read<Self extends FieldNodeRecord<Self>>(
    node: Self,
  ): Readonly<Address> | undefined {
    const cells = node.runtime.detachedWriteAddresses;
    if (!cells) return undefined;
    const own = cells.get(node);
    if (own) {
      if (own.discarded) return own;
      for (let parent = node.parent; parent; parent = parent.parent)
        if (cells.get(parent)?.discarded) return { ...own, discarded: true };
      return own;
    }
    for (let parent = node.parent; parent; parent = parent.parent) {
      const ancestor = cells.get(parent);
      if (!ancestor) continue;
      const order = getSlotOrder(node.parent, node.name, node.blueprintNode);
      return {
        path: ancestor.path + node.path.slice(parent.path.length),
        order: [...ancestor.order, ...order.slice(ancestor.order.length)],
        ...(ancestor.discarded ? { discarded: true as const } : undefined),
      };
    }
    return undefined;
  }
}
