import { useContext, useSyncExternalStore } from 'react';

import { StoryPanelsContext } from '../StoryPanelsContext';

/**
 * Subscribe a panel to the store supplied by React's decorator context.
 * @returns The current immutable snapshot.
 * @throws When a panel is mounted outside StoryPanels.
 */
export function useStoryPanelsSnapshot() {
  const store = useContext(StoryPanelsContext);
  if (!store) throw new Error('Story panels require their decorator context');
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}
