# C1 검증 기록 계획 — 기록 PR 마감

## 측정 후보에서 완료한 검증

기준55055f65b의 특성화14개, 캐시 삽입0의 실제1500회 red, 수정 후보의 focused20개 및 M1–M3 검출을 보존합니다. v1의 oneOf decoder 실패와 Amendment 2의 정적 문법 보존도 기록합니다. 후보0c95807f4에서 lint 경고0·typecheck·정식 build와 일곱 테스트 프로젝트·importModel이 실패0이었습니다. 이 원본들은 raw 자료로 유지하며 최종 기록 가지의 관문과 구분합니다.

## 사전등록 수용 측정

최종 열 셀과 control 유효성·재시도·bulk·퇴보 판정은 acceptance-summary.json.gz와 acceptance-attempts.json.gz를 그대로 보존합니다. 결과는 bulk2/6으로 CLOSE_C1_AS_RECORD이며 제품 변경을 채택하지 않습니다. 세부 표와 agy 설계 검토·수용 관문은 verification/lazy-capture/results.md에 있습니다.

## 기록 PR 마감 관문

1. 제품 함수와 세 DETAIL 행은55055f65b 바이트로 복원하고 캐시 삽입0 시험을 제거합니다. 기존 특성화와 fixture는 수정 없이 기준 제품에서 통과하는 경우에만 유지하며 실제14개 모두 통과했습니다.
2. 원문65·79와 TSV를 보존하고 NODE-044·WRITE-085 보충은 승인된 기존 계약 유지 결정으로 고쳐 인용 검사를 유지합니다. 제품 계약 본문은 바꾸지 않습니다.
3. lint 경고0·typecheck·unit·verify-unit을 순차 실행합니다. 동시에 두 Vitest 프로세스를 띄우지 않습니다.
4. 원장 검사를55055f65b와 비교해 불일치0과 기존 doc-coverage 미인용66을 확인합니다. 모든 변경 파일은 압축을 풀어 기계 경로를 감사하고 전체 package.json 버전을 기준과 비교합니다.
5. 기준 대비 src diff는 남긴 특성화와 fixture 두 파일뿐이어야 합니다. 기존 raw 파일은 바이트를 유지하며 측정 증거와 마감 관문은 새 파일로 추가합니다. 새 커밋만 만들고 rebase·amend·push는 하지 않습니다.
