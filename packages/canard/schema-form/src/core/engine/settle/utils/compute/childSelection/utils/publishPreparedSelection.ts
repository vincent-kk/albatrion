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
  const preparedStatic = frame.preparedStatic!;
  const names = Object.keys(frame.preparedDynamic!);
  let same = names.length === preparedStatic.dynamicNames.length;
  if (same) {
    for (let index = 0, count = names.length; index < count; index++) {
      const name = names[index];

      if (
        !(
          name === preparedStatic.dynamicNames[index] &&
          frame.next[name] === preparedStatic.selectedChildrenByName[name]
        )
      ) {
        same = false;
        break;
      }
    }
  }

  if (!same) {
    preparedStatic.selectedChildrenByName = Object.assign(
      Object.create(null),
      preparedStatic.baseline,
      frame.preparedDynamic,
    );
    preparedStatic.selectedChildren = Object.values(
      preparedStatic.selectedChildrenByName,
    );
    frame.hasChanged = true;
  }
  preparedStatic.dynamicNames = names;
  frame.node.childrenByName = preparedStatic.selectedChildrenByName;
  frame.node.children = captureFieldNodeChange(
    frame.node,
    'children',
    preparedStatic.selectedChildren,
  );
  return preparedStatic.selectedChildren;
};
