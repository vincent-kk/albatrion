# @canard/schema-form-antd5-plugin 버그 바운티 2라운드 결과

2라운드에서 새로 확인된 문제는 2건입니다. 1라운드 문서([`../round-1/canard-schema-form-antd5-plugin.md`](../round-1/canard-schema-form-antd5-plugin.md))의 항목은 고쳐진 것으로 보고 제외했습니다. 재현 테스트는 메인 세션에서 다시 실행해 같은 실패를 확인했습니다.

재현 테스트: [`probes/canard-schema-form-antd5-plugin/`](probes/canard-schema-form-antd5-plugin/)

- 실행하려면 파일을 `packages/canard/schema-form-antd5-plugin/src/__bounty__/r2-ui-plugins/`에 복사한 뒤 `yarn workspace @canard/schema-form-antd5-plugin test --run src/__bounty__/r2-ui-plugins/`를 실행합니다.
- `controlledBooleanUnset.test.tsx`는 antd5에서 통과하는 대조 테스트입니다(antd-mobile 2라운드 문서 1번 항목과 비교용).
- `peerRangeHostAntd.test.tsx`는 2번 항목의 재현입니다. `src/__bounty__/r2-release/`에 복사해 같은 방식으로 실행합니다.
- 플러그인 테스트는 `@canard/schema-form`의 `dist` 빌드를 씁니다. 빌드 이후 바뀐 소스는 원인과 무관한 파일뿐임을 확인했습니다.

## 1. 배열 전체를 한 위젯으로 편집하는 입력이, 길이가 같은 외부 쓰기를 화면에 반영하지 않고 다음 사용자 편집에서 외부 값을 덮어씁니다

- 심각도: 높음. 화면과 저장된 값이 어긋나고, 다음 사용자 편집이 낡은 화면 값으로 만들어져 외부에서 쓴 값을 조용히 버립니다.
- 원인 위치: 플러그인은 문서화된 계약대로 `defaultValue`를 읽으므로, 원인은 `@canard/schema-form` 코어에 있습니다. 원인 설명은 [`canard-schema-form.md`](canard-schema-form.md)의 3번 항목("길이가 같은 배열 쓰기")에 있습니다.
- 영향받는 입력:
  - `FieldInputStringCheckbox`(체크박스 그룹).
  - 다중 선택 `FieldInputStringEnum`.
  - `FieldInputDateRange`, `FieldInputMonthRange`, `FieldInputTimeRange`.
- 영향받는 외부 쓰기: `FormHandle.setValue`, 배열 노드의 `setValue`, 항목 노드의 `setValue`, `controls.derived`. 배열 길이가 바뀌는 쓰기와 `reset`은 화면을 올바르게 갱신합니다.
- 1라운드와의 관계: 1라운드의 "제어되지 않는 위젯의 화면이 폼 값과 어긋나는" 종류와 같은 증상이지만, 원인이 플러그인의 `readOnly` 처리가 아니라 코어의 새로고침 누락이라는 점이 새롭습니다.
- 재현:
  - `arrayValueInputs.test.tsx`
    - 체크박스 그룹: 루트 `setValue`와 노드 `setValue` 뒤에 화면이 `"a"`로 남습니다. 기대값은 각각 `"b"`와 `"c"`입니다.
    - 다중 선택: 화면이 `alpha`로 남습니다. 기대값은 `beta`입니다.
    - 날짜 범위: 화면이 `2024-01-10`부터 `2024-01-12`로 남습니다. 기대값은 `2024-03-01`부터 `2024-03-05`입니다.
    - 진단 테스트: 배열 노드가 `UpdateValue`는 받지만 `RequestRefresh`는 받지 않습니다.
  - `derivedAndBranches.test.tsx`의 "derived array of the same length reaches the checkbox group": 체크 상태가 `[true, false]`로 남습니다. 기대값은 `[false, true]`입니다.
  - `externalWrites.test.tsx`의 "every input shows a value written through FormHandle.setValue": 모든 스칼라 입력은 통과하고, `checks`만 `['a']`로 남습니다.
- 확신도: 동작은 높음. 고칠 위치는 중간입니다(schema-form 문서 참고).

## 2. peer 범위가 플러그인 자신의 의존성 범위보다 넓어, peer를 만족하는 호스트의 antd가 아니라 플러그인의 다른 사본이 쓰입니다

- 심각도: 낮음에서 중간. 패키지 관리자가 peer 경고 없이 두 번째 사본을 설치하므로, 호스트의 `ConfigProvider`나 테마가 플러그인 입력에 닿지 않습니다.
- 대상: `antd`는 peer `>=5.10.0`, dependency `^5.10.0`이고, `dayjs`는 peer `>=1`, dependency `^1.0.0`입니다.
- 어긋난 계약: README 34행의 "Ant Design 5 환경" 안내와 `.changeset/antd5-readme-environment.md`는 antd 6까지 허용하는 peer 범위와 모순됩니다.
- 원인: `packages/canard/schema-form-antd5-plugin/package.json`의 `peerDependencies`가 같은 패키지의 `dependencies`보다 넓게 잡혀 있습니다.
- 1라운드와의 관계: 새로운 종류입니다(배포 산출물 검사에서 발견). antd6, MUI, antd-mobile 2라운드 문서에도 같은 모양의 범위 문제가 있습니다.
- 재현(`peerRangeHostAntd.test.tsx`):
  - "every peer range admits only versions the bundled dependency range also accepts": 위 두 불일치를 나열합니다.
  - "a host antd release that satisfies the declared peer range configures the plugin inputs": 이 저장소의 실제 배치(루트에 peer를 만족하는 antd 6.2.2, 플러그인 아래에 자체 antd 5.27.0)에서 호스트 antd 6의 `<ConfigProvider prefixCls>`가 플러그인 입력에 닿지 않습니다(`configured: false`). antd 5의 같은 프로바이더는 닿습니다(대조).
- 확신도: 높음.

## 버그가 아니라고 확인한 가설

- 제어되지 않는 스칼라 입력은 `setValue`, 입력 후 `reset`, `controls.derived`를 따라갑니다. 텍스트, 숫자, 라디오, 단일 Select, 슬라이더, 날짜, URI(프로토콜 선택이 목록의 다른 프로토콜로 바뀌는 경우 포함)를 확인했습니다.
- 문자열 자식을 가진 배열은 `insert(0)` 뒤 `remove(1)`을 해도 각 항목 입력이 자기 값을 유지합니다.
- Boolean 입력(`checked={value ?? undefined}`)은 `setValue(undefined)`와 `reset` 뒤에 올바르게 해제됩니다. rc-checkbox가 `checked`가 `undefined`로 바뀔 때 스스로 초기화하기 때문입니다.
- 배열 입력이 `minItems`에서도 삭제 버튼을 보여 주는 것은 문서화된 기본 동작입니다(`arrays-and-scale.md:10`, `troubleshooting.md:70`).
- 숫자 입력이 입력 중인 값을 로컬에 들고 있는 것(`revision` 키와 `draftRef`)은, 외부 쓰기로 코어가 입력을 다시 마운트할 때 지워지고 blur 복원도 현재 `value`를 읽습니다.
- 렌더러 부품(label, 필수 표시, 오류 루트, 그룹 legend)은 renderer-parts changeset과 일치합니다.
- 참고: jsdom에서 `id`에 `/`가 들어간 antd 입력에 `userEvent.type`이나 `userEvent.click`을 쓰면 nwsapi의 `:focus-visible` 선택자 오류가 납니다. 재현 테스트는 `fireEvent`를 씁니다.
