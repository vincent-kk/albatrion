import type { FieldNodeRecord } from '../../../record';
import { getLatentOrder } from './getLatentOrder';

/** Mutable write destination, independent of a reference's frozen reads. */
interface Address {
  path: string;
  order: readonly number[];
}

/** Weak identity links owned by settlement; neither key keeps a node or runtime alive. */
export class DetachedWriteAddress {
  /** Nodes and successive metadata objects share one occurrence's address cell. */
  private static readonly cells = new WeakMap<object, Address>();

  /**
   * Bind a captured occurrence to the cell retained by its latent metadata.
   * @param node - Captured occurrence whose public reads remain unchanged
   * @param metadata - Classification at the occurrence's current address
   * @returns Nothing; subsequent rekeys update this reference's write destination
   */
  static retain(node: object, metadata: Readonly<Address>): void {
    const address = this.cells.get(metadata) ??
      this.cells.get(node) ?? {
        path: metadata.path,
        order: metadata.order,
      };
    this.cells.set(node, address);
    this.cells.set(metadata, address);
  }

  /**
   * Carry a cell across metadata replacement, including a structural rekey.
   * @param previous - Classification object being replaced
   * @param current - Replacement's current path and document order
   * @returns Nothing; references keep the cell even when latent values are erased
   */
  static transfer(previous: object, current: Readonly<Address>): void {
    const address = this.cells.get(previous);
    if (!address) return;
    address.path = current.path;
    address.order = current.order;
    this.cells.set(current, address);
  }

  /**
   * Resolve a detached write, including descendants folded into an array source.
   * @param node - Detached occurrence with its original parent chain and path
   * @returns Its cell, an address relative to a captured ancestor, or undefined
   */
  static read<Self extends FieldNodeRecord<Self>>(
    node: Self,
  ): Readonly<Address> | undefined {
    const own = this.cells.get(node);
    if (own) return own;
    for (let parent = node.parent; parent; parent = parent.parent) {
      const ancestor = this.cells.get(parent);
      if (!ancestor) continue;
      const order = getLatentOrder(node.parent, node.name, node.blueprintNode);
      return {
        path: ancestor.path + node.path.slice(parent.path.length),
        order: [...ancestor.order, ...order.slice(ancestor.order.length)],
      };
    }
    return undefined;
  }
}
