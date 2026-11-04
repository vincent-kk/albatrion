# 190라운드 — Vincent의 답 (제한된 범위의 `as unknown as`는 허용한다; useTerminalChildren의 EMPTY_CHILDREN 두 줄(선언 뒤 Object.freeze)은 한 줄로 정리한다; reviewer가 처리)

2026-10-13. 소유자가 useTerminalChildren의 `const EMPTY_CHILDREN: ChildNodeComponent[] = []; Object.freeze(EMPTY_CHILDREN);`가 왜 `Object.freeze([]) as unknown as ChildNodeComponent[]` 한 줄이 아닌지 물었고, 원장 관리자가 "Object.freeze([])의 반환 형이 readonly never[]라 공개 형(변경 가능한 배열)을 유지하려면 단언이 필요했고, 150라운드 원칙 3(단언은 이유가 있을 때만)을 지키느라 두 줄로 쓴 것; readonly로 바꾸면 d.ts가 바뀌므로 공개 형을 유지한다면 한 줄 단언이 가장 깔끔하다"고 답하자 소유자가 답했다.

| 확인 | 물음(요지) | 답 원문 | 반영 |
| --- | --- | --- | --- |
| 제한된 `as unknown as` 허용, 한 줄 정리 | 동결 상수의 두 줄 패턴과 단언 규칙 | "이거 말이야. … 이렇게 하지 않은 이유가 있어? 불필요하게 두줄을 쓴거같은데.\n필요하면 제한적인 범위 내에서 unkown 을 써도 돼. 남용하는게 싫은거지 적절하게 쓰는거면 문제없어." / "그래 리뷰어한테 전해줘. 한 줄로 정리하라고." (2026-10-13, 원장 세션) | 확정. (1) 150라운드 원칙 3에 예외를 더한다 — 공개 형이 readonly를 허용하지 않아 동결 상수를 만들 때처럼 제한된 자리의 `as unknown as T`는 허용하며 이유를 한 줄 주석 또는 커밋 메시지로 적는다; `as any`·`as never`로 오류를 덮는 것은 여전히 금지(저장소 규칙). (2) reviewer가 EMPTY_CHILDREN을 `Object.freeze([]) as unknown as ChildNodeComponent[]` 한 줄로 바꾸고, src(레거시 제외)의 같은 "선언 뒤 Object.freeze" 두 줄 패턴을 같은 커밋에서 정리해 건수를 보고한다. |

다음 라운드 번호는 191이다.
