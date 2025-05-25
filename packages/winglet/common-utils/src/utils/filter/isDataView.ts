/**
 * Function to check if a value is a DataView
 * @param value - Value to check
 * @returns true if the value is a DataView, false otherwise
 */
export const isDataView = (value: unknown): value is DataView =>
  value instanceof DataView;
