import * as React from 'react';

/** React supplies insertion cleanup for deletion; older peers retain passive effects through Suspense hiding. */
export const useAnchorLifecycle: typeof React.useEffect =
  React.useInsertionEffect ?? React.useEffect;
