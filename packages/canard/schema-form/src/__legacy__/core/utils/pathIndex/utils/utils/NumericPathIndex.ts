/** Decimal radix node; lengths keep numeric order separate from lexical order. */
interface NumericNode {
  children: Map<string, NumericNode>;
  path?: string;
}

/** Index canonical nonnegative array slots without scanning surviving slots. */
export class NumericPathIndex {
  private readonly lengths = new Map<number, NumericNode>();

  /** Whether no slots remain registered. */
  get empty(): boolean { return this.lengths.size === 0; }

  /** Register one slot prefix. */
  add(segment: string, path: string): void {
    const root = this.lengths.get(segment.length) ?? { children: new Map<string, NumericNode>() };
    this.lengths.set(segment.length, root);
    let node: NumericNode = root;
    for (const digit of segment) {
      let child = node.children.get(digit);
      if (!child) {
        child = { children: new Map() };
        node.children.set(digit, child);
      }
      node = child;
    }
    node.path = path;
  }

  /** Remove the slot and its now empty radix nodes. */
  delete(segment: string): void {
    const root = this.lengths.get(segment.length);
    if (!root) return;
    const parents = [root];
    for (const digit of segment) {
      const child = parents[parents.length - 1].children.get(digit);
      if (!child) return;
      parents.push(child);
    }
    delete parents[parents.length - 1].path;
    for (let i = segment.length - 1; i >= 0; i--) {
      const child = parents[i + 1];
      if (child.path !== undefined || child.children.size) break;
      parents[i].children.delete(segment[i]);
    }
    if (root.children.size === 0) this.lengths.delete(segment.length);
  }

  /** Visit only slots at or above the new array length. */
  *tail(count: number): IterableIterator<string> {
    const lower = String(count);
    for (const [length, root] of this.lengths) {
      if (length < lower.length) continue;
      const pending = [{ node: root, prefix: '' }];
      while (pending.length) {
        const { node, prefix } = pending.pop()!;
        if (node.path !== undefined) yield node.path;
        for (const [digit, child] of node.children) {
          const next = prefix + digit;
          if (length === lower.length && next < lower.slice(0, next.length)) continue;
          pending.push({ node: child, prefix: next });
        }
      }
    }
  }
}
