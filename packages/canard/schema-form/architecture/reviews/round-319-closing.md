# 319라운드 닫기 — 정돈-E PR #380 병합(8f4dce4ab): 오류 코드는 FormErrorCode·FormWarningCode 하나, 리터럴 발화 제거, push는 호출 뒤 길이

2026-10-14. fixy08이 313라운드대로 codex 없이 정돈-E를 마쳐 PR #380(커밋 20개, 끝 261254a3c)을 열었고, verifier 투입이 자동 분류기에 막혀 원장 관리자가 직접 검증한 뒤 스쿼시 병합했다(317라운드 "검증 뒤 병합 위임").

### 319C-01 #380을 병합한다 — 표면 추가는 정확히 둘, 시험 3835 통과, 지운 코드 다섯은 시험에만 남음

- 닫는 항목: LANDING-210(보충), ERROR-044(보충), WRITE-003(보충)
- 결정:
  - 【추론】 직접 검증: 병합 상태 CLEAN, 세션·공동 저자 줄 0, 금지 경로 0; 빌드 뒤 `dist/index.d.ts` 열거 94개 — 정돈-2 기준 92개에 `FormErrorCode`·`FormWarningCode`만 더해지고 제거 0, 경로 정규화 뒤 형 문자열 차이 0; unit 2391 통과·할 일 1, render 722, react18 722(실패 0, 타이밍 시험도 이번 실행에서는 통과); 지운 코드 다섯은 `errors/__tests__/codeEnums.ledger.test.ts`가 "없음"을 단언하는 자리에만 남음; 제품 코드에 그룹 접두 리터럴 발화 0; `dispatchPush.ts`는 모든 경로가 number(거부·중첩 실패는 `readArrayLength`); 패키지 밖 변경은 ajv 플러그인 셋(bind 거부 Error의 group·code를 `FormErrorCode.ValidatorBindRefused` 값으로, 형만 import — 32C-02)과 그 README·CLAUDE.md의 코드 문자열 한 줄. 결정 묶음 열(E3 축소 범위 48멤버와 알려진 틈 — 종류별 합집합·자기 참조 5는 `surface.test.ts`; push 반환은 호출 뒤 길이 — 거부·중첩 실패는 커밋된 현재 길이, batch noop 경로는 도달 불가라 helper 공유만; context 형만 좁힘; aileron 리터럴 유지 + schema-form 쪽 검사 시험; options 키 목록 등 의도적 미변경; `FieldNodeWriteKind`를 `core/engine/types/value.ts`로; `isRenderableDateInputValue` 매개변수 좁힘; 내부 값 변화 — `TypeMismatchRecord.code` 그룹 한정, 공개 형 `FormErrorRecord.code` 60→58; #379 기인 D 간선 수정)은 PR 본문대로 받아들인다. 병합 결과 1.0.0-beta는 8f4dce4ab. 남는 항목 둘: `global-errors.timing.test.ts`의 벽시계 한도(40 ms 절대값)가 전체 부하에서 흔들리는 것은 별도 항목; "클래스를 공개 형 매개변수로"는 구조 리뷰 뒤 별도 항목.
- 근거: PR #380(fixy08 결정 묶음 보고, 2026-10-14); 원장 관리자 직접 검증(표면 열거 `surface-tidyE.txt`); `reviews/round-305-closing.md` 305C-01; `ledger/surface.md:312`(32C-02); `plan/tidy-structure/brief-tidy-E.md`.
- 다음: 정돈-S #381과 구조 둘째·셋째 손질 PR을 이어서 병합한다. fixy08은 구조-4(fieldInputs)로.
