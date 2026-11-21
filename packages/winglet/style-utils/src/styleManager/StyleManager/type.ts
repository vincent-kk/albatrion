/**
 * Style insertion target - either a document or shadow root
 */
export type StyleRoot = Document | ShadowRoot;

/**
 * Configuration options for StyleManager
 */
export interface StyleManagerConfig {
  /** The shadow root to attach styles to. If not provided, uses document */
  shadowRoot?: ShadowRoot;
}
