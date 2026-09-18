import { checkTextLimit } from '../utils/checkTextLimit';
import { allocateNode } from './restoration/allocateNode';
import { fillNode } from './restoration/fillNode';
import { restoreToken } from './restoration/restoreToken';
import { validateGraph } from './validation/validateGraph';

/**
 * Restores a versioned graph after validating all wire nodes and resource limits.
 * @param text JSON produced by stringifyGraph, at most 16 MiB UTF-8.
 * @returns The supported value with shared and circular identities restored.
 * @throws SyntaxError for malformed JSON; TypeError for invalid graph data or limits.
 */
export function parseGraph(text: string): unknown {
  checkTextLimit(text);
  const wire: unknown = JSON.parse(text);
  validateGraph(wire);
  const nodes = wire[3];
  const objects = nodes.map(allocateNode);
  for (let i = 0; i < nodes.length; i++)
    fillNode(nodes[i], objects[i], objects);
  return restoreToken(wire[2], objects);
}
