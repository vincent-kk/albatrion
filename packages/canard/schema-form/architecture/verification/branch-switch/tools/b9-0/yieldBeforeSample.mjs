// Called before each sample's clock starts, matching the canonical measurePair boundary.
import { setImmediate } from 'node:timers/promises';

export const yieldBeforeSample = () => setImmediate();
