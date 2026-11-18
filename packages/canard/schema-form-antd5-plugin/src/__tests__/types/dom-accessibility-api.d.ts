// The installed package exports its ESM build without a matching types condition.
declare module 'dom-accessibility-api' {
  /**
   * Compute the accessible name using the installed package's standard algorithm.
   * @param root - DOM element whose accessible name is evaluated.
   * @returns The name resolved from native labels, ARIA references and text.
   */
  export function computeAccessibleName(root: Element): string;
}
