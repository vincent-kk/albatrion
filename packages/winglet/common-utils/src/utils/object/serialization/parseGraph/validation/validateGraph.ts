import type { GraphNode, Token } from '../../utils/encodeGraph';
import { validateCollection } from './validateCollection';
import { validateEntries } from './validateEntries';
import { validateToken } from './validateToken';

/** Validates the entire wire, including unreachable nodes, before allocating the restored graph. */
export function validateGraph(
  wire: unknown,
): asserts wire is [string, number, Token, GraphNode[]] {
  if (
    !Array.isArray(wire) ||
    wire.length !== 4 ||
    wire[0] !== 'winglet.graph' ||
    wire[1] !== 1 ||
    !Array.isArray(wire[3]) ||
    wire[3].length > 100000
  )
    throw new TypeError('Invalid graph envelope');
  const nodes = wire[3];
  validateToken(wire[2], nodes.length);
  let entries = 0;
  let arrayLength = 0;
  for (const node of nodes) {
    if (!Array.isArray(node)) throw new TypeError('Invalid graph node');
    switch (node[0]) {
      case 'object':
        if (node.length !== 3 || !['plain', 'null'].includes(node[1]))
          throw new TypeError('Invalid graph object');
        entries += validateEntries(node[2], nodes.length);
        break;
      case 'array':
        if (
          node.length !== 3 ||
          !Number.isSafeInteger(node[1]) ||
          node[1] < 0 ||
          node[1] > 1000000
        )
          throw new TypeError('Invalid graph array length');
        arrayLength += node[1];
        if (arrayLength > 1000000)
          throw new TypeError('Graph cumulative array length limit exceeded');
        entries += validateEntries(node[2], nodes.length, node[1]);
        break;
      case 'date':
        if (node.length !== 2) throw new TypeError('Invalid graph date');
        validateToken(node[1], nodes.length);
        if (
          node[1][0] !== 'number' ||
          !(
            node[1][1] === 'NaN' ||
            (typeof node[1][1] === 'number' &&
              Number.isInteger(node[1][1]) &&
              Math.abs(node[1][1]) <= 8640000000000000)
          )
        )
          throw new TypeError('Invalid graph date payload');
        break;
      case 'map':
      case 'set':
        if (node.length !== 2)
          throw new TypeError('Invalid graph collection arity');
        entries += validateCollection(node[1], nodes.length, node[0] === 'map');
        break;
      case 'regexp':
        if (
          node.length !== 4 ||
          typeof node[1] !== 'string' ||
          typeof node[2] !== 'string'
        )
          throw new TypeError('Invalid graph regexp');
        try {
          const expression = new RegExp(node[1], node[2]);
          if (expression.source !== node[1] || expression.flags !== node[2])
            throw new Error();
        } catch {
          throw new TypeError('Invalid graph regexp payload');
        }
        validateToken(node[3], nodes.length);
        break;
      default:
        throw new TypeError('Unknown graph node tag');
    }
    if (entries > 1000000) throw new TypeError('Graph entry limit exceeded');
  }
}
