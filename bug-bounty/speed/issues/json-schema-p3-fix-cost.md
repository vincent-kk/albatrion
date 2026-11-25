# json-schema 우선순위 3: `p3-18`의 초과분은 수정 비용

- **행** — `p3-18` (대체 표기로 등록된 주소 조회). 기준 1.04 µs, 한도 1.35입니다.
- **값** — 5.026 / 5.038에서 4.192 / 4.163이 되었습니다 (24라운드, 대조 0.992 / 0.993, `results/json-schema-p3-final`). 수용된 행은 나빠지지 않았습니다: `p2c-22` 1.906, `p2c-23` 11.053, `p2c-24` 2.352, `p1-01` 8.378 (`results/json-schema-p3-final-p1`).
- **귀속** — `p2c-23`, `p1-01`과 같은 정규화 경로이고 실패 색인만 없습니다. 등록 키 정규화가 약 2.71배분, 대문자로 등록된 항목을 찾아 색인하고 틀을 만드는 일이 약 0.49배분입니다. 진단 빌드는 3.634, 이어서 0.927 / 0.919이고, 빼면 테스트 24개가 실패합니다 (`finds a registration whose key spells the scheme and host in another case`, `rejects two spellings of one address that register different documents` 포함).
- **시도하고 버린 것** — 손으로 짠 스캐너, 호스트 패턴 변형.
- **결정** — Vincent가 수정 비용으로 수용했습니다. 해석기 사이의 캐시는 넣지 않습니다.
