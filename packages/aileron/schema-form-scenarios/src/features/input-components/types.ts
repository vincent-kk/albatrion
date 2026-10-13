/** A definition named by its label; the consumer builds a component that marks itself with this label. */
export interface LabeledDefinition {
  /** Engine-free subset of the definition test object; every listed key must match the node hint. */
  readonly test: Readonly<{ inputType?: string; path?: string }>;
  /** Label the consumer's component renders, read back as the winner. */
  readonly label: string;
}

/** Which input renders at a path: a definition label, the built-in input, or no input at all. */
export type InputWinner = string | 'default' | 'none';
