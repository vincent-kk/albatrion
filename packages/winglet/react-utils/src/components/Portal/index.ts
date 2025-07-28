import { Anchor } from './Anchor';
import { Portal as BasePortal } from './Portal';
import { withPortal } from './withPortal';

export type { Anchor, BasePortal, withPortal };

/**
 * Portal system for rendering React components at different DOM locations while maintaining component hierarchy.
 *
 * Provides a complete portal solution including the main Portal component, DOM anchor placement,
 * and Higher-Order Component wrapper for context provision. This system allows breaking out of
 * CSS containment and z-index stacking contexts while preserving React's component tree structure.
 *
 * ### Usage Patterns
 *
 * **Compound Object Pattern (Recommended for convenience):**
 * ```typescript
 * import { Portal } from '@/react-utils';
 *
 * const App = Portal.with(() => (
 *   <div>
 *     <Portal><ModalContent /></Portal>
 *     <Portal.Anchor />
 *   </div>
 * ));
 * ```
 *
 *
 * ### Component References
 *
 * For detailed documentation with comprehensive examples and API details:
 * - **Portal main component**: See {@link BasePortal} export
 * - **Portal.with HOC**: See {@link withPortal} export
 * - **Portal.Anchor component**: See {@link Anchor} export
 *
 * ### Design Philosophy
 *
 * This dual-export approach provides both convenience and flexibility:
 * - Use `Portal.*` for quick prototyping and compact code
 * - Use individual imports when you need detailed documentation or tree-shaking
 * - All approaches provide identical functionality and type safety
 */
export const Portal = Object.assign(BasePortal, {
  /**
   * Higher-Order Component that enhances components with Portal functionality.
   *
   * Creates an isolated portal context that manages registration, rendering, and lifecycle
   * of all portal content within the wrapped component and its descendants.
   *
   * **For comprehensive documentation and examples, see:** {@link withPortal}
   *
   * @typeParam T - The wrapped component's props type
   * @param Component - React component to enhance with portal context
   * @returns Enhanced component with portal functionality
   */
  with: withPortal,

  /**
   * Defines the exact DOM location where Portal content will be rendered.
   *
   * Creates a designated mounting point in the DOM tree where all Portal content
   * will be inserted, acting as a bridge between React component tree and actual DOM location.
   *
   * **For comprehensive documentation and examples, see:** {@link Anchor}
   *
   * @param props - Standard HTML div attributes (excluding children)
   * @returns Div element that serves as portal mounting point
   */
  Anchor,
});
