import { collectFieldNodes } from '../../../../__tests__/boundary-scenes/fixtures/utils/collectFieldNodes';
import { isTerminalNode } from '../../../../surface';
import type { FieldNode } from '../../../../surface';

/** The observation of one node. */
export interface OracleNodeReading {
  path: string;
  /** Whether the node's output is omitted, so a fresh load, which receives the output, may lack its value or the node. */
  isOmitted: boolean;
  /** Path, liveness, selected schema, value and output value, as one comparable line. */
  line: string;
}

/**
 * Observe every node of a form: path, liveness, selected schema, value and output value; validation
 * errors are not observed. A fresh load receives the output, so a value the output omits is a
 * documented difference (`readRawSources`), not a dependence on history: the value of a node whose
 * output is omitted reads `(omitted)`, and a branch's value, which repeats its children's values
 * together with the ones its output omits, is read through its output and its children only.
 * @param root - The form root
 * @returns One reading per node, parents before children
 */
export const observeOracleNodes = (root: FieldNode): OracleNodeReading[] =>
  collectFieldNodes(root).map((node) => {
    const isOmitted = node.outputValue === undefined;
    const value =
      isOmitted || !isTerminalNode(node)
        ? '(omitted)'
        : JSON.stringify(node.value);
    return {
      path: node.path,
      isOmitted,
      line: [
        node.path,
        node.isActive ? 'active' : 'inactive',
        JSON.stringify(node.jsonSchema),
        value,
        JSON.stringify(node.outputValue),
      ].join(' '),
    };
  });
