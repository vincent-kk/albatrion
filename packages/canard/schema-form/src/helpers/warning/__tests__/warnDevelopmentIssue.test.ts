import { afterEach, describe, expect, it, vi } from 'vitest';

import { warnDevelopmentIssue } from '../warnDevelopmentIssue';

describe('warnDevelopmentIssue', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('개발 환경에서 패키지 프리픽스 + code + message 형식으로 경고를 출력한다', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    warnDevelopmentIssue({
      code: 'SCHEMA_FORM_WARNING.WARN_SPEC_PREFIX',
      message: 'prefix check message',
    });
    expect(warn.mock.calls[0][0]).toContain(
      '[@canard/schema-form] SCHEMA_FORM_WARNING.WARN_SPEC_PREFIX',
    );
    expect(warn.mock.calls[0][0]).toContain('prefix check message');
  });

  it('details가 있으면 두 번째 인자로 함께 출력한다', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const details = { keyword: 'if' };
    warnDevelopmentIssue({
      code: 'SCHEMA_FORM_WARNING.WARN_SPEC_DETAILS',
      message: 'details check',
      details,
    });
    expect(warn.mock.calls[0][0]).toContain('details check');
    const call = warn.mock.calls[0];
    expect(call[call.length - 1]).toBe(details);
  });

  it('동일한 code + message는 세션당 1회만 출력한다', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const issue = {
      code: 'SCHEMA_FORM_WARNING.WARN_SPEC_DEDUPE',
      message: 'same',
    };
    warnDevelopmentIssue(issue);
    warnDevelopmentIssue(issue);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('production 환경에서는 출력하지 않는다', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubEnv('NODE_ENV', 'production');
    warnDevelopmentIssue({
      code: 'SCHEMA_FORM_WARNING.WARN_SPEC_PROD',
      message: 'silent',
    });
    expect(warn).not.toHaveBeenCalled();
  });
});
