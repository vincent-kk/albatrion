/**
 * Function to check if a string represents a valid array index
 * Checks if the string consists only of numbers
 * @param value - String to check
 * @returns true if the string is a valid array index, false otherwise
 */
export const isArrayIndex = (value: string): boolean => {
  if (!value) return false;
  let character;
  let index = 0;
  const length = value.length;
  while (index < length) {
    character = value.charCodeAt(index);
    if (character < 48 || character > 57) return false;
    index++;
  }
  return true;
};
