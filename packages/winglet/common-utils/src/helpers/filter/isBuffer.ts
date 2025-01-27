declare const Buffer:
  | {
      isBuffer: (value: unknown) => boolean;
    }
  | undefined;

export const isBuffer = (value: unknown): value is Buffer =>
  Buffer !== undefined && Buffer.isBuffer(value);
