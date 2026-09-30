export interface TraversalNode<Node> {
  readonly subnodes: ReadonlyArray<{ node: Node }> | null;
}
