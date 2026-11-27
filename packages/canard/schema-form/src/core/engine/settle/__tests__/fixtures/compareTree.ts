import type { DispatchTestNode } from '../../../__tests__/fixtures/createDispatchTree';
import { visitFieldNodes } from '../../../navigation';
import { getControlLayers } from '../../utils/controls/getControlLayers';
import { referenceControlLayers } from './referenceControlLayers';
import { selectionVariants } from './selectionVariants';

/**
 * Compare both implementations on every node and selection variant of a mounted tree.
 * @param root - Mounted tree under comparison
 * @param label - Scene name used in mismatch reports
 * @returns Mismatch reports and the number of fragment layers the reference produced
 */
export const compareTree = (root: DispatchTestNode, label: string) => {
  const mismatches: string[] = [];
  let fragments = 0;
  let comparisons = 0;
  let nodes = 0;
  visitFieldNodes(root, (node) => {
    nodes++;
    for (const selection of selectionVariants(node)) {
      comparisons++;
      const actual = getControlLayers(node, selection);
      const expected = referenceControlLayers(node, selection);
      fragments += expected.filter(({ layer }) => layer === 'fragment').length;
      const same =
        actual.length === expected.length &&
        actual.every((group, index) => {
          const other = expected[index];
          return (
            group.layer === other.layer &&
            group.declarationId === other.declarationId &&
            group.schemaPath === other.schemaPath &&
            group.controls === other.controls &&
            group.host === other.host
          );
        });
      if (!same)
        mismatches.push(`${label} ${node.path} [${[...selection.values()]}]`);
    }
  });
  return { mismatches, fragments, comparisons, nodes };
};
