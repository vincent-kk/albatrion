import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, it } from 'vitest';

import { PACKAGE_ROOT } from '../../__tests__/roundThree/fixture.js';

const section = (file: string, heading: string) => {
  const text = readFileSync(join(PACKAGE_ROOT, file), 'utf8');
  const start = text.indexOf(heading);
  const end = text.indexOf('\n## ', start + heading.length);
  return text.slice(start, end);
};

it('control: the English invariants describe one run-wide plan for all targets', () => {
  const english = section('README.md', '## Architectural Invariants');
  expect(english).toContain(
    'All targets in one invocation share a run-wide plan',
  );
});

it('the Korean invariants no longer promise one consumer per invocation', () => {
  const korean = section('README-ko_kr.md', '## 아키텍처 불변식');
  expect(korean).toContain('한 실행의 모든 대상은 실행 전체의 계획과 네임스페이스 병합을 공유합니다.');
  expect({
    oneConsumerPerInvocation: korean.includes('호출 1회당 컨슈머 1개'),
  }).toEqual({ oneConsumerPerInvocation: false });
});
