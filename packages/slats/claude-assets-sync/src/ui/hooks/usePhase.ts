import { useReducer } from 'react';

import { phaseReducer } from '../InjectApp/utils/phaseReducer.js';
import type { InjectEvent, Phase } from '../types/index.js';

export function usePhase(initial: Phase): [Phase, (event: InjectEvent) => void] {
  const [phase, dispatch] = useReducer(phaseReducer, initial);
  return [phase, dispatch];
}
