import { afterEach, describe, expect, it, vi } from 'vitest';

import { SchemaFormError } from '@/schema-form/errors';

import { warnDevelopmentIssue } from '../warnDevelopmentIssue';

describe('warnDevelopmentIssue', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('개발 환경에서 패키지 프리픽스 + code + message 형식으로 경고를 출력한다', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    warnDevelopmentIssue(
      new SchemaFormError('WARN_SPEC_PREFIX', 'prefix check message'),
    );
    expect(warn).toHaveBeenCalledWith(
      '[@canard/schema-form] SCHEMA_FORM_ERROR.WARN_SPEC_PREFIX\nprefix check message',
    );
  });

  it('details가 있으면 두 번째 인자로 함께 출력한다', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    warnDevelopmentIssue(
      new SchemaFormError('WARN_SPEC_DETAILS', 'details check', {
        keyword: 'if',
      }),
    );
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('details check'),
      {
        keyword: 'if',
      },
    );
  });

  it('동일한 code + message는 세션당 1회만 출력한다', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    warnDevelopmentIssue(new SchemaFormError('WARN_SPEC_DEDUPE', 'same'));
    warnDevelopmentIssue(new SchemaFormError('WARN_SPEC_DEDUPE', 'same'));
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('production 환경에서는 출력하지 않는다', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubEnv('NODE_ENV', 'production');
    warnDevelopmentIssue(new SchemaFormError('WARN_SPEC_PROD', 'silent'));
    expect(warn).not.toHaveBeenCalled();
  });
});
