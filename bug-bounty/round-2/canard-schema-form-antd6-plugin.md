# @canard/schema-form-antd6-plugin 버그 바운티 2라운드 결과

2라운드에서 새로 확인된 문제는 2건입니다. 1라운드 문서([`../round-1/canard-schema-form-antd6-plugin.md`](../round-1/canard-schema-form-antd6-plugin.md))의 항목은 고쳐진 것으로 보고 제외했습니다. 재현 테스트는 메인 세션에서 다시 실행해 같은 실패를 확인했습니다.

재현 테스트: [`probes/canard-schema-form-antd6-plugin/arrayValueInputs.test.tsx`](probes/canard-schema-form-antd6-plugin/arrayValueInputs.test.tsx)

- 실행하려면 파일을 `packages/canard/schema-form-antd6-plugin/src/__bounty__/r2-ui-plugins/`에 복사한 뒤 `yarn workspace @canard/schema-form-antd6-plugin test --run src/__bounty__/r2-ui-plugins/`를 실행합니다.

## 1. 배열 전체를 한 위젯으로 편집하는 입력이, 길이가 같은 외부 쓰기를 화면에 반영하지 않습니다

- 심각도: 높음. antd5 2라운드 문서 1번 항목과 같은 버그입니다. 원인은 `@canard/schema-form` 코어에 있으며, 설명은 [`canard-schema-form.md`](canard-schema-form.md)의 3번 항목("길이가 같은 배열 쓰기")에 있습니다.
- 영향받는 입력: `FieldInputStringCheckbox`(체크박스 그룹), 다중 선택 `FieldInputStringEnum`. 코드 구조상 `FieldInputDateRange`, `FieldInputMonthRange`, `FieldInputTimeRange`도 같은 경로를 탑니다.
- 재현:
  - 체크박스 그룹: 루트 `setValue`와 노드 `setValue` 뒤에 화면이 `"a"`로 남습니다. 기대값은 각각 `"b"`와 `"c"`입니다.
  - 다중 선택: 화면이 `alpha`로 남습니다. 기대값은 `beta`입니다.
  - 진단 테스트: 배열 노드가 `RequestRefresh`를 받지 않습니다.
- 확인하지 못한 부분: 날짜 범위 테스트는 jsdom에 `ResizeObserver`가 없어 외부 쓰기 전 단계에서 실패하므로, antd6의 날짜 범위 입력은 이번에 확인하지 못했습니다. 이 실패는 실행 환경의 한계이며 버그로 세지 않았습니다.
- 확신도: 체크박스 그룹과 다중 선택은 높음.

## 2. peer 범위가 플러그인 자신의 의존성 범위보다 넓습니다

- 심각도: 낮음. antd5 2라운드 문서 2번 항목과 같은 모양입니다. 지금은 antd 7이 없으므로, 실제 문제는 다음 주 버전이 나올 때 생깁니다. 그때 패키지 관리자는 peer 경고 없이 두 번째 사본을 설치하고, 호스트의 `ConfigProvider`나 테마가 플러그인 입력에 닿지 않게 됩니다.
- 대상: `antd`는 peer `>=6.0.0`, dependency `^6.0.0`이고, `dayjs`는 peer `>=1`, dependency `^1.0.0`입니다.
- 원인: `packages/canard/schema-form-antd6-plugin/package.json`의 `peerDependencies`가 `dependencies`보다 넓습니다.
- 확인 방법: `package.json`의 범위를 semver로 비교했습니다. 동작 재현은 antd5에서만 했습니다.
- 확신도: 범위 불일치 자체는 높음.
