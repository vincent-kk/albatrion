import type { BlueprintNodeKind } from '../blueprint';
import type { Behavior } from '../record';
import { booleanBehavior } from './booleanBehavior';
import { nullBehavior } from './nullBehavior';
import { numberBehavior } from './numberBehavior';
import { objectBehavior } from './objectBehavior';
import { stringBehavior } from './stringBehavior';
import { unionBehavior } from './unionBehavior';
import { virtualBehavior } from './virtualBehavior';

/** Immutable kind and strategy dispatch table for the first node engine. */
export const BEHAVIORS: Readonly<{
  [type in BlueprintNodeKind]?: Readonly<{
    branch?: Behavior;
    terminal?: Behavior;
  }>;
}> = Object.freeze({
  string: Object.freeze({ terminal: stringBehavior }),
  number: Object.freeze({ terminal: numberBehavior }),
  boolean: Object.freeze({ terminal: booleanBehavior }),
  null: Object.freeze({ terminal: nullBehavior }),
  union: Object.freeze({ terminal: unionBehavior }),
  virtual: Object.freeze({ branch: virtualBehavior }),
  object: objectBehavior,
});
