# C 검증 구성

1. U의 정상11통과·변이10통과/1실패, 원본 바이트 복원과 unit·verify-unit의 todo 각1개 감소를 보존합니다(TEST-077, WRITE-083).
2. G 전체20회 표본의 통계·control·사전 판정과12페이지 guard/유효 스키마/필드 동등성을 대조합니다. None의 oracle 전체 compile0회, OnChange의 전체 compile은 첫 paint 뒤1회와 실제 validate를 확인합니다.
3. F on/off 각20회의 구간 합을 firstPaintedMs와 대조하고 R B/F 각30회·교대 순서 및 단계 수치를 확인합니다. CPU profile은 로컬5회씩의 진단으로만 남깁니다.
4. lint 경고0·typecheck·unit·verify-unit을 실행하며 두 Vitest를 동시에 띄우지 않습니다. 제품 변경이 없으므로 이번 기록을 위해 생성 번들을 커밋하지 않습니다.
5. 원장26검사를1c44a823b와 비교해 새 불일치0·미인용 수 불변을 확인합니다. 기존 tokens·plan-links·doc coverage 경고는 보존합니다. 새 owner 원문은 TSV와 원장 인용으로 연결합니다.
6. 모든 추가·변경 파일은 gzip을 풀어 중첩 JSON의 escape도 포함해 기계 경로를 감사하고 모든 추적 package manifest의 버전을 기준과 대조합니다. 기준 대비 src diff는 기존 U 시험 한 파일만 허용합니다.
7. 검증 원본은 verification/carried-items/raw에 결정적 json.gz로 보존하며 CPU profile은 제외합니다. 새 커밋만 만들고 rebase·amend·push는 하지 않습니다. PR 본문은 최종 full HEAD URL로 고정합니다.
