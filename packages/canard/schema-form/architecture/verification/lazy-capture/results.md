# C1 이탈 기본값 구현 검증 기록

기준은 상태 어휘 병합 머리 `55055f65b52f952cd934eeec641314171e1ff253`입니다. 468라운드와 승인 설계의 계약 단계부터 기록하며, 구현 검증과 별도 수용 측정을 구분합니다.

## 계약 단계 기준

원장 항목1418, 보충 인용3714, 소유자 답773개가 기준입니다. 인용·보충 불일치와 ref 문제는0이며 문장17영역의 missing·bad classification도0입니다. doc-coverage의 기존 미인용66건과 plan-links의 기존 비현행 참조1건을 그대로 둡니다.

현재 명세의 캐시 설명 세 줄은 engine DETAIL의 포인터 세그먼트 캐시 행과 settle DETAIL의 settle-static-pointer-work 두 행입니다. 과거 B6 결과 문서의 캐시 경유 서술은 당시 검증 기록이므로 고치지 않습니다. 다른 INTENT·JSDoc·공개 문서·agent 문서에는 이탈 기본값이 준비 문법이나 캐시를 사용해야 한다는 현행 문장이 없습니다. 함수 JSDoc의 한 번 쓰는 읽기 설명은 구현과 함께 갱신합니다.

NODE-044는 이탈 읽기의 고정을, WRITE-085는 기본값의 로드 출처를 직접 규정하므로468C-01을 덧붙입니다. NODE-004의 고정 배치와 NODE-045의 runtime 소유권은 그대로여서 보충하지 않습니다. 새 필드·반환 배열·지연 관측은 추가하지 않습니다.

FCA 기준은 동일 snapshot의 scan·전체6범위 validate·verification으로 확보했습니다. 구조 finding566·실패26, verification 위반30과 기존 indeterminate 축을 유지하며 이를 절대 PASS로 바꾸지 않습니다. 구현 뒤에는 새 finding과 diagnostic을 다중집합으로 비교합니다.

특성화·기준 red·변이·전체 관문 및 수용 측정은 아직 이 계약 기록의 통과 주장에 포함하지 않습니다.
