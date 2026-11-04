# 382라운드 — 닫기 (오류·경고 코드 그룹 상수화 PR #404 병합; 편집자 결정 하나)

2026-10-16. 378라운드 소유자 요청과 379·380라운드 답(내부용, 지금 codex에게)대로 `src/errors`의 그룹 문자열을 상수 한 벌로 모은 PR을 닫는다. 구현은 Orca orchestration의 codex 작업자가 별도 작업 폴더에서 했고(두 커밋, 본문에 codex 구현), 원장 관리자가 전체 diff를 읽어 값·순서·공개 표면 불변과 형 유도를 확인한 뒤 squash 병합했다. 381라운드 지시대로 작업자는 settle 뒤 release했고 가지는 삭제했다.

## 편집자 결정

- **382C-01 (코드 그룹 상수와 그룹별 파생 표는 내부 정본의 일부이며 공개하지 않는다).**
  - 【추론】 오류 그룹 넷(JSON_SCHEMA_ERROR·SCHEMA_FORM_ERROR·UNHANDLED_ERROR·VALIDATION_ERROR)과 경고 그룹 하나(SCHEMA_FORM_WARNING)는 codes 안의 상수 한 벌이 정하고, 코드 표 둘의 값·클래스 넷의 그룹·클래스별 코드 형이 모두 그 상수에서 나온다. 정본은 여전히 FormErrorCode·FormWarningCode 하나씩이며 값 문자열·키 순서(ERROR-164 원장 순서)·리터럴 형은 바뀌지 않는다. 그룹별 표는 정본에서 접두어로 걸러 만든 파생이라 두 번째 정본이 아니고, 합치면 정본과 값·개수가 같다. 그룹 상수와 파생 표는 패키지 진입점에 내지 않으며(379라운드, 공개 이름 94 불변) 지금은 제품 코드 소비자가 없는 내부 관리용 수출이므로 그 의도를 errors DETAIL에 적어 둔다 — 소비자 없는 수출은 의도를 적거나 지운다는 규칙의 전자다. 관측 가능한 error.code·group·specific과 기록의 코드는 그대로다(ERROR-031·164).

## 남은 것

fixy08: 파생 규칙 PR(fairy08 발견 셋 반영 뒤) → L2b. 결정 대기열 54·58은 열려 있다. Orca 작업자 터미널은 release 요청 뒤 user_takeover로 retained 상태라 소유자가 닫는다.

다음 라운드 번호는 383이다.
