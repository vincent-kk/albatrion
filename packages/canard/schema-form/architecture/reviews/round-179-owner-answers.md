# 179라운드 — Vincent의 답 (지원 종료(deprecated)로 표시된 타입은 모두 호환되는 최신 타입으로 바꾼다 — fixy07에 직접 준 지시를 소유자가 원장 세션에서 확인)

2026-10-12. fixy07이 소유자의 직접 지시("React의 MutableRefObject는 @deprecated — Use RefObject instead 로 표시되어 있으니 이런 타입은 모두 같은 뜻의 대체 타입을 쓰라")를 전했고, 원장 관리자가 동료 전언은 소유자 승인이 아니므로 확인을 청하자 소유자가 답했다. fixy07의 계획: schema-form src(레거시 제외)에서 deprecated 선언을 쓰는 곳을 TypeScript 컴파일러 API로 전부 찾아 바꾸며, 07b-1 위에 커밋 2와 별도 커밋으로 둔다. 주의: @types/react 19의 RefObject<T>는 current: T(쓰기 가능)라 MutableRefObject<T>와 같지만 @types/react 18의 RefObject<T>는 readonly current: T | null이라 뜻이 다르므로, 공개 d.ts에 나가는 자리는 바꾸기 전에 보고한다.

| 확인 | 물음(요지) | 답 원문 | 반영 |
| --- | --- | --- | --- |
| deprecated 타입 전면 교체 | fixy07이 전한 지시의 확인 | "응 맞아. 지원종료된 타입을 찾아서 모두 호환되는 최신 타입으로. 내가 지시했어" (2026-10-12, 원장 세션) | 확정. (1) schema-form src(src/__legacy__ 제외)에서 deprecated로 표시된 타입 사용을 모두 호환되는 최신 타입으로 바꾼다 — fixy07이 07b-1 위에 커밋 2와 별도의 커밋으로 한다. (2) 조건(원장 관리자): 공개 d.ts에 나가는 자리는 React 18·19 양쪽에서 뜻이 같을 때만 바꾸고 아니면 먼저 보고; 내부 자리는 두 버전에서 typecheck가 통과하는 형을 고름; 형만 바뀌므로 판정 세션은 없고 검증은 d.ts 차분(공개 표면 변화 0 목표)과 전체 시험, JS 출력이 바뀌면 160C-01 정규화 비교. (3) 저장소의 다른 패키지에 같은 지시를 적용할지는 소유자가 따로 정한다. (4) 07b 항목으로 "개선-37 deprecated 타입 교체"를 둔다. |

다음 라운드 번호는 180이다.
