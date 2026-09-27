# 기반 하니스와 정적 청사진 분석 도입

02 단계의 정적 스키마 분석, 유효 스키마 병합, 잎 제약 교차를 추가합니다. 기존 런타임은 보존한 레거시 전처리·컴파일러 연결을 사용하며, 새 노드 엔진으로의 전환은 후속 단계입니다. `merge`는 공개 wrapper에서 옵션 유무를 분기하고 각 재귀 구현을 독립시킵니다. common-utils 버전은 0.15.0을 유지하고 changeset에 변경을 기록합니다.

Base: `1.0.0-beta`. 병합 방식: merge commit.

## 산출물과 완료 기준

- [x] v7과 프로브 결과 보고서(`spikes/round18/proto/REPORT-v7.md`), 벤치 기준선 고정
- [x] `@aileron/schema-form-scenarios` 뼈대, `FormScenario`, `playScenario`, vitest `test.projects` 셋, addon-vitest, `CLAUDE.md` 하니스 절, 옛 스토리 처분 목록
- [x] `src/core/blueprint/` fractal(INTENT·DETAIL·진입점), 잎 교차 fractal, 식 컴파일러 이동, `merge` 선택 인자와 changeset
- [x] 청사진 오류·경고 데이터화와 코드 상수, union 판정 절차
- [x] 레거시 린트 규칙, `core/INTENT.md` 개정
- [ ] `verification.md`의 게이트 전부 통과

## 리뷰 체크리스트 (PR 본문에 옮긴다)

- [x] v7 프로브 보고서와 벤치 기준선 파일
- [x] 시나리오 패키지·vitest 프로젝트 셋·addon-vitest
- [x] `src/core/blueprint/` INTENT·DETAIL이 코드보다 먼저 커밋됨
- [ ] E1–E42 테이블 테스트, `$ref` 코퍼스, union 청사진 줄 초록
- [x] 레거시 린트 규칙, `core/INTENT.md` 개정, `merge` changeset
- [ ] 옛 시험 전부 초록, seiri 게이트·filid 스캔 결과 첨부

## 검증 증거

schema-form 전체 337파일·4,393시험(unit 3,468 / render 535 / Storybook Chromium 390), lint·strict·빌드가 통과했습니다. 이후 의미 보존 보조 함수 추출은 기존 17시험·lint·strict로 확인했습니다. [통합 검증 보고서](./integration-verification.md)와 [추출 검증](./blueprint-helper-extraction.md)에 원로그를 연결했습니다.

시나리오 패키지 10시험·lint·strict와 최종 common-utils 1,166시험·lint·strict·빌드도 통과했습니다. 실제 배포 merge의 ESM·CJS 8회 비교에서 관측된 미세 차이와 신뢰구간 미확정은 소유자가 측정 불확실성으로 수용했습니다. filid와 교차 확인 결과는 원장 충돌 해소 후 확정합니다. 체크되지 않은 항목은 완료 주장이 아닙니다.

## 원장 대조 발견

- TEST-067(b)와 BLUEPRINT-039·BLUEPRINT-045 E16: 원본 14종 코퍼스의 수용 요구와 형 없는 객체 분기 거절 규칙이 충돌합니다. [원문 대조 보고서](./corpus-ledger-conflict.md)에 근거를 기록했습니다. 원장이나 입력을 변경하여 우회하지 않았으며 소유자 결정 전에는 해당 게이트를 닫지 않습니다.
