// A browser consumer without Node globals type-checks the published declarations.
import { isBuffer } from '@winglet/common-utils';

export const probe: (value: unknown) => boolean = isBuffer;
