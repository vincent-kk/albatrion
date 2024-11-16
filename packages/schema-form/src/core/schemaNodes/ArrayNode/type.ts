export const enum OperationType {
  Idle = 0,
  Push = 2 << 0,
  Update = 2 << 1,
  Remove = 2 << 2,
  Clear = 2 << 3,
}
