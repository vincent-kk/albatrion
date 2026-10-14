import { describe, expect, it } from 'vitest';

import * as error from '../index';

describe('error index', () => {
  it('공유 진단 원소와 검증 메시지 포맷터만 내보내야 합니다', () => {
    expect(Object.keys(error).sort()).toEqual([
      'createDivider',
      'formatValidationError',
      'getErrorMessage',
    ]);
  });
});
