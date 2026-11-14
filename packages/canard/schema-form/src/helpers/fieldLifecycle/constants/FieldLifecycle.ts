import {
  BIT_FLAG_00,
  BIT_FLAG_01,
  BIT_FLAG_02,
} from '@/schema-form/constants/bitmask';

/** Independent lifecycle points of one committed input position. */
export enum FieldLifecycle {
  /** A new effect identity commits a real input container. */
  Mount = BIT_FLAG_00,
  /** The position's layout effect disconnects, including React replay. */
  Unmount = BIT_FLAG_01,
  /** The position commits; reservations do not themselves schedule a render. */
  Render = BIT_FLAG_02,
}
