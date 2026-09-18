import type { GraphNode } from '../../utils/encodeGraph';
import { restoreToken } from './restoreToken';

/** Fills validated nodes using own data definitions, never inherited assignment semantics. */
export function fillNode(node: GraphNode, target: any, objects: any[]): void {
  switch (node[0]) {
    case 'object':
    case 'array':
      for (const [key, token] of node[2])
        Object.defineProperty(target, key, {
          value: restoreToken(token, objects),
          writable: true,
          enumerable: true,
          configurable: true,
        });
      break;
    case 'map':
      for (const [key, token] of node[1])
        target.set(restoreToken(key, objects), restoreToken(token, objects));
      break;
    case 'set':
      for (const token of node[1]) target.add(restoreToken(token, objects));
      break;
    case 'regexp':
      target.lastIndex = restoreToken(node[3], objects);
  }
}
