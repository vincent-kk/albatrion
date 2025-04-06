export const isBlob = (value: unknown): value is Blob =>
  Blob !== undefined && value instanceof Blob;
