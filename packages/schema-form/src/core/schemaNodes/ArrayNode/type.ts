export const enum OperationType {
  Idle = 0,
  Push = 1 << 0,
  Update = 1 << 1,
  Remove = 1 << 2,
  Clear = 1 << 3,
}
