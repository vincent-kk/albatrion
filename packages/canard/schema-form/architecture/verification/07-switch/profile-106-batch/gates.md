# 검증 게이트

Plan: `plan.md`

- G1: A/A 10행×9회, 순차 worker 자연 종료·시간 제한·예열/GC/표본을 구조화 결과로 확인합니다.
- G2–G5: 후보별 제거 작업 시험의 수정 전 실패·수정 후 통과, 관련 differential/shadow, 10행×9회 판정, 기각 복원/채택 patch를 기록합니다.
- G6: 최종 지정 검증과 파일 크기·금지 산출물·HEAD 불변을 확인합니다.

수동 기록: 사용자 지정 산출물 경로 때문에 자동 `.seiri/tasks` 기록은 사용하지 않습니다. 아래 결과는 `audit.json`·각 `summary-*.json`·`check-*.json`으로 확인했습니다.

- G1 MET: Node A/A 10행×9회·909쌍/행. 두 번들 바이트 동일, 첫 18회 Bun 실행은 전체 행 단위 무효 보존 후 Node로 재실행했습니다.
- G2 MET: 1 게이트 읽기 채택, map 12→0·projected 24·evaluate 12. 52 시험 통과. 독립 `1-gate-reads.patch` 적용 결과 현재 바이트 일치.
- G3 MET: 2 단일 선택 기각, ID 목록 4→1·evaluate 8. 52 시험 통과 후 oneOf-40 후속 갱신 회귀. 코드·DETAIL·시험 전부 원복 확인.
- G4 MET: 3 빈 조각 채택, keyword 배열 검사 3→0. 59-schema×collect off/on 개발·운영 differential 통과. 독립 `3-empty-fragments.patch` 적용 결과 현재 바이트 일치.
- G5 MET: 4 첫 배달 counter 기각, bit index 16→0·후속 2. 209 시험 통과 후 nested 마운트·sample-0 첫 갱신 회귀. 코드·DETAIL·시험 전부 원복 확인.
- G6 MET: 최종 개발 3247 통과·1 todo·허용 EVENT-070 4실패만, production 16 통과, tsc·eslint·legacy exit 0. 450 판정 worker·50행 명령 순차/자연 종료, clock 내부 GC 0. 명령 최대 300433 ms <480000, 개별 파일 5 MB 이하, HEAD 동일, 최종 runtime 소스는 후보 3과 동일합니다.

ABANDON 없음. STOP 없음. 이 ledger는 채택 여부에 관계없이 요구된 시험·측정·복원·기록의 완료를 판정합니다.
