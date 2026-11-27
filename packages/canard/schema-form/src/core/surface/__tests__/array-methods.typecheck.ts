import type { ArrayNode, StringNode } from '../type';

declare const arrayNode: ArrayNode<string>;
declare const stringNode: StringNode;

const length: number = arrayNode.push('x');
const removed: string | undefined = arrayNode.pop();
const updated: string | undefined = arrayNode.update(0, 'y');
const shifted: string | undefined = arrayNode.remove(0);
const inserted: number = arrayNode.insert(0, 'z');
const filled: number = arrayNode.insert(1);
const cleared: void = arrayNode.clear();

// @ts-expect-error Structural verbs are absent on a string node.
stringNode.push('x');
// @ts-expect-error Structural verbs are absent on a string node.
stringNode.insert(0, 'x');
// @ts-expect-error The inserted value follows the item type.
arrayNode.insert(0, 1);

void [length, removed, updated, shifted, inserted, filled, cleared];
