# 07 전환 — 옛 스토리 처분표

## 집계와 원칙

워크트리 루트에서 스토리 파일을 다음 명령으로 센다. 줄 수는 `wc -l`과 같은 개행 수이며, 표는 파일 이름순이다.

```sh
suffix=$(printf '.%s.%s' stories tsx)
find packages/canard/schema-form/stories -maxdepth 1 -type f -name "*$suffix" | wc -l
find packages/canard/schema-form/stories -maxdepth 1 -type f -name "*$suffix" -exec wc -l {} +
```

전환 직전 실측은 **49파일, 33,545줄**이다. `architecture/ledger/test.md`의 TEST-025는 설계 시점의 **49파일, 33,533줄**을 기록하므로 실측보다 12줄 적다.

77C-01은 실행 계획 I21의 보존 해석을 바로잡습니다. U8의 Storybook 글롭·tsconfig 제외는 U9까지의 임시 발판입니다. U9에서 49개 옛 파일과 Storybook 글롭·tsconfig의 임시 제외 항목을 함께 제거했습니다. PR-7 끝에는 옛 평면 스토리가 남지 않습니다.

02의 처분 목록을 파일별로 대조하여 사용법은 네 파일로 통합하고, 시나리오·회귀는 아래 새 이름의 데이터와 스토리로 보존합니다. 옛 인라인 스키마는 삭제하며 새 스토리에 복사하지 않습니다. 02가 회귀로 지정한 빌드·렌더러 사례와 참조 스키마 사례도 새 데이터로 옮깁니다.

파일 칸은 `packages/canard/schema-form/stories/` 기준이다. 새 자리는 실제 생성한 부류별 스토리 파일과 CSF export 이름을 가리킵니다. 각 스토리는 SCN의 공유 데이터를 소비합니다. 여러 계열에 걸친 파일은 해당 계열마다 사례를 나눈다. 인라인 스키마 예시만 있는 파일은 별도 후속 스토리를 남기지 않는다.

| 파일 | 줄 수 | 다루는 기능 | 처분 | 새 자리 |
| --- | ---: | --- | --- | --- |
| `01.NormalUsecase.stories.tsx` | 226 | 기본 입력, 날짜 형식, enum, readOnly | (나) 사용법 → 새 문법으로 통합 | `stories/usage/form-composition.stories.tsx#Composition` |
| `02.TerminalMode.stories.tsx` | 1082 | 배열·객체 터미널 입력, 기본값, nullable 수명 | (가) 시나리오 → 데이터 모듈 + 다섯 줄 스토리 | `stories/scenarios/array.stories.tsx#TerminalMode` (`terminal-mode`) |
| `03.FormTypeInput.stories.tsx` | 929 | FormTypeInput 정의와 경로·정규식·와일드카드 매핑 | (나) 사용법 → 새 문법으로 통합 | `stories/usage/form-type-input.stories.tsx#CustomInput` |
| `04.FromChildren.stories.tsx` | 352 | 함수·반복 children, Form 하위 구성 요소 합성 | (나) 사용법 → 새 문법으로 통합 | `stories/usage/form-composition.stories.tsx#Composition` |
| `05.WatchValues.stories.tsx` | 175 | 값 감시, branch 노드 감시 | (가) 시나리오 → 데이터 모듈 + 다섯 줄 스토리 | `stories/scenarios/derive.stories.tsx#WatchValues` (`watch-values`) |
| `06.IfThenElse.stories.tsx` | 713 | if/then/else 조건, const, 추가 속성, 복합 조건 | (가) 시나리오 → 데이터 모듈 + 다섯 줄 스토리 | `stories/scenarios/settle.stories.tsx#ConditionalBranches` (`conditional-branches`) |
| `07.FormRefHandle.stories.tsx` | 1879 | ref 핸들, 값 읽기·쓰기, 분기·배열 조작 | (나) 사용법 → 새 문법으로 통합 | `stories/usage/form-handle.stories.tsx#Handle` |
| `08.VirtualSchema.stories.tsx` | 571 | 가상 필드, required, visible·조건부 제어 | (가) 시나리오 → 데이터 모듈 + 다섯 줄 스토리 | `stories/scenarios/controls.stories.tsx#VirtualFields` (`virtual-fields`) |
| `09.NullSchema.stories.tsx` | 511 | null 입력, nullable enum·숫자·불리언, 기본값 | (가) 시나리오 → 데이터 모듈 + 다섯 줄 스토리 | `stories/scenarios/union.stories.tsx#NullValues` (`null-values`) |
| `10.DefaultValue.stories.tsx` | 426 | 스키마·외부 기본값, 부모·자식 기본값, minItems 채움 | (가) 시나리오 → 데이터 모듈 + 다섯 줄 스토리 | `stories/scenarios/fill.stories.tsx#DefaultValues` (`default-values`) |
| `11.ComputedProps.stories.tsx` | 128 | 계산 속성, 전역 readOnly·disabled | (가) 시나리오 → 데이터 모듈 + 다섯 줄 스토리 | `stories/scenarios/controls.stories.tsx#ComputedControls` (`computed-controls`) |
| `12.RenderTest.stories.tsx` | 170 | 함수 children, 입력 삽입과 렌더 합성 | (가) 회귀 상황 보존 → 데이터 모듈 + 다섯 줄 스토리 | `stories/scenarios/notify.stories.tsx#RenderObservation` (`render-observation`) |
| `13.FormError.stories.tsx` | 685 | dirty·touched, 검증 모드, 외부 오류, ErrorBoundary | (가) 시나리오 → 데이터 모듈 + 다섯 줄 스토리 | `stories/scenarios/validation.stories.tsx#FormErrors` (`form-errors`) |
| `14.ExternalProvider.stories.tsx` | 289 | 외부 Provider, 사용자 context, 설정·AJV 등록 | (나) 사용법 → 새 문법으로 통합 | `stories/usage/provider-plugin.stories.tsx#Provider` |
| `15.NodeState.stories.tsx` | 234 | 노드 상태 관찰 | (가) 시나리오 → 데이터 모듈 + 다섯 줄 스토리 | `stories/scenarios/controls.stories.tsx#NodeState` (`node-state`) |
| `16.RefSchemaUsecase.stories.tsx` | 517 | $ref·$defs, 중첩·재귀 스키마, 경로 이스케이프 | (가) 시나리오 → 데이터 모듈 + 다섯 줄 스토리 | `stories/scenarios/value.stories.tsx#ReferenceSchema` (`reference-schema`) |
| `17.OneOf.stories.tsx` | 2276 | oneOf 선택·조건, 분기 값 보존과 기본값 | (가) 시나리오 → 데이터 모듈 + 다섯 줄 스토리 | `stories/scenarios/union.stories.tsx#OneOfSwitch` (`one-of-switch`) |
| `18.OmitEmptyOptions.stories.tsx` | 227 | 빈 문자열·enum·배열의 출력 생략 | (가) 시나리오 → 데이터 모듈 + 다섯 줄 스토리 | `stories/scenarios/value.stories.tsx#OmitEmpty` (`omit-empty`) |
| `19.SubmitUsecase.stories.tsx` | 250 | submit 핸들러, Enter 제출, 제출 검증 모드 | (가) 시나리오 → 데이터 모듈 + 다섯 줄 스토리 | `stories/scenarios/validation.stories.tsx#Submit` (`submit`) |
| `20.Reset.stories.tsx` | 406 | 스키마·defaultValue 변경과 reset | (가) 시나리오 → 데이터 모듈 + 다섯 줄 스토리 | `stories/scenarios/settle.stories.tsx#ResetLoad` (`reset-load`) |
| `21.Validation.stories.tsx` | 1559 | 오류 포맷·번역, 하위 오류, nullable 검증 | (가) 시나리오 → 데이터 모듈 + 다섯 줄 스토리 | `stories/scenarios/validation.stories.tsx#Validation` (`validation`) |
| `21.ValidationExtended.stories.tsx` | 1156 | showError·showErrors 상태, 조건부 오류 표시 | (가) 시나리오 → 데이터 모듈 + 다섯 줄 스토리 | `stories/scenarios/validation.stories.tsx#ValidationDisplay` (`validation-display`) |
| `22.StringUsecase.stories.tsx` | 178 | 문자열 입력, 제어·비제어 입력의 blur trim | (가) 시나리오 → 데이터 모듈 + 다섯 줄 스토리 | `stories/scenarios/value.stories.tsx#StringInput` (`string-input`) |
| `23.JSONSchemaPropsUsecase.stories.tsx` | 194 | 스키마에서 renderer·input props 전달 | (나) 사용법 → 새 문법으로 통합 | `stories/usage/form-type-input.stories.tsx#CustomInput` |
| `24.ControlledUsecase.stories.tsx` | 842 | 제어 입력, focus·select, 포맷터 캐럿, textarea | (나) 사용법 → 새 문법으로 통합 | `stories/usage/form-type-input.stories.tsx#CustomInput` |
| `25.PreferredInputUsecase.stories.tsx` | 444 | 함수·클래스 입력, FormInput·FormGroup·FormRender 교체 | (나) 사용법 → 새 문법으로 통합 | `stories/usage/form-type-input.stories.tsx#CustomInput` |
| `26.UploadFileUsecase.stories.tsx` | 587 | 단일·다중 첨부, 조건·분기·언마운트 파일 정리 | (나) 사용법 → 새 문법으로 통합 | `stories/usage/form-type-input.stories.tsx#CustomInput` |
| `27.OptimizeArrayUsecase.stories.tsx` | 266 | 배열 터미널·비터미널, 제어·비제어 입력 | (가) 시나리오 → 데이터 모듈 + 다섯 줄 스토리 | `stories/scenarios/array.stories.tsx#ArrayIdentity` (`array-identity`) |
| `28.NullableUsecase.stories.tsx` | 1510 | nullable 필드·배열·객체, ref 조작, 중첩 조건 | (가) 시나리오 → 데이터 모듈 + 다섯 줄 스토리 | `stories/scenarios/union.stories.tsx#NullableValues` (`nullable-values`) |
| `29.NullableArraySyntax.stories.tsx` | 691 | type 배열 nullable 문법, 복합 객체·배열 | (가) 시나리오 → 데이터 모듈 + 다섯 줄 스토리 | `stories/scenarios/union.stories.tsx#NullableArray` (`nullable-array`) |
| `29.VisibleUsecase.stories.tsx` | 503 | visible과 active 차이, 값 보존·제거, 의존성 | (가) 시나리오 → 데이터 모듈 + 다섯 줄 스토리 | `stories/scenarios/controls.stories.tsx#Visibility` (`visibility`) |
| `30.AllOfSchemaUsecase.stories.tsx` | 843 | allOf 합성, required·기본값·검증·참조 충돌 | (가) 시나리오 → 데이터 모듈 + 다섯 줄 스토리 | `stories/scenarios/settle.stories.tsx#AllOf` (`all-of`) |
| `31.AnyOf.stories.tsx` | 1295 | anyOf 조건·중첩·배열, 기본값과 값 보존 | (가) 시나리오 → 데이터 모듈 + 다섯 줄 스토리 | `stories/scenarios/union.stories.tsx#AnyOf` (`any-of`) |
| `32.DynamicObjectFormType.stories.tsx` | 367 | 동적 객체 입력, ChildComponentMap 합성 | (가) 시나리오 → 데이터 모듈 + 다섯 줄 스토리 | `stories/scenarios/value.stories.tsx#DynamicObject` (`dynamic-object`) |
| `33.FormTypeRendererPropsWithReactNode.stories.tsx` | 443 | renderer 설명 props에 ReactNode 전달 | (나) 사용법 → 새 문법으로 통합 | `stories/usage/form-type-input.stories.tsx#CustomInput` |
| `34.ContextNode.stories.tsx` | 558 | context 기반 모드·역할·권한·표시 조건 | (나) 사용법 → 새 문법으로 통합 | `stories/usage/provider-plugin.stories.tsx#Provider` |
| `35.PrefixItems.stories.tsx` | 1296 | prefixItems 튜플, 열린 items, 기본값·검증·참조 | (가) 시나리오 → 데이터 모듈 + 다섯 줄 스토리 | `stories/scenarios/array.stories.tsx#PrefixItems` (`prefix-items`) |
| `36.DerivedValue.stories.tsx` | 3110 | 파생 계산, 참조 경로, 순환·사슬·분기·주입 | (가) 시나리오 → 데이터 모듈 + 다섯 줄 스토리 | `stories/scenarios/derive.stories.tsx#DerivedValue` (`derived-value`) |
| `37.Pristine.stories.tsx` | 1175 | pristine 조건, 상태 초기화, 파생·active·분기 결합 | (가) 시나리오 → 데이터 모듈 + 다섯 줄 스토리 | `stories/scenarios/controls.stories.tsx#Pristine` (`pristine`) |
| `38.StateManagement.stories.tsx` | 2044 | 상태 읽기·쓰기·초기화, 하위 트리·배열 상태 | (가) 시나리오 → 데이터 모듈 + 다섯 줄 스토리 | `stories/scenarios/controls.stories.tsx#StateManagement` (`state-management`) |
| `39.InjectTo.stories.tsx` | 517 | 형제·절대·부모·배열 주입, 다중 대상·순환 | (가) 시나리오 → 데이터 모듈 + 다섯 줄 스토리 | `stories/scenarios/derive.stories.tsx#InjectTo` (`inject-to`) |
| `40.Virtualization.stories.tsx` | 348 | 지연 마운트, 스크롤·idle·focus 노출, Placeholder | (가) 시나리오 → 데이터 모듈 + 다섯 줄 스토리 | `stories/scenarios/controls.stories.tsx#Virtualization` (`virtualization`) |
| `41.OmitTrailing.stories.tsx` | 408 | 배열 끝 생략, 분기·active·주입·reset 결합 | (가) 시나리오 → 데이터 모듈 + 다섯 줄 스토리 | `stories/scenarios/array.stories.tsx#OmitTrailing` (`omit-trailing`) |
| `42.NullableContract.stories.tsx` | 407 | null branch 빈 폼, 승격·파생·주입·기본값 계약 | (가) 시나리오 → 데이터 모듈 + 다섯 줄 스토리 | `stories/scenarios/union.stories.tsx#NullableContract` (`nullable-contract`) |
| `43.NullBranchPattern.stories.tsx` | 221 | null 분기 순서, anyOf, 불일치·도달 불가·축소 | (가) 시나리오 → 데이터 모듈 + 다섯 줄 스토리 | `stories/scenarios/union.stories.tsx#NullBranch` (`null-branch`) |
| `99.BuildTest.stories.tsx` | 247 | 빌드 산출물의 기본·조건부 인라인 스키마 예시 | (가) 회귀 상황 보존 → 데이터 모듈 + 다섯 줄 스토리 | `stories/scenarios/value.stories.tsx#PackageEntryRender` (`package-entry-render`) |
| `BugReport.01.RerenderRenderer-build.stories.tsx` | 53 | 빌드판 label·error·input renderer 재렌더 예시 | (가) 회귀 상황 보존 → 데이터 모듈 + 다섯 줄 스토리 | `stories/scenarios/notify.stories.tsx#PackageRendererRegression` (`package-renderer-regression`) |
| `BugReport.01.RerenderRenderer.stories.tsx` | 53 | 소스판 label·error·input renderer 재렌더 예시 | (가) 회귀 상황 보존 → 데이터 모듈 + 다섯 줄 스토리 | `stories/scenarios/notify.stories.tsx#RendererRegression` (`renderer-regression`) |
| `FormTypeInput.DefaultFormTypeInput.stories.tsx` | 184 | 기본 불리언·문자열·날짜·수·배열·객체 입력 소개 | (나) 사용법 → 새 문법으로 통합 | `stories/usage/form-type-input.stories.tsx#CustomInput` |

U9에서 옛 평면 스토리 49파일을 삭제하고 임시 제외를 제거했습니다. Storybook은 scenarios와 usage의 명시한 두 글롭만 읽으며, vitest의 storybook 프로젝트는 이 설정으로 헤드리스 Chromium에서 play를 실행합니다.
