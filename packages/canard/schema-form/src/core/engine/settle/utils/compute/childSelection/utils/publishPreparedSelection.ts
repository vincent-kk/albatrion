import { captureFieldNodeChange } from '../../../../../record';
import type { FieldNodeRecord } from '../../../../../record';
import type { ChildSelectionFrame } from '../selectEntryStep';

/**
 * Publish an ordinary shape after comparing only the selected dynamic occurrences.
 * @param frame - Completed selection with immutable static witnesses and ordered dynamic names
 * @returns The finalized child list, reusing its prior reference when membership is unchanged.
 * New membership allocates a complete shape and list; intermediate views never escape selection.
 */

export const publishPreparedSelection = <Self extends FieldNodeRecord<Self>>(
  frame: ChildSelectionFrame<Self>,
): readonly Self[] => {
  const prepared = frame.preparedStatic!;
  const names = Object.keys(frame.preparedDynamic!);
  let same = names.length === prepared.dynamicNames.length;
  if (same) {
    same = true;
    for (let index = 0, count = names.length; index < count; index++) {
      const name = names[index];

      if (
        !(
          name === prepared.dynamicNames[index] &&
          frame.next[name] === prepared.selectedStructure[name]
        )
      ) {
        same = false;
        break;
      }
    }
  }

  if (!same) {
    prepared.selectedStructure = Object.assign(
      Object.create(null),
      prepared.baseline,
      frame.preparedDynamic,
    );
    prepared.selectedChildren = Object.values(prepared.selectedStructure);
    frame.changed = true;
  }
  prepared.dynamicNames = names;
  frame.node.structure = prepared.selectedStructure;
  frame.node.children = captureFieldNodeChange(
    frame.node,
    'children',
    prepared.selectedChildren,
  );
  return prepared.selectedChildren;
};
