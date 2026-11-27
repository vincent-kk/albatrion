import { useContext } from 'react';

import { StoryPanelsContext } from './StoryPanelsContext';
import type { StoryPanelsStore } from './types';

/** Stable sink used when a renderer is deliberately shown without panels. */
const ignoreReport: StoryPanelsStore['report'] = () => {};

/**
 * Obtain the reporting edge without subscribing the Form or decorator to updates.
 * @returns The current React context's stable reporter, or a no-op outside the decorator.
 */
export function useStoryPanelsReport(): StoryPanelsStore['report'] {
  return useContext(StoryPanelsContext)?.report ?? ignoreReport;
}
