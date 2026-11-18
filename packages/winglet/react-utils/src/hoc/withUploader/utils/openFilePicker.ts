/**
 * Opens the native file picker without a second click traversing ancestor listeners.
 * @param input - File input owned by the uploader; it is restored before a change event arrives
 * @returns Nothing; preserves the input identity and its original DOM position, including when activation throws
 */
export const openFilePicker = (input: HTMLInputElement): void => {
  const parent = input.parentNode;
  const next = input.nextSibling;
  parent?.removeChild(input);
  try {
    input.click();
  } finally {
    parent?.insertBefore(input, next);
  }
};
