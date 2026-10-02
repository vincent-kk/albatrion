import type { ComponentType, ReactNode } from 'react';

import type { Dictionary } from '@aileron/declare';

import {
  ErrorBoundary,
  type UseErrorBoundaryReporter,
} from './components/ErrorBoundary';

/** Returns no reporter when the wrapper's optional reporter hook is omitted. */
const useDefaultReporter: UseErrorBoundaryReporter = () => undefined;

/**
 * Wraps a React component with error boundary protection to prevent application crashes.
 *
 * This Higher-Order Component (HOC) provides a robust error handling mechanism by catching
 * JavaScript errors that occur within the component tree and displaying a fallback UI
 * instead of letting the entire application crash. It's essential for creating resilient
 * React applications that can gracefully handle unexpected errors.
 *
 * ### Use Cases
 * - **Component Error Isolation**: Prevent errors in one component from crashing the entire app
 * - **Third-party Integration**: Safely render components from external libraries or APIs
 * - **Production Error Handling**: Display user-friendly error messages in production builds
 * - **Development Debugging**: Capture detailed error information during development
 *
 * ### Key Features
 * - Catches all JavaScript errors in the component tree below it
 * - Prevents error propagation to parent components
 * - Allows custom fallback UI for better user experience
 * - Maintains component props and functionality when no errors occur
 *
 * @example
 * ```typescript
 * // Basic usage with default fallback
 * const SafeUserProfile = withErrorBoundary(UserProfile);
 *
 * // Custom fallback UI
 * const SafeDataTable = withErrorBoundary(
 *   DataTable,
 *   <div>Sorry, unable to load data. Please try again.</div>
 * );
 *
 * // Usage in component
 * const App = () => {
 *   return (
 *     <div>
 *       <SafeUserProfile userId={123} />
 *       <SafeDataTable data={tableData} />
 *     </div>
 *   );
 * };
 *
 * // Error will be caught and fallback displayed instead of app crash
 * const ProblematicComponent = () => {
 *   throw new Error('Something went wrong!');
 *   return <div>This won't render</div>;
 * };
 * const SafeProblematic = withErrorBoundary(ProblematicComponent);
 * ```
 *
 * @typeParam Props - The type definition for the component's props
 * @param Component - The React component to wrap with error boundary protection
 * @param fallback - Optional custom fallback JSX to display when an error occurs. If not provided, uses default error message
 * @param useReporter - Hook called on every render to read an optional error reporter
 * @returns A new component that renders the original component with error boundary protection
 */
export const withErrorBoundary = <Props extends Dictionary>(
  Component: ComponentType<Props>,
  fallback?: ReactNode,
  useReporter: UseErrorBoundaryReporter = useDefaultReporter,
): ComponentType<Props> => {
  return (props: Props) => {
    const onError = useReporter();
    return (
      <ErrorBoundary fallback={fallback} onError={onError}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};
