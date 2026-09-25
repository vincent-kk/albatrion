# 단일 원장 — 오류와 경고

기준 커밋: `ba398c330`(저장소 `packages/canard/schema-form/architecture`). 이 원장이 인용하는 `path:line`은 모두 이 커밋의 줄 번호다. 정본 우선순위는 `ledger/README.md` §1을 따른다. `adr/0014-error-policy.md`(4판, 채택)가 이 영역의 정본이다. 상태 값의 뜻: **현행**은 지금 유효한 규칙, **대체됨**은 한때 유효했으나 뒤 라운드나 ADR 0014로 바뀐 규칙(옛 문장을 원문 그대로 남긴다), **열림**은 18라운드 안건으로 넘어가 아직 정해지지 않은 것, **분할됨**은 닫은 사람이나 라운드가 서로 다른 규칙이 한 항목에 섞여 있어 문장 경계에서 나눈 것이다(결정 원문은 남기고, 조각은 가리키는 번호에 있다). 항목 형식은 아래 표 뒤의 안내를 따른다.

## 색인

| 번호 | 한 줄 요약 | 상태 | 닫은 사람 |
| --- | --- | --- | --- |
| ERROR-001 | 오류·경고·검증 결과 세 층과 층별 규칙 | 현행 | 편집자 결정(17라운드, ADR 0014 4판 채택), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1; `adr/0014-error-policy.md:32`), 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4; `adr/0014-error-policy.md:34`) |
| ERROR-002 | 오류와 경고를 가르는 물음과 onError 기록의 level 대응 | 현행 | 편집자 결정(17라운드, ADR 0014 4판 채택) |
| ERROR-003 | 오류가 드러나는 자리 — 상황별 규칙 표 | 현행 | 편집자 결정(17라운드, ADR 0014 4판 채택) |
| ERROR-004 | 진입 사슬의 정의와 사슬 안 오류의 처리 순서 | 현행 | 편집자 결정(ADR 0008 원리 도출) |
| ERROR-005 | 오류 묶음 — SchemaFormError와 details.errors | 현행 | 편집자 결정(17라운드, ADR 0014 4판 채택) |
| ERROR-006 | 환경 규칙 — 정착·통지 오류는 모든 환경에서 같게 드러남 | 분할됨(→ ERROR-070, ERROR-071, ERROR-072, ERROR-073, ERROR-074, ERROR-075, ERROR-076) | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 편집자 결정(14라운드 O-5 위임, `reviews/round-14-owner-answers.md:11`), 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:90,92` E10·E12; 오류 메시지를 줄이지 않음과 환경 차이 둘) |
| ERROR-007 | 호출자 없는 진입의 오류 드러냄 자리 | 현행 | 편집자 결정(17라운드, ADR 0014 4판 채택) |
| ERROR-008 | 주인 없는 오류 싱크의 선택 규칙 | 현행 | 17라운드 스웜 수렴(편집자 결정) |
| ERROR-009 | 마운트 정착의 오류 — 원인별 처리 | 분할됨(→ ERROR-077, ERROR-078, ERROR-079, ERROR-080, ERROR-081, ERROR-082, ERROR-083, ERROR-084) | 소유자 답(`reviews/round-14-owner-answers.md:16` O-10), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 17라운드 스웜 수렴(편집자 결정, `08-design-a-to-z.md:371`) |
| ERROR-010 | React에서 보이는 것과 폼 바운더리의 규칙 | 분할됨(→ ERROR-085, ERROR-086, ERROR-087, ERROR-088, ERROR-089, ERROR-090, ERROR-091, ERROR-092, ERROR-093) | 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4, 다시 던지지 않음), 17라운드 스웜 수렴(편집자 결정, `08-design-a-to-z.md:357`·`adr/0014-error-policy.md:160-163`·`reviews/raw-round17-convergence.md:88` E8) |
| ERROR-011 | 관찰자 onError의 정의 | 분할됨(→ ERROR-094, ERROR-095, ERROR-096, ERROR-097, ERROR-098, ERROR-099) | 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4), 17라운드 스웜 수렴(편집자 결정) |
| ERROR-012 | 버린 onError 설계안들과 그 이유 | 현행(부정 결정) | 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md`) |
| ERROR-013 | onError 이름과 자리 계약 | 현행 | 17라운드 스웜 수렴(편집자 결정), 게이트 R17G-1–R17G-11 고침 |
| ERROR-014 | onError가 받는 것 | 현행 | 17라운드 스웜 수렴(편집자 결정) |
| ERROR-015 | onError가 받지 않는 것 | 분할됨(→ ERROR-100, ERROR-101) | 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4의 둘째 답, 첫 항목만), 17라운드 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:15` 반영 칸) |
| ERROR-016 | 같은 제출 거부라도 degraded는 기록되고 검증 실패는 기록되지 않음 | 현행 | 편집자 결정(17라운드, ADR 0014 4판 채택) |
| ERROR-017 | onError 기록의 모양과 칸별 규칙 | 현행 | 17라운드 스웜 수렴(편집자 결정) |
| ERROR-018 | 층과 level의 대응 | 분할됨(→ ERROR-102, ERROR-103, ERROR-104, ERROR-105, ERROR-106, ERROR-107, ERROR-108, ERROR-109) | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-17-owner-answers.md:33` (가)) |
| ERROR-019 | onError 전달 시점 여덟 가지 | 현행 | 17라운드 스웜 수렴(편집자 결정) |
| ERROR-020 | 렌더 중 보증의 범위 | 현행 | 편집자 결정(17라운드, ADR 0014 4판 채택) |
| ERROR-021 | onError의 환경 규칙과 가드 컴파일 실패의 예외 | 현행 | 17라운드 스웜 수렴(편집자 결정) |
| ERROR-022 | 기본 출력과의 관계 — 오류·경고의 기본 드러남 | 현행 | 편집자 결정(17라운드, ADR 0014 4판 채택) |
| ERROR-023 | 중복 막기 — 오류 | 현행 | 17라운드 스웜 수렴(편집자 결정) |
| ERROR-024 | 중복 막기 — 경고 | 현행 | 17라운드 스웜 수렴(편집자 결정) |
| ERROR-025 | 서버에서의 onError 동작 | 현행 | 17라운드 스웜 수렴(편집자 결정) |
| ERROR-026 | StrictMode에서의 onError 동작 | 현행 | 17라운드 스웜 수렴(편집자 결정) |
| ERROR-027 | 바운더리 경로 구현 | 분할됨(→ ERROR-110, ERROR-111, ERROR-112, ERROR-113, ERROR-114, ERROR-115, ERROR-116, ERROR-117, ERROR-118, ERROR-119) | 17라운드 스웜 수렴(편집자 결정, `08-design-a-to-z.md:400`), 소유자 답(`reviews/round-17-owner-answers.md:34` (나), 확장 허용만) |
| ERROR-028 | 핸들러가 던질 때의 규칙 | 현행 | 17라운드 스웜 수렴(편집자 결정) |
| ERROR-029 | 핸들러 안의 쓰기 규칙 | 현행 | 17라운드 스웜 수렴(편집자 결정) |
| ERROR-030 | onError의 비용 규칙 | 현행 | 17라운드 스웜 수렴(편집자 결정) |
| ERROR-031 | 공개 계약과 판 규칙 | 현행 | 편집자 결정(17라운드, ADR 0014 4판 채택) |
| ERROR-032 | 착수 조건과 PR 배치 | 현행 | 편집자 결정(17라운드, ADR 0014 4판 채택) |
| ERROR-033 | controls의 식이 던질 때 — 자리별 값 | 분할됨(→ ERROR-120, ERROR-121, ERROR-122, ERROR-123, ERROR-124, ERROR-125, ERROR-126, ERROR-127) | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 편집자 결정(17라운드, ADR 0014 4판 채택; 자리별 값 표와 나감 비움 미적용은 14라운드 제안 판 `adr/0014-error-policy.md:53-58`(커밋 `d478a8503`)에서 이어짐) |
| ERROR-034 | diagnostics — 정의, 모양, 지속과 제출 거부 | 분할됨(→ ERROR-128, ERROR-129, ERROR-130, ERROR-131, ERROR-132, ERROR-133, ERROR-134, ERROR-135, ERROR-136, ERROR-137, ERROR-138, ERROR-139, ERROR-140, ERROR-141, ERROR-142) | 소유자 답(`reviews/round-14-owner-answers.md:8` O-2), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 편집자 결정(17라운드, `exceededBudget` 다섯 값을 셋으로 줄이고 되먹임·중첩 초과를 `diagnostics`에서 뺌, `adr/0014-error-policy.md:207`·`02-target-overview.md:310`) |
| ERROR-035 | 검증기의 출처와 기본 검증 모드 | 분할됨(→ ERROR-143, ERROR-144, ERROR-145) | 편집자 결정(17라운드, ADR 0014 4판 채택) |
| ERROR-036 | 검증기 없음 — 거부하지 않고 경고로 알림 | 분할됨(→ ERROR-146, ERROR-147, ERROR-148, ERROR-149, ERROR-150, ERROR-151) | 소유자 답(`reviews/round-17-owner-answers.md:14` 통보 3), 소유자 답(`reviews/round-17-owner-answers.md:33` (가)) |
| ERROR-037 | 조건부 스키마와 검증기 없음 | 분할됨(→ ERROR-152, ERROR-153, ERROR-154) | 소유자 답(`adr/0004-validator-plugin-compile-guard.md:54`), 17라운드 스웜 수렴(편집자 결정, `adr/0004-validator-plugin-compile-guard.md:35`) |
| ERROR-038 | 검증 불가 — 전체 스키마 컴파일 실패 | 분할됨(→ ERROR-155, ERROR-156, ERROR-157, ERROR-158) | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:84` E3; 한 로드에 오류 객체 하나, 그 로드에서 다시 예약하지 않음) |
| ERROR-039 | 검증 실행 실패 | 현행 | 17라운드 스웜 수렴(편집자 결정) |
| ERROR-040 | 로드 검증의 자리 | 현행 | 17라운드 스웜 수렴(편집자 결정) |
| ERROR-041 | 가드 — 컴파일 시점과 실패의 처리 | 현행 | 17라운드 스웜 수렴(편집자 결정) |
| ERROR-042 | 검증기 관련 이주 안내 | 현행 | 편집자 결정(17라운드, ADR 0014 4판 채택) |
| ERROR-043 | §7.1 분류표 — 부류·층·언제·누구 잘못·드러남·항목 | 분할됨(→ ERROR-159, ERROR-160, ERROR-161, ERROR-162, ERROR-163) | 편집자 결정(17라운드, ADR 0014 4판 채택), 소유자 답 O-1(`reviews/round-14-owner-answers.md:7`)·O-10(`reviews/round-14-owner-answers.md:16`), 소유자 답 C-20(`reviews/round-10-owner-answers.md:17`)·13라운드 답 4(`reviews/round-13-owner-answers.md:10`), 소유자 답 E-23·E-19(`reviews/round-10-owner-answers.md:38,40`) |
| ERROR-044 | §7.2 코드 목록 — 코드·level·언제·자리·기본 드러남·핸들러 전달·오늘과 새 설계 | 분할됨(→ ERROR-164, ERROR-165) | 편집자 결정(17라운드, ADR 0014 4판 채택), 게이트 R17G-9·R17G-2 |
| ERROR-045 | §8 무엇이 바뀌는가 — 5차 문서·오늘 대 이 ADR 대조표 | 현행(기록) | 편집자 결정(17라운드, ADR 0014 4판 채택), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1; `adr/0014-error-policy.md:307,308,311,313,317,318`), 소유자 답(`reviews/round-14-owner-answers.md:16` O-10; `adr/0014-error-policy.md:310`), 소유자 답(`reviews/round-14-owner-answers.md:8` O-2; `adr/0014-error-policy.md:317`), 소유자 답(`reviews/round-17-owner-answers.md:14` 통보 3; `adr/0014-error-policy.md:312`), 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4; `adr/0014-error-policy.md:314`) |
| ERROR-046 | 이주 항목 문단 | 현행(기록) | 편집자 결정(17라운드, ADR 0014 4판 채택) |
| ERROR-047 | 합의 근거 — 소유자 답의 원문 모음 | 분할됨(→ ERROR-166, ERROR-167, ERROR-168, ERROR-169, ERROR-170) | 소유자 답(`reviews/round-10-owner-answers.md:13`, `reviews/round-14-owner-answers.md:8,10,16`, `reviews/round-17-owner-answers.md:9,14,15,33,34`; 첫째–셋째 글머리), 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md`; 넷째 글머리), 편집자 결정(외부 조사 판정 채택, `adr/0014-error-policy.md:329`; 다섯째 글머리) |
| ERROR-048 | 남은 것 1 — 쓰기 의미론의 세부(C)가 18라운드 안건으로 이관됨 | 열림(→ `reviews/round-18-agenda.md` §3, :42-43) | 편집자 결정(17라운드, 18라운드 안건으로 이관) |
| ERROR-049 | 남은 것 2 — 청사진이 읽는 스키마의 범위(A)가 18라운드 안건으로 이관됨 | 열림(→ `reviews/round-18-agenda.md` §1, :19) | 편집자 결정(17라운드, 18라운드 안건으로 이관) |
| ERROR-050 | 남은 것 3 — trim 쓰기의 부수 효과가 18라운드 안건으로 이관됨 | 열림(→ `reviews/round-18-agenda.md` §3, :45) | 편집자 결정(17라운드, 18라운드 안건으로 이관) |
| ERROR-051 | 남은 것 4 — PR-1·PR-2 뒤 절의 항목이 18라운드 안건으로 이관됨 | 열림(→ `reviews/round-18-agenda.md` §9, :108,110; 같은 `$id` 사본 루트의 중복 등록은 → `reviews/round-18-agenda.md:150` 11-19) | 편집자 결정(17라운드, 18라운드 안건으로 이관) |
| ERROR-052 | 대체됨: 정착 예산 초과는 개발 모드 throw, 프로덕션은 신호만(12라운드 §4) | 대체됨(→ ERROR-070, ERROR-073) | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1) |
| ERROR-053 | 대체됨: Form 속성 `throwOnBudgetExceeded`(가칭) | 대체됨(→ ERROR-072, ERROR-099) | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1) |
| ERROR-054 | 대체됨: 리스너 오류는 `onListenerError`(가칭)로 보고, 없으면 개발 모드 `console.error` | 대체됨(→ ERROR-004, ERROR-014) | 17라운드 스웜 수렴(편집자 결정) |
| ERROR-055 | 대체됨: 노드 공유 충돌은 청사진 경고 + 프로덕션 폼 수준 경고(ADR 0005 §3, 5차) | 대체됨(→ ERROR-078, ERROR-159) | 소유자 답(`reviews/round-14-owner-answers.md:16` O-10), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1) |
| ERROR-056 | 대체됨: `controls` 식 런타임 오류·풀리지 않는 `controls.injectTo` 대상은 개발 모드 경고(14라운드 O-4 가) | 대체됨(→ ERROR-070, ERROR-121, ERROR-123) | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1) |
| ERROR-057 | 대체됨: 검증기 미등록은 조용히 검증을 건너뜀(`enabled = false`) | 대체됨(앞 절 → ERROR-146, ERROR-147; 뒤 절 `if` 조각 없음은 현행 → ERROR-153, ERROR-154) | 소유자 답(`reviews/round-17-owner-answers.md:14` 통보 3) |
| ERROR-058 | 대체됨: 검증기 오류의 옛 처리(컴파일 실패는 노드 `errors`의 `jsonSchemaCompileFailed` + `console.error`, `OnChange` 실행 실패는 미처리 거부) | 대체됨(→ ERROR-155, ERROR-157, ERROR-039) | 편집자 결정(17라운드, ADR 0014 4판 채택) |
| ERROR-059 | 대체됨: `Form`이 자기 바운더리로 마운트 오류를 삼킴(`console.error`뿐) | 대체됨(→ ERROR-088, ERROR-089, ERROR-111) | 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4), 17라운드 스웜 수렴(편집자 결정, `08-design-a-to-z.md:400`) |
| ERROR-060 | 대체됨: `onError` 없음 — 경고는 개발 모드 콘솔뿐이며 프로덕션에서도 검출·서식을 돌린 뒤 버림 | 대체됨(→ ERROR-094, ERROR-030) | 17라운드 스웜 수렴(편집자 결정) |
| ERROR-061 | 대체됨: 오류 둘 이상의 묶음 없음 | 대체됨(→ ERROR-005) | 편집자 결정(17라운드, ADR 0014 4판 채택) |
| ERROR-062 | 대체됨: `diagnostics.status`는 `'stable'` 또는 `'budgetExceeded'`, 이번 정착만, `exceededBudget` 다섯 값 | 대체됨(→ ERROR-130, ERROR-132, ERROR-135) | 소유자 답(`reviews/round-14-owner-answers.md:8` O-2), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 편집자 결정(17라운드, `exceededBudget` 다섯 값을 셋으로 줄임) |
| ERROR-063 | 대체됨: 오류·경고 코드는 공개 계약이 아님 | 대체됨(→ ERROR-031) | 편집자 결정(17라운드, ADR 0014 4판 채택) |
| ERROR-064 | 대체됨: 가드 컴파일은 늦춘다(ADR 0004) | 대체됨(개발 모드 부분 → ERROR-041; 프로덕션의 늦은 컴파일은 현행 → ERROR-041) | 편집자 결정(17라운드, ADR 0014 4판 채택) |
| ERROR-065 | 오류·경고 분류의 유래(12라운드)와 이름 충돌 정리 | 현행 | 편집자 결정(12라운드 도출, 17라운드 확정 반영) |
| ERROR-066 | 원장의 ADR 0014 4판 요지 재록 | 분할됨(→ ERROR-171, ERROR-172, ERROR-173, ERROR-174, ERROR-175, ERROR-176, ERROR-177, ERROR-178) | 편집자 결정(17라운드, ADR 0014 4판 채택) |
| ERROR-067 | 재생성 reset의 개발 모드 경고 — 코드 없음 | 열림(→ `reviews/round-18-agenda.md` §3, :49) | 편집자 결정(18라운드 안건 이관) |
| ERROR-068 | 배열 전용 명령을 비배열 노드에서 부른 호출자 오류 — 코드 없음 | 열림(→ `reviews/round-18-agenda.md` §3, :50) | 편집자 결정(18라운드 안건 이관) |
| ERROR-069 | 남은 것 5 — `INVALID_VIRTUAL_NODE_VALUES`의 분류가 18라운드 안건으로 이관됨 | 열림(→ `reviews/round-18-agenda.md` §3, :48) | 편집자 결정(18라운드 안건 이관) |
| ERROR-070 | 정착 오류와 공유 충돌은 모든 환경에서 커밋·통지 뒤 사슬 끝에서 던진다 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-14-owner-answers.md:16` O-10; 공유 충돌) |
| ERROR-071 | 청사진·호출자·되먹임·리스너·검증기 오류도 모든 환경에서 같게 드러난다 | 현행 | 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:82,89,93` E-frame·E9·E13, 14라운드 O-5 위임 `reviews/round-14-owner-answers.md:11`), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1; 되먹임·중첩 초과, 검증 불가) |
| ERROR-072 | 끄는 스위치는 없다(`throwOnBudgetExceeded` 없음) | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1) |
| ERROR-073 | 12라운드 §4·10라운드 B-1·14라운드 O-4 가는 R17-1로 대체되었다 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1) |
| ERROR-074 | 환경에 따라 다른 것은 둘뿐이다 | 현행 | 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:90,92` E10·E12) |
| ERROR-075 | 환경 차이 둘 — 경고의 기본 출력과 가드 컴파일 실패를 알리는 시점 | 현행 | 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:90,92` E10·E12) |
| ERROR-076 | 오류 메시지는 어느 환경에서도 줄이지 않는다 | 현행 | 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:90` E10) |
| ERROR-077 | 마운트 정착의 오류는 렌더 중에 던지지 않고 트리를 만드는 자리에서 잡는다 | 현행 | 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:87` E6) |
| ERROR-078 | 마운트의 공유 충돌 — 모든 환경에서 폼이 서지 않는다 | 현행 | 소유자 답(`reviews/round-14-owner-answers.md:16` O-10) |
| ERROR-079 | 마운트의 공유 충돌 — 대체 화면을 그리고 커밋 뒤 `onError`와 싱크로 드러낸다 | 현행 | 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:87` E6) |
| ERROR-080 | 마운트의 예산 초과·식·가드 실패·동적 대상 없음 — 폼이 선다 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1) |
| ERROR-081 | 폼이 서는 원인 — 원인별 값으로 정착을 마치고 `degraded`로 시작한다 | 현행 | 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:87` E6) |
| ERROR-082 | 폼이 서는 원인 — 오류는 커밋 뒤 준비 이펙트에서 드러낸다 | 현행 | 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:87` E6) |
| ERROR-083 | 폼이 서는 원인에서는 마운트에서도 커밋한 값을 잃지 않는다 | 현행 | 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:87` E6) |
| ERROR-084 | 서버 사이드 렌더링·하이드레이션·reset 재생성의 첫 로드에서의 마운트 정착 오류 | 현행 | 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:87` E6) |
| ERROR-085 | React에서 보이는 것(머리말) | 현행 | 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:88` E8) |
| ERROR-086 | 이벤트 핸들러 안에서 던져진 예외는 에러 바운더리를 발화시키지 않는다 | 현행 | 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:88` E8) |
| ERROR-087 | 화면은 직전 커밋 상태로 남고 전역 오류로 잡힌다 | 현행 | 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:88` E8) |
| ERROR-088 | 폼의 바운더리는 다시 던지지 않고 삼키지도 않는다 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4) |
| ERROR-089 | 바운더리는 가두어 대체 화면을 그리고 `componentDidCatch`에서 `onError`와 싱크로 넘긴다 | 현행 | 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:88` E8) |
| ERROR-090 | 필드 바운더리가 감싸는 자리 | 현행 | 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:88` E8) |
| ERROR-091 | 오류 부류 판별에 기대지 않고 중첩 폼의 청사진 오류는 안쪽에서 멈춘다 | 현행 | 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:88` E8) |
| ERROR-092 | 공개 동작(대체 화면)은 바뀌지 않는다 | 현행 | 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:88` E8) |
| ERROR-093 | 바운더리와 핸들러 예외 규칙의 귀속 문장 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4; 앞 절), 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:57`; 핸들러 예외) |
| ERROR-094 | `onError(record)`는 검증 결과를 뺀 오류와 경고를 받는 관찰자다 | 현행 | 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:15` 반영 칸) |
| ERROR-095 | 관찰자 채널의 소유자 발언 — 검증 오류가 걸러진 로깅 채널 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4) |
| ERROR-096 | 핸들러는 흐름을 바꾸지 못한다 | 현행 | 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:15` 반영 칸) |
| ERROR-097 | 반환값은 무시되고 어떤 기본 드러남도 대신하거나 끄지 못한다 | 현행 | 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:15` 반영 칸) |
| ERROR-098 | 핸들러가 없으면 비용도 없다 | 현행 | 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:15` 반영 칸) |
| ERROR-099 | `onListenerError`는 `onError`에 흡수된다 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1; 앞 절), 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:93` E13; 뒤 절) |
| ERROR-100 | `onError`가 받지 않는 것 — 검증 결과를 뺀 나머지 목록 | 현행(부정 결정) | 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:15` 반영 칸) |
| ERROR-101 | `onError`가 받지 않는 것 — 검증 결과 전부 | 현행(부정 결정) | 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4) |
| ERROR-102 | 층과 level(머리말) | 현행 | 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:47`) |
| ERROR-103 | `level`이 `'error'`이면 오류 층이다 | 현행 | 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:47`) |
| ERROR-104 | 오류 층 — 약속이 깨진 사건, 기본 드러남은 셋 가운데 하나 | 현행 | 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:47`) |
| ERROR-105 | `level`이 `'warning'`이면 경고 층이다 | 현행 | 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:47`) |
| ERROR-106 | 경고 층 — 동작을 바꾸지 않는 사건, 기본 드러남은 개발 모드 콘솔 | 현행 | 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:47`) |
| ERROR-107 | 예산 초과·식·가드 실패·동적 대상 없음·되먹임·중첩 초과는 `'error'` | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1) |
| ERROR-108 | 검증기 없음은 `'warning'` | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:33` (가)) |
| ERROR-109 | 가르는 물음은 §1대로다 | 현행 | 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:47`) |
| ERROR-110 | 바운더리 경로(머리말) | 현행 | 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:56`) |
| ERROR-111 | 범용 `withErrorBoundaryForwardRef`를 schema-form의 바깥 감싸개로 바꾼다 | 현행 | 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:56`) |
| ERROR-112 | 바깥 감싸개가 인스턴스 보고기를 들고 루트 바운더리를 둔다 | 현행 | 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:56`) |
| ERROR-113 | 보고기는 대체 화면으로 바뀐 뒤에도 살아 있다 | 현행 | 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:56`) |
| ERROR-114 | 필드 바운더리는 감싸기를 두고 렌더 때 문맥에서 보고기를 읽는다 | 현행 | 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:56`) |
| ERROR-115 | `@winglet/react-utils` 감싸개에 렌더 때 보고 함수를 얻는 선택 인자를 더한다 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:34` (나)), 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:56`) |
| ERROR-116 | 선택 인자를 주지 않으면 오늘 동작이고 판은 minor다 | 현행 | 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:56`) |
| ERROR-117 | 선택 인자의 모양은 PR-7에서 고른다 | 현행 | 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:56`) |
| ERROR-118 | `@winglet/react-utils`의 'Ask first' 두 항목 확장을 소유자가 허용했다 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:34` (나)) |
| ERROR-119 | PR-7에서 그 모듈의 `DETAIL.md`를 먼저 갱신한 뒤 코드를 고친다 | 현행 | 편집자 결정(17라운드, `reviews/round-17-owner-answers.md:34` 반영 칸) |
| ERROR-120 | 식은 네 자리에서 평가된다 | 현행 | 편집자 결정(17라운드, `adr/0014-error-policy.md:188`) |
| ERROR-121 | 식이 던지면 자리별 값으로 정착을 마치고 모든 환경에서 사슬 끝에서 throw한다 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1) |
| ERROR-122 | 식이 던질 때의 자리별 값 표 | 현행 | 편집자 결정(17라운드, `adr/0014-error-policy.md:188`) |
| ERROR-123 | 정적 `controls.injectTo` 대상이 청사진에 없거나 터미널 아래면 청사진 오류다 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1) |
| ERROR-124 | 형상에 없는 노드를 가리키는 것은 오류가 아니다 | 현행 | 편집자 결정(17라운드, `adr/0014-error-policy.md:197`) |
| ERROR-125 | 식·가드가 던져 거짓이 된 게이트로 나간 노드에는 나감 비움을 적용하지 않는다 | 현행 | 편집자 결정(17라운드, `adr/0014-error-policy.md:197`) |
| ERROR-126 | 식이나 가드가 던지면 그 커밋은 `degraded`다 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1) |
| ERROR-127 | 가드 실패와 동적 대상 없음의 가칭 코드 | 현행 | 편집자 결정(17라운드, `adr/0014-error-policy.md:197`) |
| ERROR-128 | `diagnostics`는 작업의 기록이다 | 현행 | 편집자 결정(17라운드, `adr/0014-error-policy.md:201`) |
| ERROR-129 | `diagnostics`는 로드에서 초기화한다 | 현행 | 소유자 답(`reviews/round-14-owner-answers.md:8` O-2) |
| ERROR-130 | `diagnostics`의 모양(앞 조각) | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1; `status` 두 값·`cause`·`commit`), 소유자 답(`reviews/round-14-owner-answers.md:8` O-2; `commit`), 편집자 결정(17라운드, `adr/0014-error-policy.md:201`) |
| ERROR-131 | `diagnostics`의 모양(뒤 조각) — 모든 칸은 `commit` 번호의 커밋을 기술한다 | 현행 | 편집자 결정(17라운드, `adr/0014-error-policy.md:201`) |
| ERROR-132 | 작성자의 선언이 빠진 커밋 넷 가운데 하나라도 있으면 `status = 'degraded'` | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1) |
| ERROR-133 | `cause`의 네 값 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1; 원인 넷), 편집자 결정(17라운드, `adr/0014-error-policy.md:201`; 값 이름) |
| ERROR-134 | 마운트 정착에서 난 것이면 `degraded`로 시작한다 | 현행 | 편집자 결정(17라운드, `adr/0014-error-policy.md:201`) |
| ERROR-135 | `diagnostics`는 다음 로드까지 남는다(머리말) | 현행 | 소유자 답(`reviews/round-14-owner-answers.md:8` O-2) |
| ERROR-136 | 지속은 14라운드 답 O-2 가다 | 현행 | 소유자 답(`reviews/round-14-owner-answers.md:8` O-2) |
| ERROR-137 | 원인 넷과 그 동안의 제출 거부는 R17-1 나다 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1) |
| ERROR-138 | `degraded` 동안 제출 경로는 `SchemaFormError`로 거부한다 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1) |
| ERROR-139 | 제출 거부가 드러나는 길 — 프로미스 거부, 네이티브 submit은 `onError` 뒤 싱크 | 현행 | 편집자 결정(17라운드, `adr/0014-error-policy.md:203`) |
| ERROR-140 | 제출 거부는 렌더 계층의 일이다 | 현행 | 편집자 결정(17라운드, `adr/0014-error-policy.md:203`) |
| ERROR-141 | `getValue()`는 막지 않는다 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1) |
| ERROR-142 | 제출이 막힐 때 호스트가 그릴 자리, 되먹임·중첩 초과는 `diagnostics`에 남기지 않음 | 현행 | 편집자 결정(17라운드, `adr/0014-error-policy.md:205-207`) |
| ERROR-143 | 검증기는 플러그인 또는 Form 속성 `validatorFactory`에서 온다 | 현행 | 소유자 답(`reviews/round-14-owner-answers.md:13` O-7) |
| ERROR-144 | 검증기가 어느 쪽에서 오든 청사진 오류가 아니며 폼은 선다 | 현행 | 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:84` E3) |
| ERROR-145 | 기본 검증 모드는 그대로 두고 암묵 기본값은 두지 않는다 | 현행 | 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:84` E3) |
| ERROR-146 | 검증기 없음 — 거부하지 않고 검증 없이 진행한다 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:14` 통보 3) |
| ERROR-147 | 검증기 없음 — 개발 모드 콘솔과 `onError` 경고 기록으로 알린다 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:33` (가)) |
| ERROR-148 | 검증기 없음 알림은 트리마다 한 번이다 | 현행 | 게이트 고침(R17G-2, `reviews/raw-round17-onerror.md:150`) |
| ERROR-149 | 검증기 없음 알림의 전달 시점 | 현행 | 게이트 고침(R17G-2, `reviews/raw-round17-onerror.md:150`) |
| ERROR-150 | 검증기 없음 알림은 프로덕션에 기본 출력이 없다 | 현행 | 편집자 결정(17라운드, `reviews/round-17-owner-answers.md:14` 반영 칸) |
| ERROR-151 | 검증 모드를 `None`으로 적으면 알림이 없다 | 현행 | 편집자 결정(17라운드, `adr/0014-error-policy.md:213`) |
| ERROR-152 | 조건부 스키마(머리말) | 현행 | 소유자 답(`adr/0004-validator-plugin-compile-guard.md:54`), 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:85` E4) |
| ERROR-153 | ADR 0004의 합의("조건부 비활성 + 경고")를 유지한다 | 현행 | 소유자 답(`adr/0004-validator-plugin-compile-guard.md:54`), 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:85` E4) |
| ERROR-154 | 검증기가 없으면 `if` 조각은 꺼지고 경고를 트리마다 한 번 낸다 | 현행 | 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:85` E4), 게이트 고침(R17G-2, `reviews/raw-round17-onerror.md:150`; 트리마다 한 번) |
| ERROR-155 | 검증 불가 — 한 로드에 오류 객체 하나로 모든 환경에서 거부한다 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:84` E3; 한 로드에 오류 객체 하나, `onError`·싱크 한 번) |
| ERROR-156 | 검증 불가 — 그 로드에서 `OnChange` 검증을 다시 예약하지 않는다 | 현행 | 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:84` E3) |
| ERROR-157 | 검증 불가는 노드 `errors`에 넣지 않는다 | 현행 | 편집자 결정(17라운드, `adr/0014-error-policy.md:215`) |
| ERROR-158 | 통보3의 근거는 검증기를 준 경우에 닿지 않는다 | 현행 | 편집자 결정(17라운드, `adr/0014-error-policy.md:215`) |
| ERROR-159 | §7.1 분류표 — 표 | 현행 | 편집자 결정(17라운드, ADR 0014 4판 채택), 소유자 답 O-1(`reviews/round-14-owner-answers.md:7`)·O-10(`reviews/round-14-owner-answers.md:16`), 소유자 답 C-20(`reviews/round-10-owner-answers.md:17`)·13라운드 답 4(`reviews/round-13-owner-answers.md:10`), 소유자 답 E-23·E-19(`reviews/round-10-owner-answers.md:38,40`), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1; `adr/0014-error-policy.md:229,231,234,237,239`), 소유자 답(`reviews/round-12-owner-answers.md:14` 6 `else: false` 경고; `adr/0014-error-policy.md:230`), 소유자 답(`reviews/round-17-owner-answers.md:14` 통보 3, `reviews/round-17-owner-answers.md:33` (가); `adr/0014-error-policy.md:238`), 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4; `adr/0014-error-policy.md:240,242`), 게이트 고침(R17G-2, `reviews/raw-round17-onerror.md:150`; `adr/0014-error-policy.md:238`) |
| ERROR-160 | 범위 밖 — 렌더 중 쓰기는 core가 감지하지 않는다 | 현행 | 원리(`03-mental-model.md:17` P5) |
| ERROR-161 | 범위 밖 — 판별 키가 호스트 `properties`에 없는 것은 오류가 아니다 | 현행 | 소유자 답(`reviews/round-14-owner-answers.md:7` O-1) |
| ERROR-162 | 범위 밖 — `NULLABLE_ONE_OF_NULL_UNREACHABLE` 폐기, 가상화 꺼짐 경고의 이동 | 현행 | 편집자 결정(17라운드, `adr/0014-error-policy.md:244`) |
| ERROR-163 | 범위 밖 — 필드 바운더리는 그대로, 렌더 오류가 `onError`에 가는 것만 새롭다 | 현행 | 편집자 결정(17라운드, `adr/0014-error-policy.md:244`) |
| ERROR-164 | §7.2 코드 목록 — 머리 문단과 정해진 행 | 현행 | 편집자 결정(17라운드, ADR 0014 4판 채택), 게이트 고침(R17G-9·R17G-2), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1; `adr/0014-error-policy.md:263,266,267-271,279,281`), 소유자 답(`reviews/round-14-owner-answers.md:7` O-1; `adr/0014-error-policy.md:260`), 소유자 답(`reviews/round-14-owner-answers.md:16` O-10; `adr/0014-error-policy.md:261,266`), 소유자 답(`reviews/round-12-owner-answers.md:14` 6 `else: false` 경고; `adr/0014-error-policy.md:290`), 소유자 답(`reviews/round-17-owner-answers.md:14` 통보 3; `adr/0014-error-policy.md:281,293`), 소유자 답(`reviews/round-17-owner-answers.md:33` (가); `adr/0014-error-policy.md:293`), 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4; `adr/0014-error-policy.md:296`), 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3; `adr/0014-error-policy.md:295`) |
| ERROR-165 | §7.2 코드 목록 — (미정) 행 | 열림(→ `reviews/round-18-agenda.md:19,42-43,108,110`; 같은 `$id` 사본 루트의 중복 등록은 → `reviews/round-18-agenda.md:150` 11-19) | 편집자 결정(17라운드, `adr/0014-error-policy.md:301`) |
| ERROR-166 | 합의 근거 — 10라운드 B-1 | 현행(기록) | 소유자 답(`reviews/round-10-owner-answers.md:13` B-1) |
| ERROR-167 | 합의 근거 — 14라운드 O-4·O-10·O-2 | 현행(기록) | 소유자 답(`reviews/round-14-owner-answers.md:10` O-4, `reviews/round-14-owner-answers.md:16` O-10, `reviews/round-14-owner-answers.md:8` O-2) |
| ERROR-168 | 합의 근거 — 17라운드 R17-1·통보3·통보4·(가)·(나) | 현행(기록) | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1, `reviews/round-17-owner-answers.md:14` 통보 3, `reviews/round-17-owner-answers.md:15` 통보 4, `reviews/round-17-owner-answers.md:33` (가), `reviews/round-17-owner-answers.md:34` (나)) |
| ERROR-169 | 합의 근거 — 17라운드 4번 수렴이 안 B를 택함 | 현행(기록) | 스웜 수렴(편집자 결정, `adr/0014-error-policy.md:328`) |
| ERROR-170 | 합의 근거 — 외부 조사 최종 판정과 사슬 끝 throw | 현행(기록) | 편집자 결정(17라운드, `adr/0014-error-policy.md:329`) |
| ERROR-171 | 03의 재록 — ADR 0014 4판이 표를 세 층으로 다시 썼고 다르면 ADR 0014가 이긴다 | 현행 | 편집자 결정(17라운드, `03-mental-model.md:180`) |
| ERROR-172 | 03의 재록 — 정착 오류는 모든 환경에서 던지고 `degraded` 동안 제출을 거부한다 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1) |
| ERROR-173 | 03의 재록 — 끄는 스위치는 없다 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1) |
| ERROR-174 | 03의 재록 — `onError(record)`는 관찰자다 | 현행 | 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:15` 반영 칸) |
| ERROR-175 | 03의 재록 — 핸들러는 흐름을 바꾸지 못하고 없으면 비용이 없다 | 현행 | 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:15` 반영 칸) |
| ERROR-176 | 03의 재록 — 경고의 "프로덕션은 기본 출력 없음"은 기본 출력에만 해당한다 | 현행 | 편집자 결정(17라운드, `03-mental-model.md:180`) |
| ERROR-177 | 03의 재록 — `onListenerError`는 두지 않는다 | 현행 | 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:93` E13) |
| ERROR-178 | 03의 재록 — 바운더리는 렌더 오류를 다시 던지지 않는다 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4) |
| ERROR-179 | 대체됨: 관측 채널의 최소 — `onChange` payload 탈락, 루트 `settle` 칸 읽기와 그 변화 이벤트 구독(6라운드 D-22) | 대체됨(→ ERROR-128, ERROR-094) | 편집자 결정(17라운드, `adr/0014-error-policy.md:201`) |
| ERROR-180 | Q12 검증 에러의 라우팅 — 18라운드 안건(PR-4)으로 이관됨 | 열림(→ `reviews/round-18-agenda.md:108`) | 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:108`) |
| ERROR-181 | 변환하지 못한 입력의 변환 오류는 `onError`로 전달한다(18라운드 S1) | 분할됨(→ ERROR-183, ERROR-184) | 소유자 답(`reviews/round-18-owner-answers.md:9` S1 셋째) |
| ERROR-182 | 변환 실패 기록은 `level: 'warning'`, 가칭 `SCHEMA_FORM_WARNING.VALUE_TYPE_MISMATCH`, 검증기 유무와 무관 | 분할됨(→ ERROR-186, ERROR-187) | 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:9` 반영 칸) |
| ERROR-183 | S1 셋째 답의 나′ 확정과 경고등 승인 — 정본은 WRITE-054 | 중복(→ WRITE-054) | 소유자 답(`reviews/round-18-owner-answers.md:9` S1 셋째) |
| ERROR-184 | 변환에러는 `onError`로 전달한다(18라운드 S1 셋째) | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:9` S1 셋째) |
| ERROR-185 | 터미널 노드의 입력이 빈 `ChildNodeComponents`를 읽을 때의 개발 모드 경고 — 코드 없음 | 열림(→ `reviews/round-18-agenda.md:137` 11-6) | 원리(`00-goals.md:105` C2 작성자 실수의 가시성, 소유자 채택 `reviews/round-2.md:112`), 편집자 결정(ADR 0011 4차 본문, `adr/0011-branch-node-composition.md:12`) |
| ERROR-186 | 변환 실패 기록은 `level: 'warning'`, 가칭 `SCHEMA_FORM_WARNING.VALUE_TYPE_MISMATCH`, 정합 상태가 켜질 때마다 한 번 | 현행 | 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:9` 반영 칸), 소유자 답(`reviews/round-18-owner-answers.md:17` 12-7; level `warning`) |
| ERROR-187 | 변환 실패 기록은 검증기 유무와 무관하게 보낸다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:9` 반영 칸) |
| ERROR-188 | 방언 불일치의 개발 모드 경고 — 코드는 가칭(편집자) | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:14` 12-4), 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:14` 반영 칸; 경고 코드는 가칭으로 §7.2 목록에 더함) |

항목 형식은 다음과 같다. **결정**은 정본 원문을 글자 그대로 옮긴다(표는 행과 칸을 바꾸지 않는다). **보충**은 다른 출처가 더한 조건·예외·값을 원문 그대로 `path:line`과 함께 적으며, 없으면 "없음"이라고 적는다. **상태**는 색인과 같은 값이다. **출처**는 이 규칙이 적힌 모든 위치다(정본을 먼저 적는다). **닫은 사람**은 소유자 답, 원리, 편집자 결정, 스웜 수렴(편집자 결정), 게이트 고침 가운데 하나 이상이며 근거 위치를 함께 적는다. **라운드**는 마지막으로 정해진 라운드다. **까닭**은 근거가 적힌 위치만 적는다(요약하지 않는다).
**충돌**(있을 때만)은 다른 위치가 정본과 다르게 적은 문장이 있을 때, `` `path:line`의 "<원문>"은 정본과 다르다. 정본이 이긴다(<정본 path:line>). `` 형식으로 적는다.

## 항목

### ERROR-001 오류·경고·검증 결과 세 층과 층별 규칙

- 결정:
  > | 층 | 무엇 | 규칙 | 환경 차이 |
  > | --- | --- | --- | --- |
  > | **오류** | 폼의 약속이 깨진 사건. 형상이 서지 않거나(청사진), 작성자의 선언이나 호출자의 쓰기가 커밋에서 빠지거나 바뀌거나(정착), 검증기가 있으나 검증이 불가능하거나(검증기), 호출자·소비자 코드가 계약을 어겼다 | **드러낸다.** 기본 드러남은 throw, 프로미스 거부, 주인 없는 오류 싱크(§2) 가운데 정확히 하나다. 삼키지 않고, 끌 스위치도 없다. 마운트 뒤에는 폼이 이미 커밋한 값을 잃지 않는다 | 없음. 개발과 프로덕션이 같다(R17-1 나). 메시지도 줄이지 않는다 |
  > | **경고** | 약속은 지켜지나 작성자의 의도가 의심되는 것, 또는 동작을 바꾸지 않는 알림 | **개발 모드 로그**(코드+메시지로 중복 억제). 동작을 바꾸지 않는다 | 기본 출력(개발 모드 로그)은 프로덕션에서 침묵한다(경고는 결과를 바꾸지 않으므로 침묵해도 계약이 깨지지 않는다). `onError` 핸들러는 모든 환경에서 경고 기록을 받는다(§3) |
  > | **검증 결과** | 사용자의 값이 스키마에 맞지 않음 | 노드 `errors`(`ValidationIssue`)로 흘리고, 제출 시 `ValidationError`. `onError`에는 가지 않는다 | 없음 |
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:30-34`(정본)
- 닫은 사람: 편집자 결정(17라운드, ADR 0014 4판 채택), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1; `adr/0014-error-policy.md:32`), 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4; `adr/0014-error-policy.md:34`)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:16`, `adr/0014-error-policy.md:22-24`

### ERROR-002 오류와 경고를 가르는 물음과 onError 기록의 level 대응

- 결정:
  > **폼의 약속**은 원장이 적은 규칙이다. 스키마가 작성된 그대로 판정되는 한(P1) **스키마의 뜻이 작성자의 의도와 다른 것은 경고**다(`else: false`가 빠져 거짓 분기가 공허하게 통과하는 것, 터미널이 아닌 객체 노드의 표준 `readOnly`가 자식 편집을 막지 않는 것). "조용한 데이터 손상"이라는 말은 **폼이 작성자의 선언이나 호출자의 쓰기를 빼거나 바꾼 커밋**에만 쓴다. 가르는 물음은 하나다. "이 사건 뒤에도 원장의 규칙이 지켜지는가." `onError` 기록의 `level`은 이 층을 따른다(`'error'`는 오류 층, `'warning'`은 경고 층).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:36`(정본), `08-design-a-to-z.md:355`, `03-mental-model.md:175`(맥락: "작성자 스키마의 잘못은 작성자 책임이고 폼은 고지 의무만 진다(소유자 답 2). 청사진에서 형상이 정해지지 않는 모순(오늘의 `JSON_SCHEMA_ERROR` 빌드 오류)은 고지가 아니라 throw다 — 형상 없이는 폼이 설 수 없다")
- 닫은 사람: 편집자 결정(17라운드, ADR 0014 4판 채택)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:36`

### ERROR-003 오류가 드러나는 자리 — 상황별 규칙 표

- 결정:
  > | 언제 | 자리 | 왜 |
  > | --- | --- | --- |
  > | 청사진 오류(마운트) | 렌더 중에 던지지 않는다. 트리를 만드는 자리에서 잡아 폼 자리에 대체 화면을 그리고, 커밋 뒤 이펙트에서 `onError`와 주인 없는 오류 싱크로 드러낸다. 폼이 서지 않는다 | 형상 없이는 어떤 값도 뜻이 없다. 렌더 중에 던지면 서버 사이드 렌더링의 페이지가 실패하고, 호스트에 바운더리가 없으면 앱 전체가 내려간다 |
  > | 청사진 오류(reset의 스키마 교체) | reset이 던진다. 재대조(레이아웃 효과)에서 난 것은 지금 트리를 둔 채 그 레이아웃 효과에서 `onError`와 싱크로 드러낸다 | reset은 호출자가 있는 사슬이다. 재대조는 부른 쪽이 없다 |
  > | 마운트 정착의 오류 | 원인별(아래) | 폼이 서는지는 원인마다 소유자의 답을 따른다 |
  > | 호출자 오류(공개 API 오용, 관찰자 안의 쓰기, 폐기된 노드에 대한 쓰기) | 즉시, 그 호출에서 | 호출자의 코드가 원인이며 그 자리에서 고친다. 렌더 중 쓰기는 core가 감지하지 않는다(P5, ADR 0008 §3) |
  > | 정착·통지 사슬의 오류 | **사슬의 가장 바깥 진입 끝에서 한 번**, 모든 환경 | 아래 |
  > | 검증기 오류 | `validate()`와 제출의 거부. `OnChange` 검증이면 `onError` 뒤 싱크 | §6 |
- 보충:
  > "청사진 오류: reset 호출 안의 재생성에서 난 것은 `reset()`이 던지고 옛 트리는 그대로 남는다(원자적)." (`09-landing-and-test-strategy.md:87`)
  > "청사진 오류는 트리를 만드는 자리(`RootNodeContextProvider`의 생성)에서 잡아 폼 자리에 오늘과 같은 대체 화면을 그리고 커밋 뒤 이펙트에서 드러낸다(17라운드 스웜 수렴(편집자 결정), 09 §2.3의 넷째. 오늘은 `console.error`뿐이다)." (`08-design-a-to-z.md:400`)
- 상태: 현행
- 출처: `adr/0014-error-policy.md:40-47`(정본)
- 닫은 사람: 편집자 결정(17라운드, ADR 0014 4판 채택)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:38`

### ERROR-004 진입 사슬의 정의와 사슬 안 오류의 처리 순서

- 결정:
  > **진입 사슬.** 사슬 머리(리스너·`onChange` 밖에서 열린 동기 진입)와, 그 통지·`onChange`·리스너 안에서 열린 진입 전부가 한 사슬이다. ADR 0008의 "최외곽 진입"은 사슬 머리가 아닌 진입이며, 되먹임 상한(파동 25)은 진입마다, `onChange` 중첩 상한(25)은 사슬마다 센다. 사슬 안에서 난 오류 — 정착 오류, 리스너 오류, 되먹임·중첩 초과, `batch(fn)`의 fn이 던진 예외 — 는 모두 모아 두었다가 **사슬 머리가 끝날 때 한 번** 던진다. 안쪽 진입과 안쪽 `batch`는 정상 반환한다(fn이 던진 예외도 모아 둔다. 안쪽에서 던지면 사슬이 끊겨 통지가 빠진다). 순서는 커밋 → 통지 → 검증 요청 → `onChange` → 기록마다 `onError` → throw다. 그래서 값은 커밋되고, 구독자는 통지받고(P5: 커밋된 것은 반드시 통지된다), 호출자는 한 번만 오류를 본다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:49`(정본), `08-design-a-to-z.md:355`
- 닫은 사람: 편집자 결정(ADR 0008 원리 도출)
- 라운드: 17
- 까닭: `adr/0008-event-system.md:64-68`
- 충돌:
  > `04-inherited-constraints.md:12`의 "파동 상한은 현재처럼 **틱당**이며"는 되먹임 상한을 틱마다 센다. 정본과 다르다. 정본이 이긴다(`adr/0014-error-policy.md:49`, "되먹임 상한(파동 25)은 진입마다, `onChange` 중첩 상한(25)은 사슬마다 센다", K12).

### ERROR-005 오류 묶음 — SchemaFormError와 details.errors

- 결정:
  > **묶음.** 오류가 하나면 그대로 던진다. 둘 이상이면(부른 쪽이 있는 자리에서 `onError` 핸들러가 던진 예외를 원래 오류와 합칠 때 포함) `SchemaFormError` 하나(전용 코드, 가칭 `SCHEMA_FORM_ERROR.MULTIPLE_ERRORS`)로 묶어 발생 순서대로 `details.errors`에 담는다. 식이 던진 원래 예외는 `SchemaFormError`로 감싸고 `details.error`에 싣는다(오늘 `INJECT_TO`와 같은 방식). 내장 `AggregateError`와 `Error`의 `cause` 선택지는 쓰지 않는다. 빌드 변환 대상이 ES2020이라 둘 다 없고, 내장 `AggregateError`로 판별하면 사용자 코드의 `Promise.any`가 낸 남의 오류까지 폼의 것으로 오인한다. `BaseError.toJSON`이 `details`를 재귀 복사하므로 `details.errors`는 새 장치 없이 직렬화된다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:51`(정본), `08-design-a-to-z.md:355`, `03-mental-model.md:180`(맥락: "둘 이상의 오류는 `SchemaFormError`의 `details.errors`로 묶는다(`AggregateError`·`cause`는 쓰지 않는다)")
- 닫은 사람: 편집자 결정(17라운드, ADR 0014 4판 채택)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:51`

### ERROR-006 환경 규칙 — 정착·통지 오류는 모든 환경에서 같게 드러남

- 결정:
  > **환경.** 작성자 스키마·호출자 데이터에서 온 정착 오류(예산 초과, `controls` 식·가드 실패, `controls.injectTo` 대상 없음)와 공유 충돌은 모든 환경에서 커밋·통지 뒤 사슬 끝에서 던진다(R17-1 나, 17라운드 소유자 답: "나 허용. 망가진 값을 올리는게 더 위험하겠다"). 청사진 오류, 호출자 오류, 되먹임·중첩 초과, 리스너·`batch` fn 예외(14라운드 O-5 위임), 검증기 오류도 모든 환경에서 같게 드러난다. 끄는 스위치는 없다(Form 속성 `throwOnBudgetExceeded`는 없다). 12라운드 §4("프로덕션은 신호만"), 10라운드 B-1(제출 비차단), 14라운드 O-4 가(식 오류와 대상 없음은 개발 모드 경고)는 이 답으로 대체되었다. 환경에 따라 다른 것은 둘뿐이다. 경고의 기본 출력(개발 모드 콘솔)과, 가드 컴파일 실패를 알리는 시점(§6)이다. 오류 메시지는 어느 환경에서도 줄이지 않는다(번호와 해독 페이지로 바꾸지 않는다).
- 보충:
  > 소유자(10라운드 A-4): "루프의 가능성을 제한하지는 않는다. 이때문에 순환된 값이 진동하거나 발산할 수 있으며, 이를 막기 위한 상한값이 있고, 그 상한값을 초과하면 적절한 error 를 표시한다. 이는 react 의 hook 과 동일한 설계를 갖는다." (`reviews/round-10-owner-answers.md:10`)
  > 소유자(10라운드 B-1): "권고를 따릅니다만, 기본적으론 form 을 터트려서(error 를 throw 해서) 알려주는게 좋지 않을까 싶네요... 이 루프가 만들어지는건 기본적으로 schema를 잘못 짰기 때문이니까, 런타임에 발생할 확률은 비교적 낮겠고요. 그리고 다시 말하지만, 구태여 막지 않을 뿐이지 루프를 만드는걸 권하는 설계는 절대 아닙니다." (`reviews/round-10-owner-answers.md:13`)
  > "마지막 라운드는 상한값에 따라 결과가 달라진다. 커밋 거부는 "값은 받아들인다"에 걸린다. 망가진 값을 올리지 않도록 제출은 막는다" (`03-mental-model.md:163`, 원리 P3·P2·C2와 연결)
  > "**모든 환경**에서 커밋·통지 뒤 사슬 끝에서 throw한다(17라운드 소유자 답 R17-1 나: "망가진 값을 올리는게 더 위험하겠다"). 소유자가 말한 "form을 터트려서(error를 throw해서) 알려주는" 기본 동작이 이것이다. throw가 그 진입의 `onChange`와 검증 요청을 건너뛰게 하지 않는다 — D-10이 없앤 것이 바로 개발 모드와 프로덕션의 관측 차이였다(06 §4.5, 6라운드 검증 #11의 처방은 기각). 끄는 스위치는 없다(`throwOnBudgetExceeded`는 없다). 개발 모드만 던지고 프로덕션은 신호만 내던 5차 본문의 규칙(소유자 B-1)은 이 답으로 대체되었다." (`adr/0008-event-system.md:99`)
  > 소유자(12라운드 §3 원칙이 답하지 않는 부분): "해당 조건은 중복 선언시(부모선언 + 자식노드 자체 선언) 이를 병합하는게 아니라 덮어쓰는걸 고려했다. 하지만 이를 or 조건이나 체인으로 엮을 수 있나? 말한대로 루프가 발생하면 form 을 터트리고 오류를 보여주면 된다. 이 기능은 설계를 요한다." (`reviews/round-12-owner-answers.md:11`, 항목 3 중복 선언)
- 상태: 분할됨(→ ERROR-070, ERROR-071, ERROR-072, ERROR-073, ERROR-074, ERROR-075, ERROR-076)
- 출처: `adr/0014-error-policy.md:53`(정본), `08-design-a-to-z.md:369`, `03-mental-model.md:116,163,180`, `02-target-overview.md:169`, `adr/0002-guard-fragment-model.md:115`, `adr/0007-settle-cycle.md:47,59,116,145`, `adr/0008-event-system.md:97,99,100`, `reviews/round-12-owner-answers.md:11`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 편집자 결정(14라운드 O-5 위임, `reviews/round-14-owner-answers.md:11`), 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:90,92` E10·E12; 오류 메시지를 줄이지 않음과 환경 차이 둘)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:14`, `adr/0014-error-policy.md:326-327`
- 충돌:
  > `adr/0008-event-system.md:213`의 "개발 모드의 예산 초과 throw"는 예산 초과 throw를 개발 모드의 것으로 적는다. 정본과 다르다. 정본이 이긴다(`adr/0014-error-policy.md:53`, K13).
  > `03-mental-model.md:116`의 "소유자(12라운드)"는 10라운드 A-4·B-1의 발언을 12라운드로 귀속한다. 정본과 다르다. 정본이 이긴다(`reviews/round-10-owner-answers.md:10,13`, K8).

### ERROR-007 호출자 없는 진입의 오류 드러냄 자리

- 결정:
  > **호출자 없는 진입.** 호출자 코드가 머리가 아닌 진입 — 마운트, 렌더 계층 자신의 이펙트, reset의 재대조 — 의 오류는 렌더 중이나 이펙트 안에서 던지지 않고, 폼이 커밋된 뒤 `onError`와 주인 없는 오류 싱크로 드러낸다. 렌더 중에 던지지 않는 것은 드러남의 자리일 뿐이며, 마운트에서 폼이 서는지는 아래 원인별 규칙이 정한다. 호스트나 사용자 주입 구성 요소의 이펙트에서 연 사슬은 그 코드가 호출자이므로 사슬 끝에서 던지고, 가까운 바운더리가 받는다(호스트 이펙트면 호스트의 바운더리).
- 보충:
  > "React 이벤트 처리기에서 시작된 쓰기의 throw는 화면과 입력을 내리지 않고 전역 오류로 보고되며, 호스트 이펙트에서 부른 쓰기의 throw는 호스트의 바운더리로 가 화면을 내릴 수 있다." (`08-design-a-to-z.md:369`)
- 상태: 현행
- 출처: `adr/0014-error-policy.md:55`(정본), `08-design-a-to-z.md:355`
- 닫은 사람: 편집자 결정(17라운드, ADR 0014 4판 채택)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:55`

### ERROR-008 주인 없는 오류 싱크의 선택 규칙

- 결정:
  > **주인 없는 오류 싱크.** 부른 쪽이 없는 오류는 한 싱크로 드러낸다. `window`가 있으면 `reportError`를 부르고, 없으면 `ErrorEvent`가 있을 때만 `window`에 보내며 취소되지 않으면 `console.error`를 한 번 낸다. `window`가 없으면(서버 사이드 렌더링) `console.error` 한 번이다. `process.emit('uncaughtException')`은 부르지 않는다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:57`(정본), `08-design-a-to-z.md:400`, `09-landing-and-test-strategy.md:51`
- 닫은 사람: 17라운드 스웜 수렴(편집자 결정)
- 라운드: 17
- 까닭: `08-design-a-to-z.md:400`

### ERROR-009 마운트 정착의 오류 — 원인별 처리

- 결정:
  > **마운트 정착의 오류 — 원인별.** 마운트 정착의 오류는 렌더 중에 던지지 않고 트리를 만드는 자리(청사진 오류와 같은 자리)에서 잡는다.
  >
  > 1. 공유 충돌: 모든 환경에서 폼이 서지 않는다. 폼 자리에 청사진 오류와 같은 대체 화면을 그리고, 커밋 뒤 이펙트에서 `onError`와 싱크로 드러낸다(14라운드 O-10).
  > 2. 예산 초과, 식·가드 실패, 동적 `controls.injectTo` 대상 없음: 폼이 선다(R17-1 나). 원인마다 정의된 값(예산 초과는 원본 B, 식·가드 실패는 §4의 자리별 값, 대상 없음은 그 규칙을 후보에서 뺌)으로 정착을 마치고 커밋하며, `diagnostics`는 `degraded`로 시작한다(§5). 오류는 커밋 뒤 준비 이펙트에서 `onError`와 싱크로 드러낸다. 폼이 서는 원인에서는 마운트에서도 폼이 커밋한 값을 잃지 않는다.
  >
  > 어느 경우든 생성 자리에서 잡으므로 서버 사이드 렌더링의 페이지는 실패하지 않는다. 클라이언트는 하이드레이션에서 트리를 다시 만들어 같은 오류를 커밋 뒤에 드러낸다. reset 재생성의 첫 로드는 호출자가 있는 사슬이므로 새 트리로 커밋하고 핸들을 바꾼 뒤 reset의 사슬 끝에서 던진다.
- 보충:
  > "게이트 가진 선언의 충돌은 청사진에서 판정할 수 없으므로 분석 단계에서 미리 throw하지 않는다" (`adr/0005-blueprint-analysis-and-node-sharing.md:68`)
  > "타입이 다르면 오류 — 소유자: "타입이 달라버리면 우리로서는 답이 없지만(이 경우엔 오류가 throw 되겠지)." 개정분은 이 오류를 둘로 가른다. 게이트 없는 선언끼리의 충돌은 분석 단계(청사진)의 오류이고, 게이트에 달린 선언이 실제로 동시에 켜진 충돌은 정착의 오류다(§3의 표). 경고가 아니라 오류로 드러내는 것은 14라운드 O-10 소유자 답("경고만 일어나고 동작하는것처럼 보이는게 더 위험합니다")이다. 드러남의 환경 규칙은 17라운드 소유자 답 R17-1 나("망가진 값을 올리는게 더 위험하겠다")로 정해졌다: 모든 환경에서 던지고 `degraded` 동안 제출을 거부한다." (`adr/0005-blueprint-analysis-and-node-sharing.md:116`)
- 상태: 분할됨(→ ERROR-077, ERROR-078, ERROR-079, ERROR-080, ERROR-081, ERROR-082, ERROR-083, ERROR-084)
- 출처: `adr/0014-error-policy.md:59-64`(정본), `08-design-a-to-z.md:371`, `02-target-overview.md:125`, `adr/0005-blueprint-analysis-and-node-sharing.md:68,116`
- 닫은 사람: 소유자 답(`reviews/round-14-owner-answers.md:16` O-10), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 17라운드 스웜 수렴(편집자 결정, `08-design-a-to-z.md:371`)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:61-62`

### ERROR-010 React에서 보이는 것과 폼 바운더리의 규칙

- 결정:
  > **React에서 보이는 것.** 이벤트 핸들러 안에서 던져진 예외는 에러 바운더리를 발화시키지 않는다. 화면은 백지가 되지 않고 직전 커밋 상태로 남으며, 브라우저 전역 오류와 모니터링 도구에 잡힌다. 폼의 바운더리(루트 바운더리와 사용자 주입 구성 요소의 필드 바운더리)는 **다시 던지지 않고 삼키지도 않는다.** 오늘처럼 가두어 대체 화면을 그리되, 잡은 오류를 `componentDidCatch`에서 `onError`와 싱크로 넘긴다(오늘은 `console.error`뿐이다). 필드 바운더리는 오늘처럼 인라인 입력(`useFormTypeInput.ts:36-37`), 덮어쓴 입력(`SchemaNodeInputWrapper.tsx:56-57`), 정의·맵의 입력(`formTypeInputDefinitions.ts:32`·`:37`, `formTypeInputMap.ts:32`·`:37`), 렌더러(`SchemaNodeProxy.tsx:59`), `Placeholder`(`VirtualizationManager.ts:214`)를 감싼다. 바운더리가 다시 던지지 않으므로 오류 부류 판별(`instanceof`, `group`)에 기대지 않고, 중첩 `<Form>`의 청사진 오류는 안쪽 폼 자리에서 멈춘다. 공개 동작(대체 화면)은 바뀌지 않는다. 바운더리가 오류를 호스트로 올려 보내지 않는 것과 핸들러의 예외를 바운더리 밖으로 내보내지 않는 것은 17라운드 소유자 답(통보4)이다.
- 보충:
  > "`<Form key>`는 전체 재생성(스키마 교체, 에러 바운더리 복구, 가상화 재생)으로 문서화하고, 그것이 버리는 것(핸들 인스턴스, 외부 구독, 노드 참조, `showError` 등 Form 층 상태, 첨부 파일 맵, 가상화 기록, 에러 바운더리의 fallback 상태)을 함께 적는다." (`09-landing-and-test-strategy.md:91`)
  > "루트 바운더리가 fallback을 그리는 동안은 `ref`가 `null`이라 reset을 부를 수 없으므로 복구는 `key`뿐이다(`reviews/raw-round16-reset.md` §4의 H5, 실행 확인 전)." (`09-landing-and-test-strategy.md:91`)
- 상태: 분할됨(→ ERROR-085, ERROR-086, ERROR-087, ERROR-088, ERROR-089, ERROR-090, ERROR-091, ERROR-092, ERROR-093)
- 출처: `adr/0014-error-policy.md:66`(정본), `08-design-a-to-z.md:400`, `09-landing-and-test-strategy.md:48,51`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4, 다시 던지지 않음), 17라운드 스웜 수렴(편집자 결정, `08-design-a-to-z.md:357`·`adr/0014-error-policy.md:160-163`·`reviews/raw-round17-convergence.md:88` E8)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:15`
- 충돌:
  > `adr/0014-error-policy.md:66`의 "바운더리가 오류를 호스트로 올려 보내지 않는 것과 핸들러의 예외를 바운더리 밖으로 내보내지 않는 것은 17라운드 소유자 답(통보4)이다"는 핸들러 예외의 규칙까지 소유자 답으로 적는다. 정본과 다르다. 정본이 이긴다(`reviews/round-17-owner-answers.md:15`, 반영 칸 "다시 던지지 않는 것과 검증 오류를 섞지 않는 것은 소유자의 답이다").

### ERROR-011 관찰자 onError의 정의

- 결정:
  > Form 속성 `onError(record)`는 검증 결과를 뺀 폼 내부의 오류와 경고를 같은 모양의 기록으로 받는 **관찰자**다(17라운드 4번 수렴의 안 B, 17라운드 스웜 수렴(편집자 결정). 소유자의 "validate error 가 걸러진 에러 로깅용 전용 채널"). 핸들러는 흐름을 바꾸지 못한다. 반환값은 무시되고, 어떤 기본 드러남(사슬 끝 throw, 프로미스 거부, 주인 없는 오류 싱크, 개발 모드 콘솔)도 대신하거나 끄지 못하므로, 핸들러가 던지지 않는 한 핸들러가 있든 없든 폼의 동작은 같다(핸들러가 던지면 그 예외도 원래 오류와 함께 드러난다). 핸들러가 없으면 비용도 없다. `throwOnBudgetExceeded`는 없고(R17-1 나), 가칭 `onListenerError`는 `onError`에 흡수된다.
- 보충: 없음
- 상태: 분할됨(→ ERROR-094, ERROR-095, ERROR-096, ERROR-097, ERROR-098, ERROR-099)
- 출처: `adr/0014-error-policy.md:70`(정본), `08-design-a-to-z.md:357,360,367`, `03-mental-model.md:180,233`, `02-target-overview.md:313`, `adr/0008-event-system.md:201`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4), 17라운드 스웜 수렴(편집자 결정)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:15`

### ERROR-012 버린 onError 설계안들과 그 이유

- 결정:
  > 외부 조사의 안 B("`onError` 하나로 보내고 없으면 throw", 17라운드 4번 수렴의 안 B와 다르다)는 소비자가 오류를 삼킬 수 있어 완결성이 깨지므로 택하지 않는다. 핸들러가 받은 항목의 기본 출력을 대신하는 안도 같은 이유로 택하지 않는다. 빈 핸들러 하나가 주인 없는 오류 싱크를 끄는 스위치가 되기 때문이다. 버린 안의 나머지(안 A, 이름 `onLog`, 경고를 개발 모드에서만 보내는 안, 검증기 없음을 `'error'`로 두는 안, 모든 경로의 `WeakSet`, 앱 수준 기본 `onError` 등)와 근거는 `reviews/raw-round17-onerror.md`에 있다.
- 보충: 없음
- 상태: 현행(부정 결정)
- 출처: `adr/0014-error-policy.md:72`(정본)
- 닫은 사람: 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md`)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:328-329`

### ERROR-013 onError 이름과 자리 계약

- 결정:
  > 아래가 계약이다(17라운드 4번 수렴의 계약 열아홉 항목에 게이트 R17G-1–R17G-11의 고침을 모두 적용한 것).
  >
  > **이름과 자리.** Form 속성은 `onError?: (record: FormErrorRecord) => void`다. 기록 형 `FormErrorRecord`와 코드 형 `FormErrorCode`(문자열 리터럴 합집합)는 가칭이며 PR-4에서 확정한다. 렌더 계층(React 바인딩)이 이 속성을 소유하고 `useHandle`로 최신 속성을 부른다(`Form.tsx:110`과 같은 방식). 그래서 인라인 함수를 넘겨도 트리와 캐시를 다시 만들지 않는다. core는 React를 모르므로(C3) 트리를 만들 때 보고기 `{ report(record): void; hasConsumer(): boolean }`(가칭) 하나를 인자로 받고, 트리마다 하나인 `SchemaNodeRuntime`이 그것을 든다. 렌더 계층의 `hasConsumer`는 부를 때마다 '최신 `onError` 속성이 함수임 또는 `process.env.NODE_ENV !== 'production'`'을 돌려주고, core는 기록·서식·경고 판정 전에 매번 이것을 묻는다. 마운트 뒤에 핸들러를 새로 단 폼은 그 뒤의 사건부터 받고, 이미 지난 로드의 청사진·마운트 기록은 받지 않는다. core만 쓰는 호스트는 자기 보고기를 넘긴다. 선언의 문서 주석 첫 줄은 '폼 내부의 오류와 경고를 받는 관찰자. 검증 결과는 오지 않는다(onValidate). 반환값은 무시되고 오류를 막지 못한다'이다(이름이 검증 오류로 읽히는 함정을 푼다).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:74,76`(정본), `08-design-a-to-z.md:418,420`
- 닫은 사람: 17라운드 스웜 수렴(편집자 결정), 게이트 R17G-1–R17G-11 고침
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:74`

### ERROR-014 onError가 받는 것

- 결정:
  > **받는 것.** 폼 인스턴스에 묶인 오류 층과 경고 층의 사건 전부다.
  >
  > - 청사진 오류와 경고
  > - 마운트 정착의 오류와 경고
  > - 정착 오류와 경고: 예산 초과, 식·가드 실패, 동적 대상 없음, 공유 충돌, 게이트 가진 분기 둘 이상 켜짐
  > - 되먹임·중첩 초과
  > - 리스너 오류: 구독 리스너, `onChange`, `onStateChange`, `onDiagnosticsChange`, `batch` fn, 검증 결과 파동의 리스너와 `onValidate`
  > - 호출자 오류: `Overwrite`와 `Merge`를 함께 준 `setValue`, 재생성 reset으로 폐기된 노드에 대한 쓰기, `FormTypeInputMap` 패턴
  > - `degraded` 동안의 제출 거부
  > - 검증 불가(검증기는 있으나 컴파일 실패)
  > - 검증기 실행 실패
  > - 바운더리가 잡은 렌더 오류
  > - 검증기 없음과 조건부 스키마 경고
  > - 렌더 계층 경고: 가상화 꺼짐, `presentation` 키 의심
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:78-92`(정본), `08-design-a-to-z.md:373`, `adr/0008-event-system.md:68`
- 닫은 사람: 17라운드 스웜 수렴(편집자 결정)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:74`

### ERROR-015 onError가 받지 않는 것

- 결정:
  > **받지 않는 것.**
  >
  > - 검증 결과 전부: 노드 `errors`의 `ValidationIssue`, `onValidate`, `errors` 속성과 `setExternalErrors`·`clearExternalErrors`, 제출의 `VALIDATION_ERROR.SCHEMA_VALIDATION_FAILED`(17라운드 소유자 답, 통보4 둘째 답)
  > - 정착 추적(개발 모드 기록)
  > - `diagnostics`의 상태 변화(원인 오류는 기록된다)
  > - 묶음 `SchemaFormError` 자체(구성 오류마다 기록한다)
  > - 핸들러 자신의 예외와 핸들러 안 쓰기의 거부
  > - 호스트 `onSubmit`이 던지거나 거부한 것(호스트 자신의 코드이며 제출 프로미스로 부른 쪽에 간다)
  > - 폼 인스턴스 밖의 사건: `registerPlugin`의 `UNHANDLED_ERROR.REGISTER_PLUGIN`
  > - React 자신의 경고와, core가 감지하지 않는 렌더 중 쓰기(P5)
- 보충: 없음
- 상태: 분할됨(→ ERROR-100, ERROR-101)
- 출처: `adr/0014-error-policy.md:93-102`(정본), `08-design-a-to-z.md:358`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4의 둘째 답, 첫 항목만), 17라운드 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:15` 반영 칸)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:15`

### ERROR-016 같은 제출 거부라도 degraded는 기록되고 검증 실패는 기록되지 않음

- 결정:
  > 같은 제출 거부라도 `degraded`는 기록되고 검증 실패는 기록되지 않는다. 앞의 것은 폼의 약속이 깨진 사건이고 뒤의 것은 검증 결과이기 때문이다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:104`(정본), `08-design-a-to-z.md:358`
- 닫은 사람: 편집자 결정(17라운드, ADR 0014 4판 채택)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:104`

### ERROR-017 onError 기록의 모양과 칸별 규칙

- 결정:
  > **기록 모양.** `{ level: 'error' | 'warning'; code: FormErrorCode; message: string; path?: string; schemaPath?: string; details?: ErrorDetails; error?: unknown; aggregate?: SchemaFormError; surface?: 'thrown' | 'rejected' | 'sink'; componentStack?: string }`.
  >
  > - `code`: `BaseError.code`와 같은 `<GROUP>.<SPECIFIC>` 형식이다(`packages/winglet/common-utils/src/errors/BaseError.ts:29-32`). 경고는 `SCHEMA_FORM_WARNING.<SPECIFIC>`이다. 소비자 코드의 예외에는 폼이 부류 코드(가칭 `SCHEMA_FORM_ERROR.LISTENER_THREW`, `SCHEMA_FORM_ERROR.RENDER_FAILED`)를 붙인다.
  > - `message`: 프로덕션에서도 줄이지 않으며, 전달할 때 한 번 서식한다.
  > - `path`: 데이터 경로(JSON Pointer)이며, 노드에 묶인 사건에만 있다.
  > - `schemaPath`: 작성된 스키마 안의 위치(JSON Pointer)이며, 청사진 사건에 있다.
  > - `details`: 오류면 `error.details`와 같은 참조이고, 경고면 경고의 세부다.
  > - `error`(`level`이 `'error'`일 때만): 폼이 드러내는 바로 그 값이다. 폼이 감싸는 식·가드 예외는 `SchemaFormError`이고 원래 예외는 `details.error`에 있다. 감싸지 않는 소비자 예외 하나와 사용자 렌더 오류는 원래 값 그대로다.
  > - `aggregate`: 둘 이상이 묶여 던져졌을 때 실제로 던진 묶음이다.
  > - `surface`(`level`이 `'error'`일 때만): 그 오류가 핸들러 밖에서 드러나는 길이다.
  > - `componentStack`: 바운더리가 잡은 오류에만 있으며, `errorInfo.componentStack`이다.
  >
  > 호스트는 `aggregate ?? error`의 동일성으로 전역 처리기와의 중복을 거를 수 있다. 다만 핸들러가 던져 부른 쪽이 있는 자리에서 새 묶음이 생기면, 이미 전달된 기록의 `aggregate ?? error`와 실제로 던진 값은 다르다(핸들러 결함의 경우다). 경고는 `BaseError` 인스턴스가 아닌 평범한 기록이다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:106-118`(정본), `08-design-a-to-z.md:359`
- 닫은 사람: 17라운드 스웜 수렴(편집자 결정)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:74`

### ERROR-018 층과 level의 대응

- 결정:
  > **층과 level.** `level`이 `'error'`이면 오류 층이다. 폼의 약속이 깨진 사건이며, 기본 드러남은 throw, 거부, 싱크 가운데 정확히 하나다. `level`이 `'warning'`이면 경고 층이다. 동작을 바꾸지 않는 사건이며, 기본 드러남은 개발 모드 콘솔이다. R17-1 나에 따라 예산 초과, 식·가드 실패, 동적 `controls.injectTo` 대상 없음, 되먹임·중첩 초과는 `'error'`다. 검증기 없음은 거부하지 않으므로 `'warning'`이다(17라운드 소유자 답 (가) "(가) ㄱ warning으로."). 가르는 물음은 §1대로 '이 사건 뒤에도 원장의 규칙이 지켜지는가'다.
- 보충: 없음
- 상태: 분할됨(→ ERROR-102, ERROR-103, ERROR-104, ERROR-105, ERROR-106, ERROR-107, ERROR-108, ERROR-109)
- 출처: `adr/0014-error-policy.md:120`(정본)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-17-owner-answers.md:33` (가))
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:33`

### ERROR-019 onError 전달 시점 여덟 가지

- 결정:
  > **시점.** 한 사건에 기록 하나이며, 발생 순서대로 부른다.
  >
  > 1. 렌더 중에 트리를 만드는 자리가 하는 일(청사진, 마운트 정착)의 기록은 그 로드 객체(`useMemo`의 결과)에 모은다. 폼이 커밋된 뒤 준비 이펙트에서 초기 `onChange` 다음에 부른다. 청사진 오류로 폼이 서지 않으면, 생성 자리가 돌려준 실패 로드가 그 오류와 그 전에 모인 경고를 들고 대체 화면의 이펙트가 부른다. 커밋되지 않은 로드의 기록은 부르지 않는다. 다만 루트 바운더리가 하위 트리를 버리고 대체 화면을 그리면, 바깥 감싸개의 보고기가 가장 최근에 만든 로드를 들고 있다가 루트 바운더리의 `componentDidCatch`가 그 로드의 오류 층 기록을 렌더 실패 기록보다 먼저 `onError`와 싱크로 보낸다. 경고 기록은 버린다(청사진 경고는 캐시에 남는다). 입력 맵 정규화의 오류는 트리보다 먼저 던져져 루트 바운더리가 잡으므로 여섯째를 따르고, 가상화 관리자 생성의 경고는 일곱째를 따른다.
  > 2. 마운트 뒤의 사슬은 커밋 → 통지 → 검증 요청 → `onChange` → 기록마다 `onError`(경고 포함) → throw의 순서다. 정착 도중에는 부르지 않는다. reset의 재생성과 첫 로드도 reset 사슬의 끝에서 부른다.
  > 3. `validate()`와 제출은 오류 층의 원인(검증기 실행 실패, 검증 불가, `degraded`)일 때만 거부 직전에 부른다. 부른 쪽이 기다리지 않는 네이티브 submit 경로에서는 거부 대신 `onError` 뒤 싱크로 보낸다.
  > 4. 호출자 오류는 throw 직전에 부른다.
  > 5. `OnChange` 검증의 실행 실패와 검증 결과 파동의 리스너 예외는 그것을 알게 된 마이크로태스크에서 `onError` 뒤 싱크로 보낸다.
  > 6. 바운더리가 잡은 오류는 `componentDidCatch`에서 `onError` 뒤 싱크로 보낸다.
  > 7. 렌더 계층 경고는 그 필드나 폼의 커밋 뒤 이펙트에서 부른다. 지연 마운트된 필드면 그 필드가 커밋된 뒤다.
  > 8. 재대조(레이아웃 효과)의 기록은 그 레이아웃 효과에서 부른다.
- 보충:
  > "청사진 경고는 청사진 캐시에 남아 다음 커밋된 로드에서 간다" (`09-landing-and-test-strategy.md:48`)
- 상태: 현행
- 출처: `adr/0014-error-policy.md:122-132`(정본), `08-design-a-to-z.md:361`, `09-landing-and-test-strategy.md:48,174`
- 닫은 사람: 17라운드 스웜 수렴(편집자 결정)
- 라운드: 17
- 까닭: `09-landing-and-test-strategy.md:48`

### ERROR-020 렌더 중 보증의 범위

- 결정:
  > **렌더 중 보증의 범위.** 폼이 여는 렌더 단계 작업(청사진, 마운트 정착, 입력 맵 정규화)에서는 부르지 않는다. 호출자가 렌더 중에 연 사슬(core가 감지하지 않는 사용자 코드의 쓰기, P5)은 호출자의 오용이므로 그 안의 전달 시점은 보증하지 않는다(09 §2.3의 문서화 항목 '렌더 중 사용자 코드의 쓰기는 React의 렌더 중 갱신 경고를 받는다'와 같은 자리에 적는다).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:133`(정본)
- 닫은 사람: 편집자 결정(17라운드, ADR 0014 4판 채택)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:133`

### ERROR-021 onError의 환경 규칙과 가드 컴파일 실패의 예외

- 결정:
  > **환경.** 클라이언트의 모든 환경에서 같은 사건은 같은 `code`, `level`, `details`, `surface`로 한 번 간다(G5). 핸들러가 있으면 프로덕션에서도 경고를 받는다. 예외는 하나다. 가드 컴파일 실패는 개발 모드가 시점을 앞당겨 마운트의 커밋 뒤에 보낸다(`surface`는 `'sink'`). 프로덕션에서는 그 가드를 처음 평가하는 사슬 끝에서 보내며(`surface`는 `'thrown'`), 한 번도 평가되지 않은 가드의 실패는 기록이 없다(§6). 오류 메시지는 어느 환경에서도 줄이지 않는다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:135`(정본), `08-design-a-to-z.md:362`
- 닫은 사람: 17라운드 스웜 수렴(편집자 결정)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:135`

### ERROR-022 기본 출력과의 관계 — 오류·경고의 기본 드러남

- 결정:
  > **기본 출력과의 관계.** 핸들러는 어떤 기본 드러남도 대신하거나 끄지 못하며, 반환값은 무시한다.
  >
  > - 오류의 기본 드러남: 사슬 끝 throw, 프로미스 거부, 주인 없는 오류 싱크다(§2).
  > - 경고의 기본 드러남: 오늘의 자리와 규칙 그대로다. 개발 모드 콘솔에 발견 즉시 나가고, 세션 단위로 code+message 중복을 억제한다(`src/helpers/warning/warnDevelopmentIssue.ts:25-35`). 프로덕션에서는 기본 출력이 없다. §1의 '침묵'은 기본 출력에만 해당한다.
  > - 개발 모드에서 경고는 콘솔과 핸들러 둘 다에 간다(의도한 동작이다).
  > - `@winglet/react-utils` ErrorBoundary의 `console.error`는 그 모듈의 의도대로 남는다(`packages/winglet/react-utils/src/hoc/withErrorBoundary/INTENT.md` '기본 로깅은 유지').
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:137-143`(정본), `08-design-a-to-z.md:362`
- 닫은 사람: 편집자 결정(17라운드, ADR 0014 4판 채택)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:139-142`

### ERROR-023 중복 막기 — 오류

- 결정:
  > **중복 막기 — 오류.**
  >
  > - 원점 경로(사슬 끝, 거부, 호출자 오류, 마이크로태스크, 로드 전달)는 사건마다 부른다. 그래서 소비자가 같은 객체를 되풀이해 던져도 사건마다 기록된다.
  > - 폼이 던진 객체 값(원래 값 그대로 던진 소비자 예외와 묶음 포함)은 폼 인스턴스의 `WeakSet`에 넣는다. `componentDidCatch`는 잡은 값이 그 집합에 있으면 집합에서 한 번 빼고 핸들러 전달만 건너뛴다. 싱크는 그 경로가 처음이므로 부른다. 집합에 남은 값(폼 밖 바운더리가 잡아 빠지지 않은 것)을 폼 안의 다른 렌더가 같은 값을 또 던지면, 그 렌더 실패의 핸들러 전달이 한 번 빠질 수 있다(싱크는 간다).
  > - 원시값(문자열, 숫자)은 `WeakSet`에 넣을 수 없으므로 표지 없이 사건마다 보낸다. 이펙트에서 연 사슬의 원시값 throw가 필드 바운더리에 다시 잡히면 두 번 갈 수 있다.
  > - 검증 불가는 한 로드에 오류 객체 하나이며, 그 로드에서 처음 드러날 때 한 번 보낸다.
  > - 묶음은 구성 오류마다 기록하고, 묶음 자체는 `aggregate` 칸으로만 싣는다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:144-150`(정본), `09-landing-and-test-strategy.md:48,174`
- 닫은 사람: 17라운드 스웜 수렴(편집자 결정)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:146-150`

### ERROR-024 중복 막기 — 경고

- 결정:
  > **중복 막기 — 경고.** 키는 서식 전의 구조 키다. code, 위치(`path`, 없으면 `schemaPath`, 둘 다 없으면 폼 수준), 코드마다 정한 판별 칸(예: `ALL_OF_KEYWORD_IGNORED_FOR_FORM`의 `keyword`, `PRESENTATION_KEY_SUSPECT`의 키 이름)으로 이룬다. 메시지는 이 키를 통과한 첫 번에만 서식한다. 키는 폼 인스턴스의 로드(마운트, 스키마 교체, 루트 전체 교체, reset)마다 비우며, `diagnostics`와 같은 단위다. 집합은 핸들러가 있을 때만, 처음 경고가 날 때 만든다. 청사진 경고는 청사진의 목록이 이미 발생마다 하나씩이라 따로 거르지 않는다. 검증기 없이 쓰는 폼은 트리마다 `VALIDATOR_MISSING` 하나를 받으며, 검증 모드를 `None`으로 적으면 사라진다(§6).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:152`(정본)
- 닫은 사람: 17라운드 스웜 수렴(편집자 결정)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:152`

### ERROR-025 서버에서의 onError 동작

- 결정:
  > **서버.** 서버에서는 부르지 않는다. 이펙트, `componentDidCatch`, 사슬, 검증이 서버 렌더에서 돌지 않기 때문이다. 서버에서 생성 자리에 잡힌 오류는 싱크의 서버 가지(`console.error` 한 번)로만 남는다. 서버의 기록을 클라이언트로 옮기지 않는다. 하이드레이션이 트리를 다시 만들 때 같은 기록이 클라이언트 준비 이펙트에서 한 번 간다. 서버 개발 모드의 콘솔 경고는 오늘처럼 남는다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:154`(정본), `08-design-a-to-z.md:361`, `09-landing-and-test-strategy.md:48`
- 닫은 사람: 17라운드 스웜 수렴(편집자 결정)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:154`

### ERROR-026 StrictMode에서의 onError 동작

- 결정:
  > **StrictMode.** 로드 기록은 커밋된 로드 객체에 붙으므로, 버려진 이중 렌더의 기록은 가지 않는다. 로드 객체의 '전달함' 표지는 이펙트 정리에서 되돌리지 않으므로, 이펙트가 두 번 돌아도 한 번 간다. StrictMode의 흉내 언마운트·재마운트는 로드가 아니므로 경고 집합을 비우지 않는다. React 18 개발 모드가 바운더리 오류를 전역 오류로 한 번 더 재생하는 것은 싱크 쪽의 사실이며, 핸들러는 `componentDidCatch`에서 한 번만 불린다. 실행 확인은 PR-7의 React 18 시험에서 한다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:156`(정본), `08-design-a-to-z.md:400`, `09-landing-and-test-strategy.md:48,174`
- 닫은 사람: 17라운드 스웜 수렴(편집자 결정)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:156`

### ERROR-027 바운더리 경로 구현

- 결정:
  > **바운더리 경로.** `Form.tsx:311-312`의 범용 `withErrorBoundaryForwardRef`를 schema-form의 바깥 감싸개로 바꾼다. 바깥 감싸개는 인스턴스 보고기(최신 핸들러, `WeakSet`, 경고 집합, 전달 중 표지)를 `useRef`로 들고 문맥으로 내려 주며, 그 안에 보고를 받는 루트 바운더리를 둔다. 보고기가 루트 바운더리 바깥에 있으므로 대체 화면으로 바뀐 뒤에도 살아 있다. 감싸는 자리가 모듈 수준(`PluginManager.ts:39-40`·`:78`), `FormProvider`(`ExternalFormContextProvider.tsx:222`), 폼마다(`FormTypeInputsContextProvider.tsx:31-36`)로 갈리는 필드 바운더리(`formTypeInputDefinitions.ts:32`·`:37`, `formTypeInputMap.ts:32`·`:37`)는 감싸기를 그대로 두고, 렌더 때 문맥에서 보고기를 읽는다. `@winglet/react-utils`의 `withErrorBoundary`·`withErrorBoundaryForwardRef`에는 렌더 때 보고 함수를 얻는 선택 인자를 더한다. 주지 않으면 오늘 동작이고 판은 minor다. 인자의 모양(ErrorBoundary 보고 콜백 속성과 그 공개, 또는 감싸개의 보고기 읽기 인자)은 PR-7에서 고른다. 그 모듈 INTENT의 'Ask first' 두 항목(고차 구성 요소의 시그니처 확장, 내부 오류 경계 구성 요소의 공개 표면 승격)에 해당하며, 소유자가 확장을 허용했다(17라운드 소유자 답 (나) "(나) 확장 허용합니다"). PR-7에서 그 모듈의 `DETAIL.md`를 먼저 갱신한 뒤 코드를 고친다.
- 보충: 없음
- 상태: 분할됨(→ ERROR-110, ERROR-111, ERROR-112, ERROR-113, ERROR-114, ERROR-115, ERROR-116, ERROR-117, ERROR-118, ERROR-119)
- 출처: `adr/0014-error-policy.md:158`(정본), `08-design-a-to-z.md:400,599`, `09-landing-and-test-strategy.md:51`
- 닫은 사람: 17라운드 스웜 수렴(편집자 결정, `08-design-a-to-z.md:400`), 소유자 답(`reviews/round-17-owner-answers.md:34` (나), 확장 허용만)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:34`

### ERROR-028 핸들러가 던질 때의 규칙

- 결정:
  > **핸들러가 던질 때.** 모든 전달은 try/catch 안에서 한다. 핸들러의 예외는 원래 사건의 기본 드러남을 건너뛰게 하거나 바꾸지 못한다.
  >
  > - 부른 쪽이 있는 자리(사슬 끝, `validate()`·제출의 거부, 호출자 오류의 즉시 throw): 남은 기록의 전달을 마친다. 그다음 원래 드러날 값(오류 하나 또는 이미 만든 묶음)을 펼치지 않고 앞에, 핸들러 예외들을 뒤에 두고 발생 순서대로 `SchemaFormError` 하나(`details.errors`)로 묶어 던지거나 거부한다. 원래 오류 객체는 `details.errors`에 그대로 남는다. 경고만 있던 사슬이면 핸들러 예외(둘 이상이면 묶음)를 사슬 끝에서 던진다.
  > - 부른 쪽이 없는 자리(커밋 뒤 이펙트, 마이크로태스크, `componentDidCatch`, 네이티브 submit): 원래 사건의 싱크는 그대로 부르고, 핸들러의 예외는 싱크로 한 번 보내며, 남은 기록의 전달은 계속한다. `componentDidCatch` 밖으로 예외를 내보내지 않으므로 호스트의 바운더리가 화면을 내리지 않는다.
  > - 핸들러 자신의 예외는 `onError`에 다시 보내지 않는다(재귀가 없다).
  > - async 핸들러가 거부하면, 반환값을 무시한다는 규칙에 따라 그것은 호스트 자신의 프로미스이므로 폼이 잡지 않는다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:160-166`(정본)
- 닫은 사람: 17라운드 스웜 수렴(편집자 결정)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:160`

### ERROR-029 핸들러 안의 쓰기 규칙

- 결정:
  > **핸들러 안의 쓰기.** 전달하는 동안 폼 인스턴스의 '전달 중' 표지를 켠다. 그 사이 이 폼에 대한 쓰기(`setValue`, `reset`, `batch`, 배열 `push`·`remove`·`update`, 상태 쓰기, `setExternalErrors`·`clearExternalErrors`)는 호출자 오류(`SchemaFormError`, 가칭 `WRITE_IN_OBSERVER`)로 즉시 던지며 `onError`에 보내지 않는다. 그 예외가 핸들러 밖으로 새어 나가면 '핸들러가 던질 때'의 규칙을 따른다. `validate()`는 허용한다. 동기 진입을 열지 않고 결과는 자기 파동으로 오기 때문이다. 다만 실패 기록(`VALIDATOR_THREW`) 안에서 `validate()`를 다시 부르면 실패가 되풀이될 수 있으므로 그렇게 하지 말라고 문서에 적는다. 호스트의 setState와 다른 폼에 대한 쓰기는 막지 않는다. 비용은 불리언 하나다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:167`(정본), `08-design-a-to-z.md:363`
- 닫은 사람: 17라운드 스웜 수렴(편집자 결정)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:167`

### ERROR-030 onError의 비용 규칙

- 결정:
  > **비용.** 소비자가 있는지는 '핸들러가 있음 또는 `process.env.NODE_ENV !== 'production'`(정적 치환)'으로 판정한다(판정은 보고기의 `hasConsumer()`로 사건마다 한다).
  >
  > - 소비자가 없을 때(핸들러 없는 프로덕션): 기록 객체, 메시지 서식, 경고 집합, 정착 경고 판정, 청사진 경고 데이터를 만들지 않는다. 오늘 프로덕션에서 돌다 버려지는 경고 검출과 서식(`warnIfNullUnreachable.ts:25-38`, `processAllOfSchema.ts:38-44`)도 건너뛰므로 오늘보다 싸다.
  > - 청사진: 소비자가 있을 때 수집기 인자로 경고를 데이터(code, 위치, details, 서식 없음)로 모아 캐시에 담는다. 소비자 없이 만들어진 캐시 청사진을 핸들러를 가진 폼이 처음 쓰면, 그 작성 루트에 경고 수집을 한 번 돌려 캐시 항목에 붙인다. 작성 루트마다 한 번이며, 캐시와 함께 해제된다.
  > - 핸들러가 있을 때: 사건마다 작은 객체 하나를 만든다. 정착 경고는 그 정착이 다룬 `oneOf` 호스트에서 이미 계산한 게이트 결과를 세는 것이라 분기 수에 비례하고, 추가 순회가 없다. 경고 집합은 서로 다른 경고 수 이하이고 로드마다 비운다. `WeakSet`은 약한 참조다.
  > - 노드 수에 비례하는 칸은 없다. 오류 객체를 새로 만들지 않고 경고는 평범한 기록이므로 스택 수집 비용도 없다. 08 §16.2의 '프로덕션 비용 없이 추적성'을 지킨다.
- 보충:
  > "core는 트리를 만들 때 보고기(`report`, `hasConsumer`, 가칭)를 인자로 받는다. 핸들러가 없는 프로덕션은 기록, 메시지 서식, 경고 판정을 하나도 만들지 않으므로 비용이 없다(§16.2의 고속성 대 투명성 유지)." (`08-design-a-to-z.md:364`)
- 상태: 현행
- 출처: `adr/0014-error-policy.md:169-174`(정본), `08-design-a-to-z.md:364`
- 닫은 사람: 17라운드 스웜 수렴(편집자 결정)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:169`

### ERROR-031 공개 계약과 판 규칙

- 결정:
  > **공개 계약과 판 규칙.** 오늘 오류·경고 코드는 공개 계약이 아니다. `package.json`의 `exports`는 '.'뿐이고, `src/index.ts`는 판별 함수만 내보내며, 경고 상수는 내부 배럴 `src/helpers/warning`에 있다. 이 결정은 코드 문자열 목록을 새로 공개한다(공개 표면이 넓어지는 대가다). 형 `FormErrorCode`는 이름으로 내보내고, 런타임 상수 묶음은 소비자가 드러날 때 더한다. README와 docs에 코드 표(코드, level, 부류, 언제, 누구 잘못, 기본 드러남)를 싣는다. 코드를 더하면 minor, 이름을 바꾸거나 없애면 major다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:176`(정본), `08-design-a-to-z.md:365`
- 닫은 사람: 편집자 결정(17라운드, ADR 0014 4판 채택)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:176`

### ERROR-032 착수 조건과 PR 배치

- 결정:
  > **착수 조건과 PR 배치.**
  >
  > - PR-1: 청사진 오류와 경고를 수집기 인자로 데이터화한다(code, `schemaPath`·`path`, details, 판별 칸). 캐시 청사진의 늦은 경고 수집을 넣고, `warnDevelopmentIssue` 호출 자리를 수집기 뒤로 정리한다.
  > - PR-4: 기록 형과 코드 형, core가 인자로 받는 보고기(`report`, `hasConsumer`), 사슬 끝의 기록마다 전달, core 경로의 핸들러 예외 규칙, 전달 중 쓰기 거부, 경고의 구조 키, 정착 경고 판정의 소비자 조건, `ValidationIssue` 개명, `ValidateFunction`의 문서 주석('입력의 판정은 돌려주고 던지지 않는다. 던지면 실행 실패다')을 넣는다.
  > - PR-7: Form 속성, 바깥 감싸개와 보고기 문맥, 로드 기록의 준비 이펙트 전달, 바운더리의 렌더 때 보고기 읽기와 `componentStack`, 네이티브 submit 경로의 오류 층 거부 처리, `@winglet/react-utils`의 minor 변경(그 모듈의 `DETAIL.md`를 먼저 갱신)을 넣는다.
  > - PR-8: 코드 표와 이주 안내를 넣는다.
  > - 착수 조건: 검증 결과 형의 `ValidationIssue` 개명(08 §14)이 `onError`의 공개보다 먼저(또는 같은 PR에) 선다. 오늘은 `onValidate`가 공개 형 `JSONSchemaError[]`를 받는다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:178-184`(정본), `08-design-a-to-z.md:571-578`
- 닫은 사람: 편집자 결정(17라운드, ADR 0014 4판 채택)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:178`

### ERROR-033 controls의 식이 던질 때 — 자리별 값

- 결정:
  > 식은 네 자리에서 평가된다. 던지면 그 자리마다 정의된 값으로 정착을 마치고, 사슬의 끝에서 모든 환경에서 throw한다(R17-1 나, 가칭 코드 `SCHEMA_FORM_ERROR.EXPRESSION_THREW`, 원래 예외는 `details.error`).
  >
  > | 자리 | 던지면 |
  > | --- | --- |
  > | 게이트(`if` 게이트 함수와 그 가드, `controls.active`) | 그 게이트는 거짓이다 |
  > | 상태 키(`controls.visible`·`controls.readOnly`·`controls.disabled`, 조각과 `controls.children`의 `controls`) | 그 선언은 없는 것이다 |
  > | 파생 규칙(`controls.derived`·`controls.injectTo`·`controls.unsetValue`), 동적으로만 아는 `controls.injectTo` 대상이 없음 | 그 규칙을 그 라운드의 후보에서 빼고 에지를 소비한다 |
  > | `controls.resetInteraction` | 그 판정은 거짓이다 |
  >
  > 정적으로 아는 `controls.injectTo` 대상 경로(식이 아닌 경로 문자열)가 청사진에 없거나 터미널 아래면 청사진 오류다. 형상에 없는(비활성) 노드를 가리키는 것은 오류가 아니다 — 형상에 없는 노드의 규칙은 평가하지 않고 그 노드에 쓰지도 않는다(원장 §3). 식이나 가드가 던져 거짓이 된 게이트로 나간 노드에는 나감 비움을 적용하지 않는다(작성자의 잘못으로 커밋된 값을 잃지 않는다). 어느 자리든 식이나 가드가 던지면 그 커밋은 `degraded`다(§5). 가드의 평가 실패와 컴파일 실패는 가칭 `SCHEMA_FORM_ERROR.GUARD_FAILED`, 동적 대상 없음은 가칭 `SCHEMA_FORM_ERROR.INJECT_TARGET_MISSING`이다.
- 보충: 없음
- 상태: 분할됨(→ ERROR-120, ERROR-121, ERROR-122, ERROR-123, ERROR-124, ERROR-125, ERROR-126, ERROR-127)
- 출처: `adr/0014-error-policy.md:188-197`(정본)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 편집자 결정(17라운드, ADR 0014 4판 채택; 자리별 값 표와 나감 비움 미적용은 14라운드 제안 판 `adr/0014-error-policy.md:53-58`(커밋 `d478a8503`)에서 이어짐)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:188`

### ERROR-034 diagnostics — 정의, 모양, 지속과 제출 거부

- 결정:
  > `diagnostics`는 상태(`raw`·`extras`)도 계산 결과((스키마, 원본)의 함수)도 아니라 **작업의 기록**이다(원장 §2의 분류. 재계산 목록·`revision`·커밋 번호와 같은 칸). 로드(마운트, 스키마 교체, 루트 전체 교체 `setValue(V)`, `reset`)에서 초기화한다. 모양은 `{ status: 'stable' | 'degraded', cause?: 'budget' | 'expression' | 'injectTarget' | 'sharedConflict', exceededBudget?: 'hostWheel' | 'derive' | 'transition', iterations?, commit? }`이며 모든 칸은 `commit` 번호의 커밋을 기술한다. 작성자의 선언이 빠지거나 뜻대로 평가되지 못한 커밋 — 원본 B, 어느 자리든 `controls`의 식·가드의 throw, 동적 `controls.injectTo` 대상 없음, 공유 충돌 — 이 하나라도 있으면 `status = 'degraded'`이고 `commit`은 그 첫 커밋 번호다. `cause`는 예산 초과면 `'budget'`, `controls`의 식이나 `if` 가드의 평가·컴파일 실패면 `'expression'`, 동적 대상 없음이면 `'injectTarget'`, 공유 충돌이면 `'sharedConflict'`다(R17-1 나가 식과 가드의 실패를 한 묶음으로 둔 것을 따른다). 마운트 정착에서 난 것이면 `degraded`로 시작한다(§2).
  >
  > **다음 로드까지 남는다.** 지속은 14라운드 답 O-2 가다. 원인을 넷으로 넓힌 것과 그 동안의 제출 거부는 17라운드 소유자 답 R17-1 나다(10라운드 B-1의 제출 비차단을 대체한다). 그 동안 `<Form>`의 제출 경로(`FormHandle.submit`, `useFormSubmit`, 네이티브 submit — 모두 `async onSubmit` 하나로 모인다)는 `SchemaFormError`(가칭 코드 `SCHEMA_FORM_ERROR.SUBMIT_WHILE_DEGRADED`, 제출 시도마다 새 객체)로 거부한다. `FormHandle.submit`과 `useFormSubmit`은 그 프로미스를 거부하고, 부른 쪽이 기다리지 않는 네이티브 submit은 `onError` 뒤 싱크로 보낸다. core는 제출을 모르므로 거부는 렌더 계층의 일이다(P5). `getValue()`는 막지 않는다.
  >
  > **제출이 막힐 때 호스트가 그릴 자리.** 폼은 `degraded`를 화면에 그리지 않는다. 호스트는 두 자리에서 폼 수준 표시(배너, 제출 버튼의 비활성 같은 것)를 그린다. 하나는 제출 거부의 `SchemaFormError`다(`FormHandle.submit`·`useFormSubmit`의 거부, 네이티브 submit이면 `onError` 기록). 다른 하나는 `onDiagnosticsChange`(`status`와 `cause`)로, 제출 전에 막힘을 미리 알 수 있다. 호출자는 로드(스키마 교체, 루트 전체 교체 `setValue(V)`, `reset`)로 `stable`로 되돌린다.
  >
  > 되먹임 파동과 `onChange` 중첩의 초과는 소비자 코드의 쓰기를 거부한 것이지 작성자의 선언을 뺀 것이 아니므로 `diagnostics`에 남기지 않고 사슬의 끝에서 던지기만 한다(ADR 0008 §2 규칙 4·§8의 `exceededBudget` 다섯 값을 셋으로 줄인다).
- 보충:
  > "리스너 되먹임 파동을 넘기면 마지막 파동은 배달하되 그 파동 안의 되먹임 쓰기를 거부한다. `onChange` 중첩을 넘긴 쓰기는 적용하고 통지하되 그 `onChange` 하나는 부르지 않는다. 이것이 "예산 초과 시에도 `onChange`는 불린다"의 유일한 예외다." (`02-target-overview.md:169`)
  > "되먹임·중첩 초과는 사슬 끝에서 던지되 `diagnostics`에 남기지 않고 제출을 막지 않는다(O-2는 정착 예산에 대한 답이다)." (`02-target-overview.md:310`)
  > "상한 = 게이트 가진 조각 수 + 노드 게이트 수 + 1" (`adr/0002-guard-fragment-model.md:115`, 호스트 바퀴 예산의 계산식)
  > "`diagnostics.iterations`는 초과한 예산이 쓴 반복 횟수(상한값)다." (`03-mental-model.md:116`)
  > 소유자(10라운드 A-4): "루프의 가능성을 제한하지는 않는다. 이때문에 순환된 값이 진동하거나 발산할 수 있으며, 이를 막기 위한 상한값이 있고, 그 상한값을 초과하면 적절한 error 를 표시한다. 이는 react 의 hook 과 동일한 설계를 갖는다." (`reviews/round-10-owner-answers.md:10`)
  > "상한은 루프를 잇는 고리 하나만 끊는다 — 정착 예산은 자동 쓰기, 되먹임 파동은 그 파동의 되먹임 쓰기, `onChange` 중첩은 그 호출(원장 §4)." (`adr/0007-settle-cycle.md:47`)
  > "**고정점이 없는 스키마는 지원 범위 밖이다.** 게이트 의존 관계에 부정을 포함한 순환이 있으면 결과는 상한에서 결정적이되 임의적이고 `degraded`(`cause`는 예산)로 표시된다(F3). 대표적인 진동은 `if: { not: { required: ['x'] } }, then: { properties: { x: { default: 1 } } }`다." (`adr/0007-settle-cycle.md:64`)
  > "emit 참조가 바뀌지 않은 쓰기는 `onChange`를 내지 않으므로 예산 초과가 보이지 않기 때문이다(06 §4.9, C2)." (`adr/0008-event-system.md:157`)
  > "`onChange`·`onDiagnosticsChange`는 준비 전의 호출을 버린다(마운트 뒤의 `diagnostics`는 핸들로 읽는다)." (`09-landing-and-test-strategy.md:48`)
  > "`onChange`·`onDiagnosticsChange`는 마운트 동안의 호출을 오늘처럼 버린다." (`08-design-a-to-z.md:367`)
- 상태: 분할됨(→ ERROR-128, ERROR-129, ERROR-130, ERROR-131, ERROR-132, ERROR-133, ERROR-134, ERROR-135, ERROR-136, ERROR-137, ERROR-138, ERROR-139, ERROR-140, ERROR-141, ERROR-142)
- 출처: `adr/0014-error-policy.md:199-207`(정본), `08-design-a-to-z.md:397`, `03-mental-model.md:67,116`, `02-target-overview.md:148,169,310-312,332`, `adr/0006-single-value-ownership.md:37`, `adr/0007-settle-cycle.md:47,59,64,116,145`, `adr/0008-event-system.md:157,160,161-164,169-171`
- 닫은 사람: 소유자 답(`reviews/round-14-owner-answers.md:8` O-2), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 편집자 결정(17라운드, `exceededBudget` 다섯 값을 셋으로 줄이고 되먹임·중첩 초과를 `diagnostics`에서 뺌, `adr/0014-error-policy.md:207`·`02-target-overview.md:310`)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:203`
- 충돌:
  > `03-mental-model.md:116`의 "소유자(12라운드)"는 10라운드 A-4·B-1의 발언을 12라운드로 귀속한다. 정본과 다르다. 정본이 이긴다(`reviews/round-10-owner-answers.md:10,13`, K8).

### ERROR-035 검증기의 출처와 기본 검증 모드

- 결정:
  > 검증기는 플러그인(전역 기본) 또는 Form 속성 `validatorFactory`(그 폼의 인스턴스, 14라운드 답 O-7)에서 온다. 어느 경우도 청사진 오류가 아니며 폼은 선다. 기본 검증 모드 `OnChange | OnRequest`는 그대로 두고 '검증기가 있으면 `OnChange`, 없으면 `None`' 같은 암묵 기본값은 두지 않는다.
- 보충:
  > "검증기는 두 자리에서 온다: 전역 기본인 플러그인과, 그 폼만의 인스턴스를 주입하는 Form 속성 `validatorFactory`(14라운드 확정: 없애지 않고 넓힌다. 같은 계약 `compile` + `compileGuard`를 받고 플러그인보다 앞선다). 미등록 판정은 둘을 함께 본다. 둘 다 없어도 청사진 오류가 아니다." (`08-design-a-to-z.md:345`)
- 상태: 분할됨(→ ERROR-143, ERROR-144, ERROR-145)
- 출처: `adr/0014-error-policy.md:211`(정본), `08-design-a-to-z.md:345`, `02-target-overview.md:175`
- 닫은 사람: 편집자 결정(17라운드, ADR 0014 4판 채택)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:211`

### ERROR-036 검증기 없음 — 거부하지 않고 경고로 알림

- 결정:
  > - **검증기 없음**(플러그인에도 `validatorFactory`에도 없고 검증 모드가 `None`이 아님): 거부하지 않고 검증 없이 진행한다(17라운드 소유자 답, 통보3: "오류만 내보내고 거절은 하지 마시죠. 사용자가 인지만 하면 될거고, 기본값이 있어서 사용자가 오히려 불편할겁니다"). 개발 모드 콘솔과 `onError`의 경고 기록(`level: 'warning'`, 가칭 코드 `SCHEMA_FORM_WARNING.VALIDATOR_MISSING`, 17라운드 소유자 답 (가))으로 알린다. 트리마다 한 번(마운트, 재생성 reset) 보내고, 값을 통째로 바꾸는 `setValue`나 같은 스키마 reset에서는 다시 보내지 않는다. 전달 시점은 마운트면 준비 이펙트, 재생성 reset이면 reset 사슬 끝이다. 프로덕션에는 기본 출력이 없다. 검증을 쓰지 않는 폼은 검증 모드를 `None`으로 적으면 알림이 없다.
- 보충: 없음
- 상태: 분할됨(→ ERROR-146, ERROR-147, ERROR-148, ERROR-149, ERROR-150, ERROR-151)
- 출처: `adr/0014-error-policy.md:213`(정본), `08-design-a-to-z.md:345`, `03-mental-model.md:233,234`, `02-target-overview.md:175,235`, `adr/0004-validator-plugin-compile-guard.md:9,35`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:14` 통보 3), 소유자 답(`reviews/round-17-owner-answers.md:33` (가))
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:14`

### ERROR-037 조건부 스키마와 검증기 없음

- 결정:
  > - **조건부 스키마.** ADR 0004의 합의("조건부 비활성 + 경고", 소유자 동의)를 유지한다. 검증기가 없으면 `if` 게이트의 조각은 꺼진 채 두고 경고(가칭 `SCHEMA_FORM_WARNING.CONDITIONAL_SCHEMA_WITHOUT_VALIDATOR`)를 트리마다 한 번 낸다.
- 보충:
  > "조건부 스키마를 쓰는 폼에서 검증기가 등록되지 않았으면 조건부 장치는 동작하지 않고 경고를 낸다(17라운드 스웜 수렴(편집자 결정)으로 유지한다. ADR 0014 옛 판의 대체안은 버렸다)." (`adr/0004-validator-plugin-compile-guard.md:35`)
  > 소유자: "동의. 단, 그럼 플러그인도 변경 범위에 포함해서, error 처리를 생략한 단순 검증 기능도 제공하도록 하자." (`adr/0004-validator-plugin-compile-guard.md:54`)
- 상태: 분할됨(→ ERROR-152, ERROR-153, ERROR-154)
- 출처: `adr/0014-error-policy.md:214`(정본), `adr/0004-validator-plugin-compile-guard.md:35,54`, `02-target-overview.md:175,235`
- 닫은 사람: 소유자 답(`adr/0004-validator-plugin-compile-guard.md:54`), 17라운드 스웜 수렴(편집자 결정, `adr/0004-validator-plugin-compile-guard.md:35`)
- 라운드: 17
- 까닭: `adr/0004-validator-plugin-compile-guard.md:35`
- 충돌:
  > `03-mental-model.md:231`의 "소유자 동의(`adr/0004:46`)"는 동의 위치를 `adr/0004:46`으로 가리킨다. 정본과 다르다. 정본이 이긴다(`adr/0004-validator-plugin-compile-guard.md:54`, 실제 소유자 동의 위치, K11).

### ERROR-038 검증 불가 — 전체 스키마 컴파일 실패

- 결정:
  > - **검증 불가**(검증기는 있으나 전체 스키마 컴파일이 실패함): 한 로드에 오류 객체 하나(가칭 `SCHEMA_FORM_ERROR.VALIDATOR_COMPILE_FAILED`)로 커밋 뒤 첫 `OnChange` 검증, `validate()`, 제출을 모든 환경에서 거부하고(R17-1 나), `onError`와 (부른 쪽이 없으면) 싱크로 한 번 드러낸다. 그 로드에서 `OnChange` 검증을 다시 예약하지 않는다. 노드 `errors`에는 넣지 않는다(사용자의 잘못이 아니다). 통보3의 근거(검증 없이 폼만 그리는 사용예, 기본 모드의 불편)는 검증기를 준 이 경우에 닿지 않는다.
- 보충: 없음
- 상태: 분할됨(→ ERROR-155, ERROR-156, ERROR-157, ERROR-158)
- 출처: `adr/0014-error-policy.md:215`(정본), `08-design-a-to-z.md:345`, `02-target-overview.md:175`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:84` E3; 한 로드에 오류 객체 하나, 그 로드에서 다시 예약하지 않음)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:215`

### ERROR-039 검증 실행 실패

- 결정:
  > - **검증 실행 실패**(검증 함수의 런타임 throw, 요청 시점의 `$ref` 순환, 가칭 `SCHEMA_FORM_ERROR.VALIDATOR_THREW`): 호출자가 기다리는 `validate()`와 제출은 그 프로미스의 거부로 드러낸다. `OnChange` 검증이면 `onError`에 한 번, 이어 싱크로 한 번 드러내며, core가 소유한 프로미스를 미처리 거부로 남기지 않는다. 모든 환경에서 같다. 입력의 판정과의 경계는 `ValidateFunction`의 문서 주석 '입력의 판정은 돌려주고 던지지 않는다. 던지면 실행 실패다'로 못박는다. 그래서 실행 실패는 검증 결과가 아니며 `onValidate`로 가지 않는다.
- 보충:
  > "폼 쪽 타입은 이미 동기 반환을 허용한다: `Promise<JSONSchemaError[] | null> | JSONSchemaError[] | null`(`src/types/error.ts:209-212`)." (`adr/0004-validator-plugin-compile-guard.md:21`)
- 상태: 현행
- 출처: `adr/0014-error-policy.md:216`(정본), `08-design-a-to-z.md:349`, `adr/0004-validator-plugin-compile-guard.md:21`
- 닫은 사람: 17라운드 스웜 수렴(편집자 결정)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:216`

### ERROR-040 로드 검증의 자리

- 결정:
  > - **로드 검증의 자리.** 마운트 로드는 검증을 요청하지 않고, 렌더 계층이 준비 시점(폼이 커밋된 뒤, 오늘 `handleReady`의 자리)에 `OnChange` 비트가 켜져 있으면 한 번 요청한다. reset의 로드는 진입 끝에서 요청한다. 규칙은 '로드 뒤 `OnChange` 비트면 한 번'으로 같다. 그래서 서버 사이드 렌더링에서는 검증이 돌지 않는다. core만 쓰는 호스트(C3)는 마운트 검증을 직접 요청한다.
- 보충:
  > "로드 뒤의 검증 요청은 규칙이 하나다: 로드 뒤 `OnChange` 비트가 켜져 있으면 한 번. 요청 자리는 마운트는 렌더 계층의 준비 시점(폼이 커밋된 뒤, 오늘 `handleReady`의 자리), reset은 진입 끝이다. 그래서 서버 사이드 렌더링에서는 검증이 돌지 않으며, core만 쓰는 호스트(C3)는 마운트 검증을 직접 요청한다(§14의 38행, 17라운드 스웜 수렴(편집자 결정))." (`08-design-a-to-z.md:349`, 문장 #3-4)
- 상태: 현행
- 출처: `adr/0014-error-policy.md:217`(정본), `08-design-a-to-z.md:349#3-4`(같은 줄의 나머지는 다른 항목이 담는다: #1은 VALIDATE-006, #2는 EVENT-028, #5–7은 ERROR-039, #8은 VALIDATE-001)
- 닫은 사람: 17라운드 스웜 수렴(편집자 결정)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:217`

### ERROR-041 가드 — 컴파일 시점과 실패의 처리

- 결정:
  > - **가드.** 프로덕션에서 가드는 처음 필요할 때 늦게 컴파일한다(작성 루트 기준 캐시. ADR 0004의 '늦추고'는 프로덕션의 규칙으로 유지한다). 개발 모드에서는 청사진에서 모든 가드를 한 번 컴파일해 본다. 어느 환경이든 컴파일 실패는 그 게이트의 가드 실패다(게이트는 거짓, R17-1 나에 따라 정착 오류, §4). 청사진 오류가 아니므로 두 환경의 형상이 같고(G5), 개발 모드가 앞당기는 것은 `onError` 기록의 시점(마운트의 커밋 뒤)뿐이다. 프로덕션에서 한 번도 평가되지 않은 가드의 실패는 기록이 없다.
- 보충:
  > "AJV에서 가드의 호출은 싸고(좁은 가드 5–58 ns, 루트에 걸린 가드 200개를 키 입력마다 전부 돌려 7.9 µs) 비싼 것은 **컴파일**이다(가드 하나에 70–270 µs, 200개면 폼 생성 시점에 14–54 ms)." (`adr/0004-validator-plugin-compile-guard.md:46`)
  > "컴파일의 실패(지원하지 않는 정규식 등)를 폼 생성의 실패로 둘 것인가. Python 정규식 `(?i)…`은 Ajv 컴파일이 throw한다. 17라운드에 닫혔다: 가드 컴파일의 실패는 폼 생성의 실패가 아니라 그 게이트의 가드 실패(정착 오류)이고, 전체 스키마 컴파일의 실패는 검증 불가다(위 결정 절, ADR 0014 4판)." (`adr/0004-validator-plugin-compile-guard.md:78`)
- 상태: 현행
- 출처: `adr/0014-error-policy.md:218`(정본), `08-design-a-to-z.md:180`, `adr/0004-validator-plugin-compile-guard.md:9,46,78`, `08-design-a-to-z.md:345`
- 닫은 사람: 17라운드 스웜 수렴(편집자 결정)
- 라운드: 17
- 까닭: `08-design-a-to-z.md:180`

### ERROR-042 검증기 관련 이주 안내

- 결정:
  > 이주: 검증기 없이 쓰던 폼은 그대로 동작하며 경고를 받는다. 알림을 없애려면 검증 모드를 `None`으로 적는다. 서버 사이드 렌더링을 쓰면 검증기 등록은 서버와 클라이언트 모두에서 한다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:220`(정본), `08-design-a-to-z.md:345`
- 닫은 사람: 편집자 결정(17라운드, ADR 0014 4판 채택)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:220`

### ERROR-043 §7.1 분류표 — 부류·층·언제·누구 잘못·드러남·항목

- 결정:
  > (원장 §5의 표를 대체한다)
  >
  > | 부류 | 층 | 언제 | 누구 잘못 | 드러남 | 항목 |
  > | --- | --- | --- | --- | --- | --- |
  > | 청사진 오류 | 오류 | 청사진 분석 | 작성자 | 마운트: 생성 자리에서 잡아 대체 화면, 커밋 뒤 `onError`와 싱크. 폼이 서지 않는다. reset 안: reset이 던짐(`JSONSchemaError`). 재대조: 지금 트리를 둔 채 싱크 | 지원하지 않는 `type`; 배열 형태 모순; 정적 연언의 `type` 재정의·`const` 충돌·불가능한 범위·공집합 `enum`; `options.virtual` 참조 오류; `controls`의 식의 컴파일 실패; 게이트 없는 선언끼리(본체·게이트 없는 `allOf` 항목·게이트 없는 분기) 같은 이름·다른 종류를 선언함(늘 함께 켜지므로 충돌이 확실하다, O-10); `controls.discriminator`의 키가 어느 분기에도 `const`·`enum`으로 없거나, 있는 분기끼리 종류가 다르거나 값이 겹침(O-1. 일부 분기에만 없는 것은 그 분기가 게이트 없음일 뿐 오류가 아니다); 정적으로 아는 `controls.injectTo` 대상 경로가 청사진에 없거나 터미널 아래임; 선언 사이 터미널 전략 불일치; `controls`·`options` 안의 모르는 키(15라운드) |
  > | 마운트 정착 오류 | 오류 | 마운트의 첫 정착 | 작성자 스키마·호출자 데이터 | 원인별(§2). 공유 충돌은 모든 환경에서 폼이 서지 않고 대체 화면. 예산 초과·식·가드 실패·동적 대상 없음은 폼이 서고 `degraded`로 시작하며 커밋 뒤 `onError`와 싱크 | 첫 정착의 예산 초과, 식·가드 실패, 동적 `controls.injectTo` 대상 없음, 공유 충돌 |
  > | 청사진 경고 | 경고 | 청사진 분석 | 작성자 | 개발 모드 로그. `onError` 경고 기록(핸들러가 있으면 모든 환경) | `oneOf`·`anyOf` 분기에 `if`는 있고 `else: false`가 없음; `null` 분기 무시; `allOf` 키워드 무시; 터미널이 아닌 객체 노드의 잠금(표준 `readOnly`, `controls.readOnly`·`controls.disabled`. 효과 없음) |
  > | 정착 오류 | 오류 | 마운트 뒤 정착의 계산·파생·전이·커밋 | 작성자 스키마·호출자 데이터 | 커밋·통지 뒤 사슬의 끝에서 throw, 모든 환경(`SchemaFormError`, 식 예외는 `details.error`). `diagnostics`가 `degraded`로 남고 그 동안 제출을 거부한다 | 예산 초과(호스트 바퀴·파생·전이. 원본 B 커밋); 게이트에 달린 선언이 실제로 동시에 켜짐(작성자가 선언한 노드 하나가 형상에서 빠진다, P1′. 전순서에서 앞선 종류로 커밋한 뒤 throw); 어느 자리든 `controls`의 식이나 `if` 게이트 함수의 런타임 throw와 가드의 평가·컴파일 실패(§4: 게이트는 거짓, 상태 키 선언은 없음, 파생 규칙은 후보 제외, `controls.resetInteraction`은 거짓); 동적으로만 아는 `controls.injectTo` 대상이 없음 |
  > | 정착 경고 | 경고 | 정착의 계산 | 작성자 스키마 | 개발 모드 로그. `onError` 경고 기록(핸들러가 없는 프로덕션에서는 판정하지 않음) | 같은 `oneOf`에서 게이트 가진 분기가 둘 이상 켜짐(소유자 답 20). 같은 대상 규칙 둘은 경고가 아니다(13라운드 답 4). 켜진 `then`과의 런타임 교차가 공집합인 것은 경고도 오류도 아니다 — 검증기가 값을 기각한다(검증 결과) |
  > | 정착 추적 | (기록) | 정착 | — | 개발 모드에서 정착마다 기록(진입, 라운드별 규칙·원천·대상·값·결과, 예산 초과 시 마지막 라운드). `onError`에 가지 않음 | 자동 쓰기 다섯의 출처(C2·P2) |
  > | 되먹임·중첩 오류 | 오류 | 통지 | 소비자 코드 | 그 고리 하나를 끊고(되먹임 쓰기 거부, `onChange` 하나 생략) 사슬의 끝에서 throw, 모든 환경. `diagnostics`에 남기지 않는다 | 리스너 되먹임 파동 25, `onChange` 중첩 25 |
  > | 리스너 오류 | 오류 | 통지 | 소비자 코드 | 배달을 끝내고 사슬의 끝에서 throw, 모든 환경. 검증 결과 파동의 리스너와 `onValidate`가 던진 것은 `onError` 뒤 싱크 | 구독 리스너, `onChange`, `onStateChange`, `onDiagnosticsChange`가 던진 예외, `batch` fn의 예외, 검증 결과 파동의 리스너와 `onValidate`의 예외 |
  > | 호출자 오류 | 오류 | 공개 API 호출 | 호출자 | 즉시 throw(`SchemaFormError`, 등록은 `UnhandledError`) | `FormTypeInputMap` 패턴(렌더 중 정규화에서 던져져 루트 바운더리가 가두므로 드러남은 렌더 오류 행을 따른다), 플러그인 등록 실패(폼 밖이라 `onError`에 가지 않음), `Overwrite`와 `Merge`를 함께 준 `setValue`, 재생성 reset으로 폐기된 노드에 대한 쓰기, `onError` 관찰자 안의 쓰기(`onError`에 가지 않음) |
  > | 제출 거부 | 오류 | 제출 | 작성자 스키마·호출자 데이터(폼이 `degraded`) | `FormHandle.submit`·`useFormSubmit`은 `SchemaFormError`로 거부, 네이티브 submit은 `onError` 뒤 싱크, 모든 환경. 렌더 계층의 일이며 core는 제출을 모른다 | `diagnostics.status === 'degraded'` 동안의 제출 |
  > | 검증기 경고 | 경고 | 트리 생성(마운트, 재생성 reset) | 호출자(검증기를 주지 않음) | 거부하지 않음. 개발 모드 로그, `onError` 경고 기록(트리마다 한 번) | 검증기 없음(검증 모드가 `None`이 아님); 검증기가 없어 `if` 조각이 꺼짐 |
  > | 검증기 오류 | 오류 | 검증 요청 | 플러그인·호출자 | `validate()`와 제출의 거부, `OnChange` 검증이면 `onError` 뒤 싱크, 모든 환경 | 검증기는 있으나 전체 스키마 컴파일 실패(검증 불가, 한 로드에 한 번); 검증 함수의 런타임 throw, 요청 시점의 `$ref` 순환 |
  > | 렌더 오류 | 오류 | 렌더 | 소비자 코드(사용자 주입 구성 요소) 또는 호출자 | 바운더리가 가두어 대체 화면을 그리고 `componentDidCatch`에서 `onError`와 싱크. 다시 던지지 않는다 | 필드 바운더리가 감싼 구성 요소(`FormTypeInput`, 렌더러, `Placeholder`)의 렌더 오류, 루트의 렌더 오류, `formTypeInputMap` 정규화 오류 |
  > | 렌더 계층 경고 | 경고 | 렌더 계층 | 작성자·호출자 | 개발 모드 로그. `onError` 경고 기록 | 가상화를 켰는데 `IntersectionObserver`가 없음; `presentation` 키 의심(코어 키와 대소문자만 다름, 또는 `controls`·`options`의 키 이름) |
  > | 검증 결과 | 검증 결과 | 검증 뒤 | 사용자 입력 | 노드 `errors`(`ValidationIssue`), 제출 시 `ValidationError`. `onError`에 가지 않는다 | 검증기가 낸 항목 |
  >
  > 범위 밖: 렌더 중 쓰기는 core가 감지하지 않는다(P5). `controls.discriminator`의 키가 호스트 `properties`에 없는 것은 오류가 아니다(끌어올림, O-1). 오늘의 경고 `NULLABLE_ONE_OF_NULL_UNREACHABLE`은 분기 내용을 읽으므로 폐기하고, `VIRTUALIZATION_DISABLED_FOR_FORM`은 렌더 계층 경고로 옮긴다. 사용자 주입 구성 요소를 격리하는 필드 바운더리(`withErrorBoundary`, 패키지 규칙)는 그대로이며, 그 바운더리가 잡은 렌더 오류가 `onError`에 가는 것만 새롭다.
- 보충:
  > "개발 모드 경고는 게이트 결과, 키의 유무, 선언의 `type`, 등록 상태만 보며 `if`의 내용은 읽지 않는다. 검사하지 않는 것: 조건 프로퍼티가 `properties`에 있는지, `if`에 `required`가 있는지." (`08-design-a-to-z.md:390`)
  > "`presentation`의 모르는 키는 플러그인 자유 칸이다." (`02-target-overview.md:54`, 같은 문장이 `:59`, `03-mental-model.md:53`, `adr/0003-group-namespace.md:30`, `adr/0011-branch-node-composition.md:3`, `adr/0012-fe-overlay.md:3`에도 있음)
  > 소유자(14라운드 O-1): "가 로 하죠. 다만, discriminator 를 서로 다르게 선언했거나 discriminator 이 분기마다 다른 타입이나 성질을 가지면 오류로 알려줘야 합니다." (`reviews/round-14-owner-answers.md:7`)
  > "작성자 스키마의 잘못은 작성자 책임이고 폼은 고지 의무만 진다(소유자 답 2). 청사진에서 형상이 정해지지 않는 모순(오늘의 `JSON_SCHEMA_ERROR` 빌드 오류)은 고지가 아니라 throw다 — 형상 없이는 폼이 설 수 없다" (`03-mental-model.md:175`)
  > "(존재만 더하는 선언이다. 제약은 교차하지 않는다. 게이트 없는 분기와 같은 문맥. 편집자 도출)" (`03-mental-model.md:148`, `controls.discriminator` 변환의 성격에 대한 부연)
  > "서로소인 `enum` 둘이 켜진 조각과의 연언에서 동시에 활성이면 그 필드는 "지금 고를 수 있는 값이 없는" 상태가 되고, 폼은 막지 않으며 검증기가 값을 기각한다. 필드를 비우면 값이 유효해지는 경우가 있으므로 폼 전체를 멈춰서는 안 된다(R11-e)." (`adr/0005-blueprint-analysis-and-node-sharing.md:76`)
  > "`onChange` 안의 쓰기는 깊이 0에서 시작하므로 **새 진입**이다. 중첩 상한은 25이며, 26번째는 쓰기를 적용하고 검증도 요청하되 `onChange`를 건너뛰고 모든 환경에서 사슬 끝에서 throw한다(17라운드 소유자 답 R17-1 나). 이 초과는 `diagnostics`에 남기지 않고 제출을 막지 않는다(O-2는 정착 예산에 대한 답이다, ADR 0014 4판). 정착의 세 예산으로 생긴 `degraded`는 다음 로드까지 남고 그 동안 제출을 거부한다(§3, §8). 이 예산에서 건너뛰는 `onChange`는 상한 자체가 끊는 호출이다 — 26번째를 부르면 중첩이 멈추지 않는다. 상한이 없던 프로토타입 v4에서 항상 쓰는 `onChange`는 4 GB 힙을 채우고 죽었다." (`adr/0008-event-system.md:118`)
  > 소유자(12라운드 §9 경고 목록 일곱): "더 많을 수도 있다. 기존 error 종류와 용법을 참고해서 분류하라. 물론 기존 분류체계가 애매하면 다시 구성해도 무방" (`reviews/round-12-owner-answers.md:27`)
  > 소유자(10라운드 C-20 oneOf 다중 활성 경고): "예 이건 jsonSchema 스팩을 존중합니다" (`reviews/round-10-owner-answers.md:17`, §7.1 정착 경고 행의 소유자 답 20이 가리키는 답)
  > 소유자(10라운드 E-23 required 누락 경고, 확정): "이해했습니다. 다만, 이건 우리가 참견할 문제는 아닙니다. 평가하지 않습니다." (`reviews/round-10-owner-answers.md:38`, `03-mental-model.md:175-176`·`08-design-a-to-z.md:390`의 개발 모드 경고가 if의 내용은 읽지 않는다의 근거. E-19(`reviews/round-10-owner-answers.md:40`)도 같은 근거)
  > 소유자(10라운드 E-19, 되물음 답): "23에서 말한대로 굳이 안봐도 되지않나 싶습니다. 이렇게 말하는 이유는 그냥 if 문의 스키마로 지금 값을 평가하면 되는거라 굳이 그런 규칙은 없어도 될거같습니다. 말한대로 하는게 안전하긴 할텐데, if 문 내에 anyOf 나 oneOf, 아니면 다른 또 복잡한 스키마가 올 수도 있는거라 우리는 그걸 관여하기로 하면 끝이 없을거에요" (`reviews/round-10-owner-answers.md:40`)
  > "개발 모드에서 정착마다 기록: 진입(공개 API, 옵션 비트), 라운드별 {단계, 규칙 종류, 원천 경로, 대상 경로, 이전 값, 이후 값, 결과(적용 / 누구에게 짐 / `undefined`라 후보 아님 / 억제 / 최종 형상 밖이라 철회)}, 예산 초과 시 마지막 라운드의 규칙 목록. 프로덕션은 기록하지 않는다. `onError`에 가지 않는다" (`08-design-a-to-z.md:382`, §11.3 정착 추적 행의 세부)
  > "공개 payload에는 출처를 더하지 않는다(14라운드: 니즈가 약하다. 필요하면 나중에 더한다)" (`08-design-a-to-z.md:382`)
  > "동적 `controls.injectTo` 대상 없음(대상 경로가 청사진에 없거나 터미널 아래임. 형상에 없는 노드를 가리키는 것은 오류가 아니다, ADR 0014 §4)" (`08-design-a-to-z.md:383`, 동적 대상 "없음"의 정의)
  > "검증 모드가 `None`이 아니면 커밋 뒤 첫 검증 요청·`validate()`·제출이 모든 환경에서 거부된다(R17-1 나, §11.1)" (`08-design-a-to-z.md:386`, `adr/0014-error-policy.md:281`에도 있음)
- 상태: 분할됨(→ ERROR-159, ERROR-160, ERROR-161, ERROR-162, ERROR-163)
- 출처: `adr/0014-error-policy.md:222-244`(정본), `08-design-a-to-z.md:350-390`, `03-mental-model.md:178-198`, `02-target-overview.md:54,59,125,134,136,138,231,235`, `adr/0001-validator-input-invariant.md:3`, `adr/0002-guard-fragment-model.md:14`, `adr/0003-group-namespace.md:30`, `adr/0004-validator-plugin-compile-guard.md:78`, `adr/0005-blueprint-analysis-and-node-sharing.md:68,76,83,101,103,116`, `adr/0008-event-system.md:66,118`, `adr/0010-branch-conventions.md:18`, `adr/0011-branch-node-composition.md:3,59`, `adr/0012-fe-overlay.md:3`, `reviews/round-12-owner-answers.md:27`, `reviews/round-10-owner-answers.md:17,38`
- 닫은 사람: 편집자 결정(17라운드, ADR 0014 4판 채택), 소유자 답 O-1(`reviews/round-14-owner-answers.md:7`)·O-10(`reviews/round-14-owner-answers.md:16`), 소유자 답 C-20(`reviews/round-10-owner-answers.md:17`)·13라운드 답 4(`reviews/round-13-owner-answers.md:10`), 소유자 답 E-23·E-19(`reviews/round-10-owner-answers.md:38,40`)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:222-244`
- 충돌:
  > `08-design-a-to-z.md:383`의 "호스트 바퀴, 파생, 전이, 되먹임 파동, `onChange` 중첩의 초과"는 되먹임·중첩 초과를 "정착 오류" 부류, "정착" 시점으로 둔다. 정본과 다르다. 정본이 이긴다(`adr/0014-error-policy.md:234`, 별도 부류 "되먹임·중첩 오류", "통지" 시점, K3).
  > `08-design-a-to-z.md:385`의 "`FormTypeInputMap` 패턴, 플러그인 등록 실패(`UnhandledError`)"는 드러남이 "throw(`SchemaFormError`)"인 호출자 오류 행에 두고 렌더 오류 행을 따른다는 말이 없으며, 같은 문서 `:387`의 "| 렌더 오류 | 렌더 | 소비자 코드(사용자 주입 컴포넌트) |"에는 "호출자"도 "`formTypeInputMap` 정규화 오류"도 없다. 정본과 다르다. 정본이 이긴다(`adr/0014-error-policy.md:236,240`, K4).
  > `08-design-a-to-z.md:381`의 "렌더 계층 경고 | 렌더 | 작성자 |"는 누구 잘못을 작성자로만 둔다. 정본과 다르다. 정본이 이긴다(`adr/0014-error-policy.md:241`, "작성자·호출자", K5).
  > `08-design-a-to-z.md:380`의 "정착 경고 | 계산·파생 |"는 언제를 "계산·파생"으로 둔다. 정본과 다르다. 정본이 이긴다(`adr/0014-error-policy.md:232`, "정착의 계산", K6).
  > `08-design-a-to-z.md:377`의 "게이트 없는 분기끼리 같은 이름·다른 종류의 선언(ADR 0014)"은 범위를 게이트 없는 분기끼리로 좁히고 정적 `controls.injectTo`의 "터미널 아래"를 뺀다. 정본과 다르다. 정본이 이긴다(`adr/0014-error-policy.md:228`, 본체·`allOf` 항목까지 포함, K7).
  > `adr/0014-error-policy.md:228`의 "`controls.discriminator`의 키가 어느 분기에도 `const`·`enum`으로 없거나, 있는 분기끼리 종류가 다르거나 값이 겹침(O-1. 일부 분기에만 없는 것은 그 분기가 게이트 없음일 뿐 오류가 아니다)"는 O-1이 요구한 '선언 사이 값이 다름'을 적지 않는다. 정본과 다르다. 정본이 이긴다(`adr/0014-error-policy.md:260`, §7.2 `DISCRIMINATOR_MISMATCH` 행의 "선언 사이 값이 다름", K10).
  > `02-target-overview.md:231`의 "분기에 그 키의 `const`·`enum`이 없을 때, `$ref`·`allOf` 평탄화, 분기가 자기 `controls.active`도 가질 때의 세부는 미정(07 11.2, ADR 0005 §4)이다."은 첫 경우를 미정으로 둔다. 정본과 다르다. 정본이 이긴다(`adr/0014-error-policy.md:228`, K2).
  > `reviews/round-18-agenda.md:108`의 "`if`의 공허한 참 경고(Q10, `open-questions.md:68`)."는 이를 열린 안건으로 둔다. 정본과 다르다. 정본이 이긴다(`reviews/round-10-owner-answers.md:38,40`, E-23·E-19).
  > `reviews/round-18-agenda.md:17`의 "`controls.discriminator`의 세부(분기에 그 키의 `const`·`enum`이 없을 때, `$ref`·`allOf` 평탄화, 분기 자체 `controls.active`와의 AND)"는 첫 경우를 열린 안건으로 둔다. 정본과 다르다. 정본이 이긴다(`adr/0014-error-policy.md:228`, K2).

### ERROR-044 §7.2 코드 목록 — 코드·level·언제·자리·기본 드러남·핸들러 전달·오늘과 새 설계

- 결정:
  > 17라운드 4번 수렴의 목록 50행을 게이트 R17G-9와 R17G-2대로 고친 것이다. `(조건부) SCHEMA_FORM_WARNING.UNSET_ON_INACTIVE_ON_OBJECT` 행은 R17-2가 ㄴ으로 확정되어 지웠고, `presentation.trim`은 `PRESENTATION_KEY_SUSPECT`의 둘째 경우에 들며, `FormProvider`를 폼 인스턴스 밖으로 제외한 문구는 사실과 달라(`FormProvider`는 맵을 받지 않고 정의 정규화에는 던지는 자리가 없다) 지웠다. 검증기 없음과 조건부 스키마 경고는 트리마다 한 번이다. 끝에 설계 항목에서 생길 수 있는 코드의 행을 더했다. '(가칭)'인 코드 이름은 PR-4에서 확정한다. '(제외)' 행은 `onError`가 받지 않는 것이다. '자리'는 오늘 코드의 위치(`src/` 아래) 또는 이 ADR의 절이다. `surface`의 값은 `'thrown'`(사슬 끝이나 호출에서 던짐), `'rejected'`(프로미스 거부), `'sink'`(주인 없는 오류 싱크)다.
  >
  > | 코드 | level | 언제 | 자리 | 기본 드러남 | 핸들러 전달 | 오늘과 새 설계 |
  > | --- | --- | --- | --- | --- | --- | --- |
  > | `JSON_SCHEMA_ERROR.UNKNOWN_JSON_SCHEMA` | `error` | 청사진 분석(마운트, reset의 스키마 교체) | src/core/nodes/schemaNodeFactory.ts:116. 기록에 schemaPath | 마운트: 생성 자리에서 잡아 폼 자리에 대체 화면을 그리고 커밋 뒤 싱크(§2). reset 안: reset이 던짐. 재대조(레이아웃 효과): 지금 트리를 둔 채 그 레이아웃 효과에서 싱크(09 §2.6의 일곱째) | 받음. 마운트는 대체 화면의 이펙트(surface 'sink'), reset은 throw 직전('thrown'). 재대조는 그 레이아웃 효과('sink') | 오늘과 새 설계 모두 |
  > | `JSON_SCHEMA_ERROR.UNEXPECTED_ARRAY_SCHEMA` | `error` | 청사진 분석 | src/core/nodes/ArrayNode/validate.ts:26, :40, :53, :72. 기록에 schemaPath | 청사진 오류와 같음 | 청사진 오류와 같음 | 오늘과 새 설계 모두 |
  > | `JSON_SCHEMA_ERROR.ALL_OF_TYPE_REDEFINITION` 또는 CONFLICTING_CONST_VALUES 또는 INVALID_RANGE 또는 EMPTY_ENUM_INTERSECTION | `error` | 청사진 분석(정적 연언의 교차). 오늘은 노드 생성 때(src/core/nodes/schemaNodeFactory.ts:133의 processAllOfSchema)이며 Form 전처리가 아님 | src/helpers/jsonSchema/processAllOfSchema/processAllOfSchema.ts:46, intersectSchema/utils/intersectConst.ts:24, validateRange.ts:22, intersectEnum.ts:36. 오늘은 details에 경로가 없고, 새 설계는 schemaPath를 실음 | 청사진 오류와 같음. PR-1부터 교차 함수는 공집합 표시를 돌려주고 청사진만 던짐(08 §17 PR-1) | 청사진 오류와 같음 | 오늘과 새 설계 모두 |
  > | `JSON_SCHEMA_ERROR.COMPOSITION_TYPE_REDEFINITION` 또는 COMPOSITION_PROPERTY_REDEFINITION 또는 COMPOSITION_PROPERTY_EXCLUSIVENESS_REDEFINITION | `error` | 오늘: 합성 노드 표를 구성할 때 | src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getCompositionNodeMapList/getCompositionNodeMapList.ts:81, :96; utils/throwIfTypeRedefinition.ts:29 | 오늘: throw를 Form 자기 바운더리가 console.error로 가둠 | 새 설계에서 없어짐. 노드 공유와 SHARED_NODE_KIND_CONFLICT(청사진), SHARED_NODE_CONFLICT(정착)로 대체 | 오늘에만 |
  > | `JSON_SCHEMA_ERROR.VIRTUAL_FIELDS_NOT_VALID` 또는 VIRTUAL_FIELDS_NOT_IN_PROPERTIES | `error` | 청사진 분석(options.virtual 참조) | src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getVirtualReferencesMap/getVirtualReferencesMap.ts:41, :55 | 청사진 오류와 같음 | 청사진 오류와 같음 | 오늘과 새 설계 모두 |
  > | `JSON_SCHEMA_ERROR.INVALID_VIRTUAL_NODE_VALUES` | `error` | 가상 노드에 길이가 다른 배열을 쓰는 쓰기 | src/core/nodes/VirtualNode/VirtualNode.ts:46(__emitChange__). 기록에 path | 오늘: 즉시 throw. 새 설계: 쓰기의 출처로 가름. 공개 API에서 오면 호출자 오류(즉시 throw), 자동 쓰기(controls.injectTo 등)에서 오면 정착 오류(그 규칙을 후보에서 빼고 사슬 끝 throw, degraded). 분류는 슬라이스 1의 options.virtual 설계 항목에서 확정 | 받음(호출자 오류면 throw 직전, 정착 오류면 사슬 끝) | 오늘에만 명시. 새 설계 분류표에 자리가 없어 이 표에 더함 |
  > | `JSON_SCHEMA_ERROR.CREATE_DYNAMIC_FUNCTION` 또는 OBSERVED_VALUES 또는 CONDITION_INDEX 또는 CONDITION_INDICES | `error` | 청사진 분석(controls 식 컴파일 실패) | src/core/nodes/AbstractNode/utils/getComputedPropertiesManager/ComputedPropertiesManager/utils/createDynamicFunction/createDynamicFunction.ts:43, getObservedValuesFactory.ts:58, getConditionIndexFactory.ts:65, getConditionIndicesFactory.ts:76 | 청사진 오류와 같음. 컴파일러는 PR-1에서 청사진으로 옮김 | 청사진 오류와 같음 | 오늘과 새 설계 모두 |
  > | (가칭) `JSON_SCHEMA_ERROR.UNKNOWN_GROUP_KEY` | `error` | 청사진 분석: controls·options·children[].controls의 닫힌 목록 밖 키 | R15-4. 기록에 schemaPath | 청사진 오류와 같음 | 청사진 오류와 같음 | 새 설계에만 |
  > | (가칭) `JSON_SCHEMA_ERROR.DISCRIMINATOR_MISMATCH` | `error` | 청사진 분석: controls.discriminator 키가 어느 분기에도 없거나, 분기끼리 종류가 다르거나 값이 겹치거나, 선언 사이 값이 다름 | §7.1 청사진 오류 행, R15-7 | 청사진 오류와 같음 | 청사진 오류와 같음 | 새 설계에만 |
  > | (가칭) `JSON_SCHEMA_ERROR.SHARED_NODE_KIND_CONFLICT` | `error` | 청사진 분석: 게이트 없는 선언끼리 같은 이름·다른 종류 | §7.1 청사진 오류 행(14라운드 O-10) | 청사진 오류와 같음(폼이 서지 않음) | 청사진 오류와 같음 | 새 설계에만(오늘의 COMPOSITION_*_REDEFINITION을 대체) |
  > | (가칭) `JSON_SCHEMA_ERROR.TERMINAL_STRATEGY_MISMATCH` | `error` | 청사진 분석: 노드가 형상에 있는 경우마다 정한 터미널 전략이 서로 다름 | R15-10 | 청사진 오류와 같음 | 청사진 오류와 같음 | 새 설계에만 |
  > | (가칭) `JSON_SCHEMA_ERROR.INJECT_TARGET_NOT_FOUND` | `error` | 청사진 분석: 정적 controls.injectTo 대상 경로가 청사진에 없거나 터미널 아래 | §4, §7.1 청사진 오류 행. 기록에 schemaPath와 path | 청사진 오류와 같음(R17-1 나) | 청사진 오류와 같음 | 새 설계에만 |
  > | `JSON_SCHEMA_ERROR.INJECT_TO` | `error` | 오늘: injectTo 실행 중 아무 예외 | src/core/nodes/AbstractNode/AbstractNode.ts:1010-1016 | 오늘: 커밋 없이 배치 도중 throw해 이벤트 처리기를 뚫고 나감 | 새 설계에서 셋으로 나뉨: 정적 대상 없음은 INJECT_TARGET_NOT_FOUND, 동적 대상 없음은 INJECT_TARGET_MISSING, 식 예외는 EXPRESSION_THREW | 오늘에만 |
  > | `SCHEMA_FORM_ERROR.INFINITE_LOOP_DETECTED` | `error` | 오늘: 배치 수가 상한을 넘음 | src/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:97 | 오늘: 커밋 없이 throw | 새 설계에서 BUDGET_EXCEEDED와 FEEDBACK_LIMIT_EXCEEDED로 대체 | 오늘에만 |
  > | (가칭) `SCHEMA_FORM_ERROR.SHARED_NODE_CONFLICT` | `error` | 정착: 게이트에 달린 같은 이름·다른 종류 선언이 실제로 동시에 켜짐 | §2 마운트 원인별, §7.1 정착 오류 행. 기록에 path | 마운트: 모든 환경에서 폼이 서지 않고 대체 화면을 그린 뒤 커밋 뒤 싱크. 마운트 뒤: 앞선 종류로 커밋, 통지 뒤 사슬 끝 throw, degraded | 마운트는 대체 화면의 이펙트('sink'), 마운트 뒤는 throw 직전('thrown') | 새 설계에만 |
  > | (가칭) `SCHEMA_FORM_ERROR.BUDGET_EXCEEDED`(details.exceededBudget: hostWheel·derive·transition) | `error` | 정착의 예산 초과 | §7.1 정착 오류 행. 기록에 path(마지막 라운드의 규칙 대상) | 원본 B 커밋과 통지 뒤 사슬 끝 throw, 모든 환경(R17-1 나). degraded가 다음 로드까지 남고 그 동안 제출을 거부. 마운트에서는 폼이 서고 커밋 뒤 싱크 | 마운트는 준비 이펙트('sink'), 마운트 뒤는 throw 직전('thrown') | 새 설계에만(오늘의 INFINITE_LOOP_DETECTED를 대체) |
  > | (가칭) `SCHEMA_FORM_ERROR.EXPRESSION_THREW` | `error` | 정착: controls 식이나 if 게이트 함수의 런타임 throw(게이트, 상태 키, 파생 규칙, resetInteraction) | §4. 기록에 path | 자리마다 정의된 값으로 정착을 마치고 커밋, 통지 뒤 사슬 끝 throw, degraded, 모든 환경(R17-1 나). 마운트에서는 폼이 서고 싱크 | 받음. error는 SchemaFormError이고 원래 예외는 details.error | 부류는 새 설계에만(오늘은 식의 런타임 예외를 잡지 않아 원래 예외가 그대로 전파됨. 잡는 자리는 컴파일 시점뿐) |
  > | (가칭) `SCHEMA_FORM_ERROR.GUARD_FAILED` | `error` | 정착: 가드 평가 실패 또는 가드 컴파일 실패 | §6 가드. 기록에 path(게이트의 호스트) | 게이트는 거짓, 사슬 끝 throw, degraded, 모든 환경(R17-1 나) | 받음. 컴파일 실패만 개발 모드가 시점을 앞당겨 마운트의 커밋 뒤에 보냄('sink'). 프로덕션은 처음 평가하는 사슬 끝('thrown')에 보내고, 평가되지 않은 가드는 기록이 없음. 가드 표가 실패한 컴파일의 오류를 캐시하므로 그 가드를 쓰는 폼 인스턴스마다 자기 사건으로 받음 | 새 설계에만 |
  > | (가칭) `SCHEMA_FORM_ERROR.INJECT_TARGET_MISSING` | `error` | 정착: 동적으로만 아는 controls.injectTo 대상이 없음 | §4, §7.1 정착 오류 행 | 그 규칙을 후보에서 빼고 커밋, 사슬 끝 throw, degraded, 모든 환경(R17-1 나) | 받음(마운트는 준비 이펙트, 마운트 뒤는 throw 직전) | 새 설계에만 |
  > | (가칭) `SCHEMA_FORM_ERROR.FEEDBACK_LIMIT_EXCEEDED` | `error` | 통지: 리스너 되먹임 파동 25, onChange 중첩 25 초과 | §7.1 되먹임·중첩 오류 행 | 고리 하나를 끊고 사슬 끝 throw, 모든 환경(R17-1 나). diagnostics에는 남기지 않음 | throw 직전('thrown') | 새 설계에만 |
  > | (가칭) `SCHEMA_FORM_ERROR.LISTENER_THREW` | `error` | 통지: 구독 리스너, onChange, onStateChange, onDiagnosticsChange, batch fn이 던짐. 검증 결과 파동의 리스너와 onValidate가 던짐 | src/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:211-212(오늘은 잡지 않음), src/components/Form/Form.tsx:139(onValidate, catch 없음), 09 §2.4의 검증 결과 행 | 사슬: 배달을 끝내고 사슬 끝 throw(하나면 원래 값 그대로). 검증 결과 파동: 싱크로 보내고 미처리 거부로 남기지 않음(§3 시점의 다섯째). 모든 환경 | 사슬은 throw 직전('thrown'), 파동은 그 마이크로태스크('sink'). error는 소비자의 원래 값이고 code는 폼이 붙임 | 오늘은 잡지 않고 전파(onValidate는 미처리 거부). 부류는 새 설계에만 |
  > | (가칭) `SCHEMA_FORM_ERROR.MULTIPLE_ERRORS`(묶음) | `error` | 한 사슬에서 오류가 둘 이상이거나, 부른 쪽이 있는 자리에서 핸들러가 던짐 | §2 묶음 | SchemaFormError 하나로 묶어 details.errors에 발생 순서대로 담아 throw 또는 거부 | 따로 기록하지 않음. 구성 기록마다 aggregate 칸에 이 객체를 실음 | 새 설계에만 |
  > | `SCHEMA_FORM_ERROR.FORM_TYPE_INPUT_MAP` | `error` | 렌더: Form 속성 formTypeInputMap 정규화(src/providers/FormTypeInputsContext/FormTypeInputsContextProvider.tsx:29-34의 useMemo) | src/helpers/formTypeInputDefinition/formTypeInputMap.ts:53. 기록에 맵의 키 | 오늘: 루트 바운더리가 console.error로 가둠. 새 설계: 루트 바운더리가 가두어 대체 화면을 그리고 componentDidCatch에서 싱크 | componentDidCatch('sink', componentStack 포함) | 오늘과 새 설계 모두 |
  > | `UNHANDLED_ERROR.REGISTER_PLUGIN` | `error` | registerPlugin 호출(전역) | src/app/plugin/registerPlugin.ts:215 | 부른 쪽에 즉시 throw | 받지 않음(폼 인스턴스가 없음) | 오늘과 새 설계 모두 |
  > | (가칭) `SCHEMA_FORM_ERROR.INVALID_WRITE_OPTION` | `error` | 공개 API: Overwrite와 Merge를 함께 준 setValue | §7.1 호출자 오류 행. 기록에 path | 즉시 throw(호출자 오류) | throw 직전('thrown') | 새 설계에만 |
  > | (가칭) `SCHEMA_FORM_ERROR.DISPOSED_NODE_WRITE` | `error` | 재생성 reset으로 폐기된 노드에 호출자가 옛 참조로 한 쓰기 | 09 §2.6의 일곱째. 기록에 path | 적용하지 않고 즉시 throw, 모든 환경. 입력 출처 표식이 있는 늦은 입력 쓰기는 오류가 아니며 조용히 버림 | throw 직전('thrown') | 새 설계에만 |
  > | (가칭) `SCHEMA_FORM_ERROR.WRITE_IN_OBSERVER` | `error` | onError 전달 중 이 폼에 대한 쓰기 | §3 핸들러 안의 쓰기 | 핸들러 안으로 즉시 throw | 받지 않음(재귀 없음). 핸들러 밖으로 새면 핸들러 예외의 규칙을 따름 | 새 설계에만 |
  > | (가칭) `SCHEMA_FORM_ERROR.SUBMIT_WHILE_DEGRADED` | `error` | diagnostics.status가 degraded인 동안의 제출 | §5, §7.1 제출 거부 행, R17-1 나 | FormHandle.submit과 useFormSubmit은 거부. 네이티브 submit(src/components/Form/Form.tsx:127-133, 부른 쪽 없음)은 싱크 | 거부 직전('rejected') 또는 싱크 직전('sink'). 제출 시도마다 새 객체 | 새 설계에만 |
  > | `JSON_SCHEMA_ERROR.CIRCULAR_REFERENCE` 또는 SCHEMA_COMPILE_FAILED(+ 노드 errors의 jsonSchemaCompileFailed) | `error` | 오늘: 노드 생성 때 전체 스키마 컴파일 실패 | src/core/nodes/AbstractNode/utils/ValidationManager/ValidationManager.ts:205-222, utils/getFallbackValidator.ts:14-26 | 오늘: 모든 환경에서 console.error를 내고, 이어 대체 검증기가 노드 errors에 항목을 넣음 | 새 설계에서 없어짐. VALIDATOR_COMPILE_FAILED로 대체되며 노드 errors에는 넣지 않음 | 오늘에만 |
  > | (가칭) `SCHEMA_FORM_ERROR.VALIDATOR_COMPILE_FAILED` | `error` | 로드 뒤 첫 검증 요청: 검증기는 있으나 전체 스키마 컴파일이 실패하고 검증 모드가 None이 아님 | §6 검증기 | 한 로드에 오류 객체 하나로 첫 OnChange 검증, validate(), 제출을 모든 환경에서 거부(R17-1 나). 그 로드에서 OnChange 검증을 다시 예약하지 않음 | 한 로드에 한 번, 처음 드러날 때(OnChange면 'sink', validate()·제출이면 'rejected') | 새 설계에만. 통보3의 답은 검증기가 있는 이 경우에 닿지 않음 |
  > | (가칭) `SCHEMA_FORM_ERROR.VALIDATOR_THREW` | `error` | 검증 요청: 검증 함수의 런타임 throw, 요청 시점의 $ref 순환 | src/core/nodes/AbstractNode/AbstractNode.ts:1215-1222(오늘 OnChange는 잡지 않음), src/components/Form/Form.tsx:139, §7.1 검증기 오류 행 | validate()와 제출은 거부. OnChange는 싱크로 보내며 미처리 거부로 남기지 않음(§6 검증 실행 실패). 모든 환경 | validate()는 거부 직전('rejected'), OnChange는 마이크로태스크에서 핸들러 뒤 싱크('sink'). ValidateFunction 문서 주석에 '입력의 판정은 돌려주고 던지지 않는다'를 적어 검증 결과와의 경계를 못박음 | 새 설계에만(오늘은 미처리 거부) |
  > | (가칭) `SCHEMA_FORM_ERROR.RENDER_FAILED` | `error` | 렌더: 사용자 주입 구성 요소(FormTypeInput, 렌더러 넷, Placeholder, 렌더러 안의 formatError)와 루트의 렌더 오류 | 필드 바운더리 src/components/SchemaNode/SchemaNodeInput/hooks/useFormTypeInput.ts:36-37, SchemaNodeInputWrapper.tsx:56-57, src/components/SchemaNode/SchemaNodeProxy/SchemaNodeProxy.tsx:59, src/helpers/virtualization/VirtualizationManager/VirtualizationManager.ts:214. 루트 src/components/Form/Form.tsx:311-312 | 가두어 대체 화면을 그리고 componentDidCatch에서 싱크(§2의 React에서 보이는 것). ErrorBoundary의 console.error는 남음(packages/winglet/react-utils/src/hoc/withErrorBoundary/components/ErrorBoundary.tsx:52-54) | componentDidCatch('sink'). error는 원래 값이고 componentStack을 실으며, 필드 바운더리면 path가 있음. 폼이 이미 던진 값이면 핸들러를 한 번 건너뜀 | 오늘은 console.error뿐. 부류는 새 설계에만 |
  > | (코드 없음) onError 핸들러 자신의 예외 | `error` | 핸들러를 호출할 때(동기 throw) | §3 핸들러가 던질 때 | 부른 쪽이 있으면 원래 오류를 앞에 두고 묶어 던지거나 거부함. 부른 쪽이 없으면 싱크로 한 번 보냄. async 핸들러의 거부는 호스트 자신의 프로미스 | 받지 않음(재귀 없음) | 새 설계에만 |
  > | `SCHEMA_FORM_WARNING.ALL_OF_KEYWORD_IGNORED_FOR_FORM` | `warning` | 청사진 분석(노드 생성의 allOf 처리) | src/helpers/jsonSchema/processAllOfSchema/processAllOfSchema.ts:40-44. 판별 칸은 keyword. 새 설계에서 schemaPath를 붙임 | 개발 모드 콘솔(세션 단위 code+message 중복 억제), 프로덕션 기본 출력 없음 | 커밋된 로드의 준비 이펙트. 무시한 키워드마다 기록 하나 | 오늘과 새 설계 모두 |
  > | `SCHEMA_FORM_WARNING.NULL_BRANCH_IGNORED_FOR_FORM` | `warning` | 청사진 분석 | src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getCompositionNodeMapList/utils/warnIfNullBranchIgnored.ts:25 | 개발 모드 콘솔 | 커밋된 로드의 준비 이펙트 | 오늘과 새 설계 모두 |
  > | `SCHEMA_FORM_WARNING.NESTED_COMPOSITION_IGNORED_FOR_FORM` | `warning` | 오늘: 청사진 분석 | src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getCompositionNodeMapList/utils/warnIfNestedComposition.ts:24 | 오늘: 개발 모드 콘솔 | 없음(폐기. 중첩 합성은 재귀로 다룸, 원장 §5, ADR 0002) | 오늘에만 |
  > | `SCHEMA_FORM_WARNING.NULLABLE_ONE_OF_NULL_UNREACHABLE` | `warning` | 오늘: 청사진 분석 | src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getCompositionNodeMapList/utils/warnIfNullUnreachable.ts:34 | 오늘: 개발 모드 콘솔 | 없음(폐기. 분기 내용을 읽음, §7.1 범위 밖 문단) | 오늘에만 |
  > | `SCHEMA_FORM_WARNING.VIRTUALIZATION_DISABLED_FOR_FORM` | `warning` | 렌더 계층: virtualization을 켰는데 IntersectionObserver가 없음 | src/helpers/virtualization/VirtualizationManager/VirtualizationManager.ts:199-205(인스턴스 없는 정적 메서드이므로 보고기를 인자로 넘김). 폼 수준 | 개발 모드 콘솔 | 커밋 뒤 이펙트 | 오늘과 새 설계 모두(렌더 계층 경고로 옮김, §7.1 범위 밖 문단) |
  > | (가칭) `SCHEMA_FORM_WARNING.IF_WITHOUT_ELSE_FALSE` | `warning` | 청사진 분석: oneOf·anyOf 분기에 if는 있고 else: false가 없음 | reviews/round-12-owner-answers.md:14, §7.1 청사진 경고 행 | 개발 모드 콘솔 | 커밋된 로드의 준비 이펙트 | 새 설계에만 |
  > | (가칭) `SCHEMA_FORM_WARNING.LOCK_ON_NON_TERMINAL_OBJECT` | `warning` | 청사진 분석: 터미널이 아닌 객체 노드의 표준 readOnly, controls.readOnly, controls.disabled | §7.1 청사진 경고 행 | 개발 모드 콘솔 | 커밋된 로드의 준비 이펙트 | 새 설계에만 |
  > | (가칭) `SCHEMA_FORM_WARNING.CONDITIONAL_SCHEMA_WITHOUT_VALIDATOR` | `warning` | 트리 생성(마운트, 재생성 reset): 검증기가 없는데 if 게이트가 있어 조각이 꺼짐 | §6 검증기, ADR 0004의 합의 | 개발 모드 콘솔 | 트리마다 한 번(마운트는 준비 이펙트, 재생성 reset은 reset 사슬 끝) | 새 설계에만(오늘은 조용함) |
  > | (가칭) `SCHEMA_FORM_WARNING.VALIDATOR_MISSING` | `warning` | 트리 생성(마운트, 재생성 reset): 플러그인에도 validatorFactory에도 검증기가 없고 검증 모드가 None이 아님 | src/core/nodes/AbstractNode/utils/ValidationManager/ValidationManager.ts:198-204(오늘은 조용히 건너뜀). 소유자 통보3 답 | 거부하지 않음(17라운드 소유자 답, 통보3). 개발 모드 콘솔, 프로덕션 기본 출력 없음 | 모든 환경, 트리마다 한 번(마운트는 준비 이펙트, 재생성 reset은 reset 사슬 끝). 값을 통째로 바꾸는 setValue나 같은 스키마 reset에서는 다시 보내지 않음. level은 17라운드 소유자 답 (가). 검증 모드를 None으로 적으면 사라짐 | 새 설계에만 |
  > | (가칭) `SCHEMA_FORM_WARNING.MULTIPLE_GATED_BRANCHES_ACTIVE` | `warning` | 정착: 같은 oneOf에서 게이트 가진 분기가 둘 이상 켜짐 | §7.1 정착 경고 행. 기록에 호스트의 path | 개발 모드 콘솔 | 마운트면 준비 이펙트, 그 뒤면 사슬 끝(발생 순서). 로드마다 구조 키(code, path)로 한 번. 핸들러가 없는 프로덕션에서는 판정하지 않음 | 새 설계에만 |
  > | (가칭) `SCHEMA_FORM_WARNING.PRESENTATION_KEY_SUSPECT` | `warning` | 렌더 계층이 한 노드의 presentation을 처음 읽을 때: 코어 키 다섯과 대소문자만 다른 키, 또는 controls·options의 키 이름(R17-3이 `options.trim`으로 확정되어 `presentation.trim`도 둘째 경우에 든다) | R15-9. 판별 칸은 키 이름 | 개발 모드 콘솔 | 그 필드가 커밋된 뒤의 이펙트(지연 마운트 필드 포함) | 새 설계에만 |
  > | (제외) 검증 결과: ValidationIssue(오늘 이름 JSONSchemaError), onValidate, errors 속성, setExternalErrors·clearExternalErrors, `VALIDATION_ERROR.SCHEMA_VALIDATION_FAILED` | `error` | 검증 뒤, 제출 | src/components/Form/type.ts:54, :66; src/core/nodes/AbstractNode/AbstractNode.ts:816-839; src/components/Form/Form.tsx:117-123 | 노드 errors, onValidate, 필드 오류 표시, 제출 거부. 네이티브 submit에서는 오늘 미처리 거부(Form.tsx:127-133, packages/winglet/common-utils/src/utils/function/enhance/getTrackableHandler/getTrackableHandler.ts:429-431)이며 PR-7 설계 항목 | 받지 않음(둘째 답 고정) | 오늘과 새 설계 모두 |
  > | (제외) 정착 추적 | `warning` | 개발 모드에서 정착마다 | 08 §11.3 | 개발 모드 기록, 프로덕션은 없음 | 받지 않음(사건이 아니라 추적이며 양이 정착 수에 비례함) | 새 설계에만 |
  > | (제외) diagnostics의 상태 변화 | `error` | degraded로 바뀌는 커밋, 로드 | §5 | UpdateDiagnostics, onDiagnosticsChange | 받지 않음(상태이며, 그 원인 오류가 따로 기록됨) | 새 설계에만 |
  > | (제외) 호스트 onSubmit이 던지거나 거부한 것 | `error` | 제출 | src/components/Form/Form.tsx:124 | 제출 프로미스의 거부로 부른 쪽에 감(네이티브 submit이면 호스트 자신의 미처리 거부) | 받지 않음(호스트 자신의 코드) | 오늘과 새 설계 모두 |
  > | (제외) React 자신의 경고와 렌더 중 쓰기 | `warning` | 렌더 중 사용자 코드의 쓰기 | §2 호출자 오류(P5), 09 §2.3의 문서화 항목 | React의 렌더 중 갱신 경고(문서화 항목) | 받지 않음(core가 감지하지 않음). 그 사슬에서 난 폼 사건의 전달 시점은 보증하지 않음 | 오늘과 새 설계 모두 |
  > | (미정) 설계 항목에서 생길 수 있는 코드 | `error` | 같은 `$id` 사본 루트의 중복 등록(PR-4), 같은 가상 이름의 다른 `fields`(슬라이스 1), 비객체 V의 `Merge`와 되먹임 거부 표면(슬라이스 2), `controls.children` 대상이 형상에 없을 때(슬라이스 6) | 18라운드 안건(`reviews/round-18-agenda.md`) | 정해지면 적음 | 정해지면 이 표에 더하고 판 규칙(더하면 minor)을 따름 | 새 설계에만 |
- 보충:
  > "입력 컴포넌트가 래퍼를 거치지 않고 `FormTypeInputProps`의 `node`로 한 쓰기도 표식이 없으므로 이 옛 노드 참조에 들며, 재생성 reset 뒤 타이머나 언마운트 정리에서 하면 던진다(문서화, 열여섯째)." (`09-landing-and-test-strategy.md:87`)
  > "입력 컴포넌트의 늦은 쓰기는 `node`가 아니라 `onChange`로 한다는 것(재생성 reset 뒤 `node`로 한 늦은 쓰기는 `SchemaFormError`)" (`09-landing-and-test-strategy.md:96`)
- 상태: 분할됨(→ ERROR-164, ERROR-165)
- 출처: `adr/0014-error-policy.md:246-301`(정본)
- 닫은 사람: 편집자 결정(17라운드, ADR 0014 4판 채택), 게이트 R17G-9·R17G-2
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:248`; (미정) 행은 ERROR-048·ERROR-049·ERROR-051로, `INVALID_VIRTUAL_NODE_VALUES`의 칸은 ERROR-069로 이어진다

### ERROR-045 §8 무엇이 바뀌는가 — 5차 문서·오늘 대 이 ADR 대조표

- 결정:
  > | 5차 문서와 오늘 | 이 ADR |
  > | --- | --- |
  > | 정착 예산 초과: 개발 모드 throw, 프로덕션은 신호만(12라운드 §4) | 모든 환경에서 throw(커밋·통지 뒤, 사슬의 끝). `diagnostics`는 다음 로드까지 `degraded`로 남고 그 동안 제출을 거부한다(R17-1 나. 10라운드 B-1의 제출 비차단을 대체한다) |
  > | Form 속성 `throwOnBudgetExceeded`(가칭) | 없다. 끄는 스위치가 없다 |
  > | 리스너 오류: `onListenerError`(가칭)로 보고, 없으면 개발 모드 `console.error` | 배달 뒤 사슬의 끝에서 모든 환경에서 throw. `onError`가 기록으로 먼저 본다 |
  > | 노드 공유 충돌: 청사진 경고 + 프로덕션 폼 수준 경고(ADR 0005 §3 "명시 없는 생성기 union이 마운트마다 터지면 안 된다") | 확실한 충돌은 청사진 오류, 실제 동시 활성은 정착 오류(O-10). 마운트에서 나면 모든 환경에서 폼이 서지 않고 대체 화면을 그린다. 생성기 union은 `controls.discriminator`를 더한다(이주) |
  > | `controls`의 식 런타임 오류·풀리지 않는 `controls.injectTo` 대상: 14라운드 O-4 가(개발 모드 경고) | 정적이면 청사진 오류, 동적이면 정착 오류(R17-1 나). 마운트에서 나면 폼이 서고 커밋 뒤 보고한다 |
  > | 검증기 미등록: 조용히 검증을 건너뜀(`enabled = false`), `if` 게이트는 조각 없음(ADR 0004) | 거부하지 않고 개발 모드 콘솔과 `onError` 경고 기록으로 트리마다 한 번 알린다(통보3). `if` 조각이 꺼지는 것과 그 경고는 ADR 0004의 합의대로다 |
  > | 검증기 오류: 전체 스키마 컴파일 실패는 노드 `errors`에 `jsonSchemaCompileFailed` + 모든 환경 `console.error`. `OnChange` 검증의 실행 실패는 미처리 거부 | 컴파일 실패는 검증 불가로 첫 검증 요청·`validate()`·제출을 모든 환경에서 거부하고, 실행 실패는 `validate()`의 거부 또는 `onError` 뒤 싱크다. 노드 `errors`에는 넣지 않는다(사용자의 잘못이 아니다) |
  > | `Form`이 자기 바운더리로 마운트 오류를 삼킴(`console.error`뿐) | 바운더리는 다시 던지지 않고 가두어 대체 화면을 그리며, `componentDidCatch`에서 `onError`와 싱크로 보고한다. 청사진 오류는 트리를 만드는 자리에서 잡는다 |
  > | `onError` 없음. 경고는 개발 모드 콘솔뿐이며 프로덕션에서도 검출과 서식을 돌린 뒤 버림 | Form 속성 `onError`: 검증 결과를 뺀 폼 내부의 오류와 경고를 같은 모양의 기록으로 받는 관찰자. 핸들러가 없는 프로덕션은 기록·서식·경고 판정을 만들지 않는다 |
  > | 오류 둘 이상의 묶음: 없음 | `SchemaFormError` 하나의 `details.errors`(발생 순서). `AggregateError`와 `cause`는 쓰지 않는다 |
  > | `diagnostics.status`: `'stable'` 또는 `'budgetExceeded'`, 이번 정착만, `exceededBudget` 다섯 값 | `'stable'` 또는 `'degraded'`와 `cause`·`commit`, 마지막 로드 이후의 작업 기록. `exceededBudget`은 정착 예산 셋만 |
  > | 가드 컴파일은 늦춘다(ADR 0004) | 프로덕션은 늦게(유지), 개발 모드는 청사진에서 일괄. 실패는 그 게이트의 가드 실패이며 정착 오류다 |
  > | 오류·경고 코드는 공개 계약이 아님 | 형 `FormErrorCode`와 README·docs의 코드 표를 공개한다. 더하면 minor, 바꾸거나 없애면 major |
- 보충: 없음
- 상태: 현행(기록)
- 출처: `adr/0014-error-policy.md:305-320`(정본)
- 닫은 사람: 편집자 결정(17라운드, ADR 0014 4판 채택), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1; `adr/0014-error-policy.md:307,308,311,313,317,318`), 소유자 답(`reviews/round-14-owner-answers.md:16` O-10; `adr/0014-error-policy.md:310`), 소유자 답(`reviews/round-14-owner-answers.md:8` O-2; `adr/0014-error-policy.md:317`), 소유자 답(`reviews/round-17-owner-answers.md:14` 통보 3; `adr/0014-error-policy.md:312`), 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4; `adr/0014-error-policy.md:314`)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:303`

### ERROR-046 이주 항목 문단

- 결정:
  > 이주 항목: 검증기 없이 쓰던 폼은 그대로 동작하며 경고를 받는다(검증 모드를 `None`으로 적으면 사라진다). `INFINITE_LOOP_DETECTED`가 배치 도중 throw해 커밋을 남기지 않던 것이 원본 B 커밋 뒤 throw(`BUDGET_EXCEEDED`, 되먹임·중첩이면 `FEEDBACK_LIMIT_EXCEEDED`)로 바뀌고, 프로덕션에서도 던지며, 그 뒤 다음 로드까지 제출이 거부된다. `ValidationManager.ts:221`의 `console.error`와 `jsonSchemaCompileFailed`가 사라진다. `oneOfIndex`·자동 감지 없이 같은 이름·다른 종류를 둔 생성기 union은 `controls.discriminator` 없이는 마운트에 실패한다. 검증 결과 형은 `ValidationIssue`로 이름이 바뀐다(`onError`의 공개보다 먼저). `@winglet/react-utils`의 감싸개에는 선택 인자가 더해질 뿐 기존 호출은 그대로다.
- 보충: 없음
- 상태: 현행(기록)
- 출처: `adr/0014-error-policy.md:321`(정본)
- 닫은 사람: 편집자 결정(17라운드, ADR 0014 4판 채택)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:321`

### ERROR-047 합의 근거 — 소유자 답의 원문 모음

- 결정:
  > - 소유자 10라운드 답 B-1: "권고를 따릅니다만, 기본적으론 form을 터트려서(error를 throw해서) 알려주는게 좋지 않을까 싶네요."
  > - 소유자 14라운드 답 O-4: "전반적으로 '오류가 나도 동작하는' 형태보다는 안되면 오류를 터트려서 인지시키는 방향이 좋지 않을까 싶네요." O-10: "경고만 일어나고 동작하는것처럼 보이는게 더 위험합니다." O-2: "이런 예산초과된 상태로 동작하는건 되도록 막는 방향을 원하긴 해요."
  > - 소유자 17라운드 답(`reviews/round-17-owner-answers.md`). R17-1: "나 허용. 망가진 값을 올리는게 더 위험하겠다." 통보3: "오류만 내보내고 거절은 하지 마시죠. 사용자가 인지만 하면 될거고, 기본값이 있어서 사용자가 오히려 불편할겁니다. 저는 jsonSchema 로 form 만 그리고, 유효성검증은 따로 하지 않는 사용예도 알고있어서요." 통보4: "아 이게, onError 와 onValidate 를 섞는건 사용자 입장에서 엄청 햇갈립니다", "모든 form 내부 error를 정리해서 출력할 수만 있다면, (warning / error 모두) onError 핸들러를 넣어도 괜찮을 것 같기도 해. 오히려, validate error 가 걸러진 에러 로깅용 전용 채널로 쓸 수 있겠어. 이거 에이전트들로 수렴을 시켜봐. 어떤게 나을지". 4번 수렴 뒤의 확인 (가): "(가) ㄱ warning으로." (나): "(나) 확장 허용합니다".
  > - 17라운드 4번 수렴(`reviews/raw-round17-onerror.md`): 안 B를 17라운드 스웜 수렴(편집자 결정)으로 택했다. 셋째 답이 이름과 방향을 주었고, 투명성·C2·10라운드 A-2("form은 고지 의무만 진다")·O-10이 같은 쪽이며, 비용이 핸들러가 있을 때만 생겨 가치끼리 맞바꾸지 않는다. 게이트는 조건부 통과였고 R17G-1–R17G-11을 모두 적용했다(R17G-3은 소유자 답 (가), R17G-4는 소유자 답 (나)로 닫혔다).
  > - 외부 조사(antigravity) 최종 판정: "안 A(커밋 보존 후 최외곽 진입 끝 예외 발생)를 기본 원칙으로 채택 … 안 B는 소비자가 오류를 고의로 삼킬 수 있어 조기 실패의 완결성을 파괴합니다." 여기의 안 B는 외부 조사의 안('`onError` 하나로 보내고 없으면 throw')이며 17라운드 4번 수렴의 안 B(흐름을 바꾸지 못하는 관찰자)와 다르다. 사슬 끝 throw는 이 판정대로 두었다.
- 보충:
  > 소유자(10라운드 B-1): "권고를 따릅니다만, 기본적으론 form 을 터트려서(error 를 throw 해서) 알려주는게 좋지 않을까 싶네요... 이 루프가 만들어지는건 기본적으로 schema를 잘못 짰기 때문이니까, 런타임에 발생할 확률은 비교적 낮겠고요. 그리고 다시 말하지만, 구태여 막지 않을 뿐이지 루프를 만드는걸 권하는 설계는 절대 아닙니다." (`reviews/round-10-owner-answers.md:13`)
- 상태: 분할됨(→ ERROR-166, ERROR-167, ERROR-168, ERROR-169, ERROR-170)
- 출처: `adr/0014-error-policy.md:325-329`(정본), `reviews/round-10-owner-answers.md:13`(B-1), `reviews/round-14-owner-answers.md:10-11,16`(O-4·O-5·O-10), `reviews/round-17-owner-answers.md:9,15,33,34`(R17-1·통보3·통보4·(가)·(나))
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:13`, `reviews/round-14-owner-answers.md:8,10,16`, `reviews/round-17-owner-answers.md:9,14,15,33,34`; 첫째–셋째 글머리), 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md`; 넷째 글머리), 편집자 결정(외부 조사 판정 채택, `adr/0014-error-policy.md:329`; 다섯째 글머리)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:325-329`

### ERROR-048 남은 것 1 — 쓰기 의미론의 세부(C)가 18라운드 안건으로 이관됨

- 결정:
  > **C(쓰기 의미론의 세부).** 되먹임 거부를 호출자에게 알리는 표면, `setValue(undefined)`와 비객체 V의 `Merge`. 정해지면 호출자 오류 또는 되먹임·중첩 오류의 코드가 생길 수 있다(§7.2의 미정 행).
- 보충: 없음
- 상태: 열림(→ `reviews/round-18-agenda.md` §3, :42-43)
- 출처: `adr/0014-error-policy.md:335`(정본)
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:335`

### ERROR-049 남은 것 2 — 청사진이 읽는 스키마의 범위(A)가 18라운드 안건으로 이관됨

- 결정:
  > **A(청사진이 읽는 스키마의 범위).** 같은 가상 이름을 다른 `fields`로 적은 `options.virtual` 항목. 정해지면 청사진 오류의 코드가 생길 수 있다(§7.2의 미정 행).
- 보충: 없음
- 상태: 열림(→ `reviews/round-18-agenda.md` §1, :19)
- 출처: `adr/0014-error-policy.md:336`(정본)
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:336`

### ERROR-050 남은 것 3 — trim 쓰기의 부수 효과가 18라운드 안건으로 이관됨

- 결정:
  > **trim 쓰기의 부수 효과(바깥 오류 지움, dirty 표시).** 포커스 아웃 때 자른 값의 쓰기가 오늘 `handleChange`처럼 바깥 오류를 지우고 dirty를 표시하는가. 바깥 오류는 검증 결과 층(`onError`가 받지 않는 것)이므로 어느 답이든 이 ADR의 층 구분은 바뀌지 않는다.
- 보충: 없음
- 상태: 열림(→ `reviews/round-18-agenda.md` §3, :45)
- 출처: `adr/0014-error-policy.md:337`(정본)
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:337`

### ERROR-051 남은 것 4 — PR-1·PR-2 뒤 절의 항목이 18라운드 안건으로 이관됨

- 결정:
  > **PR-1·PR-2 뒤 절의 항목.** 사본 루트 등록 계약의 세부(같은 `$id` 사본 루트의 중복 등록, PR-4), `controls.children` 대상별 세부(대상이 형상에 없을 때, PR-6). 정해지면 §7.2의 미정 행을 코드로 바꾼다.
- 보충:
  > "`$id`가 있는 사본 루트는 고유 키를 주어도 `$id`로 충돌하며(ajv 8.17.1 실행 확인), 그 처리는 PR-4의 '같은 `$id` 루트의 중복 등록 처리'가 정한다." (`08-design-a-to-z.md:345`)
- 상태: 열림(→ `reviews/round-18-agenda.md` §9, :108,110; 같은 `$id` 사본 루트의 중복 등록은 → `reviews/round-18-agenda.md:150` 11-19)
- 출처: `adr/0014-error-policy.md:338`(정본), `08-design-a-to-z.md:345`, `adr/0004-validator-plugin-compile-guard.md:34`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:338`

### ERROR-052 대체됨: 정착 예산 초과는 개발 모드 throw, 프로덕션은 신호만(12라운드 §4)

- 결정:
  > 정착 예산 초과: 개발 모드 throw, 프로덕션은 신호만(12라운드 §4)
- 보충:
  > 소유자(12라운드 §4 권고): "동의한다. 개발모드에선 throw, 이를 무시하고 리얼에 나간 경우, "어떻게든 동작하는 형태"를 고수한다. 이는 리엑트와 동일 설계이다." (`reviews/round-12-owner-answers.md:12`, 항목 4 프로덕션 throw)
  > "확정(신호만 + 개발 모드 throw)은 편집자의 절충. 12라운드에 닫힘: 프로덕션은 신호만, Form 속성으로 throw를 켤 수 있다" (`07-conclusions.md:236`)
  > "예산 초과 시 개발 모드와 프로덕션 모두 커밋 → 검증 요청 → `onChange`로 진행하고 개발 모드만 최외곽 진입 끝에서 throw한다고 적었다(06 §4.5, 소유자 B-1)." (`adr/0008-event-system.md:13`)
- 상태: 대체됨(→ ERROR-070, ERROR-073)
- 출처: `adr/0014-error-policy.md:307`(정본, "무엇이 바뀌는가" 표의 옛 문장), `reviews/round-12-owner-answers.md:12`, `07-conclusions.md:236`, `adr/0008-event-system.md:13,213`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1)
- 라운드: 17(12라운드 규칙을 대체)
- 까닭: `adr/0014-error-policy.md:14`, `adr/0014-error-policy.md:53`

### ERROR-053 대체됨: Form 속성 throwOnBudgetExceeded(가칭)

- 결정:
  > Form 속성 `throwOnBudgetExceeded`(가칭)
- 보충: 없음
- 상태: 대체됨(→ ERROR-072, ERROR-099)
- 출처: `adr/0014-error-policy.md:308`(정본, "무엇이 바뀌는가" 표의 옛 문장), `adr/0007-settle-cycle.md:47`, `adr/0008-event-system.md:7,99,164`, `03-mental-model.md:116`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:53`("끄는 스위치는 없다(Form 속성 `throwOnBudgetExceeded`는 없다)")

### ERROR-054 대체됨: 리스너 오류는 onListenerError(가칭)로 보고, 없으면 개발 모드 console.error

- 결정:
  > 리스너 오류: `onListenerError`(가칭)로 보고, 없으면 개발 모드 `console.error`
- 보충:
  > "**`onListenerError`의 채널** — 닫힘. 리스너 오류는 Form 속성 `onError`의 기록으로 받는다(17라운드 스웜 수렴(편집자 결정), 안 B, ADR 0014 §3)." (`adr/0008-event-system.md:201`)
  > "5.4의 결과에 따라 단일 콜백이면 `onDiagnostic(report)`, 분리 콜백이면 `onListenerError`를 더한다." (`06-conclusions.md:375`)
- 상태: 대체됨(→ ERROR-004, ERROR-014)
- 출처: `adr/0014-error-policy.md:309`(정본, "무엇이 바뀌는가" 표의 옛 문장), `adr/0008-event-system.md:7,68,201`, `06-conclusions.md:375`
- 닫은 사람: 17라운드 스웜 수렴(편집자 결정)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:70`("가칭 `onListenerError`는 `onError`에 흡수된다")

### ERROR-055 대체됨: 노드 공유 충돌은 청사진 경고 + 프로덕션 폼 수준 경고(ADR 0005 §3, 5차)

- 결정:
  > 노드 공유 충돌: 청사진 경고 + 프로덕션 폼 수준 경고(ADR 0005 §3 "명시 없는 생성기 union이 마운트마다 터지면 안 된다")
- 보충:
  > "노드 공유 충돌의 드러남을 R17-1 나에 맞췄다. 게이트 없는 선언끼리의 충돌은 청사진 오류, 게이트에 달린 선언이 실제로 동시에 켜진 충돌은 정착 오류(마운트에서는 폼이 서지 않고, 마운트 뒤에는 사슬 끝 throw와 `degraded`)다. 옛 "프로덕션은 폼 수준 경고"는 버렸다." (`adr/0005-blueprint-analysis-and-node-sharing.md:7`)
  > "둘의 드러남은 ADR 0014(채택)가 정한다: 앞은 청사진 오류, 뒤는 모든 환경에서 드러나는 정착 오류이며 마운트에서는 폼이 서지 않는다(§11.3. 5차 문서는 경고였다. 소유자 14라운드: "경고만 일어나고 동작하는 것처럼 보이는 게 더 위험합니다")." (`08-design-a-to-z.md:177`)
- 상태: 대체됨(→ ERROR-078, ERROR-159)
- 출처: `adr/0014-error-policy.md:310`(정본, "무엇이 바뀌는가" 표의 옛 문장), `adr/0005-blueprint-analysis-and-node-sharing.md:7,68,116`, `08-design-a-to-z.md:177`
- 닫은 사람: 소유자 답(`reviews/round-14-owner-answers.md:16` O-10), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1)
- 라운드: 17
- 까닭: `adr/0005-blueprint-analysis-and-node-sharing.md:116`

### ERROR-056 대체됨: controls 식 런타임 오류·풀리지 않는 controls.injectTo 대상은 개발 모드 경고(14라운드 O-4 가)

- 결정:
  > `controls`의 식 런타임 오류·풀리지 않는 `controls.injectTo` 대상: 14라운드 O-4 가(개발 모드 경고)
- 보충:
  > 소유자(14라운드 O-4): "가로 가도 됩니다. 다만 전반적으로 "오류가 나도 동작하는" 형태보다는 안되면 오류를 터트려서 인지시키는 방향이 좋지 않을까 싶네요" (`reviews/round-14-owner-answers.md:10`)
- 상태: 대체됨(→ ERROR-070, ERROR-121, ERROR-123)
- 출처: `adr/0014-error-policy.md:311`(정본, "무엇이 바뀌는가" 표의 옛 문장), `reviews/round-14-owner-answers.md:10`, `03-mental-model.md:232`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:53`("14라운드 O-4 가(식 오류와 대상 없음은 개발 모드 경고)는 이 답으로 대체되었다")

### ERROR-057 대체됨: 검증기 미등록은 조용히 검증을 건너뜀(enabled = false)

- 결정:
  > 검증기 미등록: 조용히 검증을 건너뜀(`enabled = false`), `if` 게이트는 조각 없음(ADR 0004)
- 보충: 없음
- 상태: 대체됨(앞 절 → ERROR-146, ERROR-147; 뒤 절 `if` 조각 없음은 현행 → ERROR-153, ERROR-154)
- 출처: `adr/0014-error-policy.md:312`(정본, "무엇이 바뀌는가" 표의 옛 문장), `08-design-a-to-z.md:345`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:14` 통보 3)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:18`

### ERROR-058 대체됨: 검증기 오류의 옛 처리(컴파일 실패는 노드 errors의 jsonSchemaCompileFailed + console.error, OnChange 실행 실패는 미처리 거부)

- 결정:
  > 검증기 오류: 전체 스키마 컴파일 실패는 노드 `errors`에 `jsonSchemaCompileFailed` + 모든 환경 `console.error`. `OnChange` 검증의 실행 실패는 미처리 거부
- 보충:
  > "오늘: 모든 환경에서 console.error를 내고, 이어 대체 검증기가 노드 errors에 항목을 넣음" (`adr/0014-error-policy.md:280`, §7.2 `JSON_SCHEMA_ERROR.CIRCULAR_REFERENCE` 또는 `SCHEMA_COMPILE_FAILED` 행)
- 상태: 대체됨(→ ERROR-155, ERROR-157, ERROR-039)
- 출처: `adr/0014-error-policy.md:313`(정본, "무엇이 바뀌는가" 표의 옛 문장), `adr/0014-error-policy.md:280,282`
- 닫은 사람: 편집자 결정(17라운드, ADR 0014 4판 채택)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:280,282`

### ERROR-059 대체됨: Form이 자기 바운더리로 마운트 오류를 삼킴(console.error뿐)

- 결정:
  > `Form`이 자기 바운더리로 마운트 오류를 삼킴(`console.error`뿐)
- 보충:
  > "오늘 `Form`은 자기 자신을 에러 바운더리로 감싸(`Form.tsx:311-312`) 마운트 오류를 `console.error`로만 남기고 호스트에 닿지 않게 한다 — 이것은 삼키는 것이다." (`adr/0014-error-policy.md:16`)
- 상태: 대체됨(→ ERROR-088, ERROR-089, ERROR-111)
- 출처: `adr/0014-error-policy.md:314`(정본, "무엇이 바뀌는가" 표의 옛 문장), `adr/0014-error-policy.md:16`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4), 17라운드 스웜 수렴(편집자 결정, `08-design-a-to-z.md:400`)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:16`

### ERROR-060 대체됨: onError 없음 — 경고는 개발 모드 콘솔뿐이며 프로덕션에서도 검출·서식을 돌린 뒤 버림

- 결정:
  > `onError` 없음. 경고는 개발 모드 콘솔뿐이며 프로덕션에서도 검출과 서식을 돌린 뒤 버림
- 보충:
  > "오늘 프로덕션에서 돌다 버려지는 경고 검출과 서식(`warnIfNullUnreachable.ts:25-38`, `processAllOfSchema.ts:38-44`)도 건너뛰므로 오늘보다 싸다." (`adr/0014-error-policy.md:171`)
- 상태: 대체됨(→ ERROR-094, ERROR-030)
- 출처: `adr/0014-error-policy.md:315`(정본, "무엇이 바뀌는가" 표의 옛 문장), `adr/0014-error-policy.md:171`
- 닫은 사람: 17라운드 스웜 수렴(편집자 결정)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:171`

### ERROR-061 대체됨: 오류 둘 이상의 묶음 없음

- 결정:
  > 오류 둘 이상의 묶음: 없음
- 보충: 없음
- 상태: 대체됨(→ ERROR-005)
- 출처: `adr/0014-error-policy.md:316`(정본, "무엇이 바뀌는가" 표의 옛 문장)
- 닫은 사람: 편집자 결정(17라운드, ADR 0014 4판 채택)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:51`

### ERROR-062 대체됨: diagnostics.status는 'stable' 또는 'budgetExceeded', 이번 정착만, exceededBudget 다섯 값

- 결정:
  > `diagnostics.status`: `'stable'` 또는 `'budgetExceeded'`, 이번 정착만, `exceededBudget` 다섯 값
- 보충:
  > "**제안.** 노드 칸 `diagnostics`, 이벤트 `UpdateDiagnostics`, Form 속성 `onDiagnosticsChange`. 삼중 짝이 `state` / `UpdateState` / `onStateChange`와 같은 모양이다. 설계 용어 "settle"(정착)을 배우지 않아도 뜻이 읽힌다." (`06-conclusions.md:362`)
  > "status: 'stable' | 'budgetExceeded';" (`06-conclusions.md:367`)
  > "상한은 **최외곽 진입의 되먹임 사슬당 25**다(06 §4.6). 사슬은 최외곽 진입 하나(§5)의 통지에서 리스너 되먹임이 이어 낸 파동들이며, 세는 것은 되먹임이 낸 파동뿐이다. 상한에 닿으면 마지막 파동을 한 번 더 배달하되 **그 파동의 리스너 되먹임만 거부**하고 `diagnostics`에 `listenerFeedback` 예산 초과를 적는다(§8). **사용자 입력과 호출자 쓰기는 결코 거부하지 않는다**(ADR 0013 결정 1, P2)." (`adr/0008-event-system.md:66`, K1. 대체된 'exceededBudget 다섯 값' 방식의 증거)
  > "5차 본문의 `status: 'budgetExceeded'`는 `'degraded'`와 `cause`로 바뀌었고(08 §14의 이주 행), `exceededBudget`의 다섯 값은 정착의 세 예산으로 줄었다(되먹임·중첩 초과는 `diagnostics`에 남기지 않는다)." (`adr/0008-event-system.md:178`)
  > "비수렴은 원본 B 커밋, `diagnostics.status = 'budgetExceeded'`, 개발 모드 throw, 프로덕션 신호만으로 적었다(5.0의 1)." (`adr/0007-settle-cycle.md:11`)
  > "exceededBudget?: 'conditionalSchemas' | 'derivedValues' | 'transitionDefaults' | 'listenerFeedback' | 'onChangeNesting';" (`06-conclusions.md:368`)
  > "로드 값이 방출에서 빠지는 신호(7절 D-15 실험 뒤)는 예산이 아니므로 `status`의 새 값이 된다. 후보는 `'loadedValueDropped'`." (`06-conclusions.md:374`)
- 상태: 대체됨(→ ERROR-130, ERROR-132, ERROR-135)
- 출처: `adr/0014-error-policy.md:317`(정본, "무엇이 바뀌는가" 표의 옛 문장), `06-conclusions.md:362,366-368,374`, `adr/0008-event-system.md:169-171,178`, `adr/0007-settle-cycle.md:11`
- 닫은 사람: 소유자 답(`reviews/round-14-owner-answers.md:8` O-2), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 편집자 결정(17라운드, `exceededBudget` 다섯 값을 셋으로 줄임)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:201`

### ERROR-063 대체됨: 오류·경고 코드는 공개 계약이 아님

- 결정:
  > 오류·경고 코드는 공개 계약이 아님
- 보충:
  > "오늘 오류·경고 코드는 공개 계약이 아니다. `package.json`의 `exports`는 '.'뿐이고, `src/index.ts`는 판별 함수만 내보내며, 경고 상수는 내부 배럴 `src/helpers/warning`에 있다." (`adr/0014-error-policy.md:176`)
- 상태: 대체됨(→ ERROR-031)
- 출처: `adr/0014-error-policy.md:319`(정본, "무엇이 바뀌는가" 표의 옛 문장), `adr/0014-error-policy.md:176`
- 닫은 사람: 편집자 결정(17라운드, ADR 0014 4판 채택)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:176`

### ERROR-064 대체됨: 가드 컴파일은 늦춘다(ADR 0004)

- 결정:
  > 가드 컴파일은 늦춘다(ADR 0004)
- 보충: 없음
- 상태: 대체됨(개발 모드 부분 → ERROR-041; 프로덕션의 늦은 컴파일은 현행 → ERROR-041)
- 출처: `adr/0014-error-policy.md:318`(정본, "무엇이 바뀌는가" 표의 옛 문장)
- 닫은 사람: 편집자 결정(17라운드, ADR 0014 4판 채택)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:218`

### ERROR-065 03-mental-model.md 오류·경고 분류의 유래와 이름 충돌 정리

- 결정:
  > **오류와 경고의 분류(12라운드, 오늘 코드의 체계를 이어 다시 구성).** 축은 셋이다 — 언제, 누구 잘못, 어떻게 드러남. 오늘의 클래스 `JSONSchemaError`(throw)·`SchemaFormError`·`ValidationError`·`UnhandledError`와 `warnDevelopmentIssue`(개발 모드 전용, 코드+메시지로 중복 억제)를 그대로 잇되, 예약 층과 분기 규칙의 항목을 더했다. 이름 충돌 하나는 고친다: throw되는 클래스 `JSONSchemaError`와 노드 `errors` 항목의 인터페이스 `JSONSchemaError`가 같은 이름이므로 후자를 `ValidationIssue`로 부른다(슬라이스 4).
- 보충: 없음
- 상태: 현행
- 출처: `03-mental-model.md:178`(정본, 원장), `08-design-a-to-z.md:390`(같은 개명을 "이름 충돌 하나를 고친다: 노드 `errors` 항목의 인터페이스 `JSONSchemaError`는 `ValidationIssue`가 된다"로 반복)
- 닫은 사람: 편집자 결정(12라운드 도출, 17라운드 확정 반영)
- 라운드: 17
- 까닭: `03-mental-model.md:178`

### ERROR-066 03-mental-model.md의 ADR 0014 4판 요지 재록

- 결정:
  > **ADR 0014(4판, 채택. 17라운드)가 이 표를 세 층(오류, 경고, 검증 결과 = 노드 `errors`)으로 다시 썼으며, 아래 표는 ADR 0014 §7.1의 분류표를 그대로 옮긴 것이며, 둘이 다르면 ADR 0014가 이긴다(코드 목록은 ADR 0014 §7.2). 작성자 스키마·호출자 데이터에서 온 정착 오류(예산 초과, `controls` 식·가드 실패, `controls.injectTo` 대상 없음)는 모든 환경에서 커밋·통지 뒤 사슬 끝에서 던지고, `degraded`가 다음 로드까지 남아 그 동안 폼의 제출 경로가 `SchemaFormError`로 거부한다(`getValue()`는 막지 않는다). 끄는 스위치는 없다(17라운드 소유자 답 R17-1 나. 12라운드 §4·10라운드 B-1·14라운드 O-4 가를 대체한다). Form 속성 `onError(record)`는 검증 결과를 뺀 폼 내부의 오류와 경고를 같은 모양의 기록으로 받는 관찰자다(17라운드 스웜 수렴(편집자 결정), 안 B. 받는 것·받지 않는 것·기록 모양·시점은 ADR 0014 §3). 핸들러는 흐름을 바꾸지 못하며(던질 것은 던지고 기본 출력도 그대로), 핸들러가 없으면 비용이 없다. 아래 표의 경고 행이 말하는 "프로덕션은 기본 출력 없음"은 기본 출력에만 해당하며, `onError` 핸들러는 모든 환경에서 경고를 받는다. 가칭 `onListenerError`는 두지 않는다(`onError`에 흡수). 바운더리는 렌더 오류를 다시 던지지 않고 가두어 대체 화면을 그린다(ADR 0014 4판).**
- 보충: 없음
- 상태: 분할됨(→ ERROR-171, ERROR-172, ERROR-173, ERROR-174, ERROR-175, ERROR-176, ERROR-177, ERROR-178)
- 출처: `03-mental-model.md:180`(정본, 원장이며 08보다 우선)
- 닫은 사람: 편집자 결정(17라운드, ADR 0014 4판 채택)
- 라운드: 17
- 까닭: `03-mental-model.md:180`
- 충돌:
  > `03-mental-model.md:180`의 "아래 표의 경고 행이 말하는 "프로덕션은 기본 출력 없음""은 그 표(`03-mental-model.md:186,188,194,197`)에 없는 문구를 가리킨다. 정본과 다르다. 정본이 이긴다(`adr/0014-error-policy.md:140`, "프로덕션에서는 기본 출력이 없다. §1의 '침묵'은 기본 출력에만 해당한다.", K9).

### ERROR-067 재생성 reset의 개발 모드 경고 — 코드 없음

- 결정:
  > 개발 모드 경고: 재생성의 원인이 함수·컴포넌트 칸의 참조뿐일 때(JSON 부분은 같을 때) 한 번 알린다(그 값을 모듈 범위로 올리라는 안내). reset을 부르지 않는 인라인 스키마에는 알리지 않는다.
- 보충: 없음
- 상태: 열림(→ `reviews/round-18-agenda.md` §3, :49)
- 출처: `09-landing-and-test-strategy.md:87#20-21`(정본, 원장 파일럿에서 드러난 틈), `reviews/round-18-agenda.md:49`(§3 "재생성 `reset`의 개발 모드 경고" 행)
- 닫은 사람: 편집자 결정(18라운드 안건 이관)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:49`(§3)

### ERROR-068 배열 전용 명령을 비배열 노드에서 부른 호출자 오류 — 코드 없음

- 결정:
  > 비배열에서 부르면 행의 공유 칸이 `SchemaFormError`를 던지므로 겉면과 `dispatch`는 종류를 묻지 않는다. UI 플러그인이 `node.push()`를 부른다. 비배열은 `type`이 배열이 아닌 노드를 말한다.
- 보충: 없음
- 상태: 열림(→ `reviews/round-18-agenda.md` §3, :50)
- 출처: `09-landing-and-test-strategy.md:112#2-4`(정본, 원장 파일럿에서 드러난 틈), `reviews/round-18-agenda.md:50`(§3 "배열 전용 명령을 배열이 아닌 노드에서 부를 때의 호출자 오류" 행) (같은 규칙: NODE-014; 던지는 규칙은 NODE-014에서 현행이고 이 항목에서 열린 것은 그 오류 코드다)
- 닫은 사람: 편집자 결정(18라운드 안건 이관)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:50`(§3)

### ERROR-069 남은 것 5 — `INVALID_VIRTUAL_NODE_VALUES`의 분류가 18라운드 안건으로 이관됨

- 결정:
  > 분류는 슬라이스 1의 options.virtual 설계 항목에서 확정
- 보충: 없음
- 상태: 열림(→ `reviews/round-18-agenda.md` §3, :48)
- 출처: `adr/0014-error-policy.md:257`(정본), `reviews/round-18-agenda.md:48`
- 닫은 사람: 편집자 결정(18라운드 안건 이관)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:48`

### ERROR-070 정착 오류와 공유 충돌은 모든 환경에서 커밋·통지 뒤 사슬 끝에서 던진다

- 결정:
  > 작성자 스키마·호출자 데이터에서 온 정착 오류(예산 초과, `controls` 식·가드 실패, `controls.injectTo` 대상 없음)와 공유 충돌은 모든 환경에서 커밋·통지 뒤 사슬 끝에서 던진다(R17-1 나, 17라운드 소유자 답: "나 허용. 망가진 값을 올리는게 더 위험하겠다").
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:53#1`(정본, ERROR-006에서 분할)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-14-owner-answers.md:16` O-10; 공유 충돌)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:9`
- 충돌:
  > `adr/0008-event-system.md:213`의 "개발 모드의 예산 초과 throw"는 예산 초과 throw를 개발 모드의 것으로 적는다. 정본과 다르다. 정본이 이긴다(`adr/0014-error-policy.md:53`, K13).

### ERROR-071 청사진·호출자·되먹임·리스너·검증기 오류도 모든 환경에서 같게 드러난다

- 결정:
  > 청사진 오류, 호출자 오류, 되먹임·중첩 초과, 리스너·`batch` fn 예외(14라운드 O-5 위임), 검증기 오류도 모든 환경에서 같게 드러난다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:53#2`(정본, ERROR-006에서 분할)
- 닫은 사람: 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:82,89,93` E-frame·E9·E13, 14라운드 O-5 위임 `reviews/round-14-owner-answers.md:11`), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1; 되먹임·중첩 초과, 검증 불가)
- 라운드: 17
- 까닭: `reviews/round-14-owner-answers.md:11`, `reviews/raw-round17-convergence.md:82,93`

### ERROR-072 끄는 스위치는 없다(`throwOnBudgetExceeded` 없음)

- 결정:
  > 끄는 스위치는 없다(Form 속성 `throwOnBudgetExceeded`는 없다).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:53#3`(정본, ERROR-006에서 분할)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:9`

### ERROR-073 12라운드 §4·10라운드 B-1·14라운드 O-4 가는 R17-1로 대체되었다

- 결정:
  > 12라운드 §4("프로덕션은 신호만"), 10라운드 B-1(제출 비차단), 14라운드 O-4 가(식 오류와 대상 없음은 개발 모드 경고)는 이 답으로 대체되었다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:53#4`(정본, ERROR-006에서 분할)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:9`

### ERROR-074 환경에 따라 다른 것은 둘뿐이다

- 결정:
  > 환경에 따라 다른 것은 둘뿐이다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:53#5`(정본, ERROR-006에서 분할)
- 닫은 사람: 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:90,92` E10·E12)
- 라운드: 17
- 까닭: `reviews/raw-round17-convergence.md:90,92`

### ERROR-075 환경 차이 둘 — 경고의 기본 출력과 가드 컴파일 실패를 알리는 시점

- 결정:
  > 경고의 기본 출력(개발 모드 콘솔)과, 가드 컴파일 실패를 알리는 시점(§6)이다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:53#6`(정본, ERROR-006에서 분할)
- 닫은 사람: 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:90,92` E10·E12)
- 라운드: 17
- 까닭: `reviews/raw-round17-convergence.md:90,92`

### ERROR-076 오류 메시지는 어느 환경에서도 줄이지 않는다

- 결정:
  > 오류 메시지는 어느 환경에서도 줄이지 않는다(번호와 해독 페이지로 바꾸지 않는다).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:53#7`(정본, ERROR-006에서 분할)
- 닫은 사람: 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:90` E10)
- 라운드: 17
- 까닭: `reviews/raw-round17-convergence.md:90`

### ERROR-077 마운트 정착의 오류는 렌더 중에 던지지 않고 트리를 만드는 자리에서 잡는다

- 결정:
  > **마운트 정착의 오류 — 원인별.** 마운트 정착의 오류는 렌더 중에 던지지 않고 트리를 만드는 자리(청사진 오류와 같은 자리)에서 잡는다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:59`(정본, ERROR-009에서 분할)
- 닫은 사람: 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:87` E6)
- 라운드: 17
- 까닭: `reviews/raw-round17-convergence.md:87`

### ERROR-078 마운트의 공유 충돌 — 모든 환경에서 폼이 서지 않는다

- 결정:
  > 공유 충돌: 모든 환경에서 폼이 서지 않는다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:61#1`(정본, ERROR-009에서 분할)
- 닫은 사람: 소유자 답(`reviews/round-14-owner-answers.md:16` O-10)
- 라운드: 14
- 까닭: `reviews/round-14-owner-answers.md:16`

### ERROR-079 마운트의 공유 충돌 — 대체 화면을 그리고 커밋 뒤 `onError`와 싱크로 드러낸다

- 결정:
  > 폼 자리에 청사진 오류와 같은 대체 화면을 그리고, 커밋 뒤 이펙트에서 `onError`와 싱크로 드러낸다(14라운드 O-10).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:61#2`(정본, ERROR-009에서 분할)
- 닫은 사람: 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:87` E6)
- 라운드: 17
- 까닭: `reviews/raw-round17-convergence.md:87`

### ERROR-080 마운트의 예산 초과·식·가드 실패·동적 대상 없음 — 폼이 선다

- 결정:
  > 예산 초과, 식·가드 실패, 동적 `controls.injectTo` 대상 없음: 폼이 선다(R17-1 나).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:62#1`(정본, ERROR-009에서 분할)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:9`

### ERROR-081 폼이 서는 원인 — 원인별 값으로 정착을 마치고 `degraded`로 시작한다

- 결정:
  > 원인마다 정의된 값(예산 초과는 원본 B, 식·가드 실패는 §4의 자리별 값, 대상 없음은 그 규칙을 후보에서 뺌)으로 정착을 마치고 커밋하며, `diagnostics`는 `degraded`로 시작한다(§5).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:62#2`(정본, ERROR-009에서 분할)
- 닫은 사람: 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:87` E6)
- 라운드: 17
- 까닭: `reviews/raw-round17-convergence.md:87`

### ERROR-082 폼이 서는 원인 — 오류는 커밋 뒤 준비 이펙트에서 드러낸다

- 결정:
  > 오류는 커밋 뒤 준비 이펙트에서 `onError`와 싱크로 드러낸다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:62#3`(정본, ERROR-009에서 분할)
- 닫은 사람: 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:87` E6)
- 라운드: 17
- 까닭: `reviews/raw-round17-convergence.md:87`

### ERROR-083 폼이 서는 원인에서는 마운트에서도 커밋한 값을 잃지 않는다

- 결정:
  > 폼이 서는 원인에서는 마운트에서도 폼이 커밋한 값을 잃지 않는다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:62#4`(정본, ERROR-009에서 분할)
- 닫은 사람: 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:87` E6)
- 라운드: 17
- 까닭: `reviews/raw-round17-convergence.md:87`

### ERROR-084 서버 사이드 렌더링·하이드레이션·reset 재생성의 첫 로드에서의 마운트 정착 오류

- 결정:
  > 어느 경우든 생성 자리에서 잡으므로 서버 사이드 렌더링의 페이지는 실패하지 않는다. 클라이언트는 하이드레이션에서 트리를 다시 만들어 같은 오류를 커밋 뒤에 드러낸다. reset 재생성의 첫 로드는 호출자가 있는 사슬이므로 새 트리로 커밋하고 핸들을 바꾼 뒤 reset의 사슬 끝에서 던진다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:64`(정본, ERROR-009에서 분할)
- 닫은 사람: 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:87` E6)
- 라운드: 17
- 까닭: `reviews/raw-round17-convergence.md:87`

### ERROR-085 React에서 보이는 것(머리말)

- 결정:
  > **React에서 보이는 것.**
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:66#1`(정본, ERROR-010에서 분할)
- 닫은 사람: 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:88` E8)
- 라운드: 17
- 까닭: `reviews/raw-round17-convergence.md:88`

### ERROR-086 이벤트 핸들러 안에서 던져진 예외는 에러 바운더리를 발화시키지 않는다

- 결정:
  > 이벤트 핸들러 안에서 던져진 예외는 에러 바운더리를 발화시키지 않는다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:66#2`(정본, ERROR-010에서 분할)
- 닫은 사람: 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:88` E8)
- 라운드: 17
- 까닭: `reviews/raw-round17-convergence.md:88`

### ERROR-087 화면은 직전 커밋 상태로 남고 전역 오류로 잡힌다

- 결정:
  > 화면은 백지가 되지 않고 직전 커밋 상태로 남으며, 브라우저 전역 오류와 모니터링 도구에 잡힌다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:66#3`(정본, ERROR-010에서 분할)
- 닫은 사람: 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:88` E8)
- 라운드: 17
- 까닭: `reviews/raw-round17-convergence.md:88`

### ERROR-088 폼의 바운더리는 다시 던지지 않고 삼키지도 않는다

- 결정:
  > 폼의 바운더리(루트 바운더리와 사용자 주입 구성 요소의 필드 바운더리)는 **다시 던지지 않고 삼키지도 않는다.**
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:66#4`(정본, ERROR-010에서 분할)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:15`

### ERROR-089 바운더리는 가두어 대체 화면을 그리고 `componentDidCatch`에서 `onError`와 싱크로 넘긴다

- 결정:
  > 오늘처럼 가두어 대체 화면을 그리되, 잡은 오류를 `componentDidCatch`에서 `onError`와 싱크로 넘긴다(오늘은 `console.error`뿐이다).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:66#5`(정본, ERROR-010에서 분할)
- 닫은 사람: 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:88` E8)
- 라운드: 17
- 까닭: `reviews/raw-round17-convergence.md:88`

### ERROR-090 필드 바운더리가 감싸는 자리

- 결정:
  > 필드 바운더리는 오늘처럼 인라인 입력(`useFormTypeInput.ts:36-37`), 덮어쓴 입력(`SchemaNodeInputWrapper.tsx:56-57`), 정의·맵의 입력(`formTypeInputDefinitions.ts:32`·`:37`, `formTypeInputMap.ts:32`·`:37`), 렌더러(`SchemaNodeProxy.tsx:59`), `Placeholder`(`VirtualizationManager.ts:214`)를 감싼다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:66#6`(정본, ERROR-010에서 분할)
- 닫은 사람: 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:88` E8)
- 라운드: 17
- 까닭: `reviews/raw-round17-convergence.md:88`

### ERROR-091 오류 부류 판별에 기대지 않고 중첩 폼의 청사진 오류는 안쪽에서 멈춘다

- 결정:
  > 바운더리가 다시 던지지 않으므로 오류 부류 판별(`instanceof`, `group`)에 기대지 않고, 중첩 `<Form>`의 청사진 오류는 안쪽 폼 자리에서 멈춘다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:66#7`(정본, ERROR-010에서 분할)
- 닫은 사람: 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:88` E8)
- 라운드: 17
- 까닭: `reviews/raw-round17-convergence.md:88`

### ERROR-092 공개 동작(대체 화면)은 바뀌지 않는다

- 결정:
  > 공개 동작(대체 화면)은 바뀌지 않는다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:66#8`(정본, ERROR-010에서 분할)
- 닫은 사람: 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:88` E8)
- 라운드: 17
- 까닭: `reviews/raw-round17-convergence.md:88`

### ERROR-093 바운더리와 핸들러 예외 규칙의 귀속 문장

- 결정:
  > 바운더리가 오류를 호스트로 올려 보내지 않는 것과 핸들러의 예외를 바운더리 밖으로 내보내지 않는 것은 17라운드 소유자 답(통보4)이다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:66#9`(정본, ERROR-010에서 분할)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4; 앞 절), 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:57`; 핸들러 예외)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:15`
- 충돌:
  > `adr/0014-error-policy.md:66`의 "바운더리가 오류를 호스트로 올려 보내지 않는 것과 핸들러의 예외를 바운더리 밖으로 내보내지 않는 것은 17라운드 소유자 답(통보4)이다"는 핸들러 예외의 규칙까지 소유자 답으로 적는다. 정본과 다르다. 정본이 이긴다(`reviews/round-17-owner-answers.md:15`, 반영 칸 "다시 던지지 않는 것과 검증 오류를 섞지 않는 것은 소유자의 답이다").

### ERROR-094 `onError(record)`는 검증 결과를 뺀 오류와 경고를 받는 관찰자다

- 결정:
  > Form 속성 `onError(record)`는 검증 결과를 뺀 폼 내부의 오류와 경고를 같은 모양의 기록으로 받는 **관찰자**다(17라운드 4번 수렴의 안 B, 17라운드 스웜 수렴(편집자 결정).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:70#1`(정본, ERROR-011에서 분할)
- 닫은 사람: 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:15` 반영 칸)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:15`

### ERROR-095 관찰자 채널의 소유자 발언 — 검증 오류가 걸러진 로깅 채널

- 결정:
  > 소유자의 "validate error 가 걸러진 에러 로깅용 전용 채널").
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:70#2`(정본, ERROR-011에서 분할)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:15`

### ERROR-096 핸들러는 흐름을 바꾸지 못한다

- 결정:
  > 핸들러는 흐름을 바꾸지 못한다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:70#3`(정본, ERROR-011에서 분할)
- 닫은 사람: 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:15` 반영 칸)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:15`

### ERROR-097 반환값은 무시되고 어떤 기본 드러남도 대신하거나 끄지 못한다

- 결정:
  > 반환값은 무시되고, 어떤 기본 드러남(사슬 끝 throw, 프로미스 거부, 주인 없는 오류 싱크, 개발 모드 콘솔)도 대신하거나 끄지 못하므로, 핸들러가 던지지 않는 한 핸들러가 있든 없든 폼의 동작은 같다(핸들러가 던지면 그 예외도 원래 오류와 함께 드러난다).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:70#4`(정본, ERROR-011에서 분할)
- 닫은 사람: 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:15` 반영 칸)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:15`

### ERROR-098 핸들러가 없으면 비용도 없다

- 결정:
  > 핸들러가 없으면 비용도 없다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:70#5`(정본, ERROR-011에서 분할)
- 닫은 사람: 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:15` 반영 칸)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:15`

### ERROR-099 `onListenerError`는 `onError`에 흡수된다

- 결정:
  > `throwOnBudgetExceeded`는 없고(R17-1 나), 가칭 `onListenerError`는 `onError`에 흡수된다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:70#6`(정본, ERROR-011에서 분할)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1; 앞 절), 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:93` E13; 뒤 절)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:9`, `reviews/raw-round17-convergence.md:93`

### ERROR-100 `onError`가 받지 않는 것 — 검증 결과를 뺀 나머지 목록

- 결정:
  > **받지 않는 것.**
  >
  > - 정착 추적(개발 모드 기록)
  > - `diagnostics`의 상태 변화(원인 오류는 기록된다)
  > - 묶음 `SchemaFormError` 자체(구성 오류마다 기록한다)
  > - 핸들러 자신의 예외와 핸들러 안 쓰기의 거부
  > - 호스트 `onSubmit`이 던지거나 거부한 것(호스트 자신의 코드이며 제출 프로미스로 부른 쪽에 간다)
  > - 폼 인스턴스 밖의 사건: `registerPlugin`의 `UNHANDLED_ERROR.REGISTER_PLUGIN`
  > - React 자신의 경고와, core가 감지하지 않는 렌더 중 쓰기(P5)
- 보충: 없음
- 상태: 현행(부정 결정)
- 출처: `adr/0014-error-policy.md:93,96-102`(정본, ERROR-015에서 분할)
- 닫은 사람: 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:15` 반영 칸)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:15`

### ERROR-101 `onError`가 받지 않는 것 — 검증 결과 전부

- 결정:
  > - 검증 결과 전부: 노드 `errors`의 `ValidationIssue`, `onValidate`, `errors` 속성과 `setExternalErrors`·`clearExternalErrors`, 제출의 `VALIDATION_ERROR.SCHEMA_VALIDATION_FAILED`(17라운드 소유자 답, 통보4 둘째 답)
- 보충: 없음
- 상태: 현행(부정 결정)
- 출처: `adr/0014-error-policy.md:95`(정본, ERROR-015에서 분할)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:15`

### ERROR-102 층과 level(머리말)

- 결정:
  > **층과 level.**
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:120#1`(정본, ERROR-018에서 분할)
- 닫은 사람: 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:47`)
- 라운드: 17
- 까닭: `reviews/raw-round17-onerror.md:47`

### ERROR-103 `level`이 `'error'`이면 오류 층이다

- 결정:
  > `level`이 `'error'`이면 오류 층이다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:120#2`(정본, ERROR-018에서 분할)
- 닫은 사람: 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:47`)
- 라운드: 17
- 까닭: `reviews/raw-round17-onerror.md:47`

### ERROR-104 오류 층 — 약속이 깨진 사건, 기본 드러남은 셋 가운데 하나

- 결정:
  > 폼의 약속이 깨진 사건이며, 기본 드러남은 throw, 거부, 싱크 가운데 정확히 하나다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:120#3`(정본, ERROR-018에서 분할)
- 닫은 사람: 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:47`)
- 라운드: 17
- 까닭: `reviews/raw-round17-onerror.md:47`

### ERROR-105 `level`이 `'warning'`이면 경고 층이다

- 결정:
  > `level`이 `'warning'`이면 경고 층이다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:120#4`(정본, ERROR-018에서 분할)
- 닫은 사람: 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:47`)
- 라운드: 17
- 까닭: `reviews/raw-round17-onerror.md:47`

### ERROR-106 경고 층 — 동작을 바꾸지 않는 사건, 기본 드러남은 개발 모드 콘솔

- 결정:
  > 동작을 바꾸지 않는 사건이며, 기본 드러남은 개발 모드 콘솔이다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:120#5`(정본, ERROR-018에서 분할)
- 닫은 사람: 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:47`)
- 라운드: 17
- 까닭: `reviews/raw-round17-onerror.md:47`

### ERROR-107 예산 초과·식·가드 실패·동적 대상 없음·되먹임·중첩 초과는 `'error'`

- 결정:
  > R17-1 나에 따라 예산 초과, 식·가드 실패, 동적 `controls.injectTo` 대상 없음, 되먹임·중첩 초과는 `'error'`다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:120#6`(정본, ERROR-018에서 분할)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:9`

### ERROR-108 검증기 없음은 `'warning'`

- 결정:
  > 검증기 없음은 거부하지 않으므로 `'warning'`이다(17라운드 소유자 답 (가) "(가) ㄱ warning으로.").
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:120#7`(정본, ERROR-018에서 분할)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:33` (가))
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:33`

### ERROR-109 가르는 물음은 §1대로다

- 결정:
  > 가르는 물음은 §1대로 '이 사건 뒤에도 원장의 규칙이 지켜지는가'다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:120#8`(정본, ERROR-018에서 분할)
- 닫은 사람: 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:47`)
- 라운드: 17
- 까닭: `reviews/raw-round17-onerror.md:47`

### ERROR-110 바운더리 경로(머리말)

- 결정:
  > **바운더리 경로.**
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:158#1`(정본, ERROR-027에서 분할)
- 닫은 사람: 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:56`)
- 라운드: 17
- 까닭: `reviews/raw-round17-onerror.md:56`

### ERROR-111 범용 `withErrorBoundaryForwardRef`를 schema-form의 바깥 감싸개로 바꾼다

- 결정:
  > `Form.tsx:311-312`의 범용 `withErrorBoundaryForwardRef`를 schema-form의 바깥 감싸개로 바꾼다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:158#2`(정본, ERROR-027에서 분할)
- 닫은 사람: 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:56`)
- 라운드: 17
- 까닭: `reviews/raw-round17-onerror.md:56`

### ERROR-112 바깥 감싸개가 인스턴스 보고기를 들고 루트 바운더리를 둔다

- 결정:
  > 바깥 감싸개는 인스턴스 보고기(최신 핸들러, `WeakSet`, 경고 집합, 전달 중 표지)를 `useRef`로 들고 문맥으로 내려 주며, 그 안에 보고를 받는 루트 바운더리를 둔다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:158#3`(정본, ERROR-027에서 분할)
- 닫은 사람: 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:56`)
- 라운드: 17
- 까닭: `reviews/raw-round17-onerror.md:56`

### ERROR-113 보고기는 대체 화면으로 바뀐 뒤에도 살아 있다

- 결정:
  > 보고기가 루트 바운더리 바깥에 있으므로 대체 화면으로 바뀐 뒤에도 살아 있다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:158#4`(정본, ERROR-027에서 분할)
- 닫은 사람: 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:56`)
- 라운드: 17
- 까닭: `reviews/raw-round17-onerror.md:56`

### ERROR-114 필드 바운더리는 감싸기를 두고 렌더 때 문맥에서 보고기를 읽는다

- 결정:
  > 감싸는 자리가 모듈 수준(`PluginManager.ts:39-40`·`:78`), `FormProvider`(`ExternalFormContextProvider.tsx:222`), 폼마다(`FormTypeInputsContextProvider.tsx:31-36`)로 갈리는 필드 바운더리(`formTypeInputDefinitions.ts:32`·`:37`, `formTypeInputMap.ts:32`·`:37`)는 감싸기를 그대로 두고, 렌더 때 문맥에서 보고기를 읽는다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:158#5`(정본, ERROR-027에서 분할)
- 닫은 사람: 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:56`)
- 라운드: 17
- 까닭: `reviews/raw-round17-onerror.md:56`

### ERROR-115 `@winglet/react-utils` 감싸개에 렌더 때 보고 함수를 얻는 선택 인자를 더한다

- 결정:
  > `@winglet/react-utils`의 `withErrorBoundary`·`withErrorBoundaryForwardRef`에는 렌더 때 보고 함수를 얻는 선택 인자를 더한다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:158#6`(정본, ERROR-027에서 분할)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:34` (나)), 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:56`)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:34`, `reviews/raw-round17-onerror.md:56,152`

### ERROR-116 선택 인자를 주지 않으면 오늘 동작이고 판은 minor다

- 결정:
  > 주지 않으면 오늘 동작이고 판은 minor다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:158#7`(정본, ERROR-027에서 분할)
- 닫은 사람: 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:56`)
- 라운드: 17
- 까닭: `reviews/raw-round17-onerror.md:56`

### ERROR-117 선택 인자의 모양은 PR-7에서 고른다

- 결정:
  > 인자의 모양(ErrorBoundary 보고 콜백 속성과 그 공개, 또는 감싸개의 보고기 읽기 인자)은 PR-7에서 고른다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:158#8`(정본, ERROR-027에서 분할)
- 닫은 사람: 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:56`)
- 라운드: 17
- 까닭: `reviews/raw-round17-onerror.md:56`

### ERROR-118 `@winglet/react-utils`의 'Ask first' 두 항목 확장을 소유자가 허용했다

- 결정:
  > 그 모듈 INTENT의 'Ask first' 두 항목(고차 구성 요소의 시그니처 확장, 내부 오류 경계 구성 요소의 공개 표면 승격)에 해당하며, 소유자가 확장을 허용했다(17라운드 소유자 답 (나) "(나) 확장 허용합니다").
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:158#9`(정본, ERROR-027에서 분할)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:34` (나))
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:34`

### ERROR-119 PR-7에서 그 모듈의 `DETAIL.md`를 먼저 갱신한 뒤 코드를 고친다

- 결정:
  > PR-7에서 그 모듈의 `DETAIL.md`를 먼저 갱신한 뒤 코드를 고친다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:158#10`(정본, ERROR-027에서 분할)
- 닫은 사람: 편집자 결정(17라운드, `reviews/round-17-owner-answers.md:34` 반영 칸)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:34`

### ERROR-120 식은 네 자리에서 평가된다

- 결정:
  > 식은 네 자리에서 평가된다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:188#1`(정본, ERROR-033에서 분할)
- 닫은 사람: 편집자 결정(17라운드, `adr/0014-error-policy.md:188`)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:188`

### ERROR-121 식이 던지면 자리별 값으로 정착을 마치고 모든 환경에서 사슬 끝에서 throw한다

- 결정:
  > 던지면 그 자리마다 정의된 값으로 정착을 마치고, 사슬의 끝에서 모든 환경에서 throw한다(R17-1 나, 가칭 코드 `SCHEMA_FORM_ERROR.EXPRESSION_THREW`, 원래 예외는 `details.error`).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:188#2`(정본, ERROR-033에서 분할)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:9`

### ERROR-122 식이 던질 때의 자리별 값 표

- 결정:
  > | 자리 | 던지면 |
  > | --- | --- |
  > | 게이트(`if` 게이트 함수와 그 가드, `controls.active`) | 그 게이트는 거짓이다 |
  > | 상태 키(`controls.visible`·`controls.readOnly`·`controls.disabled`, 조각과 `controls.children`의 `controls`) | 그 선언은 없는 것이다 |
  > | 파생 규칙(`controls.derived`·`controls.injectTo`·`controls.unsetValue`), 동적으로만 아는 `controls.injectTo` 대상이 없음 | 그 규칙을 그 라운드의 후보에서 빼고 에지를 소비한다 |
  > | `controls.resetInteraction` | 그 판정은 거짓이다 |
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:190-195`(정본, ERROR-033에서 분할)
- 닫은 사람: 편집자 결정(17라운드, `adr/0014-error-policy.md:188`)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:188`

### ERROR-123 정적 `controls.injectTo` 대상이 청사진에 없거나 터미널 아래면 청사진 오류다

- 결정:
  > 정적으로 아는 `controls.injectTo` 대상 경로(식이 아닌 경로 문자열)가 청사진에 없거나 터미널 아래면 청사진 오류다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:197#1`(정본, ERROR-033에서 분할)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:9`, `reviews/raw-round17-convergence.md:105`

### ERROR-124 형상에 없는 노드를 가리키는 것은 오류가 아니다

- 결정:
  > 형상에 없는(비활성) 노드를 가리키는 것은 오류가 아니다 — 형상에 없는 노드의 규칙은 평가하지 않고 그 노드에 쓰지도 않는다(원장 §3).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:197#2`(정본, ERROR-033에서 분할)
- 닫은 사람: 편집자 결정(17라운드, `adr/0014-error-policy.md:197`)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:197`

### ERROR-125 식·가드가 던져 거짓이 된 게이트로 나간 노드에는 나감 비움을 적용하지 않는다

- 결정:
  > 식이나 가드가 던져 거짓이 된 게이트로 나간 노드에는 나감 비움을 적용하지 않는다(작성자의 잘못으로 커밋된 값을 잃지 않는다).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:197#3`(정본, ERROR-033에서 분할)
- 닫은 사람: 편집자 결정(17라운드, `adr/0014-error-policy.md:197`)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:197`

### ERROR-126 식이나 가드가 던지면 그 커밋은 `degraded`다

- 결정:
  > 어느 자리든 식이나 가드가 던지면 그 커밋은 `degraded`다(§5).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:197#4`(정본, ERROR-033에서 분할)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:203`

### ERROR-127 가드 실패와 동적 대상 없음의 가칭 코드

- 결정:
  > 가드의 평가 실패와 컴파일 실패는 가칭 `SCHEMA_FORM_ERROR.GUARD_FAILED`, 동적 대상 없음은 가칭 `SCHEMA_FORM_ERROR.INJECT_TARGET_MISSING`이다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:197#5`(정본, ERROR-033에서 분할)
- 닫은 사람: 편집자 결정(17라운드, `adr/0014-error-policy.md:197`)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:197`

### ERROR-128 `diagnostics`는 작업의 기록이다

- 결정:
  > `diagnostics`는 상태(`raw`·`extras`)도 계산 결과((스키마, 원본)의 함수)도 아니라 **작업의 기록**이다(원장 §2의 분류. 재계산 목록·`revision`·커밋 번호와 같은 칸).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:201#1`(정본, ERROR-034에서 분할)
- 닫은 사람: 편집자 결정(17라운드, `adr/0014-error-policy.md:201`)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:201`

### ERROR-129 `diagnostics`는 로드에서 초기화한다

- 결정:
  > 로드(마운트, 스키마 교체, 루트 전체 교체 `setValue(V)`, `reset`)에서 초기화한다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:201#2`(정본, ERROR-034에서 분할)
- 닫은 사람: 소유자 답(`reviews/round-14-owner-answers.md:8` O-2)
- 라운드: 14
- 까닭: `adr/0014-error-policy.md:203`

### ERROR-130 `diagnostics`의 모양(앞 조각)

- 결정:
  > 모양은 `{ status: 'stable' | 'degraded', cause?: 'budget' | 'expression' | 'injectTarget' | 'sharedConflict', exceededBudget?: 'hostWheel' | 'derive' | 'transition', iterations?, commit?
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:201#3`(정본, ERROR-034에서 분할)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1; `status` 두 값·`cause`·`commit`), 소유자 답(`reviews/round-14-owner-answers.md:8` O-2; `commit`), 편집자 결정(17라운드, `adr/0014-error-policy.md:201`)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:201`

### ERROR-131 `diagnostics`의 모양(뒤 조각) — 모든 칸은 `commit` 번호의 커밋을 기술한다

- 결정:
  > }`이며 모든 칸은 `commit` 번호의 커밋을 기술한다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:201#4`(정본, ERROR-034에서 분할)
- 닫은 사람: 편집자 결정(17라운드, `adr/0014-error-policy.md:201`)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:201`

### ERROR-132 작성자의 선언이 빠진 커밋 넷 가운데 하나라도 있으면 `status = 'degraded'`

- 결정:
  > 작성자의 선언이 빠지거나 뜻대로 평가되지 못한 커밋 — 원본 B, 어느 자리든 `controls`의 식·가드의 throw, 동적 `controls.injectTo` 대상 없음, 공유 충돌 — 이 하나라도 있으면 `status = 'degraded'`이고 `commit`은 그 첫 커밋 번호다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:201#5`(정본, ERROR-034에서 분할)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:203`

### ERROR-133 `cause`의 네 값

- 결정:
  > `cause`는 예산 초과면 `'budget'`, `controls`의 식이나 `if` 가드의 평가·컴파일 실패면 `'expression'`, 동적 대상 없음이면 `'injectTarget'`, 공유 충돌이면 `'sharedConflict'`다(R17-1 나가 식과 가드의 실패를 한 묶음으로 둔 것을 따른다).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:201#6`(정본, ERROR-034에서 분할)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1; 원인 넷), 편집자 결정(17라운드, `adr/0014-error-policy.md:201`; 값 이름)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:201`

### ERROR-134 마운트 정착에서 난 것이면 `degraded`로 시작한다

- 결정:
  > 마운트 정착에서 난 것이면 `degraded`로 시작한다(§2).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:201#7`(정본, ERROR-034에서 분할)
- 닫은 사람: 편집자 결정(17라운드, `adr/0014-error-policy.md:201`)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:201`

### ERROR-135 `diagnostics`는 다음 로드까지 남는다(머리말)

- 결정:
  > **다음 로드까지 남는다.**
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:203#1`(정본, ERROR-034에서 분할)
- 닫은 사람: 소유자 답(`reviews/round-14-owner-answers.md:8` O-2)
- 라운드: 14
- 까닭: `reviews/round-14-owner-answers.md:8`

### ERROR-136 지속은 14라운드 답 O-2 가다

- 결정:
  > 지속은 14라운드 답 O-2 가다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:203#2`(정본, ERROR-034에서 분할)
- 닫은 사람: 소유자 답(`reviews/round-14-owner-answers.md:8` O-2)
- 라운드: 14
- 까닭: `reviews/round-14-owner-answers.md:8`

### ERROR-137 원인 넷과 그 동안의 제출 거부는 R17-1 나다

- 결정:
  > 원인을 넷으로 넓힌 것과 그 동안의 제출 거부는 17라운드 소유자 답 R17-1 나다(10라운드 B-1의 제출 비차단을 대체한다).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:203#3`(정본, ERROR-034에서 분할)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:9`

### ERROR-138 `degraded` 동안 제출 경로는 `SchemaFormError`로 거부한다

- 결정:
  > 그 동안 `<Form>`의 제출 경로(`FormHandle.submit`, `useFormSubmit`, 네이티브 submit — 모두 `async onSubmit` 하나로 모인다)는 `SchemaFormError`(가칭 코드 `SCHEMA_FORM_ERROR.SUBMIT_WHILE_DEGRADED`, 제출 시도마다 새 객체)로 거부한다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:203#4`(정본, ERROR-034에서 분할)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:9`

### ERROR-139 제출 거부가 드러나는 길 — 프로미스 거부, 네이티브 submit은 `onError` 뒤 싱크

- 결정:
  > `FormHandle.submit`과 `useFormSubmit`은 그 프로미스를 거부하고, 부른 쪽이 기다리지 않는 네이티브 submit은 `onError` 뒤 싱크로 보낸다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:203#5`(정본, ERROR-034에서 분할)
- 닫은 사람: 편집자 결정(17라운드, `adr/0014-error-policy.md:203`)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:203`

### ERROR-140 제출 거부는 렌더 계층의 일이다

- 결정:
  > core는 제출을 모르므로 거부는 렌더 계층의 일이다(P5).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:203#6`(정본, ERROR-034에서 분할)
- 닫은 사람: 편집자 결정(17라운드, `adr/0014-error-policy.md:203`)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:203`

### ERROR-141 `getValue()`는 막지 않는다

- 결정:
  > `getValue()`는 막지 않는다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:203#7`(정본, ERROR-034에서 분할)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:9`, `reviews/raw-round17-convergence.md:105`

### ERROR-142 제출이 막힐 때 호스트가 그릴 자리, 되먹임·중첩 초과는 `diagnostics`에 남기지 않음

- 결정:
  > **제출이 막힐 때 호스트가 그릴 자리.** 폼은 `degraded`를 화면에 그리지 않는다. 호스트는 두 자리에서 폼 수준 표시(배너, 제출 버튼의 비활성 같은 것)를 그린다. 하나는 제출 거부의 `SchemaFormError`다(`FormHandle.submit`·`useFormSubmit`의 거부, 네이티브 submit이면 `onError` 기록). 다른 하나는 `onDiagnosticsChange`(`status`와 `cause`)로, 제출 전에 막힘을 미리 알 수 있다. 호출자는 로드(스키마 교체, 루트 전체 교체 `setValue(V)`, `reset`)로 `stable`로 되돌린다.
  >
  > 되먹임 파동과 `onChange` 중첩의 초과는 소비자 코드의 쓰기를 거부한 것이지 작성자의 선언을 뺀 것이 아니므로 `diagnostics`에 남기지 않고 사슬의 끝에서 던지기만 한다(ADR 0008 §2 규칙 4·§8의 `exceededBudget` 다섯 값을 셋으로 줄인다).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:205-207`(정본, ERROR-034에서 분할)
- 닫은 사람: 편집자 결정(17라운드, `adr/0014-error-policy.md:205-207`)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:9`(반영 칸), `02-target-overview.md:310`

### ERROR-143 검증기는 플러그인 또는 Form 속성 `validatorFactory`에서 온다

- 결정:
  > 검증기는 플러그인(전역 기본) 또는 Form 속성 `validatorFactory`(그 폼의 인스턴스, 14라운드 답 O-7)에서 온다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:211#1`(정본, ERROR-035에서 분할), `adr/0004-validator-plugin-compile-guard.md:37`
- 닫은 사람: 소유자 답(`reviews/round-14-owner-answers.md:13` O-7)
- 라운드: 14
- 까닭: `reviews/round-14-owner-answers.md:13`

### ERROR-144 검증기가 어느 쪽에서 오든 청사진 오류가 아니며 폼은 선다

- 결정:
  > 어느 경우도 청사진 오류가 아니며 폼은 선다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:211#2`(정본, ERROR-035에서 분할)
- 닫은 사람: 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:84` E3)
- 라운드: 17
- 까닭: `reviews/raw-round17-convergence.md:84`

### ERROR-145 기본 검증 모드는 그대로 두고 암묵 기본값은 두지 않는다

- 결정:
  > 기본 검증 모드 `OnChange | OnRequest`는 그대로 두고 '검증기가 있으면 `OnChange`, 없으면 `None`' 같은 암묵 기본값은 두지 않는다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:211#3`(정본, ERROR-035에서 분할)
- 닫은 사람: 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:84` E3)
- 라운드: 17
- 까닭: `reviews/raw-round17-convergence.md:84`

### ERROR-146 검증기 없음 — 거부하지 않고 검증 없이 진행한다

- 결정:
  > **검증기 없음**(플러그인에도 `validatorFactory`에도 없고 검증 모드가 `None`이 아님): 거부하지 않고 검증 없이 진행한다(17라운드 소유자 답, 통보3: "오류만 내보내고 거절은 하지 마시죠. 사용자가 인지만 하면 될거고, 기본값이 있어서 사용자가 오히려 불편할겁니다").
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:213#1`(정본, ERROR-036에서 분할)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:14` 통보 3)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:14`

### ERROR-147 검증기 없음 — 개발 모드 콘솔과 `onError` 경고 기록으로 알린다

- 결정:
  > 개발 모드 콘솔과 `onError`의 경고 기록(`level: 'warning'`, 가칭 코드 `SCHEMA_FORM_WARNING.VALIDATOR_MISSING`, 17라운드 소유자 답 (가))으로 알린다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:213#2`(정본, ERROR-036에서 분할)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:33` (가))
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:33`

### ERROR-148 검증기 없음 알림은 트리마다 한 번이다

- 결정:
  > 트리마다 한 번(마운트, 재생성 reset) 보내고, 값을 통째로 바꾸는 `setValue`나 같은 스키마 reset에서는 다시 보내지 않는다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:213#3`(정본, ERROR-036에서 분할)
- 닫은 사람: 게이트 고침(R17G-2, `reviews/raw-round17-onerror.md:150`)
- 라운드: 17
- 까닭: `reviews/raw-round17-onerror.md:150`

### ERROR-149 검증기 없음 알림의 전달 시점

- 결정:
  > 전달 시점은 마운트면 준비 이펙트, 재생성 reset이면 reset 사슬 끝이다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:213#4`(정본, ERROR-036에서 분할)
- 닫은 사람: 게이트 고침(R17G-2, `reviews/raw-round17-onerror.md:150`)
- 라운드: 17
- 까닭: `reviews/raw-round17-onerror.md:150`

### ERROR-150 검증기 없음 알림은 프로덕션에 기본 출력이 없다

- 결정:
  > 프로덕션에는 기본 출력이 없다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:213#5`(정본, ERROR-036에서 분할)
- 닫은 사람: 편집자 결정(17라운드, `reviews/round-17-owner-answers.md:14` 반영 칸)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:14`

### ERROR-151 검증 모드를 `None`으로 적으면 알림이 없다

- 결정:
  > 검증을 쓰지 않는 폼은 검증 모드를 `None`으로 적으면 알림이 없다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:213#6`(정본, ERROR-036에서 분할)
- 닫은 사람: 편집자 결정(17라운드, `adr/0014-error-policy.md:213`)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:213`

### ERROR-152 조건부 스키마(머리말)

- 결정:
  > **조건부 스키마.**
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:214#1`(정본, ERROR-037에서 분할)
- 닫은 사람: 소유자 답(`adr/0004-validator-plugin-compile-guard.md:54`), 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:85` E4)
- 라운드: 17
- 까닭: `adr/0004-validator-plugin-compile-guard.md:54`

### ERROR-153 ADR 0004의 합의("조건부 비활성 + 경고")를 유지한다

- 결정:
  > ADR 0004의 합의("조건부 비활성 + 경고", 소유자 동의)를 유지한다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:214#2`(정본, ERROR-037에서 분할)
- 닫은 사람: 소유자 답(`adr/0004-validator-plugin-compile-guard.md:54`), 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:85` E4)
- 라운드: 17
- 까닭: `adr/0004-validator-plugin-compile-guard.md:54`, `reviews/raw-round17-convergence.md:85`
- 충돌:
  > `03-mental-model.md:231`의 "소유자 동의(`adr/0004:46`)"는 동의 위치를 `adr/0004:46`으로 가리킨다. 정본과 다르다. 정본이 이긴다(`adr/0004-validator-plugin-compile-guard.md:54`, 실제 소유자 동의 위치, K11).

### ERROR-154 검증기가 없으면 `if` 조각은 꺼지고 경고를 트리마다 한 번 낸다

- 결정:
  > 검증기가 없으면 `if` 게이트의 조각은 꺼진 채 두고 경고(가칭 `SCHEMA_FORM_WARNING.CONDITIONAL_SCHEMA_WITHOUT_VALIDATOR`)를 트리마다 한 번 낸다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:214#3`(정본, ERROR-037에서 분할)
- 닫은 사람: 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:85` E4), 게이트 고침(R17G-2, `reviews/raw-round17-onerror.md:150`; 트리마다 한 번)
- 라운드: 17
- 까닭: `reviews/raw-round17-convergence.md:85`

### ERROR-155 검증 불가 — 한 로드에 오류 객체 하나로 모든 환경에서 거부한다

- 결정:
  > **검증 불가**(검증기는 있으나 전체 스키마 컴파일이 실패함): 한 로드에 오류 객체 하나(가칭 `SCHEMA_FORM_ERROR.VALIDATOR_COMPILE_FAILED`)로 커밋 뒤 첫 `OnChange` 검증, `validate()`, 제출을 모든 환경에서 거부하고(R17-1 나), `onError`와 (부른 쪽이 없으면) 싱크로 한 번 드러낸다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:215#1`(정본, ERROR-038에서 분할)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:84` E3; 한 로드에 오류 객체 하나, `onError`·싱크 한 번)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:9`

### ERROR-156 검증 불가 — 그 로드에서 `OnChange` 검증을 다시 예약하지 않는다

- 결정:
  > 그 로드에서 `OnChange` 검증을 다시 예약하지 않는다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:215#2`(정본, ERROR-038에서 분할)
- 닫은 사람: 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:84` E3)
- 라운드: 17
- 까닭: `reviews/raw-round17-convergence.md:84`

### ERROR-157 검증 불가는 노드 `errors`에 넣지 않는다

- 결정:
  > 노드 `errors`에는 넣지 않는다(사용자의 잘못이 아니다).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:215#3`(정본, ERROR-038에서 분할)
- 닫은 사람: 편집자 결정(17라운드, `adr/0014-error-policy.md:215`)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:215`

### ERROR-158 통보3의 근거는 검증기를 준 경우에 닿지 않는다

- 결정:
  > 통보3의 근거(검증 없이 폼만 그리는 사용예, 기본 모드의 불편)는 검증기를 준 이 경우에 닿지 않는다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:215#4`(정본, ERROR-038에서 분할)
- 닫은 사람: 편집자 결정(17라운드, `adr/0014-error-policy.md:215`)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:215`

### ERROR-159 §7.1 분류표 — 표

- 결정:
  > (원장 §5의 표를 대체한다)
  >
  > | 부류 | 층 | 언제 | 누구 잘못 | 드러남 | 항목 |
  > | --- | --- | --- | --- | --- | --- |
  > | 청사진 오류 | 오류 | 청사진 분석 | 작성자 | 마운트: 생성 자리에서 잡아 대체 화면, 커밋 뒤 `onError`와 싱크. 폼이 서지 않는다. reset 안: reset이 던짐(`JSONSchemaError`). 재대조: 지금 트리를 둔 채 싱크 | 지원하지 않는 `type`; 배열 형태 모순; 정적 연언의 `type` 재정의·`const` 충돌·불가능한 범위·공집합 `enum`; `options.virtual` 참조 오류; `controls`의 식의 컴파일 실패; 게이트 없는 선언끼리(본체·게이트 없는 `allOf` 항목·게이트 없는 분기) 같은 이름·다른 종류를 선언함(늘 함께 켜지므로 충돌이 확실하다, O-10); `controls.discriminator`의 키가 어느 분기에도 `const`·`enum`으로 없거나, 있는 분기끼리 종류가 다르거나 값이 겹침(O-1. 일부 분기에만 없는 것은 그 분기가 게이트 없음일 뿐 오류가 아니다); 정적으로 아는 `controls.injectTo` 대상 경로가 청사진에 없거나 터미널 아래임; 선언 사이 터미널 전략 불일치; `controls`·`options` 안의 모르는 키(15라운드) |
  > | 마운트 정착 오류 | 오류 | 마운트의 첫 정착 | 작성자 스키마·호출자 데이터 | 원인별(§2). 공유 충돌은 모든 환경에서 폼이 서지 않고 대체 화면. 예산 초과·식·가드 실패·동적 대상 없음은 폼이 서고 `degraded`로 시작하며 커밋 뒤 `onError`와 싱크 | 첫 정착의 예산 초과, 식·가드 실패, 동적 `controls.injectTo` 대상 없음, 공유 충돌 |
  > | 청사진 경고 | 경고 | 청사진 분석 | 작성자 | 개발 모드 로그. `onError` 경고 기록(핸들러가 있으면 모든 환경) | `oneOf`·`anyOf` 분기에 `if`는 있고 `else: false`가 없음; `null` 분기 무시; `allOf` 키워드 무시; 터미널이 아닌 객체 노드의 잠금(표준 `readOnly`, `controls.readOnly`·`controls.disabled`. 효과 없음) |
  > | 정착 오류 | 오류 | 마운트 뒤 정착의 계산·파생·전이·커밋 | 작성자 스키마·호출자 데이터 | 커밋·통지 뒤 사슬의 끝에서 throw, 모든 환경(`SchemaFormError`, 식 예외는 `details.error`). `diagnostics`가 `degraded`로 남고 그 동안 제출을 거부한다 | 예산 초과(호스트 바퀴·파생·전이. 원본 B 커밋); 게이트에 달린 선언이 실제로 동시에 켜짐(작성자가 선언한 노드 하나가 형상에서 빠진다, P1′. 전순서에서 앞선 종류로 커밋한 뒤 throw); 어느 자리든 `controls`의 식이나 `if` 게이트 함수의 런타임 throw와 가드의 평가·컴파일 실패(§4: 게이트는 거짓, 상태 키 선언은 없음, 파생 규칙은 후보 제외, `controls.resetInteraction`은 거짓); 동적으로만 아는 `controls.injectTo` 대상이 없음 |
  > | 정착 경고 | 경고 | 정착의 계산 | 작성자 스키마 | 개발 모드 로그. `onError` 경고 기록(핸들러가 없는 프로덕션에서는 판정하지 않음) | 같은 `oneOf`에서 게이트 가진 분기가 둘 이상 켜짐(소유자 답 20). 같은 대상 규칙 둘은 경고가 아니다(13라운드 답 4). 켜진 `then`과의 런타임 교차가 공집합인 것은 경고도 오류도 아니다 — 검증기가 값을 기각한다(검증 결과) |
  > | 정착 추적 | (기록) | 정착 | — | 개발 모드에서 정착마다 기록(진입, 라운드별 규칙·원천·대상·값·결과, 예산 초과 시 마지막 라운드). `onError`에 가지 않음 | 자동 쓰기 다섯의 출처(C2·P2) |
  > | 되먹임·중첩 오류 | 오류 | 통지 | 소비자 코드 | 그 고리 하나를 끊고(되먹임 쓰기 거부, `onChange` 하나 생략) 사슬의 끝에서 throw, 모든 환경. `diagnostics`에 남기지 않는다 | 리스너 되먹임 파동 25, `onChange` 중첩 25 |
  > | 리스너 오류 | 오류 | 통지 | 소비자 코드 | 배달을 끝내고 사슬의 끝에서 throw, 모든 환경. 검증 결과 파동의 리스너와 `onValidate`가 던진 것은 `onError` 뒤 싱크 | 구독 리스너, `onChange`, `onStateChange`, `onDiagnosticsChange`가 던진 예외, `batch` fn의 예외, 검증 결과 파동의 리스너와 `onValidate`의 예외 |
  > | 호출자 오류 | 오류 | 공개 API 호출 | 호출자 | 즉시 throw(`SchemaFormError`, 등록은 `UnhandledError`) | `FormTypeInputMap` 패턴(렌더 중 정규화에서 던져져 루트 바운더리가 가두므로 드러남은 렌더 오류 행을 따른다), 플러그인 등록 실패(폼 밖이라 `onError`에 가지 않음), `Overwrite`와 `Merge`를 함께 준 `setValue`, 재생성 reset으로 폐기된 노드에 대한 쓰기, `onError` 관찰자 안의 쓰기(`onError`에 가지 않음) |
  > | 제출 거부 | 오류 | 제출 | 작성자 스키마·호출자 데이터(폼이 `degraded`) | `FormHandle.submit`·`useFormSubmit`은 `SchemaFormError`로 거부, 네이티브 submit은 `onError` 뒤 싱크, 모든 환경. 렌더 계층의 일이며 core는 제출을 모른다 | `diagnostics.status === 'degraded'` 동안의 제출 |
  > | 검증기 경고 | 경고 | 트리 생성(마운트, 재생성 reset) | 호출자(검증기를 주지 않음) | 거부하지 않음. 개발 모드 로그, `onError` 경고 기록(트리마다 한 번) | 검증기 없음(검증 모드가 `None`이 아님); 검증기가 없어 `if` 조각이 꺼짐 |
  > | 검증기 오류 | 오류 | 검증 요청 | 플러그인·호출자 | `validate()`와 제출의 거부, `OnChange` 검증이면 `onError` 뒤 싱크, 모든 환경 | 검증기는 있으나 전체 스키마 컴파일 실패(검증 불가, 한 로드에 한 번); 검증 함수의 런타임 throw, 요청 시점의 `$ref` 순환 |
  > | 렌더 오류 | 오류 | 렌더 | 소비자 코드(사용자 주입 구성 요소) 또는 호출자 | 바운더리가 가두어 대체 화면을 그리고 `componentDidCatch`에서 `onError`와 싱크. 다시 던지지 않는다 | 필드 바운더리가 감싼 구성 요소(`FormTypeInput`, 렌더러, `Placeholder`)의 렌더 오류, 루트의 렌더 오류, `formTypeInputMap` 정규화 오류 |
  > | 렌더 계층 경고 | 경고 | 렌더 계층 | 작성자·호출자 | 개발 모드 로그. `onError` 경고 기록 | 가상화를 켰는데 `IntersectionObserver`가 없음; `presentation` 키 의심(코어 키와 대소문자만 다름, 또는 `controls`·`options`의 키 이름) |
  > | 검증 결과 | 검증 결과 | 검증 뒤 | 사용자 입력 | 노드 `errors`(`ValidationIssue`), 제출 시 `ValidationError`. `onError`에 가지 않는다 | 검증기가 낸 항목 |
- 보충:
  > "개발 모드 경고는 게이트 결과, 키의 유무, 선언의 `type`, 등록 상태만 보며 `if`의 내용은 읽지 않는다. 검사하지 않는 것: 조건 프로퍼티가 `properties`에 있는지, `if`에 `required`가 있는지." (`08-design-a-to-z.md:390`)
  > "`presentation`의 모르는 키는 플러그인 자유 칸이다." (`02-target-overview.md:54`, 같은 문장이 `:59`, `03-mental-model.md:53`, `adr/0003-group-namespace.md:30`, `adr/0011-branch-node-composition.md:3`, `adr/0012-fe-overlay.md:3`에도 있음)
  > 소유자(14라운드 O-1): "가 로 하죠. 다만, discriminator 를 서로 다르게 선언했거나 discriminator 이 분기마다 다른 타입이나 성질을 가지면 오류로 알려줘야 합니다." (`reviews/round-14-owner-answers.md:7`)
  > "작성자 스키마의 잘못은 작성자 책임이고 폼은 고지 의무만 진다(소유자 답 2). 청사진에서 형상이 정해지지 않는 모순(오늘의 `JSON_SCHEMA_ERROR` 빌드 오류)은 고지가 아니라 throw다 — 형상 없이는 폼이 설 수 없다" (`03-mental-model.md:175`)
  > "(존재만 더하는 선언이다. 제약은 교차하지 않는다. 게이트 없는 분기와 같은 문맥. 편집자 도출)" (`03-mental-model.md:148`, `controls.discriminator` 변환의 성격에 대한 부연)
  > "서로소인 `enum` 둘이 켜진 조각과의 연언에서 동시에 활성이면 그 필드는 "지금 고를 수 있는 값이 없는" 상태가 되고, 폼은 막지 않으며 검증기가 값을 기각한다. 필드를 비우면 값이 유효해지는 경우가 있으므로 폼 전체를 멈춰서는 안 된다(R11-e)." (`adr/0005-blueprint-analysis-and-node-sharing.md:76`)
  > "`onChange` 안의 쓰기는 깊이 0에서 시작하므로 **새 진입**이다. 중첩 상한은 25이며, 26번째는 쓰기를 적용하고 검증도 요청하되 `onChange`를 건너뛰고 모든 환경에서 사슬 끝에서 throw한다(17라운드 소유자 답 R17-1 나). 이 초과는 `diagnostics`에 남기지 않고 제출을 막지 않는다(O-2는 정착 예산에 대한 답이다, ADR 0014 4판). 정착의 세 예산으로 생긴 `degraded`는 다음 로드까지 남고 그 동안 제출을 거부한다(§3, §8). 이 예산에서 건너뛰는 `onChange`는 상한 자체가 끊는 호출이다 — 26번째를 부르면 중첩이 멈추지 않는다. 상한이 없던 프로토타입 v4에서 항상 쓰는 `onChange`는 4 GB 힙을 채우고 죽었다." (`adr/0008-event-system.md:118`)
  > 소유자(12라운드 §9 경고 목록 일곱): "더 많을 수도 있다. 기존 error 종류와 용법을 참고해서 분류하라. 물론 기존 분류체계가 애매하면 다시 구성해도 무방" (`reviews/round-12-owner-answers.md:27`)
  > 소유자(10라운드 C-20 oneOf 다중 활성 경고): "예 이건 jsonSchema 스팩을 존중합니다" (`reviews/round-10-owner-answers.md:17`, §7.1 정착 경고 행의 소유자 답 20이 가리키는 답)
  > 소유자(10라운드 E-23 required 누락 경고, 확정): "이해했습니다. 다만, 이건 우리가 참견할 문제는 아닙니다. 평가하지 않습니다." (`reviews/round-10-owner-answers.md:38`, `03-mental-model.md:175-176`·`08-design-a-to-z.md:390`의 개발 모드 경고가 if의 내용은 읽지 않는다의 근거. E-19(`reviews/round-10-owner-answers.md:40`)도 같은 근거)
  > 소유자(10라운드 E-19, 되물음 답): "23에서 말한대로 굳이 안봐도 되지않나 싶습니다. 이렇게 말하는 이유는 그냥 if 문의 스키마로 지금 값을 평가하면 되는거라 굳이 그런 규칙은 없어도 될거같습니다. 말한대로 하는게 안전하긴 할텐데, if 문 내에 anyOf 나 oneOf, 아니면 다른 또 복잡한 스키마가 올 수도 있는거라 우리는 그걸 관여하기로 하면 끝이 없을거에요" (`reviews/round-10-owner-answers.md:40`)
  > "개발 모드에서 정착마다 기록: 진입(공개 API, 옵션 비트), 라운드별 {단계, 규칙 종류, 원천 경로, 대상 경로, 이전 값, 이후 값, 결과(적용 / 누구에게 짐 / `undefined`라 후보 아님 / 억제 / 최종 형상 밖이라 철회)}, 예산 초과 시 마지막 라운드의 규칙 목록. 프로덕션은 기록하지 않는다. `onError`에 가지 않는다" (`08-design-a-to-z.md:382`, §11.3 정착 추적 행의 세부)
  > "공개 payload에는 출처를 더하지 않는다(14라운드: 니즈가 약하다. 필요하면 나중에 더한다)" (`08-design-a-to-z.md:382`)
  > "동적 `controls.injectTo` 대상 없음(대상 경로가 청사진에 없거나 터미널 아래임. 형상에 없는 노드를 가리키는 것은 오류가 아니다, ADR 0014 §4)" (`08-design-a-to-z.md:383`, 동적 대상 "없음"의 정의)
  > "검증 모드가 `None`이 아니면 커밋 뒤 첫 검증 요청·`validate()`·제출이 모든 환경에서 거부된다(R17-1 나, §11.1)" (`08-design-a-to-z.md:386`, `adr/0014-error-policy.md:281`에도 있음)
- 상태: 현행
- 출처: `adr/0014-error-policy.md:224-242`(정본, ERROR-043에서 분할)
- 닫은 사람: 편집자 결정(17라운드, ADR 0014 4판 채택), 소유자 답 O-1(`reviews/round-14-owner-answers.md:7`)·O-10(`reviews/round-14-owner-answers.md:16`), 소유자 답 C-20(`reviews/round-10-owner-answers.md:17`)·13라운드 답 4(`reviews/round-13-owner-answers.md:10`), 소유자 답 E-23·E-19(`reviews/round-10-owner-answers.md:38,40`), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1; `adr/0014-error-policy.md:229,231,234,237,239`), 소유자 답(`reviews/round-12-owner-answers.md:14` 6 `else: false` 경고; `adr/0014-error-policy.md:230`), 소유자 답(`reviews/round-17-owner-answers.md:14` 통보 3, `reviews/round-17-owner-answers.md:33` (가); `adr/0014-error-policy.md:238`), 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4; `adr/0014-error-policy.md:240,242`), 게이트 고침(R17G-2, `reviews/raw-round17-onerror.md:150`; `adr/0014-error-policy.md:238`)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:222-244`
- 충돌:
  > `08-design-a-to-z.md:383`의 "호스트 바퀴, 파생, 전이, 되먹임 파동, `onChange` 중첩의 초과"는 되먹임·중첩 초과를 "정착 오류" 부류, "정착" 시점으로 둔다. 정본과 다르다. 정본이 이긴다(`adr/0014-error-policy.md:234`, 별도 부류 "되먹임·중첩 오류", "통지" 시점, K3).
  > `08-design-a-to-z.md:385`의 "`FormTypeInputMap` 패턴, 플러그인 등록 실패(`UnhandledError`)"는 드러남이 "throw(`SchemaFormError`)"인 호출자 오류 행에 두고 렌더 오류 행을 따른다는 말이 없으며, 같은 문서 `:387`의 "| 렌더 오류 | 렌더 | 소비자 코드(사용자 주입 컴포넌트) |"에는 "호출자"도 "`formTypeInputMap` 정규화 오류"도 없다. 정본과 다르다. 정본이 이긴다(`adr/0014-error-policy.md:236,240`, K4).
  > `08-design-a-to-z.md:381`의 "렌더 계층 경고 | 렌더 | 작성자 |"는 누구 잘못을 작성자로만 둔다. 정본과 다르다. 정본이 이긴다(`adr/0014-error-policy.md:241`, "작성자·호출자", K5).
  > `08-design-a-to-z.md:380`의 "정착 경고 | 계산·파생 |"는 언제를 "계산·파생"으로 둔다. 정본과 다르다. 정본이 이긴다(`adr/0014-error-policy.md:232`, "정착의 계산", K6).
  > `08-design-a-to-z.md:377`의 "게이트 없는 분기끼리 같은 이름·다른 종류의 선언(ADR 0014)"은 범위를 게이트 없는 분기끼리로 좁히고 정적 `controls.injectTo`의 "터미널 아래"를 뺀다. 정본과 다르다. 정본이 이긴다(`adr/0014-error-policy.md:228`, 본체·`allOf` 항목까지 포함, K7).
  > `adr/0014-error-policy.md:228`의 "`controls.discriminator`의 키가 어느 분기에도 `const`·`enum`으로 없거나, 있는 분기끼리 종류가 다르거나 값이 겹침(O-1. 일부 분기에만 없는 것은 그 분기가 게이트 없음일 뿐 오류가 아니다)"는 O-1이 요구한 '선언 사이 값이 다름'을 적지 않는다. 정본과 다르다. 정본이 이긴다(`adr/0014-error-policy.md:260`, §7.2 `DISCRIMINATOR_MISMATCH` 행의 "선언 사이 값이 다름", K10).
  > `02-target-overview.md:231`의 "분기에 그 키의 `const`·`enum`이 없을 때, `$ref`·`allOf` 평탄화, 분기가 자기 `controls.active`도 가질 때의 세부는 미정(07 11.2, ADR 0005 §4)이다."은 첫 경우를 미정으로 둔다. 정본과 다르다. 정본이 이긴다(`adr/0014-error-policy.md:228`, K2).
  > `reviews/round-18-agenda.md:108`의 "`if`의 공허한 참 경고(Q10, `open-questions.md:68`)."는 이를 열린 안건으로 둔다. 정본과 다르다. 정본이 이긴다(`reviews/round-10-owner-answers.md:38,40`, E-23·E-19).
  > `reviews/round-18-agenda.md:17`의 "`controls.discriminator`의 세부(분기에 그 키의 `const`·`enum`이 없을 때, `$ref`·`allOf` 평탄화, 분기 자체 `controls.active`와의 AND)"는 첫 경우를 열린 안건으로 둔다. 정본과 다르다. 정본이 이긴다(`adr/0014-error-policy.md:228`, K2).
  > `adr/0014-error-policy.md:233`의 "자동 쓰기 다섯의 출처(C2·P2)"는 자동 쓰기를 다섯으로 센다. 소유자 답과 다르다. 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:12`, WRITE-078: 포커스 아웃 `trim`이 자른 값의 쓰기가 여섯째 자동 쓰기).
  > `08-design-a-to-z.md:382`의 "공개 payload에는 출처를 더하지 않는다(14라운드: 니즈가 약하다. 필요하면 나중에 더한다)"는 소유자 답과 다르다. 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:15`, EVENT-060).

### ERROR-160 범위 밖 — 렌더 중 쓰기는 core가 감지하지 않는다

- 결정:
  > 범위 밖: 렌더 중 쓰기는 core가 감지하지 않는다(P5).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:244#1`(정본, ERROR-043에서 분할)
- 닫은 사람: 원리(`03-mental-model.md:17` P5)
- 라운드: 17
- 까닭: `03-mental-model.md:17`

### ERROR-161 범위 밖 — 판별 키가 호스트 `properties`에 없는 것은 오류가 아니다

- 결정:
  > `controls.discriminator`의 키가 호스트 `properties`에 없는 것은 오류가 아니다(끌어올림, O-1).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:244#2`(정본, ERROR-043에서 분할)
- 닫은 사람: 소유자 답(`reviews/round-14-owner-answers.md:7` O-1)
- 라운드: 14
- 까닭: `reviews/round-14-owner-answers.md:7`

### ERROR-162 범위 밖 — `NULLABLE_ONE_OF_NULL_UNREACHABLE` 폐기, 가상화 꺼짐 경고의 이동

- 결정:
  > 오늘의 경고 `NULLABLE_ONE_OF_NULL_UNREACHABLE`은 분기 내용을 읽으므로 폐기하고, `VIRTUALIZATION_DISABLED_FOR_FORM`은 렌더 계층 경고로 옮긴다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:244#3`(정본, ERROR-043에서 분할)
- 닫은 사람: 편집자 결정(17라운드, `adr/0014-error-policy.md:244`)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:244`

### ERROR-163 범위 밖 — 필드 바운더리는 그대로, 렌더 오류가 `onError`에 가는 것만 새롭다

- 결정:
  > 사용자 주입 구성 요소를 격리하는 필드 바운더리(`withErrorBoundary`, 패키지 규칙)는 그대로이며, 그 바운더리가 잡은 렌더 오류가 `onError`에 가는 것만 새롭다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0014-error-policy.md:244#4`(정본, ERROR-043에서 분할)
- 닫은 사람: 편집자 결정(17라운드, `adr/0014-error-policy.md:244`)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:244`

### ERROR-164 §7.2 코드 목록 — 머리 문단과 정해진 행

- 결정:
  > 17라운드 4번 수렴의 목록 50행을 게이트 R17G-9와 R17G-2대로 고친 것이다. `(조건부) SCHEMA_FORM_WARNING.UNSET_ON_INACTIVE_ON_OBJECT` 행은 R17-2가 ㄴ으로 확정되어 지웠고, `presentation.trim`은 `PRESENTATION_KEY_SUSPECT`의 둘째 경우에 들며, `FormProvider`를 폼 인스턴스 밖으로 제외한 문구는 사실과 달라(`FormProvider`는 맵을 받지 않고 정의 정규화에는 던지는 자리가 없다) 지웠다. 검증기 없음과 조건부 스키마 경고는 트리마다 한 번이다. 끝에 설계 항목에서 생길 수 있는 코드의 행을 더했다. '(가칭)'인 코드 이름은 PR-4에서 확정한다. '(제외)' 행은 `onError`가 받지 않는 것이다. '자리'는 오늘 코드의 위치(`src/` 아래) 또는 이 ADR의 절이다. `surface`의 값은 `'thrown'`(사슬 끝이나 호출에서 던짐), `'rejected'`(프로미스 거부), `'sink'`(주인 없는 오류 싱크)다.
  >
  > | 코드 | level | 언제 | 자리 | 기본 드러남 | 핸들러 전달 | 오늘과 새 설계 |
  > | --- | --- | --- | --- | --- | --- | --- |
  > | `JSON_SCHEMA_ERROR.UNKNOWN_JSON_SCHEMA` | `error` | 청사진 분석(마운트, reset의 스키마 교체) | src/core/nodes/schemaNodeFactory.ts:116. 기록에 schemaPath | 마운트: 생성 자리에서 잡아 폼 자리에 대체 화면을 그리고 커밋 뒤 싱크(§2). reset 안: reset이 던짐. 재대조(레이아웃 효과): 지금 트리를 둔 채 그 레이아웃 효과에서 싱크(09 §2.6의 일곱째) | 받음. 마운트는 대체 화면의 이펙트(surface 'sink'), reset은 throw 직전('thrown'). 재대조는 그 레이아웃 효과('sink') | 오늘과 새 설계 모두 |
  > | `JSON_SCHEMA_ERROR.UNEXPECTED_ARRAY_SCHEMA` | `error` | 청사진 분석 | src/core/nodes/ArrayNode/validate.ts:26, :40, :53, :72. 기록에 schemaPath | 청사진 오류와 같음 | 청사진 오류와 같음 | 오늘과 새 설계 모두 |
  > | `JSON_SCHEMA_ERROR.ALL_OF_TYPE_REDEFINITION` 또는 CONFLICTING_CONST_VALUES 또는 INVALID_RANGE 또는 EMPTY_ENUM_INTERSECTION | `error` | 청사진 분석(정적 연언의 교차). 오늘은 노드 생성 때(src/core/nodes/schemaNodeFactory.ts:133의 processAllOfSchema)이며 Form 전처리가 아님 | src/helpers/jsonSchema/processAllOfSchema/processAllOfSchema.ts:46, intersectSchema/utils/intersectConst.ts:24, validateRange.ts:22, intersectEnum.ts:36. 오늘은 details에 경로가 없고, 새 설계는 schemaPath를 실음 | 청사진 오류와 같음. PR-1부터 교차 함수는 공집합 표시를 돌려주고 청사진만 던짐(08 §17 PR-1) | 청사진 오류와 같음 | 오늘과 새 설계 모두 |
  > | `JSON_SCHEMA_ERROR.COMPOSITION_TYPE_REDEFINITION` 또는 COMPOSITION_PROPERTY_REDEFINITION 또는 COMPOSITION_PROPERTY_EXCLUSIVENESS_REDEFINITION | `error` | 오늘: 합성 노드 표를 구성할 때 | src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getCompositionNodeMapList/getCompositionNodeMapList.ts:81, :96; utils/throwIfTypeRedefinition.ts:29 | 오늘: throw를 Form 자기 바운더리가 console.error로 가둠 | 새 설계에서 없어짐. 노드 공유와 SHARED_NODE_KIND_CONFLICT(청사진), SHARED_NODE_CONFLICT(정착)로 대체 | 오늘에만 |
  > | `JSON_SCHEMA_ERROR.VIRTUAL_FIELDS_NOT_VALID` 또는 VIRTUAL_FIELDS_NOT_IN_PROPERTIES | `error` | 청사진 분석(options.virtual 참조) | src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getVirtualReferencesMap/getVirtualReferencesMap.ts:41, :55 | 청사진 오류와 같음 | 청사진 오류와 같음 | 오늘과 새 설계 모두 |
  > | `JSON_SCHEMA_ERROR.INVALID_VIRTUAL_NODE_VALUES` | `error` | 가상 노드에 길이가 다른 배열을 쓰는 쓰기 | src/core/nodes/VirtualNode/VirtualNode.ts:46(__emitChange__). 기록에 path | 오늘: 즉시 throw. 새 설계: 쓰기의 출처로 가름. 공개 API에서 오면 호출자 오류(즉시 throw), 자동 쓰기(controls.injectTo 등)에서 오면 정착 오류(그 규칙을 후보에서 빼고 사슬 끝 throw, degraded). 분류는 슬라이스 1의 options.virtual 설계 항목에서 확정 | 받음(호출자 오류면 throw 직전, 정착 오류면 사슬 끝) | 오늘에만 명시. 새 설계 분류표에 자리가 없어 이 표에 더함 |
  > | `JSON_SCHEMA_ERROR.CREATE_DYNAMIC_FUNCTION` 또는 OBSERVED_VALUES 또는 CONDITION_INDEX 또는 CONDITION_INDICES | `error` | 청사진 분석(controls 식 컴파일 실패) | src/core/nodes/AbstractNode/utils/getComputedPropertiesManager/ComputedPropertiesManager/utils/createDynamicFunction/createDynamicFunction.ts:43, getObservedValuesFactory.ts:58, getConditionIndexFactory.ts:65, getConditionIndicesFactory.ts:76 | 청사진 오류와 같음. 컴파일러는 PR-1에서 청사진으로 옮김 | 청사진 오류와 같음 | 오늘과 새 설계 모두 |
  > | (가칭) `JSON_SCHEMA_ERROR.UNKNOWN_GROUP_KEY` | `error` | 청사진 분석: controls·options·children[].controls의 닫힌 목록 밖 키 | R15-4. 기록에 schemaPath | 청사진 오류와 같음 | 청사진 오류와 같음 | 새 설계에만 |
  > | (가칭) `JSON_SCHEMA_ERROR.DISCRIMINATOR_MISMATCH` | `error` | 청사진 분석: controls.discriminator 키가 어느 분기에도 없거나, 분기끼리 종류가 다르거나 값이 겹치거나, 선언 사이 값이 다름 | §7.1 청사진 오류 행, R15-7 | 청사진 오류와 같음 | 청사진 오류와 같음 | 새 설계에만 |
  > | (가칭) `JSON_SCHEMA_ERROR.SHARED_NODE_KIND_CONFLICT` | `error` | 청사진 분석: 게이트 없는 선언끼리 같은 이름·다른 종류 | §7.1 청사진 오류 행(14라운드 O-10) | 청사진 오류와 같음(폼이 서지 않음) | 청사진 오류와 같음 | 새 설계에만(오늘의 COMPOSITION_*_REDEFINITION을 대체) |
  > | (가칭) `JSON_SCHEMA_ERROR.TERMINAL_STRATEGY_MISMATCH` | `error` | 청사진 분석: 노드가 형상에 있는 경우마다 정한 터미널 전략이 서로 다름 | R15-10 | 청사진 오류와 같음 | 청사진 오류와 같음 | 새 설계에만 |
  > | (가칭) `JSON_SCHEMA_ERROR.INJECT_TARGET_NOT_FOUND` | `error` | 청사진 분석: 정적 controls.injectTo 대상 경로가 청사진에 없거나 터미널 아래 | §4, §7.1 청사진 오류 행. 기록에 schemaPath와 path | 청사진 오류와 같음(R17-1 나) | 청사진 오류와 같음 | 새 설계에만 |
  > | `JSON_SCHEMA_ERROR.INJECT_TO` | `error` | 오늘: injectTo 실행 중 아무 예외 | src/core/nodes/AbstractNode/AbstractNode.ts:1010-1016 | 오늘: 커밋 없이 배치 도중 throw해 이벤트 처리기를 뚫고 나감 | 새 설계에서 셋으로 나뉨: 정적 대상 없음은 INJECT_TARGET_NOT_FOUND, 동적 대상 없음은 INJECT_TARGET_MISSING, 식 예외는 EXPRESSION_THREW | 오늘에만 |
  > | `SCHEMA_FORM_ERROR.INFINITE_LOOP_DETECTED` | `error` | 오늘: 배치 수가 상한을 넘음 | src/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:97 | 오늘: 커밋 없이 throw | 새 설계에서 BUDGET_EXCEEDED와 FEEDBACK_LIMIT_EXCEEDED로 대체 | 오늘에만 |
  > | (가칭) `SCHEMA_FORM_ERROR.SHARED_NODE_CONFLICT` | `error` | 정착: 게이트에 달린 같은 이름·다른 종류 선언이 실제로 동시에 켜짐 | §2 마운트 원인별, §7.1 정착 오류 행. 기록에 path | 마운트: 모든 환경에서 폼이 서지 않고 대체 화면을 그린 뒤 커밋 뒤 싱크. 마운트 뒤: 앞선 종류로 커밋, 통지 뒤 사슬 끝 throw, degraded | 마운트는 대체 화면의 이펙트('sink'), 마운트 뒤는 throw 직전('thrown') | 새 설계에만 |
  > | (가칭) `SCHEMA_FORM_ERROR.BUDGET_EXCEEDED`(details.exceededBudget: hostWheel·derive·transition) | `error` | 정착의 예산 초과 | §7.1 정착 오류 행. 기록에 path(마지막 라운드의 규칙 대상) | 원본 B 커밋과 통지 뒤 사슬 끝 throw, 모든 환경(R17-1 나). degraded가 다음 로드까지 남고 그 동안 제출을 거부. 마운트에서는 폼이 서고 커밋 뒤 싱크 | 마운트는 준비 이펙트('sink'), 마운트 뒤는 throw 직전('thrown') | 새 설계에만(오늘의 INFINITE_LOOP_DETECTED를 대체) |
  > | (가칭) `SCHEMA_FORM_ERROR.EXPRESSION_THREW` | `error` | 정착: controls 식이나 if 게이트 함수의 런타임 throw(게이트, 상태 키, 파생 규칙, resetInteraction) | §4. 기록에 path | 자리마다 정의된 값으로 정착을 마치고 커밋, 통지 뒤 사슬 끝 throw, degraded, 모든 환경(R17-1 나). 마운트에서는 폼이 서고 싱크 | 받음. error는 SchemaFormError이고 원래 예외는 details.error | 부류는 새 설계에만(오늘은 식의 런타임 예외를 잡지 않아 원래 예외가 그대로 전파됨. 잡는 자리는 컴파일 시점뿐) |
  > | (가칭) `SCHEMA_FORM_ERROR.GUARD_FAILED` | `error` | 정착: 가드 평가 실패 또는 가드 컴파일 실패 | §6 가드. 기록에 path(게이트의 호스트) | 게이트는 거짓, 사슬 끝 throw, degraded, 모든 환경(R17-1 나) | 받음. 컴파일 실패만 개발 모드가 시점을 앞당겨 마운트의 커밋 뒤에 보냄('sink'). 프로덕션은 처음 평가하는 사슬 끝('thrown')에 보내고, 평가되지 않은 가드는 기록이 없음. 가드 표가 실패한 컴파일의 오류를 캐시하므로 그 가드를 쓰는 폼 인스턴스마다 자기 사건으로 받음 | 새 설계에만 |
  > | (가칭) `SCHEMA_FORM_ERROR.INJECT_TARGET_MISSING` | `error` | 정착: 동적으로만 아는 controls.injectTo 대상이 없음 | §4, §7.1 정착 오류 행 | 그 규칙을 후보에서 빼고 커밋, 사슬 끝 throw, degraded, 모든 환경(R17-1 나) | 받음(마운트는 준비 이펙트, 마운트 뒤는 throw 직전) | 새 설계에만 |
  > | (가칭) `SCHEMA_FORM_ERROR.FEEDBACK_LIMIT_EXCEEDED` | `error` | 통지: 리스너 되먹임 파동 25, onChange 중첩 25 초과 | §7.1 되먹임·중첩 오류 행 | 고리 하나를 끊고 사슬 끝 throw, 모든 환경(R17-1 나). diagnostics에는 남기지 않음 | throw 직전('thrown') | 새 설계에만 |
  > | (가칭) `SCHEMA_FORM_ERROR.LISTENER_THREW` | `error` | 통지: 구독 리스너, onChange, onStateChange, onDiagnosticsChange, batch fn이 던짐. 검증 결과 파동의 리스너와 onValidate가 던짐 | src/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:211-212(오늘은 잡지 않음), src/components/Form/Form.tsx:139(onValidate, catch 없음), 09 §2.4의 검증 결과 행 | 사슬: 배달을 끝내고 사슬 끝 throw(하나면 원래 값 그대로). 검증 결과 파동: 싱크로 보내고 미처리 거부로 남기지 않음(§3 시점의 다섯째). 모든 환경 | 사슬은 throw 직전('thrown'), 파동은 그 마이크로태스크('sink'). error는 소비자의 원래 값이고 code는 폼이 붙임 | 오늘은 잡지 않고 전파(onValidate는 미처리 거부). 부류는 새 설계에만 |
  > | (가칭) `SCHEMA_FORM_ERROR.MULTIPLE_ERRORS`(묶음) | `error` | 한 사슬에서 오류가 둘 이상이거나, 부른 쪽이 있는 자리에서 핸들러가 던짐 | §2 묶음 | SchemaFormError 하나로 묶어 details.errors에 발생 순서대로 담아 throw 또는 거부 | 따로 기록하지 않음. 구성 기록마다 aggregate 칸에 이 객체를 실음 | 새 설계에만 |
  > | `SCHEMA_FORM_ERROR.FORM_TYPE_INPUT_MAP` | `error` | 렌더: Form 속성 formTypeInputMap 정규화(src/providers/FormTypeInputsContext/FormTypeInputsContextProvider.tsx:29-34의 useMemo) | src/helpers/formTypeInputDefinition/formTypeInputMap.ts:53. 기록에 맵의 키 | 오늘: 루트 바운더리가 console.error로 가둠. 새 설계: 루트 바운더리가 가두어 대체 화면을 그리고 componentDidCatch에서 싱크 | componentDidCatch('sink', componentStack 포함) | 오늘과 새 설계 모두 |
  > | `UNHANDLED_ERROR.REGISTER_PLUGIN` | `error` | registerPlugin 호출(전역) | src/app/plugin/registerPlugin.ts:215 | 부른 쪽에 즉시 throw | 받지 않음(폼 인스턴스가 없음) | 오늘과 새 설계 모두 |
  > | (가칭) `SCHEMA_FORM_ERROR.INVALID_WRITE_OPTION` | `error` | 공개 API: Overwrite와 Merge를 함께 준 setValue | §7.1 호출자 오류 행. 기록에 path | 즉시 throw(호출자 오류) | throw 직전('thrown') | 새 설계에만 |
  > | (가칭) `SCHEMA_FORM_ERROR.DISPOSED_NODE_WRITE` | `error` | 재생성 reset으로 폐기된 노드에 호출자가 옛 참조로 한 쓰기 | 09 §2.6의 일곱째. 기록에 path | 적용하지 않고 즉시 throw, 모든 환경. 입력 출처 표식이 있는 늦은 입력 쓰기는 오류가 아니며 조용히 버림 | throw 직전('thrown') | 새 설계에만 |
  > | (가칭) `SCHEMA_FORM_ERROR.WRITE_IN_OBSERVER` | `error` | onError 전달 중 이 폼에 대한 쓰기 | §3 핸들러 안의 쓰기 | 핸들러 안으로 즉시 throw | 받지 않음(재귀 없음). 핸들러 밖으로 새면 핸들러 예외의 규칙을 따름 | 새 설계에만 |
  > | (가칭) `SCHEMA_FORM_ERROR.SUBMIT_WHILE_DEGRADED` | `error` | diagnostics.status가 degraded인 동안의 제출 | §5, §7.1 제출 거부 행, R17-1 나 | FormHandle.submit과 useFormSubmit은 거부. 네이티브 submit(src/components/Form/Form.tsx:127-133, 부른 쪽 없음)은 싱크 | 거부 직전('rejected') 또는 싱크 직전('sink'). 제출 시도마다 새 객체 | 새 설계에만 |
  > | `JSON_SCHEMA_ERROR.CIRCULAR_REFERENCE` 또는 SCHEMA_COMPILE_FAILED(+ 노드 errors의 jsonSchemaCompileFailed) | `error` | 오늘: 노드 생성 때 전체 스키마 컴파일 실패 | src/core/nodes/AbstractNode/utils/ValidationManager/ValidationManager.ts:205-222, utils/getFallbackValidator.ts:14-26 | 오늘: 모든 환경에서 console.error를 내고, 이어 대체 검증기가 노드 errors에 항목을 넣음 | 새 설계에서 없어짐. VALIDATOR_COMPILE_FAILED로 대체되며 노드 errors에는 넣지 않음 | 오늘에만 |
  > | (가칭) `SCHEMA_FORM_ERROR.VALIDATOR_COMPILE_FAILED` | `error` | 로드 뒤 첫 검증 요청: 검증기는 있으나 전체 스키마 컴파일이 실패하고 검증 모드가 None이 아님 | §6 검증기 | 한 로드에 오류 객체 하나로 첫 OnChange 검증, validate(), 제출을 모든 환경에서 거부(R17-1 나). 그 로드에서 OnChange 검증을 다시 예약하지 않음 | 한 로드에 한 번, 처음 드러날 때(OnChange면 'sink', validate()·제출이면 'rejected') | 새 설계에만. 통보3의 답은 검증기가 있는 이 경우에 닿지 않음 |
  > | (가칭) `SCHEMA_FORM_ERROR.VALIDATOR_THREW` | `error` | 검증 요청: 검증 함수의 런타임 throw, 요청 시점의 $ref 순환 | src/core/nodes/AbstractNode/AbstractNode.ts:1215-1222(오늘 OnChange는 잡지 않음), src/components/Form/Form.tsx:139, §7.1 검증기 오류 행 | validate()와 제출은 거부. OnChange는 싱크로 보내며 미처리 거부로 남기지 않음(§6 검증 실행 실패). 모든 환경 | validate()는 거부 직전('rejected'), OnChange는 마이크로태스크에서 핸들러 뒤 싱크('sink'). ValidateFunction 문서 주석에 '입력의 판정은 돌려주고 던지지 않는다'를 적어 검증 결과와의 경계를 못박음 | 새 설계에만(오늘은 미처리 거부) |
  > | (가칭) `SCHEMA_FORM_ERROR.RENDER_FAILED` | `error` | 렌더: 사용자 주입 구성 요소(FormTypeInput, 렌더러 넷, Placeholder, 렌더러 안의 formatError)와 루트의 렌더 오류 | 필드 바운더리 src/components/SchemaNode/SchemaNodeInput/hooks/useFormTypeInput.ts:36-37, SchemaNodeInputWrapper.tsx:56-57, src/components/SchemaNode/SchemaNodeProxy/SchemaNodeProxy.tsx:59, src/helpers/virtualization/VirtualizationManager/VirtualizationManager.ts:214. 루트 src/components/Form/Form.tsx:311-312 | 가두어 대체 화면을 그리고 componentDidCatch에서 싱크(§2의 React에서 보이는 것). ErrorBoundary의 console.error는 남음(packages/winglet/react-utils/src/hoc/withErrorBoundary/components/ErrorBoundary.tsx:52-54) | componentDidCatch('sink'). error는 원래 값이고 componentStack을 실으며, 필드 바운더리면 path가 있음. 폼이 이미 던진 값이면 핸들러를 한 번 건너뜀 | 오늘은 console.error뿐. 부류는 새 설계에만 |
  > | (코드 없음) onError 핸들러 자신의 예외 | `error` | 핸들러를 호출할 때(동기 throw) | §3 핸들러가 던질 때 | 부른 쪽이 있으면 원래 오류를 앞에 두고 묶어 던지거나 거부함. 부른 쪽이 없으면 싱크로 한 번 보냄. async 핸들러의 거부는 호스트 자신의 프로미스 | 받지 않음(재귀 없음) | 새 설계에만 |
  > | `SCHEMA_FORM_WARNING.ALL_OF_KEYWORD_IGNORED_FOR_FORM` | `warning` | 청사진 분석(노드 생성의 allOf 처리) | src/helpers/jsonSchema/processAllOfSchema/processAllOfSchema.ts:40-44. 판별 칸은 keyword. 새 설계에서 schemaPath를 붙임 | 개발 모드 콘솔(세션 단위 code+message 중복 억제), 프로덕션 기본 출력 없음 | 커밋된 로드의 준비 이펙트. 무시한 키워드마다 기록 하나 | 오늘과 새 설계 모두 |
  > | `SCHEMA_FORM_WARNING.NULL_BRANCH_IGNORED_FOR_FORM` | `warning` | 청사진 분석 | src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getCompositionNodeMapList/utils/warnIfNullBranchIgnored.ts:25 | 개발 모드 콘솔 | 커밋된 로드의 준비 이펙트 | 오늘과 새 설계 모두 |
  > | `SCHEMA_FORM_WARNING.NESTED_COMPOSITION_IGNORED_FOR_FORM` | `warning` | 오늘: 청사진 분석 | src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getCompositionNodeMapList/utils/warnIfNestedComposition.ts:24 | 오늘: 개발 모드 콘솔 | 없음(폐기. 중첩 합성은 재귀로 다룸, 원장 §5, ADR 0002) | 오늘에만 |
  > | `SCHEMA_FORM_WARNING.NULLABLE_ONE_OF_NULL_UNREACHABLE` | `warning` | 오늘: 청사진 분석 | src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getCompositionNodeMapList/utils/warnIfNullUnreachable.ts:34 | 오늘: 개발 모드 콘솔 | 없음(폐기. 분기 내용을 읽음, §7.1 범위 밖 문단) | 오늘에만 |
  > | `SCHEMA_FORM_WARNING.VIRTUALIZATION_DISABLED_FOR_FORM` | `warning` | 렌더 계층: virtualization을 켰는데 IntersectionObserver가 없음 | src/helpers/virtualization/VirtualizationManager/VirtualizationManager.ts:199-205(인스턴스 없는 정적 메서드이므로 보고기를 인자로 넘김). 폼 수준 | 개발 모드 콘솔 | 커밋 뒤 이펙트 | 오늘과 새 설계 모두(렌더 계층 경고로 옮김, §7.1 범위 밖 문단) |
  > | (가칭) `SCHEMA_FORM_WARNING.IF_WITHOUT_ELSE_FALSE` | `warning` | 청사진 분석: oneOf·anyOf 분기에 if는 있고 else: false가 없음 | reviews/round-12-owner-answers.md:14, §7.1 청사진 경고 행 | 개발 모드 콘솔 | 커밋된 로드의 준비 이펙트 | 새 설계에만 |
  > | (가칭) `SCHEMA_FORM_WARNING.LOCK_ON_NON_TERMINAL_OBJECT` | `warning` | 청사진 분석: 터미널이 아닌 객체 노드의 표준 readOnly, controls.readOnly, controls.disabled | §7.1 청사진 경고 행 | 개발 모드 콘솔 | 커밋된 로드의 준비 이펙트 | 새 설계에만 |
  > | (가칭) `SCHEMA_FORM_WARNING.CONDITIONAL_SCHEMA_WITHOUT_VALIDATOR` | `warning` | 트리 생성(마운트, 재생성 reset): 검증기가 없는데 if 게이트가 있어 조각이 꺼짐 | §6 검증기, ADR 0004의 합의 | 개발 모드 콘솔 | 트리마다 한 번(마운트는 준비 이펙트, 재생성 reset은 reset 사슬 끝) | 새 설계에만(오늘은 조용함) |
  > | (가칭) `SCHEMA_FORM_WARNING.VALIDATOR_MISSING` | `warning` | 트리 생성(마운트, 재생성 reset): 플러그인에도 validatorFactory에도 검증기가 없고 검증 모드가 None이 아님 | src/core/nodes/AbstractNode/utils/ValidationManager/ValidationManager.ts:198-204(오늘은 조용히 건너뜀). 소유자 통보3 답 | 거부하지 않음(17라운드 소유자 답, 통보3). 개발 모드 콘솔, 프로덕션 기본 출력 없음 | 모든 환경, 트리마다 한 번(마운트는 준비 이펙트, 재생성 reset은 reset 사슬 끝). 값을 통째로 바꾸는 setValue나 같은 스키마 reset에서는 다시 보내지 않음. level은 17라운드 소유자 답 (가). 검증 모드를 None으로 적으면 사라짐 | 새 설계에만 |
  > | (가칭) `SCHEMA_FORM_WARNING.MULTIPLE_GATED_BRANCHES_ACTIVE` | `warning` | 정착: 같은 oneOf에서 게이트 가진 분기가 둘 이상 켜짐 | §7.1 정착 경고 행. 기록에 호스트의 path | 개발 모드 콘솔 | 마운트면 준비 이펙트, 그 뒤면 사슬 끝(발생 순서). 로드마다 구조 키(code, path)로 한 번. 핸들러가 없는 프로덕션에서는 판정하지 않음 | 새 설계에만 |
  > | (가칭) `SCHEMA_FORM_WARNING.PRESENTATION_KEY_SUSPECT` | `warning` | 렌더 계층이 한 노드의 presentation을 처음 읽을 때: 코어 키 다섯과 대소문자만 다른 키, 또는 controls·options의 키 이름(R17-3이 `options.trim`으로 확정되어 `presentation.trim`도 둘째 경우에 든다) | R15-9. 판별 칸은 키 이름 | 개발 모드 콘솔 | 그 필드가 커밋된 뒤의 이펙트(지연 마운트 필드 포함) | 새 설계에만 |
  > | (제외) 검증 결과: ValidationIssue(오늘 이름 JSONSchemaError), onValidate, errors 속성, setExternalErrors·clearExternalErrors, `VALIDATION_ERROR.SCHEMA_VALIDATION_FAILED` | `error` | 검증 뒤, 제출 | src/components/Form/type.ts:54, :66; src/core/nodes/AbstractNode/AbstractNode.ts:816-839; src/components/Form/Form.tsx:117-123 | 노드 errors, onValidate, 필드 오류 표시, 제출 거부. 네이티브 submit에서는 오늘 미처리 거부(Form.tsx:127-133, packages/winglet/common-utils/src/utils/function/enhance/getTrackableHandler/getTrackableHandler.ts:429-431)이며 PR-7 설계 항목 | 받지 않음(둘째 답 고정) | 오늘과 새 설계 모두 |
  > | (제외) 정착 추적 | `warning` | 개발 모드에서 정착마다 | 08 §11.3 | 개발 모드 기록, 프로덕션은 없음 | 받지 않음(사건이 아니라 추적이며 양이 정착 수에 비례함) | 새 설계에만 |
  > | (제외) diagnostics의 상태 변화 | `error` | degraded로 바뀌는 커밋, 로드 | §5 | UpdateDiagnostics, onDiagnosticsChange | 받지 않음(상태이며, 그 원인 오류가 따로 기록됨) | 새 설계에만 |
  > | (제외) 호스트 onSubmit이 던지거나 거부한 것 | `error` | 제출 | src/components/Form/Form.tsx:124 | 제출 프로미스의 거부로 부른 쪽에 감(네이티브 submit이면 호스트 자신의 미처리 거부) | 받지 않음(호스트 자신의 코드) | 오늘과 새 설계 모두 |
  > | (제외) React 자신의 경고와 렌더 중 쓰기 | `warning` | 렌더 중 사용자 코드의 쓰기 | §2 호출자 오류(P5), 09 §2.3의 문서화 항목 | React의 렌더 중 갱신 경고(문서화 항목) | 받지 않음(core가 감지하지 않음). 그 사슬에서 난 폼 사건의 전달 시점은 보증하지 않음 | 오늘과 새 설계 모두 |
- 보충:
  > "입력 컴포넌트가 래퍼를 거치지 않고 `FormTypeInputProps`의 `node`로 한 쓰기도 표식이 없으므로 이 옛 노드 참조에 들며, 재생성 reset 뒤 타이머나 언마운트 정리에서 하면 던진다(문서화, 열여섯째)." (`09-landing-and-test-strategy.md:87`)
  > "입력 컴포넌트의 늦은 쓰기는 `node`가 아니라 `onChange`로 한다는 것(재생성 reset 뒤 `node`로 한 늦은 쓰기는 `SchemaFormError`)" (`09-landing-and-test-strategy.md:96`)
- 상태: 현행
- 출처: `adr/0014-error-policy.md:248-300`(정본, ERROR-044에서 분할)
- 닫은 사람: 편집자 결정(17라운드, ADR 0014 4판 채택), 게이트 고침(R17G-9·R17G-2), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1; `adr/0014-error-policy.md:263,266,267-271,279,281`), 소유자 답(`reviews/round-14-owner-answers.md:7` O-1; `adr/0014-error-policy.md:260`), 소유자 답(`reviews/round-14-owner-answers.md:16` O-10; `adr/0014-error-policy.md:261,266`), 소유자 답(`reviews/round-12-owner-answers.md:14` 6 `else: false` 경고; `adr/0014-error-policy.md:290`), 소유자 답(`reviews/round-17-owner-answers.md:14` 통보 3; `adr/0014-error-policy.md:281,293`), 소유자 답(`reviews/round-17-owner-answers.md:33` (가); `adr/0014-error-policy.md:293`), 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4; `adr/0014-error-policy.md:296`), 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3; `adr/0014-error-policy.md:295`)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:248`, `reviews/round-12-owner-answers.md:14`(`IF_WITHOUT_ELSE_FALSE` 행이 가리키는 소유자 답)

### ERROR-165 §7.2 코드 목록 — (미정) 행

- 결정:
  > | (미정) 설계 항목에서 생길 수 있는 코드 | `error` | 같은 `$id` 사본 루트의 중복 등록(PR-4), 같은 가상 이름의 다른 `fields`(슬라이스 1), 비객체 V의 `Merge`와 되먹임 거부 표면(슬라이스 2), `controls.children` 대상이 형상에 없을 때(슬라이스 6) | 18라운드 안건(`reviews/round-18-agenda.md`) | 정해지면 적음 | 정해지면 이 표에 더하고 판 규칙(더하면 minor)을 따름 | 새 설계에만 |
- 보충: 없음
- 상태: 열림(→ `reviews/round-18-agenda.md:19,42-43,108,110`; 같은 `$id` 사본 루트의 중복 등록은 → `reviews/round-18-agenda.md:150` 11-19)
- 출처: `adr/0014-error-policy.md:301`(정본, ERROR-044에서 분할)
- 닫은 사람: 편집자 결정(17라운드, `adr/0014-error-policy.md:301`)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:333`

### ERROR-166 합의 근거 — 10라운드 B-1

- 결정:
  > - 소유자 10라운드 답 B-1: "권고를 따릅니다만, 기본적으론 form을 터트려서(error를 throw해서) 알려주는게 좋지 않을까 싶네요."
- 보충: 없음
- 상태: 현행(기록)
- 출처: `adr/0014-error-policy.md:325`(정본, ERROR-047에서 분할)
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:13` B-1)
- 라운드: 10
- 까닭: `reviews/round-10-owner-answers.md:13`

### ERROR-167 합의 근거 — 14라운드 O-4·O-10·O-2

- 결정:
  > - 소유자 14라운드 답 O-4: "전반적으로 '오류가 나도 동작하는' 형태보다는 안되면 오류를 터트려서 인지시키는 방향이 좋지 않을까 싶네요." O-10: "경고만 일어나고 동작하는것처럼 보이는게 더 위험합니다." O-2: "이런 예산초과된 상태로 동작하는건 되도록 막는 방향을 원하긴 해요."
- 보충: 없음
- 상태: 현행(기록)
- 출처: `adr/0014-error-policy.md:326`(정본, ERROR-047에서 분할)
- 닫은 사람: 소유자 답(`reviews/round-14-owner-answers.md:10` O-4, `reviews/round-14-owner-answers.md:16` O-10, `reviews/round-14-owner-answers.md:8` O-2)
- 라운드: 14
- 까닭: `reviews/round-14-owner-answers.md:8,10,16`

### ERROR-168 합의 근거 — 17라운드 R17-1·통보3·통보4·(가)·(나)

- 결정:
  > - 소유자 17라운드 답(`reviews/round-17-owner-answers.md`). R17-1: "나 허용. 망가진 값을 올리는게 더 위험하겠다." 통보3: "오류만 내보내고 거절은 하지 마시죠. 사용자가 인지만 하면 될거고, 기본값이 있어서 사용자가 오히려 불편할겁니다. 저는 jsonSchema 로 form 만 그리고, 유효성검증은 따로 하지 않는 사용예도 알고있어서요." 통보4: "아 이게, onError 와 onValidate 를 섞는건 사용자 입장에서 엄청 햇갈립니다", "모든 form 내부 error를 정리해서 출력할 수만 있다면, (warning / error 모두) onError 핸들러를 넣어도 괜찮을 것 같기도 해. 오히려, validate error 가 걸러진 에러 로깅용 전용 채널로 쓸 수 있겠어. 이거 에이전트들로 수렴을 시켜봐. 어떤게 나을지". 4번 수렴 뒤의 확인 (가): "(가) ㄱ warning으로." (나): "(나) 확장 허용합니다".
- 보충: 없음
- 상태: 현행(기록)
- 출처: `adr/0014-error-policy.md:327`(정본, ERROR-047에서 분할)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1, `reviews/round-17-owner-answers.md:14` 통보 3, `reviews/round-17-owner-answers.md:15` 통보 4, `reviews/round-17-owner-answers.md:33` (가), `reviews/round-17-owner-answers.md:34` (나))
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:9,14,15,33,34`

### ERROR-169 합의 근거 — 17라운드 4번 수렴이 안 B를 택함

- 결정:
  > - 17라운드 4번 수렴(`reviews/raw-round17-onerror.md`): 안 B를 17라운드 스웜 수렴(편집자 결정)으로 택했다. 셋째 답이 이름과 방향을 주었고, 투명성·C2·10라운드 A-2("form은 고지 의무만 진다")·O-10이 같은 쪽이며, 비용이 핸들러가 있을 때만 생겨 가치끼리 맞바꾸지 않는다. 게이트는 조건부 통과였고 R17G-1–R17G-11을 모두 적용했다(R17G-3은 소유자 답 (가), R17G-4는 소유자 답 (나)로 닫혔다).
- 보충: 없음
- 상태: 현행(기록)
- 출처: `adr/0014-error-policy.md:328`(정본, ERROR-047에서 분할)
- 닫은 사람: 스웜 수렴(편집자 결정, `adr/0014-error-policy.md:328`)
- 라운드: 17
- 까닭: `reviews/round-10-owner-answers.md:8`(A-2 "form은 고지 의무만 진다")

### ERROR-170 합의 근거 — 외부 조사 최종 판정과 사슬 끝 throw

- 결정:
  > - 외부 조사(antigravity) 최종 판정: "안 A(커밋 보존 후 최외곽 진입 끝 예외 발생)를 기본 원칙으로 채택 … 안 B는 소비자가 오류를 고의로 삼킬 수 있어 조기 실패의 완결성을 파괴합니다." 여기의 안 B는 외부 조사의 안('`onError` 하나로 보내고 없으면 throw')이며 17라운드 4번 수렴의 안 B(흐름을 바꾸지 못하는 관찰자)와 다르다. 사슬 끝 throw는 이 판정대로 두었다.
- 보충: 없음
- 상태: 현행(기록)
- 출처: `adr/0014-error-policy.md:329`(정본, ERROR-047에서 분할)
- 닫은 사람: 편집자 결정(17라운드, `adr/0014-error-policy.md:329`)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:329`

### ERROR-171 03의 재록 — ADR 0014 4판이 표를 세 층으로 다시 썼고 다르면 ADR 0014가 이긴다

- 결정:
  > **ADR 0014(4판, 채택. 17라운드)가 이 표를 세 층(오류, 경고, 검증 결과 = 노드 `errors`)으로 다시 썼으며, 아래 표는 ADR 0014 §7.1의 분류표를 그대로 옮긴 것이며, 둘이 다르면 ADR 0014가 이긴다(코드 목록은 ADR 0014 §7.2).
- 보충: 없음
- 상태: 현행
- 출처: `03-mental-model.md:180#1`(정본, ERROR-066에서 분할)
- 닫은 사람: 편집자 결정(17라운드, `03-mental-model.md:180`)
- 라운드: 17
- 까닭: `03-mental-model.md:180`

### ERROR-172 03의 재록 — 정착 오류는 모든 환경에서 던지고 `degraded` 동안 제출을 거부한다

- 결정:
  > 작성자 스키마·호출자 데이터에서 온 정착 오류(예산 초과, `controls` 식·가드 실패, `controls.injectTo` 대상 없음)는 모든 환경에서 커밋·통지 뒤 사슬 끝에서 던지고, `degraded`가 다음 로드까지 남아 그 동안 폼의 제출 경로가 `SchemaFormError`로 거부한다(`getValue()`는 막지 않는다).
- 보충: 없음
- 상태: 현행
- 출처: `03-mental-model.md:180#2`(정본, ERROR-066에서 분할)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:9`

### ERROR-173 03의 재록 — 끄는 스위치는 없다

- 결정:
  > 끄는 스위치는 없다(17라운드 소유자 답 R17-1 나. 12라운드 §4·10라운드 B-1·14라운드 O-4 가를 대체한다).
- 보충: 없음
- 상태: 현행
- 출처: `03-mental-model.md:180#3`(정본, ERROR-066에서 분할)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:9`

### ERROR-174 03의 재록 — `onError(record)`는 관찰자다

- 결정:
  > Form 속성 `onError(record)`는 검증 결과를 뺀 폼 내부의 오류와 경고를 같은 모양의 기록으로 받는 관찰자다(17라운드 스웜 수렴(편집자 결정), 안 B. 받는 것·받지 않는 것·기록 모양·시점은 ADR 0014 §3).
- 보충: 없음
- 상태: 현행
- 출처: `03-mental-model.md:180#4`(정본, ERROR-066에서 분할)
- 닫은 사람: 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:15` 반영 칸)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:15`

### ERROR-175 03의 재록 — 핸들러는 흐름을 바꾸지 못하고 없으면 비용이 없다

- 결정:
  > 핸들러는 흐름을 바꾸지 못하며(던질 것은 던지고 기본 출력도 그대로), 핸들러가 없으면 비용이 없다.
- 보충: 없음
- 상태: 현행
- 출처: `03-mental-model.md:180#5`(정본, ERROR-066에서 분할)
- 닫은 사람: 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:15` 반영 칸)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:15`

### ERROR-176 03의 재록 — 경고의 "프로덕션은 기본 출력 없음"은 기본 출력에만 해당한다

- 결정:
  > 아래 표의 경고 행이 말하는 "프로덕션은 기본 출력 없음"은 기본 출력에만 해당하며, `onError` 핸들러는 모든 환경에서 경고를 받는다.
- 보충: 없음
- 상태: 현행
- 출처: `03-mental-model.md:180#6`(정본, ERROR-066에서 분할)
- 닫은 사람: 편집자 결정(17라운드, `03-mental-model.md:180`)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:140`
- 충돌:
  > `03-mental-model.md:180`의 "아래 표의 경고 행이 말하는 "프로덕션은 기본 출력 없음""은 그 표(`03-mental-model.md:186,188,194,197`)에 없는 문구를 가리킨다. 정본과 다르다. 정본이 이긴다(`adr/0014-error-policy.md:140`, "프로덕션에서는 기본 출력이 없다. §1의 '침묵'은 기본 출력에만 해당한다.", K9).

### ERROR-177 03의 재록 — `onListenerError`는 두지 않는다

- 결정:
  > 가칭 `onListenerError`는 두지 않는다(`onError`에 흡수).
- 보충: 없음
- 상태: 현행
- 출처: `03-mental-model.md:180#7`(정본, ERROR-066에서 분할)
- 닫은 사람: 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:93` E13)
- 라운드: 17
- 까닭: `reviews/raw-round17-convergence.md:93`

### ERROR-178 03의 재록 — 바운더리는 렌더 오류를 다시 던지지 않는다

- 결정:
  > 바운더리는 렌더 오류를 다시 던지지 않고 가두어 대체 화면을 그린다(ADR 0014 4판).**
- 보충: 없음
- 상태: 현행
- 출처: `03-mental-model.md:180#8`(정본, ERROR-066에서 분할)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:15`

### ERROR-179 대체됨: 관측 채널의 최소 — `onChange` payload 탈락, 루트 `settle` 칸 읽기와 그 변화 이벤트 구독(6라운드 D-22)

- 결정:
  > `onChange`의 payload에 싣는 것은 탈락. 코어 수준 관측(루트의 `settle` 칸 읽기와 그 변화 이벤트 구독)은 도출된다.
- 보충:
  > "그대로. 배달 집합에 "유효 스키마가 바뀐 노드"를 `adr/0008:60`에 더한다" (`07-conclusions.md:96`, 7라운드가 4.9를 그대로 둠)
- 상태: 대체됨(→ ERROR-128, ERROR-094)
- 출처: `06-conclusions.md:182#1`(정본, 6라운드 기록), `07-conclusions.md:96`
- 닫은 사람: 편집자 결정(17라운드, `adr/0014-error-policy.md:201`)
- 라운드: 17(6라운드 규칙을 대체)
- 까닭: `06-conclusions.md:183`, `adr/0014-error-policy.md:201`

### ERROR-180 Q12 검증 에러의 라우팅 — 18라운드 안건(PR-4)으로 이관됨

- 결정:
  > union의 판별 값이 어느 분기와도 맞지 않으면 검증기는 `enum`이 아니라 분기별 `const` × N + `oneOf` 에러를 낸다(`reviews/raw-redteam3-contract.md` 8). 어느 노드가 이 에러를 받는가. 제안(E17): union 호스트의 판별 노드로 모은다. 규칙은 ADR 0004에 적는다.
- 보충: 없음
- 상태: 열림(→ `reviews/round-18-agenda.md:108`)
- 출처: `open-questions.md:80`(정본), `reviews/round-18-agenda.md:108`
- 닫은 사람: 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:108`)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:108`

### ERROR-181 변환하지 못한 입력의 변환 오류는 `onError`로 전달한다(18라운드 S1)

- 결정:
  > 나 로 확정합니다. 경고등 추가도 승인합니다. 변환에러는 onError 로 전달하죠.
- 보충: 없음
- 상태: 분할됨(→ ERROR-183, ERROR-184)
- 출처: `reviews/round-18-owner-answers.md:9`(정본, S1 셋째의 답 칸)
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:9` S1 셋째)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:9`

### ERROR-182 변환 실패 기록은 `level: 'warning'`, 가칭 `SCHEMA_FORM_WARNING.VALUE_TYPE_MISMATCH`, 검증기 유무와 무관

- 결정:
  > 편집자 결정: `onError` 기록의 level은 `warning`이고(값을 보존하므로 폼의 약속은 지켜진다. error 층은 throw·거부·싱크로 드러나야 해 통보 3과 부딪힌다), 가칭 `SCHEMA_FORM_WARNING.VALUE_TYPE_MISMATCH`를 노드의 정합 상태가 켜질 때마다 한 번 보낸다(path, 기대 형, 받은 값의 종류, 쓰기 출처). 검증기가 있든 없든 보낸다(core의 parse가 찾는 것이라 검증 결과가 아니다).
- 보충:
  > "후속 세부는 `reviews/round-18-agenda.md` §6의 'S1 결정의 후속 세부' 행" (`reviews/round-18-owner-answers.md:9`)
  > 반영 칸(제출): "제출은 검증기가 있으면 검증이 막고 없으면 막지 않는다(통보 3)." (`reviews/round-18-owner-answers.md:9`)
- 상태: 분할됨(→ ERROR-186, ERROR-187)
- 출처: `reviews/round-18-owner-answers.md:9`(정본, S1 셋째의 반영 칸)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:9` 반영 칸)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:9`(반영 칸의 괄호), `reviews/round-17-owner-answers.md:14`(통보 3)

### ERROR-183 S1 셋째 답의 나′ 확정과 경고등 승인 — 정본은 WRITE-054

- 결정:
  > 나 로 확정합니다. 경고등 추가도 승인합니다.
- 보충: 없음
- 상태: 중복(→ WRITE-054)
- 출처: `reviews/round-18-owner-answers.md:9`(정본, S1 셋째의 답 칸의 첫째·둘째 문장. 표 행이라 조각 번호로 나눌 수 없다. ERROR-181에서 분할)
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:9` S1 셋째)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:9`

### ERROR-184 변환에러는 `onError`로 전달한다(18라운드 S1 셋째)

- 결정:
  > 변환에러는 onError 로 전달하죠.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:9`(정본, S1 셋째의 답 칸의 셋째 문장. 표 행이라 조각 번호로 나눌 수 없다. ERROR-181에서 분할)
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:9` S1 셋째)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:9`

### ERROR-185 터미널 노드의 입력이 빈 `ChildNodeComponents`를 읽을 때의 개발 모드 경고 — 코드 없음

- 결정:
  > 터미널이 된 노드의 입력이 비어 있는 `ChildNodeComponents`를 읽으면 개발 모드에서 경고한다(`00-goals.md` C2).
- 보충: 없음
- 상태: 열림(→ `reviews/round-18-agenda.md:137` 11-6)
- 출처: `adr/0011-branch-node-composition.md:61#2`(정본, 규칙은 NODE-031. ADR 0014 §7.2 코드 목록 `adr/0014-error-policy.md:248-301`에 이 경고의 행이 없다)
- 닫은 사람: 원리(`00-goals.md:105` C2 작성자 실수의 가시성, 소유자 채택 `reviews/round-2.md:112`), 편집자 결정(ADR 0011 4차 본문, `adr/0011-branch-node-composition.md:12`)
- 라운드: 5(경고 자체. 코드·`level`·`onError` 전달은 정해지지 않았다)
- 까닭: `00-goals.md:116`, `adr/0014-error-policy.md:248`

### ERROR-186 변환 실패 기록은 `level: 'warning'`, 가칭 `SCHEMA_FORM_WARNING.VALUE_TYPE_MISMATCH`, 정합 상태가 켜질 때마다 한 번

- 결정:
  > 편집자 결정: `onError` 기록의 level은 `warning`이고(값을 보존하므로 폼의 약속은 지켜진다. error 층은 throw·거부·싱크로 드러나야 해 통보 3과 부딪힌다), 가칭 `SCHEMA_FORM_WARNING.VALUE_TYPE_MISMATCH`를 노드의 정합 상태가 켜질 때마다 한 번 보낸다(path, 기대 형, 받은 값의 종류, 쓰기 출처).
- 보충:
  > "후속 세부는 `reviews/round-18-agenda.md` §6의 'S1 결정의 후속 세부' 행" (`reviews/round-18-owner-answers.md:9`)
  > 열린 부분(level `warning`만. 가칭 코드와 보내는 때는 같은 문장이라 함께 둔다): "변환하지 못한 입력의 `onError` 기록 level을 편집자가 `'warning'`으로 정해도 되는가, `'error'`인가." (`reviews/round-18-agenda.md:165`)
  > 소유자(12-7 답): "형변환 실패로 문제가 생기는 경우에 대한 대응은 FormType 이 하기로 했잖아. 그래서 개발단계에서는 중요한데, 리얼부터는 어쩔 수 없다고 생각하긴 해. warning 이면 되지않을까?" (`reviews/round-18-owner-answers.md:17`)
  > 반영 칸(12-7, level): "가. level은 `warning`이다(개발 모드 콘솔, 프로덕션은 핸들러가 있을 때만)." (`reviews/round-18-owner-answers.md:17`)
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:9`(정본, S1 셋째의 반영 칸. 표 행이라 조각 번호로 나눌 수 없다. ERROR-182에서 분할), `reviews/round-18-owner-answers.md:17`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:9` 반영 칸), 소유자 답(`reviews/round-18-owner-answers.md:17` 12-7; level `warning`)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:17`, `reviews/round-18-owner-answers.md:9`(반영 칸의 괄호), `reviews/round-17-owner-answers.md:14`(통보 3)

### ERROR-187 변환 실패 기록은 검증기 유무와 무관하게 보낸다

- 결정:
  > 검증기가 있든 없든 보낸다(core의 parse가 찾는 것이라 검증 결과가 아니다).
- 보충:
  > 반영 칸(제출): "제출은 검증기가 있으면 검증이 막고 없으면 막지 않는다(통보 3)." (`reviews/round-18-owner-answers.md:9`)
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:9`(정본, S1 셋째의 반영 칸. 표 행이라 조각 번호로 나눌 수 없다. ERROR-182에서 분할)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:9` 반영 칸)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:9`(반영 칸의 괄호), `reviews/round-17-owner-answers.md:14`(통보 3)

### ERROR-188 방언 불일치의 개발 모드 경고 — 코드는 가칭(편집자)

- 결정:
  > 플러그인이 자기 방언을 선택적으로 선언하고, 스키마의 `$schema`와 어긋나면 개발 모드에서 경고만 낸다(프로덕션 출력 없음, `onError` 핸들러가 있으면 경고 기록).
  > 경고 코드는 ADR 0014 §7.2 목록에 더한다(가칭, 편집자).
- 보충:
  > 소유자(12-4 답): "경고정도는 주도록 합시다" (`reviews/round-18-owner-answers.md:14`)
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:14`(정본, 12-4의 반영 칸. 표 행이라 조각 번호로 나눌 수 없다), `adr/0004-validator-plugin-compile-guard.md:42`(같은 제안의 원장 항목 VALIDATE-026)
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:14` 12-4), 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:14` 반영 칸; 경고 코드는 가칭으로 §7.2 목록에 더함)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:14`
