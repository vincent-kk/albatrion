export const isPrimitiveObject = <T extends object>(
  value: unknown,
): value is T => {
  return Object(value) === value;
};
