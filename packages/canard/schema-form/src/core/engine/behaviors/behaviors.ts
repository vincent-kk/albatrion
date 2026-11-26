import type { Optional } from '@aileron/declare';

import type { BlueprintNode, BlueprintNodeKind } from '../blueprint';
import type { Behavior } from '../record';
import { arrayBehavior } from './arrayBehavior';
import { booleanBehavior, booleanItemLeafBehavior } from './booleanBehavior';
import { nullBehavior } from './nullBehavior';
import { numberBehavior, numberItemLeafBehavior } from './numberBehavior';
import { objectBehavior } from './objectBehavior';
import { stringBehavior, stringItemLeafBehavior } from './stringBehavior';
import { unionBehavior, unionItemLeafBehavior } from './unionBehavior';
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
  array: arrayBehavior,
});

/** Item leaf rows by kind; a kind without an entry keeps its base row at an item position. */
const ITEM_LEAF_BEHAVIORS: Readonly<{
  [type in BlueprintNodeKind]?: Behavior;
}> = Object.freeze({
  string: stringItemLeafBehavior,
  number: numberItemLeafBehavior,
  boolean: booleanItemLeafBehavior,
  union: unionItemLeafBehavior,
});

/**
 * Select the row a new node keeps for its lifetime.
 * @param template - Blueprint template of the node; its kind, strategy and static nullability decide
 * @param isArrayItem - Whether the parent is an array, which holds children only as a branch
 * @returns The item leaf row of a non-nullable string, number, boolean or union item, otherwise the
 * kind and strategy row; undefined for a pair without a row
 */
export const selectBehavior = (
  template: BlueprintNode,
  isArrayItem: boolean,
): Optional<Behavior> =>
  (isArrayItem && !template.isNullable && ITEM_LEAF_BEHAVIORS[template.kind]) ||
  BEHAVIORS[template.kind]?.[template.strategy];

/**
 * Tell whether a node's row is an item leaf row, the one way settlement recognizes an empty item position.
 * @param behavior - Fixed row of a node
 * @returns Whether the row is the item leaf row of its kind
 */
export const isItemLeafBehavior = <Self>(behavior: Behavior<Self>): boolean =>
  ITEM_LEAF_BEHAVIORS[behavior.type] === behavior;
