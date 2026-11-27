import type { FieldNode } from '@/schema-form/core';

/** A bridge's files follow its node while the public map follows current paths. */
interface Attachment {
  node: FieldNode;
  files: File[];
}

/** Form-owned Map preserving bridge ownership across path moves and reset. */
export class AttachedFilesStore extends Map<string, File[]> {
  /** Records are bounded by bridge positions that currently own attachments. */
  private readonly attachments = new Map<object, Attachment>();

  /** Record or clear this bridge's files; later attachments win at a shared path. */
  attach(owner: object, node: FieldNode, files: File[] | undefined): void {
    this.attachments.delete(owner);
    if (files !== undefined) this.attachments.set(owner, { node, files });
    super.clear();
    this.synchronize();
  }

  /** Release only the disappearing bridge's record, retaining other positions. */
  detach(owner: object): void {
    if (this.attachments.delete(owner)) {
      super.clear();
      this.synchronize();
    }
  }

  /** Publish all live records together after committed node paths have changed. */
  synchronize(): void {
    if (!this.attachments.size) return;
    super.clear();
    for (const { node, files } of this.attachments.values())
      if (node.isPresent) super.set(node.path, files);
  }

  /** Reset both the public map and ownership so later path events retain no files. */
  override clear(): void {
    this.attachments.clear();
    super.clear();
  }
}
