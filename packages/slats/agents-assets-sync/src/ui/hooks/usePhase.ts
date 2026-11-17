import { useReducer } from 'react';

import type { Fn } from '@aileron/declare';

import { phaseReducer } from '../reducer/phaseReducer.js';
import type { InjectEvent, Phase } from '../types/index.js';

export function usePhase(initial: Phase): [Phase, Fn<[event: InjectEvent]>] {
  const [phase, dispatch] = useReducer(phaseReducer, initial);
  return [phase, dispatch];
}
