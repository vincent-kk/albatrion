/**
 * Name a thrown value by its form error code, or by its message when it carries none.
 * @param error - The thrown value
 * @returns The code, the message, or the value as text
 */
export const describeThrown = (error: unknown): string => {
  if (error instanceof Error) {
    const code: unknown = Reflect.get(error, 'code');
    return typeof code === 'string' ? code : error.message;
  }
  return String(error);
};
