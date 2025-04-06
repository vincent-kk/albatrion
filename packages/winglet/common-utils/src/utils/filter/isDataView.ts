export const isDataView = (value: unknown): value is DataView =>
  value instanceof DataView;
