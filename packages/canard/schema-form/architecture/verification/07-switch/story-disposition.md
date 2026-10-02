# 07 전환 — 옛 스토리 처분표

## 집계와 원칙

워크트리 루트에서 스토리 파일을 다음 명령으로 센다. 줄 수는 `wc -l`과 같은 개행 수이며, 표는 파일 이름순이다.

```sh
suffix=$(printf '.%s.%s' stories tsx)
find packages/canard/schema-form/stories -maxdepth 1 -type f -name "*$suffix" | wc -l
find packages/canard/schema-form/stories -maxdepth 1 -type f -name "*$suffix" -exec wc -l {} +
```

전환 직전 실측은 **49파일, 33,545줄**이다. `architecture/ledger/test.md`의 TEST-025는 설계 시점의 **49파일, 33,533줄**을 기록하므로 실측보다 12줄 적다.

TEST-025와 소유자·편집자 판정에 따라 07에서는 옛 파일을 삭제하지 않고 Storybook 글롭에서 제외한다. 삭제는 09 정리 단계에서 한다(LANDING-205의 마지막까지 보존 원칙). 새 엔진의 시나리오는 `packages/aileron/schema-form-scenarios/src/`의 데이터로 옮기고 `stories/scenarios/`에 다섯 줄 스토리로 연결한다. 사용법만 `stories/usage/`의 소수 문서 스토리로 새 문법에 맞춰 다시 쓴다.

파일 칸은 `packages/canard/schema-form/stories/` 기준이다. 새 자리의 계열 이름은 시나리오 데이터의 책임별 이관 계획이며, 기존 스키마와 단언을 그대로 복사하거나 이미 이관되었다는 뜻이 아니다. 여러 계열에 걸친 파일은 해당 계열마다 사례를 나눈다. 인라인 스키마 예시만 있는 파일은 별도 후속 스토리를 남기지 않는다.

| 파일 | 줄 수 | 다루는 기능 | 처분 | 새 자리 |
| --- | ---: | --- | --- | --- |
| `01.NormalUsecase.stories.tsx` | 226 | 기본 입력, 날짜 형식, enum, readOnly | 글롭에서 뺌(09에서 삭제) | `value`, `controls` |
| `02.TerminalMode.stories.tsx` | 1082 | 배열·객체 터미널 입력, 기본값, nullable 수명 | 글롭에서 뺌(09에서 삭제) | `array`, `fill`, `union` |
| `03.FormTypeInput.stories.tsx` | 929 | FormTypeInput 정의와 경로·정규식·와일드카드 매핑 | 글롭에서 뺌(09에서 삭제) | `stories/usage/form-type-input.stories.tsx` |
| `04.FromChildren.stories.tsx` | 352 | 함수·반복 children, Form 하위 구성 요소 합성 | 글롭에서 뺌(09에서 삭제) | `stories/usage/form-composition.stories.tsx` |
| `05.WatchValues.stories.tsx` | 175 | 값 감시, branch 노드 감시 | 글롭에서 뺌(09에서 삭제) | `derive`, `notify` |
| `06.IfThenElse.stories.tsx` | 713 | if/then/else 조건, const, 추가 속성, 복합 조건 | 글롭에서 뺌(09에서 삭제) | `settle`, `fill`, `exit`, `validation` |
| `07.FormRefHandle.stories.tsx` | 1879 | ref 핸들, 값 읽기·쓰기, 분기·배열 조작 | 글롭에서 뺌(09에서 삭제) | `stories/usage/form-handle.stories.tsx` |
| `08.VirtualSchema.stories.tsx` | 571 | 가상 필드, required, visible·조건부 제어 | 글롭에서 뺌(09에서 삭제) | `derive`, `controls`, `validation` |
| `09.NullSchema.stories.tsx` | 511 | null 입력, nullable enum·숫자·불리언, 기본값 | 글롭에서 뺌(09에서 삭제) | `union`, `fill`, `value` |
| `10.DefaultValue.stories.tsx` | 426 | 스키마·외부 기본값, 부모·자식 기본값, minItems 채움 | 글롭에서 뺌(09에서 삭제) | `fill`, `array` |
| `11.ComputedProps.stories.tsx` | 128 | 계산 속성, 전역 readOnly·disabled | 글롭에서 뺌(09에서 삭제) | `controls` |
| `12.RenderTest.stories.tsx` | 170 | 함수 children, 입력 삽입과 렌더 합성 | 글롭에서 뺌(09에서 삭제) | `stories/usage/form-composition.stories.tsx` |
| `13.FormError.stories.tsx` | 685 | dirty·touched, 검증 모드, 외부 오류, ErrorBoundary | 글롭에서 뺌(09에서 삭제) | `validation`, `controls` |
| `14.ExternalProvider.stories.tsx` | 289 | 외부 Provider, 사용자 context, 설정·AJV 등록 | 글롭에서 뺌(09에서 삭제) | `stories/usage/provider-plugin.stories.tsx` |
| `15.NodeState.stories.tsx` | 234 | 노드 상태 관찰 | 글롭에서 뺌(09에서 삭제) | `controls`, `notify` |
| `16.RefSchemaUsecase.stories.tsx` | 517 | $ref·$defs, 중첩·재귀 스키마, 경로 이스케이프 | 글롭에서 뺌(09에서 삭제) | 없음(인라인 스키마 스토리, TEST-025) |
| `17.OneOf.stories.tsx` | 2276 | oneOf 선택·조건, 분기 값 보존과 기본값 | 글롭에서 뺌(09에서 삭제) | `union`, `fill`, `exit` |
| `18.OmitEmptyOptions.stories.tsx` | 227 | 빈 문자열·enum·배열의 출력 생략 | 글롭에서 뺌(09에서 삭제) | `value`, `array` |
| `19.SubmitUsecase.stories.tsx` | 250 | submit 핸들러, Enter 제출, 제출 검증 모드 | 글롭에서 뺌(09에서 삭제) | `stories/usage/form-handle.stories.tsx` |
| `20.Reset.stories.tsx` | 406 | 스키마·defaultValue 변경과 reset | 글롭에서 뺌(09에서 삭제) | `settle`, `fill` |
| `21.Validation.stories.tsx` | 1559 | 오류 포맷·번역, 하위 오류, nullable 검증 | 글롭에서 뺌(09에서 삭제) | `validation` |
| `21.ValidationExtended.stories.tsx` | 1156 | showError·showErrors 상태, 조건부 오류 표시 | 글롭에서 뺌(09에서 삭제) | `validation`, `controls` |
| `22.StringUsecase.stories.tsx` | 178 | 문자열 입력, 제어·비제어 입력의 blur trim | 글롭에서 뺌(09에서 삭제) | `value`, `controls` |
| `23.JSONSchemaPropsUsecase.stories.tsx` | 194 | 스키마에서 renderer·input props 전달 | 글롭에서 뺌(09에서 삭제) | `stories/usage/form-type-input.stories.tsx` |
| `24.ControlledUsecase.stories.tsx` | 842 | 제어 입력, focus·select, 포맷터 캐럿, textarea | 글롭에서 뺌(09에서 삭제) | `controls`, `value` |
| `25.PreferredInputUsecase.stories.tsx` | 444 | 함수·클래스 입력, FormInput·FormGroup·FormRender 교체 | 글롭에서 뺌(09에서 삭제) | `stories/usage/form-type-input.stories.tsx` |
| `26.UploadFileUsecase.stories.tsx` | 587 | 단일·다중 첨부, 조건·분기·언마운트 파일 정리 | 글롭에서 뺌(09에서 삭제) | `value`, `exit` |
| `27.OptimizeArrayUsecase.stories.tsx` | 266 | 배열 터미널·비터미널, 제어·비제어 입력 | 글롭에서 뺌(09에서 삭제) | `array` |
| `28.NullableUsecase.stories.tsx` | 1510 | nullable 필드·배열·객체, ref 조작, 중첩 조건 | 글롭에서 뺌(09에서 삭제) | `union`, `settle`, `value` |
| `29.NullableArraySyntax.stories.tsx` | 691 | type 배열 nullable 문법, 복합 객체·배열 | 글롭에서 뺌(09에서 삭제) | `union`, `value` |
| `29.VisibleUsecase.stories.tsx` | 503 | visible과 active 차이, 값 보존·제거, 의존성 | 글롭에서 뺌(09에서 삭제) | `controls`, `exit` |
| `30.AllOfSchemaUsecase.stories.tsx` | 843 | allOf 합성, required·기본값·검증·참조 충돌 | 글롭에서 뺌(09에서 삭제) | `settle`, `fill`, `validation` |
| `31.AnyOf.stories.tsx` | 1295 | anyOf 조건·중첩·배열, 기본값과 값 보존 | 글롭에서 뺌(09에서 삭제) | `union`, `fill`, `exit` |
| `32.DynamicObjectFormType.stories.tsx` | 367 | 동적 객체 입력, ChildComponentMap 합성 | 글롭에서 뺌(09에서 삭제) | `stories/usage/form-composition.stories.tsx` |
| `33.FormTypeRendererPropsWithReactNode.stories.tsx` | 443 | renderer 설명 props에 ReactNode 전달 | 글롭에서 뺌(09에서 삭제) | `stories/usage/form-type-input.stories.tsx` |
| `34.ContextNode.stories.tsx` | 558 | context 기반 모드·역할·권한·표시 조건 | 글롭에서 뺌(09에서 삭제) | `controls`, `derive` |
| `35.PrefixItems.stories.tsx` | 1296 | prefixItems 튜플, 열린 items, 기본값·검증·참조 | 글롭에서 뺌(09에서 삭제) | `array`, `fill`, `validation` |
| `36.DerivedValue.stories.tsx` | 3110 | 파생 계산, 참조 경로, 순환·사슬·분기·주입 | 글롭에서 뺌(09에서 삭제) | `derive`, `union`, `settle` |
| `37.Pristine.stories.tsx` | 1175 | pristine 조건, 상태 초기화, 파생·active·분기 결합 | 글롭에서 뺌(09에서 삭제) | `controls`, `derive`, `settle` |
| `38.StateManagement.stories.tsx` | 2044 | 상태 읽기·쓰기·초기화, 하위 트리·배열 상태 | 글롭에서 뺌(09에서 삭제) | `controls`, `notify`, `array` |
| `39.InjectTo.stories.tsx` | 517 | 형제·절대·부모·배열 주입, 다중 대상·순환 | 글롭에서 뺌(09에서 삭제) | `derive`, `notify` |
| `40.Virtualization.stories.tsx` | 348 | 지연 마운트, 스크롤·idle·focus 노출, Placeholder | 글롭에서 뺌(09에서 삭제) | `controls`, `array` |
| `41.OmitTrailing.stories.tsx` | 408 | 배열 끝 생략, 분기·active·주입·reset 결합 | 글롭에서 뺌(09에서 삭제) | `array`, `value`, `union` |
| `42.NullableContract.stories.tsx` | 407 | null branch 빈 폼, 승격·파생·주입·기본값 계약 | 글롭에서 뺌(09에서 삭제) | `union`, `value`, `fill`, `derive` |
| `43.NullBranchPattern.stories.tsx` | 221 | null 분기 순서, anyOf, 불일치·도달 불가·축소 | 글롭에서 뺌(09에서 삭제) | `union`, `validation` |
| `99.BuildTest.stories.tsx` | 247 | 빌드 산출물의 기본·조건부 인라인 스키마 예시 | 글롭에서 뺌(09에서 삭제) | 없음(인라인 스키마 스토리, TEST-025) |
| `BugReport.01.RerenderRenderer-build.stories.tsx` | 53 | 빌드판 label·error·input renderer 재렌더 예시 | 글롭에서 뺌(09에서 삭제) | 없음(인라인 스키마 스토리, TEST-025) |
| `BugReport.01.RerenderRenderer.stories.tsx` | 53 | 소스판 label·error·input renderer 재렌더 예시 | 글롭에서 뺌(09에서 삭제) | 없음(인라인 스키마 스토리, TEST-025) |
| `FormTypeInput.DefaultFormTypeInput.stories.tsx` | 184 | 기본 불리언·문자열·날짜·수·배열·객체 입력 소개 | 글롭에서 뺌(09에서 삭제) | `stories/usage/form-type-input.stories.tsx` |
