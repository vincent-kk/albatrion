import type { StoryPanelsState, StoryPanelsStore } from './types';

/**
 * Create the external store owned by one decorated canvas or docs story.
 * @param initial - Initial authored data shown before the renderer reports its handle.
 * @returns Stable methods and cached snapshots; reports never rerender the decorator.
 */
export function storyPanelsStore(initial: StoryPanelsState): StoryPanelsStore {
  let snapshot = initial;
  const listeners = new Set<() => void>();
  return {
    getSnapshot: () => snapshot,
    subscribe(listener) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    report(partial) {
      snapshot = { ...snapshot, ...partial, settings: { ...snapshot.settings, ...partial.settings } };
      listeners.forEach((listener) => listener());
    },
  };
}
