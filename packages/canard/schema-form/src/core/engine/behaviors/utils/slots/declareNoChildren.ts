import { EMPTY_ARRAY } from '@winglet/common-utils/constant';

import type { Behavior } from '../../../record';

/** Declare no children for a terminal node. */
export const declareNoChildren: Behavior['declareChildren'] = () => EMPTY_ARRAY;
