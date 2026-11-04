# 옛 스토리 처분 목록

근거는 TEST-022·023·024·025와 LANDING-090·159이다. 이번 단계는 49개 스토리
파일을 모두 유지하고 addon-vitest로 실행한다. 아래 처분은 07 전환 단계의
인수 목록이며, 이 단계에서 스토리를 삭제하거나 새 엔진 문법으로 바꾸지 않는다.

`시나리오`는 스키마·단계·기대를 순수 데이터 모듈로 옮기고 같은 데이터를 코어,
e2e, 짧은 시나리오 스토리에서 실행한다. `사용법`은 그 데이터 모듈을 재사용하여
새 API 설명을 소수 예제로 합친다. `회귀`는 중복을 합치되 재현 상황을 시나리오로
보존한다. 최종 사용법 스토리에 인라인 스키마를 남기지 않는다.

| 현재 파일 (`stories/` 기준) | 07 처분 | 보존할 책임 |
| --- | --- | --- |
| 01.NormalUsecase.stories.tsx | 사용법 | 기본 Form 구성과 입력 |
| 02.TerminalMode.stories.tsx | 시나리오 | 터미널 전략 |
| 03.FormTypeInput.stories.tsx | 사용법 | 입력 구성 요소 주입 |
| 04.FromChildren.stories.tsx | 사용법 | Form 합성 API |
| 05.WatchValues.stories.tsx | 시나리오 | 값 관찰 |
| 06.IfThenElse.stories.tsx | 시나리오 | 조건부 분기 전환 |
| 07.FormRefHandle.stories.tsx | 사용법 | ref 핸들 호출 |
| 08.VirtualSchema.stories.tsx | 시나리오 | 가상 호스트 이주 |
| 09.NullSchema.stories.tsx | 시나리오 | null 노드 |
| 10.DefaultValue.stories.tsx | 시나리오 | 초기값과 default fill |
| 11.ComputedProps.stories.tsx | 시나리오 | 동적 제어 |
| 12.RenderTest.stories.tsx | 회귀 | 렌더 관찰 |
| 13.FormError.stories.tsx | 시나리오 | 오류 표시 |
| 14.ExternalProvider.stories.tsx | 사용법 | Provider 주입 |
| 15.NodeState.stories.tsx | 시나리오 | 노드 상태 |
| 16.RefSchemaUsecase.stories.tsx | 시나리오 | 참조 스키마 |
| 17.OneOf.stories.tsx | 시나리오 | oneOf 전환 |
| 18.OmitEmptyOptions.stories.tsx | 시나리오 | 빈 값 방출 |
| 19.SubmitUsecase.stories.tsx | 시나리오 | 제출 |
| 20.Reset.stories.tsx | 시나리오 | 재설정 |
| 21.Validation.stories.tsx | 시나리오 | 검증 |
| 21.ValidationExtended.stories.tsx | 시나리오 | 확장 검증 |
| 22.StringUsecase.stories.tsx | 시나리오 | 문자열 입력 |
| 23.JSONSchemaPropsUsecase.stories.tsx | 사용법 | 스키마 속성 전달 |
| 24.ControlledUsecase.stories.tsx | 사용법 | 제어형 Form |
| 25.PreferredInputUsecase.stories.tsx | 사용법 | 입력 선택 우선순위 |
| 26.UploadFileUsecase.stories.tsx | 사용법 | 사용자 파일 입력 |
| 27.OptimizeArrayUsecase.stories.tsx | 시나리오 | 배열 갱신과 identity |
| 28.NullableUsecase.stories.tsx | 시나리오 | nullable 값 |
| 29.NullableArraySyntax.stories.tsx | 시나리오 | nullable 배열 |
| 29.VisibleUsecase.stories.tsx | 시나리오 | 표시 제어 |
| 30.AllOfSchemaUsecase.stories.tsx | 시나리오 | allOf 결합 |
| 31.AnyOf.stories.tsx | 시나리오 | anyOf 결합 |
| 32.DynamicObjectFormType.stories.tsx | 시나리오 | 객체 전략과 동적 입력 |
| 33.FormTypeRendererPropsWithReactNode.stories.tsx | 사용법 | 렌더러 주입 |
| 34.ContextNode.stories.tsx | 사용법 | 문맥과 노드 |
| 35.PrefixItems.stories.tsx | 시나리오 | 튜플 prefixItems |
| 36.DerivedValue.stories.tsx | 시나리오 | 파생 값 |
| 37.Pristine.stories.tsx | 시나리오 | pristine 상태 |
| 38.StateManagement.stories.tsx | 시나리오 | 상태 관리 |
| 39.InjectTo.stories.tsx | 시나리오 | 동적 injectTo |
| 40.Virtualization.stories.tsx | 시나리오 | 지연 렌더링 |
| 41.OmitTrailing.stories.tsx | 시나리오 | 꼬리 값 생략 |
| 42.NullableContract.stories.tsx | 시나리오 | nullable 계약 |
| 43.NullBranchPattern.stories.tsx | 시나리오 | null 분기 |
| 99.BuildTest.stories.tsx | 회귀 | 배포 진입점 렌더 |
| BugReport.01.RerenderRenderer.stories.tsx | 회귀 | 렌더러 재렌더 결함 |
| BugReport.01.RerenderRenderer-build.stories.tsx | 회귀 | 배포 진입점의 같은 결함 |
| FormTypeInput.DefaultFormTypeInput.stories.tsx | 사용법 | 기본 입력 구성 요소 |

스토리 외 보조 파일 5개는 레이아웃과 검증 어댑터이므로 이번 단계에 유지한다.
07에서 살아남는 소비자를 기준으로 정리하며, 중복 스토리 삭제가 시나리오 삭제를
뜻하지 않는다. 현재 `src` 안에는 추가 story/stories 파일이 없다.

## TypeScript DOM 시험 분류

원장 TEST-024가 후보로 적은 9개 `.test.ts` 파일의 원문을 검사했다.
`helpers/virtualization/__tests__/VirtualizationManager.test.ts`만 실제로
`document.createElement`를 호출하므로 `render`에 배정했다. 나머지 8개는
문서라는 단어, 스키마 프로퍼티 이름, 경로 문자열, 주석의 언급이었다.
분리 실행에서 Node 환경의 시험이 모두 통과한 것으로 이 분류를 검증했다.

`render`의 `.test.tsx` 글롭과 위 경로의 `src/**/` 접두는 향후
`src/__legacy__/` 이동 뒤에도 시험을 유지한다. `unit`의 `src` 글롭은 새
blueprint 시험을 자동으로 포함하며 설계 실험인 `architecture/spikes`는
세 제품 프로젝트의 TypeScript 시험 목록에 넣지 않는다.

## 자동화가 찾은 기존 단언 오류

`07.FormRefHandle.stories.tsx`의 ArrayTerminalRef play는 Schema/Value의 중복
텍스트와 외곽/입력 clear 버튼을 구분하지 못했다. 출력 Value 그룹과 외곽 핸들
버튼으로 관찰 범위를 좁혔다. 마지막 `{arr:[]}` 기대도 기존 기본 omitEmpty
규칙과 맞지 않아 출력 `{}`와 실제 입력 prop `[]`를 함께 검증하도록 고쳤다.
공개 Form 구현이나 스키마 옵션은 바꾸지 않았다. 기존 코드·시험 근거와 단계별
실패 로그는 [하니스 보고서](harness-report.md)에 기록했다.
