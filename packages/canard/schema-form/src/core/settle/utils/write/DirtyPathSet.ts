/** Dirty paths index each descendant by its direct child at every ancestor. */
export class DirtyPathSet extends Set<string> {
  /** Live descendant paths and their direct child names in insertion order. */
  readonly childrenByParent: Map<string, Map<string, string>>;

  constructor(childrenByParent: Map<string, Map<string, string>>) {
    super();
    this.childrenByParent = childrenByParent;
  }

  override add(path: string): this {
    if (this.has(path)) return this;
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
  }
}
