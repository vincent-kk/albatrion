/** Independent lifecycle points of one committed input position. */
export enum FieldLifecycle {
  /** A new effect identity commits a real input container. */
  Mount = 1 << 0,
  /** The position's layout effect disconnects, including React replay. */
  Unmount = 1 << 1,
  /** The position commits; reservations do not themselves schedule a render. */
  Render = 1 << 2,
}
