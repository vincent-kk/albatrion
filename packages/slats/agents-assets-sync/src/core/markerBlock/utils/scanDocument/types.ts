/** Byte offsets and body of one recognized managed block. */
export interface LocatedBlock {
  readonly blockId: string;
  readonly body: string;
  readonly start: number;
  readonly end: number;
}
/** A Markdown boundary that prevents safe managed-block insertion. */
export interface MarkdownIssue {
  readonly line: number;
  readonly message: string;
}
/** One lexical pass serves block discovery and insertion validation. */
export interface MarkdownScan {
  readonly blocks: LocatedBlock[];
  readonly issue?: MarkdownIssue;
}
