import type { GraphNode } from '../../utils/encodeGraph';

/** Allocates one validated node without following any graph edges. */
export function allocateNode(node: GraphNode): any {
  switch (node[0]) {
    case 'object':
      return node[1] === 'null' ? Object.create(null) : {};
    case 'array':
      return new Array(node[1]);
    case 'date':
      return new Date(Number(node[1][1]));
    case 'map':
      return new Map();
    case 'set':
      return new Set();
    case 'regexp':
      return new RegExp(node[1], node[2]);
  }
}
