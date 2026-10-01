import type { ArrayNode, StringNode } from '../index';

declare const arrayNode: ArrayNode<string>;
declare const stringNode: StringNode;

const length: number = arrayNode.push('x');
const removed: string | undefined = arrayNode.pop();
const updated: string | undefined = arrayNode.update(0, 'y');
const shifted: string | undefined = arrayNode.remove(0);
const cleared: void = arrayNode.clear();

// @ts-expect-error Structural verbs are absent on a string node.
stringNode.push('x');

void [length, removed, updated, shifted, cleared];
