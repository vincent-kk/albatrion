import { isBuffer } from '@winglet/common-utils';

export const detect: (value: unknown) => boolean = isBuffer;
