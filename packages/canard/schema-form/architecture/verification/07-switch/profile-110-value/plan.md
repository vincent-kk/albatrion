# VALUE-012 실행 계획

승인 근거: 사용자 요청, 107C-01 (c), profile-109-update.md의 O1·A1.
HEAD: ba2571b86. git 쓰기·설치 없이 O1 다음 A1을 각각 판정합니다.

1. 기존 104 판정 열의 production·fresh process·GC outside clock·warmup 20·101쌍·순서 교대를 그대로 재사용합니다. 지정 14행 HEAD/HEAD A/A를 각각 9회 먼저 측정합니다.
2. O1의 소유 DETAIL 비용을 먼저 갱신하고, settlement context를 약한 키로 쓰는 힌트 재사용을 구현합니다. 매 조립 전에 모든 선언 필드를 초기화합니다.
3. HEAD 차등: 59 스키마와 작성된 갱신, 키 순서·특수 키·자식 emit 참조·같은 값의 이전 참조 복원. 별도 runtime 테스트로 재사용 작업 수·전체 초기화·가상 재진입·방출/배달 누출을 확인하고 깨진 변형을 실패시킵니다.
4. O1/현재 base 14행을 9회 측정합니다. pooled paired median 99% bootstrap과 A/A, 0.5% 회귀 바닥으로 채택/기각하고 기각 시 소유 DETAIL·제품·전용 테스트를 모두 복원합니다.
5. A1은 STABLE_SHAPES의 동일 children/schema/extras/key-set 증명 범위에서만 첫 patch를 classic loop와 writeObjectKey로 복사합니다. 동일한 차등·깨진 변형·9회 판정을 진행합니다. 채택 변경은 누적합니다.
6. 채택별 측정 base 대비 patch와 파일 목록, 행별 name/mode/pooledMedianMs/ci99Ms/aaStatisticMs/baseMedianMs/floorMs/verdict JSON을 보존합니다.
7. 지정 package 검증과 프로세스/파일 크기 감사 후 remeasure-86c02.md에 결과를 기록합니다.

## Gates

- [x] G1: A/A 14행 × 9회, 모두 자연 종료. 근거: aa-summary.json, aa/.
- [x] G2: O1 runtime 차등·깨진 변형·14행 × 9회 완료. 3행 회귀로 기각하고 제품·DETAIL·전용 테스트를 복원했습니다. 근거: o1-summary.json, differential-o1.json, broken-variants.json.
- [x] G3: A1 runtime 차등·깨진 변형·14행 × 9회 완료. 4행 회귀로 기각하고 제품·DETAIL·전용 테스트를 복원했습니다. 근거: a1-summary.json, differential-a1.json, broken-variants.json.
- [x] G4: 최종 개발 검증은 3,265사례 통과와 허용 EVENT-070 4사례만 실패했습니다. production 20사례, tsc, eslint, legacy isolation은 통과했습니다. 근거: check-final-*.json, audit.json.
- [x] G5: 채택 패치는 없고 두 기각 실험 패치·summary·한국어 보고를 보존했습니다. 파일 ≤5 MB, timing worker 378개 겹침 0, 명령 <8분입니다. 근거: audit.json, ../remeasure-86c02.md의 108라운드 VALUE-012 손질.

초기 진단 실행 두 개가 1.071초 겹친 실수를 기록하고 해당 결과를 제외한 뒤 순차 재실행했습니다. 성능 측정에는 겹침이 없었습니다. 제외 대상과 대체 결과는 broken-variants.json에 있습니다.

사용자가 산출물 위치를 지정하여 ledger는 이 문서에 둡니다. 이미 승인된 구현·판정 계획이므로 별도 계획 승인 요청은 생략합니다.
