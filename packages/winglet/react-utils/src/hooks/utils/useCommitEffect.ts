import * as React from 'react';

/** React supplies insertion effects before layout effects; older peers use their layout phase. */
export const useCommitEffect: typeof React.useLayoutEffect =
  React.useInsertionEffect ?? React.useLayoutEffect;
