import {
  CONSTRUCTOR_KEY,
  PROTOTYPE_ASSESS_KEY,
  PROTOTYPE_KEY,
} from '@/json/JSONPointer/constants/prototypeKey';

export const isForbiddenKey = (key: string): boolean =>
  key === PROTOTYPE_KEY ||
  key === CONSTRUCTOR_KEY ||
  key === PROTOTYPE_ASSESS_KEY;
