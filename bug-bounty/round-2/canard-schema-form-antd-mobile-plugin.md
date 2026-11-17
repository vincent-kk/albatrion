# @canard/schema-form-antd-mobile-plugin 버그 바운티 2라운드 결과

2라운드에서 새로 확인된 문제는 3건입니다. 1라운드 문서([`../round-1/canard-schema-form-antd-mobile-plugin.md`](../round-1/canard-schema-form-antd-mobile-plugin.md))의 항목은 고쳐진 것으로 보고 제외했습니다. 1번과 2번은 실패하는 재현 테스트로 확인했고, 메인 세션에서 다시 실행해 같은 실패를 확인했습니다. 3번은 `package.json`을 읽어 확인했습니다.

재현 테스트: [`probes/canard-schema-form-antd-mobile-plugin/`](probes/canard-schema-form-antd-mobile-plugin/)

- 실행하려면 파일을 `packages/canard/schema-form-antd-mobile-plugin/src/__bounty__/r2-ui-plugins/`에 복사한 뒤 `yarn workspace @canard/schema-form-antd-mobile-plugin test --run src/__bounty__/r2-ui-plugins/`를 실행합니다.

## 1. Boolean 체크박스가 `controlled: true`를 선언했지만, 값이 `undefined`가 된 뒤에도 체크된 상태로 보입니다

- 심각도: 중간. 지우거나 초기화한 필드가 체크된 것처럼 보이고, 제어 컴포넌트로 선언했기 때문에 코어가 다시 마운트해 바로잡아 주지도 않습니다.
- 영향받는 공개 API: `FieldInputBooleanDefinition`.
- 어긋난 계약:
  - `.changeset/schema-form-antd-mobile-plugin-controlled-declaration.md`는 이 체크박스가 외부에서 쓴 새 값(`setValue`, `reset`)을 보여 준다고 적고 있습니다.
  - `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/field-input.md:66`은 컴포넌트가 값의 사본을 들고 있지 않을 때만 `controlled`를 선언하라고 적고 있습니다.
- 원인: `packages/canard/schema-form-antd-mobile-plugin/src/fieldInputs/FieldInputBoolean.tsx:22`(33행에서 사용, 46행에서 선언)가 `checked={value ?? undefined}`를 넘깁니다. 값이 `true`에서 `undefined`로 바뀌면 antd-mobile `Checkbox`는 자기 비제어 상태로 전환하면서 `true`를 유지합니다. 입력이 제어 컴포넌트로 선언되어 있으므로 코어는 다시 마운트하지 않습니다. antd5 Boolean은 같은 코드인데도 통과하는데, rc-checkbox는 `checked`가 `undefined`가 되면 스스로 초기화하기 때문입니다.
- 1라운드와의 관계: 1라운드의 "화면이 폼 값과 어긋나는" 종류와 같은 증상이지만, 제어 선언과 "값이 없으면 비제어로 바뀌는" 동작이 겹쳐 생긴다는 점이 새롭습니다. 1라운드 3번 항목(미정 상태 README 불일치)과는 다른 문제입니다.
- 재현: `controlledBooleanUnset.test.tsx`
  - "checkbox clears when the value is written to undefined from outside": 실제 `checked`가 `true`이고, 기대값은 `false`입니다.
  - "checkbox clears after reset to a form without a default": 실제 `true`, 기대 `false`.
  - 같은 파일을 antd5에서 실행하면 통과합니다(대조).
- 확신도: 높음.

## 2. 체크박스 그룹과 범위 슬라이더가 길이가 같은 외부 쓰기를 화면에 반영하지 않습니다

- 심각도: 높음. antd5 2라운드 문서 1번 항목과 같은 버그입니다. 원인은 `@canard/schema-form` 코어에 있으며, 설명은 [`canard-schema-form.md`](canard-schema-form.md)의 3번 항목("길이가 같은 배열 쓰기")에 있습니다.
- 영향받는 입력: `FieldInputStringCheckbox`(체크박스 그룹), `range`를 쓰는 `FieldInputSlider`.
- 재현: `arrayValueInputs.test.tsx`
  - 체크박스 그룹: `setValue({ checks: ['b'] })` 뒤에 체크 상태가 `[true, false, false]`로 남습니다. 기대값은 `[false, true, false]`입니다.
  - 범위 슬라이더: `setValue({ span: [30, 40] })` 뒤에 화면이 `['10', '20']`으로 남습니다. 기대값은 `['30', '40']`입니다.
- 확신도: 높음.

## 3. `antd-mobile`이 peer 없이 dependency로만 선언되어, 호스트의 antd-mobile과 다른 사본이 쓰일 수 있습니다

- 심각도: 낮음. antd5 2라운드 문서 2번 항목과 같은 종류입니다. 호스트가 다른 버전의 antd-mobile을 쓰면 플러그인은 자기 사본을 쓰고, 호스트의 `ConfigProvider`나 테마가 플러그인 입력에 닿지 않습니다.
- 대상: `antd-mobile`은 dependency에만 있고 peer 항목이 없습니다. `dayjs`는 peer `>=1`, dependency `^1.0.0`입니다.
- 원인: `packages/canard/schema-form-antd-mobile-plugin/package.json`.
- 확인 방법: `package.json`을 읽어 확인했습니다. 동작 재현은 antd5에서만 했습니다.
- 확신도: 선언 자체는 높음. 실제 영향은 호스트 구성에 따라 다릅니다.

## 버그가 아니라고 확인한 가설

- `readOnly`인 Stepper는 더하기와 빼기 버튼이 활성화된 채로 남지만, 눌러도 화면과 값이 모두 바뀌지 않습니다. 값 불일치가 아니라 조작 가능해 보이는 겉모습의 문제이므로 버그로 세지 않았습니다.

## 확인하지 못한 가능성

- `readOnly`인 슬라이더는 `disabled`만 받습니다(`FieldInputSlider.tsx`). 1라운드 2번 항목과 같은 모양이지만, jsdom에서는 드래그를 안정적으로 구동할 수 없어 확인하지 못했습니다.
