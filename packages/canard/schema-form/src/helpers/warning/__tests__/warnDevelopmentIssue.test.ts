import { afterEach, describe, expect, it, vi } from 'vitest';

import { FormWarningCode } from '@/schema-form/errors';

import { warnDevelopmentIssue } from '../utils/warnDevelopmentIssue';

describe('warnDevelopmentIssue', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('개발 환경에서 패키지 프리픽스 + code + message 형식으로 경고를 출력한다', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    warnDevelopmentIssue({
      code: FormWarningCode.VirtualizationDisabledForForm,
      message: 'prefix check message',
    });
    expect(warn.mock.calls[0][0]).toContain(
      `[@canard/schema-form] ${FormWarningCode.VirtualizationDisabledForForm}`,
    );
    expect(warn.mock.calls[0][0]).toContain('prefix check message');
  });

  it('details가 있으면 두 번째 인자로 함께 출력한다', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const details = { keyword: 'if' };
    warnDevelopmentIssue({
      code: FormWarningCode.VirtualizationDisabledForForm,
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
      code: FormWarningCode.VirtualizationDisabledForForm,
      message: 'same',
    };
    warnDevelopmentIssue(issue);
    warnDevelopmentIssue(issue);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('production 환경에서는 출력하지 않는다', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubEnv('NODE_ENV', 'production');
    vi.resetModules();
    const { warnDevelopmentIssue: freshWarnDevelopmentIssue } = await import(
      '../utils/warnDevelopmentIssue'
    );
    freshWarnDevelopmentIssue({
      code: FormWarningCode.VirtualizationDisabledForForm,
      message: 'silent',
    });
    expect(warn).not.toHaveBeenCalled();
  });
});
