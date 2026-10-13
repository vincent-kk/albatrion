# 250라운드 — Vincent의 답 (대기열 35 — production-test의 옛 문법을 지금 새 문법으로 다 바꾼다)

2026-10-14. 249라운드 덧붙임(production-test 두 화면이 지워진 옛 문법 `&if`·`terminal`을 아직 씀)에 소유자가 원장 세션에서 답했다.

| 확인 | 물음(요지) | 답 원문 | 반영 |
| --- | --- | --- | --- |
| 대기열 35 | 옛 문법을 새 문법으로 옮길지, 화면을 지울지 | "새 문법으로 다 바꿔야 하지 않을까?? 아무래도? 지금 바꾸는 중이니까" | 승인: production-test 패키지 전체의 지워진 옛 문법을 새 문법(controls 등)으로 옮긴다; 07b-3의 별도 커밋 |

250C-01(편집자 정리): fixy07이 production-test 전체에서 지워진 문법(`&if`·`&active`·`&visible` 등 `&` 접두 키, `terminal`, `computed`, 스키마 수준 `injectTo`, 최상위 `virtual`, 옛 `watch`)의 사용처를 먼저 목록으로 보고하고, 명세(docs/en/SPECIFICATION.md)의 새 문법으로 옮긴 뒤 화면별 렌더 전후 차이를 보고한다. 07b-3 안의 별도 커밋. 세 번째 파일 묶음(nullable·computed·if-then-else 자산)도 같은 범위.

다음 라운드 번호는 251이다.
