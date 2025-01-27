export const isBlob = (value: unknown): value is Blob => {
  if (Blob === undefined) return false;
  return value instanceof Blob;
};
