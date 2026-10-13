/** Dirty paths retain descendant order or close an ungated post-order frontier. */
export class DirtyPathSet extends Set<string> {
  /** Live descendant paths and their direct child names in insertion order. */
  readonly childrenByParent: Map<string, Map<string, string>>;

  /** Ungated computation consumes live nodes only after their children. */
  private postOrder = false;

  /**
   * @param childrenByParent - Scratch index cleared with this set
   */
  constructor(childrenByParent: Map<string, Map<string, string>>) {
    super();
    this.childrenByParent = childrenByParent;
  }

  /**
   * Close the scheduled frontier at the start of an ungated computation.
   * Registration must still repair ancestors of unresolved paths each round.
   * @returns Nothing; indexes each unique prefix once in first-descendant order
   */
  beginPostOrder(): void {
    if (this.postOrder) return;
    this.postOrder = true;
    this.childrenByParent.clear();
    const linked = new Set<string>();
    for (const path of this) {
      let current = path;
      while (current && !linked.has(current)) {
        linked.add(current);
        const slash = current.lastIndexOf('/');
        const parent = current.slice(0, slash);
        super.add(parent);
        let children = this.childrenByParent.get(parent);
        if (!children) {
          children = new Map();
          this.childrenByParent.set(parent, children);
        }
        children.set(current, current.slice(slash + 1));
        current = parent;
      }
    }
  }

  override add(path: string): this {
    if (this.has(path)) return this;
    if (this.postOrder) {
      let current = path;
      while (!this.has(current)) {
        super.add(current);
        if (!current) break;
        const slash = current.lastIndexOf('/');
        const parent = current.slice(0, slash);
        let children = this.childrenByParent.get(parent);
        if (!children) {
          children = new Map();
          this.childrenByParent.set(parent, children);
        }
        children.set(current, current.slice(slash + 1));
        current = parent;
      }
      return this;
    }
    super.add(path);
    let start = 1;
    while (start <= path.length) {
      const slash = path.indexOf('/', start);
      const end = slash < 0 ? path.length : slash;
      const parent = path.slice(0, start - 1);
      const name = path.slice(start, end);
      let children = this.childrenByParent.get(parent);
      if (!children) {
        children = new Map();
        this.childrenByParent.set(parent, children);
      }
      children.set(path, name);
      if (slash < 0) break;
      start = slash + 1;
    }
    return this;
  }

  override delete(path: string): boolean {
    if (!super.delete(path)) return false;
    if (this.postOrder) {
      if (path) {
        const parent = path.slice(0, path.lastIndexOf('/'));
        const children = this.childrenByParent.get(parent);
        children?.delete(path);
        if (children?.size === 0) this.childrenByParent.delete(parent);
      }
      return true;
    }
    let start = 1;
    while (start <= path.length) {
      const slash = path.indexOf('/', start);
      const parent = path.slice(0, start - 1);
      const children = this.childrenByParent.get(parent)!;
      children.delete(path);
      if (children.size === 0) this.childrenByParent.delete(parent);
      if (slash < 0) break;
      start = slash + 1;
    }
    return true;
  }

  override clear(): void {
    super.clear();
    this.childrenByParent.clear();
    this.postOrder = false;
  }
}
