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
  const same =
    names.length === prepared.dynamicNames.length &&
    (() => {
      const items = names;
      for (
        let position = 0, count = items.length;
        position < count;
        position++
      ) {
        if (!(position in items)) continue;
        const name = items[position];
        const index = position;
        if (
          !(
            name === prepared.dynamicNames[index] &&
            frame.next[name] === prepared.selectedStructure[name]
          )
        )
          return false;
      }
      return true;
    })();
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
