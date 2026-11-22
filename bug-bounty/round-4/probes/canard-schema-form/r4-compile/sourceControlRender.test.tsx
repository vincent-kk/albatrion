import * as commonByName from '@winglet/common-utils/lib';
import * as escapeByName from '@winglet/json/pointer-escape';
import * as keywordByName from '@winglet/json-schema/keyword';
import { describe, expect, it } from 'vitest';

import * as commonFromSource from '../../../../../winglet/common-utils/src/libs/index';
import * as escapeFromSource from '../../../../../winglet/json/src/JSONPointer/utils/escape/index';
import * as keywordFromSource from '../../../../../winglet/json-schema/src/keyword/index';

describe('control: @winglet packages load from source under the probe config', () => {
  it('package-name imports are the same module instances as the src files', () => {
    expect({
      hasOwnProperty: commonByName.hasOwnProperty === commonFromSource.hasOwnProperty,
      escapeSegment: escapeByName.escapeSegment === escapeFromSource.escapeSegment,
      DEFAULT_KEYWORDS: keywordByName.DEFAULT_KEYWORDS === keywordFromSource.DEFAULT_KEYWORDS,
    }).toEqual({ hasOwnProperty: true, escapeSegment: true, DEFAULT_KEYWORDS: true });
  });
});
