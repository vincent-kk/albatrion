# 274라운드 닫기 — README "Migration (1.0.0)" 절 #368 검증·병합(e5f7f9fa3); 옛 최상위 키 조용한 무시는 대기열 47; #354 본문 갱신 초안 배정

2026-10-14. 267C-01 5(마무리)의 문서 몫으로 fairy07이 쓴 README 이주 절을 원장 관리자가 agy 대조와 직접 대조로 검증하고 병합했다.

### 274C-01 #368(head becd6eb80, README.md·README-ko_kr.md만)을 squash 병합(e5f7f9fa3); 이주 절의 사실 기준은 0.16.1(origin/master) 공개 export와 beff4b5ec 코드이며 agy 대조로 틀린 행 셋(옛 타입명 둘, 0.16에 없던 `SchemaNodeType`)을 고치고 onValidate는 0.16과 같은 동작으로 재분류, 동작 변경에 `compileGuard` 필수화(app/plugin/type.ts:255)와 const 태그 분기의 판별식 자동 감지 폐지(LANDING-004)를 더함; 옛 최상위 키(formType·computed·`&`접두어·injectTo·terminal·virtual·propertyKeys·errorMessages·placeholder)가 오류·경고 없이 무시되는 사실(collectDeclarations.ts:42-180)은 README에 경고로 적고, 개발 빌드 경고 추가 여부는 대기열 47로 소유자에게

- 닫는 항목: 없음(LANDING-210 보충).
- 결정:
  - 【추론】 문서만 바꾸는 PR이라 217C-01의 codex 위임 대상이 아니며 fairy07이 직접 편집했다. 검증: agy(session 2d64ed5e)가 표 행마다 0.16·1.0.0 양쪽 path:line을 확인, 원장 관리자가 diff 전문과 `validateControlGroups.ts`의 CONTROL_KEY_SET·OPTION_KEYS를 대조(README의 controls 추가 키 다섯과 options 여섯이 코드와 같음). 영어·한국어 절은 표 39행·목록 8개·소제목 4개·예시 동일. pristine→resetInteraction·injectTo context 8개는 변경 없음으로 확인.
- 근거: fairy07 초안·보고(becd6eb80), agy 보고, 직접 대조, 239·259·265·269·272라운드 결정.

다음 라운드 번호는 275이다.
