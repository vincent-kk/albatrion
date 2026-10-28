// Called before each sample's clock starts, matching the canonical measurePair boundary.
import { setTimeout } from 'node:timers/promises';

export const yieldBeforeSample = () => setTimeout(0);
