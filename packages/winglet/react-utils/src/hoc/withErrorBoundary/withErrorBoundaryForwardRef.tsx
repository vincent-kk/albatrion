import {
  type ForwardRefExoticComponent,
  type PropsWithoutRef,
  type ReactNode,
  type RefAttributes,
  forwardRef,
} from 'react';

import type { Dictionary } from '@aileron/declare';

import { ErrorBoundary } from './ErrorBoundary';

/**
 * Wraps a forwardRef component with error boundary protection while preserving ref forwarding.
 *
 * This specialized Higher-Order Component (HOC) is designed specifically for components created
 * with React.forwardRef. It provides the same error boundary protection as withErrorBoundary
 * while maintaining the ability to forward refs to the underlying DOM elements or component
 * instances. This is crucial for components that need direct DOM access or imperative APIs.
 *
 * ### Use Cases
 * - **Form Input Components**: Protect form fields while allowing focus/blur control
 * - **Custom UI Libraries**: Wrap library components that expose imperative APIs
 * - **Animation Components**: Protect animated elements while allowing direct manipulation
 * - **Focus Management**: Maintain focus control in error-prone interactive components
 *
 * ### Key Features
 * - Preserves ref forwarding functionality from the original forwardRef component
 * - Catches all JavaScript errors in the component tree below it
 * - Maintains type safety for both props and ref types
 * - Allows custom fallback UI for better user experience
 * - Compatible with all forwardRef patterns and use cases
 *
 * ### Differences from withErrorBoundary
 * - Specifically designed for forwardRef components
 * - Maintains proper TypeScript typing for forwarded refs
 * - Handles the complexity of wrapping forwardRef components correctly
 *
 * @example
 * ```typescript
 * // Original forwardRef component
 * const CustomInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
 *   return <input {...props} ref={ref} className="custom-input" />;
 * });
 *
 * // Wrap with error boundary while preserving ref forwarding
 * const SafeCustomInput = withErrorBoundaryForwardRef(
 *   CustomInput,
 *   <div>Input component failed to load</div>
 * );
 *
 * // Usage - ref forwarding still works
 * const FormComponent = () => {
 *   const inputRef = useRef<HTMLInputElement>(null);
 *
 *   const focusInput = () => {
 *     inputRef.current?.focus(); // This still works!
 *   };
 *
 *   return (
 *     <div>
 *       <SafeCustomInput ref={inputRef} placeholder="Enter text" />
 *       <button onClick={focusInput}>Focus Input</button>
 *     </div>
 *   );
 * };
 *
 * // Complex component with imperative API
 * const VideoPlayer = forwardRef<VideoPlayerHandle, VideoProps>((props, ref) => {
 *   // Component implementation...
 * });
 * const SafeVideoPlayer = withErrorBoundaryForwardRef(VideoPlayer);
 * ```
 *
 * @typeParam Props - The type definition for the component's props
 * @typeParam Ref - The type of the ref being forwarded to the component
 * @param Component - The forwardRef component to wrap with error boundary protection
 * @param fallback - Optional custom fallback JSX to display when an error occurs. If not provided, uses default error message
 * @returns A new forwardRef component that renders the original component with error boundary protection
 */
export const withErrorBoundaryForwardRef = <Props extends Dictionary, Ref>(
  Component: ForwardRefExoticComponent<Props & RefAttributes<Ref>>,
  fallback?: ReactNode,
): ForwardRefExoticComponent<PropsWithoutRef<Props> & RefAttributes<Ref>> => {
  return forwardRef<Ref, Props>((props, ref) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...(props as Props)} ref={ref} />
    </ErrorBoundary>
  ));
};
