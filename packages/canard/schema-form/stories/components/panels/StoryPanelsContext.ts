import { createContext } from 'react';

import type { StoryPanelsStore } from './types';

/** React supplies the store for this canvas; undecorated usage stories have no store. */
export const StoryPanelsContext = createContext<StoryPanelsStore | null>(null);
