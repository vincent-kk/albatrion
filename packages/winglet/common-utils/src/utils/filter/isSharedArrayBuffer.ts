export const isSharedArrayBuffer = (
  value: unknown,
): value is SharedArrayBuffer =>
  SharedArrayBuffer !== undefined && value instanceof SharedArrayBuffer;
