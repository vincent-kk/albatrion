# 275라운드 닫기 — 07c 재배치 #369 검증·병합(4da9567ea); 267C-01 구현 작업 완료; 대기열 48·49 추가; 마무리(설명 문서 갱신·#354 본문·워크트리 정리·대기열 총정리)

2026-10-14. 268C-01(codex 구현, Claude 검증)·267C-01(병합은 보고만) 아래 원장 관리자가 #369를 직접 검증하고 병합했다. 이로써 267C-01의 1~4(07b-5, 07b-6, 07b-7, C 재배치)가 모두 병합되었고 5(마무리)만 남는다.

### 275C-01 #369(07c, head b747da234)를 squash 병합(4da9567ea, 원격 가지 삭제): core를 `core/{engine, surface}`로(engine/index 이름 73, surface/index 값 25·형 15, core/index 재수출, 와일드카드 0, 이동 784건 전부 계획 표 안), 미사용 helpers 셋 삭제(55파일·시험 112), `app/constants`→`src/constants`, helpers·components는 271C-01대로 compartment; 옮기면 깨지던 시험 둘(고정 리비전 경로 매퍼, dependencyDirection 재작성 + 단언 둘 추가, REACT-009는 이름→출처 맵으로 판정) 포함; 공개 계약 불변(`src/index.ts` 차이 0, `dist/index.d.ts` 바이트 동일, G16 바이트 동일); 기존 상태로 옮겨진 셋(engine 시험 10곳의 surface/FieldNode.ts 직접 import, `src/constants/index.ts`의 `export *` 3줄, bench의 engine 내부 import)은 대기열 49로; antd5·antd6·MUI 자체 enum Select의 undefined 표시는 대기열 48로

- 닫는 항목: 없음(LANDING-210 보충).
- 결정:
  - 【추론】 게이트는 원장 관리자가 직접 돌렸다: unit·render·react18 3840 통과·todo 1(07b-7 대비 −109 = 삭제 helpers 시험 112 − 신규 3; FieldNode 시험 45는 surface로 이동해 통과), storybook 251, typecheck 0, lint 0, build·test:production 20, 플러그인 일곱(130/135/334/2/15/15/5), documents build, G16 CONSUMER_BUNDLE_OK(prod 289,111 B·dev 292,408 B, 07b-7과 바이트 동일), dist/index.d.ts를 07b-7 빌드와 cmp로 바이트 동일 확인. verifier(opus, 1899파일·7733간선 해석): 이동 표·진입점 73·경계(core 밖→core 내부 0, surface→engine 내부 0, engine→surface·index 0)·옛 경로(면제 4 + __legacy__ 6 외 0)·설정·하위 d.ts(1085 동일, 삭제 25는 helpers, 추가 1은 engine/index) 통과; 지적 셋(REACT-009가 이름 금지 목록으로 약해짐 → 이름→출처 맵으로 강화하고 임시 settle 재수출로 실패 확인; 문서 산문의 `dispatch` 네 곳; 검증 도구 진입 파일의 옛 경로 둘)을 같은 PR 커밋 셋(b747da234·3abb74dad·309934660)으로 반영한 뒤 원장 관리자가 typecheck·lint·해당 시험 3파일 28건을 다시 돌려 통과. agy(session def33340): engine·surface INTENT/DETAIL 필수 절 구비·내용 일치(surface 멤버 표 53행, 시험 전용 수출 둘의 사유), 옛 경로 잔존 0, 이력 서술 주석 0, 커밋 메시지 다섯 근거 있음·세션 ID 없음 → 차단 없음. filid validate는 fixy07 실행 59건(기준 69건), 순환·경계 위반 0, 새 것은 engine/index 진입 사실 없음 1(indeterminate, 사실 보고). #354 본문에 #369 줄을 더해 갱신.
- 근거: fixy07 보고(399f92d71·b747da234), verifier 보고, agy 보고, 직접 실행 결과, 07c 계획(9.6절까지), 258·264·265·267·271라운드 결정.

다음 라운드 번호는 276이다.
