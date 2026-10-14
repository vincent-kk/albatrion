# 179라운드 — Vincent의 답 (지원 종료(deprecated)로 표시된 타입은 모두 호환되는 최신 타입으로 바꾼다 — fixy07에 직접 준 지시를 소유자가 원장 세션에서 확인)

2026-10-12. fixy07이 소유자의 직접 지시("React의 MutableRefObject는 @deprecated — Use RefObject instead 로 표시되어 있으니 이런 타입은 모두 같은 뜻의 대체 타입을 쓰라")를 전했고, 원장 관리자가 동료 전언은 소유자 승인이 아니므로 확인을 청하자 소유자가 답했다. fixy07의 계획: schema-form src(레거시 제외)에서 deprecated 선언을 쓰는 곳을 TypeScript 컴파일러 API로 전부 찾아 바꾸며, 07b-1 위에 커밋 2와 별도 커밋으로 둔다. 주의: @types/react 19의 RefObject<T>는 current: T(쓰기 가능)라 MutableRefObject<T>와 같지만 @types/react 18의 RefObject<T>는 readonly current: T | null이라 뜻이 다르므로, 공개 d.ts에 나가는 자리는 바꾸기 전에 보고한다.

| 확인 | 물음(요지) | 답 원문 | 반영 |
| --- | --- | --- | --- |
| deprecated 타입 전면 교체 | fixy07이 전한 지시의 확인 | "응 맞아. 지원종료된 타입을 찾아서 모두 호환되는 최신 타입으로. 내가 지시했어" (2026-10-12, 원장 세션) | 확정. (1) schema-form src(src/__legacy__ 제외)에서 deprecated로 표시된 타입 사용을 모두 호환되는 최신 타입으로 바꾼다 — fixy07이 07b-1 위에 커밋 2와 별도의 커밋으로 한다. (2) 조건(원장 관리자): 공개 d.ts에 나가는 자리는 React 18·19 양쪽에서 뜻이 같을 때만 바꾸고 아니면 먼저 보고; 내부 자리는 두 버전에서 typecheck가 통과하는 형을 고름; 형만 바뀌므로 판정 세션은 없고 검증은 d.ts 차분(공개 표면 변화 0 목표)과 전체 시험, JS 출력이 바뀌면 160C-01 정규화 비교. (3) 저장소의 다른 패키지에 같은 지시를 적용할지는 소유자가 따로 정한다. (4) 07b 항목으로 "개선-37 deprecated 타입 교체"를 둔다. |

다음 라운드 번호는 180이다.

## 덧붙임 (2026-10-13, 개선-37 준비와 편집자 판단)

fixy07이 개선-37을 로컬 커밋 c730441f9(eed7d6149 위)로 준비했다. 바뀐 선언: MutableRefObject → RefObject 4건(RootBindingContext.ts, RootNodeContextProvider.tsx, useChildNodeComponents.tsx, useFormTypeInputControl.ts; @types/react 19에서 둘 다 `current: T`), FormEvent → SyntheticEvent 1건(FormContents.tsx의 native submit 핸들러; FormEvent는 멤버 추가 없는 확장이라 정의가 같고 FormRootProxy의 SubmitEvent<HTMLFormElement> prop에 그대로 맞음). 교체 뒤 TypeScript 컴파일러 API로 src(레거시 제외)·stories·bench를 훑어 deprecated 참조 0건. 검증: 공개 d.ts 차분 0(바뀐 내부 d.ts 4개는 진입점이 내보내지 않음; 진입점 이름 92개 가운데 바뀐 형을 가리키는 것 없음); JS 출력은 esbuild 변환 비교로 넷 동일, 하나(RootBindingContext)는 공백만 다름; Vitest 508파일 3,569건·typecheck·lint 통과; 판정 세션 없음. React 18 형 검사(참고): 패키지에 18로 돌리는 방법이 없어 저장소의 @types/react 18.3.23을 paths로 연결한 임시 tsconfig로 보니 교체 전에도 오류 3건(FormRootProxy의 SubmitEvent 1, SchemaNodeInputWrapper의 RefObject 2 — 이미 19 전용 형을 쓰고 있었음), 교체 뒤 11건(늘어난 8건은 18의 RefObject가 `readonly current: T | null`이라 생기는 쓰기·null 오류). 편집자 판단(원장 관리자): RefObject를 유지한다 — 공개 d.ts가 바뀌지 않으므로 React 18 소비자가 컴파일하는 표면은 같고, 내부 형 검사는 @types/react 19로만 돌며 18 형으로는 교체 전에도 통과하지 않았으므로 "18 내부 형 호환"은 이 커밋이 깬 것이 아니라 원래 없던 것이다; 로컬 구조 형 `{ current: T }`로 되돌리는 것은 deprecated 형을 다시 만드는 셈이라 소유자 지시("호환되는 최신 타입")에 어긋난다. 비차단 발견으로 "패키지 내부 형 검사가 @types/react 19 전용이며 18 형으로는 3건이 원래 실패"를 07b 정리 목록에 적는다. fixy07은 c730441f9를 지금 푸시한다(useTerminalChildren을 건드리지 않으므로 reviewer 커밋과 독립).
