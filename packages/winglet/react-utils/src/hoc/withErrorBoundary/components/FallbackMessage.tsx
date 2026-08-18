/**
 * Default error message component used by ErrorBoundary.
 * Displays a simple italic message when an unexpected error occurs.
 * @returns Default error message UI
 */
export const FallbackMessage = () => (
  <div style={{ fontStyle: 'italic' }}>An unexpected error has occurred</div>
);
