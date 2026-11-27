/**
 * Compare the symbol properties that object rest and spread preserve.
 * @param current Incoming props.
 * @param previous Previously published props.
 * @returns Whether both have the same enumerable symbol keys and values.
 */
export function equalRestSymbols(current: object, previous: object): boolean {
  let count = 0;
  for (const key of Object.getOwnPropertySymbols(current)) {
    if (!isEnumerable.call(current, key)) continue;
    if (
      !isEnumerable.call(previous, key) ||
      Reflect.get(current, key) !== Reflect.get(previous, key)
    )
      return false;
    count++;
  }
  for (const key of Object.getOwnPropertySymbols(previous))
    if (isEnumerable.call(previous, key)) count--;
  return count === 0;
}

/** Check own enumerability independently of an object's prototype. */
const isEnumerable = Object.prototype.propertyIsEnumerable;
